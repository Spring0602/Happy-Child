import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Choice, Scene } from "../types/game";

interface Props {
  scene: Scene;
  onNext: (nextSceneId: string) => void;
  onChoose: (choice: Choice) => void;
  onAIEvent: () => void;
  onClose: () => void;
}

/** 主角说话者名单 */
const PROTAGONIST_NAMES = ["叶平生"];

/** NPC 立绘路径映射 */
const PORTRAIT_MAP: Record<string, string> = {
  "叶平生": "/assets/portraits/yps_defult.png",
  "刘宇": "/assets/portraits/ly_smile.png",
  "周骐瑞": "/assets/portraits/zqr_defult.png",
  "周隽秀": "/assets/portraits/zjx_defult.png",
};

/** 旁白类（不显示立绘、不显示说话者名） */
const NARRATOR_NAMES = ["旁白", "系统邮件", "规则"];

function getSpeakerLabel(speaker: string | undefined): string | null {
  if (!speaker || NARRATOR_NAMES.includes(speaker)) return null;
  if (PROTAGONIST_NAMES.includes(speaker)) return "我";
  return speaker;
}

function getSpeakerInfo(speaker: string | undefined) {
  if (!speaker || NARRATOR_NAMES.includes(speaker)) {
    return { side: "none" as const, portrait: null as string | null, label: null as string | null };
  }
  if (PROTAGONIST_NAMES.includes(speaker)) {
    return { side: "left" as const, portrait: PORTRAIT_MAP[speaker] ?? null, label: "我" };
  }
  return { side: "right" as const, portrait: PORTRAIT_MAP[speaker] ?? null, label: speaker };
}

type DialogSegment = {
  speaker?: string;
  text: string;
};

function splitSegmentText(text: string): string[] {
  const parts = text.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

function normalizeRoleCode(roleCode: string | undefined, fallbackSpeaker: string | undefined): string | undefined {
  if (!roleCode) return fallbackSpeaker;
  if (roleCode === "旁白") return "旁白";
  if (roleCode === "主角" || roleCode === "主角说") return "叶平生";
  if (roleCode.startsWith("NPC:")) return roleCode.slice("NPC:".length).trim();
  return fallbackSpeaker;
}

/** 按剧本角色码拆分文本，兼容一个 scene 内多角色混排 */
function splitDialogSegments(text: string, fallbackSpeaker: string | undefined): DialogSegment[] {
  const normalizedText = text.replace(/\\n/g, "\n");
  const rolePattern = /\[(旁白|主角说|主角|NPC:[^\]]+)\]\s*/g;
  const matches = [...normalizedText.matchAll(rolePattern)];

  if (matches.length === 0) {
    const parts = splitSegmentText(normalizedText);
    return (parts.length > 0 ? parts : [normalizedText.trim()]).map(part => ({
      speaker: fallbackSpeaker,
      text: part,
    }));
  }

  const segments: DialogSegment[] = [];
  if (matches[0].index && matches[0].index > 0) {
    const prefix = normalizedText.slice(0, matches[0].index).trim();
    splitSegmentText(prefix).forEach(part => segments.push({ speaker: fallbackSpeaker, text: part }));
  }

  matches.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? matches[index + 1].index ?? normalizedText.length : normalizedText.length;
    const content = normalizedText.slice(contentStart, contentEnd).trim();
    if (!content) return;
    const speaker = normalizeRoleCode(match[1], fallbackSpeaker);
    splitSegmentText(content).forEach(part => segments.push({ speaker, text: part }));
  });

  return segments.length > 0 ? segments : [{ speaker: fallbackSpeaker, text: normalizedText }];
}

export function DialogOverlay({ scene, onNext, onChoose, onAIEvent, onClose }: Props) {
  const hasChoices = scene.choices && scene.choices.length > 0;
  const hasAIEvent = !!scene.aiEvent;
  const chainEnded = !hasChoices && !hasAIEvent && !scene.nextSceneId;

  // 稳定化段落数组引用
  const paragraphs = useMemo(() => splitDialogSegments(scene.text, scene.speaker), [scene.text, scene.speaker]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const totalParagraphs = paragraphs.length;
  const currentSegment = paragraphs[currentParagraph] ?? { speaker: scene.speaker, text: "" };
  const { side, portrait, label } = getSpeakerInfo(currentSegment.speaker);
  const isNarrator = !currentSegment.speaker || NARRATOR_NAMES.includes(currentSegment.speaker);

  // ⚠️ scene 切换时重置段落（修复选项后对话框空白的 bug）
  useEffect(() => {
    setCurrentParagraph(0);
  }, [scene.id]);

  // 打字机效果状态
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lenRef = useRef(0);
  const showChoices = !!hasChoices && typingDone && currentParagraph >= totalParagraphs - 1;

  // 段落切换时重置打字机
  useEffect(() => {
    const text = paragraphs[currentParagraph]?.text ?? "";
    const len = text.length;
    lenRef.current = len;
    setDisplayedChars(0);
    setTypingDone(false);

    if (len === 0) {
      setTypingDone(true);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayedChars(prev => {
        const next = prev + 1;
        if (next >= lenRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setTypingDone(true), 0);
          return lenRef.current;
        }
        return next;
      });
    }, 35);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentParagraph, paragraphs]);

  // 当前段落的完整文本
  const fullText = currentSegment.text || "";

  // 空格键
  const handleSpace = useCallback(() => {
    if (showChoices) return;
    if (!typingDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedChars(fullText.length);
      setTypingDone(true);
    } else if (currentParagraph < totalParagraphs - 1) {
      setCurrentParagraph(prev => prev + 1);
    } else if (hasAIEvent) {
      onAIEvent();
    } else if (chainEnded) {
      onClose();
    } else if (scene.nextSceneId) {
      onNext(scene.nextSceneId);
    }
  }, [showChoices, typingDone, currentParagraph, totalParagraphs, hasAIEvent, chainEnded, scene.nextSceneId, onNext, onAIEvent, onClose, fullText.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSpace]);

  const showArrow = typingDone && !showChoices;

  return (
    <div className="dialog-overlay">
      {/* 对话主区域 */}
      <div className="dialog-main">
        {/* 左侧立绘 — 主角 */}
        <div className="dialog-portrait-area left">
          {side === "left" && portrait && (
            <img className="dialog-portrait" src={portrait} alt={scene.speaker} />
          )}
        </div>

        <div className="dialog-content-column">
          {/* 选项栏 — 与对话框处于同一列 */}
          {showChoices && (
            <div className="dialog-choices">
              {scene.choices!.map((choice) => (
                <button
                  key={choice.id}
                  className="dialog-choice-btn"
                  onClick={() => onChoose(choice)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}

          {/* 对话框 */}
          <div className="dialog-box" onClick={handleSpace}>
            <div className="dialog-header">
              {label && <span className="dialog-speaker">{label}</span>}
            </div>
            <div className={`dialog-text${isNarrator ? " narrator" : ""}`}>
              {fullText.slice(0, displayedChars)}
              {!typingDone && <span className="typing-cursor">|</span>}
            </div>
            {showArrow && (
              <div className="dialog-arrow-down">
                <span className="arrow-icon">▼</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧立绘 — NPC */}
        <div className="dialog-portrait-area right">
          {side === "right" && portrait && (
            <img className="dialog-portrait" src={portrait} alt={scene.speaker} />
          )}
        </div>
      </div>
    </div>
  );
}
