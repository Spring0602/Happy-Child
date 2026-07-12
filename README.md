# 快乐小孩 AI 叙事游戏 Demo

一个"视觉小说 + AI NPC + 玩家人格画像 + 结局裁决"的浏览器游戏原型。

**类型**：AI 人格裁决型规则怪谈视觉小说  
**技术栈**：React + TypeScript + Phaser 3 + Express  
**AI 支持**：OpenAI / 腾讯混元（含离线 fallback）

推荐先阅读：

- `docs/项目说明.md`：给编程 AI / 协作者看的总说明，含流程图与技术架构。
- `docs/开发路线图.md`：从最小原型到比赛 Demo 的开发顺序与完成度。
- `docs/剧情数据规范.md`：如何继续添加剧情节点、选项、角色、结局。
- `docs/快乐小孩_AI叙事游戏项目总览_v0.1.md`：世界观、角色卡、人格框架等宏观总览。

## 当前版本

- **8 章完整叙事闭环**（序章→家庭→学校→天台和解→结局裁决）
- **22 个像素探索地图**
- **22 个 AI 动态场景**（含 fallback 兜底）
- **六种人格倾向 + 六结局裁决系统**
- **11 首 BGM + 场景音效**
- **多槽位存档/读档**

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

后端默认 `MODEL_PROVIDER=mock` 模式可在无 API Key 时运行（使用 fallback 文本）。需真实 AI 时设置：
```bash
set MODEL_PROVIDER=openai     # 或 hunyuan
set OPENAI_API_KEY=sk-xxx     # 或 HUNYUAN_API_KEY
```
