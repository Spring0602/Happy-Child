import Phaser from "phaser";
import { AssetManifest } from "../config/assetManifest";
import { createPlayerAnimations } from "../config/animationRegistry";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.cameras.main.setBackgroundColor("#000000");

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
    const runDirs = ["left", "right", "front", "back"];
    const directions = ["left", "right", "front", "back"];

    for (const character of AssetManifest.frames) {
      const baseDir = `/assets/sprites/frames/${character.key}`;
      const folderPrefix = "folderPrefix" in character ? character.folderPrefix : character.key;
      const directoryOverrides = "directoryOverrides" in character ? character.directoryOverrides : undefined;
      const frameFileOverrides = "frameFileOverrides" in character ? character.frameFileOverrides : undefined;
      const runFrameStartOverrides = "runFrameStartOverrides" in character ? character.runFrameStartOverrides : undefined;

      if ("run" in character && character.run) {
        for (const direction of runDirs) {
          const subDir = `${folderPrefix}_${direction}`;
          const frameStart = runFrameStartOverrides?.[direction as keyof typeof runFrameStartOverrides];
          for (let index = 0; index < 6; index++) {
            const frameFile = frameStart === undefined
              ? `frame_${index.toString().padStart(2, "0")}.png`
              : `frame_${(frameStart + index).toString().padStart(3, "0")}.png`;
            this.load.image(
              `${character.key}_${direction}_${index}`,
              `${baseDir}/${subDir}/${frameFile}`
            );
          }
        }
      }

      for (const action of ["sit", "stand"] as const) {
        const hasAction = action === "sit"
          ? ("sit" in character && character.sit)
          : ("stand" in character && character.stand);
        if (!hasAction) continue;
        for (const direction of directions) {
          const actionDirection = `${action}_${direction}`;
          const override = directoryOverrides?.[actionDirection as keyof typeof directoryOverrides];
          const subDir = override || `${folderPrefix}_${actionDirection}`;
          const frameFile = frameFileOverrides?.[actionDirection as keyof typeof frameFileOverrides] || "frame_00.png";
          this.load.image(
            `${character.key}_${actionDirection}_0`,
            `${baseDir}/${subDir}/${frameFile}`
          );
        }
      }
    }

    // NPC 精灵帧已在上面 charDirs 中统一加载，不再使用静态图片

    // 加载宿舍夜景变体底图（电脑关/开，用于第四幕）
    this.load.image("ground_dorm_night_pc_off", "assets/maps/dormitory/宿舍_夜晚_电脑关.png");
    this.load.image("ground_dorm_night_pc_on", "assets/maps/dormitory/宿舍_夜晚_电脑开.png");

    // 加载音效
    this.load.audio("alarm_clock", "assets/audio/sfx/alarm_clock.wav");
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
