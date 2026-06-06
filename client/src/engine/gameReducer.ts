import type { AITrace, GameState, Choice, Traits } from "../types/game";
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
  currentMapId: "dormitory",
  playerPosition: { x: 0, y: 0 },
  flags: {},
  interactedItems: [],
  endingReached: false,
};

export type GameAction =
  | { type: "CHOOSE"; choice: Choice }
  | { type: "GO_NEXT"; nextSceneId: string }
  | { type: "ADD_AI_TRACE"; trace: AITrace }
  | { type: "LOAD"; state: GameState }
  | { type: "RESET" }
  | { type: "CHANGE_MAP"; mapId: string; spawnId: string; position: { x: number; y: number } }
  | { type: "SET_FLAG"; flag: string }
  | { type: "INTERACT_ITEM"; itemId: string }
  | { type: "UPDATE_POSITION"; position: { x: number; y: number } }
  | { type: "DIALOG_START"; sceneId: string }
  | { type: "DIALOG_END" }
  | { type: "ENDING_REACHED" };

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

    case "LOAD": {
      // 兼容旧存档：补全缺失的字段
      const loaded = action.state;
      return {
        ...initialGameState,
        ...loaded,
        traits: { ...initialGameState.traits, ...loaded.traits },
        npcTrust: { ...initialGameState.npcTrust, ...loaded.npcTrust },
        flags: { ...initialGameState.flags, ...loaded.flags },
      };
    }

    case "RESET":
      return initialGameState;

    case "CHANGE_MAP":
      return {
        ...state,
        currentMapId: action.mapId,
        playerPosition: action.position,
      };

    case "SET_FLAG":
      return { ...state, flags: { ...state.flags, [action.flag]: true } };

    case "INTERACT_ITEM":
      return {
        ...state,
        interactedItems: [...state.interactedItems, action.itemId],
      };

    case "UPDATE_POSITION":
      return { ...state, playerPosition: action.position };

    case "DIALOG_START":
      return { ...state, currentSceneId: action.sceneId };

    case "DIALOG_END":
      return { ...state, currentSceneId: "" };

    case "ENDING_REACHED":
      return { ...state, endingReached: true };

    default:
      return state;
  }
}
