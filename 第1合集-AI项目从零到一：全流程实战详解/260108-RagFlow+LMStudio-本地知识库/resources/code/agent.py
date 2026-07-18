import requests
import json

# ================= 配置部分 =================
# 1. 这里的 URL 是您 F12 抓到的内部接口地址
URL = "http://localhost:9383/v1/canvas/completion"

# 2. Agent ID
AGENT_ID = "e5b21378ec4311f080e3da56ced64a91"

# 3. 构造请求头 (完全复刻您的浏览器请求)
# 注意：session 和 authorization 会过期，如果明天跑不通了，需要重新抓一下
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    # 注意：这里直接使用您抓包到的 Token，没有加 "Bearer " 前缀，因为它看起来像个签名字符串
    "Authorization": "IjUxOGJmNDM4ZWMzZjExZjA4MGUzZGE1NmNlZDY0YTkxIg.aV8fsg.aYY1ugGbOOWL_zILYi806pVOrSc",
    # Cookie 是内部接口鉴权的关键
    "Cookie": "session=.eJwdyzkSgCAMAMC_pLYgQRD8DBNMMtqCVI5_9yi32AvK6NrKIbCCo4Vd1FmUFkRzbIEycfCSahJCmKBY077Derahr_4WMFXLkXXz9rXk1AuHuKnEmTPC_QAFJx2i.aV8fsg.lhA0VGxjIY2cOMzSPB8_TnbZepY"
}

# ===========================================

def chat_like_browser_single_turn(question):
    print(f"正在发送消息: {question} ...")

    # 构造与浏览器完全一致的数据包
    payload = {
        "id": AGENT_ID,  # 内部接口参数名为 id
        "query": question,  # 用户的问题
    }

    full_answer = ""

    try:
        # 发送 POST 请求，开启 stream=True
        with requests.post(URL, headers=HEADERS, json=payload, stream=True) as response:

            # 1. 检查状态码
            if response.status_code != 200:
                print(f"请求失败: 状态码 {response.status_code}")
                print(f"返回内容: {response.text}")
                return

            # 2. 处理流式响应 (SSE)
            for line in response.iter_lines():
                if not line:
                    continue

                decoded_line = line.decode('utf-8').strip()

                # 解析 data: 开头的行
                if decoded_line.startswith("data:"):
                    json_str = decoded_line[5:].strip()  # 去掉 "data:"

                    try:
                        data = json.loads(json_str)

                        # 内部接口的事件类型通常是 'message'
                        # 我们只提取 content 内容，忽略 node_started/finished 等调试信息
                        if data.get("event") == "message":
                            content = data.get("data", {}).get("content", "")
                            full_answer += content
                            # 实时打印效果（可选）
                            # print(content, end="", flush=True)

                    except json.JSONDecodeError:
                        pass

        # 3. 最终一次性输出结果（实现单轮对话效果）
        print("\n" + "=" * 20 + " Agent 回复 " + "=" * 20)
        print(full_answer)
        print("=" * 50)

    except Exception as e:
        print(f"发生错误: {e}")


if __name__ == "__main__":
    chat_like_browser_single_turn("错误101")