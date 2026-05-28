import { useEffect, useReducer, useState, useCallback, useRef } from "react";
import { scenes } from "./data/scenes";
import { endings } from "./data/endings";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import { saveGame, loadGame, clearSave } from "./engine/save";
import { VisualNovel } from "./components/VisualNovel";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { EndingDisplay } from "./components/EndingDisplay";
import { analyzeChoice, generateNpcDialogue, judgeEnding } from "./services/aiClient";
import { MAP_REGISTRY, STARTING_MAP, type MapNPCData, type MapItemData } from "./game/mapData";
import { worldRules } from "./data/rules";
import type { AITrace, Choice, EndingCard, GameMode, ExplorationState, GameState } from "./types/game";
import "./styles/global.css";

/** 初始化一张地图的已探索瓦片矩阵 */
function initVisitedTiles(mapId: string): boolean[][] {
  const map = MAP_REGISTRY[mapId];
  if (!map) return [];
  const h = map.tiles.length;
  const w = map.tiles[0]?.length ?? 0;
  return Array.from({ length: h }, () => Array(w).fill(false));
}

/** 标记玩家周围瓦片为已探索 */
function markExploredRadially(
  tiles: boolean[][],
  mapId: string,
  cx: number,
  cy: number,
  radius = 5,
): { tiles: boolean[][]; added: number } {
  const map = MAP_REGISTRY[mapId];
  if (!map) return { tiles, added: 0 };
  const h = map.tiles.length;
  const w = map.tiles[0]?.length ?? 0;
  const newTiles = tiles.map(row => [...row]);
  let added = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx >= 0 && tx < w && ty >= 0 && ty < h && !newTiles[ty][tx]) {
        newTiles[ty][tx] = true;
        added++;
      }
    }
  }
  return { tiles: newTiles, added };
}

