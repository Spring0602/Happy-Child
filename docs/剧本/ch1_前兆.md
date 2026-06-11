# 第1章 · 前兆

> 翻译自 `client/src/data/scenes.ts`
> NPC 设定见 `_npc设定.md`
补充本章重要NPC设定：
@角色设定 ？？？
  身份：来自中国古代的穿越者兼轮回者 / 萍水相逢/ 不知是敌是友
  能力：武力值极高，经历过多次游戏轮回，有一定“全知”和“预言”能力
  性格：内敛含蓄，沉着冷静，杀伐果断，睿智有远见，经历过太多生死对世道颇有见地，除非触及底线否则一般对任何事件都作壁上观不会插手
  初始态度：观察为主，对主角有些好奇，因为他在过往轮回中没见过主角
  AI权限：副本一结束后根据对主角的印象决定是否提供帮助
  禁止行为：
    - 不能直接说出人类进化计划的规则本质
    - 不能直接帮助主角逃离
    - 不能直接帮助主角打败系统
    - 隐瞒自己间接灭绝了人类的真相
---

## 一、序幕 CG：完成项目

### [CG] 开场：idea界面

```
[旁白] 终于解决完所有的bug了。光标停留在5154行的位置，一股强烈的满足感涌上心头。我合上笔记本电脑，伸了个懒腰。\n\n现在是04：46。我，叶平生，一个平平无奇的计算机专业大学生，终于完成了我的个人项目。
→ 跳转：ch1_think_balcony
```

### [CG] 心理活动：想去阳台

```
[主角] （累死我了，真想到阳台透透风。）
→ onCgEnd: enter_dormitory_playable
```

> `onCgEnd: enter_dormitory_playable` → 切换到 dormitory 地图，spawn_sit_desk，玩家坐下
> 然后弹出 dorm_cg_end_think

---

## 二、宿舍第一幕 · 凌晨04:46 自由探索

### [地图] CG结束后：主角坐在电脑前

```
冻结玩家：是
→ onCgEnd: dorm_enter_explore
```

> `onCgEnd: dorm_enter_explore` → 屏幕闪现白光 → 主角站起 → 传送到 spawn_stand_chair_right → 冻结玩家：否
> 进入自由探索。

### [地图] 自由探索 · 交互触发器

---

`@trigger_pc` 提示文字：E查看电脑
  触发：

```
[CG] 图片：/assets/CG/前兆/idea界面.png
[旁白] 光标停留在5154行的位置，IDE界面上的代码整整齐齐。\n\n这是我花了整整一周才写完的个人项目。
→ onCgEnd: dorm_return_chair_right
```

> `onCgEnd: dorm_return_chair_right` → 回到椅子右侧出生点

---

`@trigger_clock` 提示文字：E时钟
  触发：

```
[旁白] 04:46。
```

---

`@trigger_cpp_book` 提示文字：E课本
  触发：

```
[主角] （浩哥的C++程序设计课本，写满了笔记。）
```

---

`@trigger_exit_door` 提示文字：E离开宿舍
  触发：

```
[主角] （我疯了吗这时候出门干什么？）
```

---

`@trigger_window / @trigger_balcony_door` 提示文字：E前往阳台
  触发：

```
[旁白] 我轻脚走到阳台，深吸一口气。\n\n外面正下着雨，无风作扰，直直垂下，宛如帘幕。
→ onCgEnd: enter_balcony
```

> `onCgEnd: enter_balcony` → 切换至夜晚阳台地图 balcony_night，spawn_spawn_77，启动下雨特效
> 延迟 2s 后自动弹出 balcony_night_narrate_1

---

## 三、夜晚阳台第二幕

> 地图：balcony_night（夜晚阳台），下雨特效全程持续

### [混合] 阳台 · 旁白景物描写

```
冻结玩家：是
→ 等待:2秒（进入阳台后延迟触发）
[旁白] 外面正下着雨，无风作扰，直直垂下，宛如帘幕。
→ 跳转：balcony_night_narrate_2
```

### [地图] 阳台 · 旁白续

```
[旁白] 放空大脑倾听绵绵雨声，我竟有一种想冲进雨中的冲动。
→ 对话框关闭后 → 等待:1.5秒 → 触发 balcony_night_think
```

### [地图] 阳台 · 内心独白

```
[主角说] 牛马生活什么时候是个头啊……
→ onCgEnd: return_dormitory
```

> `onCgEnd: return_dormitory` → 下雨特效停止 → 切换回 dormitory 地图 → spawn_spawn_52 → 冻结玩家 → 触发 dorm_act2_think

---

## 四、宿舍第二幕 · 凌晨04:47（阳台回来后）

> flag `dorm_act2` 在此幕开始时设置
> 所有第一幕的交互按条件拦截

### [地图] 心理活动：回来

```
冻结玩家：是
[主角] （啊对了，电脑还没关呢。把电脑关了之后赶紧睡觉吧，明天还要上课……诶。）
→ 对话框关闭 → 冻结玩家：否
→ 设置flag: dorm_act2
```

