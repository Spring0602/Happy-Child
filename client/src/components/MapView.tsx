import { useEffect, useRef, useCallback } from "react";
import {
  TILE,
  TILE_SIZE,
  TILE_STYLES,
  isWalkable,
  getDoorLabel,
  type TileMapData,
  type MapNPCData,
  type MapItemData,
} from "../game/mapData";
import {
  ANIM_MAP,
  SPRITE_SCALE,
  MOVE_SPEED,
  type SpriteFrame,
} from "../game/spriteData";

const SPRITE_SRC = "/assets/sprites/yps.png";

interface Props {
  mapData: TileMapData;
  visitedTiles: boolean[][] | null;
  onNPCInteract: (npc: MapNPCData) => void;
  onItemInvestigate: (item: MapItemData) => void;
  onTriggerActivate: (triggerId: string, sceneId: string) => void;
  onChangeMap: (targetMap: string, targetSpawn: string) => void;
  onExploreUpdate?: (tileX: number, tileY: number) => void;
}

/** Canvas 绘制辅助：圆角矩形 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** hex 颜色转 rgba */
function rgbaFromHex(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 获取动画帧 */
function getFrame(animName: string, elapsed: number): SpriteFrame | null {
  const anim = ANIM_MAP[animName];
  if (!anim || anim.frames.length === 0) return null;
  const index = Math.floor(elapsed * anim.frameRate) % anim.frames.length;
  return anim.frames[index];
}

/** 绘制家具纹理覆盖 */
function drawTilePattern(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  pattern: string,
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  if (pattern === "stripe") {
    for (let i = 2; i < w; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + 2);
      ctx.lineTo(x + i, y + h - 2);
      ctx.stroke();
    }
  } else if (pattern === "cross") {
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 2);
    ctx.lineTo(x + w / 2, y + h - 2);
    ctx.moveTo(x + 2, y + h / 2);
    ctx.lineTo(x + w - 2, y + h / 2);
    ctx.stroke();
  } else if (pattern === "dots") {
    for (let dy = 3; dy < h; dy += 6) {
      for (let dx = 3; dx < w; dx += 6) {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(x + dx, y + dy, 2, 2);
      }
    }
  }
  ctx.restore();
}

