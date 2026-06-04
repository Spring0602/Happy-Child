"""
教师办公室物品分割脚本 v5 (优化 Felzenszwalb + 半手动区域定义)
策略：先用优化的图割算法粗分割，再手动细化物品区域

输出：紧密裁剪的透明背景 PNG，参考 bathroom 模式
"""

from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os
import json
from skimage.segmentation import felzenszwalb
from scipy import ndimage
from sklearn.cluster import KMeans

# === 路径 ===
BG_PATH = r"E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室.png"
OUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites"
os.makedirs(OUT_DIR, exist_ok=True)

bg = Image.open(BG_PATH).convert("RGBA")
w, h = bg.size
arr = np.array(bg)
rgb_arr = arr[:, :, :3]
print(f"Background: {w}x{h}")

# === KMeans 颜色分析（用于背景识别）===
rgb_flat = rgb_arr.reshape(-1, 3)
sample_indices = np.random.choice(len(rgb_flat), min(30000, len(rgb_flat)), replace=False)
sample = rgb_flat[sample_indices].astype(np.float64)

kmeans = KMeans(n_clusters=12, random_state=42, n_init=10)
kmeans.fit(sample)
centers = kmeans.cluster_centers_

# 背景掩码：面积 > 6% 的聚类
all_labels = kmeans.predict(rgb_flat.astype(np.float64))
label_map = all_labels.reshape(h, w)
cluster_counts = np.bincount(all_labels)

bg_mask = np.zeros((h, w), dtype=bool)
for c in range(len(cluster_counts)):
    if cluster_counts[c] / (w * h) > 0.06:
        bg_mask[label_map == c] = True
        r, g, b = [int(v) for v in centers[c]]
        print(f"  BG cluster {c}: RGB({r},{g},{b}) - {100*cluster_counts[c]/(w*h):.1f}%")

# === 手动定义物品区域 ===
# 基于颜色分析和空间布局推理
# 格式: (name, x1, y1, x2, y2, description)
item_regions = [
    # 左侧书架区 - 多行书籍
    # 颜色分析显示 left_bookshelf 区域主要是深色 RGB(0,0,0) 和棕色
    ("bookshelf_left",      12,  64,  88,  570, "左侧书架-左边"),
    ("bookshelf_mid",       90,  64,  168, 570, "左侧书架-中间"),
    
    # 上方墙壁装饰
    ("wall_clock",          85,  65,  152, 118, "墙上时钟"),
    ("wall_cert_left",      174, 58,  238, 100, "墙上证书-左"),
    ("wall_cert_mid",       258, 74,  310, 116, "墙上证书-中"),  
    ("wall_cert_right",     330, 64,  390, 126, "墙上证书-右"),
    ("wall_sign",           448, 62,  500, 118, "墙上标识"),
    
    # 窗户
    ("window",              560, 18,  940, 180, "窗户"),
    
    # 黑板
    ("blackboard_frame",    955, 30,  1370, 360, "黑板框+黑板"),
    ("blackboard_content",  990, 60,  1340, 310, "黑板内容区"),
    
    # 门/拱门
    ("door_arch",           700, 370, 890, 570, "拱门/门洞"),
    
    # 讲台/教师桌
    ("teacher_desk_top",    290, 395, 690, 440, "教师桌面"),
    ("teacher_desk_body",   290, 440, 690, 548, "教师桌体"),
    ("teacher_desk_items",  340, 410, 640, 440, "桌面上物品"),
    
    # 椅子
    ("teacher_chair",       376, 500, 500, 590, "教师椅"),
    
    # 右侧文件柜
    ("file_cabinet_top",    920, 400, 1100, 465, "文件柜-上"),
    ("file_cabinet_mid",    920, 465, 1100, 530, "文件柜-中"),
    ("file_cabinet_bot",    920, 530, 1100, 580, "文件柜-下"),
    
    # 右侧杂物
    ("right_shelf",         1100, 410, 1290, 465, "右侧置物架"),
    ("right_items",         1290, 410, 1370, 520, "右侧杂物"),
    
    # 长凳
    ("bench",               1040, 570, 1370, 710, "长凳"),
    
    # 花盆/装饰
    ("plant_right",         1230, 480, 1315, 570, "右侧花盆"),
    
    # 地面物品
    ("floor_item_left",     64,  570, 280, 710, "地面物品-左"),
    ("floor_item_right",    560, 570, 830, 710, "地面物品-右"),
]

print(f"\nDefined {len(item_regions)} item regions")

