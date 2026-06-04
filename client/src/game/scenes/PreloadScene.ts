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

    // 加载地面底图（Image Layer）
    for (const map of Object.values(AssetManifest.maps)) {
      this.load.image(map.groundKey, map.groundImage);
    }

    // 加载家具独立图片
    for (const map of Object.values(AssetManifest.maps)) {
      if (map.furnitureImages) {
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
  }

  create() {
    // 注册角色动画
    createPlayerAnimations(this);
    // 进入地图场景（默认客厅）
    this.scene.start("MapScene", { mapId: "livingroom" });
  }
}
