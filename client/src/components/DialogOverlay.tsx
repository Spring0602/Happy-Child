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
  "父亲": "/assets/portraits/yps_defult.png",       // 待替换为父亲立绘
  "母亲": "/assets/portraits/yps_defult.png",       // 待替换为母亲立绘
  "王老师": "/assets/portraits/yps_defult.png",     // 待替换为王老师立绘
  "周骐瑞": "/assets/portraits/ly_smile.png",      // 待替换为周骐瑞立绘
  "周隽秀": "/assets/portraits/yps_defult.png",    // 待替换为周隽秀立绘
  "林芷萱": "/assets/portraits/ly_smile.png",      // 待替换为林芷萱立绘
};

/** 旁白/系统类（不显示立绘） */
const NARRATOR_NAMES = ["旁白", "系统", "系统邮件", "规则"];

function getSpeakerInfo(speaker: string | undefined) {
  if (!speaker || NARRATOR_NAMES.includes(speaker)) {
    return { side: "none" as const, portrait: null as string | null };
  }
  if (PROTAGONIST_NAMES.includes(speaker)) {
    return { side: "left" as const, portrait: PORTRAIT_MAP[speaker] ?? null };
  }
  return { side: "right" as const, portrait: PORTRAIT_MAP[speaker] ?? null };
}

export function DialogOverlay({ scene, onNext, onChoose, onAIEvent, onClose }: Props) {
  const { side, portrait } = getSpeakerInfo(scene.speaker);
  const hasChoices = scene.choices && scene.choices.length > 0;
  const hasAIEvent = !!scene.aiEvent;
  const chainEnded = !hasChoices && !hasAIEvent && !scene.nextSceneId;

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
        <div className="dialog-box">
          <div className="dialog-header">
            {scene.speaker && <span className="dialog-speaker">{scene.speaker}</span>}
            <span className="dialog-chapter">{scene.chapter}</span>
          </div>
          <div className="dialog-text">{scene.text}</div>

          <div className="dialog-actions">
            {chainEnded && (
              <button className="dialog-action-btn close" onClick={onClose}>
                ✕ 关闭
              </button>
            )}
            {hasAIEvent && (
              <button className="dialog-action-btn ai" onClick={onAIEvent}>
                ⚡ 启动 AI 分析
              </button>
            )}
            {!hasChoices && !chainEnded && scene.nextSceneId && (
              <button
                className="dialog-action-btn next"
                onClick={() => onNext(scene.nextSceneId!)}
              >
                继续 ►
              </button>
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
