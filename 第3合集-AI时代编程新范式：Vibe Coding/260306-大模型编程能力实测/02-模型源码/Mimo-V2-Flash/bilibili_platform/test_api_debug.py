#!/usr/bin/env python3
import asyncio
import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def test_bilibili_api():
    print("测试Bilibili API...")
    print("=" * 50)

    print("1. 直接测试API...")
    try:
        url = "https://api.bilibili.com/x/web-interface/view?bvid=BV1uv411q7Mv"
        response = requests.get(url, timeout=10)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"API响应: {data}")
            if data.get("code") == 0:
                print(f"✅ 成功获取视频信息: {data['data'].get('title', '未知标题')}")
            else:
                print(f"❌ API返回错误: {data.get('message', '未知错误')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

    print("\n2. 测试搜索API...")
    try:
        url = "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=动漫&page=1"
        response = requests.get(url, timeout=10)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"API响应: {data}")
            if data.get("code") == 0:
                results = data.get("data", {}).get("result", [])
                print(f"✅ 搜索成功，找到 {len(results)} 个结果")
                if results:
                    first_result = results[0]
                    print(f"   第一个结果: {first_result.get('title', '未知标题')}")
            else:
                print(f"❌ API返回错误: {data.get('message', '未知错误')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

    print("=" * 50)
    print("API测试完成")


if __name__ == "__main__":
    asyncio.run(test_bilibili_api())
