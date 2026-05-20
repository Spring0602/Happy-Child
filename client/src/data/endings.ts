import type { EndingCard } from "../types/game";

export const endings: Record<string, EndingCard> = {
  good_child: {
    id: "good_child",
    title: "好孩子",
    description:
      "你活了下来，也维持了所有人期待中的样子。但你没有真正醒来。",
  },

  bad_child: {
    id: "bad_child",
    title: "坏孩子",
    description:
      "你打碎了一部分规则，却还没有学会如何在破碎之后重新生活。",
  },

  bystander: {
    id: "bystander",
    title: "旁观者",
    description:
      "你看懂了一切，也保全了自己。但你没有把看见变成行动。",
  },

  hole_maker: {
    id: "hole_maker",
    title: "凿孔者",
    description:
      "你没有逃出圈，却在圈上凿出了一个孔。你终于看见了路。",
  },

  happy_child: {
    id: "happy_child",
    title: "快乐小孩",
    description:
      "你证明了快乐不是服从后的奖赏，而是人在痛苦中重新选择生活的能力。",
  },
};