/** 本地结局裁决：根据特质匹配最佳结局 */
function getLocalEnding(state: GameState) {
  const t = state.traits;

  // 按结局层级优先级评估
  const checks = [
    {
      id: "good_child",
      test: () => t.truthDesire <= 0 && t.authorityResistance <= 0,
    },
    {
      id: "bad_child",
      test: () => t.authorityResistance > 3 && t.realityJudgment < 0 && t.empathy < 0,
    },
    {
      id: "bystander",
      test: () => t.realityJudgment > 2 && t.authorityResistance < 0 && t.trust < -1,
    },
    {
      id: "savior_delusion",
      test: () => t.empathy > 3 && t.realityJudgment < 1 && t.authorityResistance > 2,
    },
    {
      id: "hole_maker",
      test: () => t.authorityResistance > 2 && t.realityJudgment > 2 && t.joyPerception > 2,
    },
    {
      id: "happy_child",
      test: () => t.joyPerception > 3 && t.empathy > 3 && t.trust > 1 && t.truthDesire > 1,
    },
  ];

  for (const check of checks) {
    if (check.test()) {
      return endings[check.id] ?? endings["good_child"];
    }
  }

  // 无明确匹配时找"最接近"的结局
  let best = "hole_maker";
  let bestScore = -Infinity;
  for (const [id, ending] of Object.entries(endings)) {
    if (!ending.hint) continue;
    const score = evalHintScore(ending.hint, t);
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return endings[best] ?? endings["good_child"];
}

/** 打分式匹配：将 hint 条件转化为分数 */
function evalHintScore(hint: string, t: GameState["traits"]): number {
  let score = 0;
  const clauses = hint.split("&&").map(s => s.trim());
  for (const clause of clauses) {
    const parts = clause.split(/\s+/);
    if (parts.length !== 3) continue;
    const trait = parts[0];
    const op = parts[1];
    const val = parseFloat(parts[2]);
    if (!(trait in t) || isNaN(val)) continue;
    const actual = t[trait as keyof typeof t];

    if (op === ">" && actual > val) score += 2;
    else if (op === "<" && actual < val) score += 2;
    else if (op === "<=" && actual <= val) score += 2;
    else if (op === ">=" && actual >= val) score += 2;
    else score -= 1; // 条件不满足，扣分
  }
  return score;
}

/** 获取当前地图所属区域的规则（根据游戏状态动态切换） */
function getAreaRules(mapId: string, rebellion?: number, sceneId?: string): string[] {
  const familyMaps = ["bedroom", "livingroom", "bathroom"];
  const schoolMaps = ["classroom", "corridor", "wang_gallery", "classroom_3", "rooftop"];

  // 学校区域：若叛逆值 ≥ 50 且已触发过规则删除相关场景，展示修复后规则
  if (schoolMaps.includes(mapId) && rebellion !== undefined && rebellion >= 50) {
    // 检查是否已经过了规则删除的场景
    const rebootScenes = ["ch6_delete_rule", "ch6_no_delete", "ch7_wake_family"];
    if (sceneId && rebootScenes.some(s => sceneId.includes(s))) {
      return worldRules.schoolAreaReboot;
    }
    return worldRules.schoolArea;
  }

  if (familyMaps.includes(mapId)) return worldRules.familyArea;
  if (schoolMaps.includes(mapId)) return worldRules.schoolArea;
  return [];
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [gameMode, setGameMode] = useState<GameMode>("map");
  const [currentMapId, setCurrentMapId] = useState(STARTING_MAP);
  const [currentSpawnKey, setCurrentSpawnKey] = useState("default");
  const [isAIWorking, setIsAIWorking] = useState(false);
  const [endingResult, setEndingResult] = useState<EndingCard | null>(null);

  const currentScene = scenes[state.currentSceneId];
  const currentMap = MAP_REGISTRY[currentMapId] ?? MAP_REGISTRY[STARTING_MAP];

  // 初始化探索状态（首次进入地图时）
  useEffect(() => {
    if (!state.exploreState.visitedTiles[currentMapId]) {
      const newTiles = initVisitedTiles(currentMapId);
      dispatch({
        type: "UPDATE_EXPLORE",
        exploreState: {
          ...state.exploreState,
          visitedTiles: { ...state.exploreState.visitedTiles, [currentMapId]: newTiles },
        },
      });
    }
  }, [currentMapId]);

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
    if (!currentScene?.aiEvent) return;
    setIsAIWorking(true);
    try {
      if (currentScene.aiEvent === "npc_dialogue") {
        const result = await generateNpcDialogue(state, currentScene.character ?? "unknown");
        addAITrace("npc_dialogue", result);
      }
      if (currentScene.aiEvent === "ending_judge") {
        try {
          const result = await judgeEnding(state);
          addAITrace("ending_judge", result);
          // 提取结局数据
          const endingId = (result as any)?.endingId ?? "hole_maker";
          const matched = endings[endingId] ?? endings["hole_maker"];
          setEndingResult(matched);
        } catch {
          // AI 不可用时，使用本地特质匹配
          const match = getLocalEnding(state);
          addAITrace("ending_judge", {
            source: "local_fallback",
            endingId: match.id,
            endingTitle: match.title,
            endingDesc: match.description,
            monologue: match.monologue,
            note: "AI服务器不可用，使用本地特质判定",
          });
          setEndingResult(match);
        }
      }
    } catch {
      if (currentScene.aiEvent === "ending_judge") {
        const match = getLocalEnding(state);
        addAITrace("ending_judge", {
          source: "local_fallback",
          endingId: match.id,
          endingTitle: match.title,
          endingDesc: match.description,
          monologue: match.monologue,
          note: "AI事件执行异常，使用本地特质判定",
        });
        setEndingResult(match);
      } else {
        addAITrace(currentScene.aiEvent, { error: "AI 事件执行失败。请确认 server 是否运行。" });
      }
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
    setCurrentMapId(STARTING_MAP);
    setCurrentSpawnKey("default");
    setGameMode("map");
    setEndingResult(null);
  }

  // 地图 NPC 交互 → 进入剧情
  const handleNPCInteract = useCallback((npc: MapNPCData) => {
    dispatch({ type: "GO_NEXT", nextSceneId: npc.sceneTriggerId });
    setGameMode("story");
  }, []);

  // 地图调查点交互 → 进入剧情
  const handleItemInvestigate = useCallback((item: MapItemData) => {
    if (item.sceneTriggerId) {
      dispatch({ type: "GO_NEXT", nextSceneId: item.sceneTriggerId });
      setGameMode("story");
    }
  }, []);

  // 触发区自动触发 → 进入剧情
  const handleTriggerActivate = useCallback((_triggerId: string, sceneId: string) => {
    dispatch({ type: "GO_NEXT", nextSceneId: sceneId });
    setGameMode("story");
  }, []);

  // 门切换地图
  const handleChangeMap = useCallback((targetMap: string, targetSpawn: string) => {
    const map = MAP_REGISTRY[targetMap];
    if (!map) return;

    setCurrentSpawnKey(targetSpawn);
    setCurrentMapId(targetMap);
    setGameMode("map");
  }, []);

  // 探索进度更新：标记玩家周围瓦片（使用 ref 获取最新状态）
  const stateRef = useRef(state);
  const mapIdRef = useRef(currentMapId);
  stateRef.current = state;
  mapIdRef.current = currentMapId;

  const handleExploreUpdate = useCallback((tileX: number, tileY: number) => {
    const s = stateRef.current;
    const mapId = mapIdRef.current;
    const visited = s.exploreState.visitedTiles[mapId];
    if (!visited) return;

    const { tiles: newTiles, added } = markExploredRadially(visited, mapId, tileX, tileY);
    if (added === 0) return;

    const newMaps = s.exploreState.visitedMaps.includes(mapId)
      ? s.exploreState.visitedMaps
      : [...s.exploreState.visitedMaps, mapId];

    const newExploreState: ExplorationState = {
      ...s.exploreState,
      visitedMaps: newMaps,
      visitedTiles: { ...s.exploreState.visitedTiles, [mapId]: newTiles },
      totalExplored: s.exploreState.totalExplored + added,
    };
    dispatch({ type: "UPDATE_EXPLORE", exploreState: newExploreState });
  }, []);

  // 剧情返回地图
  const handleReturnToMap = useCallback(() => {
    const scene = scenes[state.currentSceneId];
    if (scene?.mapId && MAP_REGISTRY[scene.mapId]) {
      setCurrentMapId(scene.mapId);
      setCurrentSpawnKey("default");
    }
    setGameMode("map");
  }, [state.currentSceneId]);

  // 手动切换模式
  function toggleMode() {
    setGameMode((prev) => (prev === "map" ? "story" : "map"));
  }

  if (!currentScene) {
    return <div className="error-page">剧情节点不存在：{state.currentSceneId}</div>;
  }

  // 计算当前出生点坐标
  const spawn = currentMap.spawns[currentSpawnKey] ?? currentMap.spawns["default"] ?? { x: 2, y: 2 };
  const actualMap = { ...currentMap, spawns: { ...currentMap.spawns, default: { ...spawn } } };

  return (
    <div>
      {/* 结局展示 */}
      {endingResult && (
        <EndingDisplay ending={endingResult} state={state} onRestart={handleReset} />
      )}

      <div className="top-bar">
        <button onClick={handleLoad}>读取存档</button>
        <button onClick={handleReset}>重新开始</button>
        <button className={`mode-switch-btn ${gameMode}`} onClick={toggleMode}>
          {gameMode === "map" ? "📖 剧情模式" : "🗺️ 探索地图"}
        </button>
        {isAIWorking && <span className="ai-working">AI 分析中...</span>}
      </div>

      <VisualNovel
        scene={currentScene}
        gameMode={gameMode}
        currentMap={actualMap}
        visitedTiles={state.exploreState.visitedTiles[currentMapId] ?? null}
        exploration={state.exploreState.totalExplored}
        areaRules={getAreaRules(currentMapId, state.rebellion, state.currentSceneId)}
        onNext={handleNext}
        onChoose={handleChoose}
        onAIEvent={handleAIEvent}
        onNPCInteract={handleNPCInteract}
        onItemInvestigate={handleItemInvestigate}
        onTriggerActivate={handleTriggerActivate}
        onChangeMap={handleChangeMap}
        onReturnToMap={handleReturnToMap}
        onExploreUpdate={handleExploreUpdate}
      />

      <StatusPanel state={state} />
      <AITracePanel traces={state.aiTraces} />

      {/* 叛逆值暗角覆盖 */}
      <div
        className={`rebellion-overlay ${
          state.rebellion >= 70 ? "level-high"
          : state.rebellion >= 35 ? "level-medium"
          : "level-low"
        }`}
      />
    </div>
  );
}