# === 为每个区域提取物品 ===
def is_similar_to_bg(rgb_pixel):
    """检查像素是否接近背景色"""
    r, g, b = rgb_pixel
    # 墙壁/地板棕色系
    if 80 < r < 170 and 60 < g < 150 and 40 < b < 130:
        if max(r, g, b) - min(r, g, b) < 90:
            return True
    # 深色阴影
    if r < 30 and g < 30 and b < 30:
        return True
    return False

def extract_item(name, x1, y1, x2, y2, description):
    """提取单个物品，返回 sprite 和元数据"""
    # clip 到图像边界
    x1_c = max(0, x1)
    y1_c = max(0, y1)
    x2_c = min(w - 1, x2)
    y2_c = min(h - 1, y2)
    
    # 裁剪区域（+少量 padding）
    pad = 4
    x1_p = max(0, x1_c - pad)
    y1_p = max(0, y1_c - pad)
    x2_p = min(w - 1, x2_c + pad)
    y2_p = min(h - 1, y2_c + pad)
    
    crop = bg.crop((x1_p, y1_p, x2_p + 1, y2_p + 1))
    crop_arr = np.array(crop).copy()
    
    local_h, local_w = crop_arr.shape[:2]
    
    # 创建初始掩码：裁剪区域中心部分为物品
    # 核心区域（原定义区域在裁剪中的位置）
    core_x1 = x1_c - x1_p
    core_y1 = y1_c - y1_p
    core_x2 = x2_c - x1_p
    core_y2 = y2_c - y1_p
    
    init_mask = np.zeros((local_h, local_w), dtype=bool)
    init_mask[core_y1:core_y2+1, core_x1:core_x2+1] = True
    
    # 计算核心区域的平均颜色
    core_pixels = crop_arr[core_y1:core_y2+1, core_x1:core_x2+1, :3]
    core_avg = core_pixels.reshape(-1, 3).mean(axis=0)
    
    # 区域生长：从核心向外扩展，包含颜色相似的像素
    refined_mask = init_mask.copy()
    
    # 计算局部背景掩码
    local_bg = np.zeros((local_h, local_w), dtype=bool)
    for yi in range(local_h):
        for xi in range(local_w):
            if not init_mask[yi, xi]:
                pixel = crop_arr[yi, xi, :3].astype(float)
                if is_similar_to_bg(pixel):
                    local_bg[yi, xi] = True
    
    # 检查核心区域边缘：移除与背景色相似的边缘像素
    from scipy import ndimage
    edge_kernel = ndimage.generate_binary_structure(2, 2)
    dilated = ndimage.binary_dilation(init_mask, iterations=3)
    border = dilated & ~init_mask
    
    # 在边框中，颜色接近核心的扩展，接近背景的排除
    for yi, xi in zip(*np.where(border)):
        pixel = crop_arr[yi, xi, :3].astype(float)
        dist_to_core = np.sqrt(np.sum((pixel - core_avg) ** 2))
        if dist_to_core < 60 and not local_bg[yi, xi]:
            refined_mask[yi, xi] = True
    
    # 移除孤立的背景像素
    refined_mask = ndimage.binary_closing(refined_mask, iterations=2)
    refined_mask = ndimage.binary_opening(refined_mask, iterations=1)
    
    # 设置透明度
    crop_arr[:, :, 3] = np.where(refined_mask, 255, 0)
    
    sprite = Image.fromarray(crop_arr, 'RGBA')
    
    # 紧凑裁剪
    bbox = sprite.getbbox()
    if bbox:
        sprite = sprite.crop(bbox)
    
    return sprite, {
        'name': name,
        'map_x': int(x1_c),
        'map_y': int(y1_c),
        'width': sprite.width,
        'height': sprite.height,
        'description': description,
    }

# === 提取所有物品 ===
extracted = []
for idx, (name, x1, y1, x2, y2, desc) in enumerate(item_regions):
    sprite, meta = extract_item(name, x1, y1, x2, y2, desc)
    
    item_name = f"item_{idx+1:02d}"
    save_path = os.path.join(OUT_DIR, f"{item_name}.png")
    sprite.save(save_path)
    
    meta['file'] = f"{item_name}.png"
    meta['item_name'] = item_name
    extracted.append(meta)
    
    print(f"[{idx+1}] {item_name} ({name}): {meta['width']}x{meta['height']}, pos=({meta['map_x']},{meta['map_y']}) - {desc}")

# === 保存元数据 ===
report = {
    'background': BG_PATH,
    'bg_size': [w, h],
    'method': 'semi_manual_region_growing',
    'n_items': len(extracted),
    'items': extracted,
}

report_path = os.path.join(OUT_DIR, "_extraction_report.json")
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\nDone! {len(extracted)} items saved to {OUT_DIR}")
