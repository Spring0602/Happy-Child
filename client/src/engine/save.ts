import type { GameState } from "../types/game";

const SAVE_KEY = "happy_child_saves";
const SAVE_BACKUP_KEY = `${SAVE_KEY}_backup`;
const SAVE_TEMP_KEY = `${SAVE_KEY}_temp`;
const AUTO_KEY = "happy_child_autosave";
const AUTO_BACKUP_KEY = `${AUTO_KEY}_backup`;
const PORTRAIT_KEY = "happy_child_portraits";
const MAX_SLOTS = 10;
const SAVE_VERSION = 2;

export interface SaveSlot {
  slot: number;
  state: GameState;
  timestamp: string;
  preview: string;
  version?: number;
  checksum?: string;
}

interface SaveCollection {
  version: number;
  slots: SaveSlot[];
}

interface AutoSaveRecord {
  version: number;
  state: GameState;
  checksum: string;
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function checksum(value: unknown): string {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<GameState>;
  return typeof state.currentSceneId === "string"
    && typeof state.currentMapId === "string"
    && !!state.traits
    && Array.isArray(state.choiceHistory);
}

function normalizeSlot(value: unknown): SaveSlot | null {
  if (!value || typeof value !== "object") return null;
  const slot = value as Partial<SaveSlot>;
  if (!Number.isInteger(slot.slot) || slot.slot! < 0 || slot.slot! >= MAX_SLOTS || !isGameState(slot.state)) {
    return null;
  }
  if (slot.checksum && slot.checksum !== checksum(slot.state)) {
    console.warn(`[Save] 存档 ${slot.slot! + 1} 校验失败，已跳过`);
    return null;
  }
  return {
    slot: slot.slot!,
    state: cloneState(slot.state),
    timestamp: typeof slot.timestamp === "string" ? slot.timestamp : "未知时间",
    preview: typeof slot.preview === "string" ? slot.preview : "",
    version: typeof slot.version === "number" ? slot.version : 1,
    checksum: slot.checksum,
  };
}

function parseCollection(raw: string | null): SaveSlot[] | null {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SaveCollection | SaveSlot[];
    const source = Array.isArray(parsed) ? parsed : parsed?.slots;
    if (!Array.isArray(source)) return null;
    const unique = new Map<number, SaveSlot>();
    source.forEach((value) => {
      const slot = normalizeSlot(value);
      if (slot) unique.set(slot.slot, slot);
    });
    return Array.from(unique.values()).sort((left, right) => left.slot - right.slot);
  } catch {
    return null;
  }
}

function writeCollection(slots: SaveSlot[]): void {
  const payload: SaveCollection = { version: SAVE_VERSION, slots };
  const serialized = JSON.stringify(payload);
  const previous = localStorage.getItem(SAVE_KEY);

  localStorage.setItem(SAVE_TEMP_KEY, serialized);
  if (localStorage.getItem(SAVE_TEMP_KEY) !== serialized) {
    localStorage.removeItem(SAVE_TEMP_KEY);
    throw new Error("存档临时写入校验失败");
  }
  if (previous) localStorage.setItem(SAVE_BACKUP_KEY, previous);
  localStorage.setItem(SAVE_KEY, serialized);
  localStorage.removeItem(SAVE_TEMP_KEY);
}

/** 获取全部有效存档；主数据损坏时自动回退到最近备份。 */
export function getAllSaves(): SaveSlot[] {
  const primary = parseCollection(localStorage.getItem(SAVE_KEY));
  if (primary !== null) return primary;

  const backup = parseCollection(localStorage.getItem(SAVE_BACKUP_KEY));
  if (backup !== null) {
    console.warn("[Save] 主存档损坏，已从备份恢复");
    writeCollection(backup);
    return backup;
  }
  return [];
}

export function saveToSlot(slot: number, state: GameState, preview: string): void {
  if (!Number.isInteger(slot) || slot < 0 || slot >= MAX_SLOTS) {
    throw new Error(`无效存档槽位: ${slot}`);
  }
  const snapshot = cloneState(state);
  const saves = getAllSaves().filter((save) => save.slot !== slot);
  saves.push({
    slot,
    state: snapshot,
    timestamp: new Date().toLocaleString("zh-CN"),
    preview: preview.slice(0, 30),
    version: SAVE_VERSION,
    checksum: checksum(snapshot),
  });
  saves.sort((left, right) => left.slot - right.slot);
  writeCollection(saves);
}

export function loadSlot(slot: number): GameState | null {
  const found = getAllSaves().find((save) => save.slot === slot);
  return found ? cloneState(found.state) : null;
}

export function deleteSlot(slot: number): void {
  writeCollection(getAllSaves().filter((save) => save.slot !== slot));
}

export function saveGame(state: GameState): void {
  const snapshot = cloneState(state);
  const record: AutoSaveRecord = {
    version: SAVE_VERSION,
    state: snapshot,
    checksum: checksum(snapshot),
  };
  const previous = localStorage.getItem(AUTO_KEY);
  if (previous) localStorage.setItem(AUTO_BACKUP_KEY, previous);
  localStorage.setItem(AUTO_KEY, JSON.stringify(record));
}

function parseAutoSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AutoSaveRecord | GameState;
    if (isGameState(parsed)) return cloneState(parsed);
    if (!isGameState(parsed.state) || parsed.checksum !== checksum(parsed.state)) return null;
    return cloneState(parsed.state);
  } catch {
    return null;
  }
}

export function loadGame(): GameState | null {
  return parseAutoSave(localStorage.getItem(AUTO_KEY))
    ?? parseAutoSave(localStorage.getItem(AUTO_BACKUP_KEY));
}

export function clearSave(): void {
  localStorage.removeItem(AUTO_KEY);
  localStorage.removeItem(AUTO_BACKUP_KEY);
}

export interface PortraitRecord {
  endingTitle: string;
  traits: Record<string, number>;
  timestamp: string;
  imageDataUrl?: string;
  summary?: string;
}

export function savePortrait(record: PortraitRecord): void {
  const raw = localStorage.getItem(PORTRAIT_KEY);
  const portraits: PortraitRecord[] = raw ? JSON.parse(raw) : [];
  portraits.unshift(record);
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
