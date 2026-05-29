import type { Choice, GameState, Trait } from "../types/game";

/**
 * 根据选项的效果标签，同步更新探索度 / 叛逆值 / 快乐证明度 / NPC 信任值
 */
function computeSystemValues(state: GameState, choice: Choice): Partial<GameState> {
  const updates: Partial<GameState> = {};
  const tags = choice.tags ?? [];

  // 探索度：与探索、真相相关的标签
  if (tags.some((t) => ["探索", "真相", "冒险", "展示"].includes(t))) {
    updates.exploration = Math.min(100, state.exploration + 5);
  }

  // 叛逆值：与反抗、抗争、暴力相关的标签
  if (tags.some((t) => ["反抗", "抗争", "暴力", "破坏性", "建设性叛逆"].includes(t))) {
    updates.rebellion = Math.min(100, state.rebellion + 5);
  }
  // 特别处理：放弃反抗会降低叛逆值
  if (tags.includes("顺从")) {
    updates.rebellion = Math.max(0, state.rebellion - 3);
  }

  // 快乐证明度：与真实、快乐、共情、和解相关的标签
  if (tags.some((t) => ["真实", "建设性", "和解", "共情", "真诚", "引导"].includes(t))) {
    updates.joyProof = Math.min(100, state.joyProof + 5);
  }

  // NPC 信任度根据角色自动调整
  const npcTrust = { ...state.npcTrust };
  const cid = choice.id;
  if (tags.includes("信任")) {
    // 信任类选择：当前场景关联的 NPC 信任+2
    if (cid.includes("liuyu")) { npcTrust.liuyu = Math.min(10, (npcTrust.liuyu ?? 0) + 2); }
    if (cid.includes("wang")) { npcTrust.wangTeacher = Math.min(10, (npcTrust.wangTeacher ?? 0) + 2); }
    if (cid.includes("zhou") || cid.includes("junxiu")) { npcTrust.zhouJunxiu = Math.min(10, (npcTrust.zhouJunxiu ?? 0) + 2); }
  }
  if (tags.includes("合作")) {
    // 合作标签默认增加刘宇信任
    npcTrust.liuyu = Math.min(10, (npcTrust.liuyu ?? 0) + 1);
  }
  if (tags.includes("怀疑") || tags.includes("拒绝")) {
    if (cid.includes("liuyu")) { npcTrust.liuyu = Math.max(-10, (npcTrust.liuyu ?? 0) - 2); }
  }
  updates.npcTrust = npcTrust;

  return updates;
}

export function applyChoice(state: GameState, choice: Choice): GameState {
  const newTraits = { ...state.traits };

  for (const key in choice.effects) {
    const trait = key as Trait;
    newTraits[trait] += choice.effects[trait] ?? 0;
  }

  const sysUpdates = computeSystemValues(state, choice);

  return {
    ...state,
    currentSceneId: choice.nextSceneId,
    traits: newTraits,
    choiceHistory: [...state.choiceHistory, choice.id],
    ...sysUpdates,
  };
}
