import Phaser from "phaser";

type Direction = "left" | "right" | "up" | "down";

export class PlayerController {
  private wasd: Record<string, Phaser.Input.Keyboard.Key>;
  private player: Phaser.GameObjects.Sprite;
  private body: Phaser.Physics.Arcade.Body;
  private speed = 180;
  private frozen = false;
  private isSitting = false;
  private lastDirection: Direction = "down";

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.player = player;
    this.body = player.body as Phaser.Physics.Arcade.Body;
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(_delta: number) {
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
    switch (dir) {
      case "left":
        this.player.play("yps_run_left", true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play("yps_run_left", true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play("yps_run_up", true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play("yps_run_down", true);
        this.player.setFlipX(false);
        break;
    }
  }

  /** 播放站立动画（不循环单帧） */
  private playIdleAnimation(dir: Direction) {
    switch (dir) {
      case "left":
        this.player.play("yps_idle_left", true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play("yps_idle_left", true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play("yps_idle_up", true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play("yps_idle_down", true);
        this.player.setFlipX(false);
        break;
    }
  }

  /** 播放坐下动画（单帧） */
  private playSitAnimation(dir: Direction) {
    switch (dir) {
      case "left":
        this.player.play("yps_sit_left", true);
        this.player.setFlipX(false);
        break;
      case "right":
        this.player.play("yps_sit_left", true);
        this.player.setFlipX(true);
        break;
      case "up":
        this.player.play("yps_sit_up", true);
        this.player.setFlipX(false);
        break;
      case "down":
        this.player.play("yps_sit_down", true);
        this.player.setFlipX(false);
        break;
    }
  }

  /**
   * 让角色坐下（与椅子交互时调用）
   * @param chairY 椅子底部的 Y 坐标，用于判断角色应该在椅子前面还是后面
   * @param sitInFront true=角色坐在椅子前面，false=角色坐在椅子后面
   * @param mapHeight 当前地图高度（像素），用于深度归一化
   */
  sit(chairY: number, sitInFront: boolean, mapHeight: number) {
    this.isSitting = true;
    this.body.setVelocity(0, 0);
    this.playSitAnimation(this.lastDirection);
    // 深度排序：坐在椅子前面时深度高于椅子，后面时低于椅子
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
