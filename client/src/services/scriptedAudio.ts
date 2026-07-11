type SoundName =
  | "alarm_clock"
  | "book_drop"
  | "door_knock"
  | "door_knock_heavy"
  | "dungeon_transition"
  | "footsteps_slow"
  | "horror_sting"
  | "impact"
  | "message_ping"
  | "paper_rustle"
  | "rain"
  | "rule_pierce"
  | "school_bell"
  | "skill_extract"
  | "tinnitus"
  | "water_running"
  | "warning_bell";

type ScheduledSound = {
  name: SoundName;
  delayMs?: number;
};

const sceneSounds: Record<string, ScheduledSound[]> = {
  dorm_act3_alarm: [{ name: "alarm_clock" }],
  ch2_game_start: [
    { name: "tinnitus", delayMs: 22000 },
  ],
  ch2_plan_book_read: [{ name: "door_knock", delayMs: 26000 }],
  ch2_stumble_fail: [
    { name: "warning_bell", delayMs: 100 },
    { name: "horror_sting", delayMs: 700 },
  ],
  ch2_breakfast_violation: [{ name: "warning_bell", delayMs: 6000 }],
  ch2_study_montage: [
    { name: "paper_rustle", delayMs: 1200 },
    { name: "warning_bell", delayMs: 7800 },
    { name: "horror_sting", delayMs: 12000 },
  ],
  ch2_bathroom_knocking: [{ name: "door_knock" }],
  ch3_book_falls: [{ name: "book_drop" }],
  ch3_empty_seat_seen: [{ name: "tinnitus" }],
  ch3_respond_zqr_then_seat: [{ name: "tinnitus" }],
  ch3_final_answer_warning: [{ name: "tinnitus", delayMs: 200 }],
  ch3_class_count_question: [{ name: "tinnitus", delayMs: 9600 }],
  ch3_night_analysis: [{ name: "paper_rustle", delayMs: 12000 }],
  ch3_suffocation_start: [{ name: "tinnitus", delayMs: 250 }],
  ch4_roster_ask_student: [{ name: "tinnitus" }],
  ch4_roster_observe: [{ name: "tinnitus" }],
  ch5_class3_face_closeup: [{ name: "tinnitus" }],
  ch6_class3_door_locked: [{ name: "impact", delayMs: 2200 }],
  ch6_class3_counter_standoff: [{ name: "school_bell", delayMs: 10500 }],
  ch6_class3_cut_standoff: [{ name: "school_bell", delayMs: 10500 }],
  ch6_break_vent: [{ name: "impact", delayMs: 6500 }],
  ch6_break_vent_stall: [{ name: "impact", delayMs: 7600 }],
  ch6_break_vent_fight: [{ name: "impact", delayMs: 7000 }],
  ch7_rule_skill_initialize: [
    { name: "rule_pierce", delayMs: 250 },
    { name: "tinnitus", delayMs: 5200 },
  ],
  ch7_rule_skill_panel: [
    { name: "tinnitus", delayMs: 180 },
    { name: "paper_rustle", delayMs: 11500 },
  ],
  ch7_surface_rule_death: [
    { name: "rule_pierce", delayMs: 8200 },
    { name: "horror_sting", delayMs: 21500 },
    { name: "rule_pierce", delayMs: 30000 },
  ],
  ch7_bad_child_born: [
    { name: "paper_rustle", delayMs: 1200 },
    { name: "tinnitus", delayMs: 8200 },
  ],
  ch7_overhear_parents: [
    { name: "water_running", delayMs: 17000 },
  ],
  ch7_study_pressure: [
    { name: "tinnitus", delayMs: 7600 },
  ],
  ch7_trial_group_joined: [{ name: "message_ping", delayMs: 360 }],
  ch7_group_greeting_meme: [{ name: "message_ping", delayMs: 360 }],
  ch7_group_greeting_honest: [{ name: "message_ping", delayMs: 360 }],
  ch7_group_greeting_observe: [{ name: "message_ping", delayMs: 1400 }],
  ch7_group_greeting_check_safety: [{ name: "message_ping", delayMs: 360 }],
  ch7_group_common_chat: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 2300 },
  ],
  ch7_group_heshifan_welcome: [{ name: "message_ping", delayMs: 500 }],
  ch7_group_owner_prompt: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 1800 },
    { name: "message_ping", delayMs: 3100 },
  ],
  ch7_group_supply_reminder: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 1800 },
    { name: "message_ping", delayMs: 3100 },
  ],
  ch7_group_ask_relationship: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 1900 },
  ],
  ch7_group_cheng_liuyu_reply: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 1800 },
  ],
  ch7_liuyu_private_chat: [
    { name: "message_ping", delayMs: 500 },
    { name: "message_ping", delayMs: 2600 },
    { name: "message_ping", delayMs: 5200 },
  ],
  ch7_mirror_space: [
    { name: "footsteps_slow", delayMs: 5200 },
    { name: "horror_sting", delayMs: 14500 },
  ],
  ch8_mirror_ghost: [{ name: "horror_sting" }],
  ch8_bathroom_knocking: [
    { name: "door_knock" },
    { name: "door_knock_heavy", delayMs: 5200 },
  ],
};

