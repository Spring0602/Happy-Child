import type { GameState } from "../types/game";

const API_BASE = import.meta.env.VITE_AI_SERVER_URL
  ?? (typeof window !== "undefined" && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI request failed: ${path} (${response.status}) ${detail.slice(0, 300)}`);
  }

  return response.json() as Promise<T>;
}

export async function analyzeChoice(gameState: GameState, choiceId: string) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/analyze-choice", {
    gameState,
    choiceId,
  });
}

export async function generateNpcDialogue(gameState: GameState, npcId: string) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/npc-dialogue", {
    gameState,
    npcId,
  });
}

export async function generateAiScene(
  gameState: GameState,
  sceneId: string,
  mode: "dialogue" | "fragment",
  prompt: string,
  requiredLines: string[] = [],
  context = ""
) {
  return postJSON<{ ok: boolean; result: { script: string } }>("/api/generate-scene", {
    gameState,
    sceneId,
    mode,
    context,
    prompt,
    requiredLines,
  });
}

export async function judgeEnding(gameState: GameState) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/judge-ending", {
    gameState,
  });
}

export interface GeneratedPersonalityPortrait {
  title: string;
  subtitle: string;
  summary: string;
  strength: string;
  risk: string;
  motif: string;
  imageDataUrl: string;
}

export async function generatePersonalityPortrait(gameState: GameState) {
  return postJSON<{ ok: boolean; result: GeneratedPersonalityPortrait }>("/api/personality-portrait", {
    gameState,
  });
}

export function createFallbackPersonalityPortrait(gameState: GameState): GeneratedPersonalityPortrait {
  const title = "凿孔者";
  const summary = "你没有逃出圈，却开始凿开一处能够看见灯火的孔。";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
    <rect width="1600" height="900" fill="#080b18"/>
    <rect x="38" y="38" width="1524" height="824" fill="none" stroke="#d8b45b" stroke-width="6"/>
    <g shape-rendering="crispEdges">
      <rect x="110" y="130" width="450" height="640" fill="#11182a"/>
      <rect x="170" y="590" width="330" height="130" fill="#30384c"/>
      <rect x="270" y="320" width="80" height="80" fill="#e9d7b8"/>
      <rect x="240" y="400" width="140" height="180" fill="#516a94"/>
      <rect x="470" y="250" width="50" height="240" fill="#11182a"/>
      <rect x="470" y="300" width="50" height="50" fill="#f5c451"/>
      <rect x="470" y="410" width="50" height="50" fill="#8fe7ff"/>
    </g>
    <g font-family="Microsoft YaHei,Noto Sans SC,sans-serif" fill="#f4f7ff">
      <text x="650" y="130" font-size="68" font-weight="800">${title}</text>
      <text x="654" y="180" font-size="28" fill="#91a8cf">Demo阶段人格画像 · 观察仍将继续</text>
      <text x="650" y="270" font-size="32">${summary}</text>
      <text x="650" y="340" font-size="26" fill="#cbd6ea">优势：在压力中观察规则，并把反抗变成行动。</text>
      <text x="650" y="390" font-size="26" fill="#cbd6ea">风险：可能承担过多责任，也可能透支自己。</text>
      <text x="650" y="490" font-size="25">七维画像数据已记录</text>
      <text x="650" y="550" font-size="22" fill="#ffe39a">${Object.entries(gameState.traits).map(([key, value]) => `${key}:${value}`).join("  ")}</text>
    </g>
  </svg>`;
  return {
    title,
    subtitle: "Demo阶段人格画像",
    summary,
    strength: "在压力中观察规则，并把反抗变成行动。",
    risk: "可能承担过多责任，也可能透支自己。",
    motif: "夜色中被凿开的围墙与城市灯火。",
    imageDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}
