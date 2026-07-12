import type { Scene } from "../types/game";

const CHAPTER = "第2章 · 副本开启";
const deskCg = "/assets/CG/家/书桌.png";
const bedroomWithLuggage = "/assets/maps/bedroom/主角房间(带行李).png";
const bedroom = "/assets/maps/bedroom/主角房间.png";
const livingroom = "/assets/maps/livingroom/客厅.png";
const bathroom = "/assets/maps/bathroom/卫生间.png";
const kitchen = "/assets/maps/kitchen/厨房.png";
const classroom = "/assets/maps/classroom/教室.png";

export const ch2Scenes: Record<string, Scene> = {
  ch2_game_start: {
    id: "ch2_game_start",
    chapter: CHAPTER,
    background: "/assets/maps/waiting/进入界面.png",
    speaker: "旁白",
    text: "[旁白]四周数字如星辰般闪烁，星云在黑暗中缓慢摇曳。\n\n我漂浮在这片小型宇宙中，却感受不到失重，甚至能够正常呼吸。\n\n[NPC:系统]欢迎参赛者来到\"人类进化计划\"候场区。\n\n[NPC:系统]初赛开始之前，参赛者需进行技能抽取。现在进行技能抽取……\n\n[旁白]一道金光从脚下升起，像蛇一样攀援而上，直至将我完全包裹。\n\n奇异力量在体内迸发，仿佛某种沉睡已久的本能被唤醒。\n\n[NPC:系统]根据您的特质，系统为您生成了最适合您的技能——权威抵制。",
    nextSceneId: "ch2_skill_info_panel",
  },

  ch2_skill_info_panel: {
    id: "ch2_skill_info_panel",
    chapter: CHAPTER,
    background: "/assets/maps/waiting/进入界面.png",
    speaker: "系统",
    text: "[NPC:系统]技能名称：权威抵制。\n\n[NPC:系统]使用方法与附加技能，需要您自行探索。\n\n[NPC:系统]恭喜您获得隐藏身份——规则破坏者。",
    infoPanel: {
      title: "技能抽取完成",
      subtitle: "人类进化计划 · 初赛权限",
      lines: [
        "技能名称：权威抵制",
        "使用方法：需要参赛者自行探索",
        "附加技能：需要参赛者自行探索",
        "隐藏身份：规则破坏者",
      ],
    },
    nextSceneId: "ch2_after_skill_info",
  },

  ch2_after_skill_info: {
    id: "ch2_after_skill_info",
    chapter: CHAPTER,
    background: "/assets/maps/waiting/进入界面.png",
    speaker: "旁白",
    text: "[主角]（技能名这么抽象，用法探索难度显然很大。）\n\n[NPC:系统]副本一正在进行初始化……\n\n[主角说]诶等一下，我要怎么激活这个技能？\n\n[NPC:系统]20%，21%……\n\n[主角说]hello，小系统？\n\n[NPC:系统]30%……\n\n[旁白]系统自顾自地加载进程，完全没有理会我。\n\n[主角]（看来是不能从系统这里套取情报了。）\n\n[NPC:系统]初始化完成。请参赛者阅读副本一相关信息。",
    nextSceneId: "ch2_dungeon_info_panel",
  },

  ch2_dungeon_info_panel: {
    id: "ch2_dungeon_info_panel",
    chapter: CHAPTER,
    background: "/assets/maps/waiting/进入界面.png",
    speaker: "系统",
    text: "[NPC:系统]副本一：快乐小孩。\n\n[NPC:系统]性质：单人角色扮演类副本。\n\n[NPC:系统]内容简介：你是个讨人喜欢的快乐小孩。孩子们喜欢你，大人们也喜欢你。不断超越自己、追求卓越，是你一生的追求。\n\n[NPC:系统]通关要求：在副本内存活一周，或达成任一成就。\n\n[NPC:系统]成就达成条件：洞察真相，证明你的快乐。\n\n[NPC:系统]通关奖励：根据场地内稳定的紊乱磁场强度与范围综合判断。\n\n[NPC:系统]注意：逾期未通关或违反规则，均会遭到杀身之祸。",
    infoPanel: {
      title: "副本一：快乐小孩",
      subtitle: "单人角色扮演类副本",
      lines: [
        "内容简介：你是个讨人喜欢的快乐小孩。孩子们喜欢你，大人们也喜欢你。不断超越自己、追求卓越，是你一生的追求。",
        "通关要求：在副本内存活一周，或达成任一成就。",
        "成就达成条件：洞察真相，证明你的快乐。",
        "通关奖励：根据场地内稳定的紊乱磁场强度与范围综合判断。",
        "注意：逾期未通关或违反规则，均会遭到杀身之祸。",
      ],
    },
    nextSceneId: "ch2_after_dungeon_info",
  },

  ch2_after_dungeon_info: {
    id: "ch2_after_dungeon_info",
    chapter: CHAPTER,
    background: "/assets/maps/waiting/进入界面.png",
    speaker: "旁白",
    text: "[主角]（小孩、讨喜、快乐、追求、真相。这是这个副本给出的关键词。）\n\n[主角]（倒是这个魔幻的词怎么又出现了？）\n\n[主角]（稳定的紊乱磁场。我和林芷萱都推测这个词是人类展现出来的某种未知特性，但在副本一的介绍中又用来修饰地区。词本身和它的使用场景都一样矛盾重重。）\n\n[主角]（我需要尽快搞清楚这是个什么东西，否则到初赛后期会错失很多奖励，甚至违反规则的几率都会增加不少。）\n\n[NPC:系统]副本一已启动。",
    nextSceneId: "ch2_enter_bedroom",
  },

  ch2_enter_bedroom: {
    id: "ch2_enter_bedroom",
    chapter: CHAPTER,
    background: bedroomWithLuggage,
    speaker: "旁白",
    playerState: "yps_frames_stand_front",
    text: "[旁白]眼前场景像碎裂玻璃一样坠落，取而代之的是一间风格严谨、呆板的卧室。\n\n[旁白]离我不远处的书架上放满了教辅，书桌上甚至还有久违的高中数学试卷……\n\n[主角]（这里应该是\"我\"的房间。而我在副本中的身份，是一名高中生。）\n\n[旁白]我带来的行囊随意摆放在地上，在摆放整齐的房间内显得格格不入。我下意识摸了摸外套口袋——还好，水果刀还在。\n\n[主角]（对了，现在是什么时代？别告诉我时代变了。）\n\n[旁白]接着我掏出随身携带的手机查看日期。\n\n2023年11月18日，星期天，07:02。\n\n[主角]（还好不是什么架空背景。）",
    nextSceneId: "ch2_bedroom_priority_choice",
  },

  ch2_bedroom_priority_choice: {
    id: "ch2_bedroom_priority_choice",
    chapter: CHAPTER,
    background: bedroomWithLuggage,
    speaker: "旁白",
    text: "接下来，我需要先做些准备。",
    choices: [
      { id: "ch2_hid_outsider_items", text: "我目标明确地整理行囊，把它藏进我的衣柜里", nextSceneId: "ch2_bedroom_priority_choice_response", effects: { selfProtection: 2, realityJudgment: 1 }, tags: ["自我保护", "谨慎", "风险意识"], needAIAnalysis: true },
      { id: "ch2_searched_rules_first", text: "要不还是先调查一下房间？", nextSceneId: "ch2_bedroom_priority_choice_response", effects: { truthDesire: 2, selfProtection: -1 }, tags: ["真相欲望", "目标优先", "冒险"], needAIAnalysis: true },
      { id: "ch2_scanned_room_first", text: "我环顾四周，之后仔细倾听门外的动静", nextSceneId: "ch2_bedroom_priority_choice_response", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["环境评估", "防御准备", "冷静"], needAIAnalysis: true },
    ],
  },

  ch2_bedroom_priority_choice_response: {
    id: "ch2_bedroom_priority_choice_response",
    chapter: CHAPTER,
    background: bedroomWithLuggage,
    speaker: "旁白",
    text: "[旁白]【条件：ch2_hid_outsider_items】\n[旁白]邮件里写“没有具体规则”，但谁知道什么时候会触发规则呢？像这种本不属于副本内还会暴露我身份的物证，最好还是别让任何人发现。\n\n说到规则……我必须先找找房间内有没有关于规则的信息。\n\n[旁白]【条件：ch2_scanned_room_first】\n[旁白]门外似乎没有任何声音，一切都安静得不太自然，让我隐隐感到不安。\n\n[主角]（算了，先调查房间吧。）",
    nextSceneId: "ch2_bedroom_initial_search",
  },

  ch2_bedroom_initial_search: {
    id: "ch2_bedroom_initial_search",
    chapter: CHAPTER,
    background: bedroomWithLuggage,
    speaker: "旁白",
    playerState: "yps_frames_stand_front",
    text: "",
    onCgEnd: "ch2_free_bedroom",
  },

  ch2_bedroom_luggage: { id: "ch2_bedroom_luggage", chapter: CHAPTER, background: bedroomWithLuggage, speaker: "旁白", text: "邮件里写“没有具体规则”，但谁知道什么时候会触发规则呢？像这种本不属于副本内还会暴露我身份的物证，最好还是别让任何人发现。" },
  ch2_plan_book_intro: { id: "ch2_plan_book_intro", chapter: CHAPTER, background: bedroom, speaker: "旁白", text: "[旁白]桌上有一本封面温馨的笔记本，与周围教辅相比鲜活得过分。", nextSceneId: "ch2_plan_book_read" },
  ch2_bedroom_bookshelf: { id: "ch2_bedroom_bookshelf", chapter: CHAPTER, background: bedroom, speaker: "旁白", text: "[旁白]书架上塞满了教辅资料，从《五年高考三年模拟》到各类竞赛题集，几乎找不到一本课外书。\n\n[主角]（妈呀这过的什么压抑生活啊。）" },
  ch2_bedroom_bed: { id: "ch2_bedroom_bed", chapter: CHAPTER, background: bedroom, speaker: "叶平生", text: "（睡啥睡啊你一天就知道睡睡睡。）" },
  ch2_bedroom_leave_blocked: { id: "ch2_bedroom_leave_blocked", chapter: CHAPTER, background: bedroom, speaker: "叶平生", text: "（我还没找到规则。）" },
  ch2_bedroom_trash: { id: "ch2_bedroom_trash", chapter: CHAPTER, background: bedroom, speaker: "叶平生", text: "（里面什么也没有。）" },
  ch2_bedroom_plant: { id: "ch2_bedroom_plant", chapter: CHAPTER, background: bedroom, speaker: "叶平生", text: "（这个房间里为数不多的生命力源泉。）" },
  ch2_bedroom_computer: { id: "ch2_bedroom_computer", chapter: CHAPTER, background: bedroom, speaker: "叶平生", text: "（年轻的“我”尚且还不会coding。）" },

  ch2_plan_book_read: {
    id: "ch2_plan_book_read",
    chapter: CHAPTER,
    background: deskCg,
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]计划本扉页写着\"我\"的人生蓝图。\n\n这东西应该就是规则了吧？我又环视一圈，确认周围没有更像日记本的书本之后，就快速浏览起来。\n\n[主角]（\"我\"对自己还真狠啊。写这么多规则干什么？巴不得去送人头吗？）\n\n[旁白]（考上C9。三十岁结婚生子，娶一个贤惠温柔的妻子。三十五岁实现财富自由，买车买房。）\n\n这似乎是“我”前半生的理想。\n\n[旁白]（作为好孩子，我要关爱亲人，我要成为爸妈的骄傲。我要得到老师同学的青睐，我要努力学习，我要帮老师排忧解难，我要乐于助人。我要变得更强一些、再强一些，成为别人的依靠，让我的周围充满幸福。）\n\n[旁白]我有些疑惑。\n\n[主角]（这部分内容或许可以理解为隐晦的规则，但是如此抽象又理想主义的规则，会使践行难度大大增加。）\n\n[主角]（算了，多想无益。走一步看一步吧。）\n\n[旁白]翻过一页，我总算找到了看起来正经的规则，这扭曲红字绝对不是“我”的字迹。\n\n[旁白]（我们是幸福快乐的一家。）\n\n[旁白]（我是美好社会中遵纪守法的好公民。）\n\n[旁白]（我的房间井井有条。我从来不迟到。我的作业不会迟交。我的成绩总是优异。）\n\n[旁白]（我总是帮父母做家务。我是个自律的人，严格遵守计划表。）\n\n[主角]（这规则看起来真令人不爽。）\n\n[旁白]我把笔记本翻到最新一页。\n\n[旁白]（2023年11月18日计划表。）\n\n[旁白]（07:00起床。19:00进校考试。01:00睡觉。）\n\n[旁白]（数学：计时考试一次，并订正答案。）\n\n[旁白]（物理：整理错题本，分模块加强刷题。）\n\n[旁白]（生物：复习选修二后两章内容。）\n\n[旁白]（考试结束回家后订正试卷。）\n\n[主角说]……？\n\n[主角]（不是，这哥们不用写作业？）\n\n[旁白]我又把计划表往前翻了翻，对自己肃然起敬。\n\n[主角]（居然用昨天一天就把所有周末作业做完了，不愧是我。我太感谢我了。）\n\n[旁白]而且桌上那张数学试卷已经写了一半。\n\n[旁白]我被吓了一跳。\n\n房门被敲响，接着门外传来了女人的声音，\n\n[NPC:母亲]平生！都七点十分了，还没起床？",
    nextSceneId: "ch2_mother_door_choice",
  },

  ch2_mother_door_choice: {
    id: "ch2_mother_door_choice",
    chapter: CHAPTER,
    background: deskCg,
    cgMode: true,
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch2_answered_mother_quickly", text: "刚起！妈，我马上出来！", nextSceneId: "ch2_mother_checks_room", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["临场应变", "维持伪装", "现实判断"], needAIAnalysis: true },
      { id: "ch2_tested_mother_entry", text: "……", nextSceneId: "ch2_mother_checks_room", effects: { truthDesire: 1, selfProtection: -1 }, tags: ["规则试探", "高风险", "真相欲望"], needAIAnalysis: true },
    ],
  },

  ch2_stumble_fail: {
    id: "ch2_stumble_fail",
    chapter: CHAPTER,
    background: deskCg,
    cgMode: true,
    speaker: "旁白",
    text: "[NPC:系统]技能\"违规提醒\"正在发动。\n\n[旁白]窒息感猝然攥住喉咙。\n\n我还没来得及反应，母亲已经推门进来，目光第一时间落在地上那只不属于这个房间的行囊上。\n\n[NPC:母亲]这是什么？平生，你房间里怎么能乱成这样？\n\n[主角]（糟了。规则里写过——我的房间井井有条。）\n\n[旁白]母亲的声音没有彻底拔高，却比责骂更让人紧绷。她看向我的眼神里带着失望、焦躁，还有一种“你怎么能让我操心”的怒意。\n\n[NPC:母亲]今天晚上就要考试了，你连自己的房间都收拾不好？计划表呢？你早上起来到底在干什么？\n\n[主角说]我马上收拾。\n\n[旁白]我强忍着窒息感，把行囊塞进衣柜深处，又把露在外面的痕迹迅速清理干净。\n\n直到卧室重新恢复那种过分整齐的模样，喉咙里的压迫才缓慢松开。\n\n[旁白]母亲盯着房间看了一圈，确认没有新的异常后，视线落到桌上的计划本。\n\n[NPC:母亲]不错，今天这么早就起来写计划表了。\n\n[旁白]她点评了一句，然后离开我的房间。\n\n[NPC:母亲]快过来吃早餐。",
    nextSceneId: "ch2_stumble_success",
  },

  ch2_mother_checks_room: { id: "ch2_mother_checks_room", chapter: CHAPTER, background: deskCg, cgMode: true, speaker: "旁白", text: "### [AI片段]母亲检查房间\n场景ID：ch2_mother_checks_room\n图片：G:\\混沌\\happy-child-game-scaffold\\happy-child-game\\client\\public\\assets\\CG\\家\\书桌.png\n背景：早晨七点十分，母亲准备叫主角吃早餐，并检查他的卧室；主角已经把参赛者行囊藏好，计划本摊在桌上\n参与角色：主角, 母亲\nAI监视标识：monitor_ai: protagonist_profile, protagonist_worldview, mother_impression\nAI生成要求：\n- 模式：AI片段\n- 输出格式：严格使用剧本编码格式；只允许使用 [旁白]、[主角]、[主角说]、[NPC:母亲]；不要生成新选项或跳转\n- 称呼与视角：[旁白]、[主角]、[主角说]均与主角同一视角，使用第一人称“我”；NPC按角色关系称呼主角和其他角色，不得混用上帝视角或角色码\n- 行数：4～7行\n- 当前场景：早晨七点十分，母亲准备叫主角吃早餐，并检查他的卧室；主角已经把参赛者行囊藏好，计划本摊在桌上\n- 上下文：主角刚进入《快乐小孩》副本，已发现家庭规则与计划本，必须扮演好副本中高中生身份，但同时也要推进自己的调查计划；母亲表面关心，实际把检查孩子房间视为理所当然\n- 主角认知档案：读取当前主角对家庭规则、母亲控制、计划本和副本身份伪装的阶段性理解；只影响紧张感和旁白侧重点，不改变固定剧情\n- NPC动态印象：读取母亲对主角的当前印象，包括是否乖巧、是否异常、是否值得继续监督；母亲仍不能发现参赛者行囊或副本真相\n- 角色状态：\n  - 主角：紧张，观察母亲是否发现异常；旁白和内心都用“我”称呼自己\n  - 母亲：控制型关爱，称呼主角为“平生”，语气日常但带监督意味\n- 本段目标：母亲强硬进入房间并检查角落；她不能发现参赛者行囊，反而把主角翻阅计划本误认为早起写计划；最后要求主角去吃早餐并离开房间\n- 必须出现：\n  - [NPC:母亲]不错，今天这么早就起来写计划表了。\n  - [NPC:母亲]快过来吃早餐。\n- 动态分支：\n  - 若 ch2_answered_mother_quickly：旁白写母亲强硬进入房间并检查书桌的动作，母亲看到计划表后较满意，语气像夸奖，但仍带监督意味\n  - 若 ch2_tested_mother_entry：母亲先因主角沉默不悦，提醒不能赖床，主角乖乖回应，旁白写母亲强硬进入房间并检查书桌的动作，随后母亲因看到计划本而态度缓和\n- 必须避免：不得说出副本、比赛、系统、参赛者或家庭真相；不得让母亲觉醒或表现出异常认知\n- 完整性要求：必须根据收束方式生成完整可播放的小场景，至少包含关键台词后的反应、关系或信息状态变化，以及进入下一场景的自然承接；不得停在追问、沉默、动作开始、NPC刚回应或情绪刚变化的位置。\n- 收束方式：母亲离开房间，主角暂时安全，片段结束后由固定流程跳转\n- 风格：压迫感来自日常化的关心和控制；旁白描述性强，可多用长句，但不要夸张恐怖化\n→ NPC观念更新: 母亲\n→ 对话结束后：跳转 ch2_stumble_success", nextSceneId: "ch2_stumble_success" },
  ch2_stumble_success: { id: "ch2_stumble_success", chapter: CHAPTER, background: deskCg, cgMode: true, speaker: "叶平生", text: "（……可我啥也没写啊。）\n\n[主角]（嘿。还歪打正着了。）", nextSceneId: "ch2_breakfast" },

  ch2_breakfast: {
    id: "ch2_breakfast",
    chapter: CHAPTER,
    background: livingroom,
    speaker: "旁白",
    playerState: "yps_frames_sit_right",
    text: "[旁白]不久，我乖巧地坐在餐桌前，看着面前那碗热腾腾的粥陷入了沉思，而父母都在沉默中吃着早餐。\n\n[主角]（奇怪，既然家里会给我提供食物，那为什么比赛需要参赛者自备食物呢？副本里的食物有问题吗？）\n\n[NPC:母亲]怎么不吃啊平生？觉得妈妈做的饭不好吃吗？\n\n[旁白]我回过神，连忙找个借口糊弄过去，",
    nextSceneId: "ch2_breakfast_choice",
  },

  ch2_breakfast_choice: {
    id: "ch2_breakfast_choice",
    chapter: CHAPTER,
    background: livingroom,
    speaker: "旁白",
    text: "",
    choices: [
      { id: "ch2_ate_small_breakfast", text: "呃……不是，妈妈的手艺一向很好，只是我今天早上胃有点不舒服。", nextSceneId: "ch2_breakfast_violation", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["风险控制", "谨慎试验", "临场应变"], needAIAnalysis: true },
      { id: "ch2_ate_full_breakfast", text: "妈妈做的饭最好吃了，我现在就吃", nextSceneId: "ch2_breakfast_violation", effects: { trust: 1, selfProtection: -1 }, tags: ["维持关系", "服从", "承担未知风险"], needAIAnalysis: true },
      { id: "ch2_questioned_breakfast", text: "粥里的食材是在哪买的？", nextSceneId: "ch2_breakfast_violation", effects: { truthDesire: 1, selfProtection: 1 }, tags: ["直接试探", "真相欲望", "高风险"], needAIAnalysis: true },
      { id: "ch2_delayed_breakfast", text: "今天晚上有理综考试，我有点焦虑，没什么胃口", nextSceneId: "ch2_breakfast_violation", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["情境伪装", "自我保护", "机敏"], needAIAnalysis: true },
    ],
  },

  ch2_breakfast_violation: {
    id: "ch2_breakfast_violation",
    chapter: CHAPTER,
    background: livingroom,
    speaker: "旁白",
    text: "[旁白]【条件：ch2_ate_small_breakfast】\n[主角说]呃……不是，妈妈的手艺一向很好，只是我今天早上胃有点不舒服。\n\n[NPC:父亲]你昨天在学校吃什么了？\n\n[旁白]我接着瞎编，\n\n[主角说]晚上吃了黄焖鸡。\n\n[NPC:父亲]你们学校食品安全到底怎么做的？学生吃坏肚子，还怎么好好学习？\n\n[旁白]气氛骤然变得微妙。我尬笑了一声，紧接着觉得有些呼吸困难。\n\n[主角]（怎么回事？）\n\n[旁白]我屏住呼吸，尽量不让父母发现异常。\n\n[NPC:系统]技能\"违规提醒\"正在发动。\n\n[主角]（\"违规提醒\"……这是我的衍生技能？被动激活了？）\n\n[主角]（不管怎样——必须赶紧打个圆场。）\n\n[主角说]没事的爸爸，应该不是学校的问题。昨天我晚自习学得太专注，忘了穿外套，估计是着凉了。\n\n[NPC:父亲]唉，你这孩子。\n\n[主角说]我长记性了，今天一定会照顾好自己的。\n\n[旁白]父亲目光柔和下来，窒息感随之消失。\n\n[主角]（看来扉页上的内容也是规则。）\n\n[旁白]【条件：ch2_ate_full_breakfast】\n[旁白]我压下疑虑，开始吃粥。味道正常，但无法确定长期食用是否有问题。\n\n[NPC:母亲]这才对。早饭不吃好，怎么有精神学习？\n\n[旁白]但我总觉得吃了不太妙。吃了一半之后，我放下了碗，捂住肚子开始演戏。\n\n[主角说]妈，我感觉吃了肚子有点疼。\n\n[NPC:母亲]啊，怎么会呢？我平常都在同一家买肉菜，吃了这么久都没事，怎么今天突然就肚子疼了？\n\n[NPC:父亲]你别是为了把晚上的考试翘掉才在你妈面前装病。\n\n[旁白]气氛骤然变得微妙。我正打算解释，却觉得有些呼吸困难。\n\n[主角]（怎么回事？）\n\n[旁白]我屏住呼吸，尽量不让父母发现异常。\n\n[NPC:系统]技能\"违规提醒\"正在发动。\n\n[主角]（\"违规提醒\"……这是我的衍生技能？被动激活了？）\n\n[主角]（不管怎样——必须赶紧打个圆场。）\n\n[主角说]我会去考试的爸爸。应该是因为这些天太累了，我免疫力有些下降。\n\n[NPC:父亲]唉，你这孩子。\n\n[主角说]我长记性了，今天一定会照顾好自己的。\n\n[旁白]父亲目光柔和下来，窒息感随之消失。\n\n[主角]（好险。）\n\n[旁白]【条件：ch2_questioned_breakfast】\n[主角说]粥里的食材是在哪买的？\n\n[NPC:母亲]和平时一样。你怎么忽然问这个？\n\n[主角]（看来在他们的认知中，食物没有任何异常。）\n\n[主角说]没什么。只是昨天在学校吃完黄焖鸡以后，胃有点不舒服，我怕吃了伤胃的东西。\n\n[NPC:父亲]你们学校食品安全到底怎么做的？学生吃坏肚子，还怎么好好学习？\n\n[旁白]气氛骤然变得微妙。我尬笑了一声，紧接着觉得有些呼吸困难。\n\n[主角]（怎么回事？）\n\n[旁白]我屏住呼吸，尽量不让父母发现异常。\n\n[NPC:系统]技能\"违规提醒\"正在发动。\n\n[主角]（\"违规提醒\"……这是我的衍生技能？被动激活了？）\n\n[主角]（不管怎样——必须赶紧打个圆场。）\n\n[主角说]没事的爸爸，应该不是学校的问题。昨天我晚自习学得太专注，忘了穿外套，估计是着凉了。\n\n[NPC:父亲]唉，你这孩子。\n\n[主角说]我长记性了，今天一定会照顾好自己的。\n\n[旁白]父亲目光柔和下来，窒息感随之消失。\n\n[主角]（看来扉页上的内容也是规则。）\n\n[旁白]【条件：ch2_delayed_breakfast】\n[NPC:父亲]一个考试能把你焦虑成这样？你别是为了把晚上的考试翘掉才在你妈面前装病。\n\n[旁白]气氛骤然变得微妙。我正打算解释，却觉得有些呼吸困难。\n\n[主角]（怎么回事？）\n\n[旁白]我屏住呼吸，尽量不让父母发现异常。\n\n[NPC:系统]技能\"违规提醒\"正在发动。\n\n[主角]（\"违规提醒\"……这是我的衍生技能？被动激活了？）\n\n[主角]（不管怎样——必须赶紧打个圆场。）\n\n[主角说]我不是这个意思，我会去考试的。\n\n[NPC:父亲]唉，现在的孩子，怎么这么点苦都吃不得。\n\n[主角说]……\n\n[旁白]父亲目光柔和下来，窒息感随之消失。\n\n但那些话却让我听得十分心寒。\n\n[主角]（“我”每天就是在这种环境下苟且偷生的吗？）",
    nextSceneId: "ch2_breakfast_resolved",
  },

  ch2_breakfast_resolved: { id: "ch2_breakfast_resolved", chapter: CHAPTER, background: "", cgMode: true, speaker: "旁白", text: "最后粥我只吃了半碗，在父母出门上班之后，我把剩下半碗粥倒了，回房间吃了些饼干果腹。\n\n目前还不知道副本中的食物有什么问题，先吃一点观察一下吧。父母晚上才回来，我中午和晚上都不必再冒这个风险。", nextSceneId: "ch2_study_montage" },

  ch2_study_montage: {
    id: "ch2_study_montage",
    chapter: CHAPTER,
    background: deskCg,
    cgMode: true,
    speaker: "旁白",
    text: "[旁白]我按照计划表行动，在数学、物理、生物三科上各花三个小时学习。为了匀出探索“家”的时间，我这九个小时除了进食就没有停下来休息过，等结束学习后我感觉自己脑子要炸了。\n\n[主角]（真是折磨人啊，好不容易才脱离苦海成为一个大学生，怎么又让我经历一遍这样的痛苦，还是高三……虽然大学里也不轻松是了，呵呵。）\n\n[主角]（况且高中知识我都忘得差不多了，这些东西还需要重新捡起来复习，效率自然不高。现在我感觉自己都没有脑力调查。）\n\n[旁白]我还在心里吐槽着，忽然又呼吸一滞。\n\n[NPC:系统]技能\"违规提醒\"正在发动。\n\n[主角]（啧。）\n\n[主角]（我就在脑子里想一想都违规？人不可能一直都开开心心的吧，何况还是个高三学生！？还让不让人活了？去死吧破规则！）\n\n[旁白]窒息感骤然增强。\n\n[主角说]咳咳咳………\n\n[旁白]我本能抓住自己的脖子，大口呼吸着，却吸不进去一点空气。\n\n[主角]（不行。我必须让自己\"快乐\"起来。）",
    nextSceneId: "ch2_thought_violation_choice",
  },

  ch2_thought_violation_choice: {
    id: "ch2_thought_violation_choice",
    chapter: CHAPTER,
    background: deskCg,
    cgMode: true,
    speaker: "旁白",
    playerState: "yps_frames_stand_front",
    text: "",
    choices: [
      { id: "ch2_forced_positive_thoughts", text: "我爱学习，学习使我快乐，我是根正苗红的社会主义三好少年。今天学了这么多，感觉自己变得越来越优秀了。对，我变得越来越强了，应该感到高兴才对。", nextSceneId: "ch2_thought_warning_resolved", effects: { selfProtection: 1, joyPerception: -1 }, tags: ["自我规训", "服从求生", "情绪压抑"], needAIAnalysis: true },
      { id: "ch2_found_real_achievement", text: "我确实很累。但我已经完成了部分计划，也为之后调查争取了时间。我痛苦并快乐着。嗯。", nextSceneId: "ch2_thought_warning_resolved", effects: { joyPerception: 1, realityJudgment: 1 }, tags: ["现实接纳", "快乐感知", "自我鼓励"], needAIAnalysis: true },
      { id: "ch2_analyzed_happiness_rule", text: "规则判定的不是表情，而是思想方向。它要求我把痛苦解释成快乐。而这个机制本身就是线索，我只要摆脱负面情绪就好了。", nextSceneId: "ch2_thought_warning_resolved", effects: { truthDesire: 1, realityJudgment: 1 }, tags: ["规则分析", "情绪调节", "真相欲望"], needAIAnalysis: true },
    ],
  },

  ch2_thought_warning_resolved: { id: "ch2_thought_warning_resolved", chapter: CHAPTER, background: deskCg, cgMode: true, speaker: "旁白", text: "[旁白]窒息感逐渐减轻。我整个人瘫在书桌上大口吸气，喉咙里发出破风箱般的声音。\n\n[主角]（对啊，这个比赛本来就不想让人活。现在，先活下去再说。）\n\n[旁白]我及时停止了胡思乱想，赶紧开始调查，免得想多了又触犯规则。", nextSceneId: "ch2_home_exploration_start" },

  ch2_home_exploration_start: { id: "ch2_home_exploration_start", chapter: CHAPTER, background: livingroom, speaker: "叶平生", playerState: "yps_frames_stand_back", text: "[主角]（先调查活动频率最高的客厅，再检查卫生间与厨房。）\n\n[旁白]桌面除了花瓶什么都没有，地板干净得几乎不用穿拖鞋。\n\n[主角]（这个家对整洁有异常执着。以后行动必须注意不留下痕迹。）", onCgEnd: "ch2_free_livingroom" },
  ch2_family_photo: { id: "ch2_family_photo", chapter: CHAPTER, background: livingroom, speaker: "旁白", text: "[旁白]全家福里，我们一家三口对着镜头礼貌微笑，仪态端庄得有些诡异。\n\n[主角]（三个人都像在假笑。我的直觉不会错。）\n\n[主角]（他们现在真的幸福吗？）\n\n[主角]（不过，要是他们不幸福，我应该在进入副本的瞬间就违规了。）\n\n[主角]（所以——至少在规则层面，他们很幸福。）\n\n[旁白]我冷笑了一声。" },
  ch2_family_rules: { id: "ch2_family_rules", chapter: CHAPTER, background: livingroom, speaker: "旁白", text: "[旁白]我绕了一圈什么都没发现。正苦恼着，视线却鬼使神差地落在垃圾桶上。\n\n[主角]（不会吧……）\n\n[旁白]内心挣扎了一秒，我还是被大脑说服了。拨开面巾纸团和零食包装，桶底藏着一个揉皱的纸团。\n\n[主角]（是这个。）\n\n[旁白]展开纸团，猩红的字迹映入眼帘，我深吸一口气。\n\n[旁白]纸上写着猩红规则：\n\n[NPC:系统]我们是幸福的一家人。我们彼此关心，互相尊重，互相体谅。\n\n[NPC:系统]进入任何家庭成员的个人房间必须敲门；得到允许后可直接进入。\n\n[NPC:系统]父母每天工作很累，孩子要多孝敬他们。他们所做的一切都是为你好。\n\n[NPC:系统]如果母亲在厨房，不要给她添乱。如果父亲在厨房，进去帮帮他。\n\n[NPC:系统]使用卫生间请锁门。\n\n[NPC:系统]记住，好孩子是诚实、善良、正直、勇敢的。\n\n[主角]（还给“好孩子”贴起标签来了。）\n\n[旁白]我把纸团塞进裤兜。\n\n[主角]（接下来去卫生间调查吧。）" },
  ch2_livingroom_tv: { id: "ch2_livingroom_tv", chapter: CHAPTER, background: livingroom, speaker: "旁白", text: "电视落了些灰，感觉好久没用了。" },
  ch2_livingroom_plant: { id: "ch2_livingroom_plant", chapter: CHAPTER, background: livingroom, speaker: "旁白", text: "[旁白]盆景的花盆里，一朵枯萎的花正静静地等待着春天。\n\n[主角]（这花真可怜。）" },
  ch2_livingroom_exit_blocked: { id: "ch2_livingroom_exit_blocked", chapter: CHAPTER, background: livingroom, speaker: "叶平生", text: "（出门干嘛？）" },
  ch2_livingroom_room_done: { id: "ch2_livingroom_room_done", chapter: CHAPTER, background: livingroom, speaker: "叶平生", text: "（房间没什么可调查的了。）" },
  ch2_kitchen_before_bathroom_blocked: { id: "ch2_kitchen_before_bathroom_blocked", chapter: CHAPTER, background: livingroom, speaker: "叶平生", text: "（先去调查卫生间吧。）" },
  ch2_parents_bedroom_notice: { id: "ch2_parents_bedroom_notice", chapter: CHAPTER, background: livingroom, speaker: "旁白", text: "[旁白]父母卧室的门关着。按规则，进入家庭成员个人房间必须敲门。\n\n[主角]（现在父母都不在家。但贸然进入还是太早了。先记下这里，之后找机会调查。）\n\n[主角]（按规则——父亲如果在厨房要进去帮他。厨房规则暗示了父母的角色分工，也值得注意。）" },
  ch2_family_rules_missing: { id: "ch2_family_rules_missing", chapter: CHAPTER, background: livingroom, speaker: "叶平生", text: "（客厅的规则还没找到。）" },

  ch2_bathroom_investigation: { id: "ch2_bathroom_investigation", chapter: CHAPTER, background: bathroom, speaker: "旁白", playerState: "yps_frames_stand_front", text: "", onCgEnd: "ch2_free_bathroom" },
  ch2_bathroom_trash: { id: "ch2_bathroom_trash", chapter: CHAPTER, background: bathroom, speaker: "叶平生", text: "[主角]（求你了，我真的不想翻这里的垃圾桶。）\n\n[NPC:系统]规则不在垃圾桶内。\n\n[主角说]诶呀，真是善解人意的好系统。" },
  ch2_bathroom_empty: { id: "ch2_bathroom_empty", chapter: CHAPTER, background: bathroom, speaker: "叶平生", text: "（没什么线索。）" },
  ch2_bathroom_rules: { id: "ch2_bathroom_rules", chapter: CHAPTER, background: bathroom, speaker: "系统", text: "[NPC:系统]每天使用卫生间不超过四次。\n\n[NPC:系统]至少每周洗一次澡。\n\n[NPC:系统]非紧急情况，请不要把手伸进镜子里。\n\n[主角]（镜子是通往另一个空间的入口？对面显然危险，但提升探索度肯定要进去看看。）\n\n[主角]（问题是——什么才算\"紧急情况\"？）\n\n[主角]（如果我人为制造紧急情况，很可能违反规则。）\n\n[旁白]我要想办法让一个外人给家里带来紧急情况。我即将接触到的人有校园里的老师和同学，不排除校外可能认识的人，这些外人都需要我尽可能了解，多多观察。\n\n最后是厨房。", nextSceneId: "ch2_kitchen_investigation" },
  ch2_bathroom_mirror: { id: "ch2_bathroom_mirror", chapter: CHAPTER, background: bathroom, speaker: "旁白", text: "我下意识看向镜子——里面映着自己苍白的脸，镜面看不出任何异常。" },
  ch2_bathroom_leave_blocked: { id: "ch2_bathroom_leave_blocked", chapter: CHAPTER, background: bathroom, speaker: "叶平生", text: "（还没找到卫生间的规则。）" },

  ch2_kitchen_investigation: { id: "ch2_kitchen_investigation", chapter: CHAPTER, background: kitchen, speaker: "旁白", playerState: "yps_frames_stand_front", text: "", onCgEnd: "ch2_free_kitchen" },
  ch2_kitchen_rules: { id: "ch2_kitchen_rules", chapter: CHAPTER, background: kitchen, speaker: "系统", text: "[NPC:系统]厨房内要保持整洁。\n\n[NPC:系统]母亲做的饭很美味，请尊重她的劳动。\n\n[NPC:系统]为了养成健康身体，每周至少摄入一次肉类、一次蔬菜。\n\n[NPC:系统]若厨房内存在打碎的瓷器，请叫母亲来解决。\n\n[主角]（第二条和第三条看似冲突，实则不然。）\n\n[主角]（\"尊重母亲的劳动\"，并没有要求我必须吃她做的饭。至于第三条为什么要绑定肉类和蔬菜……用意还有待商榷。）" },
  ch2_kitchen_leave_blocked: { id: "ch2_kitchen_leave_blocked", chapter: CHAPTER, background: kitchen, speaker: "叶平生", text: "（厨房的规则还没找到。）" },

  ch2_home_investigation_end: { id: "ch2_home_investigation_end", chapter: CHAPTER, background: livingroom, speaker: "旁白", playerState: "yps_frames_stand_front", text: "[旁白]调查结束时已经18:00。我稍作休整，接下来该赶往学校参加今晚的考试了。\n\n[主角]（家庭规则比邮件所说的\"没有具体规则\"更加明确。或许\"没有具体规则\"只针对更大范围的副本根本规则。）\n\n[主角]（房间整洁、按时完成任务、维护父母与学校、保持快乐、成为好孩子……这些规则彼此交叠。）\n\n[主角]（目前最重要的线索，是镜子、食物与抽象身份规则。父母卧室也值得后续调查。）", nextSceneId: "ch2_home_findings_choice" },
  ch2_home_findings_choice: {
    id: "ch2_home_findings_choice",
    chapter: CHAPTER,
    background: livingroom,
    speaker: "旁白",
    playerState: "yps_frames_stand_front",
    text: "我想了想，决定接下来——",
    choices: [
      { id: "ch2_prioritized_mirror", text: "优先记录镜子规则，计划利用外部人员制造紧急情况", nextSceneId: "ch2_leave_for_school", effects: { truthDesire: 1, realityJudgment: 1 }, tags: ["真相欲望", "长期规划", "规则漏洞"], needAIAnalysis: true },
      { id: "ch2_prioritized_food", text: "优先记录食物风险，之后尽量使用自带食物", nextSceneId: "ch2_leave_for_school", effects: { selfProtection: 1, realityJudgment: 1 }, tags: ["自我保护", "风险管理", "谨慎"], needAIAnalysis: true },
      { id: "ch2_prioritized_good_child_rule", text: "优先研究\"好孩子\"身份与思想违规的联系", nextSceneId: "ch2_leave_for_school", effects: { truthDesire: 1, authorityResistance: 1 }, tags: ["规则推理", "权威抵制", "真相欲望"], needAIAnalysis: true },
      { id: "ch2_prioritized_parent_trust", text: "优先维持父母信任，为后续家庭调查争取空间", nextSceneId: "ch2_leave_for_school", effects: { trust: 1, realityJudgment: 1 }, tags: ["关系经营", "现实判断", "延迟行动"], needAIAnalysis: true },
    ],
  },
  ch2_leave_for_school: { id: "ch2_leave_for_school", chapter: CHAPTER, background: "", cgMode: true, speaker: "旁白", text: "[旁白]我稍作休整，骑上单车赶往学校。\n\n[旁白]从校门到教室的路上，我观察身边每一个同学——他们和我认识中的高中生没什么两样。目前看来一切正常。\n\n[主角]（光家庭区域就已经充满了规则陷阱。学校更人多眼杂，估计只会更加麻烦。）", nextSceneId: "ch2_enter_classroom" },
  ch2_enter_classroom: { id: "ch2_enter_classroom", chapter: CHAPTER, background: classroom, speaker: "旁白", playerState: "yps_frames_stand_front", text: "[旁白]走进教室，里面已经有三名同学在认真学习。我不便打扰，找到自己座位后装模作样地翻开课本。\n\n[主角]（先沉住气。弄清这里有没有新的规则，再决定和谁接触。）", nextSceneId: "ch3_classroom_entrance" },
};

