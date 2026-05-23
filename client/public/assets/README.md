# assets 资源目录

> 所有游戏素材存放于此。替换图片时尽量保持文件名不变，这样不用改剧情数据中的路径。

---

## 目录索引

```
assets/
├── maps/              ← Tiled 地图数据（JSON + tileset 图片）
│   ├── bedroom/       # 叶平生房间
│   ├── classroom/     # 普通教室
│   ├── classroom_3/   # 3班教室
│   ├── livingroom/    # 家庭客厅
│   ├── bathroom/      # 卫生间
│   ├── corridor/      # 走廊
│   ├── wang_gallery/  # 王老师工作室/画廊
│   ├── rooftop/       # 天台
│   └── waiting_area/  # 候场区
│
├── sprites/           ← 角色像素精灵图（单文件含所有动作）
│   └── 命名格式: {角色名}.png
│       规格: 256×256 px 单张 Sprite Sheet, 透明底 PNG-32
│       布局: 4行×3~4帧
│         行0: 站立/idle (3帧, 约17×40px/帧)
│         行1: 跑步/run (4帧, 约17×40px/帧)
│         行2: 攻击/attack (4帧, 约17×40px/帧)
│         行3: 受击/hit (3-4帧, 约17×40px/帧)
│       行间距约24px, 帧间距约25px
│
├── portraits/         ← 角色立绘（对话时展示）
│   └── 命名格式: {角色名}_{表情}.png
│       建议统一画布尺寸, 避免切换时抖动
│
├── characters/        ← 角色其他相关素材（已有, 备用）
│
├── bg/                ← 场景背景图
│   现有: art_room.svg, bedroom_day.svg, classroom_evening.svg,
│         dorm_dark.svg, dorm_rain.svg, rule_warning.svg,
│         school_gate_night.svg
│
├── ui/                ← UI 界面元素
│   └── 如: dialogue_box.png, button.png, health_bar.png 等
│
├── effects/           ← 特效素材
│   └── 如: suffocation.png, screen_flash.png 等
│
├── placeholder/       ← 开发占位素材
│   └── 正式素材完成后覆盖
│
└── audio/             ← 音频素材
    ├── bgm/           # 背景音乐 (.mp3/.ogg)
    └── sfx/           # 音效 (.mp3/.ogg)
```

---

## 各子目录用途说明

### maps/ — 地图数据
| 子目录 | 对应场景 | 文件 |
|--------|---------|------|
| `bedroom/` | 叶平生房间 | `map.json` + `tileset.png` |
| `classroom/` | 普通教室 | `map.json` + `tileset.png` |
| `classroom_3/` | 3班教室（关键演出） | `map.json` + `tileset.png` |
| `livingroom/` | 家庭客厅 | `map.json` + `tileset.png` |
| `bathroom/` | 卫生间 | `map.json` + `tileset.png` |
| `corridor/` | 走廊 | `map.json` + `tileset.png` |
| `wang_gallery/` | 王老师画廊 | `map.json` + `tileset.png` |
| `rooftop/` | 天台夜景 | `map.json` + `tileset.png` |
| `waiting_area/` | 候场区（序章） | `map.json` + `tileset.png` |

### sprites/ — 角色像素精灵图
| 文件名 | 用途 | 规格 |
|--------|------|------|
| `yps.png` | 主角(叶平生)精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| `liuyu.png` | 刘宇精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| `wang.png` | 王老师精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| `zhouqx.png` | 周全秀精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| `zhoujx.png` | 周隽秀精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| `mother.png` | 母亲精灵图 | 256×256, 含站立/跑步/攻击/受击 |
| ... | 其他 NPC | 同上 |

> 每个角色只需 **一张 256×256 px 精灵图**，包含所有动作姿势（站立/跑步/攻击/受击），无需分方向或分文件。

### portraits/ — 立绘
| 文件名（示例） | 用途 |
|----------------|------|
| `yps_default.png` | 主控默认立绘 |
| `yps_angry.png` | 主控愤怒表情 |
| `yps_sad.png` | 主控悲伤表情 |
| `liuyu_normal.png` | 刘宇普通表情 |
| `liuyu_smile.png` | 刘宇微笑 |
| `wang_kind.png` | 王老师慈祥 |
| ... | 根据剧情需要扩展 |

### bg/ — 背景图
| 文件名 | 用途 |
|--------|------|
| `bedroom_day.svg` | 白天卧室 |
| `classroom_evening.svg` | 傍晚教室 |
| `dorm_dark.svg` | 昏暗宿舍 |
| `dorm_rain.svg` | 雨夜宿舍 |
| `art_room.svg` | 画室/画廊 |
| `school_gate_night.svg` | 校门夜景 |
| `rule_warning.svg` | 规则警告界面 |

### effects/ — 特效
| 文件名（示例） | 用途 |
|----------------|------|
| `suffocation.png` | 窒息特效 |
| `red_overlay.png` | 红色覆盖警示 |
| `screen_flash.png` | 屏幕闪烁 |

### placeholder/ — 占位素材
| 文件名 | 说明 |
|--------|------|
| `tileset_basic.png` | 基础 tileset 占位 |
| `player_block.png` | 玩家方块占位 |
| `npc_block_blue.png` | NPC 蓝色占位 |
| `item_marker.png` | 交互点标记 |

---

## 素材替换流程

1. 先用占位素材跑通核心玩法
2. AI 生成正式素材
3. 人工检查尺寸/透明度/色板
4. 按同名文件覆盖到对应目录
5. 游戏内测试
6. 通过后标记为"已测试"

---

## 注意事项

- **文件名尽量英文小写 + 下划线**，避免跨平台路径问题
- **精灵图** 统一为 256×256 px 单张 Sprite Sheet，包含站立/跑步/攻击/受击四类动作
- **立绘** 建议统一画布尺寸，避免对话切换时抖动
- **背景图** 当前为 SVG 占位，后续可替换为 PNG 或继续保持 SVG
- 替换素材时保持文件名与剧情数据 `scenes.ts`、`assetManifest.ts` 中的引用一致