/** 绘制迷你地图 */
function drawMiniMap(
  ctx: CanvasRenderingContext2D,
  map: TileMapData,
  playerTX: number, playerTY: number,
  visited: boolean[][] | null,
  canvasW: number,
) {
  const MAP_SCALE = 2;
  const mapW = (map.tiles[0]?.length ?? 0) * MAP_SCALE;
  const mapH = map.tiles.length * MAP_SCALE;
  const PAD = 8;
  const mx = canvasW - mapW - PAD - 12;
  const my = PAD + 40;

  // 背景
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.strokeStyle = "rgba(160,200,255,0.3)";
  ctx.lineWidth = 1;
  ctx.fillRect(mx - 2, my - 2, mapW + 4, mapH + 4);
  ctx.strokeRect(mx - 2, my - 2, mapW + 4, mapH + 4);

  // 标题
  ctx.fillStyle = "rgba(160,200,255,0.8)";
  ctx.font = "9px 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("小地图", mx, my - 6);

  // 瓦片
  for (let row = 0; row < map.tiles.length; row++) {
    for (let col = 0; col < (map.tiles[0]?.length ?? 0); col++) {
      const tile = map.tiles[row]?.[col] ?? TILE.WALL;
      const isVisited = visited?.[row]?.[col] ?? true;
      const sx = mx + col * MAP_SCALE;
      const sy = my + row * MAP_SCALE;

      if (!isVisited) {
        ctx.fillStyle = "rgba(10,10,20,0.8)";
        ctx.fillRect(sx, sy, MAP_SCALE, MAP_SCALE);
        continue;
      }

      if (tile === TILE.WALL) {
        ctx.fillStyle = "#4a3828";
        ctx.fillRect(sx, sy, MAP_SCALE, MAP_SCALE);
      } else if (tile === TILE.DOOR) {
        ctx.fillStyle = "#c9a334";
        ctx.fillRect(sx, sy, MAP_SCALE, MAP_SCALE);
      } else {
        ctx.fillStyle = isWalkable(tile) ? "#888" : "#666";
        ctx.fillRect(sx, sy, MAP_SCALE, MAP_SCALE);
      }
    }
  }

  // NPC 点
  for (const npc of map.npcs) {
    ctx.fillStyle = "#ff6666";
    ctx.fillRect(mx + npc.x * MAP_SCALE - 1, my + npc.y * MAP_SCALE - 1, 2, 2);
  }

  // 玩家点（闪烁）
  const blink = (Math.sin(performance.now() / 300) + 1) / 2;
  ctx.fillStyle = `rgba(100,220,255,${0.6 + blink * 0.4})`;
  ctx.beginPath();
  ctx.arc(mx + playerTX * MAP_SCALE, my + playerTY * MAP_SCALE, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

export function MapView({
  mapData,
  visitedTiles,
  onNPCInteract,
  onItemInvestigate,
  onTriggerActivate,
  onChangeMap,
  onExploreUpdate,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isLoadedRef = useRef(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgLoadedRef = useRef(false);

  const tilePosRef = useRef({ x: 0, y: 0 });
  const smoothPosRef = useRef({ x: 0, y: 0 });
  const facingRef = useRef<"up" | "down" | "left" | "right">("down");
  const keysRef = useRef<Set<string>>(new Set());
  const timeRef = useRef(0);
  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const mapRef = useRef(mapData);
  const visitedRef = useRef(visitedTiles);
  const doorCooldownRef = useRef(0);
  const lastReportedTXRef = useRef(-1);
  const lastReportedTYRef = useRef(-1);

  mapRef.current = mapData;
  visitedRef.current = visitedTiles;

  const initPlayerPos = useCallback((map: TileMapData) => {
    const spawn = map.spawns["default"] ?? { x: 2, y: 2 };
    tilePosRef.current = { ...spawn };
    smoothPosRef.current = { x: spawn.x * TILE_SIZE, y: spawn.y * TILE_SIZE };
  }, []);

  // 加载精灵图
  useEffect(() => {
    const img = new Image();
    img.src = SPRITE_SRC;
    img.onload = () => { imageRef.current = img; isLoadedRef.current = true; };
    return () => { img.onload = null; };
  }, []);

  // 加载地图背景图
  useEffect(() => {
    bgLoadedRef.current = false;
    if (!mapData.background) return;
    const img = new Image();
    img.src = mapData.background;
    img.onload = () => { bgImageRef.current = img; bgLoadedRef.current = true; };
    img.onerror = () => { bgLoadedRef.current = false; };
    return () => { img.onload = null; img.onerror = null; };
  }, [mapData.background]);

  // 地图切换时重置
  useEffect(() => {
    initPlayerPos(mapData);
    doorCooldownRef.current = 0.5;
    lastReportedTXRef.current = -1;
    lastReportedTYRef.current = -1;
  }, [mapData, initPlayerPos]);

  // Canvas 尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // 交互回调引用（避免闭包问题）
  const onNPCInteractRef = useRef(onNPCInteract);
  const onItemInvestigateRef = useRef(onItemInvestigate);
  const onTriggerActivateRef = useRef(onTriggerActivate);
  const onChangeMapRef = useRef(onChangeMap);
  const onExploreUpdateRef = useRef(onExploreUpdate);
  onNPCInteractRef.current = onNPCInteract;
  onItemInvestigateRef.current = onItemInvestigate;
  onTriggerActivateRef.current = onTriggerActivate;
  onChangeMapRef.current = onChangeMap;
  onExploreUpdateRef.current = onExploreUpdate;

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const arrows: Record<string, string> = {
        arrowup: "w", arrowdown: "s", arrowleft: "a", arrowright: "d",
      };
      const mapped = arrows[key] ?? key;
      if (["w", "a", "s", "d"].includes(mapped)) {
        e.preventDefault();
        keysRef.current.add(mapped);
      }
      if (key === "e" || key === "enter" || key === " ") {
        e.preventDefault();
        const map = mapRef.current;
        const px = Math.floor(tilePosRef.current.x);
        const py = Math.floor(tilePosRef.current.y);

        // 检查附近 NPC
        for (const npc of map.npcs) {
          if (Math.abs(npc.x - px) <= 1.5 && Math.abs(npc.y - py) <= 1.5) {
            onNPCInteractRef.current(npc);
            return;
          }
        }
        // 检查附近调查点
        for (const item of map.items) {
          if (Math.abs(item.x - px) <= 1.5 && Math.abs(item.y - py) <= 1.5) {
            onItemInvestigateRef.current(item);
            return;
          }
        }
        // 检查附近门
        if (doorCooldownRef.current <= 0) {
          for (const door of map.doors) {
            if (Math.abs(door.x - px) <= 1.5 && Math.abs(door.y - py) <= 1.5) {
              doorCooldownRef.current = 0.8;
              onChangeMapRef.current(door.targetMap, door.targetSpawn);
              return;
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const arrows: Record<string, string> = {
        arrowup: "w", arrowdown: "s", arrowleft: "a", arrowright: "d",
      };
      keysRef.current.delete(arrows[key] ?? key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let running = true;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!running) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      timeRef.current += dt;
      doorCooldownRef.current = Math.max(0, doorCooldownRef.current - dt);

      const map = mapRef.current;
      const mapW = map.tiles[0]?.length ?? 0;
      const mapH = map.tiles.length;

      // ── 输入处理 ──
      const keys = keysRef.current;
      let dx = 0, dy = 0;
      if (keys.has("w")) dy -= 1;
      if (keys.has("s")) dy += 1;
      if (keys.has("a")) dx -= 1;
      if (keys.has("d")) dx += 1;

      const isMoving = dx !== 0 || dy !== 0;
      if (isMoving) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

      if (dy < 0) facingRef.current = "up";
      else if (dy > 0) facingRef.current = "down";
      else if (dx < 0) facingRef.current = "left";
      else if (dx > 0) facingRef.current = "right";

      // ── 碰撞移动 ──
      if (isMoving) {
        const speed = MOVE_SPEED * dt;
        const px = tilePosRef.current.x;
        const py = tilePosRef.current.y;

        // X 方向
        const newPx = px + (dx * speed) / TILE_SIZE;
        const checkX = dx > 0 ? Math.floor(newPx + 0.25) : Math.floor(newPx - 0.1);
        if (
          checkX >= 0 && checkX < mapW &&
          py >= 0 && py < mapH &&
          isWalkable(map.tiles[Math.floor(py)]?.[checkX] ?? TILE.WALL)
        ) {
          tilePosRef.current.x = Math.max(0.15, Math.min(mapW - 0.85, newPx));
        }

        // Y 方向
        const newPy = py + (dy * speed) / TILE_SIZE;
        const checkY = dy > 0 ? Math.floor(newPy + 0.25) : Math.floor(newPy - 0.1);
        if (
          checkY >= 0 && checkY < mapH &&
          px >= 0 && px < mapW &&
          isWalkable(map.tiles[checkY]?.[Math.floor(px)] ?? TILE.WALL)
        ) {
          tilePosRef.current.y = Math.max(0.15, Math.min(mapH - 0.85, newPy));
        }
      }

      const ptx = Math.floor(tilePosRef.current.x);
      const pty = Math.floor(tilePosRef.current.y);

      // ── 触发区自动触发 ──
      for (const t of map.triggers) {
        if (t.x === ptx && t.y === pty) {
          onTriggerActivateRef.current(t.id, t.sceneTriggerId);
          running = false;
          return;
        }
      }

      // ── 探索进度汇报（每次踏足新瓦片时） ──
      if (onExploreUpdateRef.current &&
          (ptx !== lastReportedTXRef.current || pty !== lastReportedTYRef.current)) {
        lastReportedTXRef.current = ptx;
        lastReportedTYRef.current = pty;
        onExploreUpdateRef.current(ptx, pty);
      }

      // ── 附近检测（用于绘制 Canvas 提示） ──
      let foundNPC: MapNPCData | null = null;
      for (const npc of map.npcs) {
        if (Math.abs(npc.x - tilePosRef.current.x) < 1.5 &&
            Math.abs(npc.y - tilePosRef.current.y) < 1.5) {
          foundNPC = npc;
          break;
        }
      }
      let foundItem: MapItemData | null = null;
      for (const item of map.items) {
        if (Math.abs(item.x - tilePosRef.current.x) < 1.5 &&
            Math.abs(item.y - tilePosRef.current.y) < 1.5) {
          foundItem = item;
          break;
        }
      }

      let foundDoor: string | null = null;
      for (const door of map.doors) {
        if (Math.abs(door.x - tilePosRef.current.x) < 1.5 &&
            Math.abs(door.y - tilePosRef.current.y) < 1.5) {
          foundDoor = getDoorLabel(door);
          break;
        }
      }

      // ── 平滑位置 ──
      const targetPX = tilePosRef.current.x * TILE_SIZE;
      const targetPY = tilePosRef.current.y * TILE_SIZE;
      smoothPosRef.current.x += (targetPX - smoothPosRef.current.x) * 0.35;
      smoothPosRef.current.y += (targetPY - smoothPosRef.current.y) * 0.35;

      // ── 渲染 ──
      const cw = canvas.width;
      const ch = canvas.height;

      const mapPX = mapW * TILE_SIZE;
      const mapPY = mapH * TILE_SIZE;

      // 摄像机：玩家在屏幕中心偏下
      const camX = smoothPosRef.current.x + TILE_SIZE / 2 - cw / 2;
      const camY = smoothPosRef.current.y + TILE_SIZE / 2 - ch * 0.45;

      const clampX = Math.max(0, Math.min(mapPX - cw, camX));
      const clampY = Math.max(0, Math.min(mapPY - ch, camY));
      const offsetX = -clampX;
      const offsetY = -clampY;

      // 如果地图比屏幕小，居中
      const finalOX = mapPX < cw ? (cw - mapPX) / 2 : offsetX;
      const finalOY = mapPY < ch ? (ch - mapPY) / 2 : offsetY;

      ctx.clearRect(0, 0, cw, ch);

      // ── 绘制地图背景图（场景沉浸感）──
      const bgImg = bgImageRef.current;
      if (bgImg && bgLoadedRef.current) {
        // 缩放填充整屏
        const bgW = bgImg.width || 1200;
        const bgH = bgImg.height || 800;
        const scale = Math.max(cw / bgW, ch / bgH);
        const drawW = bgW * scale;
        const drawH = bgH * scale;
        const drawX = (cw - drawW) / 2;
        const drawY = (ch - drawH) / 2;
        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);

        // 暗色叠加层，保证瓦片可见
        ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
        ctx.fillRect(0, 0, cw, ch);
      } else {
        // 无背景图时纯色底
        ctx.fillStyle = "#0d0a16";
        ctx.fillRect(0, 0, cw, ch);
      }

      // ── 绘制瓦片（半透明，背景可见）─
      for (let row = 0; row < mapH; row++) {
        for (let col = 0; col < mapW; col++) {
          const tile = map.tiles[row]?.[col] ?? TILE.WALL;
          const sx = finalOX + col * TILE_SIZE;
          const sy = finalOY + row * TILE_SIZE;

          // 裁剪：只渲染可见区域
          if (sx + TILE_SIZE < -TILE_SIZE || sx > cw + TILE_SIZE ||
              sy + TILE_SIZE < -TILE_SIZE || sy > ch + TILE_SIZE) continue;

          // 未探索区域
          const isVisited = visitedRef.current?.[row]?.[col] ?? true;
          if (!isVisited && tile !== TILE.WALL) {
            ctx.fillStyle = "rgba(10, 12, 22, 0.88)";
            ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          const style = TILE_STYLES[tile];
          if (!style) {
            ctx.fillStyle = "rgba(180, 170, 155, 0.35)";
            ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // 地板/墙/门/触发区渲染（半透明）
          if (tile <= TILE.TRIGGER) {
            if (tile === TILE.WALL) {
              // 墙壁：深色半透明，保留纹理感
              ctx.fillStyle = "rgba(40, 28, 18, 0.72)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "rgba(60, 42, 30, 0.5)";
              ctx.fillRect(sx, sy, TILE_SIZE, 3);
              ctx.strokeStyle = "rgba(30, 22, 14, 0.6)";
              ctx.lineWidth = 1;
              ctx.strokeRect(sx + 0.5, sy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            } else if (tile === TILE.DOOR) {
              ctx.fillStyle = "rgba(50, 35, 12, 0.7)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "rgba(80, 55, 18, 0.75)";
              ctx.fillRect(sx + 3, sy + 1, TILE_SIZE - 6, TILE_SIZE - 2);
              ctx.fillStyle = "#c9a334";
              ctx.fillRect(sx + TILE_SIZE - 9, sy + TILE_SIZE / 2 - 2, 4, 4);
              ctx.strokeStyle = "#c9a334";
              ctx.lineWidth = 1;
              ctx.strokeRect(sx + 3, sy + 1, TILE_SIZE - 6, TILE_SIZE - 2);
              // 发光
              ctx.shadowColor = "#c9a334";
              ctx.shadowBlur = 4;
              ctx.fillStyle = "rgba(201,163,52,0.3)";
              ctx.fillRect(sx + 1, sy + TILE_SIZE - 5, TILE_SIZE - 2, 3);
              ctx.shadowBlur = 0;
            } else if (tile === TILE.TRIGGER) {
              // 触发区地板 + 红色淡标记
              ctx.fillStyle = "rgba(180, 170, 155, 0.22)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "rgba(200,80,80,0.15)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            } else if (tile === TILE.ITEM) {
              ctx.fillStyle = "rgba(180, 170, 155, 0.22)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              // 闪烁的调查标记
              const blink = (Math.sin(now / 600) + 1) / 2;
              ctx.fillStyle = `rgba(100,180,220,${0.18 + blink * 0.12})`;
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              // 小星号
              ctx.fillStyle = `rgba(100,200,255,${0.5 + blink * 0.3})`;
              ctx.font = "12px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("✨", sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 4);
            } else if (tile === TILE.NPC) {
              ctx.fillStyle = "rgba(180, 170, 155, 0.22)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "rgba(150,200,255,0.08)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            } else {
              // FLOOR 地板高度透明
              const dark = (col + row) % 2 === 0;
              ctx.fillStyle = dark ? "rgba(180, 170, 155, 0.18)" : "rgba(195, 185, 170, 0.22)";
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            }
          } else {
            // ── 家具瓦片渲染（半透明，能看到背景）──
            ctx.fillStyle = rgbaFromHex(style.bg, 0.68);
            ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            if (style.border) {
              ctx.strokeStyle = rgbaFromHex(style.border, 0.7);
              ctx.lineWidth = 1;
              ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            }
            if (style.pattern && style.pattern !== "none") {
              drawTilePattern(ctx, sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2, style.pattern);
            }

            // 特殊细节
            if (tile === TILE.DESK) {
              ctx.fillStyle = style.border ? rgbaFromHex(style.border, 0.8) : "rgba(120,100,70,0.7)";
              ctx.fillRect(sx + 2, sy + 4, TILE_SIZE - 4, 2);
            }
            if (tile === TILE.BED) {
              ctx.fillStyle = "rgba(110,100,140,0.55)";
              ctx.fillRect(sx + 4, sy + 2, TILE_SIZE - 8, TILE_SIZE / 3);
            }
            if (tile === TILE.SOFA) {
              ctx.fillStyle = "rgba(120,120,145,0.55)";
              ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, 3);
            }
            if (tile === TILE.PAINTING) {
              ctx.strokeStyle = "rgba(201,163,52,0.8)";
              ctx.lineWidth = 2;
              ctx.strokeRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
            }
            if (tile === TILE.MIRROR) {
              ctx.fillStyle = "rgba(200,220,255,0.25)";
              ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            if (tile === TILE.WINDOW) {
              ctx.fillStyle = "rgba(100,160,220,0.35)";
              ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
              ctx.strokeStyle = "rgba(60,80,120,0.5)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(sx + TILE_SIZE / 2, sy + 3);
              ctx.lineTo(sx + TILE_SIZE / 2, sy + TILE_SIZE - 3);
              ctx.moveTo(sx + 3, sy + TILE_SIZE / 2);
              ctx.lineTo(sx + TILE_SIZE - 3, sy + TILE_SIZE / 2);
              ctx.stroke();
            }
          }
        }
      }

      // ── 绘制 NPC ──
      for (const npc of map.npcs) {
        const nx = finalOX + (npc.x + 0.5) * TILE_SIZE;
        const ny = finalOY + npc.y * TILE_SIZE;

        // NPC 名称标签背景
        ctx.font = "bold 11px 'Microsoft YaHei', sans-serif";
        const nameW = ctx.measureText(npc.name).width + 10;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        roundRect(ctx, nx - nameW / 2, ny - 26, nameW, 18, 5);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, nx, ny - 13);

        // 身体
        const bodyColor = rgbaFromHex(npc.color ?? "#888", 0.9);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(nx - TILE_SIZE / 2 + 6, ny + 6, TILE_SIZE - 12, TILE_SIZE - 14);

        // 头部
        ctx.beginPath();
        ctx.arc(nx, ny + 8, 7, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 阴影
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(nx, ny + TILE_SIZE - 4, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 绘制玩家精灵 ──
      const img = imageRef.current;
      if (img && isLoadedRef.current) {
        const f = facingRef.current;
        let animName: string;
        if (isMoving) {
          animName = f === "up" ? "run_up"
            : f === "down" ? "run_down"
            : "run_side";
        } else {
          animName = f === "up" ? "idle_up"
            : f === "down" ? "idle_down"
            : "idle_side";
        }
        const frame = getFrame(animName, timeRef.current);

        if (frame) {
          const scale = SPRITE_SCALE;
          const scaledW = frame.width * scale;
          const scaledH = frame.height * scale;

          const px = finalOX + smoothPosRef.current.x;
          const py = finalOY + smoothPosRef.current.y + TILE_SIZE - 4;
          const drawX = px - scaledW / 2;
          const drawY = py - scaledH;

          // 脚底阴影
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath();
          ctx.ellipse(px, py, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          if (facingRef.current === "right") {
            ctx.translate(drawX + scaledW, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, scaledW, scaledH);
          } else {
            ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, drawX, drawY, scaledW, scaledH);
          }
          ctx.restore();
        }
      } else {
        // 无精灵图时用方块代替
        const px = finalOX + smoothPosRef.current.x;
        const py = finalOY + smoothPosRef.current.y + TILE_SIZE - 4;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(px + TILE_SIZE / 2, py + 2, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#66ccff";
        ctx.fillRect(px + 8, py - 20, TILE_SIZE - 16, TILE_SIZE - 8);
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py - 18, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#66ccff";
        ctx.fill();
      }

      // ── 交互提示 ──
      // NPC 提示（优先级最高）
      if (foundNPC) {
        const nx = finalOX + foundNPC.x * TILE_SIZE + TILE_SIZE / 2;
        const ny = finalOY + foundNPC.y * TILE_SIZE - 28;
        drawPrompt(ctx, `按 E 与 ${foundNPC.name} 对话`, nx, ny, "#ffd700");
      } else if (foundItem) {
        const ix = finalOX + foundItem.x * TILE_SIZE + TILE_SIZE / 2;
        const iy = finalOY + foundItem.y * TILE_SIZE - 28;
        drawPrompt(ctx, `按 E 调查 ${foundItem.name}`, ix, iy, "#88ccff");
      } else if (foundDoor) {
        let doorX = 0, doorY = 0;
        for (const d of map.doors) {
          if (Math.abs(d.x - tilePosRef.current.x) < 1.5 &&
              Math.abs(d.y - tilePosRef.current.y) < 1.5) {
            doorX = finalOX + d.x * TILE_SIZE + TILE_SIZE / 2;
            doorY = finalOY + d.y * TILE_SIZE - 16;
            break;
          }
        }
        if (doorX !== 0) {
          drawPrompt(ctx, `按 E 进入 ${foundDoor}`, doorX, doorY, "#88ff88");
        }
      }

      // ── 小地图 ──
      drawMiniMap(ctx, map, tilePosRef.current.x, tilePosRef.current.y, visitedRef.current, cw);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "block",
      }}
    />
  );
}

/** 绘制交互提示气泡 */
function drawPrompt(
  ctx: CanvasRenderingContext2D,
  text: string, cx: number, cy: number, color: string,
) {
  ctx.font = "13px 'Microsoft YaHei', sans-serif";
  const tw = ctx.measureText(text).width;
  const pw = tw + 16;
  const ph = 22;
  const rx = cx - pw / 2;
  const ry = cy - ph / 2;

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  roundRect(ctx, rx, ry, pw, ph, 6);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  roundRect(ctx, rx, ry, pw, ph, 6);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
}
