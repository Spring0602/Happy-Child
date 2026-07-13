/* eslint-disable */
// ══════════════════════════════════════════════════════════════
// 快乐小孩 · EdgeOne Pages Functions
// 处理所有 /api/* 请求（AI对话、人格分析、结局裁决、人格画像）
// ══════════════════════════════════════════════════════════════

// ── 环境变量：Cloudflare Pages Functions 使用 context.env，旧 EdgeOne 兼容 process.env ──
// MODEL_PROVIDER, HUNYUAN_API_KEY, HUNYUAN_BASE_URL, HUNYUAN_MODEL, LLM_TIMEOUT_MS

let requestEnv = {};

function getEnv(key, fallback) {
  return requestEnv[key] || (typeof process !== "undefined" && process.env && process.env[key]) || fallback;
}

async function forwardToAiProxy(request, route) {
  const proxyUrl = getEnv("AI_PROXY_URL", "").replace(/\/+$/, "");
  if (!proxyUrl) return null;

  const token = getEnv("AI_PROXY_TOKEN", "");
  const headers = { "Content-Type": request.headers.get("Content-Type") || "application/json" };
  if (token) headers["X-Happy-Child-Proxy-Token"] = token;

  const response = await fetch(proxyUrl + "/api/" + route, {
    method: "POST",
    headers,
    body: await request.text(),
  });
  const text = await response.text();

  return new Response(text, {
    status: response.status,
    headers: {
      ...corsHeaders,
      "Content-Type": response.headers.get("Content-Type") || "application/json; charset=utf-8",
    },
  });
}

// ═══════════════════════ CORS ═══════════════════════
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

// ═══════════════════════ HELPERS ═══════════════════════
function parseJsonResponse(text) {
  const withoutFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("模型没有返回 JSON: " + withoutFence.slice(0, 300));
  }
  return JSON.parse(withoutFence.slice(start, end + 1));
}

