# MiniMax M2.5 模型能力测评

本合集对 MiniMax M2.5 模型进行多场景能力测评，包含理论资料与实测项目。

## 理论资料

| 文件 | 说明 |
|------|------|
| MiniMax M2.5理论部分PPT.pptx | MiniMax M2.5 模型理论讲解 PPT |
| MiniMax-M1 Scaling Test-time Compute Efficiently with Lightning Attention.pdf | 原始论文 |
| Lost in the Middle How Language Models Use Long Contexts.pdf | 长上下文相关论文 |

## 测试项目

| 序号 | 标题 | 说明 |
|:----:|------|------|
| 演示一 | [MiniMax M2.5 Claude Code 数据分析](./演示一：MiniMaxM2.5ClaudeCode数据分析) | Claude Code 模式数据分析，含源码与测试数据 |
| 演示二 | [MiniMax M2.5 OpenClaw 财报分析](./演示二：MiniMaxM2.5OpenClaw财报分析) | OpenClaw 财报分析提示词与实测 PDF |

## 目录结构

```
第2合集/260314-MiniMax M2.5模型测评/
├── README.md
├── MiniMax M2.5理论部分PPT.pptx
├── MiniMax-M1 Scaling Test-time Compute Efficiently with Lightning Attention.pdf
├── Lost in the Middle How Language Models Use Long Contexts.pdf
├── 演示一：MiniMaxM2.5ClaudeCode数据分析/
│   ├── CLAUDE.md
│   ├── data/
│   ├── .claude/
│   ├── generate_pdf.py
│   ├── phase1_data_processing.py
│   └── phase2_chart_generation.py
└── 演示二：MiniMaxM2.5OpenClaw财报分析/
    ├── M2.5OpenClaw提示词.md
    └── M2.5OpenCLaw生成PDF.pdf
```

## 演示一源码结构

- `phase1_data_processing.py`：数据处理脚本
- `phase2_chart_generation.py`：图表生成脚本
- `generate_pdf.py`：PDF 报告生成
- `data/`：测试数据目录
