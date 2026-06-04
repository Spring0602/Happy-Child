"""
教师办公室物品提取脚本
功能：
1. 从 教师办公室.png 中提取每个独立物品
2. 将背景（地板/墙壁）替换为白色
3. 保存为独立 PNG 文件供检查
"""

from PIL import Image
import os
import numpy as np

# 输入输出路径
INPUT_PATH = r"E:\Happy-Child\client\public\assets\maps\teacher_office\教师办公室.png"
TEMP_OUTPUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\temp_sprites"
FINAL_OUTPUT_DIR = r"E:\Happy-Child\client\public\assets\maps\teacher_office\teacher_office_sprites"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def get_background_color(img_array, sample_region):
    """从指定区域采样背景颜色"""
    x1, y1, x2, y2 = sample_region
    region = img_array[y1:y2, x1:x2]
    # 取中位数颜色作为背景色（更鲁棒）
    return np.median(region.reshape(-1, 4), axis=0)

def color_distance(c1, c2):
    """计算颜色距离（考虑透明度）"""
    # 归一化到 0-1
    return np.sqrt(np.sum((c1[:3] - c2[:3])**2))

def remove_background(crop, bg_color, threshold=45, is_floor=True):
    """
    移除背景并替换为白色
    - crop: PIL Image (RGBA)
    - bg_color: 背景颜色 [R, G, B, A]
    - threshold: 颜色距离阈值
    - is_floor: 是否是地板上的物体（地板为棕色系）
    """
    arr = np.array(crop).astype(np.float32)
    h, w = arr.shape[:2]

    # 创建掩码：True = 背景
    # 方法：计算每个像素与背景色的距离
    dists = np.zeros((h, w))
    for y in range(h):
        for x in range(w):
            dists[y, x] = color_distance(arr[y, x], bg_color)

    # 同时检查像素是否接近黑色（房间外的区域）
    black_dist = np.sqrt(np.sum(arr[:, :, :3]**2, axis=2))

    # 背景掩码：接近背景色 或 接近纯黑
    mask = (dists < threshold) | (black_dist < 30)

    # 对于地板上的物体，额外检测地板木纹模式
    if is_floor:
        # 地板是棕色系，检测棕色像素
        brown_mask = (arr[:, :, 0] > 80) & (arr[:, :, 0] < 160) & \
                     (arr[:, :, 1] > 50) & (arr[:, :, 1] < 120) & \
                     (arr[:, :, 2] > 30) & (arr[:, :, 2] < 80)
        mask = mask | brown_mask

    # 对于墙壁上的物体，检测砖墙模式
    else:
        # 墙壁是浅色砖墙
        wall_mask = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 180) & (arr[:, :, 2] > 170) & \
                    (arr[:, :, 0] < 240) & (arr[:, :, 1] < 240) & (arr[:, :, 2] < 240)
        mask = mask | wall_mask

    # 创建白色背景输出
    output = arr.copy()
    white = np.array([255, 255, 255, 255], dtype=np.float32)
    output[mask] = white

    # 将结果转换为 uint8
    output = np.clip(output, 0, 255).astype(np.uint8)

    return Image.fromarray(output, 'RGBA')

def extract_object(img, bbox, bg_sample_region, item_name, threshold=45, is_floor=True):
    """
    提取单个物体
    - bbox: (x1, y1, x2, y2) 边界框
    - bg_sample_region: 用于采样背景色的区域
    - item_name: 物品名称
    """
    x1, y1, x2, y2 = bbox

    # 裁剪区域
    crop = img.crop((x1, y1, x2, y2))

    # 获取背景色
    arr = np.array(img)
    bg_color = get_background_color(arr, bg_sample_region)

    # 移除背景
    result = remove_background(crop, bg_color, threshold, is_floor)

    return result

