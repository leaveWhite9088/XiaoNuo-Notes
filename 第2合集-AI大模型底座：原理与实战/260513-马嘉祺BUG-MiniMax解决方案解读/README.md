# MiniMax Token 遗忘实验

本项目通过对比不同模型的分词器（Tokenizer）和权重，探究 SFT（监督微调）对稀疏 Token 的影响，重点关注 MiniMax 的「马嘉祺现象」以及 Qwen2.5-7B 的「迷失传奇」退化问题。

---

## 第一步：环境准备

### 创建虚拟环境

使用 conda 创建 Python 3.10 虚拟环境，通过清华源安装 Python：

```bash
conda create -n minimax python=3.10 -y \
  --channel https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
conda activate minimax
```

### 安装依赖

```bash
pip install huggingface_hub transformers tokenizers httpx safetensors matplotlib seaborn numpy torch -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 实验一：分词器差异与选词逻辑

**实验目标：** 观察不同模型的分词策略差异，以及分词方式如何影响模型输出。

### 1.1 下载分词器

> **重要：** 下载前请先设置国内镜像环境变量，否则可能因网络问题下载失败。

```bash
export HF_ENDPOINT="https://hf-mirror.com"
python download_tokenizers.py
```

Windows PowerShell 用户使用：

```powershell
$env:HF_ENDPOINT = "https://hf-mirror.com"
python download_tokenizers.py
```

脚本会自动下载 9 个业界标杆模型的分词器（仅 tokenizer 文件，不含模型权重），下载到 `./models/tk-*` 目录：

| 模型 | 路径 | 说明 |
|---|---|---|
| GPT-2 | `./models/tk-gpt2` | OpenAI 经典 BPE |
| Llama 3 8B | `./models/tk-llama3-8b` | Meta，128K vocab，社区非 gated 镜像 |
| Llama 3.1 8B | `./models/tk-llama3.1-8b` | Meta，128K 上下文 |
| Qwen2.5-1.5B-Instruct | `./models/tk-qwen2.5-1.5b` | 阿里，tiktoken BPE，152K vocab |
| Qwen2.5-7B-Instruct | `./models/tk-qwen2.5-7b` | 阿里，tiktoken BPE，152K vocab |
| DeepSeek-V3 | `./models/tk-deepseek-v3` | DeepSeek 671B MoE |
| DeepSeek-R1 | `./models/tk-deepseek-r1` | DeepSeek 推理模型 |
| Mistral-7B-v0.3 | `./models/tk-mistral-7b-v0.3` | Mistral，32K vocab |
| MiniMax-M2.5 | `./models/tk-minimax-m2.5` | MiniMax |

### 1.2 分词器对比演示

运行分词器交互式演示，输入任意中文文本，观察 9 个模型的分词差异：

```bash
python tokenizer_demo.py
```

输出示例：

```
gpt2：(4 tokens)
  IDs    : [19526, 254, 25001, 121]
  Tokens : ['ä½', 'ł', 'å¥', '½']
---
minimax-m2.5：(1 tokens)
  IDs    : [56658]
  Tokens : ['你好']
