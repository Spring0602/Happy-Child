import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { scenes } from "./data/scenes";
import { aiSceneConfigs } from "./data/aiSceneConfig";
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
import { PhoneChatOverlay } from "./components/PhoneChatOverlay";
import { gameBridge } from "./game/bridge/GameBridge";
import { playSceneSounds, unlockScriptedAudio } from "./services/scriptedAudio";
import { MapRegistry } from "./game/config/mapRegistry";
import {
  analyzeChoice,
  createFallbackPersonalityPortrait,
  generateAiScene,
  generateNpcDialogue,
  generatePersonalityPortrait,
  judgeEnding,
  type GeneratedPersonalityPortrait,
} from "./services/aiClient";
import type { AITrace, Choice, GameState } from "./types/game";
import "./styles/global.css";

type GamePhase = "menu" | "playing";

type FloatingTextItem = {
  id: string;
  text: string;
  x: string;
  y: string;
  fontSize?: number;
  width?: string;
  variant?: "normal" | "climax" | "gold" | "backlash";
};

function conditionMatches(condition: string, state: GameState): boolean {
  const trimmed = condition.trim();
  if (!trimmed) return true;
  const negated = trimmed.startsWith("!");
  const key = negated ? trimmed.slice(1) : trimmed;
  const value = state.flags[key] || state.choiceHistory.includes(key);
  return negated ? !value : value;
}

function filterConditionalSceneText(text: string, state: GameState): string {
  const markerPattern = /\[旁白\]【条件：([^】]+)】/g;
  const matches = [...text.matchAll(markerPattern)];
  if (matches.length === 0) return text;

  let result = "";
  if ((matches[0].index ?? 0) > 0) {
    result += text.slice(0, matches[0].index);
  }

  matches.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    if (conditionMatches(match[1], state)) {
      result += text.slice(contentStart, contentEnd);
    }
  });

  return result.trim() || text.replace(markerPattern, "").trim();
}

function inferSpawnIdForScene(sceneId: string, mapId: string): string {
  const sceneSpawnMap: Record<string, string> = {
    ch4_find_brochure: "spawn_spawn_145",
    ch4_morning_classroom: "spawn_spawn_132",
    ch4_morning_liuyu_sits: "spawn_spawn_132",
    ch4_roster_test_liuyu: "spawn_spawn_247",
    ch4_physics_observe: "spawn_spawn_132",
    ch4_zhou_lunch_approach: "spawn_spawn_276",
    ch4_art_class_start: "spawn_spawn_132",
    ch4_show_painting: "spawn_spawn_132",
    ch4_wang_dynamic_judgment: "spawn_spawn_132",
    ch4_wang_question_choice: "spawn_spawn_132",
    ch4_wang_core_reply: "spawn_spawn_132",
    ch4_greenbelt_start: "spawn_spawn_166",
    ch4_greenbelt_after_walk: "spawn_spawn_165",
    ch4_liuyu_fixed_warning: "spawn_spawn_165",
    ch5_liuyu_negotiate: "spawn_spawn_165",
    ch5_liuyu_negotiation_choice: "spawn_spawn_165",
    ch5_liuyu_dynamic_response: "spawn_spawn_165",
    ch5_permission_inference: "spawn_spawn_165",
    ch5_go_to_wang_gallery: "spawn_spawn_165",
    ch5_enter_fifth_floor: "spawn_spawn_165",
  };
  return sceneSpawnMap[sceneId] || MapRegistry[mapId]?.defaultSpawn || initialGameState.currentSpawnId;
}

function normalizeLoadedState(loaded: GameState): {
  state: GameState;
  mapId: string;
  spawnId: string;
} {
  const mapId = loaded.currentMapId && MapRegistry[loaded.currentMapId]
    ? loaded.currentMapId
    : initialGameState.currentMapId;
  const savedSpawnId = (loaded as Partial<GameState>).currentSpawnId;
  const spawnId = savedSpawnId || inferSpawnIdForScene(loaded.currentSceneId || "", mapId);
  return {
    state: { ...loaded, currentMapId: mapId, currentSpawnId: spawnId },
    mapId,
    spawnId,
  };
}

function restoreClassroomSeats(exclude: string[], includeSpawns: string[] = [], includeOnly = false) {
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
        "spawn_spawn_258",
        "spawn_spawn_246",
        "spawn_spawn_247",
        "spawn_spawn_248",
        "spawn_spawn_249",
        "spawn_spawn_250",
        "spawn_spawn_251",
        "spawn_spawn_252",
        "spawn_spawn_253",
      ],
      includeSpawns,
      includeOnly,
      framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
    },
  });
}

function restoreMorningClassroomSeats() {
  const occupiedSpawns = new Set([
    "spawn_spawn_117",
    "spawn_spawn_127",
    "spawn_spawn_132",
    "spawn_spawn_145",
    "spawn_spawn_156",
    "spawn_spawn_258",
    "spawn_spawn_246",
    "spawn_spawn_247",
    "spawn_spawn_248",
    "spawn_spawn_249",
    "spawn_spawn_250",
    "spawn_spawn_251",
    "spawn_spawn_252",
    "spawn_spawn_253",
  ]);
  const candidates = Array.from({ length: 41 }, (_, index) => `spawn_spawn_${115 + index}`)
    .filter((spawnId) => !occupiedSpawns.has(spawnId));
  restoreClassroomSeats(Array.from(occupiedSpawns), candidates.slice(0, 3), true);
}

function restoreLessonClassroom(teacherKey = "npc_teacher_li", teacherFrames = "teacher_frames") {
  restoreClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117"]);
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: teacherKey, scale: 0.75, framesPrefix: teacherFrames } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: teacherKey, direction: "down" } });
}

