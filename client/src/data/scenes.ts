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


  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（跳过第2、3章时从 ch4_exploration_progress 进入）
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）
  // ══════════════════════════════════════════════

  ch4_exploration_progress: {
    id: "ch4_exploration_progress",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/意识/与“我”对话.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]要是我没有看那段文字的话，是不是就可以避免“我”的负面思想？但是，如果我不选择冒险探寻“我”内心真实的想法，又怎么让我得到真正的快乐呢？\n\n[NPC:系统]参赛者寻找到“被遗弃的呐喊碎片1”，副本探索度达5%。\n\n[旁白]为了拿到足够通关奖励，我需要努力把探索度加到100%。每天解锁一片碎片，一周可以增加35%的探索度。\\n\\n要安全收集碎片，必须每天创造让“我”快乐的回忆。\n\n[旁白]我合上计划本，打开手机通讯录，给刘宇发了条信息，就上床睡觉了。\\n\\n当然，我这一夜睡得并不好。\n\n[旁白]第二天，我早早来到学校，在教室所在楼层绕了一圈，没有发现任何规则。",
    nextSceneId: "ch4_find_brochure",
  },

  ch4_find_brochure: {
    id: "ch4_find_brochure",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]我回到教室，在多出来的空位上坐下。\\n\\n过了一分钟，周围的同学没有注意到我，我身上也没有发生任何怪异的事。\\n\\n确认不会违规后，我开始调查抽屉。除了一堆作业之外，我还意外发现了一张活动宣传手册。",
    nextSceneId: "ch4_classroom_rules",
  },

  ch4_classroom_rules: {
    id: "ch4_classroom_rules",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/一班规则.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]手册里夹着一张纸，我取出那张纸，看到了熟悉的猩红字迹。\n\n[旁白]1.严格遵照课程表安排的课程上课，上课须专心，禁止交头接耳（讨论和回答问题除外），禁止离开座位，禁止进食。\\n\\n2.课堂问题回答错误会受到惩罚。\\n\\n3.午餐和晚餐由学校统一提供，禁止浪费。\\n\\n4.每日晚自习进行周测，阅卷完毕后由各科老师公布成绩和排名，请学生们努力学习。\\n\\n5.各班单科周测成绩排名后五名将进行为期一周的课外辅导，请在晚自习开始前30分钟准时到达各班教室参加辅导。\\n\\n6.当天作业通过学习平板提交，请注意作业截止时间，禁止缺交。\\n\\n7.晚自习禁止进食、交头接耳、离开座位。非必要不要抬头。\\n\\n8.学生要听老师的话，禁止忤逆老师。\\n\\n9.晚自习中有30分钟的答疑时间，各科老师会在门口待命，答疑时间及科目每天由各班班长在后黑板更新，请有疑问的同学积极提问。\n\n[主角]（这个规则并不公平。）\n\n[旁白]我们班是尖子班，第五条规则显然是不合理的。不过，这也方便我通过第五条规则获得额外信息。\\n\\n还有第九条规则，并没有说明向老师提问的内容限制，如果可以从老师口中套出情报的话，一定要抓住这个机会。\\n\\n而第三条规则让我感觉是一个陷阱。我目前还不知道食用副本中的食物会有什么副作用，这条规则强制我食用校内食物，无论遵守还是不遵守都是死路一条。\n\n[主角]（我需要找到一个合理处理食物的方法。）\n\n[旁白]收起规则，我转而翻开那张活动宣传册。",
    nextSceneId: "ch4_brochure_content",
  },

  ch4_brochure_content: {
    id: "ch4_brochure_content",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/宣传册.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]这是一个校园试胆活动的宣传册，活动时间是本周六晚19：00，也就是即将通过副本的那一天。扫二维码即可报名，限制名额五人。\n\n[主角]（这活动我是肯定要报名的。）\n\n[旁白]此次试胆活动的主题是调查在学校内流传已久的怪谈，具体内容将在报名后告知。\\n\\n我拿走宣传册，回到自己的座位上，开始按计划表学习。",
    nextSceneId: "ch4_morning_classroom",
  },

  ch4_morning_classroom: {
    id: "ch4_morning_classroom",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]十五分钟后，刘宇来了，他径直走到我面前，把一张花名册扔到我桌上。\n\n[NPC:刘宇]哝，你要的东西。\n\n[主角说]（笑）谢谢，帮大忙了。\n\n[NPC:刘宇]没事。我先收作业去了。",
    nextSceneId: "ch4_morning_liuyu_sits",
  },

  ch4_morning_liuyu_sits: {
    id: "ch4_morning_liuyu_sits",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[主角]（作为班长，刘宇要遵守的规则是不是更多？但同样地，他知道的情报会比其他学生更多，甚至还掌握部分老师的信息。）\n\n[旁白]我暗做打算，然后端详起花名册。",
    nextSceneId: "ch4_roster_anomaly",
  },

  ch4_roster_anomaly: {
    id: "ch4_roster_anomaly",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/花名册.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]花名册上共有三十九人。大部分名字都很熟悉，唯独多出来的那个人——\n\n[主角]（……？）\n\n[旁白]那明明是三个端正的汉字，我却无法理解它们。每当视线试图聚焦，笔画便像水中的倒影一样散开。\\n\\n我打算——",
    choices: [
      { id: "ch4_roster_direct", text: "询问附近同学，这三个字怎么读", nextSceneId: "ch4_roster_ask_student", effects: {"truthDesire": 1}, tags: ["冒险", "果断", "勇敢"] },
      { id: "ch4_roster_observe", text: "先对照座位与花名册，确认这个人是否真实存在", nextSceneId: "ch4_roster_observe", effects: {"selfProtection": 2, "realityJudgment": 1}, tags: ["谨慎", "现实判断", "独立", "防御"] },
      { id: "ch4_roster_test_liuyu", text: "把花名册还给刘宇，用眼神示意异常的位置", nextSceneId: "ch4_roster_test_liuyu", effects: {"trust": 2}, tags: ["试探合作", "信任", "机敏"] },
    ],
  },

  ch4_roster_ask_student: {
    id: "ch4_roster_ask_student",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/花名册.png",
    cgMode: true,
    speaker: "旁白",
    text: "[主角说]同学，你知道这三个字是什么吗？\n\n[NPC:同学]你是不是傻啊？这不是我们班的——\n\n[旁白]她念出名字的瞬间，尖锐的耳鸣刺穿了我的脑袋。声音明明近在咫尺，我却一个字也没能听清。\n\n[主角]（怎么回事？这是系统在妨碍我调查吗？）",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_observe: {
    id: "ch4_roster_observe",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]我没有立刻开口询问，而是借着整理作业的动作，逐一核对座位与花名册。\n\n[旁白]四十一个名字，四十张在我眼中正常使用的桌椅，以及一张所有人都会自然绕开的空座位。\n\n[主角]（似乎只有我不能看见“他”。而在NPC们眼中，那里坐着一个活生生的人。）\n\n[旁白]我再次试图默念那三个字，耳鸣立刻从脑海深处响起，像某种温柔却危险的警告。\n\n[主角]（怎么回事？这是系统在妨碍我调查吗？）",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_test_liuyu: {
    id: "ch4_roster_test_liuyu",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据玩家此前表现生成一段4～8行剧本编码格式片段。主角没有公开提问，而是把花名册异常位置推给刘宇看。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]、[NPC:同学A]、[NPC:同学B]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]固定事实：刘宇知道主角无法读取那个名字，但不能说出名字、身份或原因。\n\n[旁白]- 若主角此前表现谨慎且愿意合作，刘宇用玩笑掩饰，提醒“有些东西看不清就别硬看”，并认可主角的默契。\n\n[旁白]- 若主角此前拒绝合作或表现鲁莽，刘宇装作没看懂，只用眼神警告主角别在教室公开调查。\n\n[旁白]- 不得提供学校根本规则，不得承认自己受系统控制，扮演好主角同学的角色。",
    nextSceneId: "ch4_roster_converge",
  },

  ch4_roster_converge: {
    id: "ch4_roster_converge",
    chapter: "第4章 · 规则发现",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]无论通过视觉、语言还是他人的反应，我都无法知道第四十一个学生是谁。\n\n[主角]（那个人，会是我吗？）\n\n[旁白]我把花名册收进抽屉。这件事之后再查吧。",
    nextSceneId: "ch4_class_montage",
  },

  ch4_class_montage: {
    id: "ch4_class_montage",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]前三节课风平浪静地过去了。\n\n[旁白]期间没有学生主动回答问题。老师不断重复讲题、做题、对答案，再讲题。所有人都在认真忍受，像一群被卡在同一分钟里的钟表。\n\n[主角]（四十个活人沉默得像四十具尸体。啊，令人讨厌的氛围。）",
    nextSceneId: "ch4_physics_observe",
  },

  ch4_physics_observe: {
    id: "ch4_physics_observe",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]第四节是物理课。李老师严格、古板，尤其擅长用带有人身攻击性的批评摧毁学生的自信。\n\n[旁白]反常的是，在她的威压之下，反而有不少学生主动举手，故意回答错误。\n\n[NPC:李老师]这么简单的问题都不会？你们到底有没有认真听课？拿这种状态去高考吗？\n\n[旁白]被骂的学生低下头，神情却悄悄放松下来。没有举手的人身子坐得笔直，仿佛一堵危墙，那双浑浊的眼空洞地盯着讲台。\n\n[主角]（能通过选拔进入这个班的，除了被驯化的异类，没有傻子。而他们不惜被骂也要获得的东西，是老师的惩罚。）",
    choices: [
      { id: "ch4_lunch_punished", text: "过了这座山就没了这家店，抓住机会try一下", nextSceneId: "ch4_physics_wrong_answer", effects: {"realityJudgment": 2}, tags: ["果敢", "勇敢", "现实判断精准", "机智"] },
      { id: "ch4_lunch_not_punished", text: "再加上一个我，老师不得气疯了，她要是把气全撒在我身上那我必死无疑啊", nextSceneId: "ch4_physics_hold_back", effects: {"selfProtection": 2}, tags: ["谨慎", "自我保护", "犹豫", "胆小"] },
    ],
  },

  ch4_physics_wrong_answer: {
    id: "ch4_physics_wrong_answer",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "[主角说]老师，我认为答案是……\n\n[旁白]我给出了一个听起来经过思考、实际上错得恰到好处的答案。\n\n[NPC:李老师]错得离谱！下课后给我好好反省！\n\n[旁白]她骂完便继续讲课，熟练得像完成了一项每日任务。\n\n[主角]（好人机的骂人方式……）\n\n[旁白]之后周骐瑞也在李老师抛出问题时主动举手，平静地给出了错误答案。被骂之后，他甚至没有皱一下眉。",
    nextSceneId: "ch4_lunch_punishment_reveal",
  },

  ch4_physics_hold_back: {
    id: "ch4_physics_hold_back",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[旁白]我没有举手。未知的惩罚可能是出口，也可能是另一层陷阱。\n\n[旁白]之后周骐瑞也在李老师抛出问题时主动举手，平静地给出了错误答案。被骂之后，他甚至没有皱一下眉。\n\n[主角]（看来李老师给的确实不是惩罚，而是“奖励”。）",
    nextSceneId: "ch4_lunch_punishment_reveal",
  },

  ch4_lunch_punishment_reveal: {
    id: "ch4_lunch_punishment_reveal",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]到了午饭时间，物理课代表拿了张名单，念了一遍，然后说，\n\n[NPC:物理课代表]名单上的同学课上回答问题错误，受到的惩罚是——不准吃午饭。\n\n[主角]（我的天，这个惩罚好啊。）\n\n[旁白]【条件：ch4_lunch_punished】\n\n[旁白]我没忍住咧嘴笑了起来。周围几名同学用一种难以理解的眼神看着我。\n\n[旁白]午餐时间充裕，吃完自备的干粮之后，我把目标转向了和我一样被罚不吃午饭的周骐瑞。\n\n[旁白]【条件：ch4_lunch_not_punished】\n\n[旁白]答案已经确认，但我没有获得免除午餐的资格。现在我必须在“不许浪费”的规则下，找到另一条处理食物的路。\n\n[主角]（要不试着问问周骐瑞？）\n\n[旁白]我正想起身去找他，刘宇却把一盒饭递给了我。\n\n[主角]（……）\n\n[NPC:刘宇]你这什么表情，哥们我都帮你拿饭了，你还不满什么？真叫人伤心，呜呜呜~\n\n[主角]（他什么意思？）\n\n[旁白]硬生生把洪水般的愤怒吞入腹中，我的身体像吞了刀子一样传来一阵剧痛，接着不受控制地颤抖起来。\\n\\n吃了会怎样？会立即死掉？还是会逐渐疯掉？但唯一能确定的是，刘宇明知道副本中的食物有问题，却为了自己的安全，把风险转嫁到我身上。\\n\\n我之前居然还天真地以为他是我记忆中的那个刘宇，真是好笑。\\n\\n这里可是死亡游戏，我的死活对他们来说本身就不算什么。\n\n[主角]（我可不能就这样坐以待毙。）",
    choices: [
      { id: "ch4_lunch_test_outside", text: "教室规则上写过，教室内不能浪费食物，那么教室外呢？", nextSceneId: "ch4_lunch_outside_test", effects: {"realityJudgment": 1, "truthDesire": 1}, tags: ["规则推理", "冒险验证", "独立行动"] },
      { id: "ch4_attacked_liuyu", text: "刘宇，你想杀了我？那就别怪我杀了你", nextSceneId: "ch4_lunch_attack_death", effects: {"trust": 1}, tags: ["冲动", "攻击性", "低信任", "极端自保"] },
      { id: "ch4_lunch_refused_liuyu", text: "我不需要。你放回去，我一会自己去拿饭，现在我还不饿", nextSceneId: "ch4_lunch_refuse", effects: {"selfProtection": 3}, tags: ["克制", "谨慎拒绝", "保持体面", "自我保护"] },
      { id: "ch4_lunch_tease_liuyu", text: "你怎么不给周骐瑞，人家也没饭吃，莫非你暗恋我？我可不是男同", nextSceneId: "ch4_lunch_tease", effects: {"realityJudgment": 1}, tags: ["幽默化解", "试探关系", "情绪调节"] },
    ],
  },

  ch4_lunch_outside_test: {
    id: "ch4_lunch_outside_test",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]我接过盒饭，起身走向教室门口。既然规则特意强调“教室内不能浪费食物”，那么门外或许就是漏洞。\n\n[NPC:刘宇]你要去哪？\n\n[主角说]教室里闷得慌。吃饭总得找个空气好的地方吧。\n\n[旁白]我刚跨过门槛，走廊里所有正在活动的学生同时停下脚步，齐刷刷地看向我手中的盒饭。\\n\\n没有警报，也没有老师阻拦。越是如此，我越不敢继续向前。\n\n[旁白]强烈的直觉告诉我，只要我再往前迈出一步，就一定会死。\n\n[主角]（教室规则只管教室，但这不代表教室外没有更危险的规则。违反一条规则还可以拿被动技能抵消，要是违反了两条呢？拿一条已知规则，去赌其他未知规则的边界，未免太蠢了。）\n\n[旁白]我退回教室。走廊的人们重新恢复流动，仿佛刚才只是我的错觉。\\n\\n回过神来，我早已被吓出了一身冷汗。\\n\\n我前所未有地感觉到死亡离我如此之近。\n\n[旁白]还没等我缓过来，刘宇就拍了拍我的肩膀，轻笑道，\n\n[NPC:刘宇]嗯？不是说教室闷得慌吗？怎么又晃回来了？\n\n[旁白]我转过头，有些幽怨地看着对方的笑脸，他那表情好像在看一只马戏团的猴子。\\n\\n之前的愤怒又涌了上来，这次还夹杂着更多的委屈。\\n\\n我就忍着这些负面情绪默默盯着他，不想说任何一句话。\n\n[主角]（不能在NPC面前暴露更多破绽了，我无论如何都不能展现脆弱的一面。）\n\n[NPC:刘宇]哦吼，你生气了？\n\n[主角说]……\n\n[NPC:刘宇]诶呀就是啊都怪那家伙平时对我们俩爱答不理，找到了比学校饭菜更好吃的东西都不告诉我们。\n\n[旁白]他借着按住我肩膀的手把我拉回了教室，带着我把目光移向了另一处。\n\n[旁白]是周骐瑞。",
    nextSceneId: "ch4_zhou_lunch_approach",
  },

  ch4_lunch_attack_death: {
    id: "ch4_lunch_attack_death",
    chapter: "第4章 · 规则发现",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]愤怒先于理智行动。我猛地站起身，抓起桌上的金属水杯，朝刘宇的太阳穴砸去。\n\n[旁白]水杯停在距离他额头不到一寸的位置。\\n\\n不是刘宇挡住了我。我的手臂被某种看不见的力量固定在半空，连指尖都无法移动。\n\n[NPC:刘宇]……你冷静一点。\n\n[旁白]教室里的交谈声消失了。所有同学同时转过头，用同一种失望而悲伤的眼神看着我。\n\n[NPC:系统]技能“违规提醒”正在发动。\n\n[旁白]空气扼住我的咽喉，这一次力道相当大。\n\n[旁白]哐当——\\n\\n手中的水杯掉在了地上，水洒了一地，甚至还泼到了其他同学的桌上。\n\n[NPC:系统]违反两条规则，“违规提醒”失效。\n\n[主角]（我又违反什么规则了？这条规则……我根本不知道是什么！）\n\n[旁白]下一秒，握住水杯的手从指尖开始变得透明。没有鲜血，也没有疼痛，只有身体的一部分被世界迅速遗忘的空虚感。\\n\\n真是残酷又温柔的死法。\\n\\n迷离之际，我居然诡异地感到了一丝解脱。\n\n[主角]（终于可以解脱了。）\n\n[旁白]但是——\n\n[主角说]咳……我果然……\n\n[旁白]我想活下去。\n\n[NPC:刘宇]我知道。\n\n[NPC:刘宇]我会记住你的，第158963号牺牲品。\n\n[NPC:刘宇]对不起。\n\n[NPC:刘宇]你不适合活下去。\n\n[旁白]他的脸上浮现出了一种我根本不可能在这张脸上看到的表情——难以言喻的痛苦、水面之下的悲怆、因深感歉意而坚定选择继续愧疚下去的决绝。\n\n[旁白]刘宇伸手想抓住我，却只穿过了一片逐渐消散的轮廓。\\n\\n直到最后一刻我才明白，刘宇递来的并不是一份必须吃掉的午饭，而是一次看我会不会开口求助的试探。\\n\\n而我把试探当成了谋杀，又用真正的杀意回应了它。\\n\\n我不是被刘宇害死了，而是被我自己的恶意害死了。",
    nextSceneId: "title_screen",
  },

  ch4_lunch_refuse: {
    id: "ch4_lunch_refuse",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]他一脸无辜，\n\n[NPC:刘宇]放不回去。\n\n[主角说]为什么？\n\n[NPC:刘宇]班长要负责确认每个不受罚的人都领到午饭。这是我的职责所在，我可是爱岗敬业、根正苗红的社会主义三好少年。\n\n[旁白]他表面上说得坦然，其实是在告诉我他必须这么做。\\n\\n必须这么做的原因是什么呢？可能是规则所迫，也可能是他为了掩盖一个谎言而编织了另一个谎言。\n\n[主角]（如果他没有骗我，那么无论谁把饭拿来，只要我没有获得惩罚，这一盒饭最终都会属于我。）\n\n[NPC:刘宇]不过嘛，你要是不想吃也可以。\n\n[主角说]？\n\n[NPC:刘宇]哝。\n\n[旁白]他朝周骐瑞的方向怒了努嘴。",
    nextSceneId: "ch4_zhou_lunch_approach",
  },

  ch4_lunch_tease: {
    id: "ch4_lunch_tease",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[NPC:刘宇]周骐瑞被罚不准吃饭可是稀罕事，我可不能便宜了他。\n\n[旁白]周骐瑞忽然打了个喷嚏，抬头看了我们一眼，又面无表情地低下头，无视了两个打哑谜的蠢货。\n\n[NPC:刘宇]况且，这盒饭本来就是你的，你不能忘了拿。\n\n[旁白]我皱了皱眉，\n\n[主角]（什么意思？合着我不拿饭也算浪费？）\n\n[旁白]见我似乎听懂了言外之意，刘宇又恢复了那副玩味的表情。\n\n[NPC:刘宇]还有啊，你放心，我择偶标准没这么低。哪怕我真的是男同，也不会找你这样的。\n\n[主角说]你骂谁呢？嫌弃我还亲自给我送饭，服务挺周到啊。\n\n[NPC:刘宇]毕竟兢兢业业的班长要关爱每一个同学。\n\n[主角说]你下次去关心一下周骐瑞吧。\n\n[NPC:刘宇]比起我的关心，他可能更想要你的关心呢。\n\n[旁白]他说着，朝周骐瑞的方向看了一眼。",
    nextSceneId: "ch4_zhou_lunch_approach",
  },

  ch4_zhou_lunch_approach: {
    id: "ch4_zhou_lunch_approach",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "旁白",
    text: "[旁白]【条件：ch4_lunch_punished】\n\n[NPC:周骐瑞]怎么，有事找我？\n\n[旁白]【条件：ch4_lunch_not_punished】\n\n[NPC:周骐瑞]怎么，有事找我？\n\n[NPC:刘宇]哦？小叶同学这是要求我帮忙吗？先叫一声爸爸听听。\n\n[主角说]是我贱，我就不该找你。\n\n[主角]（事情还没处理。）\n\n[主角]（现在不是调查这位透明人同学的时候。）\n\n[主角]（让人很不舒服的标语。学生真学死了学校又不得了。）\n\n[主角]（这周小班辅导的名单。没有我，真可惜。）",
    nextSceneId: "ch4_zhou_help",
    onCgEnd: "ch4_free_classroom_lunch",
  },

  ch4_liuyu_lunch_tease: {
    id: "ch4_liuyu_lunch_tease",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "刘宇",
    text: "[NPC:刘宇]哦？小叶同学这是要求我帮忙吗？先叫一声爸爸听听。\n\n[主角说]是我贱，我就不该找你。",
  },

  ch4_seat_busy: {
    id: "ch4_seat_busy",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "主角",
    text: "[主角]（事情还没处理。）",
  },

  ch4_empty_seat_lunch: {
    id: "ch4_empty_seat_lunch",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "主角",
    text: "[主角]（现在不是调查这位透明人同学的时候。）",
  },

  ch4_lunch_corridor_blocked: {
    id: "ch4_lunch_corridor_blocked",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "主角",
    text: "[主角]（事情还没处理。）",
  },

  ch4_classroom_slogan: {
    id: "ch4_classroom_slogan",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "主角",
    text: "[主角]（让人很不舒服的标语。学生真学死了学校又不得了。）",
  },

  ch4_classroom_noticeboard: {
    id: "ch4_classroom_noticeboard",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_stand_right",
    speaker: "主角",
    text: "[主角]（这周小班辅导的名单。没有我，真可惜。）",
  },

  ch4_zhou_help: {
    id: "ch4_zhou_help",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[旁白]他的目光淡淡地扫向我，没有一丝惊愕，似乎早就料到我会来找他。",
    choices: [
      { id: "ch4_zhou_help_polite", text: "周骐瑞，你饿不饿，要不要吃点？", nextSceneId: "ch4_zhou_fixed_help", effects: {"trust": 1, "empathy": 1, "realityJudgment": 1}, tags: ["委婉求助", "尊重边界", "社交策略"] },
      { id: "ch4_zhou_help_humorous", text: "周骐瑞，你孤单坏了吧？我来社区送温暖了。", nextSceneId: "ch4_zhou_fixed_help", effects: {"trust": 1}, tags: ["幽默求助", "情绪调节", "试探关系"] },
      { id: "ch4_zhou_help_referred", text: "那个，周骐瑞，刘宇让我找你……", nextSceneId: "ch4_zhou_fixed_help", effects: {"trust": 2}, tags: ["坦诚求助", "依赖合作", "暴露窘迫"] },
    ],
  },

  ch4_zhou_fixed_help: {
    id: "ch4_zhou_fixed_help",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据主角请求帮助的方式、此前的调查表现与周骐瑞对主角的印象，生成一段4～8行剧本编码格式片段。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:周骐瑞]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]固定事实：\n\n[旁白]- 周骐瑞知道学校盒饭的危险，也知道吃“不属于自己”的盒饭不会触发食物的侵蚀效果。\n\n[旁白]- 周骐瑞被罚不准吃自己的午饭，但可以替主角吃掉主角的盒饭。\n\n[旁白]- 周骐瑞愿意收下盒饭，但不会热情安慰主角，也不会直接解释完整规则。\n\n[旁白]- 回应结束时，周骐瑞必须自然地接过盒饭并开始吃。\n\n[旁白]动态表现：\n\n[旁白]- 委婉求助：周骐瑞看穿主角目的，只说“给我吧”或同等含义，认可其懂得求助。\n\n[旁白]- 幽默求助：周骐瑞可以冷淡吐槽一句，但会配合主角化解尴尬。\n\n[旁白]- 坦诚提及刘宇：周骐瑞指出刘宇又把麻烦推给自己，但不拒绝帮助。\n\n[旁白]- 高现实判断/尊重边界：可额外提醒“只有这盒可以给我，别的不妥”。\n\n[旁白]- 高鲁莽/低信任：明确警告主角，不要把一次成功当成通用规则。\n\n[旁白]禁止直接解释食物侵蚀原理，禁止透露学校根本规则，禁止替主角回答后续问题。",
    nextSceneId: "ch4_zhou_help_result",
  },

  ch4_zhou_help_result: {
    id: "ch4_zhou_help_result",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[旁白]【条件：ch4_lunch_not_punished】\n\n[主角]（他就这么自然地收下了？）\n\n[旁白]周骐瑞也不客气，拆开一次性筷子就吃了起来。\n\n[主角]（副本内的食物不是会侵蚀心智吗？但周骐瑞却毫不犹豫地吃了我的盒饭。是因为他知道这盒饭对他来说没有什么debuff吗？）\n\n[旁白]我没有立刻离开。既然周骐瑞愿意帮我处理盒饭，或许也愿意回答几个不触碰规则的问题。",
    nextSceneId: "ch4_zhou_question_method",
  },

  ch4_zhou_question_method: {
    id: "ch4_zhou_question_method",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[主角]（我还需要尽可能多地打探情报。NPC也受规则限制，他可能无法直接回答。）",
    choices: [
      { id: "ch4_zhou_respectful", text: "我有个问题想问你。但也许你无法直接回答。因此，我会用提问的方式找到我想要的答案，你只用回答是或否", nextSceneId: "ch4_zhou_respectful_intro", effects: {"empathy": 1, "realityJudgment": 1, "selfProtection": 1}, tags: ["尊重边界", "逻辑推理", "谨慎合作"] },
      { id: "ch4_zhou_frank", text: "周骐瑞，能稍微给我透露一些学校区域探索的方向吗？", nextSceneId: "ch4_zhou_frank_intro", effects: {"trust": 2}, tags: ["坦诚求助", "信任", "暴露脆弱"] },
      { id: "ch4_zhou_testing", text: "瞧你饿得——你何必故意答错问题遭这个罪呢？你肯定知道那道物理题的正确答案是什么", nextSceneId: "ch4_zhou_testing_intro", effects: {"selfProtection": 1, "realityJudgment": 1}, tags: ["试探", "自我保护", "控制信息", "机智"] },
    ],
  },

  ch4_zhou_respectful_intro: {
    id: "ch4_zhou_respectful_intro",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[主角说]我有个问题想问你。但也许你无法直接回答。因此，我会用提问的方式找到我想要的答案。\n\n[主角说]你只用回答是或否。\n\n[旁白]周骐瑞咽下嘴里的饭，抬眼看了我一下。\n\n[NPC:周骐瑞]可以。\n\n[主角]（很好。至少他愿意配合这种边界明确的问法。）",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_frank_intro: {
    id: "ch4_zhou_frank_intro",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[主角说]周骐瑞，能稍微给我透露一些学校区域探索的方向吗？\n\n[旁白]他没有立刻回答，只是把筷子放下，视线扫过教室里埋头吃饭的学生。\n\n[NPC:周骐瑞]方向这种东西，说出来就不是方向了。\n\n[主角说]那我换一种问法。你不用主动透露，我问，你只回答是或否。\n\n[NPC:周骐瑞]这样可以。\n\n[主角]（他拒绝了直接指路，但接受了有限问答。规则边界比我想象中更窄。）",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_testing_intro: {
    id: "ch4_zhou_testing_intro",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[主角说]瞧你饿得——你何必故意答错问题遭这个罪呢？你肯定知道那道物理题的正确答案是什么。\n\n[旁白]周骐瑞掀起眼皮，面无表情地看着我。\n\n[NPC:周骐瑞]你想问的是“为什么”，不是“是不是”。\n\n[主角说]行，那我不问为什么。我问几个是非题，你能答就答，不能答就沉默。\n\n[NPC:周骐瑞]可以。别绕太远。\n\n[主角]（他不喜欢被试探，但并不排斥这种低风险的信息交换。）",
    nextSceneId: "ch4_zhou_fixed_questions",
  },

  ch4_zhou_fixed_questions: {
    id: "ch4_zhou_fixed_questions",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[旁白]【条件：ch4_lunch_box_given_to_zhou】\n\n[主角说]你吃这盒饭不会受到影响，是因为它不属于你，对吗？\n\n[NPC:周骐瑞]是。\n\n[主角]（盒饭的归属能够改变食用后果。但这不代表副本内所有食物都遵循相同规则。）\n\n[旁白]【条件：ch4_lunch_punished】",
    nextSceneId: "ch4_zhou_common_questions",
  },

  ch4_zhou_common_questions: {
    id: "ch4_zhou_common_questions",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[主角说]大部分副本里的食物，会让人失去自我意识，对吗？\n\n[NPC:周骐瑞]是。\n\n[主角说]除了通过惩罚免除午晚餐，还有其他处理方法？\n\n[NPC:周骐瑞]是。\n\n[主角说]你打算参加这周六的试胆活动？\n\n[NPC:周骐瑞]是。\n\n[主角]（看来这个活动并不是副本单独为我开放的某种关卡。）",
    nextSceneId: "ch4_zhou_dynamic_response",
  },

  ch4_zhou_dynamic_response: {
    id: "ch4_zhou_dynamic_response",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据玩家本章的调查方式、物理课选择与提问方式，生成一段4～8行剧本编码格式片段，表现周骐瑞对主角的判断。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:周骐瑞]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]固定事实不能改变：大部分副本食物危险；主角的学校盒饭可由不属于它的人安全食用；存在其他处理方法；周骐瑞参加周六活动。\n\n[旁白]动态回应范围：\n\n[旁白]- 若周骐瑞替主角吃了盒饭：认可主角最终愿意开口求助，但提醒“别把别人愿意帮忙当成理所当然”。\n\n[旁白]- 高现实判断/尊重边界：认可主角会利用规则，可额外提醒“晚餐动作要快，去晚了就没位置处理”。\n\n[旁白]- 高坦诚信任：不表现亲近，但可明确建议主角去找刘宇，认为刘宇会处理。\n\n[旁白]- 高试探/低信任：只说“你已经得到答案了”，不提供额外帮助。\n\n[旁白]- 高鲁莽/低现实判断：警告主角不要把所有漏洞都当作安全出口。\n\n[旁白]不得解释学校根本规则，不得透露周六活动具体内容。\n\n[旁白]---",
    nextSceneId: "ch4_art_class_start",
  },

  ch4_art_class_start: {
    id: "ch4_art_class_start",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    playerState: "yps_frames_sit_back",
    speaker: "旁白",
    text: "[旁白]周一下午有一节美术课。一位将近七十岁的老人步伐稳健地走进教室，澄澈锐利的眼睛扫过每个人的脸。\n\n[NPC:美术老师]把桌上的书都收起来吧，什么都别放。\n\n[旁白]窸窸窣窣的收拾声响起，我望着自己本就空荡荡的书桌，一时感到有些尴尬。\\n\\n片刻后同学们又像雕塑一样端坐着，好像在等待着老师发布新的标准答案。\\n\\n之后再一头扎进疯狂竞争的泥潭里。\n\n[NPC:美术老师]这位同学，作业这么急着写吗？\n\n[旁白]那个偷偷写作业的同学不甘心地收起了作业。\\n\\n老师满意地点点头，\n\n[NPC:美术老师]那么我们正式上课吧。\n\n[NPC:美术老师]这节课你们需要完成一幅画。画什么都可以，不必完全画完，我也不会夸奖或批评任何人。\n\n[NPC:美术老师]在我的课上没有成绩和排名。你们只需要成为你们自己就好。\n\n[旁白]短暂的自由落下来，陌生得让大家不知所措，教室里迟迟没有一个人动笔。\\n\\n看到这副场景，我苦笑了一下，\n\n[主角]（当一个人习惯了按别人的答案活着，连自由也会变成一道不会做的题。）\n\n[主角]（那就我来当这只出头鸟吧。至少，我曾经是这个制度下的幸存者。）\n\n[旁白]我唰唰几笔就画完了一幅极其抽象的画，然后果断地把它举起来。\n\n[主角说]老师，我画完了。\n\n[旁白]我附近的同学都惊恐地盯着我。\n\n[旁白]\\n\\n我的画中——",
    nextSceneId: "ch4_choose_painting",
  },

  ch4_choose_painting: {
    id: "ch4_choose_painting",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch4_painting_puppet", text: "一个四分五裂的傀儡被囚禁于四分五裂的监牢中，监牢外是一套崭新的桌椅，周围萦绕着花瓣和蝴蝶", nextSceneId: "ch4_show_painting", effects: {"realityJudgment": 1, "truthDesire": 1, "authorityResistance": 1}, tags: ["策略表达", "真相欲望", "表演性反抗"] },
      { id: "ch4_painting_memory", text: "一个矮小的火柴人在草地上自由奔跑，蓝天、白云、太阳，好像都一起回到了最初的美好", nextSceneId: "ch4_show_painting", effects: {"joyPerception": 2}, tags: ["真诚表达", "快乐感知", "暴露自我"] },
      { id: "ch4_painting_safe", text: "一张方方正正的课桌摆在画纸中央，很明显是用借用尺子画的线条", nextSceneId: "ch4_show_painting", effects: {"selfProtection": 2, "authorityResistance": 1}, tags: ["谨慎服从", "自我保护", "怀疑权威"] },
    ],
  },

  ch4_show_painting: {
    id: "ch4_show_painting",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[旁白]老师拿起我的画饶有兴致地端详起来。\n\n[NPC:美术老师]哦？这位同学思维很活跃嘛。",
    nextSceneId: "ch4_wang_dynamic_judgment",
  },

  ch4_wang_dynamic_judgment: {
    id: "ch4_wang_dynamic_judgment",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据玩家选择的画作与七维人格画像，生成一段5～10行剧本编码格式片段，表现王老师对画作和主角状态的评价。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:美术老师]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]必须遵守：\n\n[旁白]- 王老师欣赏矛盾与主体性，但不会无条件赞扬。\n\n[旁白]- 必须自然引出“做你自己”这一命题。\n\n[旁白]- 若画傀儡监牢：指出画面“混乱中有决绝”，同时指出它可能是为了套取通关副本答案而画，因此“和现在的你一样虚伪”。\n\n[旁白]- 若画真实回忆：承认画面普通却真实，追问主角为何认为快乐必须足够深刻才值得被画。\n\n[旁白]- 若画标准作品：指出技巧正确但画里没有人，询问主角是在观察老师，还是害怕自由。\n\n[旁白]- 主角听到评价后要表示不解，但王老师不会告诉他，只会说“没关系，这不重要。我很欣赏你的画。”\n\n[旁白]- 不能直接解释副本真相，不能直接给出快乐答案，不能替玩家定义真实自我。",
    nextSceneId: "ch4_wang_question_choice",
  },

  ch4_wang_question_choice: {
    id: "ch4_wang_question_choice",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[主角]（呵，不想告诉我啊，那我换个问题。）",
    choices: [
      { id: "ch4_wang_metaphor", text: "那您能否告诉我，这个人偶怎么才能坐到那张椅子上？", nextSceneId: "ch4_wang_core_reply", effects: {"truthDesire": 2}, tags: ["隐喻追问", "真相欲望", "保持距离"] },
      { id: "ch4_wang_honest", text: "那您能否告诉我，我该怎么在这种环境下成为“他”？", nextSceneId: "ch4_wang_core_reply", effects: {"realityJudgment": 1}, tags: ["坦诚", "自我认知", "承担脆弱"] },
      { id: "ch4_wang_withhold", text: "您确定，如果我画的是一幅真实的画，在这样的环境下，我有机会让画变成现实，而不是把自己变成时代的牺牲品？", nextSceneId: "ch4_wang_core_reply", effects: {"selfProtection": 2}, tags: ["克制", "自我保护", "延迟判断"] },
    ],
  },

  ch4_wang_core_reply: {
    id: "ch4_wang_core_reply",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/classroom/教室.png",
    speaker: "旁白",
    text: "[旁白]【条件：ch4_wang_metaphor】\n\n[旁白]老师并没有立即回答，反而平静地注视着我的眼睛。他的眼睛仿佛有一种穿透人心的力量，让我感觉我所有的伪装和谎言都被他识破了。\n\n[NPC:美术老师]你早就有能力坐到那张椅子上了，不是吗？\n\n[旁白]该死的谜语人。啊不，都怪我一开始就用这幅抽象画跟他打哑迷了。\n\n[主角说]但我不知道该怎么办。这样的话，哪怕有能力也没有用。\n\n[NPC:美术老师]所以啊，我一开始就已经说了——做你自己就好。\n\n[旁白]【条件：ch4_wang_honest】\n\n[NPC:美术老师]只要你想，你随时都可以成为“他”。\n\n[旁白]该死的谜语人。啊不，都怪我一开始就用这幅抽象画跟他打哑迷了。\n\n[主角说]这不现实，我还要高考、还要对得起父母的期待、还要在社会上生存下来。\n\n[主角说]成为他，我的处境会变得很危险。\n\n[NPC:美术老师]所以啊，我一开始就已经说了——你已经知道答案了。\n\n[旁白]【条件：ch4_wang_withhold】\n\n[NPC:美术老师]做自己不等于把命丢掉。若一个人只在安全时才承认自己，那份“自己”也未免太轻了。\n\n[NPC:美术老师]至于什么时候该冒险，那是你的课题，不是我的答案。\n\n[旁白]他的目光重新投向整个教室。\n\n[NPC:美术老师]这是你们从生到死都应该放在首位的生命课题，孩子们。\n\n[旁白]【条件：ch4_painting_puppet】\n\n[旁白]他重新看向我，\n\n[NPC:美术老师]这位同学，你的这幅画和现在的你一样虚伪。\n\n[旁白]我身形猛地一震。\n\n[NPC:美术老师]这不是你真心画出来的画，这不是你心灵的投射。你对待世界的虚伪终会让你最后得到一个虚假的答案。\n\n[旁白]我虚伪？是指我并没有融入这个副本吗？但我如果被副本同化了，我岂不是永远出不去了？\\n\\n不过，从副本NPC个人角度考虑，我的安危无足轻重。而且他似乎很笃定我非常需要他的指点。\\n\\n还有一种可能，他是指我对待这个世界的态度。\\n\\n我需要核实一下。\\n\\n我压低声音，\n\n[主角说]您想让我去送死？\n\n[旁白]他像是没听见我说的话似的，拍了拍我的肩膀，去看其他同学是画去了。\\n\\n狡猾的老狐狸，直接不给回答了。\n\n[旁白]【条件：ch4_painting_safe】\n\n[旁白]他重新看向我，\n\n[NPC:美术老师]这位同学，你的这幅画和现在的你一样虚伪。\n\n[旁白]我身形猛地一震。\n\n[NPC:美术老师]你把正确、干净、安全都摆在纸上，却唯独没有把自己摆进去。你不是不会画，你只是不肯承认自己在害怕。\n\n[旁白]我虚伪？是指我并没有融入这个副本吗？但我如果被副本同化了，我岂不是永远出不去了？\\n\\n不过，从副本NPC个人角度考虑，我的安危无足轻重。而且他似乎很笃定我非常需要他的指点。\\n\\n还有一种可能，他是指我对待这个世界的态度。\\n\\n我需要核实一下。\\n\\n我压低声音，\n\n[主角说]您想让我去送死？\n\n[旁白]他像是没听见我说的话似的，拍了拍我的肩膀，去看其他同学是画去了。\\n\\n狡猾的老狐狸，直接不给回答了。\n\n[旁白]【条件：ch4_painting_memory】\n\n[旁白]他重新看向我，目光比刚才柔和了一些。\n\n[NPC:美术老师]这幅画很普通，但普通不等于廉价。能把真实的东西画出来，本身就已经很难得了。\n\n[旁白]我一时分不清他是在评价画，还是在评价我这个人。\n\n[NPC:美术老师]记住这种感觉。它不一定深刻，但它属于你。\n\n[旁白]……",
    nextSceneId: "ch4_dinner_problem",
  },

  ch4_dinner_problem: {
    id: "ch4_dinner_problem",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]下午没有物理课，真是可惜。\n\n[旁白]我看着桌上的盒饭，比面对一道数学压轴题还要焦头烂额。\n\n[主角]（从中午刘宇和周骐瑞对我的态度，以及美术老师的抛砖引玉来看，NPC们似乎知道我是参赛者，只不过他们愿意陪我演戏。）\n\n[旁白]我神色漠然地看着出去领盒饭的同学。\\n\\n正巧看见刘宇拿着盒饭从我身边经过。我——",
    choices: [
      { id: "ch4_asked_liuyu_directly", text: "揪住刘宇衣角，“咳……你不会打算吃吧？”", nextSceneId: "ch4_liuyu_food_response", effects: {"trust": 2}, tags: ["主动求助", "信任", "放下面子", "有些可爱"] },
      { id: "ch4_asked_liuyu_plan", text: "叫住刘宇，问：“你现在是打算去处理晚饭对吧？”", nextSceneId: "ch4_liuyu_food_response", effects: {"trust": 1, "realityJudgment": 1}, tags: ["合作提案", "现实判断", "保留主动权"] },
      { id: "ch4_followed_liuyu", text: "记得走廊上有很多同学。他们会认为刘宇准备浪费食物吗？我要悄悄跟上，看他怎么能顺利逃过走廊同学的“死亡凝视”", nextSceneId: "ch4_liuyu_food_response", effects: {"selfProtection": 1}, tags: ["独立行动", "怀疑", "自我保护"] },
    ],
  },

  ch4_liuyu_food_response: {
    id: "ch4_liuyu_food_response",
    chapter: "第4章 · 规则发现",
    background: "/assets/CG/教室/教室白天.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据玩家午餐处理方式、对刘宇的信任程度与本章人格画像，生成一段5～9行剧本编码格式片段，表现刘宇判断主角是否值得进一步合作。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]固定主线：主角最终会得知厕所可以处理盒饭，并安全避开晚餐。但要想避开走廊学生的视线，除了身份是班委的学生可以独行，普通学生必须结伴而行。\n\n[旁白]动态帮助等级：\n\n[旁白]- 若午餐时主角曾向周骐瑞求助：刘宇认可主角听懂了自己的暗示，可调侃“这次终于知道直接找人了”。\n\n[旁白]- 高信任且主动求助：刘宇嘴上嫌弃，实际带路并提醒动作要快。\n\n[旁白]- 高现实判断且提出方案：刘宇确认方案，允许主角同行，并认可其推理。\n\n[旁白]- 低信任或尾随：刘宇当场识破，要求主角自己说明目的；若主角此前表现不鲁莽，仍给出方向，但不主动照看。\n\n[旁白]- 若玩家此前尊重周骐瑞边界或真诚面对王老师，可让刘宇注意到这种变化，但不能直接读取玩家内心。\n\n[旁白]- 若选择了ch4_asked_liuyu_directly，先添加固定对话：\n\n[NPC:刘宇]你当我傻啊？我还有脑子呢。\n\n[主角说]那……你带带我呗。\n\n[NPC:刘宇]……\n\n[主角]（我相信人至贱则无敌。）",
    nextSceneId: "ch4_dispose_food",
  },

  ch4_dispose_food: {
    id: "ch4_dispose_food",
    chapter: "第4章 · 规则发现",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]厕所里已经挤了不少人。没有人交谈，大家默契地把饭倒进隔间，再用水冲掉。\n\n[主角说]就把饭倒里头就完事了？\n\n[NPC:刘宇]不然你以为还能怎么样？\n\n[主角说]这么简单粗暴，真是出乎预料。\n\n[NPC:刘宇]这是没有办法的办法。幸好来得早，不然待会连给你倒饭的位置都没有。\n\n[旁白]规则要求教室内“不许浪费”，却没有规定食物最后必须进入谁的胃里。",
    nextSceneId: "ch4_greenbelt_start",
  },

  ch4_greenbelt_start: {
    id: "ch4_greenbelt_start",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/gate/校门白天.png",
    playerState: "yps_frames_stand_left",
    speaker: "旁白",
    text: "[旁白]现在是十八点，离晚自习还有一个小时。\n\n[旁白]刘宇像是看出了我心中所想，拉着我转身往教学楼外的绿化带走去。\n\n[NPC:刘宇]来吧，到那里说。",
    nextSceneId: "ch4_greenbelt_after_walk",
  },

  ch4_greenbelt_after_walk: {
    id: "ch4_greenbelt_after_walk",
    chapter: "第4章 · 规则发现",
    background: "/assets/maps/gate/校门白天.png",
    playerState: "yps_frames_stand_left",
    speaker: "旁白",
    text: "[旁白]灌木隔开了来往视线。我们在一张长椅上坐下，这里真是个谈话的好地方。",
    nextSceneId: "ch4_liuyu_fixed_warning",
  },

  ch4_liuyu_fixed_warning: {
    id: "ch4_liuyu_fixed_warning",
    chapter: "第4章 · 规则发现",
    background: "",
    speaker: "旁白",
    text: "[NPC:刘宇]你家的事还牵扯到了学校里？\n\n[主角说]多少有一些。\n\n[NPC:刘宇]那我劝你，不要私自调查我们教室之外的其他教室和办公室。\n\n[主角说]这不太合理吧？这么大的学校，不探索难道坐以待毙？\n\n[NPC:刘宇]你今天看到的是教室里的规则，不是学校里的规则。\n\n[主角说]所以我才更应该找到学校规则啊。\n\n[NPC:刘宇]太具体的我不能说。但我可以告诉你——你找不到学校的规则。\n\n[主角说]你有什么证据？我都没开始找呢。\n\n[NPC:刘宇]你想赶去送人头我也不拦你。\n\n[主角说]……\n\n[主角]（要知晓规则，就必须向NPC求助，然后受制于人。）\n\n[旁白]我思考了一会，然后问他，\n\n[主角说]你的意思是让我和你合作？\n\n[NPC:刘宇]我们不是早就已经合作了吗？\n\n[主角说]我什么时候……\n\n[旁白]我突然想到了什么，话说到一半硬是把它咽回肚子里。\\n\\n刘宇忍不住坏笑起来。\\n\\n我忍住怒火，碍于确实需要他帮忙只能平静地控诉，\n\n[主角说]你诓我。\n\n[NPC:刘宇]这怎么能叫诓呢？你昨天不都承认你信任我了？\n\n[主角说]现在不信任了。\n\n[NPC:刘宇]诶，没爱了没爱了。\n\n[旁白]这说的，好像真的关系跟我很好一样。",
    nextSceneId: "ch5_liuyu_negotiate",
  },

  ch5_liuyu_negotiate: {
    id: "ch5_liuyu_negotiate",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/gate/校门白天.png",
    playerState: "yps_frames_stand_left",
    speaker: "旁白",
    text: "[主角说]刘宇，我是认真的，我没和你开玩笑。\n\n[旁白]刘宇脸上的笑意慢慢消失。\n\n[主角说]你很清楚，我们对彼此而言都只是陌生人。没必要演互相信任的戏码。\n\n[NPC:刘宇]你觉得我在演戏？\n\n[主角说]你既然一开始就知道我的身份，又何必以朋友的名义接近我？合作的诚意，应该都是拿的出手的利益吧。\n\n[主角说]而且，这点诚意你肯定是有的。\n\n[旁白]刘宇低下头，我看不清他的表情，只能感受到愈发沉重的空气。哪怕只是个NPC，都让我难以承受这样的威压。\\n\\n但为了夺回主动权，我必须继续说下去。\n\n[主角说]还是说，这样一步步把我引诱到不得不依赖你的境地是因为你想得到一个免费为你服务的棋子？\n\n[旁白]NPC会主动处理侵蚀意识的食物，也会帮助参赛者。这意味着他们和我存在共同的危险，甚至目标。\\n\\n但是他们不是参赛者，无法对副本做出实质性的改变。\\n\\n因此，为了达到自己的目的，有实力的NPC需要参赛者。\\n\\n但如果我接受了太多没有标价的帮助，最后或许只能寄人篱下，永远无法达到我想要的结果。\\n\\n毕竟我掌握的信息量肯定不如他们，他们想制约我简直易如反掌。\n\n[主角]（那么，如果得不到参赛者的帮助，他们会把参赛者杀掉以防止看到自己不想要的结局吗？）\n\n[旁白]我握住了藏在衣服内衬里的水果刀。",
    nextSceneId: "ch5_liuyu_negotiation_choice",
  },

  ch5_liuyu_negotiation_choice: {
    id: "ch5_liuyu_negotiation_choice",
    chapter: "第5章 · 合作与交易",
    background: "",
    speaker: "旁白",
    text: "[主角]（必须让他看清楚，我的底线在哪里。）",
    choices: [
      { id: "ch5_liuyu_equal_terms", text: "我很好奇，你们为什么都这么畏惧下午那位美术老师。让我想想，是因为他比你们更强、而且有损你们的利益，对吧？", nextSceneId: "ch5_liuyu_dynamic_response", effects: {"realityJudgment": 1}, tags: ["利益推理", "试探同盟", "边界感"] },
      { id: "ch5_liuyu_honest_terms", text: "要么给我看现成的货，要么死，你选一个吧", nextSceneId: "ch5_liuyu_dynamic_response", effects: {"realityJudgment": 1}, tags: ["强硬索价", "威胁", "高攻击性"] },
      { id: "ch5_liuyu_demand_proof", text: "别以为参赛者是廉价的商品，你想拿就拿，想扔就扔。你要是惹怒了我，我可以用我的技能杀了你", nextSceneId: "ch5_liuyu_dynamic_response", effects: {"selfProtection": 1}, tags: ["参赛者价值", "欺骗威慑", "自我保护"] },
      { id: "ch5_liuyu_rule_bluff", text: "你这样强迫我，就别怪我不客气", nextSceneId: "ch5_liuyu_dynamic_response", effects: {"realityJudgment": 1}, tags: ["欺骗威慑", "强硬谈判", "高警惕"] },
    ],
  },

  ch5_liuyu_dynamic_response: {
    id: "ch5_liuyu_dynamic_response",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/gate/校门白天.png",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】综合第四章刘宇对主角的印象、本章谈判方式以及主角是否握住水果刀，生成一段4～8行的剧本编码格式片段。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]。\n\n[旁白]- 允许使用 NPC动作，但不要生成新选项。\n\n[旁白]- 不要生成跳转，片段结束后由固定流程跳转。\n\n[旁白]固定事实：\n\n[旁白]- 刘宇不会攻击主角。\n\n[旁白]- 刘宇接受有限合作，但不会无条件交出全部情报。\n\n[旁白]- 刘宇知道主角在防备自己，也理解这种防备。\n\n[旁白]- 片段结束时，主角必须能够继续询问“获得许可后是否可以调查学校区域”。\n\n[NPC:刘宇]如果这么做能让你安心的话，就先这样吧。\n\n[主角说]我可以先试着与你合作。一旦我有任何关于学校的线索，在规则允许的范围内，我都会告诉你，我希望你对我也一样。\\n\\n合作期间，但凡我发现你的行为对我的生命存在威胁，我会使用技能修改一条规则，将你置于死地。\n\n[NPC:刘宇]你还有修改规则的技能？\n\n[主角]（当然，是我编的。技能怎么用我都不知道呢。）\n\n[主角说]信不信由你。你要是不怕死的话大可一试。\n\n[NPC:刘宇]我还是很惜命的。\n\n[旁白]动态表现：\n\n[旁白]- 若询问王沁林利益：刘宇避开正面回答，但确认王沁林的权限与危险性高于普通学生。\n\n[旁白]- 若要求现成筹码：刘宇短暂收起玩笑，承认自己需要拿出足够筹码。\n\n[旁白]- 若强调参赛者价值：刘宇指出主角也一直在试探自己，但愿意先给出一条行动建议。\n\n[旁白]- 若选择直接威胁：刘宇看出主角可能在虚张声势，但不拆穿，只表示自己惜命；降低信任，提高对主角危险性的评价。\n\n[旁白]- 若第四章主角持续防备或尾随刘宇：刘宇指出主角最终还是主动提出了条件，但不嘲讽过度。\n\n[旁白]- 若主角握刀且攻击倾向高：刘宇明确要求主角把手从口袋里拿出来，再继续谈。\n\n[旁白]禁止直接说出学校根本规则，禁止给予完整学校地图，禁止替玩家决定合作方式。",
    nextSceneId: "ch5_permission_inference",
  },

  ch5_permission_inference: {
    id: "ch5_permission_inference",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/gate/校门白天.png",
    speaker: "旁白",
    text: "[主角说]话说回来，你说我不能私自调查学校。那么，如果我得到了许可，就可以调查吗？\n\n[NPC:刘宇]理论上可行。但你能通过这种方式获得许可的区域很有限。\n\n[NPC:刘宇]各科老师办公室、我们班教室、音乐教室、医务室、操场、厕所。除此之外，还有多少地方会允许一个外来者进去？\n\n[主角说]我还有这个。\n\n[旁白]我取出试胆活动宣传册。\\n\\n刘宇微微瞪大眼睛，\n\n[NPC:刘宇]哦？你这么快就找到了。\n\n[主角说]现在还剩两个名额，对吧？\n\n[NPC:刘宇]你推测得没错。但活动只能给你五个小时的探索时间，恐怕有点紧。\n\n[主角]（形势有点严峻啊。）",
    choices: [
      { id: "ch5_permission_rule_inferred", text: "我明白了", nextSceneId: "ch5_liuyu_permission_reaction", effects: {"realityJudgment": 1}, tags: ["隐性推理", "果断行动", "信息自持"] },
      { id: "ch5_permission_rule_withheld", text: "教师办公室可以不需要许可？", nextSceneId: "ch5_liuyu_permission_reaction", effects: {"truthDesire": 1}, tags: ["规则验证", "谨慎追问", "目标明确"] },
      { id: "ch5_asked_liuyu_escort", text: "你有什么许可可以给我“借用”一下吗？", nextSceneId: "ch5_liuyu_permission_reaction", effects: {"trust": 1}, tags: ["试探合作", "权限误判", "风险转移"] },
    ],
  },

  ch5_liuyu_permission_reaction: {
    id: "ch5_liuyu_permission_reaction",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/gate/校门白天.png",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】围绕主角对“权限”的理解生成一段3～6行剧本编码格式片段，并自然推动主角独自前往王沁林工作室。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]。\n\n[旁白]- 不要生成新选项，不要生成跳转。\n\n[旁白]固定事实：\n\n[旁白]- 刘宇不能陪同主角前往王沁林工作室。\n\n[旁白]- 刘宇不会明确复述学校根本规则。\n\n[旁白]- 刘宇知道王沁林危险，但认可主角去找他的思路。\n\n[旁白]- 若玩家选择“我明白了”，必须包含：[主角说]你不能告诉我的那条规则，应该是“进入指定区域须获得相应权限”，对吧？那么，只要我获得了权限就不成问题。\n\n[旁白]动态回应：\n\n[旁白]- 若主角选择“我明白了”：刘宇不确认规则，只用欣慰或警惕的态度暗示方向正确。\n\n[旁白]- 若主角追问教师办公室许可：刘宇认可其没有把推测当事实，可提示“老师本人给予的允许和区域规则不是一回事”。\n\n[旁白]- 若主角想借用刘宇许可：刘宇拒绝，并说明“别人的许可不能替你使用”；若高信任，可额外提醒“老师给予的许可通常附带条件”。\n\n[旁白]- 片段必须自然落到主角决定独自去找王沁林获得许可。",
    nextSceneId: "ch5_go_to_wang_gallery",
  },

  ch5_go_to_wang_gallery: {
    id: "ch5_go_to_wang_gallery",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/教室/傍晚天空.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]我站起身，转身走向教学楼。\n\n[NPC:刘宇]你去哪？\n\n[主角说]去获得许可。\n\n[旁白]【条件：ch5_permission_rule_inferred】\n\n[旁白]刘宇看着我的背影，欣慰地笑了。\n\n[旁白]【条件：ch5_permission_rule_withheld】\n\n[旁白]刘宇看着我的背影，像是对我的谨慎还算满意。\n\n[旁白]【条件：ch5_asked_liuyu_escort】\n\n[旁白]刘宇看着我的背影，无奈地笑了一下，却没有再阻拦。",
    nextSceneId: "ch5_enter_fifth_floor",
  },

  ch5_enter_fifth_floor: {
    id: "ch5_enter_fifth_floor",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/门.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]我一口气爬到五楼，找到了王沁林的个人工作室。\\n\\n在我的记忆中，他是省内出名的艺术家，出版了好几本美术教材，现在还带着几个研究生。\\n\\n也是少数真正改变过我的老师。\\n\\n他一群老师中仿佛鹤立鸡群，这其中并没有贬低其他老师的意思，他们都非常尽职尽责，值得人尊敬。但是，王老师和我们似乎不是一个世界的人。\\n\\n他总能看到我们看不到的本质。\n\n[主角]（出于感性，我信任他。但我知道，这里是副本，他不是我的老师，只是一个拥有老师记忆和外表的NPC。）\n\n[旁白]所以，当我经过理性思考也认可了找他求助的决定时，我松了口气。\\n\\n于是，我敲响了门。\n\n[主角说]请问王老师在吗？\n\n[旁白]门内传来脚步声。王老师打开门，脸上仍是那副慈祥温和的笑容。\n\n[NPC:王沁林]平生，你果然来了。我这里还有一位同学的问题需要解决，你先在那边随便看看画吧。",
    nextSceneId: "ch5_wang_gallery_enter",
  },

  ch5_wang_gallery_enter: {
    id: "ch5_wang_gallery_enter",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "[旁白]他背着手把我领进工作室。\\n\\n办公桌旁坐着一个瘦弱的女生。她攥着一团纸巾，眼睛哭得红肿，却不敢发出一点哭声。\n\n[旁白]王老师轻轻摸了摸她的头，继续温和地低声和她交谈。\n\n[主角]（这种事本就多见，没什么大惊小怪的。估计这女孩不是很信任班主任，所以来找王老师做心灵SPA了。）\n\n[旁白]我们学校的心理咨询师一直形同虚设，毕竟大家都不想承认自己心理除了问题。\\n\\n搞个心理咨询还要登记信息，心理咨询师往老师那边一报，学生可一点隐私都没有了，被周围所有人贴上各种标签，老师打着关爱学生的旗号各种作业减免，甚者给学生多放几天假。\\n\\n虽然老师们是出于好意，但这反而会给学生带来更大压力。\n\n[主角]（像王老师这种解决方式就很好。）\n\n[旁白]我没有打扰，打算先四处转转，调查一下是否有可用的线索。",
    nextSceneId: "ch5_gallery_explore",
  },

  ch5_gallery_explore: {
    id: "ch5_gallery_explore",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "",
    onCgEnd: "ch5_free_gallery",
  },

  ch5_return_to_office: {
    id: "ch5_return_to_office",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "[旁白]我回到二人身边时，王老师正安静地陪着那个女生。\\n\\n不知他说了什么戳中了那女孩的心，她的目光比之前坚定了不少。\\n\\n王老师似乎送了她几幅画，它们排列在角落，还挺占地方。\\n\\n对于这张脸我很陌生，她并不是我们班的人。\n\n[主角]（那刚好，让我试试能不能拿到许可吧。）",
    nextSceneId: "ch5_offer_help_choice",
  },

  ch5_offer_help_choice: {
    id: "ch5_offer_help_choice",
    chapter: "第5章 · 合作与交易",
    background: "",
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch5_zhoujunxiu_respectful_help", text: "那个，不好意思，同学。这些画你是要带回去的吧？画框很大，你应该不方便带回教室，要不你走的时候我帮你拿下去？", nextSceneId: "ch5_zhoujunxiu_help_response", effects: {"trust": 1, "empathy": 1}, tags: ["礼貌求助", "尊重边界", "主动铺垫"] },
      { id: "ch5_zhoujunxiu_practical_help", text: "同学，我和王老师有些事要谈，如果你不介意等我一会的话，我可以顺路帮你把画搬回教室", nextSceneId: "ch5_zhoujunxiu_help_response", effects: {"realityJudgment": 1}, tags: ["自然协作", "低压帮助", "保持距离"] },
      { id: "ch5_zhoujunxiu_forceful_help", text: "你都哭成这样了一定很累了，这些画我一会帮你拿下去吧", nextSceneId: "ch5_zhoujunxiu_help_response", effects: {"realityJudgment": 1}, tags: ["强势帮助", "好意冒犯", "忽视边界"] },
      { id: "ch5_zhoujunxiu_delayed_help", text: "先按兵不动，直接与王老师谈交易", nextSceneId: "ch5_wang_trade_opening", effects: {"empathy": 1}, tags: ["目标优先", "情感回避", "低共情"] },
    ],
  },

  ch5_zhoujunxiu_help_response: {
    id: "ch5_zhoujunxiu_help_response",
    chapter: "第5章 · 合作与交易",
    background: "",
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据主角提出帮助的方式，生成一段4～7行剧本编码格式片段，让周隽秀对主角产生不同程度的初始印象。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:周隽秀]、[NPC:王沁林]。\n\n[旁白]- 不要生成新选项，不要生成跳转。\n\n[旁白]固定事实：\n\n[旁白]- 周隽秀最初会礼貌拒绝帮助。\n\n[旁白]- 主角最终会在离开工作室时帮助她搬画。\n\n[旁白]- 周隽秀不能直接说明3班规则，也不能承认自己是否在等待主角。\n\n[旁白]- [NPC:周隽秀]不用，谢谢你，我自己可以……\n\n[旁白]- 若主角继续帮忙，必须让主角表达“别逞强”或同等含义，但语气根据选项变化。\n\n[旁白]动态表现：\n\n[旁白]- 尊重边界：她较快接受帮助，对主角产生初步信任。\n\n[旁白]- 自然协作：她仍有戒心，但认为主角没有刻意怜悯自己。\n\n[旁白]- 强势帮助：她感到不适和被轻视，后续帮助意愿降低。\n\n[旁白]- 按兵不动：她注意到主角没有第一时间接近自己，后续接受帮助更多是出于现实需要而非信任。\n\n[旁白]- 若主角此前展现高共情或真诚：她可能主动说一句“谢谢”。",
    nextSceneId: "ch5_wang_trade_opening",
  },

  ch5_wang_trade_opening: {
    id: "ch5_wang_trade_opening",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/对话.png",
    cgMode: true,
    speaker: "旁白",
    text: "[NPC:王沁林]来吧，平生。我们到这边说。\n\n[旁白]他带我在另一张办公桌前坐下，平静地等我开口。\n\n[主角说]王老师，您怎么知道我的名字？\n\n[NPC:王沁林]这个问题，我应该不用回答了吧？你自己很清楚答案。\n\n[主角]（这证实了NPC们知道参赛者的存在。在单人副本中，这或许是一把双刃剑。）\n\n[主角说]好。第二个问题——",
    nextSceneId: "ch5_wang_pressure",
  },

  ch5_wang_pressure: {
    id: "ch5_wang_pressure",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/鬼化.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]强烈的窒息感骤然袭来。我忍不住咳嗽，王老师却仍笑眯眯地坐在那里。\n\n[NPC:系统]技能“违规提醒”强烈发动中。\n\n[NPC:王沁林]你似乎搞错了自己现在的处境，平生。\n\n[NPC:王沁林]凡事都讲究一个等价交换，更何况，我是你的老师。\n\n[旁白]一股骇人的压力压在我的头顶，让我抬不起头来。\\n\\n记忆中慈祥的老人在我身上投下一片巨大的阴影，被微光拉扯着，宛如一只将要把我吞噬的怪兽。\\n\\n不，准确地说，是从人影变成了兽影。\\n\\n我不知道那女生为何一言不发。\\n\\n但我无法抬头去确认王老师和她的状态。",
    nextSceneId: "ch5_wang_pressure_choice",
  },

  ch5_wang_pressure_choice: {
    id: "ch5_wang_pressure_choice",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/鬼化.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch5_wang_apologized", text: "对不起，王老师……是我冒犯您了。", nextSceneId: "ch5_wang_trade_terms", effects: {"realityJudgment": 1, "empathy": 1}, tags: ["现实判断", "及时退让", "尊重边界"] },
      { id: "ch5_wang_asked_price", text: "咳……您想要我做什么？", nextSceneId: "ch5_wang_trade_terms", effects: {"realityJudgment": 1}, tags: ["承压谈判", "交易意识", "承受风险"] },
      { id: "ch5_wang_challenged_teacher", text: "我没有质问您的意思……只是以一个学生的身份向老师请教", nextSceneId: "ch5_wang_boundary_warning", effects: {"realityJudgment": 1}, tags: ["身份试探", "包装索取", "高风险"] },
    ],
  },

  ch5_wang_boundary_warning: {
    id: "ch5_wang_boundary_warning",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/鬼化.png",
    cgMode: true,
    speaker: "旁白",
    text: "[主角说]我没有质问您的意思……只是以一个学生的身份向老师请教。\n\n[旁白]兽影停顿了一瞬，随后变得更加庞大。窒息感没有消失，反而像有一双手伸进胸腔，缓慢挤压我的心脏。\n\n[NPC:王沁林]老师负责教导学生，却没有义务替学生完成人生的课题。\n\n[NPC:王沁林]把索取包装成求知，并不会让它变得高尚。\n\n[主角]（不行。“违规提醒”并不是一块免死金牌。）\n\n[主角说]对不起，王老师。是我冒犯您了。\n\n[旁白]兽影瞬间恢复成人影，周围重新明亮起来。",
    nextSceneId: "ch5_wang_trade_terms",
  },

  ch5_wang_trade_terms: {
    id: "ch5_wang_trade_terms",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/鬼化.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据第四章主角选择的画作、追问方式和本章面对压力的态度，生成一段5～9行剧本编码格式片段，表现王沁林如何把“求助”转化为“交易”。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:王沁林]。\n\n[旁白]- 不要生成新选项，不要生成跳转。\n\n[旁白]固定事实：\n\n[旁白]- 王沁林必须要求等价交换。\n\n[旁白]- 王沁林必须给出三个固定谜题：“镜中尸骸，湖中遗物，书中落叶。”\n\n[旁白]- 每件谜题对应一件可用于交换答案的物品。\n\n[旁白]- 王沁林不能解释谜底，不能立即回答主角的核心问题。\n\n[旁白]- 若主角此前没有说过道歉，必须包含：[主角说]对不起，王老师……是我冒犯您了。\n\n[旁白]- 若主角没有询问王老师想要什么，必须包含：[主角说]可以告诉我您想要的筹码是什么吗？\n\n[旁白]- [NPC:王沁林]镜中尸骸，湖中遗物，书中落叶。\n\n[旁白]动态表现：\n\n[旁白]- 若主角及时道歉：王沁林认可其至少知道何时停手，但不会因此降低交易代价。\n\n[旁白]- 若主角承压询价：王沁林认可其开始理解“求助不是索取”，可让压力逐渐退去后再给出谜题。\n\n[旁白]- 若主角策略性强：王沁林指出主角仍想把每段关系变成可控制的规则。\n\n[旁白]- 若主角包装成学生请教：王沁林温和警告，不是所有边界都允许用身份包装后反复试错。\n\n[旁白]- 若第四章画真实回忆：可提及“你至少开始愿意拿真实的东西交换”。\n\n[旁白]- 若第四章画傀儡或标准作品：可指出主角依然习惯先展示别人想看的筹码。",
    nextSceneId: "ch5_trade_riddles_confirmed",
  },

  ch5_trade_riddles_confirmed: {
    id: "ch5_trade_riddles_confirmed",
    chapter: "第5章 · 合作与交易",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[主角]（话中的三个谜题需要我自己解答。估计这三件物品可以换取三个问题的答案。）\n\n[主角说]我明白了。那么我先告辞。\n\n[旁白]我起身走到周隽秀身边，帮她拿起占地方的画框。\n\n[旁白]王老师静静看着我们，笑而不语。",
    nextSceneId: "ch5_walk_with_zhoujunxiu",
  },

  ch5_walk_with_zhoujunxiu: {
    id: "ch5_walk_with_zhoujunxiu",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/楼梯.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]陪那女生回教室的时候，我问了她的名字和近况。\n\n[主角说]你叫什么名字？\n\n[NPC:周隽秀]周隽秀。我是3班的。\n\n[主角说]来找王老师，是因为最近过得不顺吧？\n\n[NPC:周隽秀]（苦笑）是的。最近一次月考，我的成绩掉得很厉害。高二时我一直是班级前五，可升到高三以后，就怎么也追不上了。\n\n[NPC:周隽秀]压力很大，我有些撑不住了……然后，我开始迷茫，开始怀疑自己。之前的成绩曾经是多么耀眼，可现在我却怎么也看不见了。\n\n[旁白]我静静地倾听她诉说。\n\n[NPC:周隽秀]我不知道该怎么办，我不知道该怎么做，该怎么活。\n\n[NPC:周隽秀]老师和我爸妈，叫我不要给自己背这么沉重的包袱，不要给自己太大压力。\n\n[NPC:周隽秀]这句话说得很轻巧，却没有一个人告诉我到底该怎么做。\n\n[主角说]所以你去找了王老师？\n\n[NPC:周隽秀]嗯。\n\n[旁白]在我的记忆中，王老师在学生中是很受欢迎没错，但还不至于推心置腹的地步。\n\n[主角]（月考成绩公布已经是一周前的事了，她要是真的难以接受这个结果，那应该在上周就把这个问题给解决了，为什么要一拖再拖拖到今天？）\\n\\n（就好像算准了我今天下午也会来找王老师，挑这个时间点和我碰头。）\\n\\n（但直接挑明是不是不太好？）",
    nextSceneId: "ch5_zhoujunxiu_conversation_choice",
  },

  ch5_zhoujunxiu_conversation_choice: {
    id: "ch5_zhoujunxiu_conversation_choice",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/楼梯.png",
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch5_zhoujunxiu_comforted", text: "你不必太过担心你的成绩。不妨把自己当成曾经那个耀眼的自己，相信自己依然有能力爬到这个高度，然后，重新开始", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: {"joyPerception": 1}, tags: ["鼓励重建", "真诚安慰", "轻度投射"] },
      { id: "ch5_zhoujunxiu_questioned", text: "你和王老师很熟？", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: {"selfProtection": 1}, tags: ["谨慎试探", "关系调查", "高警惕"] },
      { id: "ch5_zhoujunxiu_shared_experience", text: "我上次考试也是和你一样的情况，把心态调整好确实很难，但你也许可以试试别把高考当成人生唯一的希望，而是把它看作一场很有挑战性的游戏", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: {"realityJudgment": 1}, tags: ["自我暴露", "经验分享", "价值重构"] },
      { id: "ch5_zhoujunxiu_observed", text: "……", nextSceneId: "ch5_zhoujunxiu_dynamic_reply", effects: {"realityJudgment": 1}, tags: ["沉默观察", "信息控制", "情感保留"] },
    ],
  },

  ch5_zhoujunxiu_dynamic_reply: {
    id: "ch5_zhoujunxiu_dynamic_reply",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/美术教室/楼梯.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]【AI片段提示】根据主角帮助方式、谈话方式及此前人格画像，生成一段4～8行剧本编码格式片段，表现周隽秀是否把主角视为可信的人。\n\n[旁白]输出格式：\n\n[旁白]- 允许使用 [旁白]、[主角]、[主角说]、[NPC:周隽秀]。\n\n[旁白]- 不要生成新选项，不要生成跳转。\n\n[旁白]固定事实：\n\n[旁白]- 周隽秀认为王沁林值得信任，但不会解释原因。\n\n[旁白]- 周隽秀会允许主角把画搬进3班，因此主角获得一次进入许可。\n\n[旁白]- 周隽秀不能直接透露3班规则。\n\n[旁白]- 若玩家询问她与王老师是否熟悉，必须包含：[NPC:周隽秀]也不是很熟……只是，像他这么有人格魅力的人，很难不让人信任吧？\n\n[旁白]- 若玩家询问成绩压力，必须保留她的核心意思：老师和父母都叫她不要给自己太大压力，但没人告诉她到底该怎么做。\n\n[旁白]- 若玩家选择沉默，必须让主角保留“暗中调查周隽秀动机”的内心判断，但不能让周隽秀察觉。\n\n[旁白]- 若玩家选择鼓励重建或经验分享，必须让周隽秀最终仍允许主角进入3班，不能因为安慰效果好坏改变许可结果。\n\n[旁白]动态结果：\n\n[旁白]- 鼓励重建：她会感到被认真安慰，但若玩家此前共情较低，可能觉得主角把问题说得太轻。\n\n[旁白]- 经验分享：她更容易把主角视为同类，但如果主角此前强势帮助，会怀疑这只是新的说教。\n\n[旁白]- 高试探/低信任：她礼貌回答，不主动透露额外信息。\n\n[旁白]- 沉默观察：她会主动结束话题，信任变化较小，但不会降低许可结果。\n\n[旁白]- 强势帮助或低共情：她只把主角视为临时搬运者，进入教室后立即与主角拉开距离。\n\n[旁白]- 若主角询问相遇是否安排：她可以表现困惑或尴尬，但不能确认真相。",
    nextSceneId: "ch5_enter_class3",
  },

  ch5_enter_class3: {
    id: "ch5_enter_class3",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    playerState: "yps_frames_stand_left",
    speaker: "旁白",
    text: "[旁白]我把画框搬到周隽秀座位旁。她向我道谢，并没有阻止我继续留在教室里。\n\n[主角]（我果然获得了进入3班的许可。）\n\n[旁白]我环顾四周。这里没有空置且被所有人自然避开的座位，也就是说这里不存在“消失”的同学。\n\n[主角]（好吧……当务之急是找到这间教室的规则。）",
    nextSceneId: "ch5_class3_explore",
  },

  ch5_class3_explore: {
    id: "ch5_class3_explore",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "",
    onCgEnd: "ch5_free_class3",
  },

  ch5_class3_disguise_choice: {
    id: "ch5_class3_disguise_choice",
    chapter: "第5章 · 合作与交易",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]等一下，被陌生同学认出来……话说，怎么从刚才开始，这间教室就这么安静？现在还没到晚自习时间。\n\n[主角]（不好。）",
    choices: [
      { id: "ch5_class3_disguise_helper", text: "伪装成替老师办事的学生：“啊哈哈，终于把王老师的画送来了，我差不多也要走了……”", nextSceneId: "ch5_class3_exposure", effects: {"realityJudgment": 1}, tags: ["快速撤离", "情境伪装", "低声望伪装"] },
      { id: "ch5_class3_seek_zhoujunxiu", text: "向周隽秀求助，利用她的熟人身份掩护自己", nextSceneId: "ch5_class3_exposure", effects: {"trust": 1}, tags: ["依赖关系", "临场合作", "暴露关系"] },
      { id: "ch5_class3_test_student", text: "主动和最近的同学搭话，先发制人确认对方是否认识自己", nextSceneId: "ch5_class3_exposure", effects: {"realityJudgment": 1}, tags: ["主动试探", "高风险", "触发规则边界"] },
    ],
  },

  ch5_class3_exposure: {
    id: "ch5_class3_exposure",
    chapter: "第5章 · 合作与交易",
    background: "",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]【条件：ch5_class3_disguise_helper】\n\n[旁白]我说完，准备低头朝门口走去。只要表现得足够自然——\n\n[旁白]【条件：ch5_class3_seek_zhoujunxiu】\n\n[旁白]只要她承认她认识我，或许就能证明我并非“陌生人”。我刚转身——\n\n[旁白]【条件：ch5_class3_test_student】\n\n[旁白]与其等待规则判定，不如先确认“陌生”的边界。我刚转身——",
    nextSceneId: "ch5_class3_face_closeup",
  },

  ch5_class3_face_closeup: {
    id: "ch5_class3_face_closeup",
    chapter: "第5章 · 合作与交易",
    background: "/assets/CG/3班/突脸.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]下一秒，一张被无限放大的脸毫无征兆地闯入视野。\\n\\n对方离我近得几乎鼻尖相碰，眼睛却像两口没有光的深井。\n\n[NPC:陌生同学]你——是——谁？\n\n[NPC:系统]技能“违规提醒”强烈发动中。\n\n[主角]（糟了。）",
    nextSceneId: "ch6_class3_exposure",
  },

  ch5_gallery_soft: {
    id: "ch5_gallery_soft",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[旁白]这些画面精美、技巧成熟，情绪被妥善收束在构图和色彩里。它们大多出自王老师带的研究生。\n\n[主角]（但王老师真正想看到的，似乎不是这些。）",
  },

  ch5_gallery_raw: {
    id: "ch5_gallery_raw",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[旁白]这些画都有一个明显的共同点——似乎是某种情绪的宣泄，露骨、直白、一针见血。\\n\\n被极度束缚的灵魂呐喊着、怒吼着、痛斥着，试图挣脱外界给予的桎梏，但是，一次、两次、无数次……它失败、尝试、失败、再尝试，反反复复。\n\n[主角]（就像无限递归的函数陷入死循环，哪怕是一条无止境的死路，它也要坚持到灰飞烟灭的那一天。）\n\n[主角]（王老师一直在做这件事，他想当一个救世主，但是他有心无力。）\n\n[旁白]这和我记忆中一致。",
  },

  ch5_gallery_infer_need_paintings: {
    id: "ch5_gallery_infer_need_paintings",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[主角]（先去看看画吧。）",
  },

  ch5_gallery_inference: {
    id: "ch5_gallery_inference",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[主角]（但这也在像我传达一种信息：副本内容和人类所处的社会高度统一，结合比赛的目的是让人类进化，那么必定需要人类推动历史和社会的发展。）\n\n[主角]（以前这种话都是新闻和教科书里的漂亮话，一开始觉得高大上，时间久了就觉得离自己很远，慢慢也就不当回事了。）\\n\\n（太多像我这样的普通人，哪怕拼命努力也很难改变自己的命运，还谈什么改变社会改变全人类？）\n\n[旁白]当时看到这种话我只觉得很好笑。\\n\\n可现在，比赛逼着每一个参赛者重新捡起这份责任。\n\n[主角]（我不觉得自己能做到什么。但我还是要做。）",
  },

  ch5_gallery_leave_blocked: {
    id: "ch5_gallery_leave_blocked",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[主角]（现在不是离开的时候。）",
  },

  ch5_gallery_materials_wait: {
    id: "ch5_gallery_materials_wait",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[主角]（这个还是放到最后调查吧。）",
  },

  ch5_gallery_materials_warning: {
    id: "ch5_gallery_materials_warning",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/wang_gallery/美术教室.png",
    speaker: "旁白",
    text: "[旁白]一处绘画材料堆得像小山，与周围整齐的区域格格不入。我无法从缝隙看清里面藏着什么。\n\n[旁白]我伸手准备移开最上方的画笔——\n\n[NPC:系统]技能“违规提醒”正在发动。\n\n[旁白]窒息感毫无征兆地扼住喉咙。我立即抽回手，压力才逐渐退去。\n\n[主角]（看来这里的东西不能随便乱动。画廊里没有其他可以安全调查的区域了。）",
    nextSceneId: "ch5_return_to_office",
  },

  ch5_class3_students: {
    id: "ch5_class3_students",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "[旁白]学生们低着头各学各的，明明还没打铃，却已经像在晚自习了。\\n\\n偶尔有人抬起头，怪异的视线轻飘飘地与我相对，然后又触电般闪开。\n\n[主角]（他们观察我，是在等着我触犯规则看好戏？）",
  },

  ch5_class3_slogan: {
    id: "ch5_class3_slogan",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "[主角]（让人很不舒服的标语。学生真学死了学校又不得了。）",
  },

  ch5_class3_leave_blocked: {
    id: "ch5_class3_leave_blocked",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "[主角]（还没调查完呢。）",
  },

  ch5_class3_rules_wait: {
    id: "ch5_class3_rules_wait",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "[主角]（先观察一下这里的学生比较稳妥。）",
  },

  ch5_class3_rules: {
    id: "ch5_class3_rules",
    chapter: "第5章 · 合作与交易",
    background: "/assets/maps/classroom_3/教室.png",
    speaker: "旁白",
    text: "[旁白]大部分和尖子班的规则一致，但这张规则上还加上了对外来者的制约：\\n\\n得到进入许可的外来者可进入，许可只能使用一次。\\n\\n不要让班级内的陌生同学认出你是外来者。\n\n[主角]（许可只能使用一次。也就是说，我离开后无法通过周隽秀这个人脉再次进入。）\n\n[主角]（更麻烦的是第二条。“陌生同学”是指我不认识的同学，还是不认识我的同学？）",
    nextSceneId: "ch5_class3_disguise_choice",
  },
  ch6_class3_exposure: {
    id: "ch6_class3_exposure",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/CG/3班/突脸.png",
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]那双瞪得浑圆的眼睛死死盯着我，眼球仿佛随时会从眼眶中掉落。\n\n[NPC:陌生同学]你——是——谁——？\n\n[旁白]喑哑的嗓音贴着耳膜响起，完全不像人类，更像是恶魔的低语。\n\n[旁白]我全身一颤，连忙后退，直到后背贴上冰冷的墙壁，才发现——\\n\\n全班学生已经纷纷转头看向我，像在看一只濒死的虫子。\n\n[NPC:系统]技能“违规提醒”强烈发动中！\n\n[NPC:系统]技能“违规提醒”强烈发动中！\n\n[旁白]系统提示在脑中反复炸响，不断提醒我现状是何等危险。\\n\\n将近五十名学生同时起身，朝我簇拥而来。\n\n[旁白]我得想办法逃出去。",
    nextSceneId: "ch6_class3_first_reaction",
  },

  ch6_class3_first_reaction: {
    id: "ch6_class3_first_reaction",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/classroom_3/教室.png",
    playerState: "yps_frames_stand_left",
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
    playerState: "yps_frames_stand_left",
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
    playerState: "yps_frames_stand_front",
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
    playerState: "yps_frames_stand_front",
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
    playerState: "yps_frames_stand_left",
    speaker: "班主任",
    text: "不听话的孩子，就应该受到应有的惩罚。\n\n她的声音逐渐失去人类质感。周围环境迅速变得昏暗，连办公室的布局都变得难以辨认。",
    nextSceneId: "ch6_office_escape_choice",
  },

  ch6_office_escape_choice: {
    id: "ch6_office_escape_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/teacher_office/教师办公室.png",
    playerState: "yps_frames_stand_left",
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
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "晚自习结束后，刘宇很自然地拉过我和周骐瑞，我们跟三兄弟一样勾肩搭背地走着，虽然是刘宇单方面所为。\n\n他走得有些快，我扯到了刚刚结痂的伤口，疼得倒吸一口凉气。\n\n刘宇和周骐瑞看向我，却没有发现任何异常。\n\n“我的右腿受伤了……你们看不到吗？伤得很重。”\n\n周骐瑞小心撩起我的裤腿，随后摇头：“没有任何伤口。”\n\n刘宇的声音严肃得不太正常：“你怎么受伤的？”",
    nextSceneId: "ch6_injury_explanation_choice",
  },

  ch6_injury_explanation_choice: {
    id: "ch6_injury_explanation_choice",
    chapter: "第6章 · 追杀与逃生",
    background: "/assets/maps/gate/校门夜晚.png",
    playerState: "yps_frames_stand_back",
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
    playerState: "yps_frames_stand_back",
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
    playerState: "yps_frames_stand_front",
    speaker: "旁白",
    text: "砰砰砰——\n\n毛玻璃门上映出一个人影。从身高与头发判断，应该是母亲。\n\n违规提醒没有发动，现在应该还没到凌晨一点。母亲敲门，很可能与镜子里的东西有关。\n\n门外的人没有叫我的名字，只是一遍遍地敲门。这很反常。",
    nextSceneId: "ch8_door_response_choice",
  },

  ch8_door_response_choice: {
    id: "ch8_door_response_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/bathroom/卫生间.png",
    playerState: "yps_frames_stand_front",
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
    playerState: "yps_frames_stand_front",
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
    playerState: "yps_frames_stand_back",
    speaker: "旁白",
    text: "深夜，天色如墨，为稀疏的云层绘上一层淡淡的白。\n\n这栋楼有四十层，从这里望去几乎能看到这座城市的全貌。哪怕是深夜，城市似乎仍没有睡着。\n\n我沉默着俯瞰了城市很久。\n\n“你没来过这里。”\n\n“我是没来过。来这地方一来不能学习，二来上上下下很浪费时间，我有什么必要来这里？”",
    nextSceneId: "ch8_rooftop_observation_choice",
  },

  ch8_rooftop_observation_choice: {
    id: "ch8_rooftop_observation_choice",
    chapter: "第8章 · 天台和解",
    background: "/assets/maps/rooftop/天台.png",
    playerState: "yps_frames_stand_back",
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
