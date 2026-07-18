"""
模型下载脚本
使用前请先在 PowerShell 中设置镜像:
    $env:HF_ENDPOINT = "https://hf-mirror.com"
    python download_models.py
"""
import os
from huggingface_hub import snapshot_download

# 检查 HF_ENDPOINT 是否已设置
if "HF_ENDPOINT" not in os.environ:
    print("⚠️  请先设置镜像环境变量，再运行本脚本：")
    print('   $env:HF_ENDPOINT = "https://hf-mirror.com"')
    print("   python download_models.py")
    exit(1)

print(f"🌐 当前镜像: {os.environ['HF_ENDPOINT']}")

# 下载配置清单
models_config = [
    {
        "repo_id": "Qwen/Qwen2.5-1.5B",
        "path": "./models/qwen2.5-1.5b",
        "patterns": None
    },
    {
        "repo_id": "Qwen/Qwen2.5-1.5B-Instruct",
        "path": "./models/qwen2.5-1.5b-instruct",
        "patterns": None
    },
    # ── Qwen2.5-7B 全量 FP16（用于 lm_head 退化扫描）──
    {
        "repo_id": "Qwen/Qwen2.5-7B",
        "path": "./models/qwen2.5-7b",
        "patterns": None
    },
    {
        "repo_id": "Qwen/Qwen2.5-7B-Instruct",
        "path": "./models/qwen2.5-7b-instruct",
        "patterns": None
    },
    {
        "repo_id": "MiniMaxAI/MiniMax-M2.5",
        "path": "./models/minimax-m2.5",
        # 仅下载分词器核心组件，避免下载 200GB+ 的权重
        "patterns": [
            "tokenizer.json", "tokenizer_config.json",
            "special_tokens_map.json", "vocab.json",
            "merges.txt", "config.json"
        ]
    },
    {
        "repo_id": "MiniMaxAI/MiniMax-M2.7",
        "path": "./models/minimax-m2.7",
        "patterns": [
            "tokenizer.json", "tokenizer_config.json",
            "special_tokens_map.json", "vocab.json",
            "merges.txt", "config.json"
        ]
    }
]

def run_setup():
    print("🛠️  正在检查并准备实验环境...")

    for item in models_config:
        repo = item["repo_id"]
        local_path = item["path"]
        patterns = item["patterns"]

        if not os.path.exists(local_path):
            print(f"📁 创建目录: {os.path.abspath(local_path)}")
            os.makedirs(local_path, exist_ok=True)

        print(f"\n🚀 正在同步: {repo}")
        try:
            snapshot_download(
                repo_id=repo,
                local_dir=local_path,
                allow_patterns=patterns,
            )
            print(f"✅ {repo} 同步成功！")
        except Exception as e:
            print(f"❌ {repo} 同步遇到问题: {e}")

if __name__ == "__main__":
    run_setup()
