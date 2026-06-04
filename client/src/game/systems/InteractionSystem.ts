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
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactRadius = 48;
  private interactHint: Phaser.GameObjects.Text | null = null;
  private onSitCallback: ((chairY: number, sitInFront: boolean) => void) | null = null;
  private _loggedKeys = false;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.player = player;
    // 确保键盘 input 可用
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      console.error("[InteractionSystem] ❌ keyboard 不可用！");
      return;
    }
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    // 双重监听：JustDown（帧检测）+ Key.on('down')（事件检测，更可靠）
    this.interactKey.on("down", () => {
      this._triggerInteract();
    });
    console.log("[InteractionSystem] ✅ 初始化完成，E 键已注册（JustDown + Key.on('down')）");
  }

  /** 注册坐下回调（由 MapScene 调用） */
  setOnSit(callback: (chairY: number, sitInFront: boolean) => void) {
    this.onSitCallback = callback;
  }

  registerInteractable(obj: Interactable) {
    this.interactables.push(obj);
    console.log(`[InteractionSystem] 📍 注册可交互: ${obj.id} (${obj.type}) at (${obj.x}, ${obj.y})`);
  }

  /** 找到最近的交互对象 */
  private findNearest(): Interactable | null {
    let nearest: Interactable | null = null;
    let minDist = this.interactRadius;

    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, obj.x, obj.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }
    return nearest;
  }

  update() {
    // 首次记录调试信息
    if (!this._loggedKeys) {
      console.log(`[InteractionSystem] 🔑 已注册交互对象数: ${this.interactables.length}`);
      console.log(`[InteractionSystem] 🎮 玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}), 交互半径: ${this.interactRadius}`);
      this._loggedKeys = true;
    }

    const nearest = this.findNearest();

    // 显示/隐藏交互提示
    if (nearest) {
      if (!this.interactHint) {
        this.interactHint = this.scene.add
          .text(0, 0, "[E] 交互", {
            fontSize: "16px",
            fontFamily: "Arial",
            color: "#ffff00",
            backgroundColor: "#000000aa",
            padding: { x: 6, y: 3 },
          })
          .setDepth(9999)
          .setOrigin(0.5);
        console.log("[InteractionSystem] 💬 交互提示文本已创建");
      }
      this.interactHint.setPosition(nearest.x, nearest.y - 60);
      this.interactHint.setVisible(true);
    } else {
      this.interactHint?.setVisible(false);
    }
  }

  /** 实际触发交互（由 JustDown 或 keyboard.on('keydown-E') 调用） */
  private _triggerInteract() {
    const nearest = this.findNearest();
    if (!nearest) return;

    console.log(`[InteractionSystem] 🎯 E 键触发交互: id=${nearest.id}, type=${nearest.type}, sitAction=${nearest.sitAction}`);

    // 坐下动作：优先处理，不走对话流程
    if (nearest.sitAction && this.onSitCallback) {
      console.log(`[InteractionSystem] 🪑 触发坐下: chairY=${nearest.chairY}, sitInFront=${nearest.sitInFront}`);
      this.onSitCallback(nearest.chairY ?? nearest.y, nearest.sitInFront ?? true);
      return;
    }

    const mapId = (this.scene.registry.get("currentMapId") as string) || "";

    switch (nearest.type) {
      case "npc":
        console.log(`[InteractionSystem] → TRIGGER_DIALOGUE (npc): ${nearest.sceneId || nearest.id}`);
        gameBridge.sendToReact({
          type: "TRIGGER_DIALOGUE",
          sceneId: nearest.sceneId || nearest.id,
          mapId,
        });
        break;
      case "item":
        console.log(`[InteractionSystem] → TRIGGER_DIALOGUE (item): ${nearest.sceneId || nearest.id}`);
        // 按开发文档 v1.0 §7.2：item 类型发送 TRIGGER_DIALOGUE（统一走对话叠层）
        gameBridge.sendToReact({
          type: "TRIGGER_DIALOGUE",
          sceneId: nearest.sceneId || nearest.id,
          mapId,
        });
        break;
      case "door":
        console.log(`[InteractionSystem] → TRIGGER_DOOR: ${nearest.targetMap}`);
        gameBridge.sendToReact({
          type: "TRIGGER_DOOR",
          targetMap: nearest.targetMap || "",
          spawnId: nearest.spawnId || "",
        });
        break;
    }
  }
}
