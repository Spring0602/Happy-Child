"""分析客厅底图，用模板匹配找到每个家具精灵的精确位置"""
from PIL import Image
import numpy as np
import os
import json

BG_PATH = r"e:\Happy-Child\client\public\assets\maps\livingroom\客厅.png"
SPRITE_DIR = r"e:\Happy-Child\client\public\assets\maps\livingroom\客厅物品_sprites"

bg = Image.open(BG_PATH).convert("RGBA")
bg_arr = np.array(bg)
bg_h, bg_w = bg_arr.shape[:2]
print(f"客厅.png: {bg_w} x {bg_h}")

results = []

sprites = sorted([
    f for f in os.listdir(SPRITE_DIR)
    if f.endswith(".png") and f.startswith("item_")  # 包含 flip
])

for sprite_file in sprites:
    sp_path = os.path.join(SPRITE_DIR, sprite_file)
    sp = Image.open(sp_path).convert("RGBA")
    sp_arr = np.array(sp)
    sp_h, sp_w = sp_arr.shape[:2]

    # 跳过超大尺寸的（item_15 旧版本）
    if sp_w > 1000 or sp_h > 1000:
        print(f"{sprite_file}: SKIP (too large: {sp_w}x{sp_h})")
        continue

    sp_alpha = sp_arr[:, :, 3]
    sp_rgb = sp_arr[:, :, :3].astype(np.float32)

    # 非透明区域
    alpha_mask = sp_alpha > 128
    ys, xs = np.where(alpha_mask)
    if len(ys) == 0:
        print(f"{sprite_file}: NO CONTENT")
        continue
    y_min, y_max = ys.min(), ys.max()
    x_min, x_max = xs.min(), xs.max()

    # 裁剪到内容区域
    sp_crop = sp_rgb[y_min:y_max+1, x_min:x_max+1]
    crop_alpha = sp_alpha[y_min:y_max+1, x_min:x_max+1]
    crop_h, crop_w = sp_crop.shape[:2]
    alpha_mask_crop = crop_alpha > 128

    # 模板匹配：在底图上滑动搜索
    best_mse = float("inf")
    best_x, best_y = 0, 0

    step = 3  # 步长，平衡速度和精度
    for sy in range(0, bg_h - crop_h, step):
        for sx in range(0, bg_w - crop_w, step):
            bg_patch = bg_arr[sy:sy+crop_h, sx:sx+crop_w, :3].astype(np.float32)
            diff = np.abs(bg_patch - sp_crop)
            mse = (diff * alpha_mask_crop[:, :, np.newaxis]).sum() / alpha_mask_crop.sum()
            if mse < best_mse:
                best_mse = mse
                best_x, best_y = sx, sy

    # 精调：在最佳位置 ± 步长范围内以步长1搜索
    best_y_fine, best_x_fine = best_y, best_x
    best_mse_fine = best_mse
    for sy in range(max(0, best_y - step), min(bg_h - crop_h, best_y + step + 1)):
        for sx in range(max(0, best_x - step), min(bg_w - crop_w, best_x + step + 1)):
            bg_patch = bg_arr[sy:sy+crop_h, sx:sx+crop_w, :3].astype(np.float32)
            diff = np.abs(bg_patch - sp_crop)
            mse = (diff * alpha_mask_crop[:, :, np.newaxis]).sum() / alpha_mask_crop.sum()
            if mse < best_mse_fine:
                best_mse_fine = mse
                best_x_fine, best_y_fine = sx, sy

    # 原始 256x256 精灵在底图上的坐标
    origin_x = best_x_fine - x_min      # 精灵左上角在底图上的 X
    origin_y = best_y_fine - y_min      # 精灵左上角在底图上的 Y
    
    # 实际内容区域的尺寸
    content_w = x_max - x_min + 1
    content_h = y_max - y_min + 1

    # 精灵中心点（用于 Tiled 对象定位）
    # Tiled 对象 x,y 是左上角坐标
    cx = origin_x + sp_w // 2
    cy = origin_y + sp_h // 2

    quality = "完美" if best_mse_fine < 8 else ("良好" if best_mse_fine < 20 else ("一般" if best_mse_fine < 40 else "较差"))
    print(f"{sprite_file}: tiled_pos=({origin_x:4d},{origin_y:4d}) center=({cx:4d},{cy:4d}) content=({content_w:3d}x{content_h:3d}) mse={best_mse_fine:5.1f} [{quality}]")

    results.append({
        "name": sprite_file.replace(".png", ""),
        "x": int(origin_x),
        "y": int(origin_y),
        "width": int(sp_w),
        "height": int(sp_h),
        "content_w": int(content_w),
        "content_h": int(content_h),
        "center_x": int(cx),
        "center_y": int(cy),
        "mse": float(best_mse_fine),
        "quality": quality,
    })

# 保存结果
output = {
    "bg_size": [bg_w, bg_h],
    "furniture": sorted(results, key=lambda r: (r["y"], r["x"])),
}
with open(os.path.join(SPRITE_DIR, "..", "furniture_positions.json"), "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print("\n结果已保存到 furniture_positions.json")
