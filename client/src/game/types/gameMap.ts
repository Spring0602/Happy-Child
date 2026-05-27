/** Tiled 对象的自定义属性 */
export interface TiledCustomProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}

/** 地图注册条目 */
export interface MapEntry {
  mapKey: string;
  mapJson: string;
  groundKey: string;
  groundImage: string;
  defaultSpawn: string;
  furnitureImages?: {
    key: string;
    path: string;
  }[];
  width: number;
  height: number;
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
  | { type: "UNFREEZE_PLAYER" };
