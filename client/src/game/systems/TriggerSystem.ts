import Phaser from "phaser";
import { gameBridge } from "../bridge/GameBridge";

interface TriggerConfig {
  type: string;       // "walk" | "interact" | "auto" | "door" | "dialogue" | "item"
  sceneId?: string;
  targetMap?: string;
  spawnId?: string;
  itemId?: string;
  requireFlag?: string;
  setFlag?: string;
  once?: boolean;
}

interface Trigger {
  zone: Phaser.GameObjects.Zone;
  config: TriggerConfig;
  triggered: boolean;
}

export class TriggerSystem {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Sprite;
  private triggers: Trigger[] = [];
  private enabled = true;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.player = player;
  }

  registerTrigger(zone: Phaser.GameObjects.Zone, config: TriggerConfig) {
    this.triggers.push({ zone, config, triggered: false });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /** 重置所有触发器（地图切换时调用） */
  reset() {
    this.triggers = [];
  }

  update() {
    if (!this.enabled) return;

    for (const trigger of this.triggers) {
      // 一次性触发：已触发则跳过
      if (trigger.config.once && trigger.triggered) continue;

      // 检查前置条件 flag
      if (trigger.config.requireFlag) {
        const flags = gameBridge.gameState?.flags || {};
        if (!flags[trigger.config.requireFlag]) continue;
      }

      // 检查玩家是否在触发区内
      const zone = trigger.zone;
      const body = zone.body as Phaser.Physics.Arcade.StaticBody;
      const inZone =
        this.player.x >= body.x &&
        this.player.x <= body.x + body.width &&
        this.player.y >= body.y &&
        this.player.y <= body.y + body.height;

      // 玩家离开区域后重置触发状态，允许下次进入再次触发
      if (!inZone) {
        trigger.triggered = false;
        continue;
      }

      // 已触发且玩家仍在区域内：跳过（防止每帧重复触发）
      if (trigger.triggered) continue;

      // walk 类型：自动触发
      // interact 类型：需要 E 键（由 InteractionSystem 处理）
      if (trigger.config.type !== "walk" && trigger.config.type !== "auto") {
        continue;
      }

      trigger.triggered = true;

      switch (trigger.config.type) {
        case "walk":
        case "auto":
          if (trigger.config.targetMap) {
            // 门触发：切换地图
            gameBridge.sendToReact({
              type: "TRIGGER_DOOR",
              targetMap: trigger.config.targetMap,
              spawnId: trigger.config.spawnId || "",
            });
          } else if (trigger.config.sceneId) {
            // 剧情触发：进入叙事模式
            gameBridge.sendToReact({
              type: "TRIGGER_DIALOGUE",
              sceneId: trigger.config.sceneId,
              mapId: (this.scene.registry.get("currentMapId") as string) || "",
            });
          }
          break;
      }
    }
  }
}
