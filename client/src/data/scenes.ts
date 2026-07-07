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


  // ??????????????????????????????????????????????
  // ?4? ? ??????????2?3?????? ch4_exploration_progress ???
  // ??????????????????????????????????????????????

  ch4_exploration_progress: {
    id: "ch4_exploration_progress",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/??????.png",
    cgMode: true,
    speaker: "??",
    text: "??????????????????????????????\n\n??????????????????????????????????????\n\n???????????????1????????5%?",
    nextSceneId: "ch4_find_brochure",
  },

  ch4_find_brochure: {
    id: "ch4_find_brochure",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "?????????????????????????????????\n\n??????????????????????????????????????????????????\n\n?????????????????????????????????????????",
    nextSceneId: "ch4_classroom_rules",
  },

  ch4_classroom_rules: {
    id: "ch4_classroom_rules",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/????.png",
    cgMode: true,
    speaker: "??",
    text: "???????????????????????????\n\n1.????????????????????????????????????????\n\n2.??????????????\n\n3.??????????????????\n\n4.????????????????????????????\n\n5.??????????????????????????\n\n6.??????????????????\n\n7.??????????????????????????\n\n8.????????????????\n\n9.?????30???????????????????",
    nextSceneId: "ch4_brochure_content",
  },

  ch4_brochure_content: {
    id: "ch4_brochure_content",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/???.png",
    cgMode: true,
    speaker: "???",
    text: "???????????????????????????????????????????????????????????????\n\n??????????????????19?00????????\n\n??????????????",
    nextSceneId: "ch4_morning_classroom",
  },

  ch4_morning_classroom: {
    id: "ch4_morning_classroom",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "?????????????????????????\n\n????????????????????????????????",
    nextSceneId: "ch4_morning_liuyu_roster",
  },

  ch4_morning_liuyu_roster: {
    id: "ch4_morning_liuyu_roster",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "????????",
    nextSceneId: "ch4_morning_roster_thanks",
  },

  ch4_morning_roster_thanks: {
    id: "ch4_morning_roster_thanks",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "????????\n\n?????????????????????????????????????????",
    nextSceneId: "ch4_roster_anomaly",
  },

  ch4_roster_anomaly: {
    id: "ch4_roster_anomaly",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/???.png",
    cgMode: true,
    speaker: "??",
    text: "????????????????????????????????\n\n????????????????????????????????????????????\n\n?????",
    choices: [
      { id: "ch4_roster_direct", text: "??????????????", nextSceneId: "ch4_roster_ask_student", effects: { truthDesire: 1, authorityResistance: 1 }, tags: ["??", "??"] },
      { id: "ch4_roster_observe", text: "?????????????????????", nextSceneId: "ch4_roster_observe_scene", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["??", "??"] },
      { id: "ch4_roster_test_liuyu", text: "???????????????????", nextSceneId: "ch4_roster_test_liuyu_scene", effects: { trust: 1, realityJudgment: 1 }, tags: ["????", "??"] },
    ],
  },

  ch4_roster_ask_student: {
    id: "ch4_roster_ask_student",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/???.png",
    cgMode: true,
    speaker: "??",
    text: "????????????????\n\n??????????????????????????????????????????",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_observe_scene: {
    id: "ch4_roster_observe_scene",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "?????????????????????????????????\n\n????????????????????????????????????????\n\n????????????????NPC?????????????????",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_test_liuyu_scene: {
    id: "ch4_roster_test_liuyu_scene",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "???????????????????????????\n\n????????????????????\n\n?????????????????????????????",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_converge: {
    id: "ch4_roster_converge",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/???.png",
    cgMode: true,
    speaker: "???",
    text: "????????????????????????????????????????????\n\n???????????????????",
    nextSceneId: "ch4_class_montage",
  },

  ch4_class_montage: {
    id: "ch4_class_montage",
    chapter: "?4? ? ????",
    background: "/assets/CG/??/????.png",
    cgMode: true,
    speaker: "??",
    text: "?????????????\n\n?????????????????????????????????????????????\n\n?????????????????",
    nextSceneId: "ch4_physics_observe",
  },

  ch4_physics_observe: {
    id: "ch4_physics_observe",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "????????????????????????????????????????\n\n???????????????????????????????????????????????????\n\n???????????????????????",
    choices: [
      { id: "ch4_lunch_punished", text: "????????????????try??", nextSceneId: "ch4_physics_wrong_answer", effects: { realityJudgment: 1, authorityResistance: 1 }, tags: ["??", "??"] },
      { id: "ch4_lunch_not_punished", text: "??????????????????????", nextSceneId: "ch4_physics_hold_back", effects: { selfProtection: 1 }, tags: ["??", "??"] },
    ],
  },

  ch4_physics_wrong_answer: {
    id: "ch4_physics_wrong_answer",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "???????????\n\n???????????????????????????",
    nextSceneId: "ch4_lunch_punishment_reveal",
  },

  ch4_physics_hold_back: {
    id: "ch4_physics_hold_back",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "???????????????????????????\n\n??????????????????????????????????????????????",
    nextSceneId: "ch4_lunch_punishment_reveal",
  },

  ch4_lunch_punishment_reveal: {
    id: "ch4_lunch_punishment_reveal",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "?????",
    text: "?????????????????????????????\n\n?????????????",
    nextSceneId: "ch4_zhou_lunch_approach",
  },

  ch4_zhou_lunch_approach: {
    id: "ch4_zhou_lunch_approach",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "???????\n\n???????????????????????\n\n????????????????????????????????????????????????",
    onCgEnd: "ch4_free_classroom_lunch",
  },

  ch4_zhou_help: {
    id: "ch4_zhou_help",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "??????????????????????????????",
    choices: [
      { id: "ch4_zhou_help_polite", text: "???????????????", nextSceneId: "ch4_zhou_fixed_help", effects: { empathy: 1, realityJudgment: 1 }, tags: ["????"] },
      { id: "ch4_zhou_help_humorous", text: "????????????????????", nextSceneId: "ch4_zhou_fixed_help", effects: { joyPerception: 1 }, tags: ["????"] },
      { id: "ch4_zhou_help_referred", text: "???????????????", nextSceneId: "ch4_zhou_fixed_help", effects: { trust: 1 }, tags: ["????"] },
    ],
  },

  ch4_zhou_fixed_help: {
    id: "ch4_zhou_fixed_help",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "????\n\n??????????????????????????????????\n\n?????????????????????????????????",
    nextSceneId: "ch4_zhou_question_method",
  },

  ch4_zhou_question_method: {
    id: "ch4_zhou_question_method",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "???????????????NPC?????????????????????????????????????",
    choices: [
      { id: "ch4_zhou_respectful", text: "???????????", nextSceneId: "ch4_zhou_respectful_intro", effects: { realityJudgment: 1, trust: 1 }, tags: ["????"] },
      { id: "ch4_zhou_frank", text: "????????????????????", nextSceneId: "ch4_zhou_frank_intro", effects: { trust: 1, truthDesire: 1 }, tags: ["????"] },
      { id: "ch4_zhou_testing", text: "?????????????", nextSceneId: "ch4_zhou_testing_intro", effects: { selfProtection: 1, truthDesire: 1 }, tags: ["??"] },
    ],
  },

  ch4_zhou_respectful_intro: {
    id: "ch4_zhou_respectful_intro",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "???\n\n?????????????????????????????????",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_frank_intro: {
    id: "ch4_zhou_frank_intro",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "?????????????????\n\n??????????????????\n\n???????????",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_testing_intro: {
    id: "ch4_zhou_testing_intro",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "???????????????????\n\n???????????????????????????????????\n\n??????????",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_fixed_questions: {
    id: "ch4_zhou_fixed_questions",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "????????????????????????\n\n????????\n\n???????????????????????\n\n????????\n\n?????????????????????\n\n????????\n\n??????????????\n\n????????",
    nextSceneId: "ch4_zhou_dynamic_response",
  },

  ch4_zhou_dynamic_response: {
    id: "ch4_zhou_dynamic_response",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "?????????????\n\n?????????????????????????????????????????",
    nextSceneId: "ch4_art_class_start",
  },

  ch4_art_class_start: {
    id: "ch4_art_class_start",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "????",
    text: "?????????????????\n\n????????????????????????????????????????\n\n???????????????????????????",
    nextSceneId: "ch4_choose_painting",
  },

  ch4_choose_painting: {
    id: "ch4_choose_painting",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "?????????????????????????????????\n\n?????????????????????",
    choices: [
      { id: "ch4_painting_puppet", text: "???????????????????", nextSceneId: "ch4_show_painting", effects: { truthDesire: 1, authorityResistance: 1 }, tags: ["????"] },
      { id: "ch4_painting_memory", text: "??????????????", nextSceneId: "ch4_show_painting", effects: { joyPerception: 2, empathy: 1 }, tags: ["????"] },
      { id: "ch4_painting_safe", text: "?????????????", nextSceneId: "ch4_show_painting", effects: { selfProtection: 1 }, tags: ["????"] },
    ],
  },

  ch4_show_painting: {
    id: "ch4_show_painting",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "????",
    text: "?????????????\n\n??????????????????",
    nextSceneId: "ch4_wang_dynamic_judgment",
  },

  ch4_wang_dynamic_judgment: {
    id: "ch4_wang_dynamic_judgment",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "????",
    text: "?????????????????????????????????\n\n?????????????????????????????????",
    nextSceneId: "ch4_wang_question_choice",
  },

  ch4_wang_question_choice: {
    id: "ch4_wang_question_choice",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "????????????????",
    choices: [
      { id: "ch4_wang_metaphor", text: "????????????????", nextSceneId: "ch4_wang_core_reply", effects: { truthDesire: 1 }, tags: ["????"] },
      { id: "ch4_wang_honest", text: "????????????????", nextSceneId: "ch4_wang_core_reply", effects: { trust: 1, empathy: 1 }, tags: ["??"] },
      { id: "ch4_wang_withhold", text: "?????????????????????????", nextSceneId: "ch4_wang_core_reply", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["??"] },
    ],
  },

  ch4_wang_core_reply: {
    id: "ch4_wang_core_reply",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "????",
    text: "???????????????????\n\n??????????????????????\n\n?????????????????????????",
    nextSceneId: "ch4_dinner_problem",
  },

  ch4_dinner_problem: {
    id: "ch4_dinner_problem",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "?????????????\n\n??????????????????????????\n\n????????????????????",
    choices: [
      { id: "ch4_asked_liuyu_directly", text: "???????????????", nextSceneId: "ch4_liuyu_food_response", effects: { trust: 1, joyPerception: 1 }, tags: ["????"] },
      { id: "ch4_asked_liuyu_plan", text: "??????????????", nextSceneId: "ch4_liuyu_food_response", effects: { realityJudgment: 1, trust: 1 }, tags: ["????"] },
      { id: "ch4_followed_liuyu", text: "???????????????", nextSceneId: "ch4_liuyu_food_response", effects: { selfProtection: 1, truthDesire: 1 }, tags: ["????"] },
    ],
  },

  ch4_liuyu_food_response: {
    id: "ch4_liuyu_food_response",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "?????????????\n\n??????????????\n\n??????????????\n\n?????????????",
    nextSceneId: "ch4_dispose_food",
  },

  ch4_dispose_food: {
    id: "ch4_dispose_food",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "???????????????????????????????????\n\n????????????????????????????????\n\n??????????????????????????????????????",
    nextSceneId: "ch4_greenbelt_start",
  },

  ch4_greenbelt_start: {
    id: "ch4_greenbelt_start",
    chapter: "?4? ? ????",
    background: "/assets/maps/gate/???.png",
    speaker: "??",
    text: "????????\n\n?????????????????????????????????",
    nextSceneId: "ch4_liuyu_fixed_warning",
  },

  ch4_liuyu_fixed_warning: {
    id: "ch4_liuyu_fixed_warning",
    chapter: "?4? ? ????",
    background: "/assets/maps/gate/???.png",
    speaker: "??",
    text: "?????????????\n\n??????????????????????????????????????????????????\n\n????????????????????????????\n\n?????????????",
    nextSceneId: "ch5_liuyu_negotiate",
  },


  ch4_liuyu_lunch_tease: {
    id: "ch4_liuyu_lunch_tease",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "????????????????????????\n\n???????????????",
  },

  ch4_seat_busy: {
    id: "ch4_seat_busy",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "??????????????????",
  },

  ch4_empty_seat_lunch: {
    id: "ch4_empty_seat_lunch",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "???",
    text: "???????????????????????????????????????????",
  },

  ch4_classroom_noticeboard: {
    id: "ch4_classroom_noticeboard",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "???????????????????????????\n\n????????????????????????",
  },

  ch4_classroom_slogan: {
    id: "ch4_classroom_slogan",
    chapter: "?4? ? ????",
    background: "/assets/maps/classroom/??.png",
    speaker: "??",
    text: "????????????????????????\n\n???????????????",
  },


  ch5_liuyu_negotiate: {
    id: "ch5_liuyu_negotiate",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "???",
    text: "?????????????????\n\n???????????????????????????????\n\n??????????????????????????????????????????????",
    nextSceneId: "ch5_liuyu_negotiation_pressure",
  },

  ch5_liuyu_negotiation_pressure: {
    id: "ch5_liuyu_negotiation_pressure",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "??",
    text: "????????????????????????????\n\nNPC??????????????????????????????????????????\n\n????????????????????????????????????????\n\n????????????????",
    nextSceneId: "ch5_liuyu_negotiation_choice",
  },

  ch5_liuyu_negotiation_choice: {
    id: "ch5_liuyu_negotiation_choice",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "???",
    text: "??????????????????",
    choices: [
      { id: "ch5_liuyu_equal_terms", text: "????????????????????????????", nextSceneId: "ch5_liuyu_dynamic_response", effects: { truthDesire: 1, realityJudgment: 1 }, tags: ["????", "????"] },
      { id: "ch5_liuyu_honest_terms", text: "???????????????????", nextSceneId: "ch5_liuyu_dynamic_response", effects: { authorityResistance: 2, trust: -1 }, tags: ["????", "??"] },
      { id: "ch5_liuyu_demand_proof", text: "?????????????????????????", nextSceneId: "ch5_liuyu_dynamic_response", effects: { selfProtection: 1, authorityResistance: 1 }, tags: ["????"] },
      { id: "ch5_liuyu_rule_bluff", text: "??????????????", nextSceneId: "ch5_liuyu_dynamic_response", effects: { selfProtection: 1, trust: -1 }, tags: ["????"] },
    ],
  },

  ch5_liuyu_dynamic_response: {
    id: "ch5_liuyu_dynamic_response",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "??",
    text: "???????????????????\n\n?????????????????????????????\n\n????????????????????????????????????????????????\n\n??????????????????\n\n??????????????????????\n\n??????????\n\n?????????????",
    nextSceneId: "ch5_permission_inference",
  },

  ch5_permission_inference: {
    id: "ch5_permission_inference",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "???",
    text: "????????????????????????????????????\n\n???????????????????????????????\n\n????????????????????????????????\n\n???????????\n\n????????????????",
    choices: [
      { id: "ch5_permission_rule_inferred", text: "????", nextSceneId: "ch5_liuyu_permission_reaction", effects: { realityJudgment: 1, truthDesire: 1 }, tags: ["????"] },
      { id: "ch5_permission_rule_withheld", text: "?????????????", nextSceneId: "ch5_liuyu_permission_reaction", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["????"] },
      { id: "ch5_asked_liuyu_escort", text: "????????????????", nextSceneId: "ch5_liuyu_permission_reaction", effects: { trust: 1, realityJudgment: -1 }, tags: ["????"] },
    ],
  },

  ch5_liuyu_permission_reaction: {
    id: "ch5_liuyu_permission_reaction",
    chapter: "?5? ? ?????",
    background: "/assets/maps/gate/????.png",
    speaker: "??",
    text: "????????????????\n\n??????????????????????????????????\n\n????????????????????????????????????",
    nextSceneId: "ch5_go_to_wang_gallery",
  },

  ch5_go_to_wang_gallery: {
    id: "ch5_go_to_wang_gallery",
    chapter: "?5? ? ?????",
    background: "/assets/CG/??/????.png",
    cgMode: true,
    speaker: "??",
    text: "?????????????\n\n??????????\n\n???????????\n\n???????????????????????????????????????????????????????????NPC?\n\n?????????",
    nextSceneId: "ch5_wang_door_open",
  },

  ch5_wang_door_open: {
    id: "ch5_wang_door_open",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/?.png",
    cgMode: true,
    speaker: "???",
    text: "??????????????????????????????????????",
    nextSceneId: "ch5_wang_gallery_enter",
  },

  ch5_wang_gallery_enter: {
    id: "ch5_wang_gallery_enter",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "????????????\n\n???????????????????????????????????????\n\n????????????????????????\n\n???????????????????????????",
    nextSceneId: "ch5_gallery_explore",
  },

  ch5_gallery_explore: {
    id: "ch5_gallery_explore",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "???????????????\n\n?????????????",
    onCgEnd: "ch5_free_gallery",
  },

  ch5_gallery_soft: {
    id: "ch5_gallery_soft",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "??????????????????????????????????????????\n\n????????????????????",
  },

  ch5_gallery_raw: {
    id: "ch5_gallery_raw",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "?????????????????????????????????????\n\n????????????????????????????\n\n??????????????????????????????",
  },

  ch5_gallery_infer_need_paintings: {
    id: "ch5_gallery_infer_need_paintings",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "???",
    text: "?????????",
  },

  ch5_gallery_inference: {
    id: "ch5_gallery_inference",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "???",
    text: "??????????????????????????????????????????????????????????????\n\n?????????????????????",
  },

  ch5_gallery_materials_wait: {
    id: "ch5_gallery_materials_wait",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "???",
    text: "??????????????",
  },

  ch5_gallery_materials_warning: {
    id: "ch5_gallery_materials_warning",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "?????????????????????????\n\n???????????????\n\n?????????????\n\n????????????????????????????\n\n??????????????????????????????????",
    nextSceneId: "ch5_return_to_office",
  },

  ch5_return_to_office: {
    id: "ch5_return_to_office",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "??",
    text: "???????????????????????\n\n????????????????????????????\n\n????????????????????\n\n???????????????????",
    nextSceneId: "ch5_offer_help_choice",
  },

  ch5_offer_help_choice: {
    id: "ch5_offer_help_choice",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "???",
    text: "?????????",
    choices: [
      { id: "ch5_zhoujunxiu_respectful_help", text: "??????????????????????", nextSceneId: "ch5_zhoujunxiu_help_response", effects: { empathy: 1, trust: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_practical_help", text: "??????????????????????", nextSceneId: "ch5_zhoujunxiu_help_response", effects: { realityJudgment: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_forceful_help", text: "????????????????????", nextSceneId: "ch5_zhoujunxiu_help_response", effects: { empathy: -1, authorityResistance: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_delayed_help", text: "???????????????", nextSceneId: "ch5_wang_trade_opening", effects: { selfProtection: 1, empathy: -1 }, tags: ["????"] },
    ],
  },

  ch5_zhoujunxiu_help_response: {
    id: "ch5_zhoujunxiu_help_response",
    chapter: "?5? ? ?????",
    background: "/assets/maps/wang_gallery/????.png",
    speaker: "???",
    text: "??????????????\n\n??????????\n\n????????????????????\n\n?????????????",
    nextSceneId: "ch5_wang_trade_opening",
  },

  ch5_wang_trade_opening: {
    id: "ch5_wang_trade_opening",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "?????????????\n\n??????????????????\n\n??????????????????????????????\n\n?????????????????????",
    nextSceneId: "ch5_wang_pressure_choice",
  },

  ch5_wang_pressure_choice: {
    id: "ch5_wang_pressure_choice",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "?????????????????\n\n???????????????????????",
    choices: [
      { id: "ch5_wang_apologized", text: "????????????????", nextSceneId: "ch5_wang_trade_terms", effects: { realityJudgment: 1, trust: 1 }, tags: ["????"] },
      { id: "ch5_wang_asked_price", text: "???????????", nextSceneId: "ch5_wang_trade_terms", effects: { authorityResistance: 1, realityJudgment: 1 }, tags: ["????"] },
      { id: "ch5_wang_challenged_teacher", text: "???????????????", nextSceneId: "ch5_wang_boundary_warning", effects: { authorityResistance: 1, selfProtection: -1 }, tags: ["????"] },
    ],
  },

  ch5_wang_boundary_warning: {
    id: "ch5_wang_boundary_warning",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "?????????????????????????\n\n???????????????????\n\n???????????????????????",
    nextSceneId: "ch5_wang_trade_terms",
  },

  ch5_wang_trade_terms: {
    id: "ch5_wang_trade_terms",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "???????\n\n?????????????????????????\n\n???????????????\n\n?????????????",
    nextSceneId: "ch5_trade_riddles_confirmed",
  },

  ch5_trade_riddles_confirmed: {
    id: "ch5_trade_riddles_confirmed",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "????????????????????????????????????\n\n????????????\n\n?????????????????????????????????????",
    nextSceneId: "ch5_walk_with_zhoujunxiu",
  },

  ch5_walk_with_zhoujunxiu: {
    id: "ch5_walk_with_zhoujunxiu",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "??",
    text: "??????????????????????\n\n???????3???????????????????\n\n????????????????????????????????????\n\n????????????????????????????????",
    nextSceneId: "ch5_zhoujunxiu_conversation_choice",
  },

  ch5_zhoujunxiu_conversation_choice: {
    id: "ch5_zhoujunxiu_conversation_choice",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "??????????????",
    choices: [
      { id: "ch5_zhoujunxiu_comforted", text: "???????????????????????", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: { empathy: 1, joyPerception: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_questioned", text: "????????", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: { truthDesire: 1, selfProtection: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_shared_experience", text: "????????????????????????????", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: { empathy: 1, trust: 1 }, tags: ["????"] },
      { id: "ch5_zhoujunxiu_observed", text: "??", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: { selfProtection: 1 }, tags: ["????"] },
    ],
  },

  ch5_zhoujunxiu_dynamic_reply: {
    id: "ch5_zhoujunxiu_dynamic_reply",
    chapter: "?5? ? ?????",
    background: "/assets/CG/????/??.png",
    cgMode: true,
    speaker: "???",
    text: "???????????????????????????????\n\n???????????????3????\n\n?????????3?????????????????",
    nextSceneId: "ch5_enter_class3",
  },

  ch5_enter_class3: {
    id: "ch5_enter_class3",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "??",
    text: "?????????????????????????????????\n\n?????????3??????\n\n???????????????????\n\n?????????????????",
    nextSceneId: "ch5_class3_explore",
  },

  ch5_class3_explore: {
    id: "ch5_class3_explore",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "??",
    text: "??????3??",
    onCgEnd: "ch5_free_class3",
  },

  ch5_class3_students: {
    id: "ch5_class3_students",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "??",
    text: "????????????????????????????\n\n???????????????????????????????\n\n?????????????????????",
  },

  ch5_class3_slogan: {
    id: "ch5_class3_slogan",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "???",
    text: "?????????????????????????",
  },

  ch5_class3_leave_blocked: {
    id: "ch5_class3_leave_blocked",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "???",
    text: "?????????",
  },

  ch5_class3_rules_wait: {
    id: "ch5_class3_rules_wait",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "???",
    text: "?????????????????",
  },

  ch5_class3_rules: {
    id: "ch5_class3_rules",
    chapter: "?5? ? ?????",
    background: "/assets/maps/classroom_3/??.png",
    speaker: "??",
    text: "??????????????????????????????\n\n???????????????????????\n\n???????????????????\n\n????????????????????",
    nextSceneId: "ch5_class3_disguise_choice",
  },

  ch5_class3_disguise_choice: {
    id: "ch5_class3_disguise_choice",
    chapter: "?5? ? ?????",
    background: "",
    cgMode: true,
    speaker: "??",
    text: "??????????????????????????????????????????????\n\n?????",
    choices: [
      { id: "ch5_class3_disguise_helper", text: "????????????????", nextSceneId: "ch5_class3_exposure", effects: { realityJudgment: 1, selfProtection: 1 }, tags: ["????"] },
      { id: "ch5_class3_seek_zhoujunxiu", text: "???????????????????", nextSceneId: "ch5_class3_exposure", effects: { trust: 1 }, tags: ["????"] },
      { id: "ch5_class3_test_student", text: "?????????????????????", nextSceneId: "ch5_class3_exposure", effects: { truthDesire: 1, selfProtection: -1 }, tags: ["?????"] },
    ],
  },

  ch5_class3_exposure: {
    id: "ch5_class3_exposure",
    chapter: "?5? ? ?????",
    background: "/assets/CG/3?/??.png",
    cgMode: true,
    speaker: "????",
    text: "????????\n\n?????????????????????????????????????????????????\n\n??????????????\n\n?????",
    nextSceneId: "ch6_class3_exposure",
  },

  ch6_class3_exposure: {
    id: "ch6_class3_exposure",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/突脸.png",
    cgMode: true,
    speaker: "陌生同学",
    text: "你——是——谁——？\n\n那双瞪得浑圆的眼睛死死盯着我。全班学生纷纷转头，像在看一只濒死的虫子。\n\n系统提示在脑中反复炸响：技能“违规提醒”强烈发动中！\n\n将近五十名学生同时起身，朝我簇拥而来。我得想办法逃出去。",
    nextSceneId: "ch6_class3_first_reaction",
  },

  ch6_class3_first_reaction: {
    id: "ch6_class3_first_reaction",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "教室门就在不远处，但人群正在合拢。",
    choices: [
      { id: "ch6_class3_force_through", text: "我奋力推开挡路的学生，直接冲向教室门", nextSceneId: "ch6_class3_door_locked", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["果断求生", "暴力突破"] },
      { id: "ch6_class3_call_zhoujunxiu", text: "“周隽秀！帮帮我！”", nextSceneId: "ch6_zhoujunxiu_reaction", effects: { trust: 1, empathy: 1 }, tags: ["依赖关系", "临场合作"] },
      { id: "ch6_class3_claim_teacher", text: "“喂，我只是个来送画的，别这么不近人情。”", nextSceneId: "ch6_class3_door_locked", effects: { selfProtection: 1, truthDesire: 1 }, tags: ["身份伪装", "规则试探"] },
    ],
  },

  ch6_zhoujunxiu_reaction: {
    id: "ch6_zhoujunxiu_reaction",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "周隽秀",
    text: "她张了张嘴，像是想说“他是来帮我的”，可声音被某种看不见的力量扭曲成含混的气音。\n\n那一瞬间的迟疑让靠近我的几名学生慢了半拍。\n\n但她终究没能违抗规则，眼神很快变得陌生。",
    nextSceneId: "ch6_class3_door_locked",
  },

  ch6_class3_door_locked: {
    id: "ch6_class3_door_locked",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/逃生.png",
    cgMode: true,
    speaker: "旁白",
    text: "我拨开一只只伸来的手，终于挤到教室门口。抓住门把手的瞬间，我往下一摁，却发现门根本打不开。\n\n我后退几步，助跑，然后冲着门一个飞踢。腿部传来阵阵钝痛，门还是打不开。\n\n挂钟显示18:55，距离晚自习铃响还有五分钟。\n\n这时有人抓住我的双腿，把我往教室深处拉去。我死死握住门把手，和这些人拼命。",
    nextSceneId: "ch6_class3_survival_choice",
  },

  ch6_class3_survival_choice: {
    id: "ch6_class3_survival_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/逃生.png",
    cgMode: true,
    speaker: "旁白",
    text: "五分钟被无限拉长。我必须撑到晚自习铃响。",
    choices: [
      { id: "ch6_class3_counter_pull", text: "突然松开门把手，借后方拉力撞倒人群", nextSceneId: "ch6_class3_counter_standoff", effects: { realityJudgment: 1, selfProtection: 1 }, tags: ["临场反击", "环境利用"] },
      { id: "ch6_class3_knife_warning", text: "拿出水果刀威慑学生，但不主动伤人", nextSceneId: "ch6_class3_knife_death", effects: { selfProtection: 1, realityJudgment: -1 }, tags: ["武力威慑", "克制暴力"] },
      { id: "ch6_class3_cut_student", text: "划伤最先抓住自己的人，强迫其他学生后退", nextSceneId: "ch6_class3_cut_standoff", effects: { selfProtection: 2, empathy: -1 }, tags: ["主动伤害", "极端自保"] },
    ],
  },

  ch6_class3_knife_death: {
    id: "ch6_class3_knife_death",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/人群.png",
    cgMode: true,
    speaker: "旁白",
    text: "我抽出水果刀，刀尖在灯光下闪过一道冷光。\n\n但一旁的学生瞬间把刀夺了过去。抓着我脚踝的学生顺势把我架起，还没等我反应过来，刀尖已经刺入心脏。\n\n生命本就如此脆弱。无论是在副本中，还是副本外的现实生活，本质上并没有什么区别。\n\n我死了。",
    nextSceneId: "title_screen",
  },

  ch6_class3_counter_standoff: {
    id: "ch6_class3_counter_standoff",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/人群.png",
    cgMode: true,
    speaker: "旁白",
    text: "我突然松开门把手。后方拉扯的力量让我狠狠摔进人群，数名学生失去重心倒在地上，抓住脚踝的手也随之松开。\n\n我趁机翻身爬起，拿出水果刀指向他们。\n\n“谁再靠近，我就用它杀谁。”\n\n五分钟被拉得无比漫长。直到晚自习铃声响起，3班学生迅速而有序地回到座位，紧锁的教室门也终于打开了。\n\n我立即夺门而出，朝自班教室跑去。",
    nextSceneId: "ch6_corridor_return",
  },

  ch6_class3_cut_standoff: {
    id: "ch6_class3_cut_standoff",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/人群.png",
    cgMode: true,
    speaker: "旁白",
    text: "水果刀划开最先抓向我的手臂。鲜血涌出，周围学生终于本能地后退了一步，抓住我脚踝的手也随之松开。\n\n我趁机翻身爬起，将刀指向他们。\n\n“谁再靠近，我就用它杀谁。”\n\n直到晚自习铃声响起，3班学生迅速而有序地回到座位，紧锁的教室门也终于打开了。\n\n我立即夺门而出，朝自班教室跑去。",
    nextSceneId: "ch6_corridor_return",
  },

  ch6_corridor_return: {
    id: "ch6_corridor_return",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/corridor/走廊.png",
    speaker: "系统",
    text: "技能“违规提醒”发动中。\n\n注意：该技能只能保护您20秒！",
    onCgEnd: "ch6_free_corridor_return",
  },

  ch6_corridor_wrong_room: {
    id: "ch6_corridor_wrong_room",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/corridor/走廊.png",
    speaker: "旁白",
    text: "不是这里。现在没有时间浪费。",
  },

  ch6_corridor_timeout_death: {
    id: "ch6_corridor_timeout_death",
    chapter: "第6章 · 追杀与逃生",
    background: "",
    cgMode: true,
    speaker: "系统",
    text: "技能“违规提醒”强烈发动中。\n\n我离本班教室只剩最后一段距离，可胸口的窒息感像一只手猛地攥紧了肺。\n\n倒计时归零。被动技能已失效。\n\n最后一口空气从喉咙里被抽走。我伸向门的指尖停在半空，随后无力垂下。\n\n我死了。",
    nextSceneId: "title_screen",
  },

  ch6_liuyu_catches_late: {
    id: "ch6_liuyu_catches_late",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/classroom/教室.png",
    speaker: "刘宇",
    text: "你迟到了，叶平生。\n\n我据理力争：“现在还没到19:01，这也算迟到？”\n\n刘宇漠然地看着我：“已经打铃了。你跟我去见班主任。”\n\n不由得我再狡辩些什么，他一把抓过我的手腕，拖着我往教师办公室走去。",
    nextSceneId: "ch6_to_teacher_office",
  },

  ch6_to_teacher_office: {
    id: "ch6_to_teacher_office",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/美术教室/楼梯.png",
    cgMode: true,
    speaker: "旁白",
    text: "我感受着手腕上逐渐收紧的力道，竟然莫名觉得安心。\n\n他塞给我一个纸团，小声嘱咐道。",
    nextSceneId: "ch6_liuyu_route_note",
  },

  ch6_liuyu_route_note: {
    id: "ch6_liuyu_route_note",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/美术教室/楼梯.png",
    cgMode: true,
    speaker: "刘宇",
    text: "按纸上的路线跑。教师办公室的门从里面打不开，别试图跟老师硬碰硬。\n\n通风管道通往一楼厕所。水果刀拧不开螺丝，砸老化的角。\n\n周测开始前必须回来，不得旷考。这次算提前通知你了。",
    nextSceneId: "ch6_teacher_office_enter",
  },

  ch6_teacher_office_enter: {
    id: "ch6_teacher_office_enter",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/teacher_office/教师办公室.png",
    speaker: "班主任",
    text: "不听话的孩子，就应该受到应有的惩罚。\n\n她的声音逐渐失去人类质感。周围环境迅速变得昏暗，连办公室的布局都变得难以辨认。",
    nextSceneId: "ch6_office_escape_choice",
  },

  ch6_office_escape_choice: {
    id: "ch6_office_escape_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/teacher_office/教师办公室.png",
    speaker: "旁白",
    text: "老师的皮肤惨白如纸，牙齿变得尖锐，嘴角咧到了耳根。\n\n门、窗户、通风管道……我必须抓紧时间谨慎行事。",
    choices: [
      { id: "ch6_followed_liuyu_map", text: "拿出纸团，按照刘宇给的路线图行动，立刻跑向通风管道", nextSceneId: "ch6_break_vent", effects: { trust: 1, realityJudgment: 1 }, tags: ["信任协作", "执行计划"] },
      { id: "ch6_verified_escape_route", text: "先检查一下门窗，确认刘宇给的线索是否可靠", nextSceneId: "ch6_verified_route_death", effects: { selfProtection: 1, trust: -1 }, tags: ["谨慎验证", "风险评估"] },
      { id: "ch6_stalled_teacher", text: "说点什么拖住老师，同时观察办公室结构", nextSceneId: "ch6_break_vent_stall", effects: { realityJudgment: 1, authorityResistance: 1 }, tags: ["冷静周旋", "冒险"] },
      { id: "ch6_prepared_to_fight_teacher", text: "握紧水果刀，老师要是靠近就正面硬刚", nextSceneId: "ch6_break_vent_fight", effects: { selfProtection: 1, authorityResistance: 1 }, tags: ["战斗倾向", "高风险"] },
    ],
  },

  ch6_verified_route_death: {
    id: "ch6_verified_route_death",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "我没有立刻冲向通风管道，而是先去拧办公室门把手。门锁纹丝不动。\n\n正当我准备去检查窗户时，冰冷的气息贴上后颈。\n\n利爪贯穿胸口，剧烈的疼痛把没来得及出口的话钉回肺里。\n\n弥留之际，最后看见的是办公桌上那张被我丢开的路线图。红线仍然指向通风管道。\n\n我死了。",
    nextSceneId: "title_screen",
  },

  ch6_break_vent: {
    id: "ch6_break_vent",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "我踮起脚尖，尝试用水果刀拧开通风管道口的螺丝。可惜水果刀无法当一字批头使用。\n\n好在管道有些年头，我用刀柄猛砸老化最明显的一角，它逐渐松动了。\n\n等我抽空回头，怪物已经伸出利爪抓向了我。",
    nextSceneId: "ch6_teacher_attack_choice",
  },

  ch6_break_vent_stall: {
    id: "ch6_break_vent_stall",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "“老师，迟到应该有具体惩罚吧？您不先告诉我吗？”\n\n班主任伸出细长的舌头：“被我吃掉，就是惩罚。”\n\n拖延只换来了几秒，却足够我确认通风管道的位置。我用刀柄猛砸老化的一角，怪物也朝我扑来。",
    nextSceneId: "ch6_teacher_attack_choice",
  },

  ch6_break_vent_fight: {
    id: "ch6_break_vent_fight",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "我挥动水果刀，划伤怪物的手臂。她痛苦地呻吟一声，不得不后退几步。\n\n水果刀只能造成很小的伤害。我趁着她恢复的时间，用刀柄猛砸通风管道老化的一角。\n\n怪物再次逼近。",
    nextSceneId: "ch6_teacher_attack_choice",
  },

  ch6_teacher_attack_choice: {
    id: "ch6_teacher_attack_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "管道口即将脱落，怪物的利爪也即将落下。",
    choices: [
      { id: "ch6_vent_commit", text: "继续砸击管道，相信自己能抢在攻击前打开出口", nextSceneId: "ch6_vent_escape_commit", effects: { realityJudgment: 1, selfProtection: 1 }, tags: ["专注目标"] },
      { id: "ch6_blocked_teacher", text: "回身用水果刀格挡利爪，再继续破坏管道", nextSceneId: "ch6_vent_escape_block", effects: { selfProtection: 1, authorityResistance: 1 }, tags: ["战斗反应"] },
      { id: "ch6_distracted_teacher", text: "把办公桌上物品推向怪物，制造一次阻碍", nextSceneId: "ch6_vent_escape_distract", effects: { realityJudgment: 1, empathy: 1 }, tags: ["环境利用"] },
    ],
  },

  ch6_vent_escape_commit: {
    id: "ch6_vent_escape_commit",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "利爪破空的声音从身后袭来，我立刻闪躲，但还是在最后一刻被划伤小腿。\n\n伤口火辣辣地疼。但我顾不上疼痛，只能用尽全力砸下最后一次。\n\n管道口终于应声脱落。我爬进通风管道，按照刘宇给的示意图拐了好几个弯，最后在一楼厕所落地。",
    nextSceneId: "ch6_toilet_encounter",
  },

  ch6_vent_escape_block: {
    id: "ch6_vent_escape_block",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "我回身用水果刀挡向利爪，可惜人类力气不如怪物，刀身瞬间被拍飞，另一只爪子在我小腿上留下深可见骨的伤口。\n\n我强忍疼痛砸下最后一次，管道口终于脱落。我爬进通风管道，最后在一楼厕所落地。",
    nextSceneId: "ch6_toilet_encounter",
  },

  ch6_vent_escape_distract: {
    id: "ch6_vent_escape_distract",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/逼近.jpg",
    cgMode: true,
    speaker: "旁白",
    text: "我将桌上的文件和台灯推向怪物。她的攻击被阻碍了一瞬，利爪仍擦过我的小腿，留下狭长伤口。\n\n我砸下最后一次，管道口终于脱落。我爬进通风管道，按照路线在一楼厕所落地。",
    nextSceneId: "ch6_toilet_encounter",
  },

  ch6_toilet_encounter: {
    id: "ch6_toilet_encounter",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/厕所奇遇.png",
    cgMode: true,
    speaker: "旁白",
    text: "厕所里传来压抑的哭声。好像是有同学压力太大了，晚自习偷跑来这里发泄情绪，甚至不惜违反规则。\n\n真勇。不过我也没资格吐槽他，我这是五十步笑百步。",
    choices: [
      { id: "ch6_ignored_crying_student", text: "没剩多少时间了，我决定装作没有看见，立刻赶回教室参加周测", nextSceneId: "ch6_weekly_exam", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["目标优先"] },
      { id: "ch6_warned_crying_student", text: "提醒他如果被其他同学发现，可能会被举报违规", nextSceneId: "ch6_weekly_exam", effects: { empathy: 1, realityJudgment: 1 }, tags: ["关心他人"] },
      { id: "ch6_helped_crying_student", text: "走到他身后拍了拍他的肩膀：“同学，需要帮忙吗？”", nextSceneId: "ch6_crying_student_response", effects: { empathy: 2, selfProtection: -1 }, tags: ["主动帮助"] },
    ],
  },

  ch6_crying_student_response: {
    id: "ch6_crying_student_response",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/厕所奇遇.png",
    cgMode: true,
    speaker: "男生",
    text: "你、你别告诉老师。\n\n他慌乱地抹了把脸，像是终于意识到这里也并不安全。\n\n“可我真的不想回去。”\n\n我看了一眼自己仍在渗血的裤腿，只能压低声音提醒他去洗把脸，别让人看出异常。男生沉默地点点头，低声道了句谢，随后低头离开。",
    nextSceneId: "ch6_weekly_exam",
  },

  ch6_weekly_exam: {
    id: "ch6_weekly_exam",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/教室/教室夜晚.png",
    cgMode: true,
    speaker: "旁白",
    text: "我赶回教室不久，周测试卷便发了下来。\n\n我凭残存记忆完成了大约七成题目，其余只能靠猜。\n\n收卷时，我才意识到腿上的伤口仍在流血，裤腿已经被血液染深。周围同学却对此视而不见。\n\n这么晚医务室也不会开了，只能回家处理伤口。",
    nextSceneId: "ch6_after_school_walk",
  },

  ch6_after_school_walk: {
    id: "ch6_after_school_walk",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/gate/校门夜晚.png",
    speaker: "旁白",
    text: "晚自习结束后，刘宇很自然地拉过我和周骐瑞，我们跟三兄弟一样勾肩搭背地走着，虽然是刘宇单方面所为。\n\n他走得有些快，我扯到了刚刚结痂的伤口，疼得倒吸一口凉气。\n\n刘宇和周骐瑞看向我，却没有发现任何异常。\n\n“我的右腿受伤了……你们看不到吗？伤得很重。”\n\n周骐瑞小心撩起我的裤腿，随后摇头：“没有任何伤口。”\n\n刘宇的声音严肃得不太正常：“你怎么受伤的？”",
    nextSceneId: "ch6_injury_explanation_choice",
  },

  ch6_injury_explanation_choice: {
    id: "ch6_injury_explanation_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/gate/校门夜晚.png",
    speaker: "旁白",
    text: "我警觉地瞥了刘宇一眼。",
    choices: [
      { id: "ch6_concealed_teacher_monster", text: "……", nextSceneId: "ch6_liuyu_root_rule_test", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["谨慎"] },
      { id: "ch6_partial_injury_truth", text: "我在办公室的时候，看到老师……", nextSceneId: "ch6_root_rule_atmosphere", effects: { trust: 1, selfProtection: 1 }, tags: ["有限坦诚"] },
      { id: "ch6_described_teacher_monster", text: "被怪物抓的……", nextSceneId: "ch6_root_rule_atmosphere", effects: { truthDesire: 1, selfProtection: -1 }, tags: ["坦白", "鲁莽"] },
    ],
  },

  ch6_liuyu_root_rule_test: {
    id: "ch6_liuyu_root_rule_test",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/gate/校门夜晚.png",
    speaker: "刘宇",
    text: "怎么突然不说话了？\n\n他的声音压得很低，却像故意把问题推回给我。\n\n我下意识开口：“我在办公室的时候，被老师……”\n\n话说到一半，周围几个学生的脚步忽然慢了下来。周骐瑞的目光也变得僵硬。\n\n我猛地闭嘴，意识到伤口不可见的问题也许不在伤口本身，而在造成伤口的那段事实。",
    nextSceneId: "ch6_root_rule_experiment_choice",
  },

  ch6_root_rule_atmosphere: {
    id: "ch6_root_rule_atmosphere",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/转头.png",
    cgMode: true,
    speaker: "旁白",
    text: "我几乎脱口而出，然后突然意识到了什么，连忙住口。\n\n为什么周围突然这么安静？现在可是在放学后的室外。\n\n当我再次抬起头，对上了周骐瑞阴翳的脸。越过他的肩膀，前方所有同学都转过一个诡异的弧度，冷漠地看着我。\n\n我很可能触碰了某条不能公开的学校规则。",
    nextSceneId: "ch6_root_rule_experiment_choice",
  },

  ch6_root_rule_experiment_choice: {
    id: "ch6_root_rule_experiment_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/转头.png",
    cgMode: true,
    speaker: "主角",
    text: "我现在还来不及思考这么多，当务之急是离开学校。\n\n还有，为什么“违规提醒”没有发动？\n\n既然如此，我就大胆再试探一下。",
    nextSceneId: "ch6_root_rule_trigger",
  },

  ch6_root_rule_trigger: {
    id: "ch6_root_rule_trigger",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/转头.png",
    cgMode: true,
    speaker: "主角",
    text: "我刻意提高音量，尽量让远处的人听见。\n\n“我说——哪怕我逃了晚自习，老师也不能把我怎么样。”\n\n系统提示：由于您的天赋效果，该话语的份量正在上升。\n\n四周的氛围如同地震般猛烈震动。越来越多的呢喃声聚集。\n\n系统提示：由于您违反副本根本性规则，且被动技能处于使用状态，您即刻遭到全校追杀。",
    nextSceneId: "ch6_capture_ritual",
  },

  ch6_capture_ritual: {
    id: "ch6_capture_ritual",
    chapter: "第6章 · 追杀与逃生",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "离我最近的刘宇和周骐瑞面无表情地将我撂倒，然后几个学生上来死死扣住我的四肢。\n\n其他学生以我为中心围成圆圈。姗姗来迟的老师们整齐排列在圈的内层，全都已经怪物化。\n\n他们双手合十，虔诚祈祷。\n\n系统提示：叛逆值已达到主动技能初始化条件。开始初始化。\n\n10%。",
    nextSceneId: "ch6_ritual_wishes",
  },

  ch6_ritual_wishes: {
    id: "ch6_ritual_wishes",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/天空.png",
    cgMode: true,
    speaker: "旁白",
    text: "我的咳嗽声与脑内警报盖过师生的声音。\n\n我索性屏住呼吸，配合颈部不断收紧的力量，平静地望向灰蒙蒙的夜空。\n\n这些愿望本身没有错。我知道的。",
    nextSceneId: "ch6_ritual_desire_snowball",
  },

  ch6_ritual_desire_snowball: {
    id: "ch6_ritual_desire_snowball",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/天空.png",
    cgMode: true,
    speaker: "旁白",
    text: "阴风掠过，大量试卷和总结报告从天而降。内容模糊不清，唯独页眉处的数字大得骇人。\n\n它们落到我的身上，散布到我的周围，挡住我的眼睛。",
    nextSceneId: "ch6_ritual_backlash",
  },

  ch6_ritual_backlash: {
    id: "ch6_ritual_backlash",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/仪式.png",
    cgMode: true,
    speaker: "旁白",
    text: "接着，欢呼声逐渐消失，抱怨声夹杂着呜咽声如浪涛般一阵盖过一阵。",
    nextSceneId: "ch6_numbers_attack",
  },

  ch6_numbers_attack: {
    id: "ch6_numbers_attack",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/祭祀/仪式.png",
    cgMode: true,
    speaker: "旁白",
    text: "几名学生捡起地上的试卷，粗暴地将它们揉成团，塞进我的嘴里。\n\n剩余纸张上的猩红数字缓慢脱离页面。每一道笔画的首尾都尖锐得像刀尖，在夜色中对准我的四肢。\n\n系统……再快一点。\n\n系统提示：60%。",
    nextSceneId: "ch7_rule_skill_initialize",
  },

  ch7_rule_skill_initialize: {
    id: "ch7_rule_skill_initialize",
    chapter: "第7章 · 暂缺",
    background: "/assets/CG/祭祀/仪式.png",
    cgMode: true,
    speaker: "旁白",
    text: "第七章剧情暂由后续版本补完。\n\n学校区域在混乱后进入修复期，而家庭中的镜面异常仍在继续。",
    nextSceneId: "ch8_mirror_figure_disappears",
  },

  ch8_mirror_figure_disappears: {
    id: "ch8_mirror_figure_disappears",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/镜子.png",
    cgMode: true,
    speaker: "旁白",
    text: "镜中空间里的血腥味与人影同时消失。\n\n我立刻转头寻找，可受限于镜面的大小，只能看见极其有限的角度。\n\n它去哪了？\n\n一张血淋淋的鬼脸骤然贴到眼前，咧开的腥臭巨口几乎贴上我的脸。\n\n我吓得一屁股摔到地上，惊魂未定地看着那面镜子，却只能看到自己惨白的脸。",
    nextSceneId: "ch8_bathroom_knocking",
  },

  ch8_bathroom_knocking: {
    id: "ch8_bathroom_knocking",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/bathroom/卫生间.png",
    speaker: "旁白",
    text: "砰砰砰——\n\n毛玻璃门上映出一个人影。从身高与头发判断，应该是母亲。\n\n违规提醒没有发动，现在应该还没到凌晨一点。母亲敲门，很可能与镜子里的东西有关。\n\n门外的人没有叫我的名字，只是一遍遍地敲门。这很反常。",
    nextSceneId: "ch8_door_response_choice",
  },

  ch8_door_response_choice: {
    id: "ch8_door_response_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/bathroom/卫生间.png",
    speaker: "旁白",
    text: "我必须确认门外到底是什么。",
    choices: [
      { id: "ch8_asked_door_identity", text: "我隔着门喊了一嗓子：“谁啊？”", nextSceneId: "ch8_door_check_result", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["谨慎验证"] },
      { id: "ch8_checked_door_gap", text: "我就地趴下，从门缝中看去", nextSceneId: "ch8_door_check_result", effects: { truthDesire: 1, selfProtection: 1 }, tags: ["细节观察"] },
      { id: "ch8_checked_mirror_again", text: "我把头重新伸进镜子中，查看那只鬼是否还在镜中", nextSceneId: "ch8_door_check_result", effects: { truthDesire: 2, selfProtection: -1 }, tags: ["冒险调查"] },
      { id: "ch8_opened_door_directly", text: "凌晨一点我必须躺在床上，如今没多少时间了，我只能硬刚了", nextSceneId: "ch8_mother_ghost_enters", effects: { authorityResistance: 1, realityJudgment: 1 }, tags: ["果断行动"] },
    ],
  },

  ch8_door_check_result: {
    id: "ch8_door_check_result",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/bathroom/卫生间.png",
    speaker: "旁白",
    text: "门外没有回答。\n\n若从门缝看去，那双米色拖鞋确实属于母亲；若回看镜中，漆黑的空间又像被什么东西堵住了风口。\n\n可眼下我必须回房间睡觉，一点母亲会来房间检查。管她是不是母亲，违反规则才是致命的。\n\n我深吸一口气，打开了门。",
    nextSceneId: "ch8_mother_ghost_enters",
  },

  ch8_mother_ghost_enters: {
    id: "ch8_mother_ghost_enters",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/人亡.png",
    cgMode: true,
    speaker: "旁白",
    text: "刚才镜中的鬼脸，又和我对视了。\n\n这只鬼的装束完全和母亲一样。\n\n鬼踏入厕所的瞬间，我的头仿佛炸开一般疼痛。恍惚间，白色调的厕所被血色渲染，墙壁、镜子、盥洗池上满是飞溅的血迹。\n\n地板上一滩血液还在缓慢流动，未被污染的区域是一个躺倒在地的人形轮廓。\n\n这里死人了。\n\n鬼影痛苦扭曲着钻回镜中。系统提示：恭喜您找到“镜中真相碎片1”。副本探索进度达到15%。",
    nextSceneId: "ch8_return_to_bed",
  },

  ch8_return_to_bed: {
    id: "ch8_return_to_bed",
    chapter: "第8章 · 天台和解",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "我思考着，回到房间，关灯躺上床。\n\n凌晨一点，母亲像前几天一样打开房门。她确认我已经睡觉后，安心地合上门。\n\n那时，我已有预感，如果我再不做些什么改变现状，母亲就会变成那只鬼。",
    nextSceneId: "ch8_inner_voice_returns",
  },

  ch8_inner_voice_returns: {
    id: "ch8_inner_voice_returns",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/意识/与“我”对话.png",
    cgMode: true,
    speaker: "“我”",
    text: "父亲失业了，母亲比以前更加病态，整个家都覆上一层阴霾。我要窒息了。\n\n系统提示：技能“违规提醒”正在发动。\n\n“我会乖乖听她的话。她会后悔的。”\n\n我叹了口气：“不止她会后悔，你也会后悔。”\n\n“我”冷冷回答：“所有人都会后悔的，我已经不在乎了。”\n\n我真是被他气笑了。",
    nextSceneId: "ch8_inner_voice_first_choice",
  },

  ch8_inner_voice_first_choice: {
    id: "ch8_inner_voice_first_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/意识/与“我”对话.png",
    cgMode: true,
    speaker: "主角",
    text: "该怎么回应这份绝望？",
    choices: [
      { id: "ch8_challenged_inner_voice", text: "你自己尝试过改变自己、改变现状吗？被自己妄想的绝望困住，这是比懦弱更蠢的做法", nextSceneId: "ch8_inner_voice_dynamic_response", effects: { authorityResistance: 1, realityJudgment: 1 }, tags: ["直接挑战"] },
      { id: "ch8_guided_small_choice", text: "我知道这么做很难，但是，你真的甘愿一辈子腐烂发臭吗？", nextSceneId: "ch8_inner_voice_dynamic_response", effects: { empathy: 1, realityJudgment: 1 }, tags: ["共情引导"] },
      { id: "ch8_shared_fear_with_self", text: "你以为只有你一个人承受着这样的绝望吗？但为什么有的人能创造机遇？", nextSceneId: "ch8_inner_voice_dynamic_response", effects: { truthDesire: 1, empathy: 1 }, tags: ["自我暴露"] },
      { id: "ch8_used_school_change_as_proof", text: "这就是我和你的差距。我已经改变了一条副本的根本规则", nextSceneId: "ch8_inner_voice_dynamic_response", effects: { authorityResistance: 2, trust: -1 }, tags: ["行动证明"] },
    ],
  },

  ch8_inner_voice_dynamic_response: {
    id: "ch8_inner_voice_dynamic_response",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/意识/与“我”对话.png",
    cgMode: true,
    speaker: "“我”",
    text: "你说得头头是道，但你自己做得到吗？你有什么资格指责我？\n\n窒息感仍在持续，黑暗中的心跳声被无限放大。\n\n我想继续反驳，却忽然意识到，语言已经没有意义。他不相信“改变”两个字，除非我真的做给他看。\n\n那就先做一件小事，证明我不是只会站着说话。",
    nextSceneId: "ch8_leave_for_rooftop",
  },

  ch8_leave_for_rooftop: {
    id: "ch8_leave_for_rooftop",
    chapter: "第8章 · 天台和解",
    background: "",
    cgMode: true,
    speaker: "主角",
    text: "想让我证明给你看，也要你先给我一点行动空间。如果我死在你手里，你还能看到结果吗？\n\n“想在我手里活下来，你就得给我带来快乐。”\n\n行。那你现在可要睁大眼睛好好看着。\n\n我忍住窒息感，偷偷溜出房门，通过电梯到达顶楼，从逃生通道走到天台。",
    nextSceneId: "ch8_rooftop_arrival",
  },

  ch8_rooftop_arrival: {
    id: "ch8_rooftop_arrival",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/rooftop/天台.png",
    speaker: "旁白",
    text: "深夜，天色如墨，为稀疏的云层绘上一层淡淡的白。\n\n这栋楼有四十层，从这里望去几乎能看到这座城市的全貌。哪怕是深夜，城市似乎仍没有睡着。\n\n我沉默着俯瞰了城市很久。\n\n“你没来过这里。”\n\n“我是没来过。来这地方一来不能学习，二来上上下下很浪费时间，我有什么必要来这里？”",
    nextSceneId: "ch8_rooftop_observation_choice",
  },

  ch8_rooftop_observation_choice: {
    id: "ch8_rooftop_observation_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/rooftop/天台.png",
    speaker: "主角",
    text: "我要让他看见什么？",
    choices: [
      { id: "ch8_showed_working_city", text: "看那边。凌晨一点，依旧有卡车送货，立交桥上还有救护车在跑。", nextSceneId: "ch8_rooftop_perspective", effects: { empathy: 1, realityJudgment: 1 }, tags: ["扩展视角"] },
      { id: "ch8_showed_sensory_city", text: "高楼层顶会留灯，街道路灯也不会熄灭，是为了让人看清脚下的路。", nextSceneId: "ch8_rooftop_perspective", effects: { joyPerception: 2, empathy: 1 }, tags: ["快乐感知"] },
      { id: "ch8_admitted_uncertainty", text: "也许你确实不会感到快乐，那我也愿赌服输，只能死在你手里。", nextSceneId: "ch8_rooftop_perspective", effects: { empathy: 1, trust: 1 }, tags: ["坦诚陪伴"] },
      { id: "ch8_framed_rooftop_as_choice", text: "现在你正站在这个你曾经从来不会踏入的地方，这其实就是一种改变。", nextSceneId: "ch8_rooftop_perspective", effects: { authorityResistance: 1, realityJudgment: 1 }, tags: ["主体性"] },
    ],
  },

  ch8_rooftop_perspective: {
    id: "ch8_rooftop_perspective",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/城市夜景.png",
    cgMode: true,
    speaker: "主角",
    text: "人们为不同的目的而活着，命运在某些时候奇妙地交汇，又在下一站分开。\n\n单一、片面的标准把你困住了，这会让你痛苦。但你永远有权利决定自己想成为什么样的人。\n\n你把圈凿出一个孔，就有路了。\n\n不是推翻整个世界。就你个人而言，只要打破那些束缚住思维的条条框框，就已经能看到圈外的路。\n\n当然，你仍身在圈内。但至少你拥有了培养取悦自己的能力的机会。",
    nextSceneId: "ch8_rooftop_method_choice",
  },

  ch8_rooftop_method_choice: {
    id: "ch8_rooftop_method_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/rooftop/天台.png",
    speaker: "“我”",
    text: "你兜圈子兜了这么久，到底想做什么？你现在唯一该做的，就是让我感受到快乐。\n\n我咳了几声：“别急……我做这么多不就是为了让你感受到快乐吗？来，我教你。”\n\n什么都别想。把注意力集中到感官上，用心感受现在。\n\n风声、鸣笛声、车辆驶过的声音，冬日独有的烟火气，还有远处灯火带来的错觉。\n\n多管闲事也是我的爱好。如果我眼里只有自己，那生活就会很无趣。\n\n但这背后的根源到底是什么？",
    nextSceneId: "ch8_inner_truth_choice",
  },

  ch8_inner_truth_choice: {
    id: "ch8_inner_truth_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/rooftop/天台.png",
    speaker: "“我”",
    text: "所以，造成这一切的根源到底是什么？\n\n我在心里默念那个思考已久的答案，却意识到，有些东西说出口就成了一种教条，甚至是一种路径依赖。",
    choices: [
      { id: "ch8_refused_standard_answer", text: "……告诉你就没有意义了", nextSceneId: "ch8_inner_voice_final_response", effects: { empathy: 1, selfProtection: 1 }, tags: ["尊重主体性"] },
      { id: "ch8_admitted_no_complete_answer", text: "这个答案不一定完整，但对我来说至少目前是正确的——错位", nextSceneId: "ch8_inner_voice_final_response", effects: { truthDesire: 1, realityJudgment: 1 }, tags: ["认识局限"] },
      { id: "ch8_explained_collective_pressure", text: "每个人的答案都不一样，而你的答案需要你自己寻找，我无权干涉", nextSceneId: "ch8_inner_voice_final_response", effects: { realityJudgment: 1, empathy: 1 }, tags: ["主体寻找"] },
      { id: "ch8_asked_present_feeling", text: "答案不重要……倒是你，现在快乐一点了吗？", nextSceneId: "ch8_inner_voice_final_response", effects: { joyPerception: 2 }, tags: ["体验验证"] },
    ],
  },

  ch8_inner_voice_final_response: {
    id: "ch8_inner_voice_final_response",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/城市夜景.png",
    cgMode: true,
    speaker: "旁白",
    text: "风从栏杆缝隙里穿过，城市灯光像散落在夜色里的碎屑。\n\n“我”沉默了很久。\n\n它第一次感觉到，自己不是任务目标，不是需要被矫正的失败品，而是一个被允许自己思考答案的独立个体。\n\n这份尊重不是功利哄劝，也不是把某个标准答案塞进它嘴里。哪怕“错位”这个答案指向物质供给与精神需求之间的裂缝，它也只是主角目前的答案，不是必须被接受的真理。\n\n窒息感没有完全消失，却明显松动了。\n\n它终于忍不住问：为什么？",
    nextSceneId: "ch8_rooftop_resolution",
  },

  ch8_rooftop_resolution: {
    id: "ch8_rooftop_resolution",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/城市夜景.png",
    cgMode: true,
    speaker: "“我”",
    text: "为什么？这对你没有一点好处。你为什么要和我说这么多？\n\n我放松身体，将手臂搭在栏杆上。冷风肆意拨乱我的头发，我眼中却无比清明。\n\n“你就当我，多管闲事吧。”\n\n“神金。”\n\n它语气仍然嫌弃，心情却似乎好了不少。\n\n“再睁眼看看这个令人厌恶的世界。其实也很奇妙，不是吗？”\n\n源于人类本性中纯粹的欲望，纯粹的好奇，于是变成了纯粹的快乐。\n\n脑内警报声停止，“我”的存在也暂时沉寂。",
    nextSceneId: "ch8_return_home",
  },

  ch8_return_home: {
    id: "ch8_return_home",
    chapter: "第8章 · 天台和解",
    background: "",
    cgMode: true,
    speaker: "系统",
    text: "我蹑手蹑脚回到房间，倒头就睡。\n\n恭喜您找到“被遗弃的呐喊碎片2”。\n\n副本探索进度达到20%。\n\n家庭区域叛逆值达到35%。\n\n混沌磁场范围扩大。由于天赋加持效果，您的磁场影响力增强。",
    nextSceneId: "ch8_demo_personality_review",
  },

  ch8_demo_personality_review: {
    id: "ch8_demo_personality_review",
    chapter: "第8章 · 天台和解",
    background: "",
    cgMode: true,
    speaker: "系统",
    text: "Demo阶段人格回响：当前结果只是阶段观察，并非最终人格判定。\n\n你展现出“凿孔者”与“守灯者”的混合倾向：既会寻找规则缝隙，也愿意在自身困难时照亮另一个自己。\n\n优势与风险并存。你能改变一些事，也可能在改变中承担过多重量。\n\n副本尚未结束，未来行为仍会改变画像与关系。\n\n观察仍将继续。",
    nextSceneId: "ch8_unfinished_threads",
  },

  ch8_unfinished_threads: {
    id: "ch8_unfinished_threads",
    chapter: "第8章 · 天台和解",
    background: "/assets/CG/浴室/手机.png",
    cgMode: true,
    speaker: "旁白",
    text: "我睡着以后，手机屏幕在黑暗中悄然亮起。\n\n试胆活动群聊中，周骐瑞发来一条新消息：学校重新开放后，不要立刻回来。\n\n刘宇紧接着回复：晚了。他肯定会来。\n\n另一条未读消息来自陌生号码，内容只有三个词：\n\n镜中尸骸。\n湖中遗物。\n书中落叶。\n\n卫生间的镜面泛起微不可见的涟漪。父母卧室中，本该躺着两个人的床上却空空如也。\n\n而“成为好孩子”的规则，仍存在于学校之外的每一个区域。",
    nextSceneId: "ch8_demo_ending",
  },

  ch8_demo_ending: {
    id: "ch8_demo_ending",
    chapter: "第8章 · Demo结束",
    background: "",
    cgMode: true,
    speaker: "系统",
    text: "《快乐小孩》Demo剧情已完成。\n\n当前副本探索进度：20%。\n\n这不是副本的终点。\n\n你的选择已经改变了角色对你的看法，也改变了叶平生面对规则的方式。\n\n在后续剧情中，未完成的交易、尚未开始的试胆活动、重新修复的学校与家庭中的真相，将继续回应你留下的每一道痕迹。",
    nextSceneId: "title_screen",
  },

};
