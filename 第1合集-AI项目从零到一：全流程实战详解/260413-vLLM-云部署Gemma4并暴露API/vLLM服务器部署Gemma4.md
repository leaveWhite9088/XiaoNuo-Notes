# vLLM部署多模态开源大模型Gemma4

vLLM官方文档:https://docs.vllm.com.cn/en/latest/https://docs.vllm.com.cn/en/latest/

vLLM开源项目https://github.com/vllm-project/vllm

vLLM Gemma4 文档https://docs.vllm.ai/projects/recipes/en/latest/Google/Gemma4.html

[Gemma 4](https://ai.google.dev/gemma/docs)是谷歌功能最强大的开放模型系列，采用统一的多模态架构，可原生处理文本、图像和音频。Gemma 4 模型支持多种高级功能，包括结构化思维/推理、使用自定义工具使用协议进行函数调用以及动态视觉分辨率——所有这些都可通过 vLLM 的 OpenAI 兼容 API 实现。

##  1.在 AutoDL等算力平台 租服务器

![image-20260408113526520](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408113526581.png)

**整体演示使用我们正常生活中能接近的最好的显卡RTX5090 32G显存的来演示vLLM部署Gemma4，过大的显卡实际上没有太大的参考价值，不太实际**

![image-20260408112701284](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408112706803.png)

​	配置选择单卡RTX 5090 ，数据盘正常情况下是不需要扩容，免费的数据盘足以塞下开源模型，镜像选择vllm稳定的 `PyTorch 2.8.0+Cuda 12.8`（默认选最新的没毛病），选择完毕后即可创建并开机。

![image-20260408112742496](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408112742572.png)

​	开机成功后，我们在控制台的容器实例中即可找到我们租用的服务器，后续我们通过ssh登陆远程访问服务器。

![image-20260408113112714](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408113112768.png)

##  2. 本地远程连接服务器（SSH / VSCode）

### 2.1. 在vscode/cursor等编辑器的拓展中搜索Remote-SSH远程连接工具

![image-20260329120736125](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329120736125.png)

### 2.2 通过Remote-SSH连接远程服务器

![image-20260329121114575](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329121114575.png)

![image-20260329121302541](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329121302541.png)

​	将autodl平台的登陆指令复制到输入行，进行远程连接服务器

![image-20260329121650418](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329121650418.png)

​	接下来将密码也输入到输入框中即可在本地成功连接到服务器

![image-20260329121930231](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329121930231.png)

​	成功连接到服务器，终端已经切换为远程的服务器终端，现在我们已完成了第一步，成功能够在本地控制我们的服务器。

![image-20260329122142396](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/image-20260329122142396.png)

## 3. 在 AutoDL 部署 vLLM（坑多）



在成功连接了远程服务器后，我们就需要在远程服务器中部署vLLM，众所周知**配置环境**是最让人恼火的，尤其是Gemma4还是比较新的模型，vLLM官方也是非常直白的给出了`https://wheels.vllm.ai/nightly/cu129` **nightly版本**（Nightly版本是指每天自动从项目最新的源代码编译生成的**测试版**），并且可以看到，使用的cuda版本是**cuda12.9**，我们刚才创建**镜像**可以看到最新的就只是**cuda12.8**,所以我们需要自己配置cuda12.9，来使用vLLM来部署Gemma4；

官方给出的安装命令

```python
uv venv
source .venv/bin/activate
uv pip install -U vllm --pre \
  --extra-index-url https://wheels.vllm.ai/nightly/cu129 \
  --extra-index-url https://download.pytorch.org/whl/cu129 \
  --index-strategy unsafe-best-match
uv pip install transformers==5.5.0
```



首次进行配置服务器比较麻烦其中遇到很多的小坑，第一次部署服务器的同学可能没有经验，主播把大坑都踩了一遍，总结出了下面的命令，大家按照顺序依次执行，如果还有小问题的话就问AI解决，基本上就没问题。

```python
# 1) 先看哪个盘是数据盘，模型是比较大的，不配置切换到数据盘，系统盘会爆的
df -h

# 2) 准备数据盘目录
mkdir -p /root/autodl-tmp/{tmp,pip-cache,hf-cache,venvs}

# 3) 把临时目录/缓存都切到数据盘，防止服务数据盘爆，浪费时间下载
export TMPDIR=/root/autodl-tmp/tmp
export PIP_CACHE_DIR=/root/autodl-tmp/pip-cache
export HF_HOME=/root/autodl-tmp/hf-cache
export HUGGINGFACE_HUB_CACHE=/root/autodl-tmp/hf-cache/hub
export TRANSFORMERS_CACHE=/root/autodl-tmp/hf-cache/transformers #从huggingface下载模型

#4）持久化环境变量，防止切换终端后继续下载到系统盘
cat >> ~/.bashrc <<'EOF'
export HF_HOME=/root/autodl-tmp/hf-cache
export HUGGINGFACE_HUB_CACHE=/root/autodl-tmp/hf-cache/hub
export TRANSFORMERS_CACHE=/root/autodl-tmp/hf-cache/transformers
EOF
source ~/.bashrc

# 4) 新建 venv 配置为cuda12.9 到数据盘
mkdir ~/Gemma4
cd ~/Gemma4
python3 -m venv /root/autodl-tmp/venvs/gemma4-cu129 #在数据盘中配置cuda 12.9
ln -s /root/autodl-tmp/venvs/gemma4-cu129 .venv #在当前目录下创建一个名为 .venv 的快捷方式，它指
source .venv/bin/activate #激活环境

# 5) 在环境中安装Gemma4所需的cuda 12.9
pip install -U pip
# 关键：cu129 不用 download.pytorch.org，改用阿里镜像，要不然非常的慢，不是无卡开机的话真的很烧钱和时间
pip install -U torch torchvision torchaudio \
  --find-links https://mirrors.aliyun.com/pytorch-wheels/cu129 \
  -i https://pypi.tuna.tsinghua.edu.cn/simple

#安装后验证：

python -c "import torch;print(torch.__version__, torch.version.cuda)"

#显示cuda 12.9的话就可以了

# 6) 继续在这个环境里装 vLLM + Gemma4 依赖
python -m pip install -U uv -i https://pypi.tuna.tsinghua.edu.cn/simple

export UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple #一定要使用清华源，要不超级超级慢，非常的恶心

uv pip install -U --pre vllm \
  --extra-index-url https://wheels.vllm.ai/nightly/cu129 \
  --extra-index-url https://download.pytorch.org/whl/cu129 \
  --index-strategy unsafe-best-match
uv pip install -U transformers==5.5.0

#到这里基本上基础环境就配完了，下面我们需要来进行vLLM部署Gemma4的配置
```

Cuda12.9，使用阿里源加速，前后对比从51.7kb 到几十MB/s

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260405204805139.png" alt="image-20260405204804231" style="zoom: 50%;" />

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260405205946668.png" alt="image-20260405205945962" style="zoom: 50%;" />

安装vLLMing，记得要开清华源，否则跟我这个图一样慢

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408134330195.png" alt="image-20260408134329553" style="zoom:50%;" />



### 3.1**在根目录里/root/Gemma4中创建启动vLLM所需的脚本**

#### 3.1.1.创建**.env.vllm**文件

**定义vLLM需要部署的开源模型信息以及对应的VLLM_URL和VLLM_API_KEY等配置信息**

```python
# ============================================================
# Gemma4 vLLM 环境模板（演示版）
# 单一固定档位：full_featured
# ============================================================

# ----------------------
# 1) 模型标识
# ----------------------
# 实际加载的模型
MODEL_NAME=google/gemma-4-E4B-it
# 对外服务模型名（后端 VLLM_MODEL 需要和它一致）
SERVED_MODEL_NAME=gemma4-e4b-it

# ----------------------
# 2) 服务端口
# ----------------------
HOST=0.0.0.0
PORT=6008
API_KEY=EXiaonuojiangai

# ----------------------
# 3) 官方 full-featured 关键参数
# ----------------------

MAX_MODEL_LEN=32768
GPU_MEMORY_UTILIZATION=0.95
LIMIT_MM_PER_PROMPT='{"image":4,"audio":1}'
ENABLE_ASYNC_SCHEDULING=1
ENABLE_REASONING=1
ENABLE_TOOL_CALLING=1

# ----------------------
# 4) 项目吞吐参数
# ----------------------
MAX_NUM_SEQS=2
MAX_NUM_BATCHED_TOKENS=65536
GENERATION_CONFIG=vllm

# ----------------------
# 5) 可选参数
# ----------------------
# CPU 线程数（必须是正整数）。若不填，脚本默认使用 8。
# OMP_NUM_THREADS=8
# 多卡时填写，例如 2 / 4，单卡留空
TENSOR_PARALLEL_SIZE=
# 视觉处理参数（JSON 字符串），例如 {"max_soft_tokens":560}
MM_PROCESSOR_KWARGS=
# 压测一致性场景可置 1（关闭 prefix cache）
DISABLE_PREFIX_CACHING=0

#脚本固定 full_featured，可不改
DEPLOY_PROFILE=full_featured


```

#### 3.1.2.创建脚本文件start_vllm.sh

**一键运行vLLM**

```python
#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Gemma4 vLLM 启动脚本（演示版 / 单一档位）
#
# 设计原则：
# 1) 对齐 vLLM 官方 Gemma4 full-featured 配置能力集合
# 2) 只保留一个固定档位：full_featured（不再做多档位分支）
# 3) 参数尽量少且可解释，便于现场演示
#
# 官方参考：
# https://docs.vllm.ai/projects/recipes/en/latest/Google/Gemma4.html
# ============================================================

if ! command -v vllm >/dev/null 2>&1; then
  echo "[ERROR] 未找到 vllm 命令，请先安装：pip install vllm"
  exit 1
fi

# ----------------------
# 0) 线程环境变量兜底
# ----------------------
# 你日志中的报错：
# - libgomp: Invalid value for environment variable OMP_NUM_THREADS
# - RuntimeError: set_num_threads expects a positive integer
# 通常由 OMP_NUM_THREADS 被设置为非法值（空、0、非数字）导致。
if [[ -n "${OMP_NUM_THREADS:-}" && ! "${OMP_NUM_THREADS}" =~ ^[1-9][0-9]*$ ]]; then
  echo "[WARN] 检测到非法 OMP_NUM_THREADS='${OMP_NUM_THREADS}'，自动改为 8"
  export OMP_NUM_THREADS=8
fi
# 若未设置，则给一个稳妥默认值，避免 vLLM/torch 在某些环境推导出 0
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-8}"

# ----------------------
# 1) 模型与服务标识
# ----------------------
# 实际加载的模型 ID
MODEL_NAME=${MODEL_NAME:-google/gemma-4-E4B-it}
# 对外暴露给 OpenAI-compatible /v1/models 的模型名
SERVED_MODEL_NAME=${SERVED_MODEL_NAME:-gemma4-e4b-it}

# ----------------------
# 2) 服务监听信息
# ----------------------
# 你当前服务器使用 6008，这里保持一致
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-6008}
API_KEY=${API_KEY:-EMPTY}

# ----------------------
# 3) 官方 full-featured 关键参数
# ----------------------
# 上下文长度（官方示例常见值）
MAX_MODEL_LEN=${MAX_MODEL_LEN:-32768}
# 显存利用率，演示优先稳定默认 0.90（可按机器上调）
GPU_MEMORY_UTILIZATION=${GPU_MEMORY_UTILIZATION:-0.95}
# 多模态预算：当前 vLLM 版本通常要求 JSON（推荐）
LIMIT_MM_PER_PROMPT=${LIMIT_MM_PER_PROMPT:-'{"image":4,"audio":1}'}
# 官方 full-featured 包含异步调度
ENABLE_ASYNC_SCHEDULING=${ENABLE_ASYNC_SCHEDULING:-1}
# 官方 Gemma4 推理 / 工具调用解析器
ENABLE_REASONING=${ENABLE_REASONING:-1}
ENABLE_TOOL_CALLING=${ENABLE_TOOL_CALLING:-1}

# ----------------------
# 4) 项目侧吞吐参数（便于压测/演示）
# ----------------------
MAX_NUM_SEQS=${MAX_NUM_SEQS:-2}
MAX_NUM_BATCHED_TOKENS=${MAX_NUM_BATCHED_TOKENS:-65536}
GENERATION_CONFIG=${GENERATION_CONFIG:-vllm}

# ----------------------
# 5) 可选参数（默认关闭/留空）
# ----------------------
# 多卡时再设置，例如 2 / 4
TENSOR_PARALLEL_SIZE=${TENSOR_PARALLEL_SIZE:-}
# 动态视觉参数（JSON 字符串），例如 {"max_soft_tokens":560}
MM_PROCESSOR_KWARGS=${MM_PROCESSOR_KWARGS:-}
# 压测一致性场景可手动关闭 prefix cache
DISABLE_PREFIX_CACHING=${DISABLE_PREFIX_CACHING:-0}

# 兼容旧环境变量：保留但不参与分支
DEPLOY_PROFILE=${DEPLOY_PROFILE:-full_featured}

# 避免 source 共享 env 时，误带 backend 变量影响当前脚本
unset VLLM_BASE_URL VLLM_MODEL LLM_PROVIDER VLLM_API_KEY

trim_spaces() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

# 兼容两种 LIMIT_MM_PER_PROMPT 输入：
# 1) JSON: {"image":4,"audio":1}
# 2) 旧写法: image=4,audio=1
normalize_limit_mm_per_prompt() {
  local raw work key value pair
  local items=()
  raw="$(trim_spaces "$1")"

  if [[ -z "$raw" ]]; then
    echo ""
    return 0
  fi

  if [[ "$raw" == \{* && "$raw" == *\} ]]; then
    echo "$raw"
    return 0
  fi

  IFS=',' read -ra pairs <<< "$raw"
  for pair in "${pairs[@]}"; do
    pair="$(trim_spaces "$pair")"
    [[ -z "$pair" ]] && continue
    if [[ "$pair" != *"="* ]]; then
      echo "[ERROR] LIMIT_MM_PER_PROMPT 非法：$raw" >&2
      echo "[ERROR] 请使用 JSON（推荐）或旧写法 image=4,audio=1" >&2
      exit 1
    fi
    key="$(trim_spaces "${pair%%=*}")"
    value="$(trim_spaces "${pair#*=}")"
    if [[ ! "$key" =~ ^[a-zA-Z0-9_]+$ || ! "$value" =~ ^[0-9]+$ ]]; then
      echo "[ERROR] LIMIT_MM_PER_PROMPT 非法项：$pair" >&2
      exit 1
    fi
    items+=("\"$key\":$value")
  done

  if [[ ${#items[@]} -eq 0 ]]; then
    echo "[ERROR] LIMIT_MM_PER_PROMPT 为空：$raw" >&2
    exit 1
  fi

  work="{${items[*]}}"
  work="${work// /,}"
  echo "$work"
}

LIMIT_MM_PER_PROMPT="$(normalize_limit_mm_per_prompt "$LIMIT_MM_PER_PROMPT")"

CMD=(
  vllm serve "$MODEL_NAME"
  --host "$HOST"
  --port "$PORT"
  --api-key "$API_KEY"
  --served-model-name "$SERVED_MODEL_NAME"
  --max-model-len "$MAX_MODEL_LEN"
  --gpu-memory-utilization "$GPU_MEMORY_UTILIZATION"
  --limit-mm-per-prompt "$LIMIT_MM_PER_PROMPT"
  --max-num-seqs "$MAX_NUM_SEQS"
  --max-num-batched-tokens "$MAX_NUM_BATCHED_TOKENS"
  --generation-config "$GENERATION_CONFIG"
  # 项目需要结构化输出能力（response_format=json_schema）
  --structured-outputs-config '{"backend":"xgrammar"}'
  --dtype auto
)

# 官方 full-featured 推荐开启
if [[ "$ENABLE_ASYNC_SCHEDULING" == "1" ]]; then
  CMD+=(--async-scheduling)
fi

# 压测场景可选
if [[ "$DISABLE_PREFIX_CACHING" == "1" ]]; then
  CMD+=(--no-enable-prefix-caching)
fi

# Gemma4 thinking
if [[ "$ENABLE_REASONING" == "1" ]]; then
  CMD+=(--reasoning-parser gemma4)
fi

# Gemma4 tool calling
if [[ "$ENABLE_TOOL_CALLING" == "1" ]]; then
  CMD+=(--enable-auto-tool-choice --tool-call-parser gemma4)
fi

# 多卡可选
if [[ -n "$TENSOR_PARALLEL_SIZE" ]]; then
  CMD+=(--tensor-parallel-size "$TENSOR_PARALLEL_SIZE")
fi

# 动态视觉可选
if [[ -n "$MM_PROCESSOR_KWARGS" ]]; then
  CMD+=(--mm-processor-kwargs "$MM_PROCESSOR_KWARGS")
fi

echo "[INFO] 启动模式: full_featured (官方能力集合)"
echo "[INFO] MODEL_NAME=$MODEL_NAME"
echo "[INFO] SERVED_MODEL_NAME=$SERVED_MODEL_NAME"
echo "[INFO] ENDPOINT=$HOST:$PORT"
echo "[INFO] MAX_MODEL_LEN=$MAX_MODEL_LEN GPU_MEMORY_UTILIZATION=$GPU_MEMORY_UTILIZATION"
echo "[INFO] LIMIT_MM_PER_PROMPT=$LIMIT_MM_PER_PROMPT"
echo "[INFO] ASYNC=$ENABLE_ASYNC_SCHEDULING REASONING=$ENABLE_REASONING TOOL_CALLING=$ENABLE_TOOL_CALLING"
echo "[INFO] MAX_NUM_SEQS=$MAX_NUM_SEQS MAX_NUM_BATCHED_TOKENS=$MAX_NUM_BATCHED_TOKENS"

exec "${CMD[@]}" "$@"

```

### 3.2.**启动 vLLM 服务**

```python
source .venv/bin/activate #新开终端后，先激活我们的环境

set -a && source .env.vllm  && set +a #应用环境变量

source /etc/network_turbo #开启autodl平台自带的加速，因为vLLM会自动从huggingface下载开源模型，所以需要加速或者使用国产镜像源/或者自己手动下载

bash start_vllm.sh
```

![image-20260408133325868](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408133326706.png)

​	当出现了Starting vLLM server 时，就代表我们在服务器通过vLLM部署Gemma4模型成功了，但是我们希望本地能够访问我们部署的vllm大模型，所以我们接下来需要在本地的后端配置vLLM连接。

![image-20260408133416946](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408133417072.png)

## 4. 本地项目连接远程 vLLM

### 4.1. 本机连通服务器 

![image-20260408134917781](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408134917900.png)

![image-20260408134959886](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408135000069.png)

```python
curl https://uu740423-8ad4-61118741.bjb2.seetacloud.com:8443/v1/models \
  -H "Authorization: Bearer EXiaonuojiangai"
```

如果上面这个命令能够返回数据，那么我们就已经成功将本机连接到服务器运行的vLLM。

### 4.2. 本地项目接入远程的vLLM

#### 4.2.1. **配置后端 .env**

配置上服务器中VLLM中的配置，注意要使用与VLLM一致的API_KEY

```python
#vllm settings
LLM_PROVIDER=vllm
VLLM_BASE_URL=https://uu740423-8ad4-61118741.bjb2.seetacloud.com:8443/v1
VLLM_API_KEY=EXiaonuojiangai
VLLM_MODEL=gemma4-e4b-it
VLLM_DEPLOY_PROFILE=full_featured
VLLM_TIMEOUT_SECONDS=600
VLLM_PROBE_TIMEOUT_SECONDS=8
VLLM_HEALTH_CACHE_SECONDS=5
```

#### 4.2.2. **配置后端的config.py**

config.py会读取.env中的配置，注意在config.py中不要泄漏地址和vLLM_API_KEY

![image-20260408135559690](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408135559778.png)

#### 4.2.3. **LLM_service.py文件中接入vLLM**

vLLM的Gemma4官方文档已经有多种场景的配置信息（OpenAI SDK），我们只需要根据文档中的内容按需配置具体功能模块即可。

##### 文本生成

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="google/gemma-4-31B-it",
    messages=[
        {"role": "user", "content": "Write a poem about the ocean."}
    ],
    max_tokens=512,
    temperature=0.7
)

