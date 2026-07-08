from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(".")
SCENES = ROOT / "client/src/data/scenes.ts"

MAP_BACKGROUNDS = {
    "classroom": "/assets/maps/classroom/教室.png",
    "classroom_3": "/assets/maps/classroom_3/教室.png",
    "gate": "/assets/maps/gate/校门白天.png",
    "gate_night": "/assets/maps/gate/校门夜晚.png",
    "wang_gallery": "/assets/maps/wang_gallery/美术教室.png",
    "teacher_office": "/assets/maps/teacher_office/教师办公室.png",
    "corridor": "/assets/maps/corridor/走廊.png",
    "bathroom": "/assets/maps/bathroom/卫生间.png",
    "rooftop": "/assets/maps/rooftop/天台.png",
}

TITLE_SCENE_IDS = {
    "绿化带谈判": "ch5_liuyu_negotiate",
    "提出合作条件": "ch5_liuyu_negotiation_choice",
    "刘宇接受有限合作": "ch5_liuyu_dynamic_response",
    "权限推理": "ch5_permission_inference",
    "刘宇评价推断": "ch5_liuyu_permission_reaction",
    "前往五楼": "ch5_go_to_wang_gallery",
    "进入王沁林工作室": "ch5_wang_gallery_enter",
    "调查王沁林的画廊": "ch5_gallery_explore",
    "返回办公室": "ch5_return_to_office",
    "如何接近周隽秀": "ch5_offer_help_choice",
    "周隽秀回应帮助": "ch5_zhoujunxiu_help_response",
    "向王沁林提问": "ch5_wang_trade_opening",
    "回应王沁林的压力": "ch5_wang_pressure_choice",
    "触碰教师边界": "ch5_wang_boundary_warning",
    "王沁林提出交易": "ch5_wang_trade_terms",
    "确认交易谜题": "ch5_trade_riddles_confirmed",
    "陪周隽秀返回3班": "ch5_walk_with_zhoujunxiu",
    "如何看待周隽秀": "ch5_zhoujunxiu_conversation_choice",
    "周隽秀决定是否信任主角": "ch5_zhoujunxiu_dynamic_reply",
    "进入3班": "ch5_enter_class3",
    "调查3班": "ch5_class3_explore",
    "避免被认出": "ch5_class3_disguise_choice",
    "陌生同学": "ch5_class3_exposure",
}

