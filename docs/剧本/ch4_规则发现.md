# 第4章 · 规则发现

## 一、说服自己
### [CG]探索进度提升
场景ID：ch4_exploration_progress
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\意识\与“我”对话.png
效果：fade_in
[旁白]要是我没有看那段文字的话，是不是就可以避免“我”的负面思想？但是，如果我不选择冒险探寻“我”内心真实的想法，又怎么让我得到真正的快乐呢？
[NPC:系统]参赛者寻找到“被遗弃的呐喊碎片1”，副本探索度达5%。
[旁白]为了拿到足够通关奖励，我需要努力把探索度加到100%。每天解锁一片碎片，一周可以增加35%的探索度。\n\n要安全收集碎片，必须每天创造让“我”快乐的回忆。
[旁白]我合上计划本，打开手机通讯录，给刘宇发了条信息，就上床睡觉了。\n\n当然，我这一夜睡得并不好。
[旁白]第二天，我早早来到学校，在教室所在楼层绕了一圈，没有发现任何规则。
→ 跳转：ch4_find_brochure
### [地图]寻找宣传册（探索）
场景ID：ch4_find_brochure
地图：classroom
效果：fade_in
出生点：spawn_spawn_145
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
冻结玩家：是
NPC:
  - id: npc_classmate, 名字: 同学A, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_female1_frames\npc_female1_frames_sit_back, 位置: spawn_spawn_146
  - id: npc_classmate_2, 名字: 同学B, 精灵:G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_male_frames\npc_male _frames_sit_back, 位置: spawn_spawn_126
[旁白]我回到教室，在多出来的空位上坐下。\n\n过了一分钟，周围的同学没有注意到我，我身上也没有发生任何怪异的事。\n\n确认不会违规后，我开始调查抽屉。除了一堆作业之外，我还意外发现了一张活动宣传手册。
→ 跳转：ch4_classroom_rules
### [CG]教室规则
场景ID：ch4_classroom_rules
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\一班规则.png
效果：fade_in
[旁白]手册里夹着一张纸，我取出那张纸，看到了熟悉的猩红字迹。
[旁白]1.严格遵照课程表安排的课程上课，上课须专心，禁止交头接耳（讨论和回答问题除外），禁止离开座位，禁止进食。\n\n2.课堂问题回答错误会受到惩罚。\n\n3.午餐和晚餐由学校统一提供，禁止浪费。\n\n4.每日晚自习进行周测，阅卷完毕后由各科老师公布成绩和排名，请学生们努力学习。\n\n5.各班单科周测成绩排名后五名将进行为期一周的课外辅导，请在晚自习开始前30分钟准时到达各班教室参加辅导。\n\n6.当天作业通过学习平板提交，请注意作业截止时间，禁止缺交。\n\n7.晚自习禁止进食、交头接耳、离开座位。非必要不要抬头。\n\n8.学生要听老师的话，禁止忤逆老师。\n\n9.晚自习中有30分钟的答疑时间，各科老师会在门口待命，答疑时间及科目每天由各班班长在后黑板更新，请有疑问的同学积极提问。
[主角]（这个规则并不公平。）
[旁白]我们班是尖子班，第五条规则显然是不合理的。不过，这也方便我通过第五条规则获得额外信息。\n\n还有第九条规则，并没有说明向老师提问的内容限制，如果可以从老师口中套出情报的话，一定要抓住这个机会。\n\n而第三条规则让我感觉是一个陷阱。我目前还不知道食用副本中的食物会有什么副作用，这条规则强制我食用校内食物，无论遵守还是不遵守都是死路一条。
[主角]（我需要找到一个合理处理食物的方法。）
[旁白]收起规则，我转而翻开那张活动宣传册。
→ 跳转：ch4_brochure_content
### [CG]宣传册内容
场景ID：ch4_brochure_content
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\宣传册.png
效果：fade_in
[旁白]这是一个校园试胆活动的宣传册，活动时间是本周六晚19：00，也就是即将通过副本的那一天。扫二维码即可报名，限制名额五人。
[主角]（这活动我是肯定要报名的。）
[旁白]此次试胆活动的主题是调查在学校内流传已久的怪谈，具体内容将在报名后告知。\n\n我拿走宣传册，回到自己的座位上，开始按计划表学习。
→ 跳转：ch4_morning_classroom
### [地图]早上教室
场景ID：ch4_morning_classroom
地图：classroom
效果：fade_in
出生点：spawn_spawn_132
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
冻结玩家：是
NPC：
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_stand_left, 位置: spawn_spawn_156
  - id: npc_classmate, 名字: 同学A, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_female1_frames\npc_female1_frames_sit_back, 位置: spawn_spawn_146
  - id: npc_classmate_2, 名字: 同学B, 精灵:G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_male_frames\npc_male _frames_sit_back, 位置: spawn_spawn_126
座位填充：
  所有座位出生点：spawn_spawn_115～spawn_spawn_155
  已占用座位：主角 spawn_spawn_132, 同学A spawn_spawn_146, 同学B spawn_spawn_126
  保持空位：spawn_spawn_145
  其余座位：随机用 npc_female1_frames_sit_back / npc_male_frames_sit_back 填充
NPC动作：
  npc_liuyu → 从: spawn_spawn_156 → 经由: spawn_spawn_248, spawn_spawn_250, spawn_spawn_252 → 移动至: spawn_spawn_246 → 面朝: 主角
[旁白]十五分钟后，刘宇来了，他径直走到我面前，把一张花名册扔到我桌上。
[NPC:刘宇]哝，你要的东西。
[主角说]（笑）谢谢，帮大忙了。
[NPC:刘宇]没事。我先收作业去了。
NPC动作：
  npc_liuyu → 从: spawn_spawn_246 → 经由: spawn_spawn_252, spawn_spawn_250 → 移动至: spawn_spawn_127 → 播放动画: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back
[主角]（作为班长，刘宇要遵守的规则是不是更多？但同样地，他知道的情报会比其他学生更多，甚至还掌握部分老师的信息。）
[旁白]我暗做打算，然后端详起花名册。
→ 跳转：ch4_roster_anomaly

---

## 二、看不见的名字

> 导演说明：
> - 本章固定事实：花名册中存在一个主角无法读取、无法听清姓名的学生。
> - AI动态部分：刘宇与普通同学如何评价主角的调查方式，以及刘宇是否提前把主角视为“值得合作的人”。
> - 无论玩家如何选择，都不能提前揭露透明学生身份。

### [CG]花名册异常
场景ID：ch4_roster_anomaly

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\花名册.png
效果：淡入
[旁白]花名册上共有三十九人。大部分名字都很熟悉，唯独多出来的那个人——
[主角]（……？）
[旁白]那明明是三个端正的汉字，我却无法理解它们。每当视线试图聚焦，笔画便像水中的倒影一样散开。\n\n我打算——

