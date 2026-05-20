import type { Choice, GameState, Trait } from "../types/game";

export function applyChoice(state: GameState, choice: Choice): GameState {
  const newTraits = { ...state.traits };

  for (const key in choice.effects) {
    const trait = key as Trait;
    newTraits[trait] += choice.effects[trait] ?? 0;
  }

  return {
    ...state,
    currentSceneId: choice.nextSceneId,
    traits: newTraits,
    choiceHistory: [...state.choiceHistory, choice.id],
  };
}
