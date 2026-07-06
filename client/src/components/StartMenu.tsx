import { useState } from "react";
import type { GameState } from "../types/game";
import { getAllSaves, loadSlot, type SaveSlot } from "../engine/save";

interface Props {
  onNewGame: () => void;
  onStartChapter4?: () => void;
  onLoadGame: (state: GameState) => void;
  onShowPortrait: () => void;
  onExit: () => void;
}

export function StartMenu({ onNewGame, onStartChapter4, onLoadGame, onShowPortrait, onExit }: Props) {
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const [saves, setSaves] = useState<SaveSlot[]>([]);

  function openLoadPanel() {
    setSaves(getAllSaves());
    setShowLoadPanel(true);
  }

  function handleLoad(slot: number) {
    const state = loadSlot(slot);
    if (state) {
      onLoadGame(state);
    }
  }

  return (
    <div className="start-menu">
      {/* 封面背景 */}
      <div
        className="start-menu-bg"
        style={{ backgroundImage: "url(/assets/ui/cover.png)" }}
      />

      {/* 暗色遮罩 */}
      <div className="start-menu-overlay" />

      {/* 主菜单（或读档面板） */}
      {!showLoadPanel ? (
        <div className="start-menu-main">
          <h1 className="start-menu-title">快乐小孩</h1>
          <p className="start-menu-subtitle">Happy Child</p>

          <div className="start-menu-buttons">
            <button className="start-btn" onClick={onNewGame}>
              新的游戏
            </button>
            {onStartChapter4 && (
              <button className="start-btn" onClick={onStartChapter4}>
                从第四章开始
              </button>
            )}
            <button className="start-btn" onClick={openLoadPanel}>
              继续游戏
            </button>
            <button className="start-btn" onClick={onShowPortrait}>
              人格画像
            </button>
            <button className="start-btn exit-btn" onClick={onExit}>
              退出游戏
            </button>
          </div>


        </div>
      ) : (
        <div className="start-menu-load">
          <h2 className="load-title">选择存档</h2>
          <div className="load-slots">
            {saves.length === 0 ? (
              <p className="load-empty">暂无存档</p>
            ) : (
              saves.map(s => (
                <button
                  key={s.slot}
                  className="load-slot-btn"
                  onClick={() => handleLoad(s.slot)}
                >
                  <span className="load-slot-num">存档 {s.slot + 1}</span>
                  <span className="load-slot-time">{s.timestamp}</span>
                  <span className="load-slot-preview">{s.preview || "(空)"}</span>
                </button>
              ))
            )}
          </div>
          <button className="start-btn back-btn" onClick={() => setShowLoadPanel(false)}>
            返回
          </button>
        </div>
      )}
    </div>
  );
}