→ 选项：询问附近同学，这三个字怎么读
    AI标签：冒险, 果断, 勇敢
    NPC目睹：刘宇
    设置flag: ch4_roster_direct
    跳转：ch4_roster_ask_student

→ 选项：先对照座位与花名册，确认这个人是否真实存在
    AI标签：谨慎, 现实判断, 独立, 防御
    NPC目睹：刘宇
    设置flag: ch4_roster_observe
    跳转：ch4_roster_observe

→ 选项：把花名册还给刘宇，用眼神示意异常的位置
    AI标签：试探合作, 信任, 机敏
    NPC目睹：刘宇
    设置flag: ch4_roster_test_liuyu
    跳转：ch4_roster_test_liuyu

### [CG]直接询问同学
场景ID：ch4_roster_ask_student
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\花名册.png
效果：fade_in
[主角说]同学，你知道这三个字是什么吗？
[NPC:同学]你是不是傻啊？这不是我们班的——
→ 音效: tinnitus (once)
→ 效果: flash_screen
[旁白]她念出名字的瞬间，尖锐的耳鸣刺穿了我的脑袋。声音明明近在咫尺，我却一个字也没能听清。
[主角]（怎么回事？这是系统在妨碍我调查吗？）
→ NPC观念更新: 刘宇
→ 跳转：ch4_roster_converge

### [地图]对照座位调查
场景ID：ch4_roster_observe

地图：classroom
出生点：spawn_spawn_132
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
冻结玩家：是
NPC：
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back, 位置: spawn_spawn_127
  - id: npc_classmate, 名字: 同学A, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_female1_frames\npc_female1_frames_sit_back, 位置: spawn_spawn_146
  - id: npc_classmate_2, 名字: 同学B, 精灵:G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_male_frames\npc_male _frames_sit_back, 位置: spawn_spawn_126
[旁白]我没有立刻开口询问，而是借着整理作业的动作，逐一核对座位与花名册。
[旁白]四十一个名字，四十张在我眼中正常使用的桌椅，以及一张所有人都会自然绕开的空座位。
[主角]（似乎只有我不能看见“他”。而在NPC们眼中，那里坐着一个活生生的人。）
→ 音效: tinnitus (once)
[旁白]我再次试图默念那三个字，耳鸣立刻从脑海深处响起，像某种温柔却危险的警告。
[主角]（怎么回事？这是系统在妨碍我调查吗？）
→ NPC观念更新: 刘宇
→ 跳转：ch4_roster_converge

### [AI片段]用花名册试探刘宇
场景ID：ch4_roster_test_liuyu

地图：classroom
出生点：spawn_spawn_132
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
玩家动作：
  从: spawn_spawn_132 → 经由: spawn_spawn_246, spawn_spawn_252, spawn_spawn_250 → 移动至: spawn_spawn_247 → 面朝: 左 → 冻结玩家：是
NPC：
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back, 位置: spawn_spawn_127
  - id: npc_classmate, 名字: 同学A, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_female1_frames\npc_female1_frames_sit_back, 位置: spawn_spawn_146
  - id: npc_classmate_2, 名字: 同学B, 精灵:G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\npc_male_frames\npc_male _frames_sit_back, 位置: spawn_spawn_126
背景：早晨教室，刘宇正在收作业，其他学生在场
参与角色：主角, 刘宇, 同学A, 同学B
AI提示：根据玩家此前表现生成一段4～8行剧本编码格式片段。主角没有公开提问，而是把花名册异常位置推给刘宇看。
        输出格式：
        - 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]、[NPC:同学A]、[NPC:同学B]。
        - 允许使用 NPC动作，但不要生成新选项。
        - 不要生成跳转，片段结束后由固定流程跳转。
        固定事实：刘宇知道主角无法读取那个名字，但不能说出名字、身份或原因。
        根据刘宇对主角当前印象回应：
        - 若主角此前表现谨慎且愿意合作，刘宇用玩笑掩饰，提醒“有些东西看不清就别硬看”，并认可主角的默契。
        - 若主角此前拒绝合作或表现鲁莽，刘宇装作没看懂，只用眼神警告主角别在教室公开调查。
        - 不得提供学校根本规则，不得承认自己受系统控制，扮演好主角同学的角色。
→ NPC观念更新: 刘宇
→ 对话结束后：跳转 ch4_roster_converge

### [CG]花名册结论
场景ID：ch4_roster_converge

图片：无
[旁白]无论通过视觉、语言还是他人的反应，我都无法知道第四十一个学生是谁。
[主角]（那个人，会是我吗？）
[旁白]我把花名册收进抽屉。这件事之后再查吧。
→ 设置flag: ch4_roster_anomaly_found
→ 跳转：ch4_class_montage

---

## 三、对玩家有利的惩罚

### [CG]前三节课
场景ID：ch4_class_montage

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：fade_in
[旁白]前三节课风平浪静地过去了。
[旁白]期间没有学生主动回答问题。老师不断重复讲题、做题、对答案，再讲题。所有人都在认真忍受，像一群被卡在同一分钟里的钟表。
[主角]（四十个活人沉默得像四十具尸体。啊，令人讨厌的氛围。）
→ 跳转：ch4_physics_observe

### [地图]物理课观察
场景ID：ch4_physics_observe

地图：classroom
出生点：spawn_spawn_132
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
冻结玩家：是
NPC：
  - id: npc_teacher_li, 名字: 李老师, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\teacher_frames\teacher_frames_stand_front, 位置: spawn_spawn_157
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back, 位置: spawn_spawn_127
  - id: npc_zhouqirui, 名字: 周骐瑞, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\zqr_frames\zqr_frames_sit_back, 位置: spawn_spawn_117
座位填充：
  所有座位出生点：spawn_spawn_115～spawn_spawn_155
  已占用座位：主角 spawn_spawn_132, 刘宇 spawn_spawn_127, 周骐瑞 spawn_spawn_117
  保持空位：spawn_spawn_145
  非座位路径点/讲台点：spawn_spawn_156, spawn_spawn_157, spawn_spawn_246, spawn_spawn_247, spawn_spawn_248, spawn_spawn_249, spawn_spawn_250, spawn_spawn_251, spawn_spawn_252, spawn_spawn_253
  其余座位：随机用 npc_female1_frames_sit_back / npc_male_frames_sit_back 填充
[旁白]第四节是物理课。李老师严格、古板，尤其擅长用带有人身攻击性的批评摧毁学生的自信。
[旁白]反常的是，在她的威压之下，反而有不少学生主动举手，故意回答错误。
[NPC:李老师]这么简单的问题都不会？你们到底有没有认真听课？拿这种状态去高考吗？
[旁白]被骂的学生低下头，神情却悄悄放松下来。没有举手的人身子坐得笔直，仿佛一堵危墙，那双浑浊的眼空洞地盯着讲台。
[主角]（能通过选拔进入这个班的，除了被驯化的异类，没有傻子。而他们不惜被骂也要获得的东西，是老师的惩罚。）


