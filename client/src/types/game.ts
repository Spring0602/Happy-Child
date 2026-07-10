export type Trait =
  | "authorityResistance" // 权威抵制度：是否敢质疑老师、父母、规则
  | "truthDesire" // 真相欲望：是否愿意冒险追问本质
  | "selfProtection" // 自我保护：是否保留筹码、谨慎行动
  | "empathy" // 共情能力：是否理解 NPC 与“我”的痛苦
  | "realityJudgment" // 现实判断：是否知道何时退让、何时反抗
  | "trust" // 关系信任：是否愿意与 NPC 合作
  | "joyPerception"; // 快乐感知：是否能从功利外感受生命

export type Traits = Record<Trait, number>;

export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
  effects: Partial<Record<Trait, number>>;
  tags?: string[];
  needAIAnalysis?: boolean;
}

export interface PhoneChatMessage {
  id?: string;
  sender: string;
  text: string;
  avatar?: string;
  align?: "left" | "right" | "center";
  delayMs?: number;
  typingMs?: number;
  system?: boolean;
}

export interface PhoneChat {
  title: string;
  subtitle?: string;
  messages: PhoneChatMessage[];
  /** 已存在聊天记录，进入场景时直接显示，不重新播放 */
  initialMessages?: PhoneChatMessage[];
  /** 手机界面模式：聊天、群成员列表、群公告 */
  view?: "chat" | "members" | "announcement";
  members?: string[];
  announcement?: string;
  /** 手机界面位置，默认居中偏上，避免压到底部对话框 */
  position?: "center" | "left" | "right";
  /** 播放完成前是否阻止进入下一场景，默认 true */
  blockNextUntilComplete?: boolean;
}

export interface Scene {
  id: string;
  chapter: string;
  background: string;
  speaker?: string;
  character?: string;
  text: string;
  choices?: Choice[];
  nextSceneId?: string;
  aiEvent?: "npc_dialogue" | "ending_judge";
  /** CG 模式：全屏大图 + 底部对话，speaker为"旁白"时不显示立绘 */
  cgMode?: boolean;
  /** CG 模式下触发后置效果：nextSceneId 的场景加载完成后执行 */
  onCgEnd?: "enter_dormitory" | "enter_balcony" | "enter_dormitory_playable" | string;
  /** 地图场景入场时主角应播放的动作，如 yps_frames_sit_back / stand_left / sit_up */
  playerState?: string;
  /** 手机群聊演出层：用于模拟真实手机消息逐条弹出 */
  phoneChat?: PhoneChat;
}

export interface CharacterCard {
  id: string;
  name: string;
  role: string;
  personality: string;
  function: string;
  cannotSay: string[];
}

export interface EndingCard {
  id: string;
  title: string;
  description: string;
  layer?: string;
  hint?: string;
  monologue?: string;
}

export interface AITrace {
  type: "choice_analysis" | "npc_dialogue" | "ending_judge";
  sceneId: string;
  result: string;
  createdAt: string;
}

export interface MapRuntimeNpcSnapshot {
  npcKey: string;
  framesPrefix: string;
  textureKey: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  depth: number;
  bodyWidth: number;
  bodyHeight: number;
}

export interface MapRuntimeSnapshot {
  version: 1;
  mapId: string;
  player: {
    x: number;
    y: number;
    direction: "left" | "right" | "up" | "down";
    sitting: boolean;
    frozen: boolean;
    depth: number;
  };
  npcs: MapRuntimeNpcSnapshot[];
  camera: {
    scrollX: number;
    scrollY: number;
    zoom: number;
    followsPlayer: boolean;
  };
}

export interface GameState {
  // ====== 现有字段 ======
  currentSceneId: string;
  traits: Traits;
  choiceHistory: string[];
  npcTrust: Record<string, number>;
  exploration: number;
  rebellion: number;
  joyProof: number;
  aiTraces: AITrace[];

  // ====== 探索模式字段 ======
  currentMapId: string;
  currentSpawnId: string;
  playerPosition: { x: number; y: number };
  flags: Record<string, boolean>;
  interactedItems: string[];
  /** 地图运行时快照：存档时由 Phaser 即时采集，读档时完整重建现场 */
  mapRuntime?: MapRuntimeSnapshot;

  // ====== 结局标记（结局后才显示画像和AI分析） ======
  endingReached: boolean;
}
