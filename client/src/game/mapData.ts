/**
 * 瓦片地图数据定义
 *
 * 基于文档 04_占位素材与地图规划规范.md 的地图设计：
 * - bedroom      叶平生房间
 * - livingroom   家庭客厅
 * - bathroom     卫生间
 * - waiting_area 候场区
 * - classroom    普通教室
 * - corridor     走廊
 * - wang_gallery 王老师画廊
 * - classroom_3  3班教室
 * - rooftop      天台
 *
 * 瓦片类型（0-4 为逻辑层，6+ 为家具装饰层）：
 *   0  = FLOOR    地板（可行走）
 *   1  = WALL     墙壁（不可通行）
 *   2  = DOOR     门（切换地图）
 *   3  = NPC      NPC（可行走，有角色数据）
 *   4  = ITEM     调查点（可行走，可调查）
 *   5  = TRIGGER  触发区（可行走，自动触发）
 *   6  = BED      床（不可通行）
 *   7  = DESK     课桌/书桌（不可通行）
 *   8  = TABLE    桌子（不可通行）
 *   9  = CHAIR    椅子（不可通行）
 *  10  = SOFA     沙发（不可通行）
 *  11  = SHELF    架子（不可通行）
 *  12  = CABINET  柜子（不可通行）
 *  13  = BOOKSHELF 书架（不可通行）
 *  14  = WINDOW   窗户（可行走-墙壁装饰）
 *  15  = MIRROR   镜子（可行走-墙壁装饰）
 *  16  = PAINTING 画框（可行走-墙壁装饰）
 *  17  = EASEL    画架（不可通行）
 *  18  = PLANT    植物（不可通行）
 */

export const TILE = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
  NPC: 3,
  ITEM: 4,
  TRIGGER: 5,
  BED: 6,
  DESK: 7,
  TABLE: 8,
  CHAIR: 9,
  SOFA: 10,
  SHELF: 11,
  CABINET: 12,
  BOOKSHELF: 13,
  WINDOW: 14,
  MIRROR: 15,
  PAINTING: 16,
  EASEL: 17,
  PLANT: 18,
} as const;

/** 瓦片大小（像素） */
export const TILE_SIZE = 32;

/** 可行走的瓦片类型 */
const WALKABLE_TILES = new Set([
  TILE.FLOOR, TILE.NPC, TILE.ITEM, TILE.TRIGGER, TILE.DOOR,
  TILE.WINDOW, TILE.MIRROR, TILE.PAINTING,
]);

/** 检查指定瓦片是否可通行 */
export function isWalkable(tile: number): boolean {
  return WALKABLE_TILES.has(tile);
}

// ══════════════════════════════════════════════
// 类型接口
// ══════════════════════════════════════════════

export interface MapNPCData {
  id: string;
  name: string;
  x: number;
  y: number;
  sceneTriggerId: string;
  sprite?: string;
  color?: string;
}

export interface MapItemData {
  id: string;
  name: string;
  x: number;
  y: number;
  sceneTriggerId?: string;
  description?: string;
  color?: string;
}

export interface MapTriggerData {
  id: string;
  x: number;
  y: number;
  sceneTriggerId: string;
}

export interface MapDoorData {
  x: number;
  y: number;
  targetMap: string;
  targetSpawn: string;
  label?: string;
}

export interface TileMapData {
  id: string;
  name: string;
  description?: string;
  tiles: number[][];
  npcs: MapNPCData[];
  items: MapItemData[];
  triggers: MapTriggerData[];
  doors: MapDoorData[];
  spawns: Record<string, { x: number; y: number }>;
  background?: string;
}

// ══════════════════════════════════════════════
// 字符→瓦片映射
// ══════════════════════════════════════════════