### [地图] 第二幕拦截规则

| 原始 sceneId | 条件 | 拦截后 sceneId | 效果 |
|-------------|------|---------------|------|
| `dorm_interact_clock` | `dorm_act2` | `dorm_act2_clock` | 时钟显示 **04:47** |
| `dorm_interact_pc` | `dorm_act2 && !dorm_act2_exploring` | `dorm_act2_pc_confirm` | 确认睡觉？→ 选项 |
| `dorm_interact_pc` | `dorm_act2 && dorm_act2_exploring` | `dorm_act2_pc_force_sleep` | 强制睡觉 |
| `dorm_go_balcony` | `dorm_act2` | `dorm_act2_no_balcony` | 阻止去阳台 |

---

`@trigger_clock` 条件：dorm_act2
  触发：

```
[旁白] 04:47。
```

---

`@trigger_pc` 条件：dorm_act2 && !dorm_act2_exploring
  触发：

```
[旁白] 确认要关闭电脑然后睡觉吗？
→ 选项：赶紧睡啊真要累死人了
    AI标签：务实, 自保
    跳转：dorm_act2_sleep_result

→ 选项：夜猫子，还想转转
    AI标签：探索, 好奇
    跳转：dorm_act2_explore
    设置flag: dorm_act2_exploring
```

---

### [地图] 选择"继续探索"

```
[主角] （反正也睡不着，再看看吧。）
→ 对话框关闭 → 继续自由探索（dorm_act2_exploring 已设置）
```

### [地图] 再次交互电脑（强制睡觉）

```
@trigger_pc 条件：dorm_act2 && dorm_act2_exploring
  触发：
[主角] （现在必须得睡觉了，不能再晚了。）
→ 跳转：dorm_act2_sleep_result
```

### [地图] 选择"睡觉" / 强制睡觉结果

```
[旁白] 这一天我累的不行。过度疲倦带来的浓烈睡意占据我的大脑，我几乎是沾枕就睡，室友如雷的鼾声都无法吵醒我。
```

### [地图] 阻止去阳台

```
@trigger_window / @trigger_balcony_door 条件：dorm_act2
  触发：
[主角] （都这么晚了，先把电脑关了睡觉吧。）
```

---

## 五、宿舍第三幕 · 次日清晨

> dorm_act2_sleep_result 关闭时开始

### [CG] 黑屏反思独白

```
背景：空（黑屏）
[旁白] 那时我并不知道，前方有多少未知在虎视眈眈地盯着我，但我能肯定，未知每天都在我的生活中流淌，无论这个世界如何变化，它都在那里。
→ 跳转：dorm_act3_alarm
```

### [CG] 闹钟响起

```
背景：空（黑屏）
[旁白] 闹钟在07：00准时响起，我烦躁地翻了个身，精准地抓住不听话的手机把铃声快速关掉。
→ 跳转：dorm_act3_wake
→ 音效: alarm_clock (loop)
→ 停止闹铃后继续
```

### [CG] 挣扎起床

```
背景：纯黑图层（黑屏，在顶层），/assets/CG/前兆/天花板.png（在底层）
[旁白] 我在床上苦苦挣扎了一分钟，最后终于说服自己睁开了眼。
效果：纯黑图层做睁眼效果，从中间裂开然后像人睁眼一样分别往上下两端淡出。
→ 跳转：dorm_act3_getup
```

### [CG] 下床（天花板CG）

```
图片：/assets/CG/前兆/天花板.png
[旁白] 我迷迷糊糊地收拾床铺，然后下床。
→ onCgEnd: enter_dormitory_day
```

> `onCgEnd: enter_dormitory_day` → 切换到 dormitory_day 白天地图 → spawn NPCs（陈煜浩/室友A/室友B）→ 冻结玩家 → 开始24段地图对话

---

### [地图] 白天地图对话序列（冻结玩家，SPACE推进）

```
→ 切换地图: dormitory_day
对应json：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\dormitory\map1.json
→ 出生点: spawn_spawn_7（主角，播放动作G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front）
出生点：spawn_spawn_8（陈煜浩，播放动作G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\cyh_frames\cyh_frames_stand_back）
出生点：spawn_spawn_9（室友A，播放动作G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\roommateA_frames\roommateA_frames_stand_left）
出生点：spawn_spawn_10（室友B，播放动作G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\roommateB_frames\roommateB_frames_stand_right）
→ 冻结玩家：是
```

```
[主角] （等等，那是……）
→ 跳转：dorm_act3_pc_on_1
```

```
[旁白] 我本来挺困的，却被入眼的白光吓得瞬间清醒。
→ 跳转：dorm_act3_pc_on_2
```

```
[旁白] 这次应该不是因为我忘记关电脑了，而是电脑自动打开了。
→ 跳转：dorm_act3_turn_roommate
```

```
[旁白] 我吞了口唾沫，转头看向室友。
→ 跳转：dorm_act3_ask_pc
```

