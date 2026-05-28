/**
 * 精灵帧数据配置
 * 基于 yps.png (256×256 px Sprite Sheet) 的 4 方向布局
 *
 * 布局说明：
 * - 行0 (第一行): 向后跑 (S键) —— 6帧
 * - 行1 (第二行): 左/右跑 —— 前6帧 + 向前静止(第7帧/col6) + 向后静止(第8帧/col7)
 * - 行2 (第三行): 向前跑 (W键) —— 6帧
 *
 * 方向映射：
 *   W / 向前 → run_up     (行2, 6帧)
 *   S / 向后 → run_down   (行0, 6帧)
 *   A / 向左 → run_side   (行1, 前6帧, 不翻转)
 *   D / 向右 → run_side   (行1, 前6帧, 水平镜像翻转)
 *   静止向前 → idle_up    (行1 第7帧/col6)
 *   静止向后 → idle_down  (行1 第8帧/col7)
 *   静止侧向 → idle_side  (行1 第1帧/col0)
 */

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAnimation {
  name: string;
  frames: SpriteFrame[];
  frameRate: number; // 每秒帧数
}

export const SPRITE_SHEET_SIZE = 256;

// 精灵缩放倍数（原始帧约17×40px，放大到游戏可见大小）
export const SPRITE_SCALE = 4;

// 移动速度（像素/秒）
export const MOVE_SPEED = 200;

// 定义每行动作的所有帧坐标
function defineRow(
  y: number,
  height: number,
  widths: number[],
  xStarts: number[]
): SpriteFrame[] {
  return widths.map((w, i) => ({
    x: xStarts[i],
    y,
    width: w,
    height,
  }));
}

/* ───── 行0：向前跑 (W键) 6帧 ───── */
const ROW_FORWARD_RUN = defineRow(12, 40,
  [17, 16, 16, 17, 16, 17],
  [10, 42, 74, 106, 138, 170],
);

/* ───── 行1：侧向跑 (A/D键) 6帧 + 静止帧2帧 ───── */
const ROW_SIDE_ALL = defineRow(76, 41,
  [17, 16, 16, 17, 16, 17, 17, 17],   // 前6:跑, col6:向前静止, col7:向后静止
  [10, 42, 74, 106, 138, 170, 202, 234],
);
const ROW_SIDE_RUN     = ROW_SIDE_ALL.slice(0, 6);   // 侧向跑 6帧
const IDLE_FORWARD    = [ROW_SIDE_ALL[6]];              // 向前静止 (第二行第7帧)
const IDLE_BACKWARD   = [ROW_SIDE_ALL[7]];              // 向后静止 (第二行第8帧)
const IDLE_SIDE       = [ROW_SIDE_ALL[0]];              // 侧向静止

/* ───── 行2：向后跑 (S键) 6帧 ───── */
const ROW_BACKWARD_RUN = defineRow(140, 41,
  [17, 16, 16, 17, 16, 17],
  [10, 42, 74, 106, 138, 170],
);

/** 所有精灵动画定义 — 注意 run_up/run_down 已交换：
 *  向上跑(W键) → 第三行(y:140) ，向下跑(S键) → 第一行(y:12) */
export const SPRITE_ANIMATIONS: SpriteAnimation[] = [
  { name: "run_up",    frames: ROW_BACKWARD_RUN,  frameRate: 8 },
  { name: "run_side",  frames: ROW_SIDE_RUN,      frameRate: 8 },
  { name: "run_down",  frames: ROW_FORWARD_RUN,   frameRate: 8 },
  { name: "idle_up",   frames: IDLE_FORWARD,      frameRate: 1 },
  { name: "idle_down", frames: IDLE_BACKWARD,     frameRate: 1 },
  { name: "idle_side", frames: IDLE_SIDE,         frameRate: 1 },
];

/** 快速查找动画定义 */
export const ANIM_MAP: Record<string, SpriteAnimation> = {};
SPRITE_ANIMATIONS.forEach((a) => {
  ANIM_MAP[a.name] = a;
});
