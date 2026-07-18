# 🚀 实战教程5：解决 RAGFlow 沙箱执行器在 Windows 环境下的兼容性问题

在 Windows (Docker Desktop/WSL2) 环境下部署 RAGFlow 时，你可能会发现 **Python 插件** 或 **代码执行** 功能无法使用。这通常是因为官方沙箱镜像硬编码了 Linux 特有的安全内核，导致在 Windows 上“水土不服”。

## 症状诊断：你是否遇到了这些坑？

打开终端，运行 `docker logs -f sandbox-executor-manager`，如果看到以下内容，说明你必须进行修复：

- **报错 A**：`unknown or invalid runtime name: runsc`（找不到 gVisor 运行时）。
- **报错 B**：`Container pool initialization complete: 0/20 available`（容器池初始化为空）。
- **报错 C**：执行任务时频繁出现 `Command timed out`。

## 核心避坑原理

**为什么会失败？**

1. **gVisor 依赖**：官方镜像默认强制启用 `--runtime=runsc`，而 Windows 环境下通常没有安装这个安全运行时。
2. **I/O 性能瓶颈**：Windows 文件系统与 Docker 之间的通信损耗，导致默认的 **30秒** 启动超时在拉取子镜像时极易崩掉。

**解决策略**：采用 **“文件挂载覆盖 (Mount Patch)”**。不重新构建镜像，而是通过 `docker-compose` 将修改后的核心脚本“打补丁”进运行中的容器。

## 详细操作步骤

### 第一步：提取核心代码文件

我们需要从“生病”的镜像中把负责容器管理的 `container.py` 提取出来修改。

```PowerShell
# 1. 启动一个临时容器
docker run -d --name temp-fix infiniflow/sandbox-executor-manager:latest tail -f /dev/null

# 2. 将代码复制到宿主机当前目录
docker cp temp-fix:/app/core/container.py ./container.py

# 3. 卸磨杀驴，删除临时容器
docker rm -f temp-fix
```

### 第二步：修改 container.py

使用 VS Code 或 Notepad++ 打开 `container.py`，完成以下两处关键手术：

- **切除 runsc 参数** 搜索 `cmd = [`，找到构建 `docker run` 命令的地方，直接**删除**包含 `--runtime=runsc` 的那一行。

  ```Python
  # 修改后示例
  cmd = [
      "docker", "run",
      "-d",
      "--name", self.container_name, # runtime 这一行已经消失
      # ... 其他参数保持不动
  ]
  ```

- **延长寿命 (超时设置)** 搜索 `timeout`，将默认的 `30` 改为 `300`。

  ```Python
  timeout = 300  # 给 Windows 留出充足的预热时间
  ```

### 第三步：手动预拉取依赖镜像

为了防止沙箱启动时“现上轿现扎耳朵”，我们提前把子容器镜像拉下来：

```PowerShell
docker pull infiniflow/sandbox-base-python:latest
docker pull infiniflow/sandbox-base-nodejs:latest
```

### 第四步：配置 Docker Compose 挂载补丁

修改你的 `docker-compose.yml`，在 `sandbox-executor-manager` 服务下添加挂载路径：

```YAML
services:
  sandbox-executor-manager:
    image: infiniflow/sandbox-executor-manager:latest
    # ... 其他配置 ...
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./container.py:/app/core/container.py  # <--- 这就是我们的“补丁”
```

## 激活与验证

执行强制重建命令，让补丁生效：

```PowerShell
docker-compose up -d --force-recreate sandbox-executor-manager
```

**验证成功标志：** 再次查看日志 `docker logs -f sandbox-executor-manager`，看到以下输出即代表大功告成：

> ```
> INFO: 📊 Container pool initialization complete: 20/20 available
> ```

## ⚠️ 长期维护建议

1. **补丁文件不可删**：宿主机目录下的 `container.py` 是容器运行的灵魂，误删会导致容器启动失败。
2. **版本迭代注意**：如果 RAGFlow 进行了大版本更新，建议重复“第一步”提取新版代码重新修改，防止代码逻辑断层。