import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Choice, Scene } from "../types/game";

interface Props {
  scene: Scene;
  onNext: (nextSceneId: string) => void;
  onChoose: (choice: Choice) => void;
}

/** 主角说话者名单 */
const PROTAGONIST_NAMES = ["叶平生"];

/** NPC 立绘路径映射（CG 模式下仅主角显示立绘） */
const PORTRAIT_MAP: Record<string, string> = {
  "叶平生": "/assets/portraits/yps_defult.png",
};

/** 旁白/系统类（不显示立绘） */
const NARRATOR_NAMES = ["旁白", "系统", "系统邮件", "规则"];

function getSpeakerLabel(speaker: string | undefined): string | null {
  if (!speaker || NARRATOR_NAMES.includes(speaker)) return null;
  if (PROTAGONIST_NAMES.includes(speaker)) return "我";
  return speaker;
}

/** 获取立绘路径（CG 模式仅主角显示） */
function getPortraitSrc(speaker: string | undefined): string | null {
  if (!speaker) return null;
  if (NARRATOR_NAMES.includes(speaker)) return null;
  if (PROTAGONIST_NAMES.includes(speaker)) return PORTRAIT_MAP[speaker] ?? null;
  // NPC 在 CG 模式下不显示立绘
  return null;
}

/** 按 \\n\\n 拆分文本段落（至少保留一整段） */
function splitParagraphs(text: string): string[] {
  const parts = text.split(/\n\n/).filter(p => p.trim());
  return parts.length > 0 ? parts : [text];
}

export function CgOverlay({ scene, onNext, onChoose }: Props) {
  const hasChoices = scene.choices && scene.choices.length > 0;
  const speakerLabel = getSpeakerLabel(scene.speaker);
  const portraitSrc = getPortraitSrc(scene.speaker);
  const showPortrait = portraitSrc !== null;
  const isNarrator = !speakerLabel;

  // 稳定化 paragraphs 数组引用，避免每次都触发 useEffect
  const paragraphs = useMemo(() => splitParagraphs(scene.text), [scene.text]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const totalParagraphs = paragraphs.length;

  // ⚠️ scene 切换时重置段落（修复选项后对话框空白的 bug）
  useEffect(() => {
    setCurrentParagraph(0);
  }, [scene.id]);

  // 打字机效果状态
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 用 ref 跟踪当前段落文本长度，避免闭包陷阱
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

    // 清除旧 timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayedChars(prev => {
        const next = prev + 1;
        if (next >= lenRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          // 用 setTimeout 避免在 setState 回调里再次 setState
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

  // 空格键：快进打字 / 下一段 / 下一页
  const handleSpace = useCallback(() => {
    if (hasChoices) return;
    if (!typingDone) {
      // 快进：立即显示全部文字
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedChars(fullText.length);
      setTypingDone(true);
    } else if (currentParagraph < totalParagraphs - 1) {
      // 下一段
      setCurrentParagraph(prev => prev + 1);
    } else {
      // 进入下一场景（即使 nextSceneId 为空也触发，让上层处理关闭逻辑）
      onNext(scene.nextSceneId || "");
    }
  }, [hasChoices, typingDone, currentParagraph, totalParagraphs, scene.nextSceneId, onNext, fullText.length]);

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

  // 是否显示向下箭头（当前段打字完成 且 还有内容）
  const showArrow = typingDone && !hasChoices;

  return (
    <div className="cg-overlay">
      {/* 全屏 CG 背景 */}
      <div
        className="cg-background"
        style={scene.background
          ? { backgroundImage: `url(${scene.background})` }
          : { backgroundColor: "#000" }}
      />

      {/* 立绘（仅主角说话时在左下角显示） */}
      {showPortrait && (
        <div className="cg-portrait-area">
          <img
            className="cg-portrait"
            src={portraitSrc!}
            alt={speakerLabel ?? ""}
          />
        </div>
      )}

      {/* 选项 — 在对话框上方 */}
      {hasChoices && (
        <div className="cg-choices">
          {scene.choices!.map((choice) => (
            <button
              key={choice.id}
              className="cg-choice-btn"
              onClick={() => onChoose(choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {/* 底部对话框 */}
      <div className="cg-dialog-area">
        <div className="cg-dialog-box" onClick={handleSpace}>
          <div className="cg-dialog-header">
            {speakerLabel && (
              <span className="cg-dialog-speaker">{speakerLabel}</span>
            )}
          </div>
          <div className={`cg-dialog-text${isNarrator ? " narrator" : ""}`}>
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
    </div>
  );
}
