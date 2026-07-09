export interface AiSceneConfig {
  mode: "dialogue" | "fragment";
  prompt?: string;
  requiredLines?: string[];
  fallback: string;
}

const embeddedPromptScenes = [
  "ch4_roster_test_liuyu",
  "ch4_zhou_fixed_help",
  "ch4_zhou_dynamic_response",
  "ch4_wang_dynamic_judgment",
  "ch4_liuyu_food_response",
  "ch5_liuyu_dynamic_response",
  "ch5_liuyu_permission_reaction",
  "ch5_zhoujunxiu_help_response",
  "ch5_wang_trade_terms",
  "ch5_zhoujunxiu_dynamic_reply",
] as const;

const embeddedFallbacks: Record<(typeof embeddedPromptScenes)[number], string> = {
  ch4_roster_test_liuyu: "[旁白]刘宇扫了一眼花名册，笑意淡了半分。\n\n[NPC:刘宇]有些东西看不清，就别在教室里硬看。\n\n[主角]（他知道异常，却不能在这里说明。）",
  ch4_zhou_fixed_help: "[NPC:周骐瑞]给我吧。\n\n[旁白]他接过盒饭，没有继续解释，只低头吃了起来。\n\n[NPC:周骐瑞]别把这当成哪里都能用的办法。",
  ch4_zhou_dynamic_response: "[NPC:周骐瑞]大部分副本里的食物都有问题。你的盒饭，别人吃反而安全。\n\n[NPC:周骐瑞]晚餐还有别的处理方法。去问刘宇。\n\n[旁白]他没有再透露周六活动的内容。",
  ch4_wang_dynamic_judgment: "[NPC:美术老师]技巧不是最重要的。画面里至少应该有你自己。\n\n[主角说]什么意思？\n\n[NPC:美术老师]没关系，这不重要。我很欣赏你的画。\n\n[旁白]他仍没有替我定义所谓的真实。",
  ch4_liuyu_food_response: "[NPC:刘宇]厕所能处理盒饭，但普通学生在走廊上必须结伴。\n\n[NPC:刘宇]动作快点，我只负责把你带到那里。\n\n[主角]（他愿意帮忙，却仍在保留边界。）",
  ch5_liuyu_dynamic_response: "[NPC:刘宇]如果这么做能让你安心的话，就先这样吧。\n\n[主角说]合作期间，如果你的行为威胁到我的生命，我会立刻反击。\n\n[NPC:刘宇]我还是很惜命的。\n\n[旁白]有限合作就此成立。",
  ch5_liuyu_permission_reaction: "[NPC:刘宇]方向没错，但别把推测当成完整规则。\n\n[NPC:刘宇]我的许可不能借给你。你得自己去找王沁林。\n\n[主角]（看来只能独自取得进入工作室的许可。）",
  ch5_zhoujunxiu_help_response: "[NPC:周隽秀]不用，谢谢你，我自己可以……\n\n[主角说]别逞强，我只帮你把画搬过去。\n\n[旁白]她迟疑片刻，最终没有再拒绝。",
  ch5_wang_trade_terms: "[主角说]可以告诉我您想要的筹码是什么吗？\n\n[NPC:王沁林]求助不是索取。想得到答案，就拿等价的东西来换。\n\n[NPC:王沁林]镜中尸骸，湖中遗物，书中落叶。\n\n[旁白]他没有解释谜底。",
  ch5_zhoujunxiu_dynamic_reply: "[NPC:周隽秀]也不是很熟……只是，像他这么有人格魅力的人，很难不让人信任吧？\n\n[旁白]她仍有所保留，却允许我把画搬进三班。\n\n[主角]（至少这次进入许可已经成立。）",
};

export const aiSceneConfigs: Record<string, AiSceneConfig> = Object.fromEntries(
  embeddedPromptScenes.map((sceneId) => [
    sceneId,
    { mode: "fragment", fallback: embeddedFallbacks[sceneId] },
  ])
);

aiSceneConfigs.ch5_liuyu_dynamic_response.requiredLines = [
  "[NPC:刘宇]如果这么做能让你安心的话，就先这样吧。",
  "[NPC:刘宇]我还是很惜命的。",
];
aiSceneConfigs.ch5_zhoujunxiu_help_response.requiredLines = [
  "[NPC:周隽秀]不用，谢谢你，我自己可以……",
];
aiSceneConfigs.ch5_wang_trade_terms.requiredLines = [
  "[NPC:王沁林]镜中尸骸，湖中遗物，书中落叶。",
];

