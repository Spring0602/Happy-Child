type MockType = "choice_analysis" | "npc_dialogue" | "ending_judge";

export async function callLLM(prompt: string, mockType: MockType) {
  console.log("--- LLM PROMPT START ---");
  console.log(prompt.slice(0, 2000));
  console.log("--- LLM PROMPT END ---");

  if (process.env.MODEL_PROVIDER !== "mock") {
    // TODO: 在这里接入真实大模型服务。
    // 注意：API Key 只能放在 server/.env 中，不能写入 client。
    return {
      provider: process.env.MODEL_PROVIDER,
      text: "真实模型调用尚未接入。请在 server/src/services/llm.ts 中实现。",
    };
  }

  if (mockType === "choice_analysis") {
    return {
      summary: "玩家做出了一个会改变人格画像的选择。",
      interpretation:
        "该选择暂时由 mock AI 分析：玩家在风险、真相、关系与自我保护之间进行权衡。",
      traitAnalysis: {
        authorityResistance: "视选择内容可能上升或下降。",
        truthDesire: "玩家是否愿意继续追问副本真相。",
        selfProtection: "玩家是否保留筹码并避免暴露。",
        empathy: "玩家是否把 NPC 看作真实的人。",
        realityJudgment: "玩家是否理解规则与代价。",
        trust: "玩家是否愿意合作。",
        joyPerception: "玩家是否看见功利系统之外的快乐。",
      },
    };
  }

  if (mockType === "npc_dialogue") {
    return {
      dialogue:
        "“你今天的状态不太对。”刘宇笑了笑，声音却压得很低，“如果真要查下去，至少别一个人硬撑。”",
      clueLevel: 1,
      relationshipChange: 1,
      hiddenReason:
        "mock AI 判断：玩家当前有合作倾向，但仍需保留刘宇的危险感。",
    };
  }

  return {
    endingId: "hole_maker",
    title: "凿孔者",
    reason:
      "mock AI 判断：玩家既没有完全服从，也没有把反抗当作自我证明，而是在规则中寻找可行动的裂口。",
    finalMonologue:
      "你没有逃出圈，却第一次看见圈的边缘。那不是胜利，只是一条路的开始。",
  };
}
