# MiniMax M2.7 模型能力测评

本合集对 MiniMax M2.7 模型进行多场景能力测评，包含完整的测试 Prompt 和实测结果。

## 测试项目

| 序号 | 标题 | 说明 |
|:----:|------|------|
| 演示一 | [MiniMax M2.7 Claude Code 数据分析](./演示一：MiniMaxM2.7ClaudeCode数据分析) | Claude Code 模式下进行数据采集、分析与报告生成 |
| 演示二 | [MiniMax M2.7 OpenClaw 财报分析](./演示二：MiniMaxM2.7OpenClaw财报分析) | 使用 OpenClaw 进行贵州茅台财报数据采集与 PDF 报告生成 |
| 演示三 | [MiniMax M2.7 个人助理 Prompt](./演示三：MiniMaxM2.7个人助理Prompt.md) | 日常效率助理能力测试，考察指令遵从、时间推理、冲突检测等 |
| 演示四 | [MniMax M2.7 全栈测试 Prompt](./演示四：MniMaxM2.7全栈测试Prompt.md) | 全栈开发能力测试 |

## 目录结构

```
第2合集/260317-MiniMax M2.7模型测评/
├── README.md
├── 演示一：MiniMaxM2.7ClaudeCode数据分析/
│   ├── CLAUDE.md
│   ├── data/
│   └── .claude/
├── 演示二：MiniMaxM2.7OpenClaw财报分析/
│   ├── M2.7OpenClaw财报分析提示词.md
│   ├── M2.7OpenClaw生成报告PDF1.pdf
│   └── M2.7OpenClaw生成报告PDF2.pdf
├── 演示三：MiniMaxM2.7个人助理Prompt.md
└── 演示四：MniMaxM2.7全栈测试Prompt.md
```

## 测试亮点

- **演示三（个人助理）**：包含 Round 0-3 多轮测试，考察模型在复杂日程冲突下的处理能力
- **演示二（OpenClaw 财报分析）**：基于 OpenClaw 的自动化数据分析链路，涉及浏览器采集、数据清洗、图表生成、PDF 报告、飞书发送
