#!/usr/bin/env python3
"""
宿舍物品精灵图 - 自动背景透明化工具

基于 remove_bg_v2.py 改造，适配 dormitory/sleep 地图。

功能：
  1. 8邻域 flood-fill 从四边移除背景
  2. 移除内部封闭小背景区域
  3. 输出 RGBA PNG（透明背景）
  4. 支持 --darken 参数调暗物品（用于夜晚场景）

用法：
  python remove_bg_dormitory.py                     # 处理所有物品
  python remove_bg_dormitory.py --items 1 3 5       # 只处理指定编号
  python remove_bg_dormitory.py --threshold 10      # 颜色容差（默认10）
  python remove_bg_dormitory.py --preview           # 预览模式，不保存
  python remove_bg_dormitory.py --darken 0.6        # 调暗到60%亮度
  python remove_bg_dormitory.py --output-dir 物品_sprites_dark  # 输出到不同目录
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
from PIL import Image
from collections import Counter, deque


def get_background_color(img):
    """从图片四角采样，统计最常见的颜色作为背景色"""
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
    """从图片四边开始8邻域 flood-fill，将连通背景区域设为透明"""
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False] * h for _ in range(w)]
    transparent = (0, 0, 0, 0)

    directions = [(-1, -1), (-1, 0), (-1, 1),
                  (0, -1),           (0, 1),
                  (1, -1),  (1, 0),  (1, 1)]

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


def remove_enclosed_bg(img, bg_color, threshold=10, min_area=200):
    """移除物品内部被完全包围的小面积背景区域"""
    w, h = img.size
    pixels = img.load()

    visited = [[False] * h for _ in range(w)]
    regions = []

    for start_x in range(w):
        for start_y in range(h):
            if visited[start_x][start_y]:
                continue
            px = pixels[start_x, start_y]
            if px[3] == 0:
                visited[start_x][start_y] = True
                continue
            if not colors_similar(px, bg_color, threshold):
                visited[start_x][start_y] = True
                continue

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
                            if npx[3] != 0:
                                queue.append((nx, ny))
                                region.append((nx, ny))

            if not touches_edge and len(region) < min_area:
                regions.append(region)

    removed = 0
    for region in regions:
        for x, y in region:
            if pixels[x, y][3] != 0:
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1

    return img, removed


def darken_image(img, factor=0.6):
    """调暗图片（保留透明通道）"""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for x in range(w):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (
                    int(r * factor),
                    int(g * factor),
                    int(b * factor),
                    a
                )
    return img


def process_item(item_path, output_path=None, threshold=10, preview=False, darken=None):
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

    # Step 3: 可选调暗
    if darken is not None:
        result = darken_image(result, darken)
        print(f"  darkened: factor={darken}")

    if preview:
        return result, total_removed

    if output_path:
        result.save(output_path, "PNG")
        print(f"  saved: {output_path}")
    else:
        result.save(item_path, "PNG")
        print(f"  saved: {item_path}")

    return result, total_removed


def main():
    parser = argparse.ArgumentParser(description="Dormitory sprite background removal")
    parser.add_argument("--items", nargs="+", type=int, help="Item numbers (e.g. 1 3 5)")
    parser.add_argument("--threshold", type=int, default=10, help="Color tolerance (default 10)")
    parser.add_argument("--preview", action="store_true", help="Preview only, no save")
    parser.add_argument("--darken", type=float, default=None, help="Darken factor (e.g. 0.6 = 60%% brightness)")
    parser.add_argument("--output-dir", type=str, help="Output directory (relative to dormitory dir)")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup")
    parser.add_argument("--input-dir", type=str, default=None,
                        help="Input directory (default: dormitory/物品_sprites)")
    args = parser.parse_args()

    # 默认路径：项目根目录下的 dormitory 物品精灵
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    default_input = project_root / "client" / "public" / "assets" / "maps" / "dormitory" / "物品_sprites"

    base_dir = Path(args.input_dir) if args.input_dir else default_input
    backup_dir = base_dir.parent / "物品_sprites_backup"

    if not base_dir.exists():
        print(f"Directory not found: {base_dir}")
        print("Use --input-dir to specify a different directory.")
        sys.exit(1)

    if args.items:
        item_files = [base_dir / f"item_{i:02d}.png" for i in args.items]
    else:
        item_files = sorted(base_dir.glob("item_*.png"))

    if not item_files:
        print("No item files found!")
        sys.exit(1)

    print(f"Input dir: {base_dir}")
    print(f"Items: {len(item_files)}")
    print(f"Threshold: {args.threshold}")
    if args.darken:
        print(f"Darken: {args.darken}")
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
                preview=args.preview,
                darken=args.darken
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
