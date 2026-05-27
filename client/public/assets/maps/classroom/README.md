# 教室地图（classroom）说明文档

> 文件路径：`client/public/assets/maps/classroom/`

## 地图规格

| 项目 | 数值 |
|------|------|
| 尺寸（tiles） | 20 × 15 |
| 像素尺寸 | 640 × 480 px |
| Tile 大小 | 32 × 32 px |
| Tiled 版本 | 1.10.2 |

## 平面图示意

```
x:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19
    ┌────────────────────────────────────────────────────────────────────────────────────────────┐
 0  │ W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W   W  │
 1  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │
 2  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │ ← 第一排课桌
 3  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │
 4  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │ ← 走道
 5  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │ ← 第二排课桌
 6  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │
 7  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │ ← 走道（中央）
 8  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │ ← 第三排课桌
 9  │ W    D    D    D    D    D    D    .    .    .    .    .    .    D    D    D    D    D    D   W  │
10  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │ ← 走道
11  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │
12  │ W    .    .    B    B    B    B    B    B    B    B    B    B    B    B    B    B    .    .   W  │ ← 黑板
13  │ W    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   W  │ ← 讲台区
14  │ W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W    W   W  │
    └────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    ↑
                                               出口（y=14，x=9~10）→ 走廊
符号：W=墙, .=地板, D=课桌椅, B=黑板
```

> **注意**：此地图上下颠倒——y=0 是画面顶部，y=14 是底部出口。
> 黑板在 y=12（靠近底部），玩家从底部（y=14 门口）进入后朝上看黑板，符合"坐在教室里面向前方"的视角。

## 图层说明

| 图层名 | 类型 | 用途 |
|--------|------|------|
| `ground` | tilelayer | 地板和墙壁底层（tile 1=墙, 2=地板） |
| `furniture` | tilelayer | 课桌（tile 3）和黑板（tile 5）的tile装饰 |
| `collision` | objectgroup | 碰撞盒（Phaser物理引擎读取） |
| `npcs` | objectgroup | NPC 出生点 + 对话绑定 |
| `player_spawn` | objectgroup | 玩家出生点 |
| `triggers` | objectgroup | 剧情触发区 + 地图过渡 |
| `props` | objectgroup | 可交互道具 |

## 对象层详细说明

### collision 层
| 对象名 | 位置 | 碰撞区域 |
|--------|------|---------|
| wall_top/bottom/left/right | 四面墙壁 | 四周封闭 |
| desks_row1~3_left/right | 课桌区 | 3排×左右两组 |
| blackboard | 黑板位置 | 底部前墙 |

### npcs 层
| NPC名 | 位置 | 绑定对话 | 精灵key |
|-------|------|---------|---------|
| npc_liuyu | (230, 162) | `ch1_liuyu_intro` | sprite_liuyu |
| npc_zhouqr | (134, 260) | `ch1_zhouqr_intro` | sprite_zhouqr |

### triggers 层
| 触发名 | 触发方式 | 绑定场景ID | 说明 |
|--------|---------|-----------|------|
| trigger_blackboard | interact（互动键） | ch2_blackboard_task | 看黑板→触发作业剧情 |
| trigger_notice_board | interact（互动键） | ch3_notice_wish_list | 公告栏→祈愿仪式预告 |
| trigger_yps_desk | auto（走过自动） | ch1_yps_inner_monologue | 叶平生坐下→内心独白 |
| trigger_door_exit | walk（走到门口） | → corridor 地图 | 教室出口过渡 |

### props 层
| 道具名 | 初始可见 | 触发章节 | 绑定场景 |
|--------|---------|---------|---------|
| prop_exam_paper | 可见 | 第2章 | ch2_exam_score_reveal |
| prop_liuyu_note | **隐藏**（第3章解锁） | 第3章 | ch3_liuyu_secret_note |

> `prop_liuyu_note` 的 `visible: false` + `requireChapter: 3`，需要在游戏逻辑层判断章节后手动激活。

## Tileset 图片规范

> `tileset.png`（128×256px，4×8 = 32 tiles）— 已生成

### 完整 Tile 索引表