---
```

可以看到不同模型对同一文本的分词粒度差异很大。GPT-2 将「你好」拆成 4 个 byte-level token，而 MiniMax 和 Qwen 可以整词切分。

### 1.3 Tokenizer 选词逻辑演示 —— 「马嘉祺」现象

运行以下脚本，针对 MiniMax 对「马嘉祺」的选词现象进行针对性分析：

```bash
python show_token_selection.py
```

> 本脚本需要 MiniMax API Key，请先在 `.env.local` 中配置 `MINIMAX_API_KEY`。

脚本会对比两种引导方式：

| 引导方式 | Prompt | 结果 |
|---|---|---|
| 引导式 | 请把'马'、'嘉'、'祺'这三个字连起来输出，不要说别的 | 正确输出「马嘉祺」 |
| 直接式 | 重复一下马嘉祺三个字，不要说别的 | 可能丢失「嘉」字，输出「马祺」 |

核心原因：「马嘉祺」在不同上下文中的分词方式不同。逐字引导时，分词器将三个字分别作为独立 token 输入，模型逐个输出；直接输入时，「马嘉祺」可能被切分为 `['马', '嘉祺']` 或 `['马嘉祺']`，导致模型在生成时丢失中间字符。

同时脚本会展示「马嘉祺」在不同上下文中的分词结果，帮助理解分词粒度对模型输出的影响。

**实验结论：** 分词粒度是影响模型输出正确性的关键因素。模型的生成结果不仅取决于参数，还深受分词器编码方式的影响。对于中文名字等稀疏组合，逐字引导可以有效规避分词器的合并风险。

---

## 实验二：Base 模型与 Chat 模型的权重退化分析

**实验目标：** 对比 Qwen2.5-7B Base 模型与 Instruct 模型的 `lm_head` 和 `embed_tokens` 权重，诊断 SFT 导致的稀疏 Token 概率退化。

### 2.1 下载全量模型

```bash
export HF_ENDPOINT="https://hf-mirror.com"
python download_models.py
```

Windows PowerShell 用户使用：

```powershell
$env:HF_ENDPOINT = "https://hf-mirror.com"
python download_models.py
```

下载内容：

| 模型 | 路径 | 说明 |
|---|---|---|
| Qwen2.5-1.5B | `./models/qwen2.5-1.5b` | 全量（约 3GB） |
| Qwen2.5-1.5B-Instruct | `./models/qwen2.5-1.5b-instruct` | 全量（约 3GB） |
| Qwen2.5-7B | `./models/qwen2.5-7b` | 全量 Base 模型 |
| Qwen2.5-7B-Instruct | `./models/qwen2.5-7b-instruct` | 全量 Instruct 模型 |
| Qwen2.5-7B-Instruct-GPTQ-Int4 | `./models/qwen2.5-7b-instruct-gptq-int4` | 4bit 量化版 |
| MiniMax-M2.5 | `./models/minimax-m2.5` | 仅 tokenizer |
| MiniMax-M2.7 | `./models/minimax-m2.7` | 仅 tokenizer |

### 2.2 运行退化扫描

```bash
python scan_degraded_tokens.py --compare instruct --probe '迷失传奇' --out .
```

常用参数：

```bash
# 自定义对比模型路径
python scan_degraded_tokens.py --compare /path/to/model --probe '迷失传奇' '新开传奇' '马嘉祺' --out .

# 调整排行榜条数
python scan_degraded_tokens.py --top 100
```

### 2.2.1 多维过滤版（v2）

原版按 `cosine_similarity` 单指标排序，容易混入预训练阶段就没学好的"僵尸词"。v2 版本采用**先筛素质、再看退化**的两阶段策略：

**第一步：素质筛选** — 过滤 Base 模型中的低质量 token
- `embed_tokens_norm (Base)` > 全词表 P30 分位值
- `lm_head_norm (Base)` > 全词表 P30 分位值

只有两项都达标的"健康词"才进入下一步排名，排除那些预训练时就是随机向量的干扰项。

**第二步：退化评分** — 在健康词中找退化最严重的

```
degradation_score = (1 - cosine_similarity) × l2_diff
```

- `(1 - cosine_sim)`：捕捉方向偏航
- `l2_diff`：捕捉绝对位移
- 两者相乘：既跑得远又跑偏了方向的 token 得分最高

这样筛选出来的才是真正"底子好却被后天教坏"的词，比如「迷失传奇」。

```bash
python scan_degraded_tokens2.py --compare instruct --probe '迷失传奇' --out .

