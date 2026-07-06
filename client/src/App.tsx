import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { scenes } from "./data/scenes";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import {
  saveGame,
  clearSave,
  savePortrait,
} from "./engine/save";
import { DialogOverlay } from "./components/DialogOverlay";
import { CgOverlay } from "./components/CgOverlay";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { PhaserContainer } from "./components/PhaserContainer";
import { StartMenu } from "./components/StartMenu";
import { GameMenu } from "./components/GameMenu";
import { Backlog, type DialogLogEntry } from "./components/Backlog";
import { PersonalityPortrait } from "./components/PersonalityPortrait";
import { gameBridge } from "./game/bridge/GameBridge";
import { MapRegistry } from "./game/config/mapRegistry";
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import type { AITrace, Choice, GameState } from "./types/game";
import "./styles/global.css";

type GamePhase = "menu" | "playing";

function normalizeLoadedState(loaded: GameState): {
  state: GameState;
  mapId: string;
  spawnId: string;
} {
  const mapId = loaded.currentMapId && MapRegistry[loaded.currentMapId]
    ? loaded.currentMapId
    : initialGameState.currentMapId;
  return {
    state: { ...loaded, currentMapId: mapId },
    mapId,
    spawnId: MapRegistry[mapId].defaultSpawn,
  };
}