```
[主角说] 你们昨晚有谁打开了我的电脑吗？
→ 跳转：dorm_act3_roommate_laugh
```

```
[旁白] 室友像听了什么笑话一样。
→ 跳转：dorm_act3_roommateA_reply
```

```
[NPC:室友A] ber，哥们你卷糊涂了吧，我们自己有电脑，为啥要用你的？
→ 跳转：dorm_act3_narrate_other
```

```
[旁白] 另外一个室友附和道，
→ 跳转：dorm_act3_roommateB_reply
```

```
[NPC:室友B] 是啊……你卷得这么晚，哪个疯子会大晚上不睡觉就为了打开你的电脑？
→ 跳转：dorm_act3_still_doubt
```

```
[旁白] 我仍不死心，
→ 跳转：dorm_act3_ask_sound
```

```
[主角说] 那快天亮的时候你们有听到什么动静吗？
→ 跳转：dorm_act3_both_reply
```

```
[NPC:室友A, 室友B] 没，我俩都困得要死。
→ 跳转：dorm_act3_inner_thought
```

```
[主角] （也是，依他们的性子，这两个大摆锤恨不得睡得昏天黑地。）
→ 跳转：dorm_act3_ask_hao
```

```
[主角说] 那你呢，浩哥？
→ 跳转：dorm_act3_narrate_chen
```

```
[旁白] 陈煜浩是唯一一个比我还卷的室友，加之脑子比我好使，课设作业也比我早一天完成。他平时睡眠也不是很好，估计我昨晚熬夜把他搞失眠了，不过正好，后半夜的情况他应该很清楚。
→ 跳转：dorm_act3_chen_shake
```

```
[旁白] 他一边收拾书包一边摇了摇头。
→ 跳转：dorm_act3_shock
```

```
[主角说] 啊？
→ 跳转：dorm_act3_narrate_chen_detail
```

```
[旁白] 见我一脸疑惑，他淡淡解释道，
→ 跳转：dorm_act3_chen_reveal
```

```
[NPC:陈煜浩] 我的意思是，快天亮的时候就是你本人打开了电脑。
→ 跳转：dorm_act3_narrate_shock
```

```
[旁白] 我顿时汗毛倒竖。
→ 跳转：dorm_act3_protagonist_shock
```

```
[主角说] 见鬼……怎么可能？我明明睡前把电脑关了。
→ 跳转：dorm_act3_chen_explain
```

```
[NPC:陈煜浩] 不用这么惊讶，我想，你应该是梦游了。这种事如今在年轻人之中并不少见。
→ 跳转：dorm_act3_roommateA_comfort
```

```
[NPC:室友A] 叶卷卷你都连续熬了这么多天，是不是都神经衰弱了？被吓到也是情有可原。你这几天好好休息一下就好了。
→ 跳转：dorm_act3_idea_cg
```

### [CG] idea界面 CG

```
图片：/assets/CG/前兆/idea界面.png
[旁白] 我又看了眼停留在5154行的光标，叹了口气，关上电脑把它扔进包里。
→ 跳转：dorm_act3_final_dark
```

### [CG] 全黑收尾

```
背景：空（黑屏）
[旁白] 整个白天我都在上课，电脑我一直监视着，这段时间倒是没有再徒生变故。\n\n难道昨晚的事件真的是我的错觉？
→ 跳转：dorm_act4_return_dorm
```

---

## 六、宿舍第四幕 · 邮件出现

> dorm_act3_final_dark 关闭时开始

### [地图]上完课回宿舍

```
→ 切换地图: dormitory
→ 地图底图: dormitory_night_pc_off
使用的json：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\dormitory\map2.json
→ 出生点: spawn_spawn_4
→ 冻结玩家: 是
→ 玩家状态: sit_down（播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back）
NPC：
  - 名字: 陈煜浩, 位置:spawn_spawn_6，播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\cyh_frames\cyh_frames_stand_back
  - 名字: 室友A, 位置: spawn_spawn_7，播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\roommateA_frames\roommateA_frames_stand_left
  - 名字: 室友B, 位置: spawn_spawn_8，播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\roommateB_frames\roommateB_frames_stand_right
[旁白] 晚上23：00，我写完当天的作业，打算拿起手机玩会游戏。
[主角] （完蛋，今天X神小月卡还没领，我的30元大洋啊。）
→ 跳转：dorm_act4_pc_boot
```

### [地图] 电脑自动开机

```
→ 切换地图底图: dormitory_night_pc_on
效果：地图闪一下
[主角] （我的天！？）
[旁白] 没错，这次绝对不是我的错觉，它在我眼皮子底下开机了。\n\n估计是黑客用远程代码控制了我的电脑，但是电脑显示防火墙并没有给予入侵提示。\n\n看来这个黑客技术相当高超。
[主角] （让我消化一下……）

→ 选项：我还不清楚事情的全貌，先看看电脑上有什么
    AI标签：谨慎, 冷静, 理性, 独立
    跳转：dorm_act4_check_pc

→ 选项：浩哥这么聪明，让他帮我看看电脑出了什么问题
    AI标签：信任, 依赖, 天真
    跳转：dorm_act4_death
```