MANUAL_SCENES = [
    {
        "id": "ch5_gallery_soft",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[旁白]这些画面精美、技巧成熟，情绪被妥善收束在构图和色彩里。它们大多出自王老师带的研究生。\n\n[主角]（但王老师真正想看到的，似乎不是这些。）",
    },
    {
        "id": "ch5_gallery_raw",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[旁白]这些画都有一个明显的共同点——似乎是某种情绪的宣泄，露骨、直白、一针见血。\\n\\n被极度束缚的灵魂呐喊着、怒吼着、痛斥着，试图挣脱外界给予的桎梏，但是，一次、两次、无数次……它失败、尝试、失败、再尝试，反反复复。\n\n[主角]（就像无限递归的函数陷入死循环，哪怕是一条无止境的死路，它也要坚持到灰飞烟灭的那一天。）\n\n[主角]（王老师一直在做这件事，他想当一个救世主，但是他有心无力。）\n\n[旁白]这和我记忆中一致。",
    },
    {
        "id": "ch5_gallery_infer_need_paintings",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[主角]（先去看看画吧。）",
    },
    {
        "id": "ch5_gallery_inference",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[主角]（但这也在像我传达一种信息：副本内容和人类所处的社会高度统一，结合比赛的目的是让人类进化，那么必定需要人类推动历史和社会的发展。）\n\n[主角]（以前这种话都是新闻和教科书里的漂亮话，一开始觉得高大上，时间久了就觉得离自己很远，慢慢也就不当回事了。）\\n\\n（太多像我这样的普通人，哪怕拼命努力也很难改变自己的命运，还谈什么改变社会改变全人类？）\n\n[旁白]当时看到这种话我只觉得很好笑。\\n\\n可现在，比赛逼着每一个参赛者重新捡起这份责任。\n\n[主角]（我不觉得自己能做到什么。但我还是要做。）",
    },
    {
        "id": "ch5_gallery_materials_wait",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[主角]（这个还是放到最后调查吧。）",
    },
    {
        "id": "ch5_gallery_materials_warning",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["wang_gallery"],
        "text": "[旁白]一处绘画材料堆得像小山，与周围整齐的区域格格不入。我无法从缝隙看清里面藏着什么。\n\n[旁白]我伸手准备移开最上方的画笔——\n\n[NPC:系统]技能“违规提醒”正在发动。\n\n[旁白]窒息感毫无征兆地扼住喉咙。我立即抽回手，压力才逐渐退去。\n\n[主角]（看来这里的东西不能随便乱动。画廊里没有其他可以安全调查的区域了。）",
        "nextSceneId": "ch5_return_to_office",
    },
    {
        "id": "ch5_class3_students",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["classroom_3"],
        "text": "[旁白]三班学生大多低着头做题，偶尔有人抬眼看我，视线很快又落回试卷上。\n\n[主角]（他们不是没发现我，只是在确认我什么时候露出破绽。）",
    },
    {
        "id": "ch5_class3_noticeboard",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["classroom_3"],
        "text": "[旁白]公告栏上贴着三班规则。字迹整齐，内容却让人后背发凉。\n\n[主角]（找到了。现在该走了。）",
        "nextSceneId": "ch5_class3_rules_found",
    },
    {
        "id": "ch5_class3_rules_found",
        "chapter": "第5章 · 合作与交易",
        "background": MAP_BACKGROUNDS["classroom_3"],
        "text": "[旁白]我记下规则，刚准备离开，教室里突然安静下来。\n\n[主角]（糟了。）",
        "nextSceneId": "ch5_class3_disguise_choice",
    },
]

TAG_EFFECTS = {
    "权威": "authorityResistance",
    "反抗": "authorityResistance",
    "质疑": "authorityResistance",
    "真相": "truthDesire",
    "追问": "truthDesire",
    "冒险": "truthDesire",
    "自我保护": "selfProtection",
    "谨慎": "selfProtection",
    "防御": "selfProtection",
    "克制": "selfProtection",
    "共情": "empathy",
    "关心": "empathy",
    "尊重": "empathy",
    "现实判断": "realityJudgment",
    "推理": "realityJudgment",
    "策略": "realityJudgment",
    "机智": "realityJudgment",
    "信任": "trust",
    "合作": "trust",
    "求助": "trust",
    "快乐": "joyPerception",
    "真诚": "joyPerception",
}


def js(value: object) -> str:
    return json.dumps(value, ensure_ascii=False)


def asset_path(raw: str) -> str:
    raw = raw.strip()
    if not raw or raw.startswith("无") or raw.startswith("空"):
        return ""
    normalized = raw.replace("\\", "/")
    marker = "/client/public"
    if marker in normalized:
        return normalized.split(marker, 1)[1]
    if normalized.startswith("G:/") and "/assets/" in normalized:
        return normalized[normalized.index("/assets/") :]
    return normalized


def player_state(raw: str | None) -> str | None:
    if not raw:
        return None
    normalized = raw.strip().replace("\\", "/")
    name = normalized.split("/")[-1].strip()
    return name or None


def choice_effects(tags: list[str]) -> dict[str, int]:
    effects: dict[str, int] = {}
    for tag in tags:
        for needle, trait in TAG_EFFECTS.items():
            if needle in tag:
                effects[trait] = effects.get(trait, 0) + 1
                break
    return effects or {"realityJudgment": 1}


