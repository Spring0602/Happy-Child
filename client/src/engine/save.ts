import type { GameState } from "../types/game";

const SAVE_KEY = "happy_child_saves";
const AUTO_KEY = "happy_child_autosave";
const PORTRAIT_KEY = "happy_child_portraits";
const MAX_SLOTS = 10;

export interface SaveSlot {
  slot: number;
  state: GameState;
  timestamp: string;
  preview: string; // 当前场景文本前20字
}

/** 获取所有存档槽 */
export function getAllSaves(): SaveSlot[] {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SaveSlot[];
  } catch {
    return [];
  }
}

/** 保存到指定槽位 */
export function saveToSlot(slot: number, state: GameState, preview: string): void {
  const saves = getAllSaves().filter(s => s.slot !== slot);
  saves.push({
    slot,
    state: JSON.parse(JSON.stringify(state)) as GameState,
    timestamp: new Date().toLocaleString("zh-CN"),
    preview: preview.slice(0, 30),
  });
  saves.sort((a, b) => a.slot - b.slot);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}

/** 从指定槽位读取 */
export function loadSlot(slot: number): GameState | null {
  const saves = getAllSaves();
  const found = saves.find(s => s.slot === slot);
  return found ? found.state : null;
}

/** 删除指定槽位 */
export function deleteSlot(slot: number): void {
  const saves = getAllSaves().filter(s => s.slot !== slot);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}

/** 自动存档（兼容旧接口，保存到 slot 0） */
export function saveGame(state: GameState): void {
  localStorage.setItem(AUTO_KEY, JSON.stringify(state));
}

/** 自动读档 */
export function loadGame(): GameState | null {
  const raw = localStorage.getItem(AUTO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

/** 清除自动存档 */
export function clearSave(): void {
  localStorage.removeItem(AUTO_KEY);
}

/** ── 人格画像存储 ── */

export interface PortraitRecord {
  endingTitle: string;
  traits: Record<string, number>;
  timestamp: string;
}

export function savePortrait(record: PortraitRecord): void {
  const raw = localStorage.getItem(PORTRAIT_KEY);
  const portraits: PortraitRecord[] = raw ? JSON.parse(raw) : [];
  portraits.unshift(record);
  // 最多保留 10 条记录
  localStorage.setItem(PORTRAIT_KEY, JSON.stringify(portraits.slice(0, 10)));
}

export function getPortraits(): PortraitRecord[] {
  const raw = localStorage.getItem(PORTRAIT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PortraitRecord[];
  } catch {
    return [];
  }
}
