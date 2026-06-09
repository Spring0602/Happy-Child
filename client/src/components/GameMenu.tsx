import { useState } from "react";
import type { GameState } from "../types/game";
import { getAllSaves, saveToSlot, loadSlot, deleteSlot, type SaveSlot } from "../engine/save";

interface Props {
  state: GameState;
  onClose: () => void;
  onLoadState: (state: GameState) => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  onShowBacklog: () => void;
  onShowNotebook: () => void;
  dialogPreview: string;
}

type MenuPage = "main" | "save" | "load";

export function GameMenu({ state, onClose, onLoadState, onRestart, onExitToTitle, onShowBacklog, onShowNotebook, dialogPreview }: Props) {
  const [page, setPage] = useState<MenuPage>("main");
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  function openSaves(pageMode: "save" | "load") {
    setSaves(getAllSaves());
    setPage(pageMode);
  }

  function handleSave(slot: number) {
    saveToSlot(slot, state, dialogPreview);
    setSaves(getAllSaves());
  }

  function handleLoad(slot: number) {
    const s = loadSlot(slot);
    if (s) {
      onLoadState(s);
      onClose();
    }
  }

  function handleDelete(slot: number) {
    deleteSlot(slot);
    setSaves(getAllSaves());
  }

  function handleConfirm(action: string) {
    setConfirmAction(action);
  }

  function confirmYes() {
    if (confirmAction === "restart") onRestart();
    if (confirmAction === "exit") onExitToTitle();
    setConfirmAction(null);
  }

  if (confirmAction) {
    return (
      <div className="game-menu-overlay">
        <div className="game-menu-panel confirm-panel">
          <p className="confirm-text">
            {confirmAction === "restart" ? "确定要重新开始吗？未保存的进度将丢失。" : "确定要退出到标题界面吗？未保存的进度将丢失。"}
          </p>
          <div className="confirm-buttons">
            <button className="confirm-btn" onClick={confirmYes}>确定</button>
            <button className="confirm-btn cancel" onClick={() => setConfirmAction(null)}>取消</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-menu-overlay">
      <div className="game-menu-panel">
        {page === "main" && (
          <>
            <h2 className="game-menu-title">菜单</h2>
            <div className="game-menu-buttons">
              <button className="start-btn" onClick={() => openSaves("save")}>
                存档
              </button>
              <button className="start-btn" onClick={() => openSaves("load")}>
                读档
              </button>
              <button className="start-btn" onClick={() => handleConfirm("restart")}>
                重新开始
              </button>
              <button className="start-btn" onClick={() => handleConfirm("exit")}>
                退出游戏
              </button>
              <button className="start-btn" onClick={() => { onShowNotebook(); onClose(); }}>
                笔记本
              </button>
              <button className="start-btn" onClick={() => { onShowBacklog(); onClose(); }}>
                回顾
              </button>
            </div>
            <button className="start-btn back-btn" onClick={onClose}>
              继续游戏
            </button>
          </>
        )}

        {(page === "save" || page === "load") && (
          <>
            <h2 className="game-menu-title">{page === "save" ? "选择存档位置" : "选择读档位置"}</h2>
            <div className="load-slots">
              {Array.from({ length: 10 }, (_, i) => {
                const s = saves.find(sv => sv.slot === i);
                return (
                  <div key={i} className="load-slot-row">
                    <span className="load-slot-num">存档 {i + 1}</span>
                    {s ? (
                      <>
                        <span className="load-slot-time">{s.timestamp}</span>
                        <span className="load-slot-preview">{s.preview || "(空)"}</span>
                      </>
                    ) : (
                      <span className="load-slot-preview empty-slot">—— 空 ——</span>
                    )}
                    <div className="load-slot-actions">
                      {page === "save" && (
                        <button className="slot-action-btn save-action" onClick={() => handleSave(i)}>
                          覆盖
                        </button>
                      )}
                      {page === "load" && s && (
                        <button className="slot-action-btn load-action" onClick={() => handleLoad(i)}>
                          读取
                        </button>
                      )}
                      {s && (
                        <button className="slot-action-btn del-action" onClick={() => handleDelete(i)}>
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="start-btn back-btn" onClick={() => setPage("main")}>
              返回
            </button>
          </>
        )}
      </div>
    </div>
  );
}
