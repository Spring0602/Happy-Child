import Phaser from "phaser";

/**
 * 角色动画注册（使用GIF提取的PNG帧）
 * 
 * PNG帧命名规则：
 * - 路径：/assets/sprites/frames/{角色}_{动作}/{方向}/frame_XX.png
 * - 键名：{角色}_frames_{动作}_{方向}_{帧号}
 * 
 * 例如：ly_frames_left_0, ly_frames_left_1, ... ly_frames_left_5（6帧跑步）
 *       ly_frames_sit_left_0（1帧坐下）
 * 
 * 动画键名规则：
 * - 跑步：{角色}_run_{方向}（如 ly_run_left）
 * - 站立：{角色}_idle_{方向}（如 ly_idle_left）
 * - 坐下：{角色}_sit_{方向}（如 ly_sit_left）
 * 
 * 向右动画：使用独立 right 帧图注册动画（v8.3，已补全所有角色 right 帧）
 */

// 辅助函数：生成动画帧数组
// dirName 是目录名，如 "left"、"front"、"back"
// count 是帧数（跑步6帧，坐下/站立1帧）
function createFrames(charName: string, dirName: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    key: `${charName}_frames_${dirName}_${i}`,
  }));
}

// 辅助函数：单帧动画（坐下/站立）
function createSingleFrame(charName: string, actionDirName: string) {
  return [{ key: `${charName}_frames_${actionDirName}_0` }];
}

export function createPlayerAnimations(scene: Phaser.Scene) {
  // ========== 刘宇（ly）动画 ==========
  
  // 向左跑步（6帧：ly_frames_left_0 ~ ly_frames_left_5）
  scene.anims.create({
    key: "ly_run_left",
    frames: createFrames("ly", "left", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向左站立（1帧：ly_frames_stand_left_0）
  scene.anims.create({
    key: "ly_idle_left",
    frames: createSingleFrame("ly", "stand_left"),
    frameRate: 1,
    repeat: 0,
  });

  // 向左坐下（1帧：ly_frames_sit_left_0）
  scene.anims.create({
    key: "ly_sit_left",
    frames: createSingleFrame("ly", "sit_left"),
    frameRate: 1,
    repeat: 0,
  });

  // 向上跑步（6帧：ly_frames_back_0 ~ ly_frames_back_5）
  scene.anims.create({
    key: "ly_run_up",
    frames: createFrames("ly", "back", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向上站立（1帧：ly_frames_stand_back_0）
  scene.anims.create({
    key: "ly_idle_up",
    frames: createSingleFrame("ly", "stand_back"),
    frameRate: 1,
    repeat: 0,
  });

  // 向上坐下（1帧：ly_frames_sit_back_0）
  scene.anims.create({
    key: "ly_sit_up",
    frames: createSingleFrame("ly", "sit_back"),
    frameRate: 1,
    repeat: 0,
  });

  // 向下跑步（6帧：ly_frames_front_0 ~ ly_frames_front_5）
  scene.anims.create({
    key: "ly_run_down",
    frames: createFrames("ly", "front", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向下站立（1帧：ly_frames_stand_front_0）
  scene.anims.create({
    key: "ly_idle_down",
    frames: createSingleFrame("ly", "stand_front"),
    frameRate: 1,
    repeat: 0,
  });

  // 向下坐下（1帧：ly_frames_sit_front_0）
  scene.anims.create({
    key: "ly_sit_down",
    frames: createSingleFrame("ly", "sit_front"),
    frameRate: 1,
    repeat: 0,
  });

  // ========== 叶平生（yps）动画 ==========
  
  // 向左跑步（6帧：yps_frames_left_0 ~ yps_frames_left_5）
  scene.anims.create({
    key: "yps_run_left",
    frames: createFrames("yps", "left", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向左站立（1帧：yps_frames_stand_left_0）
  scene.anims.create({
    key: "yps_idle_left",
    frames: createSingleFrame("yps", "stand_left"),
    frameRate: 1,
    repeat: 0,
  });

  // 向左坐下（1帧：yps_frames_sit_left_0）
  scene.anims.create({
    key: "yps_sit_left",
    frames: createSingleFrame("yps", "sit_left"),
    frameRate: 1,
    repeat: 0,
  });

  // 向上跑步（6帧：yps_frames_back_0 ~ yps_frames_back_5）
  scene.anims.create({
    key: "yps_run_up",
    frames: createFrames("yps", "back", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向上站立（1帧：yps_frames_stand_back_0）
  scene.anims.create({
    key: "yps_idle_up",
    frames: createSingleFrame("yps", "stand_back"),
    frameRate: 1,
    repeat: 0,
  });

  // 向上坐下（1帧：yps_frames_sit_back_0）
  scene.anims.create({
    key: "yps_sit_up",
    frames: createSingleFrame("yps", "sit_back"),
    frameRate: 1,
    repeat: 0,
  });

  // 向下跑步（6帧：yps_frames_front_0 ~ yps_frames_front_5）
  scene.anims.create({
    key: "yps_run_down",
    frames: createFrames("yps", "front", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向下站立（1帧：yps_frames_stand_front_0）
  scene.anims.create({
    key: "yps_idle_down",
    frames: createSingleFrame("yps", "stand_front"),
    frameRate: 1,
    repeat: 0,
  });

  // 向下坐下（1帧：yps_frames_sit_front_0）
  scene.anims.create({
    key: "yps_sit_down",
    frames: createSingleFrame("yps", "sit_front"),
    frameRate: 1,
    repeat: 0,
  });

  // ========== yps 向右动画 ==========
  
  // 向右跑步（6帧：yps_frames_right_0 ~ yps_frames_right_5）
  scene.anims.create({
    key: "yps_run_right",
    frames: createFrames("yps", "right", 6),
    frameRate: 10,
    repeat: -1,
  });

  // 向右站立（1帧：yps_frames_stand_right_0）
  scene.anims.create({
    key: "yps_idle_right",
    frames: createSingleFrame("yps", "stand_right"),
    frameRate: 1,
    repeat: 0,
  });

  // 向右坐下（1帧：yps_frames_sit_right_0）
  scene.anims.create({
    key: "yps_sit_right",
    frames: createSingleFrame("yps", "sit_right"),
    frameRate: 1,
    repeat: 0,
  });
}
