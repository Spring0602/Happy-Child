from PIL import Image
import os

# 加载提取图
img = Image.open("E:/Happy-Child/client/public/assets/maps/teacher_office/提取图.png")
print(f"图片尺寸: {img.size}")

# 转换为RGBA
img = img.convert("RGBA")
width, height = img.size
data = img.load()

# 创建二值掩码：非白色/近透明像素 = 1
threshold = 240
mask = []
for y in range(height):
    row = []
    for x in range(width):
        r, g, b, a = data[x, y]
        if r > threshold and g > threshold and b > threshold and a > 200:
            row.append(0)
        else:
            row.append(1)
    mask.append(row)

# 连通区域检测（四连通）
def find_components(mask):
    h = len(mask)
    w = len(mask[0])
    visited = [[False]*w for _ in range(h)]
    components = []
    
    for y in range(h):
        for x in range(w):
            if mask[y][x] == 1 and not visited[y][x]:
                queue = [(x, y)]
                visited[y][x] = True
                min_x, max_x = x, x
                min_y, max_y = y, y
                pixels = [(x, y)]
                
                while queue:
                    cx, cy = queue.pop(0)
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                        nx, ny = cx+dx, cy+dy
                        if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and mask[ny][nx] == 1:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
                            pixels.append((nx, ny))
                
                components.append({
                    'x': min_x, 'y': min_y,
                    'w': max_x - min_x + 1,
                    'h': max_y - min_y + 1,
                    'pixels': len(pixels)
                })
    
    return components

components = find_components(mask)

# 过滤条件：宽/高至少20px，像素数至少100
components = [c for c in components if c['w'] >= 20 and c['h'] >= 20 and c['pixels'] >= 100]
components.sort(key=lambda c: (c['y'], c['x']))

print(f"\n过滤后剩余 {len(components)} 个区域:")
for i, c in enumerate(components):
    print(f"  {i+1}: x={c['x']}, y={c['y']}, w={c['w']}, h={c['h']}, pixels={c['pixels']}")

# 保存目录
out_dir = "E:/Happy-Child/client/public/assets/maps/teacher_office/教师办公室物品_sprites"
os.makedirs(out_dir, exist_ok=True)

# 提取每个区域，背景透明化并trim
for i, c in enumerate(components):
    x, y, w, h = c['x'], c['y'], c['w'], c['h']
    
    # 裁剪区域（加一点padding）
    padding = 2
    cx = max(0, x - padding)
    cy = max(0, y - padding)
    cw = min(width - cx, w + padding * 2)
    ch = min(height - cy, h + padding * 2)
    
    cropped = img.crop((cx, cy, cx + cw, cy + ch))
    
    # 将白色/近白色背景变为透明
    pixels = cropped.load()
    for py in range(cropped.height):
        for px in range(cropped.width):
            r, g, b, a = pixels[px, py]
            if r > threshold and g > threshold and b > threshold:
                pixels[px, py] = (255, 255, 255, 0)
    
    # Trim 透明边缘
    bbox = cropped.getbbox()
    if bbox:
        trimmed = cropped.crop(bbox)
        # 统一缩放：最长边不超过256px（参考客厅物品规格）
        max_size = 256
        tw, th = trimmed.size
        if max(tw, th) > max_size:
            scale = max_size / max(tw, th)
            new_w = int(tw * scale)
            new_h = int(th * scale)
            trimmed = trimmed.resize((new_w, new_h), Image.NEAREST)
        
        out_path = os.path.join(out_dir, f"item_{i+1:02d}.png")
        trimmed.save(out_path)
        print(f"  保存: item_{i+1:02d}.png ({trimmed.size[0]}x{trimmed.size[1]})")
    else:
        print(f"  跳过空区域 {i+1}")

print(f"\n全部完成，共提取 {len(components)} 个物品到 {out_dir}")
