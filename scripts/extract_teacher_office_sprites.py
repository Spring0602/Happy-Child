"""
教师办公室物品分割提取脚本 v2.0
从 教师办公室.png (1376×768) 中提取独立物品精灵图
参照 livingroom 客厅物品_sprites 的正确模式：
  1. 256×256 画布, 物品保持在原始位置(不居中/不缩放)
  2. 超过 256px 的物品拆分为多个 256×256 段
  3. 地图中物品位置 = map.json 中 furniture_objects 的 (x,y) 坐标
  4. 在 Phaser 中: sprite 中心放在 (obj.x+128, obj.y+128), 物品对齐底图

重要改正(v2 vs v1):
  - v1 错误: 物品紧密裁剪后居中 → 丢失空间参照
  - v2 正确: 256×256 窗口直接裁剪, 物品保持原位
  - v1 错误: 大物品缩放 → 破坏像素精度
  - v2 正确: 大物品拆分为多个 256×256 段
"""

from PIL import Image
import os

# 路径配置
SOURCE = r"E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室.png"
OUTPUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites"
CANVAS_SIZE = 256

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 加载原图
src = Image.open(SOURCE).convert("RGBA")
SW, SH = src.size
print(f"Source: {SW}x{SH}")
print(f"Output: {OUTPUT_DIR}/")
print()

# ============================================================
# 物品定义
# 格式: (sprite_name, description, x, y, width, height)
# (x,y) = 物品在背景图上的位置（即 map.json 中的放置坐标）
#
# 规则:
#  - 物品 ≤ 256×256: 生成 1 个 256×256 精灵, map.json 坐标 = (x, y)
#  - 物品 > 256 宽: 拆分为 ceil(w/256) 个横向段
#  - 物品 > 256 高: 拆分为 ceil(h/256) 个纵向段
# ============================================================
items = [
    # ─── 左侧书架 (整体约 168×512, 拆分为 2 层) ───
    # 用 256×256 窗口覆盖，物品在窗口内的偏移 = 物品在背景中的原始位置
    ("item_01", "书架上区 (含证书框)", 10, 60, 168, 256),
    ("item_02", "书架下区", 10, 316, 168, 256),

    # ─── 图书推车 ───
    ("item_03", "图书推车", 180, 338, 88, 138),

    # ─── 窗户 (约 222×200, ≤256) ───
    ("item_04", "窗户", 575, 10, 222, 200),

    # ─── 画廊海报 ───
    ("item_05", "画廊海报", 420, 22, 152, 120),

    # ─── 通风管道 ───
    ("item_06", "通风管道", 1098, 2, 112, 62),

    # ─── 黑板 (约 422×382, 拆分为 4 段 2×2) ───
    ("item_07", "黑板-左上", 948, 20, 256, 256),
    ("item_08", "黑板-右上", 1114, 20, 256, 256),
    ("item_09", "黑板-左下", 948, 146, 256, 256),
    ("item_10", "黑板-右下", 1114, 146, 256, 256),

    # ─── 教师办公桌 (约 438×188, 拆分为 2 段) ───
    ("item_11", "办公桌-左", 258, 388, 256, 256),
    ("item_12", "办公桌-右", 440, 388, 256, 256),

    # ─── 办公椅 ───
    ("item_13", "办公椅", 552, 326, 120, 148),

    # ─── 桌面上物品 (地球仪、台灯) ───
    ("item_14", "地球仪", 568, 426, 58, 62),
    ("item_15", "台灯", 624, 416, 58, 72),

    # ─── 文件柜 ×4 (灰色, 每柜约 88×162) ───
    # 4个文件柜紧密排列，每个 256×256 窗口, 间距约 90px
    ("item_16", "文件柜1", 868, 408, 88, 162),
    ("item_17", "文件柜2", 958, 408, 88, 162),
    ("item_18", "文件柜3", 1048, 408, 88, 162),
    ("item_19", "文件柜4", 1138, 408, 88, 162),

    # ─── 盆栽植物 ───
    ("item_20", "盆栽", 1228, 508, 82, 92),

    # ─── 饮水机 ───
    ("item_21", "饮水机", 1274, 525, 96, 158),

    # ─── 长凳/等候椅 (约 322×128, 拆分为 2 段) ───
    ("item_22", "长凳-左", 1048, 568, 256, 256),
    ("item_23", "长凳-右", 1230, 568, 140, 128),

    # ─── 散落纸张 ───
    ("item_24", "散落纸张", 738, 572, 156, 108),

    # ─── 地毯 (约 380×105, 拆分为 2 段) ───
    ("item_25", "地毯-左", 338, 578, 256, 256),
    ("item_26", "地毯-右", 522, 578, 196, 105),
]

# ============================================================
# 处理每个物品
# ============================================================
total = 0
for idx, (filename, desc, x, y, w, h) in enumerate(items, 1):
    # 确保裁剪区域不超出边界
    crop_x = max(0, min(x, SW - 1))
    crop_y = max(0, min(y, SH - 1))
    crop_w = min(256, SW - crop_x)
    crop_h = min(256, SH - crop_y)

    if crop_w <= 0 or crop_h <= 0:
        print(f"  SKIP [{idx:2d}] {filename}: out of bounds")
        continue

    # 创建 256×256 透明画布
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))

    # 从背景图裁剪 256×256 区域
    cropped = src.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))

    # 直接贴到画布上 (保持在原位, 不居中)
    # paste at (0,0) because the crop already represents the correct region
    canvas.paste(cropped, (0, 0))

    out_path = os.path.join(OUTPUT_DIR, f"{filename}.png")
    canvas.save(out_path, "PNG")
    total += 1

    # 物品在画布中的位置信息（用于 map.json）
    item_center_x = x + w // 2  # 物品中心在背景中的 X
    item_center_y = y + h // 2  # 物品中心在背景中的 Y
    map_x = x  # map.json furniture_objects x
    map_y = y  # map.json furniture_objects y

    print(f"  OK [{idx:2d}] {filename}.png  '{desc}'")
    print(f"        sprite: 256x256, item@({x},{y}) {w}x{h}")
    print(f"        map.json: pos=({map_x},{map_y}) size=256x256")

print(f"\nDone! Extracted {total} sprites to: {OUTPUT_DIR}")
print(f"Total items defined: {len(items)}")
