import { useEffect, useReducer, useState, useCallback } from "react";
import { scenes } from "./data/scenes";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import { saveGame, loadGame, clearSave } from "./engine/save";
import { DialogOverlay } from "./components/DialogOverlay";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { PhaserContainer } from "./components/PhaserContainer";
import { gameBridge } from "./game/bridge/GameBridge";
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import type { AITrace, Choice } from "./types/game";
import "./styles/global.css";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isAIWorking, setIsAIWorking] = useState(false);

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

    if (choice.needAIAnalysis) {
      setIsAIWorking(true);
      try {
        const result = await analyzeChoice(nextState, choice.id);
        addAITrace("choice_analysis", result);
      } catch {
        addAITrace("choice_analysis", { error: "AI 分析失败。请确认 server 是否运行。" });
      } finally {
        setIsAIWorking(false);
      }
    }
  }

  function handleNext(nextSceneId: string) {
    dispatch({ type: "GO_NEXT", nextSceneId });
  }

  async function handleAIEvent() {
    if (!dialogScene?.aiEvent) return;
    setIsAIWorking(true);
    try {
      if (dialogScene.aiEvent === "npc_dialogue") {
        const result = await generateNpcDialogue(state, dialogScene.character ?? "unknown");
        addAITrace("npc_dialogue", result);
      }
      if (dialogScene.aiEvent === "ending_judge") {
        const result = await judgeEnding(state);
        addAITrace("ending_judge", result);
      }
    } catch {
      addAITrace(dialogScene.aiEvent, { error: "AI 事件执行失败。" });
    } finally {
      setIsAIWorking(false);
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
      {/* ── 顶部工具栏 ── */}
      <div className="top-bar">
        <button onClick={handleLoad}>读取存档</button>
        <button onClick={handleReset}>重新开始</button>
        {isAIWorking && <span className="ai-working">AI 分析中...</span>}
      </div>

      {/* ── Phaser 地图（始终可见） ── */}
      <PhaserContainer
        dispatch={dispatch}
        currentMapId={state.currentMapId}
        onDialogueTrigger={handleDialogueTrigger}
      />

      {/* ── 对话叠层（有对话时显示） ── */}
      {dialogScene && (
        <DialogOverlay
          scene={dialogScene}
          onNext={handleNext}
          onChoose={handleChoose}
          onAIEvent={handleAIEvent}
          onClose={handleCloseDialog}
        />
      )}

      {/* ── UI 面板（始终可见） ── */}
      <StatusPanel state={state} />
      <AITracePanel traces={state.aiTraces} />
    </div>
  );
}
