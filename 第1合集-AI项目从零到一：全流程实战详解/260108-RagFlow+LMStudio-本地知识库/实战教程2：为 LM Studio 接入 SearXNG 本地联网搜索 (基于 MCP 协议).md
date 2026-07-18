# 🚀 实战教程2：为 LM Studio 接入 SearXNG 本地联网搜索 (基于 MCP 协议)

本教程将手把手教你如何通过 Model Context Protocol (MCP) 协议，将开源搜索引擎 SearXNG 接入 LM Studio，让你的本地大语言模型拥有实时的互联网搜索能力。

## 🛠️ 前置准备

1. **Docker Desktop**：用于本地运行 SearXNG 搜索引擎。
2. **Anaconda / Miniconda**：用于管理独立的 Python 环境。
3. **LM Studio**：支持 MCP 工具调用的本地大模型运行客户端。

## 步骤一：配置独立的 Python 运行环境

为了避免与系统中其他 Python 项目冲突，我们首先创建一个专属的 Conda 环境。

1. 打开 Anaconda Prompt 或终端。
2. 创建并激活名为 `lmstudio_env1` 的新环境，并安装必要的请求库（如 `requests`）： *(注：该环境路径后续会固定为* *`D:\Application\Anaconda\anaconda3\envs\lmstudio_env1\python.exe`**)*

## 步骤二：准备核心通信与自动化脚本

在你的工作目录（例如 `D:\Application\LMStudio\lmstdio-mcp`）下，我们需要创建三个核心文件，它们各自承担不同的职责：

1. **`searxng_mcp_standard.py`** **(MCP 服务端主程序)**

   1. **作用**：作为 LM Studio 和 SearXNG 之间的“翻译官”。它通过标准输入输出 (stdio) 接收 LM Studio 发来的 JSON-RPC 请求，将其转化为 SearXNG 的 API 请求，最后将搜索结果按 MCP 协议格式返回给大模型。

   2. 示例代码如下：

   3. ```Python
      import sys
      import os
      import json
      import requests
      import io
      from typing import Any, List, Optional
      
      # ================= 核心修复：Windows 编码防崩溃防弹衣 =================
      # 强制将标准输入、输出、错误流配置为 utf-8，遇到非法字符直接替换(replace)而不是崩溃
      sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8', errors='replace')
      sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
      sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
      # ======================================================================
      
      # 获取环境变量中的 SearXNG URL，默认为本地
      SEARXNG_URL = os.environ.get("SEARXNG_URL", "http://localhost:8081/search")
      
      
      def log(message: str):
          """辅助函数：将日志输出到 stderr，以免干扰 stdout 的 JSON-RPC 通信"""
          try:
              sys.stderr.write(f"[SearXNG-MCP] {message}\n")
              sys.stderr.flush()
          except Exception:
              pass  # 即使日志打印出错，也不允许影响主程序运行
      
      
      def search_searxng(query: str) -> str:
          """实际调用 SearXNG API 的函数"""
      
          # 彻底清洗大模型传过来的查询词，过滤掉会导致崩溃的孤立代理字符(Lone Surrogates)
          safe_query = query.encode('utf-16', 'surrogatepass').decode('utf-16', 'ignore')
      
          params = {
              "q": safe_query,
              "format": "json",
              "safesearch": 0  # 可根据需要修改
          }
      
          try:
              log(f"Searching: {safe_query} at {SEARXNG_URL}")
              response = requests.get(SEARXNG_URL, params=params)
              response.raise_for_status()
              data = response.json()
      
              results = data.get("results", [])
              if not results:
                  return "No results found."
      
              # 格式化前5条结果
              formatted_results = []
              for res in results[:5]:
                  title = res.get("title", "No Title")
                  url = res.get("url", "#")
                  content = res.get("content", "No content")
                  formatted_results.append(f"Title: {title}\nURL: {url}\nSummary: {content}\n")
      
              return "\n---\n".join(formatted_results)
          except Exception as e:
              return f"Error querying SearXNG: {str(e)}"
      
      def main():
          """主循环：处理来自 LM Studio 的 JSON-RPC 消息"""
          log("SearXNG MCP Server Started.")
          
          while True:
              try:
                  line = sys.stdin.readline()
                  if not line:
                      break
                  
                  request = json.loads(line)
                  
                  # 基础协议处理
                  if request.get("method") == "initialize":
                      response = {
                          "jsonrpc": "2.0",
                          "id": request["id"],
                          "result": {
                              "protocolVersion": "2024-11-05",
                              "capabilities": {
                                  "tools": {}
                              },
                              "serverInfo": {
                                  "name": "searxng-search",
                                  "version": "1.0.0"
                              }
                          }
                      }
                      print(json.dumps(response))
                      sys.stdout.flush()
                      
                  elif request.get("method") == "notifications/initialized":
                      # 收到初始化确认，不做任何操作
                      pass
                      
                  elif request.get("method") == "tools/list":
                      response = {
                          "jsonrpc": "2.0",
                          "id": request["id"],
                          "result": {
                              "tools": [{
                                  "name": "searxng_search",
                                  "description": "Search the internet for up-to-date information using SearXNG.",
                                  "inputSchema": {
                                      "type": "object",
                                      "properties": {
                                          "query": {
                                              "type": "string",
                                              "description": "The search query keywords"
                                          }
                                      },
                                      "required": ["query"]
                                  }
                              }]
                          }
                      }
                      print(json.dumps(response))
                      sys.stdout.flush()
                      
                  elif request.get("method") == "tools/call":
                      params = request.get("params", {})
                      tool_name = params.get("name")
                      args = params.get("arguments", {})
                      
                      if tool_name == "searxng_search":
                          query = args.get("query")
                          result_text = search_searxng(query)
                          
                          response = {
                              "jsonrpc": "2.0",
                              "id": request["id"],
                              "result": {
                                  "content": [{
                                      "type": "text",
                                      "text": result_text
                                  }]
                              }
                          }
                          print(json.dumps(response))
                          sys.stdout.flush()
                      else:
                          # 未知工具报错
                          error_response = {
                              "jsonrpc": "2.0",
                              "id": request["id"],
                              "error": {
                                  "code": -32601,
                                  "message": f"Tool not found: {tool_name}"
                              }
                          }
                          print(json.dumps(error_response))
                          sys.stdout.flush()
                  
                  else:
                      # 忽略不支持的方法，防止崩溃
                      pass
                      
              except json.JSONDecodeError:
                  continue
              except Exception as e:
                  log(f"Critical Error: {e}")
      
      if __name__ == "__main__":
          main()
      ```