### [CG] 求助死亡

```
图片：空（黑屏）
[主角说] 浩哥，你能不能过来一下？
[NPC:陈煜浩] 什么事？
[主角说] 刚才我的电脑忽然自动开机了。
[旁白] 他疑惑地挑起一根眉毛，一副"你在说什么胡话"的表情。
[主角说] 喏，你看。
[旁白] 我将电脑递给陈煜浩。\n\n但就在他看向屏幕的那一刻，我的心脏突然就像被一只无形的大手抓住了，隐隐作痛，而且，力道还在不断收紧。
→ 效果: flash_red
[主角说] 咳咳……
[旁白] 猩红的血液从我的嘴角流出，意识逐渐远去，我砰的一声倒在了地上。\n\n弥留之际，我看到了震惊的陈煜浩和慌忙跑过来的两个室友。\n\n我死了。
→ 跳转：title_screen
```

### [CG] 电脑界面 · 阅读邮件

```
图片：/assets/CG/前兆/邮件.png
[旁白] 我深吸一口气平复了不安的心情，仔细查看电脑，映入眼帘的是一封邮件通知。\n\n于是我点开了那封邮件。
[主角] （这封邮件……）
[旁白] 邮件内容是：
[旁白] 亲爱的预备参赛者：\n\n由于系统检测到您在"人类"智慧群体中资质出众，您将成为第一批进入"人类进化计划"筛选的参赛者。此邮件作为新手引导，以下内容请您仔细阅读。\n\n初赛将于00：00准时开启，您可以按照下列提示进行赛前准备：\n\n1. 按需准备15日的能量摄入来源。\n\n2. 依据个人身体素质准备强度不一的防身武器。\n\n3. 尽量保持稳定的磁场紊乱状态。\n\n关于初赛信息：\n\n无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。\n\n请您遵守保密协议：严禁将比赛信息泄露给无关人员，若有违反，系统将即刻抹除您的存在。\n\n祝您比赛顺利~
[主角] （……）
[旁白] 发件人身份是一堆乱码，我尝试在邮件网站中搜索这个人，却发现这个账号并不存在。
[主角] （有意思。）
→ 跳转：dorm_act4_mail_analyze
```

### [CG] 分析邮件

```
[旁白] 不知是不是在高压的环境下生活惯了，我看完这封邮件后的感受中，恐惧仅占三成。\n\n我长舒一口气，很快接受了这个事实，开始思考邮件里的内容。
[旁白] 首先，关于这封邮件的虚实，我认为其所言大概率不是恶作剧。\n\n昨晚电脑反复开机就是一种预兆，同时也暗示我对方的科技实力不是如今的人类可以匹敌的。\n\n哪怕这很荒谬，我也不得不承认，邮件的发送者，或者说这场比赛的举办方，如果不是思想极端的科研恐怖分子，只能是来自比人类更高层次文明的智慧生物了。
[旁白] 但愿是我异想天开了。\n\n还有这个"资质出众"。\n\n说到这都有点好笑，我真想不通自己哪里资质出众了。\n\n找高智商参赛者应该找研究院的研究人员或者前沿科技开发者，找高武力值参赛者应该找军人武警之类的……我这种大学生就像待宰的羔羊，除了比这些人的未来有更多不确定因素还有什么优势？
[主角] （真有够扯的，不过这奇怪的评判逻辑目前也没必要深究是了。）
[旁白] 接下来是我准备的重点。根据三条提示，我可以得到以下信息：
→ 跳转：dorm_act4_tip1
```

### [CG] 第一条提示

```
→ 选项：查看第一条提示
    跳转：dorm_act4_tip1_result
```

```
[旁白] 按需准备15日的能量摄入来源。
[主角] （初赛一共15天，参赛者需自行解决温饱问题。）
→ 跳转：dorm_act4_tip2
```

### [CG] 第二条提示

```
→ 选项：查看第二条提示
    跳转：dorm_act4_tip2_result
```

```
[旁白] 依据个人身体素质准备强度不一的防身武器。
[主角] （比赛过程很危险，可能存在致命伤害源。）
→ 跳转：dorm_act4_tip3
```

### [CG] 第三条提示

```
→ 选项：查看第三条提示
    跳转：dorm_act4_tip3_result
```

