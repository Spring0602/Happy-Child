import type { RequestGameState } from "../types/game";

export function sceneFragmentPrompt(
  gameState: RequestGameState,
  sceneId: string,
  mode: "dialogue" | "fragment",
  storyContext: string,
  scenePrompt: string,
  requiredLines: string[]
) {
  return [
    "你是视觉小说《快乐小孩》的动态剧情生成模块。",
    `当前场景ID：${sceneId}`,
    `生成模式：${mode === "fragment" ? "AI片段（多角色动态小场景）" : "AI对话（NPC主导）"}`,
    "",
    "必须遵守：",
    "1. 只输出JSON对象，格式为 {\"script\":\"剧本编码文本\"}。",
    "2. script只能由剧本角色码段落组成，例如[旁白]、[主角]、[主角说]、[NPC:角色名]。",
    "3. 每段之间使用两个换行；不得输出Markdown代码块、场景标题、提示词、选项或跳转。",
    "4. 必须逐字保留场景要求中的必说台词，并遵守固定事实、禁止事项和行数范围。",
    "5. 不得创造新的关键世界观事实，不得改变死亡、许可、线索、主线结果或下一场景。",
    "6. 根据choiceHistory最后一次相关选择、七维人格、NPC信任和flags调整语气与反应。",
    "7. 片段必须有完整收束：若主角提出安慰、帮助、质问或交易，相关NPC必须至少作出一句回应，随后用[旁白]交代动作或情绪变化；不得在主角刚说完后立刻结束。",
    "8. 若场景要求的行数范围与完整收束冲突，优先保证剧情完整，并尽量控制在范围上限附近。",
    requiredLines.length > 0
      ? `9. 以下台词必须逐字出现：\n${requiredLines.join("\n")}`
      : "9. 如果没有指定必说台词，不要自行重复同一句话。",
    "",
    "玩家当前状态：",
    JSON.stringify(gameState, null, 2),
    "",
    "全局世界观底座：",
    "《快乐小孩》是规则副本视觉小说。主角叶平生被困在学校/家庭等区域规则中，表层规则背后指向“好孩子”、服从、成绩、家庭期待和精神匮乏等主题。AI只能补写当前小场景的对话、旁白和简单动作，不能提前揭秘根本规则，不能改变主线结果，不能把NPC写成普通现实世界人物而忘记副本规则压力。",
    "",
    "主线剧情上下文：",
    storyContext.trim() || "无额外上下文。仍需严格依据本场景剧本要求，不要脱离《快乐小孩》的学校/家庭规则副本语境。",
    "",
    "本场景剧本要求：",
    scenePrompt,
  ].join("\n");
}
