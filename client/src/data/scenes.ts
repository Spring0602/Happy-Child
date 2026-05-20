import type { Scene } from "../types/game";

export const scenes: Record<string, Scene> = {
  start: {
    id: "start",
    chapter: "序章：前兆",
    background: "/assets/bg/dorm_rain.svg",
    speaker: "旁白",
    text:
      "凌晨四点四十六分，叶平生终于解决完所有 bug。雨声垂落如帘，他本以为这只是普通的一夜。",
    nextSceneId: "email_arrives",
  },

  email_arrives: {
    id: "email_arrives",
    chapter: "序章：前兆",
    background: "/assets/bg/dorm_dark.svg",
    speaker: "系统邮件",
    text:
      "亲爱的预备参赛者：由于系统检测到您在‘人类’智慧群体中资质出众，您将成为第一批进入‘人类进化计划’筛选的参赛者。",
    choices: [
      {
        id: "prepare_carefully",
        text: "冷静分析邮件内容，准备食物和防身用品。",
        nextSceneId: "enter_instance",
        effects: {
          realityJudgment: 2,
          selfProtection: 2,
          truthDesire: 1,
        },
        tags: ["理性", "准备", "风险意识"],
        needAIAnalysis: true,
      },
      {
        id: "ignore_email",
        text: "认为这只是恶作剧，先不理会。",
        nextSceneId: "enter_instance",
        effects: {
          realityJudgment: -1,
          selfProtection: -2,
        },
        tags: ["逃避", "低估风险"],
        needAIAnalysis: true,
      },
    ],
  },

  enter_instance: {
    id: "enter_instance",
    chapter: "副本一：快乐小孩",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "系统",
    text:
      "副本一：快乐小孩。你是个讨人喜欢的快乐小孩。通关要求：在副本内存活一周，或洞察真相，证明你的快乐。",
    nextSceneId: "room_rules",
  },

  room_rules: {
    id: "room_rules",
    chapter: "家庭区域",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "叶平生",
    text:
      "桌上那本封面温馨的计划本，和整个房间格格不入。它像是某种规则，又像是某种诅咒。",
    choices: [
      {
        id: "read_plan",
        text: "立刻阅读计划本。",
        nextSceneId: "family_rules",
        effects: {
          truthDesire: 2,
          realityJudgment: 1,
        },
        needAIAnalysis: true,
      },
      {
        id: "hide_bag_first",
        text: "先藏好行囊，避免暴露参赛者身份。",
        nextSceneId: "family_rules",
        effects: {
          selfProtection: 2,
          realityJudgment: 1,
        },
        needAIAnalysis: true,
      },
    ],
  },

  family_rules: {
    id: "family_rules",
    chapter: "家庭区域",
    background: "/assets/bg/bedroom_day.svg",
    speaker: "规则",
    text:
      "我们是幸福快乐的一家。我是美好社会中遵纪守法的好公民。我的房间井井有条，我从来不迟到，我的作业不会迟交。",
    nextSceneId: "school_first_day",
  },

  school_first_day: {
    id: "school_first_day",
    chapter: "学校区域",
    background: "/assets/bg/classroom_evening.svg",
    speaker: "旁白",
    text:
      "教室里分成两个阵营。一部分学生安静学习，另一部分学生嬉笑打闹。你看见了刘宇，也看见了周骐瑞。",
    choices: [
      {
        id: "observe_class",
        text: "先观察班级人数和座位。",
        nextSceneId: "liu_yu_test",
        effects: {
          truthDesire: 2,
          selfProtection: 1,
        },
        needAIAnalysis: true,
      },
      {
        id: "talk_to_liuyu",
        text: "主动和刘宇搭话。",
        nextSceneId: "liu_yu_test",
        effects: {
          trust: 2,
          empathy: 1,
        },
        needAIAnalysis: true,
      },
    ],
  },

  liu_yu_test: {
    id: "liu_yu_test",
    chapter: "学校区域",
    background: "/assets/bg/school_gate_night.svg",
    speaker: "刘宇",
    character: "liuyu",
    text:
      "“有事一定要联系我，不准一个人硬撑。”他笑着说，语气轻松得像是一切都没有发生。",
    choices: [
      {
        id: "trust_liuyu_half",
        text: "告诉刘宇一部分情况，但保留核心信息。",
        nextSceneId: "wang_teacher_hint",
        effects: {
          trust: 1,
          selfProtection: 1,
          realityJudgment: 1,
        },
        needAIAnalysis: true,
      },
      {
        id: "reject_liuyu",
        text: "拒绝刘宇的帮助，独自调查。",
        nextSceneId: "wang_teacher_hint",
        effects: {
          trust: -2,
          selfProtection: 1,
          authorityResistance: 1,
        },
        needAIAnalysis: true,
      },
    ],
  },

  wang_teacher_hint: {
    id: "wang_teacher_hint",
    chapter: "美术课 / 王老师",
    background: "/assets/bg/art_room.svg",
    speaker: "王老师",
    character: "wangTeacher",
    text:
      "“做你自己就好。”老人笑着说。那双眼睛清澈，却像能看穿所有伪装。",
    choices: [
      {
        id: "ask_direct_truth",
        text: "直接追问副本真相。",
        nextSceneId: "ending_preview",
        effects: {
          truthDesire: 2,
          authorityResistance: 1,
          selfProtection: -1,
        },
        needAIAnalysis: true,
      },
      {
        id: "accept_trade",
        text: "接受等价交换，询问‘镜中尸骸、湖中遗物、书中落叶’。",
        nextSceneId: "ending_preview",
        effects: {
          realityJudgment: 2,
          truthDesire: 1,
          selfProtection: 1,
        },
        needAIAnalysis: true,
      },
    ],
  },

  ending_preview: {
    id: "ending_preview",
    chapter: "临时结局裁决演示",
    background: "/assets/bg/rule_warning.svg",
    speaker: "系统",
    text:
      "当前版本暂时在此进入 AI 结局裁决演示。正式版本中，这里将接入 3 班逃生、全校追杀、删除‘好孩子’规则、镜中真相与天台对话。",
    aiEvent: "ending_judge",
  },
};
