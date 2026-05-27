import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { PhaserGameConfig } from "../game/config/PhaserGameConfig";
import { gameBridge } from "../game/bridge/GameBridge";
import type { GameAction } from "../engine/gameReducer";

interface Props {
  dispatch: React.Dispatch<GameAction>;
  currentMapId: string;
  onDialogueTrigger: (sceneId: string) => void;
}

export function PhaserContainer({ dispatch, currentMapId, onDialogueTrigger }: Props) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = PhaserGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    // 监听 Phaser 触发对话 → 打开 DialogOverlay
    gameBridge.onPhaserEvent("TRIGGER_DIALOGUE", (event) => {
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      onDialogueTrigger(event.sceneId);
    });

    // 监听门触发 → 切换地图
    gameBridge.onPhaserEvent("TRIGGER_DOOR", (event) => {
      dispatch({
        type: "CHANGE_MAP",
        mapId: event.targetMap,
        spawnId: event.spawnId,
        position: { x: 0, y: 0 },
      });
      gameBridge.sendToPhaser({
        type: "CHANGE_MAP",
        mapId: event.targetMap,
        spawnId: event.spawnId,
      });
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      gameBridge.removeAllListeners();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