→ 选项：过了这座山就没了这家店，抓住机会try一下
    AI标签：果敢, 勇敢, 现实判断精准, 机智
    NPC目睹：周骐瑞, 刘宇
    设置flag: ch4_lunch_punished
    跳转：ch4_physics_wrong_answer

→ 选项：再加上一个我，老师不得气疯了，她要是把气全撒在我身上那我必死无疑啊
    AI标签：谨慎, 自我保护, 犹豫, 胆小
    NPC目睹：周骐瑞, 刘宇
    设置flag: ch4_lunch_not_punished
    跳转：ch4_physics_hold_back

### [地图]故意答错
场景ID：ch4_physics_wrong_answer

地图：classroom
→ 玩家状态: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_back
冻结玩家：是
[主角说]老师，我认为答案是……
[旁白]我给出了一个听起来经过思考、实际上错得恰到好处的答案。
[NPC:李老师]错得离谱！下课后给我好好反省！
→ 玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
[旁白]她骂完便继续讲课，熟练得像完成了一项每日任务。
[主角]（好人机的骂人方式……）
[旁白]之后周骐瑞也在李老师抛出问题时主动举手，平静地给出了错误答案。被骂之后，他甚至没有皱一下眉。
→ 跳转：ch4_lunch_punishment_reveal

### [地图]保持观察
场景ID：ch4_physics_hold_back

地图：classroom
冻结玩家：是
[旁白]我没有举手。未知的惩罚可能是出口，也可能是另一层陷阱。
[旁白]之后周骐瑞也在李老师抛出问题时主动举手，平静地给出了错误答案。被骂之后，他甚至没有皱一下眉。
[主角]（看来李老师给的确实不是惩罚，而是“奖励”。）
→ 跳转：ch4_lunch_punishment_reveal

### [CG]午饭惩罚公布
场景ID：ch4_lunch_punishment_reveal
图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：fade_in
[旁白]到了午饭时间，物理课代表拿了张名单，念了一遍，然后说，
[NPC:物理课代表]名单上的同学课上回答问题错误，受到的惩罚是——不准吃午饭。
[主角]（我的天，这个惩罚好啊。）

条件：ch4_lunch_punished
[旁白]我没忍住咧嘴笑了起来。周围几名同学用一种难以理解的眼神看着我。
→ 效果: flash_screen
[旁白]午餐时间充裕，吃完自备的干粮之后，我把目标转向了和我一样被罚不吃午饭的周骐瑞。
→ 设置flag: ch4_food_escape_confirmed
→ 跳转：ch4_zhou_lunch_approach

条件：ch4_lunch_not_punished
[旁白]答案已经确认，但我没有获得免除午餐的资格。现在我必须在“不许浪费”的规则下，找到另一条处理食物的路。
[主角]（要不试着问问周骐瑞？）
[旁白]我正想起身去找他，刘宇却把一盒饭递给了我。
[主角]（……）
[NPC:刘宇]你这什么表情，哥们我都帮你拿饭了，你还不满什么？真叫人伤心，呜呜呜~
[主角]（他什么意思？）
[旁白]硬生生把洪水般的愤怒吞入腹中，我的身体像吞了刀子一样传来一阵剧痛，接着不受控制地颤抖起来。\n\n吃了会怎样？会立即死掉？还是会逐渐疯掉？但唯一能确定的是，刘宇明知道副本中的食物有问题，却为了自己的安全，把风险转嫁到我身上。\n\n我之前居然还天真地以为他是我记忆中的那个刘宇，真是好笑。\n\n这里可是死亡游戏，我的死活对他们来说本身就不算什么。
[主角]（我可不能就这样坐以待毙。）

→ 选项：教室规则上写过，教室内不能浪费食物，那么教室外呢？
    AI标签：规则推理, 冒险验证, 独立行动
    NPC目睹：刘宇, 周骐瑞
    设置flag: ch4_lunch_test_outside
    跳转：ch4_lunch_outside_test

→ 选项：刘宇，你想杀了我？那就别怪我杀了你
    AI标签：冲动, 攻击性, 低信任, 极端自保
    NPC目睹：刘宇, 周骐瑞
    设置flag: ch4_attacked_liuyu
    跳转：ch4_lunch_attack_death

→ 选项：我不需要。你放回去，我一会自己去拿饭，现在我还不饿
    AI标签：克制, 谨慎拒绝, 保持体面, 自我保护
    NPC目睹：刘宇, 周骐瑞
    设置flag: ch4_lunch_refused_liuyu
    跳转：ch4_lunch_refuse

→ 选项：你怎么不给周骐瑞，人家也没饭吃，莫非你暗恋我？我可不是男同
    AI标签：幽默化解, 试探关系, 情绪调节
    NPC目睹：刘宇, 周骐瑞
    设置flag: ch4_lunch_tease_liuyu
    跳转：ch4_lunch_tease

### [CG]把盒饭带出教室
场景ID：ch4_lunch_outside_test

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：fade_in
[旁白]我接过盒饭，起身走向教室门口。既然规则特意强调“教室内不能浪费食物”，那么门外或许就是漏洞。
[NPC:刘宇]你要去哪？
[主角说]教室里闷得慌。吃饭总得找个空气好的地方吧。
[旁白]我刚跨过门槛，走廊里所有正在活动的学生同时停下脚步，齐刷刷地看向我手中的盒饭。\n\n没有警报，也没有老师阻拦。越是如此，我越不敢继续向前。
[旁白]强烈的直觉告诉我，只要我再往前迈出一步，就一定会死。
[主角]（教室规则只管教室，但这不代表教室外没有更危险的规则。违反一条规则还可以拿被动技能抵消，要是违反了两条呢？拿一条已知规则，去赌其他未知规则的边界，未免太蠢了。）
[旁白]我退回教室。走廊的人们重新恢复流动，仿佛刚才只是我的错觉。\n\n回过神来，我早已被吓出了一身冷汗。\n\n我前所未有地感觉到死亡离我如此之近。
[旁白]还没等我缓过来，刘宇就拍了拍我的肩膀，轻笑道，
[NPC:刘宇]嗯？不是说教室闷得慌吗？怎么又晃回来了？
[旁白]我转过头，有些幽怨地看着对方的笑脸，他那表情好像在看一只马戏团的猴子。\n\n之前的愤怒又涌了上来，这次还夹杂着更多的委屈。\n\n我就忍着这些负面情绪默默盯着他，不想说任何一句话。
[主角]（不能在NPC面前暴露更多破绽了，我无论如何都不能展现脆弱的一面。）
[NPC:刘宇]哦吼，你生气了？
[主角说]……
[NPC:刘宇]诶呀就是啊都怪那家伙平时对我们俩爱答不理，找到了比学校饭菜更好吃的东西都不告诉我们。
[旁白]他借着按住我肩膀的手把我拉回了教室，带着我把目光移向了另一处。
[旁白]是周骐瑞。
→ NPC观念更新: 刘宇
→ 跳转：ch4_zhou_lunch_approach

