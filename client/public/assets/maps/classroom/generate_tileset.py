from PIL import Image, ImageDraw

# 加载原有 tileset.png（128x128）
base = Image.open('tileset.png')

# 创建新的 128x256 画布，将原有内容贴到上半部分
img = Image.new('RGBA', (128, 256), (0,0,0,0))
img.paste(base, (0, 0))

draw = ImageDraw.Draw(img)

# === 色板（与原有保持一致 + 新增颜色）===
C = {
    'wall':       (72, 76, 88),
    'wall_dark':  (48, 52, 64),
    'wall_light': (96, 100, 112),
    'floor':      (220, 216, 200),
    'floor_dark': (196, 192, 176),
    'desk':       (140, 90, 48),
    'desk_dark':  (104, 66, 32),
    'desk_light': (172, 120, 72),
    'window':     (140, 172, 200),
    'window_light': (176, 208, 232),
    'board':      (40, 68, 52),
    'board_dark': (28, 48, 36),
    'podium':     (200, 196, 180),
    'cabinet':    (88, 56, 36),
    'cabinet_dark':(60, 38, 22),
    'notice':     (240, 234, 200),
    'notice_line':(220, 210, 170),
    'door_frame': (120, 116, 108),
    'door_dark':  (88, 84, 78),
    'corridor':   (188, 184, 172),
    'outline':    (20, 20, 28),
    # 新增色板
    'red':        (180, 48, 48),      # 规则猩红/排名红字
    'red_dark':   (128, 32, 32),      # 暗红
    'red_light':  (212, 80, 80),      # 亮红
    'paper':      (248, 244, 232),    # 试卷白纸
    'paper_line': (200, 200, 212),    # 试卷横线
    'pencil':     (72, 72, 80),       # 铅笔灰
    'chalk_white':(232, 228, 216),    # 白粉笔
    'chalk_yellow':(220, 200, 80),    # 黄粉笔
    'plant_green':(80, 128, 72),      # 盆栽绿
    'plant_dark': (52, 88, 44),       # 盆栽暗绿
    'pot':        (160, 100, 56),     # 花盆
    'lamp':       (216, 212, 196),    # 荧光灯
    'lamp_glow':  (240, 236, 220),    # 灯光
    'metal':      (144, 148, 156),    # 金属灰
    'metal_dark': (108, 112, 120),    # 金属暗灰
    'curtain':    (92, 96, 108),      # 窗帘灰蓝
    'curtain_fold':(76, 80, 92),      # 窗帘褶皱
    'blood':      (140, 28, 28),      # 血色
    'blood_dark': (92, 16, 16),       # 血暗部
    'mirror':     (168, 180, 196),    # 镜面银
    'mirror_shine':(208, 216, 228),   # 镜面高光
    'nameplate':  (160, 120, 48),     # 门牌铜色
    'trash':      (100, 100, 100),    # 垃圾桶灰
    'trash_dark': (68, 68, 68),       # 垃圾桶暗
    'wish_paper': (252, 248, 228),    # 祈愿纸条
    'wish_tie':   (200, 160, 80),     # 祈愿绳结
    'footprint':  (160, 156, 144),    # 鞋印
}

# ============================================================
# 新增行4 (y=128): 装饰性tile
# ============================================================

