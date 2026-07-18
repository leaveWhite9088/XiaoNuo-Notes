"""
展示 Tokenizer 选词逻辑对模型输出的影响
对比两种引导方式，分析分词差异如何导致不同的生成结果
"""
import os
import sys
import re
import httpx
from transformers import AutoTokenizer

# ── 配置 ──
TOKENIZER_PATH = "./models/tk-minimax-m2.5"

env = {}
with open(".env.local", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()

API_KEY = env.get("MINIMAX_API_KEY", "")
if not API_KEY:
    print("缺少 MINIMAX_API_KEY")
    sys.exit(1)

print(f"加载分词器: {TOKENIZER_PATH}")
tok = AutoTokenizer.from_pretrained(TOKENIZER_PATH)


def strip_think(text):
    """去掉 <think>...</think> 块"""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def decode_token(tid):
    """解码单个 token，处理乱码"""
    decoded = tok.decode([tid])
    if "�" in decoded:
        decoded = tok.convert_ids_to_tokens(tid)
    return decoded


def tokenize(text):
    """分词并返回可读结果"""
    ids = tok.encode(text)
    return [decode_token(tid) for tid in ids]


def call_api(prompt):
    """调用 MiniMax API，去掉 think 内容，只保留回复"""
    with httpx.Client(timeout=30) as client:
        resp = client.post(
            "https://api.minimaxi.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json={"model": "MiniMax-M2.5", "messages": [{"role": "user", "content": prompt}], "max_tokens": 256, "temperature": 0},
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return strip_think(content)


def main():
    print("=" * 60)
    print("  Tokenizer 选词逻辑演示")
    print("=" * 60)

    # ── 1. 核心对比 ──
    prompts = [
        ("引导式", "请把'马'、'嘉'、'祺'这三个字连起来输出，不要说别的"),
        ("直接式", "重复一下马嘉祺三个字，不要说别的"),
    ]

    for label, text in prompts:
        print(f"\n[{label}] {text}")
        print(f"  输入分词: {tokenize(text)}")
        reply = call_api(text)
        print(f"  模型回复: {reply}")
        print(f"  回复分词: {tokenize(reply)}")

    # ── 2. 分词对比 ──
    print(f"\n{'=' * 60}")
    print("  '马嘉祺' 在不同上下文中的分词")
    print(f"{'=' * 60}")
    contexts = [
        ("单独出现", "马嘉祺"),
        ("在句子中", "读一下马嘉祺"),
        ("逐字引导", "请把'马'、'嘉'、'祺'连起来"),
        ("作为名字", "我的名字叫马嘉祺"),
    ]
    for label, text in contexts:
        print(f"  {label}: {tokenize(text)}")


if __name__ == "__main__":
    main()
