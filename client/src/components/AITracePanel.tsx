import type { AITrace } from "../types/game";

interface Props {
  traces: AITrace[];
}

export function AITracePanel({ traces }: Props) {
  const lastTrace = traces[traces.length - 1];

  return (
    <div className="ai-trace-panel">
      <h3>AI 分析输出</h3>
      {lastTrace ? (
        <pre>{lastTrace.result}</pre>
      ) : (
        <p>暂无 AI 分析。选择带有 needAIAnalysis 的选项后会出现结果。</p>
      )}
    </div>
  );
}
