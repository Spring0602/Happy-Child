#!/usr/bin/env python3
"""
像素风格物品精灵图 - 自动背景透明化工具 v2

对齐客厅物品处理标准：
  1. 8邻域 flood-fill（比4邻域覆盖更完整）
  2. 移除边缘背景 + 内部封闭小背景区域
  3. 输出 RGBA PNG

用法：
  python remove_bg_v2.py                     # 处理所有物品，覆盖原文件（自动备份）
  python remove_bg_v2.py --items 3 5 8       # 只处理指定编号
  python remove_bg_v2.py --threshold 10      # 颜色容差（默认10）
  python remove_bg_v2.py --output-dir DIR    # 输出到不同目录
  python remove_bg_v2.py --preview           # 预览模式，不保存
  python remove_bg_v2.py --no-backup         # 不创建备份
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
from PIL import Image
from collections import Counter, deque


def get_background_color(img):
    """
    从图片四角采样，统计最常见的颜色作为背景色。
    采样区域：每个角 5x5 像素块
    """
    w, h = img.size
    sample_size = min(5, w // 2, h // 2)
    if sample_size < 1:
        sample_size = 1

    corner_pixels = []
    for x_start, y_start in [(0, 0), (w - sample_size, 0),
                              (0, h - sample_size), (w - sample_size, h - sample_size)]:
        for dx in range(sample_size):
            for dy in range(sample_size):
                px = img.getpixel((x_start + dx, y_start + dy))
                corner_pixels.append(px[:3])

    color_counts = Counter(corner_pixels)
    bg_color = color_counts.most_common(1)[0][0]
    return bg_color


def colors_similar(c1, c2, threshold=10):
    """判断两个颜色是否在容差范围内相似（欧氏距离）"""
    dist = sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5
    return dist <= threshold


def flood_fill_transparent(img, bg_color, threshold=10):
    """
    从图片四边开始 flood-fill，将连通背景区域设为透明。
    使用8邻域BFS扩展，比4邻域覆盖更完整（对角连通的背景也能移除）。
    """
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False] * h for _ in range(w)]
    transparent = (0, 0, 0, 0)

    # 8邻域方向
    directions = [(-1, -1), (-1, 0), (-1, 1),
                  (0, -1),           (0, 1),
                  (1, -1),  (1, 0),  (1, 1)]

    # 从四条边上的背景色像素开始
    queue = deque()
    for x in range(w):
        for y in [0, h - 1]:
            if colors_similar(pixels[x, y], bg_color, threshold) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    for y in range(h):
        for x in [0, w - 1]:
            if colors_similar(pixels[x, y], bg_color, threshold) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    # BFS flood-fill
    count = 0
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = transparent
        count += 1

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if colors_similar(pixels[nx, ny], bg_color, threshold):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img, count


def remove_enclosed_bg(img, bg_color, threshold=10, min_area=100):
    """
    移除物品内部被完全包围的小面积背景区域。
    对于灯泡、窗户等物品，内部可能有被物品轮廓完全包围的背景区域，
    这些区域无法通过边缘 flood-fill 到达，但视觉上仍应是透明的。

    min_area: 小于此面积的封闭背景区域才移除（防止误删大面积内部暗色区域）
    """
    w, h = img.size
    pixels = img.load()

    # 找出所有非透明且与背景色相似的像素
    visited = [[False] * h for _ in range(w)]
    regions = []

    for start_x in range(w):
        for start_y in range(h):
            if visited[start_x][start_y]:
                continue
            px = pixels[start_x, start_y]
            if px[3] == 0:  # 已经透明
                visited[start_x][start_y] = True
                continue
            if not colors_similar(px, bg_color, threshold):
                visited[start_x][start_y] = True
                continue

            # BFS 找出连通区域
            queue = deque([(start_x, start_y)])
            visited[start_x][start_y] = True
            region = [(start_x, start_y)]
            touches_edge = False

            while queue:
                x, y = queue.popleft()
                if x == 0 or x == w - 1 or y == 0 or y == h - 1:
                    touches_edge = True

                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                        npx = pixels[nx, ny]
                        if npx[3] == 0 or colors_similar(npx, bg_color, threshold):
                            visited[nx][ny] = True
                            if npx[3] != 0:  # 还没透明的背景色像素
                                queue.append((nx, ny))
                                region.append((nx, ny))

            # 不触边且面积小于阈值的区域 → 移除
            if not touches_edge and len(region) < min_area:
                regions.append(region)

    # 将小封闭背景区域设为透明
    removed = 0
    for region in regions:
        for x, y in region:
            if pixels[x, y][3] != 0:
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1

    return img, removed


def process_item(item_path, output_path=None, threshold=10, preview=False):
    """处理单个物品图片"""
    img = Image.open(item_path)
    bg_color = get_background_color(img)

    print(f"  bg_color: RGB({bg_color[0]},{bg_color[1]},{bg_color[2]})")

    # Step 1: 边缘 flood-fill 透明化
    result, edge_count = flood_fill_transparent(img, bg_color, threshold)
    total = img.size[0] * img.size[1]
    print(f"  edge_fill: {edge_count}/{total} ({edge_count/total*100:.1f}%)")

    # Step 2: 移除内部封闭小背景区域
    result, inner_count = remove_enclosed_bg(result, bg_color, threshold, min_area=200)
    if inner_count > 0:
        print(f"  inner_fill: +{inner_count} pixels removed (enclosed bg)")
    else:
        print(f"  inner_fill: no enclosed bg found")

    total_removed = edge_count + inner_count
    print(f"  total_transparent: {total_removed}/{total} ({total_removed/total*100:.1f}%)")

    if preview:
        return result, total_removed

    # 保存
    if output_path:
        result.save(output_path, "PNG")
        print(f"  saved: {output_path}")
    else:
        result.save(item_path, "PNG")
        print(f"  saved: {item_path}")

    return result, total_removed


def main():
    parser = argparse.ArgumentParser(description="Pixel-art sprite background removal v2")
    parser.add_argument("--items", nargs="+", type=int, help="Item numbers (e.g. 3 5 8)")
    parser.add_argument("--threshold", type=int, default=10, help="Color tolerance (default 10)")
    parser.add_argument("--preview", action="store_true", help="Preview only, no save")
    parser.add_argument("--output-dir", type=str, help="Output directory")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup")
    args = parser.parse_args()

    base_dir = Path(r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites")
    backup_dir = base_dir.parent / "物品_sprites_backup"

    if args.items:
        item_files = [base_dir / f"item_{i:02d}.png" for i in args.items]
    else:
        item_files = sorted(base_dir.glob("item_*.png"))

    if not item_files:
        print("No item files found!")
        sys.exit(1)

    print(f"Items: {len(item_files)}")
    print(f"Threshold: {args.threshold}")
    print(f"Mode: {'preview' if args.preview else 'save'}")
    print("=" * 60)

    # Backup
    if not args.preview and not args.no_backup and not args.output_dir:
        if not backup_dir.exists():
            shutil.copytree(base_dir, backup_dir)
            print(f"Backup: {backup_dir}")
        else:
            print(f"Backup exists: {backup_dir}")
        print("=" * 60)

    results = []
    for item_path in item_files:
        if not item_path.exists():
            print(f"[SKIP] Not found: {item_path}")
            continue

        print(f"\n{item_path.name}")

        output_path = None
        if args.output_dir:
            out_dir = Path(args.output_dir)
            out_dir.mkdir(parents=True, exist_ok=True)
            output_path = out_dir / item_path.name

        try:
            result, count = process_item(
                item_path,
                output_path=output_path,
                threshold=args.threshold,
                preview=args.preview
            )
            results.append((item_path.name, count, "OK"))
        except Exception as e:
            print(f"  [ERROR] {e}")
            results.append((item_path.name, 0, f"ERROR: {e}"))

    # Summary
    print("\n" + "=" * 60)
    print("Summary:")
    print("-" * 60)
    ok_count = 0
    for name, count, status in results:
        marker = "OK" if status == "OK" else "ERR"
        print(f"  [{marker}] {name}")
        if status == "OK":
            ok_count += 1

    print(f"\nDone: {ok_count}/{len(results)}")

    if args.preview:
        print("\n[Preview] No files saved. Remove --preview to apply.")
    else:
        if not args.output_dir:
            print(f"\nBackup: {backup_dir}")


if __name__ == "__main__":
    main()