2. **`verify_chain.py`** **(链路测试脚本)**

   1. **作用**：独立的诊断工具。用于在不打开 LM Studio 的情况下，模拟大模型发送 `initialize` 和 `tools/call` 请求，验证 SearXNG 是否联通以及数据返回是否正常。

   2. 示例代码如下：

   3. ```Python
      import subprocess
      import json
      import os
      import sys
      import time
      import requests
      
      # === 配置区域 ===
      PYTHON_EXE = r"D:/Application/Anaconda/anaconda3/envs/lmstudio_env1/python.exe"
      SCRIPT_PATH = r"D:/Application/LMStudio/lmstdio-mcp/searxng_mcp_standard.py"
      SEARXNG_API = "http://localhost:8081"
      # ================
      
      def print_color(text, color="green"):
          colors = {"green": "\033[92m", "red": "\033[91m", "yellow": "\033[93m", "reset": "\033[0m"}
          print(f"{colors.get(color, '')}{text}{colors['reset']}")
      
      def check_searxng_alive():
          print_color("\n[1/3] 正在检查 SearXNG 服务...", "yellow")
          try:
              resp = requests.get(SEARXNG_API, timeout=2)
              if resp.status_code == 200:
                  print_color(f"✅ SearXNG 在 {SEARXNG_API} 运行正常。", "green")
                  return True
              else:
                  print_color(f"❌ SearXNG 返回状态码: {resp.status_code}", "red")
                  return False
          except requests.exceptions.ConnectionError:
              print_color(f"❌ 无法连接到 {SEARXNG_API}。请检查Docker是否启动。", "red")
              return False
      
      def test_mcp_interaction():
          print_color("\n[2/3] 正在启动 MCP 服务器并测试通信...", "yellow")
          
          # 准备环境变量
          env = os.environ.copy()
          env["SEARXNG_URL"] = f"{SEARXNG_API}/search"
      
          # 启动子进程
          process = subprocess.Popen(
              [PYTHON_EXE, SCRIPT_PATH],
              stdin=subprocess.PIPE,
              stdout=subprocess.PIPE,
              stderr=sys.stderr, # 错误直接输出到控制台
              env=env,
              text=True,
              bufsize=0 # 无缓冲
          )
      
          try:
              # 1. 发送 Initialize
              print(" -> 发送 initialize 请求...")
              init_req = {
                  "jsonrpc": "2.0", "id": 1, "method": "initialize", 
                  "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "TestScript"}}
              }
              process.stdin.write(json.dumps(init_req) + "\n")
              process.stdin.flush()
              
              resp_line = process.stdout.readline()
              if not resp_line:
                  raise Exception("MCP Server 未返回任何数据")
              resp = json.loads(resp_line)
              print_color(f"   收到响应: {json.dumps(resp)[:60]}...", "green")
      
              # 2. 发送 Tools List
              print(" -> 请求工具列表 (tools/list)...")
              list_req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
              process.stdin.write(json.dumps(list_req) + "\n")
              process.stdin.flush()
              resp = json.loads(process.stdout.readline())
              tools = resp.get("result", {}).get("tools", [])
              print_color(f"✅ 成功获取工具列表: {[t['name'] for t in tools]}", "green")
      
              # 3. 发送实际搜索请求 (Tools Call)
              print(" -> 测试实际搜索 (query='Minecraft')...")
              call_req = {
                  "jsonrpc": "2.0", "id": 3, "method": "tools/call",
                  "params": {
                      "name": "searxng_search",
                      "arguments": {"query": "Minecraft"}
                  }
              }
              process.stdin.write(json.dumps(call_req) + "\n")
              process.stdin.flush()
              
              resp_line = process.stdout.readline()
              result = json.loads(resp_line)
              content = result.get("result", {}).get("content", [])[0].get("text", "")
              
              if len(content) > 20:
                  print_color(f"✅ [3/3] 搜索测试成功! 返回内容长度: {len(content)} 字符", "green")
                  print(f"   摘要: {content[:100].replace(chr(10), ' ')}...")
              else:
                  print_color("⚠️ 搜索返回内容为空或过短，请检查SearXNG连接。", "yellow")
      
          except Exception as e:
              print_color(f"❌ 测试失败: {str(e)}", "red")
          finally:
              process.kill()
      
      if __name__ == "__main__":
          if check_searxng_alive():
              test_mcp_interaction()
          else:
              print_color("\n由于 SearXNG 未运行，跳过 MCP 测试。", "red")
      ```

