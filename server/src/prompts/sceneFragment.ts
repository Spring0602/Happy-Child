import type { RequestGameState } from "../types/game";

export function sceneFragmentPrompt(
  gameState: RequestGameState,
  sceneId: string,
  mode: "dialogue" | "fragment",
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
    requiredLines.length > 0
      ? `7. 以下台词必须逐字出现：\n${requiredLines.join("\n")}`
      : "7. 如果没有指定必说台词，不要自行重复同一句话。",
    "",
    "玩家当前状态：",
    JSON.stringify(gameState, null, 2),
    "",
    "本场景剧本要求：",
    scenePrompt,
  ].join("\n");
}