### [CG]攻击刘宇·死亡
场景ID：ch4_lunch_attack_death

图片：空（黑屏）
[旁白]愤怒先于理智行动。我猛地站起身，抓起桌上的金属水杯，朝刘宇的太阳穴砸去。
→ 效果: flash_red（待扩展）
[旁白]水杯停在距离他额头不到一寸的位置。\n\n不是刘宇挡住了我。我的手臂被某种看不见的力量固定在半空，连指尖都无法移动。
[NPC:刘宇]……你冷静一点。
[旁白]教室里的交谈声消失了。所有同学同时转过头，用同一种失望而悲伤的眼神看着我。
→ 音效: tinnitus (once)
[NPC:系统]技能“违规提醒”正在发动。
[旁白]空气扼住我的咽喉，这一次力道相当大。
[旁白]哐当——\n\n手中的水杯掉在了地上，水洒了一地，甚至还泼到了其他同学的桌上。
[NPC:系统]违反两条规则，“违规提醒”失效。
[主角]（我又违反什么规则了？这条规则……我根本不知道是什么！）
[旁白]下一秒，握住水杯的手从指尖开始变得透明。没有鲜血，也没有疼痛，只有身体的一部分被世界迅速遗忘的空虚感。\n\n真是残酷又温柔的死法。\n\n迷离之际，我居然诡异地感到了一丝解脱。
[主角]（终于可以解脱了。）
[旁白]但是——
[主角说]咳……我果然……
[旁白]我想活下去。
[NPC:刘宇]我知道。
[NPC:刘宇]我会记住你的，第158963号牺牲品。
[NPC:刘宇]对不起。
[NPC:刘宇]你不适合活下去。
[旁白]他的脸上浮现出了一种我根本不可能在这张脸上看到的表情——难以言喻的痛苦、水面之下的悲怆、因深感歉意而坚定选择继续愧疚下去的决绝。
[旁白]刘宇伸手想抓住我，却只穿过了一片逐渐消散的轮廓。\n\n直到最后一刻我才明白，刘宇递来的并不是一份必须吃掉的午饭，而是一次看我会不会开口求助的试探。\n\n而我把试探当成了谋杀，又用真正的杀意回应了它。\n\n我不是被刘宇害死了，而是被我自己的恶意害死了。
→ 跳转：title_screen

### [CG]拒绝刘宇的盒饭
场景ID：ch4_lunch_refuse

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：fade_in
[旁白]他一脸无辜，
[NPC:刘宇]放不回去。
[主角说]为什么？
[NPC:刘宇]班长要负责确认每个不受罚的人都领到午饭。这是我的职责所在，我可是爱岗敬业、根正苗红的社会主义三好少年。
[旁白]他表面上说得坦然，其实是在告诉我他必须这么做。\n\n必须这么做的原因是什么呢？可能是规则所迫，也可能是他为了掩盖一个谎言而编织了另一个谎言。
[主角]（如果他没有骗我，那么无论谁把饭拿来，只要我没有获得惩罚，这一盒饭最终都会属于我。）
[NPC:刘宇]不过嘛，你要是不想吃也可以。
[主角说]？
[NPC:刘宇]哝。
[旁白]他朝周骐瑞的方向怒了努嘴。
→ NPC观念更新: 刘宇
→ 跳转：ch4_zhou_lunch_approach

### [CG]用玩笑试探刘宇
场景ID：ch4_lunch_tease

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：fade_in
[NPC:刘宇]周骐瑞被罚不准吃饭可是稀罕事，我可不能便宜了他。
[旁白]周骐瑞忽然打了个喷嚏，抬头看了我们一眼，又面无表情地低下头，无视了两个打哑谜的蠢货。
[NPC:刘宇]况且，这盒饭本来就是你的，你不能忘了拿。
[旁白]我皱了皱眉，
[主角]（什么意思？合着我不拿饭也算浪费？）
[旁白]见我似乎听懂了言外之意，刘宇又恢复了那副玩味的表情。
[NPC:刘宇]还有啊，你放心，我择偶标准没这么低。哪怕我真的是男同，也不会找你这样的。
[主角说]你骂谁呢？嫌弃我还亲自给我送饭，服务挺周到啊。
[NPC:刘宇]毕竟兢兢业业的班长要关爱每一个同学。
[主角说]你下次去关心一下周骐瑞吧。
[NPC:刘宇]比起我的关心，他可能更想要你的关心呢。
[旁白]他说着，朝周骐瑞的方向看了一眼。
→ NPC观念更新: 刘宇
→ 跳转：ch4_zhou_lunch_approach

---

## 四、周骐瑞的是非问答

> 导演说明：
> - 周骐瑞是“行动型知情者”，不会主动照顾主角，也厌恶没有边界的追问。
> - 固定最低线索：大部分副本内食物会让人失去自我；针对学校供应的盒饭，如果吃不属于自己的食物不会有事；除惩罚外存在其他处理方法；周骐瑞会参加周六活动。
> - AI只调整他的态度、回答的完整度，以及是否额外提醒晚餐处理时机。

### [地图]午休寻找周骐瑞
场景ID：ch4_zhou_lunch_approach

地图：classroom
出生点：spawn_spawn_246
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_right
冻结玩家：否
NPC：
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back, 位置: spawn_spawn_127
  - id: npc_zhouqirui, 名字: 周骐瑞, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\zqr_frames\zqr_frames_sit_back, 位置: spawn_spawn_117
座位填充：
  所有座位出生点：spawn_spawn_115～spawn_spawn_155
  已占用座位：刘宇 spawn_spawn_127, 周骐瑞 spawn_spawn_117
  保持空位：spawn_spawn_145
  非座位路径点/讲台点：spawn_spawn_156, spawn_spawn_157, spawn_spawn_246, spawn_spawn_247, spawn_spawn_248, spawn_spawn_249, spawn_spawn_250, spawn_spawn_251, spawn_spawn_252, spawn_spawn_253
  其余座位：随机用 npc_female1_frames_sit_back / npc_male_frames_sit_back 填充

@trigger_247
  条件：ch4_lunch_punished
  提示文字：E询问周骐瑞
  触发：[对话]
    [NPC:周骐瑞]怎么，有事找我？
    → 跳转：ch4_zhou_question_method

@trigger_247
  条件：ch4_lunch_not_punished
  提示文字：E询问周骐瑞
  触发：[对话]
    [NPC:周骐瑞]怎么，有事找我？
    → 跳转：ch4_zhou_help

@trigger_249
  提示文字：E刘宇
  触发：[对话]
    [NPC:刘宇]哦？小叶同学这是要求我帮忙吗？先叫一声爸爸听听。
    [主角说]是我贱，我就不该找你。

@trigger_248
  提示文字：E坐下
  触发：[对话]
    [主角]（事情还没处理。）

@trigger_246
  提示文字：E空座位
  触发：[对话]
    [主角]（现在不是调查这位透明人同学的时候。）

