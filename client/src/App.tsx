import { useEffect, useReducer, useState } from "react";
import { scenes } from "./data/scenes";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import { saveGame, loadGame, clearSave } from "./engine/save";
import { VisualNovel } from "./components/VisualNovel";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import type { AITrace, Choice } from "./types/game";
import "./styles/global.css";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isAIWorking, setIsAIWorking] = useState(false);
  const currentScene = scenes[state.currentSceneId];

  useEffect(() => {
    saveGame(state);
  }, [state]);

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
      } catch (error) {
        addAITrace("choice_analysis", {
          error: "AI 分析失败。请确认 server 是否运行。",
        });
      } finally {
        setIsAIWorking(false);
      }
    }
  }

  function handleNext(nextSceneId: string) {
    dispatch({ type: "GO_NEXT", nextSceneId });
  }

  async function handleAIEvent() {
    if (!currentScene?.aiEvent) return;

    setIsAIWorking(true);
    try {
      if (currentScene.aiEvent === "npc_dialogue") {
        const result = await generateNpcDialogue(state, currentScene.character ?? "unknown");
        addAITrace("npc_dialogue", result);
      }

      if (currentScene.aiEvent === "ending_judge") {
        const result = await judgeEnding(state);
        addAITrace("ending_judge", result);
      }
    } catch {
      addAITrace(currentScene.aiEvent, {
        error: "AI 事件执行失败。请确认 server 是否运行。",
      });
    } finally {
      setIsAIWorking(false);
    }
  }

  function handleLoad() {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: "LOAD", state: saved });
    }
  }

  function handleReset() {
    clearSave();
    dispatch({ type: "RESET" });
  }

  if (!currentScene) {
    return <div className="error-page">剧情节点不存在：{state.currentSceneId}</div>;
  }

  return (
    <div>
      <div className="top-bar">
        <button onClick={handleLoad}>读取存档</button>
        <button onClick={handleReset}>重新开始</button>
        {isAIWorking && <span className="ai-working">AI 分析中...</span>}
      </div>

      <VisualNovel
        scene={currentScene}
        onNext={handleNext}
        onChoose={handleChoose}
        onAIEvent={handleAIEvent}
      />

      <StatusPanel state={state} />
      <AITracePanel traces={state.aiTraces} />
    </div>
  );
}
