import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { PhaserGameConfig } from "../game/config/PhaserGameConfig";
import { gameBridge } from "../game/bridge/GameBridge";
import type { GameAction } from "../engine/gameReducer";
import type { PhaserToReactEvent } from "../game/types/gameMap";

interface Props {
  dispatch: React.Dispatch<GameAction>;
  currentMapId: string;
  onDialogueTrigger: (sceneId: string) => void;
}

export function PhaserContainer({ dispatch, currentMapId: _currentMapId, onDialogueTrigger }: Props) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = PhaserGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    // 确保游戏画布获得键盘焦点 — 点击画布时自动聚焦
    const handleFocus = () => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        (canvas as HTMLElement).focus();
        (canvas as HTMLElement).setAttribute("tabindex", "0");
      }
    };

    // 延迟聚焦（等待 Phaser 完成初始化）
    const timer = setTimeout(handleFocus, 1000);
    containerRef.current.addEventListener("click", handleFocus);
    containerRef.current.addEventListener("touchstart", handleFocus, { passive: true });

    // 监听 Phaser 触发对话 → 打开 DialogOverlay
    gameBridge.onPhaserEvent("TRIGGER_DIALOGUE", (raw) => {
      const event = raw as Extract<PhaserToReactEvent, { type: "TRIGGER_DIALOGUE" }>;
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      onDialogueTrigger(event.sceneId);
    });

    // 监听门触发 → 切换地图
    gameBridge.onPhaserEvent("TRIGGER_DOOR", (raw) => {
      const event = raw as Extract<PhaserToReactEvent, { type: "TRIGGER_DOOR" }>;
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
      clearTimeout(timer);
      containerRef.current?.removeEventListener("click", handleFocus);
      containerRef.current?.removeEventListener("touchstart", handleFocus);
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