@trigger_251
  提示文字：E标语
  触发：[对话]
    [主角]（让人很不舒服的标语。学生真学死了学校又不得了。）

@trigger_250
  提示文字：E公告栏
  触发：[对话]
    [主角]（这周小班辅导的名单。没有我，真可惜。）

### [地图]向周骐瑞求助
场景ID：ch4_zhou_help
冻结主角：是

[旁白]他的目光淡淡地扫向我，没有一丝惊愕，似乎早就料到我会来找他。

→ 选项：周骐瑞，你饿不饿，要不要吃点？
    AI标签：委婉求助, 尊重边界, 社交策略
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_help_polite
    跳转：ch4_zhou_fixed_help

→ 选项：周骐瑞，你孤单坏了吧？我来社区送温暖了。
    AI标签：幽默求助, 情绪调节, 试探关系
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_help_humorous
    跳转：ch4_zhou_fixed_help

→ 选项：那个，周骐瑞，刘宇让我找你……
    AI标签：坦诚求助, 依赖合作, 暴露窘迫
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_help_referred
    跳转：ch4_zhou_fixed_help

### [AI片段]周骐瑞的帮助
场景ID：ch4_zhou_fixed_help

背景：午休教室，主角拿着属于自己的盒饭向被罚不准吃午饭的周骐瑞求助
参与角色：主角, 周骐瑞
AI提示：根据主角请求帮助的方式、此前的调查表现与周骐瑞对主角的印象，生成一段4～8行剧本编码格式片段。
        输出格式：
        - 允许使用 [旁白]、[主角]、[主角说]、[NPC:周骐瑞]。
        - 允许使用 NPC动作，但不要生成新选项。
        - 不要生成跳转，片段结束后由固定流程跳转。
        固定事实：
        - 周骐瑞知道学校盒饭的危险，也知道吃“不属于自己”的盒饭不会触发食物的侵蚀效果。
        - 周骐瑞被罚不准吃自己的午饭，但可以替主角吃掉主角的盒饭。
        - 周骐瑞愿意收下盒饭，但不会热情安慰主角，也不会直接解释完整规则。
        - 回应结束时，周骐瑞必须自然地接过盒饭并开始吃。
        动态表现：
        - 委婉求助：周骐瑞看穿主角目的，只说“给我吧”或同等含义，认可其懂得求助。
        - 幽默求助：周骐瑞可以冷淡吐槽一句，但会配合主角化解尴尬。
        - 坦诚提及刘宇：周骐瑞指出刘宇又把麻烦推给自己，但不拒绝帮助。
        - 高现实判断/尊重边界：可额外提醒“只有这盒可以给我，别的不妥”。
        - 高鲁莽/低信任：明确警告主角，不要把一次成功当成通用规则。
        禁止直接解释食物侵蚀原理，禁止透露学校根本规则，禁止替主角回答后续问题。
→ NPC观念更新: 周骐瑞
→ 对话结束后：跳转 ch4_zhou_help_result

### [地图]主角回应
场景ID：ch4_zhou_help_result

条件：ch4_lunch_not_punished
[主角]（他就这么自然地收下了？）
[旁白]周骐瑞也不客气，拆开一次性筷子就吃了起来。
[主角]（副本内的食物不是会侵蚀心智吗？但周骐瑞却毫不犹豫地吃了我的盒饭。是因为他知道这盒饭对他来说没有什么debuff吗？）
[旁白]我没有立刻离开。既然周骐瑞愿意帮我处理盒饭，或许也愿意回答几个不触碰规则的问题。
→ 设置flag: ch4_zhou_help_received
→ 设置flag: ch4_lunch_box_given_to_zhou
→ 设置flag: ch4_food_ownership_clue_found
→ 跳转：ch4_zhou_question_method

### [地图]选择提问方式
场景ID：ch4_zhou_question_method

[主角]（我还需要尽可能多地打探情报。NPC也受规则限制，他可能无法直接回答。）

→ 选项：我有个问题想问你。但也许你无法直接回答。因此，我会用提问的方式找到我想要的答案，你只用回答是或否
    AI标签：尊重边界, 逻辑推理, 谨慎合作
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_respectful
    跳转：ch4_zhou_respectful_intro

→ 选项：周骐瑞，能稍微给我透露一些学校区域探索的方向吗？
    AI标签：坦诚求助, 信任, 暴露脆弱
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_frank
    跳转：ch4_zhou_frank_intro

→ 选项：瞧你饿得——你何必故意答错问题遭这个罪呢？你肯定知道那道物理题的正确答案是什么
    AI标签：试探, 自我保护, 控制信息, 机智
    NPC目睹：周骐瑞
    设置flag: ch4_zhou_testing
    跳转：ch4_zhou_testing_intro

### [地图]尊重边界的提问
场景ID：ch4_zhou_respectful_intro

地图：classroom
冻结玩家：是

[主角说]我有个问题想问你。但也许你无法直接回答。因此，我会用提问的方式找到我想要的答案。
[主角说]你只用回答是或否。
[旁白]周骐瑞咽下嘴里的饭，抬眼看了我一下。
[NPC:周骐瑞]可以。
[主角]（很好。至少他愿意配合这种边界明确的问法。）
→ 跳转：ch4_zhou_fixed_questions

### [地图]坦诚求助的提问
场景ID：ch4_zhou_frank_intro

地图：classroom
冻结玩家：是

[主角说]周骐瑞，能稍微给我透露一些学校区域探索的方向吗？
[旁白]他没有立刻回答，只是把筷子放下，视线扫过教室里埋头吃饭的学生。
[NPC:周骐瑞]方向这种东西，说出来就不是方向了。
[主角说]那我换一种问法。你不用主动透露，我问，你只回答是或否。
[NPC:周骐瑞]这样可以。
[主角]（他拒绝了直接指路，但接受了有限问答。规则边界比我想象中更窄。）
→ 跳转：ch4_zhou_fixed_questions

### [地图]试探式提问
场景ID：ch4_zhou_testing_intro

地图：classroom
冻结玩家：是

[主角说]瞧你饿得——你何必故意答错问题遭这个罪呢？你肯定知道那道物理题的正确答案是什么。
[旁白]周骐瑞掀起眼皮，面无表情地看着我。
[NPC:周骐瑞]你想问的是“为什么”，不是“是不是”。
[主角说]行，那我不问为什么。我问几个是非题，你能答就答，不能答就沉默。
[NPC:周骐瑞]可以。别绕太远。
[主角]（他不喜欢被试探，但并不排斥这种低风险的信息交换。）
→ 跳转：ch4_zhou_fixed_questions

### [地图]周骐瑞固定问答
场景ID：ch4_zhou_fixed_questions

条件：ch4_lunch_box_given_to_zhou
[主角说]你吃这盒饭不会受到影响，是因为它不属于你，对吗？
[NPC:周骐瑞]是。
[主角]（盒饭的归属能够改变食用后果。但这不代表副本内所有食物都遵循相同规则。）
→ 跳转：ch4_zhou_common_questions