print(response.choices[0].message.content)

```

##### 图像理解

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="google/gemma-4-31B-it",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg"}
                },
                {
                    "type": "text",
                    "text": "Describe this image in detail."
                }
            ]
        }
    ],
    max_tokens=1024
)

print(response.choices[0].message.content)
```

##### 音频理解

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="google/gemma-4-E2B-it",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "audio_url",
                    "audio_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/2/22/Beatbox_by_Wikipedia_user_Wikipedia_Brown.ogg"}
                },
                {
                    "type": "text",
                    "text": "Provide a verbatim, word-for-word transcription of the audio."
                }
            ]
        }
    ],
    max_tokens=512
)

print(response.choices[0].message.content)
```

##### 视频理解

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="google/gemma-4-E2B-it",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "video_url",
                    "video_url": {"url": "https://example.com/sample_video.mp4"}
                },
                {
                    "type": "text",
                    "text": "Summarize what happens in this video."
                }
            ]
        }
    ],
    max_tokens=1024
)

print(response.choices[0].message.content)
```

##### 思考模式

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="google/gemma-4-31B-it",
    messages=[
        {"role": "user", "content": "A snail is at the bottom of a 20-foot well. Each day it climbs 3 feet, but at night it slides back 2 feet. How many days will it take to reach the top?"}
    ],
    max_tokens=4096,
    extra_body={
        "chat_template_kwargs": {"enable_thinking": True}
    }
)

