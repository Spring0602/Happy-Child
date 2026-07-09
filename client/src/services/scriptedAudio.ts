type SoundName =
  | "alarm_clock"
  | "book_drop"
  | "door_knock"
  | "door_knock_heavy"
  | "footsteps_slow"
  | "horror_sting"
  | "impact"
  | "school_bell"
  | "tinnitus";

type ScheduledSound = {
  name: SoundName;
  delayMs?: number;
};

const sceneSounds: Record<string, ScheduledSound[]> = {
  dorm_act3_alarm: [{ name: "alarm_clock" }],
  ch2_bathroom_knocking: [{ name: "door_knock" }],
  ch3_book_falls: [{ name: "book_drop" }],
  ch4_roster_ask_student: [{ name: "tinnitus" }],
  ch4_roster_observe: [{ name: "tinnitus" }],
  ch5_class3_face_closeup: [{ name: "tinnitus" }],
  ch6_class3_door_locked: [{ name: "impact", delayMs: 2200 }],
  ch6_class3_counter_standoff: [{ name: "school_bell", delayMs: 10500 }],
  ch6_class3_cut_standoff: [{ name: "school_bell", delayMs: 10500 }],
  ch6_break_vent: [{ name: "impact", delayMs: 6500 }],
  ch6_break_vent_stall: [{ name: "impact", delayMs: 7600 }],
  ch6_break_vent_fight: [{ name: "impact", delayMs: 7000 }],
  ch8_mirror_ghost: [{ name: "horror_sting" }],
  ch8_bathroom_knocking: [
    { name: "door_knock" },
    { name: "door_knock_heavy", delayMs: 5200 },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  audioContext ??= new AudioContext();
  void audioContext.resume();
  return audioContext;
}

export function unlockScriptedAudio() {
  getAudioContext();
}

function tone(context: AudioContext, frequency: number, duration: number, volume = 0.16, type: OscillatorType = "sine", offset = 0) {
  const start = context.currentTime + offset;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noise(context: AudioContext, duration: number, volume = 0.18, offset = 0) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
  }
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(context.currentTime + offset);
}

function playSynthSound(name: SoundName) {
  const context = getAudioContext();
  if (!context) return;
  if (name === "door_knock" || name === "door_knock_heavy") {
    const volume = name === "door_knock_heavy" ? 0.34 : 0.22;
    [0, 0.22, 0.44].forEach((offset) => {
      tone(context, 92, 0.12, volume, "square", offset);
      noise(context, 0.08, volume * 0.45, offset);
    });
    return;
  }
  if (name === "school_bell" || name === "alarm_clock") {
    [0, 0.38, 0.76].forEach((offset) => {
      tone(context, name === "school_bell" ? 880 : 1040, 0.3, 0.18, "sine", offset);
      tone(context, name === "school_bell" ? 660 : 820, 0.3, 0.1, "sine", offset);
    });
    return;
  }
  if (name === "tinnitus") {
    tone(context, 5200, 1.8, 0.1, "sine");
    tone(context, 5350, 1.8, 0.055, "sine");
    return;
  }
  if (name === "horror_sting") {
    tone(context, 74, 1.1, 0.3, "sawtooth");
    tone(context, 1470, 0.42, 0.2, "square");
    noise(context, 0.8, 0.2);
    return;
  }
  if (name === "footsteps_slow") {
    [0, 0.65, 1.3].forEach((offset) => noise(context, 0.16, 0.2, offset));
    return;
  }
  tone(context, name === "book_drop" ? 110 : 78, 0.28, 0.3, "square");
  noise(context, 0.24, 0.28);
}

export function playSceneSounds(sceneId: string): () => void {
  const timers = (sceneSounds[sceneId] ?? []).map(({ name, delayMs = 0 }) =>
    window.setTimeout(() => playSynthSound(name), delayMs),
  );
  return () => timers.forEach((timer) => window.clearTimeout(timer));
}
