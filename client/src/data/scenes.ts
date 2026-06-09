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
  // 第1章 · 前兆（参考小说原文，旁白第一人称）
  // 流程：CG idea界面 → 宿舍(sleep) 暗屏+聚光 → 室友对话 → 白天 → 邮件 → 商店 → 候场区
  // ══════════════════════════════════════════════

  start: {
    id: "start",
    chapter: "序章",
    background: "/assets/CG/前兆/idea界面.png",
    speaker: "旁白",
    text: "终于解决完所有的bug了。光标停留在5154行的位置，一股强烈的满足感涌上心头。我合上笔记本电脑，伸了个懒腰。\n\n现在是04：46。我，叶平生，一个平平无奇的计算机专业大学生，终于完成了我的个人项目。",
    nextSceneId: "ch1_think_balcony",
    cgMode: true,
  },

  // 主角心理活动 → 想透气，显示立绘
  ch1_think_balcony: {
    id: "ch1_think_balcony",
    chapter: "序章",
    background: "/assets/CG/前兆/idea界面.png",
    speaker: "叶平生",
    text: "好累啊，真想到阳台去透透气。",
    cgMode: true,
    // 心理活动结束后进入宿舍RPG，玩家操控角色走向窗户交互进入阳台
    onCgEnd: "enter_dormitory_playable",
  },

  // 进入宿舍后，玩家可操控角色走向窗户/阳台门（触发 window/balcony_door trigger）
  // 交互后切换至夜晚阳台地图，主角出现在阳台门口，开始阳台第二幕
  ch1_go_balcony: {
    id: "ch1_go_balcony",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "我轻脚走到阳台，深吸一口气。\n\n外面正下着雨，无风作扰，直直垂下，宛如帘幕。",
    onCgEnd: "enter_balcony",
  },

  // ══════════════════════════════════════════════
  // 夜晚阳台第二幕（接宿舍第一幕第六场）
  // ══════════════════════════════════════════════

  // 阳台旁白一：景物描写（进入阳台后延迟2s自动触发）
  balcony_night_narrate_1: {
    id: "balcony_night_narrate_1",
    chapter: "序章",
    background: "/assets/maps/balcony/阳台_夜晚.png",
    speaker: "旁白",
    text: "外面正下着雨，无风作扰，直直垂下，宛如帘幕。",
    nextSceneId: "balcony_night_narrate_2",
  },

  // 阳台旁白二：继续景物描写
  balcony_night_narrate_2: {
    id: "balcony_night_narrate_2",
    chapter: "序章",
    background: "/assets/maps/balcony/阳台_夜晚.png",
    speaker: "旁白",
    text: "放空大脑倾听绵绵雨声，我竟有一种想冲进雨中的冲动。",
  },

  // 阳台心理活动：主角内心独白（旁白结束后延迟1.5s自动触发）
  balcony_night_think: {
    id: "balcony_night_think",
    chapter: "序章",
    background: "/assets/maps/balcony/阳台_夜晚.png",
    speaker: "叶平生",
    text: "牛马生活什么时候是个头啊……",
    onCgEnd: "return_dormitory",
  },

  // 旧阳台场景（保留作为过渡，不再自动触发）
  ch1_cg_project_done: {
    id: "ch1_cg_project_done",
    chapter: "序章",
    background: "/assets/maps/balcony/阳台_白天.png",
    speaker: "叶平生",
    text: "放空大脑听听窗外的雨声，我竟有一种想冲进雨中的冲动。\n\n但也只是想想罢了。\n\n明天还有课，早点睡吧。",
    nextSceneId: "ch1_enter_dormitory",
  },

  // 玩家从阳台回到宿舍（自动触发）
  ch1_enter_dormitory: {
    id: "ch1_enter_dormitory",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "关上阳台的门窗，我回到寝室，正要拿放在桌柜上的洗漱用品，却惊奇地发现笔记本电脑幽幽泛着白光，在黑暗中格外惹眼。\n\n怎么回事？我记得已经把电脑关机了。",
    nextSceneId: "ch1_computer_glow",
    onCgEnd: "enter_dormitory",
  },

  ch1_computer_glow: {
    id: "ch1_computer_glow",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "叶平生",
    text: "诶，可能是熬夜熬得太晚，导致记忆混乱了吧。\n\n我没太把这件事放在心上，关上电脑，洗漱完就上床睡觉了。过度疲倦带来的浓烈睡意占据大脑，几乎是沾枕就睡。",
    nextSceneId: "ch1_stand_up",
  },

  // 第二天，电脑再次自动开机
  ch1_stand_up: {
    id: "ch1_stand_up",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "闹钟在07：00准时响起。我迷迷糊糊地收拾床铺，却被入眼的白光吓得瞬间清醒。\n\n这次应该不是因为我忘记关电脑了，而是电脑自动打开了。",
    nextSceneId: "ch1_ask_roommates",
  },

  ch1_ask_roommates: {
    id: "ch1_ask_roommates",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "叶平生",
    text: "我吞了口唾沫，转头问室友：「你们昨晚有谁打开了我的电脑吗？」\n\n室友像听了什么笑话一样：「ber，哥们你卷糊涂了吧，我们自己有电脑，为啥要用你的。」\n\n我仍不死心：「那快天亮的时候你们有听到什么动静吗？」\n\n「没，我都困得要死。」",
    nextSceneId: "ch1_chenyuhao",
  },

  ch1_chenyuhao: {
    id: "ch1_chenyuhao",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "陈煜浩是唯一一个比我还卷的室友，他平时睡眠也不是很好。\n\n他一边收拾书包一边摇了摇头：「昨晚是你打开了电脑，并不是其他人。」\n\n我顿时汗毛倒竖。\n\n「见鬼……怎么可能？」\n\n「应该是你梦游了。」他淡淡解释道。",
    nextSceneId: "ch1_afternoon",
  },

  ch1_afternoon: {
    id: "ch1_afternoon",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "整个白天，电脑都没有再徒生变故。难道昨晚的事件真的是我的错觉？\n\n晚上23：00，我写完当天的作业，正打算拿起手机玩游戏，就发现自己收到了一封匿名邮件。接着，我的电脑，就这样明目张胆地开机了。\n\n这次绝对不是我的错觉——它在我眼皮子底下开机了。",
    nextSceneId: "ch1_email",
  },

  ch1_email: {
    id: "ch1_email",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "系统邮件",
    text: "亲爱的预备参赛者：\n\n由于系统检测到您在「人类」智慧群体中资质出众，您将成为第一批进入「人类进化计划」筛选的参赛者。此邮件作为新手引导，以下内容请您仔细阅读。\n\n初赛将于00：00准时开启，您可以按照下列提示进行赛前准备：\n1. 按需准备15日的能量摄入来源。\n2. 依据个人身体素质准备强度不一的防身武器。\n3. 尽量保持稳定的磁场紊乱状态。\n\n关于初赛信息：\n无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。\n\n请您遵守保密协议：严禁将比赛信息泄露给无关人员，若有违反，系统将即刻抹除您的存在。\n\n祝您比赛顺利~",
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
    text: "现在是23：32。\n\n我骑着小电驴来到了离校最近的厨房用品店。柜台前已经排了4个人——1女3男。往常这个时候，店里应该基本没人才对。\n\n除非他们也是和我一样的「变数」。\n\n我拿上店里还未售罄的水果刀，排在了队伍末尾。店里的菜刀和削皮刀已经售罄。队伍前面的女生回头看了我一眼。",
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
    speaker: "旁白",
    text: "我拍了拍她的肩膀，将手机举到她面前。看到第一个问题后，她脸上纯良的表情逐渐变得狠戾。\n\n我：【我们的规则是什么？】\n\n女生：【没有具体规则。】\n\n赌对了。\n\n她顿了顿，反问：【你怎么理解第三条提示？】\n\n她需要我先展示诚意。",
    choices: [
      {
        id: "ch1_share_analysis",
        text: "坦诚分享自己对\u300C磁场\u300D的理解，展示合作诚意",
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
    text: "回到寝室已经是23：55。\n\n极限五分钟！我火急火燎地收拾行囊，柜子都来不及关上。室友惊呼：「我靠……真·高速小马达。」\n\n我顾不上和室友顶嘴。开赛前30秒，我终于换好了一身运动装，背上了行囊。\n\n00：00。\n\n我眼前一黑——下一瞬，置身于仿佛一个小型宇宙的空间中。四周星辰点点，星云摇曳，而我漂浮于宇宙中，并无失重感。\n\n「欢迎参赛者来到'人类进化计划'候场区~」",
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
    text: "窒息感越来越强。我必须找到让\u300C我\u300D快乐的理由——否则我就要死在这里。\n\n「想想你的同学。」\n\n「刘宇不是很快就察觉到你的异常了吗？」\n\n「周骐瑞找作业的样子，你是真心觉得有趣。」\n\n脑内的声音沉默了。脖子上的力量骤然消失。\n\n「你说服我了。但是，明天就不一定了。」",
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
    nextSceneId: "ch4_art_class",
  },

  ch4_art_class: {
    id: "ch4_art_class",
    chapter: "美术课 / 王老师",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text: "一位将近70岁的老人步伐稳健地走进教室，一双澄澈如水的眼眸锐利地扫过每个人的脸庞。\n\n「在我的课上没有竞争，你们只要成为你们自己就好。」\n\n我唰唰几笔，画了一幅极其抽象的画——四分五裂的傀儡被囚于四分五裂的监牢，监牢外是一套崭新的桌椅，周围萦绕着花瓣和蝴蝶。",
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
        tags: ["展示", "真实"],
        needAIAnalysis: true,
      },
      {
        id: "ch4_paint_conform",
        text: "画一幅符合\u300C好孩子\u300D标准的画，取悦老师",
        nextSceneId: "ch4_wang_judge",
        effects: {
          selfProtection: 2,
          authorityResistance: -1,
          truthDesire: -1,
        },
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
        tags: ["追问", "冒险"],
        needAIAnalysis: true,
      },
      {
        id: "ch4_accept_trade",
        text: "接受等价交换，询问\u300C镜中尸骸、湖中遗物、书中落叶\u300D",
        nextSceneId: "ch4_wang_hint",
        effects: {
          realityJudgment: 2,
          truthDesire: 1,
          selfProtection: 1,
        },
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
        text: "删除\u300C成为好孩子\u300D规则",
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
    text: "（嗯。）\n\n脑内的警报声停止，\u300C我\u300D的存在也同时消失。\n\n「恭喜您找到'被遗弃的呐喊碎片2'，副本探索进度20%。」\n\n「家庭区域叛逆值已达35%。」\n\n「混沌磁场范围扩大。」\n\n副本即将结束。AI正在分析您的人格画像，准备裁决您的结局……",
    aiEvent: "ending_judge",
  },

  // ══════════════════════════════════════════════
  // 客厅交互对话（livingroom item interactions）
  // ══════════════════════════════════════════════

  // --- 垃圾桶（重要线索） ---
  interact_livingroom_trash: {
    id: "interact_livingroom_trash",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "垃圾桶里塞满了废纸团。我翻了一下，发现一张被揉皱的纸条。\n\n上面写着：「规则第③条——家庭区域内，禁止在22:00后离开卧室。」\n\n字迹潦草，像是匆匆写下的。",
    nextSceneId: "interact_livingroom_trash_2",
  },
  interact_livingroom_trash_2: {
    id: "interact_livingroom_trash_2",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "（这张纸条……是父亲写的？还是妈妈？）\n\n我把纸条折好，塞进口袋。也许之后会有用。",
  },

  // --- 茶几 ---
  interact_livingroom_table: {
    id: "interact_livingroom_table",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "茶几上摆着几本杂志和一只空茶杯。\n\n都是些过期的家居周刊。封面上的家庭看起来总是那么完美。",
  },

  // --- 电视 ---
  interact_livingroom_tv: {
    id: "interact_livingroom_tv",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "电视关着，屏幕上映出我模糊的影子。\n\n遥控器不知道放哪去了。算了，也没什么好看的。",
  },

  // --- 盆栽 ---
  interact_livingroom_plant: {
    id: "interact_livingroom_plant",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "一盆绿萝，叶片有些发黄。\n\n看来很久没人浇水了。它和我们家一样，都在努力活着。",
  },

  // --- 椅子（坐下动作）---
  // 注：椅子交互走 sitAction 路径（PlayerController.sit），不触发此对话
  // 此 sceneId 作为占位，防止未定义错误
  interact_livingroom_chair: {
    id: "interact_livingroom_chair",
    chapter: "客厅",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text: "我在椅子上坐了下来。\n\n（按下任意方向键起身。）",
  },

  // ══════════════════════════════════════════════
  // 宿舍交互场景（dormitory interact scenes）
  // ══════════════════════════════════════════════

  // --- CG结束后，主角坐在电脑前的心理活动 ---
  dorm_cg_end_think: {
    id: "dorm_cg_end_think",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "累死我了，真想到阳台透透风。",
    // 按 space 后 → 屏幕闪现 + 站起 + 传送到椅子右侧，进入探索
    onCgEnd: "dorm_enter_explore",
  },

  // --- 前往阳台（窗户/阳台门触发器）---
  dorm_go_balcony: {
    id: "dorm_go_balcony",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "我轻脚走到阳台，深吸一口气。\n\n外面正下着雨，无风作扰，直直垂下，宛如帘幕。",
    nextSceneId: "ch1_cg_project_done",
    onCgEnd: "enter_balcony",
  },

  // --- 查看电脑（trigger_pc）---
  dorm_interact_pc: {
    id: "dorm_interact_pc",
    chapter: "序章",
    background: "/assets/CG/前兆/idea界面.png",
    speaker: "旁白",
    text: "光标停留在5154行的位置，IDE界面上的代码整整齐齐。\n\n这是我花了整整一周才写完的个人项目。",
    cgMode: true,
    // 按任意键后回到椅子右侧出生点
    onCgEnd: "dorm_return_chair_right",
  },

  // --- C++课本（trigger_cpp_book）---
  dorm_interact_cpp_book: {
    id: "dorm_interact_cpp_book",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "浩哥的C++程序设计课本，写满了笔记。",
  },

  // --- 时钟（trigger_clock）---
  dorm_interact_clock: {
    id: "dorm_interact_clock",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "04:46。",
  },

  // --- 离开宿舍（trigger_exit_door）---
  dorm_interact_exit_door: {
    id: "dorm_interact_exit_door",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "我疯了吗这时候出门干什么？",
  },

  // ══════════════════════════════════════════════
  // 宿舍第二幕：从阳台回到宿舍后
  // ══════════════════════════════════════════════

  // 回到宿舍后，冻结玩家，弹出心理活动
  dorm_act2_think: {
    id: "dorm_act2_think",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "啊对了，电脑还没关呢。把电脑关了之后赶紧睡觉吧，明天还要上课……诶。",
  },

  // 第二幕中与电脑交互 → 确认对话框（带选项）
  dorm_act2_pc_confirm: {
    id: "dorm_act2_pc_confirm",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "确认要关闭电脑然后睡觉吗？",
    choices: [
      {
        id: "dorm_act2_sleep_now",
        text: "赶紧睡啊真要累死人了",
        nextSceneId: "dorm_act2_sleep_result",
        effects: {
          selfProtection: 2,
          realityJudgment: 1,
          joyPerception: -1,
        },
        tags: ["务实", "自保"],
        needAIAnalysis: true,
      },
      {
        id: "dorm_act2_explore_more",
        text: "夜猫子，还想转转",
        nextSceneId: "dorm_act2_explore",
        effects: {
          joyPerception: 1,
          realityJudgment: -1,
        },
        tags: ["探索", "好奇"],
        needAIAnalysis: true,
      },
    ],
  },

  // 选择直接睡觉 → 睡觉描述（地图已淡出至黑）
  dorm_act2_sleep_result: {
    id: "dorm_act2_sleep_result",
    chapter: "序章",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "旁白",
    text: "这一天我累的不行。过度疲倦带来的浓烈睡意占据我的大脑，我几乎是沾枕就睡，室友如雷的鼾声都无法吵醒我。",
  },

  // 选择继续探索 → 进入探索状态
  dorm_act2_explore: {
    id: "dorm_act2_explore",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "反正也睡不着，再看看吧。",
  },

  // 继续探索分支中再次交互电脑 → 直接触发睡觉
  dorm_act2_pc_force_sleep: {
    id: "dorm_act2_pc_force_sleep",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "现在必须得睡觉了，不能再晚了。",
    nextSceneId: "dorm_act2_sleep_result",
  },

  // 第二幕中查看时钟（显示04:47）
  dorm_act2_clock: {
    id: "dorm_act2_clock",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "04:47。",
  },

  // 第二幕中阻止前往阳台
  dorm_act2_no_balcony: {
    id: "dorm_act2_no_balcony",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "都这么晚了，先把电脑关了睡觉吧。",
  },

  // ========== 宿舍第三幕：次日清晨 ==========

  // 夜晚结束后的反思独白（黑屏）
  dorm_act3_reflection: {
    id: "dorm_act3_reflection",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "那时我并不知道，前方有多少未知在虎视眈眈地盯着我，但我能肯定，未知每天都在我的生活中流淌，无论这个世界如何变化，它都在那里。",
    nextSceneId: "dorm_act3_alarm",
  },

  // 闹钟响起（黑屏 + 闹铃音效）
  dorm_act3_alarm: {
    id: "dorm_act3_alarm",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "闹钟在07：00准时响起，我烦躁地翻了个身，精准地抓住不听话的手机把铃声快速关掉。",
    nextSceneId: "dorm_act3_wake",
  },

  // 挣扎起床（黑屏）
  dorm_act3_wake: {
    id: "dorm_act3_wake",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "我在床上苦苦挣扎了一分钟，最后终于说服自己睁开了眼。",
    nextSceneId: "dorm_act3_getup",
  },

  // 下床（天花板 CG）
  dorm_act3_getup: {
    id: "dorm_act3_getup",
    chapter: "序章",
    background: "/assets/CG/前兆/天花板.png",
    cgMode: true,
    speaker: "旁白",
    text: "我迷迷糊糊地收拾床铺，然后下床。",
    onCgEnd: "enter_dormitory_day",
  },

  // ── 以下为宿舍白天地图上的对话 ──

  dorm_act3_notice_pc: {
    id: "dorm_act3_notice_pc",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "等等，那是……",
    nextSceneId: "dorm_act3_pc_on_1",
  },

  dorm_act3_pc_on_1: {
    id: "dorm_act3_pc_on_1",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "我本来挺困的，却被入眼的白光吓得瞬间清醒。",
    nextSceneId: "dorm_act3_pc_on_2",
  },

  dorm_act3_pc_on_2: {
    id: "dorm_act3_pc_on_2",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "这次应该不是因为我忘记关电脑了，而是电脑自动打开了。",
    nextSceneId: "dorm_act3_turn_roommate",
  },

  dorm_act3_turn_roommate: {
    id: "dorm_act3_turn_roommate",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "我吞了口唾沫，转头看向室友。",
    nextSceneId: "dorm_act3_ask_pc",
  },

  dorm_act3_ask_pc: {
    id: "dorm_act3_ask_pc",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "你们昨晚有谁打开了我的电脑吗？",
    nextSceneId: "dorm_act3_roommate_laugh",
  },

  dorm_act3_roommate_laugh: {
    id: "dorm_act3_roommate_laugh",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "室友像听了什么笑话一样。",
    nextSceneId: "dorm_act3_roommateA_reply",
  },

  dorm_act3_roommateA_reply: {
    id: "dorm_act3_roommateA_reply",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "室友A",
    text: "ber，哥们你卷糊涂了吧，我们自己有电脑，为啥要用你的？",
    nextSceneId: "dorm_act3_narrate_other",
  },

  dorm_act3_narrate_other: {
    id: "dorm_act3_narrate_other",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "另外一个室友附和道，",
    nextSceneId: "dorm_act3_roommateB_reply",
  },

  dorm_act3_roommateB_reply: {
    id: "dorm_act3_roommateB_reply",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "室友B",
    text: "是啊……你卷得这么晚，哪个疯子会大晚上不睡觉就为了打开你的电脑？",
    nextSceneId: "dorm_act3_still_doubt",
  },

  dorm_act3_still_doubt: {
    id: "dorm_act3_still_doubt",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "我仍不死心，",
    nextSceneId: "dorm_act3_ask_sound",
  },

  dorm_act3_ask_sound: {
    id: "dorm_act3_ask_sound",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "那快天亮的时候你们有听到什么动静吗？",
    nextSceneId: "dorm_act3_both_reply",
  },

  dorm_act3_both_reply: {
    id: "dorm_act3_both_reply",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "俩室友",
    text: "没，我俩都困得要死。",
    nextSceneId: "dorm_act3_inner_thought",
  },

  dorm_act3_inner_thought: {
    id: "dorm_act3_inner_thought",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "（也是，依他们的性子，这两个大摆锤恨不得睡得昏天黑地。）",
    nextSceneId: "dorm_act3_ask_hao",
  },

  dorm_act3_ask_hao: {
    id: "dorm_act3_ask_hao",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "那你呢，浩哥？",
    nextSceneId: "dorm_act3_narrate_chen",
  },

  dorm_act3_narrate_chen: {
    id: "dorm_act3_narrate_chen",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "陈煜浩是唯一一个比我还卷的室友，加之脑子比我好使，课设作业也比我早一天完成。他平时睡眠也不是很好，估计我昨晚熬夜把他搞失眠了，不过正好，后半夜的情况他应该很清楚。",
    nextSceneId: "dorm_act3_chen_shake",
  },

  dorm_act3_chen_shake: {
    id: "dorm_act3_chen_shake",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "他一边收拾书包一边摇了摇头。",
    nextSceneId: "dorm_act3_shock",
  },

  dorm_act3_shock: {
    id: "dorm_act3_shock",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "啊？",
    nextSceneId: "dorm_act3_narrate_chen_detail",
  },

  dorm_act3_narrate_chen_detail: {
    id: "dorm_act3_narrate_chen_detail",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "见我一脸疑惑，他淡淡解释道，",
    nextSceneId: "dorm_act3_chen_reveal",
  },

  dorm_act3_chen_reveal: {
    id: "dorm_act3_chen_reveal",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "陈煜浩",
    text: "我的意思是，快天亮的时候就是你本人打开了电脑。",
    nextSceneId: "dorm_act3_narrate_shock",
  },

  dorm_act3_narrate_shock: {
    id: "dorm_act3_narrate_shock",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "旁白",
    text: "我顿时汗毛倒竖。",
    nextSceneId: "dorm_act3_protagonist_shock",
  },

  dorm_act3_protagonist_shock: {
    id: "dorm_act3_protagonist_shock",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "叶平生",
    text: "见鬼……怎么可能？我明明睡前把电脑关了。",
    nextSceneId: "dorm_act3_chen_explain",
  },

  dorm_act3_chen_explain: {
    id: "dorm_act3_chen_explain",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "陈煜浩",
    text: "不用这么惊讶，我想，你应该是梦游了。这种事如今在年轻人之中并不少见。",
    nextSceneId: "dorm_act3_roommateA_comfort",
  },

  dorm_act3_roommateA_comfort: {
    id: "dorm_act3_roommateA_comfort",
    chapter: "序章",
    background: "/assets/maps/dormitory/宿舍.png",
    speaker: "室友A",
    text: "叶卷卷你都连续熬了这么多天，是不是都神经衰弱了？被吓到也是情有可原。你这几天好好休息一下就好了。",
    nextSceneId: "dorm_act3_idea_cg",
  },

  // 切换到 idea CG
  dorm_act3_idea_cg: {
    id: "dorm_act3_idea_cg",
    chapter: "序章",
    background: "/assets/CG/前兆/idea界面.png",
    cgMode: true,
    speaker: "旁白",
    text: "我又看了眼停留在5154行的光标，叹了口气，关上电脑把它仍进包里。",
    nextSceneId: "dorm_act3_final_dark",
  },

  // 全黑
  dorm_act3_final_dark: {
    id: "dorm_act3_final_dark",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "整个白天我都在上课，电脑我一直监视着，这段时间倒是没有再徒生变故。\n\n难道昨晚的事件真的是我的错觉？",
    nextSceneId: "dorm_act4_return_dorm",
  },

  // ══════════════════════════════════════════════
  // 宿舍第四幕：邮件出现
  // ══════════════════════════════════════════════

  // 第四幕入口 —— 旁白
  dorm_act4_return_dorm: {
    id: "dorm_act4_return_dorm",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "晚上23：00，我写完当天的作业，打算拿起手机玩会游戏。",
    nextSceneId: "dorm_act4_return_dorm_inner",
  },

  // 第四幕入口 —— 主角内心
  dorm_act4_return_dorm_inner: {
    id: "dorm_act4_return_dorm_inner",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "（完蛋，今天X神小月卡还没领，我的30元大洋啊。）",
    nextSceneId: "dorm_act4_pc_boot_shock",
  },

  // 电脑开机 —— 主角惊呼
  dorm_act4_pc_boot_shock: {
    id: "dorm_act4_pc_boot_shock",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "（我的天！？）",
    nextSceneId: "dorm_act4_pc_boot_narrate",
  },

  // 电脑开机 —— 旁白叙述
  dorm_act4_pc_boot_narrate: {
    id: "dorm_act4_pc_boot_narrate",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "旁白",
    text: "没错，这次绝对不是我的错觉，它在我眼皮子底下开机了。\n\n估计是黑客用远程代码控制了我的电脑，但是电脑显示防火墙并没有给予入侵提示。\n\n看来这个黑客技术相当高超。",
    nextSceneId: "dorm_act4_pc_boot_digest",
  },

  // 电脑开机 —— 主角消化 + 选项
  dorm_act4_pc_boot_digest: {
    id: "dorm_act4_pc_boot_digest",
    chapter: "序章",
    background: "/assets/maps/dormitory/sleep.png",
    speaker: "叶平生",
    text: "（让我消化一下……）",
    choices: [
      {
        id: "dorm_act4_choice_check",
        text: "我还不清楚事情的全貌，先看看电脑上有什么",
        nextSceneId: "dorm_act4_check_pc",
        effects: {
          authorityResistance: -1,
          realityJudgment: 2,
        },
        tags: ["谨慎", "冷静", "理性", "独立"],
        needAIAnalysis: true,
      },
      {
        id: "dorm_act4_choice_ask",
        text: "浩哥这么聪明，让他帮我看看电脑出了什么问题",
        nextSceneId: "dorm_act4_death_ask",
        effects: {
          trustLevel: 1,
          realityJudgment: -2,
          authorityResistance: -1,
        },
        tags: ["信任", "依赖", "天真"],
        needAIAnalysis: true,
      },
    ],
  },

  // ── 死亡分支：每句独立场景 ──

  dorm_act4_death_ask: {
    id: "dorm_act4_death_ask",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "叶平生",
    text: "浩哥，你能不能过来一下？",
    nextSceneId: "dorm_act4_death_chen",
  },

  dorm_act4_death_chen: {
    id: "dorm_act4_death_chen",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "陈煜浩",
    text: "什么事？",
    nextSceneId: "dorm_act4_death_explain",
  },

  dorm_act4_death_explain: {
    id: "dorm_act4_death_explain",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "叶平生",
    text: "刚才我的电脑忽然自动开机了。",
    nextSceneId: "dorm_act4_death_narrate1",
  },

  dorm_act4_death_narrate1: {
    id: "dorm_act4_death_narrate1",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "他疑惑地挑起一根眉毛，一副\"你在说什么胡话\"的表情。",
    nextSceneId: "dorm_act4_death_handover",
  },

  dorm_act4_death_handover: {
    id: "dorm_act4_death_handover",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "叶平生",
    text: "喏，你看。",
    nextSceneId: "dorm_act4_death_narrate2",
  },

  dorm_act4_death_narrate2: {
    id: "dorm_act4_death_narrate2",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "我将电脑递给陈煜浩。\n\n但就在他看向屏幕的那一刻，我的心脏突然就像被一只无形的大手抓住了，隐隐作痛，而且，力道还在不断收紧。",
    nextSceneId: "dorm_act4_death_cough",
  },

  dorm_act4_death_cough: {
    id: "dorm_act4_death_cough",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "叶平生",
    text: "咳咳……",
    nextSceneId: "dorm_act4_death_final",
  },

  dorm_act4_death_final: {
    id: "dorm_act4_death_final",
    chapter: "序章",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "猩红的血液从我的嘴角流出，意识逐渐远去，我砰的一声倒在了地上。\n\n弥留之际，我看到了震惊的陈煜浩和慌忙跑过来的两个室友。\n\n我死了。",
    nextSceneId: "title_screen",
  },

  // ── 阅读邮件 CG（每句独立场景）──

  dorm_act4_check_pc: {
    id: "dorm_act4_check_pc",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "我深吸一口气平复了不安的心情，仔细查看电脑，映入眼帘的是一封邮件通知。\n\n于是我点开了那封邮件。",
    nextSceneId: "dorm_act4_mail_think",
  },

  dorm_act4_mail_think: {
    id: "dorm_act4_mail_think",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（这封邮件……）",
    nextSceneId: "dorm_act4_mail_label",
  },

  dorm_act4_mail_label: {
    id: "dorm_act4_mail_label",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "邮件内容是：",
    nextSceneId: "dorm_act4_mail_content",
  },

  dorm_act4_mail_content: {
    id: "dorm_act4_mail_content",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "亲爱的预备参赛者：\n\n由于系统检测到您在\"人类\"智慧群体中资质出众，您将成为第一批进入\"人类进化计划\"筛选的参赛者。此邮件作为新手引导，以下内容请您仔细阅读。\n\n初赛将于00：00准时开启，您可以按照下列提示进行赛前准备：\n\n1. 按需准备15日的能量摄入来源。\n\n2. 依据个人身体素质准备强度不一的防身武器。\n\n3. 尽量保持稳定的磁场紊乱状态。\n\n关于初赛信息：\n\n无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。\n\n请您遵守保密协议：严禁将比赛信息泄露给无关人员，若有违反，系统将即刻抹除您的存在。\n\n祝您比赛顺利~",
    nextSceneId: "dorm_act4_mail_silence",
  },

  dorm_act4_mail_silence: {
    id: "dorm_act4_mail_silence",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（……）",
    nextSceneId: "dorm_act4_mail_search",
  },

  dorm_act4_mail_search: {
    id: "dorm_act4_mail_search",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "发件人身份是一堆乱码，我尝试在邮件网站中搜索这个人，却发现这个账号并不存在。",
    nextSceneId: "dorm_act4_mail_interesting",
  },

  dorm_act4_mail_interesting: {
    id: "dorm_act4_mail_interesting",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（有意思。）",
    nextSceneId: "dorm_act4_mail_analyze",
  },

  // ── 分析邮件（每句独立场景）──

  dorm_act4_mail_analyze: {
    id: "dorm_act4_mail_analyze",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "不知是不是在高压的环境下生活惯了，我看完这封邮件后的感受中，恐惧仅占三成。\n\n我长舒一口气，很快接受了这个事实，开始思考邮件里的内容。",
    nextSceneId: "dorm_act4_analyze_2",
  },

  dorm_act4_analyze_2: {
    id: "dorm_act4_analyze_2",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "首先，关于这封邮件的虚实，我认为其所言大概率不是恶作剧。\n\n昨晚电脑反复开机就是一种预兆，同时也暗示我对方的科技实力不是如今的人类可以匹敌的。\n\n哪怕这很荒谬，我也不得不承认，邮件的发送者，或者说这场比赛的举办方，如果不是思想极端的科研恐怖分子，只能是来自比人类更高层次文明的智慧生物了。",
    nextSceneId: "dorm_act4_analyze_3",
  },

  dorm_act4_analyze_3: {
    id: "dorm_act4_analyze_3",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "但愿是我异想天开了。\n\n还有这个\"资质出众\"。\n\n说到这都有点好笑，我真想不通自己哪里资质出众了。\n\n找高智商参赛者应该找研究院的研究人员或者前沿科技开发者，找高武力值参赛者应该找军人武警之类的……我这种大学生就像待宰的羔羊，除了比这些人的未来有更多不确定因素还有什么优势？",
    nextSceneId: "dorm_act4_analyze_inner",
  },

  dorm_act4_analyze_inner: {
    id: "dorm_act4_analyze_inner",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（真有够扯的，不过这奇怪的评判逻辑目前也没必要深究是了。）",
    nextSceneId: "dorm_act4_analyze_prep",
  },

  dorm_act4_analyze_prep: {
    id: "dorm_act4_analyze_prep",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "接下来是我准备的重点。根据三条提示，我可以得到以下信息：",
    nextSceneId: "dorm_act4_tip1",
  },

  // ── 第一条提示（选项）──

  dorm_act4_tip1: {
    id: "dorm_act4_tip1",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      {
        id: "dorm_act4_tip1_choice",
        text: "查看第一条提示",
        nextSceneId: "dorm_act4_tip1_narrate",
        effects: {},
        tags: [],
        needAIAnalysis: false,
      },
    ],
  },

  dorm_act4_tip1_narrate: {
    id: "dorm_act4_tip1_narrate",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "按需准备15日的能量摄入来源。",
    nextSceneId: "dorm_act4_tip1_inner",
  },

  dorm_act4_tip1_inner: {
    id: "dorm_act4_tip1_inner",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（初赛一共15天，参赛者需自行解决温饱问题。）",
    nextSceneId: "dorm_act4_tip2",
  },

  // ── 第二条提示（选项）──

  dorm_act4_tip2: {
    id: "dorm_act4_tip2",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      {
        id: "dorm_act4_tip2_choice",
        text: "查看第二条提示",
        nextSceneId: "dorm_act4_tip2_narrate",
        effects: {},
        tags: [],
        needAIAnalysis: false,
      },
    ],
  },

  dorm_act4_tip2_narrate: {
    id: "dorm_act4_tip2_narrate",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "依据个人身体素质准备强度不一的防身武器。",
    nextSceneId: "dorm_act4_tip2_inner",
  },

  dorm_act4_tip2_inner: {
    id: "dorm_act4_tip2_inner",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（比赛过程很危险，可能存在致命伤害源。）",
    nextSceneId: "dorm_act4_tip3",
  },

  // ── 第三条提示（选项）──

  dorm_act4_tip3: {
    id: "dorm_act4_tip3",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      {
        id: "dorm_act4_tip3_choice",
        text: "查看第三条提示",
        nextSceneId: "dorm_act4_tip3_narrate1",
        effects: {},
        tags: [],
        needAIAnalysis: false,
      },
    ],
  },

  dorm_act4_tip3_narrate1: {
    id: "dorm_act4_tip3_narrate1",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "尽量保持稳定的磁场紊乱状态。",
    nextSceneId: "dorm_act4_tip3_inner1",
  },

  dorm_act4_tip3_inner1: {
    id: "dorm_act4_tip3_inner1",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（不过\"稳定的磁场紊乱状态\"是什么？）",
    nextSceneId: "dorm_act4_tip3_narrate2",
  },

  dorm_act4_tip3_narrate2: {
    id: "dorm_act4_tip3_narrate2",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "这自相矛盾的形容词让我云里雾里的。\n\n只能确定一点，这里的\"磁场\"肯定不是物理学中的磁场。其他信息还是先不要胡乱猜测的好。",
    nextSceneId: "dorm_act4_tip3_narrate3",
  },

  dorm_act4_tip3_narrate3: {
    id: "dorm_act4_tip3_narrate3",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "至于规则这一块……有意思的是，只有一条规则，但这条规则也真是够致命的。",
    nextSceneId: "dorm_act4_tip3_inner2",
  },

  dorm_act4_tip3_inner2: {
    id: "dorm_act4_tip3_inner2",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。）",
    nextSceneId: "dorm_act4_tip3_narrate4",
  },

  dorm_act4_tip3_narrate4: {
    id: "dorm_act4_tip3_narrate4",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "或许\"寻找规则\"也是比赛的评判标准之一。\n\n另外，参赛者之间的关系也需要注意。",
    nextSceneId: "dorm_act4_tip3_choices",
  },

  // 第三条提示 → 策略选择（纯选项场景，旁白已在上一页显示完毕）
  dorm_act4_tip3_choices: {
    id: "dorm_act4_tip3_choices",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      {
        id: "dorm_act4_strategy_trust",
        text: "虽然表面上是竞争者，但我并没有单枪匹马通关的信心",
        nextSceneId: "dorm_act4_choice_trust",
        effects: {
          trustLevel: 1,
          empathyLevel: 1,
          realityJudgment: 1,
        },
        tags: ["信任", "共赢", "理智", "目光长远"],
        needAIAnalysis: true,
      },
      {
        id: "dorm_act4_strategy_lone",
        text: "这是一个死亡游戏，社会规则会变得比我现在身处的社会更加残酷，每一个参赛者都是潜在的敌人",
        nextSceneId: "dorm_act4_choice_lone",
        effects: {
          trustLevel: -2,
          empathyLevel: -1,
          selfProtection: 2,
        },
        tags: ["冷漠", "自私", "悲观厌世", "防御"],
        needAIAnalysis: true,
      },
      {
        id: "dorm_act4_strategy_optimist",
        text: "或许在新的世界，我反而能找到真正志同道合的同伴",
        nextSceneId: "dorm_act4_choice_optimist",
        effects: {
          trustLevel: 2,
          empathyLevel: 2,
          joyPerception: 1,
          authorityResistance: 1,
        },
        tags: ["乐观", "勇敢", "信任", "机敏", "思辨", "渴望被理解", "个性"],
        needAIAnalysis: true,
      },
    ],
  },

  // ── 策略选择分支（每句独立）──

  dorm_act4_choice_trust: {
    id: "dorm_act4_choice_trust",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（从古至今，人类一直是彼此扶持着一路走来的。单枪匹马只属于实力超群的强者，但游戏还没开始，我怎么能确定自己是那个强者呢？）",
    nextSceneId: "dorm_act4_prepare_think",
  },

  dorm_act4_choice_lone: {
    id: "dorm_act4_choice_lone",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（无论身处何处，我都必须要赢。）",
    nextSceneId: "dorm_act4_prepare_think",
  },

  dorm_act4_choice_optimist: {
    id: "dorm_act4_choice_optimist",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（我生来就不是正常人。我曾认命地认为人类无法真正地理解彼此，因为谁都无法复刻他人的人生。但是谁能保证新的世界中我无法体验别人的人生呢？）",
    nextSceneId: "dorm_act4_choice_optimist_narrate",
  },

  dorm_act4_choice_optimist_narrate: {
    id: "dorm_act4_choice_optimist_narrate",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "想到这里，我心里反而隐隐有些期待。\n\n或许我真的是个疯子吧。",
    nextSceneId: "dorm_act4_prepare_think",
  },

  // ── 准备出发 ──

  dorm_act4_prepare_think: {
    id: "dorm_act4_prepare_think",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（那么，接下来就是准备行囊了。）",
    nextSceneId: "dorm_act4_prepare_depart",
  },

  dorm_act4_prepare_depart: {
    id: "dorm_act4_prepare_depart",
    chapter: "序章",
    background: "/assets/CG/前兆/邮件.png",
    cgMode: true,
    speaker: "旁白",
    text: "我整理完思绪，两眼一睁就是飞奔到楼下的小卖部。",
  },

};
