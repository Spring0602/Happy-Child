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
    this.loadMap(this.currentMapId);
    this.listenBridge();
  }

  /** 加载一张地图 */
  private loadMap(mapId: string, spawnId?: string) {
    const entry = MapRegistry[mapId];
    if (!entry) {
      console.error(`地图 ${mapId} 未注册`);
      return;
    }

    // 清理旧场景对象
    this.children.removeAll(true);

    // 注册当前地图到 scene registry
    this.registry.set("currentMapId", mapId);

    // === 1. 铺地面底图 ===
    this.add.image(0, 0, entry.groundKey).setOrigin(0, 0).setDepth(0);

    // === 2. 解析 tilemap JSON（仅用于读取对象层） ===
    this.map = this.make.tilemap({ key: entry.mapKey });
    // 添加占位 tileset（Phaser 要求 tilemap 必须有关联 tileset，即使不渲染 tile 图层）
    if (entry.tilesetKey && entry.tilesetNameInTiled) {
      this.map.addTilesetImage(
        entry.tilesetNameInTiled,
        entry.tilesetKey,
        entry.tileWidth,
        entry.tileHeight,
        0,
        0
      );
    }

    // === 3. 创建玩家（需要先于子系统创建） ===
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
  }

  /** 处理 Tiled 对象层 */
  private processObjectLayers(entry: typeof MapRegistry[string], defaultSpawn: string) {
    // --- collision ---
    const collisionLayer = this.map.getObjectLayer("collision");
    if (collisionLayer) {
      for (const obj of collisionLayer.objects) {
        const zone = this.add.zone(
          obj.x! + (obj.width ?? 32) / 2,
          obj.y! + (obj.height ?? 32) / 2,
          obj.width ?? 32,
          obj.height ?? 32
        );
        this.physics.add.existing(zone, true);
        this.collisionGroup.add(zone);
      }
    }

    // --- furniture_objects ---
    // 渲染独立家具精灵图，用于实现 Y 轴深度排序（玩家 ← 家具前后遮挡）
    // 家具 PNG 是透明裁切图，覆盖在底图同类家具上，视觉上无缝衔接
    const furnitureLayer = this.map.getObjectLayer("furniture_objects");
    console.log(`[MapScene] 📦 furniture_objects layer: ${furnitureLayer ? `found (${furnitureLayer.objects.length} objects)` : "NOT FOUND!"}`);
    console.log(`[MapScene] 🖼️  furnitureImages: ${entry.furnitureImages ? `${entry.furnitureImages.length} entries` : "undefined"}`);
    let registeredCount = 0;
    let renderedCount = 0;
    if (furnitureLayer && entry.furnitureImages) {
      for (const obj of furnitureLayer.objects) {
        const name = obj.name;
        const match = entry.furnitureImages.find((f) => f.key === name);
        if (match) {
          const props = this.getProps(obj.properties);
          const objW = obj.width ?? 256;
          const objH = obj.height ?? 256;
          const sx = obj.x! + objW / 2;
          const sy = obj.y! + objH / 2;
          // 家具深度 = 底部 Y 坐标归一化（让家具与玩家按 Y 轴正确排序）
          const furnDepth = (obj.y! + objH) / entry.height;

          // 渲染家具精灵图（覆盖底图家具，实现 Y 轴深度前后遮挡）
          // 精灵图均为 256×256 透明裁切，渲染时保持原始比例不拉伸
          const furnImg = this.add.image(sx, sy, match.key);
          furnImg.setDepth(furnDepth);
          // 叠图精灵统一降低亮度，与底图色调融合
          furnImg.setTint(0xcccccc);
          renderedCount++;

          // 条件创建碰撞（可穿越的家具跳过，如 walkable=true 的椅子）
          if (props.walkable !== "true") {
            const zone = this.add.zone(sx, sy, objW, objH);
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
      console.log(`[MapScene] 📊 furniture 总数: 渲染=${renderedCount}, 可交互注册=${registeredCount}`);
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
    // 碰撞体（本地坐标 32×64，会随 scale=3 自动缩放为 60×114）
    body.setSize(20, 38);
    body.setOffset(6, 26);

    // 初始待机动画（默认朝下）
    this.player.play("yps_idle_down");

    // 碰撞：玩家 vs 碰撞组
    this.physics.add.collider(this.player, this.collisionGroup);
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
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
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