const CHAR_TO_TILE: Record<string, number> = {
  ".": TILE.FLOOR,
  "#": TILE.WALL,
  "D": TILE.DOOR,
  "N": TILE.NPC,
  "I": TILE.ITEM,
  "T": TILE.TRIGGER,
  "B": TILE.BED,
  "d": TILE.DESK,
  "t": TILE.TABLE,
  "c": TILE.CHAIR,
  "s": TILE.SOFA,
  "R": TILE.SHELF,
  "C": TILE.CABINET,
  "b": TILE.BOOKSHELF,
  "W": TILE.WINDOW,
  "M": TILE.MIRROR,
  "P": TILE.PAINTING,
  "e": TILE.EASEL,
  "p": TILE.PLANT,
  "S": TILE.FLOOR, // spawn = floor
};

function parseMap(raw: string[], spawnMark = "S"): {
  tiles: number[][];
  spawns: Record<string, { x: number; y: number }>;
} {
  const tiles: number[][] = [];
  const spawns: Record<string, { x: number; y: number }> = {};

  for (let y = 0; y < raw.length; y++) {
    const row: number[] = [];
    for (let x = 0; x < raw[y].length; x++) {
      const ch = raw[y][x];
      row.push(CHAR_TO_TILE[ch] ?? TILE.FLOOR);
      if (ch === spawnMark) {
        spawns["default"] = { x, y };
      }
    }
    tiles.push(row);
  }
  return { tiles, spawns };
}

// ══════════════════════════════════════════════
// 1. 叶平生房间 bedroom (20×14)
// 布局：床/书桌/衣柜/书架 + 计划本调查点
// ══════════════════════════════════════════════

const BEDROOM_RAW = [
  "####################",
  "#.WW....bb.........#",
  "#..SS...bb.........#",
  "#......TT.........#",
  "#..BB..TT.........#",
  "#..BB..............#",
  "#........dd........#",
  "#........cc........#",
  "#D................D#",
  "#....I.............#",
  "#..................#",
  "#..........DD......#",
  "#..CC..............#",
  "####################",
];

const bedroomParsed = parseMap(BEDROOM_RAW);

export const bedroomMap: TileMapData = {
  id: "bedroom",
  name: "叶平生的房间",
  description: "严谨呆板的房间。书架上放满教辅，书桌上还有高中数学试卷。",
  tiles: bedroomParsed.tiles,
  npcs: [],
  items: [
    {
      id: "item_planbook",
      name: "计划本",
      x: 4,
      y: 9,
      sceneTriggerId: "ch2_plan_book",
      description: "封面温馨的计划本，与整个房间格格不入。",
      color: "#4CAF80",
    },
  ],
  triggers: [],
  doors: [
    { x: 11, y: 11, targetMap: "livingroom", targetSpawn: "from_bedroom", label: "家庭客厅" },
    { x: 12, y: 11, targetMap: "livingroom", targetSpawn: "from_bedroom", label: "家庭客厅" },
    { x: 1, y: 8, targetMap: "classroom", targetSpawn: "from_bedroom_class", label: "学校教室" },
    { x: 18, y: 8, targetMap: "rooftop", targetSpawn: "from_bedroom_roof", label: "天台" },
  ],
  spawns: {
    ...bedroomParsed.spawns,
    from_livingroom: { x: 9, y: 10 },
    from_classroom: { x: 3, y: 9 },
    from_rooftop: { x: 17, y: 9 },
  },
  background: "/assets/bg/bedroom_day.svg",
};

// ══════════════════════════════════════════════
// 2. 家庭客厅 livingroom (22×13)
// 布局：沙发/茶几/全家福/垃圾桶 + 父母触发区
// ══════════════════════════════════════════════

const LIVINGROOM_RAW = [
  "######################",
  "#..PP..........WW....#",
  "#..PP..........WW....#",
  "#....................#",
  "#....tt..cc..........#",
  "#....tt..ss..........#",
  "#..........ss........#",
  "#....................#",
  "#..............pp....#",
  "#...............pp...#",
  "#..DD...DD....DD.....#",
  "#..DD...DD....DD.....#",
  "######################",
];

