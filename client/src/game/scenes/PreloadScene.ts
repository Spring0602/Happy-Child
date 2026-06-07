import Phaser from "phaser";
import { AssetManifest } from "../config/assetManifest";
import { createPlayerAnimations } from "../config/animationRegistry";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    const { width, height } = this.cameras.main;

    // 进度条
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const progressBar = this.add.graphics();
    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "加载中...", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 加载地图 JSON
    for (const map of Object.values(AssetManifest.maps)) {
      this.load.tilemapTiledJSON(map.mapKey, map.mapJson);
    }

    // 加载占位 tileset（Phaser tilemap 要求必须有关联 tileset）
    for (const map of Object.values(AssetManifest.maps)) {
      if ("tilesetKey" in map && map.tilesetKey && "tilesetImage" in map && map.tilesetImage) {
        this.load.image(map.tilesetKey, map.tilesetImage);
      }
    }

    // 加载地面底图（Image Layer）
    for (const map of Object.values(AssetManifest.maps)) {
      this.load.image(map.groundKey, map.groundImage);
    }

    // 加载家具独立图片
    for (const map of Object.values(AssetManifest.maps)) {
      if ("furnitureImages" in map && map.furnitureImages) {
        for (const img of map.furnitureImages) {
          this.load.image(img.key, img.path);
        }
      }
    }

    // 加载角色精灵图帧（从GIF提取的PNG序列帧）
    // 目录结构：/assets/sprites/frames/{角色}_frames/{角色}_frames_{动作方向}/frame_XX.png
    // 帧键名：{角色}_frames_{动作方向}_{帧号}  (如 yps_frames_left_0)
    const charDirs = ["ly_frames", "yps_frames"];
    // 跑步方向（每个方向6帧，帧号00-05）
    const runDirs = ["left", "right", "front", "back"];
    // 坐下/站立方向（每个方向1帧，帧号00）
    const staticDirs = [
      "sit_left", "sit_right", "sit_front", "sit_back",
      "stand_left", "stand_right", "stand_front", "stand_back",
    ];

    for (const charDir of charDirs) {
      const baseDir = `assets/sprites/frames/${charDir}`;
      // 跑步帧
      for (const dir of runDirs) {
        const subDir = `${charDir}_${dir}`;
        for (let i = 0; i < 6; i++) {
          const frameKey = `${charDir}_${dir}_${i}`;
          const filePath = `${baseDir}/${subDir}/frame_${i.toString().padStart(2, "0")}.png`;
          this.load.image(frameKey, filePath);
        }
      }
      // 坐下/站立帧
      for (const dir of staticDirs) {
        const subDir = `${charDir}_${dir}`;
        const frameKey = `${charDir}_${dir}_0`;
        const filePath = `${baseDir}/${subDir}/frame_00.png`;
        this.load.image(frameKey, filePath);
      }
    }

    // 加载 NPC 精灵图（宿舍第三幕等）
    this.load.image("npc_cyh", "assets/sprites/cyh.png");
    this.load.image("npc_roommateA", "assets/sprites/roommateA.png");
    this.load.image("npc_roommateB", "assets/sprites/roommateB.png");

    // 加载音效
    this.load.audio("alarm_clock", "assets/audio/sfx/alarm_clock.mp3");
  }

  create() {
    console.log(`[PreloadScene] ✅ create() 被调用，准备启动 MapScene`);
    // 注册角色动画
    createPlayerAnimations(this);
    // 立即启动地图场景（默认宿舍 sleep 场景，等待 CG 结束后激活）
    // 注意：scene.start 会 shutdown 当前场景（PreloadScene），其 children 自动销毁
    this.scene.start("MapScene", { mapId: "dormitory" });
  }
}
