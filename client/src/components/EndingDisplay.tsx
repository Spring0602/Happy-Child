import type { EndingCard, GameState } from "../types/game";

interface Props {
  ending: EndingCard;
  state: GameState;
  onRestart: () => void;
}

const LAYER_COLORS: Record<string, string> = {
  "认知层-未通过": "#8899aa",
  "认知层✓ / 行动层-破坏性": "#cc6644",
  "认知层✓ / 行动层-缺失": "#8899aa",
  "认知层✓ / 行动层-方向错误": "#cc9944",
  "认知层✓ / 行动层✓ / 影响层-部分": "#66aaaa",
  "认知层✓ / 行动层✓ / 影响层✓": "#ffcc44",
};

export function EndingDisplay({ ending, state, onRestart }: Props) {
  const layerColor = LAYER_COLORS[ending.layer ?? ""] ?? "#8899aa";

  return (
    <div className="ending-root">
      <div className="ending-overlay" />

      <div className="ending-content">
        {/* 结局标题 */}
        <div className="ending-header">
          <div className="ending-layer" style={{ color: layerColor, borderColor: layerColor }}>
            {ending.layer ?? "??? 层"}
          </div>
          <h1 className="ending-title">{ending.title}</h1>
          <p className="ending-desc">{ending.description}</p>
        </div>

        {/* 结局独白 */}
        <div className="ending-monologue">
          <div className="monologue-scroll">
            {ending.monologue?.split("\n\n").map((para, i) => (
              <p key={i} className="monologue-para">{para}</p>
            ))}
          </div>
        </div>

        {/* 玩家轨迹 */}
        <div className="ending-traits">
          <h3>你的人格画像</h3>
          <div className="ending-trait-grid">
            {Object.entries(state.traits).map(([key, val]) => (
              <div key={key} className="ending-trait-item">
                <span className="trait-label">{traitLabel(key)}</span>
                <span className="trait-bar-container">
                  <span
                    className="trait-bar-filled"
                    style={{
                      width: `${((val + 5) / 10) * 100}%`,
                      background: val >= 0
                        ? `hsl(${120 + val * 10}, 60%, 50%)`
                        : `hsl(${0 - val * 10}, 60%, 50%)`,
                    }}
                  />
                </span>
                <span className="trait-value">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 统计数据 */}
        <div className="ending-stats">
          <div className="ending-stat">
            <span className="stat-num">{state.choiceHistory.length}</span>
            <span className="stat-label">作出选择</span>
          </div>
          <div className="ending-stat">
            <span className="stat-num">{state.exploreState.totalExplored}</span>
            <span className="stat-label">探索瓦片</span>
          </div>
          <div className="ending-stat">
            <span className="stat-num">{state.rebellion}%</span>
            <span className="stat-label">叛逆值</span>
          </div>
          <div className="ending-stat">
            <span className="stat-num">{state.exploreState.visitedMaps.length}</span>
            <span className="stat-label">到达区域</span>
          </div>
        </div>

        {/* 重新开始 */}
        <button className="ending-restart-btn" onClick={onRestart}>
          再次进入副本
        </button>

        <p className="ending-hint">
          每一次选择都会改变命运的轨迹。试着走一条不同的路吧。
        </p>
      </div>
    </div>
  );
}

function traitLabel(key: string): string {
  const labels: Record<string, string> = {
    authorityResistance: "权威抵制",
    truthDesire: "真相欲望",
    selfProtection: "自我保护",
    empathy: "共情能力",
    realityJudgment: "现实判断",
    trust: "关系信任",
    joyPerception: "快乐感知",
  };
  return labels[key] ?? key;
}
