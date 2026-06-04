"""
教师办公室物品分割脚本 v3 (SLIC 超像素 + 区域合并)
严格遵循文档要求：每个物体单独分割，紧密裁剪，透明背景

策略：
1. SLIC 超像素过分割 (oversegmentation)
2. 基于颜色相似性合并相邻超像素
3. 识别物品区域 (非墙壁/地板)
4. 为每个物品创建紧密裁剪的透明背景 PNG
"""

from PIL import Image
import numpy as np
import os
import json
from skimage.segmentation import slic
from skimage.color import label2rgb
from scipy import ndimage
from collections import defaultdict

# === 路径 ===
BG_PATH = r"E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室.png"
OUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites"
os.makedirs(OUT_DIR, exist_ok=True)

bg = Image.open(BG_PATH).convert("RGBA")
w, h = bg.size
print(f"Background: {w}x{h}")

arr = np.array(bg)
rgb_arr = arr[:, :, :3]

# === 第一步：SLIC 超像素分割 ===
n_segments = 400  # 初始超像素数
compactness = 30  # 空间权重

print("Running SLIC segmentation...")
segments = slic(rgb_arr, n_segments=n_segments, compactness=compactness, 
                start_label=1, channel_axis=2)
n_superpixels = segments.max()
print(f"Superpixels: {n_superpixels}")

# === 第二步：计算每个超像素的平均颜色 ===
superpixel_colors = {}
for sp_id in range(1, n_superpixels + 1):
    mask = segments == sp_id
    if np.sum(mask) > 0:
        avg_rgb = rgb_arr[mask].mean(axis=0)
        area = np.sum(mask)
        superpixel_colors[sp_id] = {
            'avg_rgb': avg_rgb,
            'area': int(area),
        }

# === 第三步：识别墙壁/地板超像素 ===
# 墙壁颜色特征：中等棕色，大面积
# 地板颜色特征：深棕色，大面积

# 筛选大面积超像素 (面积 > 总像素的 0.5%)
min_bg_area = w * h * 0.005
large_sp = {sp_id: info for sp_id, info in superpixel_colors.items() 
            if info['area'] > min_bg_area}

# 墙壁/地板颜色范围
def is_wall_color(rgb):
    r, g, b = rgb
    # 棕色系墙壁：R~100-160, G~80-150, B~50-130
    if 80 < r < 170 and 60 < g < 160 and 40 < b < 140:
        # 排除太鲜艳的
        if max(r,g,b) - min(r,g,b) < 80:
            return True
    return False

def is_floor_color(rgb):
    r, g, b = rgb
    # 深棕色地板：R~80-140, G~60-110, B~30-80
    if 70 < r < 150 and 50 < g < 120 and 25 < b < 90:
        if max(r,g,b) - min(r,g,b) < 70:
            return True
    return False

def is_dark_shadow(rgb):
    r, g, b = rgb
    # 深色阴影：各个通道都很暗
    if r < 40 and g < 40 and b < 40:
        return True
    return False

# 标记背景超像素
bg_sp_ids = set()
for sp_id, info in large_sp.items():
    avg = info['avg_rgb']
    if is_wall_color(avg) or is_floor_color(avg) or is_dark_shadow(avg):
        bg_sp_ids.add(sp_id)

# 也检查小超像素，如果它们与背景色接近
for sp_id, info in superpixel_colors.items():
    if sp_id in bg_sp_ids:
        continue
    avg = info['avg_rgb']
    if is_wall_color(avg) or is_floor_color(avg):
        bg_sp_ids.add(sp_id)

print(f"Background superpixels: {len(bg_sp_ids)}/{n_superpixels}")

# === 第四步：合并相邻的前景超像素 ===
# 构建邻接图
print("Building adjacency graph...")
adjacency = defaultdict(set)
h_arr, w_arr = segments.shape
for y in range(1, h_arr - 1):
    for x in range(1, w_arr - 1):
        sp_here = segments[y, x]
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            sp_neighbor = segments[y+dy, x+dx]
            if sp_neighbor != sp_here:
                adjacency[sp_here].add(sp_neighbor)

# 计算颜色距离
def color_distance(c1, c2):
    return np.sqrt(np.sum((c1 - c2) ** 2))

# 合并前景超像素
print("Merging adjacent foreground superpixels...")
fg_sp_ids = set(range(1, n_superpixels + 1)) - bg_sp_ids
merged = {}  # sp_id -> group_id
group_counter = [0]

def flood_fill_merge(sp_id, group_id, visited):
    if sp_id in visited:
        return
    visited.add(sp_id)
    merged[sp_id] = group_id
    
    # 检查所有邻居
    for neighbor in adjacency[sp_id]:
        if neighbor in visited:
            continue
        if neighbor in bg_sp_ids:
            continue
        # 检查颜色相似度
        color1 = superpixel_colors[sp_id]['avg_rgb']
        color2 = superpixel_colors[neighbor]['avg_rgb']
        dist = color_distance(color1, color2)
        
        # 颜色相似则合并
        if dist < 50:  # 颜色阈值
            flood_fill_merge(neighbor, group_id, visited)