3. **`start_mcp_service.bat`** **(一键启动脚本)**

   1. **作用**：高度自动化的批处理文件。它会自动检查 Docker 状态、动态生成 `docker-compose.yaml` 文件、启动 SearXNG 容器，并循环检测端口健康状态，最后自动调用上述的 `verify_chain.py` 进行终检。

   2. 示例代码如下：

   3. ```Bash
      @echo off
      setlocal EnableDelayedExpansion
      
      :: ================= Configuration Area =================
      set PYTHON_EXE=D:\Application\Anaconda\anaconda3\envs\lmstudio_env1\python.exe
      set TEST_SCRIPT=D:\Application\LMStudio\lmstdio-mcp\verify_chain.py
      set SEARXNG_URL=http://localhost:8081
      :: ======================================================
      
      title LM Studio MCP Launcher (Auto-Compose)
      color 0A
      
      echo ========================================================
      echo        LM Studio MCP 1-Click Startup Script
      echo ========================================================
      echo.
      
      :: Generate docker-compose.yaml
      if not exist "docker-compose.yaml" (
          echo [INFO] Generating docker-compose.yaml...
          (
              echo services:
              echo   searxng:
              echo     container_name: searxng
              echo     image: searxng/searxng:latest
              echo     ports:
              echo       - "8081:8080"
              echo     volumes:
              echo       - ./searxng-data:/etc/searxng
              echo     environment:
              echo       - SEARXNG_BASE_URL=http://localhost:8081/
              echo       - METHOD=GET
              echo     cap_drop:
              echo       - ALL
              echo     cap_add:
              echo       - CHOWN
              echo       - SETGID
              echo       - SETUID
              echo     logging:
              echo       driver: "json-file"
              echo       options:
              echo         max-size: "1m"
              echo         max-file: "1"
          ) > docker-compose.yaml
          echo [OK] docker-compose.yaml generated.
      ) else (
          echo [INFO] Existing docker-compose.yaml detected.
      )
      
      echo.
      echo [INFO] Checking Docker status...
      docker info >nul 2>&1
      if %errorlevel% equ 0 (
          echo [OK] Docker is running.
          goto DOCKER_READY
      )
      
      echo [WARNING] Docker is not running! Attempting to start...
      if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
          start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
          echo [INFO] Starting Docker, please wait 30-60 seconds...
      ) else (
          echo [ERROR] Could not find Docker Desktop. Please start manually.
          pause
          exit /b
      )
      
      :WAIT_DOCKER
      timeout /t 5 /nobreak >nul
      docker info >nul 2>&1
      if %errorlevel% neq 0 (
          echo ...Waiting for Docker...
          goto WAIT_DOCKER
      )
      echo [OK] Docker started successfully!
      
      :DOCKER_READY
      echo.
      echo [INFO] Starting SearXNG via Docker Compose...
      echo --------------------------------------------
      docker compose up -d
      echo --------------------------------------------
      
      if %errorlevel% neq 0 (
          echo [ERROR] Docker Compose failed to start.
          pause
          exit /b
      )
      
      echo.
      echo [INFO] Waiting for SearXNG service (port 8081)...
      set /a retries=0
      
      :CHECK_PORT
      timeout /t 2 /nobreak >nul
      curl -s -I %SEARXNG_URL% >nul
      if %errorlevel% equ 0 (
          echo [OK] SearXNG service is ready!
          goto RUN_TEST
      )
      
      set /a retries+=1
      if %retries% geq 30 (
          echo [ERROR] Timeout waiting for service to initialize.
          echo Please manually run command in terminal: docker logs searxng
          pause
          exit /b
      )
      echo ...Service initializing (%retries%/30)...
      goto CHECK_PORT
      
      :RUN_TEST
      echo.
      echo [INFO] Starting MCP chain test...
      echo --------------------------------------------
      if exist "%TEST_SCRIPT%" (
          "%PYTHON_EXE%" "%TEST_SCRIPT%"
      ) else (
          echo [ERROR] Test script not found: %TEST_SCRIPT%
      )
      echo --------------------------------------------
      
      echo.
      echo [SUCCESS] All steps completed!
      pause
      ```

