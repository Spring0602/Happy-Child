import type { RequestGameState } from "../types/game";

// ══════════════════════════════════════════════════════════════
// 玩家人格分析提示词 · 三层框架版
//
// 评判顺序：认知层 → 行动层 → 影响层
// 每个 trait 属于哪一层，AI 需要在分析时标注
// ══════════════════════════════════════════════════════════════

export function analyzeChoicePrompt(gameState: RequestGameState, choiceId: string) {
  return `
你是视觉小说游戏《快乐小孩》的玩家人格分析模块。

【任务】
根据玩家当前选择，分析这次选择体现出的人格倾向。

【三层框架】

■ 认知层（玩家是否愿意看见真实）
- truthDesire（真相欲望）：是否愿意冒险追问本质
- joyPerception（快乐感知）：是否理解"快乐不是服从后的奖赏"

■ 行动层（认知之后，是否付出行动）
- authorityResistance（权威抵制度）：是否敢质疑规则
- realityJudgment（现实判断）：行动是"建设性"还是"破坏性"
- selfProtection（自我保护）：是否因过度保护而无所作为

■ 影响层（是否尝试影响周围的人/世界）
- empathy（共情能力）：是否理解他人的痛苦
- trust（关系信任）：是否愿意与NPC合作

【重要原则】
1. 不要评价玩家好坏，不要把选择简单归类为善恶
2. 重点分析玩家的生存策略、权威态度、真相欲望、共情能力
3. 关注"方法"：玩家选择背后的思维方式，而非具体行为
4. 区分"破坏性叛逆"和"建设性叛逆"——两者都有权威抵抗，但后者有现实判断配合
5. 输出 JSON，不要输出多余解释

【当前玩家状态】
${JSON.stringify(gameState, null, 2)}

【本次选择 ID】
${choiceId}

请输出：
{
  "summary": "一句话总结这次选择",
  "interpretation": "这次选择体现了什么样的人生态度/生存哲学",
  "layerSummary": {
    "cognitive": "认知层一句话评价",
    "action": "行动层一句话评价",
    "impact": "影响层一句话评价"
  },
  "traitAnalysis": {
    "authorityResistance": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "truthDesire": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "selfProtection": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "empathy": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "realityJudgment": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "trust": {"level": "高/中/低", "analysis": "分析（30字内）"},
    "joyPerception": {"level": "高/中/低", "analysis": "分析（30字内）"}
  },
  "rebellionStyle": "建设性叛逆 / 破坏性叛逆 / 顺从型 / 观望型",
  "note": "补充说明（如有特别值得注意的倾向）"
}
`;
}
