import { useEffect, useState } from "react";
import { getPortraits, type PortraitRecord } from "../engine/save";

interface Props {
  onClose: () => void;
}

/** 七维人格的中文标签 */
const TRAIT_LABELS: Record<string, string> = {
  authorityResistance: "权威抵制度",
  truthDesire: "真相欲望",
  selfProtection: "自我保护",
  empathy: "共情能力",
  realityJudgment: "现实判断",
  trust: "关系信任",
  joyPerception: "快乐感知",
};

/** 七维人格解释 */
const TRAIT_DESCRIPTIONS: Record<string, string> = {
  authorityResistance: "是否敢质疑老师、父母、规则",
  truthDesire: "是否愿意冒险追问本质",
  selfProtection: "是否保留筹码、谨慎行动",
  empathy: "是否理解 NPC 与'我'的痛苦",
  realityJudgment: "是否知道何时退让、何时反抗",
  trust: "是否愿意与 NPC 合作",
  joyPerception: "是否能从功利外感受生命",
};

function TraitBar({ name, value }: { name: string; value: number }) {
  const clamped = Math.max(-100, Math.min(100, value));
  const pct = Math.abs(clamped);
  const isPositive = clamped >= 0;
  const color = isPositive ? "#4fc3f7" : "#ef5350";

  return (
    <div className="portrait-trait-row">
      <div className="portrait-trait-header">
        <span className="portrait-trait-name">{TRAIT_LABELS[name] ?? name}</span>
        <span className="portrait-trait-value" style={{ color }}>
          {isPositive ? "+" : ""}{value}
        </span>
      </div>
      <div className="portrait-trait-desc">{TRAIT_DESCRIPTIONS[name] ?? ""}</div>
      <div className="portrait-trait-bar-bg">
        <div
          className="portrait-trait-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function PersonalityPortrait({ onClose }: Props) {
  const [records, setRecords] = useState<PortraitRecord[]>([]);

  useEffect(() => {
    setRecords(getPortraits());
  }, []);

  const noRecords = records.length === 0;

  return (
    <div className="portrait-overlay">
      <div className="portrait-panel">
        <h2 className="portrait-title">人格画像</h2>

        {noRecords ? (
          <div className="portrait-empty">
            <p className="portrait-empty-icon">🧩</p>
            <p className="portrait-empty-text">
              您还没有人格画像，快去通关一局游戏看看吧~
            </p>
          </div>
        ) : (
          <div className="portrait-records">
            {records.map((r, i) => (
              <div key={i} className="portrait-record">
                <div className="portrait-record-header">
                  <span className="portrait-ending-title">{r.endingTitle}</span>
                  <span className="portrait-record-time">{r.timestamp}</span>
                </div>
                <div className="portrait-traits-grid">
                  {Object.keys(TRAIT_LABELS).map(key => (
                    <TraitBar key={key} name={key} value={r.traits[key] ?? 0} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="start-btn back-btn" onClick={onClose}>
          返回
        </button>
      </div>
    </div>
  );
}
