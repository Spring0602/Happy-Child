import Phaser from "phaser";

type Direction = "left" | "right" | "up" | "down";

/**
 * 玩家控制器 — 键盘 WASD 移动 + 精灵动画切换
 *
 * 方向映射（对应 yps.png 精灵图布局）：
 *   W → up（前）    → 行0 帧0~5（跑）/ 帧6（站）
 *   A → left（左）  → 行1 帧8~13（跑）/ 帧14（站）
 *   D → right（右） → 行1 帧8~13 镜像（跑）/ 帧14 镜像（站）
 *   S → down（后）  → 行2 帧16~21（跑）/ 帧22（站）
 */
export class PlayerController {
  private wasd: Record<string, Phaser.Input.Keyboard.Key> | null = null;
  private player: Phaser.GameObjects.Sprite;
  private body: Phaser.Physics.Arcade.Body;
  private scene: Phaser.Scene;
  private speed = 120;
  private frozen = false;
  private isSitting = false;
  private lastDirection: Direction = "down";
  private animPrefix: string;

  /**
   * @param scene   Phaser 场景实例
   * @param player  被控制的精灵
   * @param animPrefix 动画键名前缀，如 "yps" 或 "ly"
   */
  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, animPrefix = "yps") {
    this.player = player;
    this.scene = scene;
    this.body = player.body as Phaser.Physics.Arcade.Body;
    this.animPrefix = animPrefix;
    this.initKeys();
  }

  /** 延迟初始化键盘（如果 scene.input.keyboard 尚不可用则重试） */
  private initKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) {
      this.scene.time.delayedCall(500, () => this.initKeys());
      return;
    }
    // 如果已经绑定过则跳过（防止重复绑定）
    if (this.wasd) return;

    try {
      this.wasd = {
        W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    } catch (err) {
      console.error("[PlayerController] 键盘绑定失败:", err);
      this.scene.time.delayedCall(500, () => this.initKeys());
    }
  }

  update(_delta: number) {
    // 键盘尚未就绪则跳过
    if (!this.wasd) {
      this.body.setVelocity(0, 0);
      return;
    }

    // 坐下时：检测方向键 → 站起来
    if (this.isSitting) {
      if (
        Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.A) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.S) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.D)
      ) {
        this.standUp();
      }
      this.body.setVelocity(0, 0);
      return;
    }

    if (this.frozen) {
      this.body.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;
    let currentDir: Direction | null = null;

    // 水平方向
    if (this.wasd.A.isDown) {
      vx = -1;
      currentDir = "left";
    } else if (this.wasd.D.isDown) {
      vx = 1;
      currentDir = "right";
    }

    // 垂直方向
    if (this.wasd.W.isDown) {
      vy = -1;
      currentDir = "up";
    } else if (this.wasd.S.isDown) {
      vy = 1;
      currentDir = "down";
    }

    // 对角线归一化
    if (vx && vy) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.body.setVelocity(vx * this.speed, vy * this.speed);

    if (currentDir) {
      this.lastDirection = currentDir;
      this.playRunAnimation(currentDir);
    } else {
      this.playIdleAnimation(this.lastDirection);
    }
  }

  /** 播放跑步动画 */
  private playRunAnimation(dir: Direction) {
    const p = this.animPrefix;
    switch (dir) {
      case "left":
        this.player.play(`${p}_run_left`, true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play(`${p}_run_left`, true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play(`${p}_run_up`, true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play(`${p}_run_down`, true);
        this.player.setFlipX(false);
        break;
    }
  }

  /** 播放站立动画（单帧） */
  private playIdleAnimation(dir: Direction) {
    const p = this.animPrefix;
    switch (dir) {
      case "left":
        this.player.play(`${p}_idle_left`, true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play(`${p}_idle_left`, true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play(`${p}_idle_up`, true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play(`${p}_idle_down`, true);
        this.player.setFlipX(false);
        break;
    }
  }

  /** 播放坐下动画（单帧） */
  private playSitAnimation(dir: Direction) {
    const p = this.animPrefix;
    switch (dir) {
      case "left":
        this.player.play(`${p}_sit_left`, true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play(`${p}_sit_left`, true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play(`${p}_sit_up`, true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play(`${p}_sit_down`, true);
        this.player.setFlipX(false);
        break;
    }
  }

  /**
   * 让角色坐下（与椅子交互时调用）
   */
  sit(chairY: number, sitInFront: boolean, mapHeight = 768) {
    this.isSitting = true;
    this.body.setVelocity(0, 0);
    this.playSitAnimation(this.lastDirection);
    this.player.setDepth(sitInFront ? (chairY + 1) / mapHeight : (chairY - 1) / mapHeight);
  }

  /** 站起来（按任意方向键时调用） */
  standUp() {
    if (!this.isSitting) return;
    this.isSitting = false;
    this.playIdleAnimation(this.lastDirection);
  }

  /** 是否处于坐下状态 */
  get sitting() {
    return this.isSitting;
  }

  freeze() {
    this.frozen = true;
  }
  unfreeze() {
    this.frozen = false;
  }
}
