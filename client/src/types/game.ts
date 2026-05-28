export type GameMode = "map" | "story";

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
  npcTrustEffects?: Record<string, number>;  // NPC 角色ID → 信任度变化
  tags?: string[];
  needAIAnalysis?: boolean;
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
  returnToMap?: boolean;  // 剧情结束后返回地图模式（从NPC交互触发时使用）
  aiEvent?: "npc_dialogue" | "ending_judge";
  mapId?: string;         // 结束后返回的地图ID（可选，默认当前地图）
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

export interface ExplorationState {
  visitedMaps: string[];        // 已访问的地图ID列表
  visitedTiles: Record<string, boolean[][]>;  // 地图ID → 已探索瓦片矩阵
  interactions: string[];       // 已完成交互的 ID 列表（NPC对话/调查点）
  totalExplored: number;        // 累计探索瓦片数
}

export interface GameState {
  currentSceneId: string;
  traits: Traits;
  choiceHistory: string[];
  npcTrust: Record<string, number>;
  exploration: number;
  rebellion: number;
  joyProof: number;
  aiTraces: AITrace[];
  exploreState: ExplorationState;
}
