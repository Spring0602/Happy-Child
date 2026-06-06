#!/usr/bin/env python3
"""
创建向右的GIF（通过镜像向左的GIF）
并提取所有GIF的PNG帧
"""

import os
from PIL import Image
import shutil

# 需要处理的目录
SPRITES_DIR = r"G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites"
TARGET_DIRS = [
    "cyh_frames",
    "roommateA_frames",
    "roommateB_frames",
    "shop_assistant_female_frames",
    "shop_assistant_male_frames"
]

def inspect_gif(gif_path):
    """检查GIF文件的结构"""
    try:
        img = Image.open(gif_path)
        print(f"\n检查: {os.path.basename(gif_path)}")
        print(f"  尺寸: {img.size}")
        print(f"  格式: {img.format}")
        print(f"  模式: {img.mode}")

        # 检查帧数
        frames = 0
        while True:
            try:
                img.seek(frames)
                frames += 1
            except EOFError:
                break

        print(f"  帧数: {frames}")

        # 回到第一帧
        img.seek(0)
        return frames
    except Exception as e:
        print(f"  错误: {e}")
        return 0

def create_right_gif_from_left(left_gif_path, right_gif_path):
    """通过镜像向左的GIF创建向右的GIF"""
    try:
        left_img = Image.open(left_gif_path)
        frames = []

        # 读取所有帧并镜像
        frame_idx = 0
        while True:
            try:
                left_img.seek(frame_idx)
                # 镜像当前帧
                mirrored_frame = left_img.copy().transpose(Image.FLIP_LEFT_RIGHT)
                frames.append(mirrored_frame)
                frame_idx += 1
            except EOFError:
                break

        if not frames:
            print(f"  警告: {left_gif_path} 没有帧")
            return False

        # 保存为GIF
        frames[0].save(
            right_gif_path,
            save_all=True,
            append_images=frames[1:],
            loop=0,
            duration=100  # 100ms per frame
        )
        print(f"  已创建: {os.path.basename(right_gif_path)}")
        return True
    except Exception as e:
        print(f"  错误创建 {right_gif_path}: {e}")
        return False

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

        print(f"  提取了 {frame_idx} 帧到 {output_dir}")
        return frame_idx
    except Exception as e:
        print(f"  提取错误 {gif_path}: {e}")
        return 0

def process_directory(dir_name):
    """处理单个目录"""
    dir_path = os.path.join(SPRITES_DIR, dir_name)
    if not os.path.exists(dir_path):
        print(f"\n目录不存在: {dir_path}")
        return

    print(f"\n{'='*60}")
    print(f"处理目录: {dir_name}")
    print(f"{'='*60}")

    # 列出所有GIF文件
    gif_files = [f for f in os.listdir(dir_path) if f.endswith('.gif')]
    print(f"找到 {len(gif_files)} 个GIF文件")

    # 检查哪些向左的GIF需要创建向右的版本
    left_gifs = [f for f in gif_files if '_left.gif' in f or '_stand_left.gif' in f or '_sit_left.gif' in f]

    print(f"\n向左的GIF: {left_gifs}")

    for left_gif in left_gifs:
        # 确定向右的GIF文件名
        if '_stand_left.gif' in left_gif:
            right_gif = left_gif.replace('_stand_left.gif', '_stand_right.gif')
        elif '_sit_left.gif' in left_gif:
            right_gif = left_gif.replace('_sit_left.gif', '_sit_right.gif')
        elif '_left.gif' in left_gif:
            right_gif = left_gif.replace('_left.gif', '_right.gif')
        else:
            continue

        left_gif_path = os.path.join(dir_path, left_gif)
        right_gif_path = os.path.join(dir_path, right_gif)

        # 检查向右的GIF是否已存在
        if os.path.exists(right_gif_path):
            print(f"\n  向右GIF已存在: {right_gif}")
            # 仍然检查其结构
            inspect_gif(right_gif_path)
        else:
            print(f"\n  创建向右GIF: {left_gif} -> {right_gif}")
            create_right_gif_from_left(left_gif_path, right_gif_path)

    # 提取所有GIF的PNG帧
    print(f"\n提取所有GIF的PNG帧...")
    frames_output_base = os.path.join(SPRITES_DIR, "..", "frames", dir_name)

    for gif_file in gif_files:
        gif_path = os.path.join(dir_path, gif_file)
        gif_name_without_ext = os.path.splitext(gif_file)[0]

        # 输出目录：frames/dir_name/gif_name/
        output_dir = os.path.join(frames_output_base, gif_name_without_ext)
        print(f"\n  处理: {gif_file}")
        extract_png_frames(gif_path, output_dir)

if __name__ == "__main__":
    print("开始处理...")
    print(f"Sprites目录: {SPRITES_DIR}")

    for dir_name in TARGET_DIRS:
        process_directory(dir_name)

    print("\n\n处理完成！")
