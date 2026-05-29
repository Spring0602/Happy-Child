import Phaser from "phaser";

/**
 * 精灵图布局（256×256 px，3行×8列，frameWidth=32, frameHeight≈85）
 *
 * 用户确认的布局（yps.png 实际绘制内容）：
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │ 行0（第一行·前/W）  │ 前跑0~5 │ 前站(6) │ 前坐(7) │  ← 帧 0~7            │
 * │ 行1（第二行·左/A）  │ 左跑0~5 │ 左站(14)│ 左坐(15)│  ← 帧 8~15           │
 * │ 行2（第三行·后/S）  │ 后跑0~5 │ 后站(22)│ 后坐(23)│  ← 帧 16~23          │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * 方向映射：
 *   W（前）→ 行0（帧 0~7）
 *   A（左）→ 行1（帧 8~15）
 *   S（后）→ 行2（帧 16~23）
 *   D（右）→ 行1 的镜像（setFlipX(true)）
 *
 * 每行：col 0~5 = 跑步（frameRate=10 循环），col 6 = 站立（单帧），col 7 = 坐下（单帧）
 */
type AnimSet = "yps" | "ly";

/** 为单个精灵集注册全部动画 */
function registerAnimSet(scene: Phaser.Scene, spriteKey: string, prefix: AnimSet) {
  // ────── 向前（W / 第一行·行0）──────
  scene.anims.create({
    key: `${prefix}_run_up`,
    frames: scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: `${prefix}_idle_up`,
    frames: [{ key: spriteKey, frame: 6 }],
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: `${prefix}_sit_up`,
    frames: [{ key: spriteKey, frame: 7 }],
    frameRate: 1,
    repeat: 0,
  });

  // ────── 向左（A / 第二行·行1）──────
  scene.anims.create({
    key: `${prefix}_run_left`,
    frames: scene.anims.generateFrameNumbers(spriteKey, { start: 8, end: 13 }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: `${prefix}_idle_left`,
    frames: [{ key: spriteKey, frame: 14 }],
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: `${prefix}_sit_left`,
    frames: [{ key: spriteKey, frame: 15 }],
    frameRate: 1,
    repeat: 0,
  });

  // ────── 向后（S / 第三行·行2）──────
  scene.anims.create({
    key: `${prefix}_run_down`,
    frames: scene.anims.generateFrameNumbers(spriteKey, { start: 16, end: 21 }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: `${prefix}_idle_down`,
    frames: [{ key: spriteKey, frame: 22 }],
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: `${prefix}_sit_down`,
    frames: [{ key: spriteKey, frame: 23 }],
    frameRate: 1,
    repeat: 0,
  });

  // 向右（D）= 向左动画 + setFlipX(true)，不注册独立动画
}

/**
 * 注册所有角色的动画。
 * 在 PreloadScene.create() 中调用。
 */
export function createPlayerAnimations(scene: Phaser.Scene) {
  registerAnimSet(scene, "sprite_yps", "yps");
  registerAnimSet(scene, "sprite_ly", "ly");
}
