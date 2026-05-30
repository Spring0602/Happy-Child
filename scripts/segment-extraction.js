const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * 分割物品提取图
 * 逻辑：白色背景，检测非白色连通区域，按从左到右、从上到下排序
 */
async function segmentExtraction(inputPath, outputDir, startIdx = 1) {
  const img = sharp(inputPath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();

  // 二值化：非背景(白/接近白) = 1
  const mask = new Uint8Array(width * height);
  const BG_THRESHOLD = 245;
  for (let i = 0; i < width * height; i++) {
    const r = raw[i * 4];
    const g = raw[i * 4 + 1];
    const b = raw[i * 4 + 2];
    mask[i] = (r < BG_THRESHOLD || g < BG_THRESHOLD || b < BG_THRESHOLD) ? 1 : 0;
  }

  // 连通组件标记 (4-连通)
  const labels = new Int32Array(width * height);
  let labelCount = 0;
  const labelAreas = [];

  function floodFill(startX, startY) {
    const stack = [[startX, startY]];
    const id = ++labelCount;
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let count = 0;
    while (stack.length) {
      const [x, y] = stack.pop();
      const idx = y * width + x;
      if (labels[idx] !== 0 || mask[idx] === 0) continue;
      labels[idx] = id;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }
    return { id, minX, maxX, minY, maxY, count };
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1 && labels[y * width + x] === 0) {
        labelAreas.push(floodFill(x, y));
      }
    }
  }

  // 过滤小噪点（面积<200像素）
  const valid = labelAreas.filter(a => a.count >= 200);

  // 按中心点从上到下、从左到右排序
  valid.sort((a, b) => {
    const cyA = (a.minY + a.maxY) / 2;
    const cyB = (b.minY + b.maxY) / 2;
    const cxA = (a.minX + a.maxX) / 2;
    const cxB = (b.minX + b.maxX) / 2;
    // 先按行分组（Y方向差>80视为不同行）
    if (Math.abs(cyA - cyB) > 80) return cyA - cyB;
    return cxA - cxB;
  });

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 提取每个组件
  for (let i = 0; i < valid.length; i++) {
    const box = valid[i];
    const bw = box.maxX - box.minX + 1;
    const bh = box.maxY - box.minY + 1;

    // 创建仅含当前label的mask
    const itemMask = Buffer.alloc(bw * bh * 4);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const srcIdx = (box.minY + y) * width + (box.minX + x);
        const dstIdx = (y * bw + x) * 4;
        if (labels[srcIdx] === box.id) {
          itemMask[dstIdx] = raw[srcIdx * 4];
          itemMask[dstIdx + 1] = raw[srcIdx * 4 + 1];
          itemMask[dstIdx + 2] = raw[srcIdx * 4 + 2];
          itemMask[dstIdx + 3] = raw[srcIdx * 4 + 3];
        } else {
          itemMask[dstIdx] = 0;
          itemMask[dstIdx + 1] = 0;
          itemMask[dstIdx + 2] = 0;
          itemMask[dstIdx + 3] = 0;
        }
      }
    }

    const outPath = path.join(outputDir, `item_${String(startIdx + i).padStart(2, '0')}.png`);
    await sharp(itemMask, { raw: { width: bw, height: bh, channels: 4 } })
      .png()
      .toFile(outPath);
  }

  return valid.length;
}

async function main() {
  const base = 'G:/混沌/happy-child-game-scaffold/happy-child-game/client/public/assets/maps';

  // classroom: 2张提取图
  const c1 = await segmentExtraction(
    path.join(base, 'classroom/物品提取1.png'),
    path.join(base, 'classroom/物品_sprites'),
    1
  );
  const c2 = await segmentExtraction(
    path.join(base, 'classroom/物品提取2.png'),
    path.join(base, 'classroom/物品_sprites'),
    1 + c1
  );
  console.log(`classroom: 提取1=${c1}项, 提取2=${c2}项, 共=${c1+c2}项`);

  // classroom_3: 2张提取图（与classroom相同）
  const c3_1 = await segmentExtraction(
    path.join(base, 'classroom_3/物品提取1.png'),
    path.join(base, 'classroom_3/物品_sprites'),
    1
  );
  const c3_2 = await segmentExtraction(
    path.join(base, 'classroom_3/物品提取2.png'),
    path.join(base, 'classroom_3/物品_sprites'),
    1 + c3_1
  );
  console.log(`classroom_3: 提取1=${c3_1}项, 提取2=${c3_2}项, 共=${c3_1+c3_2}项`);

  // rooftop: 1张提取图
  const r = await segmentExtraction(
    path.join(base, 'rooftop/物品提取.png'),
    path.join(base, 'rooftop/物品_sprites'),
    1
  );
  console.log(`rooftop: 提取=${r}项`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