## 步骤三：初次启动与生成容器挂载目录

执行一键启动脚本，完成底层服务的初始化。

1. 在终端中运行 `start_mcp_service.bat`。
2. 脚本会自动拉取 SearXNG 镜像并启动容器。
3. **关键点**：由于我们在脚本中配置了 Docker Volume 映射 (`./searxng-data:/etc/searxng`)，容器启动后，当前目录下会自动生成一个 `searxng-data` 文件夹。这里面存放了 SearXNG 的核心配置文件。

## 步骤四：解除 SearXNG 的 API 访问限制 (关键踩坑点)

默认情况下，SearXNG 出于安全考虑，只允许浏览器访问 HTML 页面，禁止第三方程序通过 API 获取 JSON 数据。我们需要手动开放此权限，否则大模型会收到 `403 Forbidden` 报错。

1. 进入刚刚生成的 `searxng-data` 文件夹。
2. 用文本编辑器打开 `settings.yml`。
3. 找到 `search:` 节点下的 `formats:` 列表，在 `html` 下方添加一行 `- json`：

```YAML
search:
    # ... 其他配置 ...
    formats:
        - html
        - json  # 必须添加此行，允许 JSON 格式输出
```

1. 保存文件，并在终端执行 `docker restart searxng` 重启容器使配置生效。
2. 再次运行测试脚本 `verify_chain.py`，此时终端应提示“搜索测试成功”，并成功拉取到真实网页的摘要内容。

