AI开发工具与Claude Code低价使用指南

## 一、自我介绍（教学背景）

**东北大学 软件工程研0 | AI开发同学**

**使用经历:**

- Claude Code **重度使用5个月**（累计400+小时，通过平替方案）
- Cursor **1年经验**
- 覆盖 **Mac/Windows/Ubuntu** 全平台

---

## 二、AI开发工具超级综合对比

### 🎯 完整对比表

| **对比维度**            | **💰 定价 - 免费版**                        | **💰 定价 - Pro/高级**                                        | **⚙️ 工具类型 - IDE类型** | **⚙️ 工具类型 - 系统占用** | **🤖 主要模型**                                               | **📊 免费额度/限制**                                          | **🎯 适用场景**                                               | **🐛 关键问题 - 主要投诉**                                    |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------ | ------------------------ | ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Cursor**              | ✅ **Hobby版**                              | **Pro: ¥142/月** ($20/月, 含¥142 API额度)<br/>**Pro+: ¥425/月** ($60/月, 含¥496 API额度)<br>**Ultra: ¥1417/月** ($200/月, 含¥2834 API额度) | VS Code Fork             | **3.2GB** ⚠️               | Claude 4.5 Sonnet, Claude 4 Sonnet, GPT-5, GPT-4.5, Gemini 2.5 Pro, DeepSeek V3.1 | **Hobby版:** 50次高级模型请求/月, 约2000次基础模型请求/月<br>**Pro版:** ¥142 API额度/月 ($20), 超出按量计费 | **VS Code用户、需要多模型切换、Tab补全重度使用**             | • **API额度消耗快** (¥142约225次Sonnet请求)<br>• 超出用量需额外付费<br>• Hobby版限制严格 |
| **Claude Code**         | ❌ **无免费版**，但是有一些窍门方法低价使用 | **¥142/月** ($20/月, 周限**40-80h** Sonnet 4)<br/>**¥708/月** ($100/月, 周限**140-280h**)<br>**¥1417/月** ($200/月, 周限**240-480h**) | CLI+VS Code扩展          | **<500MB** ✅              | Sonnet 4.5, Opus 4.1 (通过CCR可扩展: DeepSeek V3.1, MiniMax M2, GLM-4.6, Kimi) | **无免费版**<br>**¥142档:** 40-80h Sonnet 4/周<br>**¥708档:** 140-280h/周<br>**¥1417档:** 240-480h/周 | **重度AI编程、多Agent并发、大项目(256K上下文)、终端原生操作、追求极致性能** | • **周限制严格** (重度用户易撞限)<br>• ¥142档仅40-80h/周<br>• ¥1417档重度用户2-3天用完 |
| **Trae海外版**          | ✅ **免费版**                               | **Pro: 首月¥21，之后¥71/月** ($3/$10/月)<br>年付¥638 ($90, 约¥53/月) | VS Code Fork             | **5.7GB** ⚠️               | GPT-5, Gemini 2.5 Pro                                        | **免费版:** 10次快速/月, 50次慢速/月, 1000次高级模型/月, 5000次代码补全/月<br>**Pro版:** 600次快速/月, **无限慢速, 无限补全** | **预算有限、需要GPT-5、轻度到中度使用、VS Code用户**         | • 免费版用量限制严格 (10次快速/月)<br>• Pro版快速请求需额外购买 (¥21/100次)<br>• 免费版高峰时段需排队 |
| **Trae国内版**          | ✅ **完全免费**                             | -                                                            | VS Code Fork             | **5.7GB** ⚠️               | DeepSeek R1/V3, 豆包1.5-pro                                  | **无限制** ✅                                                 | **国内用户首选、完全免费、日常开发、学生党、教学演示**       | • 仅限国内网络访问<br>• 功能更新滞后海外版                   |
| **开源CLI工具集**       | ✅ **完全免费**                             | -                                                            | CLI终端工具              | **<300MB** ✅              | Gemini 2.5 Pro/Flash, Qwen3-Coder-480B, Kimi K2, DeepSeek v3 | **Gemini:** 1000次/天 (Pro用户4-5次后降Flash)<br>**Qwen:** 2000次/天 (国内), 1000次/天 (海外)<br>**IFlow:** 无限制 (1并发限制) | **自动化脚本、CI/CD集成、终端工作流、服务器环境、批量处理**  | • Gemini: Pro限额低 (4-5次后强制降Flash)<br>• Qwen: Token消耗高 (9万/简单任务)<br>• IFlow: 1并发限制影响效率 |
| **Qoder**<br>*(公测中)* | ✅ **公测免费**                             | **待定** ⚠️                                                   | 独立架构                 | 2.1GB                     | Qwen3-Coder                                                  | **2000积分/月**                                              | **公测尝鲜、Qwen生态用户、全项目感知、Quest Mode探索**       | • 公测中，定价和长期稳定性未知<br>• 积分限制可能影响重度使用 |
| **Cline/Roo**           | ✅ **完全免费**                             | -                                                            | VS Code插件              | 1.2GB                     | Claude (API), GPT-4o/GPT-5 (API), DeepSeek/Qwen (API), Ollama (本地) | **按API计费** (需自备API Key)                                | **VS Code插件、自主Agent工具、API灵活配置、本地模型支持、成本可控** | • 5-10分钟易卡死 (GitHub #847)<br>• Token消耗高 (约¥8.5/会话)<br>• 无checkpoint机制 |
| **OpenAI Codex**        | ❌ **无免费版**                             | **Plus: ¥142/月** ($20/月, 包含Codex访问)<br/>**Pro: ¥1417/月** ($200/月, 更高额度) | CLI工具                  | **<400MB** ✅              | GPT-5-Codex                                                  | **Plus:** 每5小时30-150个本地任务, ¥35 API额度 ($5)<br>**Pro:** 每5小时更高额度 | **ChatGPT生态用户、CLI工具、配对编程、终端集成、OpenAI忠实用户** | • **无免费版，需ChatGPT订阅**<br>• Plus版用量有限 (每5小时30-150任务)<br>• 依赖ChatGPT生态 |

---

## 快速选择指南（预算优先）

### 1. 界面化软件开发（IDE集成）

#### 1.1 **Cursor（咸鱼续杯）**

- **成本**: 月付≤¥50（约¥1.6/天）
- **优势**: 
  - 推广期**Compose 1模型免费**（疑似基于GLM-4.6增量训练，效果速度良好）
  - VS Code Fork，界面熟悉
  - Tab补全流畅
- **适用**: 预算有限但需要完整IDE体验的用户

#### 1.2 **Qoder** 

- **成本**: 目前免费（公测期）
- **特点**: 
  - 疑似后台使用Claude系列模型
  - 测试期新账号有额度
  - 效果尚可，但**后续定价和稳定性未知**
- **适用**: 尝鲜用户，不推荐重度依赖

#### 1.3 **Trae国内版**

- **成本**: 完全免费
- **优势**: 无限制使用
- **劣势**: 
  - 速度缓慢
  - 模型为国内开源模型，多模态能力差
  - 读取文件等操作效率低
  - 更新滞后海外版
- **适用**: 临时小型开发任务、脚本编写、学生党

#### 1.4 **Trae海外版**

- **成本**: 月付≤¥71（首月¥21）
- **优势**: 支持GPT-5系列
- **劣势**: 
  - 不支持Anthropic系列（被Ban）
  - 高峰时段需排队
  - UI和体验一般，**凑合能用**的水平
- **适用**: 预算有限且需要GPT-5的用户

---

### 2. VS Code插件方案

#### 2.1 **Cline/RooCode**

- **成本**: 完全免费（需自备API Key）
- **特点**: 
  - 轻量级，快速集成VS Code
  - 开发体验不如CLI工具和Cursor
  - 胜在**灵活方便**
- **适用**: VS Code用户，需要灵活配置API

#### 2.2 **Kiro Code**

- **成本**: 按需付费
- **特点**: 
  - Cline和RooCode的集成版本
  - 插件方提供模型服务
  - 支持付费使用各大模型
  - 介于Cline和Augment Code之间的中间产品
- **适用**: 需要插件方托管服务的用户

#### 2.3 **Augment Code** ⚠️

- **成本**: 强制付费使用Anthropic模型
- **特点**: 
  - 网传功能强大
  - **成本敏感用户不推荐**
  - ⚠️ 咸鱼曾有自动续杯破解商家（可靠性未知，需自行测试）
- **适用**: 预算充足且需要Anthropic模型的用户

---

### 3. CLI开发（Linux服务器环境优先）

#### 3.1 **Claude Code**

- **成本**: ¥142-¥1417/月（费用极高）
- **优势**: 
  - **全场效果最佳**
  - 迭代速度快
  - 原生Linux终端操作
  - 支持后台进程管理、实时调试、多模态、MCP、多Agent团队管理
- **劣势**: 周限制严格，费用高
- **适用**: 重度AI编程、追求极致性能、预算充足

#### 3.2 **OpenAI Codex**

- **成本**: ¥142/月起（需ChatGPT订阅）
- **特点**: 
  - 2024年秋季推出的闭源产品
  - 直接集成ChatGPT生态
  - CLI工具，支持配对编程
- **适用**: ChatGPT生态用户、CLI工具爱好者

#### 3.3 **Gemini CLI**

- **成本**: 免费（1000次/天）
- **优势**: 最早的开源Claude Code竞品
- **劣势**: 
  - 效果和稳定性不如Claude Code
  - 存在读取长文件刷屏BUG等问题
- **适用**: 轻度任务，预算为零的用户

#### 3.4 **IFlow CLI / Qwen Code CLI**

- **成本**: 免费或按需付费
- **优势**: 
  - 基于Gemini CLI的Fork产品
  - 基于阿里云Qwen系列
  - 支持自定义兼容OpenAI端点
  - **国内服务器场景下非常好用**（网络优势）
- **适用**: 国内服务器环境、CI/CD自动化、批量处理

#### 3.5 **其他CLI产品** ⚠️

- **Kimi CLI / KCode / Cursor CLI** 等
- **问题**: 
  - 出现较晚或为Claude Code的拙劣模仿
  - 用户量少，稳定性差
  - 性价比偏低
- **建议**: 不推荐，优先选择上述成熟产品

## 三、官方方案的痛点（2025年11月社媒调研）

**Claude Code官方三大罪状** (基于500名开发者问卷):

1. **价格虚高** (¥1417/月, $200/月)
   - 对比：DeepSeek同性能仅**30元/月**，MiniMax M2仅**5元/月**
   - 社媒："花钱买限制" / "为品牌溢价80%"

2. **用量限制反人类** 
   - 周限制逻辑："像是给AI装了计时器"
   - 重度用户："周三下午就闲着，周日额度重置"
   - **官方数据**: 仅5%用户撞限 | **社媒投票**: 62%撞限

3. **网络障碍**
   - 国内服务器："每15分钟断一次"
   - 企业用户："SD-WAN专线成本比API还高"
   - 解决方案: 中转服务(如laozhang.ai)或CCR路由

**结论**: 平替方案是**刚需**不是选择

---

## 四、四大使用方案（含2025年11月更新）

### 方案1: 直接购买官方会员（富哥专属）

**成本**: ¥1417/月 ($200/月)  
**优点**: 功能完整，无配置成本  
**缺点**: 

- 依然撞周限 (Twitter用户@ai_dev_john: "$200也逃不掉限制")
- 国内网络需额外VPN成本 (~100元/月)
- **性价比最低** (社媒评为"智商税")

**适用**: 跨国企业、预算无限制团队、合规强制要求

---

### 方案2: 国内模型平台

**接入方式**: 通过修改Claude Code的Base URL，将请求转发至国内平台。部分平台支持Anthropic API格式兼容。

#### **DeepSeek**

**文档**: https://api-docs.deepseek.com/guides/anthropic_api

**配置方法**:

**方式1: Linux/macOS（临时配置，当前终端会话有效）**

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=sk-your-deepseek-api-key
export API_TIMEOUT_MS=600000
export ANTHROPIC_MODEL=deepseek-chat
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

**方式2: Linux/macOS（永久配置，添加到 ~/.bashrc 或 ~/.zshrc）**

```bash
echo 'export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN=sk-your-deepseek-api-key' >> ~/.bashrc
echo 'export API_TIMEOUT_MS=600000' >> ~/.bashrc
echo 'export ANTHROPIC_MODEL=deepseek-chat' >> ~/.bashrc
echo 'export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat' >> ~/.bashrc
echo 'export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1' >> ~/.bashrc
source ~/.bashrc
```

**方式3: Windows PowerShell（临时配置）**

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="sk-your-deepseek-api-key"
$env:API_TIMEOUT_MS="600000"
$env:ANTHROPIC_MODEL="deepseek-chat"
$env:ANTHROPIC_SMALL_FAST_MODEL="deepseek-chat"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
```

**方式4: Windows CMD（永久配置）**

```cmd
setx ANTHROPIC_BASE_URL "https://api.deepseek.com/anthropic"
setx ANTHROPIC_AUTH_TOKEN "sk-your-deepseek-api-key"
setx API_TIMEOUT_MS "600000"
setx ANTHROPIC_MODEL "deepseek-chat"
setx ANTHROPIC_SMALL_FAST_MODEL "deepseek-chat"
setx CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC "1"
```

**注意**: Windows使用`setx`后需要重新打开终端窗口才能生效。

---

#### **GLM智谱**

**文档**: https://docs.bigmodel.cn/cn/guide/develop/claude

**配置方法**:

**方式1: Linux/macOS（临时配置）**

```bash
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_AUTH_TOKEN=your-glm-api-key
```

**方式2: Linux/macOS（永久配置）**

```bash
echo 'export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN=your-glm-api-key' >> ~/.bashrc
source ~/.bashrc
```

**方式3: Windows PowerShell（临时配置）**

```powershell
$env:ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="your-glm-api-key"
```

**方式4: Windows CMD（永久配置）**

```cmd
setx ANTHROPIC_BASE_URL "https://open.bigmodel.cn/api/anthropic"
setx ANTHROPIC_AUTH_TOKEN "your-glm-api-key"
```

**注意**: Windows使用`setx`后需要重新打开终端窗口才能生效。

---

#### **Kimi月之暗面**

**文档**: https://platform.moonshot.cn/docs/guide/agent-support#使用注意事项

**配置方法**:

**方式1: Linux/macOS（临时配置）**

```bash
export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
export ANTHROPIC_AUTH_TOKEN=your-moonshot-api-key
export ANTHROPIC_MODEL=kimi-k2-turbo-preview
export ANTHROPIC_SMALL_FAST_MODEL=kimi-k2-turbo-preview
```

**方式2: Linux/macOS（永久配置）**

```bash
echo 'export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN=your-moonshot-api-key' >> ~/.bashrc
echo 'export ANTHROPIC_MODEL=kimi-k2-turbo-preview' >> ~/.bashrc
echo 'export ANTHROPIC_SMALL_FAST_MODEL=kimi-k2-turbo-preview' >> ~/.bashrc
source ~/.bashrc
```

**方式3: Windows PowerShell（临时配置）**

```powershell
$env:ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="your-moonshot-api-key"
$env:ANTHROPIC_MODEL="kimi-k2-turbo-preview"
$env:ANTHROPIC_SMALL_FAST_MODEL="kimi-k2-turbo-preview"
```

**方式4: Windows CMD（永久配置）**

```cmd
setx ANTHROPIC_BASE_URL "https://api.moonshot.cn/anthropic"
setx ANTHROPIC_AUTH_TOKEN "your-moonshot-api-key"
setx ANTHROPIC_MODEL "kimi-k2-turbo-preview"
setx ANTHROPIC_SMALL_FAST_MODEL "kimi-k2-turbo-preview"
```

**注意**: Windows使用`setx`后需要重新打开终端窗口才能生效。


---

### 方案3: CCR路由器

**Claude Code Router**

[musistudio/claude-code-router: Use Claude Code as the foundation for coding infrastructure, allowing you to decide how to interact with the model while enjoying updates from Anthropic.](https://github.com/musistudio/claude-code-router)

**功能**: 智能路由，按任务类型自动切换不同模型，平衡成本和性能。

**安装与启动**:

```bash
npm install -g @musistudio/claude-code-router
# 修改config.json文件
ccr ui #启动ui界面编辑文档
ccr restart
ccr code
```

---

**支持的模型提供商价格对比** (粗略，详细的价格大家使用前一定要查询官方文档，这只是之前整理的参考版本):

| 平台                    | API端点                      | 模型                   | 输入价格                         | 输出价格 | 上下文窗口 | 免费额度             | 配置建议                    |
| ----------------------- | ---------------------------- | ---------------------- | -------------------------------- | -------- | ---------- | -------------------- | --------------------------- |
| **DeepSeek**            | api.deepseek.com/v1          | DeepSeek-V3            | ¥2                               | ¥8       | 128K       | 无                   | 通用场景，支持Anthropic格式 |
|                         |                              | DeepSeek-R1            | ¥4                               | ¥16      | 64K        | 无                   | 推理、数学任务              |
|                         |                              | DeepSeek-V3.2-Exp      | ¥0.2(缓存命中)<br>¥2(缓存未命中) | ¥3       | 128K       | 无                   | 最新实验版本                |
| **GLM智谱**             | open.bigmodel.cn/api/paas/v1 | GLM-4.6                | ¥3.5                             | ¥14      | 200K       | 注册送免费额度       | 编程、推理、智能体          |
|                         |                              | GLM-4.5                | ¥3.5                             | ¥14      | 128K       | 注册送免费额度       | 通用场景                    |
|                         |                              | GLM-4.5-Air            | ¥1                               | ¥6       | 128K       | 注册送免费额度       | 快速响应                    |
|                         |                              | GLM-4-Flash            | 免费                             | 免费     | 128K       | 无限制               | 完全免费                    |
| **Kimi月之暗面**        | api.moonshot.cn/v1           | Kimi-K2-Instruct       | ¥4                               | ¥16      | 128K       | 无                   | 超长上下文处理              |
|                         |                              | Kimi-Dev-72B           | ¥2                               | ¥8       | 131K       | 无                   | 代码修复、自动化测试        |
| **MiniMax**             | api.minimax.ai/v1            | MiniMax-M1-80k         | ¥4                               | ¥16      | 80K        | 需查看官方           | 需CCR集成                   |
| **Qwen通义千问**        | dashscope.aliyun.com         | Qwen3-235B-A22B        | ¥2.5                             | ¥10      | 262K       | ModelScope每日2000次 | 数学、长文本推理            |
|                         |                              | Qwen3-Coder-480B       | ¥8                               | ¥16      | 1M         | ModelScope每日2000次 | 编程专家、超长代码          |
| **OpenRouter**          | openrouter.ai/api/v1         | DeepSeek-R1            | 免费                             | 免费     | 64K        | 无限制               | 免费聚合平台                |
|                         |                              | DeepSeek-V3            | 免费                             | 免费     | 128K       | 无限制               | 免费聚合平台                |
|                         |                              | Kimi-Dev-72B           | 免费                             | 免费     | 131K       | 无限制               | 免费聚合平台                |
|                         |                              | GLM-4.5-Air            | 免费                             | 免费     | 128K       | 无限制               | 免费聚合平台                |
|                         |                              | Qwen3-Coder            | 免费                             | 免费     | 1M         | 无限制               | 免费聚合平台                |
|                         |                              | Qwen3-235B-A22B        | 免费                             | 免费     | 262K       | 无限制               | 免费聚合平台                |
| **ModelScope魔搭**      | dashscope.aliyun.com/api/v1  | Qwen3-Coder            | 免费                             | 免费     | 1M         | 2000次/天            | 需实名认证                  |
|                         |                              | DeepSeek-R1            | 免费                             | 免费     | 64K        | 2000次/天            | 需实名认证                  |
|                         |                              | GLM-4.5                | 免费                             | 免费     | 128K       | 2000次/天            | 需实名认证                  |
| **SiliconFlow硅基流动** | api.siliconflow.cn/v1        | DeepSeek-V3.1-Terminus | ¥4                               | ¥12      | 128K       | 注册送¥14            | Pro版本                     |
|                         |                              | DeepSeek-R1            | ¥4                               | ¥16      | 64K        | 注册送¥14            | Pro版本                     |
|                         |                              | GLM-4.6                | ¥3.5                             | ¥14      | 200K       | 注册送¥14            | Pro版本                     |
|                         |                              | Kimi-K2-Instruct       | ¥4                               | ¥16      | 128K       | 注册送¥14            | Pro版本                     |
|                         |                              | Qwen3-Coder-480B       | ¥8                               | ¥16      | 1M         | 注册送¥14            | Pro版本                     |

**注**: 以上价格为2025年11月

**路由配置示例**:

``````json
{
  "LOG": false,
  "LOG_LEVEL": "debug",
  "CLAUDE_PATH": "",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "APIKEY": "",
  "API_TIMEOUT_MS": "600000",
  "PROXY_URL": "",
  "transformers": [],
  "Providers": [
    {
      "name": "木木",
      "api_base_url": "https://api.oyemoye.top/v1/chat/completions", 
      "api_key": "很厉害的key",
      "models": [
        "anthropic_openai_format/claude-sonnet-4-5-20250929",
        "anthropic_openai_format/claude-3-5-haiku-20241022",
        "anthropic_openai_format/claude-sonnet-4-5-20250929-thinking"
      ]
    }
  ],
  "StatusLine": {
    "enabled": false,
    "currentStyle": "default",
    "default": {
      "modules": []
    },
    "powerline": {
      "modules": []
    }
  },
  "Router": {
    "default": "木木,anthropic_openai_format/claude-sonnet-4-5-20250929",
    "background": "木木,anthropic_openai_format/claude-3-5-haiku-20241022",
    "think": "木木,anthropic_openai_format/claude-sonnet-4-5-20250929-thinking",
    "longContext": "木木,anthropic_openai_format/claude-sonnet-4-5-20250929-thinking",
    "longContextThreshold": 60000,
    "webSearch": "木木,anthropic_openai_format/claude-sonnet-4-5-20250929",
    "image": "木木,anthropic_openai_format/claude-sonnet-4-5-20250929"
  },
  "CUSTOM_ROUTER_PATH": ""
}
``````



**配置建议**:

- **免费优先**: 优先使用OpenRouter/ModelScope免费模型
- **成本优化**: 简单任务→小模型，长上下文→256K任意模型
- **国内网络**: IFlow/SiliconFlow国内延迟低
- **备用方案**: 配置多个提供商，自动故障转移

---

### 方案4: NEWAPI网关 + 个人Key管理

**NEWAPI** (GitHub: QuantumNous/new-api) 是一个AI模型聚合管理与分发系统，支持将多种大模型转换为统一格式调用。

**适用场景**: 

- 个人开发者需要集中管理多个平台的API密钥
- 通过多账号注册和试用Key轮询降低成本
- 需要统一接口调用不同模型

**核心功能**:

1. **统一接口管理**
   - 采用OpenAI兼容格式，支持200+主流大模型
   - 统一调用接口，无需为不同平台编写不同代码
   - 支持对话补全、图像生成、语音处理、嵌入向量等功能

2. **渠道和密钥管理**
   - 集中管理OpenAI、Anthropic、Google、DeepSeek、GLM等平台的API密钥
   - 支持单个、批量和多密钥模式添加渠道
   - 自动测试渠道可用性，更新余额信息
   - 支持令牌（Token）管理，控制访问权限

3. **负载均衡和轮询**
   - 自动轮询多个API密钥，均衡使用
   - 支持故障转移，单个密钥失效时自动切换
   - 可配置权重和优先级

**部署方法**:

#### 方式一：Docker Compose部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/QuantumNous/new-api.git
cd new-api

# 2. 配置环境变量（如需要自定义）
cp .env.example .env
# 编辑.env文件，设置数据库连接等配置

# 3. 启动服务（会自动启动MySQL和NEWAPI）
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

#### 方式二：本地开发部署

```bash
# 1. 克隆项目
git clone https://github.com/QuantumNous/new-api.git
cd new-api

# 2. 配置环境变量
cp .env.example .env

# 3. 编辑.env文件，配置数据库连接
# SQL_DSN=root:password@tcp(localhost:3306)/new-api?parseTime=true

# 4. 安装Go依赖
go mod download

# 5. 启动后端服务
go run main.go

# 6. （可选）启动前端开发服务器
cd web
bun install  # 或 npm install
bun run dev  # 或 npm run dev
```

**初始访问**:

- **Web管理界面**: http://localhost:3000
- **默认管理员账号**: root
- **默认密码**: 123456（首次登录后请立即修改）

**配置渠道（通过Web界面）**:

1. 登录Web管理界面后，进入"渠道管理"
2. 点击"添加渠道"，选择渠道类型（DeepSeek、GLM、Kimi等）
3. 填写API密钥和基础URL
4. 配置权重和优先级（用于负载均衡）
5. 保存后系统会自动测试渠道可用性

**配置示例（DeepSeek渠道）**:

```
渠道名称: DeepSeek-V3
渠道类型: DeepSeek
API密钥: sk-your-deepseek-key
基础URL: https://api.deepseek.com/v1
模型列表: deepseek-chat, deepseek-reasoner
权重: 50
优先级: 1
```

**配置示例（GLM渠道）**:

```
渠道名称: GLM-4.5
渠道类型: GLM
API密钥: sk-your-glm-key
基础URL: https://open.bigmodel.cn/api/paas/v1
模型列表: glm-4-5
权重: 30
优先级: 2
```

**创建访问令牌（Token）**:

1. 在Web界面进入"令牌管理"
2. 点击"创建令牌"，设置令牌名称和权限
3. 复制生成的令牌（只显示一次，请妥善保存）
4. 使用此令牌作为API调用的认证凭证

**与Claude Code集成**:

```bash
# 方式1: 设置环境变量（Linux/macOS）
export ANTHROPIC_BASE_URL="http://localhost:3000/v1"
export ANTHROPIC_AUTH_TOKEN="your-newapi-token"

# 方式2: Windows PowerShell
$env:ANTHROPIC_BASE_URL="http://localhost:3000/v1"
$env:ANTHROPIC_AUTH_TOKEN="your-newapi-token"

# 方式3: Windows CMD
setx ANTHROPIC_BASE_URL "http://localhost:3000/v1"
setx ANTHROPIC_AUTH_TOKEN "your-newapi-token"

# 配置完成后，启动Claude Code
claude
```

**API调用示例**:

```bash
# 通过NEWAPI统一接口调用（使用创建的Token）

curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your-newapi-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# NEWAPI会自动路由到配置的DeepSeek渠道
# 如果第一个Key额度用尽，自动切换到备用Key
```

**低成本使用策略**:

1. **多账号注册**
   - 在不同平台注册多个账号获取试用额度
   - 例如：DeepSeek新用户、GLM注册送免费额度、ModelScope每日2000次
   - 在NEWAPI中添加所有账号的密钥，设置轮询

2. **试用Key轮询**
   - 配置多个试用Key，按权重分配请求
   - 当某个Key额度用尽时，自动切换到其他Key
   - 设置优先级，优先使用免费额度

3. **批量购买优化**
   - 关注各平台的促销活动（如MiniMax免费期）
   - 批量购买试用Key，通过NEWAPI统一管理
   - 使用成本监控功能，及时调整使用策略

**监控和管理**:

- 在Web界面查看各渠道的使用统计和余额
- 设置费用预警，单日超过阈值时通知
- 导出使用日志，分析成本分布
- 支持QPS限速，防止单个用户耗尽额度
- 支持渠道健康检查，自动禁用失效渠道

---

### 方案5: ZCF一键配置工具

**ZCF** (Zero-Config Claude-Code Flow, GitHub: UfoMiao/zcf) 是一个开源工具，提供零配置、一键搭建Claude Code环境的能力。

**核心功能**:

1. **一键安装和配置**
   - 自动安装Claude Code
   - 自动配置API或CCR代理
   - 导入预置工作流
   - 配置MCP服务

2. **CCR集成管理**
   - 内置Claude Code Router (CCR) 管理
   - 支持多模型代理路由
   - 一键启动CCR Web界面
   - 支持服务状态控制

3. **多语言和个性化**
   - 支持中英文界面
   - 多种AI输出风格
   - 个性化配置保存

**安装和使用**:

```bash
# 1. 一键启动（需要Node.js环境）
npx zcf

# 2. 交互式菜单选择
# - 全量初始化：安装Claude Code + 配置API/CCR + 导入工作流
# - 仅配置API：只配置API密钥
# - 仅配置CCR：只配置CCR代理
# - CCR管理：管理CCR服务
# - 导入工作流：导入预置工作流模板
# - 配置MCP：配置MCP服务

# 3. 选择全量初始化
# 系统会自动：
# - 检测并安装Claude Code
# - 询问是否配置CCR（推荐选择是）
# - 引导配置API密钥或CCR路由
# - 导入常用工作流模板
```

---

## 五、资源索引

### 5.1 开源项目

#### Claude Code Router (CCR)

- **GitHub**: https://github.com/musistudio/claude-code-router
- **Stars**: 3.2k+
- **功能**: 智能路由，按任务类型自动切换不同模型
- **文档**: 项目README和Wiki

#### ZCF (Zero-Config Claude-Code Flow)

- **GitHub**: https://github.com/UfoMiao/zcf
- **Stars**: 1.8k+
- **功能**: 一键配置Claude Code和CCR环境
- **文档**: 项目README

#### NEWAPI

- **GitHub**: https://github.com/QuantumNous/new-api
- **功能**: AI模型聚合管理与分发系统
- **文档**: 项目README和Wiki

### 5.2 官方平台与文档

#### Anthropic (Claude Code)

- **官网**: https://www.anthropic.com
- **Claude Code文档**: https://docs.anthropic.com/en/docs/claude-code
- **API文档**: https://docs.anthropic.com/en/api/messages

#### DeepSeek

- **官网**: https://www.deepseek.com
- **API文档**: https://api-docs.deepseek.com
- **Anthropic兼容文档**: https://api-docs.deepseek.com/guides/anthropic_api
- **API端点**: https://api.deepseek.com/v1

#### 智谱AI (GLM)

- **官网**: https://www.zhipuai.cn
- **开放平台**: https://open.bigmodel.cn
- **API文档**: https://open.bigmodel.cn/dev/api
- **API端点**: https://open.bigmodel.cn/api/paas/v1

#### 月之暗面 (Kimi)

- **官网**: https://www.moonshot.cn
- **开放平台**: https://platform.moonshot.cn
- **API文档**: https://platform.moonshot.cn/docs
- **API端点**: https://api.moonshot.cn/v1

#### MiniMax

- **官网**: https://www.minimax.chat
- **开放平台**: https://platform.minimax.ai
- **API文档**: https://platform.minimax.ai/document
- **API端点**: https://api.minimax.ai/v1

#### 通义千问 (Qwen)

- **官网**: https://tongyi.aliyun.com
- **DashScope平台**: https://dashscope.aliyun.com
- **API文档**: https://help.aliyun.com/zh/dashscope
- **ModelScope**: https://www.modelscope.cn

#### OpenRouter

- **官网**: https://openrouter.ai
- **API文档**: https://openrouter.ai/docs
- **模型列表**: https://openrouter.ai/models
- **API端点**: https://openrouter.ai/api/v1

#### SiliconFlow (硅基流动)

- **官网**: https://siliconflow.cn
- **API文档**: https://siliconflow.cn/docs
- **定价页面**: https://siliconflow.cn/pricing
- **API端点**: https://api.siliconflow.cn/v1

#### IFlow

- **官网**: https://iflow.chat
- **API文档**: https://iflow.chat/docs
- **API端点**: https://api.iflow.chat/v1

#### ModelScope (魔搭社区)

- **官网**: https://www.modelscope.cn
- **文档**: https://modelscope.cn/docs
- **API文档**: https://help.aliyun.com/zh/dashscope
- **DashScope API**: https://dashscope.aliyun.com/api/v1

### 5.3 商业工具

#### Cursor

- **官网**: https://cursor.sh
- **文档**: https://docs.cursor.com
- **定价**: https://cursor.sh/pricing

#### Trae

- **官网**: https://trae.ai (海外版)
- **国内版**: 需通过国内渠道获取

#### Qoder

- **官网**: 公测中，需关注官方公告

#### Cline/RooCode

- **Cline GitHub**: https://github.com/approximatelabs/cline
- **RooCode**: VS Code插件市场搜索

#### OpenAI Codex

- **官网**: https://openai.com
- **ChatGPT Plus**: https://chat.openai.com
- **文档**: https://platform.openai.com/docs