message = response.choices[0].message

# The thinking process is in reasoning_content
if hasattr(message, "reasoning_content") and message.reasoning_content:
    print("=== Thinking ===")
    print(message.reasoning_content)

print("\n=== Answer ===")
print(message.content)
```

##### 工具调用

```python
Tool Calling (OpenAI SDK)¶

from openai import OpenAI
import json

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"
)

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. 'San Francisco, CA'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Step 1: Send user message with tools
response = client.chat.completions.create(
    model="google/gemma-4-31B-it",
    messages=[
        {"role": "user", "content": "What is the weather in Tokyo today?"}
    ],
    tools=tools,
    max_tokens=1024
)

message = response.choices[0].message

# Step 2: Process tool calls
if message.tool_calls:
    tool_call = message.tool_calls[0]
    print(f"Tool: {tool_call.function.name}")
    print(f"Args: {tool_call.function.arguments}")

    # Step 3: Feed back tool result and get final answer
    response = client.chat.completions.create(
        model="google/gemma-4-31B-it",
        messages=[
            {"role": "user", "content": "What is the weather in Tokyo today?"},
            message,  # assistant's tool call message
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps({"temperature": 22, "condition": "Partly cloudy", "unit": "celsius"})
            }
        ],
        tools=tools,
        max_tokens=1024
    )

    print(f"\nFinal answer: {response.choices[0].message.content}")
