import Phaser from "phaser";

/**
 * 主角精灵图布局（256×256 px，3行×8列 = 24帧）
 * 
 * 行列映射：
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │ 行0（左朝向） │ 左跑0 │ 左跑1 │ 左跑2 │ 左跑3 │ 左跑4 │ 左跑5 │ 左站 │ 左坐 │
 * │ 行1（上朝向） │ 上跑0 │ 上跑1 │ 上跑2 │ 上跑3 │ 上跑4 │ 上跑5 │ 上站 │ 上坐 │
 * │ 行2（下朝向） │ 下跑0 │ 下跑1 │ 下跑2 │ 下跑3 │ 下跑4 │ 下跑5 │ 下站 │ 下坐 │
 * └───────────────────────────────────────────────────────────────────────┘
 * 
 * 关键机制：
 * - 每行前6帧（col 0~5）= 跑步动画（frameRate=10，循环播放）
 * - 每行第7帧（col 6）= 该方向站立静态帧（不循环）
 * - 每行第8帧（col 7）= 该方向坐下静态帧（不循环）
 * - 向右跑 = 向左跑动画 + setFlipX(true)
 * - 向右站 = 向左站帧 + setFlipX(true)
 * - 向右坐 = 向左坐帧 + setFlipX(true)
 * 
 * 帧索引计算（frameWidth=32, frameHeight≈85, 8列×3行）：
 *   帧编号 = row * 8 + col
 *   行0：帧 0~7    行1：帧 8~15   行2：帧 16~23
 */
export function createPlayerAnimations(scene: Phaser.Scene) {
  // ========== 向左 ==========
  // 向左跑步（帧 0~5，6帧循环）
  scene.anims.create({
    key: "yps_run_left",
    frames: scene.anims.generateFrameNumbers("sprite_yps", { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });
  // 向左站立（帧 6，单帧）
  scene.anims.create({
    key: "yps_idle_left",
    frames: [{ key: "sprite_yps", frame: 6 }],
    frameRate: 1,
    repeat: 0,
  });
  // 向左坐下（帧 7，单帧）
  scene.anims.create({
    key: "yps_sit_left",
    frames: [{ key: "sprite_yps", frame: 7 }],
    frameRate: 1,
    repeat: 0,
  });

  // ========== 向上 ==========
  // 向上跑步（帧 8~13，6帧循环）
  scene.anims.create({
    key: "yps_run_up",
    frames: scene.anims.generateFrameNumbers("sprite_yps", { start: 8, end: 13 }),
    frameRate: 10,
    repeat: -1,
  });
  // 向上站立（帧 14，单帧）
  scene.anims.create({
    key: "yps_idle_up",
    frames: [{ key: "sprite_yps", frame: 14 }],
    frameRate: 1,
    repeat: 0,
  });
  // 向上坐下（帧 15，单帧）
  scene.anims.create({
    key: "yps_sit_up",
    frames: [{ key: "sprite_yps", frame: 15 }],
    frameRate: 1,
    repeat: 0,
  });

  // ========== 向下 ==========
  // 向下跑步（帧 16~21，6帧循环）
  scene.anims.create({
    key: "yps_run_down",
    frames: scene.anims.generateFrameNumbers("sprite_yps", { start: 16, end: 21 }),
    frameRate: 10,
    repeat: -1,
  });
  // 向下站立（帧 22，单帧）
  scene.anims.create({
    key: "yps_idle_down",
    frames: [{ key: "sprite_yps", frame: 22 }],
    frameRate: 1,
    repeat: 0,
  });
  // 向下坐下（帧 23，单帧）
  scene.anims.create({
    key: "yps_sit_down",
    frames: [{ key: "sprite_yps", frame: 23 }],
    frameRate: 1,
    repeat: 0,
  });

  // ========== 向右（镜像方案，不注册独立动画） ==========
  // 向右跑步 = "yps_run_left" + setFlipX(true)
  // 向右站立 = "yps_idle_left" + setFlipX(true)
  // 向右坐下 = "yps_sit_left" + setFlipX(true)
  // 详见 PlayerController.ts
}
