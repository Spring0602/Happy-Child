import type { Scene } from "../types/game";

// ══════════════════════════════════════════════════════════════
// scenes.ts · 第1章场景树 + 客厅交互场景
//
// 场景ID命名规则：ch{n}_{event} / dorm_act{n}_{event}
// 当前覆盖：
//   序章·前兆（宿舍→阳台→深夜探索→清晨→邮件→赛前准备→游戏开始）
//   客厅交互（垃圾桶/茶几/电视/盆栽/椅子）
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
          trust: 1,
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
          trust: 1,
          empathy: 1,
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
          trust: -2,
          empathy: -1,
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
          trust: 2,
          empathy: 2,
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
    nextSceneId: "dorm_act4_god_view",
  },

  // ── 第六部分尾声：上帝视角 ──
  dorm_act4_god_view: {
    id: "dorm_act4_god_view",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "室友A",
    text: "我的天，叶卷卷这是怎么了？真卷起一阵风了。",
    nextSceneId: "dorm_act4_god_view_narrate",
  },

  dorm_act4_god_view_narrate: {
    id: "dorm_act4_god_view_narrate",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "陈煜浩轻轻瞥了眼我离开的方向，眸光一暗。",
    nextSceneId: "ch1_shop_school_enter",
  },

  // ══════════════════════════════════════════════
  // 第七部分 · 赛前准备
  // ══════════════════════════════════════════════

  // ── 7.1 校园小卖部：进入 ──
  ch1_shop_school_enter: {
    id: "ch1_shop_school_enter",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（整整十五天的口粮，我必须要攒够，样样都买一点吧。）",
    nextSceneId: "ch1_shop_school_enter_narrate",
  },

  ch1_shop_school_enter_narrate: {
    id: "ch1_shop_school_enter_narrate",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我像个打劫的不法分子，开始把整个小卖部洗劫一空。",
  },

  // ── 7.1 校园小卖部：自由探索 triggers（购买阶段） ──
  shop_school_interact_drink: {
    id: "shop_school_interact_drink",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（充足的水分是很重要的。）",
  },

  shop_school_interact_food: {
    id: "shop_school_interact_food",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（体积小易携带，是个好选择。）",
  },

  shop_school_interact_chips: {
    id: "shop_school_interact_chips",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（我是很爱吃，但是条件估计不允许。）\n\n（诶，命苦的我。）",
  },

  shop_school_interact_meat: {
    id: "shop_school_interact_meat",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（这个好吃，要了。）",
  },

  shop_school_interact_fruit: {
    id: "shop_school_interact_fruit",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（我可不想得坏血病。买了。）",
  },

  shop_school_interact_exit: {
    id: "shop_school_interact_exit",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（我还不想死。）",
  },

  shop_school_interact_checkout: {
    id: "shop_school_interact_checkout",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（结什么帐，事儿还没办完呢。）",
  },

  shop_school_interact_floor: {
    id: "shop_school_interact_floor",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（没什么需要的东西了。）",
  },

  // ── 7.1 校园小卖部：结账阶段 trigger 变体 ──
  shop_school_checkout_drink: {
    id: "shop_school_checkout_drink",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  shop_school_checkout_food: {
    id: "shop_school_checkout_food",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  shop_school_checkout_chips: {
    id: "shop_school_checkout_chips",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  shop_school_checkout_meat: {
    id: "shop_school_checkout_meat",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  shop_school_checkout_fruit: {
    id: "shop_school_checkout_fruit",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  shop_school_checkout_exit: {
    id: "shop_school_checkout_exit",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（我还不想死。）",
  },

  shop_school_checkout_floor: {
    id: "shop_school_checkout_floor",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（去结账吧。）",
  },

  // ── 7.1 校园小卖部：离开阶段 trigger 变体 ──
  shop_school_leave_drink: {
    id: "shop_school_leave_drink",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_food: {
    id: "shop_school_leave_food",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_chips: {
    id: "shop_school_leave_chips",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_meat: {
    id: "shop_school_leave_meat",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_fruit: {
    id: "shop_school_leave_fruit",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_checkout: {
    id: "shop_school_leave_checkout",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  shop_school_leave_floor: {
    id: "shop_school_leave_floor",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  // ── 7.1 校园小卖部：购买完成 ──
  ch1_shop_school_buy_done: {
    id: "ch1_shop_school_buy_done",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（就买这么多吧，应该够用了。）\n\n（接下来去结账吧。）",
  },

  // ── 7.1 校园小卖部：结账完成 ──
  ch1_shop_school_checkout_done: {
    id: "ch1_shop_school_checkout_done",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "商品已经没剩多少了，老板娘吓了一跳，好奇地问，",
    nextSceneId: "ch1_shop_school_checkout_boss",
  },

  ch1_shop_school_checkout_boss: {
    id: "ch1_shop_school_checkout_boss",
    chapter: "序章",
    background: "",
    speaker: "老板娘",
    text: "小伙子，你买这么多东西干什么？",
    nextSceneId: "ch1_shop_school_checkout_evade",
  },

  ch1_shop_school_checkout_evade: {
    id: "ch1_shop_school_checkout_evade",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我搪塞道，",
    nextSceneId: "ch1_shop_school_checkout_lie",
  },

  ch1_shop_school_checkout_lie: {
    id: "ch1_shop_school_checkout_lie",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "大娘，我这不是一个月以后要参加创新大赛么，心里不踏实，想花半个月闭关修炼，哈哈……",
    nextSceneId: "ch1_shop_school_checkout_worry",
  },

  ch1_shop_school_checkout_worry: {
    id: "ch1_shop_school_checkout_worry",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "老板娘瞅了眼我购物袋里的膨化食品和速食，脸上写满了担忧，",
    nextSceneId: "ch1_shop_school_checkout_boss2",
  },

  ch1_shop_school_checkout_boss2: {
    id: "ch1_shop_school_checkout_boss2",
    chapter: "序章",
    background: "",
    speaker: "老板娘",
    text: "年纪轻轻也要注意身体啊，我听说现在30岁病死的年轻人多的是呢。",
    nextSceneId: "ch1_shop_school_checkout_laugh",
  },

  ch1_shop_school_checkout_laugh: {
    id: "ch1_shop_school_checkout_laugh",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（笑）没事没事，您不用担心。我知道的。",
    nextSceneId: "ch1_shop_school_checkout_done_end",
  },

  ch1_shop_school_checkout_done_end: {
    id: "ch1_shop_school_checkout_done_end",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "闲聊的过程中，账已经结好了。",
    nextSceneId: "ch1_shop_school_checkout_think",
  },

  ch1_shop_school_checkout_think: {
    id: "ch1_shop_school_checkout_think",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（该去下一个目的地了。）",
  },

  // ── 7.1 校园小卖部：离开告别 ──
  ch1_shop_school_farewell: {
    id: "ch1_shop_school_farewell",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我忽然像是想起了什么，下意识朝老板娘挥挥手，",
    nextSceneId: "ch1_shop_school_farewell_bye",
  },

  ch1_shop_school_farewell_bye: {
    id: "ch1_shop_school_farewell_bye",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "再见，大娘！",
    nextSceneId: "ch1_shop_school_farewell_warm",
  },

  ch1_shop_school_farewell_warm: {
    id: "ch1_shop_school_farewell_warm",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "她慈祥地笑了笑。\n\n我心中温暖的感觉冲散了先前积攒的压力和紧张感，现在心情平静了不少。",
    nextSceneId: "ch1_shop_school_think",
  },

  // ── 7.1 校园小卖部：CG 思考过渡 ──
  ch1_shop_school_think: {
    id: "ch1_shop_school_think",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "不过采购完食品以后，我又遇到了一个问题——学校内不允许售卖刀具，宿舍内刀具则是违禁品，我要买防身用品的话只能到校外，或者点外卖送达。\n\n现在是23：32，点外卖也要30分钟起步，还不如在学校附近找找呢。\n\n我骑着小电驴来到了离校最近的厨房用品店，我走进店内时，柜台前已经排了3个人。",
    nextSceneId: "ch1_shop_enter",
  },

  // ── 7.2 厨房用品店：进入 ──
  ch1_shop_enter: {
    id: "ch1_shop_enter",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（这一片区域是大学城，时效最高的有且仅有这一家厨房用品店，不过往常这个时候，店里应该基本没人才对。）",
    nextSceneId: "ch1_shop_enter_narrate",
  },

  ch1_shop_enter_narrate: {
    id: "ch1_shop_enter_narrate",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "这3个人1女2男，看着都像附近的大学生。",
    nextSceneId: "ch1_shop_enter_think",
  },

  ch1_shop_enter_think: {
    id: "ch1_shop_enter_think",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（除非他们也是和我一样的\u201C变数\u201D。）",
    nextSceneId: "ch1_shop_enter_strategy",
  },

  ch1_shop_enter_strategy: {
    id: "ch1_shop_enter_strategy",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "邮件中提到禁止将比赛信息泄露给无关人员。同为参赛者的话应该不会涉及泄密问题吧？\n\n如果能在赛前确认哪怕一小部分信息，赛中都将获得巨大的优势。就算风险很大，但我也认为这值得我赌一把。\n\n我在手机备忘录里用最大号字体输入了自己的姓名，然后又用正常字体写下了几个需要和其他参赛者确认的问题。",
    nextSceneId: "ch1_shop_enter_weapon",
  },

  ch1_shop_enter_weapon: {
    id: "ch1_shop_enter_weapon",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（接下来先找把趁手的防身武器。）",
  },

  // ── 7.2 厨房用品店：自由探索 triggers ──
  ch1_shop_interact_knife: {
    id: "ch1_shop_interact_knife",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（这个不错，就拿它吧。）",
  },

  ch1_shop_interact_spatula: {
    id: "ch1_shop_interact_spatula",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（没啥用。）",
  },

  ch1_shop_interact_cleaver: {
    id: "ch1_shop_interact_cleaver",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（太笨重了，不适合随身携带。）",
  },

  ch1_shop_interact_pan: {
    id: "ch1_shop_interact_pan",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（这是红太狼的专武，不是我的。）",
  },

  ch1_shop_interact_queue_no_weapon: {
    id: "ch1_shop_interact_queue_no_weapon",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（我还没选商品。）",
  },

  ch1_shop_interact_queue: {
    id: "ch1_shop_interact_queue",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（选好了，去排队吧。）",
    onCgEnd: "shop_exchange_start",
  },

  // ── 7.2 厨房用品店：交换线索 ──
  ch1_shop_exchange_1: {
    id: "ch1_shop_exchange_1",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "此时是23：40，时间够晚，基本可以确定这附近参赛者数目不少。\n\n时间紧迫，我拍了拍排在我前面的女生的肩膀，她立即像一只受惊的小白兔一样转过身来。",
    nextSceneId: "ch1_shop_exchange_2",
  },

  ch1_shop_exchange_2: {
    id: "ch1_shop_exchange_2",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我随即将手机举到她面前，然后仔细观察她的面部表情。\n\n看到第一个问题后，她脸上纯良的表情逐渐变得狠戾。",
    nextSceneId: "ch1_shop_exchange_3",
  },

  ch1_shop_exchange_3: {
    id: "ch1_shop_exchange_3",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "【我们的规则是什么？】",
    nextSceneId: "ch1_shop_exchange_4",
  },

  ch1_shop_exchange_4: {
    id: "ch1_shop_exchange_4",
    chapter: "序章",
    background: "",
    speaker: "女生",
    text: "【没有具体规则。】",
    nextSceneId: "ch1_shop_exchange_5",
  },

  ch1_shop_exchange_5: {
    id: "ch1_shop_exchange_5",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我暗自松了口气。",
    nextSceneId: "ch1_shop_exchange_6",
  },

  ch1_shop_exchange_6: {
    id: "ch1_shop_exchange_6",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（赌对了。）",
    nextSceneId: "ch1_shop_exchange_7",
  },

  ch1_shop_exchange_7: {
    id: "ch1_shop_exchange_7",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "【你怎么理解第三条提示？】",
    nextSceneId: "ch1_shop_exchange_8",
  },

  ch1_shop_exchange_8: {
    id: "ch1_shop_exchange_8",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "女生沉默了，随即警觉地看着我。\n\n好吧，她需要我先展示诚意。",
    nextSceneId: "ch1_shop_exchange_9",
  },

  ch1_shop_exchange_9: {
    id: "ch1_shop_exchange_9",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "【这只是我的猜测。网络上最近很流行把一个人的气质和具有的能量称为\u201C磁场\u201D，从逻辑角度分析，第三条提示中的\u201C磁场\u201D按这个意思理解是合理的。不过结合邮件的用词风格来看，发件人对社会现状并不是很了解，因此，我不是很确定。】",
    nextSceneId: "ch1_shop_exchange_10",
  },

  ch1_shop_exchange_10: {
    id: "ch1_shop_exchange_10",
    chapter: "序章",
    background: "",
    speaker: "女生",
    text: "【我认可你的想法，但我认为这里的\u201C磁场\u201D还有更广义的意思。既然筛选对象是人类，那么这个词用来描述人类不假。它应该既可以描述个体，也可以描述群体。】",
    nextSceneId: "ch1_shop_exchange_11",
  },

  ch1_shop_exchange_11: {
    id: "ch1_shop_exchange_11",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "【什么意思？】",
    nextSceneId: "ch1_shop_exchange_12",
  },

  ch1_shop_exchange_12: {
    id: "ch1_shop_exchange_12",
    chapter: "序章",
    background: "",
    speaker: "女生",
    text: "【点到为止。】",
    nextSceneId: "ch1_shop_exchange_13",
  },

  ch1_shop_exchange_13: {
    id: "ch1_shop_exchange_13",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（哈，算盘打得挺精啊。）",
    nextSceneId: "ch1_shop_exchange_14",
  },

  ch1_shop_exchange_14: {
    id: "ch1_shop_exchange_14",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我也没有死缠烂打，毕竟这个场合不宜搞出太大动静。\n\n最后她给我透露了她的姓名——林芷萱，以及联系方式。",
    nextSceneId: "ch1_shop_exchange_15",
  },

  ch1_shop_exchange_15: {
    id: "ch1_shop_exchange_15",
    chapter: "序章",
    background: "",
    speaker: "叶平生",
    text: "（看来还是和她有合作可能的。）",
    nextSceneId: "ch1_shop_cg_transition",
  },

  // ── 7.2 厨房用品店：CG 过渡 ──
  ch1_shop_cg_transition: {
    id: "ch1_shop_cg_transition",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "不知不觉排到了林芷萱，而这时不速之客却找上了门。\n\n是个红毛不良少年。",
    nextSceneId: "ch1_shop_confrontation",
  },

  // ── 7.2 厨房用品店：挑衅 ──
  ch1_shop_confrontation: {
    id: "ch1_shop_confrontation",
    chapter: "序章",
    background: "",
    speaker: "红毛",
    text: "呵，在店里都不忘把妹呢。你小子，和她聊什么聊这么开心？和我也说说呗。",
    nextSceneId: "ch1_shop_confront_choice",
  },

  ch1_shop_confront_choice: {
    id: "ch1_shop_confront_choice",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我不爽地皱眉。\n\n看来用手机交流还是太显眼了。\n\n我决定——",
    choices: [
      {
        id: "ch1_shop_fight_back",
        text: "你小子找茬是吧？我长这么大，向来有仇必当场报",
        nextSceneId: "ch1_shop_confront_hard",
        effects: {},
        tags: ["果断", "冲动", "个性", "勇敢", "反叛", "自私"],
        needAIAnalysis: true,
      },
      {
        id: "ch1_shop_smooth_talk",
        text: "嗐，还能聊什么。我能聊的内容，像哥们你这么帅的人不应该早知道了么？",
        nextSceneId: "ch1_shop_confront_smooth",
        effects: {},
        tags: ["圆滑", "理性", "稳重", "机敏", "有大局观", "有趣"],
        needAIAnalysis: true,
      },
    ],
  },

  // ── 7.2 厨房用品店：硬刚分支 ──
  ch1_shop_confront_hard: {
    id: "ch1_shop_confront_hard",
    chapter: "序章",
    background: "",
    speaker: "红毛",
    text: "你说什么？是想在这里和老子打架么？刚好把你手机抢过来瞧瞧！",
    nextSceneId: "ch1_shop_confront_boss_interrupt",
  },

  ch1_shop_confront_boss_interrupt: {
    id: "ch1_shop_confront_boss_interrupt",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "老板一边帮林芷萱结账一边不耐烦道，",
    nextSceneId: "ch1_shop_confront_boss_warn",
  },

  ch1_shop_confront_boss_warn: {
    id: "ch1_shop_confront_boss_warn",
    chapter: "序章",
    background: "",
    speaker: "老板",
    text: "这位客人，麻烦不要在店里闹事。",
    nextSceneId: "ch1_shop_confront_red_hair_retort",
  },

  ch1_shop_confront_red_hair_retort: {
    id: "ch1_shop_confront_red_hair_retort",
    chapter: "序章",
    background: "",
    speaker: "红毛",
    text: "你也活腻了是不是？",
    nextSceneId: "ch1_shop_confront_boss_silent",
  },

  ch1_shop_confront_boss_silent: {
    id: "ch1_shop_confront_boss_silent",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "老板瞬间闭了嘴。",
    onCgEnd: "shop_lzx_leave",
  },

  // ── 7.2 厨房用品店：圆滑分支 ──
  ch1_shop_confront_smooth: {
    id: "ch1_shop_confront_smooth",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "我看着手机上提示的23：47，手心早已布满汗水。\n\n如果我没能在零点之前将一切都准备好，我很有可能活不过第一天。",
    nextSceneId: "ch1_shop_confront_smooth_retort",
  },

  ch1_shop_confront_smooth_retort: {
    id: "ch1_shop_confront_smooth_retort",
    chapter: "序章",
    background: "",
    speaker: "红毛",
    text: "拍马屁老子见多了。还拿这蠢话术骗谁呢！？把你手机交出来！",
    nextSceneId: "ch1_shop_confront_smooth_boss_interrupt",
  },

  ch1_shop_confront_smooth_boss_interrupt: {
    id: "ch1_shop_confront_smooth_boss_interrupt",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "老板一边帮林芷萱结账一边不耐烦道，",
    nextSceneId: "ch1_shop_confront_smooth_boss_warn",
  },

  ch1_shop_confront_smooth_boss_warn: {
    id: "ch1_shop_confront_smooth_boss_warn",
    chapter: "序章",
    background: "",
    speaker: "老板",
    text: "这位客人，麻烦不要在店里闹事。",
    nextSceneId: "ch1_shop_confront_smooth_red_hair",
  },

  ch1_shop_confront_smooth_red_hair: {
    id: "ch1_shop_confront_smooth_red_hair",
    chapter: "序章",
    background: "",
    speaker: "红毛",
    text: "你也活腻了是不是？",
    nextSceneId: "ch1_shop_confront_smooth_silent",
  },

  ch1_shop_confront_smooth_silent: {
    id: "ch1_shop_confront_smooth_silent",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "老板瞬间闭了嘴。",
    onCgEnd: "shop_lzx_leave",
  },

  // ── 7.2 厨房用品店：CG 林芷萱离开 ──
  ch1_shop_lzx_leave: {
    id: "ch1_shop_lzx_leave",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "林芷萱结完账，趁乱逃离了店铺。",
    nextSceneId: "ch1_shop_lzx_leave_branch",
  },

  ch1_shop_lzx_leave_branch: {
    id: "ch1_shop_lzx_leave_branch",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "",
    text: "",
    // 分支由 handleNext → 根据 flag_clear 选择路径
  },

  // ── 7.2 厨房用品店：flag_clear=true（圆滑选项）后续 ──
  ch1_shop_clear_smooth_path: {
    id: "ch1_shop_clear_smooth_path",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "已经没多少时间了，我得赶紧把他们支开。这人要抢我手机，我估计在场没人会主动帮我。\n\n我得自救。\n\n我注意到最先结账的男生一言不发地藏匿在角落里并没有离开，而是冷漠地看着这场闹戏。\n\n他头上宽大的兜帽在他脸上投下一片阴影，我看不清他的脸。但好在他身着作战服，隐隐勾勒出肌肉的轮廓，我看得出来这人很能打。",
    nextSceneId: "ch1_shop_clear_smooth_think",
  },

  ch1_shop_clear_smooth_think: {
    id: "ch1_shop_clear_smooth_think",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "叶平生",
    text: "（话说，他怎么有时间买作战服的？）",
    nextSceneId: "ch1_shop_clear_smooth_narrate",
  },

  ch1_shop_clear_smooth_narrate: {
    id: "ch1_shop_clear_smooth_narrate",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "算了，这不是重点。",
    nextSceneId: "ch1_shop_clear_smooth_call",
  },

  ch1_shop_clear_smooth_call: {
    id: "ch1_shop_clear_smooth_call",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "我冲那个男生喊道，",
    nextSceneId: "ch1_shop_clear_smooth_shout",
  },

  ch1_shop_clear_smooth_shout: {
    id: "ch1_shop_clear_smooth_shout",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "叶平生",
    text: "大哥，你快来替我收拾他！他抢我手机！",
    nextSceneId: "ch1_shop_clear_smooth_trick",
  },

  ch1_shop_clear_smooth_trick: {
    id: "ch1_shop_clear_smooth_trick",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "对付混混，就该用魔法打败魔法。\n\n角落里的男生抬起头，眼中多了一丝惊愕。\n\n红毛慌了神，",
    nextSceneId: "ch1_shop_clear_smooth_red_hair",
  },

  ch1_shop_clear_smooth_red_hair: {
    id: "ch1_shop_clear_smooth_red_hair",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "红毛",
    text: "什么？",
    nextSceneId: "ch1_shop_clear_smooth_distracted",
  },

  ch1_shop_clear_smooth_distracted: {
    id: "ch1_shop_clear_smooth_distracted",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "太好了，他的注意力不在我身上了。",
    nextSceneId: "ch1_shop_converge",
  },

  // ── 7.2 厨房用品店：flag_clear=false（硬刚选项）后续 ──
  ch1_shop_hard_path: {
    id: "ch1_shop_hard_path",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "我正要对他出手，却有一只强有力的臂弯拦住了我。",
    nextSceneId: "ch1_shop_hard_question",
  },

  ch1_shop_hard_question: {
    id: "ch1_shop_hard_question",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "叶平生",
    text: "？",
    nextSceneId: "ch1_shop_hard_mysterious",
  },

  ch1_shop_hard_mysterious: {
    id: "ch1_shop_hard_mysterious",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "？？？",
    text: "你走。",
    nextSceneId: "ch1_shop_hard_red_hair",
  },

  ch1_shop_hard_red_hair: {
    id: "ch1_shop_hard_red_hair",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "红毛慌了神，",
    nextSceneId: "ch1_shop_hard_red_hair2",
  },

  ch1_shop_hard_red_hair2: {
    id: "ch1_shop_hard_red_hair2",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "红毛",
    text: "什么？",
    nextSceneId: "ch1_shop_hard_realize",
  },

  ch1_shop_hard_realize: {
    id: "ch1_shop_hard_realize",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "我愣了一下，随即意识到他是在为我解围。",
    nextSceneId: "ch1_shop_converge",
  },

  // ── 7.2 厨房用品店：分支汇聚 ──
  ch1_shop_converge: {
    id: "ch1_shop_converge",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: "我赶紧把商品递给老板，他扫码的过程都战战兢兢的，生怕那红毛又纠缠回来。\n\n我偷瞄那边的情况。那男生一言不发，走到了红毛面前，我甚至都能感受到他身上散发的强烈杀气。",
    nextSceneId: "ch1_shop_converge_red_hair",
  },

  ch1_shop_converge_red_hair: {
    id: "ch1_shop_converge_red_hair",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "红毛",
    text: "你……你不是走了吗？",
    nextSceneId: "ch1_shop_converge_think",
  },

  ch1_shop_converge_think: {
    id: "ch1_shop_converge_think",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "叶平生",
    text: "（嗯？看来他俩之前认识？诶，两个都不好惹，我还是快点溜吧。）",
    nextSceneId: "ch1_shop_converge_escape",
  },

  ch1_shop_converge_escape: {
    id: "ch1_shop_converge_escape",
    chapter: "序章",
    background: "", // 黑屏
    cgMode: true,
    speaker: "旁白",
    text: '我收好水果刀，路过两人时又谄媚地说了句"谢谢大哥"，就骑上小电驴一骑绝尘。',
    nextSceneId: "ch1_game_eve",
  },

  // ── 尾声：参赛前夕 ──
  ch1_game_eve: {
    id: "ch1_game_eve",
    chapter: "序章",
    background: "/assets/CG/前兆/书桌.png",
    cgMode: true,
    speaker: "旁白",
    text: "回到寝室已经是23：55分了。",
    nextSceneId: "ch1_game_eve_rush",
  },

  ch1_game_eve_rush: {
    id: "ch1_game_eve_rush",
    chapter: "序章",
    background: "/assets/CG/前兆/书桌.png",
    cgMode: true,
    speaker: "叶平生",
    text: "（极限五分钟！）",
    nextSceneId: "ch1_game_eve_pack",
  },

  ch1_game_eve_pack: {
    id: "ch1_game_eve_pack",
    chapter: "序章",
    background: "/assets/CG/前兆/书桌.png",
    cgMode: true,
    speaker: "旁白",
    text: "我火急火燎地收拾行囊，柜子都来不及关上。",
    nextSceneId: "ch1_game_eve_roommate",
  },

  ch1_game_eve_roommate: {
    id: "ch1_game_eve_roommate",
    chapter: "序章",
    background: "/assets/CG/前兆/书桌.png",
    cgMode: true,
    speaker: "室友A",
    text: "我靠……真·高速小马达。",
    nextSceneId: "ch1_game_eve_ignore",
  },

  ch1_game_eve_ignore: {
    id: "ch1_game_eve_ignore",
    chapter: "序章",
    background: "/assets/CG/前兆/书桌.png",
    cgMode: true,
    speaker: "旁白",
    text: "我顾不上和室友顶嘴。开赛前30秒，我终于换好了一身运动装，背上了行囊。",
    nextSceneId: "ch1_game_eve_countdown",
  },

  ch1_game_eve_countdown: {
    id: "ch1_game_eve_countdown",
    chapter: "序章",
    background: "", // 全黑
    cgMode: true,
    speaker: "旁白",
    text: "我眼前一黑，下一秒就置身于仿佛一个小型宇宙的空间中。",
    nextSceneId: "ch1_game_start",
  },

  // ── 尾声：游戏开始 ──
  ch1_game_start: {
    id: "ch1_game_start",
    chapter: "序章",
    background: "",
    speaker: "旁白",
    text: "四周数字如星辰点点，星云摇曳，而我漂浮于宇宙中，并无失重感，甚至能正常呼吸。",
    nextSceneId: "ch1_game_start_system",
  },

  ch1_game_start_system: {
    id: "ch1_game_start_system",
    chapter: "序章",
    background: "",
    speaker: "系统",
    text: "欢迎参赛者来到\u201C人类进化计划\u201D候场区~",
    // 第一章完 — 不设 nextSceneId，等待第二章接入
  },

};
