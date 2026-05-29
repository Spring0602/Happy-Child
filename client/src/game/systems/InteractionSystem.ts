import Phaser from "phaser";
import { gameBridge } from "../bridge/GameBridge";

interface Interactable {
  x: number;
  y: number;
  type: "npc" | "item" | "door";
  id: string;
  sceneId?: string;
  targetMap?: string;
  spawnId?: string;
  sitAction?: boolean;
  sitInFront?: boolean;
  chairY?: number;
}

export class InteractionSystem {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Sprite;
  private interactables: Interactable[] = [];
  private interactKey: Phaser.Input.Keyboard.Key | null = null;
  private interactRadius = 48;
  private interactHint: Phaser.GameObjects.Text | null = null;
  private onSitCallback: ((chairY: number, sitInFront: boolean) => void) | null = null;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.player = player;
    this.initKey();
  }

  /** 安全初始化交互键（E） */
  private initKey() {
    const kb = this.scene.input.keyboard;
    if (!kb) {
      this.scene.time.delayedCall(500, () => this.initKey());
      return;
    }
    try {
      this.interactKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    } catch (err) {
      console.error("[InteractionSystem] E 键绑定失败:", err);
      this.scene.time.delayedCall(500, () => this.initKey());
    }
  }

  /** 注册坐下回调（由 MapScene 调用） */
  setOnSit(callback: (chairY: number, sitInFront: boolean) => void) {
    this.onSitCallback = callback;
  }

  registerInteractable(obj: Interactable) {
    this.interactables.push(obj);
  }

  update() {
    let nearest: Interactable | null = null;
    let minDist = this.interactRadius;

    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        obj.x,
        obj.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }

    // 显示/隐藏交互提示
    if (nearest) {
      if (!this.interactHint) {
        this.interactHint = this.scene.add
          .text(0, 0, "[E] 交互", {
            fontSize: "12px",
            color: "#ffff00",
            backgroundColor: "#00000088",
            padding: { x: 4, y: 2 },
          })
          .setDepth(9999)
          .setOrigin(0.5);
      }
      this.interactHint.setPosition(nearest.x, nearest.y - 30);
      this.interactHint.setVisible(true);
    } else {
      this.interactHint?.setVisible(false);
    }

    // E 键触发
    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey) && nearest) {
      // 坐下动作：优先处理，不走对话流程
      if (nearest.sitAction && this.onSitCallback) {
        this.onSitCallback(nearest.chairY ?? nearest.y, nearest.sitInFront ?? true);
        return;
      }
      switch (nearest.type) {
        case "npc":
        case "item":
          gameBridge.sendToReact({
            type: "TRIGGER_DIALOGUE",
            sceneId: nearest.sceneId || nearest.id,
            mapId: (this.scene.registry.get("currentMapId") as string) || "",
          });
          break;
        case "door":
          gameBridge.sendToReact({
            type: "TRIGGER_DOOR",
            targetMap: nearest.targetMap || "",
            spawnId: nearest.spawnId || "",
          });
          break;
      }
    }
  }
}
