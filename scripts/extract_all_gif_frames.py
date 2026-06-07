#!/usr/bin/env python3
"""
提取所有GIF的PNG帧（包括向右的GIF）
"""

import os
from PIL import Image

SPRITES_DIR = r"G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites"
TARGET_DIRS = [
    "cyh_frames",
    "roommateA_frames",
    "roommateB_frames",
    "shop_assistant_female_frames",
    "shop_assistant_male_frames"
]

def extract_png_frames(gif_path, output_dir):
    """从GIF提取PNG帧"""
    try:
        img = Image.open(gif_path)
        os.makedirs(output_dir, exist_ok=True)

        frame_idx = 0
        while True:
            try:
                img.seek(frame_idx)
                frame = img.copy()
                frame_path = os.path.join(output_dir, f"frame_{frame_idx:02d}.png")
                frame.save(frame_path, "PNG")
                frame_idx += 1
            except EOFError:
                break

        print(f"  提取了 {frame_idx} 帧: {os.path.basename(gif_path)}")
        return frame_idx
    except Exception as e:
        print(f"  提取错误 {gif_path}: {e}")
        return 0

def process_directory(dir_name):
    """处理单个目录 - 重新扫描并提取所有GIF"""
    dir_path = os.path.join(SPRITES_DIR, dir_name)
    if not os.path.exists(dir_path):
        print(f"\n目录不存在: {dir_path}")
        return

    print(f"\n{'='*60}")
    print(f"处理目录: {dir_name}")
    print(f"{'='*60}")

    # 重新扫描目录中的所有GIF文件
    gif_files = [f for f in os.listdir(dir_path) if f.endswith('.gif')]
    print(f"找到 {len(gif_files)} 个GIF文件: {gif_files}")

    # 提取所有GIF的PNG帧
    frames_output_base = os.path.join(SPRITES_DIR, "..", "frames", dir_name)

    total_frames = 0
    for gif_file in gif_files:
        gif_path = os.path.join(dir_path, gif_file)
        gif_name_without_ext = os.path.splitext(gif_file)[0]

        # 输出目录：frames/dir_name/gif_name/
        output_dir = os.path.join(frames_output_base, gif_name_without_ext)
        frames = extract_png_frames(gif_path, output_dir)
        total_frames += frames

    print(f"\n总计提取 {total_frames} 帧")
    return total_frames

if __name__ == "__main__":
    print("开始提取所有GIF的PNG帧...")
    print(f"Sprites目录: {SPRITES_DIR}")

    total_all_frames = 0
    for dir_name in TARGET_DIRS:
        frames = process_directory(dir_name)
        total_all_frames += frames

    print(f"\n\n处理完成！总共提取 {total_all_frames} 帧")
