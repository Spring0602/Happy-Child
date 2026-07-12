import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Choice, Scene } from "../types/game";

interface Props {
  scene: Scene;
  onNext: (nextSceneId: string) => void;
  onChoose: (choice: Choice) => void;
  hideUi?: boolean;
  centerImageSrc?: string;
  preserveForPerformance?: boolean;
  shouldTransitionTo?: (nextSceneId: string) => boolean;
  onSegmentStart?: (sceneId: string, segmentText: string, segmentIndex: number) => void;
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

/** 获取立绘路径 */
function getPortraitSrc(speaker: string | undefined): string | null {
  if (!speaker) return null;
  if (NARRATOR_NAMES.includes(speaker)) return null;
  return PORTRAIT_MAP[speaker] ?? null;
}

function getPortraitSide(speaker: string | undefined): "left" | "right" {
  return speaker && PROTAGONIST_NAMES.includes(speaker) ? "left" : "right";
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

export function CgOverlay({ scene, onNext, onChoose, hideUi = false, centerImageSrc, preserveForPerformance = false, shouldTransitionTo, onSegmentStart }: Props) {
  const hasChoices = scene.choices && scene.choices.length > 0;

  // 稳定化 paragraphs 数组引用，避免每次都触发 useEffect
  const paragraphs = useMemo(() => splitDialogSegments(scene.text, scene.speaker), [scene.text, scene.speaker]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [exiting, setExiting] = useState(false);
  const totalParagraphs = paragraphs.length;
  const currentSegment = paragraphs[currentParagraph] ?? { speaker: scene.speaker, text: "" };
  const speakerLabel = getSpeakerLabel(currentSegment.speaker);
  const portraitSrc = getPortraitSrc(currentSegment.speaker);
  const portraitSide = getPortraitSide(currentSegment.speaker);
  const showPortrait = portraitSrc !== null;
  const isNarrator = !speakerLabel;

  // ⚠️ scene 切换时重置段落（修复选项后对话框空白的 bug）
  useEffect(() => {
    setCurrentParagraph(0);
    setExiting(false);
  }, [scene.id]);

  // 打字机效果状态
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 用 ref 跟踪当前段落文本长度，避免闭包陷阱
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
  const fullText = currentSegment.text || "";

  useEffect(() => {
    if (hideUi || !onSegmentStart) return;
    onSegmentStart(scene.id, fullText, currentParagraph);
  }, [hideUi, onSegmentStart, scene.id, currentParagraph, fullText]);

  const goNextWithFade = useCallback(() => {
    if (exiting) return;
    const nextSceneId = scene.nextSceneId || "";
    if (preserveForPerformance || shouldTransitionTo?.(nextSceneId) === false) {
      onNext(scene.nextSceneId || "");
      return;
    }
    setExiting(true);
    window.setTimeout(() => onNext(scene.nextSceneId || ""), 360);
  }, [exiting, onNext, preserveForPerformance, scene.nextSceneId, shouldTransitionTo]);

  const chooseWithFade = useCallback((choice: Choice) => {
    if (exiting) return;
    if (shouldTransitionTo?.(choice.nextSceneId) === false) {
      onChoose(choice);
      return;
    }
    setExiting(true);
    window.setTimeout(() => onChoose(choice), 360);
  }, [exiting, onChoose, shouldTransitionTo]);

  // 空格键：快进打字 / 下一段 / 下一页
  const handleSpace = useCallback(() => {
    if (showChoices) return;
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
      goNextWithFade();
    }
  }, [showChoices, typingDone, currentParagraph, totalParagraphs, goNextWithFade, fullText.length]);

  useEffect(() => {
    if (hideUi) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSpace, hideUi]);

  // 是否显示向下箭头（当前段打字完成 且 还有内容）
  const showArrow = typingDone && !showChoices;

  const overlayClassName = [
    "cg-overlay",
    exiting ? "cg-exiting" : "",
    scene.phoneChat && !scene.background ? "cg-phone-transparent" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={overlayClassName}>
      {/* 全屏 CG 背景 */}
      <div
        key={scene.background || "black"}
        className="cg-background cg-background-fade-in"
        style={scene.background
          ? { backgroundImage: `url(${scene.background})`, backgroundColor: "#000" }
          : { backgroundColor: "#000" }}
      />

      {scene.id === "ch6_ritual_desire_snowball" && (
        <div className="papers-fall-layer" aria-hidden="true">
          {Array.from({ length: 28 }, (_, index) => (
            <span
              key={index}
              className="falling-paper"
              style={{
                left: `${(index * 37) % 101}%`,
                animationDelay: `${(index % 9) * -0.62}s`,
                animationDuration: `${5.2 + (index % 7) * 0.48}s`,
                width: `${34 + (index % 4) * 7}px`,
                height: `${48 + (index % 3) * 9}px`,
              }}
            />
          ))}
        </div>
      )}

      {scene.id === "ch1_game_eve_countdown" && (
        <div className="cg-countdown-display">00:00</div>
      )}

      {centerImageSrc && (
        <img className="cg-center-portrait-image" src={centerImageSrc} alt="Demo阶段人格画像" />
      )}

      {!hideUi && (
        <div className="cg-ui-stack">
          <div className="cg-dialog-main">
            <div className="cg-portrait-area left">
              {showPortrait && portraitSide === "left" && (
                <img className="cg-portrait" src={portraitSrc!} alt={speakerLabel ?? ""} />
              )}
            </div>

            <div className="cg-content-column">
              {showChoices && (
                <div className="cg-choices">
                  {scene.choices!.map((choice) => (
                    <button
                      key={choice.id}
                      className="cg-choice-btn"
                      onClick={() => chooseWithFade(choice)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              )}

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

            <div className="cg-portrait-area right">
              {showPortrait && portraitSide === "right" && (
                <img className="cg-portrait" src={portraitSrc!} alt={speakerLabel ?? ""} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
