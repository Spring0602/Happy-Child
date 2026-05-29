"""
AI 图片水印检测与去除脚本
检测图片底部区域的水印（文字/logo），使用邻近像素填充去除
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

# 修复 Windows 中文编码问题
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


def detect_watermark_region(img: Image.Image) -> tuple | None:
    """
    检测疑似水印区域（底部 15% 区域中对比度异常高的像素块）
    返回 (x1, y1, x2, y2) 或 None
    """
    arr = np.array(img.convert("RGBA"))
    h, w = arr.shape[:2]

    # 仅检查底部 15% 区域
    bottom_band_start = int(h * 0.85)
    bottom_band = arr[bottom_band_start:, :, :3]  # RGB only

    # 转为灰度
    gray = np.mean(bottom_band, axis=2)

    # 计算局部对比度（方差）
    bh = h - bottom_band_start
    # 将底部 band 分成 20x20 的块，检测高对比度块
    block_h = max(bh // 4, 10)
    block_w = max(w // 10, 20)

    candidate_blocks = []
    for by in range(0, bh - block_h, block_h // 2):
        for bx in range(0, w - block_w, block_w // 2):
            block = gray[by:by + block_h, bx:bx + block_w]
            local_std = np.std(block)
            local_mean = np.mean(block)

            # 水印区域特征：标准差高（有文字/图案），亮度可能偏亮或偏暗
            # 全局平均对比度作为基线
            global_std = np.std(gray)
            # 水印区域至少要有一定尺寸（高度 > 15px）才有意义
            min_watermark_height = 15
            block_area = block_h * block_w
            block_height = block_h
            
            if local_std > global_std * 1.5 and block_area > 100 and block_height > min_watermark_height:
                candidate_blocks.append((bx, by + bottom_band_start, bx + block_w, by + bottom_band_start + block_h, local_std))

    if not candidate_blocks:
        return None

    # 取标准差最大的块
    candidate_blocks.sort(key=lambda x: -x[4])
    best = candidate_blocks[0]
    return (best[0], best[1], best[2], best[3])


def remove_watermark(img: Image.Image, region: tuple) -> Image.Image:
    """
    使用邻近区域像素填充去除水印
    """
    x1, y1, x2, y2 = region
    w, h = img.size

    # 扩充区域（留 margin）
    x1 = max(0, x1 - 4)
    y1 = max(0, y1 - 4)
    x2 = min(w, x2 + 4)
    y2 = min(h, y2 + 4)

    arr = np.array(img.convert("RGBA"))

    # 取水印区域上方等高的区域作为源
    src_y1 = max(0, y1 - (y2 - y1))
    src_y2 = y1

    if src_y2 - src_y1 < 1:
        # 如果上方区域不足，用下方区域
        src_y1 = y2
        src_y2 = min(h, y2 + (y2 - y1))

    if src_y2 - src_y1 < 1:
        # 都没有足够区域，直接模糊处理
        roi = arr[y1:y2, x1:x2, :]
        blurred = Image.fromarray(roi).filter(ImageFilter.GaussianBlur(radius=12))
        arr[y1:y2, x1:x2, :] = np.array(blurred)
    else:
        # 将源区域内容复制覆盖水印区域
        src_h = src_y2 - src_y1
        tgt_h = y2 - y1
        # 循环平铺源区域
        for dy in range(0, tgt_h, src_h):
            copy_h = min(src_h, tgt_h - dy)
            arr[y1 + dy:y1 + dy + copy_h, x1:x2, :] = arr[src_y1:src_y1 + copy_h, x1:x2, :]

        # 对边界做模糊融合
        if y1 > 0:
            blend_band = arr[y1 - 2:y1 + 2, x1:x2, :]
            blended = Image.fromarray(blend_band).filter(ImageFilter.GaussianBlur(radius=2))
            arr[y1 - 2:y1 + 2, x1:x2, :] = np.array(blended)

    return Image.fromarray(arr)


def process_directory(root_dir: str, dry_run: bool = False):
    """
    遍历目录下所有 PNG 图片，检测并去除水印
    """
    png_files = list(Path(root_dir).rglob("*.png"))
    total = len(png_files)
    found_watermarks = 0
    removed_watermarks = 0

    print(f"Found {total} PNG files\n")

    for i, png_path in enumerate(png_files, 1):
        try:
            img = Image.open(png_path)
            w, h = img.size

            # 只处理大图（>400px 高），跳过小物品 sprite
            if w < 100 or h < 100:
                continue
            if h < 400:
                # 仅对每20个文件中的第一个报告
                if i <= 5 or i % 30 == 0:
                    print(f"[{i}/{total}] SKIP (sprite, {w}x{h}): {png_path.relative_to(root_dir)}")
                continue

            rel_path = png_path.relative_to(root_dir)
            region = detect_watermark_region(img)

            if region:
                found_watermarks += 1
                rx1, ry1, rx2, ry2 = region
                rh = ry2 - ry1
                position_desc = ""
                if ry1 > h * 0.92:
                    position_desc = "bottom edge"
                elif rx1 < w * 0.3:
                    position_desc = "bottom-left"
                elif rx1 > w * 0.7:
                    position_desc = "bottom-right"
                else:
                    position_desc = "bottom-center"

                print(f"[{i}/{total}] WATERMARK ({position_desc}, {rh}px): {rel_path}")

                if not dry_run:
                    cleaned = remove_watermark(img, region)
                    # 备份原图
                    backup_path = png_path.with_suffix(png_path.suffix + ".bak")
                    if not backup_path.exists():
                        os.rename(png_path, backup_path)
                    else:
                        os.remove(png_path)
                    cleaned.save(png_path, "PNG")
                    removed_watermarks += 1
                    print(f"         REMOVED - backup: {backup_path.name}")
            else:
                print(f"[{i}/{total}] OK: {rel_path}")

        except Exception as e:
            print(f"[{i}/{total}] ERROR: {png_path.name} - {e}")

    print(f"\n{'='*50}")
    print(f"Scan complete: {total} files ({found_watermarks} watermarks detected)")
    if not dry_run:
        print(f"Removed: {removed_watermarks} watermarks")
        print(f"Backups: *.png.bak (safe to delete after verification)")
    else:
        print("(Dry run - no files modified)")
    print(f"{'='*50}")


def main():
    parser = argparse.ArgumentParser(description="检测并去除 AI 生成图片中的水印")
    parser.add_argument(
        "path",
        nargs="?",
        default="./client/public/assets",
        help="要处理的图片目录（默认: ./client/public/assets）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="试运行模式，仅检测不修改",
    )
    parser.add_argument(
        "--clean-backups",
        action="store_true",
        help="删除所有 .png.bak 备份文件",
    )

    args = parser.parse_args()

    if args.clean_backups:
        bak_files = list(Path(args.path).rglob("*.png.bak"))
        for f in bak_files:
            f.unlink()
        print(f"Deleted {len(bak_files)} backup files")
        return

    if not os.path.isdir(args.path):
        print(f"Error: directory not found: {args.path}")
        sys.exit(1)

    process_directory(args.path, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
