import type { GameState } from "../types/game";

type NotebookCategory = "游戏内容" | "副本内容" | "规则内容";

interface NotebookEntry {
  id: string;
  category: NotebookCategory;
  title: string;
  lines: string[];
  unlocked: (state: GameState) => boolean;
}

interface Props {
  state: GameState;
  onClose: () => void;
}

const PROGRESS_ORDER = [
  "start",
  "ch2_game_start",
  "ch2_skill_info_panel",
  "ch2_dungeon_info_panel",
  "ch2_enter_bedroom",
  "ch2_plan_book_read",
  "ch2_breakfast_violation",
  "ch2_family_rules",
  "ch2_bathroom_rules",
  "ch2_kitchen_rules",
  "ch2_home_investigation_end",
  "ch2_enter_classroom",
  "ch3_classroom_entrance",
  "ch3_empty_seat_seen",
  "ch3_exam_begins",
  "ch3_class_count_question",
  "ch4_exploration_progress",
  "ch4_roster_test_liuyu",
  "ch4_physics_observe",
  "ch5_liuyu_negotiate",
  "ch5_class3_investigation",
  "ch6_root_rule_trigger",
  "ch7_active_skill_info",
  "ch7_rule_delete_success",
  "ch8_demo_ending",
];

function reached(state: GameState, sceneId: string): boolean {
  if (state.currentSceneId === sceneId) return true;
  const currentIndex = PROGRESS_ORDER.indexOf(state.currentSceneId);
  const targetIndex = PROGRESS_ORDER.indexOf(sceneId);
  return currentIndex >= 0 && targetIndex >= 0 && currentIndex >= targetIndex;
}

function hasChoice(state: GameState, choiceId: string): boolean {
  return state.choiceHistory.includes(choiceId);
}

