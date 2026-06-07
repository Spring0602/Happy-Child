import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 捕获未处理的错误，防止 Vite 开发模式下的 error overlay 弹出
// 错误会静默记录到控制台，不阻塞游戏体验
window.addEventListener("error", (e) => {
  console.warn("[Game] 运行时错误已静默:", e.message);
  e.preventDefault();
  e.stopPropagation();
  return false;
});

window.addEventListener("unhandledrejection", (e) => {
  console.warn("[Game] 未处理的 Promise 拒绝已静默:", e.reason);
  e.preventDefault();
  e.stopPropagation();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
