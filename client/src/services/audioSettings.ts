/**
 * audioSettings.ts
 * 统一管理音效（sfx）和音乐（bgm）音量
 * - 持久化到 localStorage
 * - 提供接口同步到 Web Audio API（scriptedAudio）和 Phaser sound manager
 */

const STORAGE_KEY = "hc_audio_settings";

export interface AudioSettings {
  sfxVolume: number;   // 0.0 ~ 1.0
  bgmVolume: number;   // 0.0 ~ 1.0
}

const DEFAULT_SETTINGS: AudioSettings = {
  sfxVolume: 0.8,
  bgmVolume: 0.7,
};

/** 读取持久化设置 */
export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      sfxVolume: clamp(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
      bgmVolume: clamp(parsed.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 保存设置到 localStorage */
export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 存储不可用时静默失败
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ── Web Audio 主 GainNode（sfx 总音量） ─────────────────────────────────────
let _sfxGainNode: GainNode | null = null;

/** 由 scriptedAudio.ts 注册主 sfx GainNode */
export function registerSfxGainNode(node: GainNode): void {
  _sfxGainNode = node;
  // 立即应用当前设置
  const { sfxVolume } = loadAudioSettings();
  node.gain.setValueAtTime(sfxVolume, node.context.currentTime);
}

/** 应用 sfx 音量到 Web Audio GainNode */
export function applySfxVolume(volume: number): void {
  if (_sfxGainNode) {
    _sfxGainNode.gain.setValueAtTime(clamp(volume), _sfxGainNode.context.currentTime);
  }
}

// ── Phaser sound manager 引用 ────────────────────────────────────────────────
// Phaser 的 SoundManager 用于控制 play_sfx 事件播放的音效
type PhaserSoundManager = { volume: number };
let _phaserSound: PhaserSoundManager | null = null;

/** 由 MapScene 注册 Phaser sound manager */
export function registerPhaserSoundManager(manager: PhaserSoundManager): void {
  _phaserSound = manager;
  const { sfxVolume } = loadAudioSettings();
  manager.volume = sfxVolume;
}

/** 应用 sfx 音量到 Phaser sound manager */
export function applyPhaserSfxVolume(volume: number): void {
  if (_phaserSound) {
    _phaserSound.volume = clamp(volume);
  }
}

// ── BGM（预留接口，bgm 实现后接入） ─────────────────────────────────────────
let _bgmGainNode: GainNode | null = null;

/** 由 bgm 系统注册 GainNode */
export function registerBgmGainNode(node: GainNode): void {
  _bgmGainNode = node;
  const { bgmVolume } = loadAudioSettings();
  node.gain.setValueAtTime(bgmVolume, node.context.currentTime);
}

export function applyBgmVolume(volume: number): void {
  if (_bgmGainNode) {
    _bgmGainNode.gain.setValueAtTime(clamp(volume), _bgmGainNode.context.currentTime);
  }
}

// ── 统一设置更新入口 ─────────────────────────────────────────────────────────

/** 更新 sfx 音量并持久化 */
export function setSfxVolume(volume: number): void {
  const v = clamp(volume);
  const settings = loadAudioSettings();
  settings.sfxVolume = v;
  saveAudioSettings(settings);
  applySfxVolume(v);
  applyPhaserSfxVolume(v);
}

/** 更新 bgm 音量并持久化 */
export function setBgmVolume(volume: number): void {
  const v = clamp(volume);
  const settings = loadAudioSettings();
  settings.bgmVolume = v;
  saveAudioSettings(settings);
  applyBgmVolume(v);
}
