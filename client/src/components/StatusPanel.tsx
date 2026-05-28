import type { GameState } from "../types/game";

interface Props {
  state: GameState;
}

const TRAIT_LABELS: Record<string, string> = {
  authorityResistance: "权威抵制",
  truthDesire: "真相欲望",
  selfProtection: "自我保护",
  empathy: "共情能力",
  realityJudgment: "现实判断",
  trust: "关系信任",
  joyPerception: "快乐感知",
};

const NPC_LABELS: Record<string, string> = {
  liuyu: "刘宇",
  wangTeacher: "王沁林",
  zhouJunxiu: "周隽秀",
  zhouQirui: "周骐瑞",
  chengXiaoxiao: "程潇潇",
};

function traitColor(v: number): string {
  if (v >= 3) return "#7eff7e";
  if (v >= 1) return "#b0e0b0";
  if (v <= -3) return "#ff6b6b";
  if (v <= -1) return "#f0a0a0";
  return "#c8d8e8";
}

function rebellionColor(v: number): string {
  if (v >= 70) return "#ff4444";
  if (v >= 35) return "#ff8844";
  return "#c8d8e8";
}

export function StatusPanel({ state }: Props) {
  const trustEntries = Object.entries(state.npcTrust)
    .filter(([, v]) => v !== 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="status-panel">
      <h3>玩家画像</h3>
      {Object.entries(state.traits).map(([key, val]) => (
        <p key={key}>
          <span style={{ color: traitColor(val) }}>
            {TRAIT_LABELS[key] ?? key}：{val}
          </span>
        </p>
      ))}
      <hr />
      <p className="rebellion-indicator">
        叛逆值：
        <span style={{ color: rebellionColor(state.rebellion) }}>
          {state.rebellion}%
        </span>
        {state.rebellion >= 35 && (
          <span className="rebellion-warn">
            {state.rebellion >= 70 ? " ⚠ 主动技能已解锁" : " ⚠ 技能初始化中"}
          </span>
        )}
      </p>
      <p>探索度：{state.exploreState.totalExplored}</p>
      <p>选择数：{state.choiceHistory.length}</p>
      {trustEntries.length > 0 && (
        <>
          <hr />
          <h3>NPC 信任度</h3>
          {trustEntries.map(([npcId, val]) => (
            <p key={npcId}>
              {NPC_LABELS[npcId] ?? npcId}：
              <span style={{
                color: val >= 0 ? "#7eff7e" : "#ff6b6b",
                fontWeight: "bold",
              }}>
                {val > 0 ? "+" : ""}{val}
              </span>
            </p>
          ))}
        </>
      )}
    </div>
  );
}