const livingroomParsed = parseMap(LIVINGROOM_RAW);

export const livingroomMap: TileMapData = {
  id: "livingroom",
  name: "家庭客厅",
  description: "温暖却压抑的客厅。全家福里三人笑得很标准。",
  tiles: livingroomParsed.tiles,
  npcs: [
    {
      id: "father",
      name: "父亲",
      x: 6,
      y: 5,
      sceneTriggerId: "ch2_father_meet",
      color: "#8B7355",
    },
    {
      id: "mother",
      name: "母亲",
      x: 17,
      y: 8,
      sceneTriggerId: "ch3_mother_appearance",
      color: "#D4A574",
    },
  ],
  items: [
    {
      id: "item_family_photo",
      name: "全家福",
      x: 2,
      y: 1,
      description: "一家三口的合影。每个人的笑容都恰到好处。",
      color: "#C4A35A",
    },
    {
      id: "item_tv",
      name: "电视机",
      x: 14,
      y: 1,
      description: "老式电视机，屏幕黑着。已经很久没人看了。",
      color: "#666688",
    },
  ],
  triggers: [
    {
      id: "trigger_family_rules",
      x: 10,
      y: 7,
      sceneTriggerId: "ch2_home_rules",
    },
  ],
  doors: [
    { x: 3, y: 10, targetMap: "bedroom", targetSpawn: "from_livingroom", label: "叶平生房间" },
    { x: 4, y: 10, targetMap: "bedroom", targetSpawn: "from_livingroom", label: "叶平生房间" },
    { x: 8, y: 10, targetMap: "bathroom", targetSpawn: "default", label: "卫生间" },
    { x: 9, y: 10, targetMap: "bathroom", targetSpawn: "default", label: "卫生间" },
    { x: 14, y: 10, targetMap: "waiting_area", targetSpawn: "default", label: "候场区" },
    { x: 15, y: 10, targetMap: "waiting_area", targetSpawn: "default", label: "候场区" },
  ],
  spawns: {
    from_bedroom: { x: 7, y: 9 },
    from_bathroom: { x: 7, y: 9 },
    from_waiting: { x: 13, y: 9 },
    default: { x: 11, y: 5 },
    ...livingroomParsed.spawns,
  },
  background: "/assets/bg/dorm_dark.svg",
};

// ══════════════════════════════════════════════
// 3. 卫生间 bathroom (16×12)
// 布局：镜子/触发区（镜中探索剧情）
// ══════════════════════════════════════════════

const BATHROOM_RAW = [
  "################",
  "#..............#",
  "#..MM..........#",
  "#..MM..........#",
  "#..............#",
  "#..............#",
  "#..............#",
  "#......TTT.....#",
  "#......TTT.....#",
  "#..............#",
  "#..DD..........#",
  "################",
];

const bathroomParsed = parseMap(BATHROOM_RAW);

export const bathroomMap: TileMapData = {
  id: "bathroom",
  name: "卫生间",
  description: "狭小的卫生间，镜面在黑暗中隐隐发光。",
  tiles: bathroomParsed.tiles,
  npcs: [],
  items: [],
  triggers: [
    {
      id: "trigger_mirror",
      x: 7,
      y: 7,
      sceneTriggerId: "ch7_mirror_approach",
    },
  ],
  doors: [
    { x: 2, y: 10, targetMap: "livingroom", targetSpawn: "from_bathroom", label: "客厅" },
    { x: 3, y: 10, targetMap: "livingroom", targetSpawn: "from_bathroom", label: "客厅" },
  ],
  spawns: {
    default: { x: 4, y: 9 },
    ...bathroomParsed.spawns,
  },
  background: "/assets/bg/dorm_dark.svg",
};

// ══════════════════════════════════════════════
// 4. 候场区 waiting_area (18×12)
// 布局：星空候场区，其他参赛者 + 门
// ══════════════════════════════════════════════

