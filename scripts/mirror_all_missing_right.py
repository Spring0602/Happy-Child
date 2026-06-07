"""扫描frames目录，为所有角色补全缺失的向右帧"""
import os, sys
from PIL import Image

FRAMES_ROOT = r"G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames"

# 添加 UTF-8 编码支持
sys.stdout.reconfigure(encoding='utf-8')

for char_name in sorted(os.listdir(FRAMES_ROOT)):
    char_dir = os.path.join(FRAMES_ROOT, char_name)
    if not os.path.isdir(char_dir) or not char_name.endswith("_frames"):
        continue

    subdirs = sorted(os.listdir(char_dir))
    # 找向左跑步帧目录
    left_dirs = [d for d in subdirs if d.endswith("_left") and d.count("_") == 2]
    right_dirs = [d for d in subdirs if d.endswith("_right") and d.count("_") == 2]

    for left_name in left_dirs:
        right_name = left_name.replace("_left", "_right")
        left_path = os.path.join(char_dir, left_name)
        right_path = os.path.join(char_dir, right_name)

        # 检查向右目录是否存在且有文件
        right_exists = right_name in right_dirs
        right_files = 0
        if right_exists:
            right_files = len([f for f in os.listdir(right_path) if f.endswith(".png")])

        if right_files > 0:
            print(f"{char_name}/{left_name} -> {right_name}: already has {right_files} frames, skip")
            continue

        # 创建/确保向右目录
        os.makedirs(right_path, exist_ok=True)

        # 镜像所有向左帧
        left_frames = sorted([f for f in os.listdir(left_path) if f.endswith(".png")])
        for fname in left_frames:
            src = os.path.join(left_path, fname)
            dst = os.path.join(right_path, fname)
            img = Image.open(src)
            mirrored = img.transpose(Image.FLIP_LEFT_RIGHT)
            mirrored.save(dst)
        print(f"{char_name}/{left_name} -> {right_name}: mirrored {len(left_frames)} frames")

print("\nDone!")
