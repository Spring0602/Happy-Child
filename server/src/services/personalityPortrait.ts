import { callLLM } from "./llm";

type Traits = Record<string, number>;

interface PortraitContent {
  title?: string;
  subtitle?: string;
  summary?: string;
  strength?: string;
  risk?: string;
  motif?: string;
}

const traitLabels: Record<string, string> = {
  authorityResistance: "权威抵制",
  truthDesire: "真相欲望",
  selfProtection: "自我保护",
  empathy: "共情能力",
  realityJudgment: "现实判断",
  trust: "关系信任",
  joyPerception: "快乐感知",
};

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value: string, maxChars: number): string[] {
  const chars = Array.from(value);
  const lines: string[] = [];
  for (let index = 0; index < chars.length; index += maxChars) {
    lines.push(chars.slice(index, index + maxChars).join(""));
  }
  return lines.slice(0, 3);
}

export async function generatePersonalityPortrait(gameState: { traits?: Traits; choiceHistory?: string[] }) {
  const traits = gameState.traits ?? {};
  const prompt = [
    "你正在为《快乐小孩》Demo生成阶段性人格画像内容。",
    "只输出JSON对象，字段为 title、subtitle、summary、strength、risk、motif。",
    "画像不是好坏裁决，不是正式结局；优势与风险必须并存。",
    "motif需描述一个适合像素画的单一视觉意象，例如凿开的围墙、夜灯、火种或望向城市的人。",
    `七维人格：${JSON.stringify(traits)}`,
    `关键选择：${JSON.stringify(gameState.choiceHistory ?? [])}`,
  ].join("\n");
  const raw = await callLLM(prompt, "personality_portrait") as PortraitContent;
  const content: Required<PortraitContent> = {
    title: raw.title || "凿孔者",
    subtitle: raw.subtitle || "Demo阶段人格画像",
    summary: raw.summary || "你在规则的缝隙中寻找可以行动的道路，也开始认真看见他人的处境。",
    strength: raw.strength || "能在压力中保持观察，并把反抗转化为具体行动。",
    risk: raw.risk || "可能承担过多责任，或在追寻真相时忽略自身边界。",
    motif: raw.motif || "夜色中，一个像素人物凿开围墙，墙外亮着城市灯火。",
  };

  const traitEntries = Object.entries(traitLabels);
  const bars = traitEntries.map(([key, label], index) => {
    const value = Math.max(-100, Math.min(100, traits[key] ?? 0));
    const normalized = Math.max(8, Math.min(100, 50 + value / 2));
    const y = 590 + index * 38;
    return `
      <text x="650" y="${y}" class="label">${escapeXml(label)}</text>
      <rect x="810" y="${y - 20}" width="390" height="18" fill="#20283a"/>
      <rect x="810" y="${y - 20}" width="${Math.round(390 * normalized / 100)}" height="18" fill="${value >= 0 ? "#71d6ff" : "#ff7d78"}"/>
      <text x="1220" y="${y}" class="value">${value >= 0 ? "+" : ""}${value}</text>`;
  }).join("");

  const summaryLines = wrapText(content.summary, 25);
  const strengthLines = wrapText(`优势：${content.strength}`, 27);
  const riskLines = wrapText(`风险：${content.risk}`, 27);
  const textLines = [...summaryLines, ...strengthLines, ...riskLines]
    .map((line, index) => `<text x="650" y="${160 + index * 42}" class="${index < summaryLines.length ? "body" : "small"}">${escapeXml(line)}</text>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <defs>
      <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#080b18"/>
        <stop offset="1" stop-color="#18233c"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <style>
      text{font-family:"Microsoft YaHei","Noto Sans SC",sans-serif;fill:#f4f7ff}
      .title{font-size:64px;font-weight:800;letter-spacing:8px}
      .subtitle{font-size:25px;fill:#91a8cf}
      .body{font-size:29px}
      .small{font-size:24px;fill:#cbd6ea}
      .label{font-size:24px}
      .value{font-size:22px;fill:#ffe39a}
      .pixel{shape-rendering:crispEdges}
    </style>
    <rect width="1600" height="900" fill="url(#night)"/>
    <rect x="38" y="38" width="1524" height="824" fill="none" stroke="#d8b45b" stroke-width="6"/>
    <g class="pixel">
      <rect x="90" y="120" width="430" height="650" fill="#11182a"/>
      <rect x="120" y="610" width="370" height="120" fill="#30384c"/>
      <rect x="120" y="570" width="55" height="40" fill="#151b2b"/>
      <rect x="210" y="540" width="70" height="70" fill="#151b2b"/>
      <rect x="330" y="500" width="60" height="110" fill="#151b2b"/>
      <rect x="420" y="555" width="50" height="55" fill="#151b2b"/>
      <rect x="146" y="590" width="16" height="16" fill="#ffd76a" filter="url(#glow)"/>
      <rect x="238" y="566" width="18" height="18" fill="#8fe7ff" filter="url(#glow)"/>
      <rect x="351" y="528" width="18" height="18" fill="#ffd76a" filter="url(#glow)"/>
      <rect x="435" y="574" width="16" height="16" fill="#8fe7ff" filter="url(#glow)"/>
      <rect x="265" y="300" width="74" height="74" fill="#e9d7b8"/>
      <rect x="240" y="374" width="124" height="150" fill="#516a94"/>
      <rect x="210" y="400" width="30" height="95" fill="#516a94"/>
      <rect x="364" y="400" width="30" height="95" fill="#516a94"/>
      <rect x="250" y="524" width="38" height="72" fill="#27324d"/>
      <rect x="316" y="524" width="38" height="72" fill="#27324d"/>
      <rect x="98" y="128" width="414" height="634" fill="none" stroke="#5b6b8c" stroke-width="4"/>
      <rect x="470" y="235" width="42" height="210" fill="#11182a"/>
      <rect x="470" y="275" width="42" height="42" fill="#d8b45b"/>
      <rect x="470" y="360" width="42" height="42" fill="#d8b45b"/>
    </g>
    <text x="650" y="92" class="title">${escapeXml(content.title)}</text>
    <text x="654" y="128" class="subtitle">${escapeXml(content.subtitle)} · 观察仍将继续</text>
    ${textLines}
    ${bars}
    <text x="90" y="820" class="small">PIXEL MOTIF · ${escapeXml(content.motif)}</text>
  </svg>`;

  return {
    ...content,
    imageDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}