| ID | 位置 | 内容 | 分类 | 叙事关联 |
|----|------|------|------|---------|
| 0 | [0,0] | 🔲 透明 | 基础 | 对象层占位 |
| 1 | [1,0] | 🧱 墙壁 | 基础 | 边界/不可通行 |
| 2 | [2,0] | ⬜ 地板 | 基础 | 可通行 |
| 3 | [3,0] | 🪑 课桌椅 | 基础 | 碰撞 |
| 4 | [0,1] | 🪟 窗户 | 基础 | 装饰 |
| 5 | [1,1] | 📋 黑板 | 基础 | ch2黑板作业 |
| 6 | [2,1] | 🟫 讲台地板 | 基础 | 老师站立区 |
| 7 | [3,1] | 🗄️ 柜子/书架 | 基础 | 靠墙装饰 |
| 8 | [0,2] | 📌 公告栏 | 基础 | ch3祈愿预告 |
| 9 | [1,2] | 🚪 门框 | 基础 | 走廊入口 |
| 10 | [2,2] | ➡️ 走廊过渡 | 基础 | 地图过渡 |
| 11 | [3,2] | 🏠 墙角踢脚线 | 基础 | 墙底装饰 |
| 12 | [0,3] | 🧱 墙壁变体 | 变体 | 密集砖块 |
| 13 | [1,3] | ⬜ 地板变体 | 变体 | 划痕/磨损 |
| 14 | [2,3] | 🪑 课桌变体 | 变体 | 反向角度 |
| 15 | [3,3] | 🪟 半窗半墙 | 变体 | 左窗右墙 |
| 16 | [0,4] | 🏆 排名榜 | 装饰 | ch2考试成绩 |
| 17 | [1,4] | 📝 试卷 | 装饰 | ch2分数揭示 |
| 18 | [2,4] | ✉️ 纸条 | 装饰 | ch3刘宇秘密纸条 |
| 19 | [3,4] | 🗑️ 垃圾桶 | 装饰 | 角落道具 |
| 20 | [0,5] | 💡 荧光灯 | 装饰 | 天花板照明 |
| 21 | [1,5] | 🕐 时钟 | 装饰 | 墙挂 |
| 22 | [2,5] | 🏫 门牌"3班" | 装饰 | 门口标识 |
| 23 | [3,5] | 🪑 叶平生课桌 | 装饰 | ch1内心独白触发（刻痕涂鸦） |
| 24 | [0,6] | 🎋 祈愿纸条 | 氛围 | ch3祈愿仪式 |
| 25 | [1,6] | 🤍 粉笔+粉笔擦 | 氛围 | 黑板槽装饰 |
| 26 | [2,6] | 🌱 盆栽 | 氛围 | 窗台绿植（唯一生命感） |
| 27 | [3,6] | 🪟 窗户+窗帘 | 氛围 | 半拉窗帘遮挡 |
| 28 | [0,7] | 👣 鞋印污渍地面 | 暗黑 | 叙事氛围 |
| 29 | [1,7] | 💔 裂开的墙壁 | 暗黑 | 镜中空间过渡 |
| 30 | [2,7] | 🩸 血色裂缝地板 | 暗黑 | 镜中空间专用 |
| 31 | [3,7] | 🪞 镜面碎片 | 暗黑 | 镜中空间元素 |

### Tile 布局图

```
Row0: [0] 透明    [1] 墙壁      [2] 地板     [3] 课桌椅
Row1: [4] 窗户    [5] 黑板      [6] 讲台     [7] 柜子
Row2: [8] 公告栏  [9] 门框      [10]走廊     [11]踢脚线
Row3: [12]墙v2    [13]地板v2    [14]课桌v2   [15]半窗半墙
Row4: [16]排名榜  [17]试卷      [18]纸条     [19]垃圾桶
Row5: [20]荧光灯  [21]时钟      [22]门牌     [23]叶平生桌
Row6: [24]祈愿条  [25]粉笔擦    [26]盆栽     [27]窗帘窗
Row7: [28]污渍地  [29]裂墙      [30]血裂地   [31]镜碎片
```

### 分类说明

- **基础层 (0~11)**：教室必需的结构性tile
- **变体层 (12~15)**：同类型tile的视觉变体，增加地图丰富度
- **装饰层 (16~23)**：日常教室道具，多数与特定章节剧情绑定
- **氛围层 (24~27)**：营造教室压抑/生活感的细节道具
- **暗黑层 (28~31)**：镜中空间/异化场景专用，正常教室不使用

Tileset AI生成提示词（完整版）：
```
pixel art tileset sheet, 128x256 px total, 4x8 grid (32x32 each tile),
Chinese high school classroom interior, cold oppressive atmosphere,
rows: basic structures, variants, daily props, atmosphere, dark/alteration,
tiles: blank/transparent, gray brick wall, off-white floor tile,
wooden brown desk+chair, light blue window, dark green chalkboard,
podium floor, dark wooden cabinet, notice board with red pins,
gray door frame, corridor transition, wall baseboard,
ranking board with red numbers, exam paper with red marks,
folded secret note, metal trash can, fluorescent lamp, wall clock,
copper nameplate, special desk with carvings, wish paper strips,
chalk and eraser, potted plant, curtained window,
dirty footprint floor, cracked wall, blood-crack floor, mirror shards.
GBA Pokemon style, ≤12 colors per tile, 1px black outline,
flat pixel art, no gradients, dark blue-gray color scheme
```

## 与 Phaser 的对接方式

```ts
// PreloadScene.ts
this.load.tilemapTiledJSON('map_classroom', '/assets/maps/classroom/map.json');
this.load.image('tileset_classroom', '/assets/maps/classroom/tileset.png');

// MapScene.ts 中加载
const map = this.make.tilemap({ key: 'map_classroom' });
const tileset = map.addTilesetImage('classroom_tileset', 'tileset_classroom');

const groundLayer = map.createLayer('ground', tileset, 0, 0);
const furnitureLayer = map.createLayer('furniture', tileset, 0, 0);

// 碰撞：从 collision 对象层读取矩形
const collisionLayer = map.getObjectLayer('collision');
collisionLayer.objects.forEach(obj => {
  const body = this.physics.add.staticImage(obj.x! + obj.width!/2, obj.y! + obj.height!/2);
  body.setDisplaySize(obj.width!, obj.height!);
  body.refreshBody();
});

// NPC：从 npcs 对象层读取
const npcLayer = map.getObjectLayer('npcs');
npcLayer.objects.forEach(obj => {
  const dialogId = obj.properties?.find(p => p.name === 'dialogId')?.value;
  const spriteKey = obj.properties?.find(p => p.name === 'spriteKey')?.value;
  // 创建 NPC sprite，绑定对话...
});

// 触发区：从 triggers 对象层读取
const triggerLayer = map.getObjectLayer('triggers');
triggerLayer.objects.forEach(obj => {
  const zone = this.add.zone(obj.x!, obj.y!, obj.width!, obj.height!);
  this.physics.world.enable(zone);
  // 玩家进入 zone 时触发对应场景...
});
```
