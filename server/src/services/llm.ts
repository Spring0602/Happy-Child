import { ProxyAgent, fetch as undiciFetch } from "undici";

type MockType = "choice_analysis" | "npc_dialogue" | "ending_judge" | "personality_portrait" | "scene_fragment";

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface ChatCompletionsResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

let proxyAgent: ProxyAgent | undefined;

function getProxyAgent(): ProxyAgent | undefined {
  const proxyUrl = process.env.LLM_PROXY_URL;
  if (!proxyUrl) return undefined;
  proxyAgent ??= new ProxyAgent(proxyUrl);
  return proxyAgent;
}

function getResponseText(response: OpenAIResponse): string {
  if (response.output_text) return response.output_text;
  return (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("\n");
}

function parseJsonResponse(text: string): Record<string, unknown> {
  const withoutFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error(`模型没有返回 JSON 对象: ${withoutFence.slice(0, 300)}`);
  }
  return JSON.parse(withoutFence.slice(start, end + 1)) as Record<string, unknown>;
}

function normalizeSceneScript(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```(?:text|markdown)?\s*/i, "")
    .replace(/\s*```$/, "");
  const rolePattern = /\[(?:旁白|主角|主角说|NPC:[^\]]+)\]\s*/g;
  const matches = [...cleaned.matchAll(rolePattern)];
  if (matches.length === 0) return cleaned;

  return matches.map((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length
      ? matches[index + 1].index ?? cleaned.length
      : cleaned.length;
    return `${match[0].trim()}${cleaned.slice(contentStart, contentEnd).trim()}`;
  }).filter((segment) => !segment.includes("→ 跳转"))
    .join("\n\n");
}

function parseModelResponse(text: string, mockType: MockType): Record<string, unknown> {
  try {
    return parseJsonResponse(text);
  } catch (error) {
    if (mockType === "scene_fragment") {
      const script = normalizeSceneScript(text);
      if (/\[(?:旁白|主角|主角说|NPC:[^\]]+)\]/.test(script)) {
        return { script };
      }
    }
    throw error;
  }
}

async function callOpenAI(prompt: string, mockType: MockType): Promise<Record<string, unknown>> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("缺少 LLM_API_KEY，请在 server/.env 中配置");

  const baseUrl = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.LLM_MODEL || "gpt-5.5";
  const reasoningEffort = process.env.LLM_REASONING_EFFORT || "low";
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 45000);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await undiciFetch(`${baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: prompt,
          reasoning: { effort: reasoningEffort },
          max_output_tokens: 2400,
        }),
        signal: AbortSignal.timeout(timeoutMs),
        dispatcher: getProxyAgent(),
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        const error = new Error(`OpenAI 请求失败 (${response.status}): ${detail}`);
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
      } else {
        const payload = await response.json() as OpenAIResponse;
        const text = getResponseText(payload);
        if (!text) throw new Error("OpenAI 返回内容为空");
        return parseModelResponse(text, mockType);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes("(4") && !lastError.message.includes("(429)")) throw lastError;
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 600 * (2 ** attempt)));
    }
  }

  throw lastError ?? new Error("OpenAI 请求失败");
}

async function callHunyuan(prompt: string, mockType: MockType): Promise<Record<string, unknown>> {
  const apiKey = process.env.HUNYUAN_API_KEY;
  if (!apiKey) throw new Error("缺少 HUNYUAN_API_KEY，请在 server/.env 中配置");

  const baseUrl = (process.env.HUNYUAN_BASE_URL || "https://tokenhub.tencentmaas.com/v1").replace(/\/+$/, "");
  const model = process.env.HUNYUAN_MODEL || "hunyuan-role-latest";
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 45000);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await undiciFetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "你是《快乐小孩》的叙事引擎。严格保持角色设定，不创造提示词之外的关键事实，只输出要求的 JSON 对象。",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
          temperature: 0.7,
          max_tokens: 2400,
        }),
        signal: AbortSignal.timeout(timeoutMs),
        dispatcher: getProxyAgent(),
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        const error = new Error(`腾讯混元请求失败 (${response.status}): ${detail}`);
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
      } else {
        const payload = await response.json() as ChatCompletionsResponse;
        const text = payload.choices?.[0]?.message?.content;
        if (!text) throw new Error("腾讯混元返回内容为空");
        return parseModelResponse(text, mockType);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes("(4") && !lastError.message.includes("(429)")) throw lastError;
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 600 * (2 ** attempt)));
    }
  }

  throw lastError ?? new Error("腾讯混元请求失败");
}

export async function callLLM(prompt: string, mockType: MockType) {
  console.log("--- LLM PROMPT START ---");
  console.log(prompt.slice(0, 2000));
  console.log("--- LLM PROMPT END ---");

  const provider = process.env.MODEL_PROVIDER || "mock";
  if (provider === "openai") {
    return callOpenAI(prompt, mockType);
  }
  if (provider === "hunyuan") {
    return callHunyuan(prompt, mockType);
  }
  if (provider !== "mock") {
    throw new Error(`不支持的 MODEL_PROVIDER: ${provider}`);
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

  if (mockType === "personality_portrait") {
    return {
      title: "凿孔者",
      subtitle: "在规则边缘寻找可行动的裂口",
      summary: "你没有逃出圈，却开始凿开一处能够看见灯火的孔。",
      strength: "善于观察规则缝隙，也愿意为另一个人停下脚步。",
      risk: "可能把责任揽得太多，并在追索真相时透支自己。",
      motif: "夜色中，一个像素人物凿开围墙，墙外亮着城市灯火。",
    };
  }

  if (mockType === "scene_fragment") {
    return {
      script: "[NPC:系统]当前后端处于 mock 模式，未调用真实AI模型。\n\n[旁白]请确认 server/.env 中 MODEL_PROVIDER=hunyuan，并重启后端服务。",
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
