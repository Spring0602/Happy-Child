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
};

/** 旁白/系统类（不显示立绘） */
const NARRATOR_NAMES = ["旁白", "系统", "系统邮件", "规则"];

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

/** 按 \\n\\n 拆分文本段落（至少保留一整段） */
function splitParagraphs(text: string): string[] {
  const parts = text.split(/\n\n/).filter(p => p.trim());
  return parts.length > 0 ? parts : [text];
}

export function DialogOverlay({ scene, onNext, onChoose, onAIEvent, onClose }: Props) {
  const { side, portrait, label } = getSpeakerInfo(scene.speaker);
  const hasChoices = scene.choices && scene.choices.length > 0;
  const hasAIEvent = !!scene.aiEvent;
  const chainEnded = !hasChoices && !hasAIEvent && !scene.nextSceneId;
  const isNarrator = !scene.speaker || NARRATOR_NAMES.includes(scene.speaker);

  // 稳定化 paragraphs 数组引用
  const paragraphs = useMemo(() => splitParagraphs(scene.text), [scene.text]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const totalParagraphs = paragraphs.length;

  // 打字机效果状态
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lenRef = useRef(0);

  // 段落切换时重置打字机
  useEffect(() => {
    const text = paragraphs[currentParagraph] ?? "";
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
  const fullText = paragraphs[currentParagraph] || "";

  // 空格键
  const handleSpace = useCallback(() => {
    if (hasChoices) return;
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
  }, [hasChoices, typingDone, currentParagraph, totalParagraphs, hasAIEvent, chainEnded, scene.nextSceneId, onNext, onAIEvent, onClose, fullText.length]);

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

  const showArrow = typingDone && !hasChoices;

  return (
    <div className="dialog-overlay">
      {/* 选项栏 — 在对话框上方 */}
      {hasChoices && (
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

      {/* 对话主区域 */}
      <div className="dialog-main">
        {/* 左侧立绘 — 主角 */}
        <div className="dialog-portrait-area left">
          {side === "left" && portrait && (
            <img className="dialog-portrait" src={portrait} alt={scene.speaker} />
          )}
        </div>

        {/* 对话框 */}
        <div className="dialog-box" onClick={handleSpace}>
          <div className="dialog-header">
            {label && <span className="dialog-speaker">{label}</span>}
            {label && !NARRATOR_NAMES.includes(scene.speaker ?? "") && <span className="dialog-chapter">{scene.chapter}</span>}
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
