"""
教师办公室提取图分割脚本 (PIL版本，无需OpenCV)
处理白底散列提取图，提取物品为 256x256 RGBA PNG
"""
from PIL import Image
import numpy as np
import os

INPUT_PATH = r'E:\Happy-Child\client\public\assets\maps\teacher_office\提取图.png'
OUTPUT_DIR = r'E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室物品_sprites'

def flood_fill_bfs(mask, start_y, start_x):
    """BFS连通域标记，返回区域内所有坐标"""
    coords = []
    stack = [(start_y, start_x)]
    h, w = mask.shape
    while stack:
        y, x = stack.pop()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if mask[y, x]:
            mask[y, x] = False
            coords.append((y, x))
            stack.extend([(y+1, x), (y-1, x), (y, x+1), (y, x-1)])
    return coords

def extract_items():
    img = Image.open(INPUT_PATH).convert('RGBA')
    arr = np.array(img)
    print(f"Loaded image: {arr.shape}")

    # Detect white background
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    white_mask = (r > 240) & (g > 240) & (b > 240) & (a > 200)

    # Items are NOT white
    item_mask = ~white_mask

    h, w = item_mask.shape
    visited = item_mask.copy()
    components = []

    for y in range(h):
        for x in range(w):
            if visited[y, x]:
                coords = flood_fill_bfs(visited, y, x)
                if len(coords) >= 200:  # min area
                    ys = [c[0] for c in coords]
                    xs = [c[1] for c in coords]
                    min_y, max_y = min(ys), max(ys)
                    min_x, max_x = min(xs), max(xs)
                    components.append({
                        'coords': coords,
                        'bbox': (min_x, min_y, max_x, max_y),
                        'area': len(coords)
                    })

    # Sort by Y then X of bbox center
    components.sort(key=lambda c: (c['bbox'][1] + c['bbox'][3]) / 2 + (c['bbox'][0] + c['bbox'][2]) / (w * 100))
    print(f"Found {len(components)} valid components")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    saved = 0
    for idx, comp in enumerate(components, start=1):
        min_x, min_y, max_x, max_y = comp['bbox']
        content_w = max_x - min_x + 1
        content_h = max_y - min_y + 1

        # Skip thin fragments
        if content_w < 10 or content_h < 10:
            print(f"  Skip item_{idx:02d}: too small ({content_w}x{content_h})")
            continue
        if comp['area'] < 300:
            print(f"  Skip item_{idx:02d}: too few pixels ({comp['area']})")
            continue

        # Create mask image
        mask = np.zeros((h, w), dtype=np.uint8)
        for cy, cx in comp['coords']:
            mask[cy, cx] = 255

        # Extract with padding
        padding = 8
        x1 = max(0, min_x - padding)
        y1 = max(0, min_y - padding)
        x2 = min(w, max_x + 1 + padding)
        y2 = min(h, max_y + 1 + padding)

        crop_rgba = arr[y1:y2, x1:x2].copy()
        crop_mask = mask[y1:y2, x1:x2]
        crop_rgba[:, :, 3] = crop_mask

        # Get actual crop dimensions (may differ from bbox due to image bounds)
        crop_h, crop_w = crop_rgba.shape[:2]

        # Create 256x256 canvas
        canvas = np.zeros((256, 256, 4), dtype=np.uint8)

        # Scale to fit
        max_content = 236
        scale = min(max_content / crop_w, max_content / crop_h, 1.0)
        new_w = max(1, int(crop_w * scale))
        new_h = max(1, int(crop_h * scale))

        pil_crop = Image.fromarray(crop_rgba, 'RGBA')
        if new_w != crop_w or new_h != crop_h:
            pil_resized = pil_crop.resize((new_w, new_h), Image.NEAREST)
        else:
            pil_resized = pil_crop

        offset_x = (256 - new_w) // 2
        offset_y = (256 - new_h) // 2
        canvas[offset_y:offset_y+new_h, offset_x:offset_x+new_w] = np.array(pil_resized)

        Image.fromarray(canvas, 'RGBA').save(os.path.join(OUTPUT_DIR, f'item_{idx:02d}.png'), 'PNG')
        saved += 1
        print(f"  Saved item_{idx:02d}: {content_w}x{content_h} -> {new_w}x{new_h} (area={comp['area']})")

    print(f"\nTotal saved: {saved} sprites -> {OUTPUT_DIR}")

if __name__ == '__main__':
    extract_items()
