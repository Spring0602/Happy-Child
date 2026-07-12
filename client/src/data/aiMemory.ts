import type { AiMemory, AiMemoryEntry, AiMemoryKey, Choice, GameState, Trait } from "../types/game";

export function createInitialAiMemory(): AiMemory {
  return {
    protagonistProfile: [],
    protagonistWorldview: [],
    npcImpressions: {},
    importantEvents: [],
  };
}

export const initialAiMemory: AiMemory = createInitialAiMemory();

const MAX_PROFILE_ITEMS = 18;
const MAX_WORLDVIEW_ITEMS = 18;
const MAX_NPC_ITEMS = 10;
const MAX_EVENT_ITEMS = 36;

const TRAIT_LABELS: Record<Trait, string> = {
  authorityResistance: "权威抵制",
  truthDesire: "真相欲",
  selfProtection: "自我保护",
  empathy: "共情",
  realityJudgment: "现实判断",
  trust: "关系信任",
  joyPerception: "快乐感知",
};

const NPC_MEMORY_KEYS: Record<string, AiMemoryKey> = {
  刘宇: "liuyu_impression",
  周骐瑞: "zhouqirui_impression",
  王沁林: "wang_teacher_impression",
  王老师: "wang_teacher_impression",
  美术老师: "wang_teacher_impression",
  周隽秀: "zhoujunxiu_impression",
  母亲: "mother_impression",
  妈妈: "mother_impression",
  父亲: "father_impression",
  爸爸: "father_impression",
  "我": "inner_self_impression",
};

const WORLDVIEW_TAG_HINTS = [
  "规则",
  "真相",
  "权威",
  "快乐",
  "现实",
  "共情",
  "自我",
  "边界",
  "反抗",
  "服从",
  "家庭",
  "关系",
  "信任",
  "求助",
];

const VALUE_SCENE_PATTERNS = [
  "规则",
  "违规提醒",
  "好孩子",
  "快乐",
  "痛苦",
  "父亲",
  "母亲",
  "刘宇",
  "周骐瑞",
  "王沁林",
  "王老师",
  "周隽秀",
  "信任",
  "合作",
  "交易",
  "边界",
  "权限",
  "许可",
  "真相",
  "自我",
  "绝望",
  "错位",
  "尊重",
  "家庭",
  "成绩",
  "精神",
];