const WAITING_RAW = [
  "##################",
  "#................#",
  "#..NN............#",
  "#................#",
  "#................#",
  "#.......NN..DD...#",
  "#................#",
  "#................#",
  "#........DD......#",
  "#................#",
  "#..DD............#",
  "##################",
];

const waitingParsed = parseMap(WAITING_RAW);

export const waitingAreaMap: TileMapData = {
  id: "waiting_area",
  name: "候场区",
  description: "星辰点在四周浮现，脚下无重感，仿佛置身宇宙之间。",
  tiles: waitingParsed.tiles,
  npcs: [
    {
      id: "npc_contestant_a",
      name: "参赛者A",
      x: 2,
      y: 2,
      sceneTriggerId: "ch1_email",
      color: "#4A90D9",
    },
    {
      id: "npc_contestant_b",
      name: "参赛者B",
      x: 7,
      y: 5,
      sceneTriggerId: "ch2_skill_extract",
      color: "#7B68EE",
    },
  ],
  items: [],
  triggers: [],
  doors: [
    { x: 9, y: 8, targetMap: "classroom", targetSpawn: "default", label: "进入副本" },
    { x: 10, y: 8, targetMap: "classroom", targetSpawn: "default", label: "进入副本" },
    { x: 2, y: 10, targetMap: "livingroom", targetSpawn: "from_waiting", label: "客厅" },
    { x: 3, y: 10, targetMap: "livingroom", targetSpawn: "from_waiting", label: "客厅" },
    { x: 12, y: 5, targetMap: "bedroom", targetSpawn: "from_classroom", label: "叶平生房间" },
    { x: 13, y: 5, targetMap: "bedroom", targetSpawn: "from_classroom", label: "叶平生房间" },
  ],
  spawns: {
    default: { x: 9, y: 6 },
    from_bedroom: { x: 10, y: 7 },
    ...waitingParsed.spawns,
  },
  background: "/assets/bg/dorm_rain.svg",
};

// ══════════════════════════════════════════════
// 5. 普通教室 classroom (26×15)
// 布局：黑板/课桌/刘宇NPC/规则纸
// ══════════════════════════════════════════════

const CLASSROOM_RAW = [
  "##########################",
  "#BB....RR.................#",
  "#BB....RR.................#",
  "#.........................#",
  "#..dd.dd.dd..ee..dd.dd...#",
  "#.........................#",
  "#..dd.dd.dd.....dd.dd....#",
  "#.........................#",
  "#..dd.dd.dd.....dd.dd....#",
  "#.........................#",
  "#..dd.dd.dd..NN..dd.dd...#",
  "#.........................#",
  "#.........II..............#",
  "#................DD......#",
  "##########################",
];

const classroomParsed = parseMap(CLASSROOM_RAW);

export const classroomMap: TileMapData = {
  id: "classroom",
  name: "普通教室",
  description: "一半安静学习，一半嬉笑打闹。后排有一张谁都看不见的空座位。",
  tiles: classroomParsed.tiles,
  npcs: [
    {
      id: "liuyu",
      name: "刘宇",
      x: 14,
      y: 10,
      sceneTriggerId: "ch3_liuyu_approach",
      color: "#4A90D9",
    },
  ],
  items: [
    {
      id: "item_class_rule",
      name: "规则纸",
      x: 11,
      y: 12,
      sceneTriggerId: "ch4_classroom_rules",
      description: "一张猩红字迹的规则纸。上面写着学校的规则。",
      color: "#E74C3C",
    },
  ],
  triggers: [],
  doors: [
    { x: 17, y: 13, targetMap: "corridor", targetSpawn: "from_classroom", label: "走廊" },
    { x: 18, y: 13, targetMap: "corridor", targetSpawn: "from_classroom", label: "走廊" },
  ],
  spawns: {
    default: { x: 17, y: 11 },
    from_corridor: { x: 15, y: 12 },
    from_bedroom_class: { x: 15, y: 6 },
    ...classroomParsed.spawns,
  },
  background: "/assets/bg/classroom_evening.svg",
};