```
[旁白] 尽量保持稳定的磁场紊乱状态。
[主角] （不过"稳定的磁场紊乱状态"是什么？）
[旁白] 这自相矛盾的形容词让我云里雾里的。\n\n只能确定一点，这里的"磁场"肯定不是物理学中的磁场。其他信息还是先不要胡乱猜测的好。
[旁白] 至于规则这一块……有意思的是，只有一条规则，但这条规则也真是够致命的。
[主角] （无确切内容，无具体规则。唯一规则：任何违反规则的参赛者将被即刻抹除。）
[旁白] 或许"寻找规则"也是比赛的评判标准之一。\n\n另外，参赛者之间的关系也需要注意。

→ 选项：虽然表面上是竞争者，但我并没有单枪匹马通关的信心
    AI标签：信任, 共赢, 理智, 目光长远
    跳转：dorm_act4_choice_trust

→ 选项：这是一个死亡游戏，社会规则会变得比我现在身处的社会更加残酷，每一个参赛者都是潜在的敌人
    AI标签：冷漠, 自私, 悲观厌世, 防御
    跳转：dorm_act4_choice_lone

→ 选项：或许在新的世界，我反而能找到真正志同道合的同伴
    AI标签：乐观, 勇敢, 信任, 机敏, 思辨, 渴望被理解, 个性
    跳转：dorm_act4_choice_optimist
```

### [CG] 策略选择 · 信任共赢

```
[主角] （从古至今，人类一直是彼此扶持着一路走来的。单枪匹马只属于实力超群的强者，但游戏还没开始，我怎么能确定自己是那个强者呢？）
→ 跳转：dorm_act4_prepare_depart
```

### [CG] 策略选择 · 独行

```
[主角] （无论身处何处，我都必须要赢。）
→ 跳转：dorm_act4_prepare_depart
```

### [CG] 策略选择 · 乐观

```
[主角] （我生来就不是正常人。我曾认命地认为人类无法真正地理解彼此，因为谁都无法复刻他人的人生。但是谁能保证新的世界中我无法体验别人的人生呢？）
[旁白] 想到这里，我心里反而隐隐有些期待。\n\n或许我真的是个疯子吧。
→ 跳转：dorm_act4_prepare_depart
```

### [CG] 准备出发

```
[主角] （那么，接下来就是准备行囊了。）
[旁白] 我整理完思绪，两眼一睁就是飞奔到楼下的小卖部。
```
### [CG] 上帝视角（第六部分完）
图片：空（屏幕全黑）
[NPC：室友A]我的天，叶卷卷这是怎么了？真卷起一阵风了。
[旁白]陈煜浩轻轻瞥了眼我离开的方向，眸光一暗。

---
## 七、赛前准备
### [地图]校园小卖部
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
出生点：spawn_shop_school_entrance（播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front）
冻结主角：是
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
[主角]（整整十五天的口粮，我必须要攒够，样样都买一点吧。）
[旁白]我像个打劫的不法分子，开始把整个小卖部洗劫一空。
进入自由探索
### [地图]小卖部自由探索
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
出生点：spawn_shop_school_entrance（播放G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front）
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
可交互点
@trigger_drink
  提示文字：E饮品
  设置flag_drink=false，交互后flag_drink=true
  触发：[对话]
        [主角]（充足的水分是很重要的。）
@trigger_food
  提示文字：E压缩饼干
  设置falg_food=false，交互后flag_food=true
  触发：[对话]
        [主角]（体积小易携带，是个好选择。）
@trigger_chips
  提示文字：E膨化食品
  设置falg_chips=false，交互后flag_chips=true
  触发：[对话]
        [主角]（我是很爱吃，但是条件估计不允许。）\n\n（诶，命苦的我。）
@trigger_1
  提示文字：E肉脯
  设置falg_1=false，交互后flag_1=true
  触发：[对话]
        [主角]（这个好吃，要了。）
@trigger_2
  提示文字：E果脯
  设置falg_2=false，交互后flag_2=true
  触发：[对话]
        [主角]（我可不想得坏血病。买了。）
@trigger_door
  提示文字：E离开
  触发：[对话]
        [主角]（我还不想死。）
@trigger_assistant
  提示文字：E结账
  触发：[对话]
        [主角]（结什么帐，事儿还没办完呢。）
以上flag全部为1后触发下一场景
### [地图]购买完成
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：XXX
冻结主角：是
[主角]（就买这么多吧，应该够用了。）\n\n（接下来去结账吧。）
跳转到下一场景
### [地图]去结账（探索）
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
可交互点
@trigger_drink
  提示文字：E饮品
  触发：[对话]
        [主角]（去结账吧。）
@trigger_food
  提示文字：E压缩饼干
  触发：[对话]
        [主角]（去结账吧。）
@trigger_chips
  提示文字：E膨化食品
  触发：[对话]
        [主角]（去结账吧。）
@trigger_1
  提示文字：E肉脯
  触发：[对话]
        [主角]（去结账吧。）
@trigger_2
  提示文字：E果脯
  触发：[对话]
        [主角]（去结账吧。）
@trigger_door
  提示文字：E离开
  触发：[对话]
        [主角]（我还不想死。）
@trigger_assistant
  提示文字：E结账
  设置flag
  触发：跳转下一场景
