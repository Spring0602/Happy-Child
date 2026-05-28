import type { Choice, Scene, GameMode } from "../types/game";
import type { TileMapData, MapNPCData, MapItemData } from "../game/mapData";
import { DialogueBox } from "./DialogueBox";
import { ChoicePanel } from "./ChoicePanel";
import { SceneBackground } from "./SceneBackground";
import { PortraitDisplay } from "./PortraitDisplay";
import { MapView } from "./MapView";

interface Props {
  scene: Scene;
  gameMode: GameMode;
  currentMap: TileMapData;
  visitedTiles: boolean[][] | null;
  exploration: number;
  areaRules?: string[];
  onNext: (nextSceneId: string) => void;
  onChoose: (choice: Choice) => void;
  onAIEvent: () => void;
  onNPCInteract: (npc: MapNPCData) => void;
  onItemInvestigate: (item: MapItemData) => void;
  onTriggerActivate: (triggerId: string, sceneId: string) => void;
  onChangeMap: (targetMap: string, targetSpawn: string) => void;
  onReturnToMap: () => void;
  onExploreUpdate?: (tileX: number, tileY: number) => void;
}

export function VisualNovel({
  scene,
  gameMode,
  currentMap,
  visitedTiles,
  exploration,
  areaRules,
  onNext,
  onChoose,
  onAIEvent,
  onNPCInteract,
  onItemInvestigate,
  onTriggerActivate,
  onChangeMap,
  onReturnToMap,
  onExploreUpdate,
}: Props) {
  const hasChoices = scene.choices && scene.choices.length > 0;

  // ── 地图模式 ──
  if (gameMode === "map") {
    return (
      <div className="vn-root">
        <MapView
          mapData={currentMap}
          visitedTiles={visitedTiles}
          onNPCInteract={onNPCInteract}
          onItemInvestigate={onItemInvestigate}
          onTriggerActivate={onTriggerActivate}
          onChangeMap={onChangeMap}
          onExploreUpdate={onExploreUpdate}
        />
        <div className="map-location-label">{currentMap.name}</div>
        {currentMap.description && (
          <div className="map-description">{currentMap.description}</div>
        )}
        <div className="map-explore-info">
          探索 {exploration} 格 · 已访问 {currentMap.npcs.length + currentMap.items.length} 个互动点
        </div>
        {areaRules && areaRules.length > 0 && (
          <div className="area-rules-panel">
            <div className="area-rules-title">📋 区域规则</div>
            {areaRules.map((rule, i) => (
              <div key={i} className="area-rule-item">• {rule}</div>
            ))}
          </div>
        )}
        <div className="control-hint">
          WASD 移动 · E/Enter 互动 · 靠近门进入新区域
        </div>
      </div>
    );
  }

  // ── 剧情模式 ──
  return (
    <div className="vn-root">
      <SceneBackground src={scene.background} />
      <PortraitDisplay characterId={scene.character} />
      <div className="chapter-badge">{scene.chapter}</div>

      <div className="vn-content">
        <DialogueBox speaker={scene.speaker} text={scene.text} />

        {hasChoices ? (
          <ChoicePanel choices={scene.choices!} onChoose={onChoose} />
        ) : scene.aiEvent ? (
          <button className="next-button" onClick={onAIEvent}>
            启动 AI 分析
          </button>
        ) : scene.nextSceneId ? (
          <button
            className="next-button"
            onClick={() => onNext(scene.nextSceneId!)}
          >
            继续
          </button>
        ) : null}

        {scene.returnToMap && (
          <button
            className="next-button return-map-btn"
            onClick={onReturnToMap}
            style={{ marginTop: hasChoices ? 0 : 12 }}
          >
            🗺️ 返回探索
          </button>
        )}
      </div>
    </div>
  );
}
