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
  // 用 ref 保存最新的回调和 dispatch，避免闭包捕获过时引用
  const onDialogueTriggerRef = useRef(onDialogueTrigger);
  const dispatchRef = useRef(dispatch);
  onDialogueTriggerRef.current = onDialogueTrigger;
  dispatchRef.current = dispatch;

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = PhaserGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    // 监听 Phaser → React: 触发对话（npc 或 item 交互）
    gameBridge.onPhaserEvent("TRIGGER_DIALOGUE", (event) => {
      if (event.type !== "TRIGGER_DIALOGUE") return;
      console.log(`[PhaserContainer] 📥 收到 TRIGGER_DIALOGUE: sceneId=${event.sceneId}`);
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      onDialogueTriggerRef.current(event.sceneId);
    });

    // 监听 Phaser → React: item 交互（独立事件，按开发文档 §7.2）
    gameBridge.onPhaserEvent("TRIGGER_ITEM", (event) => {
      if (event.type !== "TRIGGER_ITEM") return;
      console.log(`[PhaserContainer] 📥 收到 TRIGGER_ITEM: itemId=${event.itemId}`);
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      onDialogueTriggerRef.current(event.itemId);
    });

    // 监听门触发 → 切换地图
    gameBridge.onPhaserEvent("TRIGGER_DOOR", (event) => {
      if (event.type !== "TRIGGER_DOOR") return;
      console.log(`[PhaserContainer] 📥 收到 TRIGGER_DOOR: targetMap=${event.targetMap}`);
      dispatchRef.current({
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

    console.log("[PhaserContainer] ✅ Phaser 初始化完成，GameBridge 监听器已注册");

    return () => {
      console.log("[PhaserContainer] 🧹 清理 Phaser ...");
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
