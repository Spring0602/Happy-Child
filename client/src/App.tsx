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
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import type { AITrace, Choice, GameState } from "./types/game";
import "./styles/global.css";

type GamePhase = "menu" | "playing";

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
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  // ── 读取存档进入游戏 ──
  function handleLoadGame(loaded: GameState) {
    dispatch({ type: "LOAD", state: loaded });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: loaded.currentMapId, spawnId: "spawn_spawn_52" });
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
      if (currentScene?.onCgEnd) {
        if (currentScene.onCgEnd === "enter_dormitory_playable") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
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
      if (nextScene.onCgEnd === "enter_dormitory") {
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_desk", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_desk" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "darken_overlay", payload: { alpha: 0.55 } });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spotlight_player" });
          }, 200);
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
          }, 400);
        }, 800);
        dispatch({ type: "GO_NEXT", nextSceneId });
        return;
      }
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
    if (nextSceneId === "ch1_chenyuhao") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "remove_dark_overlay" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_by_chair" } });
      }, 300);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch1_afternoon") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

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
  }, [state.flags]);

  // 当前对话预览（用于存档）
  const dialogPreview = dialogScene
    ? `[${dialogScene.speaker || "旁白"}] ${dialogScene.text.slice(0, 20)}`
    : "";

  // ── 开始菜单阶段 ──
  if (gamePhase === "menu") {
    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
        <StartMenu
          onNewGame={handleNewGame}
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
            dispatch({ type: "LOAD", state: loaded });
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