// ══════════════════════════════════════════════
// 6. 走廊 corridor (30×10)
// 布局：连接教室/画廊/3班/天台的长走廊
// ══════════════════════════════════════════════

const CORRIDOR_RAW = [
  "##############################",
  "#.WW..WW..WW..WW..WW.......#",
  "#............................#",
  "#............................#",
  "#............................#",
  "#............................#",
  "#............................#",
  "#............................#",
  "#....DD...DD....DD....DD.....#",
  "##############################",
];

const corridorParsed = parseMap(CORRIDOR_RAW);

export const corridorMap: TileMapData = {
  id: "corridor",
  name: "走廊",
  description: "昏暗的学校走廊。两侧的教室静得出奇。",
  tiles: corridorParsed.tiles,
  npcs: [],
  items: [
    {
      id: "item_notice_board",
      name: "公告栏",
      x: 14,
      y: 4,
      description: "墙上贴着各种通知。有一张被撕掉一半的'快乐成长计划'的海报。",
      color: "#D4A574",
    },
    {
      id: "item_water_fountain",
      name: "饮水机",
      x: 26,
      y: 5,
      description: "老旧饮水机，红色指示灯闪烁不定。桶里的水已经见底了。",
      color: "#5DADE2",
    },
  ],
  triggers: [],
  doors: [
    { x: 5, y: 8, targetMap: "classroom", targetSpawn: "from_corridor", label: "普通教室" },
    { x: 6, y: 8, targetMap: "classroom", targetSpawn: "from_corridor", label: "普通教室" },
    { x: 10, y: 8, targetMap: "wang_gallery", targetSpawn: "default", label: "王老师画廊" },
    { x: 11, y: 8, targetMap: "wang_gallery", targetSpawn: "default", label: "王老师画廊" },
    { x: 16, y: 8, targetMap: "classroom_3", targetSpawn: "default", label: "3班教室" },
    { x: 17, y: 8, targetMap: "classroom_3", targetSpawn: "default", label: "3班教室" },
    { x: 22, y: 8, targetMap: "rooftop", targetSpawn: "default", label: "天台" },
    { x: 23, y: 8, targetMap: "rooftop", targetSpawn: "default", label: "天台" },
  ],
  spawns: {
    from_classroom: { x: 7, y: 7 },
    from_gallery: { x: 12, y: 7 },
    from_class3: { x: 18, y: 7 },
    from_rooftop: { x: 24, y: 7 },
    default: { x: 15, y: 5 },
    ...corridorParsed.spawns,
  },
  background: "/assets/bg/school_gate_night.svg",
};

// ══════════════════════════════════════════════
// 7. 王老师画廊 wang_gallery (20×14)
// 布局：画框/画架/办公桌 + 王老师/周隽秀NPC
// ══════════════════════════════════════════════

const WANG_GALLERY_RAW = [
  "####################",
  "#..PP..PP..PP..RR..#",
  "#..PP..PP..PP..RR..#",
  "#..................#",
  "#.....ee...........#",
  "#.....ee...........#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#....dd...NN......#",
  "#............NN...#",
  "#......CC..........#",
  "#..DD..............#",
  "####################",
];

const wangGalleryParsed = parseMap(WANG_GALLERY_RAW);

