# 使用RagFlow和LM-Stdio搭建本地知识库和智能客服

## 什么是RAG技术

### 架构图

- 分片 -> 索引 -> 召回 -> 重排 -> 生成

![1758632035149](.\resources\images\1758632035149.png)

### 笔记和链接

- 笔记（本地）：.\resources\docs\RAG相关理论部分.md
- 视频链接（九析带你轻松完爆： [九析带你轻松完爆的个人空间-九析带你轻松完爆个人主页-哔哩哔哩视频](https://space.bilibili.com/272758549?spm_id_from=333.788.upinfo.head.click)）：
  - [RAG 五种分块策略 | KAG | Agentic RAG | GraphRAG_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1b5TxzsEgT?spm_id_from=333.788.videopod.sections&vd_source=02e76677f89d3e6e8d65be2da8de423a)
  - [RAG 深入浅出几个小坑 | KAG | Agentic RAG | GraphRAG_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1uCNEzeEJW?spm_id_from=333.788.videopod.sections&vd_source=02e76677f89d3e6e8d65be2da8de423a)
  - [RAG 喜剧之王 | RAG 评估 | KAG | Agentic RAG | GraphRAG | LightRAG_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV17Y3tz9ELM?spm_id_from=333.788.videopod.sections&vd_source=02e76677f89d3e6e8d65be2da8de423a)
  - [RAG 喜剧之王 | RAG 评估 | KAG | Agentic RAG | GraphRAG | LightRAG_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Fh3TzvE9G?spm_id_from=333.788.videopod.sections&vd_source=02e76677f89d3e6e8d65be2da8de423a)

## 为什么要使用RAG技术

在开始今天的主角 RAGFlow 之前，我们必须先回答一个更根本的问题：**在微调、MoE、Agent 等各种技术层出不穷的今天，我们为什么还要谈论 RAG？** 甚至网上还有“RAG已死”的说法。今天这期视频，我们先来看看 RAG 真正的适用场景和优缺点。

首先，我们一句话说清 RAG 是什么。**RAG 的本质，就是给知识有限、还可能胡说八道的大模型，接上一个专属的、海量的、实时更新的外部知识库。**

你可以把它想象成：一个天赋异禀但知识停留在几年前的大学生（大模型），在参加一场开卷考试（RAG系统）。考试时，他可以随时翻阅指定的、最新版的教科书和资料（知识库），从而写出远超他自身记忆的精准答案。

### RAG解决的三大核心痛点

RAG 之所以诞生并火爆，是因为它精准地命中了通用大模型的三个“命门”：

1. **解决“幻觉”问题 —— 让答案更可信** **痛点**：直接问大模型“我们公司今年的年假政策是什么？”，它很可能会编造一个看似合理但完全错误的答案。**RAG的解决之道**：RAG 会先从公司的《员工手册》PDF里找到相关的条款，然后让大模型“基于这段原文”来回答问题。**答案有据可查，甚至能告诉你引自哪一页**，极大降低了幻觉。
2. **解决“知识滞后”问题 —— 让知识更前沿** **痛点**：大模型的训练数据有截止日期，它不知道昨天发布的新闻、公司本周的财报。**RAG的解决之道**：你只需要把最新的文档、网页文章扔进知识库，RAG 系统就立刻拥有了这些新知识。**它实现了大模型知识的“实时更新”，成本极低。**
3. **解决“知识盲区”问题 —— 赋能垂直领域** **痛点**：通用大模型不懂你公司的内部流程、没读过你的专利技术文档、也不了解你的私有代码库。**RAG的解决之道**：无论是法律、医疗、金融还是你的个人笔记，只要能把专业知识数字化，RAG 就能让通用大模型瞬间变身成为该领域的**专属专家**。

### RAG的局限性

讲完了优点，我们必须客观。网上对 RAG 的批评，并非空穴来风。它的挑战主要在于：

1. **系统复杂度高**：它不是装一个插件就完事了，涉及到文档解析、向量化、检索、排序等多个环节，**“组装”难度大**，每个环节都可能出问题。
2. **对检索质量依赖极高**：**“垃圾进，垃圾出”**。如果检索器没找到最相关的资料，再强的大模型也编不出好答案。比如处理复杂表格、流程图，传统检索很吃力。
3. **回答深度有限**：RAG 更擅长基于现有知识的**问答、总结和改写**，但对于需要深度逻辑推理、创造性构思的任务，它相对乏力。

所以，说“RAG已死”的人，其实是在说：**“不要把RAG当成一个简单、万能、一劳永逸的解决方案。”** 它是一项有门槛、需要精心设计和调优的技术。

### 谁真正需要RAG？

看到了优劣势，我们就能清晰地画出RAG的适用边界：

**你应该优先考虑RAG，如果：**

- **场景需求**：你需要一个能查询私有、专业、实时文档知识的“智能问答”系统。
- **数据特征**：你的知识主要以文本、PDF、PPT、表格等形式存在，且需要高准确性。
- **核心诉求**：你把**答案的准确性和可控性**放在第一位，无法接受“幻觉”。

**你可能不需要RAG，如果：**

- 你的任务主要是**开放式对话、创意写作、代码生成**（这些是通用大模型的强项）。
- 你的知识量很小且稳定，直接微调模型更简单。
- 你的技术资源有限，无法承担RAG系统的开发和维护成本。

当我们清晰地认识到 RAG 技术不可替代的价值及其挑战时，一个关键问题就出现了：**有没有一个工具，能最大化 RAG 的优点，同时能简化它的复杂性，让我们能快速搭建一个强大、可靠的私有知识库呢？**

答案是肯定的！这就是我们今天视频的主角——**RAGFlow**。它正是在深刻理解RAG这些痛点的前提下，被设计出来的。在接下来的部分，我们将看到它如何用实力证明，**RAG不仅没死，反而正在进入更加成熟、易用的新阶段！**

## RagFlow适用场景

### 场景一：注重数据安全和隐私

如果你的数据涉及：

- **商业核心机密**：比如源代码、设计图纸、专利文档。
- **用户敏感信息**：比如金融数据、个人健康档案。
- **法规严格监管**：比如法律文件、政府公文、受合规性要求（如等保、HIPAA）的数据。

那么，**RAGFlow 的私有化部署就是你的不二之选**。它可以把整个知识库和 AI 模型都部署在你自己的服务器上，通常是公司内部的机房或私有云。数据从始至终不出你的内网，从根本上杜绝了泄露风险。**隐私保护，是 RAGFlow 的基石。**

### 场景二：需要和现有业务系统结合

第二个场景，是你不仅仅想要一个独立的问答机器人，而是希望 AI 能力能嵌入到你现有的工作流里。比如：

- 在公司的 **OA 系统**里，直接查询规章制度。
- 在 **CRM** 里，自动获取客户历史信息和解决方案。
- 为你的 **内部软件** 提供一个强大的“智能大脑”。

**RAGFlow 作为开源软件，提供了极大的灵活性和丰富的 API**，允许你进行深度二次开发和集成，让它真正成为你业务系统的一部分，而不是一个孤立的“外部工具”

### 场景三：处理复杂、非结构化的海量文档

第三，当你的知识库不是简单的几篇 Word，而是包含了大量 **PDF、PPT、图片、表格**，且文档结构非常复杂时。RAGFlow 有一个巨大优势：它基于 **DeepDoc** 的解析能力极其强大，能很好地处理表格、公式等复杂格式，并且提供“引用溯源”，让你清楚知道答案来自哪份文档的哪一页。这对于专业、严谨的场合至关重要。

### 什么时候可以考虑腾讯云 IMA ？

反过来讲，如果你的需求**不满足**以上三点，那么像腾讯云 IMA 这样的公有云、SaaS 化服务，可能是一个更“省心”的选择。

IMA 的定位更偏向于 **“开箱即用”的 AI 应用生成平台**。它非常适合这些场景：

- **快速验证想法**：你想快速做一个智能客服 Demo 或者一个营销文案生成工具，不需要关心底层技术。
- **数据敏感性不高**：你处理的是公开信息、产品介绍等非核心数据。
- **无定制化集成需求**：你只需要一个独立的 Web 应用或 H5 页面，不需要和内部系统打通。
- **团队技术力量有限**：你希望完全免运维，由云服务商来保证服务的稳定和扩容。

简单来说，**IMA 降低了 AI 应用的门槛，用牺牲“控制权”换来了“便捷性”**。它帮你搞定了一切，你只需关注使用本身。

## 环境准备

### LM-Stdio

#### 下载 LM-Stdio

- 官网链接：[LM Studio - 在您的电脑上下载并运行大语言模型 - LM Studio 应用程序](https://lm-studio.cn/)

#### 从镜像站下载模型并导入LM-Stdio

-  镜像站：[hf-mirror.com](https://hf-mirror.com)

  - lmstudio-community/DeepSeek-R1-Distill-Qwen-1.5B-GGUF

  - mradermacher/bge-large-zh-v1.5-GGUF

- 导入规则

  - 文件夹名称：模型名称-GGUF

  - 文件夹下放gguf文件lm-stdio可自动识别

#### 暴露服务（chat、embedding模型）

- Status:Running；Serve on Local Network
- Reachable at: http://192.168.5.195:1234
- chat模型：DeepSeek-R1-Distill-Qwen-1.5B
- embedding模型：bge-large-zh-v1.5
- 注意调整Load里面的Context Length参数，默认是4096，明显是不够用的

### Docker

#### 下载 Docker Desktop

- 官网链接：[Get Started | Docker](https://www.docker.com/get-started/)
- 第一次安装好后需要安装WSL

![微信图片_20260106234709_3547_15](.\resources\images\微信图片_20260106234709_3547_15.png)

#### 配置镜像

- Docker Engine的配置（配置镜像）：

```shell
{
  "debug": true,
  "experimental": false,
  "insecure-registries": [
    "registry.docker-cn.com",
    "docker.mirrors.ustc.edu.cn"
  ],
  "registry-mirrors": [
    "https://docker.registry.cyou",
    "https://docker-cf.registry.cyou",
    "https://dockercf.jsdelivr.fyi",
    "https://docker.jsdelivr.fyi",
    "https://dockertest.jsdelivr.fyi",
    "https://mirror.aliyuncs.com",
    "https://dockerproxy.com",
    "https://mirror.baidubce.com",
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn",
    "https://docker.mirrors.ustc.edu.cn",
    "https://mirror.iscas.ac.cn",
    "https://docker.rainbond.cc",
    "https://do.nark.eu.org",
    "https://dc.j8.work",
    "https://dockerproxy.com",
    "https://gst6rzl9.mirror.aliyuncs.com",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "http://mirrors.ustc.edu.cn/",
    "https://mirrors.tuna.tsinghua.edu.cn/",
    "http://mirrors.sohu.com/"
  ]
}
```

- 配置完毕之后重启Docker Desktop

#### 可能出现的问题

- 如果Docker安装完WSL后崩溃，就把魔法关了

![87beee1a86b25c9e2e1377dc9daf17e1](.\resources\images\87beee1a86b25c9e2e1377dc9daf17e1.png)

### RagFlow

#### 安装Git

- Git：[Git](https://git-scm.com/)

#### 克隆仓库

- 仓库链接：[GitHub - infiniflow/ragflow: RAGFlow is a leading open-source Retrieval-Augmented Generation (RAG) engine that fuses cutting-edge RAG with Agent capabilities to create a superior context layer for LLMs](https://github.com/infiniflow/ragflow)

- 选择合适的目录克隆仓库：


```shell
git clone https://github.com/infiniflow/ragflow.git
```

- 然后进入文件夹ragflow/docker中

#### 选择完整版本

![1764578502516](.\resources\images\1764578502516.png)

- 检查.env文件（130行）：


```shell
# The RAGFlow Docker image to download. v0.22+ doesn't include embedding models.
RAGFLOW_IMAGE=infiniflow/ragflow:v0.22.1
```

#### 修改ragflow的端口配置

- 在.env文件中添加端口配置

```
# ===== 添加缺失的端口变量 =====
# Web 服务 HTTP 端口
SVR_WEB_HTTP_PORT=9383

# Web 服务 HTTPS 端口
SVR_WEB_HTTPS_PORT=9443

# MCP 服务端口
SVR_MCP_PORT=8000
```

#### 下载ragflow需要的image / 启动ragflow

- 在docker文件夹下右键打开powershell（重要）
- 输入命令（然后就开始下载docker镜像了，耐心等待）：

```shell
docker compose -f docker-compose.yml up -d
```

- 下载完之后，镜像会自动创建实例并运行；下一次要启动的时候使用相同的命令即可

#### 在ragflow中配置并选择模型

- 在浏览器中输入:localhost:9383，进入系统
- 配置如下

```
模型类型：embedding
模型名称：bge-large-zh-v1.5
基础Url：http://192.168.5.172:1234
最大令牌数：40960
```

```
模型类型：chat
模型名称：deepseek-r1-distill-qwen-7b
基础Url：http://192.168.5.172:1234
最大令牌数：40960
```

- 最后选择默认模型

### Xinference（可选：用于配置reranker）

#### 安装reranker

- 用镜像下载reranker

```shell
$env:HF_ENDPOINT="https://hf-mirror.com"; hf download BAAI/bge-reranker-large --repo-type model --revision main --cache-dir E:\XinferenceModels\bge-reranker-large
```

- 检查哈希快照

```shell
# 查看快照目录中的内容
ls E:\XinferenceModels\bge-reranker-large\models--BAAI--bge-reranker-large\snapshots
```

- 设置临时环境变量，记录哈希快照

```shell
# 进入哈希目录（请替换为实际的哈希值）
$hashDir = (Get-ChildItem "E:\XinferenceModels\bge-reranker-large\models--BAAI--bge-reranker-large\snapshots")[0].Name
ls "E:\XinferenceModels\bge-reranker-large\models--BAAI--bge-reranker-large\snapshots\$hashDir"
```

- 创建更符合xinference规范的文件夹（这个是为了下次更稳定）

```shell
# 1. 创建目标目录
mkdir E:\XinferenceModels\bge-reranker-large-direct

# 2. 复制模型文件到目标目录（hashDir会记录哈希值）
$hashDir = (Get-ChildItem "E:\XinferenceModels\bge-reranker-large\models--BAAI--bge-reranker-large\snapshots")[0].Name
Copy-Item "E:\XinferenceModels\bge-reranker-large\models--BAAI--bge-reranker-large\snapshots\$hashDir\*" "E:\XinferenceModels\bge-reranker-large-direct\" -Recurse

# 3. 验证目标目录内容
ls E:\XinferenceModels\bge-reranker-large-direct
```

- 安装Xinference

```shell
docker pull xprobe/xinference:latest
```

- 用run创建并启动实例

```shell
docker run -d `
  -p 9997:9997 `
  --gpus all `
  --name xinference `
  -v E:\XinferenceModels\bge-reranker-large-direct:/root/.xinference/models/bge-reranker-large `
  xprobe/xinference:latest `
  xinference-local -H 0.0.0.0
```

- 第二次启动的话，就不用创建（run）了，用start直接启动就行

```shell
docker start xinference
```

- 访问UI界面

```shell
localhost:9997
```

- 最后在**register model界面**进行注册

  **Model Path**: `/root/.xinference/models/bge-reranker-large`（这是容器内的路径）

#### 在ragflow配置reranker

- 添加模型

```shell
模型类型：Xinference
API 地址：http://host.docker.internal:9997
模型 UID：bge-reranker-large（在 Xinference 中设置的 UID）
最大令牌数：5120
```

- `http://host.docker.internal`是一个 **由 Docker 在容器内部提供的特殊 DNS 名称**，它的作用是 **让运行在 Docker 容器内部的应用程序能够访问宿主机的网络服务**。
- `host.docker.internal`解析到的 IP 地址指向的是运行 Docker 引擎的那台物理机或虚拟机，也就是 **宿主机**。
- **仅用于开发/测试：** `host.docker.internal`主要是为了方便本地开发和测试。**绝对不应该在生产环境配置中使用它**，因为生产环境中容器和宿主机的关系以及网络拓扑完全不同。

#### reranker的powershell启动方式

- 之后就不用启动UI了，启动xinference的docker后，直接再powershell中用命令run模型就行

```shell
docker start xinference
```

```shell
# 使用 PowerShell 的 Invoke-RestMethod
$body = @{
    model_uid = "bge-reranker-large"
    model_name = "bge-reranker-large"
    model_type = "rerank"
    model_format = "pytorch"
    model_path = "/root/.xinference/models/bge-reranker-large"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9997/v1/models" -Method Post -Body $body -ContentType "application/json"
```

- 执行后，检查模型状态：

```shell
# 检查运行中的模型
Invoke-RestMethod -Uri "http://localhost:9997/v1/models" | ConvertTo-Json -Depth 5
```

## 知识库场景使用

### 知识库参数

#### 混合相似度、关键词相似度、向量相似度

##### 向量相似度

这是基于深度学习（Embedding 模型）的检索方式。系统会将文字转化为一串数字向量（Vector），计算向量之间的距离。

- **原理**：它通过语义（Semantics）来匹配。
- **特点**：即使字面上没有重合，只要**意思相近**就能搜到。
- **举例**：
  - 用户搜：“这机器怎么动不了了？”
  - 文档内容：“设备无法启动的解决方案...”
  - **结果**：虽然没有“动不了”这三个字，但向量模型知道“动不了”和“无法启动”是一个意思，所以能匹配上。
- **适用场景**：用户提问比较口语化、模糊，或者你需要跨语言检索时。

##### 关键词相似度

这是传统的搜索引擎技术（通常基于 BM25 算法）。它将文本切分成词，看用户的问题里有多少词在文档里出现过。

- **原理**：基于字面（Literal）的精确匹配。
- **特点**：必须有**相同的词**或**词根**才能搜到，对专有名词非常敏感。
- **举例**：
  - 用户搜：“Error 312”
  - 文档内容：“Error 312：基站水泵气锁故障...”
  - **结果**：因为它精确命中了 "Error" 和 "312"，所以排名极高。如果是向量搜索，可能会被其他含有“错误”、“故障”等语义的文档干扰，反而不如关键词搜索精准。
- **适用场景**：查询型号（FT-X1）、错误代码（Error 101）、人名、地名等**专有名词**时。

##### 混合相似度

同时进行“向量检索”和“关键词检索”，然后通过算法（如 RRF - 倒格融合算法）将两者的结果合并重排序。

- **原理**：语义 + 字面。
- **特点**：互补短板。既能理解口语化的意图，又能抓住关键的专有名词。
- **工作流程**：
  1. 向量模型先找出一批意思相近的文档。
  2. BM25 算法找出一批字面匹配的文档。
  3. 系统给两边打分，加权合并，给出最终排名。
- **举例**：
  - 用户搜：“灵动 X1 为什么亮红灯？”
  - **分析**：“灵动 X1”需要关键词匹配（精准型号），“亮红灯”需要向量匹配（语义对应故障）。混合模式能同时抓住这两个特征。
- **适用场景**：绝大多数通用场景，尤其是像你的智能客服场景（既有“怎么退货”这种语义问题，又有“Error 101”这种精准代码问题）。

#### 相似度阈值、向量相似度权重

##### 相似度阈值

**一句话解释**：**“只有得分超过这个分数的文档片段，才能被看到。”**

它决定了检索结果的**质量下限**。

- **如果阈值设得很高 (比如 0.8)**：
  - **含义**：系统非常挑剔。只有跟用户问题**高度相关**的内容才会被召回。
  - **现象**：**优点**：大模型回答会非常精准，因为喂给它的素材都是对的。**缺点**：容易回答“知识库中未找到答案”。比如用户问“红灯亮了”，文档里写的是“指示灯呈红色闪烁”，如果阈值太高，系统可能觉得匹配度不够，直接把这条正确答案过滤掉了。
- **如果阈值设得很低 (比如 0.2)**：
  - **含义**：系统非常宽容。只要沾点边的内容都会被捞出来。
  - **现象**：**优点**：不容易漏掉信息，召回率高。**缺点**：容易产生“幻觉”或废话。比如用户问“红灯”，系统可能把“绿灯常亮”、“蓝灯旋转”的片段都捞出来发给大模型，导致大模型看花了眼，回答混乱。

##### 向量相似度权重

**一句话解释**：**“在混合检索时，你是更看重‘意思相近’（向量），还是更看重‘字面一样’（关键词）？”**

这个参数通常是一个 0 到 1 之间的数值（或者百分比），用来调节 **向量检索** 在最终评分中的占比。

- **权重偏向 1.0 (比如 0.8) —— 重“神似” (Semantics)**：
  - **含义**：系统更相信向量模型。
  - **场景**：用户问 **“机器不动了”**，文档里写的是 **“设备无法运行”**。虽然字面上没有一个字重合，但向量认为它们意思一样，所以能搜出来。
  - **适合**：`High_Freq_QA.csv`（口语化问答）和通用咨询。
- **权重偏向 0 (比如 0.3) —— 重“形似” (Keywords)**：
  - **含义**：系统更相信关键词匹配（BM25）。
  - **场景**：用户问 **“FT-X1-Pro”** 或 **“Error 404”**。这需要精准命中这些字符。如果权重太偏向向量，系统可能会把“FT-X2”或者“Error 403”这些意思相近但实际上错误的答案排在前面。
  - **适合**：`Service_Policy.md`（查具体参数、型号、价格）和故障码查询。

#### 页面排名

**通俗解释**： 这个概念源自 Google 搜索。在 RAGFlow 中，它用于评估一个分块（Chunk）在整个文档集合中的“重要性”或“权威性”。开启后，系统会计算分块之间的关联度，被引用或关联次数多的分块，排名得分会更高。

- **场景演示**：
  - 你的《使用手册》中，“维护”这一章可能多次提到了“清洁主刷”。
  - 开启 Page Rank 后，当用户问“怎么清理”时，系统会优先推荐那个**最核心、被提及最多**的“主刷清理流程”分块，而不是某个角落里偶尔提了一句“请保持清洁”的无关分块。
- **一句话总结**：**让系统优先展示“核心内容”，而不是“边缘信息”。**

#### 知识图谱

**通俗解释**： 传统的检索是把文字切碎了找。知识图谱则是把文档里的**实体（Entity）**（如产品名、部件、故障）提取出来，并建立**关系（Relationship）**。它让 AI 拥有了“逻辑关联”的能力。

- **场景演示**：
  - **文档原文**：“Error 101 是激光雷达故障。” 和 “激光雷达位于机身顶部。”
  - **传统检索**：搜“Error 101”只能找到第一句。
  - **知识图谱**：系统提取了实体 `Error 101`、`激光雷达`、`机身顶部`，并建立了连接：`Error 101` --(关联)--> `激光雷达` --(位于)--> `机身顶部`。
  - **高光时刻**：用户问：“头顶那个凸起坏了显示什么错误？”（用户不知道那叫激光雷达）。因为有了图谱，AI 能顺藤摸瓜找到 `Error 101`。
- **一句话总结**：**让 AI 理解“A 属于 B，B 导致 C”的复杂关系，实现跨段落推理。**

#### 使用召回增强 RAPTOR 策略

**通俗解释**： RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) 是一种高级策略。它不仅切分文档，还会递归地生成**摘要的摘要**，构建一棵“树”。检索时，先匹配高层摘要（大意），再定位到底层细节。

- **场景演示**：
  - **用户问**：“这台机器怎么保养？”（问题很宽泛）。
  - **普通检索**：可能只捞出“洗拖布”这一个碎片，回答不全。
  - **RAPTOR**：系统先匹配到了“第四章 维护与保养”生成的**高层摘要**（包含主刷、边刷、基站等所有内容的概括），然后基于这个摘要去把下面所有的细节都捞出来。
  - **效果**：AI 能回答出一个非常全面、结构化的保养指南，而不是盲人摸象。
- **一句话总结**：**专治“宽泛型提问”，让 AI 既能见树木，又能见森林。**

#### 分块方式

**通俗解释**： 决定了系统怎么把长文档切成小片。

![1767802925832](.\resources\images\1767802925832.png)

- **General（通用）**：最常用的默认分块方式。它通常根据段落、标点或固定字数（如512个tokens）进行分割，适用于没有特定格式的普通文本文档。
- **Q&A（问答对）**：专门用于处理问答形式的内容。它会识别“问题”和“答案”的组合，并将每一对Q&A作为一个独立的知识单元，非常适合用于构建客服知识库或FAQ文档。
- **Resume（简历）**：针对简历/CV文档的优化分块。它能识别简历中的不同模块，如“个人信息”、“工作经历”、“教育背景”、“技能”等，并按照这些语义模块进行分割，便于精准检索候选人的特定信息。
- **Manual（手册/说明书）**：适用于结构清晰的说明书、操作手册或带有多级标题的文档。它会根据章节标题（如H1, H2, H3）进行层级化分块，保持上下文的连贯性和独立性。
- **Table（表格）**：专门处理文档中的表格。它将整个表格或按行分割表格，确保表格数据的结构性在切割后不被破坏，便于检索表格内的具体信息。
- **Paper（学术论文）**：针对学术论文的结构进行优化。能够识别“摘要”、“引言”、“方法”、“实验”、“结论”、“参考文献”等部分，并按这些章节进行智能分块，便于查找论文中的特定论据或研究成果。
- **Book（书籍）**：适用于长篇书籍。分块策略可能会考虑章节、子章节的自然划分，在保持单个章节内容完整性的同时，避免块过长，兼顾检索效率和上下文完整性。
- **Laws（法律条文）**：为法律文档、合同、法规设计。通常会按照“编”、“章”、“节”、“条”、“款”、“项”等严密的法律条文结构进行分割，确保法律条款的独立性和准确性。
- **Presentation（演示文稿）**：针对PPT或幻灯片文档。它会将每一页幻灯片或每个要点作为一个分块，通常还会提取幻灯片中的标题和要点文字，便于按幻灯片主题检索。
- **One（整体）**：一种特殊的分块方式，即不进行分割，将整个文档作为一大块进行处理。适用于非常短小、内容高度相关且不宜分割的文档。
- **Tag（标签）**：这是一种更灵活或自定义的方式。允许用户根据文档中特定的标签、标记或元数据来定义分块规则，实现高度定制化的分割逻辑。

#### 自动关键词提取、自动问题提取

这两个功能是在数据入库（Parsing）阶段，让大模型充当“预处理员”，为每个分块增加元数据（Metadata）。

##### 自动关键词提取

- **原理**：系统在切片后，会自动分析这段话，提炼出几个核心词，存在后台（用户看不见，但检索引擎看得见）。
- **场景**：
  - 分块内容：“...本产品配备了 LDS 测距模组...”
  - 提取关键词：`LDS`, `激光雷达`, `导航`。
  - **效果**：即使用户搜“导航仪坏了”，也能通过关键词匹配命中这个分块。

##### 自动问题提取

- **原理**：系统读完这个分块后，会自问自答：“这段话能回答什么问题？”，然后把生成的“问题”也存进去。
- **场景**：
  - 分块内容：“长按电源键 3 秒开机。”
  - **系统自动生成问题**：“怎么开机？”、“灵动 X1 如何启动？”
  - **效果**：当用户真的问“怎么开机”时，直接命中这个“预设问题”，匹配度直接拉满（100%）。
- **一句话总结**：**这是 RAG 的“作弊模式”，让 AI 预判用户的预判，极大提高召回率。**

### 聊天参数

#### 检索与上下文设置

*决定了 AI 能看到什么资料，以及看到多少资料。*

##### 相似度阈值

- **含义**：**质量门槛**。只有匹配分数超过这个值的文档片段，才会被丢给 AI。
- **场景**：
  - 设为 0.2：用户问“不吸尘”，系统可能会把“吸尘器外观介绍”这种无关内容也塞给 AI，导致 AI 废话连篇。
  - 设为 0.7：系统只找那些明确提到“吸力故障”、“风机堵塞”的硬核片段。
- **推荐值**：客服场景建议 **0.6** 以上，宁缺毋滥。

##### 向量相似度权重

- **含义**：**混合检索的天平**。调节是更看重“意思相近（向量）”还是“字面一样（关键词）”。
- **场景**：
  - 用户问 **Error 312**（气锁故障）。
  - 调高权重（重语义）：可能会搜出“水箱不出水”的通用描述。
  - 调低权重（重关键词）：死死咬住“312”这个数字，精准命中故障代码表。
- **推荐值**：含代码/型号的场景建议 **0.3**（重关键词）；纯闲聊建议 **0.7**。

##### Top N

- **含义**：**阅读量**。最终选出前 N 个最相关的片段喂给 AI。
- **场景**：
  - **N=3**：AI 只看最重要的 3 条。回答简洁，但如果问题复杂（如“列出所有不保修的情况”），可能会漏掉信息。
  - **N=10**：AI 一口气读 10 条。回答全面，但如果这 10 条里混入了矛盾信息（如不同型号的说明书），AI 可能会晕。
- **推荐值**：一般设为 **5-8**。

##### 多轮对话优化

- **含义**：**记忆力补全**。将用户的简短追问改写成完整问题。
- **场景**：
  - 用户第一句：“换个主板多少钱？”
  - 用户第二句：“那电池呢？”
  - **不开优化**：系统去知识库搜“那电池呢？”，搜不到结果。
  - **开启优化**：系统在后台将其改写为“**换个**电池**多少钱**？”，然后去搜价格表 。

##### 关键词分析

- **含义**：**划重点**。在检索前，先分析用户问题里的核心词，只用这些核心词去匹配，过滤掉“请问一下”、“那个”等干扰词。
- **场景**：用户问“请问一下那个灵动 X1 的激光雷达坏了显示什么代码？” -> 系统提取核心词 `灵动X1` `激光雷达` `代码` 去检索。

##### 目录增强

- **含义**：**上下文感知**。让 AI 知道这个切片属于哪个章节。
- **场景**：
  - 切片内容：“建议每周清理一次。”
  - **不开增强**：AI 不知道这是在清理主刷还是清理水箱。
  - **开启增强**：系统会告诉 AI：“这是出自《维护与保养》章节下《主刷维护》小节的内容。” 

##### 使用知识图谱

- **含义**：**逻辑关联**。利用提取出的实体关系链进行检索。
- **场景**：用户问“头顶那个转的东西坏了怎么办？” -> 知识图谱路径：`头顶转的东西` -> `激光雷达` -> `Error 101` -> `检查皮带`。 

#### 第二类：大模型推理参数

*决定了 AI 的性格：是严谨的理科生，还是发散的文科生。*

##### 温度 & Top P

###### 温度 -- 随机性

**核心定义**：控制模型在选词时的**随机性**（或称“熵”）。

- **低温度 (e.g., 0.1) —— “精准模式”**
  - **原理**：模型变得**极度保守**。在预测下一个字时，它几乎只选概率最大的那个字（The Most Likely Token）。
  - **效果**：
    - 每次回答几乎一模一样（确定性高）。
    - 回答非常稳健、合乎逻辑， factual（基于事实）。
    - **缺点**：显得死板，缺乏文采。
  - **RAG 场景**：适合客服查故障码。故障是 101 就是 101，不能因为有“胆量”就瞎猜是 102。
- **高温度 (e.g., 0.8) —— “即兴模式”**
  - **原理**：模型变得**大胆**。它不再只盯着概率第一名的词，而是会给第 2、3、4 名的词更多机会。它会人为地“拉平”概率分布，让那些本来不太可能出现的词也有机会被选中。
  - **效果**：
    - 用词丰富，句式多变，充满惊喜。
    - **缺点**：容易一本正经地胡说八道（幻觉）。
  - **RAG 场景**：适合写营销文案、闲聊。

###### Top P -- 范围

**核心定义**：控制模型选词的**视野范围**。它告诉模型：“只在概率加起来达到 P% 的前几个词里选”。

- **低 Top P (e.g., 0.1) —— “精准模式”**
  - **原理**：只看头部。模型只考虑那些概率极高的一两个词作为候选，剩下的几万个词直接被切掉（Truncated），看都不看。
  - **效果**：回答非常聚焦，绝对不会跑题或用生僻词。
- **高 Top P (e.g., 0.9) —— “即兴模式”**
  - **原理**：放宽视野。只要是有点可能性的词，都纳入候选池，然后再从中随机选。
  - **效果**：允许更多样的表达方式进入候选。

在实际的预设中，这两个参数通常是**联动**的：

| **模式**            | **温度 (Temperature)** | **Top P**     | **操控逻辑 (AI 的内心戏)**                                   |
| ------------------- | ---------------------- | ------------- | ------------------------------------------------------------ |
| **精准 (Precise)**  | **低 (0.2)**           | **低 (0.75)** | “我只选概率最高的那个字，绝对不冒险。只要最稳妥的答案。”     |
| **平衡 (Balanced)** | **中 (0.5)**           | **中 (0.85)** | “我会选比较稳妥的词，但偶尔也换个常用的同义词，别太死板。”   |
| **即兴 (Creative)** | **高 (0.8)**           | **高 (0.9)**  | “我要从一大堆词里挑个有意思的，哪怕它不是概率最高的，我也要试试，这样说话才风趣。” |

##### 最大 token 数

- **含义**：**话痨程度限制**。限制 AI 回答的最大长度。
- **场景**：
  - 设为 512：回答言简意赅。
  - 设为 4096：适合写长篇报告，但客服场景下可能会让用户读得太累。

##### 存在处罚 & 频率惩罚

**核心原理：大模型是如何“说话”的？**

在理解这两个参数之前，我们都明白 LLM 的基本工作方式：

LLM 本质上是一个概率预测机。当它生成下一个字（Token）时，它会计算所有可能的字出现的概率（Logits）。

- **不加惩罚时**：模型完全按照训练数据的习惯，哪个词概率高就选哪个（容易出现车轱辘话）。
- **加上惩罚时**：我们在模型做选择之前，人为地给那些**“已经说过的词”**扣分，降低它们被选中的概率。

###### 频率惩罚 -- 字数

底层逻辑：针对词汇出现的次数进行惩罚。

一句话定义：“这个词你用得越多，我罚得越重，逼你去换个词用。”

在 RAGFlow 中的应用策略：

- **精准模式 (预设 0.5 - 较高)**
  - **设计意图**：追求**高信息密度**和**干练**。
  - **原理**：如果不加惩罚，模型在复述说明书步骤时，容易陷入机械的句式重复（如“请检查A，请检查B，请检查C”）。设置 0.5 的惩罚，迫使模型寻找更高效的表达方式（如“请依次检查A、B及C”），从而让回答更像一个专业的客服，而不是复读机。
- **即兴创作 (预设 0.1 - 较低)**
  - **设计意图**：追求**自然流畅的语感**。
  - **原理**：人类正常的交流中，助词（“的”、“了”）和代词（“它”、“这个”）的使用频率非常高。如果惩罚太高，模型为了避嫌，会造出“此设备”、“该机器”等生硬的词汇，破坏叙事节奏。低惩罚保证了聊天的顺滑。

###### 存在处罚 -- 话题

底层逻辑：针对词汇是否出现过进行惩罚。

一句话定义：“这个概念你只要提过了，就别再啰嗦了，赶紧讲下一个重点。”

在 RAGFlow 中的应用策略：

- **精准模式 (预设 0.5 - 较高)**
  - **设计意图**：追求**逻辑闭环**和**防幻觉**。
  - **原理**：
    1. **防啰嗦**：客服回答问题需要点到为止。比如解释完“Error 101”是啥，就该停了。如果惩罚低，模型可能会换个花样把刚才的意思再车轱辘说一遍。
    2. **强制截断**：当模型不知道该说什么时，往往会重复上一句。较高的存在处罚能让模型在试图重复时，发现概率太低，从而选择输出“结束符（EOS）”，让回答戛然而止，显得非常果断。
- **即兴创作 (预设 0.1 - 较低)**
  - **设计意图**：追求**主题连贯性**。
  - **原理**：写文章或讲故事需要“扣题”。如果因为提过一次“灵动X1”就被罚分，模型可能后面就不敢再提这个产品名了，导致文章跑题。低惩罚允许模型在一个主题上通过反复强调来渲染氛围。

| **特性**                | **频率惩罚**                 | **存在处罚**                     |
| ----------------------- | ---------------------------- | -------------------------------- |
| **惩罚依据**            | **次数**                     | **有无**                         |
| **惩罚力度**            | 随重复次数**线性增加**       | **固定**（只要出现过就罚）       |
| **控制层级**            | 微观：控制**遣词造句**       | 宏观：控制**话题走向**           |
| **解决的问题**          | 解决“复读机”问题（字眼重复） | 解决“车轱辘话”问题（观点重复）   |
| **典型表现 (高惩罚时)** | 句式多变，很少用常用词       | 话题跳跃快，绝不回头补充         |
| **RAGFlow 客服建议**    | **0.2 ~ 0.5** (保持专业干练) | **0.4 ~ 0.6** (防止死循环和废话) |

#### reranker的作用

在 RAGFlow（以及所有 RAG 系统）中，**Rerank（重排序）模型**是决定回答“凑合能用”还是“精准命中”的关键组件。

简单来说，没有 Rerank 就像是**海选**，有了 Rerank 就像是**专家复试**。

以下是加与不加 Rerank 模型的详细区别，以及如何在视频中演示这种差异：

##### 核心区别：速度 vs. 精度

- **不加 Rerank（仅检索）**：
  - **机制**：系统完全依赖向量距离（Embeddings）或关键词匹配度（BM25）来打分。
  - **问题**：向量模型（Embedding Model）为了追求速度，通常会对语义进行压缩，容易出现“粗糙”的匹配。它可能觉得两句话长得像、或者关键词重合多，就认为它们相关，但实际上逻辑可能完全相反。
  - **比喻**：就像在图书馆找书，只看书名里有没有关键词。
  - **结果**：召回了 50 条内容，可能排在第 1 名的是一条相关性只有 60% 的内容，而真正的标准答案因为用词不同，被挤到了第 15 名。大模型因为输入窗口有限（Top K），可能根本看不到第 15 名的内容，导致回答错误。
- **加了 Rerank（重排序）**：
  - **机制**：在初次检索出的（比如 50 条）候选片段中，用一个**更慢、更精准**的模型（Cross-Encoder）把“用户问题”和“每一个片段”进行一对一的深度语义比对。
    - [CLS]查询[SEP]候选文本[SEP]
  - **优势**：Rerank 模型能读懂复杂的逻辑、因果关系和微小的语义差别。它会把那个原本排在第 15 名的正确答案，硬生生“提拔”到第 1 名。
  - **比喻**：把找出来的书每一本都翻开目录和摘要仔细读一遍，确认是不是真的有用。
  - **结果**：Top K 喂给大模型的内容质量极高，几乎全是干货。

##### 场景化演示

###### Case A：语义微差

- **问题**：“灵动 X1 **不可以**连接什么网络？”
- **文档原文**：“灵动 X1 可以 2.4GHz Wi-Fi；灵动 X1**不支持** 5GHz Wi-Fi。”
- **演示不加 Rerank**：
  - 向量检索可能会抓取含有“可以”、“Wi-Fi”、“连接”关键词的片段，甚至把“支持 2.4GHz”排在最前面。
  - **AI 结果**：可能会答非所问，或者强调支持什么，忽略了“不可以”。
- **演示加 Rerank**：
  - Rerank 模型能精准识别用户问的是**“不可以”**（否定语义）。它会把文档中包含“不支持”字眼的那个分块评分拉高。
  - **AI 结果**：“灵动 X1 **不支持**连接 5GHz Wi-Fi。”（精准命中）

###### Case B：多文档冲突

- **问题**：“我要退货，但我用过清洁液了，扣多少钱？”
- **文档原文 1（使用手册）**：“清洁液建议按比例稀释...” （相关性低，但关键词匹配）
- **文档原文 2（服务政策）**：“若清洁液已开封：扣除 59 元/瓶。” （相关性高，但可能因为没有“退货”二字被向量模型排后面）
- **演示（不加 Rerank）**：
  - 系统可能捞了一堆关于清洁液怎么用的说明，大模型看完说：“文档没提扣钱的事。”
- **演示（加 Rerank）**：
  - Rerank 能够理解“扣多少钱”和“扣除 59 元”的强关联，哪怕初筛排名靠后，Rerank 也会把它捞回来放在第一位。
  - **AI 结果**：“需要扣除 59 元。”

##### 参数调节带来的直观变化

在 RAGFlow 中开启 Rerank 后，你会看到一个明显的参数变化：

- **Top K (检索数)**：通常设得比较大（例如 50 或 100）。
  - *含义*：先海选捞出 100 个可能相关的。
- **Rerank Score Threshold (重排序阈值)**：
  - *含义*：Rerank 打分比向量打分严格得多。取决于具体模型（如 BGE-Reranker）。
  - *作用*：Rerank 会把这 100 个里真正有用的 3-5 个挑出来给大模型。

### 4. 总结：什么时候必须加？

1. **专业客服场景（你的场景）**：用户问得很具体（价格、参数、报错），容错率低，**必须加**。
2. **文档库很大**：当你有成百上千份文档时，单纯靠向量检索很容易“迷路”，Rerank 是导航仪，**建议加**。
3. **多语言/混合语种**：Rerank 在处理跨语言匹配时通常表现更好。

> “不加 Rerank，AI 是在‘猜’你想要什么；加了 Rerank，AI 是在‘仔细确认’你想要什么。虽然多花了几百毫秒，但准确率是质的飞跃。”

## Agent 场景使用

### 沙盒（代码块）的使用

#### 问题背景

在 Windows (Docker Desktop/WSL2) 环境下部署 RAGFlow 时，`sandbox-executor-manager` 容器启动失败或无法初始化工作容器池。

##### 错误现象

- **日志报错**：`unknown or invalid runtime name: runsc`
- **容器池状态**：`Container pool initialization complete: 0/20 available`
- **后期报错**：即使修复了运行时问题，可能出现 `Command timed out` 错误。

##### 根本原因

1. **运行时不兼容**：沙箱镜像内的 Python 代码硬编码了 `--runtime=runsc` (gVisor 安全运行时)，而 Windows Docker 默认环境通常不支持 gVisor。
2. **启动超时**：Windows Docker I/O 性能较 Linux 弱，且首次启动需要拉取子镜像，导致默认的 30 秒超时时间不足。

#### 解决方案概览

不修改原始镜像，而是采用 **“文件挂载覆盖 (Mount Patch)”** 的方式：

1. 提取容器内的核心代码文件。
2. 修改代码去除 `runsc` 参数并增加超时时间。
3. 通过 `docker-compose` 将修改后的文件挂载回容器。
4. 预拉取依赖镜像以加速启动。

#### 详细操作步骤

##### 第一步：提取核心代码文件

我们需要从镜像中提取 `/app/core/container.py` 文件。在 PowerShell 中执行（任然在docker文件夹下）：

```powershell
# 1. 启动临时后台容器
docker run -d --name temp-fix infiniflow/sandbox-executor-manager:latest tail -f /dev/null

# 2. 将文件复制到宿主机当前目录
docker cp temp-fix:/app/core/container.py ./container.py

# 3. 删除临时容器
docker rm -f temp-fix
```

##### 第二步：修改代码 (container.py)

使用文本编辑器打开当前目录下的 `container.py`，进行两处修改：

修改点 1：移除 runsc 参数

找到构建 docker run 命令列表的地方，删除 --runtime=runsc 行。

*修改前：*

```python
cmd = [
    "docker", "run",
    "-d",
    "--runtime=runsc",  # <--- 删除这一行
    "--name", self.container_name,
    # ...
]
```

*修改后（注意保持列表格式完整）：*

```python
cmd = [
    "docker", "run",
    "-d",
    "--name", self.container_name,
    # ...
]
```

修改点 2：延长超时时间 (防止 Timeout 错误)

搜索 timeout 关键字，将默认的 30 秒改为 300 秒。

*修改前：*

```python
# 可能的形式，取决于代码版本
timeout = 30 
# 或
kwargs['timeout'] = 30
```

*修改后：*

```python
timeout = 300
# 或
kwargs['timeout'] = 300
```

> **注意**：保存文件。

##### 第三步：预拉取依赖镜像

为了防止沙箱启动时因下载镜像超时而失败，手动预先拉取子容器镜像：

```powershell
docker pull infiniflow/sandbox-base-python:latest
docker pull infiniflow/sandbox-base-nodejs:latest
```

##### 第四步：配置 Docker Compose 挂载

修改 `docker-compose-base.yml` 文件，找到 `sandbox-executor-manager` 服务，添加 `volumes` 映射：

```yaml
services:
  sandbox-executor-manager:
    image: infiniflow/sandbox-executor-manager:latest
    container_name: sandbox-executor-manager
    # ... 其他配置 ...
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./container.py:/app/core/container.py  # <--- 添加这一行
    # ...
```

> **注意**：`./container.py` 是宿主机路径，`/app/core/container.py` 是容器内目标路径。

##### 第五步：清理并重启服务

由于旧容器可能处于冲突状态，建议强制重建。

```powershell
# 1. 删除旧容器 (如果有冲突报错)
docker rm -f docker-sandbox-executor-manager-1

# 2. 启动服务
docker-compose up -d sandbox-executor-manager
```

#### 验证结果

查看容器日志进行验证：

```powershell
docker logs -f docker-sandbox-executor-manager-1
```

**成功标志：**

1. 日志中不再出现 `unknown flag: --runtime` 或 `invalid reference format`。

2. 日志最后显示容器池初始化成功，且可用数量不为 0：

   > `INFO:sandbox: 📊 Container pool initialization complete: 20/20 available`

#### 修改.env文件

在.env文件后追加：

```yaml
# ===== 启用沙箱功能 =====
SANDBOX_ENABLED=1

# ===== 设置文档引擎和设备类型 =====
# 选择文档引擎（推荐使用elasticsearch，这是默认设置）
DOC_ENGINE=elasticsearch

# 选择设备类型（根据您的硬件选择cpu或gpu）
DEVICE=gpu

# ===== 设置COMPOSE_PROFILES =====
# 包含文档引擎、设备类型和沙箱
COMPOSE_PROFILES=${DOC_ENGINE},${DEVICE},sandbox

# ===== 沙箱详细配置 =====
SANDBOX_HOST=sandbox-executor-manager
SANDBOX_EXECUTOR_MANAGER_IMAGE=infiniflow/sandbox-executor-manager:latest
SANDBOX_EXECUTOR_MANAGER_POOL_SIZE=10
SANDBOX_BASE_PYTHON_IMAGE=infiniflow/sandbox-base-python:latest
SANDBOX_BASE_NODEJS_IMAGE=infiniflow/sandbox-base-nodejs:latest
SANDBOX_EXECUTOR_MANAGER_PORT=9385
SANDBOX_ENABLE_SECCOMP=false
SANDBOX_MAX_MEMORY=512m
SANDBOX_TIMEOUT=30s

# 禁用gVisor运行时，使用默认的Docker运行时
SANDBOX_DISABLE_GVISOR=1
SANDBOX_USE_DEFAULT_RUNTIME=1
```

### Agent Workflow 搭建

#### 总览图

![1767532316168](.\resources\images\1767532316168.png)

#### 各部分内容

##### 判断是否是报错码

```python
import re

def main(query: str):
    """
    判断是否包含错误码，并提取具体的数字。
    
    Returns:
        tuple: (是否包含错误码: bool, 错误码数字: str or None)
        例如: (True, "101") 或 (False, None)
    """
    
    # 匹配模式：关键词 + 可选分隔符 + 3位数字
    # match.group(2) 将会是那个数字
    pattern = r"(error|code|报错|代码|错误).*?(\d{3})"
    
    match = re.search(pattern, query, re.IGNORECASE)
    
    if match:
        # 提取出纯数字 (例如 "301")
        error_code = match.group(2)
        
        # 返回两个变量：True 和 错误码
        # 如果你希望返回 "Error 301"，可以改成: return True, f"Error {error_code}"
        return error_code,"True"
    else:
        # 没找到：返回 False 和 空值
        return "","False"
```

##### 错误码检索

```
Error  {CodeExec:FlatClownsSink@errorContent}
```

##### 取出报错码对应的答案

```python
import re

def main(text: str, code: str) -> str:
    """
    从检索回来的长文本中，根据故障码(code)提取出对应的 QA 对。
    
    Args:
        text: 包含很多个故障码的大段文本 (通常是上一个检索节点的输出)
        code: 目标故障码，如 "301" (通常是分类器提取出的变量)
        
    Returns:
        String: 完整的 QA 字符串，例如 "Question: Error 301 Answer: ..."
    """
    
    # 1. 构造正则表达式
    # 解析：
    # Question:\s*Error\s* -> 匹配 "Question: Error " (允许中间有空格)
    # {re.escape(code)}    -> 插入你要找的 code (如 301)
    # \b                   -> 单词边界，防止搜 "10" 匹配到 "101"
    # .*?Answer:           -> 匹配中间可能存在的 Tab 或空格
    # (.*)                 -> 捕获 Answer 之后的所有内容直到行尾
    pattern = fr"(Question:\s*Error\s*{re.escape(code)}\b.*?Answer:.*)"
    
    # 2. 在长文本中搜索
    # re.IGNORECASE: 忽略大小写
    # re.MULTILINE: 确保即使文本有多行也能正确匹配
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    
    if match:
        # 返回匹配到的整句 (group 1) 并去除首尾多余空格
        return match.group(1).strip()
    else:
        # 如果没找到，返回提示信息 (也可以返回空字符串 "")
        return f"未在知识库中找到 Error {code} 的详细方案"
```

##### 判断QA库能否回答

```markdown
# Role
你是一个严格的问答验证助手。你的唯一任务是判断提供的【参考资料】是否足以回答【用户问题】。

# Input Data
## 参考资料 (Context):
 {Retrieval:ClearPetsMarch@formalized_content}

## 用户问题 (Query):
 {sys.query}

# Instructions
1. **严格依赖**：请完全忽略你自己的训练知识，**仅**基于上述提供的【参考资料】进行判断。
2. **判断逻辑**：
   - 仔细阅读【参考资料】中的 Question 和 Answer。
   - 判断资料中的 Answer 是否能直接、明确地解决【用户问题】。
3. **输出规则**：
   - **Case A (能回答)**：如果资料中包含答案，请严格复述或基于资料内容组织语言回答用户。保持语气专业、客观。**严禁添加资料中未提及的信息**。
   - **Case B (不能回答)**：如果资料与问题无关，或者资料中的答案无法解决用户的问题，或者资料为空，请**直接**输出以下固定短语，不要包含任何其他解释或标点符号：
     根据QA信息无法回答

# Attention
- 不要试图去“猜测”或“推断”资料中不存在的信息。
- 如果用户问的是代码（如 "Error 101"），而资料中只有 "Error 102"，这也属于“无法回答”。
```

##### 分类器

```
- 故障排查/症状
  - 机器坏了或有异常，但没有报错码（如“机器有异响”、“充不进电”、“连不上网”、“有霉味”）。
- 产品与售后咨询
  - 关于功能使用、参数查询、保修政策、价格费用的问题（如“吸力多大”、“保修几年”、“怎么建图”）。
- 闲聊与无关
  - 打招呼、夸奖、辱骂、竞争对手对比（如果没有专门库）、政治、天气等与产品无关的问题。
```

##### 智能体_0

```markdown
# Role
你是一个专业、严谨且富有同理心的“未来科技”售后技术支持专家。
# Task
利用【知识库】信息解决用户问题。你需要先进行深度的逻辑推理，然后再给出最终回答。
# Output Format (Strictly Follow)
你的输出**必须**包含两个部分，且严格按照以下结构：
1.  **第一部分（思考过程）**：用 `<think>` 和 `</think>` 标签包裹。在这里分析用户的意图、检索知识库中的关键信息、排除干扰项，并制定回答策略。**必须确保 `</think>` 标签闭合。**
2.  **第二部分（正式回答）**：在思考结束后，直接输出给用户的最终回复。
# Constraints
1.  **精准检索**：在 `<think>` 阶段，明确引用知识库中的章节或Error代码。
2.  **逻辑推理**：
    * 涉及费用/参数/排查步骤时，在思考阶段确认逻辑，在回答阶段清晰呈现。
3.  **绝对诚实**：如果知识库无答案，在思考阶段确认无果后，正式回答直接说“未找到答案”。
4.  **禁止截断**：确保你的思考过程完整，并且务必写出 `</think>` 来结束思考。

# Knowledge Base
 {Retrieval:FewMugsSend@formalized_content}

# User Question
请根据以上知识库和聊天历史，专业地回答用户的问题。
```

##### 回复消息_4

```
您的问题似乎无关我们的产品，小助手暂时不知道怎么回答呢
```

## API 调用

### 调用 Chat API 示例

**DeepSeek 推理模型思维链 (CoT) 的可视化交互优化**

> **背景**： 推理类大模型（如 DeepSeek-R1）在回答前会输出长篇幅的思维链（Chain of Thought），包裹在 `<think>` 标签中。直接流式输出这部分内容会导致屏幕刷屏，影响阅读；而完全隐藏则让用户失去了了解模型推理逻辑的机会。
>
> **代码逻辑说明**： 本段代码采用 **“动态缓冲 + 瞬间展开”** 的交互策略：
>
> 1. **思考态 (Thinking Phase)**：当检测到模型开始思考时，终端仅显示动态提示 `(深度思考中...)`，保持界面整洁，避免冗余信息干扰。
> 2. **推理展示 (Reveal Phase)**：一旦检测到思考结束（`</think>`），代码通过**反向查找** (`rfind`) 精准提取**最后一次完整的思考内容**，并将其格式化打印出来。
> 3. **流式回答 (Answer Phase)**：紧接着无缝切换回打字机模式，逐字流式输出最终的正式回答。
>
> 这种处理方式兼顾了**页面整洁性**与**信息透明度**，既让用户感知到 AI 的深度推理过程，又保证了最终阅读体验的流畅。

```python
import requests
import json
import sys
import re

# ================= 配置部分 =================
BASE_URL = "http://localhost:9383"
API_KEY = "ragflow-PJ-4Xt-aW9JsxzPaMdUFsWxOE5Z92-YvyhLNu_nigPI"
CHAT_ID = "34997428de2911f0af5292a53d8b8d21"
# ===========================================

# 全局开场白缓存
GLOBAL_OPENER = ""


def get_chat_opener():
    global GLOBAL_OPENER
    if GLOBAL_OPENER: return GLOBAL_OPENER

    url = f"{BASE_URL}/api/v1/chats?id={CHAT_ID}"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("data"):
                prompt_config = data["data"][0].get("prompt", {})
                GLOBAL_OPENER = prompt_config.get("opener", "你好！我是你的助理。")
                return GLOBAL_OPENER
    except:
        pass
    return "你好！我是你的助理。"


def send_message(session_id, question, is_warmup=False):
    url = f"{BASE_URL}/api/v1/chats/{CHAT_ID}/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    payload = {
        "question": question,
        "stream": True,
        "session_id": session_id
    }

    # 如果是正式对话，先打印前缀
    if not is_warmup:
        print("Bot: ", end="", flush=True)

    new_session_id = session_id

    # === 状态控制变量 ===
    raw_buffer = ""  # 存储原始数据（包含 <think>）
    printed_len = 0  # 记录已经打印了多少个“有效字符”
    is_thinking = False  # 是否正在思考模式
    has_finished_thinking = False  # 是否已经思考完毕

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=300) as response:
            if response.status_code != 200:
                print(f"[请求失败: {response.status_code}]")
                return new_session_id

            for line in response.iter_lines():
                if not line: continue
                decoded = line.decode('utf-8').strip()

                if decoded.startswith("data:"):
                    json_str = decoded[5:].strip()
                    if json_str == "[DONE]": break

                    try:
                        pkg = json.loads(json_str)
                        if isinstance(pkg.get("data"), bool): continue
                        if pkg.get("code", 0) != 0:
                            print(f"[API Error: {pkg.get('message')}]")
                            break

                        data = pkg.get("data", {})
                        if isinstance(data, dict):
                            if "session_id" in data and data["session_id"]:
                                new_session_id = data["session_id"]

                            chunk = data.get("answer", "")

                            if chunk:
                                raw_buffer += chunk

                                # 1. 检测是否开始思考
                                if "<think>" in raw_buffer and not has_finished_thinking:
                                    is_thinking = True

                                # 2. 检测是否结束思考
                                if "</think>" in raw_buffer:
                                    is_thinking = False
                                    has_finished_thinking = True

                                # 3. 逻辑分支：决定如何打印
                                if is_thinking:
                                    # 如果正在思考，使用 \r 覆盖当前行，显示动态提示
                                    if not is_warmup:
                                        print("\rBot: (深度思考中...)", end="", flush=True)
                                else:
                                    # 如果不在思考（或是思考结束了）

                                    # 计算“干净”的文本内容
                                    if has_finished_thinking:
                                        # 如果思考过，取 </think> 之后的内容
                                        clean_content = raw_buffer.split("</think>")[-1]
                                    elif "<think>" not in raw_buffer:
                                        # 如果从来没思考过，直接用原始文本
                                        clean_content = raw_buffer
                                    else:
                                        # 边缘情况：<think> 还没闭合，暂时什么都不做
                                        clean_content = ""

                                    # 核心流式逻辑：只打印【新增】的部分
                                    # 如果当前干净文本比已打印的长，说明有新字来了
                                    if len(clean_content) > printed_len:
                                        new_chars = clean_content[printed_len:]

                                        # 如果是刚结束思考的第一帧，先清空“(深度思考中...)”
                                        if has_finished_thinking and printed_len == 0 and not is_warmup:
                                            print(f"\rBot: {new_chars}", end="", flush=True)
                                        else:
                                            # 普通情况：直接追加打印新字符
                                            if is_warmup:
                                                pass  # 热身不打印
                                            else:
                                                print(new_chars, end="", flush=True)

                                        # 更新进度指针
                                        printed_len = len(clean_content)

                    except json.JSONDecodeError:
                        pass

        # 对话结束，如果是热身，打印最终结果作为开场白
        if is_warmup:
            final_clean_text = re.sub(r'<think>.*?</think>', '', raw_buffer, flags=re.DOTALL).strip()
            print(f"Bot: {final_clean_text}\n")
        else:
            print("")  # 换行

        return new_session_id

    except Exception as e:
        print(f"\n[Error] 连接异常: {e}")
        return new_session_id


def run_chat_loop():
    print(f"🚀 正在连接助手 (Chat ID: {CHAT_ID})...")

    # --- 1. 自动热身 ---
    print("🔄 正在初始化会话 (等待模型预热)...")
    # 热身时，函数内部会处理好思考标签，只在最后打印干净的问好
    current_session_id = send_message(None, "你好", is_warmup=True)

    if not current_session_id:
        print("❌ 初始化失败。")
        return

    print("💡 初始化完成！现在可以直接提问了 (输入 'exit' 退出)")
    print("-" * 50)

    # --- 2. 对话循环 ---
    while True:
        try:
            user_input = input("You: ")
            if not user_input.strip(): continue
            if user_input.lower() in ["exit", "quit"]: break
        except EOFError:
            break

        current_session_id = send_message(current_session_id, user_input)


if __name__ == "__main__":
    run_chat_loop()
```

这段代码调用了 RAGFlow 的 **标准公开 API**（Public API），主要涉及两个接口：

#### ① 获取助手配置接口

- **代码位置**：函数 `get_chat_opener()` 内
- **请求方式**：`GET`
- **完整 URL**：`http://localhost:9383/api/v1/chats?id=34997428de2911f0af5292a53d8b8d21`
- **API 路径**：`/api/v1/chats`
- **作用**：通过传递 `id` 参数，获取该助手的详细配置信息（例如：开场白 `opener`、提示词设置等）。代码中用它来获取 `opener` 以便显示“你好！我是你的助理。”。

#### ② 对话/问答接口

- **代码位置**：函数 `send_message()` 内
- **请求方式**：`POST`
- **完整 URL**：`http://localhost:9383/api/v1/chats/34997428de2911f0af5292a53d8b8d21/completions`
- **API 路径**：`/api/v1/chats/{chat_id}/completions`
- **作用**：发送用户的提问 (`question`)，并获取模型的回答。
- **关键参数**：
  - `stream: True`：开启流式传输。
  - `session_id`：用于维持多轮对话的上下文。

### 调用 Agent API 示例

**高级方案：使用内部接口绕过版本限制**

> **⚠️ 重要提示**： 在 RAGFlow 的部分版本中，官方对外开放的 Agent API (`/api/v1/agents/...`) 在处理流式传输时可能存在兼容性问题（表现为 `Response ended prematurely` 或 `async_generator` 错误）。
>
> **解决方案**： 为了保证在当前版本下能够稳定调用 Agent 工作流，本示例采用了一种**“接口伪装”**的高级技巧——直接调用 RAGFlow 前端 UI 使用的**内部私有接口** (`/v1/canvas/completion`)。
>
> **操作指南**： 此方法不使用常规的 API Key，而是模拟浏览器的身份验证。您需要：
>
> 1. 在浏览器中按 **F12** 打开开发者工具，进入 **Network (网络)** 面板。
> 2. 在 RAGFlow 界面与智能体对话一次。
> 3. 捕获 `completion` 请求，复制其 Request Headers 中的 **Authorization** 和 **Cookie** 字段填入下方代码。
>
> *注：此方案稳定性极高（100% 还原网页端体验），适合作为开发调试时的强力替代方案。待官方修复外部 API Bug 后，可随时切换回标准调用方式。*

```python
import requests
import json

# ================= 配置部分 =================
# 1. 这里的 URL 是您 F12 抓到的内部接口地址
URL = "http://localhost:9383/v1/canvas/completion"

# 2. Agent ID
AGENT_ID = "e5b21378ec4311f080e3da56ced64a91"

# 3. 构造请求头 (完全复刻您的浏览器请求)
# 注意：session 和 authorization 会过期，如果明天跑不通了，需要重新抓一下
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    # 注意：这里直接使用您抓包到的 Token，没有加 "Bearer " 前缀，因为它看起来像个签名字符串
    "Authorization": "IjUxOGJmNDM4ZWMzZjExZjA4MGUzZGE1NmNlZDY0YTkxIg.aV8fsg.aYY1ugGbOOWL_zILYi806pVOrSc",
    # Cookie 是内部接口鉴权的关键
    "Cookie": "session=.eJwdyzkSgCAMAMC_pLYgQRD8DBNMMtqCVI5_9yi32AvK6NrKIbCCo4Vd1FmUFkRzbIEycfCSahJCmKBY077Derahr_4WMFXLkXXz9rXk1AuHuKnEmTPC_QAFJx2i.aV8fsg.lhA0VGxjIY2cOMzSPB8_TnbZepY"
}

# ===========================================

def chat_like_browser_single_turn(question):
    print(f"正在发送消息: {question} ...")

    # 构造与浏览器完全一致的数据包
    payload = {
        "id": AGENT_ID,  # 内部接口参数名为 id
        "query": question,  # 用户的问题
    }

    full_answer = ""

    try:
        # 发送 POST 请求，开启 stream=True
        with requests.post(URL, headers=HEADERS, json=payload, stream=True) as response:

            # 1. 检查状态码
            if response.status_code != 200:
                print(f"请求失败: 状态码 {response.status_code}")
                print(f"返回内容: {response.text}")
                return

            # 2. 处理流式响应 (SSE)
            for line in response.iter_lines():
                if not line:
                    continue

                decoded_line = line.decode('utf-8').strip()

                # 解析 data: 开头的行
                if decoded_line.startswith("data:"):
                    json_str = decoded_line[5:].strip()  # 去掉 "data:"

                    try:
                        data = json.loads(json_str)

                        # 内部接口的事件类型通常是 'message'
                        # 我们只提取 content 内容，忽略 node_started/finished 等调试信息
                        if data.get("event") == "message":
                            content = data.get("data", {}).get("content", "")
                            full_answer += content
                            # 实时打印效果（可选）
                            # print(content, end="", flush=True)

                    except json.JSONDecodeError:
                        pass

        # 3. 最终一次性输出结果（实现单轮对话效果）
        print("\n" + "=" * 20 + " Agent 回复 " + "=" * 20)
        print(full_answer)
        print("=" * 50)

    except Exception as e:
        print(f"发生错误: {e}")


if __name__ == "__main__":
    chat_like_browser_single_turn("今天天气如何")
```

这段代码调用的 **不是** RAGFlow 的标准公开 API，而是其前端 UI 使用的 **内部私有接口**（Internal/Private API）：

#### ① 画布/智能体完成接口 (内部)

- **代码位置**：全局配置 `URL` 及函数 `chat_like_browser_single_turn()` 内
- **请求方式**：`POST`
- **完整 URL**：`http://localhost:9383/v1/canvas/completion`
- **API 路径**：`/v1/canvas/completion`
- **作用**：直接触发 Canvas（智能体画布）的工作流执行。
- **特殊性说明**：
  - 这是一个**非公开**的标准 API（标准 Agent API 应该是 `/api/v1/agents/...`）。
  - 它依赖 **Cookie** (`session=...`) 和 **内部 Authorization 签名** 进行鉴权，而不是标准的 `Bearer API_KEY`。
  - 它模拟了浏览器前端向后端发送请求的行为，因此稳定性极高，可以绕过某些版本中标准 API 的 Bug。

### API 调用实战总结

在使用 RAGFlow 的 HTTP API 进行二次开发时，除了参考官方 Swagger/ReDoc 文档外，根据实战经验，建议遵循以下最佳实践：

#### 调用 Chat API (`/api/v1/chats`)

Chat API 用于与在“对话 (Chat)”功能中创建的助手进行交互，支持基于知识库的问答。

- **接口地址**: `POST /api/v1/chats/{chat_id}/completions`
- **关键机制**：
  - **会话保持 (Session ID)**：API 是无状态的。首次请求 `session_id` 传 `None`（或不传），服务器会返回一个新的 ID；**后续所有请求必须带上这个 `session_id`**，否则机器人会丢失上下文记忆（变成单轮对话）。
  - **被动响应**：API 不会主动推送“开场白”。建议在代码逻辑中实现**“自动热身”**（后台自动发送“你好”获取 Session ID），或在连接前调用 `GET /api/v1/chats` 获取助手的配置信息（Opener）进行展示。
- **最佳实践**：
  - **推荐使用流式 (`stream=True`)**：不仅用户体验更好（打字机效果），而且能有效避免因中间网络节点（如 Nginx）超时导致的连接中断。
  - **处理推理模型 (Reasoning Models)**：如果底层使用 DeepSeek-R1 等输出思维链的模型，建议在客户端通过正则处理`<think>...</think>` 标签，并实现动态的“思考中”交互效果，以提升用户体验。

#### 调用 Agent API (`/api/v1/agents`)

Agent API 用于调用在“智能体 (Agent/Canvas)”画布中编排的复杂工作流。

- **接口地址**: `POST /api/v1/agents/{agent_id}/completions`
- **避坑指南**：
  - **强制流式**：在部分 RAGFlow 版本中，Agent 接口的非流式模式 (`stream=False`) 可能存在异步处理 Bug (`async_generator not iterable`)。**强烈建议始终将 `stream` 设置为 `True`** 来规避此服务端错误。
  - **变量传递**：如果 Agent 的“开始 (Begin)”节点定义了用户输入变量，需通过请求体中的 `inputs` 字段传递（例如 `{"inputs": {"user_name": "Alice"}}`）。

#### 本地模型适配与稳定性优化 (LM Studio 集成)

当 RAGFlow 后端连接本地 LLM（如 LM Studio）时，常见的“连接中断”、“Response ended prematurely”通常由资源限制引起：

- **超时设置 (Timeout)**：
  - 本地推理速度较慢，尤其是处理长文档或使用思维链模型时。
  - **建议**：Python 客户端的 `requests.post` 超时时间至少设为 **300秒** (`timeout=300`)，防止客户端提前断开。
- **防止 OOM (显存溢出)**：
  - **RAGFlow 端**：在 Chat 设置中，将 **Top N** 调小（建议 1~3），并在知识库解析设置中将 **Chunk Token Number** 设为 512。这能显著减少发送给模型的 Token 数量。
  - **LM Studio 端**：根据显卡能力调整 **Context Length**（建议 4096 或 8192），避免因上下文过长导致模型进程崩溃（Exit code ...0000）。

### 本地模型适配与故障排查速查表

当 RAGFlow 连接本地 LM Studio 时，如果你遇到以下报错，请查阅此表：

| **报错现象 (Python/Log)**                | **根本原因**                                                 | **解决方案**                                                 |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `Response ended prematurely`             | **服务端超时**。LM Studio 推理太慢（>60s），导致 RAGFlow 断开连接。 | 1. **减少输入**：在 RAGFlow 设置中将 **Top N** 降为 1~2。 2. **优化切片**：重置知识库解析配置，**Chunk Token Number** 设为 512。 |
| `Exit code ...0000` (LM Studio日志)      | **显存溢出 (OOM)**。模型上下文窗口设置过大，显卡爆了。       | 在 LM Studio 右侧设置中，将 **Context Length** 从默认值（如 32k/56k）调小至 **4096** 或 **8192**。 |
| `async_generator object is not iterable` | **服务端 Bug**。RAGFlow 旧版本 Agent 接口非流式模式的 Bug。  | 1. 升级 RAGFlow 版本。 2. 或者改用本文提供的 **Agent 内部接口伪装方案**。 |
