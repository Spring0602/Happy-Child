import type { Choice, GameState, Trait } from "../types/game";

export function applyChoice(state: GameState, choice: Choice): GameState {
  const newTraits = { ...state.traits };

  for (const key in choice.effects) {
    const trait = key as Trait;
    newTraits[trait] += choice.effects[trait] ?? 0;
  }

  // 更新 NPC 信任度
  const newNpcTrust = { ...state.npcTrust };
  if (choice.npcTrustEffects) {
    for (const npcId in choice.npcTrustEffects) {
      newNpcTrust[npcId] = (newNpcTrust[npcId] ?? 0) + (choice.npcTrustEffects[npcId] ?? 0);
      // 信任度限制在 -10 ~ 10 范围内
      newNpcTrust[npcId] = Math.max(-10, Math.min(10, newNpcTrust[npcId]));
    }
  }

  // 根据选择标签估算叛逆值
  const rebellionDelta = estimateRebellionDelta(choice);
  const newRebellion = Math.max(0, Math.min(100, state.rebellion + rebellionDelta));

  return {
    ...state,
    currentSceneId: choice.nextSceneId,
    traits: newTraits,
    npcTrust: newNpcTrust,
    rebellion: newRebellion,
    choiceHistory: [...state.choiceHistory, choice.id],
  };
}

/** 根据选择标签估算叛逆值变化 */
function estimateRebellionDelta(choice: Choice): number {
  const tags = choice.tags ?? [];
  let delta = 0;
  for (const tag of tags) {
    if (tag === "反抗" || tag === "抗争" || tag === "建设性叛逆" || tag === "暴力") delta += 8;
    if (tag === "破坏性" || tag === "冒险") delta += 5;
    if (tag === "威胁" || tag === "强硬" || tag === "质问") delta += 3;
    if (tag === "顺从" || tag === "安全" || tag === "保守") delta -= 2;
    if (tag === "退让") delta -= 3;
  }
  return delta;
}
