import type { GameState } from "../types/game";

interface Props {
  state: GameState;
}

const TRAITS: { key: keyof GameState["traits"]; label: string }[] = [
  { key: "authorityResistance", label: "权威抵制" },
  { key: "truthDesire", label: "真相欲望" },
  { key: "selfProtection", label: "自我保护" },
  { key: "empathy", label: "共情能力" },
  { key: "realityJudgment", label: "现实判断" },
  { key: "trust", label: "关系信任" },
  { key: "joyPerception", label: "快乐感知" },
];

function traitBarColor(value: number): string {
  if (value >= 70) return "linear-gradient(90deg, #3d6bd0, #9fd7ff)";
  if (value >= 40) return "linear-gradient(90deg, #5b7fc0, #8ab8e8)";
  return "linear-gradient(90deg, #4a4a70, #7070a0)";
}

export function StatusPanel({ state }: Props) {
  return (
    <div className="status-panel">
      <h3>🎭 玩家画像</h3>

      {TRAITS.map((t) => (
        <div className="trait-row" key={t.key}>
          <span className="trait-label">{t.label}</span>
          <div className="trait-bar-bg">
            <div
              className="trait-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(0, state.traits[t.key]))}%`,
                background: traitBarColor(state.traits[t.key]),
              }}
            />
          </div>
          <span className="trait-value">{state.traits[t.key]}</span>
        </div>
      ))}

      <hr />

      <div className="stat-row">
        <span>🔍 探索度</span>
        <span>{state.exploration}</span>
      </div>
      <div className="stat-row">
        <span>⚡ 叛逆值</span>
        <span>{state.rebellion}</span>
      </div>
      <div className="stat-row">
        <span>😊 快乐证明</span>
        <span>{state.joyProof}</span>
      </div>
      <div className="stat-row">
        <span>📊 选择次数</span>
        <span>{state.choiceHistory.length}</span>
      </div>
    </div>
  );
}
