# 大模型横评

## 模型厂商与关键模型

【主观】

### 国内

* **DeepSeek** -> DeepSeekV3/R1 -> DeepSeekV3.1 -> 3.1 Terminus -> DeepSeek V3.2（混合注意力机制）：中上 35%，-> DeepSeek V4(Engram)
* **MiniMax** -> MiniMax M1 -> MiniMax M2 -> MiniMax M2.1(Coding plan + Claude Code)
* **MoonShot** -> Kimi-K1.5 -> Kimi-K2 -> Instruct/thinking/09-05 -> KIMI-K2.5(SOTA) -> 偏贵 ——> 50/100/150，KIMICLI并不多，触顶 -> Trae CN -> OpenCode -> 咸鱼 -> ModelScope/OpenRouter -> SiliconFlow Pro/Moonshot/Kimi-K2.5 -> 400->2000? 16->64
* **BigModel** -> GLM4.5 -> GLM4.6+GLM4.6V(Coding plan + Claude Code) + GLM4.7(Coding plan + Claude Code) -> 4.7, 4.6flash就免费，给你一个并发做测试
* **Qwen** -> Qwen2.5-8B -> Qwen3-0.6B -> Qwen3-Coder(V3.1?)(服务器运维，解释一下当前项目) -> Qwen Code -> 2000免费额度 -> 服务器运维，部署应用 -> Qwen3-Next -> Qwen3VL -Qwen3 TTS -> Qwen3Edit -> Qwen3Max（被KIMI-K2.5）-> ClawBot？？？
* **豆包** -> 蠢 -> 字节跳动/抖音 -> 说话非常网络化/怼人 -> 实时对话/视觉识别多模态 -> 复杂逻辑推理/代码任务。Seedance2.0，文生图/视频，SOTA -> CodingPlan -> 大杂烩
* **Step** -> Step 3.5 Flash -> 一次推理3个token -> V3.2水平，但是达到150tps
* **混元** -> APP -> 什么能力都很一般，就是免费 -> API也不免费
* **文心一言** -> APP? -> 百度飞浆DeepResearchSOTA -> ？
* **小米** -> Mimo-flash，免费，OpenRouter -> 赢 -> ? -> 成本太高

### 国外

* **OpenAI** -> 2024 ChatGPT4o -> 25年早期ChatGPT o1 -> ChatGPT 4.5 -> ChatGPT 5.0 -> ChatGPT5.1 -> ChatGPT 5.2 CodeX / ChatGPT o3 -> 很严肃/不会说话/不喜欢解释/不写注释/非常安全/指令遵循非常高/不会做指令外的任何事情几乎/适合代码重构/稳定性极强/代码质量较高/思考时长很长 -> ChatGPT 5.3 CodeX -> CodeX -> ChatGPT Business -> 8r-10r?
* **Anthropic** -> Claude 3.5 haiku/sonnet -> Claude 3.7 sonnet -> claude sonnet 4.0 -> Claude Sonnet 4.5/Opus -> 更思辨/幻觉略高/偶尔会偷懒/比较快/适合前期搭建框架和基础应用/代码审美和质量非常高/很会写文档和注释 -> Claude Opus 4.6 -> 4.6 Fast -> Claude Code -> 咸鱼 -> 账号池/反代 -> CodingPlan
* **Google** -> Gemini1.5pro -> Gemini2.5Pro 100W -> Gemini CLI -> Gemini API -> 蛮多的免费额度 -> 2-3个Gemini Pro -> Gemini3 Pro/Gemini banana Pro
* **XAI** -> Grok3 -> Grok4 ( ? ) -> Grok4.1 Thinking ? -> Grok Code/Grok 4.1 Code Fast -> Cursor -> 助手

## 开发工具

### CLI

* **Claude Code** -> 咸鱼用反代 -> 冲官网 -> CodingPlan -> Skills/Agent/SubAgent
* **CodeX** -> ChatGPT Business -> CodeX Max APP
* **Gemini CLI** -> Gemini Pro -> Gemini CLI -> 3，无限用Gemini3Pro
* **Qwen Code** -> 2000次Qwencoder -> 运维服务器/小任务助手，写写教学都可以
* **Kimi CLI** -> API/他们自己套餐 比较贵
* **Cursor CLI** -> Auto/用量
* **Open Code** -> OpenAI -> Free -> 友好
* **CodeBuddy CLI** -> 200 request
* **Copilot CLI** -> Claude 4.5 Haiku

### 插件

* **Cline, RooCode, KiloCode** -> 右侧面板，配置key，用
* **Augment Code** -> 插件里面最贵，能力最好，上下文最好，但是贵

### IDEA AI

* **Cursor**：不是很推荐，除非你有钱，工具本身很好
* **TRAE CN**：免费国内模型 排队 SOLO不支持
* **TRAE**：Gemini GPT —> 10-15 —> 600 —> SOLO支持，2925邮箱
* **CodeBuddy / Qoder / Trae**
* **Antigravity**：Google -> 网络？ -> Gemini GPT Claude -> Antigravity Tools -> CLauDe 周限制 -> Gemini GPT -> 偶尔会降智

### 一站式的开发平台

* **Replit**：不要指望能弄出很好的东西。 -> 人机协作 -> demo 作业

## API低价方式

* **SiliconFlow** -> 咸鱼有方法
* **OpenRouter** -> 存10🔪，1000次免费调用
* **modelscope** -> 免费每天2000次
* **IFLOW** -> 单并发
* **Coding Plan** -> MiniMax GLM 火山引擎 -> NEW-API -> 单并发
