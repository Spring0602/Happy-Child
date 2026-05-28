type MockType = "choice_analysis" | "npc_dialogue" | "ending_judge";

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}

function getConfig(): LLMConfig {
  return {
    provider: process.env.MODEL_PROVIDER ?? "mock",
    apiKey: process.env.OPENAI_API_KEY ?? process.env.API_KEY ?? "",
    model: process.env.MODEL_NAME ?? "gpt-4o-mini",
    baseUrl: process.env.API_BASE_URL ?? "https://api.openai.com/v1",
  };
}

async function callOpenAI(prompt: string, mockType: MockType): Promise<unknown> {
  const config = getConfig();

  if (!config.apiKey) {
    console.warn("⚠ 未配置 API_KEY，使用 mock 模式返回");
    return getMockResult(mockType);
  }

  const systemPrompt = getSystemPrompt(mockType);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LLM API 错误 (${response.status}):`, errorText.slice(0, 500));
      console.warn("回退到 mock 模式");
      return getMockResult(mockType);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("LLM 返回空内容，回退到 mock 模式");
      return getMockResult(mockType);
    }

    // 尝试解析 JSON
    try {
      return JSON.parse(content);
    } catch {
      // 如果解析失败，返回原始文本包装
      return { text: content, note: "raw_response" };
    }
  } catch (error) {
    console.error("LLM 调用异常:", (error as Error).message);
    console.warn("回退到 mock 模式");
    return getMockResult(mockType);
  }
}

function getSystemPrompt(mockType: MockType): string {
  if (mockType === "choice_analysis") {
    return `你是《快乐小孩》AI叙事游戏的裁判系统。你的职责是分析玩家的选择背后的人格倾向。
你需要以 JSON 格式输出：
{
  "summary": "一句话概括玩家的选择",
  "interpretation": "对该选择深层含义的解读",
  "traitAnalysis": {
    "authorityResistance": "对权威抵制度的影响分析",
    "truthDesire": "对真相欲望的影响分析",
    "selfProtection": "对自我保护的影响分析",
    "empathy": "对共情能力的影响分析",
    "realityJudgment": "对现实判断的影响分析",
    "trust": "对关系信任的影响分析",
    "joyPerception": "对快乐感知的影响分析"
  }
}`;
  }

  if (mockType === "npc_dialogue") {
    return `你是《快乐小孩》AI叙事游戏中的NPC，你需要根据玩家的游戏状态生成符合角色性格的对话。
请以 JSON 格式输出：
{
  "dialogue": "NPC对玩家说的话（带引号）",
  "clueLevel": 0-3的整数（0=无线索，3=核心线索），
  "relationshipChange": -2到2的整数（信任度变化），
  "hiddenReason": "NPC说这段话的真实动机（不展示给玩家）"
}`;
  }

  // ending_judge
  return `你是《快乐小孩》AI叙事游戏的终点裁决系统。根据玩家全程的人格画像，从以下6个结局中选择最匹配的：
- good_child（好孩子）：truthDesire≤0 && authorityResistance≤0
- bad_child（坏孩子）：authorityResistance>3 && realityJudgment<0 && empathy<0
- bystander（旁观者）：realityJudgment>2 && authorityResistance<0 && trust<-1
- savior_delusion（救世主幻觉）：empathy>3 && realityJudgment<1 && authorityResistance>2
- hole_maker（凿孔者）：authorityResistance>2 && realityJudgment>2 && joyPerception>2
- happy_child（快乐小孩）：joyPerception>3 && empathy>3 && trust>1 && truthDesire>1

请以 JSON 格式输出：
{
  "endingId": "结局ID",
  "title": "结局标题",
  "reason": "裁决理由（100字以内）",
  "finalMonologue": "给玩家的一段话（200字以内）"
}`;
}

function getMockResult(mockType: MockType): unknown {
  if (mockType === "choice_analysis") {
    return {
      summary: "玩家做出了一个会改变人格画像的选择。",
      interpretation:
        "该选择由本地 mock AI 分析：玩家在风险、真相、关系与自我保护之间进行权衡。",
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
        "「你今天的状态不太对。」刘宇笑了笑，声音却压得很低，「如果真要查下去，至少别一个人硬撑。」",
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

export async function callLLM(prompt: string, mockType: MockType): Promise<unknown> {
  const config = getConfig();

  console.log(`[LLM] provider=${config.provider} model=${config.model} type=${mockType}`);
  console.log("--- LLM PROMPT START ---");
  console.log(prompt.slice(0, 2000));
  console.log("--- LLM PROMPT END ---");

  if (config.provider === "mock" || !config.apiKey) {
    return getMockResult(mockType);
  }

  // 支持 OpenAI 及兼容 API
  return callOpenAI(prompt, mockType);
}