function restoreDynamicMapActors(loaded: GameState) {
  setTimeout(() => {
    if (loaded.currentMapId !== "shop") return;

    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_3", npcKey: "npc_male_assistant", scale: 0.75, framesPrefix: "shop_assistant_male_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_male_assistant", direction: "back" } });

    const confrontationScenes = ["ch1_shop_confrontation", "ch1_shop_confront_", "ch1_shop_lzx_leave"];
    const isConfrontation = confrontationScenes.some(prefix => loaded.currentSceneId.startsWith(prefix));
    if (isConfrontation) {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_2", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_mysterious", direction: "right" } });
      return;
    }

    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
    if (
      loaded.currentSceneId.startsWith("ch1_shop_exchange_") &&
      loaded.currentSceneId !== "ch1_shop_exchange_1"
    ) {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_lzx", direction: "back" } });
    }
  }, 800);
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [gamePhase, setGamePhase] = useState<GamePhase>("menu");
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const [showAITrace, setShowAITrace] = useState(false);
  const [eyeOpening, setEyeOpening] = useState(false);
  const [reactFlash, setReactFlash] = useState<"red" | null>(null);
  const [showBacklog, setShowBacklog] = useState(false);
  const [showPortraitPanel, setShowPortraitPanel] = useState(false);
  const [showNotebookToast, setShowNotebookToast] = useState(false);
  const [dialogHistory, setDialogHistory] = useState<DialogLogEntry[]>([]);
  const prevSceneIdRef = useRef<string>("");

  // 当前对话场景
  const dialogSceneId = state.currentSceneId && scenes[state.currentSceneId]
    ? state.currentSceneId
    : null;
  const dialogScene = dialogSceneId ? scenes[dialogSceneId] : null;

  // 同步 GameBridge + 自动存档
  useEffect(() => {
    if (gamePhase === "playing") {
      saveGame(state);
    }
    gameBridge.gameState = state;
  }, [state, gamePhase]);

  // 追踪对话历史（回顾功能用）
  useEffect(() => {
    if (!dialogScene) return;
    if (dialogScene.id === prevSceneIdRef.current) return;
    prevSceneIdRef.current = dialogScene.id;

    if (dialogScene.speaker && dialogScene.text) {
      setDialogHistory(prev => {
        const entry: DialogLogEntry = {
          speaker: dialogScene.speaker!,
          text: dialogScene.text,
          sceneId: dialogScene.id,
          chapter: dialogScene.chapter,
        };
        return [...prev, entry];
      });
    }
  }, [dialogScene]);

  // ESC 键：打开/关闭游戏内菜单
  useEffect(() => {
    if (gamePhase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        // 如果回溯或画像面板开着，先关闭
        if (showBacklog) {
          setShowBacklog(false);
          return;
        }
        if (showPortraitPanel) {
          setShowPortraitPanel(false);
          return;
        }
        setGameMenuOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gamePhase, showBacklog, showPortraitPanel]);

  // 监听关闭 AI Trace / 笔记本提示
  useEffect(() => {
    const onClose = () => setShowAITrace(false);
    window.addEventListener("close-ai-trace", onClose);
    return () => window.removeEventListener("close-ai-trace", onClose);
  }, []);

  // 笔记本占位提示自动关闭
  useEffect(() => {
    if (!showNotebookToast) return;
    const t = setTimeout(() => setShowNotebookToast(false), 2500);
    return () => clearTimeout(t);
  }, [showNotebookToast]);

  function addAITrace(type: AITrace["type"], result: unknown) {
    dispatch({
      type: "ADD_AI_TRACE",
      trace: {
        type,
        sceneId: state.currentSceneId,
        result: JSON.stringify(result, null, 2),
        createdAt: new Date().toISOString(),
      },
    });
  }

  // ── 开始新游戏 ──
  function handleNewGame() {
    clearSave();
    dispatch({ type: "RESET" });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: initialGameState.currentMapId,
      spawnId: MapRegistry[initialGameState.currentMapId].defaultSpawn,
    });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  function handleStartChapter4() {
    clearSave();
    dispatch({ type: "RESET" });
    dispatch({ type: "DIALOG_START", sceneId: "ch4_exploration_progress" });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: "waiting",
      spawnId: "spawn_waiting_default",
    });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  // ── 读取存档进入游戏 ──
  function handleLoadGame(loaded: GameState) {
    const normalized = normalizeLoadedState(loaded);
    dispatch({ type: "LOAD", state: normalized.state });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: normalized.mapId, spawnId: normalized.spawnId });
    restoreDynamicMapActors(normalized.state);
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  // ── 重新开始（清存档，回到初始场景） ──
  function handleRestart() {
    clearSave();
    dispatch({ type: "RESET" });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGameMenuOpen(false);
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  // ── 退出到标题 ──
  function handleExitToTitle() {
    setGameMenuOpen(false);
    setGamePhase("menu");
  }

  async function handleChoose(choice: Choice) {
    const nextState = gameReducer(state, { type: "CHOOSE", choice });
    dispatch({ type: "CHOOSE", choice });

    // 宿舍第二幕：选择睡觉 → 先触发地图淡出，再延迟显示睡觉对话框
    if (choice.id === "dorm_act2_sleep_now") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_sleep_result" });
      }, 1800);
      return;
    }

    // 7.2 厨房用品店：圆滑应对 → 设 flag_clear 标记后续分支
    if (choice.id === "ch1_shop_smooth_talk") {
      dispatch({ type: "SET_FLAG", flag: "flag_clear" });
    }

    // AI分析静默运行
    if (choice.needAIAnalysis) {
      try {
        const result = await analyzeChoice(nextState, choice.id);
        dispatch({
          type: "ADD_AI_TRACE",
          trace: {
            type: "choice_analysis",
            sceneId: state.currentSceneId,
            result: JSON.stringify(result, null, 2),
            createdAt: new Date().toISOString(),
          },
        });
      } catch {
        // 静默失败
      }
    }
  }

  function handleNext(nextSceneId: string) {
    if (!nextSceneId) {
      const currentScene = dialogScene;
      if (currentScene?.id === "ch1_game_start_system") {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        return;
      }
      if (currentScene?.onCgEnd) {
        if (currentScene.onCgEnd === "enter_dormitory_playable") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_cg_end_think" });
          }, 600);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "dorm_return_chair_right") {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "return_dormitory") {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_stop" });
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_think" });
          }, 600);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "enter_dormitory_day") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_9", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_10", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_notice_pc" });
          }, 800);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "ch4_free_classroom_lunch") {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
      }
      if (currentScene?.id === "balcony_night_narrate_2") {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "balcony_night_think" });
        }, 1500);
        return;
      }
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // 检测 CG 结束后的场景转换效果
    const nextScene = scenes[nextSceneId];
    if (nextScene?.onCgEnd) {
      if (nextScene.onCgEnd === "enter_balcony") {
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
          }, 2000);
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "enter_dormitory_playable") {
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_cg_end_think" });
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "dorm_enter_explore") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        }, 300);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "dorm_return_chair_right") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        dispatch({ type: "DIALOG_END" });
        return;
      }
    }

    // 剧情事件触发
    if (nextSceneId === "balcony_night_narrate_2") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act2_sleep_result") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      setTimeout(() => {
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 1800);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    if (nextSceneId === "dorm_act3_alarm") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "play_sfx", payload: { key: "alarm_clock", loop: true } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_wake") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "stop_sfx", payload: { key: "alarm_clock" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act3_getup") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "remove_fade_overlay" });
      setEyeOpening(true);
      setTimeout(() => setEyeOpening(false), 2000);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act3_pc_on_1") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "left" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_turn_roommate") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "right" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_roommate_laugh") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "left" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "front" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch1_shop_exchange_2") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_lzx", direction: "back" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // 第四幕入口
    if (nextSceneId === "dorm_act4_return_dorm") {
      dispatch({ type: "CHANGE_MAP", mapId: "dormitory_act4", spawnId: "spawn_spawn_4", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_act4", spawnId: "spawn_spawn_4" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "dorm_act4_return_dorm" });
      }, 450);
      return;
    }

    if (nextSceneId === "dorm_act4_pc_boot_shock") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "change_ground_image", payload: { key: "ground_dorm_night_pc_on" } });
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 250);
      return;
    }

    if (nextSceneId === "dorm_act4_death_cough") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // 死亡结局 → 回到标题
    if (nextSceneId === "title_screen") {
      setTimeout(() => {
        setGamePhase("menu");
      }, 3000);
      dispatch({ type: "ENDING_REACHED" });
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.1 校园小卖部：进入 ──
    if (nextSceneId === "ch1_shop_school_enter") {
      dispatch({ type: "CHANGE_MAP", mapId: "shop_school", spawnId: "spawn_shop_school_entrance", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "shop_school", spawnId: "spawn_shop_school_entrance" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_47", npcKey: "npc_female_assistant", scale: 0.75, framesPrefix: "shop_assistant_female_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_female_assistant", direction: "back" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.2 厨房用品店：进入 ──
    if (nextSceneId === "ch1_shop_enter") {
      dispatch({ type: "CHANGE_MAP", mapId: "shop", spawnId: "spawn_spawn_1", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "shop", spawnId: "spawn_spawn_1" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_3", npcKey: "npc_male_assistant", scale: 0.75, framesPrefix: "shop_assistant_male_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_male_assistant", direction: "back" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.2 厨房用品店：CG过渡回到地图挑衅 ──
    if (nextSceneId === "ch1_shop_confrontation") {
      // 玩家传送到 spawn_spawn_6，面朝上（stand_back）
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 180 } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_6" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "up" } });
      // NPC 重排到挑衅位置
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_2", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_mysterious", direction: "right" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // ── 7.2 厨房用品店：林芷萱离开后分支路由 ──
    if (nextSceneId === "ch1_shop_lzx_leave_branch") {
      const isClear = state.flags["flag_clear"];
      const branchId = isClear ? "ch1_shop_clear_smooth_path" : "ch1_shop_hard_path";
      dispatch({ type: "GO_NEXT", nextSceneId: branchId });
      return;
    }

    // ── 第一章结尾：进入人类进化计划候场区 ──
    if (nextSceneId === "ch1_game_start") {
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "CHANGE_MAP", mapId: "waiting", spawnId: "spawn_waiting_default", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "waiting", spawnId: "spawn_waiting_default" });
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      return;
    }

    // ── 第4章：跳过第2、3章后直接进入规则发现 ──
    if (nextSceneId === "ch4_find_brochure") {
      enterClassroomScene("spawn_spawn_145", nextSceneId, () => {
        fillClassroomSeats(["spawn_spawn_145"]);
      });
      return;
    }

    if (nextSceneId === "ch4_morning_classroom") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, setupMorningClassroom);
      return;
    }

    if (nextSceneId === "ch4_roster_test_liuyu_scene") {
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_246", "spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_247"],
          direction: "left",
          freezeAfter: true,
          speed: 160,
        },
      });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch4_physics_observe") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => setupLessonClassroom("npc_teacher_li", "teacher_frames"));
      return;
    }

    if (nextSceneId === "ch4_zhou_lunch_approach") {
      enterClassroomScene("spawn_spawn_246", nextSceneId, setupLunchClassroom);
      return;
    }

    if (nextSceneId === "ch4_art_class_start") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => setupLessonClassroom("npc_wang_teacher", "wql_frames"));
      return;
    }

    if (nextSceneId === "ch4_show_painting") {
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_wang_teacher",
          path: ["spawn_spawn_249", "spawn_spawn_246"],
          direction: "left",
          speed: 140,
        },
      });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch4_greenbelt_start") {
      enterGateScene("spawn_spawn_166", nextSceneId);
      return;
    }

    // ── 7.1 校园小卖部：告别挥手 → 播放 stand_front 动画 ──
    if (dialogScene?.id === "ch1_shop_school_farewell") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    dispatch({ type: "GO_NEXT", nextSceneId });
  }

  async function handleAIEvent() {
    if (!dialogScene?.aiEvent) return;
    try {
      if (dialogScene.aiEvent === "npc_dialogue") {
        const result = await generateNpcDialogue(state, dialogScene.character ?? "unknown");
        addAITrace("npc_dialogue", result);
      }
      if (dialogScene.aiEvent === "ending_judge") {
        const result = await judgeEnding(state);
        addAITrace("ending_judge", result);
        dispatch({ type: "ENDING_REACHED" });
        // 保存人格画像
        savePortrait({
          endingTitle: dialogScene.text.slice(0, 20) || "结局",
          traits: { ...state.traits },
          timestamp: new Date().toLocaleString("zh-CN"),
        });
      }
    } catch {
      addAITrace(dialogScene.aiEvent, { error: "AI 事件执行失败。" });
    } finally {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }
  }

  function handleCloseDialog() {
    const currentScene = dialogScene;

    if (currentScene?.id === "ch1_game_start_system") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "balcony_night_narrate_2") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "balcony_night_think" });
      }, 1500);
      return;
    }

    if (currentScene?.id === "dorm_act2_think") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "dorm_act2_explore") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2_exploring" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "dorm_act2_sleep_result") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act3" });
      dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_reflection" });
      return;
    }

    // ── 7.1 校园小卖部：购买阶段交互收集 ──
    if (state.flags["shop_school_buying"]) {
      const itemFlagMap: Record<string, string> = {
        "shop_school_interact_drink": "shop_drink",
        "shop_school_interact_food": "shop_food",
        "shop_school_interact_chips": "shop_chips",
        "shop_school_interact_meat": "shop_meat",
        "shop_school_interact_fruit": "shop_fruit",
      };
      if (itemFlagMap[currentScene?.id ?? ""]) {
        dispatch({ type: "SET_FLAG", flag: itemFlagMap[currentScene!.id] });
        const updatedFlags = { ...state.flags, [itemFlagMap[currentScene!.id]]: true };
        const allCollected = ["shop_drink", "shop_food", "shop_chips", "shop_meat", "shop_fruit"].every(f => updatedFlags[f]);
        if (allCollected) {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_END" });
          setTimeout(() => {
            dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_school_buy_done" });
          }, 300);
          return;
        }
      }
    }

    // ── 7.1 校园小卖部：进入后解放玩家 ──
    if (currentScene?.id === "ch1_shop_school_enter_narrate") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_buying" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.1 校园小卖部：买完 → 进入结账阶段 ──
    if (currentScene?.id === "ch1_shop_school_buy_done") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_checkout_phase" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.1 校园小卖部：告别挥手 → 播放 stand_front 动画 ──
    if (currentScene?.id === "ch1_shop_school_farewell") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "GO_NEXT", nextSceneId: currentScene.nextSceneId! });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.1 校园小卖部：结账完成 → 进入离开阶段 ──
    if (currentScene?.id === "ch1_shop_school_checkout_think") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_leave_phase" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.2 厨房用品店：进入后解放玩家 ──
    if (currentScene?.id === "ch1_shop_enter_weapon") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.2 厨房用品店：获得水果刀 ──
    if (currentScene?.id === "ch1_shop_interact_knife") {
      dispatch({ type: "SET_FLAG", flag: "shop_fruit_knife" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.onCgEnd) {
      if (currentScene.onCgEnd === "dorm_enter_explore") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        }, 300);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (currentScene.onCgEnd === "return_dormitory") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_stop" });
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_think" });
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (currentScene.onCgEnd === "enter_dormitory_day") {
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7" });
        setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_9", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_10", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_notice_pc" });
        }, 800);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      // ── 7.2 厨房用品店：排队 → 开始线索交换 ──
      if (currentScene.onCgEnd === "shop_exchange_start") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 180 } });
        // 玩家传送到 spawn_spawn_4，面朝前（stand_front）
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_4" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
        // NPC 重排到交换线索位置（spawn_npc 现在支持覆盖已存在的 NPC）
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_END" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_exchange_1" });
        }, 400);
        return;
      }
      // ── 7.2 厨房用品店：对峙结束 → 林芷萱离开CG ──
      if (currentScene.onCgEnd === "shop_lzx_leave") {
        dispatch({ type: "DIALOG_END" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_lzx_leave" });
        }, 300);
        return;
      }
    }
    dispatch({ type: "DIALOG_END" });
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  const handleDialogueTrigger = useCallback((sceneId: string) => {
    let actualSceneId = sceneId;
    const isAct2 = state.flags["dorm_act2"];
    const isAct2Exploring = state.flags["dorm_act2_exploring"];

    if (isAct2 || isAct2Exploring) {
      if (sceneId === "dorm_interact_pc") {
        actualSceneId = isAct2Exploring ? "dorm_act2_pc_force_sleep" : "dorm_act2_pc_confirm";
      }
      if (sceneId === "dorm_interact_clock") {
        actualSceneId = "dorm_act2_clock";
      }
      if (sceneId === "dorm_go_balcony") {
        actualSceneId = "dorm_act2_no_balcony";
      }
    }

    // ── 7.1 校园小卖部：阶段重定向 ──
    const shopSchoolCheckoutPhase = state.flags["shop_school_checkout_phase"];
    const shopSchoolLeavePhase = state.flags["shop_school_leave_phase"];

    if (shopSchoolLeavePhase) {
      const leaveRedirect: Record<string, string> = {
        "shop_school_interact_drink": "shop_school_leave_drink",
        "shop_school_interact_food": "shop_school_leave_food",
        "shop_school_interact_chips": "shop_school_leave_chips",
        "shop_school_interact_meat": "shop_school_leave_meat",
        "shop_school_interact_fruit": "shop_school_leave_fruit",
        "shop_school_interact_exit": "ch1_shop_school_farewell",
        "shop_school_interact_checkout": "shop_school_leave_checkout",
        "shop_school_interact_floor": "shop_school_leave_floor",
      };
      if (leaveRedirect[actualSceneId]) {
        dispatch({ type: "DIALOG_START", sceneId: leaveRedirect[actualSceneId] });
        return;
      }
    } else if (shopSchoolCheckoutPhase) {
      const checkoutRedirect: Record<string, string> = {
        "shop_school_interact_drink": "shop_school_checkout_drink",
        "shop_school_interact_food": "shop_school_checkout_food",
        "shop_school_interact_chips": "shop_school_checkout_chips",
        "shop_school_interact_meat": "shop_school_checkout_meat",
        "shop_school_interact_fruit": "shop_school_checkout_fruit",
        "shop_school_interact_exit": "shop_school_checkout_exit",
        "shop_school_interact_checkout": "ch1_shop_school_checkout_done",
        "shop_school_interact_floor": "shop_school_checkout_floor",
      };
      if (checkoutRedirect[actualSceneId]) {
        dispatch({ type: "DIALOG_START", sceneId: checkoutRedirect[actualSceneId] });
        return;
      }
    }

    // ── 7.2 厨房用品店：空 sceneId trigger 名称映射 ──
    const shopTriggerMap: Record<string, string> = {
      "trigger_8": state.flags["shop_fruit_knife"] ? "ch1_shop_interact_queue" : "ch1_shop_interact_queue_no_weapon",
      "trigger_9": "ch1_shop_interact_knife",
      "trigger_10": "ch1_shop_interact_spatula",
      "trigger_11": "ch1_shop_interact_cleaver",
      "trigger_12": "ch1_shop_interact_pan",
    };
    if (state.currentMapId === "shop" && shopTriggerMap[actualSceneId]) {
      dispatch({ type: "DIALOG_START", sceneId: shopTriggerMap[actualSceneId] });
      return;
    }

    // ── 第4章：教室午休探索触发器 ──
    if (state.currentMapId === "classroom") {
      const isCh4Lunch = state.currentSceneId === "" && (
        state.choiceHistory.includes("ch4_lunch_punished") ||
        state.choiceHistory.includes("ch4_lunch_not_punished")
      );
      if (isCh4Lunch) {
        const classroomTriggerMap: Record<string, string> = {
          trigger_247: state.choiceHistory.includes("ch4_lunch_not_punished") ? "ch4_zhou_help" : "ch4_zhou_question_method",
          trigger_249: "ch4_liuyu_lunch_tease",
          trigger_248: "ch4_seat_busy",
          trigger_246: "ch4_empty_seat_lunch",
          trigger_250: "ch4_classroom_noticeboard",
          trigger_251: "ch4_classroom_slogan",
        };
        if (classroomTriggerMap[actualSceneId]) {
          dispatch({ type: "DIALOG_START", sceneId: classroomTriggerMap[actualSceneId] });
          return;
        }
      }
    }

    const scene = scenes[actualSceneId];
    if (scene?.onCgEnd) {
      if (scene.onCgEnd === "enter_balcony") {
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
          }, 2000);
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
    }
    dispatch({ type: "DIALOG_START", sceneId: actualSceneId });
  }, [state.flags, state.currentMapId, state.currentSceneId, state.choiceHistory]);

  // 当前对话预览（用于存档）
  const dialogPreview = dialogScene
    ? `[${dialogScene.speaker || "旁白"}] ${dialogScene.text.slice(0, 20)}`
    : "";

  const fillClassroomSeats = useCallback((exclude: string[]) => {
    gameBridge.sendToPhaser({
      type: "STORY_EVENT",
      eventId: "fill_classroom_seats",
      payload: {
        start: 115,
        end: 155,
        exclude: [
          ...exclude,
          "spawn_spawn_145",
          "spawn_spawn_156",
          "spawn_spawn_157",
          "spawn_spawn_246",
          "spawn_spawn_247",
          "spawn_spawn_248",
          "spawn_spawn_249",
          "spawn_spawn_250",
          "spawn_spawn_251",
          "spawn_spawn_252",
          "spawn_spawn_253",
        ],
        framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
      },
    });
  }, []);

  const enterClassroomScene = useCallback((spawnId: string, sceneId: string, setup?: () => void) => {
    dispatch({ type: "CHANGE_MAP", mapId: "classroom", spawnId, position: { x: 0, y: 0 } });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "classroom", spawnId });
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setup?.();
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, []);

  const setupMorningClassroom = useCallback(() => {
    fillClassroomSeats(["spawn_spawn_132", "spawn_spawn_126", "spawn_spawn_146", "spawn_spawn_127"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_156", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "left" } });
    setTimeout(() => {
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_248", "spawn_spawn_250", "spawn_spawn_252", "spawn_spawn_246"],
          direction: "left",
          speed: 160,
        },
      });
    }, 500);
  }, [fillClassroomSeats]);

  const setupLessonClassroom = useCallback((teacherKey = "npc_teacher_li", teacherFrames = "teacher_frames") => {
    fillClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_157", npcKey: teacherKey, scale: 0.75, framesPrefix: teacherFrames } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: teacherKey, direction: "down" } });
  }, [fillClassroomSeats]);

  const setupLunchClassroom = useCallback(() => {
    fillClassroomSeats(["spawn_spawn_127", "spawn_spawn_117"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames" } });
  }, [fillClassroomSeats]);

  const enterGateScene = useCallback((spawnId: string, sceneId: string) => {
    dispatch({ type: "CHANGE_MAP", mapId: "gate", spawnId, position: { x: 0, y: 0 } });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "gate", spawnId });
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_166", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, []);

  // ── 开始菜单阶段 ──
  if (gamePhase === "menu") {
    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
        <StartMenu
          onNewGame={handleNewGame}
          onStartChapter4={handleStartChapter4}
          onLoadGame={handleLoadGame}
          onShowPortrait={() => setShowPortraitPanel(true)}
          onExit={() => {
            // 浏览器环境下尝试关闭窗口
            window.close();
          }}
        />
        {showPortraitPanel && (
          <PersonalityPortrait onClose={() => setShowPortraitPanel(false)} />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* ── 右上角菜单按钮（直接打开游戏菜单） ── */}
      <div className="menu-button" onClick={() => setGameMenuOpen(true)}>
        <img src="/assets/ui/菜单图形.png" alt="菜单" className="menu-icon-img" />
      </div>

      {/* ── Phaser 地图（始终可见） ── */}
      <PhaserContainer
        dispatch={dispatch}
        currentMapId={state.currentMapId}
        onDialogueTrigger={handleDialogueTrigger}
      />

      {/* ── 睁眼效果遮罩 ── */}
      {eyeOpening && <div className="eye-open-overlay blinking" />}

      {/* ── React 闪屏层 ── */}
      {reactFlash && <div className={`react-flash-overlay ${reactFlash}`} />}

      {/* ── 对话叠层 ── */}
      {dialogScene && dialogScene.cgMode && (
        <CgOverlay
          scene={dialogScene}
          onNext={handleNext}
          onChoose={handleChoose}
        />
      )}
      {dialogScene && !dialogScene.cgMode && (
        <DialogOverlay
          scene={dialogScene}
          onNext={handleNext}
          onChoose={handleChoose}
          onAIEvent={handleAIEvent}
          onClose={handleCloseDialog}
        />
      )}

      {/* ── UI 面板 ── */}
      {state.endingReached && <StatusPanel state={state} />}
      {showAITrace && <AITracePanel traces={state.aiTraces} />}

      {/* ── 游戏内菜单（ESC 打开） ── */}
      {gameMenuOpen && (
        <GameMenu
          state={state}
          onClose={() => setGameMenuOpen(false)}
          onLoadState={(loaded) => {
            const normalized = normalizeLoadedState(loaded);
            dispatch({ type: "LOAD", state: normalized.state });
            gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: normalized.mapId, spawnId: normalized.spawnId });
            restoreDynamicMapActors(normalized.state);
            setDialogHistory([]);
            prevSceneIdRef.current = "";
            setGameMenuOpen(false);
          }}
          onRestart={handleRestart}
          onExitToTitle={handleExitToTitle}
          onShowBacklog={() => setShowBacklog(true)}
          onShowNotebook={() => setShowNotebookToast(true)}
          dialogPreview={dialogPreview}
        />
      )}

      {/* ── 对话回顾 ── */}
      {showBacklog && (
        <Backlog
          entries={dialogHistory}
          onClose={() => setShowBacklog(false)}
        />
      )}

      {/* ── 人格画像面板（游戏内查看） ── */}
      {showPortraitPanel && (
        <PersonalityPortrait onClose={() => setShowPortraitPanel(false)} />
      )}

      {/* ── 笔记本占位提示 ── */}
      {showNotebookToast && (
        <div className="notebook-toast">
          <p>📓 笔记本功能开发中，敬请期待~</p>
        </div>
      )}
    </div>
  );
}
