export const AssetManifest = {
  maps: {
    livingroom: {
      mapKey: "map_livingroom",
      mapJson: "/assets/maps/livingroom/map.json",
      groundKey: "ground_livingroom",
      groundImage: "/assets/maps/livingroom/客厅.png",
      furnitureImages: [
        { key: "item_01", path: "/assets/maps/livingroom/客厅物品_sprites/item_01.png" },
        { key: "item_02", path: "/assets/maps/livingroom/客厅物品_sprites/item_02.png" },
        { key: "item_03", path: "/assets/maps/livingroom/客厅物品_sprites/item_03.png" },
        { key: "item_04", path: "/assets/maps/livingroom/客厅物品_sprites/item_04.png" },
        { key: "item_05", path: "/assets/maps/livingroom/客厅物品_sprites/item_05.png" },
        { key: "item_06", path: "/assets/maps/livingroom/客厅物品_sprites/item_06.png" },
        { key: "item_06_flip", path: "/assets/maps/livingroom/客厅物品_sprites/item_06_flip.png" },
        { key: "item_07", path: "/assets/maps/livingroom/客厅物品_sprites/item_07.png" },
        { key: "item_08", path: "/assets/maps/livingroom/客厅物品_sprites/item_08.png" },
        { key: "item_09", path: "/assets/maps/livingroom/客厅物品_sprites/item_09.png" },
        { key: "item_10", path: "/assets/maps/livingroom/客厅物品_sprites/item_10.png" },
        { key: "item_11", path: "/assets/maps/livingroom/客厅物品_sprites/item_11.png" },
        { key: "item_12", path: "/assets/maps/livingroom/客厅物品_sprites/item_12.png" },
        { key: "item_13", path: "/assets/maps/livingroom/客厅物品_sprites/item_13.png" },
        { key: "item_14", path: "/assets/maps/livingroom/客厅物品_sprites/item_14.png" },
        { key: "item_15", path: "/assets/maps/livingroom/客厅物品_sprites/item_15.png" },
      ],
    },
    bathroom: {
      mapKey: "map_bathroom",
      mapJson: "/assets/maps/bathroom/map.json",
      groundKey: "ground_bathroom",
      groundImage: "/assets/maps/bathroom/卫生间.png",
    },
    bedroom: {
      mapKey: "map_bedroom",
      mapJson: "/assets/maps/bedroom/map.json",
      groundKey: "ground_bedroom",
      groundImage: "/assets/maps/bedroom/主角房间.png",
    },
    bedroom_parents: {
      mapKey: "map_bedroom_parents",
      mapJson: "/assets/maps/bedroom_parents/map.json",
      groundKey: "ground_bedroom_parents",
      groundImage: "/assets/maps/bedroom_parents/父母房间.png",
    },
    kitchen: {
      mapKey: "map_kitchen",
      mapJson: "/assets/maps/kitchen/map.json",
      groundKey: "ground_kitchen",
      groundImage: "/assets/maps/kitchen/厨房.png",
    },
  },
  sprites: {
    yps: {
      key: "sprite_yps",
      image: "/assets/sprites/yps.png",
      frameWidth: 32,   // 256/8 = 32（每行8帧: 6跑步+1站立+1坐下）
      frameHeight: 85,  // 256/3 ≈ 85（3行: 左/上/下朝向）
    },
  },
} as const;
