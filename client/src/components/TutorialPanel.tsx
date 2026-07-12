interface Props {
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const tutorialSections = [
  {
    title: "移动",
    lines: [
      "使用 W / A / S / D 控制主角移动。",
      "如果主角处于坐下状态，按任意移动键会起身。",
    ],
  },
  {
    title: "调查与交互",
    lines: [
      "靠近可调查物体或门时，屏幕上会出现提示文字。",
      "按 E 键进行交互，例如调查物品、开门、切换地图或触发剧情。",
    ],
  },
  {
    title: "剧情推进",
    lines: [
      "对话出现时，按空格或点击对话框继续阅读。",
      "按 Esc 可以打开菜单，之后可在“新手教程”中重新查看本页。",
    ],
  },
];

export function TutorialPanel({
  onClose,
  title = "新手教程",
  subtitle = "探索阶段基础操作",
}: Props) {
  return (
    <div className="game-menu-overlay tutorial-overlay">
      <div className="tutorial-panel">
        <div className="tutorial-header">
          <div>
            <h2 className="tutorial-title">{title}</h2>
            <p className="tutorial-subtitle">{subtitle}</p>
          </div>
          <button className="notebook-close" onClick={onClose}>关闭</button>
        </div>

        <div className="tutorial-content">
          {tutorialSections.map((section) => (
            <section className="tutorial-section" key={section.title}>
              <h3 className="tutorial-section-title">{section.title}</h3>
              <ul className="tutorial-lines">
                {section.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <button className="start-btn back-btn tutorial-confirm" onClick={onClose}>
          我知道了
        </button>
      </div>
    </div>
  );
}
