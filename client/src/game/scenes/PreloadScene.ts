import Phaser from "phaser";
import { AssetManifest } from "../config/assetManifest";
import { MapRegistry } from "../config/mapRegistry";
import { createPlayerAnimations } from "../config/animationRegistry";

/**
 * PreloadScene — 首屏资源加载
 *
 * 架构说明：
 * - preload(): 仅注册 loader 任务（Phaser 自动顺序执行）
 * - create(): 创建加载 UI → 手动启动 loader（如果需要）→ 等待完成/超时 → 清理 → 切换 MapScene
 *
 * 关键设计决策：
 * scene.start() 必须在 create() 中调用，不能在 preload() 中调用。
 * Phaser 3 在 preload 阶段调用 scene.start 会导致旧场景 display list 不被正确清理，
 * 表现为"加载 UI 残留在 MapScene 上方"。
 */

/** 首屏只需要客厅的地图资源 */
const START_MAP_ID = "livingroom";
/** 最大等待时间（ms），超此后强制进入地图 */
const MAX_WAIT_MS = 6000;
/** 卡死检测：连续多少毫秒无进度变化视为卡死 */
const STUCK_THRESHOLD_MS = 2500;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  // ════════════════════════════════════════
  //  Phase 1: 注册加载任务（Phaser 自动执行）
  // ════════════════════════════════════════
  preload() {
    const startEntry = MapRegistry[START_MAP_ID];
    if (!startEntry) {
      console.error(`[PreloadScene] 起始地图 ${START_MAP_ID} 未注册!`);
      return;
    }

    /** 收集要预加载的任务 */
    const tasks: Array<{
      type: "tilemapJSON" | "image" | "spritesheet";
      key: string;
      path: string;
      extra?: { frameWidth: number; frameHeight: number };
    }> = [];

    // 1. 起始地图 JSON
    tasks.push({ type: "tilemapJSON", key: startEntry.mapKey, path: startEntry.mapJson });

    // 2. 起始地图地面底图
    tasks.push({ type: "image", key: startEntry.groundKey, path: startEntry.groundImage });

    // 3. 起始地图家具图片
    if (startEntry.furnitureImages) {
      for (const img of startEntry.furnitureImages) {
        tasks.push({ type: "image", key: img.key, path: img.path });
      }
    }

    // 4. 所有角色精灵图（全局需要）
    for (const sprite of Object.values(AssetManifest.sprites)) {
      tasks.push({
        type: "spritesheet",
        key: sprite.key,
        path: sprite.image,
        extra: { frameWidth: sprite.frameWidth, frameHeight: sprite.frameHeight },
      });
    }

    console.log(`[PreloadScene] 🚀 注册 ${tasks.length} 个加载任务`);

    // 发起加载（Phaser 在 preload() 返回后自动开始处理）
    for (const t of tasks) {
      switch (t.type) {
        case "tilemapJSON":
          this.load.tilemapTiledJSON(t.key, t.path);
          break;
        case "image":
          this.load.image(t.key, t.path);
          break;
        case "spritesheet":
          this.load.spritesheet(t.key, t.path, t.extra!);
          break;
      }
    }
  }

  // ════════════════════════════════════════
  //  Phase 2: UI 显示 + 进度监听 + 场景切换
  // ════════════════════════════════════════
  create() {
    const { width, height } = this.cameras.main;
    const totalFiles = this.load.totalToLoad;
    let loadedFiles = 0;
    let finished = false;

    console.log(`[PreloadScene] create() — 总任务数: ${totalFiles}`);

    // ── UI 元素 ──
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

    const statusText = this.add
      .text(width / 2, height / 2 + 40, `正在加载... (0/${totalFiles})`, {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    let lastProgressTime = Date.now();

    /**
     * 清理所有 UI 并切换到 MapScene。
     * 此函数只在 create() 中调用，确保 scene.start() 在正确的生命周期阶段。
     */
    const finishLoading = (reason: string) => {
      if (finished) return;
      finished = true;

      console.log(
        `[PreloadScene] ✅ 加载结束! ${loadedFiles}/${totalFiles} | 原因: ${reason}`
      );

      // 1. 移除所有事件监听
      this.load.off("progress");
      this.load.off("filecomplete");
      this.load.off("loaderror");
      this.load.off("complete");

      // 2. 清除定时器
      this.time.removeAllEvents();

      // 3. 销毁 UI 对象（必须在 scene.start 之前！）
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      statusText.destroy();

      // 4. 注册动画（在切换前完成）
      createPlayerAnimations(this);

      // 5. 切换场景 ✅ 现在在 create() 中调用，Phaser 能正确处理
      console.log("[PreloadScene] → 切换到 MapScene");
      this.scene.start("MapScene", { mapId: START_MAP_ID });
    };

    // ── 进度更新 ──
    this.load.on("progress", (value: number) => {
      if (finished || !progressBar.active) return;
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // ── 单文件完成 ──
    this.load.on("filecomplete", (_key: string) => {
      loadedFiles++;
      lastProgressTime = Date.now();
      if (!finished && statusText.active) {
        statusText.setText(`正在加载... (${loadedFiles}/${totalFiles})`);
      }
    });

    // ── 单文件失败 ──
    this.load.on("loaderror", (fileObj: { key?: string }) => {
      console.warn(`[PreloadScene] ⚠ 加载失败: ${fileObj?.key ?? "?"}`);
      loadedFiles++;
      lastProgressTime = Date.now();
      if (!finished && statusText.active) {
        statusText.setText(`⚠ 加载出错 (${loadedFiles}/${totalFiles})`);
      }
    });

    // ── 全部完成 ──
    this.load.on("complete", () => {
      finishLoading("complete");
    });

    // ════════════════════════════════════════
    //   兜底保护（仅在 create() 中的定时器）
    // ════════════════════════════════════════

    // 兜底 1: 卡死检测
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (finished) return;
        // 有进度但停滞超过阈值 → 视为卡死
        if (loadedFiles > 0 && loadedFiles < totalFiles) {
          const stuck = Date.now() - lastProgressTime > STUCK_THRESHOLD_MS;
          if (stuck) {
            console.warn(
              `[PreloadScene] ⏱ 卡死检测: ${loadedFiles}/${totalFiles}, ${STUCK_THRESHOLD_MS}ms 无进度`
            );
            finishLoading("stuck");
          }
        }
        // 完全没有进度且超过一半时间 → 也强制进入
        if (loadedFiles === 0 && Date.now() - lastProgressTime > MAX_WAIT_MS / 2) {
          console.warn(`[PreloadScene] ⏱ 零进度超时, 强制进入`);
          finishLoading("zero-progress-timeout");
        }
      },
    });

    // 兜底 2: 绝对超时
    this.time.delayedCall(MAX_WAIT_MS, () => {
      if (!finished) {
        console.warn(`[PreloadScene] ⏱ ${MAX_WAIT_MS}ms 绝对超时: ${loadedFiles}/${totalFiles}`);
        finishLoading("timeout");
      }
    });

    // 特殊情况：如果 preload() 阶段已经全部完成了（文件极少或缓存命中），
    // load.complete 可能已经在 preload→create 之间触发了
    if (this.load.progress >= 1 && this.load.totalLoaded >= totalFiles) {
      console.log("[PreloadScene] 缓存命中 — 资源已在 preload 阶段全部就绪");
      finishLoading("cached");
    }
  }
}
