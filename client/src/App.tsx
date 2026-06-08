import { useEffect, useReducer, useCallback, useState } from "react";
import { scenes } from "./data/scenes";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import { saveGame, loadGame, clearSave } from "./engine/save";
import { DialogOverlay } from "./components/DialogOverlay";
import { CgOverlay } from "./components/CgOverlay";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { PhaserContainer } from "./components/PhaserContainer";
import { gameBridge } from "./game/bridge/GameBridge";
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import type { AITrace, Choice } from "./types/game";
import "./styles/global.css";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAITrace, setShowAITrace] = useState(false);
  const [eyeOpening, setEyeOpening] = useState(false);

  // 当前对话场景
  const dialogSceneId = state.currentSceneId && scenes[state.currentSceneId]
    ? state.currentSceneId
    : null;
  const dialogScene = dialogSceneId ? scenes[dialogSceneId] : null;

  // 同步 GameBridge
  useEffect(() => {
    saveGame(state);
    gameBridge.gameState = state;
  }, [state]);

  // 监听关闭 AI Trace 面板
  useEffect(() => {
    const onClose = () => setShowAITrace(false);
    window.addEventListener("close-ai-trace", onClose);
    return () => window.removeEventListener("close-ai-trace", onClose);
  }, []);

  // 注：交互类场景（无 nextSceneId/choices/aiEvent/onCgEnd）不自动关闭，
  // 由用户在 DialogOverlay 中按 Space 键后通过 onClose 手动关闭
  // 原来此处有一个 useEffect 自动关闭，导致触发交互后对话框一闪而过

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

  async function handleChoose(choice: Choice) {
    const nextState = gameReducer(state, { type: "CHOOSE", choice });
    dispatch({ type: "CHOOSE", choice });

    // 宿舍第二幕：选择睡觉 → 先触发地图淡出，再延迟显示睡觉对话框
    if (choice.id === "dorm_act2_sleep_now") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      dispatch({ type: "DIALOG_END" }); // 先关闭确认对话框
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_sleep_result" });
      }, 1800);
      return;
    }

    // AI分析静默运行，不通知玩家
    if (choice.needAIAnalysis) {
      try {
        const result = await analyzeChoice(nextState, choice.id);
        // 静默记录，不显示AI工作中状态
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
    // 空 nextSceneId：关闭对话/ CG，解冻玩家
    // 但需检查当前场景的 onCgEnd（CG 结束后的副作用，如地图切换）
    if (!nextSceneId) {
      const currentScene = dialogScene;
      if (currentScene?.onCgEnd) {
        if (currentScene.onCgEnd === "enter_dormitory_playable") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
          return;
        }
        if (currentScene.onCgEnd === "dorm_return_chair_right") {
          // 电脑 CG 结束后 → 站起 + 传送到椅子右侧出生点 + 进入探索
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "return_dormitory") {
          // 阳台心理活动结束 → 停止下雨 + 切换回宿舍spawn_spawn_52出生点 + 冻结玩家 + 弹出宿舍第二幕心理活动
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
          // 宿舍第三幕：起床 CG 结束 → 切换到白天地图 + NPC + 冻结 + 对话
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_stand_chair_right", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_stand_chair_right" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_53", npcKey: "npc_cyh", scale: 2 } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_54", npcKey: "npc_roommateA", scale: 2 } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_55", npcKey: "npc_roommateB", scale: 2 } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_notice_pc" });
          }, 800);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        // 其他 onCgEnd 类型可在此扩展
      }
      // 阳台旁白二结束后 → 冻结玩家 + 延迟弹出心理活动
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

    // 检测 CG 结束后的场景转换效果（在 GO_NEXT 之前执行副作用）
    const nextScene = scenes[nextSceneId];
    if (nextScene?.onCgEnd) {
      if (nextScene.onCgEnd === "enter_dormitory") {
        // CG 结束 → 切换到 dormitory 地图
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_desk", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_desk" });
        // 延迟等地图加载完成 + 淡入完成后执行效果
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
        // 切换到夜晚阳台（balcony_night），启动下雨特效，延迟弹旁白
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        // 启动下雨特效 + 解冻玩家自由探索 + 延迟2s弹出旁白对话框（弹出时冻结玩家）
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
        // CG 结束 → 切换到 dormitory，主角出现在电脑前坐下，显示心理活动对话框
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
        // 延迟等地图加载完成后：坐下 + 弹出心理活动对话框
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
          // 弹出对话框
          dispatch({ type: "DIALOG_START", sceneId: "dorm_cg_end_think" });
        }, 600);
        return;
      }
      if (nextScene.onCgEnd === "dorm_enter_explore") {
        // 心理活动对话框结束 → 屏幕闪现 + 站起 + 传送到椅子右侧 + 进入探索
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          // 解冻玩家，进入自由探索
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        }, 300);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "dorm_return_chair_right") {
        // 电脑 CG 结束后 → 站起 + 传送到椅子右侧出生点 + 进入探索
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        dispatch({ type: "DIALOG_END" });
        return;
      }
    }

    // 检测剧情事件触发
    if (nextSceneId === "ch1_chenyuhao") {
      // 屏幕闪一下 + 玩家站起 + 传送到椅子右边（室友对话后进入白天）
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
      // 进入白天，解冻玩家，允许操控探索
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // 阳台景物描写二：解冻玩家，允许自由走动
    if (nextSceneId === "balcony_night_narrate_2") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // 宿舍第二幕：强制睡觉 → 地图淡出 + 延迟显示睡觉描述
    if (nextSceneId === "dorm_act2_sleep_result") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      setTimeout(() => {
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 1800);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 宿舍第三幕：闹铃音效 ──
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

    // ── 宿舍第三幕：睁眼效果 ──
    if (nextSceneId === "dorm_act3_getup") {
      // 移除 Phaser 侧黑幕，露出后方 CG（天花板.png）
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "remove_fade_overlay" });
      // 播放眨眼动画（React CSS overlay）
      setEyeOpening(true);
      setTimeout(() => setEyeOpening(false), 2000);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // ── 宿舍第三幕：玩家/NPC 动画 ──
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
        // 结局后显示画像和AI分析面板
        dispatch({ type: "ENDING_REACHED" });
      }
    } catch {
      addAITrace(dialogScene.aiEvent, { error: "AI 事件执行失败。" });
    } finally {
      // AI 事件后关闭对话，解冻玩家
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }
  }

  function handleCloseDialog() {
    // 检查当前场景是否有 onCgEnd 副作用需要在关闭前执行
    const currentScene = dialogScene;

    // 阳台旁白二结束后 → 冻结玩家 + 延迟弹出心理活动
    if (currentScene?.id === "balcony_night_narrate_2") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "balcony_night_think" });
      }, 1500);
      return;
    }

    // 宿舍第二幕：心理活动结束 → 解冻玩家，进入自由探索
    if (currentScene?.id === "dorm_act2_think") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // 宿舍第二幕：继续探索分支关闭 → 解冻玩家自由探索
    if (currentScene?.id === "dorm_act2_explore") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2_exploring" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // 宿舍第二幕：睡觉对话框关闭 → 保持黑屏，开始第三幕
    if (currentScene?.id === "dorm_act2_sleep_result") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act3" });
      dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_reflection" });
      return;
    }

    if (currentScene?.onCgEnd) {
      if (currentScene.onCgEnd === "dorm_enter_explore") {
        // 心理活动对话框结束 → 屏幕闪现 + 站起 + 传送到椅子右侧 + 进入探索
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
        // 阳台心理活动结束 → 停止下雨 + 切换回宿舍spawn_spawn_52出生点 + 冻结玩家 + 弹出宿舍第二幕心理活动
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
        // 宿舍第三幕：起床后切换到白天地图 + 生成 NPC + 冻结玩家 + 开始对话
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_stand_chair_right", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_stand_chair_right" });
        setTimeout(() => {
          // 生成 NPC
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_53", npcKey: "npc_cyh", scale: 2 } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_54", npcKey: "npc_roommateA", scale: 2 } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_55", npcKey: "npc_roommateB", scale: 2 } });
          // NPC 初始朝向
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
          // 冻结玩家 + 开始对话
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
    // 宿舍第二幕：拦截特定交互，替换 sceneId
    let actualSceneId = sceneId;
    const isAct2 = state.flags["dorm_act2"];
    const isAct2Exploring = state.flags["dorm_act2_exploring"];

    if (isAct2 || isAct2Exploring) {
      // 电脑交互 → 第二幕专用对话
      if (sceneId === "dorm_interact_pc") {
        actualSceneId = isAct2Exploring ? "dorm_act2_pc_force_sleep" : "dorm_act2_pc_confirm";
      }
      // 时钟交互 → 第二幕时间（04:47）
      if (sceneId === "dorm_interact_clock") {
        actualSceneId = "dorm_act2_clock";
      }
      // 阻止前往阳台（窗户/阳台门），避免跳转回阳台剧情
      if (sceneId === "dorm_go_balcony") {
        actualSceneId = "dorm_act2_no_balcony";
      }
    }

    // 检查场景的 onCgEnd，在对话开始前执行地图切换等副作用
    const scene = scenes[actualSceneId];
    if (scene?.onCgEnd) {
      if (scene.onCgEnd === "enter_balcony") {
        // 切换到夜晚阳台（balcony_night），启动下雨特效，延迟弹旁白
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
      // 其他 onCgEnd 类型可在此扩展
    }
    dispatch({ type: "DIALOG_START", sceneId: actualSceneId });
  }, [state.flags]);

  function handleLoad() {
    const saved = loadGame();
    if (saved) dispatch({ type: "LOAD", state: saved });
  }

  function handleReset() {
    clearSave();
    dispatch({ type: "RESET" });
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* ── 右上角菜单按钮 ── */}
      <div className="menu-button" onClick={() => setMenuOpen(o => !o)}>
        <img src="/assets/ui/菜单图形.png" alt="菜单" className="menu-icon-img" />
      </div>
      {menuOpen && (
        <div className="menu-dropdown">
          <button onClick={() => { handleLoad(); setMenuOpen(false); }}>读取存档</button>
          <button onClick={() => { handleReset(); setMenuOpen(false); }}>重新开始</button>
          {state.aiTraces.length > 0 && (
            <button onClick={() => { setShowAITrace(o => !o); setMenuOpen(false); }}>AI 分析记录</button>
          )}
        </div>
      )}

      {/* ── Phaser 地图（始终可见） ── */}
      <PhaserContainer
        dispatch={dispatch}
        currentMapId={state.currentMapId}
        onDialogueTrigger={handleDialogueTrigger}
      />

      {/* ── 睁眼效果遮罩（宿舍第三幕起床） ── */}
      {eyeOpening && <div className="eye-open-overlay blinking" />}

      {/* ── 对话叠层（有对话时显示） ── */}
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

      {/* ── UI 面板（仅结局后可见） ── */}
      {state.endingReached && <StatusPanel state={state} />}
      {showAITrace && <AITracePanel traces={state.aiTraces} />}
    </div>
  );
}