def split_blocks(text: str) -> list[str]:
    starts = [match.start() for match in re.finditer(r"^### ", text, re.M)]
    blocks: list[str] = []
    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else len(text)
        blocks.append(text[start:end].strip())
    return blocks


def parse_choices(block: str) -> list[dict[str, object]]:
    choices: list[dict[str, object]] = []
    matches = list(re.finditer(r"^→ 选项：(.+)$", block, re.M))
    for index, match in enumerate(matches):
        chunk_start = match.end()
        chunk_end = matches[index + 1].start() if index + 1 < len(matches) else len(block)
        chunk = block[chunk_start:chunk_end]
        text = match.group(1).strip()
        flag_match = re.search(r"设置flag:\s*([A-Za-z0-9_]+)", chunk)
        jump_match = re.search(r"跳转[：:]\s*([A-Za-z0-9_]+)", chunk)
        tag_match = re.search(r"AI标签[：:]\s*(.+)", chunk)
        tags = [tag.strip() for tag in tag_match.group(1).split(",")] if tag_match else []
        choice_id = flag_match.group(1) if flag_match else re.sub(r"\W+", "_", text)[:40]
        next_scene = jump_match.group(1) if jump_match else ""
        if not next_scene:
            continue
        choices.append({
            "id": choice_id,
            "text": text,
            "nextSceneId": next_scene,
            "effects": choice_effects(tags),
            "tags": tags,
        })
    return choices


def parse_text(block: str) -> str:
    if "[混合]" in block.splitlines()[0] and "@trigger" in block:
        block = block.split("@trigger", 1)[0]
    lines: list[str] = []
    in_ai_prompt = False
    for line in block.splitlines():
        stripped = line.strip()
        if re.match(r"^\[(旁白|主角|主角说|NPC:[^\]]+)\]", stripped):
            lines.append(stripped)
            in_ai_prompt = False
            continue
        if stripped.startswith("条件："):
            lines.append(f"[旁白]【{stripped}】")
            in_ai_prompt = False
            continue
        if stripped.startswith("AI提示："):
            lines.append(f"[旁白]【AI片段提示】{stripped[len('AI提示：'):].strip()}")
            in_ai_prompt = True
            continue
        if in_ai_prompt and stripped and not stripped.startswith("→"):
            if stripped.startswith("-") or stripped.startswith("固定") or stripped.startswith("动态") or stripped.startswith("必须") or stripped.startswith("不得") or stripped.startswith("禁止") or stripped.startswith("输出"):
                lines.append(f"[旁白]{stripped}")
            continue
        if stripped.startswith("必说台词："):
            lines.append("[旁白]【必说台词】")
            in_ai_prompt = False
            continue
    if not lines:
        title = block.splitlines()[0].replace("### ", "").strip()
        lines.append(f"[旁白]{title}")
    return "\n\n".join(lines)