条件：ch4_lunch_punished
→ 跳转：ch4_zhou_common_questions

### [地图]周骐瑞共同问答
场景ID：ch4_zhou_common_questions

[主角说]大部分副本里的食物，会让人失去自我意识，对吗？
[NPC:周骐瑞]是。
[主角说]除了通过惩罚免除午晚餐，还有其他处理方法？
[NPC:周骐瑞]是。
[主角说]你打算参加这周六的试胆活动？
[NPC:周骐瑞]是。
[主角]（看来这个活动并不是副本单独为我开放的某种关卡。）
→ 跳转：ch4_zhou_dynamic_response

### [AI片段]周骐瑞判断主角
场景ID：ch4_zhou_dynamic_response

背景：午饭时教室，周围学生安静吃饭
参与角色：主角, 周骐瑞
AI提示：根据玩家本章的调查方式、物理课选择与提问方式，生成一段4～8行剧本编码格式片段，表现周骐瑞对主角的判断。
        输出格式：
        - 允许使用 [旁白]、[主角]、[主角说]、[NPC:周骐瑞]。
        - 允许使用 NPC动作，但不要生成新选项。
        - 不要生成跳转，片段结束后由固定流程跳转。
        固定事实不能改变：大部分副本食物危险；主角的学校盒饭可由不属于它的人安全食用；存在其他处理方法；周骐瑞参加周六活动。
        动态回应范围：
        - 若周骐瑞替主角吃了盒饭：认可主角最终愿意开口求助，但提醒“别把别人愿意帮忙当成理所当然”。
        - 高现实判断/尊重边界：认可主角会利用规则，可额外提醒“晚餐动作要快，去晚了就没位置处理”。
        - 高坦诚信任：不表现亲近，但可明确建议主角去找刘宇，认为刘宇会处理。
        - 高试探/低信任：只说“你已经得到答案了”，不提供额外帮助。
        - 高鲁莽/低现实判断：警告主角不要把所有漏洞都当作安全出口。
        不得解释学校根本规则，不得透露周六活动具体内容。
→ NPC观念更新: 周骐瑞
→ 对话结束后：跳转 ch4_art_class_start

---

## 五、美术课：自由之后画什么

> 导演说明：
> - 王老师必须说出“做你自己”这一核心命题，但他对主角“虚伪”的判断不应机械固定。
> - AI根据玩家画作与既往人格画像生成评价；评价可以不同，但不能直接给出快乐或通关答案。
> - 王老师对主角的印象会影响第5章交易：欣赏真诚者、警惕表演者、刺激服从者。

### [地图]美术课开始
场景ID：ch4_art_class_start

地图：classroom
出生点：spawn_spawn_132
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_sit_back
冻结玩家：是
NPC：
  - id: npc_wang_teacher, 名字: 美术老师, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\wql_frames\wql_frames_stand_front, 位置: spawn_spawn_157
  - id: npc_liuyu, 名字: 刘宇, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_sit_back, 位置: spawn_spawn_127
  - id: npc_zhouqirui, 名字: 周骐瑞, 精灵: G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\zqr_frames\zqr_frames_sit_back, 位置: spawn_spawn_117
座位填充：
  所有座位出生点：spawn_spawn_115～spawn_spawn_155
  已占用座位：主角 spawn_spawn_132, 刘宇 spawn_spawn_127, 周骐瑞 spawn_spawn_117
  保持空位：spawn_spawn_145
  非座位路径点/讲台点：spawn_spawn_156, spawn_spawn_157, spawn_spawn_246, spawn_spawn_247, spawn_spawn_248, spawn_spawn_249, spawn_spawn_250, spawn_spawn_251, spawn_spawn_252, spawn_spawn_253
  其余座位：随机用 npc_female1_frames_sit_back / npc_male_frames_sit_back 填充

[旁白]周一下午有一节美术课。一位将近七十岁的老人步伐稳健地走进教室，澄澈锐利的眼睛扫过每个人的脸。
[NPC:美术老师]把桌上的书都收起来吧，什么都别放。
[旁白]窸窸窣窣的收拾声响起，我望着自己本就空荡荡的书桌，一时感到有些尴尬。\n\n片刻后同学们又像雕塑一样端坐着，好像在等待着老师发布新的标准答案。\n\n之后再一头扎进疯狂竞争的泥潭里。
[NPC:美术老师]这位同学，作业这么急着写吗？
[旁白]那个偷偷写作业的同学不甘心地收起了作业。\n\n老师满意地点点头，
[NPC:美术老师]那么我们正式上课吧。
[NPC:美术老师]这节课你们需要完成一幅画。画什么都可以，不必完全画完，我也不会夸奖或批评任何人。
[NPC:美术老师]在我的课上没有成绩和排名。你们只需要成为你们自己就好。
[旁白]短暂的自由落下来，陌生得让大家不知所措，教室里迟迟没有一个人动笔。\n\n看到这副场景，我苦笑了一下，
[主角]（当一个人习惯了按别人的答案活着，连自由也会变成一道不会做的题。）
[主角]（那就我来当这只出头鸟吧。至少，我曾经是这个制度下的幸存者。）
[旁白]我唰唰几笔就画完了一幅极其抽象的画，然后果断地把它举起来。
[主角说]老师，我画完了。
[旁白]我附近的同学都惊恐地盯着我。
[旁白]\n\n我的画中——

→ 跳转：ch4_choose_painting

### [地图]选择画作
场景ID：ch4_choose_painting

→ 选项：一个四分五裂的傀儡被囚禁于四分五裂的监牢中，监牢外是一套崭新的桌椅，周围萦绕着花瓣和蝴蝶
    AI标签：策略表达, 真相欲望, 表演性反抗
    NPC目睹：王沁林, 刘宇, 周骐瑞
    设置flag: ch4_painting_puppet
    跳转：ch4_show_painting

→ 选项：一个矮小的火柴人在草地上自由奔跑，蓝天、白云、太阳，好像都一起回到了最初的美好
    AI标签：真诚表达, 快乐感知, 暴露自我
    NPC目睹：王沁林, 刘宇, 周骐瑞
    设置flag: ch4_painting_memory
    跳转：ch4_show_painting

→ 选项：一张方方正正的课桌摆在画纸中央，很明显是用借用尺子画的线条
    AI标签：谨慎服从, 自我保护, 怀疑权威
    NPC目睹：王沁林, 刘宇, 周骐瑞
    设置flag: ch4_painting_safe
    跳转：ch4_show_painting

### [地图]展示画作
场景ID：ch4_show_painting

地图：classroom
冻结玩家：是
NPC动作：
  npc_wang_teacher → 从: spawn_spawn_157 → 经由: spawn_spawn_249 → 移动至: spawn_spawn_246 → 面朝: 主角
[旁白]老师拿起我的画饶有兴致地端详起来。
[NPC:美术老师]哦？这位同学思维很活跃嘛。
→ 跳转：ch4_wang_dynamic_judgment

