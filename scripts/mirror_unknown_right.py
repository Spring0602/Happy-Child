"""为 ？？？_frames 补全向右帧（镜像向左帧）"""
from PIL import Image
import os

BASE = "G:/混沌/happy-child-game-scaffold/happy-child-game/client/public/assets/sprites/frames/？？？_frames"
SRC_DIR = os.path.join(BASE, "？？？_frames_left")
DST_DIR = os.path.join(BASE, "？？？_frames_right")

os.makedirs(DST_DIR, exist_ok=True)

# 跑步帧 frame_008 ~ frame_013
for fname in sorted(os.listdir(SRC_DIR)):
    src_path = os.path.join(SRC_DIR, fname)
    dst_path = os.path.join(DST_DIR, fname)
    img = Image.open(src_path)
    mirrored = img.transpose(Image.FLIP_LEFT_RIGHT)
    mirrored.save(dst_path)
    print(f"  {fname} -> ？？？_frames_right/{fname}")

print(f"\n完成！共镜像 {len(os.listdir(SRC_DIR))} 帧到 {DST_DIR}")
