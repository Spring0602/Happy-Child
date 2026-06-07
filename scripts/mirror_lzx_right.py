#!/usr/bin/env python3
"""
为 lzx_frames 补全向右动作（镜像向左的PNG帧）
"""
import os
from PIL import Image

FRAMES_DIR = r"G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames"

def mirror_and_save(src_path, dst_path):
    """读取PNG，左右镜像，保存"""
    try:
        img = Image.open(src_path)
        mirrored = img.transpose(Image.FLIP_LEFT_RIGHT)
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        mirrored.save(dst_path, "PNG")
        return True
    except Exception as e:
        print(f"  错误: {e}")
        return False

def main():
    left_dir = os.path.join(FRAMES_DIR, "lzx_frames_left")
    right_dir = os.path.join(FRAMES_DIR, "lzx_frames_right")
    stand_left_dir = os.path.join(FRAMES_DIR, "lzx_frames_stand_left")
    stand_right_dir = os.path.join(FRAMES_DIR, "lzx_frames_stand_right")

    # 1. 跑步向右：镜像所有向左跑步帧
    print("=== 跑步向右 ===")
    if os.path.isdir(left_dir):
        files = sorted(os.listdir(left_dir))
        for f in files:
            if f.endswith('.png'):
                src = os.path.join(left_dir, f)
                dst = os.path.join(right_dir, f)
                if mirror_and_save(src, dst):
                    print(f"  {f} -> lzx_frames_right/{f}")
        print(f"  共处理 {len(files)} 帧")
    else:
        print(f"  目录不存在: {left_dir}")

    # 2. 站立向右：镜像站立向左帧
    print("\n=== 站立向右 ===")
    if os.path.isdir(stand_left_dir):
        files = sorted(os.listdir(stand_left_dir))
        for f in files:
            if f.endswith('.png'):
                src = os.path.join(stand_left_dir, f)
                dst = os.path.join(stand_right_dir, f)
                if mirror_and_save(src, dst):
                    print(f"  {f} -> lzx_frames_stand_right/{f}")
        print(f"  共处理 {len(files)} 帧")
    else:
        print(f"  目录不存在: {stand_left_dir}")

    print("\n完成！")

if __name__ == "__main__":
    main()
