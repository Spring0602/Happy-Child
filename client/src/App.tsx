import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { aiSceneConfigs } from "./data/aiSceneConfig";
import { buildAiMemoryContext, createAiMemorySceneEntry, inferMonitorKeysForScene } from "./data/aiMemory";
import { gameReducer, initialGameState } from "./engine/gameReducer";
import {
  saveGame,
  clearSave,
  savePortrait,
} from "./engine/save";
import { DialogOverlay } from "./components/DialogOverlay";
import { CgOverlay } from "./components/CgOverlay";
import { StatusPanel } from "./components/StatusPanel";
import { AITracePanel } from "./components/AITracePanel";
import { PhaserContainer } from "./components/PhaserContainer";
import { StartMenu } from "./components/StartMenu";
import { GameMenu } from "./components/GameMenu";
import { Backlog, type DialogLogEntry } from "./components/Backlog";
import { PersonalityPortrait } from "./components/PersonalityPortrait";
import { NotebookPanel } from "./components/NotebookPanel";
import { TutorialPanel } from "./components/TutorialPanel";
import { PhoneChatOverlay } from "./components/PhoneChatOverlay";
import { gameBridge } from "./game/bridge/GameBridge";
import { playBgm, stopBgm } from "./services/bgm";
import { playOneShotSound, playSceneSounds, startRainAmbience, stopRainAmbience, unlockScriptedAudio } from "./services/scriptedAudio";
import { MapRegistry } from "./game/config/mapRegistry";
import {
  analyzeChoice,
  createFallbackPersonalityPortrait,
  generateAiScene,
  generateNpcDialogue,
  generatePersonalityPortrait,
  judgeEnding,
  type GeneratedPersonalityPortrait,
} from "./services/aiClient";
import type { AITrace, Choice, GameState, InfoPanel, PhoneChatMessage, Scene } from "./types/game";
import "./styles/global.css";

type GamePhase = "menu" | "playing";
const ENABLE_AI_FALLBACK_TEXT = import.meta.env.VITE_AI_ALLOW_FALLBACK === "true";
const PHONE_CHAT_VISIBLE_HISTORY_LIMIT = 8;
type ScreenEffect = "golden_light" | "shatter_screen";

const STORY_BGM = {
  explore: "/assets/audio/bgm/探索.mp3",
  suspense: "/assets/audio/bgm/悬疑.mp3",
  uplifting: "/assets/audio/bgm/向上.mp3",
  reflectiveLoop: "/assets/audio/bgm/平凡中的感慨.mp3",
  contemplation: "/assets/audio/bgm/沉思.mp3",
  humor: "/assets/audio/bgm/幽默.mp3",
  touching: "/assets/audio/bgm/触动.mp3",
  horror: "/assets/audio/bgm/恐怖.mp3",
  daily: "/assets/audio/bgm/日常.mp3",
  quietThought: "/assets/audio/bgm/静思水面 -思考.mp3",
  ritual: "/assets/audio/bgm/祭祀.mp3",
  ashEcho: "/assets/audio/bgm/灰烬回声.mp3",
} as const;

function resolveStoryBgm(gamePhase: GamePhase, state: GameState) {
  if (gamePhase !== "playing") return undefined;

  const sceneId = state.currentSceneId;
  const mapId = state.currentMapId;

  // ── 游戏开始 CG（无BGM）──
  if (sceneId === "start" || sceneId === "ch1_think_balcony") {
    return null;
  }

  if (
    sceneId === "ch3_classroom_entrance" ||
    sceneId?.startsWith("ch3_homework_prank") ||
    sceneId === "ch3_homework_choice" ||
    sceneId === "ch3_prank_joined" ||
    sceneId === "ch3_prank_returned" ||
    sceneId === "ch3_prank_laughter"
  ) {
    return STORY_BGM.humor;
  }

  if (
    sceneId === "ch3_returned_homework_empty_seat" ||
    sceneId === "ch3_empty_seat_choice" ||
    sceneId === "ch3_empty_seat_seen" ||
    sceneId === "ch3_respond_zqr_then_seat" ||
    sceneId === "ch3_liuyu_intervenes" ||
    sceneId === "ch3_liuyu_check_state"
  ) {
    return STORY_BGM.suspense;
  }

  // 三、优秀学生品质测试（考试中）：静思水面 -思考
  if (
    sceneId === "ch3_exam_begins" ||
    sceneId === "ch3_final_question_choice" ||
    sceneId === "ch3_final_answer_safe" ||
    sceneId === "ch3_final_answer_warning"
  ) {
    return STORY_BGM.quietThought;
  }

  // [CG]夜间卧室分析：进入场景先静音，等“红笔批注”分段出现时再由 onSegmentStart 开始沉思
  if (sceneId === "ch3_night_analysis") {
    return null;
  }

  // “红笔批注”出现后 → 第三章结束：沉思
  if (
    sceneId === "ch3_suffocation_start" ||
    sceneId === "ch3_suffocation_resolved" ||
    sceneId === "ch3_suffocation_death"
  ) {
    return STORY_BGM.contemplation;
  }

  if (
    sceneId === "ch3_after_exam_gate" ||
    sceneId === "ch3_after_exam_find_liuyu" ||
    sceneId === "ch3_after_exam_greeting" ||
    sceneId === "ch3_after_exam_private_start" ||
    sceneId === "ch3_liuyu_private_talk_choice" ||
    sceneId === "ch3_liuyu_help_commitment" ||
    sceneId === "ch3_class_count_question" ||
    sceneId === "ch3_gate_explanation_choice" ||
    sceneId === "ch3_mother_pickup" ||
    sceneId === "ch3_car_home"
  ) {
    return STORY_BGM.touching;
  }

  if (
    sceneId === "ch1_game_start" ||
    sceneId === "ch1_game_start_system" ||
    sceneId === "ch2_game_start" ||
    sceneId === "ch2_skill_info_panel" ||
    sceneId === "ch2_after_skill_info" ||
    sceneId === "ch2_dungeon_info_panel" ||
    sceneId === "ch2_after_dungeon_info"
  ) {
    return STORY_BGM.uplifting;
  }

  // 进入副本卧室 → 计划本与人生蓝图 door_knock 之前：循环中的感慨
  if (
    sceneId === "ch2_enter_bedroom" ||
    sceneId?.startsWith("ch2_bedroom") ||
    sceneId === "ch2_plan_book_intro" ||
    sceneId === "ch2_plan_book_read" ||
    (
      !sceneId &&
      (mapId === "bedroom" || mapId === "bedroom_luggage") &&
      !state.flags["ch2_bedroom_rules_found"] &&
      !state.flags["ch2_home_initial_investigation_completed"]
    )
  ) {
    return STORY_BGM.reflectiveLoop;
  }

  if (
    sceneId === "ch2_study_montage" ||
    sceneId === "ch2_thought_violation_choice" ||
    sceneId === "ch2_thought_warning_resolved"
  ) {
    return STORY_BGM.contemplation;
  }

  // ch2_breakfast*：早餐在 uplifting 结束后、进入卧室前的过渡，需求未涉及 → 静音
  // ch2_mother_door_choice：door_knock 后进入母亲选项，也属静音过渡
  if (
    sceneId === "ch2_breakfast" ||
    sceneId === "ch2_breakfast_choice" ||
    sceneId === "ch2_breakfast_violation" ||
    sceneId === "ch2_mother_door_choice"
  ) {
    return null;
  }

  // interact_livingroom_*：第二章客厅交互节点（有 sceneId），归属第五幕 reflectiveLoop
  if (
    sceneId === "ch2_home_exploration_start" ||
    sceneId === "ch2_home_investigation_end" ||
    sceneId === "ch2_home_findings_choice" ||
    sceneId?.startsWith("ch2_family") ||
    sceneId?.startsWith("ch2_livingroom") ||
    sceneId?.startsWith("ch2_bathroom") ||
    sceneId?.startsWith("ch2_kitchen") ||
    sceneId?.startsWith("interact_livingroom_") ||
    (
      !sceneId &&
      (mapId === "livingroom" || mapId === "bathroom" || mapId === "kitchen") &&
      state.flags["ch2_thoughts_can_violate"] &&
      !state.flags["ch2_home_initial_investigation_completed"]
    )
  ) {
    return STORY_BGM.reflectiveLoop;
  }

  // [地图]电脑自动开机 → [CG]上帝视角（第六部分完）结束前：悬疑
  // dorm_act4_god_view / dorm_act4_god_view_narrate 是"上帝视角"本体，属"结束前"边界外，不含
  // dorm_act4_return_dorm*：返回宿舍过渡节点，属悬疑区间内
  // dorm_act4_choice_*/strategy_*/analyze_*/tip*/death_*：邮件后选择/策略/提示/死亡节点，均属悬疑
  if (
    sceneId === "dorm_act4_pc_boot_shock" ||
    sceneId?.startsWith("dorm_act4_pc_boot") ||
    sceneId?.startsWith("dorm_act4_check_pc") ||
    sceneId?.startsWith("dorm_act4_mail") ||
    sceneId?.startsWith("dorm_act4_prepare") ||
    sceneId?.startsWith("dorm_act4_return_dorm") ||
    sceneId?.startsWith("dorm_act4_choice_") ||
    sceneId?.startsWith("dorm_act4_strategy_") ||
    sceneId?.startsWith("dorm_act4_analyze_") ||
    sceneId?.startsWith("dorm_act4_tip") ||
    sceneId?.startsWith("dorm_act4_death_")
  ) {
    return STORY_BGM.suspense;
  }

  // 二、宿舍第一幕自由探索 → 四、宿舍第二幕（阳台回来后）结束之前：探索
  // dorm_act2_sleep_result 是"睡觉"节点，属宿舍第二幕结束，不含（之后第三幕静音）
  if (
    sceneId === "dorm_cg_end_think" ||
    sceneId === "dorm_go_balcony" ||
    sceneId === "dorm_interact_pc" ||
    sceneId === "dorm_interact_cpp_book" ||
    sceneId === "dorm_interact_clock" ||
    sceneId === "dorm_interact_exit_door" ||
    sceneId?.startsWith("balcony_night") ||
    (sceneId?.startsWith("dorm_act2") && sceneId !== "dorm_act2_sleep_result") ||
    (!sceneId && (mapId === "dormitory" || mapId === "balcony_night"))
  ) {
    return STORY_BGM.explore;
  }

  // 五、宿舍第三幕（次日清晨）：静音——从睡觉结果到电脑开机之前
  if (
    sceneId === "dorm_act2_sleep_result" ||
    sceneId?.startsWith("dorm_act3") ||
    (!sceneId && mapId === "dormitory_day")
  ) {
    return null;
  }

  // 七、赛前准备（上帝视角过渡 → 校园小卖部 → 厨房用品店探索结束前）：静思水面 -思考
  // ch1_shop_converge_escape 是厨房用品店最后一个节点，之后 ch1_game_eve* 是静音过渡
  // shop_school_interact_*/leave_*/checkout_* 是校园小卖部地图交互节点（有 sceneId），需显式覆盖
  if (sceneId?.startsWith("ch1_shop_converge")) {
    return null;
  }

  if (
    sceneId === "dorm_act4_god_view" ||
    sceneId === "dorm_act4_god_view_narrate" ||
    sceneId?.startsWith("ch1_shop_school") ||
    sceneId?.startsWith("shop_school_interact") ||
    sceneId?.startsWith("shop_school_leave") ||
    sceneId?.startsWith("shop_school_checkout") ||
    sceneId === "ch1_shop_enter" ||
    sceneId === "ch1_shop_enter_narrate" ||
    sceneId === "ch1_shop_enter_think" ||
    sceneId === "ch1_shop_enter_strategy" ||
    sceneId === "ch1_shop_enter_weapon" ||
    sceneId?.startsWith("ch1_shop_interact") ||
    (!sceneId && (mapId === "shop_school" || mapId === "shop"))
  ) {
    return STORY_BGM.quietThought;
  }

  // 厨房用品店结束后 → 参赛前夕过渡段：静音
  if (sceneId?.startsWith("ch1_game_eve")) {
    return null;
  }

  // ── 第4章 BGM ──

  // 一、[地图]寻找宣传册（探索）→ 早上教室 结束前：探索
  if (
    sceneId === "ch4_find_brochure" ||
    sceneId === "ch4_classroom_rules" ||
    sceneId === "ch4_brochure_content" ||
    sceneId === "ch4_morning_classroom" ||
    sceneId === "ch4_morning_liuyu_sits"
  ) {
    return STORY_BGM.explore;
  }

  // 二、看不见的名字（花名册异常→汇合）：沉思
  if (
    sceneId === "ch4_roster_anomaly" ||
    sceneId === "ch4_roster_ask_student" ||
    sceneId === "ch4_roster_observe" ||
    sceneId === "ch4_roster_test_liuyu" ||
    sceneId === "ch4_roster_converge"
  ) {
    return STORY_BGM.contemplation;
  }

  // [CG]攻击刘宇·死亡：沉思
  if (sceneId === "ch4_lunch_attack_death") {
    return STORY_BGM.contemplation;
  }

  // 四、周骐瑞的是非问答（午休寻找周骐瑞→绿化带开始前）：静思水面 -思考
  if (
    sceneId === "ch4_lunch_outside_test" ||
    sceneId === "ch4_lunch_refuse" ||
    sceneId === "ch4_lunch_tease" ||
    sceneId === "ch4_zhou_lunch_approach" ||
    sceneId === "ch4_liuyu_lunch_tease" ||
    sceneId === "ch4_seat_busy" ||
    sceneId === "ch4_empty_seat_lunch" ||
    sceneId === "ch4_lunch_corridor_blocked" ||
    sceneId === "ch4_classroom_slogan" ||
    sceneId === "ch4_classroom_noticeboard" ||
    sceneId?.startsWith("ch4_zhou_") ||
    sceneId === "ch4_lunch_toilet" ||
    (!sceneId && mapId === "classroom" && (
      state.choiceHistory.includes("ch4_lunch_punished") ||
      state.choiceHistory.includes("ch4_lunch_not_punished")
    ))
  ) {
    return STORY_BGM.quietThought;
  }

  // [地图]前往绿化带 → 第五章[CG]前往五楼 结束前：静思水面 -思考
  if (
    sceneId === "ch4_greenbelt_start" ||
    sceneId === "ch4_greenbelt_after_walk" ||
    sceneId === "ch4_liuyu_fixed_warning" ||
    sceneId === "ch5_liuyu_negotiate" ||
    sceneId === "ch5_liuyu_negotiation_choice" ||
    sceneId === "ch5_liuyu_dynamic_response" ||
    sceneId === "ch5_permission_inference" ||
    sceneId === "ch5_liuyu_permission_reaction" ||
    sceneId === "ch5_go_to_wang_gallery" ||
    sceneId === "ch5_enter_fifth_floor" ||
    sceneId?.startsWith("ch4_greenbelt_") ||
    sceneId?.startsWith("ch4_evening_") ||
    sceneId?.startsWith("ch4_night_") ||
    (!sceneId && mapId === "gate" && (
      state.choiceHistory.includes("ch4_lunch_punished") ||
      state.choiceHistory.includes("ch4_lunch_not_punished")
    ))
  ) {
    return STORY_BGM.quietThought;
  }

  // ── 第5章 BGM ──

  // [地图]进入王沁林工作室 → [CG]向王沁林提问 结束前：探索
  if (
    sceneId === "ch5_wang_gallery_enter" ||
    sceneId === "ch5_gallery_explore" ||
    sceneId === "ch5_return_to_office" ||
    sceneId === "ch5_offer_help_choice" ||
    sceneId === "ch5_zhoujunxiu_help_response" ||
    sceneId === "ch5_wang_trade_opening" ||
    (!sceneId && mapId === "wang_gallery")
  ) {
    return STORY_BGM.explore;
  }

  // [CG]陪周隽秀返回3班 → [混合]调查3班 触发@trigger_250 且满足 ch5_class3_students_checked 之前：平凡中的感慨
  if (
    sceneId === "ch5_walk_with_zhoujunxiu" ||
    sceneId === "ch5_zhoujunxiu_conversation_choice" ||
    sceneId === "ch5_zhoujunxiu_dynamic_reply" ||
    sceneId?.startsWith("ch5_zhoujunxiu_") ||
    sceneId === "ch5_enter_class3" ||
    sceneId === "ch5_class3_explore" ||
    sceneId === "ch5_class3_students" ||
    (sceneId === "ch5_class3_slogan" && !state.flags["ch5_class3_students_checked"]) ||
    sceneId === "ch5_class3_leave_blocked" ||
    sceneId === "ch5_class3_rules_wait" ||
    (!sceneId && mapId === "classroom_3" && !state.flags["ch5_class3_students_checked"])
  ) {
    return STORY_BGM.reflectiveLoop;
  }

  // [CG]陌生同学 → 第六章[地图]刘宇判定迟到之前：悬疑
  if (
    sceneId === "ch5_class3_face_closeup" ||
    sceneId === "ch5_class3_rules" ||
    sceneId === "ch5_class3_disguise_choice" ||
    sceneId === "ch5_class3_exposure" ||
    sceneId?.startsWith("ch6_class3_") ||
    sceneId === "ch6_zhoujunxiu_reaction" ||
    sceneId?.startsWith("ch6_corridor_") ||
    (!sceneId && mapId === "classroom_3" && !!state.flags["ch5_class3_students_checked"])
  ) {
    return STORY_BGM.suspense;
  }

  // ── 第6章 BGM ──

  // [地图]进入教师办公室（班主任"不听话"台词起）→ [CG]一楼厕所 结束：恐怖
  if (
    sceneId === "ch6_office_escape_choice" ||
    sceneId === "ch6_break_vent" ||
    sceneId === "ch6_break_vent_stall" ||
    sceneId === "ch6_break_vent_fight" ||
    sceneId === "ch6_verified_route_death" ||
    sceneId === "ch6_vent_escape_commit" ||
    sceneId === "ch6_vent_escape_block" ||
    sceneId === "ch6_vent_escape_distract" ||
    sceneId === "ch6_toilet_encounter"
  ) {
    return STORY_BGM.horror;
  }

  // [地图]放学后的同行 → [CG]周围突然安静 之前：平凡中的感慨
  if (
    sceneId === "ch6_after_school_walk" ||
    sceneId === "ch6_after_school_injury" ||
    sceneId === "ch6_injury_explanation_choice" ||
    sceneId === "ch6_liuyu_root_rule_test"
  ) {
    return STORY_BGM.reflectiveLoop;
  }

  // [CG]全校追杀 → 第七章一、删除好孩子结束前：祭祀
  if (
    sceneId === "ch6_root_rule_experiment_choice" ||
    sceneId === "ch6_root_rule_trigger" ||
    sceneId === "ch6_capture_ritual" ||
    sceneId === "ch6_ritual_wishes" ||
    sceneId === "ch6_ritual_desire_snowball" ||
    sceneId === "ch6_ritual_backlash" ||
    sceneId === "ch6_numbers_attack" ||
    sceneId === "ch7_rule_skill_initialize" ||
    sceneId === "ch7_rule_skill_panel" ||
    sceneId === "ch7_delete_rule_struggle" ||
    sceneId === "ch7_surface_rule_death" ||
    sceneId === "ch7_bad_child_born"
  ) {
    return STORY_BGM.ritual;
  }

  // ── 第7章 BGM ──

  // [地图]回到家中 → [CG]具体规则仍然存在 之前：平凡中的感慨
  if (
    sceneId === "ch7_return_livingroom" ||
    sceneId === "ch7_overhear_parents" ||
    sceneId === "ch7_overhear_parents_after" ||
    sceneId === "ch7_family_response_choice" ||
    sceneId === "ch7_family_dynamic_response" ||
    sceneId === "ch7_mother_chat_choice" ||
    sceneId === "ch7_mother_rebellion_response" ||
    sceneId === "ch7_mother_memory_response" ||
    (!sceneId && mapId === "livingroom" && !!state.flags["ch7_deleted_good_child"] && !state.flags["ch7_trial_started"])
  ) {
    return STORY_BGM.reflectiveLoop;
  }

  // 三、六个人的试胆活动（开始→结束）：日常
  if (
    sceneId === "ch7_trial_signup" ||
    sceneId === "ch7_trial_group_joined" ||
    sceneId === "ch7_trial_group_members" ||
    sceneId?.startsWith("ch7_group_") ||
    sceneId === "ch7_private_liuyu_choice" ||
    sceneId === "ch7_liuyu_private_group_switch" ||
    sceneId === "ch7_liuyu_private_chat"
  ) {
    return STORY_BGM.daily;
  }

  // [地图]进入镜中空间 → 第八章[CG]凌晨一点的查房 之前：恐怖
  // ch8_walk_to_bathroom_* 是门缝/镜子走路过渡节点，属恐怖区间
  if (
    sceneId === "ch7_prepare_mirror" ||
    sceneId === "ch7_mirror_entry_choice" ||
    sceneId === "ch7_enter_mirror_careful" ||
    sceneId === "ch7_enter_mirror_recording" ||
    sceneId === "ch7_enter_mirror_direct" ||
    sceneId === "ch7_enter_mirror_timed" ||
    sceneId === "ch7_mirror_space" ||
    sceneId === "ch8_mirror_figure_disappears" ||
    sceneId === "ch8_mirror_ghost" ||
    sceneId === "ch8_bathroom_knocking" ||
    sceneId === "ch8_door_response_choice" ||
    sceneId === "ch8_door_identity_result" ||
    sceneId === "ch8_door_gap_result" ||
    sceneId === "ch8_mirror_check_result" ||
    sceneId === "ch8_open_bathroom_door" ||
    sceneId === "ch8_mother_ghost_enters" ||
    sceneId === "ch8_bathroom_death_vision" ||
    sceneId?.startsWith("ch8_walk_to_bathroom_")
  ) {
    return STORY_BGM.horror;
  }

  // ── 第8章 BGM ──

  // [地图]深夜天台开始 → 第八章结束/返回标题前：灰烬回声
  if (
    sceneId === "ch8_rooftop_arrival" ||
    sceneId === "ch8_rooftop_observation_choice" ||
    sceneId === "ch8_rooftop_perspective" ||
    sceneId === "ch8_rooftop_circle_argument" ||
    sceneId === "ch8_rooftop_method_choice" ||
    sceneId === "ch8_inner_truth_choice" ||
    sceneId === "ch8_inner_voice_final_response" ||
    sceneId === "ch8_rooftop_resolution" ||
    sceneId === "ch8_return_home" ||
    sceneId === "ch8_demo_personality_review" ||
    sceneId === "ch8_unfinished_threads" ||
    sceneId === "ch8_demo_ending" ||
    sceneId === "ch8_open_final_save"
  ) {
    return STORY_BGM.ashEcho;
  }

  // 未匹配的场景默认静音。需要跨场景连续播放的演出节点必须显式加入上方区间，
  // 否则 BGM 会在区间结束后拖到后续几段对白甚至下一首 BGM 才停。
  return null;
}

