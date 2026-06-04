"""
分析 wang_gallery 美术教室图片并分割物体
按照项目规范 (04_占位素材与地图规划规范.md) 中的要求：
- 精灵尺寸 256×256 (与客厅相同)
- RGBA 格式，透明背景
- 命名：item_01.png, item_02.png ...
"""
from PIL import Image
import numpy as np
import os, json

SRC = 'E:/Happy-Child/client/public/assets/maps/wang_gallery/美术教室.png'
OUT_DIR = 'E:/Happy-Child/client/public/assets/maps/wang_gallery/画廊物品_sprites/'

os.makedirs(OUT_DIR, exist_ok=True)
img = Image.open(SRC).convert('RGBA')
W, H = img.size
arr = np.array(img)

# ============================================================
# 物体定义：根据 04_占位素材与地图规划规范.md 及图片实际内容
# ============================================================
# 每个物体: (name, x1, y1, x2, y2, description)
# 坐标基于像素艺术分析
objects_meta = [
    # === 左侧：办公桌区域 ===
    ("item_01",  23, 103, 227, 711, "左侧墙体/书架区域-堆积画材层架"),
    ("item_02",  96, 129, 200, 385, "层架上的堆积画材"),
    ("item_03",  69, 390, 201, 717, "办公桌(含桌面物品)"),
    ("item_04",  96, 518, 168, 712, "桌下垃圾桶/收纳箱"),
    ("item_05", 172, 478, 247, 717, "办公椅/凳子"),
    ("item_06",  69,  94, 205, 164, "墙上时钟"),
    
    # === 中左：通道区域 ===
    ("item_07", 232, 200, 384, 717, "通道中散落画材/纸团"),
    ("item_08", 256, 258, 384, 452, "画材堆-中部"),
    
    # === 中央：储物柜 ===
    ("item_09", 480,  96, 680, 370, "双开木质储物柜(上方)"),
    ("item_10", 480, 374, 680, 717, "储物柜下方抽屉区"),
    
    # === 中右：通道/散落物品 ===
    ("item_11", 696, 192, 832, 767, "中央通道及散落画纸"),
    
    # === 右侧：画架区域 ===
    ("item_12", 840,  32, 1008, 297, "右侧画框-上方"),
    ("item_13", 840, 304, 1008, 717, "右侧画框-下方"),
    ("item_14", 1016,  24, 1168, 297, "画架1-带画布"),
    ("item_15", 1016, 304, 1168, 580, "画架1-支架部分"),
    ("item_16", 1176,  24, 1304, 296, "画架2-带画布"),
    ("item_17", 1176, 304, 1304, 580, "画架2-支架部分"),
    
    # === 画材/颜料 ===
    ("item_18", 840, 440, 920, 717, "画材颜料管/调色盘"),
    ("item_19", 928, 440, 1008, 717, "画材颜料罐"),
    ("item_20", 1016, 584, 1176, 717, "地面散落画材纸团"),
    ("item_21", 1184, 584, 1304, 717, "地面散落画材纸团(右)"),
    
    # === 顶部装饰 ===
    ("item_22", 224,  0, 480,  96, "顶窗/天窗区域"),
    ("item_23", 488,  0,  96,  96, "顶部灯具"),  # 调整
    ("item_24", 840,  0,  32,  32, "顶部风扇/灯具"),
]

# 调整 item_23 坐标 (top area lights)
# 基于前面分析，x=488-594 区域 y=16-37 处有物体

print(f"原图尺寸: {W}×{H}")
print(f"输出目录: {OUT_DIR}")
print(f"物体数量: {len(objects_meta)}")
print()

for name, x1, y1, x2, y2, desc in objects_meta:
    # 裁剪
    x1c = max(0, x1)
    y1c = max(0, y1)
    x2c = min(W-1, x2)
    y2c = min(H-1, y2)
    
    cropped = img.crop((x1c, y1c, x2c+1, y2c+1))
    cw, ch = cropped.size
    
    # 创建透明画布 (256×256，居中放置)
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    # 缩放以适应256×256（保持宽高比）
    scale = min(256 / cw, 256 / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    if new_w > 0 and new_h > 0:
        resized = cropped.resize((new_w, new_h), Image.NEAREST)  # NEAREST for pixel art
        ox = (256 - new_w) // 2
        oy = (256 - new_h) // 2
        canvas.paste(resized, (ox, oy), resized)
    
    out_path = os.path.join(OUT_DIR, f'{name}.png')
    canvas.save(out_path)
    print(f"  {name}.png | 原尺寸 {cw}×{ch} | {desc}")

print(f"\n完成! 共生成 {len(objects_meta)} 个精灵文件")
print(f"保存至: {OUT_DIR}")

# 同时保存物体元数据 JSON
meta = {name: {"bbox": [x1, y1, x2, y2], "description": desc} 
        for name, x1, y1, x2, y2, desc in objects_meta}
with open(os.path.join(OUT_DIR, 'sprites_meta.json'), 'w', encoding='utf-8') as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)
print("元数据保存至: sprites_meta.json")
