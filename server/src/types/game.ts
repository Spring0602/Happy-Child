export interface RequestGameState {
  currentSceneId: string;
  traits: Record<string, number>;
  choiceHistory: string[];
  npcTrust: Record<string, number>;
  exploration: number;
  rebellion: number;
  joyProof: number;
  aiTraces?: unknown[];
  aiMemory?: unknown;
}

// AI裁决输出格式
export interface EndingJudgeResult {
  endingId: string;
  title: string;
  layer: string;
  reason: string;
  playerSummary: string;
  keyChoices: string[];
  finalMonologue: string;
}

// AI选择分析输出格式
export interface ChoiceAnalysisResult {
  summary: string;
  interpretation: string;
  layerSummary: {
    cognitive: string;
    action: string;
    impact: string;
  };
  traitAnalysis: Record<string, { level: string; analysis: string }>;
  rebellionStyle: string;
  note?: string;
}
