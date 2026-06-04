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

    // === 3. 处理对象层 ===
    this.collisionGroup = this.physics.add.staticGroup();
    this.processObjectLayers(entry, spawnId || entry.defaultSpawn);

    // === 4. 创建玩家 ===
    this.createPlayer(entry, spawnId || entry.defaultSpawn);

    // === 5. 设置世界边界 & 相机 ===
    this.physics.world.setBounds(0, 0, entry.width, entry.height);
    this.cameras.main.setBounds(0, 0, entry.width, entry.height);
    const lerp = entry.width > 2000 ? 0.05 : 0.08;
    this.cameras.main.startFollow(this.player, true, lerp, lerp);

    // === 6. 初始化子系统 ===
    this.playerCtrl = new PlayerController(this, this.player);
    this.interactionSys = new InteractionSystem(this, this.player);
    this.interactionSys.setOnSit((chairY, sitInFront) => {
      this.playerCtrl?.sit(chairY, sitInFront);
    });
    this.triggerSys = new TriggerSystem(this, this.player);
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
    const furnitureLayer = this.map.getObjectLayer("furniture_objects");
    if (furnitureLayer && entry.furnitureImages) {
      for (const obj of furnitureLayer.objects) {
        const name = obj.name;
        const match = entry.furnitureImages.find((f) => f.key === name);
        if (match) {
          const props = this.getProps(obj.properties);
          const sx = obj.x! + (obj.width ?? 128) / 2;
          const sy = obj.y! + (obj.height ?? 128) / 2;
          const sprite = this.add.image(sx, sy, match.key);
          // Y 排序：y 坐标越大越靠前
          sprite.setDepth((obj.y ?? 0) / entry.height);
          // 条件创建碰撞（可穿越的家具跳过）
          if (props.walkable !== "true") {
            const zone = this.add.zone(sx, sy, obj.width ?? 128, obj.height ?? 128);
            this.physics.add.existing(zone, true);
            this.collisionGroup.add(zone);
          }
          // 条件注册交互（E键）
          if (props.interactable === "true") {
            this.interactionSys?.registerInteractable({
              x: sx,
              y: sy,
              type: "item",
              id: props.interactSceneId || name,
              sceneId: props.interactSceneId || name,
              sitAction: props.sitAction === "true",
              sitInFront: props.sitInFront !== "false", // 默认坐椅子前面
              chairY: obj.y! + (obj.height ?? 256),
            });
          }
        }
      }
    }

    // --- triggers ---
    const triggerLayer = this.map.getObjectLayer("triggers");
    if (triggerLayer) {
      for (const obj of triggerLayer.objects) {
        const props = this.getProps(obj.properties);
        const zone = this.add.zone(
          obj.x! + (obj.width ?? 64) / 2,
          obj.y! + (obj.height ?? 64) / 2,
          obj.width ?? 64,
          obj.height ?? 64
        );
        this.physics.add.existing(zone, true);
        this.triggerSys?.registerTrigger(zone as unknown as Phaser.GameObjects.Zone, {
          type: props.triggerType || props.type || "door",
          sceneId: props.sceneId,
          targetMap: props.targetMap,
          spawnId: props.targetSpawn || props.spawnId,
          itemId: props.itemId,
          requireFlag: props.requireFlag,
          setFlag: props.setFlag,
          once: props.once === "true",
        });
      }
    }

    // --- npcs ---
    const npcLayer = this.map.getObjectLayer("npcs");
    if (npcLayer) {
      for (const obj of npcLayer.objects) {
        const props = this.getProps(obj.properties);
        const rect = this.add.rectangle(
          obj.x! + (obj.width ?? 32) / 2,
          obj.y! + (obj.height ?? 32) / 2,
          obj.width ?? 32,
          obj.height ?? 32,
          0x4488ff,
          0.6
        );
        rect.setDepth((obj.y ?? 0) / (this.map.heightInPixels || entry.height));
        // NPC 碰撞体（用 zone + physics 替代 staticBody 直接添加）
        const npcZone = this.add.zone(
          obj.x! + (obj.width ?? 32) / 2,
          obj.y! + (obj.height ?? 32) / 2,
          obj.width ?? 32,
          obj.height ?? 32
        );
        this.physics.add.existing(npcZone, true);
        this.collisionGroup.add(npcZone);
        // 注册为可交互对象
        this.interactionSys?.registerInteractable({
          x: obj.x! + (obj.width ?? 32) / 2,
          y: obj.y! + (obj.height ?? 32) / 2,
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
    // 后续动画 play() 会自动切换纹理帧
    this.player = this.add.sprite(sx, sy, "yps_frames_stand_front_0");
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
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
