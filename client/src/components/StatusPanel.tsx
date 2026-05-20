import type { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export function StatusPanel({ state }: Props) {
  return (
    <div className="status-panel">
      <h3>玩家画像</h3>
      <p>权威抵制：{state.traits.authorityResistance}</p>
      <p>真相欲望：{state.traits.truthDesire}</p>
      <p>自我保护：{state.traits.selfProtection}</p>
      <p>共情能力：{state.traits.empathy}</p>
      <p>现实判断：{state.traits.realityJudgment}</p>
      <p>关系信任：{state.traits.trust}</p>
      <p>快乐感知：{state.traits.joyPerception}</p>
      <hr />
      <p>探索度：{state.exploration}</p>
      <p>叛逆值：{state.rebellion}</p>
      <p>快乐证明度：{state.joyProof}</p>
      <p>选择数：{state.choiceHistory.length}</p>
    </div>
  );
}