visited = set()
for sp_id in fg_sp_ids:
    if sp_id not in visited:
        group_counter[0] += 1
        flood_fill_merge(sp_id, group_counter[0], visited)

print(f"Merged into {group_counter[0]} groups")

# === 第五步：为每个合并组创建掩码和边界框 ===
groups = defaultdict(list)
for sp_id, group_id in merged.items():
    groups[group_id].append(sp_id)

print("Computing component masks...")
components = []
for group_id, sp_list in groups.items():
    # 创建组掩码
    group_mask = np.zeros((h, w), dtype=bool)
    for sp_id in sp_list:
        group_mask |= (segments == sp_id)
    
    area = np.sum(group_mask)
    if area < 200:  # 忽略太小
        continue
    
    # 边界框
    ys, xs = np.where(group_mask)
    min_x, max_x = xs.min(), xs.max()
    min_y, max_y = ys.min(), ys.max()
    
    # 过滤长宽比极端的（线条/边框）
    cw = max_x - min_x + 1
    ch = max_y - min_y + 1
    ar = max(cw, ch) / max(min(cw, ch), 1)
    if ar > 15:
        continue
    
    components.append({
        'group_id': group_id,
        'area': int(area),
        'bbox': (int(min_x), int(min_y), int(max_x), int(max_y)),
        'width': int(cw),
        'height': int(ch),
        'mask': group_mask,
        'sp_count': len(sp_list),
    })

components.sort(key=lambda x: -x['area'])
print(f"Valid components: {len(components)}")

# === 第六步：提取精灵 ===
extracted = []

for idx, comp in enumerate(components[:30]):
    x1, y1, x2, y2 = comp['bbox']
    cw, ch = comp['width'], comp['height']
    
    # 加 padding（5px）
    pad = 5
    x1_p = max(0, x1 - pad)
    y1_p = max(0, y1 - pad)
    x2_p = min(w - 1, x2 + pad)
    y2_p = min(h - 1, y2 + pad)
    
    # 裁剪区域
    crop = bg.crop((x1_p, y1_p, x2_p + 1, y2_p + 1))
    crop_arr = np.array(crop)
    
    # 使用组件掩码设置 alpha
    local_mask = comp['mask'][y1_p:y2_p+1, x1_p:x2_p+1]
    
    # 膨胀掩码确保完整覆盖
    local_mask = ndimage.binary_dilation(local_mask, iterations=2)
    
    # 在局部掩码内再次优化：移除仍与背景色接近的边缘像素
    local_rgb = crop_arr[:, :, :3].astype(np.float64)
    refined_mask = local_mask.copy()
    
    # 边缘精修：掩码边缘的像素如果颜色接近背景则移除
    eroded = ndimage.binary_erosion(local_mask, iterations=2)
    edge_pixels = local_mask & ~eroded
    if np.sum(edge_pixels) > 0:
        for y_edge, x_edge in zip(*np.where(edge_pixels)):
            pixel_rgb = local_rgb[y_edge, x_edge]
            if is_wall_color(pixel_rgb) or is_floor_color(pixel_rgb):
                refined_mask[y_edge, x_edge] = False
    
    crop_arr[:, :, 3] = np.where(refined_mask, 255, 0)
    
    sprite = Image.fromarray(crop_arr, 'RGBA')
    
    # 紧凑裁剪
    bbox = sprite.getbbox()
    if bbox:
        sprite = sprite.crop(bbox)
    
    crop_w, crop_h = sprite.size
    
    item_name = f"item_{idx+1:02d}"
    save_path = os.path.join(OUT_DIR, f"{item_name}.png")
    sprite.save(save_path)
    
    extracted.append({
        'name': item_name,
        'file': f"{item_name}.png",
        'map_x': x1_p,
        'map_y': y1_p,
        'width': crop_w,
        'height': crop_h,
        'orig_bbox': (x1, y1, x2, y2),
        'area': comp['area'],
        'sp_count': comp['sp_count'],
    })
    
    print(f"[{idx+1}] {item_name}: {crop_w}x{crop_h}, map=({x1_p},{y1_p}), area={comp['area']}, sp={comp['sp_count']}")

# === 保存 ===
report = {
    'background': BG_PATH,
    'bg_size': [w, h],
    'method': 'SLIC_superpixel_merging',
    'n_superpixels': n_superpixels,
    'bg_sp_ids': len(bg_sp_ids),
    'total_extracted': len(extracted),
    'items': extracted,
}

report_path = os.path.join(OUT_DIR, "_extraction_report.json")
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\nDone! {len(extracted)} items -> {OUT_DIR}")