## 步骤五：在 LM Studio 中注册 MCP 服务

底层接口全部打通后，最后一步是告诉 LM Studio 这个新工具的存在。

1. 找到 LM Studio 的 MCP 全局配置文件，路径通常为：`C:\Users\你的用户名\.lmstudio\mcp.json`。
2. 将我们写好的 Python 环境路径和 MCP 服务端程序路径注册进去：

```JSON
{
  "mcpServers": {
    "searxng-search": {
      "command": "D:/Application/Anaconda/anaconda3/envs/lmstudio_env1/python.exe",
      "args": [
        "D:/Application/LMStudio/lmstdio-mcp/searxng_mcp_standard.py"
      ],
      "env": {
        "SEARXNG_URL": "http://localhost:8081/search"
      }
    }
  }
}
```

1. 保存该文件并重启 LM Studio。

## 步骤六：在 LM Studio 中激活 MCP 全局配置

虽然我们编写了 `mcp.json`，但 LM Studio 默认出于安全考虑，并不会自动加载它。你需要手动打开这个权限开关。

1. 确保你的 LM Studio 版本在 **0.4.0** 或以上。
2. 进入 chat 界面，打开 mcp 工具选项

![img](https://zcngo0ja955v.feishu.cn/space/api/box/stream/download/asynccode/?code=ODMzNWI2NTBkNTVkOGVhMzA4ODU2YzIxNDUxMWUyZDRfODRzZ1lvYkxWRjEyZFpuR3RoZEJZQnR3a1EzZXk4VDdfVG9rZW46TVZqRWJHak9Ib0FSd2N4Y0toemNVQ2tjbjBiXzE3NzM5MTI1MTQ6MTc3MzkxNjExNF9WNA)

## 步骤七：模型选择与“工具调用幻觉”避坑指南 (高频踩坑点)

在 LM Studio 中接入 MCP 工具后，很多人会发现模型**不调用工具**、**胡编乱造搜索结果**，或者**输出无法识别的 XML 标签**（如 `<tool_call>`）。这并非代码写错了，而是因为所选的大语言模型不支持标准的 Function Calling（工具调用）格式。

- **避坑 1（拒绝小模型）**：像 `deepseek-r1-distill-qwen-1.5b` 这类参数量极小（1.5B）的模型，指令遵循能力较弱。它们往往会“脑补”自己调用了工具并强行输出一个假结果（工具幻觉），无法输出严格规范的 JSON 调用请求。
- **避坑 2（拒绝非标准输出）**：某些模型（如部分版本的 Hunyuan-4b）虽然逻辑正确，但会使用私有的 XML 标签格式包裹工具请求。而 LM Studio 的底层引擎目前只识别标准的 JSON 格式，导致拦截失败。
- **✅ 推荐解决方案**：请务必下载并使用原生对 Function Calling 支持极佳、且格式标准的 7B 以上开源模型。**强烈推荐使用：****`Qwen2.5-7B-Instruct`** **或** **`Llama-3.1-8B-Instruct`**。（注：必须带有 `Instruct` 标识的指令微调版本）。

## 步骤八：选择国内的搜索引擎（可选项）

目前为止，如果要联网搜索，必须要打开VPN，因为 SearXNG 默认用的是 Google 等国外的搜索引擎，如果想不用 VPN 就进行搜索的话，需要进行换源

- 更改 searxng-data 目录下的 settings.yml 文件为如下内容：

```YAML
# 1. 继承系统底层的默认配置
use_default_settings: true

# 2. 启动必备的核心参数
server:
  secret_key: "lmstudio_mcp_super_secret_key_2026"
  port: 8080
  bind_address: "0.0.0.0"

# 3. 搜索格式与语言设置
search:
  default_lang: "zh-CN"
  formats:
    - html
    - json

# 4. 国内搜索引擎换源
engines:
  - name: baidu
    engine: baidu
    shortcut: bd
    disabled: false

  - name: bing
    engine: bing
    shortcut: bi
    disabled: false

  - name: bilibili
    engine: bilibili
    shortcut: bili
    disabled: false

  - name: google
    engine: google
    disabled: true

  - name: duckduckgo
    engine: duckduckgo
    disabled: true

  - name: wikipedia
    engine: wikipedia
    disabled: true

  - name: wikidata
    engine: wikidata
    disabled: true

  - name: startpage
    engine: startpage
    disabled: true

  - name: brave
    engine: brave
    disabled: true
```

或者引擎增强版本：

```YAML
# 1. 继承系统底层的默认配置
use_default_settings: true

# 2. 启动必备的核心参数
server:
  secret_key: "lmstudio_mcp_super_secret_key_2026"
  port: 8080
  bind_address: "0.0.0.0"

# 3. 搜索格式与语言设置
search:
  default_lang: "zh-CN"
  formats:
    - html
    - json
   
# 4. 强化引擎
engines:
  # 第一梯队：核心国内权威新闻与财经源 (最高权重，精准时事)
  - name: xinhuanet # 新华社
    weight: 10
    disabled: false
  - name: people # 人民日报
    weight: 10
    disabled: false
  - name: thepaper # 澎湃新闻（深度调查/时事）
    weight: 9
    disabled: false
  - name: guancha # 观察者网（国际视角的国内媒体）
    weight: 8
    disabled: false
  - name: caixin # 财新网（核心财经）
    weight: 9
    disabled: false

  # 第二梯队：您原有且保留的通用引擎 (降权，作为补充)
  - name: baidu
    engine: baidu
    shortcut: bd
    weight: 3 # 降权，因其结果商业化程度高
    disabled: false
  - name: bing
    engine: bing
    shortcut: bi
    weight: 4 # 降权，作为国际信息的有限国内窗口
    disabled: false
  - name: bilibili
    engine: bilibili
    shortcut: bili
    weight: 5 # 保留原权重，覆盖视频、科普、社区热点
    disabled: false

  # 第三梯队：国内社交媒体与垂类平台 (用于捕捉热点与行业动态)
  - name: weibo # 微博（实时热搜、公众舆论）
    weight: 7
    disabled: false
  - name: xhs # 小红书（消费趋势、生活方式、评测）
    weight: 6
    disabled: false
  - name: zhihu # 知乎（深度讨论、行业见解）
    weight: 6
    disabled: false
  - name: toutiao # 今日头条（聚合新闻、地方资讯）
    weight: 5
    disabled: false

# 禁用列表：明确关闭所有无关的、或您已禁用的国际/通用引擎
disabled_engines:
  - google
  - duckduckgo
  - wikipedia
  - wikidata
  - startpage
  - brave
  # 以下为建议新增的禁用项，以防默认启用造成干扰
  - google_images
  - bing_images
  - yandex
  - youtube
  - reddit
  - stackoverflow
  - github
```

## 🎉 最终联调测试

1. 在 LM Studio 聊天界面，加载 **Qwen2.5-7B-Instruct**（或其他推荐的模型）。
2. 在右侧边栏的 **Tools / Plugins** 选项卡中，确认我们的 searxng_search 工具已经出现并且处于勾选/高亮状态。
3. 在 System Prompt（系统提示词）中可以视情况加上一句提醒：*“当你需要搜索互联网时，请直接输出标准 JSON 格式调用 searxng_search工具。”*
4. 在对话框中发送一个需要实时联网的问题（例如：“帮我搜索一下B站UP主‘圣徒城的小诺’并做个介绍”）。

![img](https://zcngo0ja955v.feishu.cn/space/api/box/stream/download/asynccode/?code=OTU1ZjI1ODFkNjJiN2Y1MThlYTE4MzlhMWJlZGEzODBfQ05IUWxPZ1pwYWFTUFZpZHJVbWw0YTJYZUxZYUdTZVlfVG9rZW46SHU4MWJEWTlvb0hlVXF4cjM1dGNlZmkwbnliXzE3NzM5MTI1MTQ6MTc3MzkxNjExNF9WNA)