type FloatingTextItem = {
  id: string;
  text: string;
  x: string;
  y: string;
  fontSize?: number;
  width?: string;
  variant?: "normal" | "climax" | "gold" | "backlash";
};

function conditionMatches(condition: string, state: GameState): boolean {
  const trimmed = condition.trim();
  if (!trimmed) return true;
  const negated = trimmed.startsWith("!");
  const key = negated ? trimmed.slice(1) : trimmed;
  const value = state.flags[key] || state.choiceHistory.includes(key);
  return negated ? !value : value;
}

function filterConditionalSceneText(text: string, state: GameState): string {
  const markerPattern = /\[旁白\]【条件：([^】]+)】/g;
  const matches = [...text.matchAll(markerPattern)];
  if (matches.length === 0) return text;

  let result = "";
  let matchedAnyCondition = false;
  if ((matches[0].index ?? 0) > 0) {
    result += text.slice(0, matches[0].index);
  }

  matches.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    if (conditionMatches(match[1], state)) {
      matchedAnyCondition = true;
      result += text.slice(contentStart, contentEnd);
    }
  });

  return matchedAnyCondition ? result.trim() : text.replace(markerPattern, "").trim();
}

function createAiFailureScript(sceneId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const safeMessage = message.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***").slice(0, 240);
  return [
    "[NPC:系统]AI服务连接失败，本场景没有使用默认占位剧情。",
    `[旁白]场景ID：${sceneId}`,
    "[旁白]请确认本地从 Cloudflare Pages 入口运行：在 client 目录分别执行 npm run dev:web 和 npm run dev:pages，然后打开 http://localhost:8788。",
    "[旁白]同时确认 client/.dev.vars 已设置 MODEL_PROVIDER 和对应模型密钥。",
    `[旁白]错误摘要：${safeMessage}`,
  ].join("\n\n");
}

function createAiFallbackScript(sceneId: string, fallback: string) {
  return [
    "[NPC:系统]AI服务连接失败，当前显示的是离线占位剧情，不是模型生成结果。",
    `[旁白]场景ID：${sceneId}`,
    fallback,
  ].join("\n\n");
}

function SystemInfoOverlay({ panel, closing }: { panel: InfoPanel; closing?: boolean }) {
  return (
    <div className={`system-info-stage${closing ? " closing" : ""}`}>
      <div className="system-info-panel">
        <div className="system-info-title">{panel.title}</div>
        {panel.subtitle && <div className="system-info-subtitle">{panel.subtitle}</div>}
        <div className="system-info-lines">
          {panel.lines.map((line, index) => (
            <div className="system-info-line" key={`${line}-${index}`}>{line}</div>
          ))}
        </div>
        <div className="system-info-hint">{panel.hint ?? "随系统播报同步显示"}</div>
      </div>
    </div>
  );
}

function inferSpawnIdForScene(sceneId: string, mapId: string): string {
  const sceneSpawnMap: Record<string, string> = {
    ch3_classroom_entrance: "spawn_spawn_132",
    ch3_homework_prank_start: "spawn_spawn_132",
    ch3_homework_prank_liuyu_dialog: "spawn_spawn_132",
    ch3_homework_prank_zqr_dialog: "spawn_spawn_132",
    ch3_homework_prank_hint_dialog: "spawn_spawn_132",
    ch3_homework_choice: "spawn_spawn_132",
    ch3_prank_joined: "spawn_spawn_132",
    ch3_prank_returned: "spawn_spawn_253",
    ch3_after_exam_gate: "spawn_spawn_173",
    ch3_after_exam_find_liuyu: "spawn_spawn_173",
    ch3_after_exam_greeting: "spawn_spawn_173",
    ch3_after_exam_private_start: "spawn_spawn_173",
    ch3_liuyu_private_talk_choice: "spawn_spawn_173",
    ch3_liuyu_help_commitment: "spawn_spawn_173",
    ch3_class_count_question: "spawn_spawn_173",
    ch4_find_brochure: "spawn_spawn_145",
    ch4_morning_classroom: "spawn_spawn_132",
    ch4_morning_liuyu_sits: "spawn_spawn_132",
    ch4_roster_test_liuyu: "spawn_spawn_247",
    ch4_physics_observe: "spawn_spawn_132",
    ch4_zhou_lunch_approach: "spawn_spawn_276",
    ch4_art_class_start: "spawn_spawn_132",
    ch4_show_painting: "spawn_spawn_132",
    ch4_wang_dynamic_judgment: "spawn_spawn_132",
    ch4_wang_question_choice: "spawn_spawn_132",
    ch4_wang_core_reply: "spawn_spawn_132",
    ch4_greenbelt_start: "spawn_spawn_166",
    ch4_greenbelt_after_walk: "spawn_spawn_165",
    ch4_liuyu_fixed_warning: "spawn_spawn_165",
    ch5_liuyu_negotiate: "spawn_spawn_165",
    ch5_liuyu_negotiation_choice: "spawn_spawn_165",
    ch5_liuyu_dynamic_response: "spawn_spawn_165",
    ch5_permission_inference: "spawn_spawn_165",
    ch5_go_to_wang_gallery: "spawn_spawn_165",
    ch5_enter_fifth_floor: "spawn_spawn_165",
  };
  return sceneSpawnMap[sceneId] || MapRegistry[mapId]?.defaultSpawn || initialGameState.currentSpawnId;
}

function normalizeLoadedState(loaded: GameState): {
  state: GameState;
  mapId: string;
  spawnId: string;
} {
  const mapId = loaded.currentMapId && MapRegistry[loaded.currentMapId]
    ? loaded.currentMapId
    : initialGameState.currentMapId;
  const savedSpawnId = (loaded as Partial<GameState>).currentSpawnId;
  const spawnId = savedSpawnId || inferSpawnIdForScene(loaded.currentSceneId || "", mapId);
  return {
    state: { ...loaded, currentMapId: mapId, currentSpawnId: spawnId },
    mapId,
    spawnId,
  };
}

function restoreClassroomSeats(exclude: string[], includeSpawns: string[] = [], includeOnly = false) {
  gameBridge.sendToPhaser({
    type: "STORY_EVENT",
    eventId: "fill_classroom_seats",
    payload: {
      start: 115,
      end: 155,
      exclude: [
        ...exclude,
        "spawn_spawn_145",
        "spawn_spawn_156",
        "spawn_spawn_258",
        "spawn_spawn_246",
        "spawn_spawn_247",
        "spawn_spawn_248",
        "spawn_spawn_249",
        "spawn_spawn_250",
        "spawn_spawn_251",
        "spawn_spawn_252",
        "spawn_spawn_253",
      ],
      includeSpawns,
      includeOnly,
      framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
    },
  });
}

function restoreMorningClassroomSeats() {
  const occupiedSpawns = new Set([
    "spawn_spawn_117",
    "spawn_spawn_127",
    "spawn_spawn_132",
    "spawn_spawn_145",
    "spawn_spawn_156",
    "spawn_spawn_258",
    "spawn_spawn_246",
    "spawn_spawn_247",
    "spawn_spawn_248",
    "spawn_spawn_249",
    "spawn_spawn_250",
    "spawn_spawn_251",
    "spawn_spawn_252",
    "spawn_spawn_253",
  ]);
  const candidates = Array.from({ length: 41 }, (_, index) => `spawn_spawn_${115 + index}`)
    .filter((spawnId) => !occupiedSpawns.has(spawnId));
  restoreClassroomSeats(Array.from(occupiedSpawns), candidates.slice(0, 3), true);
}

function spawnGatePassers(options?: { exclude?: string[]; count?: number; keyPrefix?: string }) {
  const excludedSpawns = new Set(options?.exclude ?? []);
  const gateSpawnCandidates = Array.from(
    { length: 22 },
    (_, index) => `spawn_spawn_${164 + index}`,
  ).filter((spawnId) => !excludedSpawns.has(spawnId));
  const selectedSpawns = [...gateSpawnCandidates]
    .sort(() => Math.random() - 0.5)
    .slice(0, options?.count ?? 5);
  const directions = ["front", "back", "left", "right"];
  const keyPrefix = options?.keyPrefix ?? "npc_gate_passerby";

  selectedSpawns.forEach((spawnId, index) => {
    gameBridge.sendToPhaser({
      type: "STORY_EVENT",
      eventId: "spawn_npc",
      payload: {
        spawnId,
        npcKey: `${keyPrefix}_${index}`,
        scale: 0.75,
        framesPrefix: index % 2 === 0 ? "npc_female1_frames" : "npc_male_frames",
        direction: directions[Math.floor(Math.random() * directions.length)],
      },
    });
  });
}

function restoreLessonClassroom(teacherKey = "npc_teacher_li", teacherFrames = "teacher_frames") {
  restoreClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117"]);
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: teacherKey, scale: 0.75, framesPrefix: teacherFrames } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: teacherKey, direction: "down" } });
}

function restoreLunchClassroom() {
  restoreClassroomSeats(["spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_132", "spawn_spawn_145"]);
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
  gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
}

