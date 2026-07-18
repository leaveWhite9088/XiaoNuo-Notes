# 🚀 实战教程4：使用 Xinference 本地部署 Reranker 

本教程将手把手教你如何利用 **Xinference** 在本地（Windows 环境）快速拉起重排序模型（Reranker），并将其接入 **RAGFlow**。Reranker 的引入能有效解决向量检索“搜得到但排不准”的问题，是提升 RAG 知识库准确率的灵魂组件。

## 🛠️ 前置准备

- **Docker Desktop**：用于运行 Xinference 容器。
- **PowerShell**：建议使用管理员权限运行。
- **物理机显卡**：建议 NVIDIA 显卡（已安装 CUDA 驱动）。
- **RAGFlow**：已部署好的本地或远程知识库系统。

## 步骤一：模型预下载与环境规整 (避开网络坑)

由于直接在 Docker 容器内下载模型极易断连，我们推荐在宿主机使用 **HF-Mirror** 镜像提前下载，并整理为 Xinference 规范路径。

1. **使用镜像站下载模型：**

   ```PowerShell
   # 设置镜像加速并下载 BAAI/bge-reranker-large
   $env:HF_ENDPOINT="https://hf-mirror.com"
   huggingface-cli download BAAI/bge-reranker-large --repo-type model --cache-dir E:\XinferenceModels\raw
   ```

2. **提取快照并重构目录（关键步骤）：**

   为了让容器挂载更稳定，我们将复杂的哈希路径提取到“直通目录”中。

   ```PowerShell
   # 1. 创建直通挂载目录
   mkdir E:\XinferenceModels\bge-reranker-large-direct
   
   # 2. 自动获取哈希目录名并复制文件
   $hashDir = (Get-ChildItem "E:\XinferenceModels\raw\models--BAAI--bge-reranker-large\snapshots")[0].Name
   Copy-Item "E:\XinferenceModels\raw\models--BAAI--bge-reranker-large\snapshots\$hashDir\*" "E:\XinferenceModels\bge-reranker-large-direct\" -Recurse
   ```

## 步骤二：部署 Xinference 容器服务

我们通过 Docker 挂载刚才准备好的模型目录，实现“即插即用”。

1. **拉取并启动实例：**

   ```PowerShell
   # 使用反引号 ` 进行换行书写
   docker run -d `
     -p 9997:9997 `
     --gpus all `
     --name xinference `
     -v E:\XinferenceModels\bge-reranker-large-direct:/root/.xinference/models/bge-reranker-large `
     xprobe/xinference:latest `
     xinference-local -H 0.0.0.0
   ```

   > 💡 **温馨提示**：后续重启只需执行 `docker start xinference` 即可。

## 步骤三：模型注册与引擎激活

模型文件挂载后，需要告诉 Xinference 如何“驱动”它。

### 方式 A：UI 界面操作

访问 `http://localhost:9997`，进入 **Register Model** 界面：

- **Model Name**: `bge-reranker-large`
- **Model Path**: `/root/.xinference/models/bge-reranker-large` (注意：这是容器内部路径)
- **Model Type**: 选择 `rerank`

### 方式 B：PowerShell 命令行一键激活

第一次在UI操作后，之后就可以直接在终端执行以下脚本，无需打开浏览器即可快速运行模型：

```PowerShell
$body = @{
    model_uid = "bge-reranker-large"
    model_name = "bge-reranker-large"
    model_type = "rerank"
    model_format = "pytorch"
    model_path = "/root/.xinference/models/bge-reranker-large"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9997/v1/models" -Method Post -Body $body -ContentType "application/json"
```

## 步骤四：在 RAGFlow 中接入 Reranker

最后一步是将 Xinference 提供的服务能力注入到 RAGFlow 引擎中。

1. **添加模型设置：**
   - **模型类型**：`Xinference`
   - **模型 UID**：`bge-reranker-large`
   - **API 地址**：`http://host.docker.internal:9997`
   - **最大令牌数 (Max Tokens)**：`512` (bge-reranker 建议值)

### ⚠️ 关键知识点：什么是 `host.docker.internal`？

> 在 RAGFlow（通常也是 Docker 运行）中配置 API 时，由于 Xinference 运行在宿主机的另一个容器或进程中，直接写 `localhost` 会指向 RAGFlow 容器自身导致连接失败。
>
> **`host.docker.internal`** 是 Docker 提供的特殊 DNS，它像一根“内联管道”，允许容器内部程序直接访问宿主机的网络服务。

## 🏆 最终调试与验证

1. **检查模型状态**：

   在 PowerShell 中运行以下命令，确认模型 `status` 为 `running`。

   ```PowerShell
   Invoke-RestMethod -Uri "http://localhost:9997/v1/models" | ConvertTo-Json -Depth 5
   ```

2. **测试检索增强**：

   在 RAGFlow 的测试对话中，观察日志。开启 Reranker 后，你会发现检索回来的 Chunk 经过了二次打分排序，原本排在后面的“高相关度”片段被提到了第一位，回答的准确性显著提升！
