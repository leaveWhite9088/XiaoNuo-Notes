import requests
import json
import sys
import re

# ================= 配置部分 =================
BASE_URL = "http://localhost:9383"
API_KEY = "ragflow-PJ-4Xt-aW9JsxzPaMdUFsWxOE5Z92-YvyhLNu_nigPI"
CHAT_ID = "25c6620eebed11f0b6233a61c4d72672"


# ===========================================

def send_message(session_id, question, is_warmup=False):
    url = f"{BASE_URL}/api/v1/chats/{CHAT_ID}/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    payload = {
        "question": question,
        "stream": True,
        "session_id": session_id
    }

    # 如果是正式对话，先打印前缀
    if not is_warmup:
        print("Bot: ", end="", flush=True)

    new_session_id = session_id

    # === 状态控制变量 ===
    raw_buffer = ""  # 存储原始数据
    printed_len = 0  # 记录正式回答已经打印了多少个字符
    is_thinking = False  # 是否正在思考模式
    has_finished_thinking = False  # 是否已经思考完毕
    has_printed_thought_block = False  # 标记是否已经展示过思考块

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=300) as response:
            if response.status_code != 200:
                print(f"[请求失败: {response.status_code}]")
                return new_session_id

            for line in response.iter_lines():
                if not line: continue
                decoded = line.decode('utf-8').strip()

                if decoded.startswith("data:"):
                    json_str = decoded[5:].strip()
                    if json_str == "[DONE]": break

                    try:
                        pkg = json.loads(json_str)
                        if isinstance(pkg.get("data"), bool): continue
                        if pkg.get("code", 0) != 0:
                            print(f"[API Error: {pkg.get('message')}]")
                            break

                        data = pkg.get("data", {})
                        if isinstance(data, dict):
                            if "session_id" in data and data["session_id"]:
                                new_session_id = data["session_id"]

                            chunk = data.get("answer", "")

                            if chunk:
                                raw_buffer += chunk

                                # 1. 检测是否开始思考
                                if "<think>" in raw_buffer and not has_finished_thinking:
                                    is_thinking = True

                                # 2. 检测是否结束思考
                                if "</think>" in raw_buffer:
                                    is_thinking = False
                                    has_finished_thinking = True

                                # 3. 逻辑分支：决定如何打印
                                if is_thinking:
                                    # 如果正在思考，使用 \r 覆盖当前行，显示动态提示
                                    if not is_warmup:
                                        print("\rBot: (深度思考中...)", end="", flush=True)
                                else:
                                    # 如果不在思考（或是思考刚刚结束）

                                    # 【关键修改】一旦检测到思考结束，且还没打印过思考块
                                    if has_finished_thinking and not has_printed_thought_block:
                                        if not is_warmup:
                                            # A. 清除 "(深度思考中...)" 提示
                                            print("\r" + " " * 30 + "\r", end="", flush=True)

                                            # B. 【核心逻辑】从后往前找最后一次出现的 think 标签对
                                            end_tag_pos = raw_buffer.rfind("</think>")
                                            start_tag_pos = raw_buffer.rfind("<think>", 0, end_tag_pos)

                                            if start_tag_pos != -1 and end_tag_pos != -1:
                                                # 提取最后这一对标签中间的内容
                                                # +7 是为了跳过 <think> 这7个字符
                                                last_thought_content = raw_buffer[
                                                                       start_tag_pos + 7: end_tag_pos].strip()

                                                print(f"【深度思考】\n{last_thought_content}\n{'-' * 30}")

                                            # C. 重新打印 Bot 前缀，准备输出正式回答
                                            print("Bot: ", end="", flush=True)

                                        has_printed_thought_block = True

                                    # --- 下面是正式回答的流式打印 ---

                                    # 计算“干净”的文本内容（取最后一个 </think> 之后的部分）
                                    if has_finished_thinking:
                                        clean_content = raw_buffer.split("</think>")[-1]
                                    elif "<think>" not in raw_buffer:
                                        clean_content = raw_buffer
                                    else:
                                        clean_content = ""

                                    # 核心流式逻辑：只打印【新增】的部分
                                    if len(clean_content) > printed_len:
                                        new_chars = clean_content[printed_len:]
                                        if not is_warmup:
                                            print(new_chars, end="", flush=True)
                                        printed_len = len(clean_content)

                    except json.JSONDecodeError:
                        pass

        # 对话结束
        if is_warmup:
            # 热身时，如果不希望显示思考过程，可以只提取 clean_content
            # 这里为了保持一致，简单清洗一下打印即可
            final_clean = re.sub(r'<think>.*?</think>', '', raw_buffer, flags=re.DOTALL).strip()
            print(f"Bot: {final_clean}\n")
        else:
            print("")  # 换行

        return new_session_id

    except Exception as e:
        print(f"\n[Error] 连接异常: {e}")
        return new_session_id


def run_chat_loop():
    print(f"🚀 正在连接助手 (Chat ID: {CHAT_ID})...")

    # --- 1. 自动热身 ---
    print("🔄 正在初始化会话 (等待模型预热)...")
    current_session_id = send_message(None, "你好", is_warmup=True)

    if not current_session_id:
        print("❌ 初始化失败。")
        return

    print("💡 初始化完成！现在可以直接提问了 (输入 'exit' 退出)")
    print("-" * 50)

    # --- 2. 对话循环 ---
    while True:
        try:
            user_input = input("You: ")
            if not user_input.strip(): continue
            if user_input.lower() in ["exit", "quit"]: break
        except EOFError:
            break

        current_session_id = send_message(current_session_id, user_input)


if __name__ == "__main__":
    run_chat_loop()