"""
双模型对话脚本
- Qwen2.5-7B-Instruct (SiliconFlow API)
- MiniMax-M2.5 (Minimax API)
输入一条消息，两个模型同时回复。
"""

import os
import sys
import re
import httpx


def strip_think(text: str) -> str:
    """去掉 <think>...</think> 块"""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

# ── 配置 ──────────────────────────────────────────────
ENV_FILE = ".env.local"

def load_env(path: str) -> dict:
    env = {}
    if not os.path.exists(path):
        print(f"找不到 {path}")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

env = load_env(ENV_FILE)

SILICONFLOW_API_KEY = env.get("SILICONFLOW_API_KEY", "")
MINIMAX_API_KEY = env.get("MINIMAX_API_KEY", "")

if not SILICONFLOW_API_KEY:
    print("缺少 SILICONFLOW_API_KEY")
    sys.exit(1)
if not MINIMAX_API_KEY:
    print("缺少 MINIMAX_API_KEY")
    sys.exit(1)


def chat_api(api_url: str, api_key: str, model: str, messages: list[dict]) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 512,
        "temperature": 0.7,
    }
    try:
        with httpx.Client(timeout=60) as client:
            resp = client.post(api_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        return f"[HTTP {e.response.status_code}: {e.response.text[:300]}]"
    except Exception as e:
        return f"[请求失败: {e}]"


# ── 主循环 ────────────────────────────────────────────
def main():
    print("双模型对话（/quit 退出，/clear 清空历史）\n")

    history_qwen: list[dict] = []
    history_minimax: list[dict] = []

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n再见!")
            break

        if not user_input:
            continue
        if user_input.lower() == "/quit":
            print("再见!")
            break
        if user_input.lower() == "/clear":
            history_qwen.clear()
            history_minimax.clear()
            print("对话历史已清空\n")
            continue

        history_qwen.append({"role": "user", "content": user_input})
        history_minimax.append({"role": "user", "content": user_input})

        reply_qwen = strip_think(chat_api(
            "https://api.siliconflow.cn/v1/chat/completions",
            SILICONFLOW_API_KEY,
            "Qwen/Qwen2.5-7B-Instruct",
            history_qwen,
        ))
        reply_minimax = strip_think(chat_api(
            "https://api.minimaxi.com/v1/chat/completions",
            MINIMAX_API_KEY,
            "MiniMax-M2.5",
            history_minimax,
        ))

        history_qwen.append({"role": "assistant", "content": reply_qwen})
        history_minimax.append({"role": "assistant", "content": reply_minimax})

        print(f"Qwen2.5-7B：{reply_qwen}")
        print("---")
        print(f"MiniMax M2.5：{reply_minimax}")
        print()


if __name__ == "__main__":
    main()