const FORCED_MONITORED_SCENES: Record<string, { summary: string; tags: string[]; observers?: AiMemoryKey[] }> = {
  ch2_mother_checks_room: {
    summary: "母亲检查卧室，把控制式关心视为理所当然；主角继续维持孩子身份。",
    tags: ["家庭控制", "身份伪装", "母亲印象"],
    observers: ["mother_impression"],
  },
  ch2_breakfast_violation: {
    summary: "早餐规则触发违规提醒，主角意识到家庭日常同样会杀人。",
    tags: ["违规提醒", "家庭规则", "自我保护"],
    observers: ["mother_impression"],
  },
  ch2_thought_warning_resolved: {
    summary: "主角处理“必须感到快乐”的思想规则，暴露其对快乐、痛苦与自我规训的阶段性理解。",
    tags: ["快乐观", "思想规则", "主角认知"],
  },
  ch3_liuyu_check_state: {
    summary: "刘宇注意到主角异常并替他解围，主角开始利用旧关系掩盖身份错位。",
    tags: ["身份错位", "刘宇印象", "关系试探"],
    observers: ["liuyu_impression", "zhouqirui_impression"],
  },
  ch3_liuyu_help_commitment: {
    summary: "主角用家庭危险诱导刘宇承诺帮助，意识到自己正在利用刘宇的讲义气。",
    tags: ["求助", "利用关系", "刘宇印象"],
    observers: ["liuyu_impression"],
  },
  ch4_roster_test_liuyu: {
    summary: "主角用花名册试探刘宇，确认刘宇知道异常但受规则限制。",
    tags: ["规则试探", "信息边界", "刘宇印象"],
    observers: ["liuyu_impression"],
  },
  ch4_zhou_fixed_help: {
    summary: "周骐瑞替主角处理盒饭，主角通过求助而不是独自硬闯解决食物风险。",
    tags: ["求助", "规则漏洞", "周骐瑞印象"],
    observers: ["zhouqirui_impression"],
  },
  ch4_wang_dynamic_judgment: {
    summary: "王老师通过画作评价主角的真实与虚伪，引出“做你自己”的命题。",
    tags: ["自我", "真实", "王沁林印象"],
    observers: ["wang_teacher_impression"],
  },
  ch5_liuyu_dynamic_response: {
    summary: "主角与刘宇达成有限合作，双方承认互相防备但暂时共享利益。",
    tags: ["有限合作", "威胁", "信任边界"],
    observers: ["liuyu_impression"],
  },
  ch5_wang_trade_terms: {
    summary: "王沁林把主角的求助转化为等价交易，明确教师边界与筹码规则。",
    tags: ["交易", "教师边界", "王沁林印象"],
    observers: ["wang_teacher_impression"],
  },
  ch5_zhoujunxiu_dynamic_reply: {
    summary: "周隽秀在被帮助后有限信任主角，但仍保留三班与王沁林相关秘密。",
    tags: ["帮助", "信任", "周隽秀印象"],
    observers: ["zhoujunxiu_impression"],
  },
  ch6_zhoujunxiu_reaction: {
    summary: "三班围堵中周隽秀短暂迟疑，说明她对主角仍残留个人印象但无法对抗规则。",
    tags: ["规则压迫", "周隽秀印象", "人性裂缝"],
    observers: ["zhoujunxiu_impression"],
  },
  ch6_liuyu_route_note: {
    summary: "刘宇暗中给出逃生路线，把主角视为可赌一把的合作者。",
    tags: ["暗中援助", "合作", "刘宇印象"],
    observers: ["liuyu_impression"],
  },
  ch6_crying_student_response: {
    summary: "主角在逃生压力中面对崩溃男生，暴露其共情、自保和现实判断之间的取舍。",
    tags: ["共情", "自保", "现实判断"],
  },
  ch6_liuyu_root_rule_test: {
    summary: "刘宇试探主角说出教师伤害事实，主角意识到根本规则可能与事实叙述有关。",
    tags: ["根本规则", "语言边界", "刘宇印象"],
    observers: ["liuyu_impression", "zhouqirui_impression"],
  },
  ch7_mother_memory_response: {
    summary: "母亲不记得学校追杀，家庭区域维持普通叙事；主角意识到改变家庭需要控制尺度。",
    tags: ["家庭区域", "记忆遮蔽", "母亲印象"],
    observers: ["mother_impression"],
  },
  ch7_family_dynamic_response: {
    summary: "主角介入父母关于失业和家庭压力的对话，但意识到一次沟通无法改变家庭观念。",
    tags: ["家庭压力", "父母印象", "现实判断"],
    observers: ["father_impression", "mother_impression"],
  },
  ch8_inner_voice_dynamic_response: {
    summary: "“我”反推质问主角是否真的做得到，迫使主角从说理转向行动证明。",
    tags: ["自我质疑", "绝望", "行动证明"],
    observers: ["inner_self_impression"],
  },
  ch8_inner_voice_final_response: {
    summary: "天台上主角尊重“我”作为独立个体寻找答案，窒息感开始松动但问题未被彻底解决。",
    tags: ["尊重", "主体性", "快乐观", "错位"],
    observers: ["inner_self_impression"],
  },
  ch8_demo_personality_review: {
    summary: "系统生成Demo阶段人格回响，把此前选择、认知和关系印象汇总为阶段性画像。",
    tags: ["人格画像", "阶段总结", "AI回响"],
    observers: [
      "liuyu_impression",
      "zhouqirui_impression",
      "wang_teacher_impression",
      "zhoujunxiu_impression",
      "mother_impression",
      "father_impression",
      "inner_self_impression",
    ],
  },
};

function pushLimited(list: string[], item: string, max: number) {
  const next = [...list.filter((existing) => existing !== item), item];
  return next.slice(-max);
}

