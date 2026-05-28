import { useEffect, useState } from "react";

/** 角色立绘映射 */
const PORTRAIT_MAP: Record<string, string> = {
  default: "/assets/portraits/yps_defult.png",
  yps: "/assets/portraits/yps_defult.png",
  // 未来扩展更多角色立绘：
  // liuyu: "/assets/portraits/liuyu.png",
  // wangTeacher: "/assets/portraits/wang.png",
  // zhouJunxiu: "/assets/portraits/zhoujx.png",
};

interface StyleState {
  bottom: number;
  maxHeight: number;
}

interface Props {
  characterId?: string;
}

/**
 * 剧情模式立绘组件
 * 根据当前 speaker 角色切换立绘，居中显示在文字框上方
 */
export function PortraitDisplay({ characterId }: Props) {
  const [style, setStyle] = useState<StyleState>({ bottom: 250, maxHeight: 300 });
  const portraitSrc = PORTRAIT_MAP[characterId ?? "default"] ?? PORTRAIT_MAP["default"];

  useEffect(() => {
    const vnContent = document.querySelector(".vn-content") as HTMLElement | null;
    if (!vnContent) return;

    const update = () => {
      const rect = vnContent.getBoundingClientRect();
      const viewH = window.innerHeight;
      const gap = 16;

      // 立绘底边紧贴文字框顶部上方，留 gap 间隙
      const bottom = viewH - rect.top + gap;

      // 可用高度 = 文字框顶部到视口顶部的距离 - 间隙
      const available = rect.top - gap;
      // 最大不超过视口 42%，最小不低于 140px
      const maxH = Math.max(140, Math.min(available, viewH * 0.42));

      setStyle({ bottom, maxHeight: maxH });
    };

    const ro = new ResizeObserver(update);
    ro.observe(vnContent);
    update();

    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="portrait-container"
      style={{ bottom: style.bottom, maxHeight: style.maxHeight }}
    >
      <img
        src={portraitSrc}
        alt="角色立绘"
        className="portrait-image"
        style={{ maxHeight: style.maxHeight }}
      />
    </div>
  );
}