### [AI片段]王老师评价画作
场景ID：ch4_wang_dynamic_judgment

背景：美术课教室，王老师站在主角桌旁，全班能够听见部分对话
参与角色：主角, 王沁林
AI提示：根据玩家选择的画作与七维人格画像，生成一段5～10行剧本编码格式片段，表现王老师对画作和主角状态的评价。
        输出格式：
        - 允许使用 [旁白]、[主角]、[主角说]、[NPC:美术老师]。
        - 允许使用 NPC动作，但不要生成新选项。
        - 不要生成跳转，片段结束后由固定流程跳转。
        必须遵守：
        - 王老师欣赏矛盾与主体性，但不会无条件赞扬。
        - 必须自然引出“做你自己”这一命题。
        - 若画傀儡监牢：指出画面“混乱中有决绝”，同时指出它可能是为了套取通关副本答案而画，因此“和现在的你一样虚伪”。
        - 若画真实回忆：承认画面普通却真实，追问主角为何认为快乐必须足够深刻才值得被画。
        - 若画标准作品：指出技巧正确但画里没有人，询问主角是在观察老师，还是害怕自由。
        - 主角听到评价后要表示不解，但王老师不会告诉他，只会说“没关系，这不重要。我很欣赏你的画。”
        - 不能直接解释副本真相，不能直接给出快乐答案，不能替玩家定义真实自我。
→ NPC观念更新: 王沁林
→ 对话结束后：跳转 ch4_wang_question_choice

### [地图]向王老师追问
场景ID：ch4_wang_question_choice

[主角]（呵，不想告诉我啊，那我换个问题。）

→ 选项：那您能否告诉我，这个人偶怎么才能坐到那张椅子上？
    AI标签：隐喻追问, 真相欲望, 保持距离
    NPC目睹：王沁林
    设置flag: ch4_wang_metaphor
    跳转：ch4_wang_core_reply

→ 选项：那您能否告诉我，我该怎么在这种环境下成为“他”？
    AI标签：坦诚, 自我认知, 承担脆弱
    NPC目睹：王沁林
    设置flag: ch4_wang_honest
    跳转：ch4_wang_core_reply

→ 选项：您确定，如果我画的是一幅真实的画，在这样的环境下，我有机会让画变成现实，而不是把自己变成时代的牺牲品？
    AI标签：克制, 自我保护, 延迟判断
    NPC目睹：王沁林
    设置flag: ch4_wang_withhold
    跳转：ch4_wang_core_reply

### [CG]王老师的核心回应
场景ID：ch4_wang_core_reply

条件：ch4_wang_metaphor
[旁白]老师并没有立即回答，反而平静地注视着我的眼睛。他的眼睛仿佛有一种穿透人心的力量，让我感觉我所有的伪装和谎言都被他识破了。
[NPC:美术老师]你早就有能力坐到那张椅子上了，不是吗？
[旁白]该死的谜语人。啊不，都怪我一开始就用这幅抽象画跟他打哑迷了。
[主角说]但我不知道该怎么办。这样的话，哪怕有能力也没有用。
[NPC:美术老师]所以啊，我一开始就已经说了——做你自己就好。

条件：ch4_wang_honest
[NPC:美术老师]只要你想，你随时都可以成为“他”。
[旁白]该死的谜语人。啊不，都怪我一开始就用这幅抽象画跟他打哑迷了。
[主角说]这不现实，我还要高考、还要对得起父母的期待、还要在社会上生存下来。
[主角说]成为他，我的处境会变得很危险。
[NPC:美术老师]所以啊，我一开始就已经说了——你已经知道答案了。

条件：ch4_wang_withhold
[NPC:美术老师]做自己不等于把命丢掉。若一个人只在安全时才承认自己，那份“自己”也未免太轻了。
[NPC:美术老师]至于什么时候该冒险，那是你的课题，不是我的答案。

[旁白]他的目光重新投向整个教室。
[NPC:美术老师]这是你们从生到死都应该放在首位的生命课题，孩子们。

条件：ch4_painting_puppet
[旁白]他重新看向我，
[NPC:美术老师]这位同学，你的这幅画和现在的你一样虚伪。
[旁白]我身形猛地一震。
[NPC:美术老师]这不是你真心画出来的画，这不是你心灵的投射。你对待世界的虚伪终会让你最后得到一个虚假的答案。
[旁白]我虚伪？是指我并没有融入这个副本吗？但我如果被副本同化了，我岂不是永远出不去了？\n\n不过，从副本NPC个人角度考虑，我的安危无足轻重。而且他似乎很笃定我非常需要他的指点。\n\n还有一种可能，他是指我对待这个世界的态度。\n\n我需要核实一下。\n\n我压低声音，
[主角说]您想让我去送死？
[旁白]他像是没听见我说的话似的，拍了拍我的肩膀，去看其他同学是画去了。\n\n狡猾的老狐狸，直接不给回答了。

条件：ch4_painting_safe
[旁白]他重新看向我，
[NPC:美术老师]这位同学，你的这幅画和现在的你一样虚伪。
[旁白]我身形猛地一震。
[NPC:美术老师]你把正确、干净、安全都摆在纸上，却唯独没有把自己摆进去。你不是不会画，你只是不肯承认自己在害怕。
[旁白]我虚伪？是指我并没有融入这个副本吗？但我如果被副本同化了，我岂不是永远出不去了？\n\n不过，从副本NPC个人角度考虑，我的安危无足轻重。而且他似乎很笃定我非常需要他的指点。\n\n还有一种可能，他是指我对待这个世界的态度。\n\n我需要核实一下。\n\n我压低声音，
[主角说]您想让我去送死？
[旁白]他像是没听见我说的话似的，拍了拍我的肩膀，去看其他同学是画去了。\n\n狡猾的老狐狸，直接不给回答了。

条件：ch4_painting_memory
[旁白]他重新看向我，目光比刚才柔和了一些。
[NPC:美术老师]这幅画很普通，但普通不等于廉价。能把真实的东西画出来，本身就已经很难得了。
[旁白]我一时分不清他是在评价画，还是在评价我这个人。
[NPC:美术老师]记住这种感觉。它不一定深刻，但它属于你。

[旁白]……
→ 设置flag: ch4_wang_noticed_player
→ 跳转：ch4_dinner_problem

---

## 六、晚餐：求助也是一种行动

### [CG]盒饭难题
场景ID：ch4_dinner_problem

图片：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\CG\教室\教室白天.png
效果：淡入
[旁白]下午没有物理课，真是可惜。
[旁白]我看着桌上的盒饭，比面对一道数学压轴题还要焦头烂额。
[主角]（从中午刘宇和周骐瑞对我的态度，以及美术老师的抛砖引玉来看，NPC们似乎知道我是参赛者，只不过他们愿意陪我演戏。）
[旁白]我神色漠然地看着出去领盒饭的同学。\n\n正巧看见刘宇拿着盒饭从我身边经过。我——