function normalizeText(text: string) {
  return text
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDominantTraits(choice: Choice) {
  return Object.entries(choice.effects)
    .filter((entry): entry is [Trait, number] => typeof entry[1] === "number" && entry[1] !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([trait, value]) => `${TRAIT_LABELS[trait]}${value > 0 ? "上升" : "下降"}`);
}

function inferObservers(sceneId: string, choice: Choice): AiMemoryKey[] {
  const source = `${sceneId} ${choice.id} ${choice.text} ${(choice.tags ?? []).join(" ")}`;
  const observers = new Set<AiMemoryKey>();

  for (const [name, key] of Object.entries(NPC_MEMORY_KEYS)) {
    if (source.includes(name)) observers.add(key);
  }

  if (/ch2|mother|breakfast|family|home|bedroom|livingroom|kitchen|bathroom/.test(source)) {
    observers.add("mother_impression");
  }
  if (/father|父亲|爸爸|失业|ch7_family/.test(source)) {
    observers.add("father_impression");
  }
  if (/liuyu|刘宇|班长|greenbelt|permission|route|ch3_|ch4_|ch5_|ch6_/.test(source)) {
    observers.add("liuyu_impression");
  }
  if (/zhouqirui|周骐瑞|盒饭|座位|作业|ch3_|ch4_|ch6_/.test(source)) {
    observers.add("zhouqirui_impression");
  }
  if (/wang|王沁林|王老师|美术|画|工作室|许可|交易/.test(source)) {
    observers.add("wang_teacher_impression");
  }
  if (/zhoujunxiu|周隽秀|三班|搬画|画廊|ch5_|ch6_class3/.test(source)) {
    observers.add("zhoujunxiu_impression");
  }
  if (/inner|self|door|天台|绝望|快乐|错位|ch8_/.test(source)) {
    observers.add("inner_self_impression");
  }

  return [...observers];
}

function choiceTouchesWorldview(choice: Choice) {
  const tags = choice.tags ?? [];
  return tags.some((tag) => WORLDVIEW_TAG_HINTS.some((hint) => tag.includes(hint)));
}

function buildChoiceSummary(sceneId: string, choice: Choice) {
  const tags = choice.tags?.length ? `标签：${choice.tags.join("、")}` : "无显式标签";
  const traits = getDominantTraits(choice);
  const traitText = traits.length ? `；画像变化：${traits.join("、")}` : "";
  return `在${sceneId}选择「${choice.text}」（${tags}${traitText}）。`;
}

function buildNpcImpression(choice: Choice) {
  const tags = choice.tags?.length ? choice.tags.join("、") : "未标注";
  const traits = getDominantTraits(choice).join("、") || "画像变化不明显";
  return `目睹主角选择「${choice.text}」，表现为${tags}；${traits}。`;
}

export function updateAiMemoryFromChoice(state: GameState, choice: Choice): AiMemory {
  const sceneId = state.currentSceneId || "unknown_scene";
  const previous = state.aiMemory ?? initialAiMemory;
  const observers = inferObservers(sceneId, choice);
  const summary = buildChoiceSummary(sceneId, choice);
  const tags = choice.tags ?? [];

  const next: AiMemory = {
    protagonistProfile: pushLimited(previous.protagonistProfile ?? [], summary, MAX_PROFILE_ITEMS),
    protagonistWorldview: previous.protagonistWorldview ?? [],
    npcImpressions: { ...(previous.npcImpressions ?? {}) },
    importantEvents: previous.importantEvents ?? [],
  };

  if (choiceTouchesWorldview(choice)) {
    next.protagonistWorldview = pushLimited(
      next.protagonistWorldview,
      `主角在${sceneId}围绕「${tags.join("、") || choice.text}」形成或暴露了阶段性理解。`,
      MAX_WORLDVIEW_ITEMS
    );
  }

  const npcSummary = buildNpcImpression(choice);
  for (const observer of observers) {
    const current = next.npcImpressions[observer] ?? [];
    next.npcImpressions[observer] = pushLimited(current, npcSummary, MAX_NPC_ITEMS);
  }

  if (tags.length > 0 || observers.length > 0 || Object.keys(choice.effects).length > 0) {
    const entryId = `${sceneId}:${choice.id}:${state.choiceHistory.length}`;
    next.importantEvents = [
      ...next.importantEvents.filter((event) => event.id !== entryId),
      {
        id: entryId,
        sceneId,
        choiceId: choice.id,
        summary,
        tags,
        observers,
      },
    ].slice(-MAX_EVENT_ITEMS);
  }

  return next;
}

export function createAiMemorySceneEntry(sceneId: string, text: string): AiMemoryEntry | null {
  const forced = FORCED_MONITORED_SCENES[sceneId];
  if (forced) {
    return {
      id: `${sceneId}:scene_monitor`,
      sceneId,
      summary: forced.summary,
      tags: forced.tags,
      observers: forced.observers ?? inferMonitorKeysForScene(sceneId).filter(
        (key) => key !== "protagonist_profile" && key !== "protagonist_worldview"
      ),
    };
  }

  if (!sceneId || !text) return null;
  const normalized = normalizeText(text);
  const matchedTags = VALUE_SCENE_PATTERNS.filter((pattern) => normalized.includes(pattern)).slice(0, 6);
  if (matchedTags.length < 2) return null;
  if (normalized.length < 40) return null;

  return {
    id: `${sceneId}:scene_monitor`,
    sceneId,
    summary: `剧情「${sceneId}」呈现了${matchedTags.join("、")}相关的关键认知或关系信息。`,
    tags: matchedTags,
    observers: inferMonitorKeysForScene(sceneId).filter(
      (key) => key !== "protagonist_profile" && key !== "protagonist_worldview"
    ),
  };
}

export function updateAiMemoryFromSceneEntry(memory: AiMemory | undefined, entry: AiMemoryEntry): AiMemory {
  const previous = memory ?? initialAiMemory;
  if ((previous.importantEvents ?? []).some((event) => event.id === entry.id)) return previous;

  const next: AiMemory = {
    protagonistProfile: previous.protagonistProfile ?? [],
    protagonistWorldview: previous.protagonistWorldview ?? [],
    npcImpressions: { ...(previous.npcImpressions ?? {}) },
    importantEvents: previous.importantEvents ?? [],
  };

  const worldviewSummary = `${entry.summary}（${entry.tags.join("、") || "剧情监视"}）`;
  next.protagonistWorldview = pushLimited(next.protagonistWorldview, worldviewSummary, MAX_WORLDVIEW_ITEMS);

  for (const observer of entry.observers) {
    const current = next.npcImpressions[observer] ?? [];
    next.npcImpressions[observer] = pushLimited(current, entry.summary, MAX_NPC_ITEMS);
  }

  next.importantEvents = [
    ...next.importantEvents,
    entry,
  ].slice(-MAX_EVENT_ITEMS);

  return next;
}

export function inferMonitorKeysForScene(sceneId: string): AiMemoryKey[] {
  const keys = new Set<AiMemoryKey>(["protagonist_profile", "protagonist_worldview"]);

  if (/liuyu|刘宇|route|permission|greenbelt|food|roster|homework|exam|ch3_|ch4_|ch5_|ch6_/.test(sceneId)) {
    keys.add("liuyu_impression");
  }
  if (/zhou|qirui|周骐瑞|lunch|seat|homework|ch3_|ch4_|ch6_/.test(sceneId)) {
    keys.add("zhouqirui_impression");
  }
  if (/wang|teacher|painting|trade|permission|gallery|王|美术/.test(sceneId)) {
    keys.add("wang_teacher_impression");
  }
  if (/zhoujunxiu|class3|gallery|help|reaction|周隽秀/.test(sceneId)) {
    keys.add("zhoujunxiu_impression");
  }
  if (/mother|family|home|ch2_|ch7_/.test(sceneId)) {
    keys.add("mother_impression");
  }
  if (/father|family|ch7_/.test(sceneId)) {
    keys.add("father_impression");
  }
  if (/inner|voice|self|demo|ch8_/.test(sceneId)) {
    keys.add("inner_self_impression");
  }

  return [...keys];
}

export function buildAiMemoryContext(memory: AiMemory | undefined, requestedKeys: AiMemoryKey[]) {
  const current = memory ?? initialAiMemory;
  const lines = ["【AI长期记忆摘要】"];

  if (requestedKeys.includes("protagonist_profile")) {
    lines.push(`玩家画像轨迹：${(current.protagonistProfile ?? []).slice(-8).join(" / ") || "暂无重要选择记录。"}`);
  }
  if (requestedKeys.includes("protagonist_worldview")) {
    lines.push(`主角认知档案：${(current.protagonistWorldview ?? []).slice(-8).join(" / ") || "暂无阶段性认知记录。"}`);
  }

  const npcLabels: Record<AiMemoryKey, string> = {
    protagonist_profile: "玩家画像",
    protagonist_worldview: "主角认知",
    liuyu_impression: "刘宇对主角的动态印象",
    zhouqirui_impression: "周骐瑞对主角的动态印象",
    wang_teacher_impression: "王沁林对主角的动态印象",
    zhoujunxiu_impression: "周隽秀对主角的动态印象",
    mother_impression: "母亲对主角的动态印象",
    father_impression: "父亲对主角的动态印象",
    inner_self_impression: "“我”对主角的动态印象",
  };

  for (const key of requestedKeys) {
    if (key === "protagonist_profile" || key === "protagonist_worldview") continue;
    const items = current.npcImpressions?.[key] ?? [];
    lines.push(`${npcLabels[key]}：${items.slice(-6).join(" / ") || "暂无明确印象，按当前场景事实谨慎生成。"}`);
  }

  const events = current.importantEvents ?? [];
  lines.push(`近期重要事件：${events.slice(-10).map((event) => event.summary).join(" / ") || "暂无。"}`);
  lines.push("使用要求：这些记忆只用于调整语气、信任程度、称呼、试探强度和旁白侧重点；不得覆盖本场景固定事实、必说台词、死亡/通关/许可/线索等主线结果。");

  return lines.join("\n");
}
