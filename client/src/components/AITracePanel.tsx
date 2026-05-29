import type { AITrace } from "../types/game";

interface Props {
  traces: AITrace[];
}

export function AITracePanel({ traces }: Props) {
  const lastTrace = traces[traces.length - 1];

  return (
    <div className="ai-trace-panel">
      <h3>🤖 AI 分析输出</h3>
      {lastTrace ? (
        <pre>{lastTrace.result}</pre>
      ) : (
        <div className="empty-hint">暂无 AI 分析记录。<br />选择带 ⚡ 标记的选项后将自动生成。</div>
      )}
    </div>
  );
}
