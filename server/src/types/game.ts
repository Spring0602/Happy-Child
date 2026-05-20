export interface RequestGameState {
  currentSceneId: string;
  traits: Record<string, number>;
  choiceHistory: string[];
  npcTrust: Record<string, number>;
  exploration: number;
  rebellion: number;
  joyProof: number;
  aiTraces?: unknown[];
}
