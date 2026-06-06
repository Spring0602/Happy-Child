/** Tiled 对象的自定义属性 */
export interface TiledCustomProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}

/** 地图注册条目 */
export interface MapEntry {
  mapKey: string;               // Phaser tilemap key
  mapJson: string;              // Tiled JSON 路径
  groundKey: string;            // 底图 Phaser image key
  groundImage: string;          // 底图文件路径
  tilesetKey: string;           // 占位 tileset 的 Phaser key（Phaser tilemap 要求必须有至少一个 tileset）
  tilesetImage: string;         // 占位 tileset 图片路径
  tilesetNameInTiled: string;   // Tiled 编辑器中此 tileset 的 name 属性（须与 map.json tilesets[0].name 一致）
  defaultSpawn: string;
  furnitureImages?: {
    key: string;
    path: string;
  }[];
  width: number;                // 地图宽度（像素，须与底图实际尺寸一致）
  height: number;               // 地图高度（像素，须与底图实际尺寸一致）
  tileWidth: number;            // 单个 tile 宽度（默认 32）
  tileHeight: number;           // 单个 tile 高度（默认 32）
}

/** GameBridge: Phaser → React 事件 */
export type PhaserToReactEvent =
  | { type: "TRIGGER_DIALOGUE"; sceneId: string; mapId: string }
  | { type: "TRIGGER_ITEM"; itemId: string; mapId: string }
  | { type: "TRIGGER_DOOR"; targetMap: string; spawnId: string };

/** GameBridge: React → Phaser 指令 */
export type ReactToPhaserCommand =
  | { type: "CHANGE_MAP"; mapId: string; spawnId: string }
  | { type: "FREEZE_PLAYER" }
  | { type: "UNFREEZE_PLAYER" }
  | { type: "STORY_EVENT"; eventId: string; payload?: Record<string, unknown> };