export const wangGalleryMap: TileMapData = {
  id: "wang_gallery",
  name: "王老师画廊",
  description: "墙上挂满了学生的画作。空气中有松节油的味道。",
  tiles: wangGalleryParsed.tiles,
  npcs: [
    {
      id: "wang",
      name: "王老师",
      x: 9,
      y: 9,
      sceneTriggerId: "ch4_art_class",
      color: "#C4A35A",
    },
    {
      id: "zhoujx",
      name: "周隽秀",
      x: 12,
      y: 10,
      sceneTriggerId: "ch5_zhoujunxiu_talk",
      color: "#9B59B6",
    },
  ],
  items: [
    {
      id: "item_painting_doll",
      name: "傀儡画",
      x: 2,
      y: 1,
      description: "一幅关于囚禁与自由的抽象画。四分五裂的傀儡被囚于监牢。",
      color: "#E67E22",
    },
    {
      id: "item_art_materials",
      name: "画材堆",
      x: 17,
      y: 1,
      description: "堆积的画材。违规提醒技能警告：不可乱动王老师的东西。",
      color: "#3498DB",
    },
  ],
  triggers: [],
  doors: [
    { x: 2, y: 12, targetMap: "corridor", targetSpawn: "from_gallery", label: "走廊" },
    { x: 3, y: 12, targetMap: "corridor", targetSpawn: "from_gallery", label: "走廊" },
  ],
  spawns: {
    default: { x: 4, y: 11 },
    ...wangGalleryParsed.spawns,
  },
  background: "/assets/bg/art_room.svg",
};

// ══════════════════════════════════════════════
// 8. 3班教室 classroom_3 (22×14)
// 布局：后黑板/课桌 + 外来者规则
// ══════════════════════════════════════════════

const CLASSROOM_3_RAW = [
  "######################",
  "#BB.................#",
  "#BB....RRR...........#",
  "#....................#",
  "#..dd.dd.dd.dd.dd...#",
  "#....................#",
  "#..dd.dd.dd.dd.dd...#",
  "#....................#",
  "#..dd.dd.dd.dd.dd...#",
  "#....................#",
  "#..dd.dd.dd.dd.dd...#",
  "#.......II...........#",
  "#..DD................#",
  "######################",
];

const classroom3Parsed = parseMap(CLASSROOM_3_RAW);

export const classroom3Map: TileMapData = {
  id: "classroom_3",
  name: "3班教室",
  description: "和普通教室相似的布局，但空气更加压抑。后黑板上写着外来者规则。",
  tiles: classroom3Parsed.tiles,
  npcs: [
    {
      id: "zhou_qirui",
      name: "周骐瑞",
      x: 14,
      y: 5,
      sceneTriggerId: "ch6_zhou_qirui",
      color: "#5D8AA8",
    },
    {
      id: "cheng_xiaoxiao",
      name: "程潇潇",
      x: 8,
      y: 9,
      sceneTriggerId: "ch6_cheng_xiaoxiao",
      color: "#F4A460",
    },
  ],
  items: [
    {
      id: "item_class3_rule",
      name: "外来者规则",
      x: 9,
      y: 11,
      sceneTriggerId: "ch6_class3_exposure",
      description: "后黑板上写着：'得到进入许可的外来者可进入，许可只能使用一次。'",
      color: "#E74C3C",
    },
    {
      id: "item_empty_seat",
      name: "空座位",
      x: 18,
      y: 9,
      description: "一张收拾得很干净的课桌。桌面刻着小小的'快乐'二字。",
      color: "#9B59B6",
    },
  ],
  triggers: [],
  doors: [
    { x: 2, y: 12, targetMap: "corridor", targetSpawn: "from_class3", label: "走廊" },
    { x: 3, y: 12, targetMap: "corridor", targetSpawn: "from_class3", label: "走廊" },
  ],
  spawns: {
    default: { x: 4, y: 11 },
    ...classroom3Parsed.spawns,
  },
  background: "/assets/bg/classroom_evening.svg",
};

// ══════════════════════════════════════════════
// 9. 天台 rooftop (20×14)
// 布局：城市夜景/tower + "我"的NPC
// ══════════════════════════════════════════════

const ROOFTOP_RAW = [
  "####################",
  "#.WW..WW..WW..WW..#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#..................#",
  "#.....NNNN.........#",
  "#..................#",
  "#..DD..............#",
  "####################",
];

const rooftopParsed = parseMap(ROOFTOP_RAW);