const entries: NotebookEntry[] = [
  {
    id: "game_identity",
    category: "游戏内容",
    title: "参赛者与系统",
    lines: [
      "当前处于一场以副本为单位推进的比赛。",
      "系统会发布副本说明、技能说明和阶段性进度。",
      "系统给出的信息不一定完整，具体用法往往需要自行验证。",
    ],
    unlocked: state => reached(state, "ch2_game_start"),
  },
  {
    id: "game_skill_authority",
    category: "游戏内容",
    title: "技能：权威抵制",
    lines: [
      "初始技能名为“权威抵制”。",
      "使用方法与附加技能需要在副本中自行探索。",
      "已获得隐藏身份：规则破坏者。",
    ],
    unlocked: state => reached(state, "ch2_skill_info_panel"),
  },
  {
    id: "game_warning_skill",
    category: "游戏内容",
    title: "被动技能：违规提醒",
    lines: [
      "违反规则前后会出现窒息、强烈不适等身体警报。",
      "该技能可以争取纠错时间，但不能保证每次都能救命。",
      "思想方向也可能触发规则判定，不能只注意表面行为。",
    ],
    unlocked: state => !!state.flags.ch2_warning_skill_discovered || reached(state, "ch2_breakfast_violation"),
  },
  {
    id: "game_active_skill",
    category: "游戏内容",
    title: "主动技能：篡改规则",
    lines: [
      "主动技能可删除一条规则，但权限有限。",
      "单个任务中只能对一条规则使用；单个副本中只能使用一次。",
      "删除表层规则不一定能解除根本危机，必须判断规则层级。",
    ],
    unlocked: state => state.currentSceneId.startsWith("ch7_") || reached(state, "ch7_active_skill_info"),
  },
  {
    id: "dungeon_intro",
    category: "副本内容",
    title: "副本一：快乐小孩",
    lines: [
      "性质：单人角色扮演类副本。",
      "通关要求：在副本内存活一周，或达成任一成就。",
      "成就条件：洞察真相，证明你的快乐。",
      "逾期未通关或违反规则，均可能遭到杀身之祸。",
    ],
    unlocked: state => reached(state, "ch2_dungeon_info_panel"),
  },
  {
    id: "dungeon_role",
    category: "副本内容",
    title: "副本身份",
    lines: [
      "当前身份是一名高中生，生活区域包括家庭与学校。",
      "副本会要求主角维持“快乐小孩”或“好孩子”的叙事。",
      "外来物品与参赛者身份暴露都可能带来额外风险。",
    ],
    unlocked: state => reached(state, "ch2_enter_bedroom") || hasChoice(state, "ch2_hid_outsider_items"),
  },
  {
    id: "dungeon_family_area",
    category: "副本内容",
    title: "家庭区域",
    lines: [
      "家庭区域存在明确的生活规则，且和父母认知绑定。",
      "整洁、计划、孝顺、幸福等关键词都会影响规则判定。",
      "父母卧室、镜子、食物仍有待后续深入调查。",
    ],
    unlocked: state => !!state.flags.ch2_family_rules_found || reached(state, "ch2_home_investigation_end"),
  },
  {
    id: "dungeon_school_area",
    category: "副本内容",
    title: "学校区域",
    lines: [
      "学校区域与主角的高中记忆高度重合，但存在身份错位。",
      "记忆中自己的座位空着，班级人数却多出一人。",
      "学校规则更隐蔽，往往需要通过NPC反应和惩罚机制反推。",
    ],
    unlocked: state => reached(state, "ch3_class_count_question") || state.currentSceneId.startsWith("ch4_"),
  },
  {
    id: "rule_bedroom",
    category: "规则内容",
    title: "卧室与计划规则",
    lines: [
      "房间必须保持井井有条。",
      "需要严格遵守计划表，迟到、作业、成绩等也被写入规则。",
      "计划本既记录人生蓝图，也记录具体日程和规则痕迹。",
    ],
    unlocked: state => !!state.flags.ch2_bedroom_rules_found || reached(state, "ch2_plan_book_read"),
  },
  {
    id: "rule_family",
    category: "规则内容",
    title: "家庭公共规则",
    lines: [
      "我们是幸福的一家人，彼此关心、尊重、体谅。",
      "进入家庭成员个人房间必须敲门，得到允许后可进入。",
      "父母的一切被叙述为“为你好”，好孩子应诚实、善良、正直、勇敢。",
    ],
    unlocked: state => !!state.flags.ch2_family_rules_found,
  },
  {
    id: "rule_bathroom",
    category: "规则内容",
    title: "卫生间规则",
    lines: [
      "每天使用卫生间不超过四次。",
      "至少每周洗一次澡。",
      "非紧急情况，不要把手伸进镜子里。",
      "镜子规则可能存在措辞漏洞，但制造紧急情况本身也有风险。",
    ],
    unlocked: state => !!state.flags.ch2_bathroom_rules_found,
  },
  {
    id: "rule_kitchen",
    category: "规则内容",
    title: "厨房规则",
    lines: [
      "厨房内要保持整洁。",
      "母亲做的饭很美味，请尊重她的劳动。",
      "每周至少摄入一次肉类、一次蔬菜。",
      "若厨房内存在打碎的瓷器，请叫母亲来解决。",
    ],
    unlocked: state => !!state.flags.ch2_kitchen_rules_found,
  },
  {
    id: "rule_school_food",
    category: "规则内容",
    title: "学校食物与惩罚",
    lines: [
      "学校盒饭、惩罚和学生状态之间存在规则关联。",
      "被惩罚者不能随意处理自己的午饭，但他人食物可能成为漏洞。",
      "规则并不只约束行为，也会扭曲学生对惩罚的需求。",
    ],
    unlocked: state => state.currentSceneId.startsWith("ch4_") || state.currentSceneId.startsWith("ch5_"),
  },
  {
    id: "rule_permission",
    category: "规则内容",
    title: "区域许可",
    lines: [
      "进入特殊区域可能需要相应许可。",
      "许可、权限和具体人的允许不是完全相同的概念。",
      "外来者身份被认出可能触发额外风险。",
    ],
    unlocked: state => state.currentSceneId.startsWith("ch5_") || state.currentSceneId.startsWith("ch6_"),
  },
  {
    id: "rule_root_good_child",
    category: "规则内容",
    title: "根本规则：成为好孩子",
    lines: [
      "学校区域存在更深层的身份性规则。",
      "触发根本规则后，普通学生和NPC都可能被强制卷入追杀。",
      "删除“成为好孩子”比删除表层行为规则更接近解除学校区域危机。",
    ],
    unlocked: state => state.currentSceneId.startsWith("ch6_") || state.currentSceneId.startsWith("ch7_") || state.currentSceneId.startsWith("ch8_"),
  },
];

const categories: NotebookCategory[] = ["游戏内容", "副本内容", "规则内容"];

export function NotebookPanel({ state, onClose }: Props) {
  const unlockedEntries = entries.filter(entry => entry.unlocked(state));

  return (
    <div className="notebook-overlay">
      <div className="notebook-panel">
        <div className="notebook-header">
          <div>
            <h2 className="notebook-title">笔记本</h2>
            <p className="notebook-subtitle">记录已确认的游戏、副本与规则信息</p>
          </div>
          <button className="notebook-close" onClick={onClose}>关闭</button>
        </div>

        {unlockedEntries.length === 0 ? (
          <div className="notebook-empty">暂无记录。继续推进剧情后，重要信息会自动写入。</div>
        ) : (
          <div className="notebook-content">
            {categories.map(category => {
              const categoryEntries = unlockedEntries.filter(entry => entry.category === category);
              if (categoryEntries.length === 0) return null;
              return (
                <section className="notebook-section" key={category}>
                  <h3 className="notebook-section-title">{category}</h3>
                  <div className="notebook-entry-list">
                    {categoryEntries.map(entry => (
                      <article className="notebook-entry" key={entry.id}>
                        <h4 className="notebook-entry-title">{entry.title}</h4>
                        <ul className="notebook-entry-lines">
                          {entry.lines.map(line => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
