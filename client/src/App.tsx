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

  // 检测对话链结束（无 nextSceneId / choices / aiEvent）→ 关闭对话框
  useEffect(() => {
    if (!dialogScene) return;
    if (!dialogScene.nextSceneId && !dialogScene.choices?.length && !dialogScene.aiEvent) {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }
  }, [dialogScene]);

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
    // 检测 CG 结束后的场景转换效果
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
        dispatch({ type: "CHANGE_MAP", mapId: "balcony", spawnId: "spawn_balcony_entrance", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony", spawnId: "spawn_balcony_entrance" });
        dispatch({ type: "GO_NEXT", nextSceneId });
        return;
      }
      if (nextScene.onCgEnd === "enter_dormitory_playable") {
        // CG 结束 → 切换到 dormitory 地图，玩家可操控，走向窗户交互进入阳台
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_dorm_entrance", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_dorm_entrance" });
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
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
    dispatch({ type: "DIALOG_END" });
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  const handleDialogueTrigger = useCallback((sceneId: string) => {
    dispatch({ type: "DIALOG_START", sceneId });
  }, []);

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