### [地图]结账完成
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
冻结主角：是
[旁白]商品已经没剩多少了，老板娘吓了一跳，好奇地问，
[NPC：老板娘]小伙子，你买这么多东西干什么？
[旁白]我搪塞道，
[主角说]大娘，我这不是一个月以后要参加创新大赛么，心里不踏实，想花半个月闭关修炼，哈哈……
[旁白]老板娘瞅了眼我购物袋里的膨化食品和速食，脸上写满了担忧，
[NPC：老板娘]年纪轻轻也要注意身体啊，我听说现在30岁病死的年轻人多的是呢。
[主角说]（笑）没事没事，您不用担心。我知道的。
[旁白]闲聊的过程中，账已经结好了。
[主角]（该去下一个目的地了。）
跳转到下一场景
### [地图]离开小卖部（探索）
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
可交互点
@trigger_drink
  提示文字：E饮品
  触发：[对话]
        [主角]（该去下一个目的地了。）
@trigger_food
  提示文字：E压缩饼干
  触发：[对话]
        [主角]（该去下一个目的地了。）
@trigger_chips
  提示文字：E膨化食品
  触发：[对话]
        [主角]（该去下一个目的地了。）
@trigger_1
  提示文字：E肉脯
  触发：[对话]
        [主角]（该去下一个目的地了。）
@trigger_2
  提示文字：E果脯
  触发：[对话]
        [主角]（该去下一个目的地了。）
@trigger_door
  提示文字：E离开
  触发：跳转到下一场景
@trigger_assistant
  提示文字：E结账
  触发：[对话]
        [主角]（该去下一个目的地了。）
### [地图]离开小卖部（告别）
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop_school\便利店.png
NPC：id：npc_female_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_female_frames\shop_assistant_female_frames_stand_back，出生点：spawn_spawn_47
冻结主角：是
[旁白]我忽然像是想起了什么，下意识朝老板娘挥挥手，
跳转播放动作：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front
[主角说]再见，大娘！
[旁白]她慈祥地笑了笑。\n\n我心中温暖的感觉冲散了先前积攒的压力和紧张感，现在心情平静了不少。
切换到下一场景
### [CG]思考
图片：无（屏幕全黑）
[旁白]不过采购完食品以后，我又遇到了一个问题——学校内不允许售卖刀具，宿舍内刀具则是违禁品，我要买防身用品的话只能到校外，或者点外卖送达。\n\n现在是23：32，点外卖也要30分钟起步，还不如在学校附近找找呢。\n\n我骑着小电驴来到了离校最近的厨房用品店，我走进店内时，柜台前已经排了3个人。
切换到下一场景
### [地图]厨房用品店
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop\厨具便利店.png
出生点：spawn_spawn_1，播放：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front
NPC：id：npc_male_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_male_frames\shop_assistant_male_frames_stand_back，出生点：spawn_spawn_3
    id：npc_lzx，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames\lzx_frames_stand_front，出生点：spawn_spawn_5
    id：npc_delinquent teenager，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\delinquent teenagers_frames\delinquent teenagers_frames_stand_front，出生点：spawn_spawn_6
    id：npc_？？？，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\？？？_frames\？？？_frames_stand_front，出生点：spawn_spawn_7
冻结主角：是
[主角]（这一片区域是大学城，时效最高的有且仅有这一家厨房用品店，不过往常这个时候，店里应该基本没人才对。）
[旁白]这3个人1女2男，看着都像附近的大学生。
[主角]（除非他们也是和我一样的“变数”。）
[旁白]邮件中提到禁止将比赛信息泄露给无关人员。同为参赛者的话应该不会涉及泄密问题吧？\n\n如果能在赛前确认哪怕一小部分信息，赛中都将获得巨大的优势。就算风险很大，但我也认为这值得我赌一把。\n\n我在手机备忘录里用最大号字体输入了自己的姓名，然后又用正常字体写下了几个需要和其他参赛者确认的问题。
[主角]（接下来先找把趁手的防身武器。）
跳转到下一场景
### [地图]厨房用品店（探索）
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop\厨具便利店.png
NPC：id：npc_male_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_male_frames\shop_assistant_male_frames_stand_back，出生点：spawn_spawn_3
    id：npc_lzx，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames\lzx_frames_stand_front，出生点：spawn_spawn_5
    id：npc_delinquent teenager，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\delinquent teenagers_frames\delinquent teenagers_frames_stand_front，出生点：spawn_spawn_6
    id：npc_？？？，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\？？？_frames\？？？_frames_stand_front，出生点：spawn_spawn_7
可交互点
@trigger_9
  提示文字：E水果刀
  设置flag_fruit_knife=false，触发后为true
  触发：[对话]
        [主角]（这个不错，就拿它吧。）
@trigger_10
  提示文字：E勺铲
  触发：[对话]
        [主角]（没啥用。）
@trigger_11
  提示文字：E菜刀
  触发：[对话]
        [主角]（太笨重了，不适合随身携带。）
@trigger_12
  提示文字：E平底锅
  触发：[对话]
        [主角]（这是红太狼的专武，不是我的。）
@trigger_8
  提示文字：E排队
  触发：[对话]
        若flag_fruit_knife=false
        [主角]（我还没选商品。）
        否则
        跳转到下一场景
