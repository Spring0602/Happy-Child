import type { AITrace } from "../types/game";

interface Props {
  traces: AITrace[];
}

export function AITracePanel({ traces }: Props) {
  const lastTrace = traces[traces.length - 1];

  return (
    <div className="ai-trace-panel">
      <div className="ai-trace-header">
        <h3>AI 分析记录</h3>
        <button
          className="ai-trace-close"
          onClick={() => {
            // 通过事件冒泡由 App 控制关闭
            window.dispatchEvent(new CustomEvent("close-ai-trace"));
          }}
        >
          ✕
        </button>
      </div>
      {lastTrace ? (
        <pre>{lastTrace.result}</pre>
      ) : (
        <p>暂无 AI 分析记录。</p>
      )}
    </div>
  );
}