function restoreLunchClassroom() {
  restoreClassroomSeats(["spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_132", "spawn_spawn_145"]);
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
}

function restoreDynamicMapActors(loaded: GameState) {
  setTimeout(() => {
    if (loaded.currentMapId === "classroom") {
      if (["ch4_find_brochure", "ch4_morning_classroom", "ch4_morning_liuyu_sits", "ch4_roster_test_liuyu"].includes(loaded.currentSceneId)) {
        restoreMorningClassroomSeats();
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
        return;
      }
      if (loaded.currentSceneId === "ch4_physics_observe") {
        restoreLessonClassroom("npc_teacher_li", "teacher_frames");
        return;
      }
      if (loaded.currentSceneId === "ch4_zhou_lunch_approach") {
        restoreLunchClassroom();
        return;
      }
      if (["ch4_art_class_start", "ch4_show_painting", "ch4_wang_dynamic_judgment", "ch4_wang_question_choice", "ch4_wang_core_reply"].includes(loaded.currentSceneId)) {
        restoreLessonClassroom("npc_wang_teacher", "wql_frames");
        return;
      }
    }

    if (loaded.currentMapId === "gate" && loaded.currentSceneId.startsWith("ch4_")) {
      const liuyuSpawn = ["ch4_greenbelt_after_walk", "ch4_liuyu_fixed_warning"].includes(loaded.currentSceneId)
        ? "spawn_spawn_164"
        : "spawn_spawn_166";
      const direction = liuyuSpawn === "spawn_spawn_164" ? "right" : "front";
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: liuyuSpawn, npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction } });
      return;
    }

    if (loaded.currentMapId === "wang_gallery") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_45", npcKey: "npc_wang_teacher", scale: 0.75, framesPrefix: "wql_frames", pose: "sit", direction: "right" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_46", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames", pose: "sit", direction: "left" } });
      return;
    }

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
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [floatingTextPerformanceActive, setFloatingTextPerformanceActive] = useState(false);
  const [completedPhoneChats, setCompletedPhoneChats] = useState<Record<string, boolean>>({});
  const [dialogHistory, setDialogHistory] = useState<DialogLogEntry[]>([]);
  const [corridorCountdown, setCorridorCountdown] = useState<number | null>(null);
  const [demoPortrait, setDemoPortrait] = useState<GeneratedPersonalityPortrait | null>(null);
  const [demoPortraitGenerating, setDemoPortraitGenerating] = useState(false);
  const [finalSaveRequired, setFinalSaveRequired] = useState(false);
  const [aiSceneTexts, setAiSceneTexts] = useState<Record<string, string>>({});
  const [aiSceneLoadingId, setAiSceneLoadingId] = useState<string | null>(null);
  const aiSceneRequestsRef = useRef<Set<string>>(new Set());
  const prevSceneIdRef = useRef<string>("");
  const corridorDeathTimerRef = useRef<number | null>(null);

  // 当前对话场景
  const dialogSceneId = state.currentSceneId && scenes[state.currentSceneId]
    ? state.currentSceneId
    : null;
  const rawDialogScene = dialogSceneId ? scenes[dialogSceneId] : null;
  const aiSceneConfig = dialogSceneId ? aiSceneConfigs[dialogSceneId] : undefined;
  const aiGeneratedText = dialogSceneId ? aiSceneTexts[dialogSceneId] : undefined;
  const aiSceneIsLoading = !!aiSceneConfig && !aiGeneratedText;
  const dialogScene = rawDialogScene
    ? {
        ...rawDialogScene,
        text: aiSceneConfig
          ? (aiGeneratedText ?? "")
          : filterConditionalSceneText(rawDialogScene.text, state),
      }
    : null;

  useEffect(() => {
    if (!dialogSceneId || !rawDialogScene || !aiSceneConfig || aiSceneTexts[dialogSceneId]) return;
    if (aiSceneRequestsRef.current.has(dialogSceneId)) return;

    aiSceneRequestsRef.current.add(dialogSceneId);
    setAiSceneLoadingId(dialogSceneId);
    const prompt = (aiSceneConfig.prompt ?? rawDialogScene.text)
      .replace(/\[旁白\]/g, "")
      .trim();

    void generateAiScene(
      state,
      dialogSceneId,
      aiSceneConfig.mode,
      prompt,
      aiSceneConfig.requiredLines
    )
      .then((response) => {
        const script = response.result?.script?.trim();
        if (!script || !/\[(?:旁白|主角|主角说|NPC:[^\]]+)\]/.test(script)) {
          throw new Error("AI scene returned invalid script format");
        }
        setAiSceneTexts((previous) => ({ ...previous, [dialogSceneId]: script }));
      })
      .catch((error) => {
        console.error(`[AI] 场景 ${dialogSceneId} 生成失败，使用安全保底文本`, error);
        setAiSceneTexts((previous) => ({ ...previous, [dialogSceneId]: aiSceneConfig.fallback }));
      })
      .finally(() => {
        setAiSceneLoadingId((current) => current === dialogSceneId ? null : current);
      });
  }, [dialogSceneId]);

  function resetAiSceneRuntime() {
    aiSceneRequestsRef.current.clear();
    setAiSceneTexts({});
    setAiSceneLoadingId(null);
  }

  // 同步 GameBridge + 自动存档
  useEffect(() => {
    if (gamePhase === "playing") {
      const runtime = gameBridge.captureMapRuntime();
      saveGame(runtime?.mapId === state.currentMapId ? { ...state, mapRuntime: runtime } : state);
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

  useEffect(() => {
    if (!dialogScene) return;
    return playSceneSounds(dialogScene.id);
  }, [dialogScene?.id]);

  useEffect(() => {
    const unlock = () => {
      unlockScriptedAudio();
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("keydown", unlock);
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // ESC 键：打开/关闭游戏内菜单
  useEffect(() => {
    if (gamePhase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        if (finalSaveRequired) return;
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
  }, [gamePhase, showBacklog, showPortraitPanel, finalSaveRequired]);

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
    resetAiSceneRuntime();
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
    resetAiSceneRuntime();
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

  function restoreLoadedGame(loaded: GameState, closeGameMenu = false) {
    resetAiSceneRuntime();
    const normalized = normalizeLoadedState(loaded);
    const playerState = scenes[normalized.state.currentSceneId]?.playerState;
    const runtimeSnapshot = normalized.state.mapRuntime?.mapId === normalized.mapId
      ? normalized.state.mapRuntime
      : undefined;
    dispatch({ type: "LOAD", state: normalized.state });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: normalized.mapId,
      spawnId: normalized.spawnId,
      ...(playerState ? { playerState } : {}),
      ...(runtimeSnapshot ? { runtimeSnapshot } : {}),
    });
    if (!runtimeSnapshot) restoreDynamicMapActors(normalized.state);
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    if (closeGameMenu) setGameMenuOpen(false);
    setGamePhase("playing");
  }

  // ── 读取存档进入游戏 ──
  function handleLoadGame(loaded: GameState) {
    restoreLoadedGame(loaded);
  }

  // ── 重新开始（清存档，回到初始场景） ──
  function handleRestart() {
    clearSave();
    resetAiSceneRuntime();
    dispatch({ type: "RESET" });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGameMenuOpen(false);
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  // ── 退出到标题 ──
  function handleExitToTitle() {
    resetAiSceneRuntime();
    setGameMenuOpen(false);
    setGamePhase("menu");
  }

  async function handleChoose(choice: Choice) {
    if (
      dialogScene?.phoneChat &&
      dialogScene.phoneChat.blockNextUntilComplete !== false &&
      !completedPhoneChats[dialogScene.id]
    ) {
      return;
    }

    const nextState = gameReducer(state, { type: "CHOOSE", choice });
    dispatch({ type: "CHOOSE", choice });

    if (
      choice.nextSceneId === "ch4_show_painting" &&
      ["ch4_painting_puppet", "ch4_painting_memory", "ch4_painting_safe"].includes(choice.id)
    ) {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_wang_teacher",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_249", "spawn_spawn_246"],
          direction: "left",
          speed: 140,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "camera_focus_spawn",
          payload: { spawnId: "spawn_spawn_246", duration: 500 },
        });
        dispatch({ type: "DIALOG_START", sceneId: choice.nextSceneId });
      }, 3200);
      return;
    }

    if (choice.id === "ch4_roster_test_liuyu" && choice.nextSceneId === "ch4_roster_test_liuyu") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_246", "spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_247"],
          direction: "right",
          standAfter: true,
          freezeAfter: true,
          speed: 160,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: choice.nextSceneId });
      }, 3800);
      return;
    }

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

    const choiceFlagIds = new Set([
      "ch6_class3_force_through",
      "ch6_class3_call_zhoujunxiu",
      "ch6_class3_claim_teacher",
      "ch6_class3_counter_pull",
      "ch6_class3_knife_warning",
      "ch6_class3_cut_student",
      "ch6_followed_liuyu_map",
      "ch6_verified_escape_route",
      "ch6_stalled_teacher",
      "ch6_prepared_to_fight_teacher",
      "ch6_vent_commit",
      "ch6_blocked_teacher",
      "ch6_distracted_teacher",
      "ch6_ignored_crying_student",
      "ch6_warned_crying_student",
      "ch6_helped_crying_student",
      "ch6_concealed_teacher_monster",
      "ch6_partial_injury_truth",
      "ch6_described_teacher_monster",
      "ch8_asked_door_identity",
      "ch8_checked_door_gap",
      "ch8_checked_mirror_again",
      "ch8_opened_door_directly",
      "ch8_challenged_inner_voice",
      "ch8_guided_small_choice",
      "ch8_shared_fear_with_self",
      "ch8_used_school_change_as_proof",
      "ch8_showed_working_city",
      "ch8_showed_sensory_city",
      "ch8_admitted_uncertainty",
      "ch8_framed_rooftop_as_choice",
      "ch8_refused_standard_answer",
      "ch8_admitted_no_complete_answer",
      "ch8_explained_collective_pressure",
      "ch8_asked_present_feeling",
    ]);
    if (choiceFlagIds.has(choice.id)) {
      dispatch({ type: "SET_FLAG", flag: choice.id });
    }
    if (choice.id === "ch6_class3_cut_student") {
      dispatch({ type: "SET_FLAG", flag: "ch6_harmed_class3_student" });
    }
    if (choice.id === "ch8_checked_door_gap") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_bathroom_door"],
          direction: "front",
          standAfter: true,
          freezeAfter: true,
          speed: 120,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch8_door_gap_result" });
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
        if (currentScene.onCgEnd === "ch5_free_gallery" || currentScene.onCgEnd === "ch5_free_class3") {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
        if (currentScene.onCgEnd === "ch6_free_corridor_return") {
          dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          startCorridorDeathTimer();
          return;
        }
        if (currentScene.onCgEnd === "ch6_free_corridor_return_active") {
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

    if (
      dialogScene?.phoneChat &&
      dialogScene.phoneChat.blockNextUntilComplete !== false &&
      !completedPhoneChats[dialogScene.id]
    ) {
      return;
    }

    if (nextSceneId === "ch6_corridor_pressure") {
      dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
      startCorridorDeathTimer();
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_gallery_explore") {
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
    if (nextSceneId === "ch5_wang_pressure") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_class3_face_closeup") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_exposed" });
      dispatch({ type: "GO_NEXT", nextSceneId });
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
      enterClassroomScene("spawn_spawn_145", nextSceneId, fillMorningClassroomSeats);
      return;
    }

    if (nextSceneId === "ch4_morning_classroom") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, setupMorningClassroom);
      return;
    }

    if (nextSceneId === "ch4_morning_liuyu_sits") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_127"],
          direction: "back",
          pose: "sit",
          speed: 160,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 2600);
      return;
    }

    if (nextSceneId === "ch4_roster_test_liuyu") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_246", "spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_247"],
          direction: "right",
          standAfter: true,
          freezeAfter: true,
          speed: 160,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 3800);
      return;
    }

    if (nextSceneId === "ch4_physics_observe") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => {
        setupLessonClassroom("npc_teacher_li", "teacher_frames");
        setTimeout(() => {
          gameBridge.sendToPhaser({
            type: "STORY_EVENT",
            eventId: "camera_focus_spawn",
            payload: { spawnId: "spawn_spawn_258", duration: 650 },
          });
        }, 120);
      });
      return;
    }

    if (nextSceneId === "ch4_zhou_lunch_approach") {
      enterClassroomFreeScene("spawn_spawn_276", nextSceneId, setupLunchClassroom);
      return;
    }

    if (nextSceneId === "ch4_art_class_start") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => {
        setupLessonClassroom("npc_wang_teacher", "wql_frames");
        setTimeout(() => {
          gameBridge.sendToPhaser({
            type: "STORY_EVENT",
            eventId: "camera_focus_spawn",
            payload: { spawnId: "spawn_spawn_258", duration: 650 },
          });
        }, 120);
      });
      return;
    }

    if (nextSceneId === "ch4_show_painting") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_wang_teacher",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_249", "spawn_spawn_246"],
          direction: "left",
          speed: 140,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "camera_focus_spawn",
          payload: { spawnId: "spawn_spawn_246", duration: 500 },
        });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 3200);
      return;
    }

    if (nextSceneId === "ch4_greenbelt_start") {
      enterGateScene("spawn_spawn_166", nextSceneId);
      return;
    }

    if (nextSceneId === "ch4_greenbelt_after_walk") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_179", "spawn_spawn_183", "spawn_spawn_164"],
          direction: "right",
          speed: 150,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "move_player_path",
          payload: {
            path: ["spawn_spawn_179", "spawn_spawn_184", "spawn_spawn_165"],
            direction: "left",
            standAfter: true,
            freezeAfter: true,
            speed: 150,
          },
        });
      }, 180);
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 6200);
      return;
    }

    if (nextSceneId === "ch5_wang_gallery_enter") {
      enterWangGalleryScene("spawn_wang_gallery_default", nextSceneId);
      return;
    }

    if (nextSceneId === "ch5_return_to_office") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_102" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_enter_class3") {
      enterClass3Scene("spawn_spawn_279", nextSceneId);
      return;
    }

    if (nextSceneId === "ch5_class3_exposure") {
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_corridor_return") {
      dispatch({ type: "SET_FLAG", flag: "ch6_escaped_class3" });
      enterMapScene("corridor", "spawn_spawn_38", nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_liuyu_catches_late") {
      clearCorridorDeathTimer();
      enterClassroomScene("spawn_spawn_156", nextSceneId, () => {
        fillClassroomSeats(["spawn_spawn_127", "spawn_spawn_132", "spawn_spawn_145", "spawn_spawn_156", "spawn_spawn_258"]);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "front" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
      });
      return;
    }

    if (nextSceneId === "ch6_teacher_office_enter") {
      enterTeacherOfficeScene(nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_liuyu_walks_to_player") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_248", "spawn_spawn_253"],
          direction: "right",
          speed: 150,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch6_liuyu_takes_player" });
      }, 4800);
      return;
    }

    if (nextSceneId === "ch6_teacher_office_liuyu_leaves") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_44", "spawn_spawn_39", "spawn_spawn_38", "spawn_spawn_40"],
          direction: "front",
          speed: 150,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch6_teacher_office_after_liuyu_leaves" });
      }, 3800);
      return;
    }

    if (nextSceneId === "ch6_office_escape_choice") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "spawn_npc",
        payload: {
          spawnId: "spawn_spawn_36",
          npcKey: "npc_teacher",
          scale: 0.75,
          framesPrefix: "teacher_monster_frames",
          pose: "sit",
          direction: "front",
        },
      });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_toilet_encounter") {
      dispatch({ type: "SET_FLAG", flag: "ch6_teacher_office_escaped" });
      dispatch({ type: "SET_FLAG", flag: "ch6_rule_wound" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_after_school_walk") {
      dispatch({ type: "SET_FLAG", flag: "ch6_weekly_exam_completed" });
      enterGateNightScene(nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_after_school_injury") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhouqirui", direction: "front" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_capture_ritual") {
      dispatch({ type: "SET_FLAG", flag: "ch6_school_root_rule_triggered" });
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch6_ritual_wishes" && nextSceneId === "ch6_ritual_desire_snowball") {
      runFloatingTextSequence("wishes", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch6_ritual_desire_snowball" && nextSceneId === "ch6_ritual_backlash") {
      runFloatingTextSequence("snowball", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch6_ritual_backlash" && nextSceneId === "ch6_numbers_attack") {
      runFloatingTextSequence("backlash", nextSceneId);
      return;
    }

    if (nextSceneId === "ch7_rule_skill_initialize") {
      dispatch({ type: "SET_FLAG", flag: "ch6_active_skill_initializing" });
      dispatch({ type: "SET_FLAG", flag: "ch6_school_rebellion_60" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch8_bathroom_knocking") {
      enterMapScene("bathroom", "spawn_spawn_23", nextSceneId);
      return;
    }

    if (nextSceneId === "ch8_mirror_ghost") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch8_walk_to_bathroom_door_identity" || nextSceneId === "ch8_walk_to_bathroom_door_mirror") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_bathroom_door"],
          direction: "front",
          standAfter: true,
          freezeAfter: true,
          speed: 120,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch8_open_bathroom_door" });
      }, 1800);
      return;
    }

    if (nextSceneId === "ch8_bathroom_death_vision") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch8_bathroom_death_vision" && nextSceneId === "ch8_return_to_bed") {
      dispatch({ type: "SET_FLAG", flag: "ch8_mirror_truth_fragment_1" });
      dispatch({ type: "SET_FLAG", flag: "ch8_mother_ghost_suspected" });
      dispatch({ type: "SET_FLAG", flag: "ch8_home_mirrors_connected_suspected" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch8_rooftop_arrival") {
      dispatch({ type: "SET_FLAG", flag: "ch8_left_room_during_check_hours" });
      enterMapScene("rooftop", "spawn_rooftop_default", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch8_rooftop_resolution" && nextSceneId === "ch8_return_home") {
      dispatch({ type: "SET_FLAG", flag: "ch8_inner_voice_respected" });
      dispatch({ type: "SET_FLAG", flag: "ch8_rooftop_shared_joy" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch8_return_home" && nextSceneId === "ch8_demo_personality_review") {
      dispatch({ type: "SET_FLAG", flag: "ch8_abandoned_cry_fragment_2" });
      dispatch({ type: "SET_FLAG", flag: "ch8_demo_story_completed" });
      dispatch({ type: "DIALOG_END" });
      setDemoPortraitGenerating(true);
      void (async () => {
        let portrait: GeneratedPersonalityPortrait;
        try {
          const response = await generatePersonalityPortrait(state);
          portrait = response.result;
          addAITrace("ending_judge", {
            type: "personality_portrait",
            title: portrait.title,
            summary: portrait.summary,
          });
        } catch {
          portrait = createFallbackPersonalityPortrait(state);
        }
        setDemoPortrait(portrait);
        savePortrait({
          endingTitle: portrait.title,
          traits: { ...state.traits },
          timestamp: new Date().toLocaleString("zh-CN"),
          imageDataUrl: portrait.imageDataUrl,
          summary: portrait.summary,
        });
        setDemoPortraitGenerating(false);
        dispatch({ type: "DIALOG_START", sceneId: "ch8_unfinished_threads" });
      })();
      return;
    }

    if (nextSceneId === "ch8_open_final_save") {
      dispatch({ type: "SET_FLAG", flag: "demo_personality_archive" });
      setFinalSaveRequired(true);
      setGameMenuOpen(true);
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

    if (currentScene?.onCgEnd === "ch6_free_corridor_return") {
      dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      startCorridorDeathTimer();
      return;
    }
    if (currentScene?.onCgEnd === "ch6_free_corridor_return_active") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

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

    // ── 第5章：画廊/3班探索阶段 flag ──
    const currentSceneId = currentScene?.id ?? "";
    if (currentSceneId === "ch5_gallery_soft") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_soft_seen" });
      if (state.flags["ch5_gallery_raw_seen"]) dispatch({ type: "SET_FLAG", flag: "ch5_gallery_paintings_seen" });
    }
    if (currentSceneId === "ch5_gallery_raw") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_raw_seen" });
      if (state.flags["ch5_gallery_soft_seen"]) dispatch({ type: "SET_FLAG", flag: "ch5_gallery_paintings_seen" });
    }
    if (currentSceneId === "ch5_gallery_inference") {
      dispatch({ type: "SET_FLAG", flag: "ch5_social_responsibility_realized" });
    }
    if (currentSceneId === "ch5_gallery_materials_warning") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_warning_triggered" });
    }
    if (currentSceneId === "ch5_class3_students") {
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_students_checked" });
    }
    if (currentSceneId === "ch5_class3_rules") {
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_rules_found" });
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
          trigger_245: "ch4_lunch_corridor_blocked",
          trigger_250: "ch4_classroom_noticeboard",
          trigger_251: "ch4_classroom_slogan",
        };
        if (classroomTriggerMap[actualSceneId]) {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: classroomTriggerMap[actualSceneId] });
          return;
        }
      }
    }

    // ── 第6章：20秒内奔回本班 ──
    if (state.currentMapId === "corridor" && state.flags["ch6_corridor_returning"]) {
      if (actualSceneId === "trigger_36") {
        clearCorridorDeathTimer();
        dispatch({ type: "SET_FLAG", flag: "ch6_reached_classroom_in_time" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_reached_classroom" });
        return;
      }
      if (["trigger_37", "trigger_53"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_wrong_room" });
        return;
      }
      if (["trigger_51", "trigger_50"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_wrong_direction" });
        return;
      }
      if (["trigger_34", "trigger_35"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_toilet_direction" });
        return;
      }
    }

    // ── 第5章：王沁林画廊探索触发器 ──
    if (state.currentMapId === "wang_gallery") {
      const softPaintingTriggers = new Set(["trigger_88", "trigger_90", "trigger_92", "trigger_94"]);
      const rawPaintingTriggers = new Set(["trigger_89", "trigger_91", "trigger_93", "trigger_95"]);
      const materialTriggers = new Set(["trigger_96", "trigger_97", "trigger_99", "trigger_100", "trigger_101", "trigger_102", "trigger_103", "trigger_104"]);

      if (softPaintingTriggers.has(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_soft" });
        return;
      }
      if (rawPaintingTriggers.has(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_raw" });
        return;
      }
      if (actualSceneId === "trigger_end") {
        const targetSceneId = !state.flags["ch5_gallery_paintings_seen"]
          ? "ch5_gallery_infer_need_paintings"
          : "ch5_gallery_inference";
        dispatch({ type: "DIALOG_START", sceneId: targetSceneId });
        return;
      }
      if (materialTriggers.has(actualSceneId)) {
        if (state.flags["ch5_social_responsibility_realized"]) {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
        }
        dispatch({
          type: "DIALOG_START",
          sceneId: state.flags["ch5_social_responsibility_realized"] ? "ch5_gallery_materials_warning" : "ch5_gallery_materials_wait",
        });
        return;
      }
      if (actualSceneId === "trigger_48") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_leave_blocked" });
        return;
      }
    }

    // ── 第5章：3班探索触发器 ──
    if (state.currentMapId === "classroom_3") {
      if (["trigger_283", "trigger_284", "trigger_285"].includes(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_students" });
        return;
      }
      if (actualSceneId === "trigger_251") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_slogan" });
        return;
      }
      if (actualSceneId === "trigger_245") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_leave_blocked" });
        return;
      }
      if (actualSceneId === "trigger_250") {
        dispatch({
          type: "DIALOG_START",
          sceneId: state.flags["ch5_class3_students_checked"] ? "ch5_class3_rules" : "ch5_class3_rules_wait",
        });
        return;
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

  const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

  const clearCorridorDeathTimer = useCallback(() => {
    if (corridorDeathTimerRef.current !== null) {
      window.clearInterval(corridorDeathTimerRef.current);
      corridorDeathTimerRef.current = null;
    }
    setCorridorCountdown(null);
  }, []);

  const startCorridorDeathTimer = useCallback(() => {
    clearCorridorDeathTimer();
    setCorridorCountdown(20);
    corridorDeathTimerRef.current = window.setInterval(() => {
      setCorridorCountdown((remaining) => {
        if (remaining === null) return null;
        if (remaining > 1) return remaining - 1;

        if (corridorDeathTimerRef.current !== null) {
          window.clearInterval(corridorDeathTimerRef.current);
          corridorDeathTimerRef.current = null;
        }
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_timeout_death" });
        return null;
      });
    }, 1000);
  }, [clearCorridorDeathTimer]);

  const getScenePlayerState = useCallback((sceneId: string, fallback?: string) => {
    return scenes[sceneId]?.playerState || fallback;
  }, []);

  const changeMapForScene = useCallback((mapId: string, spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    const playerState = getScenePlayerState(sceneId, fallbackPlayerState);
    dispatch({ type: "CHANGE_MAP", mapId, spawnId, position: { x: 0, y: 0 } });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId,
      spawnId,
      ...(playerState ? { playerState } : {}),
    });
  }, [getScenePlayerState]);

  const enterMapScene = useCallback((mapId: string, spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene(mapId, spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const addFloatingText = useCallback((item: Omit<FloatingTextItem, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setFloatingTexts(prev => [...prev, { ...item, id }]);
    return id;
  }, []);

  const removeFloatingText = useCallback((id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  const runFloatingTextSequence = useCallback(async (sequence: "wishes" | "snowball" | "backlash", nextSceneId: string) => {
    setFloatingTextPerformanceActive(true);
    const show = async (item: Omit<FloatingTextItem, "id">, delay: number) => {
      addFloatingText(item);
      await wait(delay);
    };

    if (sequence === "wishes") {
      setFloatingTexts([]);
      const wishes = [
        ["保佑我考上清华……", "8%", "14%", 24, undefined, 2200],
        ["保佑我这次竞赛拿省一……", "58%", "18%", 24, undefined, 2200],
        ["保佑我上985……", "12%", "38%", 24, undefined, 2200],
        ["保佑我上211……", "62%", "42%", 24, undefined, 2200],
        ["保佑学校高考均分再创新高……", "10%", "62%", 24, undefined, 2800],
        ["保佑我今年升职加薪……", "58%", "64%", 24, undefined, 2200],
        ["保佑我入选优秀教师……", "35%", "28%", 24, undefined, 2200],
        ["保佑我年终KPI达到平均以上……", "34%", "74%", 24, undefined, 2800],
      ] as const;
      for (const [text, x, y, fontSize, width, delay] of wishes) {
        await show({ text, x, y, fontSize, width, variant: "normal" }, delay);
      }
      for (const [text, fontSize, delay] of [["保佑我功成名就……", 42, 2400], ["保佑我功成名就。", 56, 2400], ["保佑我功成名就！", 76, 2800]] as const) {
        const id = addFloatingText({ text, x: "50%", y: "50%", fontSize, variant: "climax" });
        await wait(delay);
        removeFloatingText(id);
      }
      setFloatingTexts([]);
      await wait(500);
      setFloatingTextPerformanceActive(false);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (sequence === "snowball") {
      setFloatingTexts([]);
      const texts = [
        ["神啊！您显灵了！", "10%", "12%", 28, undefined, 2000],
        ["哈哈！我考上了，我考上了！", "58%", "16%", 28, undefined, 2400],
        ["喜报！XX中学高考成绩节节高！", "34%", "28%", 26, undefined, 2600],
        ["不够，还不够，211还不够。我还不够努力，我还不够优秀，他们几个都能考上985，我还可以考得更好，我要复读！", "6%", "42%", 24, "40%", 4800],
        ["不够，还不够。就业市场如此多变，连这些清华北大毕业的还有这么多人失业，为了拿到一份体面的工作，我要考研！……考公考编！他们都说，能上岸的！", "54%", "40%", 24, "40%", 5600],
        ["不够，还不够。学生还不够拼命，我们也不够拼命……也许应该将分层教学实施得更精细，分三个级部，每个级部分两个尖子班……对，两个尖子班，他们不能没有竞争。", "7%", "68%", 24, "43%", 5800],
        ["不够，还不够。这届理科学生一个高二强基保送清华，一个高考考入清华，我看市里最好的高中有三个进了清华；文科只有一个考入北大，但也侥幸……是不是应该把中考录取分数线再提高一点？", "53%", "66%", 24, "42%", 6200],
      ] as const;
      for (const [text, x, y, fontSize, width, delay] of texts) {
        await show({ text, x, y, fontSize, width, variant: "gold" }, delay);
      }
      setFloatingTexts([]);
      setFloatingTextPerformanceActive(false);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    setFloatingTexts([]);
    const backlash = [
      ["满墙的标语和老师日日的鼓励，我知道那多少有些真情实感，但是我为什么这么害怕看到它们？我真的好累，我真的不想再学了，这些东西我真的学不会！可是我也必须‘只要学不死就往死里学’，我不想再复读了，我不想再看到父母那两双失望的眼睛！为什么要逼我？", "5%", "10%", 22, "45%", 7000],
      ["老师你不是说读完高中就解放了吗？为什么到了大学还要再学这些恶心的东西，我真的受够了！为什么现在还要逼我？", "53%", "12%", 22, "41%", 4800],
      ["我曾经以为自己是天之骄子。可被所有人碾压以后，我才发现自己什么都不是。放弃吧，这辈子也就这样了。", "8%", "42%", 22, "39%", 4600],
      ["读完研还是找不到工作……什么上岸？哈哈……", "60%", "40%", 24, "30%", 3400],
      ["我究竟还要哄骗这些孩子多久？为了让他们高考全力以赴，这种洗脑究竟正确吗？但是，这也是为了他们好啊。", "6%", "68%", 22, "42%", 5000],
      ["这次体检报告已经有三个危险指标了。为了这份工作，我这么拼命，真的值得吗？", "56%", "62%", 22, "36%", 4200],
      ["隔壁班的黄老师突发心脏病，在讲台上就……诶，她才40多岁啊。", "34%", "82%", 22, "44%", 4200],
    ] as const;
    for (const [text, x, y, fontSize, width, delay] of backlash) {
      await show({ text, x, y, fontSize, width, variant: "backlash" }, delay);
    }
    setFloatingTexts([]);
    setFloatingTextPerformanceActive(false);
    dispatch({ type: "GO_NEXT", nextSceneId });
  }, [addFloatingText, removeFloatingText]);

  const fillClassroomSeats = useCallback((exclude: string[], includeSpawns: string[] = [], includeOnly = false) => {
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
          "spawn_spawn_258",
          "spawn_spawn_246",
          "spawn_spawn_247",
          "spawn_spawn_248",
          "spawn_spawn_249",
          "spawn_spawn_250",
          "spawn_spawn_251",
          "spawn_spawn_252",
          "spawn_spawn_253",
        ],
        includeSpawns,
        includeOnly,
        framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
      },
    });
  }, []);

  const fillMorningClassroomSeats = useCallback(() => {
    const occupiedSpawns = new Set([
      "spawn_spawn_117",
      "spawn_spawn_127",
      "spawn_spawn_132",
      "spawn_spawn_145",
      "spawn_spawn_156",
      "spawn_spawn_258",
      "spawn_spawn_246",
      "spawn_spawn_247",
      "spawn_spawn_248",
      "spawn_spawn_249",
      "spawn_spawn_250",
      "spawn_spawn_251",
      "spawn_spawn_252",
      "spawn_spawn_253",
    ]);
    const candidates = Array.from({ length: 41 }, (_, index) => `spawn_spawn_${115 + index}`)
      .filter((spawnId) => !occupiedSpawns.has(spawnId));
    const selected = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
    fillClassroomSeats(Array.from(occupiedSpawns), selected, true);
  }, [fillClassroomSeats]);

  const enterClassroomScene = useCallback((spawnId: string, sceneId: string, setup?: () => void, fallbackPlayerState?: string) => {
    changeMapForScene("classroom", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setup?.();
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterClassroomFreeScene = useCallback((spawnId: string, sceneId: string, setup?: () => void, fallbackPlayerState?: string) => {
    changeMapForScene("classroom", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setup?.();
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }, 700);
  }, [changeMapForScene]);

  const setupMorningClassroom = useCallback(() => {
    fillMorningClassroomSeats();
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
  }, [fillMorningClassroomSeats]);

  const setupLessonClassroom = useCallback((teacherKey = "npc_teacher_li", teacherFrames = "teacher_frames") => {
    fillClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: teacherKey, scale: 0.75, framesPrefix: teacherFrames } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: teacherKey, direction: "down" } });
  }, [fillClassroomSeats]);

  const setupLunchClassroom = useCallback(() => {
    fillClassroomSeats(["spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_132", "spawn_spawn_145"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
  }, [fillClassroomSeats]);

  const enterGateScene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("gate", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "left" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_166", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "left" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterWangGalleryScene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("wang_gallery", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_45", npcKey: "npc_wang_teacher", scale: 0.75, framesPrefix: "wql_frames", pose: "sit", direction: "right" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_46", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames", pose: "sit", direction: "left" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterTeacherOfficeScene = useCallback((sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("teacher_office", "spawn_spawn_35", sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_36", npcKey: "npc_teacher", scale: 0.75, framesPrefix: "teacher_frames", pose: "sit", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_37", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_teacher", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "back" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterGateNightScene = useCallback((sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("gate_night", "spawn_spawn_176", sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      const reservedSpawns = new Set([
        "spawn_spawn_171",
        "spawn_spawn_172",
        "spawn_spawn_173",
        "spawn_spawn_174",
        "spawn_spawn_175",
        "spawn_spawn_176",
      ]);
      const gateSpawnCandidates = Array.from(
        { length: 21 },
        (_, index) => `spawn_spawn_${164 + index}`,
      ).filter((spawnId) => !reservedSpawns.has(spawnId));
      const randomGateSpawns = [...gateSpawnCandidates]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      const directions = ["front", "back", "left", "right"];

      randomGateSpawns.forEach((spawnId, index) => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "spawn_npc",
          payload: {
            spawnId,
            npcKey: `npc_gate_passerby_${index}`,
            scale: 0.75,
            framesPrefix: index % 2 === 0 ? "npc_female1_frames" : "npc_male_frames",
            direction: directions[Math.floor(Math.random() * directions.length)],
          },
        });
      });

      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_174", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_175", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "back" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhouqirui", direction: "back" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: { path: ["spawn_spawn_173"], direction: "back", standAfter: true, freezeAfter: true, speed: 120 },
      });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_liuyu", path: ["spawn_spawn_171"], direction: "back", speed: 120 },
      });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_zhouqirui", path: ["spawn_spawn_172"], direction: "back", speed: 120 },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId });
      }, 1800);
    }, 700);
  }, [changeMapForScene]);

  const setupClass3 = useCallback(() => {
    fillClassroomSeats(
      ["spawn_spawn_279", "spawn_spawn_126"],
      ["spawn_spawn_251", "spawn_spawn_256", "spawn_spawn_261", "spawn_spawn_266", "spawn_spawn_271", "spawn_spawn_277", "spawn_spawn_282"],
    );
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_126", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhoujunxiu", direction: "up" } });
  }, [fillClassroomSeats]);

  const enterClass3Scene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("classroom_3", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setupClass3();
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene, setupClass3]);

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

      {demoPortraitGenerating && (
        <div className="demo-portrait-generating">
          <div className="demo-portrait-generating-text">正在生成阶段人格画像……</div>
        </div>
      )}

      {aiSceneLoadingId && (
        <div className="ai-scene-generating">
          <div className="ai-scene-generating-text">正在生成动态剧情……</div>
        </div>
      )}

      {/* ── 第六章奔回本班倒计时 ── */}
      {corridorCountdown !== null && (
        <div
          style={{
            position: "absolute",
            zIndex: 45,
            top: 22,
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 104,
            padding: "8px 18px",
            border: "2px solid rgba(255,255,255,0.85)",
            borderRadius: 8,
            background: "rgba(10, 10, 14, 0.78)",
            color: corridorCountdown <= 5 ? "#ff5252" : "#fff",
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 2px 6px #000",
            pointerEvents: "none",
          }}
        >
          {corridorCountdown}
        </div>
      )}

      {/* ── 屏幕文字演出层 ── */}
      {floatingTexts.length > 0 && (
        <div className="floating-text-layer">
          {floatingTexts.map(item => (
            <div
              key={item.id}
              className={`floating-text ${item.variant ?? "normal"}`}
              style={{
                left: item.x,
                top: item.y,
                fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                width: item.width,
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {/* ── 手机群聊演出层 ── */}
      {dialogScene?.phoneChat && (
        <PhoneChatOverlay
          key={dialogScene.id}
          sceneId={dialogScene.id}
          chat={dialogScene.phoneChat}
          onComplete={() => setCompletedPhoneChats(prev => ({ ...prev, [dialogScene.id]: true }))}
        />
      )}

      {/* ── 对话叠层 ── */}
      {dialogScene && dialogScene.cgMode && (
        <CgOverlay
          scene={dialogScene}
          onNext={handleNext}
          onChoose={handleChoose}
          hideUi={floatingTextPerformanceActive || aiSceneIsLoading}
          centerImageSrc={dialogScene.id === "ch8_demo_ending" ? demoPortrait?.imageDataUrl : undefined}
          preserveForPerformance={[
            "ch6_ritual_wishes",
            "ch6_ritual_desire_snowball",
            "ch6_ritual_backlash",
          ].includes(dialogScene.id)}
        />
      )}
      {dialogScene && !floatingTextPerformanceActive && !aiSceneIsLoading && !dialogScene.cgMode && (
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
          key={finalSaveRequired ? "final-save" : "game-menu"}
          state={state}
          onClose={() => setGameMenuOpen(false)}
          onLoadState={(loaded) => restoreLoadedGame(loaded, true)}
          onRestart={handleRestart}
          onExitToTitle={handleExitToTitle}
          onShowBacklog={() => setShowBacklog(true)}
          onShowNotebook={() => setShowNotebookToast(true)}
          dialogPreview={dialogPreview}
          initialPage={finalSaveRequired ? "save" : "main"}
          forceSave={finalSaveRequired}
          onSaveComplete={finalSaveRequired ? () => {
            setFinalSaveRequired(false);
            setGameMenuOpen(false);
            setGamePhase("menu");
          } : undefined}
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