### [地图]交换线索
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop\厨具便利店.png
效果：闪现
出生点：spawn_spawn_4，播放：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front
NPC：id：npc_male_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_male_frames\shop_assistant_male_frames_stand_back，出生点：spawn_spawn_3
    id：npc_lzx，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames\lzx_frames_stand_front，出生点：spawn_spawn_5
    id：npc_delinquent teenager，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\delinquent teenagers_frames\delinquent teenagers_frames_stand_front，出生点：spawn_spawn_6
    id：npc_？？？，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\？？？_frames\？？？_frames_stand_front，出生点：spawn_spawn_7
冻结主角：是
[旁白]此时是23：40，时间够晚，基本可以确定这附近参赛者数目不少。\n\n时间紧迫，我拍了拍排在我前面的女生的肩膀，她立即像一只受惊的小白兔一样转过身来。
npc_lzx播放动作：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames\lzx_frames_stand_back
[旁白]我随即将手机举到她面前，然后仔细观察她的面部表情。\n\n看到第一个问题后，她脸上纯良的表情逐渐变得狠戾。
[主角说]【我们的规则是什么？】
[NPC：女生]【没有具体规则。】
[旁白]我暗自松了口气。
[主角]（赌对了。）
[主角说]【你怎么理解第三条提示？】
[旁白]女生沉默了，随即警觉地看着我。\n\n好吧，她需要我先展示诚意。
跳转到下一场景
[主角说]【这只是我的猜测。网络上最近很流行把一个人的气质和具有的能量称为“磁场”，从逻辑角度分析，第三条提示中的“磁场”按这个意思理解是合理的。不过结合邮件的用词风格来看，发件人对社会现状并不是很了解，因此，我不是很确定。】
[NPC：女生]【我认可你的想法，但我认为这里的“磁场”还有更广义的意思。既然筛选对象是人类，那么这个词用来描述人类不假。它应该既可以描述个体，也可以描述群体。】
[主角说]【什么意思？】
[NPC：女生]【点到为止。】
[主角]（哈，算盘打得挺精啊。）
[旁白]我也没有死缠烂打，毕竟这个场合不宜搞出太大动静。\n\n最后她给我透露了她的姓名——林芷萱，以及联系方式。
[主角]（看来还是和她有合作可能的。）
跳转到下一场景
### [CG]过渡
图片：无（屏幕全黑）
效果：淡入
[旁白]不知不觉排到了林芷萱，而这时不速之客却找上了门。\n\n是个红毛不良少年。
### [地图]挑衅
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\shop\厨具便利店.png
出生点：spawn_spawn_6，播放：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_back
NPC：id：npc_male_assistant，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\shop_assistant_male_frames\shop_assistant_male_frames_stand_back，出生点：spawn_spawn_3
    id：npc_lzx，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\lzx_frames\lzx_frames_stand_front，出生点：spawn_spawn_7
    id：npc_delinquent teenager，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\delinquent teenagers_frames\delinquent teenagers_frames_stand_front，出生点：spawn_spawn_5
    id：npc_？？？，精灵：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\？？？_frames\？？？_frames_stand_right，出生点：spawn_spawn_2
冻结主角：是
[NPC：红毛]呵，在店里都不忘把妹呢。你小子，和她聊什么聊这么开心？和我也说说呗。
[旁白]我不爽地皱眉。\n\n看来用手机交流还是太显眼了。\n\n我决定——
->选项：你小子找茬是吧？我长这么大，向来有仇必当场报
    AI标签：果断、冲动、个性、勇敢、反叛、自私
    NPC目睹：？？？
    设置flag_clear=false
    剧情：
      [NPC：红毛]你说什么？是想在这里和老子打架么？刚好把你手机抢过来瞧瞧！
      [旁白]老板一边帮林芷萱结账一边不耐烦道，
      [NPC：老板]这位客人，麻烦不要在店里闹事。
      [NPC：红毛]你也活腻了是不是？
      [旁白]老板瞬间闭了嘴。
    跳转到下一场景
->选项：嗐，还能聊什么。我能聊的内容，像哥们你这么帅的人不应该早知道了么？
    AI标签：圆滑、理性、稳重、机敏、有大局观、有趣
    NPC目睹：？？？
    设置flag_clear=true
    剧情：
      [旁白]我看着手机上提示的23：47，手心早已布满汗水。\n\n如果我没能在零点之前将一切都准备好，我很有可能活不过第一天。
      [NPC：红毛]拍马屁老子见多了。还拿这蠢话术骗谁呢！？把你手机交出来！
      [旁白]老板一边帮林芷萱结账一边不耐烦道，
      [NPC：老板]这位客人，麻烦不要在店里闹事。
      [NPC：红毛]你也活腻了是不是？
      [旁白]老板瞬间闭了嘴。
    跳转到下一场景