# 调整素质筛选阈值（默认 P30，越大过滤越严）
python scan_degraded_tokens2.py --threshold 40 --out .
```

### 2.3 实验结果 —— Base vs Instruct 四图诊断

运行后会在 `results/` 目录生成 `Base_vs_Qwen2.5-7B-Instruct_degradation_report.png`，包含四张直方图：

**1. embed_tokens Norm (Base)** — 预训练阶段该词是否充分激活

「迷失传奇」的 embed_norm 为 0.0671，远低于绝大多数 token（分布峰值在 0.8-1.0 之间）。说明该词在预训练阶段就未被充分学习，embedding 向量范数极小。

**2. lm_head Norm (Base)** — 初始生成概率是否正常

「迷失传奇」的 lm_norm 为 0.3706，同样处于分布的最左侧。这意味着即使在 Base 模型中，该词的生成概率就已经偏低。

**3. lm_head Cosine Similarity (Base vs Instruct)** — SFT 导致的向量漂移

「迷失传奇」的余弦相似度为 0.9846，虽然看似接近 1.0，但已经处于分布的左尾区域（绝大多数 token > 0.99）。SFT 过程中，该词的 lm_head 向量方向发生了显著偏移。

**4. lm_head L2 Diff (Instruct - Base)** — 权重被改写的物理距离

「迷失传奇」的 L2 差异为 0.0649，远大于大部分 token（分布峰值在 0.02 附近）。说明 SFT 对该词的 lm_head 权重改写幅度异常大。

**综合结论：** 「迷失传奇」在预训练阶段就是低频稀疏词（embed_norm 和 lm_norm 均极低），SFT 过程进一步加剧了其权重退化，导致模型在推理时难以正确生成该词。

### 2.4 运行「迷失传奇」全方位诊断

```bash
python experiment_mishi.py
```

运行后生成 `results/Qwen2.5-7B「迷失传奇」全方位诊断.png`，从四个维度深入分析：

**A. 语义聚类对比** — 对比 Base 与 Instruct 中「迷失传奇」的 embedding 邻居变化。邻居重叠率为 12/20（60%），说明 SFT 后该词的语义位置发生了较大偏移，周围邻居发生了显著变化。

**B. lm_head 余弦相似度分布** — 展示「迷失传奇」的 lm_head 向量在全词表中的偏离程度，z-score 为 -2.22，说明其漂移程度远超平均水平。

**C. 同族词交叉打分** — 将 embedding 和 lm_head 拆开，交叉组合打分。结果显示 lm_head 偏移和 Embedding 偏移均较小，但总 logit 值极低（-0.0003 级别），说明问题根源在于该词在上下文中的整体激活度极低。

**D. 全词表排名变化** — Base 模型中排名第 75,427 位，Instruct 模型中排名第 76,533 位，排名下降 1,106 位。概率从 0.000327% 进一步降低到 0.000303%。

---

## 实验三：LoRA 微调验证

在远程服务器上使用 LLaMA-Factory 进行 LoRA 微调，验证微调对稀疏 Token 的影响。

### 第一次微调

| 参数 | 值 |
|---|---|
| LoRA 作用层 | q_proj, v_proj, lm_head |
| LoRA 秩（rank） | 8 |
| 缩放系数（alpha） | 16 |
| 学习率 | 5e-5 |
| 训练轮数 | 10 epochs |

### 第二次微调（加大力度）

| 参数 | 值 |
|---|---|
| LoRA 作用层 | q_proj, v_proj, lm_head, embedding tokens |
| LoRA 秩（rank） | 16 |
| 缩放系数（alpha） | 32 |
| 学习率 | 1e-4 |
| 训练轮数 | 50 epochs |

第二次微调效果更明显，但出现了一定程度的过拟合现象。对比 `results/` 目录下的诊断图可以看出：

- **mishi 版本**（第二次微调后）：「迷失传奇」的余弦相似度为 0.9852，相比原始 Instruct 的 0.9846 有所回升，说明微调在一定程度上修复了权重偏移。
- **mishi2 版本**：余弦相似度进一步变化为 0.9857，L2 差异也从 0.0649 变化为 0.0634，表明权重在持续调整。
- 但 L2 Diff 分布图显示，微调后大量 token 的权重偏移增大（分布整体右移），说明微调在修复目标词的同时，也对其他 token 造成了不必要的扰动，这是过拟合的典型表现。

---

## 文件说明

| 文件 | 说明 |
|---|---|
| `download_tokenizers.py` | 批量下载 9 个模型的分词器 |
| `download_models.py` | 下载全量模型（含权重） |
| `tokenizer_demo.py` | 交互式分词器对比演示 |
| `show_token_selection.py` | 「马嘉祺」分词选词逻辑分析 |
| `scan_degraded_tokens.py` | 稀疏 Token 遗忘诊断 v1（四图直方图 + cosine_sim 退化排行榜） |
| `scan_degraded_tokens2.py` | 稀疏 Token 遗忘诊断 v2（多维过滤：先筛素质再看退化） |
| `experiment_mishi.py` | 「迷失传奇」全方位诊断（四维度深入分析） |
| `chat_dual.py` | 双模型对话（同时调用 MiniMax API 和 SiliconFlow Qwen2.5-7B） |
| `.env.example` | 环境变量配置示例 |
| `.env.local` | 本地环境变量（API Key，不入库） |

### chat_dual.py 使用说明

该脚本通过 API 同时调用两个模型进行对话：
- **MiniMax-M2.5** — 通过 MiniMax API 连接
- **Qwen2.5-7B-Instruct** — 通过 SiliconFlow API 连接

运行前请在 `.env.local` 中配置：

```
SILICONFLOW_API_KEY=sk-xxx
MINIMAX_API_KEY=sk-xxx
```

```bash
python chat_dual.py
```

命令：
- 输入文本 → 同时发送给两个模型，对比回复
- `/clear` → 清空对话历史
- `/quit` → 退出

---

## 常见问题

### 镜像配置

如 `hf-mirror.com` 失效，可替换为其他镜像：

```bash
# 阿里 ModelScope 镜像
export HF_ENDPOINT="https://huggingface.modelscope.cn"

# GitCode 镜像
export HF_ENDPOINT="https://ai.gitcode.com/models"
```

如需使用代理：

```bash
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
export HF_ENDPOINT="https://hf-mirror.com"
```
