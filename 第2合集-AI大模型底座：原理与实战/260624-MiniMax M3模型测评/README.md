# MiniMax M3 模型能力测评

本目录收录对 MiniMax M3 进行的多场景生成式测评，重点考察其在复杂信息整合、长图文排版与多 Skill/MCP 协作任务上的表现。

## 测评内容

| 项目 | 文件 | 说明 |
|------|------|------|
| 国产大模型月报 | [国产大模型月报-2026-5-6.html](./国产大模型月报-2026-5-6.html) | 2026 年 5–6 月国产 AI 大模型动态月报，主题为「过去一个月，国产 AI 集体冲刺」 |
| 沈阳旅行攻略 | [沈阳方城三日漫游-v2.html](./沈阳方城三日漫游-v2.html) | 沈阳方城三日游攻略长图文，主题为「盛京方城 · 三日漫游」 |

## 使用到的 Skill / MCP

| 文件 | 用途 |
|------|------|
| [llm-monthly-skills.txt](./llm-monthly-skills.txt) | 月报任务调用的 Skill 清单（36kr-hotlist、xhs-cn、小红书 MCP、impeccable-uxui、minimax-mmx 等） |
| [shenyang-trip-skills.txt](./shenyang-trip-skills.txt) | 旅行攻略任务调用的 Skill/MCP 清单（xhs-cn、小红书 MCP、高德地图、飞常准、impeccable-uxui 等） |

## 目录结构

```
260624-MiniMax M3模型测评/
├── README.md
├── llm-monthly-skills.txt
├── shenyang-trip-skills.txt
├── 国产大模型月报-2026-5-6.html
└── 沈阳方城三日漫游-v2.html
```

## 测试亮点

- **多源信息整合**：月报任务需要从热点榜单、社区平台等多渠道抓取并整合国产大模型动态。
- **长图文排版**：两篇 HTML 均采用中文衬线排版与 oklch 调色板，验证了模型在复杂 CSS 视觉设计上的生成能力。
- **外部工具协同**：通过 Skill/MCP 调用地图、出行、社区等外部服务，测试模型在工具链编排上的表现。
