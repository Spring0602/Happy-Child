import type { RequestGameState } from "../types/game";

export function analyzeChoicePrompt(gameState: RequestGameState, choiceId: string) {
  return `
你是视觉小说游戏《快乐小孩》的玩家人格分析模块。

任务：
根据玩家当前选择，分析这次选择体现出的人格倾向。

重要原则：
1. 不要评价玩家好坏。
2. 不要把选择简单归类为善恶。
3. 重点分析玩家的生存策略、权威态度、真相欲望、共情能力、快乐感知。
4. 输出 JSON，不要输出多余解释。

当前玩家状态：
${JSON.stringify(gameState, null, 2)}

本次选择 ID：
${choiceId}

请输出：
{
  "summary": "一句话总结玩家选择",
  "interpretation": "这次选择体现的人格倾向",
  "traitAnalysis": {
    "authorityResistance": "分析",
    "truthDesire": "分析",
    "selfProtection": "分析",
    "empathy": "分析",
    "realityJudgment": "分析",
    "trust": "分析",
    "joyPerception": "分析"
  }
}
`;
}
