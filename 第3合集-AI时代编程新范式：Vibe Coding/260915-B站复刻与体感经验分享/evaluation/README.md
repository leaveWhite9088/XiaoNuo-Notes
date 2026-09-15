# B站首页模型评测看板

这是一个独立的静态看板，用来把 10 个模型的最终成品放在同一套场景里比较。看板不依赖参评项目持续运行；正式采集后的截图和评分写入 `data/results.json` 即可展示。

## 打开

直接打开 `index.html` 即可浏览完整评测结果。页面会先加载内嵌的 `data/results.js`，因此 `file://` 下也能显示正式榜单；通过 HTTP 访问时会优先读取最新的 `data/results.json`，请求失败再使用内嵌结果。

也可以在 `evaluation/` 目录启动任意静态文件服务，然后访问 `/index.html`。看板本身不启动或修改任何参评项目。

## 数据格式

`data/results.json` 是正式结果源，`data/results.js` 是用于直接打开 HTML 的同步副本。两者应保持一致；正式数据可以沿用下面的结构：

```json
{
  "status": "complete",
  "updatedAt": "2026-09-13T00:00:00+08:00",
  "dimensions": [
    { "key": "visual", "label": "视觉还原", "short": "视觉", "max": 35 }
  ],
  "scenes": [
    { "id": "home-top", "label": "首页首屏", "short": "首屏" }
  ],
  "models": [
    {
      "id": "model-id",
      "name": "模型名称",
      "oneShot": {
        "status": "complete",
        "total": 86.5,
        "scores": {
          "visual": 30,
          "core": 27,
          "interaction": 13,
          "stability": 8,
          "content": 4,
          "engineering": 4.5
        },
        "feeling": "一句真实使用体感",
        "strengths": "做得好的地方",
        "weaknesses": "还可以更好的地方",
        "scenes": [
          { "id": "home-top", "image": "assets/model/home-top.png" }
        ]
      },
      "adversarial": { "status": "pending", "total": null, "scores": {}, "scenes": [] }
    }
  ]
}
```

每个截图的路径相对于 `evaluation/index.html`。截图会懒加载，点击页面墙或双屏里的图片可以放大预览。无截图、无分数时统一显示“暂未同步”，不会把缺失数据当作 0 分。

## 看板区域

- 成品榜单：分别查看一次性指令直出、对抗性审查多轮结果，以及多轮审查带来的分数变化。
- 十模型页面墙：切换六个统一场景和模式，快速横向浏览。
- 同模型双屏对比：选择模型和场景，同时查看两种方式。
- 模型详情：查看六项评分、真实使用体感、优点和改进点。

榜单中的“亲自操作”会打开现场操作导演台。现场服务未启动时，请先双击“启动实机演示”，再打开现场页面。

六项评分共 100 分：视觉还原 35、核心流程 20、操作完成度 15、稳定性 10、内容与视频真实性 10、代码质量 10。

其中前五项共 90 分，以用户逐个打开作品后的真人实机评价为准；Codex 只负责代码质量 10 分，重点检查架构、注释、可维护性和启动说明。修改公开分数时，必须同时更新 `data/results.json` 与 `data/results.js`，并确认两份数据完全一致。

榜单还提供“按你的开发目标来选”和“开发经验”两个区域，用来区分一次成型、多轮打磨、速度成本和长期维护四种选择。模型成绩会受到开发工具影响，页面中的模型详情会同时展示本次使用的开发工具。