```

这些功能是官方文档中给出的标注你的OpenAI SDK调用方式，大家可以去官方文档中结合自己的项目按需配置。

#### 4.2.4. 本地后端的.env需要明确使用vLLM远程的VLLM_API_KEY

VLLM_API_KEY是大模型部署在vllm远程服务器后返回的核心身份认证key，没有key的话，只要vLLM的地址泄漏了，那么任何人都可以利用你的远程LLM进行训练浪费你的资源。

```python
curl https://uu740423-8ad4-61118741.bjb2.seetacloud.com:8443/v1/models \
  -H "Authorization: Bearer EXiaonuojiangai"
```

​	**APIKEY与远程vLLM不符合的情况演示**

​	本地后端启动就会在终端报error

![image-20260408140514084](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408140514336.png)

​	服务器上的vLLM也会同样报401拒绝访问

![image-20260408140535698](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408140535766.png)

​	**APIKEY与远程vLLM一致的情况演示**

​	后端.env正确设置API_KEY后，本地后端可正确的调用vLLM中的大模型进行回答；

![image-20260408140621306](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408140621396.png)

在自己的项目中调用一下

![image-20260408140718482](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408140718575.png)

![image-20260408140733143](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408140733341.png)

​	这样就已经成功实现了在服务器使用vLLM部署开源大模型，我们就可以不占用本地显存，通过vLLM的地址和apikey，调用云端的开源大模型。



## 5.5090部署E4b全功能展示

5090部署E4b，开启全功能，正常，但是要想稳定的运行全部功能及长token处理，需要20G+的显存，丐版的话17G显存左右，使用E4b，绰绰有余

![image-20260407204652491](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407204652683.png)

![image-20260407210157980](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407210158110.png)

### 5.1. 文本生成

非常快的响应；

![image-20260407210813051](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407210813277.png)

![image-20260407211011489](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211011661.png)

![image-20260407211047385](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211047543.png)

### 5.2. 音频处理

![image-20260407211235352](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211235446.png)

### 5.3. 视频理解

![image-20260407211413825](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211413980.png)

![image-20260407211434303](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211434406.png)

### 5.4. 思考/推理模式

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211633765.png" alt="image-20260407211633595" style="zoom:30%;" />

![image-20260407211744683](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211803256.png)

![image-20260407211708892](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211709010.png)

### 5.5. 函数调用/工具使用

`<|tool_call|>`Gemma 4 支持使用自定义特殊标记（ ，，`<tool_call|>`等）的专用工具调用协议进行函数调用。用思考的方式调用工具

![image-20260407212045889](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407212046541.png

![image-20260407211954839](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407211955079.png)

![image-20260407212409552](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407212409660.png)

### 5.6. 多模态 + 工具调用

![image-20260408131424953](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408131425108.png)

​	整体上反应特别快，首字延迟也特别低，非常适合本地部署

## 6. 5090部署31b 4bit量化，爆 oom

vLLM官方文档只给出了goole官方的满血版适配，所以量化版的稳定性就不是很好，我尝试NVFP4量化版本，就因为版本不对就给我强制退到了8bit量化版本，oom了。

```markdown
vLLM 调用 `modelopt` 库去加载这些 NVFP4 权重时，为了能让 PyTorch 处理，它实际上是把每一个 4-bit 的参数，塞进了一个 **8-bit (1 Byte)** 的容器里（比如 `uint8` 或 `float8`）。

