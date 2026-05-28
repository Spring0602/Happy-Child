import type { Scene } from "../types/game";

// ══════════════════════════════════════════════════════════════
// scenes.ts · 第1-8章完整场景树
//
// 场景ID命名规则：ch{n}_{event}
// 章节分布：
//   ch1: 序章·前兆（收到邮件、准备物资、进入候场区）
//   ch2: 副本开启（技能抽取、家庭规则）
//   ch3: 学校初入（刘宇登场、空座位、回家窒息）
//   ch4: 规则发现（美术课王老师、午饭约定）
//   ch5: 合作与交易（刘宇谈判、王老师谜题、进入3班）
//   ch6: 追杀与逃生（3班暴露、全校追杀、技能激活）
//   ch7: 坏孩子诞生（删除规则、父亲失业、试胆组队）
//   ch8: 天台和解（镜中真相、 rooftop对话、结局裁决）
// ══════════════════════════════════════════════════════════════

export const scenes: Record<string, Scene> = {

  // ══════════════════════════════════════════════
  // 第1章 · 序章 · 前兆
  // ══════════════════════════════════════════════

  start: {
    id: "start",
    chapter: "序章",
    background: "/assets/bg/dorm_rain.svg",
    speaker: "叶平生",
    text: "终于解决完所有的bug了。\n\n光标停留在5154行，一股满足感涌上心头。我合上电脑，走到阳台，深吸一口气。\n\n外面正下着雨，无风，直直垂下。凌晨四点四十六分。\n\n我本以为这只是普通的一夜。",
    nextSceneId: "ch1_email",
  },

  ch1_email: {
    id: "ch1_email",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "系统邮件",
    text: "亲爱的预备参赛者：\n\n由于系统检测到您在'人类'智慧群体中资质出众，您将成为第一批进入'人类进化计划'筛选的参赛者。\n\n【赛前准备】\n1. 按需准备15日的能量摄入来源\n2. 依据个人身体素质准备强度不一的防身武器\n3. 尽量保持稳定的磁场紊乱状态\n\n初赛：无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。\n\n严禁将比赛信息泄露给无关人员。",
    choices: [
      {
        id: "ch1_prepare_full",
        text: "冷静分析邮件，准备充足物资，主动接触其他参赛者",
        nextSceneId: "ch1_store",
        effects: {
          truthDesire: 1,
          selfProtection: 2,
          trust: 1,
        },
        tags: ["理性", "主动", "合作倾向"],
        needAIAnalysis: true,
      },
      {
        id: "ch1_prepare_supplies",
        text: "只准备物资，不接触任何人",
        nextSceneId: "ch1_store",
        effects: {
          selfProtection: 3,
          truthDesire: -1,
          trust: -1,
        },
        tags: ["保守", "独行"],
        needAIAnalysis: true,
      },
      {
        id: "ch1_ignore_email",
        text: "觉得是恶作剧，先不理会",
        nextSceneId: "ch1_store",
        effects: {
          realityJudgment: -2,
          selfProtection: -1,
          truthDesire: -2,
        },
        tags: ["轻视", "逃避"],
        needAIAnalysis: true,
      },
    ],
  },

  ch1_store: {
    id: "ch1_store",
    chapter: "序章",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "旁白",
    text: "23:32。\n\n厨房用品店里排着4个人——1女3男，这个时间出现在这里，他们大概率和我一样。\n\n我拿了一盒水果刀排在队伍末尾。\n\n队伍前面的女生回头看了我一眼。",
    choices: [
      {
        id: "ch1_contact_liuyu",
        text: "用手机向她确认「规则是什么」，试探对方是否参赛者",
        nextSceneId: "ch1_store_deal",
        effects: {
          truthDesire: 2,
          trust: 1,
          selfProtection: 1,
        },
        tags: ["试探", "合作"],
        needAIAnalysis: true,
      },
      {
        id: "ch1_ignore_others",
        text: "不主动接触任何人，专注买完就走",
        nextSceneId: "ch1_enter_countdown",
        effects: {
          selfProtection: 2,
          trust: -1,
        },
        tags: ["独行", "谨慎"],
        needAIAnalysis: true,
      },
    ],
  },

  ch1_store_deal: {
    id: "ch1_store_deal",
    chapter: "序章",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "林芷萱",
    text: "她看到我的问题后，脸上纯良的表情逐渐变得狠戾。\n\n【我们的规则是什么？】\n\n「没有具体规则。」\n\n她顿了顿，反问：【你怎么理解第三条提示？】\n\n需要我先展示诚意。",
    choices: [
      {
        id: "ch1_share_analysis",
        text: "坦诚分享自己对「磁场」的理解，展示合作诚意",
        nextSceneId: "ch1_enter_countdown",
        effects: {
          trust: 2,
          truthDesire: 1,
          selfProtection: -1,
        },
        tags: ["坦诚", "合作"],
        needAIAnalysis: true,
      },
      {
        id: "ch1_stay_secret",
        text: "只交换必要信息，不暴露自己的判断",
        nextSceneId: "ch1_enter_countdown",
        effects: {
          selfProtection: 2,
          trust: 0,
          realityJudgment: 1,
        },
        tags: ["保留", "谨慎"],
        needAIAnalysis: true,
      },
    ],
  },

  ch1_enter_countdown: {
    id: "ch1_enter_countdown",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "23:55。\n\n我火急火燎地收拾行囊。室友说我是「真·高速小马达」。\n\n00:00。\n\n我眼前一黑——\n\n下一瞬，置身于一片星海。四周星辰点点，而我漂浮于宇宙中，并无失重感。\n\n「欢迎参赛者来到'人类进化计划'候场区~」",
    nextSceneId: "ch2_skill_extract",
  },

  // ══════════════════════════════════════════════
  // 第2章 · 副本开启 · 技能抽取
  // ══════════════════════════════════════════════

  ch2_skill_extract: {
    id: "ch2_skill_extract",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/dorm_rain.svg",
    speaker: "系统",
    text: "「初赛开始之前，参赛者需进行技能抽取……」\n\n脚下金光升起，将我整个人包裹。\n\n「根据您的特质，系统为您生成了最适合您的技能——权威抵制。」\n\n「恭喜您获得隐藏身份——规则破坏者。」\n\n「副本一已启动。」",
    nextSceneId: "ch2_family_room",
  },

  ch2_family_room: {
    id: "ch2_family_room",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "旁白",
    text: "副本一：快乐小孩\n\n性质：单人角色扮演类副本\n内容：你是个讨人喜欢的快乐小孩，不断超越自己，追求卓越，是你一生的追求。\n\n通关要求：在副本内存活一周或达成任一成就。\n成就达成条件：洞察真相，证明你的快乐。\n\n我睁开眼，这是一间严谨呆板的房间。书架上放满教辅，书桌上还有高中数学试卷。\n\n我带来的行囊随意摆放在地上，在整齐的房间内格格不入。",
    nextSceneId: "ch2_plan_book",
  },

  ch2_plan_book: {
    id: "ch2_plan_book",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "桌上一本封面温馨的笔记本，和整个房间格格不入。\n\n扉页写着：\n\n「考上c9。30岁结婚生子。35岁实现财富自由。」\n\n「作为好孩子，我要关爱亲人，成为爸妈的骄傲。我要得到老师同学的青睐，我要帮助他人。我要变得更强……」\n\n计划表最下方有一行红笔批注：\n\n「我真的好累。我一点也不快乐。」",
    returnToMap: true,
    mapId: "bedroom",
    choices: [
      {
        id: "ch2_read_plan",
        text: "仔细阅读计划本，寻找规则信息",
        nextSceneId: "ch2_home_rules",
        effects: {
          truthDesire: 2,
          realityJudgment: 1,
        },
        tags: ["探索", "真相"],
        needAIAnalysis: true,
      },
      {
        id: "ch2_hide_bag",
        text: "先把行囊藏好，避免暴露参赛者身份",
        nextSceneId: "ch2_home_rules",
        effects: {
          selfProtection: 2,
          truthDesire: -1,
        },
        tags: ["谨慎", "自保"],
        needAIAnalysis: true,
      },
    ],
  },

  ch2_father_meet: {
    id: "ch2_father_meet",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "父亲",
    character: "father",
    text: "父亲坐在沙发上，电视没开，手里攥着一份文件。\n\n他的嘴唇动了动，但什么也没说。\n\n「爸爸，你怎么了？」\n\n他抬起头，挤出一个笑脸——那张笑脸和计划本上说的一模一样。\n\n「没事，平生。爸爸只是……在想一些工作上的事。」",
    choices: [
      {
        id: "ch2_father_ask",
        text: "追问父亲的情况，尝试了解更多",
        nextSceneId: "ch2_home_rules",
        effects: {
          empathy: 1,
          truthDesire: 1,
        },
        tags: ["关心", "探索"],
        needAIAnalysis: true,
      },
      {
        id: "ch2_father_leave",
        text: "假装没注意到，让他保留自己的空间",
        nextSceneId: "ch2_home_rules",
        effects: {
          selfProtection: 1,
          empathy: -1,
        },
        tags: ["尊重", "回避"],
        needAIAnalysis: true,
      },
    ],
  },

  ch2_home_rules: {
    id: "ch2_home_rules",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "规则",
    text: "我们是幸福快乐的一家。\n\n我是美好社会中遵纪守法的好公民。\n\n我的房间井井有条。我从来不迟到。我的作业不会迟交。\n\n「技能'违规提醒'正在运转中。」",
    nextSceneId: "ch3_school_entrance",
  },

  // ══════════════════════════════════════════════
  // 第3章 · 学校初入 · 刘宇登场
  // ══════════════════════════════════════════════

  ch3_school_entrance: {
    id: "ch3_school_entrance",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "教室里分成两个阵营。\n\n一部分学生安静学习，另一部分学生嬉笑打闹。我看见了刘宇——班长，也看见了周骐瑞。\n\n教室最后排有一张空座位。其他学生仿佛完全没有注意到它。",
    choices: [
      {
        id: "ch3_observe_desk",
        text: "悄悄观察那张空座位，看有没有人能注意到它",
        nextSceneId: "ch3_liuyu_approach",
        effects: {
          truthDesire: 2,
          selfProtection: 1,
        },
        tags: ["探索", "谨慎"],
        needAIAnalysis: true,
      },
      {
        id: "ch3_approach_liuyu",
        text: "主动和刘宇搭话",
        nextSceneId: "ch3_liuyu_approach",
        effects: {
          trust: 2,
          empathy: 1,
        },
        tags: ["主动", "合作"],
        needAIAnalysis: true,
      },
    ],
  },

  ch3_liuyu_approach: {
    id: "ch3_liuyu_approach",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "刘宇",
    character: "liuyu",
    text: "「有事一定要联系我，不准一个人硬撑。」\n\n他笑着说，语气轻松得像是一切都没有发生。\n\n但他的眼神告诉我——他知道我是谁。",
    returnToMap: true,
    mapId: "classroom",
    choices: [
      {
        id: "ch3_trust_liuyu_full",
        text: "告诉刘宇我需要帮助，但不透露核心信息",
        nextSceneId: "ch3_liuyu_trust_response",
        effects: {
          trust: 2,
          selfProtection: 1,
          realityJudgment: 1,
        },
        npcTrustEffects: { liuyu: 2 },
        tags: ["信任", "谨慎合作"],
        needAIAnalysis: true,
      },
      {
        id: "ch3_reject_liuyu",
        text: "拒绝刘宇的帮助，独自行动",
        nextSceneId: "ch3_liuyu_reject_response",
        effects: {
          trust: -2,
          authorityResistance: 1,
          selfProtection: 1,
        },
        npcTrustEffects: { liuyu: -2 },
        tags: ["独立", "怀疑"],
        needAIAnalysis: true,
      },
    ],
  },

  ch3_liuyu_trust_response: {
    id: "ch3_liuyu_trust_response",
    chapter: "学校区域",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "旁白",
    text: "刘宇看着我，收起了玩笑的表情。\n\n「你比我想象的……要冷静。」\n\n他没有追问更多。但从那一刻起，我知道——在这个副本里，我不是一个人。",
    nextSceneId: "ch3_mother_appearance",
  },

  ch3_liuyu_reject_response: {
    id: "ch3_liuyu_reject_response",
    chapter: "学校区域",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "刘宇",
    character: "liuyu",
    text: "「行吧。」\n\n他耸了耸肩，转身离开。\n\n我看着他的背影，心里清楚——如果我想在这里活下去，我迟早需要盟友。\n\n但不是现在。",
    nextSceneId: "ch3_mother_appearance",
  },

  ch3_mother_appearance: {
    id: "ch3_mother_appearance",
    chapter: "学校区域",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "旁白",
    text: "我走到校门口，看见母亲靠在车门上等我。\n\n刘宇走之前回头看了我一眼：「有事记得找我。」\n\n我钻进母亲的车里。\n\n一路我笑着和她攀谈，试图营造轻松的气氛。但我知道——这个副本里，没有人是真的。",
    nextSceneId: "ch3_suffocation_night",
  },

  ch3_suffocation_night: {
    id: "ch3_suffocation_night",
    chapter: "家庭区域",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "叶平生",
    text: "晚上。\n\n计划表上出现了一行红笔批注：\n\n「我真的好累。我一点也不快乐。讨好别人一点也不快乐，学习一点也不快乐，和爸妈待在一起一点也不快乐。」\n\n「技能'违规提醒'强烈发动中！」\n\n一只无形的打手扼住了我的咽喉，力道在逐渐收紧。",
    nextSceneId: "ch3_suffocation_choice",
  },

  ch3_suffocation_choice: {
    id: "ch3_suffocation_choice",
    chapter: "家庭区域",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "窒息感越来越强。我必须找到让「我」快乐的理由——否则我就要死在这里。\n\n「想想你的同学。」\n\n「刘宇不是很快就察觉到你的异常了吗？」\n\n「周骐瑞找作业的样子，你是真心觉得有趣。」\n\n脑内的声音沉默了。脖子上的力量骤然消失。\n\n「你说服我了。但是，明天就不一定了。」",
    nextSceneId: "ch4_classroom_rules",
  },

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现 · 美术课王老师
  // ══════════════════════════════════════════════

  ch4_classroom_rules: {
    id: "ch4_classroom_rules",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "第二天。\n\n我调查抽屉，发现了一张猩红字迹的规则纸。\n\n「1. 严格遵照课程表上课，禁止交头接耳，禁止离开座位，禁止进食。」\n「8. 学生要听老师的话，禁止忤逆老师。」\n\n另外还有一张试胆活动宣传手册——本周六19:00。",
    returnToMap: true,
    mapId: "classroom",
    nextSceneId: "ch4_art_class",
  },

  ch4_art_class: {
    id: "ch4_art_class",
    chapter: "美术课 / 王老师",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text: "一位将近70岁的老人步伐稳健地走进教室，一双澄澈如水的眼眸锐利地扫过每个人的脸庞。\n\n「在我的课上没有竞争，你们只要成为你们自己就好。」\n\n我唰唰几笔，画了一幅极其抽象的画——四分五裂的傀儡被囚于四分五裂的监牢，监牢外是一套崭新的桌椅，周围萦绕着花瓣和蝴蝶。",
    returnToMap: true,
    mapId: "wang_gallery",
    choices: [
      {
        id: "ch4_paint_abstract",
        text: "举起画作，展示给王老师",
        nextSceneId: "ch4_wang_judge",
        effects: {
          authorityResistance: 1,
          truthDesire: 1,
          joyPerception: 1,
        },
        npcTrustEffects: { wangTeacher: 1 },
        tags: ["展示", "真实"],
        needAIAnalysis: true,
      },
      {
        id: "ch4_paint_conform",
        text: "画一幅符合「好孩子」标准的画，取悦老师",
        nextSceneId: "ch4_wang_judge",
        effects: {
          selfProtection: 2,
          authorityResistance: -1,
          truthDesire: -1,
        },
        npcTrustEffects: { wangTeacher: 1 },
        tags: ["顺从", "安全"],
        needAIAnalysis: true,
      },
    ],
  },

  ch4_wang_judge: {
    id: "ch4_wang_judge",
    chapter: "美术课 / 王老师",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text: "王老师拿起我的画，沉默了很久。\n\n「这幅画和现在的你一样虚伪。」\n\n「这不是你真心画出来的画，这不是你心灵的投射。」\n\n他的眼睛仿佛能看穿所有伪装。\n\n「你对待世界的虚伪终会让你最后得到一个虚假的答案。」",
    choices: [
      {
        id: "ch4_ask_direct",
        text: "直接追问副本真相",
        nextSceneId: "ch4_wang_hint",
        effects: {
          truthDesire: 2,
          authorityResistance: 1,
          selfProtection: -1,
        },
        npcTrustEffects: { wangTeacher: 1 },
        tags: ["追问", "冒险"],
        needAIAnalysis: true,
      },
      {
        id: "ch4_accept_trade",
        text: "接受等价交换，询问「镜中尸骸、湖中遗物、书中落叶」",
        nextSceneId: "ch4_wang_hint",
        effects: {
          realityJudgment: 2,
          truthDesire: 1,
          selfProtection: 1,
        },
        npcTrustEffects: { wangTeacher: 2 },
        tags: ["交换", "理性"],
        needAIAnalysis: true,
      },
    ],
  },

  ch4_wang_hint: {
    id: "ch4_wang_hint",
    chapter: "美术课 / 王老师",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text: "「等价交换。」\n\n一股骇人的压力压在我的头顶。\n\n「镜中尸骸，湖中遗物，书中落叶。」\n\n王老师的影子在我眼中逐渐扭曲，像是要变成什么别的东西。\n\n「这是你要找的东西。去找到它们。」",
    nextSceneId: "ch4_lunch",
  },

  ch4_lunch: {
    id: "ch4_lunch",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "周骐瑞",
    character: "zhouJunxiu",
    text: "午饭时间。\n\n规则上说必须吃校内的午餐。但我注意到——周骐瑞和周隽秀都没有动筷子。\n\n「不吃午饭是因为这里的食物会让人失去自我意识吗？」\n\n周骐瑞看了我一眼：「是。」\n\n「那你们打算怎么办？」\n\n「倒掉。」",
    choices: [
      {
        id: "ch4_lunch_join",
        text: "跟着周骐瑞去厕所倒饭，加入他们",
        nextSceneId: "ch5_liuyu_negotiate",
        effects: {
          trust: 2,
          selfProtection: 1,
          empathy: 1,
        },
        npcTrustEffects: { zhouJunxiu: 2, zhouQirui: 1 },
        tags: ["合作", "信任"],
        needAIAnalysis: true,
      },
      {
        id: "ch4_lunch_refuse",
        text: "假装吃饭，暗中观察情况",
        nextSceneId: "ch5_liuyu_negotiate",
        effects: {
          selfProtection: 2,
          trust: -1,
          realityJudgment: 1,
        },
        npcTrustEffects: { zhouJunxiu: -1 },
        tags: ["观望", "自保"],
        needAIAnalysis: true,
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 第5章 · 合作与交易 · 进入3班
  // ══════════════════════════════════════════════

  ch5_liuyu_negotiate: {
    id: "ch5_liuyu_negotiate",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "刘宇",
    character: "liuyu",
    text: "「我觉得我们早就已经合作了，不是吗？」\n\n他笑着说。但我注意到——他早就知道我是谁，也早就知道我需要什么。\n\n「合作归合作。但你我之间，信任是另一回事。」",
    choices: [
      {
        id: "ch5_negotiate_sincere",
        text: "正式与刘宇谈判：交换信息，划定边界，共同调查",
        nextSceneId: "ch5_negotiate_result",
        effects: {
          trust: 1,
          realityJudgment: 2,
          authorityResistance: 1,
        },
        npcTrustEffects: { liuyu: 2 },
        tags: ["谈判", "理性合作"],
        needAIAnalysis: true,
      },
      {
        id: "ch5_negotiate_hostile",
        text: "直接警告刘宇：我有你不知道的技能，不要轻举妄动",
        nextSceneId: "ch5_negotiate_result",
        effects: {
          authorityResistance: 2,
          trust: -1,
          selfProtection: 1,
        },
        npcTrustEffects: { liuyu: -2 },
        tags: ["威胁", "强硬"],
        needAIAnalysis: true,
      },
    ],
  },

  ch5_negotiate_result: {
    id: "ch5_negotiate_result",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "刘宇给了我学校的地形图，上面标注了关键逃生路线。\n\n「你不能私自调查除教室外的其他区域。」\n\n「有些规则，你必须通过问NPC才能获得。」\n\n我握紧了藏在校服内衬里的水果刀。",
    nextSceneId: "ch5_wang_office",
  },

  ch5_wang_office: {
    id: "ch5_wang_office",
    chapter: "王老师办公室",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text: "「你果然来了，平生。」\n\n王老师办公室里坐着周隽秀——3班的学生，眼睛哭得红肿。\n\n我和王老师开始交谈。他忽然逼近，影子扭曲——\n\n「凡事都讲究等价交换。我是老师。」\n\n「技能'违规提醒'强烈发动中！」",
    choices: [
      {
        id: "ch5_wang_apologize",
        text: "退让，向王老师道歉，接受交易规则",
        nextSceneId: "ch5_zhoujunxiu_talk",
        effects: {
          selfProtection: 2,
          authorityResistance: -1,
          realityJudgment: 1,
        },
        npcTrustEffects: { wangTeacher: 1 },
        tags: ["退让", "理性"],
        needAIAnalysis: true,
      },
      {
        id: "ch5_wang_resist",
        text: "坚持追问，强行要求回答",
        nextSceneId: "ch5_zhoujunxiu_talk",
        effects: {
          authorityResistance: 2,
          truthDesire: 1,
          selfProtection: -1,
        },
        npcTrustEffects: { wangTeacher: -1 },
        tags: ["抗争", "冒险"],
        needAIAnalysis: true,
      },
    ],
  },

  ch5_zhoujunxiu_talk: {
    id: "ch5_zhoujunxiu_talk",
    chapter: "王老师办公室",
    background: "/assets/bg/art_room.svg",
    speaker: "旁白",
    text: "我帮周隽秀把画框搬到3班教室。\n\n她说她高二时成绩班级前五，升到高三一落千丈，无法接受。\n\n「没有人告诉我该怎么做。」\n\n她低着头，像是在思考什么。\n\n我拿到了进入3班的许可。",
    returnToMap: true,
    mapId: "wang_gallery",
    choices: [
      {
        id: "ch5_enter_class3",
        text: "进入3班，寻找这间教室的规则",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          truthDesire: 2,
          selfProtection: 1,
          empathy: 1,
        },
        tags: ["探索", "冒险"],
        needAIAnalysis: true,
      },
      {
        id: "ch5_wait_observe",
        text: "先不进去，在门外观察情况",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          selfProtection: 2,
          realityJudgment: 1,
          truthDesire: -1,
        },
        tags: ["谨慎", "观望"],
        needAIAnalysis: true,
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 第6章 · 追杀与逃生 · 功成名就祈愿仪式
  // ══════════════════════════════════════════════

  ch6_class3_exposure: {
    id: "ch6_class3_exposure",
    chapter: "3班教室",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "我绕了一圈，在后黑板上找到了规则。\n\n「得到进入许可的外来者可进入，许可只能使用一次。」\n\n「不要让班级内的陌生同学认出你是外来者。」\n\n我刚一回头——\n\n一张被无限放大的脸怼在我面前。\n\n「你——是——谁？」",
    nextSceneId: "ch6_pursuit_start",
  },

  ch6_pursuit_start: {
    id: "ch6_pursuit_start",
    chapter: "3班教室",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "「技能'违规提醒'强烈发动中！」\n\n50多号人朝我簇拥过来，伸手阻拦我的行动。我死死抓住门把手，和他们拼命。\n\n门打不开。\n\n18:55。晚自习铃声响起还需要5分钟。\n\n「叮——」\n\n门终于解锁了。我夺门而出。",
    choices: [
      {
        id: "ch6_escape_window",
        text: "用刘宇给的路线图，从通风管道逃生",
        nextSceneId: "ch6_escape_success",
        effects: {
          selfProtection: 2,
          trust: 1,
          realityJudgment: 1,
        },
        tags: ["执行计划", "信任"],
        needAIAnalysis: true,
      },
      {
        id: "ch6_escape_fight",
        text: "拿出水果刀强行开路，杀出一条血路",
        nextSceneId: "ch6_escape_brutal",
        effects: {
          authorityResistance: 3,
          selfProtection: -2,
          empathy: -1,
        },
        tags: ["暴力", "破坏性"],
        needAIAnalysis: true,
      },
    ],
  },

  ch6_zhou_qirui: {
    id: "ch6_zhou_qirui",
    chapter: "3班教室",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "周骐瑞",
    character: "zhouQirui",
    text: "周骐瑞翻找着作业本，动作不慌不忙。\n\n「你也注意到午餐的问题了？」\n\n他没有抬头，但语气里有一种奇特的平静。\n\n「这些食物——不是给人吃的。是给零件吃的。」\n\n他把作业本合上，终于看向我：「如果你还想过下去，就别碰它们。」",
    choices: [
      {
        id: "ch6_zhou_thanks",
        text: "感谢他的提醒，并询问更多信息",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          trust: 1,
          truthDesire: 2,
          realityJudgment: 1,
        },
        npcTrustEffects: { zhouQirui: 2 },
        tags: ["合作", "探索"],
        needAIAnalysis: true,
      },
      {
        id: "ch6_zhou_nod",
        text: "点头示意，继续自己的调查",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          selfProtection: 1,
          realityJudgment: 1,
        },
        npcTrustEffects: { zhouQirui: 1 },
        tags: ["谨慎", "自保"],
        needAIAnalysis: true,
      },
    ],
    returnToMap: true,
    mapId: "classroom_3",
  },

  ch6_cheng_xiaoxiao: {
    id: "ch6_cheng_xiaoxiao",
    chapter: "3班教室",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "程潇潇",
    character: "chengXiaoxiao",
    text: "程潇潇趴在桌子上，看起来比周围的学生都要放松。\n\n「喂，你是新来的？」\n\n她歪着头打量我，好像完全没注意到教室里那种诡异的压抑感。\n\n「这周六有个试胆活动，你要来吗？」\n\n她举起一张宣传单——上面画着歪歪扭扭的鬼怪图案。",
    choices: [
      {
        id: "ch6_cheng_agree",
        text: "答应参加试胆活动，想从这里找到线索",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          trust: 1,
          truthDesire: 1,
          joyPerception: 1,
        },
        tags: ["接受", "探索"],
        needAIAnalysis: true,
      },
      {
        id: "ch6_cheng_decline",
        text: "拒绝——现在的首要任务是找到规则",
        nextSceneId: "ch6_class3_exposure",
        effects: {
          selfProtection: 1,
          truthDesire: -1,
        },
        tags: ["拒绝", "专注"],
        needAIAnalysis: true,
      },
    ],
    returnToMap: true,
    mapId: "classroom_3",
  },

  ch6_escape_success: {
    id: "ch6_escape_success",
    chapter: "追杀",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "我用水果刀柄猛砸通风管道口，管道终于脱落。\n\n一张血盆大口砰的一声撞在管道口——老师的怪物形态追了上来。\n\n我拼命往前爬，终于在一楼厕所落地。\n\n腿上有一道深可见骨的伤口。但副本还没结束。",
    nextSceneId: "ch6_ritual_approach",
  },

  ch6_escape_brutal: {
    id: "ch6_escape_brutal",
    chapter: "追杀",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text: "水果刀划开了第一只伸过来的手。\n\n血溅了出来。\n\n学生们后退了几步，但更多的声音从四面八方传来。\n\n「你是个坏孩子……」\n\n「你是个坏孩子！」\n\n「叛逆值已达到主动技能初始化条件……」",
    nextSceneId: "ch6_ritual_approach",
  },

  ch6_ritual_approach: {
    id: "ch6_ritual_approach",
    chapter: "功成名就祈愿仪式",
    background: "/assets/bg/rule_warning.svg",
    speaker: "旁白",
    text: "全校的学生和老师把我围在中央。\n\n他们双手合十，虔诚地祈祷，声音颤抖而贪婪——\n\n「保佑我考上清华……」\n「保佑我这次竞赛拿省一……」\n「保佑学校高考均分再创新高……」\n「保佑我年终KPI……」\n\n愿望越滚越大，变成了欲望。\n\n「叛逆值已达到50%。主动技能'篡改规则'已解锁。」",
    choices: [
      {
        id: "ch6_delete_good_child",
        text: "删除「成为好孩子」规则",
        nextSceneId: "ch6_delete_rule",
        effects: {
          authorityResistance: 3,
          realityJudgment: 1,
          selfProtection: -1,
        },
        tags: ["反抗", "建设性叛逆"],
        needAIAnalysis: true,
      },
      {
        id: "ch6_refuse_delete",
        text: "放弃主动技能，保持现状，等待时机",
        nextSceneId: "ch6_no_delete",
        effects: {
          selfProtection: 2,
          authorityResistance: -1,
          trust: 1,
        },
        tags: ["等待", "保守"],
        needAIAnalysis: true,
      },
    ],
  },

  ch6_delete_rule: {
    id: "ch6_delete_rule",
    chapter: "规则篡改",
    background: "/assets/bg/rule_warning.svg",
    speaker: "系统",
    text: "「我要删除——'成为好孩子'！」\n\n「已删除规则'成为好孩子'（学校区域）。」\n\n「恭喜您在学校区域获得'坏孩子'称号。」\n\n「由于根本身份转变，学校规则进行紧急修复。」\n\n「追杀进程强制停止。学校区域暂时关闭。」\n\n我失血过多，昏了过去。",
    aiEvent: "ending_judge",
  },

  ch6_no_delete: {
    id: "ch6_no_delete",
    chapter: "规则篡改",
    background: "/assets/bg/rule_warning.svg",
    speaker: "系统",
    text: "我没有使用主动技能。\n\n我选择了另一种方式——活下来，观察，等待。\n\n「您没有被删除。」\n\n「但您的叛逆值记录在案。学校区域将进行规则修复。」\n\n我昏了过去。",
    aiEvent: "ending_judge",
  },

  // ══════════════════════════════════════════════
  // 第7章 · 坏孩子诞生 · 家庭危机
  // ══════════════════════════════════════════════

  ch7_wake_family: {
    id: "ch7_wake_family",
    chapter: "家庭区域",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "旁白",
    text: "我再次睁开眼时，正坐在母亲的车里。\n\n「平生啊，我看了你昨天的成绩，还不错，比上次有进步。」\n\n四肢完好无损——副本的规则造成的伤害，在副本关闭后消失了。\n\n但我知道——这只是暂时的。",
    nextSceneId: "ch7_father_unemployed",
  },

  ch7_father_unemployed: {
    id: "ch7_father_unemployed",
    chapter: "家庭区域",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "旁白",
    text: "回到家，父亲坐在沙发上，神情颓丧。\n\n「你被裁了？」\n\n「……好，我知道了。」\n\n母亲的声音从厨房传来：「这些年攒下了一些积蓄，够平生读大学了。我这边还能再撑一会。」\n\n我关上了房门。",
    choices: [
      {
        id: "ch7_family_intervene",
        text: "试着和父母谈谈，哪怕可能触犯家庭规则",
        nextSceneId: "ch7_mirror_approach",
        effects: {
          empathy: 2,
          authorityResistance: 1,
          selfProtection: -1,
        },
        tags: ["尝试沟通", "影响"],
        needAIAnalysis: true,
      },
      {
        id: "ch7_family_withdraw",
        text: "不主动介入，先专注自己的调查",
        nextSceneId: "ch7_mirror_approach",
        effects: {
          selfProtection: 2,
          empathy: -1,
        },
        tags: ["自保", "旁观"],
        needAIAnalysis: true,
      },
    ],
  },

  ch7_mirror_approach: {
    id: "ch7_mirror_approach",
    chapter: "家庭区域",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "叶平生",
    text: "凌晨。\n\n洗漱时，我把头抵住镜面——并没有传来硬物感。\n\n我把整个头都伸了进去。\n\n四下一片漆黑，能感受到冷风的吹拂，还有一股淡淡的血腥味。\n\n「哒……」\n\n脚步声响起，由远及近。",
    nextSceneId: "ch7_mirror_ghost",
  },

  ch7_mirror_ghost: {
    id: "ch7_mirror_ghost",
    chapter: "镜中空间",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "一张血淋淋的鬼脸霍然闪现在我面前。\n\n他笑着咧开腥臭的巨口，一直咧到了耳根。\n\n「卧槽——！」\n\n我摔到了地上。\n\n门外响起了敲门声——\n\n「砰砰砰——！」\n\n敲门声越来越重，但没有人说话。",
    choices: [
      {
        id: "ch7_face_ghost",
        text: "打开门，正面面对镜中出现的存在",
        nextSceneId: "ch7_ghost_reveal",
        effects: {
          authorityResistance: 2,
          truthDesire: 2,
          selfProtection: -1,
        },
        tags: ["直面", "探索"],
        needAIAnalysis: true,
      },
      {
        id: "ch7_hide_wait",
        text: "躲起来，等门外的人离开",
        nextSceneId: "ch7_ghost_reveal",
        effects: {
          selfProtection: 2,
          truthDesire: -1,
        },
        tags: ["躲避", "自保"],
        needAIAnalysis: true,
      },
    ],
  },

  ch7_ghost_reveal: {
    id: "ch7_ghost_reveal",
    chapter: "镜中真相",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "我打开门。\n\n那只鬼的装束完全和母亲一样。\n\n她踏入厕所的瞬间，我的头仿佛炸开一般地疼痛。\n\n空间碎裂又拼合，厕所被血色渲染——\n\n地板上躺着一个血淋淋的人形轮廓。\n\n「恭喜您找到'镜中真相碎片1'，副本探索进度达15%。」\n\n「如果我再不做些什么，母亲就会变成那只鬼。」",
    nextSceneId: "ch8_rooftop_prepare",
  },

  // ══════════════════════════════════════════════
  // 第8章 · 天台和解 · 结局裁决
  // ══════════════════════════════════════════════

  ch8_rooftop_prepare: {
    id: "ch8_rooftop_prepare",
    chapter: "天台",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "叶平生",
    text: "我偷偷溜出房门，通过电梯到达顶楼，从逃生通道走到天台。\n\n寒冷的晚风扑面而来。深夜天色如墨，月光惨淡。\n\n这座城市还在运转——凌晨一点，仍有卡车送货，楼下包子店老板四点钟就要起床准备食材。\n\n「你没来过这里。」",
    nextSceneId: "ch8_rooftop_dialogue",
  },

  ch8_rooftop_dialogue: {
    id: "ch8_rooftop_dialogue",
    chapter: "天台",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "旁白",
    text: "（我也没来过这里。但这地方能让我感到快乐吗？）\n\n「看那边。凌晨一点，仍有卡车送货。楼下那家包子店老板每天四点钟起床。」\n\n（你什么意思？）\n\n「还有比你更奔波的人。」",
    returnToMap: true,
    mapId: "rooftop",
    choices: [
      {
        id: "ch8_reason_growth",
        text: "尝试用道理说服：我把圈凿出一个孔，就有路了",
        nextSceneId: "ch8_rooftop_deep",
        effects: {
          truthDesire: 2,
          realityJudgment: 2,
          empathy: 1,
          joyPerception: 2,
        },
        tags: ["说理", "引导"],
        needAIAnalysis: true,
      },
      {
        id: "ch8_empathy_alone",
        text: "用共情回应：我也自顾不暇，但我还是选择多管闲事",
        nextSceneId: "ch8_rooftop_deep",
        effects: {
          empathy: 3,
          trust: 1,
          joyPerception: 1,
        },
        tags: ["共情", "真诚"],
        needAIAnalysis: true,
      },
      {
        id: "ch8_give_up",
        text: "放弃说服：我不知道该怎么办，你自己想吧",
        nextSceneId: "ch8_rooftop_end",
        effects: {
          selfProtection: 1,
          empathy: -1,
          truthDesire: -2,
        },
        tags: ["放弃", "旁观"],
        needAIAnalysis: true,
      },
    ],
  },

  ch8_rooftop_deep: {
    id: "ch8_rooftop_deep",
    chapter: "天台",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "叶平生",
    text: "「你看，也总有人起得比你早。」\n\n（我没得选。）\n\n「你有得选。你把圈凿出一个孔，就有路了。」\n\n（你疯了吗？造反政府是你家开的？）\n\n「不是造反。只是——打破那些束缚住你思维的条条框框。」\n\n「这样，你就一直都能快乐下去。」",
    nextSceneId: "ch8_rooftop_final_choice",
  },

  ch8_rooftop_final_choice: {
    id: "ch8_rooftop_final_choice",
    chapter: "天台",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "叶平生",
    text: "「把注意力集中到感官上，用心感受现在。」\n\n（风声、鸣笛声……不好闻。）\n\n「冬日独有的烟火气。很有人情味。我总是能通过它联想到各家安居乐业的场景。」\n\n（安居乐业？）\n\n「是啊。哪怕大部分人过得很辛苦，看到家人团聚，听到寒暄——哪怕是表面工夫，也暖。」",
    choices: [
      {
        id: "ch8_choose_middle",
        text: "承认系统残酷，但也承认人有在缝隙里创造意义的能力",
        nextSceneId: "ch8_ending_judge",
        effects: {
          realityJudgment: 2,
          joyPerception: 2,
          empathy: 2,
          trust: 1,
        },
        tags: ["建设性", "和解"],
        needAIAnalysis: true,
      },
      {
        id: "ch8_choose_world_evil",
        text: "强调世界残酷：内卷无法改变，你只能适应或沉沦",
        nextSceneId: "ch8_ending_judge",
        effects: {
          truthDesire: 1,
          realityJudgment: -1,
          empathy: -1,
        },
        tags: ["悲观", "现实"],
        needAIAnalysis: true,
      },
      {
        id: "ch8_choose_world_good",
        text: "强调人性美好：只要真心待人，世界会变好的",
        nextSceneId: "ch8_ending_judge",
        effects: {
          empathy: 2,
          joyPerception: 1,
          truthDesire: -1,
          realityJudgment: -1,
        },
        tags: ["理想主义", "天真"],
        needAIAnalysis: true,
      },
    ],
  },

  ch8_rooftop_end: {
    id: "ch8_rooftop_end",
    chapter: "天台",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "旁白",
    text: "（你不打算说服我吗？）\n\n「……我不知道该怎么办了。」\n\n脑内的声音沉默了很久。\n\n「技能'违规提醒'仍在发动。」\n\n我知道——如果我不做出选择，我们都会死在这里。",
    nextSceneId: "ch8_ending_judge",
  },

  // ══════════════════════════════════════════════
  // 结局裁决节点
  // ══════════════════════════════════════════════

  ch8_ending_judge: {
    id: "ch8_ending_judge",
    chapter: "结局裁决",
    background: "/assets/bg/rule_warning.svg",
    speaker: "系统",
    text: "（嗯。）\n\n脑内的警报声停止，「我」的存在也同时消失。\n\n「恭喜您找到'被遗弃的呐喊碎片2'，副本探索进度20%。」\n\n「家庭区域叛逆值已达35%。」\n\n「混沌磁场范围扩大。」\n\n副本即将结束。AI正在分析您的人格画像，准备裁决您的结局……",
    aiEvent: "ending_judge",
  },

};
