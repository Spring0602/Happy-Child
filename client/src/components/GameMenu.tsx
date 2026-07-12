import { useState } from "react";
import type { GameState } from "../types/game";
import { getAllSaves, saveToSlot, loadSlot, deleteSlot, type SaveSlot } from "../engine/save";
import { gameBridge } from "../game/bridge/GameBridge";
import { SettingsPanel } from "./SettingsPanel";
import { TutorialPanel } from "./TutorialPanel";

/** 地图 ID → 中文场景名 */
const MAP_NAMES: Record<string, string> = {
  dormitory: "宿舍（夜）",
  dormitory_day: "宿舍（晨）",
  dormitory_act4: "宿舍（深夜）",
  balcony: "阳台",
  balcony_night: "阳台（夜）",
  livingroom: "客厅",
  bedroom: "主角房间",
  bedroom_luggage: "主角房间（行李）",
  bedroom_parents: "父母房间",
  bathroom: "卫生间",
  kitchen: "厨房",
  classroom: "教室",
  classroom_3: "三班教室",
  gate: "校门（白天）",
  gate_night: "校门（夜）",
  corridor: "走廊",
  teacher_office: "教师办公室",
  wang_gallery: "美术教室",
  shop: "厨具便利店",
  shop_school: "校内便利店",
  waiting: "候场区",
  rooftop: "天台",
};

function getMapName(mapId?: string) {
  if (!mapId) return "";
  return MAP_NAMES[mapId] ?? mapId;
}

interface Props {
  state: GameState;
  onClose: () => void;
  onLoadState: (state: GameState) => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  onShowBacklog: () => void;
  onShowNotebook: () => void;
  dialogPreview: string;
  /** 当前场景章节名（如"第3章 · 学校初入"） */
  currentChapter?: string;
  initialPage?: MenuPage;
  onSaveComplete?: () => void;
  forceSave?: boolean;
}

type MenuPage = "main" | "save" | "load" | "settings" | "tutorial";

export function GameMenu({ state, onClose, onLoadState, onRestart, onExitToTitle, onShowBacklog, onShowNotebook, dialogPreview, currentChapter, initialPage = "main", onSaveComplete, forceSave = false }: Props) {
  const [page, setPage] = useState<MenuPage>(initialPage);
  const [saves, setSaves] = useState<SaveSlot[]>(() => initialPage === "main" ? [] : getAllSaves());
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  function openSaves(pageMode: "save" | "load") {
    setSaves(getAllSaves());
    setPage(pageMode);
  }

  function handleSave(slot: number) {
    try {
      const runtime = gameBridge.captureMapRuntime();
      saveToSlot(
        slot,
        runtime ? { ...state, mapRuntime: runtime } : state,
        dialogPreview,
        currentChapter,
        state.currentMapId,
      );
      setSaves(getAllSaves());
      onSaveComplete?.();
    } catch (error) {
      console.error("[Save] 保存失败", error);
      window.alert("存档失败，原有存档未被覆盖。请检查浏览器存储空间。");
    }
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

  if (page === "settings") {
    return <SettingsPanel onClose={() => setPage("main")} />;
  }

  if (page === "tutorial") {
    return <TutorialPanel onClose={() => setPage("main")} />;
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
              <button className="start-btn" onClick={() => setPage("tutorial")}>
                新手教程
              </button>
              <button className="start-btn" onClick={() => { onShowBacklog(); onClose(); }}>
                回顾
              </button>
              <button className="start-btn" onClick={() => setPage("settings")}>
                设置
              </button>
            </div>
            <button className="start-btn back-btn" onClick={onClose}>
              继续游戏
            </button>
          </>
        )}

        {(page === "save" || page === "load") && (
          <>
            <h2 className="game-menu-title">{page === "save" ? "存档" : "读档"}</h2>
            <div className="save-slots">
              {page === "load" && saves.length === 0 && (
                <div className="save-slot-empty">暂无可读取的存档</div>
              )}
              {(page === "save"
                ? Array.from({ length: 10 }, (_, i) => i)
                : saves.map((sv) => sv.slot)
              ).map((i) => {
                const sv = saves.find((s) => s.slot === i);
                return (
                  <div key={i} className={`save-slot-card${sv ? "" : " save-slot-card--empty"}`}>
                    {/* 左侧：档位编号 */}
                    <div className="save-slot-index">
                      <span className="save-slot-num">{i + 1}</span>
                    </div>

                    {/* 中间：剧情信息 */}
                    <div className="save-slot-info">
                      {sv ? (
                        <>
                          <div className="save-slot-header">
                            {sv.chapter && (
                              <span className="save-slot-chapter">{sv.chapter}</span>
                            )}
                            {sv.mapId && (
                              <span className="save-slot-map">{getMapName(sv.mapId)}</span>
                            )}
                          </div>
                          <div className="save-slot-preview">{sv.preview || "（探索中）"}</div>
                          <div className="save-slot-time">{sv.timestamp}</div>
                        </>
                      ) : (
                        <span className="save-slot-nil">—— 空档位 ——</span>
                      )}
                    </div>

                    {/* 右侧：操作按钮 */}
                    <div className="save-slot-actions">
                      {page === "save" && (
                        <button className="slot-action-btn save-action" onClick={() => handleSave(i)}>
                          {sv ? "覆盖" : "存入"}
                        </button>
                      )}
                      {page === "load" && sv && (
                        <button className="slot-action-btn load-action" onClick={() => handleLoad(i)}>
                          读取
                        </button>
                      )}
                      {sv && (
                        <button className="slot-action-btn del-action" onClick={() => handleDelete(i)}>
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!forceSave && (
              <button className="start-btn back-btn" onClick={() => setPage("main")}>
                返回
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