def main():
    ensure_dir(TEMP_OUTPUT_DIR)
    ensure_dir(FINAL_OUTPUT_DIR)

    img = Image.open(INPUT_PATH).convert('RGBA')
    arr = np.array(img)

    print(f"图片尺寸: {img.size}")
    print(f"临时输出目录: {TEMP_OUTPUT_DIR}")

    # 定义所有物品
    # 格式: (item_id, item_name, bbox, bg_sample_region, threshold, is_floor)
    # bbox: (x1, y1, x2, y2)
    # bg_sample_region: (x1, y1, x2, y2) - 用于采样背景色的区域
    # is_floor: True=地板背景, False=墙壁背景

    items = [
        # 墙壁上的物品
        ("item_01", "证书奖状组", (45, 35, 350, 115), (50, 40, 80, 70), 35, False),
        ("item_02", "窗户", (360, 35, 560, 190), (370, 45, 400, 75), 35, False),
        ("item_03", "吊灯", (650, 5, 730, 75), (660, 10, 690, 30), 40, False),
        ("item_04", "通风口", (790, 40, 940, 165), (800, 50, 830, 80), 35, False),
        ("item_05", "黑板", (950, 35, 1340, 205), (960, 45, 990, 75), 35, False),

        # 左侧书架
        ("item_06", "高书柜左", (35, 120, 225, 315), (40, 300, 70, 310), 40, True),
        ("item_07", "高书柜右", (225, 120, 405, 315), (230, 300, 260, 310), 40, True),
        ("item_08", "矮书柜", (35, 320, 225, 515), (40, 500, 70, 510), 40, True),
        ("item_09", "书推车", (235, 330, 330, 465), (240, 450, 270, 460), 40, True),

        # 中间办公区
        ("item_10", "办公椅", (610, 150, 725, 295), (620, 280, 650, 290), 40, True),
        ("item_11", "办公桌", (530, 240, 835, 435), (540, 420, 570, 430), 40, True),
        ("item_12", "地上纸张", (420, 270, 525, 375), (430, 360, 460, 370), 35, True),

        # 桌上物品
        ("item_13", "桌上试卷堆", (550, 220, 615, 285), (555, 275, 580, 280), 35, True),
        ("item_14", "地球仪", (610, 260, 670, 335), (615, 325, 640, 330), 35, True),
        ("item_15", "打开的书", (660, 265, 725, 325), (665, 320, 690, 325), 35, True),
        ("item_16", "钢笔", (715, 250, 750, 305), (720, 295, 740, 300), 30, True),
        ("item_17", "台灯", (745, 220, 805, 290), (750, 280, 775, 285), 35, True),
        ("item_18", "桌上小书本", (780, 270, 825, 335), (785, 325, 810, 330), 35, True),

        # 右侧物品
        ("item_19", "盆栽", (730, 160, 825, 265), (740, 255, 770, 260), 40, True),
        ("item_20", "文件柜组", (950, 170, 1340, 305), (960, 295, 990, 300), 40, True),
        ("item_21", "文件柜上的书", (1000, 150, 1080, 195), (1010, 185, 1030, 190), 35, True),
        ("item_22", "饮水机", (1210, 380, 1335, 555), (1220, 545, 1250, 550), 40, True),
        ("item_23", "置物架杯具", (1230, 280, 1325, 385), (1240, 375, 1260, 380), 35, True),

        # 底部区域
        ("item_24", "地毯", (580, 480, 835, 635), (590, 625, 620, 630), 40, True),
        ("item_25", "长凳", (860, 510, 1125, 615), (870, 605, 900, 610), 40, True),
        ("item_26", "右下角盆栽", (1280, 480, 1365, 620), (1290, 610, 1320, 615), 40, True),
    ]

    extracted = []
    for item_id, item_name, bbox, bg_sample, threshold, is_floor in items:
        print(f"提取: {item_id} - {item_name} ...")
        try:
            result = extract_object(img, bbox, bg_sample, item_name, threshold, is_floor)
            # 保存到临时目录
            temp_path = os.path.join(TEMP_OUTPUT_DIR, f"{item_id}.png")
            result.save(temp_path)
            extracted.append((item_id, item_name, temp_path, bbox))
            print(f"  [OK] 已保存: {temp_path}")
        except Exception as e:
            print(f"  [FAIL] 失败: {e}")

    print(f"\n提取完成! 共 {len(extracted)} 个物品")
    print(f"临时文件保存在: {TEMP_OUTPUT_DIR}")
    print(f"请检查这些文件，确认后我将移动到最终目录: {FINAL_OUTPUT_DIR}")

    return extracted

if __name__ == "__main__":
    main()
