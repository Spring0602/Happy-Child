import type { AITrace, GameState, Choice, Traits, ExplorationState } from "../types/game";
import { applyChoice } from "./applyChoice";

const initialTraits: Traits = {
  authorityResistance: 0,
  truthDesire: 0,
  selfProtection: 0,
  empathy: 0,
  realityJudgment: 0,
  trust: 0,
  joyPerception: 0,
};

export const initialGameState: GameState = {
  currentSceneId: "start",
  traits: initialTraits,
  choiceHistory: [],
  npcTrust: {
    liuyu: 0,
    wangTeacher: 0,
    zhouJunxiu: 0,
  },
  exploration: 0,
  rebellion: 0,
  joyProof: 0,
  aiTraces: [],
  exploreState: {
    visitedMaps: [],
    visitedTiles: {},
    interactions: [],
    totalExplored: 0,
  },
};

export type GameAction =
  | { type: "CHOOSE"; choice: Choice }
  | { type: "GO_NEXT"; nextSceneId: string }
  | { type: "ADD_AI_TRACE"; trace: AITrace }
  | { type: "UPDATE_EXPLORE"; exploreState: ExplorationState }
  | { type: "ADD_INTERACTION"; interactionId: string }
  | { type: "LOAD"; state: GameState }
  | { type: "RESET" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CHOOSE":
      return applyChoice(state, action.choice);

    case "GO_NEXT":
      return {
        ...state,
        currentSceneId: action.nextSceneId,
      };

    case "ADD_AI_TRACE":
      return {
        ...state,
        aiTraces: [...state.aiTraces, action.trace],
      };

    case "UPDATE_EXPLORE":
      return {
        ...state,
        exploreState: action.exploreState,
      };

    case "ADD_INTERACTION":
      return {
        ...state,
        exploreState: {
          ...state.exploreState,
          interactions: [...state.exploreState.interactions, action.interactionId],
        },
      };

    case "LOAD":
      return {
        ...action.state,
        // 确保探索状态完整
        exploreState: {
          visitedMaps: action.state.exploreState?.visitedMaps ?? [],
          visitedTiles: action.state.exploreState?.visitedTiles ?? {},
          interactions: action.state.exploreState?.interactions ?? [],
          totalExplored: action.state.exploreState?.totalExplored ?? 0,
        },
      };

    case "RESET":
      return { ...initialGameState };

    default:
      return state;
  }
}