这就是目前 **NVFP4 (NVIDIA 4-bit) 格式在 vLLM 和 PyTorch 生态中的一个“阿喀琉斯之踵”。

1. **底层没有 4-bit 容器：** PyTorch 至今没有原生的 `float4` (4-bit 浮点) 数据类型。
2. **强制 8-bit 对齐：** 当 vLLM 调用 `modelopt` 库去加载这些 NVFP4 权重时，为了能让 PyTorch 处理，它实际上是把每一个 4-bit 的参数，塞进了一个 **8-bit (1 Byte)** 的容器里（比如 `uint8` 或 `float8`）。
3. **体积翻倍：** 310 亿个参数 × 1 Byte = 恰好约 **31 GB**！

你的 RTX 5090 总显存是 32GB（可用 31.36GB）。模型权重直接占了 30.67GB，剩下不到 1GB 的空间，连维持 CUDA 基础运行环境（通常需要 1.5GB-2GB）都不够，更别提还要给大模型的 KV Cache 留空间了。
```



```text
(EngineCore pid=36704) ERROR 04-07 15:58:28 [gpu_model_runner.py:4818] Failed to load model - not enough GPU memory. Try lowering --gpu-memory-utilization to free memory for weights, increasing --tensor-parallel-size, or using --quantization. See https://docs.vllm.ai/en/latest/configuration/conserving_memory/ for more tips. (original error: CUDA out of memory. Tried to allocate 112.00 MiB. GPU 0 has a total capacity of 31.36 GiB of which 53.06 MiB is free. Including non-PyTorch memory, this process has 31.30 GiB memory in use. Of the allocated memory 30.35 GiB is allocated by PyTorch, and 319.13 MiB is reserved by PyTorch but unallocated. If reserved but unallocated memory is large try setting PYTORCH_ALLOC_CONF=expandable_segments:True to avoid fragmentation.  See documentation for Memory Management  (https://pytorch.org/docs/stable/notes/cuda.html#environment-variables))
```

![](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407161802247.png)

换Gemma-4-31B-IT-AWQ 

![image-20260407183401694](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407183401922.png)

![image-20260407191016433](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407191016692.png)

31b开启全模态，显存占用，可以说是非常极限仅仅支持最大token为8096，再多就oom了，直接vLLM就在启动之前就给你压力测试拦截了，vLLM会按照最大的请求数进行**Profiling (内存探测)**：模拟最大长度推理以计算 **KV Cache 块数量**，如果显存够用就会服务，如果不够就直接无法运行。

![image-20260407200003349](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407200004143.png)上下文太少了所以不太方便使用，大家要部署的话建议选择纯推理，所以推荐选择纯文本推理的模式

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407194610217.png" alt="image-20260407194609907" style="zoom:33%;" />

我们现在限制为maxtoken为8096，image为4，显存也是非常的极限。

音频直接就是不支持

![image-20260407200257958](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407200258090.png)

图像理解

![image-20260407201803529](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407201803665.png)

![image-20260407200631782](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407200631908.png)

![image-20260407201834596](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407201834726.png)

长文本分析，vLLM论文，都直接上下文不够了

![image-20260407213120464](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407213120572.png)

![image-20260407201113752](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407201113893.png)

![image-20260407201350944](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260407201351134.png)

简单的问题长度可以处理,但是基本没什么实际应用的能力，



## 7. **接入Openclaw尝试一下**

#### 简单场景

正常的简单场景没有任何问题

![image-20260408144505473](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408144505784.png)

![image-20260408144528997](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408144529205.png)

一些简单的场景比如说看图片分析啥的还是能实现的，我尝试过给他发东京的照片，让他告诉我首相是谁，他会自动识别调用工具告诉我是高市早苗，基本的功能是可以的。

![image-20260408145859245](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408145859463.png)

#### 适配问题

但是对于多模态，openclaw只允许text和image，其他的不被允许，适配的不是很好。

![image-20260408145624733](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408145624986.png)

因为openclaw的上下文系统提示词特别多，所以kvcahe吃了很多，但vLLM的共享perfix正好就很巧妙的处理了这一点；

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408162508361.png" alt="image-20260408162508149" style="zoom:33%;" />

<img src="https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408205149257.png" alt="image-20260408205148278" style="zoom:50%;" />

服务器中Prefix cache hit rate：64.7%可见vLLM是真的在进行共享prompt，大大提高了整体的部署性能；

![image-20260406124709489](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260406124709582.png)

尝试修复适配的bug，多出自于格式没适配导致的连锁反应，这俩是我尝试修复的内容；

```
根因是“函数调用参数生成/解析链路”断在了模型侧，不是 cron 本身：gemma4 在 vLLM 的 tool-call 输出里经常混入控制 token（如 <|"|>）并提前收束对象，vLLM 最终给到 OpenClaw 的就是一个“语法上还能过、语义上残缺”的参数（典型只剩 job.delivery:{}）。
OpenClaw 网关只做严格 schema 校验，不会自动补全字段，所以就连续报缺 name/schedule/sessionTarget/payload。我正在加一层仅限 vllm-gemma4 的参数修复器，把这类残对象在执行前补齐成可执行结构。
```

```markdown
原因不是 cron 坏了，是 vLLM + gemma4 这条工具调用链里，cron 参数在“模型生成/解析”阶段被截断了。