def parse_block(block: str, chapter: str) -> tuple[str, str] | None:
    scene_match = re.search(r"场景ID[：:]\s*([A-Za-z0-9_]+)", block)
    header = block.splitlines()[0]
    title = re.sub(r"^###\s*\[[^\]]+\]\s*", "", header).strip()
    if scene_match:
        scene_id = scene_match.group(1)
    else:
        scene_id = TITLE_SCENE_IDS.get(title)
        if not scene_id:
            return None
    cg_mode = "[CG]" in header
    map_match = re.search(r"^地图[：:]\s*([A-Za-z0-9_]+)", block, re.M)
    image_match = re.search(r"^图片[：:]\s*(.+)$", block, re.M)
    background = ""
    if image_match:
        background = asset_path(image_match.group(1))
    elif map_match:
        background = MAP_BACKGROUNDS.get(map_match.group(1), "")
    elif "背景：傍晚绿化带" in block:
        background = MAP_BACKGROUNDS["gate"]
    elif "背景：午饭时教室" in block or "背景：美术课教室" in block:
        background = MAP_BACKGROUNDS["classroom"]
    elif "背景：绿化带" in block:
        background = MAP_BACKGROUNDS["gate"]

    state_match = re.search(r"玩家状态[：:]\s*(.+)", block)
    p_state = player_state(state_match.group(1)) if state_match else None
    choices = parse_choices(block)

    jump_matches = re.findall(r"(?:→\s*)?(?:对话结束后：)?跳转[： ]\s*([A-Za-z0-9_]+)", block)
    next_scene = jump_matches[-1] if jump_matches else None
    if choices:
        next_scene = None
    if "[混合]" in header:
        next_scene = None

    on_cg_end = None
    if scene_id == "ch4_zhou_lunch_approach":
        on_cg_end = "ch4_free_classroom_lunch"
    if scene_id == "ch5_gallery_explore":
        on_cg_end = "ch5_free_gallery"
    if scene_id == "ch5_class3_explore":
        on_cg_end = "ch5_free_class3"

    text = parse_text(block)
    props: list[str] = [
        f"id: {js(scene_id)}",
        f"chapter: {js(chapter)}",
        f"background: {js(background)}",
    ]
    if cg_mode:
        props.append("cgMode: true")
    if p_state:
        props.append(f"playerState: {js(p_state)}")
    props.extend([
        'speaker: "旁白"',
        f"text: {js(text)}",
    ])
    if choices:
        choice_lines = []
        for choice in choices:
            choice_lines.append(
                "{ "
                f"id: {js(choice['id'])}, "
                f"text: {js(choice['text'])}, "
                f"nextSceneId: {js(choice['nextSceneId'])}, "
                f"effects: {json.dumps(choice['effects'], ensure_ascii=False)}, "
                f"tags: {json.dumps(choice['tags'], ensure_ascii=False)}"
                " }"
            )
        props.append("choices: [\n      " + ",\n      ".join(choice_lines) + ",\n    ]")
    if next_scene:
        props.append(f"nextSceneId: {js(next_scene)}")
    if on_cg_end:
        props.append(f"onCgEnd: {js(on_cg_end)}")
    body = ",\n    ".join(props)
    return scene_id, f"  {scene_id}: {{\n    {body},\n  }},"


def generate() -> str:
    entries: list[str] = [
        "  // ══════════════════════════════════════════════",
        "  // 第4章 · 规则发现（由 docs/剧本/ch4_规则发现.md 生成）",
        "  // ══════════════════════════════════════════════",
        "",
    ]
    for doc, chapter in [
        (ROOT / "docs/剧本/ch4_规则发现.md", "第4章 · 规则发现"),
        (ROOT / "docs/剧本/ch5_合作与交易.md", "第5章 · 合作与交易"),
    ]:
        for block in split_blocks(doc.read_text(encoding="utf-8")):
            parsed = parse_block(block, chapter)
            if parsed:
                entries.append(parsed[1])
                entries.append("")
        if chapter == "第5章 · 合作与交易":
            for manual in MANUAL_SCENES:
                props = [
                    f"id: {js(manual['id'])}",
                    f"chapter: {js(manual['chapter'])}",
                    f"background: {js(manual['background'])}",
                    'speaker: "旁白"',
                    f"text: {js(manual['text'])}",
                ]
                if "nextSceneId" in manual:
                    props.append(f"nextSceneId: {js(manual['nextSceneId'])}")
                entries.append(f"  {manual['id']}: {{\n    " + ",\n    ".join(props) + ",\n  },")
                entries.append("")
    return "\n".join(entries)


def main() -> None:
    text = SCENES.read_text(encoding="utf-8")
    start_key = "  ch4_exploration_progress:"
    end_key = "  ch6_class3_exposure:"
    start = text.index(start_key)
    start = text.rfind("\n\n", 0, start) + 2
    end = text.index(end_key)
    SCENES.write_text(text[:start] + generate() + text[end:], encoding="utf-8")


if __name__ == "__main__":
    main()
