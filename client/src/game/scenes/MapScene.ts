import Phaser from "phaser";
import { MapRegistry } from "../config/mapRegistry";
import { gameBridge } from "../bridge/GameBridge";
import { PlayerController } from "../systems/PlayerController";
import { InteractionSystem } from "../systems/InteractionSystem";
import { TriggerSystem } from "../systems/TriggerSystem";

export class MapScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private player!: Phaser.GameObjects.Sprite;
  private playerCtrl!: PlayerController;
  private interactionSys!: InteractionSystem;
  private triggerSys!: TriggerSystem;
  private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
  private currentMapId = "";

  constructor() {
    super({ key: "MapScene" });
  }

  init(data: { mapId: string }) {
    this.currentMapId = data.mapId;
  }

  create() {
    console.log(`[MapScene] 🚀 create() 被调用, mapId=${this.currentMapId}`);
    try {
      this.loadMap(this.currentMapId);
      this.listenBridge();
      console.log(`[MapScene] ✅ create() 完成`);
    } catch (e) {
      console.error(`[MapScene] ❌ create() 失败`, e);
      // 显示错误信息
      const gw = this.scale.width;
      const gh = this.scale.height;
      this.add.text(gw / 2, gh / 2, "地图加载失败，请刷新页面", {
        fontSize: "24px",
        color: "#ff4444",
        backgroundColor: "#000000",
        padding: { x: 16, y: 12 },
      }).setOrigin(0.5);
    }
  }

  /** 加载一张地图 */
  private loadMap(mapId: string, spawnId?: string) {
    const entry = MapRegistry[mapId];
    if (!entry) {
      console.error(`[MapScene] 地图 ${mapId} 未注册`);
      return;
    }

    try {
      // 清理旧场景对象
      this.children.removeAll(true);

      // 注册当前地图到 scene registry
      this.registry.set("currentMapId", mapId);

      // === 1. 铺地面底图 ===
      this.add.image(0, 0, entry.groundKey).setOrigin(0, 0).setDepth(0);

      // === 2. 解析 tilemap JSON（仅用于读取对象层） ===
      // 关键修复：dormitory 等 map JSON 没有 tilesets 字段，Phaser make.tilemap 内部
      // ParseTilesets 会直接访问 tilesets.length 导致崩溃。
      // 数据在 cache.tilemap 中（由 tilemapTiledJSON 加载）。
      // 
      // 之前的修复尝试用 { data } 传入深拷贝数据，但 Phaser 的 ParseToTilemap 在收到
      // data 参数时检查 Array.isArray(data) → false（data 是对象不是数组），且 key 为
      // undefined 时不会从 cache 解析，最终创建一个空白 MapData，丢失所有对象层。
      // 
      // 正确方案：直接修改 cache.tilemap 中的原始 data，补全 tilesets 字段，
      // 然后用 { key } 方式创建 tilemap（Phaser 会从 cache 重新读取已修复的数据）。
      let cachedTilemapData = this.cache.tilemap.get(entry.mapKey);

      // 🔧 兼容处理：多个地图共享同一个 mapJson 文件时，Phaser loader 会对相同 URL
      // 去重，导致第二个 key 没有实际加载数据。此时从基础 key 复制缓存数据。
      if (!cachedTilemapData) {
        const fallbackKey = entry.mapKey.replace(/_night$/, ""); // balcony_night → balcony
        if (fallbackKey !== entry.mapKey) {
          const fallbackData = this.cache.tilemap.get(fallbackKey);
          if (fallbackData) {
            console.log(`[MapScene] 🔄 从 ${fallbackKey} 复制 tilemap 数据到 ${entry.mapKey}`);
            // 深拷贝 data 避免共享引用导致后续修改互相影响
            this.cache.tilemap.add(entry.mapKey, {
              ...fallbackData,
              data: JSON.parse(JSON.stringify(fallbackData.data)),
            });
            cachedTilemapData = this.cache.tilemap.get(entry.mapKey);
          }
        }
      }

      if (!cachedTilemapData) {
        console.error(`[MapScene] ❌ 缓存中找不到 tilemap 数据: ${entry.mapKey}`);
        return;
      }
      const rawMapJson = cachedTilemapData.data;
      if (!rawMapJson.tilesets) {
        console.log(`[MapScene] 🔧 补全缺失的 tilesets 字段 (map=${mapId})`);
        rawMapJson.tilesets = [];
      }

      this.map = this.make.tilemap({ key: entry.mapKey });

      // 添加占位 tileset（Phaser 要求 tilemap 必须有关联 tileset，即使不渲染 tile 图层）
      if (entry.tilesetKey && entry.tilesetNameInTiled) {
        try {
          const tileset = this.map.addTilesetImage(
            entry.tilesetNameInTiled,
            entry.tilesetKey,
            entry.tileWidth,
            entry.tileHeight,
            0,
            0
          );
          if (!tileset) {
            console.warn(`[MapScene] ⚠ addTilesetImage 返回 null (map=${mapId}, name=${entry.tilesetNameInTiled})，可能 map JSON 中无匹配 tileset`);
          }
        } catch (e) {
          console.warn(`[MapScene] ⚠ addTilesetImage 异常 (map=${mapId}):`, e);
        }
      }

      // === 3. 创建玩家（仅创建 sprite + 物理体，不注册碰撞 — 碰撞在步骤6之后） ===
      this.createPlayer(entry, spawnId || entry.defaultSpawn);

      // === 4. 设置世界边界 & 相机 ===
      this.physics.world.setBounds(0, 0, entry.width, entry.height);
      this.cameras.main.setBounds(0, 0, entry.width, entry.height);
      const lerp = entry.width > 2000 ? 0.05 : 0.08;
      this.cameras.main.startFollow(this.player, true, lerp, lerp);

      // === 5. 初始化子系统（必须在 processObjectLayers 之前） ===
      this.playerCtrl = new PlayerController(this, this.player);
      this.interactionSys = new InteractionSystem(this, this.player);
      this.interactionSys.setOnSit((chairY, sitInFront) => {
        this.playerCtrl?.sit(chairY, sitInFront, entry.height);
      });
      this.triggerSys = new TriggerSystem(this, this.player);

      // === 6. 处理对象层（注册碰撞、交互、触发器 — 依赖上面的子系统） ===
      this.collisionGroup = this.physics.add.staticGroup();
      this.processObjectLayers(entry, spawnId || entry.defaultSpawn);

      // === 7. 注册玩家 vs 碰撞组 collider（必须在 collisionGroup 和碰撞体都已创建之后） ===
      this.physics.add.collider(this.player, this.collisionGroup);

      console.log(`[MapScene] ✅ 地图加载完成: ${mapId}`);
    } catch (e) {
      console.error(`[MapScene] ❌ 地图加载失败: ${mapId}`, e);
    }
  }

  /** 处理 Tiled 对象层 */
  private processObjectLayers(entry: typeof MapRegistry[string], defaultSpawn: string) {
    // --- collision ---
    // Y 轴偏移修正：碰撞区域只取下半部分（底部 40%），让玩家能走到物品前方
    const COLLISION_Y_RATIO = 0.4; // 保留底部的比例
    const collisionLayer = this.map.getObjectLayer("collision");
    if (collisionLayer) {
      for (const obj of collisionLayer.objects) {
        const w = obj.width ?? 32;
        const fullH = obj.height ?? 32;
        const h = fullH * COLLISION_Y_RATIO;
        const cx = obj.x! + w / 2;
        const cy = obj.y! + fullH - h / 2; // 底部对齐
        const zone = this.add.zone(cx, cy, w, h);
        this.physics.add.existing(zone, true);
        this.collisionGroup.add(zone);
        // 可视化调试：半透明红色框显示碰撞区域
        const debugRect = this.add.rectangle(cx, cy, w, h, 0xff0000, 0.25);
        debugRect.setDepth(9999);
      }
    }

    // --- furniture_objects ---
    // 支持两种模式：
    //   1. 精灵图叠层（矩形对象 + entry.furnitureImages 中有匹配 key）
    //   2. 多边形遮挡（对象含 polygon 字段，用纯色填充 + depth sorting 遮挡玩家）
    const furnitureLayer = this.map.getObjectLayer("furniture_objects");
    console.log(`[MapScene] 📦 furniture_objects layer: ${furnitureLayer ? `found (${furnitureLayer.objects.length} objects)` : "NOT FOUND!"}`);
    console.log(`[MapScene] 🖼️  furnitureImages: ${entry.furnitureImages ? `${entry.furnitureImages.length} entries` : "undefined"}`);
    let registeredCount = 0;
    let renderedCount = 0;
    let polygonCount = 0;
    if (furnitureLayer) {
      for (const obj of furnitureLayer.objects) {
        const name = obj.name;
        const props = this.getProps(obj.properties);

        // ── 多边形遮挡物（裁剪底图 + 叠加精灵图）──
        if (obj.polygon && Array.isArray(obj.polygon) && obj.polygon.length >= 3) {
          polygonCount++;
          // 计算多边形包围盒
          let minX = Infinity, minY = Infinity;
          let polyMaxX = -Infinity, polyMaxY = -Infinity, maxY = 0;
          for (const pt of obj.polygon) {
            const ax = obj.x! + pt.x;
            const ay = obj.y! + pt.y;
            if (ax < minX) minX = ax;
            if (ay < minY) minY = ay;
            if (ax > polyMaxX) polyMaxX = ax;
            if (ay > polyMaxY) polyMaxY = ay;
            if (pt.y > maxY) maxY = pt.y;
          }
          const polyBottom = obj.y! + maxY;
          const furnDepth = polyBottom / entry.height;

          try {
            const bw = Math.max(1, polyMaxX - minX);
            const bh = Math.max(1, polyMaxY - minY);

            // ── 用离屏 Canvas 裁剪底图区域 ──
            // 1. 创建离屏 canvas，从底图裁剪包围盒区域
            const groundImg = this.textures.get(entry.groundKey).getSourceImage() as HTMLImageElement;
            if (groundImg) {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = bw;
              offCanvas.height = bh;
              const offCtx = offCanvas.getContext('2d')!;
              // 从底图裁剪包围盒区域
              offCtx.drawImage(groundImg, minX, minY, bw, bh, 0, 0, bw, bh);

              // 应用多边形裁剪（destination-in 保留多边形内部）
              offCtx.globalCompositeOperation = 'destination-in';
              offCtx.beginPath();
              offCtx.moveTo(obj.polygon[0].x + obj.x! - minX, obj.polygon[0].y + obj.y! - minY);
              for (let i = 1; i < obj.polygon.length; i++) {
                offCtx.lineTo(obj.polygon[i].x + obj.x! - minX, obj.polygon[i].y + obj.y! - minY);
              }
              offCtx.closePath();
              offCtx.fill();

              // 将裁剪结果添加到 Phaser 纹理缓存
              // 使用对象 id 确保唯一性，避免同名对象或同一帧内 Date.now() 碰撞
              const texKey = `poly_${obj.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              if (this.textures.exists(texKey)) {
                this.textures.remove(texKey);
              }
              this.textures.addImage(texKey, offCanvas as unknown as HTMLImageElement);

              const cropImg = this.add.image(minX + bw / 2, minY + bh / 2, texKey);
              cropImg.setDepth(furnDepth);
            } else {
              // 回退：纯色多边形
              console.warn(`[MapScene] ⚠ 无法获取底图纹理 ${entry.groundKey}，回退纯色填充`);
              const poly = this.add.polygon(obj.x!, obj.y!, obj.polygon, 0x808080, 0.85);
              poly.setDepth(furnDepth);
            }

            // ── 叠加精灵图（如果有关联 spriteKey）──
            const spriteKey = props.spriteKey;
            if (spriteKey && this.textures.exists(spriteKey)) {
              const spr = this.add.image(minX + bw / 2, minY + bh / 2, spriteKey);
              spr.setDepth(furnDepth + 0.0001); // 略高于裁剪底图
            }

            // 条件创建碰撞（walkable 的跳过）
            if (props.walkable !== "true") {
              const zone = this.add.zone(minX + bw / 2, minY + bh / 2, bw, bh);
              this.physics.add.existing(zone, true);
              this.collisionGroup.add(zone);
            }

            console.log(
              `[MapScene]   🔶 多边形遮挡: ${name} vertices=${obj.polygon.length}, depth=${furnDepth.toFixed(3)}, sprite=${spriteKey || '无'}`
            );
          } catch (e) {
            console.warn(`[MapScene] ⚠ 多边形渲染失败: ${name}`, e);
            // 回退
            const poly = this.add.polygon(obj.x!, obj.y!, obj.polygon, 0x808080, 0.85);
            poly.setDepth((obj.y! + maxY) / entry.height);
          }
          continue; // 跳过精灵图逻辑
        }

        // ── 精灵图叠层（原有逻辑）──
        // 纹理 key 兼容：map.json 中对象名可能不带前缀，MapRegistry 中 key 可能带多种前缀
        // 依次尝试: 完整前缀匹配 > 短前缀匹配 > 原始名
        const shortPrefix = this.currentMapId.slice(0, 4); // "dormitory" → "dorm"
        const match = entry.furnitureImages?.find((f) =>
          f.key === `${this.currentMapId}_${name}` ||
          f.key === `${shortPrefix}_${name}` ||
          f.key === name
        );
        if (match) {
          const objW = obj.width ?? 256;
          const objH = obj.height ?? 256;
          const sx = obj.x! + objW / 2;
          const sy = obj.y! + objH / 2;
          // 家具深度 = 底部 Y 坐标归一化（让家具与玩家按 Y 轴正确排序）
          const furnDepth = (obj.y! + objH) / entry.height;

          // 渲染家具精灵图（覆盖底图家具，实现 Y 轴深度前后遮挡）
          // 精灵图按 map.json 中对象尺寸缩放，与底图中的物品位置对齐
          const furnImg = this.add.image(sx, sy, match.key);
          furnImg.setDepth(furnDepth);
          // 缩放到 map.json 定义的尺寸，与底图对齐
          const texW = furnImg.width;
          const texH = furnImg.height;
          if (texW > 0 && texH > 0) {
            furnImg.setScale(objW / texW, objH / texH);
          }
          // 叠图精灵色调适配场景光照（夜晚场景用 furnitureTint，白天默认 0xcccccc）
          furnImg.setTint(entry.furnitureTint ?? 0xcccccc);
          renderedCount++;

          // 条件创建碰撞（可穿越的家具跳过，如 walkable=true 的椅子）
          // Y 轴偏移修正：碰撞区域只取下半部分（底部 40%）
          if (props.walkable !== "true") {
            const colH = objH * COLLISION_Y_RATIO;
            const colY = obj.y! + objH - colH / 2;
            const zone = this.add.zone(sx, colY, objW, colH);
            this.physics.add.existing(zone, true);
            this.collisionGroup.add(zone);
          }

          // 可交互物品：渲染半透明高亮边框，让玩家能识别
          if (props.interactable === "true") {
            registeredCount++;
            console.log(`[MapScene]   ✅ 可交互: ${name} → sceneId=${props.interactSceneId}, sitAction=${props.sitAction}, pos=(${Math.round(sx)},${Math.round(sy)}), size=(${objW},${objH})`);
            const highlight = this.add.rectangle(sx, sy, objW + 8, objH + 8, 0xffcc00, 0);
            highlight.setStrokeStyle(2, 0xffcc00, 0.35);
            highlight.setDepth(furnDepth + 0.001);
            // 注册交互
            this.interactionSys?.registerInteractable({
              x: sx,
              y: sy,
              type: "item",
              id: props.interactSceneId || name,
              sceneId: props.interactSceneId || name,
              sitAction: props.sitAction === "true",
              sitInFront: props.sitInFront !== "false",
              chairY: obj.y! + objH,
            });
          } else {
            console.log(`[MapScene]   📍 装饰品: ${name} at (${Math.round(sx)},${Math.round(sy)}), walkable=${props.walkable}`);
          }
        }
      }
      console.log(`[MapScene] 📊 furniture 总数: 精灵图=${renderedCount}, 多边形=${polygonCount}, 可交互注册=${registeredCount}`);
    }

    // --- triggers ---
    const triggerLayer = this.map.getObjectLayer("triggers");
    if (triggerLayer) {
      for (const obj of triggerLayer.objects) {
        const props = this.getProps(obj.properties);
        const triggerType = props.triggerType || props.type || "door";
        const zone = this.add.zone(
          obj.x! + (obj.width ?? 64) / 2,
          obj.y! + (obj.height ?? 64) / 2,
          obj.width ?? 64,
          obj.height ?? 64
        );

        // walk/auto 类型需要物理碰撞检测 → 添加 static body
        // interact 类型不需要碰撞体（仅 E 键交互范围，玩家可穿越）
        if (triggerType === "walk" || triggerType === "auto" || triggerType === "door") {
          this.physics.add.existing(zone, true);
        }

        // walk/auto 类型 → 注册到 TriggerSystem（自动触发）
        if (triggerType === "walk" || triggerType === "auto") {
          this.triggerSys?.registerTrigger(zone as unknown as Phaser.GameObjects.Zone, {
            type: triggerType,
            sceneId: props.sceneId,
            targetMap: props.targetMap,
            spawnId: props.targetSpawn || props.spawnId,
            itemId: props.itemId,
            requireFlag: props.requireFlag,
            setFlag: props.setFlag,
            once: props.once === "true",
          });
        }

        // interact/door 类型 → 注册到 InteractionSystem（E 键交互）
        if (triggerType === "interact" || triggerType === "door") {
          this.interactionSys?.registerInteractable({
            x: zone.x,
            y: zone.y,
            type: "item",
            id: props.itemId || obj.name,
            sceneId: props.sceneId,
          });
        }
      }
    }

    // --- npcs ---
    const npcLayer = this.map.getObjectLayer("npcs");
    if (npcLayer) {
      for (const obj of npcLayer.objects) {
        const props = this.getProps(obj.properties);
        const cx = obj.x! + (obj.width ?? 32) / 2;
        const cy = obj.y! + (obj.height ?? 32) / 2;
        // NPC 暂时用矩形占位（后续替换为角色精灵图）
        const rect = this.add.rectangle(
          cx, cy,
          (obj.width ?? 32) * 2, (obj.height ?? 48) * 2,
          0x4488ff,
          0.6
        );
        rect.setDepth(cy / (this.map.heightInPixels || entry.height));
        // NPC 碰撞体
        const npcZone = this.add.zone(cx, cy, obj.width ?? 32, obj.height ?? 48);
        this.physics.add.existing(npcZone, true);
        this.collisionGroup.add(npcZone);
        // 注册为可交互对象
        this.interactionSys?.registerInteractable({
          x: cx,
          y: cy,
          type: "npc",
          id: props.npcId || obj.name,
          sceneId: props.sceneId,
        });
      }
    }

    // --- items ---
    const itemsLayer = this.map.getObjectLayer("items");
    if (itemsLayer) {
      for (const obj of itemsLayer.objects) {
        const props = this.getProps(obj.properties);
        this.interactionSys?.registerInteractable({
          x: obj.x! + (obj.width ?? 24) / 2,
          y: obj.y! + (obj.height ?? 24) / 2,
          type: "item",
          id: props.itemId || obj.name,
          sceneId: props.sceneId,
        });
      }
    }
  }

  /** 创建玩家 Sprite */
  private createPlayer(entry: typeof MapRegistry[string], spawnId: string) {
    const spawnLayer = this.map.getObjectLayer("player_spawn");
    let sx = entry.width / 2;
    let sy = entry.height / 2;

    if (spawnLayer) {
      const spawn = spawnLayer.objects.find((o) => o.name === spawnId);
      if (spawn) {
        sx = spawn.x! + (spawn.width ?? 32) / 2;
        sy = spawn.y! + (spawn.height ?? 32) / 2;
      }
    }

    // 用第一帧纹理（朝下站立）创建玩家 sprite
    // 精灵原生尺寸 32×64，3x 缩放后在 1692×929 地图上可见约 96×192 像素
    this.player = this.add.sprite(sx, sy, "yps_frames_stand_front_0");
    this.player.setScale(3);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    // 碰撞体集中在角色脚部区域（本地坐标，scale=3 后约 36×36 世界像素）
    body.setSize(12, 12);
    body.setOffset(10, 48);

    // 初始待机动画（默认朝下）
    this.player.play("yps_idle_down");

    // 碰撞注册已移至 loadMap 步骤7（collisionGroup 就绪后统一注册）
  }

  /** 监听 GameBridge 指令 */
  private listenBridge() {
    gameBridge.onReactCommand("CHANGE_MAP", (cmd) => {
      if (cmd.type === "CHANGE_MAP") {
        this.transitionToMap(cmd.mapId, cmd.spawnId);
      }
    });
    gameBridge.onReactCommand("FREEZE_PLAYER", () => {
      this.playerCtrl?.freeze();
    });
    gameBridge.onReactCommand("UNFREEZE_PLAYER", () => {
      this.playerCtrl?.unfreeze();
    });
    gameBridge.onReactCommand("STORY_EVENT", (cmd) => {
      if (cmd.type !== "STORY_EVENT") return;
      this.handleStoryEvent(cmd.eventId, cmd.payload);
    });
  }

  /** 处理剧情事件 */
  private handleStoryEvent(eventId: string, payload?: Record<string, unknown>) {
    console.log(`[MapScene] 📖 剧情事件: ${eventId}`, payload);
    switch (eventId) {
      case "player_sit_down": {
        // 玩家在当前位置坐下（朝前）
        this.playerCtrl?.sit(this.player.y, false, this.map.heightInPixels || 600);
        break;
      }
      case "player_stand_up": {
        this.playerCtrl?.standUp();
        break;
      }
      case "teleport_to_spawn": {
        // 传送到指定出生点
        const spawnId = payload?.spawnId as string;
        if (!spawnId) break;
        const spawnLayer = this.map.getObjectLayer("player_spawn");
        if (spawnLayer) {
          const spawn = spawnLayer.objects.find((o) => o.name === spawnId);
          if (spawn) {
            this.player.x = spawn.x! + (spawn.width ?? 32) / 2;
            this.player.y = spawn.y! + (spawn.height ?? 32) / 2;
          }
        }
        break;
      }
      case "flash_screen": {
        // 屏幕闪光效果
        const duration = (payload?.duration as number) || 300;
        const flash = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          this.cameras.main.width,
          this.cameras.main.height,
          0xffffff, 1
        ).setDepth(10000).setScrollFactor(0);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration,
          onComplete: () => flash.destroy(),
        });
        break;
      }
      case "darken_overlay": {
        // 叠加变暗效果
        const alpha = (payload?.alpha as number) || 0.6;
        const overlay = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          this.cameras.main.width,
          this.cameras.main.height,
          0x000000, alpha
        ).setDepth(9999).setScrollFactor(0);
        // 保存在 registry 中以便后续移除
        this.registry.set("darkOverlay", overlay);
        break;
      }
      case "remove_dark_overlay": {
        const overlay = this.registry.get("darkOverlay") as Phaser.GameObjects.Rectangle | undefined;
        if (overlay) {
          this.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: 500,
            onComplete: () => overlay.destroy(),
          });
          this.registry.remove("darkOverlay");
        }
        break;
      }
      case "spotlight_player": {
        // 玩家位置聚光效果（电脑屏幕照亮面部）
        const overlay = this.registry.get("darkOverlay") as Phaser.GameObjects.Rectangle | undefined;
        if (!overlay) break;
        // 用圆形蒙版在玩家位置挖一个亮孔（简化：在玩家上方加一个半透明亮圈）
        const glow = this.add.ellipse(
          this.player.x, this.player.y - 40,
          120, 80,
          0xffdd88, 0.15
        ).setDepth(10000).setScrollFactor(0);
        this.registry.set("playerGlow", glow);
        break;
      }
      case "update_glow_position": {
        // 更新聚光位置跟随玩家
        const glow = this.registry.get("playerGlow") as Phaser.GameObjects.Ellipse | undefined;
        if (glow) {
          glow.setPosition(this.player.x, this.player.y - 40);
        }
        break;
      }
    }
  }

  /** 地图切换（淡入淡出） */
  private transitionToMap(mapId: string, spawnId: string) {
    console.log(`[MapScene] 🗺️ 开始切换地图: ${mapId} (spawn=${spawnId})`);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // 清理旧子系统引用（loadMap 中 children.removeAll 会销毁所有游戏对象）
      this.playerCtrl = null as unknown as PlayerController;
      this.triggerSys = null as unknown as TriggerSystem;
      this.interactionSys = null as unknown as InteractionSystem;

      this.loadMap(mapId, spawnId);
      this.cameras.main.fadeIn(300, 0, 0, 0);
    });
  }

  /** 从 Tiled properties 数组提取值 */
  private getProps(
    properties?: { name: string; type?: string; value: unknown }[]
  ): Record<string, string> {
    const result: Record<string, string> = {};
    if (!properties) return result;
    for (const p of properties) {
      result[p.name] = String(p.value);
    }
    return result;
  }

  update(_time: number, delta: number) {
    this.playerCtrl?.update(delta);
    this.interactionSys?.update();
    this.triggerSys?.update();
    // 更新聚光位置（跟随玩家）
    const glow = this.registry.get("playerGlow") as Phaser.GameObjects.Ellipse | undefined;
    if (glow) {
      glow.setPosition(this.player.x, this.player.y - 40);
    }
    // Y 排序（坐下时保持坐下设定的深度，不重新计算）
    if (!this.playerCtrl?.sitting) {
      if (this.map && this.map.heightInPixels) {
        this.player.setDepth(this.player.y / this.map.heightInPixels);
      } else {
        const entry = MapRegistry[this.currentMapId];
        if (entry) {
          this.player.setDepth(this.player.y / entry.height);
        }
      }
    }
  }
}