1. gemma4 经常把函数参数输出成残对象（常见 job.delivery:{}，或混入 <|"|> 这类控制标记）。
2. vLLM/OpenAI 兼容层把这个残对象传给 OpenClaw 后，Gateway 只做严格 schema 校验，不会自动补字段。
3. 所以你看到连续报错缺 name/schedule/sessionTarget/payload，而不是 cron 服务不可用。

我已经做了仅针对 vllm-gemma4 的修复（不影响其他模型）：

- 新增控制标记清洗与参数修复器
- 对 cron.add 自动补全必需字段（name/schedule/payload/sessionTarget/delivery）
- 修掉了把思维文本污染进 payload.message 的问题
```

#### 定时任务测试

修复显示问题后，进行比较复杂一点的设置定时任务，这里很明显的看出来小模型的局限性，会出现跑着跑着就不去执行调用，整体长的工具调用确实没有人家大模型好使，毕竟参数差距太了，E4b只有40亿参数，难为他了。

![image-20260408192032761](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408192032896.png)

![image-20260408192047317](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408192047573.png)

![image-20260408192418148](https://cdn.jsdelivr.net/gh/SkyMoem/Bed-Images/img/20260408192418339.png)

最终还是没有进行操作，模型还是太小了对于openclaw而言，满血的gemma4 31b能不能，我觉得是肯定可以的，各位大佬有资源的情况下可以去试一试；未来很有可能我们真的能够用开源模型去跑龙虾，未来可期；























