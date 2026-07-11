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
  hintText?: string;
}

/** 镜头内：光环动画数据 */
interface GlowIcon {
  container: Phaser.GameObjects.Container;
  tween: Phaser.Tweens.Tween;
  rippleTween: Phaser.Tweens.Tween;
  interactable: Interactable;
}

/** 交互提示标签（带发光背景） */
interface HintLabel {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  tween: Phaser.Tweens.Tween | null;
  currentText: string;
}

/** 镜头外：边缘感叹号 + 方向箭头指引 */
interface EdgeIndicator {
  container: Phaser.GameObjects.Container;
  exclaim: Phaser.GameObjects.Graphics;   // 感叹号
  arrow: Phaser.GameObjects.Graphics;     // 方向箭头
  glowTween: Phaser.Tweens.Tween;         // 呼吸发光
  interactable: Interactable;
}

/** 视口边缘留白（感叹号不贴边） */
const EDGE_MARGIN = 24;

export class InteractionSystem {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Sprite;
  private interactables: Interactable[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactRadius = 48;
  private interactHint: HintLabel | null = null;
  private onSitCallback: ((chairY: number, sitInFront: boolean) => void) | null = null;
  private _loggedKeys = false;
  private enabled = true;

  /** 镜头内光环（每个 interactable 一个） */
  private glowIcons: GlowIcon[] = [];
  /** 镜头外感叹号（每个 interactable 一个，固定在视口边缘） */
  private edgeIndicators: EdgeIndicator[] = [];

  private readonly onInteractKeyDown = () => {
    this._triggerInteract();
  };

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.player = player;
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      console.error("[InteractionSystem] ❌ keyboard 不可用！");
      return;
    }
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on("down", this.onInteractKeyDown);
    console.log("[InteractionSystem] ✅ 初始化完成");
  }

  setOnSit(callback: (chairY: number, sitInFront: boolean) => void) {
    this.onSitCallback = callback;
  }

  registerInteractable(obj: Interactable) {
    this.interactables.push(obj);
    this._createGlowIcon(obj);
    this._createEdgeIndicator(obj);
    console.log(`[InteractionSystem] 📍 注册可交互: ${obj.id} (${obj.type}) at (${obj.x}, ${obj.y})`);
  }

  // ─────────────────────────────────────────────
  //  创建镜头内光环（无感叹号，纯光晕）
  // ─────────────────────────────────────────────
  private _createGlowIcon(obj: Interactable) {
    const scene = this.scene;

    // 外发光圆（大半透明圈）
    const outerGlow = scene.add.graphics();
    outerGlow.fillStyle(0x7ecfff, 0.12);
    outerGlow.fillCircle(0, 0, 22);

    // 主光环
    const ring = scene.add.graphics();
    ring.lineStyle(2, 0x7ecfff, 0.85);
    ring.strokeCircle(0, 0, 13);

    // 内亮环
    const innerRing = scene.add.graphics();
    innerRing.lineStyle(1, 0xc8f0ff, 0.5);
    innerRing.strokeCircle(0, 0, 8);

    // 涟漪圈（从小扩散到大，循环）
    const ripple = scene.add.graphics();
    ripple.lineStyle(1.5, 0x7ecfff, 0.5);
    ripple.strokeCircle(0, 0, 13);

    const container = scene.add.container(obj.x, obj.y - 4, [
      outerGlow,
      ring,
      innerRing,
      ripple,
    ]);
    container.setDepth(9998);

    // 整体呼吸动画（0.88 ↔ 1.12，alpha 0.6 ↔ 1.0）
    const tween = scene.tweens.add({
      targets: container,
      scaleX: { from: 0.88, to: 1.12 },
      scaleY: { from: 0.88, to: 1.12 },
      alpha: { from: 0.6, to: 1.0 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 涟漪独立动画：从 scale=0.6,alpha=0.8 扩散到 scale=1.6,alpha=0
    const rippleTween = scene.tweens.add({
      targets: ripple,
      scaleX: { from: 0.6, to: 1.8 },
      scaleY: { from: 0.6, to: 1.8 },
      alpha: { from: 0.7, to: 0 },
      duration: 1400,
      repeat: -1,
      ease: "Quad.easeOut",
    });

    this.glowIcons.push({ container, tween, rippleTween, interactable: obj });
  }

  // ─────────────────────────────────────────────
  //  创建镜头外指引（感叹号 + 方向箭头）
  // ─────────────────────────────────────────────
  private _createEdgeIndicator(obj: Interactable) {
    const scene = this.scene;

    // ── 感叹号（Graphics 手绘，淡黄发光） ──
    const exclaim = scene.add.graphics();
    this._drawExclaim(exclaim, 1.0);

    // ── 方向箭头（绕感叹号旋转，半径 18px） ──
    const arrow = scene.add.graphics();
    this._drawArrow(arrow);
    // 初始位置：感叹号正上方，角度运行时每帧更新
    arrow.setPosition(0, -18);

    // Container：scrollFactor=0 固定在屏幕坐标
    const container = scene.add.container(0, 0, [exclaim, arrow]);
    container.setDepth(9999);
    container.setScrollFactor(0);
    container.setVisible(false);

    // 整体呼吸发光（alpha 0.55 ↔ 1.0）
    const glowTween = scene.tweens.add({
      targets: container,
      alpha: { from: 0.55, to: 1.0 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.edgeIndicators.push({ container, exclaim, arrow, glowTween, interactable: obj });
  }

  /** 绘制感叹号（淡黄色，有发光） */
  private _drawExclaim(g: Phaser.GameObjects.Graphics, _alpha: number) {
    g.clear();
    // 外发光圆晕
    g.fillStyle(0xffe680, 0.15);
    g.fillCircle(0, 0, 14);
    // 感叹号竖线（圆角矩形）
    g.fillStyle(0xffe566, 1.0);
    g.fillRoundedRect(-2, -9, 4, 9, 2);
    // 感叹号圆点
    g.fillCircle(0, 5, 2.5);
  }

  /** 绘制指向上方的箭头（▲），运行时通过 rotation 控制朝向 */
  private _drawArrow(g: Phaser.GameObjects.Graphics) {
    g.clear();
    // 三角形箭头
    g.fillStyle(0xffe566, 0.95);
    g.fillTriangle(0, -6, -5, 2, 5, 2);
    // 箭头底部小横线（尾翼，更像指针）
    g.lineStyle(1.5, 0xffe566, 0.7);
    g.lineBetween(-4, 3, 4, 3);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.interactHint?.container.setVisible(false);
      for (const icon of this.glowIcons) icon.container.setVisible(false);
      for (const ind of this.edgeIndicators) ind.container.setVisible(false);
    }
  }

  destroy() {
    this.interactKey?.off("down", this.onInteractKeyDown);
    this._destroyHint();
    this.interactHint = null;
    this.interactables = [];
    this.onSitCallback = null;
    for (const icon of this.glowIcons) {
      icon.tween?.destroy();
      icon.rippleTween?.destroy();
      icon.container?.destroy();
    }
    this.glowIcons = [];
    for (const ind of this.edgeIndicators) {
      ind.glowTween?.destroy();
      ind.container?.destroy();
    }
    this.edgeIndicators = [];
  }

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

  /** 判断世界坐标是否在当前相机视口内 */
  private _isInView(worldX: number, worldY: number): boolean {
    const cam = this.scene.cameras.main;
    const margin = 32; // 稍微留一点容差
    return (
      worldX >= cam.scrollX - margin &&
      worldX <= cam.scrollX + cam.width + margin &&
      worldY >= cam.scrollY - margin &&
      worldY <= cam.scrollY + cam.height + margin
    );
  }

  /**
   * 计算视口边缘的指引屏幕坐标（夹在 margin 内侧）并返回指向 trigger 的角度（弧度）
   * angle：从感叹号位置指向 trigger 世界坐标的方向（屏幕坐标系，+X右 +Y下）
   */
  private _clampToEdge(worldX: number, worldY: number): { sx: number; sy: number; angle: number } {
    const cam = this.scene.cameras.main;
    const m = EDGE_MARGIN;

    // 世界坐标 → 屏幕坐标
    const rawSx = (worldX - cam.scrollX) * cam.zoom;
    const rawSy = (worldY - cam.scrollY) * cam.zoom;

    const W = cam.width;
    const H = cam.height;

    // 屏幕中心
    const cx = W / 2;
    const cy = H / 2;

    // 判断是否在屏幕内（有 margin 容差）
    const inside =
      rawSx >= m && rawSx <= W - m &&
      rawSy >= m && rawSy <= H - m;

    if (inside) {
      return { sx: -9999, sy: -9999, angle: 0 };
    }

    // 夹到边缘
    const sx = Phaser.Math.Clamp(rawSx, m, W - m);
    const sy = Phaser.Math.Clamp(rawSy, m, H - m);

    // 箭头角度：从感叹号位置（sx,sy）指向 trigger 屏幕方向
    // 用原始未夹住的屏幕坐标计算方向更准确
    const angle = Math.atan2(rawSy - sy, rawSx - sx);

    return { sx, sy, angle };
  }

  update() {
    if (!this.enabled) {
      this.interactHint?.container.setVisible(false);
      for (const icon of this.glowIcons) icon.container.setVisible(false);
      for (const ind of this.edgeIndicators) ind.container.setVisible(false);
      return;
    }

    if (!this._loggedKeys) {
      console.log(`[InteractionSystem] 🔑 已注册交互对象数: ${this.interactables.length}`);
      this._loggedKeys = true;
    }

    const nearest = this.findNearest();

    for (let i = 0; i < this.glowIcons.length; i++) {
      const icon = this.glowIcons[i];
      const ind = this.edgeIndicators[i];
      const obj = icon.interactable;
      const isNearest = obj === nearest;
      const inView = this._isInView(obj.x, obj.y);

      if (isNearest) {
        // 玩家已靠近：隐藏光环 + 隐藏边缘指引（改为 E 键文字提示）
        icon.container.setVisible(false);
        ind.container.setVisible(false);
      } else if (inView) {
        // 镜头内：显示光环，隐藏边缘指引
        icon.container.setVisible(true);
        ind.container.setVisible(false);
      } else {
        // 镜头外：隐藏光环，在视口边缘显示感叹号 + 方向箭头
        icon.container.setVisible(false);
        const { sx, sy, angle } = this._clampToEdge(obj.x, obj.y);
        if (sx < -1000) {
          ind.container.setVisible(false);
        } else {
          ind.container.setPosition(sx, sy);
          // 箭头绕感叹号圆心旋转，半径 18px，朝向 trigger 方向
          const rad = angle;
          ind.arrow.setPosition(Math.cos(rad) * 18, Math.sin(rad) * 18);
          // 箭头自身旋转，使三角形尖端朝向 trigger 方向
          // _drawArrow 绘制的箭头默认朝上（-Y方向），rotation=0 对应 -90°
          ind.arrow.setRotation(rad + Math.PI / 2);
          ind.container.setVisible(true);
        }
      }
    }

    // 交互提示标签
    if (nearest) {
      const label = nearest.hintText || "E  交互";
      if (!this.interactHint) {
        this.interactHint = this._createHintLabel(label);
      } else if (this.interactHint.currentText !== label) {
        // 文字变化时重建（宽度需要重绘背景）
        this._destroyHint();
        this.interactHint = this._createHintLabel(label);
      }
      this.interactHint.container.setPosition(nearest.x, nearest.y - 64);
      this.interactHint.container.setVisible(true);
    } else {
      if (this.interactHint) {
        this.interactHint.container.setVisible(false);
      }
    }
  }

  // ─────────────────────────────────────────────
  //  提示标签：蓝白发光风格
  // ─────────────────────────────────────────────
  private _createHintLabel(text: string): HintLabel {
    const scene = this.scene;

    // 先创建文字测量宽度
    const labelText = scene.add.text(0, 0, text, {
      fontSize: "13px",
      fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      color: "#c8f0ff",
    }).setOrigin(0.5);

    const tw = labelText.width;
    const th = labelText.height;
    const padX = 14;
    const padY = 7;
    const bw = tw + padX * 2;
    const bh = th + padY * 2;
    const r = bh / 2; // 胶囊圆角

    // 背景板（Graphics）
    const bg = scene.add.graphics();
    // 外发光晕
    bg.fillStyle(0x3a8fff, 0.08);
    bg.fillRoundedRect(-bw / 2 - 4, -bh / 2 - 4, bw + 8, bh + 8, r + 4);
    // 主背景
    bg.fillStyle(0x07152e, 0.82);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, r);
    // 描边
    bg.lineStyle(1.2, 0x7ecfff, 0.7);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, r);

    // 容器组合（世界坐标，depth=9999）
    const container = scene.add.container(0, 0, [bg, labelText]);
    container.setDepth(9999);
    container.setAlpha(0);

    // 淡入动画
    const tween = scene.tweens.add({
      targets: container,
      alpha: { from: 0, to: 1 },
      y: { from: (container.y ?? 0) + 6, to: container.y ?? 0 },
      duration: 180,
      ease: "Quad.easeOut",
    });

    return { container, bg, label: labelText, tween, currentText: text };
  }

  private _destroyHint() {
    if (!this.interactHint) return;
    this.interactHint.tween?.destroy();
    this.interactHint.container?.destroy();
    this.interactHint = null;
  }

  private _triggerInteract() {
    if (!this.enabled) return;

    const nearest = this.findNearest();
    if (!nearest) return;

    console.log(`[InteractionSystem] 🎯 E 键触发交互: id=${nearest.id}, type=${nearest.type}`);

    if (nearest.sitAction && this.onSitCallback) {
      this.onSitCallback(nearest.chairY ?? nearest.y, nearest.sitInFront ?? true);
      return;
    }

    const mapId = (this.scene.registry.get("currentMapId") as string) || "";

    switch (nearest.type) {
      case "npc":
      case "item":
        gameBridge.sendToReact({
          type: "TRIGGER_DIALOGUE",
          sceneId: nearest.sceneId || nearest.id,
          mapId,
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
