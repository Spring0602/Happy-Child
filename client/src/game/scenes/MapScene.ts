import Phaser from "phaser";
import { MapRegistry } from "../config/mapRegistry";
import { gameBridge } from "../bridge/GameBridge";
import { PlayerController } from "../systems/PlayerController";
import { InteractionSystem } from "../systems/InteractionSystem";
import { TriggerSystem } from "../systems/TriggerSystem";

/** NPC → 精灵渲染配置 */
interface NpcSpriteConfig {
  spriteKey: string;
  animPrefix: string;
  idleAnim: string;
}

const NPC_SPRITE_MAP: Record<string, NpcSpriteConfig> = {
  liuyu: {
    spriteKey: "sprite_ly",
    animPrefix: "ly",
    idleAnim: "ly_idle_down",
  },
};

/** 协助 Phaser 内部清理 colliders */
function destroyColliders(world: Phaser.Physics.Arcade.World) {
  const colliders = world.colliders as unknown as Array<{ destroy?: () => void }>;
  if (!colliders || !colliders.length) return;
  for (const c of colliders) {
    if (c && typeof c.destroy === "function") {
      c.destroy();
    }
  }
}

export class MapScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private player!: Phaser.GameObjects.Sprite;
  private playerCtrl!: PlayerController;
  private interactionSys!: InteractionSystem;
  private triggerSys!: TriggerSystem;
  private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
  private currentMapId = "";
  private loadedMaps = new Set<string>();
  private pendingTransition: { mapId: string; spawnId: string } | null = null;
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "MapScene" });
  }

  // ════════════════════════════════════════
  //  生命周期
  // ════════════════════════════════════════

  init(data: { mapId: string }) {
    this.currentMapId = data.mapId;
  }

  create() {
    let loadFailed = false;
    try {
      this.loadMap(this.currentMapId);
    } catch (err) {
      console.error("[MapScene] loadMap 失败:", err);
      loadFailed = true;
    }

    if (loadFailed || !this.player) {
      console.error("[MapScene] 玩家精灵未创建");
      this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          "地图加载失败\n请刷新页面重试",
          {
            fontSize: "20px",
            color: "#ff4444",
            align: "center",
            backgroundColor: "#000000cc",
            padding: { x: 20, y: 12 },
          }
        )
        .setOrigin(0.5)
        .setDepth(9999);
      return;
    }

    try {
      this.listenBridge();
    } catch (err) {
      console.error("[MapScene] listenBridge 失败:", err);
    }
  }

  // ════════════════════════════════════════
  //  按需地图加载
  // ════════════════════════════════════════

  private ensureMapLoaded(mapId: string, onComplete: () => void) {
    if (this.loadedMaps.has(mapId)) {
      onComplete();
      return;
    }

    const entry = MapRegistry[mapId];
    if (!entry) {
      console.warn(`[MapScene] 地图 ${mapId} 未注册`);
      onComplete();
      return;
    }

    let filesToLoad = 0;

    if (!this.cache.tilemap.exists(entry.mapKey)) {
      filesToLoad++;
      this.load.tilemapTiledJSON(entry.mapKey, entry.mapJson);
    }

    if (!this.textures.exists(entry.groundKey)) {
      filesToLoad++;
      this.load.image(entry.groundKey, entry.groundImage);
    }

    if (entry.furnitureImages) {
      for (const img of entry.furnitureImages) {
        filesToLoad++;
        this.load.image(img.key, img.path);
      }
    }

    if (filesToLoad === 0) {
      this.loadedMaps.add(mapId);
      onComplete();
      return;
    }

    let filesLoaded = 0;
    const onFileDone = () => {
      filesLoaded++;
      if (filesLoaded >= filesToLoad) {
        this.load.off("filecomplete", onFileDone);
        this.load.off("loaderror", onFileDone);
        this.loadedMaps.add(mapId);
        onComplete();
      }
    };

    this.load.on("filecomplete", onFileDone);
    this.load.on("loaderror", onFileDone);
    this.load.start();
  }

  // ════════════════════════════════════════
  //  核心：加载地图
  // ════════════════════════════════════════

  private loadMap(mapId: string, spawnId?: string) {
    const entry = MapRegistry[mapId];
    if (!entry) {
      console.error(`[MapScene] 地图 ${mapId} 未注册`);
      return;
    }

    // ── 清理旧场景 ──
    this.cleanupScene();

    // ── 标记已加载 ──
    this.loadedMaps.add(mapId);
    this.registry.set("currentMapId", mapId);

    // ── 1. 地面底图 ──
    if (this.textures.exists(entry.groundKey)) {
      const ground = this.add.image(0, 0, entry.groundKey).setOrigin(0, 0).setDepth(0);
      this.sceneObjects.push(ground);
    } else {
      const bg = this.add.rectangle(entry.width / 2, entry.height / 2, entry.width, entry.height, 0x1a1a2e)
        .setOrigin(0.5).setDepth(0);
      this.sceneObjects.push(bg);
    }

    // ── 2. 解析 tilemap ──
    try {
      this.map = this.make.tilemap({ key: entry.mapKey });
    } catch (err) {
      console.error(`[MapScene] 地图 JSON 解析失败 (${mapId}):`, err);
      return;
    }

    // ── 3. 碰撞组 + 玩家 ──
    this.collisionGroup = this.physics.add.staticGroup();
    this.createPlayer(entry, spawnId || entry.defaultSpawn);

    // ── 4. 子系统 ──
    this.playerCtrl = new PlayerController(this, this.player, "yps");
    this.interactionSys = new InteractionSystem(this, this.player);
    const mapHeight = entry.height;
    this.interactionSys.setOnSit((chairY, sitInFront) => {
      this.playerCtrl?.sit(chairY, sitInFront, mapHeight);
    });
    this.triggerSys = new TriggerSystem(this, this.player);

    // ── 5. 处理对象层 ──
    this.processCollisionLayer();
    this.processFurnitureLayer(entry);
    this.processTriggerLayer();
    this.processNpcLayer(entry);
    this.processItemLayer();

    // ── 6. 世界边界 + 相机 ──
    try {
      this.physics.world.setBounds(0, 0, entry.width, entry.height);
      this.cameras.main.setBounds(0, 0, entry.width, entry.height);
      const lerp = entry.width > 2000 ? 0.05 : 0.08;
      this.cameras.main.startFollow(this.player, true, lerp, lerp);
    } catch (err) {
      console.error("[MapScene] 相机设置失败:", err);
    }
  }

  // ════════════════════════════════════════
  //  分层对象处理
  // ════════════════════════════════════════

  private processCollisionLayer() {
    try {
      const layer = this.map.getObjectLayer("collision");
      if (!layer) return;
      for (const obj of layer.objects) {
        const cx = obj.x! + (obj.width ?? 32) / 2;
        const cy = obj.y! + (obj.height ?? 32) / 2;
        const zone = this.add.zone(cx, cy, obj.width ?? 32, obj.height ?? 32);
        zone.setVisible(false);
        this.physics.add.existing(zone, true);
        this.collisionGroup.add(zone);
        this.sceneObjects.push(zone);
      }
    } catch (err) {
      console.error("[MapScene] collision 层处理失败:", err);
    }
  }

  private processFurnitureLayer(entry: typeof MapRegistry[string]) {
    try {
      const layer = this.map.getObjectLayer("furniture_objects");
      if (!layer || !entry.furnitureImages) return;

      for (const obj of layer.objects) {
        const match = entry.furnitureImages.find((f) => f.key === obj.name);
        if (!match) continue;

        const props = this.getProps(obj.properties);
        const sx = obj.x! + (obj.width ?? 128) / 2;
        const sy = obj.y! + (obj.height ?? 128) / 2;

        // 渲染家具图片
        const sprite = this.add.image(sx, sy, match.key);
        sprite.setDepth((obj.y ?? 0) / entry.height);
        this.sceneObjects.push(sprite);

        // 碰撞（默认不阻挡，仅 blockWalk=true 时阻挡）
        if (props.blockWalk === "true") {
          const cx = obj.x! + (obj.width ?? 128) / 2;
          const cy = obj.y! + (obj.height ?? 128) / 2;
          const zone = this.add.zone(cx, cy, obj.width ?? 128, obj.height ?? 128);
          zone.setVisible(false);
          this.physics.add.existing(zone, true);
          this.collisionGroup.add(zone);
          this.sceneObjects.push(zone);
        }

        // 交互注册
        if (props.interactable === "true") {
          this.interactionSys?.registerInteractable({
            x: sx, y: sy,
            type: "item",
            id: props.interactSceneId || obj.name,
            sceneId: props.interactSceneId || obj.name,
            sitAction: props.sitAction === "true",
            sitInFront: props.sitInFront !== "false",
            chairY: obj.y! + (obj.height ?? 256),
          });
        }
      }
    } catch (err) {
      console.error("[MapScene] furniture 层处理失败:", err);
    }
  }

  private processTriggerLayer() {
    try {
      const layer = this.map.getObjectLayer("triggers");
      if (!layer) return;
      for (const obj of layer.objects) {
        const props = this.getProps(obj.properties);
        const zone = this.add.zone(
          obj.x! + (obj.width ?? 64) / 2,
          obj.y! + (obj.height ?? 64) / 2,
          obj.width ?? 64,
          obj.height ?? 64
        );
        zone.setVisible(false);
        this.physics.add.existing(zone, true);
        this.sceneObjects.push(zone);

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
    } catch (err) {
      console.error("[MapScene] triggers 层处理失败:", err);
    }
  }

  private processNpcLayer(entry: typeof MapRegistry[string]) {
    try {
      const layer = this.map.getObjectLayer("npcs");
      if (!layer) return;
      for (const obj of layer.objects) {
        const props = this.getProps(obj.properties);
        const mx = obj.x! + (obj.width ?? 32) / 2;
        const my = obj.y! + (obj.height ?? 32) / 2;
        const depth = (obj.y ?? 0) / (this.map.heightInPixels || entry.height);

        const spriteCfg = NPC_SPRITE_MAP[props.npcId];
        if (spriteCfg) {
          // 有精灵图的 NPC：渲染动画精灵
          const npc = this.add.sprite(mx, my, spriteCfg.spriteKey);
          npc.setDepth(depth);
          npc.play(spriteCfg.idleAnim);
          this.sceneObjects.push(npc);
        } else {
          // 无精灵图的 NPC：渲染角色名标签 + 占位矩形（优雅降级）
          const npcName = props.npcId || obj.name.replace("npc_", "");
          const displayName = {
            "mother": "母亲", "father": "父亲", "wangTeacher": "王老师",
            "zhouQirui": "周骐瑞", "zhouJunxiu": "周隽秀", "linZhixuan": "林芷萱",
          }[npcName] || npcName;
          const rect = this.add.rectangle(mx, my - 8, 48, 12, 0x333344, 0.9).setDepth(depth);
          const nameLabel = this.add.text(mx, my - 8, displayName, {
            fontSize: "10px", color: "#ccccff", align: "center",
          }).setOrigin(0.5).setDepth(depth + 0.001);
          // 小人物标记
          const marker = this.add.rectangle(mx, my + 8, 20, 28, 0x5566aa, 0.7).setDepth(depth);
          this.sceneObjects.push(rect, nameLabel, marker);
        }

        // NPC 碰撞体
        const cx = obj.x! + (obj.width ?? 32) / 2;
        const cy = obj.y! + (obj.height ?? 32) / 2;
        const zone = this.add.zone(cx, cy, obj.width ?? 32, obj.height ?? 32);
        zone.setVisible(false);
        this.physics.add.existing(zone, true);
        this.collisionGroup.add(zone);
        this.sceneObjects.push(zone);

        // 注册交互
        this.interactionSys?.registerInteractable({
          x: mx, y: my,
          type: "npc",
          id: props.npcId || obj.name,
          sceneId: props.sceneId,
        });
      }
    } catch (err) {
      console.error("[MapScene] npcs 层处理失败:", err);
    }
  }

  private processItemLayer() {
    try {
      const layer = this.map.getObjectLayer("items");
      if (!layer) return;
      for (const obj of layer.objects) {
        const props = this.getProps(obj.properties);
        this.interactionSys?.registerInteractable({
          x: obj.x! + (obj.width ?? 24) / 2,
          y: obj.y! + (obj.height ?? 24) / 2,
          type: "item",
          id: props.itemId || obj.name,
          sceneId: props.sceneId,
        });
      }
    } catch (err) {
      console.error("[MapScene] items 层处理失败:", err);
    }
  }

  // ════════════════════════════════════════
  //  玩家创建
  // ════════════════════════════════════════

  private createPlayer(entry: typeof MapRegistry[string], spawnId: string) {
    // 防止"分身"：创建前清理所有残留的 yps/ly 精灵
    for (const obj of [...this.children.list]) {
      if (obj instanceof Phaser.GameObjects.Sprite && obj.active
          && obj.texture
          && (obj.texture.key === "sprite_yps" || obj.texture.key === "sprite_ly")) {
        try { obj.destroy(); } catch { /* ignore */ }
      }
    }

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

    if (!this.textures.exists("sprite_yps")) {
      console.error("[MapScene] 纹理 'sprite_yps' 不存在");
      this.player = this.add.sprite(sx, sy, "__DEFAULT");
    } else {
      this.player = this.add.sprite(sx, sy, "sprite_yps");
    }

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(22, 40);
    body.setOffset(7, 24);

    // 碰撞：玩家 vs 碰撞组
    this.physics.add.collider(this.player, this.collisionGroup);

    // 初始动画
    if (this.anims.exists("yps_idle_down")) {
      this.player.play("yps_idle_down");
    }
  }

  // ════════════════════════════════════════
  //  场景清理
  // ════════════════════════════════════════

  private cleanupScene() {
    // 释放旧系统引用
    this.playerCtrl = undefined!;
    this.interactionSys = undefined!;
    this.triggerSys = undefined!;

    // 显式销毁玩家精灵（防止残留导致"分身"）
    if (this.player) {
      try {
        this.player.destroy();
        this.physics.world.remove(this.player.body);
      } catch { /* ignore */ }
      this.player = null as unknown as Phaser.GameObjects.Sprite;
    }

    // 清理碰撞器
    destroyColliders(this.physics.world);

    // 销毁所有追踪的场景对象
    for (const obj of this.sceneObjects) {
      try { obj.destroy(); } catch { /* ignore */ }
    }
    this.sceneObjects = [];

    // 销毁碰撞组
    if (this.collisionGroup) {
      try { this.collisionGroup.destroy(true); } catch { /* ignore */ }
      this.collisionGroup = undefined!;
    }

    // 最后兜底清理
    this.children.removeAll(true);
  }

  // ════════════════════════════════════════
  //  Bridge 监听
  // ════════════════════════════════════════

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

  // ════════════════════════════════════════
  //  地图切换
  // ════════════════════════════════════════

  private transitionToMap(mapId: string, spawnId: string) {
    if (this.pendingTransition) return;
    this.pendingTransition = { mapId, spawnId };

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (!this.pendingTransition) return;
      const { mapId: targetMapId, spawnId: targetSpawn } = this.pendingTransition;

      this.ensureMapLoaded(targetMapId, () => {
        if (!this.pendingTransition) return;
        this.pendingTransition = null;
        try {
          this.loadMap(targetMapId, targetSpawn);
        } catch (err) {
          console.error("[MapScene] transitionToMap 失败:", err);
        }
        this.cameras.main.fadeIn(300, 0, 0, 0);
      });
    });
  }

  // ════════════════════════════════════════
  //  工具方法
  // ════════════════════════════════════════

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

  // ════════════════════════════════════════
  //  主循环
  // ════════════════════════════════════════

  /** 每帧检查并清除多余的角色精灵（防分身） */
  private dedupPlayerSprite() {
    if (!this.player || !this.player.active) return;
    const allObjs = this.children.list;
    const candidates: Phaser.GameObjects.Sprite[] = [];
    for (const obj of allObjs) {
      if (obj instanceof Phaser.GameObjects.Sprite && obj.active
          && obj.texture
          && (obj.texture.key === "sprite_yps" || obj.texture.key === "sprite_ly")) {
        candidates.push(obj);
      }
    }
    for (const s of candidates) {
      if (s !== this.player) {
        try { s.destroy(); } catch { /* ignore */ }
      }
    }
  }

  update(_time: number, delta: number) {
    if (!this.playerCtrl) return;
    this.playerCtrl.update(delta);
    this.interactionSys?.update();
    this.triggerSys?.update();

    // 防分身：每帧扫描清除多余角色精灵
    this.dedupPlayerSprite();

    // Y 深度排序
    if (!this.playerCtrl.sitting) {
      if (this.map?.heightInPixels) {
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
