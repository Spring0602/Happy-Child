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

    // 加载角色精灵图（spritesheet）
    for (const sprite of Object.values(AssetManifest.sprites)) {
      this.load.spritesheet(sprite.key, sprite.image, {
        frameWidth: sprite.frameWidth,
        frameHeight: sprite.frameHeight,
      });
    }
  }

  create() {
    // 注册角色动画
    createPlayerAnimations(this);
    // 进入地图场景（默认客厅）
    this.scene.start("MapScene", { mapId: "livingroom" });
  }
}
