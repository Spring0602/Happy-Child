# 快乐小孩 AI 叙事游戏 Web 原型

这是一个用于 VSCode 开发的初步项目框架，目标是制作一个“视觉小说 + AI NPC + 玩家人格画像 + 结局裁决”的浏览器游戏原型。

推荐先阅读：

- `docs/AI编程说明.md`：给编程 AI / 协作者看的总说明，含流程图。
- `docs/剧情数据规范.md`：如何继续添加剧情节点、选项、角色、结局。
- `docs/开发路线图.md`：从最小原型到比赛 Demo 的开发顺序。

## 快速启动

需要先安装 Node.js 18+。

前端：

```bash
cd client
npm install
npm run dev
```

后端：

```bash
cd server
npm install
npm run dev
```

第一阶段可以只运行前端。后端当前默认是 mock AI，不会真正调用大模型。