function normalizeSceneScript(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:text|markdown)?\s*/i, "")
    .replace(/\s*```$/, "");
  const rolePattern = /\[(?:旁白|主角|主角说|NPC:[^\]]+)\]\s*/g;
  const matches = [...cleaned.matchAll(rolePattern)];
  if (matches.length === 0) return cleaned;
  return matches.map((match, index) => {
    const contentStart = (match.index || 0) + match[0].length;
    const contentEnd = index + 1 < matches.length
      ? matches[index + 1].index || cleaned.length
      : cleaned.length;
    return match[0].trim() + cleaned.slice(contentStart, contentEnd).trim();
  }).filter(s => !s.includes("→ 跳转")).join("\n\n");
}

function parseModelResponse(text, mockType) {
  try {
    return parseJsonResponse(text);
  } catch (error) {
    if (mockType === "scene_fragment") {
      const script = normalizeSceneScript(text);
      if (/\[(?:旁白|主角|主角说|NPC:[^\]]+)\]/.test(script)) return { script };
      if (text.trim()) return { script: "[旁白]" + text.trim() };
    }
    throw error;
  }
}

function getAIErrorMessage(error, fallback) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const safe = rawMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
  const jsonStart = safe.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const payload = JSON.parse(safe.slice(jsonStart));
      const msg = (payload && payload.error && (payload.error.message_zh || payload.error.message));
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    } catch {}
  }
  return safe || fallback;
}

function getAIErrorStatus(error) {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/请求失败 \((\d{3})\)|failed \((\d{3})\)/);
  const status = Number((match && (match[1] || match[2])) || 0);
  if (status === 401 || status === 403) return status;
  if (status >= 400 && status < 500) return 502;
  return 500;
}

// ═══════════════════════ LLM CALLERS ═══════════════════════

async function callOpenAI(prompt, mockType) {
  const apiKey = getEnv("LLM_API_KEY");
  if (!apiKey) throw new Error("缺少 LLM_API_KEY");
  const baseUrl = (getEnv("LLM_BASE_URL", "https://api.openai.com/v1")).replace(/\/+$/, "");
  const model = getEnv("LLM_MODEL", "gpt-5.5");
  const reasonEffort = getEnv("LLM_REASONING_EFFORT", "low");
  const timeoutMs = Number(getEnv("LLM_TIMEOUT_MS", "45000"));
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(baseUrl + "/responses", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: prompt, reasoning: { effort: reasonEffort }, max_output_tokens: 2400 }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
      });
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 500);
        const err = new Error("OpenAI 请求失败 (" + res.status + "): " + detail);
        if (res.status !== 429 && res.status < 500) throw err;
        lastError = err;
      } else {
        const payload = await res.json();
        const text = payload.output_text || (payload.output || []).flatMap(i => i.content || []).filter(c => c.type === "output_text" && c.text).map(c => c.text).join("\n");
        if (!text) throw new Error("OpenAI 返回内容为空");
        return parseModelResponse(text, mockType);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes("(4") && !lastError.message.includes("(429)")) throw lastError;
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt)));
  }
  throw lastError || new Error("OpenAI 请求失败");
}

async function callHunyuan(prompt, mockType) {
  const apiKey = getEnv("HUNYUAN_API_KEY");
  if (!apiKey) throw new Error("缺少 HUNYUAN_API_KEY");
  const baseUrl = (getEnv("HUNYUAN_BASE_URL", "https://tokenhub.tencentmaas.com/v1")).replace(/\/+$/, "");
  const model = getEnv("HUNYUAN_MODEL", "hunyuan-role-latest");
  const timeoutMs = Number(getEnv("LLM_TIMEOUT_MS", "45000"));
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(baseUrl + "/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "你是《快乐小孩》的叙事引擎。严格保持角色设定，不创造提示词之外的关键事实，只输出要求的 JSON 对象。【重要】你的回答必须始终是合法的 JSON 字符串，绝对不能直接扮演角色说话或输出纯文本台词。" },
            { role: "user", content: prompt },
          ],
          stream: false, temperature: 0.7, max_tokens: 2400, response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
      });
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 500);
        const err = new Error("腾讯混元请求失败 (" + res.status + "): " + detail);
        if (res.status !== 429 && res.status < 500) throw err;
        lastError = err;
      } else {
        const payload = await res.json();
        const text = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
        if (!text) throw new Error("腾讯混元返回内容为空");
        return parseModelResponse(text, mockType);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes("(4") && !lastError.message.includes("(429)")) throw lastError;
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt)));
  }
  throw lastError || new Error("腾讯混元请求失败");
}

async function callLLM(prompt, mockType) {
  const provider = getEnv("MODEL_PROVIDER", "mock");
  if (provider === "openai") return callOpenAI(prompt, mockType);
  if (provider === "hunyuan") return callHunyuan(prompt, mockType);
  if (provider !== "mock") throw new Error("不支持的 MODEL_PROVIDER: " + provider);

  // ── Mock responses ──
  if (mockType === "choice_analysis") {
    return {
      summary: "玩家做出了一个会改变人格画像的选择。",
      interpretation: "该选择暂时由 mock AI 分析：玩家在风险、真相、关系与自我保护之间进行权衡。",
      layerSummary: { cognitive: "认知层待分析", action: "行动层待分析", impact: "影响层待分析" },
      traitAnalysis: {
        authorityResistance: { level: "中", analysis: "视选择内容可能上升或下降。" },
        truthDesire: { level: "中", analysis: "玩家是否愿意继续追问副本真相。" },
        selfProtection: { level: "中", analysis: "玩家是否保留筹码并避免暴露。" },
        empathy: { level: "中", analysis: "玩家是否把 NPC 看作真实的人。" },
        realityJudgment: { level: "中", analysis: "玩家是否理解规则与代价。" },
        trust: { level: "中", analysis: "玩家是否愿意合作。" },
        joyPerception: { level: "中", analysis: "玩家是否看见功利系统之外的快乐。" },
      },
      rebellionStyle: "观望型",
    };
  }
  if (mockType === "npc_dialogue") {
    return {
      dialogue: "\"你今天的状态不太对。\"刘宇笑了笑，声音却压得很低，\"如果真要查下去，至少别一个人硬撑。\"",
      clueLevel: 1, relationshipChange: 1,
      hiddenReason: "mock AI 判断：玩家当前有合作倾向，但仍需保留刘宇的危险感。",
    };
  }
  if (mockType === "personality_portrait") {
    return {
      title: "凿孔者", subtitle: "在规则边缘寻找可行动的裂口",
      summary: "你没有逃出圈，却开始凿开一处能够看见灯火的孔。",
      strength: "善于观察规则缝隙，也愿意为另一个人停下脚步。",
      risk: "可能把责任揽得太多，并在追索真相时透支自己。",
      motif: "夜色中，一个像素人物凿开围墙，墙外亮着城市灯火。",
    };
  }
  if (mockType === "scene_fragment") {
    return { script: "[NPC:系统]当前后端处于 mock 模式，未调用真实AI模型。\n\n[旁白]请在 EdgeOne 控制台设置 MODEL_PROVIDER=hunyuan。" };
  }
  return {
    endingId: "hole_maker", title: "凿孔者",
    reason: "mock AI 判断：玩家既没有完全服从，也没有把反抗当作自我证明，而是在规则中寻找可行动的裂口。",
    finalMonologue: "你没有逃出圈，却第一次看见圈的边缘。那不是胜利，只是一条路的开始。",
  };
}

// ═══════════════════════ PROMPT GENERATORS ═══════════════════════

function analyzeChoicePrompt(gameState, choiceId) {
  return "你是视觉小说游戏《快乐小孩》的玩家人格分析模块。\n\n【任务】根据玩家当前选择，分析这次选择体现出的人格倾向。\n\n【三层框架】\n■ 认知层（玩家是否愿意看见真实）\n- truthDesire（真相欲望）：是否愿意冒险追问本质\n- joyPerception（快乐感知）：是否理解\"快乐不是服从后的奖赏\"\n\n■ 行动层（认知之后，是否付出行动）\n- authorityResistance（权威抵制度）：是否敢质疑规则\n- realityJudgment（现实判断）：行动是\"建设性\"还是\"破坏性\"\n- selfProtection（自我保护）：是否因过度保护而无所作为\n\n■ 影响层（是否尝试影响周围的人/世界）\n- empathy（共情能力）：是否理解他人的痛苦\n- trust（关系信任）：是否愿意与NPC合作\n\n【重要原则】\n1. 不要评价玩家好坏，不要把选择简单归类为善恶\n2. 重点分析玩家的生存策略、权威态度、真相欲望、共情能力\n3. 关注\"方法\"：玩家选择背后的思维方式，而非具体行为\n4. 区分\"破坏性叛逆\"和\"建设性叛逆\"\n5. 输出 JSON，不要输出多余解释\n\n【当前玩家状态】\n" + JSON.stringify(gameState, null, 2) + "\n\n【本次选择 ID】\n" + choiceId + "\n\n请输出：{\"summary\":\"一句话总结\",\"interpretation\":\"体现了什么样的人生态度/生存哲学\",\"layerSummary\":{\"cognitive\":\"\",\"action\":\"\",\"impact\":\"\"},\"traitAnalysis\":{\"authorityResistance\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"truthDesire\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"selfProtection\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"empathy\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"realityJudgment\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"trust\":{\"level\":\"高/中/低\",\"analysis\":\"\"},\"joyPerception\":{\"level\":\"高/中/低\",\"analysis\":\"\"}},\"rebellionStyle\":\"建设性叛逆 / 破坏性叛逆 / 顺从型 / 观望型\",\"note\":\"\"}";
}

function npcDialoguePrompt(gameState, npcId) {
  return "你是视觉小说游戏《快乐小孩》的 AI NPC 对话模块。\n\n当前 NPC：" + npcId + "\n\n任务：根据玩家过往选择生成 NPC 的一句或一小段回复，并判断线索释放等级。\n\n世界观限制：\n1. 这是规则怪谈式副本\"快乐小孩\"。\n2. NPC 不能直接说出全部真相。\n3. NPC 的话应当像真实角色，而不是系统说明。\n4. 不能创造新的关键事实。\n5. 不能直接替玩家做选择。\n6. 如果玩家过度依赖 NPC，NPC 可以减少线索或反向试探。\n\n玩家状态：\n" + JSON.stringify(gameState, null, 2) + "\n\n输出 JSON：{\"dialogue\":\"NPC说的话\",\"clueLevel\":0,\"relationshipChange\":0,\"hiddenReason\":\"内部判断原因，前端不展示\"}";
}

function endingJudgePrompt(gameState) {
  return "你是视觉小说游戏《快乐小孩》的结局裁决模块。\n\n【核心原则】不要选择\"最好的结局\"，选择\"最符合玩家长期行为轨迹的结局\"。结局是玩家人格、关系状态和世界规律共同推导出的自然结果，不是奖励或惩罚。\n\n【三层评判框架】\n■ 第一层：认知层（前提）\n- truthDesire（真相欲望）：是否冒险追问副本本质\n- joyPerception（快乐感知）：是否理解\"快乐不是服从后的奖赏\"\n\n■ 第二层：行动层（核心）\n- authorityResistance（权威抵制度）：是否敢质疑规则\n- realityJudgment（现实判断）：行动是\"建设性\"还是\"破坏性\"？\n- selfProtection（自我保护）：是否因过度保护而无所作为\n\n■ 第三层：影响层（终极）\n- empathy（共情能力）：是否理解他人的痛苦\n- trust（关系信任）：是否愿意与NPC合作\n\n【六结局触发条件】\n1. good_child：truthDesire≤0 && authorityResistance≤0 → 未通过认知层\n2. bad_child：authorityResistance>3 && realityJudgment<0 && empathy<0 → 认知通过，行动破坏性\n3. bystander：realityJudgment>2 && authorityResistance<0 && trust<-1 → 认知通过，行动缺失\n4. savior_delusion：empathy>3 && realityJudgment<1 && authorityResistance>2 → 认知通过，行动方向错误\n5. hole_maker：authorityResistance>2 && realityJudgment>2 && joyPerception>2 → 认知+行动通过，影响层部分\n6. happy_child：joyPerception>3 && empathy>3 && trust>1 && truthDesire>1 → 三层全通过\n\n优先级：good_child<bystander<bad_child<savior_delusion<hole_maker<happy_child\n\n【玩家数据】\n" + JSON.stringify(gameState, null, 2) + "\n\n输出JSON：{\"endingId\":\"结局ID\",\"title\":\"结局标题\",\"layer\":\"三层评判结果\",\"reason\":\"为什么这个结局最符合玩家\",\"playerSummary\":\"一句话总结\",\"keyChoices\":[\"选择1\",\"选择2\"],\"finalMonologue\":\"第一人称旁白约200字\"}";
}

function sceneFragmentPrompt(gameState, sceneId, mode, storyContext, scenePrompt, requiredLines, skeletonLines) {
  const exampleScript = "[旁白]示例旁白内容。\\n\\n[NPC:刘宇]示例NPC台词。\\n\\n[主角说]示例主角台词。\\n\\n[旁白]示例收束动作。";
  const hasRequired = (requiredLines || []).length > 0;
  const hasSkeleton = (skeletonLines || []).length > 0;

  const unconditionalLines = [];
  const conditionalLines = [];
  for (const line of (requiredLines || [])) {
    if (/^\[若/.test(line) || /^\[高/.test(line)) {
      conditionalLines.push(line);
    } else {
      unconditionalLines.push(line);
    }
  }

  let skeletonSection = "";
  if (hasSkeleton) {
    const block = (skeletonLines || []).map((l, i) => "  [骨架" + (i + 1) + "] " + l).join("\n");
    skeletonSection = "═══════════════════════════════════\n【必须展开的段落骨架 — 最高优先级，不可遗漏任何一个骨架单元】\n═══════════════════════════════════\n以下每一段都是场景中必须出现的核心内容，但你不可直接照抄——必须在保留其关键句子的前提下，在每个骨架句前后增加2-4句环境描写、情绪铺垫、心理活动或细节描写，使其成为完整丰满的叙事段落。\n\n展开规则：\n  · 每个骨架句中标记的核心句子必须原样保留，措辞和观点不得修改\n  · 每句前后必须扩展环境、动作、神态、心理等细节\n  · 骨架句之间的过渡必须自然流畅，保持叙述逻辑\n  · 骨架句出现的顺序必须与下方一致，不得打乱先后\n\n" + block + "\n\n";
  }

  let requiredLinesSection = "";
  if (unconditionalLines.length > 0) {
    requiredLinesSection += "═══════════════════════════════════\n【必说台词（无条件）— 强制执行，不可遗漏任何一行】\n═══════════════════════════════════\n以下台词必须逐字逐句完整出现在最终script中，不得改动任何标点或字词：\n\n  " + unconditionalLines.join("\n  ") + "\n\n";
  }
  if (conditionalLines.length > 0) {
    requiredLinesSection += "【条件必须台词 — 若当前分支匹配则必须逐字包含】\n根据上方「当前玩家选择」和动态分支条件，匹配到的行必须出现在script中：\n\n  " + conditionalLines.join("\n  ") + "\n\n⚠ 匹配到的行也必须逐字逐句完整包含。未匹配到的行可忽略。\n\n";
  }
  if (!hasRequired) requiredLinesSection = "";

  let structureSection = "";
  if (hasSkeleton && hasRequired) {
    structureSection = "═══════════════════════════════════\n【场景强制结构 — 绝对不可违反的生成顺序，此为最高优先级指令】\n═══════════════════════════════════\n本场景生成时必须严格遵循以下4阶段顺序，不得判断是否合理、不得自行调整先后、不得跳过任何阶段：\n\n  ┌─ 阶段1：开场旁白（展开全部骨架句中的前半部分）\n  └─────────────────────────────────────\n                          ↓\n  ┌─ 阶段2：NPC追问（逐字出现必说台词）\n  └─────────────────────────────────────\n                          ↓\n  ┌─ 阶段3：主角回应（自由创作，受动态分支约束）\n  └─────────────────────────────────────\n                          ↓\n  ┌─ 阶段4：收束旁白（展开全部骨架句中的后半部分）\n  └─────────────────────────────────────\n\n⚠ 以上阶段1→阶段2→阶段3→阶段4的顺序决不可调换、跳跃或合并。\n\n";
  }

  const choiceHistory = gameState.choiceHistory || [];
  const lastChoice = choiceHistory.length > 0 ? choiceHistory[choiceHistory.length - 1] : null;
  const recentChoices = choiceHistory.length > 0
    ? "最近一次选择ID：" + lastChoice + "\n完整选择历史：" + JSON.stringify(choiceHistory)
    : "尚未做出任何选择。";

  return [
    "你是视觉小说《快乐小孩》的动态剧情生成模块，负责生成一小段剧本编码文本。",
    "当前场景ID：" + sceneId,
    "生成模式：" + (mode === "fragment" ? "AI片段（多角色动态小场景）" : "AI对话（NPC主导）"),
    "",
    "═══════════════════════════════════",
    "【输出格式 — 最高优先级，不可违反】",
    "═══════════════════════════════════",
    "你的完整回复必须是且只能是下面这种合法JSON对象，不得在JSON前后附加任何文字、标点或换行：",
    "",
    "{\"script\":\"" + exampleScript + "\"}",
    "",
    "script字段规则：",
    "  · 只能使用以下角色码开头的段落：[旁白]  [主角]  [主角说]  [NPC:角色名]",
    "  · 每个段落之间用字面量 \\n\\n 分隔",
    "  · 禁止在JSON之外输出任何内容",
    "  · 禁止直接扮演角色说话——你输出的是JSON，不是对话",
    "",
    skeletonSection,
    structureSection,
    requiredLinesSection,
    "剧情规则：",
    "1. 若有「场景强制结构」区块：此为最高优先级指令——必须严格按阶段1→阶段2→阶段3→阶段4的顺序生成。",
    "2. 若有「必说台词」区块：必须逐字保留其中的全部台词。",
    "3. 不得创造新的关键世界观事实。",
    "4. 场景要求中的分支条件必须严格匹配下方「当前玩家选择」给出的选择ID。",
    "5. 片段必须有完整收束：NPC的台词必须至少回应一句，随后用[旁白]交代动作或情绪变化。",
    "6. 内容要求丰富充实：请尽可能展开细节——描写动作神态、环境氛围、心理活动。",
    "",
    "═══════════════════════════════════",
    "【当前玩家选择 — 场景分支条件的匹配依据】",
    "═══════════════════════════════════",
    recentChoices,
    "",
    "玩家当前状态：",
    JSON.stringify(gameState, null, 2),
    "",
    "全局世界观底座：",
    "《快乐小孩》是规则副本视觉小说。主角叶平生被困在学校/家庭等区域规则中，表层规则背后指向「好孩子」、服从、成绩、家庭期待和精神匮乏等主题。",
    "",
    "主线剧情上下文：",
    (storyContext || "").trim() || "无额外上下文。仍须严格依据本场景剧本要求。",
    "",
    "本场景剧本要求：",
    scenePrompt,
    "",
    "▶ 再次确认：现在请直接输出JSON对象，第一个字符必须是 { ，最后一个字符必须是 } ，中间只有script一个键。",
  ].join("\n");
}

// ═══════════════════════ PERSONALITY PORTRAIT ═══════════════════════

function escapeXml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(value, maxChars) {
  const chars = Array.from(value);
  const lines = [];
  for (let i = 0; i < chars.length; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(""));
  }
  return lines.slice(0, 3);
}

async function generatePortrait(gameState) {
  const traits = gameState.traits || {};
  const traitLabels = {
    authorityResistance: "权威抵制", truthDesire: "真相欲望", selfProtection: "自我保护",
    empathy: "共情能力", realityJudgment: "现实判断", trust: "关系信任", joyPerception: "快乐感知",
  };

  const prompt = [
    "你正在为《快乐小孩》Demo生成阶段性人格画像内容。",
    "只输出JSON对象，字段为 title、subtitle、summary、strength、risk、motif。",
    "画像不是好坏裁决，不是正式结局；优势与风险必须并存。",
    "motif需描述一个适合像素画的单一视觉意象。",
    "七维人格：" + JSON.stringify(traits),
    "关键选择：" + JSON.stringify(gameState.choiceHistory || []),
  ].join("\n");

  let raw;
  try { raw = await callLLM(prompt, "personality_portrait"); } catch { raw = { title: "凿孔者" }; }

  const content = {
    title: raw.title || "凿孔者",
    subtitle: raw.subtitle || "Demo阶段人格画像",
    summary: raw.summary || "你在规则的缝隙中寻找可以行动的道路，也开始认真看见他人的处境。",
    strength: raw.strength || "能在压力中保持观察，并把反抗转化为具体行动。",
    risk: raw.risk || "可能承担过多责任，或在追寻真相时忽略自身边界。",
    motif: raw.motif || "夜色中，一个像素人物凿开围墙，墙外亮着城市灯火。",
  };

  // Build SVG
  const traitEntries = Object.entries(traitLabels);
  const bars = traitEntries.map(function(entry, index) {
    const key = entry[0], label = entry[1];
    const value = Math.max(-100, Math.min(100, traits[key] || 0));
    const normalized = Math.max(8, Math.min(100, 50 + value / 2));
    const y = 590 + index * 38;
    return '\n      <text x="650" y="' + y + '" class="label">' + escapeXml(label) + '</text>' +
      '\n      <rect x="810" y="' + (y - 20) + '" width="390" height="18" fill="#20283a"/>' +
      '\n      <rect x="810" y="' + (y - 20) + '" width="' + Math.round(390 * normalized / 100) + '" height="18" fill="' + (value >= 0 ? "#71d6ff" : "#ff7d78") + '"/>' +
      '\n      <text x="1220" y="' + y + '" class="value">' + (value >= 0 ? "+" : "") + value + '</text>';
  }).join("");

  const summaryLines = wrapText(content.summary, 25);
  const strengthLines = wrapText("优势：" + content.strength, 27);
  const riskLines = wrapText("风险：" + content.risk, 27);
  const allTextLines = summaryLines.concat(strengthLines).concat(riskLines);
  const textLines = allTextLines.map(function(line, index) {
    return '<text x="650" y="' + (160 + index * 42) + '" class="' + (index < summaryLines.length ? "body" : "small") + '">' + escapeXml(line) + '</text>';
  }).join("");

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">\n' +
    '  <defs>\n    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="#080b18"/>\n      <stop offset="1" stop-color="#18233c"/>\n    </linearGradient>\n    <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n  </defs>\n' +
    '  <style>\n    text{font-family:"Microsoft YaHei","Noto Sans SC",sans-serif;fill:#f4f7ff}\n    .title{font-size:64px;font-weight:800;letter-spacing:8px}\n    .subtitle{font-size:25px;fill:#91a8cf}\n    .body{font-size:29px}\n    .small{font-size:24px;fill:#cbd6ea}\n    .label{font-size:24px}\n    .value{font-size:22px;fill:#ffe39a}\n    .pixel{shape-rendering:crispEdges}\n  </style>\n' +
    '  <rect width="1600" height="900" fill="url(#night)"/>\n' +
    '  <rect x="38" y="38" width="1524" height="824" fill="none" stroke="#d8b45b" stroke-width="6"/>\n' +
    '  <g class="pixel">\n    <rect x="90" y="120" width="430" height="650" fill="#11182a"/>\n    <rect x="120" y="610" width="370" height="120" fill="#30384c"/>\n    <rect x="120" y="570" width="55" height="40" fill="#151b2b"/>\n    <rect x="210" y="540" width="70" height="70" fill="#151b2b"/>\n    <rect x="330" y="500" width="60" height="110" fill="#151b2b"/>\n    <rect x="420" y="555" width="50" height="55" fill="#151b2b"/>\n    <rect x="146" y="590" width="16" height="16" fill="#ffd76a" filter="url(#glow)"/>\n    <rect x="238" y="566" width="18" height="18" fill="#8fe7ff" filter="url(#glow)"/>\n    <rect x="351" y="528" width="18" height="18" fill="#ffd76a" filter="url(#glow)"/>\n    <rect x="435" y="574" width="16" height="16" fill="#8fe7ff" filter="url(#glow)"/>\n    <rect x="265" y="300" width="74" height="74" fill="#e9d7b8"/>\n    <rect x="240" y="374" width="124" height="150" fill="#516a94"/>\n    <rect x="210" y="400" width="30" height="95" fill="#516a94"/>\n    <rect x="364" y="400" width="30" height="95" fill="#516a94"/>\n    <rect x="250" y="524" width="38" height="72" fill="#27324d"/>\n    <rect x="316" y="524" width="38" height="72" fill="#27324d"/>\n    <rect x="98" y="128" width="414" height="634" fill="none" stroke="#5b6b8c" stroke-width="4"/>\n    <rect x="470" y="235" width="42" height="210" fill="#11182a"/>\n    <rect x="470" y="275" width="42" height="42" fill="#d8b45b"/>\n    <rect x="470" y="360" width="42" height="42" fill="#d8b45b"/>\n  </g>\n' +
    '  <text x="650" y="92" class="title">' + escapeXml(content.title) + '</text>\n' +
    '  <text x="654" y="128" class="subtitle">' + escapeXml(content.subtitle) + ' · 观察仍将继续</text>\n' +
    '  ' + textLines + '\n  ' + bars + '\n' +
    '  <text x="90" y="820" class="small">PIXEL MOTIF · ' + escapeXml(content.motif) + '</text>\n</svg>';

  return {
    ...content,
    imageDataUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
  };
}

// ═══════════════════════ ROUTE HANDLERS ═══════════════════════

async function handleAnalyzeChoice(body) {
  const { gameState, choiceId } = body;
  const prompt = analyzeChoicePrompt(gameState, choiceId);
  const result = await callLLM(prompt, "choice_analysis");
  return { ok: true, result };
}

async function handleNpcDialogue(body) {
  const { gameState, npcId } = body;
  const prompt = npcDialoguePrompt(gameState, npcId);
  const result = await callLLM(prompt, "npc_dialogue");
  return { ok: true, result };
}

async function handleGenerateScene(body) {
  const { gameState, sceneId, mode, prompt, context, requiredLines, skeletonLines } = body;
  if (!gameState || typeof sceneId !== "string" || typeof prompt !== "string") {
    return { ok: false, message: "invalid scene generation request" };
  }
  const normalizedContext = typeof context === "string" ? context : "";
  const normalizedMode = mode === "dialogue" ? "dialogue" : "fragment";
  const normalizedRequiredLines = Array.isArray(requiredLines) ? requiredLines.filter(l => typeof l === "string") : [];
  const normalizedSkeletonLines = Array.isArray(skeletonLines) ? skeletonLines.filter(l => typeof l === "string") : [];

  const fullPrompt = sceneFragmentPrompt(
    gameState, sceneId, normalizedMode, normalizedContext, prompt,
    normalizedRequiredLines, normalizedSkeletonLines
  );
  const result = await callLLM(fullPrompt, "scene_fragment");

  if (typeof result.script === "string") {
    const missing = normalizedRequiredLines.filter(function(line) {
      const spoken = line.replace(/^\[[^\]]+\]\s*/, "");
      return spoken && result.script.indexOf(spoken) === -1;
    });
    if (missing.length > 0) result.script = missing.join("\n\n") + "\n\n" + result.script;
  }
  return { ok: true, result };
}

async function handleJudgeEnding(body) {
  const { gameState } = body;
  const prompt = endingJudgePrompt(gameState);
  const result = await callLLM(prompt, "ending_judge");
  return { ok: true, result };
}

async function handlePersonalityPortrait(body) {
  const { gameState } = body;
  const result = await generatePortrait(gameState);
  return { ok: true, result };
}

// ═══════════════════════ MAIN HANDLER ═══════════════════════

export async function onRequest(context) {
  const { request } = context;
  requestEnv = context.env || {};

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const route = path.split("/").pop();

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, message: "method not allowed" }, 405);
  }

  const proxyResponse = await forwardToAiProxy(request, route);
  if (proxyResponse) return proxyResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "invalid json body" }, 400);
  }

  try {
    let result;

    switch (route) {
      case "analyze-choice":
        result = await handleAnalyzeChoice(body);
        break;
      case "npc-dialogue":
        result = await handleNpcDialogue(body);
        break;
      case "generate-scene":
        result = await handleGenerateScene(body);
        break;
      case "judge-ending":
        result = await handleJudgeEnding(body);
        break;
      case "personality-portrait":
        result = await handlePersonalityPortrait(body);
        break;
      default:
        return jsonResponse({ ok: false, message: "unknown API endpoint: " + route }, 404);
    }

    return jsonResponse(result, 200);
  } catch (error) {
    console.error("[Pages-Func] " + path + " failed:", error.message || String(error));
    const status = getAIErrorStatus(error);
    const message = getAIErrorMessage(error, "internal error");
    return jsonResponse({ ok: false, message }, status);
  }
}

export const config = {
  runtime: "experimental-edge",
};