export const rooftopMap: TileMapData = {
  id: "rooftop",
  name: "天台",
  description: "深夜的天台，寒风扑面。城市还在运转，楼下包子店四点就要准备食材。",
  tiles: rooftopParsed.tiles,
  npcs: [
    {
      id: "inner_self",
      name: "「我」",
      x: 8,
      y: 10,
      sceneTriggerId: "ch8_rooftop_dialogue",
      color: "#E74C3C",
    },
  ],
  items: [
    {
      id: "item_city_lights",
      name: "城市夜景",
      x: 10,
      y: 1,
      description: "凌晨一点，仍有卡车送货。还有人比你更奔波。",
      color: "#F39C12",
    },
  ],
  triggers: [],
  doors: [
    { x: 2, y: 12, targetMap: "corridor", targetSpawn: "from_rooftop", label: "走廊" },
    { x: 3, y: 12, targetMap: "corridor", targetSpawn: "from_rooftop", label: "走廊" },
  ],
  spawns: {
    default: { x: 4, y: 11 },
    from_bedroom_roof: { x: 10, y: 6 },
    ...rooftopParsed.spawns,
  },
  background: "/assets/bg/school_gate_night.svg",
};

// ══════════════════════════════════════════════
// 地图注册表 & 工具函数
// ══════════════════════════════════════════════

export const MAP_REGISTRY: Record<string, TileMapData> = {
  bedroom: bedroomMap,
  livingroom: livingroomMap,
  bathroom: bathroomMap,
  waiting_area: waitingAreaMap,
  classroom: classroomMap,
  corridor: corridorMap,
  wang_gallery: wangGalleryMap,
  classroom_3: classroom3Map,
  rooftop: rooftopMap,
};

/** 初始地图 */
export const STARTING_MAP = "bedroom";

/** 获取门的标签文本 */
export function getDoorLabel(door: MapDoorData): string {
  return door.label ?? MAP_REGISTRY[door.targetMap]?.name ?? "未知区域";
}

/** 瓦片颜色表（用于 Canvas 渲染） */
export interface TileStyle {
  bg: string;
  border?: string;
  pattern?: "cross" | "dots" | "stripe" | "none";
}
export const TILE_STYLES: Record<number, TileStyle> = {
  [TILE.FLOOR]:     { bg: "#c8bcac", border: "#bab0a0", pattern: "none" },
  [TILE.WALL]:      { bg: "#4a3828", border: "#3a2a1a", pattern: "none" },
  [TILE.DOOR]:      { bg: "#6b4c1e", border: "#8b6914", pattern: "none" },
  [TILE.BED]:       { bg: "#4a3a52", border: "#5a4a62", pattern: "stripe" },
  [TILE.DESK]:      { bg: "#7a6040", border: "#8a7050", pattern: "none" },
  [TILE.TABLE]:     { bg: "#6a5030", border: "#7a6040", pattern: "none" },
  [TILE.CHAIR]:     { bg: "#5a4020", border: "#6a5030", pattern: "dots" },
  [TILE.SOFA]:      { bg: "#5a5a6a", border: "#6a6a7a", pattern: "stripe" },
  [TILE.SHELF]:     { bg: "#7a5a30", border: "#8a6a40", pattern: "none" },
  [TILE.CABINET]:   { bg: "#6a4a2a", border: "#7a5a3a", pattern: "none" },
  [TILE.BOOKSHELF]: { bg: "#5a3a1a", border: "#6a4a2a", pattern: "stripe" },
  [TILE.WINDOW]:    { bg: "#c8c8d8", border: "#88aacc", pattern: "cross" },
  [TILE.MIRROR]:    { bg: "#c8c8d8", border: "#889999", pattern: "cross" },
  [TILE.PAINTING]:  { bg: "#d8c8a8", border: "#c9a334", pattern: "none" },
  [TILE.EASEL]:     { bg: "#8a6a40", border: "#9a7a50", pattern: "none" },
  [TILE.PLANT]:     { bg: "#4a6a3a", border: "#5a7a4a", pattern: "dots" },
};
