# Benchmark 调研：2026 上半年 AI 模型竞争格局

调研时间：2026-06-19 | 数据截止：2026-06-18

---

## 排名速览

### Artificial Analysis Intelligence Index (v4.1, 截至 2026-06-18)

| 排名 | 模型 | 分数 | 来源 |
|------|------|------|------|
| 1 | Claude Opus 4.8 | 55.7% | AA 独立测试 |
| 2 | GPT-5.5 | 54.8% | AA 独立测试 |
| 3 | Claude Opus 4.7 (Adaptive) | 53.5% | AA 独立测试 |
| 4 | GPT-5.4 | 51.4% | AA 独立测试 |
| 5 | GLM-5.2 | 51.1% | AA 独立测试 |
| 6 | Gemini 3.5 Flash | 50.2% | AA 独立测试 |
| 7 | Gemini 3.1 Pro | 46.5% | AA 独立测试 |
| 8 | Qwen3.7 Max | 46.0% | AA 独立测试 |
| 9 | MiniMax M3 | 44.4% | AA 独立测试 |
| 10 | DeepSeek V4 Pro (Max) | 44.3% | AA 独立测试 |

> 来源：[BenchLM.ai - AA Intelligence Index](https://benchlm.ai/benchmarks/artificialAnalysis) + [AA 官方](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index) | 采集 2026-06-19
> 注：AA Index v4.1 权重分配 — GDPval-AA v2 (20%)、Terminal-Bench 2.1 (16%)、tau3-Banking (14%)、SciCode、HLE、GPQA Diamond、CritPt、AA-Omniscience、AA-LCR 等 9 项指标聚合

### LMArena (Chatbot Arena) Text Elo (截至 2026-06 中旬)

| 排名 | 模型 | Elo (近似) | 来源 |
|------|------|-----------|------|
| 1 | GPT-5.6 Pro | ~1465 | LMArena |
| 2 | Claude Mythos 5 | ~1458 | LMArena |
| 3 | Claude Opus 4.7 | ~1452 | LMArena |
| 4 | Gemini 3.2 Pro | ~1448 | LMArena |
| 5 | GPT-5.6 | ~1440 | LMArena |
| 6 | Claude Sonnet 4.6 | ~1428 | LMArena |
| 7 | Gemini 3.2 Flash | ~1418 | LMArena |
| 8 | DeepSeek V4.1 Pro | ~1410 | LMArena |
| 9 | Qwen 3.7 | ~1400 | LMArena |
| 10 | GPT-5.6 mini | ~1392 | LMArena |

> 来源：[Presenc AI - Arena Elo June 2026](https://presenc.ai/research/chatbot-arena-elo-leaderboard-june-2026) | 采集 2026-06-19
> 注：Arena Hard 排名，非 Overall Text；前 8 名集中在 55 Elo 点之内，为历史最窄区间

---

## 关键 Benchmark 排行榜

### SWE-bench Pro (截至 2026-06-18)

**关键背景**：SWE-bench Pro 存在两套并行排名体系。Scale SEAL 用统一标准化 scaffolding 跑全部模型；厂商自报用各自调优 harness。**同一模型家族差距可达 17-21 分**（如 Opus 4.6 在 Scale 51.9% vs Opus 4.8 在 Anthropic harness 69.2%）。

#### Scale SEAL 标准化排名（731 tasks，统一 harness）

| 排名 | 模型 | 分数 | 置信度 |
|------|------|------|--------|
| 1 | GPT-5.4 (xHigh) | 59.1% | ✅ Scale 独立 |
| 2 | Muse Spark | 55.0% | ✅ Scale 独立 |
| 3 | Claude Opus 4.6 (thinking) | 51.9% | ✅ Scale 独立 |
| 4 | Gemini 3.1 Pro (thinking) | 46.1% | ✅ Scale 独立 |
| 5 | Claude Opus 4.5 | 45.9% | ✅ Scale 独立 |
| 6 | Claude Sonnet 4.5 | 43.6% | ✅ Scale 独立 |
| 7 | Gemini 3 Pro (preview) | 43.3% | ✅ Scale 独立 |
| 8 | Claude Sonnet 4 | 42.7% | ✅ Scale 独立 |
| 9 | GPT-5 (High) | 41.8% | ✅ Scale 独立 |
| 10 | GPT-5.2 Codex | 41.0% | ✅ Scale 独立 |

> 来源：[morphllm.com - SWE-bench Pro](https://www.morphllm.com/swe-bench-pro) | 采集 2026-06-19

#### 厂商自报分数（各自 harness）

| 模型 | 自报分数 | 来源 | 置信度 |
|------|---------|------|--------|
| Claude Fable 5 | 80.3% | Anthropic scaffold | ⚠️ 厂商自报，未上 SEAL |
| Claude Opus 4.8 | 69.2% | Anthropic scaffold | ⚠️ 厂商自报 |
| MiniMax M3 | 59.0% | Claude Code as scaffold | ⚠️ 厂商自报 |
| Kimi K2.6 | 58.6% | Moonshot harness | ⚠️ 厂商自报 |
| GLM-5.1 | 58.4% | 智谱 harness | ⚠️ 厂商自报 |

### Terminal-Bench 2.0 (截至 2026-06-18)

| 排名 | Agent + 模型 | 分数 | 来源 |
|------|-------------|------|------|
| 1 | NexAU-AHE + GPT-5.5 | 84.7% | TB 独立 |
| 2 | LemonHarness + Multiple | 84.5% | TB 独立 |
| 3 | Capy + GPT-5.5 | 83.1% | TB 独立 |
| 4 | Codex CLI + GPT-5.5 | 82.2% | TB 独立 |
| 5 | Polaris + Multiple | 82.2% | TB 独立 |
| 6 | WOZCODE + Claude Opus 4.7 | 80.2% | TB 独立 |
| 7 | TongAgents + Gemini 3.1 Pro | 80.2% | TB 独立 |
| 8 | SageAgent + GPT-5.3-Codex | 78.4% | TB 独立 |
| 9 | Droid + GPT-5.3-Codex | 77.3% | TB 独立 |
| 10 | Meta-Harness + Claude Opus 4.6 | 76.4% | TB 独立 |

> 来源：[tbench.ai - Terminal-Bench 2.0 Leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.0) | 采集 2026-06-19
> 注：Terminal-Bench 测的是 agent+model 组合，非纯模型能力。89 个真实命令行任务。

**按纯模型排名（llm-stats.com 汇总）**：

| 排名 | 模型 | 分数 |
|------|------|------|
| 1 | GPT-5.5 | 82.7% |
| 2 | Claude Mythos Preview | 82.0% |
| 3 | GPT-5.3 Codex | 77.3% |
| 4 | Gemini 3.5 Flash | 76.2% |
| 5 | GPT-5.4 | 75.1% |
| 6 | Claude Opus 4.8 | 74.6% |
| 7 | Qwen3.7-Plus | 70.3% |
| 8 | Qwen3.7 Max | 69.7% |
| 9 | Claude Opus 4.7 | 69.4% |
| 10 | GLM-5.1 | 69.0% |

> 来源：[llm-stats.com - Terminal-Bench 2.0](https://llm-stats.com/benchmarks/terminal-bench-2) | 采集 2026-06-19

### LiveCodeBench (截至 2026-06)

| 排名 | 模型 | Pass Rate | 来源 |
|------|------|-----------|------|
| 1 | DeepSeek-V4-Pro-Max | 0.935 | LCB 独立 |
| 2 | DeepSeek-V4-Flash-Max | 0.916 | LCB 独立 |
| 3 | DeepSeek-V3.2 (Thinking) | 0.833 | LCB 独立 |
| 4 | DeepSeek-V3.2 | 0.833 | LCB 独立 |
| 5 | MiniMax M2 | 0.830 | LCB 独立 |
| 6 | LongCat-Flash-Thinking-2601 | 0.828 | LCB 独立 |
| 7 | Nemotron 3 Super (120B A12B) | 0.812 | LCB 独立 |
| 8 | Grok-3 Mini | 0.804 | LCB 独立 |
| 9 | Grok 4 Fast | 0.800 | LCB 独立 |
| 10 | LongCat-Flash-Thinking | 0.794 | LCB 独立 |

> 来源：[llm-stats.com - LiveCodeBench](https://llm-stats.com/benchmarks/livecodebench) | 采集 2026-06-19
> 注：LiveCodeBench 持续从 LeetCode/AtCoder/Codeforces 抽新题，抗数据污染。DeepSeek V4 系列霸榜。

### AA-Omniscience 幻觉率排名

| 模型 | AA-Omniscience Index | 准确率 | 幻觉率 | 来源 |
|------|---------------------|--------|--------|------|
| Claude Fable 5 | 40.0 | 61.0% | 高（未公布具体值） | AA |
| Gemini 3.1 Pro | 32.9 | 55.3% | 50% | AA |
| Claude Opus 4.8 | 27.4 | 46.6% | 35.9% | AA |
| Claude Opus 4.7 | 26.2 | ~47% | 36% | AA |
| Gemini 3.5 Flash | 22.7 | N/A | N/A | AA |
| **GPT-5.5 (xhigh)** | **20.1** | **57%** | **86%** | **AA** |
| Grok 4.3 | 18.3 | N/A | N/A | AA |
| Gemini 3 Pro | 15.8 | N/A | N/A | AA |
| Qwen 3.7 Max | 14.1 | N/A | 22.9% | AA |

> 来源：[CodingFleet - AA-Omniscience Rankings 2026](https://codingfleet.com/blog/ai-model-hallucination-rates-2026/) + [AA 官方](https://artificialanalysis.ai/evaluations/omniscience) | 采集 2026-06-19

### Humanity's Last Exam - Text Only (Scale SEAL)

| 排名 | 模型 | 准确率 | 来源 |
|------|------|--------|------|
| 1 | Gemini 3.1 Pro Preview (thinking high) | 47.31% | ✅ Scale 独立 |
| 2 | GPT-5.4-pro-2026-03-05 | 45.32% | ✅ Scale 独立 |
| 3 | Muse Spark | 40.92% | ✅ Scale 独立 |
| 4 | Gemini 3 Pro Preview | 37.72% | ✅ Scale 独立 |
| 5 | GPT-5.4 (xhigh thinking) | 36.47% | ✅ Scale 独立 |
| 6 | Claude Opus 4.6 (thinking max) | 36.24% | ✅ Scale 独立 |

> 来源：[Scale Labs - HLE Text Only](https://labs.scale.com/leaderboard/humanitys_last_exam_text_only) | 采集 2026-06-19
> **关键发现：豆包 Seed 2.0 Pro 不在此榜单上。49 个已评测模型中无任何字节跳动模型。**

---

## 逐模型验证

### 1. Kimi K2.7-Code (2026-06-12 发布)

#### 厂商自报数据

| Benchmark | K2.7-Code | K2.6 | GPT-5.5 | Opus 4.8 | 置信度 |
|-----------|-----------|------|---------|----------|--------|
| Kimi Code Bench v2 | 62.0 | 50.9 | 69.0 | 67.4 | ⚠️ 自研 benchmark |
| Program Bench | 53.6 | 48.3 | 69.1 | N/A | ⚠️ 自研 benchmark |
| MLS Bench Lite | 35.1 | 26.7 | N/A | N/A | ⚠️ 自研 benchmark |
| MCP Atlas | 76.0 | 69.4 | N/A | N/A | ⚠️ 自研 benchmark |
| MCP Mark Verified | 81.1 | 72.8 | N/A | N/A | ⚠️ 自研 benchmark |

#### 第三方独立测试

**无。截至 2026-06-19，K2.7-Code 没有任何标准公开 benchmark 的第三方成绩**：
- 未提交 SWE-bench Verified / Pro
- 未提交 Terminal-Bench
- 未提交 LiveCodeBench
- 未提交 GPQA Diamond / AIME / MMLU-Pro
- 未提交 DeepSWE

> 来源：[TechTimes - K2.7 Skips Independent Benchmark Submission](https://www.techtimes.com/articles/318414/20260615/kimi-k27-code-adds-highspeed-mode-skips-independent-benchmark-submission.htm) + [Codersera K2.7 Guide](https://codersera.com/blog/kimi-k2-7-complete-guide-2026/) | 采集 2026-06-19

#### 数据冲突项

- 所有 5 个 benchmark（Kimi Code Bench v2, Program Bench, MLS Bench Lite, MCP Atlas, MCP Mark Verified）均为 Moonshot 自研自测
- 对比条件不统一：K2.7 跑 Kimi Code CLI；GPT-5.5 跑 Codex xhigh；Opus 4.8 跑 Claude Code xhigh
- K2.7 相比 K2.6 的提升数字（+21.8% 等）仅在自研 benchmark 上成立
- **结论：口播不能引用为"K2.7 超过了 XX"，只能说"Moonshot 自测显示..."**

---

### 2. Qwen3.7-Max (2026-05-20 发布)

#### 第三方独立数据

| 指标 | 数值 | 来源 | 置信度 |
|------|------|------|--------|
| Arena Elo (Text) | 1,475 (#13) | LMArena 独立 | ✅ |
| Arena Elo (Code WebDev) | 1,541 (#4) | LMArena 独立 | ✅ |
| Arena Math | #7 | LMArena 独立 | ✅ |
| AA Intelligence Index | 46.0% (#8) | Artificial Analysis | ✅ |
| Terminal-Bench 2.0 | 69.7% (#8) | TB 独立 | ✅ |
| AA 输出速度 | 94.7 TPS | AA | ✅ |
| AA TTFT | 2.70s | AA | ✅ |
| AA-Omniscience Index | 14.1 | AA | ✅ |
| AA-Omniscience 幻觉率 | 22.9% | AA | ✅ |

#### 厂商自报数据

| Benchmark | 分数 | 置信度 |
|-----------|------|--------|
| GPQA Diamond | 92.4 | ⚠️ 自报 |
| HMMT 2026 Feb | 97.1 | ⚠️ 自报 |

#### 数据冲突项

- **用户提到"官方称 Arena 1284 分超 GPT-5.5"——这个数字有误**。多源确认 Qwen3.7-Max 的 Arena Elo 是 **1,475**（Text Arena #13），不是 1,284。1,284 可能是混淆了别的指标或旧版本数据
- 1,475 排 #13，远低于 GPT-5.5 的 Elo（前 5 级别），不存在"超 GPT-5.5"的说法
- GPQA Diamond 92.4 和 HMMT 97.1 目前仅有自报数据，无独立验证

---

### 3. 豆包 Seed 2.0 Pro (2026-02-14 发布)

#### 第三方独立数据

| 指标 | 数值 | 来源 | 置信度 |
|------|------|------|--------|
| LMArena Text Arena | #6 (发布时) | LMArena 独立 | ✅ |
| LMArena Vision Arena | #3-4 (发布时) | LMArena 独立 | ✅ |

#### 厂商自报数据

| Benchmark | 分数 | 置信度 |
|-----------|------|--------|
| HLE-Text | 54.2 (声称最高) | ❌ 存疑 |
| AIME 2025 | 98.3 | ⚠️ 自报 |
| Codeforces Rating | 3020 | ⚠️ 自报 |
| VideoMME | 89.5 | ⚠️ 自报 |

#### 数据冲突项 — HLE-Text 54.2 严重存疑

**这是本次调研最重要的发现之一。**

- Scale SEAL 的 HLE-Text Only 榜单上（49 个模型），**没有任何字节跳动/豆包模型**
- 当前 HLE-Text Only 排名第一的是 Gemini 3.1 Pro Preview，得分 47.31%
- 如果豆包 Seed 2.0 Pro 真的拿到 54.2%，它应该是榜一，但它根本不在榜上
- **两种可能**：
  1. 字节跳动用的是不同版本的 HLE（非 Scale SEAL 的标准版本），或自行测试未提交
  2. 测试条件不同（温度参数、prompt 格式等）
- **结论：54.2 这个数字不能直接引用为"HLE 最高分"。口播建议改为"字节自测 HLE 54.2，但该成绩未出现在 Scale SEAL 官方排行榜上"**

> 来源对比：[Scale Labs HLE Leaderboard](https://labs.scale.com/leaderboard/humanitys_last_exam_text_only) vs [字节官方发布](https://seed.bytedance.com/en/blog/seed-2-0-official-launch) | 采集 2026-06-19

---

### 4. Kimi K2.6

#### 第三方独立数据

| 指标 | 数值 | 来源 | 置信度 |
|------|------|------|--------|
| AA Intelligence Index | 42.8% (#14) | AA | ✅ |
| Terminal-Bench 2.0 | 66.7% (#14) | TB 独立 | ✅ |

#### 厂商自报数据

| Benchmark | 分数 | 置信度 |
|-----------|------|--------|
| SWE-bench Verified | 80.2% | ⚠️ 自报 |
| SWE-bench Pro | 58.6% | ⚠️ 自报 |

#### 数据冲突项 — SWE-bench Verified 80% 的可信度

- K2.6 声称 SWE-bench Verified 80.2%，但该分数为 Moonshot 自测
- K2.6 **未出现在 Scale SEAL 的 SWE-bench Pro 标准化排行榜上**
- SWE-bench Pro 58.6% 也是自报分数
- 多个来源提到"K2.6 的 SWE-bench 数字在不同来源间有争议"（contested across sources）
- Moonshot model card 标注"部分分数在 K2.6 条件下重新评测"
- **无第三方独立复现**，且 Moonshot 建议第三方提供商参考 KVV (Kimi Vendor Verifier) 选择高准确度服务
- 用户提到"第三方复现仅 60-65%"——本次调研未找到明确的第三方复现数据来源，但考虑到 harness 差距普遍在 10-20 分，60-65% 的估计在合理范围内
- **结论：口播应说"Moonshot 自测 80.2%，未经第三方验证"，不能直接说"K2.6 SWE-bench 80%"**

---

### 5. MiniMax M3 (2026-06-01 发布)

#### 第三方独立数据

| 指标 | 数值 | 来源 | 置信度 |
|------|------|------|--------|
| AA Intelligence Index | 44.4% (#9) | AA | ✅ |

#### 厂商自报数据

| Benchmark | 分数 | 置信度 |
|-----------|------|--------|
| SWE-Bench Pro | 59.0% | ⚠️ 自报（Claude Code scaffold） |
| Terminal-Bench 2.1 | 66.0% | ⚠️ 自报 |
| MCP-Atlas | 74.2% | ⚠️ 自报 |
| BrowseComp | 83.5% | ⚠️ 自报 |
| OSWorld-Verified | 70.06% | ⚠️ 自报 |

#### 数据冲突项

- SWE-bench Pro 59.0% 是 MiniMax 自跑，**用 Claude Code 做 scaffolding**，未在 Scale SEAL 标准化评测
- 但该分数与 GPT-5.4 在 SEAL 标准化的 59.1% 非常接近——考虑到 harness 差距，M3 在标准化条件下的真实分数可能显著更低
- MiniMax 自己也承认这些是"long-horizon autonomous execution 的演示，非受控 benchmark 评测"
- 未公布 MMLU、GPQA、HumanEval、LiveCodeBench 分数
- **结论：59.0% 可以引用但必须标注"厂商自测，非 Scale 标准化"**

---

## GPT-5.5 幻觉率 86% 详解

### 数据口径

| 指标 | 数值 | 含义 |
|------|------|------|
| AA-Omniscience 准确率 | 57% | 答对的比例 — **所有模型最高** |
| AA-Omniscience 幻觉率 | 86% | **在答错的那 43% 里**，有 86% 是编造答案而非选择拒答 |

### 正确理解

- **不是说 GPT-5.5 有 86% 的回答是幻觉**
- 正确解读：GPT-5.5 知道的最多（57% 准确率排第一），但当它不知道时，它几乎从不承认不知道（86% 的错误是编造而非拒答）
- 对比：Claude Opus 4.8 准确率 46.6%、幻觉率 35.9%；Qwen3.7 Max 幻觉率 22.9%
- **悖论**：同一模型同时是"最博学的"和"最不会说不知道的"

> 来源：[AA 官方 - GPT-5.5 文章](https://artificialanalysis.ai/articles/openai-gpt5-5-is-the-new-leading-AI-model) + [FindSkill.ai](https://findskill.ai/blog/gpt-5-5-hallucination-rate-how-to-use/) + [the-decoder](https://the-decoder.com/gpt-5-5-tops-benchmarks-but-still-hallucinates-frequently-at-a-20-percent-higher-api-cost/) | 采集 2026-06-19

---

## Scale SEAL vs 厂商 Harness 差距专题

### 核心数据

| 模型 | Scale SEAL 标准化 | 厂商自报 | 差距 |
|------|------------------|---------|------|
| Claude Opus 4.6 | 51.9% (SWE-bench Pro) | — | 基准 |
| Claude Opus 4.8 | — | 69.2% (SWE-bench Pro) | ~17 分 |
| Claude Opus 4.5 (3 harness 对比) | 50.2%-55.4% | — | 同模型不同 harness 差 5.2 分 |

### 学术论证

- arXiv 2605.23950 论文 "Stop Comparing LLM Agents Without Disclosing the Harness" 系统论证了 harness 是实验变量
- arXiv 2606.14249 HarnessX 论文显示 harness 设计平均带来 +14.5% 增益（最高 +44.0%）
- arXiv 2606.12344 Claw-SWE-Bench 将 harness 作为受控变量

### 结论

**SWE-bench 系列分数中，10-20 分的差距可能完全来自 harness 而非模型能力。** 跨厂商比较只有在同一标准化 harness（如 Scale SEAL）下才有意义。

> 来源：[morphllm.com](https://www.morphllm.com/swe-bench-pro) + [digitalapplied.com](https://www.digitalapplied.com/blog/swe-bench-verified-june-2026-benchmark-vs-scaffolding-analysis) + [arxiv](https://arxiv.org/html/2605.23950) | 采集 2026-06-19

---

## Benchmark 可信度评级

| Benchmark | 可信度 | 原因 |
|-----------|--------|------|
| LMArena (Chatbot Arena) | ★★★★★ | 人类盲评，无法 game，最接近真实体感 |
| AA Intelligence Index v4.1 | ★★★★☆ | 9 项聚合，独立测试，但有方法论争议 |
| Scale SEAL SWE-bench Pro（标准化） | ★★★★☆ | 统一 harness，受控，但只有 731 tasks |
| Terminal-Bench 2.0 | ★★★★☆ | 真实 CLI 任务，agent+model 组合，抗污染 |
| LiveCodeBench | ★★★★☆ | 持续抽新题，抗数据污染，但偏竞赛编程 |
| HLE (Scale SEAL 版) | ★★★★☆ | 2700 专家题，难度极高，区分度好 |
| AA-Omniscience | ★★★☆☆ | 独立但口径容易被误读（幻觉率定义特殊） |
| GPQA Diamond | ★★★☆☆ | 已部分饱和，但仍有区分度 |
| SWE-bench Verified（厂商自报） | ★★☆☆☆ | harness 差异 10-30 分，不同厂商不可比 |
| HumanEval / MMLU | ★☆☆☆☆ | 严重数据污染+饱和，几乎无参考价值 |
| 厂商自研 benchmark | ★☆☆☆☆ | 自己出题自己考，零可比性 |

> 来源：[digitalapplied.com - Benchmark Methodology](https://www.digitalapplied.com/blog/llm-benchmark-methodology-2026-contamination-leaderboard-guide) + [kili-technology.com](https://kili-technology.com/blog/ai-benchmarks-guide-the-top-evaluations-in-2026-and-why-theyre-not-enough) | 采集 2026-06-19

---

## 口播稿建议

### 可以放心引用的数字（多源验证 ✅）

1. **AA Intelligence Index 前 10 排名** — 独立第三方，方法论公开，可直接引用
2. **LMArena Arena Elo** — 人类盲评金标准，可直接说"人类评测第 X"
3. **Scale SEAL SWE-bench Pro 标准化分数** — 可以直接对比不同模型，但要说清"标准化条件下"
4. **Terminal-Bench 2.0 排名** — 独立测试，但要提到测的是 agent+model 组合
5. **LiveCodeBench 排名** — DeepSeek V4 霸榜是第三方实测
6. **GPT-5.5 幻觉率 86%** — 可以引用但**必须解释口径**（不是 86% 的回答是幻觉，是答错时 86% 选择编造）

### 必须加"官方数据/厂商自测"限定词

1. **Kimi K2.7-Code 所有 benchmark** — 全部是 Moonshot 自研 benchmark，无任何第三方验证
2. **Kimi K2.6 SWE-bench Verified 80.2%** — 自报，未上 Scale SEAL，无独立复现
3. **豆包 Seed 2.0 Pro HLE-Text 54.2%** — 自报，且不在 Scale HLE 榜单上，严重存疑
4. **MiniMax M3 SWE-bench Pro 59.0%** — 自报（用 Claude Code scaffold），非 Scale 标准化
5. **Qwen3.7-Max GPQA 92.4 / HMMT 97.1** — 自报，无独立验证

### 推荐口播话术

- ❌ "豆包 2.0 Pro 在 HLE 上拿了 54.2 分全球最高"
- ✅ "字节声称豆包 HLE 54.2 分，但 Scale 官方榜上没有这个成绩，目前榜一是 Gemini 3.1 Pro 的 47.3%"

- ❌ "K2.7 编程能力超越 GPT-5.5"
- ✅ "Moonshot 自研 benchmark 上 K2.7 还落后 GPT-5.5 七个点，而且这些 benchmark 外部没人跑过"

- ❌ "K2.6 SWE-bench 80%"
- ✅ "Moonshot 自测 80.2%，但没上 Scale 标准化排行，考虑到 harness 差距通常 10-20 分，实际水平可能低不少"

- ❌ "GPT-5.5 幻觉率高达 86%"
- ✅ "AA-Omniscience 测试里，GPT-5.5 准确率是所有模型最高的 57%，但它答错的时候有 86% 是编造——最博学但最不会说不知道"

---

## 建议补充调研

- **Kimi K2.7-Code 第三方实测** — 等 2-3 周看有没有社区或独立评测机构跑标准 benchmark → community-researcher
- **豆包 Seed 2.0 Pro HLE 得分差异** — 建议直接联系 Scale AI 确认是否收到过字节提交 → 可在视频中公开提问
- **Qwen3.7-Max 的 1,284 vs 1,475** — 需确认 1,284 这个数字的原始出处，可能是用户记忆偏差或不同版本/时间点的数据 → community-researcher
- **MiniMax M3 在 Scale SEAL 标准化下的成绩** — 等 Scale 评测结果（M3 6月1日才发布，可能还在评测队列中）
- **各模型 API 定价对比** — 配合 benchmark 数据做"性价比矩阵" → pricing-researcher