let audioContext: AudioContext | null = null;
/** sfx 总音量 GainNode，所有合成音效经此节点输出 */
let sfxMasterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
    // 创建 sfx 总音量节点并注册到 audioSettings
    sfxMasterGain = audioContext.createGain();
    sfxMasterGain.connect(audioContext.destination);
    // 延迟导入避免循环依赖
    import("./audioSettings").then(({ registerSfxGainNode }) => {
      if (sfxMasterGain) registerSfxGainNode(sfxMasterGain);
    });
  }
  void audioContext.resume();
  return audioContext;
}

/** 获取音效目标节点（总音量 GainNode 或直接 destination） */
function getSfxDestination(): AudioNode {
  const ctx = getAudioContext();
  if (!ctx) throw new Error("no audio context");
  return sfxMasterGain ?? ctx.destination;
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
  oscillator.connect(gain).connect(getSfxDestination());
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
  source.connect(gain).connect(getSfxDestination());
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
  if (name === "skill_extract") {
    [0, 0.12, 0.24, 0.38].forEach((offset, index) => {
      tone(context, 660 + index * 220, 0.42, 0.08, "sine", offset);
      tone(context, 990 + index * 260, 0.34, 0.055, "triangle", offset + 0.04);
    });
    noise(context, 0.9, 0.035, 0.1);
    return;
  }
  if (name === "dungeon_transition") {
    tone(context, 72, 0.55, 0.28, "sawtooth");
    tone(context, 1180, 0.18, 0.18, "square", 0.04);
    tone(context, 1860, 0.16, 0.12, "square", 0.14);
    noise(context, 0.62, 0.24, 0.08);
    return;
  }
  if (name === "warning_bell") {
    [0, 0.32, 0.64].forEach((offset) => {
      tone(context, 1380, 0.18, 0.13, "square", offset);
      tone(context, 520, 0.2, 0.08, "sawtooth", offset);
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
  if (name === "message_ping") {
    tone(context, 1180, 0.08, 0.1, "sine");
    tone(context, 1560, 0.11, 0.08, "sine", 0.075);
    return;
  }
  if (name === "paper_rustle") {
    [0, 0.08, 0.18, 0.28].forEach((offset) => noise(context, 0.07, 0.12, offset));
    return;
  }
  if (name === "rule_pierce") {
    tone(context, 96, 0.24, 0.3, "sawtooth");
    tone(context, 2100, 0.16, 0.16, "square");
    noise(context, 0.28, 0.22);
    return;
  }
  if (name === "footsteps_slow") {
    [0, 0.65, 1.3].forEach((offset) => noise(context, 0.16, 0.2, offset));
    return;
  }
  if (name === "water_running") {
    [0, 0.35, 0.7, 1.05, 1.4].forEach((offset) => noise(context, 0.32, 0.055, offset));
    return;
  }
  tone(context, name === "book_drop" ? 110 : 78, 0.28, 0.3, "square");
  noise(context, 0.24, 0.28);
}

// ── 雨声循环：用 AudioContext 生成连续白噪声模拟雨声 ────────────────────────
let rainLoopNode: AudioBufferSourceNode | null = null;
let rainGainNode: GainNode | null = null;

function startRainLoop() {
  const context = getAudioContext();
  if (!context || rainLoopNode) return;

  // 生成 3s 的白噪声缓冲区，loopback 无缝循环
  const sampleRate = context.sampleRate;
  const bufferLength = sampleRate * 3;
  const buffer = context.createBuffer(1, bufferLength, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLength; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.18;
  }

  // 低通滤波器使噪声更柔和（模拟雨声）
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;

  rainGainNode = context.createGain();
  rainGainNode.gain.setValueAtTime(0, context.currentTime);
  rainGainNode.gain.linearRampToValueAtTime(0.35, context.currentTime + 1.5);

  rainLoopNode = context.createBufferSource();
  rainLoopNode.buffer = buffer;
  rainLoopNode.loop = true;
  rainLoopNode.connect(filter).connect(rainGainNode).connect(getSfxDestination());
  rainLoopNode.start();
}

function stopRainLoop(fadeMs = 1200) {
  const context = getAudioContext();
  if (!context || !rainLoopNode || !rainGainNode) return;
  const endTime = context.currentTime + fadeMs / 1000;
  rainGainNode.gain.linearRampToValueAtTime(0, endTime);
  const nodeRef = rainLoopNode;
  window.setTimeout(() => {
    try { nodeRef.stop(); } catch { /* already stopped */ }
    rainLoopNode = null;
    rainGainNode = null;
  }, fadeMs + 100);
}

export function playOneShotSound(name: SoundName) {
  playSynthSound(name);
}

export function playSceneSounds(sceneId: string): () => void {
  const timers = (sceneSounds[sceneId] ?? []).map(({ name, delayMs = 0 }) =>
    window.setTimeout(() => playSynthSound(name), delayMs),
  );
  return () => timers.forEach((timer) => window.clearTimeout(timer));
}

/** 开始循环播放雨声（进入阳台时调用） */
export function startRainAmbience() {
  startRainLoop();
}

/** 停止雨声循环（淡出后停止，离开阳台时调用） */
export function stopRainAmbience() {
  stopRainLoop();
}
