"""
教师办公室物品分割脚本 v4 (Felzenszwalb 图割)
严格遵循文档要求：每个物体单独分割，紧密裁剪，透明背景

利用 skimage 的 Felzenszwalb 高效图割算法，
结合 KMeans 颜色分类做背景识别。
"""

from PIL import Image
import numpy as np
import os
import json
from skimage.segmentation import felzenszwalb
from skimage.color import label2rgb
from scipy import ndimage

# === 路径 ===
BG_PATH = r"E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室.png"
OUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites"
os.makedirs(OUT_DIR, exist_ok=True)

bg = Image.open(BG_PATH).convert("RGBA")
w, h = bg.size
print(f"Background: {w}x{h}")

arr = np.array(bg)
rgb_arr = arr[:, :, :3]

# === 第一步：Felzenszwalb 分割 ===
print("Running Felzenszwalb segmentation...")
# scale: 越大越倾向于大区域; sigma: 高斯平滑; min_size: 最小区域面积
segments = felzenszwalb(rgb_arr, scale=200, sigma=0.8, min_size=300, channel_axis=2)
n_segments = segments.max() + 1
print(f"Segments: {n_segments}")

# === 第二步：识别背景 ===
from sklearn.cluster import KMeans

rgb_flat = rgb_arr.reshape(-1, 3)
sample_size = min(30000, len(rgb_flat))
indices = np.random.choice(len(rgb_flat), sample_size, replace=False)
sample = rgb_flat[indices].astype(np.float64)

kmeans = KMeans(n_clusters=10, random_state=42, n_init=10)
kmeans.fit(sample)
centers = kmeans.cluster_centers_.astype(np.int32)

all_labels = kmeans.predict(rgb_flat.astype(np.float64))
label_map = all_labels.reshape(h, w)

# 背景聚类 (面积 > 8%)
cluster_counts = np.bincount(all_labels)
total_px = w * h
bg_clusters = set()
for c in range(len(cluster_counts)):
    if cluster_counts[c] / total_px > 0.08:
        bg_clusters.add(c)
        print(f"  BG cluster {c}: RGB~{centers[c]} - {100*cluster_counts[c]/total_px:.1f}%")

# 背景 mask
bg_mask = np.zeros((h, w), dtype=bool)
for c in bg_clusters:
    bg_mask[label_map == c] = True

# === 第三步：计算每个 segment 的前景像素占比 ===
segment_stats = {}
for seg_id in range(n_segments):
    seg_mask = segments == seg_id
    area = np.sum(seg_mask)
    if area < 100:
        continue
    
    # 该 segment 中背景像素的比例
    bg_in_seg = np.sum(seg_mask & bg_mask)
    bg_ratio = bg_in_seg / area
    
    # 该 segment 的平均颜色
    seg_colors = rgb_arr[seg_mask]
    avg_color = seg_colors.mean(axis=0).astype(np.int32)
    
    # 边界框
    ys, xs = np.where(seg_mask)
    min_x, max_x = xs.min(), xs.max()
    min_y, max_y = ys.min(), ys.max()
    
    segment_stats[seg_id] = {
        'area': int(area),
        'bg_ratio': bg_ratio,
        'avg_color': avg_color,
        'bbox': (int(min_x), int(min_y), int(max_x), int(max_y)),
        'width': int(max_x - min_x + 1),
        'height': int(max_y - min_y + 1),
    }

# === 第四步：判断每个 segment 是否为物品 ===
items = []
for seg_id, stats in segment_stats.items():
    # 物品的条件：
    # 1. 背景像素占比 < 60% (即有足够的前景内容)
    # 2. 面积不能太大（排除与背景大面积相连的）
    # 3. 不是太细长的线条
    
    if stats['bg_ratio'] > 0.6:
        continue  # 大部分是背景
    
    if stats['area'] > 80000:  # 排除超大合并区域
        continue
    
    cw, ch = stats['width'], stats['height']
    ar = max(cw, ch) / max(min(cw, ch), 1)
    if ar > 12:
        continue  # 太细长
    
    items.append({
        'seg_id': seg_id,
        **stats,
    })

items.sort(key=lambda x: -x['area'])
print(f"\nItems identified: {len(items)}")

# === 第五步：提取精灵 ===
extracted = []

for idx, item in enumerate(items[:40]):
    x1, y1, x2, y2 = item['bbox']
    seg_id = item['seg_id']
    
    # +padding
    pad = 8
    x1_p = max(0, x1 - pad)
    y1_p = max(0, y1 - pad)
    x2_p = min(w - 1, x2 + pad)
    y2_p = min(h - 1, y2 + pad)
    
    # 裁剪
    crop = bg.crop((x1_p, y1_p, x2_p + 1, y2_p + 1))
    crop_arr = np.array(crop)
    
    # segment 掩码
    local_seg_mask = (segments[y1_p:y2_p+1, x1_p:x2_p+1] == seg_id)
    
    # 膨胀2px确保覆盖完整
    local_seg_mask = ndimage.binary_dilation(local_seg_mask, iterations=2)
    
    # 在掩码内进一步去除背景像素
    local_bg = bg_mask[y1_p:y2_p+1, x1_p:x2_p+1]
    
    # 对掩码边缘做精细化：如果边缘像素在背景区域，移除
    eroded = ndimage.binary_erosion(local_seg_mask, iterations=3)
    border_pixels = local_seg_mask & ~eroded & local_bg
    refined_mask = local_seg_mask.copy()
    refined_mask[border_pixels] = False
    
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
        'orig_bbox': [int(x) for x in (x1, y1, x2, y2)],
        'area': int(item['area']),
        'bg_ratio': round(float(item['bg_ratio']), 3),
    })
    
    print(f"[{idx+1}] {item_name}: {crop_w}x{crop_h}, pos=({x1_p},{y1_p}), area={item['area']}, bg={item['bg_ratio']:.1%}")

# === 保存报告 ===
report = {
    'background': BG_PATH,
    'bg_size': [w, h],
    'method': 'felzenszwalb_graph_cut',
    'n_segments': n_segments,
    'n_items': len(extracted),
    'items': extracted,
}

report_path = os.path.join(OUT_DIR, "_extraction_report.json")
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\nDone! {len(extracted)} items saved to {OUT_DIR}")
