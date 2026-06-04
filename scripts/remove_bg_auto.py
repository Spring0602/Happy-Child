#!/usr/bin/env python3
"""
像素风格物品精灵图 - 自动背景透明化工具

原理：
  1. 从图片四角采样背景色（像素风格背景通常颜色统一）
  2. 使用 flood-fill 从四角向内扩展，将连通背景区域替换为透明
  3. 保留物品本身的像素不变

用法：
  python remove_bg_auto.py                    # 处理所有物品
  python remove_bg_auto.py --items 3 5 8      # 只处理指定编号
  python remove_bg_auto.py --threshold 30     # 调整颜色容差（默认10）
  python remove_bg_auto.py --preview          # 预览模式，不实际保存
  python remove_bg_auto.py --output-dir DIR   # 输出到不同目录

注意：
  - 原始文件会被覆盖！处理前会自动备份到 物品_sprites_backup/
  - 如果自动效果不理想，可用 --preview 查看结果后再决定
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
from PIL import Image
from collections import Counter


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

    # 四角采样
    for x_start, y_start in [(0, 0), (w - sample_size, 0),
                              (0, h - sample_size), (w - sample_size, h - sample_size)]:
        for dx in range(sample_size):
            for dy in range(sample_size):
                px = img.getpixel((x_start + dx, y_start + dy))
                corner_pixels.append(px[:3])  # 只取 RGB

    # 统计最常见颜色
    color_counts = Counter(corner_pixels)
    bg_color = color_counts.most_common(1)[0][0]
    return bg_color


def colors_similar(c1, c2, threshold=10):
    """判断两个颜色是否在容差范围内相似（欧氏距离）"""
    dist = sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5
    return dist <= threshold


def flood_fill_transparent(img, bg_color, threshold=10):
    """
    从图片四角开始 flood-fill，将背景区域设为透明。
    使用 BFS 扩展，只替换与背景色相似且连通的像素。
    """
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # 记录已访问的像素
    visited = [[False] * h for _ in range(w)]

    # 透明色
    transparent = (0, 0, 0, 0)

    # BFS 队列：从四边的所有背景色像素开始
    queue = []

    # 扫描四条边上的背景色像素作为种子点
    for x in range(w):
        for y in [0, h - 1]:
            if colors_similar(pixels[x, y][:3], bg_color, threshold) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    for y in range(h):
        for x in [0, w - 1]:
            if colors_similar(pixels[x, y][:3], bg_color, threshold) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    # BFS flood-fill
    count = 0
    while queue:
        x, y = queue.pop(0)
        pixels[x, y] = transparent
        count += 1

        # 四邻域扩展
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if colors_similar(pixels[nx, ny][:3], bg_color, threshold):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img, count


def remove_interior_holes(img, min_hole_area=50):
    """
    可选：移除物品内部的小透明孔洞。
    如果物品内部有小面积透明区域（可能是误识别），可以填充回原色。
    默认不启用，仅当 --fill-holes 参数时使用。
    """
    # 这里暂不实现，像素风格物品通常不需要
    return img


def process_item(item_path, output_path=None, threshold=10, preview=False):
    """处理单个物品图片"""
    img = Image.open(item_path)
    original_mode = img.mode
    bg_color = get_background_color(img)

    print(f"  背景色: RGB({bg_color[0]}, {bg_color[1]}, {bg_color[2]})")

    result, removed_count = flood_fill_transparent(img, bg_color, threshold)

    total_pixels = img.size[0] * img.size[1]
    removed_pct = removed_count / total_pixels * 100

    print(f"  移除像素: {removed_count}/{total_pixels} ({removed_pct:.1f}%)")

    if preview:
        # 预览：显示透明区域占比，不保存
        transparent_count = sum(1 for x in range(result.size[0])
                               for y in range(result.size[1])
                               if result.getpixel((x, y))[3] == 0)
        print(f"  [预览] 透明像素占比: {transparent_count/total_pixels*100:.1f}%")
        return result, removed_count

    # 保存
    if output_path:
        result.save(output_path, "PNG")
        print(f"  已保存: {output_path}")
    else:
        result.save(item_path, "PNG")
        print(f"  已覆盖: {item_path}")

    return result, removed_count


def main():
    parser = argparse.ArgumentParser(description="像素风格物品精灵图 - 自动背景透明化")
    parser.add_argument("--items", nargs="+", type=int, help="指定处理的物品编号（如 3 5 8）")
    parser.add_argument("--threshold", type=int, default=10, help="颜色容差（默认10，值越大越激进）")
    parser.add_argument("--preview", action="store_true", help="预览模式，不实际保存")
    parser.add_argument("--output-dir", type=str, help="输出目录（默认覆盖原文件）")
    parser.add_argument("--no-backup", action="store_true", help="不创建备份")
    args = parser.parse_args()

    # 基础路径
    base_dir = Path(r"E:\Happy-Child\client\public\assets\maps\teacher_office\物品_sprites")
    backup_dir = base_dir.parent / "物品_sprites_backup"

    # 确定要处理的物品
    if args.items:
        item_files = [base_dir / f"item_{i:02d}.png" for i in args.items]
    else:
        item_files = sorted(base_dir.glob("item_*.png"))

    if not item_files:
        print("未找到物品文件！")
        sys.exit(1)

    print(f"找到 {len(item_files)} 个物品文件")
    print(f"颜色容差: {args.threshold}")
    print(f"模式: {'预览' if args.preview else '实际保存'}")
    print("=" * 60)

    # 备份（非预览模式且未禁用备份）
    if not args.preview and not args.no_backup and not args.output_dir:
        if not backup_dir.exists():
            shutil.copytree(base_dir, backup_dir)
            print(f"已备份到: {backup_dir}")
        else:
            print(f"备份已存在: {backup_dir}")
        print("=" * 60)

    # 处理每个物品
    results = []
    for item_path in item_files:
        if not item_path.exists():
            print(f"[跳过] 文件不存在: {item_path}")
            continue

        print(f"\n处理: {item_path.name}")

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
            print(f"  [错误] {e}")
            results.append((item_path.name, 0, f"ERROR: {e}"))

    # 汇总
    print("\n" + "=" * 60)
    print("处理汇总:")
    print("-" * 60)
    ok_count = 0
    for name, count, status in results:
        marker = "OK" if status == "OK" else "ERR"
        print(f"  {marker} {name}: {status}")
        if status == "OK":
            ok_count += 1

    print(f"\n成功: {ok_count}/{len(results)}")

    if args.preview:
        print("\n[预览模式] 未保存任何文件。满意的话，去掉 --preview 重新运行。")
    else:
        print(f"\n原始文件备份在: {backup_dir}")
        print("如需恢复备份，手动将备份目录中的文件复制回来即可。")


if __name__ == "__main__":
    main()
