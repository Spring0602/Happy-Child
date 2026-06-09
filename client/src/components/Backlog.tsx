import { useRef, useEffect } from "react";

export interface DialogLogEntry {
  speaker: string;
  text: string;
  sceneId: string;
  chapter: string;
}

interface Props {
  entries: DialogLogEntry[];
  onClose: () => void;
}

export function Backlog({ entries, onClose }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries]);

  // 获取说话者名称（简化显示）
  function speakerLabel(speaker: string): string {
    if (!speaker || speaker === "旁白") return "——旁白——";
    if (speaker === "叶平生") return "我";
    if (speaker === "系统" || speaker === "系统邮件") return "【系统】";
    return speaker;
  }

  const last10 = entries.slice(-10);

  return (
    <div className="game-menu-overlay">
      <div className="backlog-panel">
        <div className="backlog-header">
          <h2 className="backlog-title">对话回顾</h2>
          <span className="backlog-count">最近 {last10.length} 段</span>
        </div>

        <div className="backlog-list" ref={listRef}>
          {last10.length === 0 ? (
            <p className="backlog-empty">暂无对话记录</p>
          ) : (
            last10.map((entry, i) => (
              <div key={`${entry.sceneId}-${i}`} className="backlog-entry">
                <div className="backlog-entry-speaker">
                  {speakerLabel(entry.speaker)}
                </div>
                <div className="backlog-entry-text">
                  {entry.text.slice(0, 80)}
                  {entry.text.length > 80 ? "……" : ""}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="start-btn back-btn" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
}