# [0,4] = 排名榜/成绩排名（墙面贴纸，红色数字）
def paint_ranking(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 排名榜底板
    d.rectangle([x0+2, y0+2, x0+29, y0+29], fill=c['paper'], outline=c['red_dark'])
    # 标题栏
    d.rectangle([x0+2, y0+2, x0+29, y0+7], fill=c['red_dark'])
    # 排名行
    for row_y in range(y0+10, y0+28, 5):
        d.line([(x0+5, row_y), (x0+14, row_y)], fill=c['pencil'], width=1)  # 姓名
        d.line([(x0+17, row_y), (x0+26, row_y)], fill=c['red'], width=1)     # 分数
    # 第1名高亮
    d.rectangle([x0+4, y0+9, x0+27, y0+13], fill=(255, 240, 220))
    d.line([(x0+5, y0+11), (x0+14, y0+11)], fill=c['pencil'], width=1)
    d.line([(x0+17, y0+11), (x0+26, y0+11)], fill=c['red'], width=1)
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_ranking(draw, 0, 128, C)

# [1,4] = 试卷/答题纸（桌面散落）
def paint_exam_paper(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['desk_dark'])
    # 试卷主体（微微倾斜）
    d.rectangle([x0+3, y0+3, x0+27, y0+28], fill=c['paper'], outline=c['paper_line'])
    # 标题区
    d.rectangle([x0+5, y0+5, x0+25, y0+8], fill=c['paper_line'])
    # 横线答题区
    for row_y in range(y0+11, y0+27, 4):
        d.line([(x0+5, row_y), (x0+25, row_y)], fill=c['paper_line'], width=1)
    # 红色批改痕迹（大叉/分数）
    d.line([(x0+20, y0+4), (x0+26, y0+8)], fill=c['red'], width=1)
    d.line([(x0+20, y0+8), (x0+26, y0+4)], fill=c['red'], width=1)
    # 叠加第二张纸（右下角露出）
    d.rectangle([x0+18, y0+18, x0+30, y0+30], fill=(244, 240, 228), outline=c['paper_line'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_exam_paper(draw, 32, 128, C)

# [2,4] = 纸条/秘密信件（桌面小纸条）
def paint_note(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['desk_dark'])
    # 折叠的纸条
    d.rectangle([x0+6, y0+8, x0+24, y0+22], fill=c['paper'], outline=c['notice_line'])
    # 折痕
    d.line([(x0+6, y0+15), (x0+24, y0+15)], fill=c['notice_line'], width=1)
    # 文字线条
    d.line([(x0+8, y0+11), (x0+18, y0+11)], fill=c['pencil'], width=1)
    d.line([(x0+8, y0+13), (x0+16, y0+13)], fill=c['pencil'], width=1)
    d.line([(x0+8, y0+18), (x0+20, y0+18)], fill=c['pencil'], width=1)
    d.line([(x0+8, y0+20), (x0+14, y0+20)], fill=c['pencil'], width=1)
    # 卷角
    d.polygon([(x0+22, y0+8), (x0+24, y0+8), (x0+24, y0+10)], fill=c['notice_line'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_note(draw, 64, 128, C)

# [3,4] = 垃圾桶（角落铁皮桶）
def paint_trash_can(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['floor'])
    # 地面网格
    for i in range(x0+16, x0+32, 16):
        d.line([(i, y0), (i, y0+31)], fill=c['floor_dark'], width=1)
    for i in range(y0+16, y0+32, 16):
        d.line([(x0, i), (x0+31, i)], fill=c['floor_dark'], width=1)
    # 桶身（上宽下窄梯形，用polygon）
    d.polygon([(x0+7, y0+10), (x0+24, y0+10),
               (x0+22, y0+28), (x0+9, y0+28)],
              fill=c['trash'])
    # 桶口边缘（金属环，比桶身略宽）
    d.polygon([(x0+5, y0+8), (x0+26, y0+8),
               (x0+25, y0+12), (x0+6, y0+12)],
              fill=c['metal_dark'])
    # 桶口顶部高光线
    d.line([(x0+6, y0+9), (x0+25, y0+9)], fill=c['metal'], width=1)
    # 桶口内部暗色（开口）
    d.polygon([(x0+7, y0+10), (x0+24, y0+10),
               (x0+23, y0+12), (x0+8, y0+12)],
              fill=c['trash_dark'])
    # 桶身暗面（右侧渐暗）
    d.polygon([(x0+19, y0+10), (x0+24, y0+10),
               (x0+22, y0+28), (x0+17, y0+28)],
              fill=c['trash_dark'])
    # 桶身高光（左侧）
    d.line([(x0+9, y0+13), (x0+8, y0+26)], fill=c['metal'], width=1)
    # 桶身横条纹（轻微凹痕）
    d.line([(x0+9, y0+17), (x0+22, y0+17)], fill=c['trash_dark'], width=1)
    d.line([(x0+9, y0+23), (x0+21, y0+23)], fill=c['trash_dark'], width=1)
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_trash_can(draw, 96, 128, C)

# ============================================================
# 新增行5 (y=160): 更多装饰
# ============================================================

# [0,5] = 荧光灯（天花板灯管，俯视）
def paint_fluorescent_lamp(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall_dark'])
    # 灯架外壳
    d.rectangle([x0+4, y0+10, x0+27, y0+22], fill=c['metal'], outline=c['metal_dark'])
    # 灯管（发光）
    d.rectangle([x0+6, y0+12, x0+25, y0+20], fill=c['lamp_glow'])
    # 灯管高光
    d.line([(x0+8, y0+14), (x0+23, y0+14)], fill=(255, 252, 240), width=1)
    d.line([(x0+8, y0+17), (x0+23, y0+17)], fill=(255, 252, 240), width=1)
    # 挂钩
    d.line([(x0+10, y0+10), (x0+10, y0+7)], fill=c['metal_dark'], width=1)
    d.line([(x0+21, y0+10), (x0+21, y0+7)], fill=c['metal_dark'], width=1)
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_fluorescent_lamp(draw, 0, 160, C)

# [1,5] = 时钟（墙挂圆钟）
def paint_clock(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 钟面
    d.ellipse([x0+6, y0+4, x0+26, y0+24], fill=c['lamp_glow'], outline=c['outline'])
    # 刻度（12/3/6/9点）
    d.line([(x0+16, y0+5), (x0+16, y0+8)], fill=c['pencil'], width=1)  # 12
    d.line([(x0+16, y0+21), (x0+16, y0+23)], fill=c['pencil'], width=1) # 6
    d.line([(x0+7, y0+14), (x0+10, y0+14)], fill=c['pencil'], width=1)  # 9
    d.line([(x0+23, y0+14), (x0+25, y0+14)], fill=c['pencil'], width=1) # 3
    # 时针（指向10点方向 - 压抑暗示）
    d.line([(x0+16, y0+14), (x0+10, y0+8)], fill=c['pencil'], width=1)
    # 分针
    d.line([(x0+16, y0+14), (x0+20, y0+6)], fill=c['pencil'], width=1)
    # 中心点
    d.ellipse([x0+14, y0+12, x0+18, y0+16], fill=c['pencil'])
    # 底部墙面纹理
    for i in range(x0+4, x0+28, 8):
        d.point((i, y0+28), fill=c['wall_dark'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_clock(draw, 32, 160, C)

# [2,5] = 教室门牌（铜色标牌）
def paint_nameplate(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 门牌底板
    d.rectangle([x0+5, y0+8, x0+26, y0+22], fill=c['nameplate'], outline=c['desk_dark'])
    # 门牌高光边
    d.line([(x0+5, y0+8), (x0+26, y0+8)], fill=c['desk_light'], width=1)
    d.line([(x0+5, y0+8), (x0+5, y0+22)], fill=c['desk_light'], width=1)
    # "3班"文字（3x5像素数字 + 方块"班"，垂直居中对齐）
    # "3" — 上横、中横、下横 + 右侧竖线（不含左侧竖线，否则像"2"）
    # 垂直居中：y0+12到y0+18（7px高），门牌内y0+8到y0+22（15px高），偏移=(15-7)/2≈4 → 从y0+12开始
    three_cx = x0+12   # "3"中心x
    three_top = y0+12
    # 上横
    d.line([(three_cx-2, three_top), (three_cx+2, three_top)], fill=c['paper'], width=1)
    # 右竖（上段）
    d.line([(three_cx+2, three_top), (three_cx+2, three_top+3)], fill=c['paper'], width=1)
    # 中横
    d.line([(three_cx-2, three_top+3), (three_cx+2, three_top+3)], fill=c['paper'], width=1)
    # 右竖（下段）
    d.line([(three_cx+2, three_top+3), (three_cx+2, three_top+6)], fill=c['paper'], width=1)
    # 下横
    d.line([(three_cx-2, three_top+6), (three_cx+2, three_top+6)], fill=c['paper'], width=1)
    # "班"用简化方块（与"3"垂直居中对齐）
    ban_left = x0+17
    ban_top = y0+12
    d.rectangle([ban_left, ban_top, ban_left+6, ban_top+6], fill=c['nameplate'])
    d.rectangle([ban_left, ban_top, ban_left+6, ban_top+6], outline=c['paper'])
    # 钉子
    d.ellipse([x0+7, y0+7, x0+9, y0+9], fill=c['metal'])
    d.ellipse([x0+23, y0+7, x0+25, y0+9], fill=c['metal'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_nameplate(draw, 64, 160, C)

# [3,5] = 叶平生课桌（特殊标记 - 刻痕/涂鸦）
def paint_special_desk(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['desk'])
    # 桌面
    d.rectangle([x0+3, y0+4, x0+28, y0+18], fill=c['desk_light'], outline=c['desk_dark'])
    # 木纹
    d.line([(x0+6, y0+7), (x0+25, y0+7)], fill=c['desk_dark'], width=1)
    d.line([(x0+6, y0+11), (x0+22, y0+11)], fill=c['desk_dark'], width=1)
    d.line([(x0+6, y0+15), (x0+19, y0+15)], fill=c['desk_dark'], width=1)
    # 刻痕/涂鸦（叶平生的标记 - 小人简笔画）
    d.line([(x0+14, y0+5), (x0+14, y0+9)], fill=c['desk_dark'], width=1)  # 身体
    d.point((x0+14, y0+4), fill=c['desk_dark'])  # 头
    d.line([(x0+11, y0+7), (x0+17, y0+7)], fill=c['desk_dark'], width=1)  # 手
    d.line([(x0+12, y0+9), (x0+16, y0+9)], fill=c['desk_dark'], width=1)  # 腿
    # 另一个刻痕 - "X"
    d.line([(x0+20, y0+5), (x0+24, y0+9)], fill=c['pencil'], width=1)
    d.line([(x0+20, y0+9), (x0+24, y0+5)], fill=c['pencil'], width=1)
    # 椅子
    d.rectangle([x0+6, y0+21, x0+25, y0+29], fill=c['desk_dark'])
    d.rectangle([x0+8, y0+22, x0+23, y0+26], fill=c['desk'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_special_desk(draw, 96, 160, C)

# ============================================================
# 新增行6 (y=192): 氛围/叙事元素
# ============================================================

# [0,6] = 祈愿纸条/许愿条（挂绳上）
def paint_wish_strip(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 绳子（水平）
    d.line([(x0, y0+6), (x0+31, y0+6)], fill=c['wish_tie'], width=1)
    # 纸条1
    d.rectangle([x0+3, y0+8, x0+11, y0+20], fill=c['wish_paper'], outline=c['notice_line'])
    d.line([(x0+5, y0+11), (x0+9, y0+11)], fill=c['pencil'], width=1)
    d.line([(x0+5, y0+14), (x0+8, y0+14)], fill=c['pencil'], width=1)
    d.line([(x0+5, y0+17), (x0+9, y0+17)], fill=c['pencil'], width=1)
    # 纸条2
    d.rectangle([x0+14, y0+7, x0+22, y0+22], fill=c['wish_paper'], outline=c['notice_line'])
    d.line([(x0+16, y0+10), (x0+20, y0+10)], fill=c['pencil'], width=1)
    d.line([(x0+16, y0+13), (x0+19, y0+13)], fill=c['pencil'], width=1)
    d.line([(x0+16, y0+16), (x0+20, y0+16)], fill=c['pencil'], width=1)
    d.line([(x0+16, y0+19), (x0+18, y0+19)], fill=c['pencil'], width=1)
    # 纸条3（被风吹歪）
    d.polygon([(x0+24, y0+9), (x0+30, y0+7), (x0+30, y0+19), (x0+24, y0+21)],
              fill=c['wish_paper'], outline=c['notice_line'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_wish_strip(draw, 0, 192, C)

# [1,6] = 粉笔+粉笔擦（黑板槽上）
def paint_chalk_eraser(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['board_dark'])
    # 黑板底部边缘
    d.line([(x0, y0+2), (x0+31, y0+2)], fill=c['board'], width=1)
    # 粉笔擦（木块）
    d.rectangle([x0+3, y0+8, x0+16, y0+16], fill=c['desk'], outline=c['desk_dark'])
    # 粉笔擦底面（白色用过的面）
    d.rectangle([x0+3, y0+14, x0+16, y0+16], fill=c['chalk_white'])
    # 白粉笔
    d.rectangle([x0+20, y0+6, x0+22, y0+14], fill=c['chalk_white'], outline=c['notice_line'])
    # 黄粉笔
    d.rectangle([x0+24, y0+8, x0+26, y0+15], fill=c['chalk_yellow'], outline=c['notice_line'])
    # 粉笔灰散落
    for px, py in [(x0+8, y0+20), (x0+14, y0+22), (x0+22, y0+19)]:
        d.point((px, py), fill=c['chalk_white'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_chalk_eraser(draw, 32, 192, C)

# [2,6] = 盆栽（窗台上）
def paint_potted_plant(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['floor'])
    # 地面网格
    for i in range(x0+16, x0+32, 16):
        d.line([(i, y0), (i, y0+31)], fill=c['floor_dark'], width=1)
    for i in range(y0+16, y0+32, 16):
        d.line([(x0, i), (x0+31, i)], fill=c['floor_dark'], width=1)
    # 花盆（梯形：上宽下窄）
    d.polygon([(x0+9, y0+20), (x0+22, y0+20),
               (x0+20, y0+30), (x0+11, y0+30)],
              fill=c['pot'])
    # 花盆口沿（比盆身略宽）
    d.polygon([(x0+7, y0+18), (x0+24, y0+18),
               (x0+23, y0+21), (x0+8, y0+21)],
              fill=c['desk'])
    # 花盆口沿高光
    d.line([(x0+8, y0+19), (x0+23, y0+19)], fill=c['desk_light'], width=1)
    # 花盆右侧暗面
    d.polygon([(x0+18, y0+20), (x0+22, y0+20),
               (x0+20, y0+30), (x0+16, y0+30)],
              fill=c['desk_dark'])
    # 泥土
    d.ellipse([x0+10, y0+18, x0+21, y0+21], fill=(100, 72, 40))
    # 植物叶团（多圆组合，4-5个重叠圆，中心深外层亮）
    # 底层大圆（暗绿）
    d.ellipse([x0+7, y0+6, x0+17, y0+17], fill=c['plant_dark'])
    d.ellipse([x0+14, y0+4, x0+24, y0+15], fill=c['plant_dark'])
    # 中层圆（标准绿）
    d.ellipse([x0+9, y0+3, x0+19, y0+13], fill=c['plant_green'])
    d.ellipse([x0+13, y0+5, x0+23, y0+14], fill=c['plant_green'])
    # 顶层圆（亮绿高光）
    d.ellipse([x0+11, y0+4, x0+19, y0+11], fill=(100, 156, 88))
    # 边缘叶片点缀（深色和亮色随机点模拟叶片）
    for px, py in [(x0+8, y0+9), (x0+10, y0+15), (x0+22, y0+8), (x0+20, y0+14)]:
        d.point((px, py), fill=c['plant_dark'])
    for px, py in [(x0+12, y0+5), (x0+16, y0+7), (x0+14, y0+3), (x0+18, y0+5)]:
        d.point((px, py), fill=(120, 172, 100))
    # 小茎
    d.line([(x0+15, y0+12), (x0+15, y0+19)], fill=c['plant_dark'], width=1)
    d.line([(x0+15, y0+12), (x0+12, y0+15)], fill=c['plant_dark'], width=1)
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_potted_plant(draw, 64, 192, C)

# [3,6] = 窗户+窗帘（拉上的窗帘）
def paint_window_curtain(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 窗框
    d.rectangle([x0+4, y0+3, x0+27, y0+27], fill=c['window'])
    d.line([(x0+15, y0+3), (x0+15, y0+27)], fill=c['wall'], width=1)
    d.line([(x0+4, y0+14), (x0+27, y0+14)], fill=c['wall'], width=1)
    # 窗帘（半拉，遮挡右半）
    d.rectangle([x0+15, y0+3, x0+27, y0+27], fill=c['curtain'])
    # 窗帘褶皱
    for fold_x in range(x0+18, x0+28, 4):
        d.line([(fold_x, y0+3), (fold_x, y0+27)], fill=c['curtain_fold'], width=1)
    # 窗帘杆
    d.line([(x0+2, y0+2), (x0+29, y0+2)], fill=c['metal'], width=1)
    # 左半窗高光
    d.rectangle([x0+5, y0+4, x0+14, y0+13], fill=c['window_light'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_window_curtain(draw, 96, 192, C)

# ============================================================
# 新增行7 (y=224): 暗黑/异化元素（叙事关键）
# ============================================================

# [0,7] = 鞋印污渍地面（被踩脏的地板）
def paint_dirty_floor(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['floor'])
    # 地面网格
    for i in range(x0+16, x0+32, 16):
        d.line([(i, y0), (i, y0+31)], fill=c['floor_dark'], width=1)
    for i in range(y0+16, y0+32, 16):
        d.line([(x0, i), (x0+31, i)], fill=c['floor_dark'], width=1)
    # 鞋印1（圆润：前掌+后跟，用椭圆叠加）
    # 后跟（较宽的圆角椭圆）
    d.ellipse([x0+5, y0+2, x0+12, y0+10], fill=c['footprint'])
    # 前掌（较大的圆角椭圆，略偏前偏外）
    d.ellipse([x0+4, y0+9, x0+13, y0+19], fill=c['footprint'])
    # 脚弓内凹（用floor色覆盖中间窄条）
    d.ellipse([x0+6, y0+8, x0+10, y0+12], fill=c['floor'])
    # 鞋印2（偏右偏下，方向不同）
    d.ellipse([x0+19, y0+12, x0+26, y0+20], fill=c['footprint'])
    d.ellipse([x0+18, y0+19, x0+27, y0+29], fill=c['footprint'])
    # 脚弓内凹
    d.ellipse([x0+20, y0+18, x0+24, y0+22], fill=c['floor'])
    # 泥水溅点（更多细小圆点，更自然）
    for px, py, r in [(x0+15, y0+7, 1), (x0+26, y0+5, 1),
                       (x0+9, y0+23, 1), (x0+22, y0+28, 1),
                       (x0+14, y0+14, 1), (x0+28, y0+14, 1)]:
        d.ellipse([px, py, px+r*2, py+r*2], fill=c['footprint'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_dirty_floor(draw, 0, 224, C)

# [1,7] = 裂开的墙壁（异化暗示）
def paint_cracked_wall(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['wall'])
    # 砖块纹理
    for i in range(x0+8, x0+32, 8):
        d.line([(x0,i), (x0+31,i)], fill=c['wall_dark'], width=1)
    # 大裂缝
    d.line([(x0+10, y0), (x0+14, y0+6)], fill=c['wall_dark'], width=2)
    d.line([(x0+14, y0+6), (x0+12, y0+14)], fill=c['wall_dark'], width=2)
    d.line([(x0+12, y0+14), (x0+16, y0+20)], fill=c['wall_dark'], width=2)
    d.line([(x0+16, y0+20), (x0+14, y0+31)], fill=c['wall_dark'], width=2)
    # 分支裂缝
    d.line([(x0+12, y0+14), (x0+8, y0+18)], fill=c['wall_dark'], width=1)
    d.line([(x0+16, y0+20), (x0+22, y0+24)], fill=c['wall_dark'], width=1)
    d.line([(x0+14, y0+6), (x0+20, y0+8)], fill=c['wall_dark'], width=1)
    # 裂缝深处（更暗）
    d.line([(x0+11, y0+2), (x0+13, y0+8)], fill=(28, 32, 40), width=1)
    d.line([(x0+13, y0+10), (x0+11, y0+16)], fill=(28, 32, 40), width=1)
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_cracked_wall(draw, 32, 224, C)

# [2,7] = 血色裂缝地板（镜中空间/异化场景）
def paint_blood_floor(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['floor'])
    # 地面网格（破裂）
    d.line([(x0+16, y0), (x0+16, y0+12)], fill=c['floor_dark'], width=1)
    d.line([(x0+16, y0+18), (x0+16, y0+31)], fill=c['floor_dark'], width=1)
    d.line([(x0, y0+16), (x0+12, y0+16)], fill=c['floor_dark'], width=1)
    d.line([(x0+18, y0+16), (x0+31, y0+16)], fill=c['floor_dark'], width=1)
    # 裂缝
    d.line([(x0+10, y0+4), (x0+16, y0+14)], fill=c['floor_dark'], width=1)
    d.line([(x0+16, y0+14), (x0+22, y0+10)], fill=c['floor_dark'], width=1)
    d.line([(x0+16, y0+14), (x0+12, y0+26)], fill=c['floor_dark'], width=1)
    d.line([(x0+16, y0+14), (x0+24, y0+24)], fill=c['floor_dark'], width=1)
    # 血色渗透
    d.line([(x0+10, y0+4), (x0+15, y0+13)], fill=c['blood'], width=1)
    d.line([(x0+16, y0+14), (x0+21, y0+10)], fill=c['blood'], width=1)
    d.line([(x0+16, y0+14), (x0+12, y0+25)], fill=c['blood'], width=1)
    d.line([(x0+16, y0+14), (x0+23, y0+23)], fill=c['blood'], width=1)
    # 血滴/渗透点
    for px, py in [(x0+15, y0+13), (x0+17, y0+15), (x0+13, y0+25), (x0+23, y0+23)]:
        d.point((px, py), fill=c['blood_dark'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_blood_floor(draw, 64, 224, C)

# [3,7] = 镜面碎片（反光碎片，镜中空间元素）
def paint_mirror_shard(d, ox, oy, c):
    x0, y0 = ox, oy
    d.rectangle([x0, y0, x0+31, y0+31], fill=c['floor'])
    # 地面网格
    for i in range(x0+16, x0+32, 16):
        d.line([(i, y0), (i, y0+31)], fill=c['floor_dark'], width=1)
    for i in range(y0+16, y0+32, 16):
        d.line([(x0, i), (x0+31, i)], fill=c['floor_dark'], width=1)
    # 碎片1（大块，不规则四边形）— 无outline
    d.polygon([(x0+4, y0+6), (x0+14, y0+3), (x0+18, y0+12), (x0+8, y0+16)],
              fill=c['mirror'])
    # 碎片1高光
    d.line([(x0+6, y0+7), (x0+11, y0+5)], fill=c['mirror_shine'], width=1)
    d.line([(x0+6, y0+8), (x0+9, y0+7)], fill=c['mirror_shine'], width=1)
    # 碎片2（小块）— 无outline
    d.polygon([(x0+18, y0+18), (x0+26, y0+15), (x0+28, y0+24), (x0+20, y0+27)],
              fill=c['mirror'])
    # 碎片2高光
    d.line([(x0+20, y0+19), (x0+24, y0+17)], fill=c['mirror_shine'], width=1)
    # 碎片3（三角碎片）— 无outline
    d.polygon([(x0+12, y0+20), (x0+17, y0+18), (x0+15, y0+26)],
              fill=c['mirror'])
    # 反射中的暗影（暗示镜中世界）— 用半透明暗色fill，不用outline
    d.polygon([(x0+6, y0+8), (x0+12, y0+5), (x0+15, y0+11), (x0+9, y0+14)],
              fill=c['blood_dark'])
    d.rectangle([x0, y0, x0+31, y0+31], outline=c['outline'])

paint_mirror_shard(draw, 96, 224, C)

# 保存
img.save('tileset.png')
print('tileset.png saved: {}x{}, mode={}'.format(img.width, img.height, img.mode))
print('')
print('Tile layout (4x8):')
print('Row0: [0]transparent  [1]wall         [2]floor        [3]desk')
print('Row1: [4]window       [5]blackboard   [6]podium       [7]cabinet')
print('Row2: [8]notice       [9]door         [10]corridor    [11]corner')
print('Row3: [12]wall_v2     [13]floor_v2    [14]desk_v2     [15]halfwin')
print('Row4: [16]ranking     [17]exam_paper  [18]note        [19]trash_can')
print('Row5: [20]lamp        [21]clock       [22]nameplate   [23]special_desk')
print('Row6: [24]wish_strip  [25]chalk       [26]plant       [27]curtain')
print('Row7: [28]dirty_floor [29]cracked_wall[30]blood_floor [31]mirror_shard')
