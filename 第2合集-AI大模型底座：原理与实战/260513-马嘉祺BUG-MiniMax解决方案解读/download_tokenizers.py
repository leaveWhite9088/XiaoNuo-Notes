"""
主流 Tokenizer 批量下载脚本
仅下载业界标杆模型的分词器（不下载模型权重）
使用前请先在 PowerShell 中设置镜像:
    $env:HF_ENDPOINT = "https://hf-mirror.com"
    python download_tokenizers.py
"""
import os
from huggingface_hub import snapshot_download

if "HF_ENDPOINT" not in os.environ:
    print("请先设置镜像环境变量，再运行本脚本：")
    print('   $env:HF_ENDPOINT = "https://hf-mirror.com"')
    print("   python download_tokenizers.py")
    exit(1)

print(f"当前镜像: {os.environ['HF_ENDPOINT']}")

TOKENIZER_PATTERNS = [
    "tokenizer.json",
    "tokenizer_config.json",
    "tokenizer.model",
    "special_tokens_map.json",
    "vocab.json",
    "merges.txt",
    "added_tokens.json",
]

tokenizers_config = [
    {
        "repo_id": "openai-community/gpt2",
        "path": "./models/tk-gpt2",
        "note": "OpenAI GPT-2 (BPE)",
    },
    {
        "repo_id": "NousResearch/Meta-Llama-3-8B",
        "path": "./models/tk-llama3-8b",
        "note": "Meta Llama 3 (tiktoken BPE, 128K vocab, 社区非gated镜像)",
    },
    {
        "repo_id": "NousResearch/Meta-Llama-3.1-8B",
        "path": "./models/tk-llama3.1-8b",
        "note": "Meta Llama 3.1 (128K 上下文, 社区非gated镜像)",
    },
    {
        "repo_id": "Qwen/Qwen2.5-1.5B-Instruct",
        "path": "./models/tk-qwen2.5-1.5b",
        "note": "阿里 Qwen 2.5 1.5B (tiktoken BPE, 152K vocab)",
    },
    {
        "repo_id": "Qwen/Qwen2.5-7B-Instruct",
        "path": "./models/tk-qwen2.5-7b",
        "note": "阿里 Qwen 2.5 7B (tiktoken BPE, 152K vocab)",
    },
    {
        "repo_id": "deepseek-ai/DeepSeek-V3",
        "path": "./models/tk-deepseek-v3",
        "note": "DeepSeek V3 (671B MoE, tiktoken BPE)",
    },
    {
        "repo_id": "deepseek-ai/DeepSeek-R1",
        "path": "./models/tk-deepseek-r1",
        "note": "DeepSeek R1 推理模型",
    },
    {
        "repo_id": "mistralai/Mistral-7B-Instruct-v0.3",
        "path": "./models/tk-mistral-7b-v0.3",
        "note": "Mistral 7B v0.3 (32K vocab)",
    },
    {
        "repo_id": "MiniMaxAI/MiniMax-M2.5",
        "path": "./models/tk-minimax-m2.5",
        "note": "MiniMax M2.5",
    },
]


def run_download():
    print(f"准备下载 {len(tokenizers_config)} 个 tokenizer\n")

    success, failed, skipped = [], [], []

    for item in tokenizers_config:
        repo = item["repo_id"]
        local_path = item["path"]
        note = item.get("note", "")

        if os.path.exists(os.path.join(local_path, "tokenizer.json")) or \
           os.path.exists(os.path.join(local_path, "tokenizer.model")):
            print(f"已存在，跳过: {repo}")
            skipped.append(repo)
            continue

        if not os.path.exists(local_path):
            os.makedirs(local_path, exist_ok=True)

        print(f"\n{repo}")
        print(f"  {note}")
        try:
            snapshot_download(
                repo_id=repo,
                local_dir=local_path,
                allow_patterns=TOKENIZER_PATTERNS,
            )
            print(f"  完成")
            success.append(repo)
        except Exception as e:
            print(f"  失败: {e}")
            failed.append(repo)

    print(f"\n下载完成  成功: {len(success)}  跳过: {len(skipped)}  失败: {len(failed)}")
    if failed:
        print(f"失败列表: {failed}")


if __name__ == "__main__":
    run_download()