Object.assign(aiSceneConfigs, {
  ch6_zhoujunxiu_reaction: {
    mode: "dialogue",
    prompt: "3班学生因规则围堵主角。周隽秀记得主角帮助搬画，短暂迟疑并试图替主角解释，但她也受规则影响，最终无法公开保护主角。生成3～6行。不得让她解除围堵或改变门被锁住的结果。",
    fallback: "[旁白]周隽秀张了张嘴，像是想替我解释，声音却被压成含混的气音。\n\n[NPC:周隽秀]他只是……\n\n[旁白]迟疑让人群慢了半拍，但她的眼神很快再次变得陌生。",
  },
  ch6_liuyu_route_note: {
    mode: "dialogue",
    prompt: "晚自习走廊，刘宇押送主角去教师办公室并暗中交付逃生路线。必须说明：办公室门无法从内部打开；通风管通往一楼厕所；水果刀拧不了螺丝，应破坏老化角；周测前必须回来。根据双方信任调整批注细节。生成4～7行。禁止解释押送原因和学校根本规则。",
    requiredLines: [
      "[NPC:刘宇]教师办公室的门从里面打不开。",
      "[NPC:刘宇]通风管道通往一楼厕所。",
    ],
    fallback: "[NPC:刘宇]按纸上的路线跑。办公室的门从里面打不开。\n\n[NPC:刘宇]通风管通往一楼厕所。水果刀拧不了螺丝，砸老化的角。\n\n[NPC:刘宇]周测开始前必须回来。这次算提前通知你了。",
  },
  ch6_crying_student_response: {
    mode: "fragment",
    prompt: "一楼厕所，崩溃男生不愿说明原因，主角腿部受伤且必须赶回周测。生成4～8行。必说：[NPC:男生]你、你别告诉老师。以及[NPC:男生]可我真的不想回去。男生看不见规则伤口，最终自行离开，不提供线索。根据共情、现实判断和自保调整主角回应。",
    requiredLines: [
      "[NPC:男生]你、你别告诉老师。",
      "[NPC:男生]可我真的不想回去。",
    ],
    fallback: "[NPC:男生]你、你别告诉老师。\n\n[NPC:男生]可我真的不想回去。\n\n[主角说]先洗把脸，别让其他人看出异常。我也必须走了。\n\n[旁白]男生低声道谢，随后自行离开。",
  },
  ch6_liuyu_root_rule_test: {
    mode: "fragment",
    prompt: "放学校门附近，刘宇诱导主角说出自己迟到违规并被老师抓伤的事实。生成4～8行。必说：[NPC:刘宇]怎么突然不说话了？以及[主角说]我在办公室的时候，被老师……。主角必须说到一半察觉异常并住口；周骐瑞和周围学生轻微异样；结尾意识到问题可能在造成伤口的事实。禁止说出根本规则，禁止完整说出老师变怪物抓伤自己。",
    requiredLines: [
      "[NPC:刘宇]怎么突然不说话了？",
      "[主角说]我在办公室的时候，被老师……",
    ],
    fallback: "[NPC:刘宇]怎么突然不说话了？\n\n[NPC:刘宇]那你觉得老师能把你怎么样？\n\n[主角说]我在办公室的时候，被老师……\n\n[旁白]周围脚步忽然慢下，我猛地住口。问题也许不在伤口，而在造成伤口的事实。",
  },
  ch8_inner_voice_dynamic_response: {
    mode: "fragment",
    prompt: "深夜卧室，违规提醒持续造成窒息。根据玩家刚才对“我”的回应生成5～8行。“我”不相信语言能改变现实，必须反推质问主角本人。必说：[NPC:“我”]你说得头头是道，但你自己做得到吗？你有什么资格指责我？主角最终放弃争论，决定用一次实际行动证明改变。禁止让“我”立即认同，禁止停止警报或跳过天台。",
    requiredLines: [
      "[NPC:“我”]你说得头头是道，但你自己做得到吗？你有什么资格指责我？",
    ],
    fallback: "[NPC:“我”]你说得头头是道，但你自己做得到吗？你有什么资格指责我？\n\n[旁白]窒息感仍在持续。\n\n[主角]（继续争论没有意义。他只会相信真正发生的行动。）\n\n[主角]（那就先做一件小事给他看。）",
  },
  ch8_inner_voice_final_response: {
    mode: "fragment",
    prompt: "凌晨天台，主角没有粗暴塞给“我”标准答案，而是允许它自己寻找。生成6～10行，包含“我”的内心感受，使用旁白角度。若谈到“错位”，明确它指物质供给与精神需求错位：中国物质较丰富但精神支持、意义感仍匮乏；这只是主角当前答案。必须表现“我”第一次被当成独立个体尊重，窒息感减弱但困境未解决，并自然引出它询问主角为何这样做。禁止正式结局或提前停止警报。",
    fallback: "[旁白]“我”第一次意识到，自己不是等待矫正的失败品，而是被允许寻找答案的独立个体。\n\n[旁白]即使“错位”指向物质供给与精神需求之间的裂缝，那也只是主角目前的答案。\n\n[旁白]窒息感有所松动，问题却没有消失。\n\n[NPC:“我”]为什么？这对你有什么好处？",
  },
} satisfies Record<string, AiSceneConfig>);
