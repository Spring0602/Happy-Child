import { loadAudioSettings, registerBgmGainNode } from "./audioSettings";

let audioContext: AudioContext | null = null;
let bgmGain: GainNode | null = null;
let bgmElement: HTMLAudioElement | null = null;
let bgmSource: MediaElementAudioSourceNode | null = null;
let currentSrc = "";
let unlockHandler: (() => void) | null = null;
let pendingStopTimer: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
    bgmGain = audioContext.createGain();
    bgmGain.connect(audioContext.destination);
    registerBgmGainNode(bgmGain);
  }
  void audioContext.resume();
  return audioContext;
}

function clearUnlockHandler() {
  if (!unlockHandler || typeof window === "undefined") return;
  window.removeEventListener("pointerdown", unlockHandler);
  window.removeEventListener("keydown", unlockHandler);
  window.removeEventListener("touchstart", unlockHandler);
  unlockHandler = null;
}

function ensureBgmGraph(src: string, loop: boolean): HTMLAudioElement | null {
  const context = getAudioContext();
  if (!context || !bgmGain) return null;

  if (!bgmElement || currentSrc !== src) {
    if (bgmElement) {
      bgmElement.pause();
      bgmElement.src = "";
    }
    bgmElement = new Audio(src);
    bgmElement.loop = loop;
    bgmElement.preload = "auto";
    bgmSource = context.createMediaElementSource(bgmElement);
    bgmSource.connect(bgmGain);
    currentSrc = src;
  } else {
    bgmElement.loop = loop;
  }

  return bgmElement;
}

async function tryPlay(element: HTMLAudioElement) {
  try {
    await Promise.race([
      audioContext?.resume().catch(() => undefined),
      new Promise(resolve => window.setTimeout(resolve, 120)),
    ]);
    await element.play();
    clearUnlockHandler();
  } catch {
    if (unlockHandler || typeof window === "undefined") return;
    unlockHandler = () => {
      void tryPlay(element);
    };
    window.addEventListener("pointerdown", unlockHandler, { once: true });
    window.addEventListener("keydown", unlockHandler, { once: true });
    window.addEventListener("touchstart", unlockHandler, { once: true });
  }
}

export function playBgm(src: string, options: { loop?: boolean; restart?: boolean; fadeMs?: number } = {}) {
  const element = ensureBgmGraph(src, options.loop ?? true);
  if (!element || !audioContext || !bgmGain) return;

  if (pendingStopTimer !== null) {
    window.clearTimeout(pendingStopTimer);
    pendingStopTimer = null;
  }

  const { bgmVolume } = loadAudioSettings();
  const now = audioContext.currentTime;
  const fadeSeconds = Math.max(0, options.fadeMs ?? 700) / 1000;

  if (options.restart) {
    element.currentTime = 0;
  }

  bgmGain.gain.cancelScheduledValues(now);
  if (fadeSeconds > 0) {
    bgmGain.gain.setValueAtTime(Math.max(0.0001, bgmGain.gain.value), now);
    bgmGain.gain.linearRampToValueAtTime(bgmVolume, now + fadeSeconds);
  } else {
    bgmGain.gain.setValueAtTime(bgmVolume, now);
  }

  void tryPlay(element);
}

export function stopBgm(options: { fadeMs?: number; reset?: boolean } = {}) {
  if (!bgmElement || !audioContext || !bgmGain) return;
  clearUnlockHandler();
  if (pendingStopTimer !== null) {
    window.clearTimeout(pendingStopTimer);
    pendingStopTimer = null;
  }

  const element = bgmElement;
  const now = audioContext.currentTime;
  const fadeSeconds = Math.max(0, options.fadeMs ?? 700) / 1000;

  bgmGain.gain.cancelScheduledValues(now);
  if (fadeSeconds > 0) {
    bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
    bgmGain.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);
    pendingStopTimer = window.setTimeout(() => {
      pendingStopTimer = null;
      element.pause();
      if (options.reset) element.currentTime = 0;
    }, fadeSeconds * 1000);
  } else {
    element.pause();
    if (options.reset) element.currentTime = 0;
  }
}