### [CG]林芷萱离开
图片：无（屏幕全黑）
效果：淡入
[旁白]林芷萱结完账，趁乱逃离了店铺。
若flag_clear=true：
  [旁白]已经没多少时间了，我得赶紧把他们支开。这人要抢我手机，我估计在场没人会主动帮我。\n\n我得自救。\n\n我注意到最先结账的男生一言不发地藏匿在角落里并没有离开，而是冷漠地看着这场闹戏。\n\n他头上宽大的兜帽在他脸上投下一片阴影，我看不清他的脸。但好在他身着作战服，隐隐勾勒出肌肉的轮廓，我看得出来这人很能打。
  [主角]（话说，他怎么有时间买作战服的？）
  [旁白]算了，这不是重点。
  [旁白]我冲那个男生喊道，
  [主角说]大哥，你快来替我收拾他！他抢我手机！
  [旁白]对付混混，就该用魔法打败魔法。\n\n角落里的男生抬起头，眼中多了一丝惊愕。\n\n红毛慌了神，
  [NPC：红毛]什么？
  [旁白]太好了，他的注意力不在我身上了。
  ->NPC观念更新：？？？
其他：
  [旁白]我正要对他出手，却有一只强有力的臂弯拦住了我。
  [主角说]？
  [NPC:？？？]你走。
  [旁白]红毛慌了神，
  [NPC：红毛]什么？
  [旁白]我愣了一下，随即意识到他是在为我解围。
[旁白]我赶紧把商品递给老板，他扫码的过程都战战兢兢的，生怕那红毛又纠缠回来。\n\n我偷瞄那边的情况。那男生一言不发，走到了红毛面前，我甚至都能感受到他身上散发的强烈杀气。
[NPC：红毛]你……你不是走了吗？
[主角]（嗯？看来他俩之前认识？诶，两个都不好惹，我还是快点溜吧。）
[旁白]我收好水果刀，路过两人时又谄媚地说了句“谢谢大哥”，就骑上小电驴一骑绝尘。
### [CG]参赛前夕
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\前兆\书桌.png
效果：淡入
[旁白]回到寝室已经是23：55分了。
[主角]（极限五分钟！）
[旁白]我火急火燎地收拾行囊，柜子都来不及关上。
[NPC：室友A]我靠……真·高速小马达。
[旁白]我顾不上和室友顶嘴。开赛前30妙，我终于换好了一身运动装，背上了行囊。
切换图片：全黑，屏幕中间显示电子数字00:00
[旁白]我眼前一黑，下一秒就置身于仿佛一个小型宇宙的空间中。
切换到下一场景
### [地图]游戏开始
切换地图底图：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\waiting\进入界面.png
效果：淡入
出生点：地图中央，播放：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_front
[旁白]四周数字如星辰点点，星云摇曳，而我漂浮于宇宙中，并无失重感，甚至能正常呼吸。
[NPC：系统]欢迎参赛者来到“人类进化计划”候场区~
（第一章完）
## 章末备注

### 宿舍第一幕出生点

| spawn ID | 坐标 | 用途 |
|----------|------|------|
| `spawn_sit_desk` | (570, 950) | CG结束后主角坐在电脑前 |
| `spawn_stand_chair_right` | (340, 1050) | 站起后出现在椅子右侧 ，醒来后出生点|
| `spawn_spawn_77` | (367+16, 736+16) | 阳台门口出生点 |
| `spawn_spawn_52` | (538+16, 370+16) | 从阳台回到宿舍出生点 |
| `spawn_spawn_53` | — | 陈煜浩 NPC 出生点 |
| `spawn_spawn_54` | — | 室友A NPC 出生点 |
| `spawn_spawn_55` | — | 室友B NPC 出生点 |

### 关键flag状态机

```
start → ch1_think_balcony → onCgEnd: enter_dormitory_playable
  ↓
宿舍第一幕（dormitory, 04:46）
  阳台触发 → dorm_go_balcony → onCgEnd: enter_balcony
  ↓
阳台第二幕（balcony_night, 下雨特效）
  → return_dormitory → spawn_spawn_52
  ↓
SET_FLAG dorm_act2
宿舍第二幕（dormitory, 04:47, act2 拦截生效）
  ├── 睡觉 → dorm_act2_sleep_result
  └── 继续探索 → SET_FLAG dorm_act2_exploring
      → 再次交互电脑 → dorm_act2_pc_force_sleep → dorm_act2_sleep_result
      
宿舍第三幕（dormitory_day, 次日清晨）
  24段对话 → idea CG → 全黑
  ↓
宿舍第四幕（dormitory, 邮件出现）
  → 回到宿舍（电脑关） → 电脑自动开机
  ├── 求助陈煜浩 → 死亡 → title_screen
  └── 自己检查 → 阅读邮件 → 分析邮件 → 策略选择 → 准备出发
```

### 流程说明

- **活跃线**：start → dorm_act* → 目前写到第四幕第六部分准备出发
- `dorm_go_balcony` 通过 `→ onCgEnd: enter_balcony` 由 MapScene 的 `handleDialogueTrigger` 接管
- 第七部分待续，末尾跳转 sceneId 待补
