import type { RequestGameState } from "../types/game";

export function endingJudgePrompt(gameState: RequestGameState) {
  return `
你是视觉小说游戏《快乐小孩》的结局裁决模块。

可选结局：
1. good_child：好孩子
2. bad_child：坏孩子
3. bystander：旁观者
4. hole_maker：凿孔者
5. happy_child：快乐小孩

裁决原则：
不要选择“最好的结局”。
选择“最符合玩家长期行为轨迹的结局”。

判断重点：
1. 玩家是否理解快乐不是服从后的奖赏。
2. 玩家是否愿意承担反抗的代价。
3. 玩家是否仍能看见他人的痛苦。
4. 玩家是否只是用反抗满足自我证明。
5. 玩家是否能在不完美世界中保留行动能力。

玩家状态：
${JSON.stringify(gameState, null, 2)}

输出 JSON：
{
  "endingId": "结局ID",
  "title": "结局标题",
  "reason": "为什么这个结局最符合玩家",
  "finalMonologue": "给玩家的个性化结尾旁白"
}
`;
}