→ 选项：揪住刘宇衣角，“咳……你不会打算吃吧？”
    AI标签：主动求助, 信任, 放下面子, 有些可爱
    NPC目睹：刘宇
    设置flag: ch4_asked_liuyu_directly
    跳转：ch4_liuyu_food_response

→ 选项：叫住刘宇，问：“你现在是打算去处理晚饭对吧？”
    AI标签：合作提案, 现实判断, 保留主动权
    NPC目睹：刘宇
    设置flag: ch4_asked_liuyu_plan
    跳转：ch4_liuyu_food_response

→ 选项：记得走廊上有很多同学。他们会认为刘宇准备浪费食物吗？我要悄悄跟上，看他怎么能顺利逃过走廊同学的“死亡凝视”
    AI标签：独立行动, 怀疑, 自我保护
    NPC目睹：刘宇
    设置flag: ch4_followed_liuyu
    跳转：ch4_liuyu_food_response

### [AI片段]刘宇决定帮到什么程度
场景ID：ch4_liuyu_food_response

背景：晚餐时间的教室门口，学生陆续领取盒饭
参与角色：主角, 刘宇
AI提示：根据玩家午餐处理方式、对刘宇的信任程度与本章人格画像，生成一段5～9行剧本编码格式片段，表现刘宇判断主角是否值得进一步合作。
        输出格式：
        - 允许使用 [旁白]、[主角]、[主角说]、[NPC:刘宇]。
        - 允许使用 NPC动作，但不要生成新选项。
        - 不要生成跳转，片段结束后由固定流程跳转。
        固定主线：主角最终会得知厕所可以处理盒饭，并安全避开晚餐。但要想避开走廊学生的视线，除了身份是班委的学生可以独行，普通学生必须结伴而行。
        动态帮助等级：
        - 若午餐时主角曾向周骐瑞求助：刘宇认可主角听懂了自己的暗示，可调侃“这次终于知道直接找人了”。
        - 高信任且主动求助：刘宇嘴上嫌弃，实际带路并提醒动作要快。
        - 高现实判断且提出方案：刘宇确认方案，允许主角同行，并认可其推理。
        - 低信任或尾随：刘宇当场识破，要求主角自己说明目的；若主角此前表现不鲁莽，仍给出方向，但不主动照看。
        - 若玩家此前尊重周骐瑞边界或真诚面对王老师，可让刘宇注意到这种变化，但不能直接读取玩家内心。
        - 若选择了ch4_asked_liuyu_directly，先添加固定对话：
        [NPC:刘宇]你当我傻啊？我还有脑子呢。
        [主角说]那……你带带我呗。
        [NPC:刘宇]……
        [主角]（我相信人至贱则无敌。）
        不得让刘宇拒绝到导致主线中断，不得泄露学校根本规则。
→ NPC观念更新: 刘宇
→ 对话结束后：跳转 ch4_dispose_food

### [CG]厕所处理盒饭
场景ID：ch4_dispose_food

图片：无
[旁白]厕所里已经挤了不少人。没有人交谈，大家默契地把饭倒进隔间，再用水冲掉。
[主角说]就把饭倒里头就完事了？
[NPC:刘宇]不然你以为还能怎么样？
[主角说]这么简单粗暴，真是出乎预料。
[NPC:刘宇]这是没有办法的办法。幸好来得早，不然待会连给你倒饭的位置都没有。
[旁白]规则要求教室内“不许浪费”，却没有规定食物最后必须进入谁的胃里。
→ 设置flag: ch4_school_food_solution_found
→ 跳转：ch4_greenbelt_start

---

## 七、绿化带：合作已经开始

> 导演说明：
> - 本场景作为第4章的动态收束，也是第5章正式谈判的入口。
> - 刘宇必须传达三项固定信息：不要私自调查其他教室和办公室；教室规则不等于学校规则；学校规则无法靠普通搜索找到。
> - AI根据刘宇印象决定额外线索、语气和合作条件，不改变固定信息。

### [地图]前往绿化带
场景ID：ch4_greenbelt_start

地图：gate
出生点：spawn_spawn_166
玩家状态：G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\yps_frames\yps_frames_stand_left
冻结玩家：是
NPC：
  - id: npc_liuyu, 名字: 刘宇, 精灵: ly_frameG:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\sprites\frames\ly_frames\ly_frames_stand_left, 位置: spawn_spawn_166
[旁白]现在是十八点，离晚自习还有一个小时。
[旁白]刘宇像是看出了我心中所想，拉着我转身往教学楼外的绿化带走去。
[NPC:刘宇]来吧，到那里说。
NPC动作：
  npc_liuyu → 播放动画: walk_left → 移动至: spawn_spawn_179
  npc_liuyu → 播放动画: walk_up → 移动至: spawn_spawn_183
  npc_liuyu → 播放动画: walk_left → 移动至: spawn_spawn_164，面朝：right
主角动作：
  主角 → 播放动画: walk_left → 移动至: spawn_spawn_179
  主角 → 播放动画: walk_up → 移动至: spawn_spawn_183
  主角 → 播放动画: walk_left → 移动至: spawn_spawn_165
[旁白]灌木隔开了来往视线。我们在一张长椅上坐下，这里真是个谈话的好地方。
→ 跳转：ch4_liuyu_fixed_warning

### [地图]刘宇的固定警告
场景ID：ch4_liuyu_fixed_warning

[NPC:刘宇]你家的事还牵扯到了学校里？
[主角说]多少有一些。
[NPC:刘宇]那我劝你，不要私自调查我们教室之外的其他教室和办公室。
[主角说]这不太合理吧？这么大的学校，不探索难道坐以待毙？
[NPC:刘宇]你今天看到的是教室里的规则，不是学校里的规则。
[主角说]所以我才更应该找到学校规则啊。
[NPC:刘宇]太具体的我不能说。但我可以告诉你——你找不到学校的规则。
[主角说]你有什么证据？我都没开始找呢。
[NPC:刘宇]你想赶去送人头我也不拦你。
[主角说]……
[主角]（要知晓规则，就必须向NPC求助，然后受制于人。）
[旁白]我思考了一会，然后问他，
[主角说]你的意思是让我和你合作？
[NPC:刘宇]我们不是早就已经合作了吗？
[主角说]我什么时候……
[旁白]我突然想到了什么，话说到一半硬是把它咽回肚子里。\n\n刘宇忍不住坏笑起来。\n\n我忍住怒火，碍于确实需要他帮忙只能平静地控诉，
[主角说]你诓我。
[NPC:刘宇]这怎么能叫诓呢？你昨天不都承认你信任我了？
[主角说]现在不信任了。
[NPC:刘宇]诶，没爱了没爱了。
[旁白]这说的，好像真的关系跟我很好一样。
→ 设置flag: ch4_liuyu_cooperation_opened
→ 跳转：ch5_liuyu_negotiate
