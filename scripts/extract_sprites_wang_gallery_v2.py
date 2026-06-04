from PIL import Image
import numpy as np
from collections import deque
import os

# 三张输入图（按处理顺序）
INPUT_FILES = [
    "E:/Happy-Child/client/public/assets/maps/wang_gallery/提取图1.png",
    "E:/Happy-Child/client/public/assets/maps/wang_gallery/提取图2.png",
    "E:/Happy-Child/client/public/assets/maps/wang_gallery/提取图3.png",
]

OUTPUT_DIR = "E:/Happy-Child/client/public/assets/maps/wang_gallery/美术教室物品_sprites"
TARGET_SIZE = 256
MIN_AREA = 150


def find_connected_components(img_rgba):
    """使用 BFS 查找连通域，返回每个连通域的 (min_x, min_y, max_x, max_y, count)"""
    arr = np.array(img_rgba)
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    visited = np.zeros((h, w), dtype=bool)
    components = []

    for y in range(h):
        for x in range(w):
            if alpha[y, x] > 0 and not visited[y, x]:
                queue = deque([(x, y)])
                visited[y, x] = True
                min_x, min_y = x, y
                max_x, max_y = x, y
                count = 0

                while queue:
                    cx, cy = queue.popleft()
                    count += 1
                    min_x = min(min_x, cx)
                    min_y = min(min_y, cy)
                    max_x = max(max_x, cx)
                    max_y = max(max_y, cy)

                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if alpha[ny, nx] > 0 and not visited[ny, nx]:
                                visited[ny, nx] = True
                                queue.append((nx, ny))

                if count >= MIN_AREA:
                    components.append((min_x, min_y, max_x, max_y, count))

    return components


def process_image(input_path, global_idx):
    """处理单张图，返回下一个全局编号"""
    print(f"\n处理: {os.path.basename(input_path)}")
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)

    # 将白色/接近白色背景设为透明
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    white_mask = (r > 240) & (g > 240) & (b > 240)
    arr[white_mask] = [255, 255, 255, 0]
    pure_white = (r == 255) & (g == 255) & (b == 255)
    arr[pure_white] = [255, 255, 255, 0]

    img_processed = Image.fromarray(arr, "RGBA")
    components = find_connected_components(img_processed)
    print(f"  找到 {len(components)} 个连通域")

    # 按位置排序：先按 y（从上到下），再按 x（从左到右）
    components.sort(key=lambda c: (c[1], c[0]))

    for min_x, min_y, max_x, max_y, count in components:
        pad = 4
        min_x = max(0, min_x - pad)
        min_y = max(0, min_y - pad)
        max_x = min(img.width - 1, max_x + pad)
        max_y = min(img.height - 1, max_y + pad)

        crop = img_processed.crop((min_x, min_y, max_x + 1, max_y + 1))

        # 缩放到 TARGET_SIZE，保持比例，居中放在透明背景上
        cw, ch = crop.size
        scale = min(TARGET_SIZE / cw, TARGET_SIZE / ch)
        new_w = int(cw * scale)
        new_h = int(ch * scale)
        resized = crop.resize((new_w, new_h), Image.LANCZOS)

        canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
        offset_x = (TARGET_SIZE - new_w) // 2
        offset_y = (TARGET_SIZE - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y), resized)

        out_path = f"{OUTPUT_DIR}/item_{global_idx:02d}.png"
        canvas.save(out_path)
        print(f"    item_{global_idx:02d}.png: {cw}x{ch} -> {new_w}x{new_h} (area={count})")
        global_idx += 1

    return global_idx


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    idx = 1
    for path in INPUT_FILES:
        idx = process_image(path, idx)

    total = idx - 1
    print(f"\n共提取 {total} 个物品到 {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
