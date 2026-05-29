import { MapRegistry } from "./mapRegistry";

/**
 * 资源清单（单一数据源：从 MapRegistry 派生地图数据）
 *
 * ⚠️ 新增地图只需修改 mapRegistry.ts，本文件会自动同步。
 * sprites 部分是本文件独有的（角色精灵图配置）。
 */

// ── 仅加载家庭区域地图（排除学校区域用于调试）──
const FAMILY_MAPS = ["livingroom", "bathroom", "bedroom", "bedroom_parents", "kitchen"];

export const AssetManifest = {
  /** 地图资源 —— 从 MapRegistry 自动派生（临时过滤） */
  maps: Object.fromEntries(
    Object.entries(MapRegistry)
      .filter(([id]) => FAMILY_MAPS.includes(id))
      .map(([id, entry]) => [
        id,
        {
          mapKey: entry.mapKey,
          mapJson: entry.mapJson,
          groundKey: entry.groundKey,
          groundImage: entry.groundImage,
          furnitureImages: entry.furnitureImages,
        },
      ])
  ),

  /**
   * 角色精灵图（独立维护，与地图无关）
   *
   * 布局：256×256 px，3行×8列
   *   行0（前/W）：前跑0~5 + 前站6 + 前坐7
   *   行1（左/A）：左跑0~5 + 左站14 + 左坐15（右/D = 行1镜像）
   *   行2（后/S）：后跑0~5 + 后站22 + 后坐23
   *
   * frameWidth=32（256/8列），frameHeight≈85（256/3行，底部1px偏差可忽略）
   */
  sprites: {
    yps: {
      key: "sprite_yps",
      image: "/assets/sprites/yps.png",
      frameWidth: 32,
      frameHeight: 85,
    },
    ly: {
      key: "sprite_ly",
      image: "/assets/sprites/ly.png",
      frameWidth: 32,
      frameHeight: 85,
    },
  },
} as const;