function restoreCh3Classroom() {
  restoreClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_145", "spawn_spawn_253", "spawn_spawn_255"]);
  gameBridge.sendToPhaser({
    type: "STORY_EVENT",
    eventId: "spawn_npc",
    payload: { spawnId: "spawn_spawn_255", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" },
  });
  gameBridge.sendToPhaser({
    type: "STORY_EVENT",
    eventId: "spawn_npc",
    payload: { spawnId: "spawn_spawn_253", nearSpawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", direction: "front" },
  });
}

function restoreCh3GateNight(sceneId: string) {
  spawnGatePassers({
    exclude: [
      "spawn_spawn_185",
      "spawn_spawn_174",
      "spawn_spawn_175",
      "spawn_spawn_176",
      "spawn_spawn_171",
      "spawn_spawn_172",
      "spawn_spawn_173",
      "spawn_spawn_178",
    ],
    count: 5,
    keyPrefix: "npc_ch3_gate_passerby_restore",
  });

  const liuyuSpawn = ["ch3_after_exam_gate", "ch3_after_exam_find_liuyu"].includes(sceneId)
    ? "spawn_spawn_178"
    : sceneId === "ch3_after_exam_greeting"
      ? "spawn_spawn_176"
      : "spawn_spawn_185";
  gameBridge.sendToPhaser({
    type: "STORY_EVENT",
    eventId: "spawn_npc",
    payload: { spawnId: liuyuSpawn, npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" },
  });
}

function restoreDynamicMapActors(loaded: GameState) {
  setTimeout(() => {
    if (loaded.currentMapId === "classroom") {
      if (loaded.currentSceneId.startsWith("ch3_")) {
        restoreCh3Classroom();
        return;
      }
      if (["ch4_find_brochure", "ch4_morning_classroom", "ch4_morning_liuyu_sits", "ch4_roster_test_liuyu"].includes(loaded.currentSceneId)) {
        restoreMorningClassroomSeats();
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
        return;
      }
      if (loaded.currentSceneId === "ch4_physics_observe") {
        restoreLessonClassroom("npc_teacher_li", "teacher_frames");
        return;
      }
      if (loaded.currentSceneId === "ch4_zhou_lunch_approach") {
        restoreLunchClassroom();
        return;
      }
      if (["ch4_art_class_start", "ch4_show_painting", "ch4_wang_dynamic_judgment", "ch4_wang_question_choice", "ch4_wang_core_reply"].includes(loaded.currentSceneId)) {
        restoreLessonClassroom("npc_wang_teacher", "wql_frames");
        return;
      }
    }

    if (loaded.currentMapId === "gate" && loaded.currentSceneId.startsWith("ch4_")) {
      const liuyuSpawn = ["ch4_greenbelt_after_walk", "ch4_liuyu_fixed_warning"].includes(loaded.currentSceneId)
        ? "spawn_spawn_164"
        : "spawn_spawn_166";
      const direction = liuyuSpawn === "spawn_spawn_164" ? "right" : "front";
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: liuyuSpawn, npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction } });
      return;
    }

    if (loaded.currentMapId === "gate_night" && loaded.currentSceneId.startsWith("ch3_")) {
      restoreCh3GateNight(loaded.currentSceneId);
      return;
    }

    if (loaded.currentMapId === "wang_gallery") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_45", npcKey: "npc_wang_teacher", scale: 0.75, framesPrefix: "wql_frames", pose: "sit", direction: "right" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_46", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames", pose: "sit", direction: "left" } });
      return;
    }

    if (loaded.currentMapId !== "shop") return;

    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_3", npcKey: "npc_male_assistant", scale: 0.75, framesPrefix: "shop_assistant_male_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_male_assistant", direction: "back" } });

    const confrontationScenes = ["ch1_shop_confrontation", "ch1_shop_confront_", "ch1_shop_lzx_leave"];
    const isConfrontation = confrontationScenes.some(prefix => loaded.currentSceneId.startsWith(prefix));
    if (isConfrontation) {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_2", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_mysterious", direction: "right" } });
      return;
    }

    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
    if (
      loaded.currentSceneId.startsWith("ch1_shop_exchange_") &&
      loaded.currentSceneId !== "ch1_shop_exchange_1"
    ) {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_lzx", direction: "back" } });
    }
  }, 800);
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [gamePhase, setGamePhase] = useState<GamePhase>("menu");
  const [scenes, setScenes] = useState<Record<string, Scene>>({});
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const [showAITrace, setShowAITrace] = useState(false);
  const [eyeOpening, setEyeOpening] = useState(false);
  const [reactFlash, setReactFlash] = useState<"red" | null>(null);
  const [screenEffect, setScreenEffect] = useState<ScreenEffect | null>(null);
  const [showBacklog, setShowBacklog] = useState(false);
  const [showPortraitPanel, setShowPortraitPanel] = useState(false);
  const [showNotebookPanel, setShowNotebookPanel] = useState(false);
  const [showTutorialPanel, setShowTutorialPanel] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [floatingTextPerformanceActive, setFloatingTextPerformanceActive] = useState(false);
  const [completedPhoneChats, setCompletedPhoneChats] = useState<Record<string, boolean>>({});
  const [phoneChatHistories, setPhoneChatHistories] = useState<Record<string, PhoneChatMessage[]>>({});
  const [dialogHistory, setDialogHistory] = useState<DialogLogEntry[]>([]);
  const [corridorCountdown, setCorridorCountdown] = useState<number | null>(null);
  const [demoPortrait, setDemoPortrait] = useState<GeneratedPersonalityPortrait | null>(null);
  const [demoPortraitGenerating, setDemoPortraitGenerating] = useState(false);
  const [finalSaveRequired, setFinalSaveRequired] = useState(false);
  const [aiSceneTexts, setAiSceneTexts] = useState<Record<string, string>>({});
  const [aiSceneLoadingId, setAiSceneLoadingId] = useState<string | null>(null);
  const [closingInfoPanelSceneId, setClosingInfoPanelSceneId] = useState<string | null>(null);
  const [bgmRefreshToken, setBgmRefreshToken] = useState(0);
  const aiSceneRequestsRef = useRef<Set<string>>(new Set());
  const prevSceneIdRef = useRef<string>("");
  const currentStoryBgmRef = useRef<string | null>(null);
  const bgmPerformanceHoldUntilRef = useRef(0);
  const bgmPerformanceHoldTimerRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const gamePhaseRef = useRef(gamePhase);
  const scenesRef = useRef<Record<string, Scene>>({});
  const scenesLoadPromiseRef = useRef<Promise<Record<string, Scene>> | null>(null);
  const triggeredSegmentSoundRef = useRef<Set<string>>(new Set());
  const corridorDeathTimerRef = useRef<number | null>(null);
  /** 教程面板在本次浏览器会话中是否已经自动弹出过（不受游戏 RESET 影响） */
  const tutorialAutoShownRef = useRef(false);

  const loadScenes = useCallback(async () => {
    if (Object.keys(scenesRef.current).length > 0) return scenesRef.current;

    scenesLoadPromiseRef.current ??= Promise.all([
      import("./data/scenes"),
      import("./data/ch2Scenes"),
    ]).then(([baseScenesModule, ch2ScenesModule]) => ({
      ...baseScenesModule.scenes,
      ...ch2ScenesModule.ch2Scenes,
    }));
    const loadedScenes = await scenesLoadPromiseRef.current;
    scenesRef.current = loadedScenes;
    setScenes(loadedScenes);
    return loadedScenes;
  }, []);

  // 当前对话场景
  const dialogSceneId = state.currentSceneId && scenes[state.currentSceneId]
    ? state.currentSceneId
    : null;
  const rawDialogScene = dialogSceneId ? scenes[dialogSceneId] : null;
  const aiSceneConfig = dialogSceneId ? aiSceneConfigs[dialogSceneId] : undefined;
  const aiGeneratedText = dialogSceneId ? aiSceneTexts[dialogSceneId] : undefined;
  const aiSceneIsLoading = !!aiSceneConfig && !aiGeneratedText;
  const phoneChatIsBlocking = !!(
    rawDialogScene?.phoneChat &&
    rawDialogScene.phoneChat.blockNextUntilComplete !== false &&
    dialogSceneId &&
    !completedPhoneChats[dialogSceneId]
  );
  const phoneChatKey = rawDialogScene?.phoneChat
    ? `${rawDialogScene.phoneChat.title}::${rawDialogScene.phoneChat.subtitle ?? ""}`
    : "";
  const effectivePhoneChat = rawDialogScene?.phoneChat
    ? {
        ...rawDialogScene.phoneChat,
        initialMessages: rawDialogScene.phoneChat.view && rawDialogScene.phoneChat.view !== "chat"
          ? rawDialogScene.phoneChat.initialMessages
          : [
              ...(rawDialogScene.phoneChat.initialMessages ?? []),
              ...(phoneChatHistories[phoneChatKey] ?? []),
            ].slice(-PHONE_CHAT_VISIBLE_HISTORY_LIMIT),
      }
    : undefined;
  const dialogScene = rawDialogScene
    ? {
        ...rawDialogScene,
        ...(effectivePhoneChat ? { phoneChat: effectivePhoneChat } : {}),
        text: aiSceneConfig
          ? (aiGeneratedText ?? "")
          : filterConditionalSceneText(rawDialogScene.text, state),
      }
    : null;

  useEffect(() => {
    stateRef.current = state;
    gamePhaseRef.current = gamePhase;
    scenesRef.current = scenes;
  }, [state, gamePhase, scenes]);

  const holdStoryBgmDuringPerformance = useCallback((durationMs: number) => {
    const until = Date.now() + durationMs;
    bgmPerformanceHoldUntilRef.current = until;

    if (bgmPerformanceHoldTimerRef.current !== null) {
      window.clearTimeout(bgmPerformanceHoldTimerRef.current);
    }

    bgmPerformanceHoldTimerRef.current = window.setTimeout(() => {
      if (bgmPerformanceHoldUntilRef.current !== until) return;
      bgmPerformanceHoldUntilRef.current = 0;
      bgmPerformanceHoldTimerRef.current = null;

      if (
        gamePhaseRef.current === "playing" &&
        !stateRef.current.currentSceneId &&
        currentStoryBgmRef.current
      ) {
        currentStoryBgmRef.current = null;
        stopBgm({ fadeMs: 450 });
      }
    }, durationMs + 120);
  }, []);

  useEffect(() => {
    if (gamePhase !== "playing") {
      bgmPerformanceHoldUntilRef.current = 0;
      if (bgmPerformanceHoldTimerRef.current !== null) {
        window.clearTimeout(bgmPerformanceHoldTimerRef.current);
        bgmPerformanceHoldTimerRef.current = null;
      }
      currentStoryBgmRef.current = null;
      return;
    }

    if (
      !state.currentSceneId &&
      currentStoryBgmRef.current &&
      bgmPerformanceHoldUntilRef.current > Date.now()
    ) {
      return;
    }

    if (state.currentSceneId && bgmPerformanceHoldUntilRef.current > 0) {
      bgmPerformanceHoldUntilRef.current = 0;
      if (bgmPerformanceHoldTimerRef.current !== null) {
        window.clearTimeout(bgmPerformanceHoldTimerRef.current);
        bgmPerformanceHoldTimerRef.current = null;
      }
    }

    const nextBgm = resolveStoryBgm(gamePhase, state);
    if (nextBgm === undefined) return;

    if (!nextBgm) {
      currentStoryBgmRef.current = null;
      stopBgm({ fadeMs: 700 });
      return;
    }

    if (nextBgm === currentStoryBgmRef.current) return;

    currentStoryBgmRef.current = nextBgm;
    playBgm(nextBgm, { loop: true, fadeMs: 900 });
  }, [gamePhase, state.currentSceneId, state.currentMapId, state.flags, state.choiceHistory, bgmRefreshToken]);

  const shouldCgTransitionTo = useCallback((nextSceneId: string) => {
    const nextScene = scenesRef.current[nextSceneId];
    if (!dialogScene || !nextScene) return true;
    if (!dialogScene.cgMode || !nextScene.cgMode) return true;
    return dialogScene.background !== nextScene.background;
  }, [dialogScene]);

  const handleDialogSegmentDone = useCallback((sceneId: string, segmentText: string) => {
    if (sceneId === "ch2_game_start" && segmentText.includes("现在进行技能抽取")) {
      playOneShotSound("skill_extract");
      setScreenEffect("golden_light");
      window.setTimeout(() => setScreenEffect((current) => current === "golden_light" ? null : current), 3600);
      return;
    }
    if (sceneId !== "ch7_return_livingroom") return;
    if (segmentText.includes("回到家后，父母很识趣地没有找我的麻烦")) {
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "camera_focus_spawn",
        payload: { spawnId: "spawn_spawn_73", duration: 500 },
      });
      return;
    }
    if (segmentText.includes("貌似有些……颓废？")) {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "camera_follow_player" });
      window.setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "set_npc_direction",
          payload: { npcKey: "npc_mother", direction: "right" },
        });
      }, 520);
    }
  }, []);

  const playSegmentSoundOnce = useCallback((sceneId: string, segmentIndex: number, soundName: Parameters<typeof playOneShotSound>[0]) => {
    const key = `${sceneId}:${segmentIndex}:${soundName}`;
    if (triggeredSegmentSoundRef.current.has(key)) return;
    triggeredSegmentSoundRef.current.add(key);
    playOneShotSound(soundName);
  }, []);

  const handleDialogSegmentStart = useCallback((sceneId: string, segmentText: string, segmentIndex: number) => {
    if (sceneId === "ch2_game_start" && segmentText.includes("根据您的特质，系统为您生成了最适合您的技能")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }

    if (sceneId === "ch2_plan_book_read" && segmentText.includes("我被吓了一跳")) {
      currentStoryBgmRef.current = null;
      stopBgm({ fadeMs: 250 });
      playSegmentSoundOnce(sceneId, segmentIndex, "door_knock");
      return;
    }

    if (sceneId === "ch2_stumble_fail" && segmentText.includes("技能\"违规提醒\"正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }

    if (sceneId === "ch2_stumble_fail" && segmentText.includes("窒息感猝然攥住喉咙")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }

    if (sceneId === "ch2_breakfast_violation" && segmentText.includes("技能\"违规提醒\"正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }

    if (sceneId === "ch2_study_montage" && segmentText.includes("我按照计划表行动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "paper_rustle");
      return;
    }

    if (sceneId === "ch2_study_montage" && segmentText.includes("技能\"违规提醒\"正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }

    if (sceneId === "ch2_study_montage" && segmentText.includes("窒息感骤然增强")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }

    const has = (...patterns: string[]) => patterns.some(pattern => segmentText.includes(pattern));

    if (sceneId === "ch3_final_answer_warning" && has("我写下答案的瞬间")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch3_class_count_question" && has("我顿时毛骨悚然")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch3_night_analysis" && has("我翻开计划本")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "paper_rustle");
      return;
    }
    if (sceneId === "ch3_night_analysis" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch3_suffocation_start" && has("突然有一只无形的")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }

    if (sceneId === "ch4_lunch_attack_death" && has("技能“违规提醒”正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch4_lunch_attack_death" && has("下一秒，握住水杯的手")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }

    if (sceneId === "ch5_wang_pressure" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch5_class3_face_closeup" && has("下一秒，一张被无限放大的脸")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch5_class3_face_closeup" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch5_gallery_materials_warning" && has("技能“违规提醒”正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }

    if (sceneId === "ch6_class3_exposure" && has("那双瞪得浑圆的眼睛")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch6_class3_exposure" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch6_corridor_return" && has("技能“违规提醒”发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch6_corridor_timeout_death" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch6_corridor_timeout_death" && has("倒计时归零", "最后一口空气")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }
    if (sceneId === "ch6_root_rule_trigger" && has("技能“违规提醒”强烈发动中")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }
    if (sceneId === "ch6_root_rule_trigger" && has("您即刻遭到全校追杀")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }
    if (sceneId === "ch6_class3_door_locked" && has("冲着门一个飞踢")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "impact");
      return;
    }
    if (
      (sceneId === "ch6_class3_counter_standoff" || sceneId === "ch6_class3_cut_standoff") &&
      has("晚自习铃声响起")
    ) {
      playSegmentSoundOnce(sceneId, segmentIndex, "school_bell");
      return;
    }
    if (
      (sceneId === "ch6_break_vent" || sceneId === "ch6_break_vent_stall" || sceneId === "ch6_break_vent_fight") &&
      has("用刀柄猛砸")
    ) {
      playSegmentSoundOnce(sceneId, segmentIndex, "impact");
      return;
    }

    if (sceneId === "ch7_rule_skill_initialize" && has("猩红数字从试卷上脱离")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "rule_pierce");
      return;
    }
    if (sceneId === "ch7_rule_skill_initialize" && has("70%")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch7_rule_skill_panel" && has("主动技能：篡改规则")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch7_rule_skill_panel" && has("我忍住疼痛，艰难地用舌头")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "paper_rustle");
      return;
    }
    if (sceneId === "ch7_surface_rule_death" && has("已删除该规则")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "rule_pierce");
      return;
    }
    if (sceneId === "ch7_surface_rule_death" && has("它们像收到最终命令一样")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }
    if (sceneId === "ch7_surface_rule_death" && has("参赛者死亡")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "rule_pierce");
      return;
    }
    if (sceneId === "ch7_bad_child_born" && has("新的纸团再次堵住我的嘴")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "paper_rustle");
      return;
    }
    if (sceneId === "ch7_bad_child_born" && has("恭喜您在学校区域获得")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch7_study_pressure" && has("窒息感再次袭来")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "tinnitus");
      return;
    }
    if (sceneId === "ch7_mirror_space" && has("一阵脚步声从黑暗中响起")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "footsteps_slow");
      return;
    }
    if (sceneId === "ch7_mirror_space" && has("黑暗中似乎出现了一个人形轮廓")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "horror_sting");
      return;
    }

    if (sceneId === "ch8_bathroom_knocking" && has("砰砰砰")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "door_knock");
      return;
    }
    if (sceneId === "ch8_bathroom_knocking" && has("一遍遍地敲门")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "door_knock_heavy");
      return;
    }
    if (sceneId === "ch8_inner_voice_returns" && has("技能“违规提醒”正在发动")) {
      playSegmentSoundOnce(sceneId, segmentIndex, "warning_bell");
      return;
    }

    if (
      (sceneId === "ch3_prank_returned" && segmentText.includes("教室里短暂安静了一瞬")) ||
      (sceneId === "ch3_prank_laughter" && segmentText.includes("你笑什么？"))
    ) {
      if (currentStoryBgmRef.current === null) return;
      currentStoryBgmRef.current = null;
      stopBgm({ fadeMs: 450 });
      return;
    }

    if (sceneId === "ch3_night_analysis" && segmentText.includes("但是更吸引我注意的是")) {
      if (currentStoryBgmRef.current === STORY_BGM.contemplation) return;
      currentStoryBgmRef.current = STORY_BGM.contemplation;
      playBgm(STORY_BGM.contemplation, { loop: true, fadeMs: 900 });
      return;
    }

    if (sceneId === "ch6_teacher_office_after_liuyu_leaves" && segmentText.includes("不听话的孩子，就应该受到应有的惩罚")) {
      if (currentStoryBgmRef.current === STORY_BGM.horror) return;
      currentStoryBgmRef.current = STORY_BGM.horror;
      playBgm(STORY_BGM.horror, { loop: true, fadeMs: 700 });
      return;
    }

  }, [playSegmentSoundOnce]);

  const handleInfoPanelNext = useCallback((sceneId: string, nextSceneId: string) => {
    setClosingInfoPanelSceneId(sceneId);
    window.setTimeout(() => {
      setClosingInfoPanelSceneId((current) => current === sceneId ? null : current);
      handleNext(nextSceneId);
    }, 360);
  }, []);

  useEffect(() => {
    if (!dialogSceneId || !rawDialogScene || !aiSceneConfig || aiSceneTexts[dialogSceneId]) return;
    if (aiSceneRequestsRef.current.has(dialogSceneId)) return;

    aiSceneRequestsRef.current.add(dialogSceneId);
    setAiSceneLoadingId(dialogSceneId);
    const prompt = rawDialogScene.text.trim();
    // requiredLines / skeletonLines 始终透传，由服务端 enforce（不再因 prompt 含"AI生成要求"而跳过）
    const requiredLines = aiSceneConfig.requiredLines ?? [];
    const skeletonLines = aiSceneConfig.skeletonLines ?? [];

    const monitorKeys = aiSceneConfig.monitorKeys ?? inferMonitorKeysForScene(dialogSceneId);
    const memoryContext = buildAiMemoryContext(state.aiMemory, monitorKeys);
    const runtimeContext = [aiSceneConfig.context, memoryContext].filter(Boolean).join("\n\n");

    void generateAiScene(
      state,
      dialogSceneId,
      aiSceneConfig.mode,
      prompt,
      requiredLines,
      skeletonLines,
      runtimeContext
    )
      .then((response) => {
        const script = response.result?.script?.trim();
        if (!script || !/\[(?:旁白|主角|主角说|NPC:[^\]]+)\]/.test(script)) {
          throw new Error("AI scene returned invalid script format");
        }
        setAiSceneTexts((previous) => ({ ...previous, [dialogSceneId]: script }));
      })
      .catch((error) => {
        console.error(`[AI] 场景 ${dialogSceneId} 生成失败`, error);
        setAiSceneTexts((previous) => ({
          ...previous,
          [dialogSceneId]: ENABLE_AI_FALLBACK_TEXT
            ? createAiFallbackScript(dialogSceneId, aiSceneConfig.fallback)
            : createAiFailureScript(dialogSceneId, error),
        }));
      })
      .finally(() => {
        setAiSceneLoadingId((current) => current === dialogSceneId ? null : current);
      });
  }, [dialogSceneId]);

  useEffect(() => {
    if (!dialogSceneId || !rawDialogScene) return;
    const entry = createAiMemorySceneEntry(dialogSceneId, rawDialogScene.text);
    if (!entry) return;
    if (state.aiMemory?.importantEvents?.some((event) => event.id === entry.id)) return;
    dispatch({ type: "RECORD_AI_MEMORY_SCENE", entry });
  }, [dialogSceneId, rawDialogScene?.text, state.aiMemory?.importantEvents]);

  function resetAiSceneRuntime() {
    aiSceneRequestsRef.current.clear();
    triggeredSegmentSoundRef.current.clear();
    setAiSceneTexts({});
    setAiSceneLoadingId(null);
    setCompletedPhoneChats({});
    setPhoneChatHistories({});
  }

  // 同步 GameBridge + 自动存档
  useEffect(() => {
    if (gamePhase === "playing") {
      const runtime = gameBridge.captureMapRuntime();
      saveGame(runtime?.mapId === state.currentMapId ? { ...state, mapRuntime: runtime } : state);
    }
    gameBridge.gameState = state;
  }, [state, gamePhase]);

  // 追踪对话历史（回顾功能用）
  useEffect(() => {
    if (!dialogScene) return;
    if (dialogScene.id === prevSceneIdRef.current) return;
    prevSceneIdRef.current = dialogScene.id;

    if (dialogScene.speaker && dialogScene.text) {
      setDialogHistory(prev => {
        const entry: DialogLogEntry = {
          speaker: dialogScene.speaker!,
          text: dialogScene.text,
          sceneId: dialogScene.id,
          chapter: dialogScene.chapter,
        };
        return [...prev, entry];
      });
    }
  }, [dialogScene]);

  useEffect(() => {
    if (!dialogScene) return;
    return playSceneSounds(dialogScene.id);
  }, [dialogScene?.id]);

  useEffect(() => {
    const unlock = () => {
      unlockScriptedAudio();
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("keydown", unlock);
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // ESC 键：打开/关闭游戏内菜单
  useEffect(() => {
    if (gamePhase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        if (finalSaveRequired) return;
        // 如果回溯或画像面板开着，先关闭
        if (showBacklog) {
          setShowBacklog(false);
          return;
        }
        if (showPortraitPanel) {
          setShowPortraitPanel(false);
          return;
        }
        if (showTutorialPanel) {
          setShowTutorialPanel(false);
          if (!state.currentSceneId) gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
        if (showNotebookPanel) {
          setShowNotebookPanel(false);
          return;
        }
        setGameMenuOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gamePhase, showBacklog, showPortraitPanel, showNotebookPanel, showTutorialPanel, finalSaveRequired, state.currentSceneId]);

  // 教程面板自动弹出：仅在本次浏览器会话中触发一次（使用 ref 避免 RESET 清空 flag 导致重复弹出）
  useEffect(() => {
    if (gamePhase !== "playing") return;
    if (state.currentSceneId) return;
    if (state.currentMapId !== "dormitory") return;
    if (tutorialAutoShownRef.current) return;
    if (gameMenuOpen || showBacklog || showPortraitPanel || showNotebookPanel || showTutorialPanel || finalSaveRequired) return;

    tutorialAutoShownRef.current = true;
    setShowTutorialPanel(true);
    gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
  }, [
    gamePhase,
    state.currentSceneId,
    state.currentMapId,
    gameMenuOpen,
    showBacklog,
    showPortraitPanel,
    showNotebookPanel,
    showTutorialPanel,
    finalSaveRequired,
  ]);

  function closeTutorialPanel() {
    setShowTutorialPanel(false);
    if (!state.currentSceneId && gamePhase === "playing" && !gameMenuOpen) {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }
  }

  // 监听关闭 AI Trace
  useEffect(() => {
    const onClose = () => setShowAITrace(false);
    window.addEventListener("close-ai-trace", onClose);
    return () => window.removeEventListener("close-ai-trace", onClose);
  }, []);

  function addAITrace(type: AITrace["type"], result: unknown) {
    dispatch({
      type: "ADD_AI_TRACE",
      trace: {
        type,
        sceneId: state.currentSceneId,
        result: JSON.stringify(result, null, 2),
        createdAt: new Date().toISOString(),
      },
    });
  }

  // ── 开始新游戏 ──
  async function handleNewGame() {
    await loadScenes();
    clearSave();
    resetAiSceneRuntime();
    dispatch({ type: "RESET" });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: initialGameState.currentMapId,
      spawnId: MapRegistry[initialGameState.currentMapId].defaultSpawn,
    });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  async function handleStartChapter4() {
    await loadScenes();
    clearSave();
    resetAiSceneRuntime();
    dispatch({ type: "RESET" });
    dispatch({ type: "DIALOG_START", sceneId: "ch4_exploration_progress" });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: "waiting",
      spawnId: "spawn_waiting_default",
    });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGamePhase("playing");
  }

  async function restoreLoadedGame(loaded: GameState, closeGameMenu = false) {
    const loadedScenes = await loadScenes();
    stopRainAmbience();
    // 读档时先停止当前 BGM 并重置引用，确保新场景从零开始决策 BGM
    stopBgm({ fadeMs: 400, reset: true });
    currentStoryBgmRef.current = null;
    bgmPerformanceHoldUntilRef.current = 0;
    if (bgmPerformanceHoldTimerRef.current !== null) {
      window.clearTimeout(bgmPerformanceHoldTimerRef.current);
      bgmPerformanceHoldTimerRef.current = null;
    }
    setBgmRefreshToken((value) => value + 1);
    resetAiSceneRuntime();
    const normalized = normalizeLoadedState(loaded);
    const playerState = loadedScenes[normalized.state.currentSceneId]?.playerState;
    const runtimeSnapshot = normalized.state.mapRuntime?.mapId === normalized.mapId
      ? normalized.state.mapRuntime
      : undefined;
    dispatch({ type: "LOAD", state: normalized.state });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: normalized.mapId,
      spawnId: normalized.spawnId,
      ...(playerState ? { playerState } : {}),
      ...(runtimeSnapshot ? { runtimeSnapshot } : {}),
    });
    if (!runtimeSnapshot) restoreDynamicMapActors(normalized.state);
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    if (closeGameMenu) setGameMenuOpen(false);
    setGamePhase("playing");
  }

  // ── 读取存档进入游戏 ──
  function handleLoadGame(loaded: GameState) {
    void restoreLoadedGame(loaded);
  }

  // ── 重新开始（清存档，回到初始场景） ──
  function handleRestart() {
    stopRainAmbience();
    clearSave();
    resetAiSceneRuntime();
    dispatch({ type: "RESET" });
    gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
    setDialogHistory([]);
    prevSceneIdRef.current = "";
    setGameMenuOpen(false);
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  // ── 退出到标题 ──
  function handleExitToTitle() {
    stopRainAmbience();
    resetAiSceneRuntime();
    setGameMenuOpen(false);
    setGamePhase("menu");
  }

  async function handleChoose(choice: Choice) {
    if (
      dialogScene?.phoneChat &&
      dialogScene.phoneChat.blockNextUntilComplete !== false &&
      !completedPhoneChats[dialogScene.id]
    ) {
      return;
    }

    const nextState = gameReducer(state, { type: "CHOOSE", choice });
    dispatch({ type: "CHOOSE", choice });

    if (
      choice.nextSceneId === "ch4_show_painting" &&
      ["ch4_painting_puppet", "ch4_painting_memory", "ch4_painting_safe"].includes(choice.id)
    ) {
      holdStoryBgmDuringPerformance(3600);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_wang_teacher",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_249", "spawn_spawn_246"],
          direction: "left",
          speed: 140,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "camera_focus_spawn",
          payload: { spawnId: "spawn_spawn_246", duration: 500 },
        });
        dispatch({ type: "DIALOG_START", sceneId: choice.nextSceneId });
      }, 3200);
      return;
    }

    if (choice.id === "ch4_roster_test_liuyu" && choice.nextSceneId === "ch4_roster_test_liuyu") {
      holdStoryBgmDuringPerformance(4200);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_246", "spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_247"],
          direction: "right",
          standAfter: true,
          freezeAfter: true,
          speed: 160,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: choice.nextSceneId });
      }, 3800);
      return;
    }

    if (choice.id === "ch3_returned_homework" && choice.nextSceneId === "ch3_prank_returned") {
      holdStoryBgmDuringPerformance(6000);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_276", "spawn_spawn_249", "spawn_spawn_254", { spawnId: "spawn_spawn_253", nearSpawnId: "spawn_spawn_117" }],
          standAfter: true,
          freezeAfter: true,
          speed: 150,
          completedEventId: "ch3_player_returned_homework",
        },
      });
      const onPlayerReturnedHomework = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch3_player_returned_homework") return;
        window.removeEventListener("map-story-event-complete", onPlayerReturnedHomework);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_player_towards", payload: { targetNpcKey: "npc_zhouqirui" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_zhouqirui", targetPlayer: true } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_liuyu", targetPlayer: true } });
        dispatch({ type: "DIALOG_START", sceneId: choice.nextSceneId });
      };
      window.addEventListener("map-story-event-complete", onPlayerReturnedHomework);
      return;
    }

    if (choice.nextSceneId === "ch3_final_answer_warning") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
    }

    // 宿舍第二幕：选择睡觉 → 先触发地图淡出，再延迟显示睡觉对话框
    if (choice.id === "dorm_act2_sleep_now") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_sleep_result" });
      }, 1800);
      return;
    }

    // 7.2 厨房用品店：圆滑应对 → 设 flag_clear 标记后续分支
    if (choice.id === "ch1_shop_smooth_talk") {
      dispatch({ type: "SET_FLAG", flag: "flag_clear" });
    }

    const choiceFlagIds = new Set([
      "ch6_class3_force_through",
      "ch3_joined_prank",
      "ch3_returned_homework",
      "ch3_checked_old_seat_directly",
      "ch3_checked_old_seat_carefully",
      "ch3_answered_final_complex",
      "ch3_answered_final_utilitarian",
      "ch3_answered_final_resist",
      "ch3_told_liuyu_family_danger",
      "ch3_warned_liuyu_danger",
      "ch3_tested_liuyu_loyalty",
      "ch3_asked_count_without_help",
      "ch3_used_mother_as_cover",
      "ch3_admitted_related_to_liuyu",
      "ch3_joked_with_liuyu",
      "ch6_class3_call_zhoujunxiu",
      "ch6_class3_claim_teacher",
      "ch6_class3_counter_pull",
      "ch6_class3_knife_warning",
      "ch6_class3_cut_student",
      "ch6_followed_liuyu_map",
      "ch6_verified_escape_route",
      "ch6_stalled_teacher",
      "ch6_prepared_to_fight_teacher",
      "ch6_vent_commit",
      "ch6_blocked_teacher",
      "ch6_distracted_teacher",
      "ch6_ignored_crying_student",
      "ch6_warned_crying_student",
      "ch6_helped_crying_student",
      "ch6_concealed_teacher_monster",
      "ch6_partial_injury_truth",
      "ch6_described_teacher_monster",
      "ch7_deleted_good_child",
      "ch7_deleted_evening_self_study",
      "ch7_deleted_respect_authority",
      "ch7_told_mother_thinking",
      "ch7_tested_mother_memory",
      "ch7_asked_father_leave",
      "ch7_comforted_father",
      "ch7_delayed_family_intervention",
      "ch7_joined_trial_group",
      "ch7_group_greeting_meme",
      "ch7_group_greeting_honest",
      "ch7_group_greeting_observe",
      "ch7_group_greeting_check_safety",
      "ch7_liuyu_private_confront",
      "ch7_skipped_liuyu_private_chat",
      "ch7_mirror_enter_careful",
      "ch7_mirror_enter_recording",
      "ch7_mirror_enter_direct",
      "ch7_mirror_checked_time",
      "ch8_asked_door_identity",
      "ch8_checked_door_gap",
      "ch8_checked_mirror_again",
      "ch8_opened_door_directly",
      "ch8_challenged_inner_voice",
      "ch8_guided_small_choice",
      "ch8_shared_fear_with_self",
      "ch8_used_school_change_as_proof",
      "ch8_showed_working_city",
      "ch8_showed_sensory_city",
      "ch8_admitted_uncertainty",
      "ch8_framed_rooftop_as_choice",
      "ch8_refused_standard_answer",
      "ch8_admitted_no_complete_answer",
      "ch8_explained_collective_pressure",
      "ch8_asked_present_feeling",
    ]);
    if (choice.id.startsWith("ch2_") || choiceFlagIds.has(choice.id)) {
      dispatch({ type: "SET_FLAG", flag: choice.id });
    }
    if (choice.id === "ch2_hid_outsider_items") {
      changeMapForScene("bedroom", "spawn_spawn_38", choice.nextSceneId, "yps_frames_stand_front");
    }
    if (choice.id === "ch2_searched_rules_first") {
      dispatch({ type: "DIALOG_END" });
      changeMapForScene("bedroom_luggage", "spawn_spawn_38", "ch2_bedroom_initial_search", "yps_frames_stand_front");
      setTimeout(() => gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" }), 700);
      return;
    }
    if (choice.nextSceneId === "ch2_breakfast_violation") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
    }
    if (choice.nextSceneId === "ch2_leave_for_school") {
      dispatch({ type: "SET_FLAG", flag: "ch2_home_initial_investigation_completed" });
    }
    if (choice.id === "ch2_answered_mother_quickly" || choice.id === "ch2_tested_mother_entry") {
      const targetSceneId = state.flags["ch2_hid_outsider_items"] || state.choiceHistory.includes("ch2_hid_outsider_items")
        ? "ch2_mother_checks_room"
        : "ch2_stumble_fail";
      if (targetSceneId === "ch2_stumble_fail") {
        dispatch({ type: "SET_FLAG", flag: "ch2_luggage_warning_triggered" });
        dispatch({ type: "SET_FLAG", flag: "ch2_hid_outsider_items" });
        setReactFlash("red");
        setTimeout(() => setReactFlash(null), 800);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      }
      dispatch({ type: "DIALOG_START", sceneId: targetSceneId });
      return;
    }
    if (choice.id === "ch6_class3_cut_student") {
      dispatch({ type: "SET_FLAG", flag: "ch6_harmed_class3_student" });
    }
    if (choice.id === "ch8_checked_door_gap") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_bathroom_door"],
          direction: "front",
          standAfter: true,
          freezeAfter: true,
          speed: 120,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch8_door_gap_result" });
      }, 1800);
      return;
    }

    if (choice.nextSceneId === "ch7_surface_rule_death") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      return;
    }

    if (choice.nextSceneId === "ch7_family_dynamic_response") {
      enterMapScene("livingroom", "spawn_spawn_87", choice.nextSceneId);
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_73", npcKey: "npc_father", scale: 0.75, framesPrefix: "dad_frames", pose: "sit", direction: "left" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_72", npcKey: "npc_mother", scale: 0.75, framesPrefix: "mom_frames", pose: "sit", direction: "left" } });
      }, 500);
      return;
    }

    if (choice.nextSceneId === "ch7_prepare_mirror") {
      enterMapScene("bathroom", "spawn_spawn_23", choice.nextSceneId);
      return;
    }

    // AI分析静默运行
    if (choice.needAIAnalysis) {
      try {
        const result = await analyzeChoice(nextState, choice.id);
        dispatch({
          type: "ADD_AI_TRACE",
          trace: {
            type: "choice_analysis",
            sceneId: state.currentSceneId,
            result: JSON.stringify(result, null, 2),
            createdAt: new Date().toISOString(),
          },
        });
      } catch {
        // 静默失败
      }
    }
  }

  function handleNext(nextSceneId: string) {
    if (!nextSceneId) {
      const currentScene = dialogScene;
      if (currentScene?.id === "ch1_game_start_system") {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        return;
      }
      if (currentScene?.onCgEnd) {
        if (currentScene.onCgEnd === "enter_balcony") {
          dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
            startRainAmbience();
            gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
            setTimeout(() => {
              gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
              dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
            }, 2000);
          }, 600);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "enter_dormitory_playable") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_cg_end_think" });
          }, 600);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "dorm_return_chair_right") {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "return_dormitory") {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_stop" });
          stopRainAmbience();
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_think" });
          }, 600);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "enter_dormitory_day") {
          dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_9", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_10", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_notice_pc" });
          }, 800);
          dispatch({ type: "DIALOG_END" });
          return;
        }
        if (currentScene.onCgEnd === "ch4_free_classroom_lunch") {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
        if (currentScene.onCgEnd === "ch5_free_gallery" || currentScene.onCgEnd === "ch5_free_class3") {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
        if (currentScene.onCgEnd === "ch6_free_corridor_return") {
          dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          startCorridorDeathTimer();
          return;
        }
        if (currentScene.onCgEnd === "ch6_free_corridor_return_active") {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
        if (
          currentScene.onCgEnd === "ch2_free_bedroom" ||
          currentScene.onCgEnd === "ch2_free_livingroom" ||
          currentScene.onCgEnd === "ch2_free_bathroom" ||
          currentScene.onCgEnd === "ch2_free_kitchen"
        ) {
          dispatch({ type: "DIALOG_END" });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          return;
        }
      }
      if (currentScene?.id === "balcony_night_narrate_2") {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "balcony_night_think" });
        }, 1500);
        return;
      }
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (
      dialogScene?.phoneChat &&
      dialogScene.phoneChat.blockNextUntilComplete !== false &&
      !completedPhoneChats[dialogScene.id]
    ) {
      return;
    }

    if (nextSceneId === "ch2_enter_bedroom") {
      setScreenEffect("shatter_screen");
      playOneShotSound("dungeon_transition");
      window.setTimeout(() => setScreenEffect((current) => current === "shatter_screen" ? null : current), 900);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 500 } });
      enterMapScene("bedroom_luggage", "spawn_spawn_38", nextSceneId, "yps_frames_stand_front");
      return;
    }

    if (nextSceneId === "ch2_bedroom_priority_choice") {
      dispatch({ type: "SET_FLAG", flag: "ch2_date_confirmed" });
      const hidItems = state.flags["ch2_hid_outsider_items"] || state.choiceHistory.includes("ch2_hid_outsider_items");
      changeMapForScene(hidItems ? "bedroom" : "bedroom_luggage", "spawn_spawn_38", nextSceneId, "yps_frames_stand_front");
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch2_bedroom_initial_search") {
      const hidItems = state.flags["ch2_hid_outsider_items"] || state.choiceHistory.includes("ch2_hid_outsider_items");
      changeMapForScene(hidItems ? "bedroom" : "bedroom_luggage", "spawn_spawn_38", nextSceneId, "yps_frames_stand_front");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      }, 700);
      return;
    }

    if (nextSceneId === "ch2_breakfast") {
      changeMapForScene("livingroom", "spawn_spawn_71", nextSceneId, "yps_frames_sit_right");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_72", npcKey: "npc_mother", scale: 0.75, framesPrefix: "mom_frames", pose: "sit", direction: "left" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_73", npcKey: "npc_father", scale: 0.75, framesPrefix: "dad_frames", pose: "sit", direction: "left" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 700);
      return;
    }

    if (nextSceneId === "ch2_breakfast_violation") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch2_study_montage") {
      dispatch({ type: "SET_FLAG", flag: "ch2_warning_skill_discovered" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch2_mother_door_choice") {
      dispatch({ type: "SET_FLAG", flag: "ch2_bedroom_rules_found" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch2_thought_violation_choice") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch2_home_exploration_start") {
      dispatch({ type: "SET_FLAG", flag: "ch2_thoughts_can_violate" });
      enterMapScene("livingroom", "spawn_bedroom", nextSceneId, "yps_frames_stand_back");
      return;
    }

    if (nextSceneId === "ch2_bathroom_investigation") {
      changeMapForScene("bathroom", "spawn_bathroom_door", nextSceneId, "yps_frames_stand_front");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" }), 700);
      return;
    }

    if (nextSceneId === "ch2_kitchen_investigation") {
      changeMapForScene("kitchen", "spawn_kitchen_door", nextSceneId, "yps_frames_stand_front");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" }), 700);
      return;
    }

    if (nextSceneId === "ch2_home_investigation_end") {
      enterMapScene("livingroom", "spawn_spawn_76", nextSceneId, "yps_frames_stand_front");
      return;
    }

    if (nextSceneId === "ch2_enter_classroom") {
      changeMapForScene("classroom", "spawn_spawn_156", nextSceneId, "yps_frames_stand_front");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        const excludedSeatSpawns = new Set([
          "spawn_spawn_132",
          "spawn_spawn_127",
          "spawn_spawn_117",
          "spawn_spawn_145",
          "spawn_spawn_156",
          "spawn_spawn_258",
          "spawn_spawn_246",
          "spawn_spawn_247",
          "spawn_spawn_248",
          "spawn_spawn_249",
          "spawn_spawn_250",
          "spawn_spawn_251",
          "spawn_spawn_252",
          "spawn_spawn_253",
          "spawn_spawn_254",
          "spawn_spawn_255",
          "spawn_spawn_257",
          "spawn_spawn_276",
        ]);
        const randomSeatSpawns = Array.from({ length: 41 }, (_, index) => `spawn_spawn_${115 + index}`)
          .filter((spawnId) => !excludedSeatSpawns.has(spawnId))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "fill_classroom_seats",
          payload: {
            start: 115,
            end: 155,
            exclude: Array.from(excludedSeatSpawns),
            includeSpawns: randomSeatSpawns,
            includeOnly: true,
            framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
          },
        });
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "move_player_path",
          payload: {
            path: ["spawn_spawn_253", "spawn_spawn_248", "spawn_spawn_249", "spawn_spawn_276", "spawn_spawn_132"],
            direction: "back",
            standAfter: false,
            freezeAfter: true,
            speed: 150,
            completedEventId: "ch2_enter_classroom_player_seated",
          },
        });
      }, 700);
      const onClassroomPlayerSeated = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch2_enter_classroom_player_seated") return;
        window.removeEventListener("map-story-event-complete", onClassroomPlayerSeated);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "apply_player_state", payload: { playerState: "yps_frames_sit_back" } });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      };
      window.addEventListener("map-story-event-complete", onClassroomPlayerSeated);
      return;
    }

    if (nextSceneId === "ch6_corridor_pressure") {
      dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
      startCorridorDeathTimer();
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_gallery_explore") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // 检测 CG 结束后的场景转换效果
    const nextScene = scenesRef.current[nextSceneId];
    if (nextScene?.onCgEnd) {
      if (nextScene.onCgEnd === "enter_balcony") {
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
          startRainAmbience();
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
          }, 2000);
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "enter_dormitory_playable") {
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_sit_chair" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_cg_end_think" });
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "dorm_enter_explore") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        }, 300);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (nextScene.onCgEnd === "dorm_return_chair_right") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        dispatch({ type: "DIALOG_END" });
        return;
      }
    }

    // 剧情事件触发
    if (nextSceneId === "ch5_wang_pressure") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_class3_face_closeup") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_exposed" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "balcony_night_narrate_2") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act2_sleep_result") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "fade_out_map", payload: { duration: 1500 } });
      setTimeout(() => {
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 1800);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    if (nextSceneId === "dorm_act3_alarm") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "play_sfx", payload: { key: "alarm_clock", loop: true } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_wake") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "stop_sfx", payload: { key: "alarm_clock" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act3_getup") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "remove_fade_overlay" });
      setEyeOpening(true);
      setTimeout(() => setEyeOpening(false), 2000);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "dorm_act3_pc_on_1") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "left" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_turn_roommate") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "right" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }
    if (nextSceneId === "dorm_act3_roommate_laugh") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "left" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "front" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch1_shop_exchange_2") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_lzx", direction: "back" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // 第四幕入口
    if (nextSceneId === "dorm_act4_return_dorm") {
      dispatch({ type: "CHANGE_MAP", mapId: "dormitory_act4", spawnId: "spawn_spawn_4", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_act4", spawnId: "spawn_spawn_4" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_END" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_sit_down" });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "dorm_act4_return_dorm" });
      }, 450);
      return;
    }

    if (nextSceneId === "dorm_act4_pc_boot_shock") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "change_ground_image", payload: { key: "ground_dorm_night_pc_on" } });
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 250);
      return;
    }

    if (nextSceneId === "dorm_act4_death_cough") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // 死亡结局 → 回到标题
    if (nextSceneId === "title_screen") {
      setTimeout(() => {
        setGamePhase("menu");
      }, 3000);
      dispatch({ type: "ENDING_REACHED" });
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.1 校园小卖部：进入 ──
    if (nextSceneId === "ch1_shop_school_enter") {
      dispatch({ type: "CHANGE_MAP", mapId: "shop_school", spawnId: "spawn_shop_school_entrance", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "shop_school", spawnId: "spawn_shop_school_entrance" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_47", npcKey: "npc_female_assistant", scale: 0.75, framesPrefix: "shop_assistant_female_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_female_assistant", direction: "back" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.2 厨房用品店：进入 ──
    if (nextSceneId === "ch1_shop_enter") {
      dispatch({ type: "CHANGE_MAP", mapId: "shop", spawnId: "spawn_spawn_1", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "shop", spawnId: "spawn_spawn_1" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_3", npcKey: "npc_male_assistant", scale: 0.75, framesPrefix: "shop_assistant_male_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_male_assistant", direction: "back" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.2 厨房用品店：CG过渡回到地图挑衅 ──
    if (nextSceneId === "ch1_shop_confrontation") {
      // 玩家传送到 spawn_spawn_6，面朝上（stand_back）
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 180 } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_6" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "up" } });
      // NPC 重排到挑衅位置
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_2", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_mysterious", direction: "right" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // ── 7.2 厨房用品店：林芷萱离开后分支路由 ──
    if (nextSceneId === "ch1_shop_lzx_leave_branch") {
      const isClear = state.flags["flag_clear"];
      const branchId = isClear ? "ch1_shop_clear_smooth_path" : "ch1_shop_hard_path";
      dispatch({ type: "GO_NEXT", nextSceneId: branchId });
      return;
    }

    // ── 第一章结尾：进入人类进化计划候场区 ──
    if (nextSceneId === "ch1_game_start") {
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "CHANGE_MAP", mapId: "waiting", spawnId: "spawn_waiting_default", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "waiting", spawnId: "spawn_waiting_default" });
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 600);
      return;
    }

    // ── 第3章：学校初入 ──
    if (nextSceneId === "ch3_classroom_entrance") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, setupCh3Classroom, "yps_frames_sit_back");
      return;
    }

    if (nextSceneId === "ch3_homework_prank_liuyu_move") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_249", "spawn_spawn_250", "spawn_spawn_257"],
          speed: 170,
          completedEventId: "ch3_liuyu_faces_zqr",
        },
      });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_zhouqirui", targetNpcKey: "npc_liuyu" } });
      const onLiuyuNearZqr = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch3_liuyu_faces_zqr") return;
        window.removeEventListener("map-story-event-complete", onLiuyuNearZqr);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_liuyu", targetNpcKey: "npc_zhouqirui" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_zhouqirui", targetNpcKey: "npc_liuyu" } });
        dispatch({ type: "DIALOG_START", sceneId: "ch3_homework_prank_liuyu_dialog" });
      };
      window.addEventListener("map-story-event-complete", onLiuyuNearZqr);
      return;
    }

    if (nextSceneId === "ch3_homework_prank_zqr_move") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_zhouqirui",
          path: ["spawn_spawn_254", "spawn_spawn_250", "spawn_spawn_247"],
          speed: 155,
          completedEventId: "ch3_zqr_faces_liuyu",
        },
      });
      const onZqrNearLiuyu = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch3_zqr_faces_liuyu") return;
        window.removeEventListener("map-story-event-complete", onZqrNearLiuyu);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_zhouqirui", targetNpcKey: "npc_liuyu" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_liuyu", targetNpcKey: "npc_zhouqirui" } });
        dispatch({ type: "DIALOG_START", sceneId: "ch3_homework_prank_zqr_dialog" });
      };
      window.addEventListener("map-story-event-complete", onZqrNearLiuyu);
      return;
    }

    if (nextSceneId === "ch3_homework_prank_liuyu_hint") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_liuyu", targetPlayer: true } });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch3_homework_prank_hint_dialog" });
      }, 180);
      return;
    }

    if (nextSceneId === "ch3_homework_prank_start") {
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch3_after_exam_gate") {
      dispatch({ type: "SET_FLAG", flag: "ch3_personality_test_completed" });
      if (dialogScene?.id === "ch3_final_answer_warning") {
        dispatch({ type: "SET_FLAG", flag: "ch3_final_answer_repaired" });
      }
      changeMapForScene("gate_night", "spawn_spawn_176", nextSceneId, "yps_frames_stand_back");
      dispatch({ type: "DIALOG_END" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        spawnGatePassers({
          exclude: [
            "spawn_spawn_185",
            "spawn_spawn_174",
            "spawn_spawn_175",
            "spawn_spawn_176",
            "spawn_spawn_171",
            "spawn_spawn_172",
            "spawn_spawn_173",
            "spawn_spawn_178",
          ],
          count: 5,
          keyPrefix: "npc_ch3_gate_passerby",
        });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_178", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" } });
        const onOpeningWalkComplete = (event: Event) => {
          const detail = (event as CustomEvent<{ eventId?: string }>).detail;
          if (detail?.eventId !== "ch3_after_exam_opening_walk") return;
          window.removeEventListener("map-story-event-complete", onOpeningWalkComplete);
          dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
        };
        window.addEventListener("map-story-event-complete", onOpeningWalkComplete);
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "move_player_path",
          payload: { path: ["spawn_spawn_173"], direction: "back", standAfter: true, freezeAfter: true, speed: 130, completedEventId: "ch3_after_exam_opening_walk" },
        });
      }, 700);
      return;
    }

    if (nextSceneId === "ch3_after_exam_turn_back") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
      setTimeout(() => dispatch({ type: "DIALOG_START", sceneId: "ch3_after_exam_find_liuyu" }), 180);
      return;
    }

    if (nextSceneId === "ch3_after_exam_liuyu_approach") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_liuyu", path: ["spawn_spawn_176"], direction: "back", speed: 130, completedEventId: "ch3_after_exam_liuyu_approached" },
      });
      const onLiuyuApproached = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch3_after_exam_liuyu_approached") return;
        window.removeEventListener("map-story-event-complete", onLiuyuApproached);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_player_towards", payload: { targetNpcKey: "npc_liuyu" } });
        dispatch({ type: "DIALOG_START", sceneId: "ch3_after_exam_greeting" });
      };
      window.addEventListener("map-story-event-complete", onLiuyuApproached);
      return;
    }

    if (nextSceneId === "ch3_after_exam_liuyu_pull_aside") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_liuyu", path: ["spawn_spawn_185"], direction: "back", speed: 130, completedEventId: "ch3_after_exam_liuyu_pulled_aside" },
      });
      const onLiuyuPulledAside = (event: Event) => {
        const detail = (event as CustomEvent<{ eventId?: string }>).detail;
        if (detail?.eventId !== "ch3_after_exam_liuyu_pulled_aside") return;
        window.removeEventListener("map-story-event-complete", onLiuyuPulledAside);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_npc_towards", payload: { npcKey: "npc_liuyu", targetPlayer: true } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "face_player_towards", payload: { targetNpcKey: "npc_liuyu" } });
        dispatch({ type: "DIALOG_START", sceneId: "ch3_after_exam_private_start" });
      };
      window.addEventListener("map-story-event-complete", onLiuyuPulledAside);
      return;
    }

    if (nextSceneId === "ch3_suffocation_start") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch3_suffocation_start") {
      const branchId = state.flags.ch3_joined_prank ? "ch3_suffocation_resolved" : "ch3_suffocation_death";
      dispatch({ type: "GO_NEXT", nextSceneId: branchId });
      return;
    }

    if (nextSceneId === "ch4_exploration_progress" && dialogScene?.id === "ch3_suffocation_resolved") {
      dispatch({ type: "SET_FLAG", flag: "ch3_red_note_fragment_seen" });
      dispatch({ type: "SET_FLAG", flag: "ch3_school_relationship_anchor_found" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    // ── 第4章：跳过第2、3章后直接进入规则发现 ──
    if (nextSceneId === "ch4_find_brochure") {
      enterClassroomScene("spawn_spawn_145", nextSceneId, fillMorningClassroomSeats);
      return;
    }

    if (nextSceneId === "ch4_morning_classroom") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, setupMorningClassroom);
      return;
    }

    if (nextSceneId === "ch4_morning_liuyu_sits") {
      holdStoryBgmDuringPerformance(3000);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_127"],
          direction: "back",
          pose: "sit",
          speed: 160,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 2600);
      return;
    }

    if (nextSceneId === "ch4_roster_test_liuyu") {
      holdStoryBgmDuringPerformance(4200);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_246", "spawn_spawn_252", "spawn_spawn_250", "spawn_spawn_247"],
          direction: "right",
          standAfter: true,
          freezeAfter: true,
          speed: 160,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 3800);
      return;
    }

    if (nextSceneId === "ch4_physics_observe") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => {
        setupLessonClassroom("npc_teacher_li", "teacher_frames");
        setTimeout(() => {
          gameBridge.sendToPhaser({
            type: "STORY_EVENT",
            eventId: "camera_focus_spawn",
            payload: { spawnId: "spawn_spawn_258", duration: 650 },
          });
        }, 120);
      });
      return;
    }

    if (nextSceneId === "ch4_zhou_lunch_approach") {
      enterClassroomFreeScene("spawn_spawn_276", nextSceneId, setupLunchClassroom);
      return;
    }

    if (nextSceneId === "ch4_art_class_start") {
      enterClassroomScene("spawn_spawn_132", nextSceneId, () => {
        setupLessonClassroom("npc_wang_teacher", "wql_frames");
        setTimeout(() => {
          gameBridge.sendToPhaser({
            type: "STORY_EVENT",
            eventId: "camera_focus_spawn",
            payload: { spawnId: "spawn_spawn_258", duration: 650 },
          });
        }, 120);
      });
      return;
    }

    if (nextSceneId === "ch4_show_painting") {
      holdStoryBgmDuringPerformance(3600);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_wang_teacher",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_249", "spawn_spawn_246"],
          direction: "left",
          speed: 140,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "camera_focus_spawn",
          payload: { spawnId: "spawn_spawn_246", duration: 500 },
        });
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 3200);
      return;
    }

    if (nextSceneId === "ch4_greenbelt_start") {
      enterGateScene("spawn_spawn_166", nextSceneId);
      return;
    }

    if (nextSceneId === "ch4_greenbelt_after_walk") {
      holdStoryBgmDuringPerformance(6600);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_179", "spawn_spawn_183", "spawn_spawn_164"],
          direction: "right",
          speed: 150,
        },
      });
      setTimeout(() => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "move_player_path",
          payload: {
            path: ["spawn_spawn_179", "spawn_spawn_184", "spawn_spawn_165"],
            direction: "left",
            standAfter: true,
            freezeAfter: true,
            speed: 150,
          },
        });
      }, 180);
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 6200);
      return;
    }

    if (nextSceneId === "ch5_wang_gallery_enter") {
      enterWangGalleryScene("spawn_wang_gallery_default", nextSceneId);
      return;
    }

    if (nextSceneId === "ch5_return_to_office") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_102" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch5_enter_class3") {
      enterClass3Scene("spawn_spawn_279", nextSceneId);
      return;
    }

    if (nextSceneId === "ch5_class3_exposure") {
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_corridor_return") {
      dispatch({ type: "SET_FLAG", flag: "ch6_escaped_class3" });
      enterMapScene("corridor", "spawn_spawn_38", nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_liuyu_catches_late") {
      clearCorridorDeathTimer();
      enterClassroomScene("spawn_spawn_156", nextSceneId, () => {
        fillClassroomSeats(["spawn_spawn_127", "spawn_spawn_132", "spawn_spawn_145", "spawn_spawn_156", "spawn_spawn_258"]);
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "front" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
      });
      return;
    }

    if (nextSceneId === "ch6_teacher_office_enter") {
      enterTeacherOfficeScene(nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_liuyu_walks_to_player") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_251", "spawn_spawn_252", "spawn_spawn_248", "spawn_spawn_253"],
          direction: "right",
          speed: 150,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch6_liuyu_takes_player" });
      }, 4800);
      return;
    }

    if (nextSceneId === "ch6_teacher_office_liuyu_leaves") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_44", "spawn_spawn_39", "spawn_spawn_38", "spawn_spawn_40"],
          direction: "front",
          speed: 150,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch6_teacher_office_after_liuyu_leaves" });
      }, 3800);
      return;
    }

    if (nextSceneId === "ch6_office_escape_choice") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "spawn_npc",
        payload: {
          spawnId: "spawn_spawn_36",
          npcKey: "npc_teacher",
          scale: 0.75,
          framesPrefix: "teacher_monster_frames",
          pose: "sit",
          direction: "front",
        },
      });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_toilet_encounter") {
      dispatch({ type: "SET_FLAG", flag: "ch6_teacher_office_escaped" });
      dispatch({ type: "SET_FLAG", flag: "ch6_rule_wound" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_after_school_walk") {
      dispatch({ type: "SET_FLAG", flag: "ch6_weekly_exam_completed" });
      enterGateNightScene(nextSceneId);
      return;
    }

    if (nextSceneId === "ch6_after_school_injury") {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhouqirui", direction: "front" } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch6_capture_ritual") {
      dispatch({ type: "SET_FLAG", flag: "ch6_school_root_rule_triggered" });
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch6_ritual_wishes" && nextSceneId === "ch6_ritual_desire_snowball") {
      runFloatingTextSequence("wishes", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch6_ritual_desire_snowball" && nextSceneId === "ch6_ritual_backlash") {
      runFloatingTextSequence("snowball", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch6_ritual_backlash" && nextSceneId === "ch6_numbers_attack") {
      runFloatingTextSequence("backlash", nextSceneId);
      return;
    }

    if (nextSceneId === "ch7_rule_skill_initialize") {
      dispatch({ type: "SET_FLAG", flag: "ch6_active_skill_initializing" });
      dispatch({ type: "SET_FLAG", flag: "ch6_school_rebellion_60" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch7_bad_child_born") {
      dispatch({ type: "SET_FLAG", flag: "ch7_deleted_good_child" });
      dispatch({ type: "SET_FLAG", flag: "ch7_school_bad_child_title" });
      dispatch({ type: "SET_FLAG", flag: "ch7_school_temporarily_closed" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch7_return_livingroom") {
      enterMapScene("livingroom", "spawn_spawn_79", nextSceneId);
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_73", npcKey: "npc_father", scale: 0.75, framesPrefix: "dad_frames", pose: "sit", direction: "left" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_78", npcKey: "npc_mother", scale: 0.75, framesPrefix: "mom_frames", direction: "left" } });
      }, 500);
      return;
    }

    if (dialogScene?.id === "ch7_return_livingroom" && nextSceneId === "ch7_overhear_parents") {
      holdStoryBgmDuringPerformance(4000);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_spawn_80", "spawn_spawn_81", "spawn_spawn_82", "spawn_spawn_73"],
          direction: "down",
          standAfter: true,
          freezeAfter: true,
          speed: 150,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: nextSceneId });
      }, 3600);
      return;
    }

    if (nextSceneId === "ch7_parent_unemployment_performance") {
      runFloatingTextSequence("parents", "ch7_overhear_parents_after");
      return;
    }

    if (nextSceneId === "ch7_prepare_mirror") {
      enterMapScene("bathroom", "spawn_spawn_23", nextSceneId);
      return;
    }

    if (nextSceneId === "ch8_bathroom_knocking") {
      enterMapScene("bathroom", "spawn_spawn_23", nextSceneId);
      return;
    }

    if (nextSceneId === "ch8_mirror_ghost") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch8_walk_to_bathroom_door_identity" || nextSceneId === "ch8_walk_to_bathroom_door_mirror") {
      holdStoryBgmDuringPerformance(2600);
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: {
          path: ["spawn_bathroom_door"],
          direction: "front",
          standAfter: true,
          freezeAfter: true,
          speed: 120,
        },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "ch8_open_bathroom_door" });
      }, 1800);
      return;
    }

    if (nextSceneId === "ch8_bathroom_death_vision") {
      setReactFlash("red");
      setTimeout(() => setReactFlash(null), 800);
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch8_bathroom_death_vision" && nextSceneId === "ch8_return_to_bed") {
      dispatch({ type: "SET_FLAG", flag: "ch8_mirror_truth_fragment_1" });
      dispatch({ type: "SET_FLAG", flag: "ch8_mother_ghost_suspected" });
      dispatch({ type: "SET_FLAG", flag: "ch8_home_mirrors_connected_suspected" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (nextSceneId === "ch8_rooftop_arrival") {
      dispatch({ type: "SET_FLAG", flag: "ch8_left_room_during_check_hours" });
      enterMapScene("rooftop", "spawn_rooftop_default", nextSceneId);
      return;
    }

    if (dialogScene?.id === "ch8_rooftop_resolution" && nextSceneId === "ch8_return_home") {
      dispatch({ type: "SET_FLAG", flag: "ch8_inner_voice_respected" });
      dispatch({ type: "SET_FLAG", flag: "ch8_rooftop_shared_joy" });
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (dialogScene?.id === "ch8_return_home" && nextSceneId === "ch8_demo_personality_review") {
      dispatch({ type: "SET_FLAG", flag: "ch8_abandoned_cry_fragment_2" });
      dispatch({ type: "SET_FLAG", flag: "ch8_demo_story_completed" });
      holdStoryBgmDuringPerformance(30000);
      dispatch({ type: "DIALOG_END" });
      setDemoPortraitGenerating(true);
      void (async () => {
        let portrait: GeneratedPersonalityPortrait;
        try {
          const response = await generatePersonalityPortrait(state);
          portrait = response.result;
          addAITrace("ending_judge", {
            type: "personality_portrait",
            title: portrait.title,
            summary: portrait.summary,
          });
        } catch {
          portrait = createFallbackPersonalityPortrait(state);
        }
        setDemoPortrait(portrait);
        savePortrait({
          endingTitle: portrait.title,
          traits: { ...state.traits },
          timestamp: new Date().toLocaleString("zh-CN"),
          imageDataUrl: portrait.imageDataUrl,
          summary: portrait.summary,
        });
        setDemoPortraitGenerating(false);
        dispatch({ type: "DIALOG_START", sceneId: "ch8_demo_personality_review" });
      })();
      return;
    }

    if (nextSceneId === "ch8_open_final_save") {
      dispatch({ type: "SET_FLAG", flag: "demo_personality_archive" });
      setFinalSaveRequired(true);
      setGameMenuOpen(true);
      return;
    }

    // ── 7.1 校园小卖部：告别挥手 → 播放 stand_front 动画 ──
    if (dialogScene?.id === "ch1_shop_school_farewell") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "GO_NEXT", nextSceneId });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    dispatch({ type: "GO_NEXT", nextSceneId });
  }

  async function handleAIEvent() {
    if (!dialogScene?.aiEvent) return;
    try {
      if (dialogScene.aiEvent === "npc_dialogue") {
        const result = await generateNpcDialogue(state, dialogScene.character ?? "unknown");
        addAITrace("npc_dialogue", result);
      }
      if (dialogScene.aiEvent === "ending_judge") {
        const result = await judgeEnding(state);
        addAITrace("ending_judge", result);
        dispatch({ type: "ENDING_REACHED" });
        // 保存人格画像
        savePortrait({
          endingTitle: dialogScene.text.slice(0, 20) || "结局",
          traits: { ...state.traits },
          timestamp: new Date().toLocaleString("zh-CN"),
        });
      }
    } catch {
      addAITrace(dialogScene.aiEvent, { error: "AI 事件执行失败。" });
    } finally {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }
  }

  function handleCloseDialog() {
    const currentScene = dialogScene;

    if (currentScene?.onCgEnd === "ch6_free_corridor_return") {
      dispatch({ type: "SET_FLAG", flag: "ch6_corridor_returning" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      startCorridorDeathTimer();
      return;
    }
    if (currentScene?.onCgEnd === "ch6_free_corridor_return_active") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "ch1_game_start_system") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "balcony_night_narrate_2") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId: "balcony_night_think" });
      }, 1500);
      return;
    }

    if (currentScene?.id === "dorm_act2_think") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "dorm_act2_explore") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act2_exploring" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.id === "dorm_act2_sleep_result") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "SET_FLAG", flag: "dorm_act3" });
      dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_reflection" });
      return;
    }

    // ── 7.1 校园小卖部：购买阶段交互收集 ──
    if (state.flags["shop_school_buying"]) {
      const itemFlagMap: Record<string, string> = {
        "shop_school_interact_drink": "shop_drink",
        "shop_school_interact_food": "shop_food",
        "shop_school_interact_chips": "shop_chips",
        "shop_school_interact_meat": "shop_meat",
        "shop_school_interact_fruit": "shop_fruit",
      };
      if (itemFlagMap[currentScene?.id ?? ""]) {
        dispatch({ type: "SET_FLAG", flag: itemFlagMap[currentScene!.id] });
        const updatedFlags = { ...state.flags, [itemFlagMap[currentScene!.id]]: true };
        const allCollected = ["shop_drink", "shop_food", "shop_chips", "shop_meat", "shop_fruit"].every(f => updatedFlags[f]);
        if (allCollected) {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_END" });
          setTimeout(() => {
            dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_school_buy_done" });
          }, 300);
          return;
        }
      }
    }

    // ── 第5章：画廊/3班探索阶段 flag ──
    const currentSceneId = currentScene?.id ?? "";
    if (currentSceneId === "ch5_gallery_soft") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_soft_seen" });
      if (state.flags["ch5_gallery_raw_seen"]) dispatch({ type: "SET_FLAG", flag: "ch5_gallery_paintings_seen" });
    }
    if (currentSceneId === "ch5_gallery_raw") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_raw_seen" });
      if (state.flags["ch5_gallery_soft_seen"]) dispatch({ type: "SET_FLAG", flag: "ch5_gallery_paintings_seen" });
    }
    if (currentSceneId === "ch5_gallery_inference") {
      dispatch({ type: "SET_FLAG", flag: "ch5_social_responsibility_realized" });
    }
    if (currentSceneId === "ch5_gallery_materials_warning") {
      dispatch({ type: "SET_FLAG", flag: "ch5_gallery_warning_triggered" });
    }
    if (currentSceneId === "ch5_class3_students") {
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_students_checked" });
    }
    if (currentSceneId === "ch5_class3_rules") {
      dispatch({ type: "SET_FLAG", flag: "ch5_class3_rules_found" });
    }

    // ── 7.1 校园小卖部：进入后解放玩家 ──
    if (currentScene?.id === "ch1_shop_school_enter_narrate") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_buying" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.1 校园小卖部：买完 → 进入结账阶段 ──
    if (currentScene?.id === "ch1_shop_school_buy_done") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_checkout_phase" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.1 校园小卖部：告别挥手 → 播放 stand_front 动画 ──
    if (currentScene?.id === "ch1_shop_school_farewell") {
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "GO_NEXT", nextSceneId: currentScene.nextSceneId! });
      }, 600);
      dispatch({ type: "DIALOG_END" });
      return;
    }

    // ── 7.1 校园小卖部：结账完成 → 进入离开阶段 ──
    if (currentScene?.id === "ch1_shop_school_checkout_think") {
      dispatch({ type: "SET_FLAG", flag: "shop_school_leave_phase" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.2 厨房用品店：进入后解放玩家 ──
    if (currentScene?.id === "ch1_shop_enter_weapon") {
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    // ── 7.2 厨房用品店：获得水果刀 ──
    if (currentScene?.id === "ch1_shop_interact_knife") {
      dispatch({ type: "SET_FLAG", flag: "shop_fruit_knife" });
      dispatch({ type: "DIALOG_END" });
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
      return;
    }

    if (currentScene?.onCgEnd) {
      if (currentScene.onCgEnd === "enter_balcony") {
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
          startRainAmbience();
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
          }, 2000);
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (currentScene.onCgEnd === "dorm_enter_explore") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 200 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_stand_chair_right" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        }, 300);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (currentScene.onCgEnd === "return_dormitory") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_stop" });
        stopRainAmbience();
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory", spawnId: "spawn_spawn_52" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_act2_think" });
        }, 600);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      if (currentScene.onCgEnd === "enter_dormitory_day") {
        dispatch({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "dormitory_day", spawnId: "spawn_spawn_7" });
        setTimeout(() => {
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_8", npcKey: "npc_cyh", scale: 0.75, framesPrefix: "cyh_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_9", npcKey: "npc_roommateA", scale: 0.75, framesPrefix: "roommateA_frames" } });
            gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_10", npcKey: "npc_roommateB", scale: 0.75, framesPrefix: "roommateB_frames" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_cyh", direction: "back" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateA", direction: "left" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_roommateB", direction: "right" } });
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "dorm_act3_notice_pc" });
        }, 800);
        dispatch({ type: "DIALOG_END" });
        return;
      }
      // ── 7.2 厨房用品店：排队 → 开始线索交换 ──
      if (currentScene.onCgEnd === "shop_exchange_start") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_screen", payload: { duration: 180 } });
        // 玩家传送到 spawn_spawn_4，面朝前（stand_front）
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_4" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "down" } });
        // NPC 重排到交换线索位置（spawn_npc 现在支持覆盖已存在的 NPC）
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_5", npcKey: "npc_lzx", scale: 0.75, framesPrefix: "lzx_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_6", npcKey: "npc_delinquent", scale: 0.75, framesPrefix: "delinquent teenagers_frames" } });
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_7", npcKey: "npc_mysterious", scale: 0.75, framesPrefix: "？？？_frames" } });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_END" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_exchange_1" });
        }, 400);
        return;
      }
      // ── 7.2 厨房用品店：对峙结束 → 林芷萱离开CG ──
      if (currentScene.onCgEnd === "shop_lzx_leave") {
        dispatch({ type: "DIALOG_END" });
        setTimeout(() => {
          dispatch({ type: "DIALOG_START", sceneId: "ch1_shop_lzx_leave" });
        }, 300);
        return;
      }
    }
    dispatch({ type: "DIALOG_END" });
    gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
  }

  const handleDialogueTrigger = useCallback((sceneId: string) => {
    let actualSceneId = sceneId;
    const isAct2 = state.flags["dorm_act2"];
    const isAct2Exploring = state.flags["dorm_act2_exploring"];

    if (isAct2 || isAct2Exploring) {
      if (sceneId === "dorm_interact_pc") {
        actualSceneId = isAct2Exploring ? "dorm_act2_pc_force_sleep" : "dorm_act2_pc_confirm";
      }
      if (sceneId === "dorm_interact_clock") {
        actualSceneId = "dorm_act2_clock";
      }
      if (sceneId === "dorm_go_balcony") {
        actualSceneId = "dorm_act2_no_balcony";
      }
    }

    if (actualSceneId === "dorm_go_balcony") {
      dispatch({ type: "DIALOG_END" });
      dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
      gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
      setTimeout(() => {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
        startRainAmbience();
        gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
        }, 2000);
      }, 600);
      return;
    }

    // ── 7.1 校园小卖部：阶段重定向 ──
    const shopSchoolCheckoutPhase = state.flags["shop_school_checkout_phase"];
    const shopSchoolLeavePhase = state.flags["shop_school_leave_phase"];

    if (shopSchoolLeavePhase) {
      const leaveRedirect: Record<string, string> = {
        "shop_school_interact_drink": "shop_school_leave_drink",
        "shop_school_interact_food": "shop_school_leave_food",
        "shop_school_interact_chips": "shop_school_leave_chips",
        "shop_school_interact_meat": "shop_school_leave_meat",
        "shop_school_interact_fruit": "shop_school_leave_fruit",
        "shop_school_interact_exit": "ch1_shop_school_farewell",
        "shop_school_interact_checkout": "shop_school_leave_checkout",
        "shop_school_interact_floor": "shop_school_leave_floor",
      };
      if (leaveRedirect[actualSceneId]) {
        dispatch({ type: "DIALOG_START", sceneId: leaveRedirect[actualSceneId] });
        return;
      }
    } else if (shopSchoolCheckoutPhase) {
      const checkoutRedirect: Record<string, string> = {
        "shop_school_interact_drink": "shop_school_checkout_drink",
        "shop_school_interact_food": "shop_school_checkout_food",
        "shop_school_interact_chips": "shop_school_checkout_chips",
        "shop_school_interact_meat": "shop_school_checkout_meat",
        "shop_school_interact_fruit": "shop_school_checkout_fruit",
        "shop_school_interact_exit": "shop_school_checkout_exit",
        "shop_school_interact_checkout": "ch1_shop_school_checkout_done",
        "shop_school_interact_floor": "shop_school_checkout_floor",
      };
      if (checkoutRedirect[actualSceneId]) {
        dispatch({ type: "DIALOG_START", sceneId: checkoutRedirect[actualSceneId] });
        return;
      }
    }

    // ── 7.2 厨房用品店：空 sceneId trigger 名称映射 ──
    const shopTriggerMap: Record<string, string> = {
      "trigger_8": state.flags["shop_fruit_knife"] ? "ch1_shop_interact_queue" : "ch1_shop_interact_queue_no_weapon",
      "trigger_9": "ch1_shop_interact_knife",
      "trigger_10": "ch1_shop_interact_spatula",
      "trigger_11": "ch1_shop_interact_cleaver",
      "trigger_12": "ch1_shop_interact_pan",
    };
    if (state.currentMapId === "shop" && shopTriggerMap[actualSceneId]) {
      dispatch({ type: "DIALOG_START", sceneId: shopTriggerMap[actualSceneId] });
      return;
    }

    // ── 第2章：卧室探索触发器 ──
    if (state.currentMapId === "bedroom" || state.currentMapId === "bedroom_luggage") {
      const bedroomTriggerMap: Record<string, { sceneId: string; flag?: string }> = {
        trigger_29: { sceneId: "ch2_bedroom_bookshelf", flag: "ch2_bookshelf_seen" },
        trigger_30: { sceneId: "ch2_bedroom_bookshelf", flag: "ch2_bookshelf_seen" },
        trigger_31: { sceneId: "ch2_bedroom_bookshelf", flag: "ch2_bookshelf_seen" },
        trigger_32: { sceneId: "ch2_bedroom_bed", flag: "ch2_plan_bed_seen" },
        trigger_37: { sceneId: "ch2_bedroom_leave_blocked", flag: "ch2_plan_leave_seen" },
        trigger_28: { sceneId: "ch2_bedroom_trash", flag: "ch2_bedroom_trash_seen" },
        trigger_33: { sceneId: "ch2_bedroom_plant", flag: "ch2_bedroom_plant_seen" },
        trigger_26: { sceneId: "ch2_bedroom_computer", flag: "ch2_bedroom_computer_seen" },
      };
      if (actualSceneId === "trigger_43" || actualSceneId === "trigger_44") {
        if (!state.flags["ch2_hid_outsider_items"]) {
          dispatch({ type: "SET_FLAG", flag: "ch2_hid_outsider_items" });
          switchBedroomLuggageToCleanPreservingPlayer();
          dispatch({ type: "DIALOG_START", sceneId: "ch2_bedroom_luggage" });
          return;
        }
        return;
      }
      if (actualSceneId === "trigger_25") {
        gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "move_player_path", payload: { path: ["spawn_spawn_35"], direction: "back", standAfter: false, freezeAfter: true, speed: 120 } });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "apply_player_state", payload: { playerState: "yps_frames_sit_back" } });
        }, 600);
        const leaveBedroomSeat = () => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "player_stand_up" });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "teleport_to_spawn", payload: { spawnId: "spawn_spawn_36" } });
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "apply_player_state", payload: { playerState: "yps_frames_stand_front" } });
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          window.removeEventListener("keydown", leaveBedroomSeat);
        };
        setTimeout(() => window.addEventListener("keydown", leaveBedroomSeat, { once: true }), 650);
        return;
      }
      if (actualSceneId === "trigger_27") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_plan_book_intro" });
        return;
      }
      const mapped = bedroomTriggerMap[actualSceneId];
      if (mapped) {
        if (mapped.flag) dispatch({ type: "SET_FLAG", flag: mapped.flag });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: mapped.sceneId });
        return;
      }
    }

    // ── 第2章：家庭区域触发器 ──
    if (state.currentMapId === "livingroom") {
      if (actualSceneId === "trigger_64") {
        dispatch({ type: "SET_FLAG", flag: "ch2_livingroom_cleanliness_seen" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_livingroom_room_done" });
        return;
      }
      if (actualSceneId === "trigger_68") {
        dispatch({ type: "SET_FLAG", flag: "ch2_family_photo_seen" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_family_photo" });
        return;
      }
      if (actualSceneId === "trigger_62") {
        dispatch({ type: "SET_FLAG", flag: "ch2_family_rules_found" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_family_rules" });
        return;
      }
      if (actualSceneId === "trigger_69") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_livingroom_tv" });
        return;
      }
      if (actualSceneId === "trigger_70") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_livingroom_plant" });
        return;
      }
      if (actualSceneId === "trigger_67") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_livingroom_exit_blocked" });
        return;
      }
      if (actualSceneId === "trigger_63") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        if (state.flags["ch2_family_rules_found"]) {
          dispatch({ type: "SET_FLAG", flag: "ch2_parents_bedroom_noticed" });
          dispatch({ type: "DIALOG_START", sceneId: "ch2_parents_bedroom_notice" });
        } else {
          dispatch({ type: "DIALOG_START", sceneId: "ch2_family_rules_missing" });
        }
        return;
      }
      if (actualSceneId === "trigger_66") {
        if (state.flags["ch2_family_rules_found"]) {
          dispatch({ type: "CHANGE_MAP", mapId: "bathroom", spawnId: "spawn_bathroom_door", position: { x: 0, y: 0 } });
          gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "bathroom", spawnId: "spawn_bathroom_door", playerState: "yps_frames_stand_front" });
          dispatch({ type: "DIALOG_END" });
          setTimeout(() => gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" }), 700);
        } else {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "ch2_family_rules_missing" });
        }
        return;
      }
      if (actualSceneId === "trigger_65") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        if (state.flags["ch2_family_rules_found"]) {
          dispatch({ type: "DIALOG_START", sceneId: "ch2_kitchen_before_bathroom_blocked" });
        } else {
          dispatch({ type: "DIALOG_START", sceneId: "ch2_family_rules_missing" });
        }
        return;
      }
    }

    if (state.currentMapId === "bathroom") {
      if (actualSceneId === "trigger_16") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_bathroom_trash" });
        return;
      }
      if (["trigger_18", "trigger_20", "trigger_21", "trigger_22"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_bathroom_empty" });
        return;
      }
      if (actualSceneId === "trigger_19") {
        dispatch({ type: "SET_FLAG", flag: "ch2_bathroom_rules_found" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_bathroom_rules" });
        return;
      }
      if (actualSceneId === "trigger_17") {
        if (state.flags["ch2_bathroom_rules_found"]) dispatch({ type: "SET_FLAG", flag: "ch2_mirror_entry_suspected" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: state.flags["ch2_bathroom_rules_found"] ? "ch2_bathroom_mirror" : "ch2_bathroom_empty" });
        return;
      }
      if (actualSceneId === "door_livingroom") {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_bathroom_leave_blocked" });
        return;
      }
    }

    if (state.currentMapId === "kitchen") {
      if (actualSceneId === "trigger_18") {
        dispatch({ type: "SET_FLAG", flag: "ch2_kitchen_rules_found" });
        dispatch({ type: "SET_FLAG", flag: "ch2_food_rule_loophole_found" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch2_kitchen_rules" });
        return;
      }
      if (actualSceneId === "door_livingroom") {
        if (!state.flags["ch2_kitchen_rules_found"]) {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "ch2_kitchen_leave_blocked" });
          return;
        }
        dispatch({ type: "CHANGE_MAP", mapId: "livingroom", spawnId: "spawn_spawn_76", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "livingroom", spawnId: "spawn_spawn_76", playerState: "yps_frames_stand_front" });
        dispatch({ type: "DIALOG_END" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: "ch2_home_investigation_end" });
        }, 700);
        return;
      }
    }

    // ── 第4章：教室午休探索触发器 ──
    if (state.currentMapId === "classroom") {
      const isCh4Lunch = state.currentSceneId === "" && (
        state.choiceHistory.includes("ch4_lunch_punished") ||
        state.choiceHistory.includes("ch4_lunch_not_punished")
      );
      if (isCh4Lunch) {
        const classroomTriggerMap: Record<string, string> = {
          trigger_247: state.choiceHistory.includes("ch4_lunch_not_punished") ? "ch4_zhou_help" : "ch4_zhou_question_method",
          trigger_249: "ch4_liuyu_lunch_tease",
          trigger_248: "ch4_seat_busy",
          trigger_246: "ch4_empty_seat_lunch",
          trigger_245: "ch4_lunch_corridor_blocked",
          trigger_250: "ch4_classroom_noticeboard",
          trigger_251: "ch4_classroom_slogan",
        };
        if (classroomTriggerMap[actualSceneId]) {
          gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
          dispatch({ type: "DIALOG_START", sceneId: classroomTriggerMap[actualSceneId] });
          return;
        }
      }
    }

    // ── 第6章：20秒内奔回本班 ──
    if (state.currentMapId === "corridor" && state.flags["ch6_corridor_returning"]) {
      if (actualSceneId === "trigger_36") {
        clearCorridorDeathTimer();
        dispatch({ type: "SET_FLAG", flag: "ch6_reached_classroom_in_time" });
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_reached_classroom" });
        return;
      }
      if (["trigger_37", "trigger_53"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_wrong_room" });
        return;
      }
      if (["trigger_51", "trigger_50"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_wrong_direction" });
        return;
      }
      if (["trigger_34", "trigger_35"].includes(actualSceneId)) {
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_toilet_direction" });
        return;
      }
    }

    // ── 第5章：王沁林画廊探索触发器 ──
    if (state.currentMapId === "wang_gallery") {
      const softPaintingTriggers = new Set(["trigger_88", "trigger_90", "trigger_92", "trigger_94"]);
      const rawPaintingTriggers = new Set(["trigger_89", "trigger_91", "trigger_93", "trigger_95"]);
      const materialTriggers = new Set(["trigger_96", "trigger_97", "trigger_99", "trigger_100", "trigger_101", "trigger_102", "trigger_103", "trigger_104"]);

      if (softPaintingTriggers.has(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_soft" });
        return;
      }
      if (rawPaintingTriggers.has(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_raw" });
        return;
      }
      if (actualSceneId === "trigger_end") {
        const targetSceneId = !state.flags["ch5_gallery_paintings_seen"]
          ? "ch5_gallery_infer_need_paintings"
          : "ch5_gallery_inference";
        dispatch({ type: "DIALOG_START", sceneId: targetSceneId });
        return;
      }
      if (materialTriggers.has(actualSceneId)) {
        if (state.flags["ch5_social_responsibility_realized"]) {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "flash_red", payload: { duration: 800 } });
        }
        dispatch({
          type: "DIALOG_START",
          sceneId: state.flags["ch5_social_responsibility_realized"] ? "ch5_gallery_materials_warning" : "ch5_gallery_materials_wait",
        });
        return;
      }
      if (actualSceneId === "trigger_48") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_gallery_leave_blocked" });
        return;
      }
    }

    // ── 第5章：3班探索触发器 ──
    if (state.currentMapId === "classroom_3") {
      if (["trigger_283", "trigger_284", "trigger_285"].includes(actualSceneId)) {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_students" });
        return;
      }
      if (actualSceneId === "trigger_251") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_slogan" });
        return;
      }
      if (actualSceneId === "trigger_245") {
        dispatch({ type: "DIALOG_START", sceneId: "ch5_class3_leave_blocked" });
        return;
      }
      if (actualSceneId === "trigger_250") {
        dispatch({
          type: "DIALOG_START",
          sceneId: state.flags["ch5_class3_students_checked"] ? "ch5_class3_rules" : "ch5_class3_rules_wait",
        });
        return;
      }
    }

    const scene = scenesRef.current[actualSceneId];
    if (scene?.onCgEnd) {
      if (scene.onCgEnd === "enter_balcony") {
        dispatch({ type: "DIALOG_END" });
        dispatch({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77", position: { x: 0, y: 0 } });
        gameBridge.sendToPhaser({ type: "CHANGE_MAP", mapId: "balcony_night", spawnId: "spawn_spawn_77" });
        setTimeout(() => {
          gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "rain_start" });
          startRainAmbience();
          gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
          setTimeout(() => {
            gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
            dispatch({ type: "DIALOG_START", sceneId: "balcony_night_narrate_1" });
          }, 2000);
        }, 600);
        return;
      }
    }

    dispatch({ type: "DIALOG_START", sceneId: actualSceneId });
  }, [state.flags, state.currentMapId, state.currentSceneId, state.choiceHistory]);

  // 当前对话预览（用于存档）
  const dialogPreview = dialogScene
    ? `[${dialogScene.speaker || "旁白"}] ${dialogScene.text.slice(0, 20)}`
    : "";
  // 当前章节名（用于存档槽显示）
  const currentChapter = dialogScene?.chapter ?? "";

  const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

  const clearCorridorDeathTimer = useCallback(() => {
    if (corridorDeathTimerRef.current !== null) {
      window.clearInterval(corridorDeathTimerRef.current);
      corridorDeathTimerRef.current = null;
    }
    setCorridorCountdown(null);
  }, []);

  const startCorridorDeathTimer = useCallback(() => {
    clearCorridorDeathTimer();
    setCorridorCountdown(20);
    corridorDeathTimerRef.current = window.setInterval(() => {
      setCorridorCountdown((remaining) => {
        if (remaining === null) return null;
        if (remaining > 1) return remaining - 1;

        if (corridorDeathTimerRef.current !== null) {
          window.clearInterval(corridorDeathTimerRef.current);
          corridorDeathTimerRef.current = null;
        }
        gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
        dispatch({ type: "DIALOG_START", sceneId: "ch6_corridor_timeout_death" });
        return null;
      });
    }, 1000);
  }, [clearCorridorDeathTimer]);

  const getScenePlayerState = useCallback((sceneId: string, fallback?: string) => {
    return scenesRef.current[sceneId]?.playerState || fallback;
  }, []);

  const changeMapForScene = useCallback((mapId: string, spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    const playerState = getScenePlayerState(sceneId, fallbackPlayerState);
    dispatch({ type: "CHANGE_MAP", mapId, spawnId, position: { x: 0, y: 0 } });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId,
      spawnId,
      ...(playerState ? { playerState } : {}),
    });
  }, [getScenePlayerState]);

  const switchBedroomLuggageToCleanPreservingPlayer = useCallback(() => {
    const runtime = gameBridge.captureMapRuntime();
    const preservedRuntime = runtime
      ? {
          ...runtime,
          mapId: "bedroom" as const,
          player: { ...runtime.player, frozen: true },
        }
      : undefined;
    dispatch({
      type: "CHANGE_MAP",
      mapId: "bedroom",
      spawnId: "spawn_spawn_38",
      position: runtime ? { x: runtime.player.x, y: runtime.player.y } : { x: 0, y: 0 },
    });
    gameBridge.sendToPhaser({
      type: "CHANGE_MAP",
      mapId: "bedroom",
      spawnId: "spawn_spawn_38",
      ...(preservedRuntime ? { runtimeSnapshot: preservedRuntime } : { playerState: "yps_frames_stand_front" }),
    });
  }, []);

  const enterMapScene = useCallback((mapId: string, spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene(mapId, spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const addFloatingText = useCallback((item: Omit<FloatingTextItem, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setFloatingTexts(prev => [...prev, { ...item, id }]);
    return id;
  }, []);

  const removeFloatingText = useCallback((id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  const runFloatingTextSequence = useCallback(async (sequence: "wishes" | "snowball" | "backlash" | "parents", nextSceneId: string) => {
    setFloatingTextPerformanceActive(true);
    const show = async (item: Omit<FloatingTextItem, "id">, delay: number) => {
      addFloatingText(item);
      await wait(delay);
    };

    if (sequence === "parents") {
      setFloatingTexts([]);
      const showSingle = async (text: string, x: string, y: string, delay = 2400, width = "34%") => {
        const id = addFloatingText({ text, x, y, fontSize: 25, width, variant: "normal" });
        await wait(delay);
        removeFloatingText(id);
        await wait(260);
      };
      await showSingle("母亲：你什么时候回来的？之前不是说大概十一点才到家吗？", "58%", "24%", 3000);
      await showSingle("父亲：没什么事，我就先回来了。", "12%", "36%", 2400);
      await showSingle("母亲：……你说的休假是骗我的，对么？", "58%", "32%", 3000);
      await showSingle("外面传来一阵摩擦声，貌似是母亲在父亲身边坐下了。", "50%", "50%", 3000, "42%");
      await showSingle("母亲：你被裁了？", "58%", "28%", 2200);
      await showSingle("父亲：……", "12%", "36%", 1800);
      await showSingle("母亲：好，我知道了。这些年攒下了一些积蓄，够平生读大学。我这边还能再撑一会。", "58%", "30%", 4200);
      await showSingle("父亲：是我对不起你们……", "12%", "38%", 2600);
      await showSingle("母亲：别说了。经济不景气，房地产更是……我们这样的寻常百姓又能左右什么？认命吧。", "58%", "34%", 4600);
      playOneShotSound("water_running");
      await showSingle("厨房传来哗哗水声。", "50%", "50%", 2200, "34%");
      await showSingle("母亲：你要是真觉得对不起我们，就主动帮我把家务干了。", "58%", "36%", 3600);
      setFloatingTexts([]);
      setFloatingTextPerformanceActive(false);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (sequence === "wishes") {
      setFloatingTexts([]);
      const wishes = [
        ["保佑我考上清华……", "8%", "14%", 24, undefined, 2200],
        ["保佑我这次竞赛拿省一……", "58%", "18%", 24, undefined, 2200],
        ["保佑我上985……", "12%", "38%", 24, undefined, 2200],
        ["保佑我上211……", "62%", "42%", 24, undefined, 2200],
        ["保佑学校高考均分再创新高……", "10%", "62%", 24, undefined, 2800],
        ["保佑我今年升职加薪……", "58%", "64%", 24, undefined, 2200],
        ["保佑我入选优秀教师……", "35%", "28%", 24, undefined, 2200],
        ["保佑我年终KPI达到平均以上……", "34%", "74%", 24, undefined, 2800],
      ] as const;
      for (const [text, x, y, fontSize, width, delay] of wishes) {
        await show({ text, x, y, fontSize, width, variant: "normal" }, delay);
      }
      for (const [text, fontSize, delay] of [["保佑我功成名就……", 42, 2400], ["保佑我功成名就。", 56, 2400], ["保佑我功成名就！", 76, 2800]] as const) {
        const id = addFloatingText({ text, x: "50%", y: "50%", fontSize, variant: "climax" });
        await wait(delay);
        removeFloatingText(id);
      }
      setFloatingTexts([]);
      await wait(500);
      setFloatingTextPerformanceActive(false);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    if (sequence === "snowball") {
      setFloatingTexts([]);
      const texts = [
        ["神啊！您显灵了！", "10%", "12%", 28, undefined, 2000],
        ["哈哈！我考上了，我考上了！", "58%", "16%", 28, undefined, 2400],
        ["喜报！XX中学高考成绩节节高！", "34%", "28%", 26, undefined, 2600],
        ["不够，还不够，211还不够。我还不够努力，我还不够优秀，他们几个都能考上985，我还可以考得更好，我要复读！", "6%", "42%", 24, "40%", 4800],
        ["不够，还不够。就业市场如此多变，连这些清华北大毕业的还有这么多人失业，为了拿到一份体面的工作，我要考研！……考公考编！他们都说，能上岸的！", "54%", "40%", 24, "40%", 5600],
        ["不够，还不够。学生还不够拼命，我们也不够拼命……也许应该将分层教学实施得更精细，分三个级部，每个级部分两个尖子班……对，两个尖子班，他们不能没有竞争。", "7%", "68%", 24, "43%", 5800],
        ["不够，还不够。这届理科学生一个高二强基保送清华，一个高考考入清华，我看市里最好的高中有三个进了清华；文科只有一个考入北大，但也侥幸……是不是应该把中考录取分数线再提高一点？", "53%", "66%", 24, "42%", 6200],
      ] as const;
      for (const [text, x, y, fontSize, width, delay] of texts) {
        await show({ text, x, y, fontSize, width, variant: "gold" }, delay);
      }
      setFloatingTexts([]);
      setFloatingTextPerformanceActive(false);
      dispatch({ type: "GO_NEXT", nextSceneId });
      return;
    }

    setFloatingTexts([]);
    const backlash = [
      ["满墙的标语和老师日日的鼓励，我知道那多少有些真情实感，但是我为什么这么害怕看到它们？我真的好累，我真的不想再学了，这些东西我真的学不会！可是我也必须‘只要学不死就往死里学’，我不想再复读了，我不想再看到父母那两双失望的眼睛！为什么要逼我？", "5%", "10%", 22, "45%", 7000],
      ["老师你不是说读完高中就解放了吗？为什么到了大学还要再学这些恶心的东西，我真的受够了！为什么现在还要逼我？", "53%", "12%", 22, "41%", 4800],
      ["我曾经以为自己是天之骄子。可被所有人碾压以后，我才发现自己什么都不是。放弃吧，这辈子也就这样了。", "8%", "42%", 22, "39%", 4600],
      ["读完研还是找不到工作……什么上岸？哈哈……", "60%", "40%", 24, "30%", 3400],
      ["我究竟还要哄骗这些孩子多久？为了让他们高考全力以赴，这种洗脑究竟正确吗？但是，这也是为了他们好啊。", "6%", "68%", 22, "42%", 5000],
      ["这次体检报告已经有三个危险指标了。为了这份工作，我这么拼命，真的值得吗？", "56%", "62%", 22, "36%", 4200],
      ["隔壁班的黄老师突发心脏病，在讲台上就……诶，她才40多岁啊。", "34%", "82%", 22, "44%", 4200],
    ] as const;
    for (const [text, x, y, fontSize, width, delay] of backlash) {
      await show({ text, x, y, fontSize, width, variant: "backlash" }, delay);
    }
    setFloatingTexts([]);
    setFloatingTextPerformanceActive(false);
    dispatch({ type: "GO_NEXT", nextSceneId });
  }, [addFloatingText, removeFloatingText]);

  const fillClassroomSeats = useCallback((exclude: string[], includeSpawns: string[] = [], includeOnly = false) => {
    gameBridge.sendToPhaser({
      type: "STORY_EVENT",
      eventId: "fill_classroom_seats",
      payload: {
        start: 115,
        end: 155,
        exclude: [
          ...exclude,
          "spawn_spawn_145",
          "spawn_spawn_156",
          "spawn_spawn_258",
          "spawn_spawn_246",
          "spawn_spawn_247",
          "spawn_spawn_248",
          "spawn_spawn_249",
          "spawn_spawn_250",
          "spawn_spawn_251",
          "spawn_spawn_252",
          "spawn_spawn_253",
        ],
        includeSpawns,
        includeOnly,
        framesPrefixes: ["npc_female1_frames", "npc_male_frames"],
      },
    });
  }, []);

  const fillMorningClassroomSeats = useCallback(() => {
    const occupiedSpawns = new Set([
      "spawn_spawn_117",
      "spawn_spawn_127",
      "spawn_spawn_132",
      "spawn_spawn_145",
      "spawn_spawn_156",
      "spawn_spawn_258",
      "spawn_spawn_246",
      "spawn_spawn_247",
      "spawn_spawn_248",
      "spawn_spawn_249",
      "spawn_spawn_250",
      "spawn_spawn_251",
      "spawn_spawn_252",
      "spawn_spawn_253",
    ]);
    const candidates = Array.from({ length: 41 }, (_, index) => `spawn_spawn_${115 + index}`)
      .filter((spawnId) => !occupiedSpawns.has(spawnId));
    const selected = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
    fillClassroomSeats(Array.from(occupiedSpawns), selected, true);
  }, [fillClassroomSeats]);

  const setupCh3Classroom = useCallback(() => {
    fillClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_145", "spawn_spawn_253", "spawn_spawn_255"]);
    gameBridge.sendToPhaser({
      type: "STORY_EVENT",
      eventId: "spawn_npc",
      payload: { spawnId: "spawn_spawn_255", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" },
    });
    gameBridge.sendToPhaser({
      type: "STORY_EVENT",
      eventId: "spawn_npc",
      payload: { spawnId: "spawn_spawn_253", nearSpawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", direction: "front" },
    });
  }, [fillClassroomSeats]);

  const enterClassroomScene = useCallback((spawnId: string, sceneId: string, setup?: () => void, fallbackPlayerState?: string) => {
    changeMapForScene("classroom", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setup?.();
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterClassroomFreeScene = useCallback((spawnId: string, sceneId: string, setup?: () => void, fallbackPlayerState?: string) => {
    changeMapForScene("classroom", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setup?.();
      gameBridge.sendToPhaser({ type: "UNFREEZE_PLAYER" });
    }, 700);
  }, [changeMapForScene]);

  const setupMorningClassroom = useCallback(() => {
    fillMorningClassroomSeats();
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_156", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "left" } });
    setTimeout(() => {
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: {
          npcKey: "npc_liuyu",
          path: ["spawn_spawn_248", "spawn_spawn_250", "spawn_spawn_252", "spawn_spawn_246"],
          direction: "left",
          speed: 160,
        },
      });
    }, 500);
  }, [fillMorningClassroomSeats]);

  const setupLessonClassroom = useCallback((teacherKey = "npc_teacher_li", teacherFrames = "teacher_frames") => {
    fillClassroomSeats(["spawn_spawn_132", "spawn_spawn_127", "spawn_spawn_117"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_258", npcKey: teacherKey, scale: 0.75, framesPrefix: teacherFrames } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: teacherKey, direction: "down" } });
  }, [fillClassroomSeats]);

  const setupLunchClassroom = useCallback(() => {
    fillClassroomSeats(["spawn_spawn_127", "spawn_spawn_117", "spawn_spawn_132", "spawn_spawn_145"]);
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_127", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", pose: "sit", direction: "back" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_117", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames", pose: "sit", direction: "back" } });
  }, [fillClassroomSeats]);

  const enterGateScene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("gate", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_player_anim", payload: { direction: "left" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_166", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "left" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterWangGalleryScene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("wang_gallery", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_45", npcKey: "npc_wang_teacher", scale: 0.75, framesPrefix: "wql_frames", pose: "sit", direction: "right" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_46", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames", pose: "sit", direction: "left" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterTeacherOfficeScene = useCallback((sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("teacher_office", "spawn_spawn_35", sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_36", npcKey: "npc_teacher", scale: 0.75, framesPrefix: "teacher_frames", pose: "sit", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_37", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames", direction: "back" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_teacher", direction: "front" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "back" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene]);

  const enterGateNightScene = useCallback((sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("gate_night", "spawn_spawn_176", sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      const reservedSpawns = new Set([
        "spawn_spawn_171",
        "spawn_spawn_172",
        "spawn_spawn_173",
        "spawn_spawn_174",
        "spawn_spawn_175",
        "spawn_spawn_176",
      ]);
      const gateSpawnCandidates = Array.from(
        { length: 21 },
        (_, index) => `spawn_spawn_${164 + index}`,
      ).filter((spawnId) => !reservedSpawns.has(spawnId));
      const randomGateSpawns = [...gateSpawnCandidates]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      const directions = ["front", "back", "left", "right"];

      randomGateSpawns.forEach((spawnId, index) => {
        gameBridge.sendToPhaser({
          type: "STORY_EVENT",
          eventId: "spawn_npc",
          payload: {
            spawnId,
            npcKey: `npc_gate_passerby_${index}`,
            scale: 0.75,
            framesPrefix: index % 2 === 0 ? "npc_female1_frames" : "npc_male_frames",
            direction: directions[Math.floor(Math.random() * directions.length)],
          },
        });
      });

      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_174", npcKey: "npc_liuyu", scale: 0.75, framesPrefix: "ly_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_175", npcKey: "npc_zhouqirui", scale: 0.75, framesPrefix: "zqr_frames" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_liuyu", direction: "back" } });
      gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhouqirui", direction: "back" } });
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_player_path",
        payload: { path: ["spawn_spawn_173"], direction: "back", standAfter: true, freezeAfter: true, speed: 120 },
      });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_liuyu", path: ["spawn_spawn_171"], direction: "back", speed: 120 },
      });
      gameBridge.sendToPhaser({
        type: "STORY_EVENT",
        eventId: "move_npc_path",
        payload: { npcKey: "npc_zhouqirui", path: ["spawn_spawn_172"], direction: "back", speed: 120 },
      });
      setTimeout(() => {
        dispatch({ type: "DIALOG_START", sceneId });
      }, 1800);
    }, 700);
  }, [changeMapForScene]);

  const setupClass3 = useCallback(() => {
    fillClassroomSeats(
      ["spawn_spawn_279", "spawn_spawn_126"],
      ["spawn_spawn_251", "spawn_spawn_256", "spawn_spawn_261", "spawn_spawn_266", "spawn_spawn_271", "spawn_spawn_277", "spawn_spawn_282"],
    );
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "spawn_npc", payload: { spawnId: "spawn_spawn_126", npcKey: "npc_zhoujunxiu", scale: 0.75, framesPrefix: "zjx_frames" } });
    gameBridge.sendToPhaser({ type: "STORY_EVENT", eventId: "set_npc_direction", payload: { npcKey: "npc_zhoujunxiu", direction: "up" } });
  }, [fillClassroomSeats]);

  const enterClass3Scene = useCallback((spawnId: string, sceneId: string, fallbackPlayerState?: string) => {
    changeMapForScene("classroom_3", spawnId, sceneId, fallbackPlayerState);
    dispatch({ type: "DIALOG_END" });
    setTimeout(() => {
      setupClass3();
      gameBridge.sendToPhaser({ type: "FREEZE_PLAYER" });
      dispatch({ type: "DIALOG_START", sceneId });
    }, 700);
  }, [changeMapForScene, setupClass3]);

  // ── 开始菜单阶段 ──
  if (gamePhase === "menu") {
    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
        <StartMenu
          onNewGame={handleNewGame}
          onStartChapter4={handleStartChapter4}
          onLoadGame={handleLoadGame}
          onShowPortrait={() => setShowPortraitPanel(true)}
          onExit={() => {
            // 浏览器环境下尝试关闭窗口
            window.close();
          }}
        />
        {showPortraitPanel && (
          <PersonalityPortrait onClose={() => setShowPortraitPanel(false)} />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* ── 右上角菜单按钮（直接打开游戏菜单） ── */}
      <div className="menu-button" onClick={() => setGameMenuOpen(true)}>
        菜单
      </div>

      {/* ── Phaser 地图（始终可见） ── */}
      <PhaserContainer
        dispatch={dispatch}
        currentMapId={state.currentMapId}
        onDialogueTrigger={handleDialogueTrigger}
      />

      {/* ── 睁眼效果遮罩 ── */}
      {eyeOpening && <div className="eye-open-overlay blinking" />}

      {/* ── React 闪屏层 ── */}
      {reactFlash && <div className={`react-flash-overlay ${reactFlash}`} />}
      {screenEffect && <div className={`scripted-screen-effect ${screenEffect}`} />}

      {demoPortraitGenerating && (
        <div className="demo-portrait-generating">
          <div className="demo-portrait-generating-text">正在生成阶段人格画像……</div>
        </div>
      )}

      {aiSceneLoadingId && (
        <div className="ai-scene-generating">
          <div className="ai-scene-generating-text">正在生成动态剧情……</div>
        </div>
      )}

      {/* ── 第六章奔回本班倒计时 ── */}
      {corridorCountdown !== null && (
        <div
          style={{
            position: "absolute",
            zIndex: 45,
            top: 22,
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 104,
            padding: "8px 18px",
            border: "2px solid rgba(255,255,255,0.85)",
            borderRadius: 8,
            background: "rgba(10, 10, 14, 0.78)",
            color: corridorCountdown <= 5 ? "#ff5252" : "#fff",
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 2px 6px #000",
            pointerEvents: "none",
          }}
        >
          {corridorCountdown}
        </div>
      )}

      {/* ── 屏幕文字演出层 ── */}
      {floatingTexts.length > 0 && (
        <div className="floating-text-layer">
          {floatingTexts.map(item => (
            <div
              key={item.id}
              className={`floating-text ${item.variant ?? "normal"}`}
              style={{
                left: item.x,
                top: item.y,
                fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                width: item.width,
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {dialogScene?.cgMode && dialogScene.phoneChat && !dialogScene.background && (
        <div className="phone-cg-blackout" aria-hidden="true" />
      )}

      {/* ── 手机群聊演出层 ── */}
      {dialogScene?.phoneChat && (
        <PhoneChatOverlay
          sceneId={dialogScene.id}
          chat={dialogScene.phoneChat}
          onComplete={() => {
            setCompletedPhoneChats(prev => ({ ...prev, [dialogScene.id]: true }));
            const chat = scenes[dialogScene.id]?.phoneChat;
            if (!chat || (chat.view && chat.view !== "chat") || chat.messages.length === 0) return;
            const key = `${chat.title}::${chat.subtitle ?? ""}`;
            setPhoneChatHistories(prev => ({
              ...prev,
              [key]: [...(prev[key] ?? []), ...chat.messages],
            }));
          }}
        />
      )}

      {/* ── 对话叠层 ── */}
      {dialogScene && dialogScene.cgMode && (
        <CgOverlay
          scene={dialogScene}
          onNext={handleNext}
          onChoose={handleChoose}
          hideUi={floatingTextPerformanceActive || aiSceneIsLoading || phoneChatIsBlocking}
          centerImageSrc={["ch8_demo_personality_review", "ch8_demo_ending"].includes(dialogScene.id) ? demoPortrait?.imageDataUrl : undefined}
          shouldTransitionTo={shouldCgTransitionTo}
          preserveForPerformance={[
            "ch6_ritual_wishes",
            "ch6_ritual_desire_snowball",
            "ch6_ritual_backlash",
          ].includes(dialogScene.id)}
          onSegmentStart={handleDialogSegmentStart}
        />
      )}
      {dialogScene?.infoPanel && (
        <SystemInfoOverlay
          panel={dialogScene.infoPanel}
          closing={closingInfoPanelSceneId === dialogScene.id}
        />
      )}
      {dialogScene && !floatingTextPerformanceActive && !aiSceneIsLoading && !dialogScene.cgMode && (
        <DialogOverlay
          scene={dialogScene}
          onNext={(nextSceneId) => dialogScene.infoPanel
            ? handleInfoPanelNext(dialogScene.id, nextSceneId)
            : handleNext(nextSceneId)}
          onChoose={handleChoose}
          onAIEvent={handleAIEvent}
          onClose={handleCloseDialog}
          onSegmentStart={handleDialogSegmentStart}
          onSegmentDone={handleDialogSegmentDone}
        />
      )}

      {/* ── UI 面板 ── */}
      {state.endingReached && <StatusPanel state={state} />}
      {showAITrace && <AITracePanel traces={state.aiTraces} />}

      {/* ── 游戏内菜单（ESC 打开） ── */}
      {gameMenuOpen && (
        <GameMenu
          key={finalSaveRequired ? "final-save" : "game-menu"}
          state={state}
          onClose={() => setGameMenuOpen(false)}
          onLoadState={(loaded) => restoreLoadedGame(loaded, true)}
          onRestart={handleRestart}
          onExitToTitle={handleExitToTitle}
          onShowBacklog={() => setShowBacklog(true)}
          onShowNotebook={() => setShowNotebookPanel(true)}
          dialogPreview={dialogPreview}
          currentChapter={currentChapter}
          initialPage={finalSaveRequired ? "save" : "main"}
          forceSave={finalSaveRequired}
          onSaveComplete={finalSaveRequired ? () => {
            setFinalSaveRequired(false);
            setGameMenuOpen(false);
            setGamePhase("menu");
          } : undefined}
        />
      )}

      {/* ── 对话回顾 ── */}
      {showBacklog && (
        <Backlog
          entries={dialogHistory}
          onClose={() => setShowBacklog(false)}
        />
      )}

      {/* ── 人格画像面板（游戏内查看） ── */}
      {showPortraitPanel && (
        <PersonalityPortrait onClose={() => setShowPortraitPanel(false)} />
      )}

      {showNotebookPanel && (
        <NotebookPanel state={state} onClose={() => setShowNotebookPanel(false)} />
      )}

      {showTutorialPanel && (
        <TutorialPanel onClose={closeTutorialPanel} />
      )}
    </div>
  );
}
