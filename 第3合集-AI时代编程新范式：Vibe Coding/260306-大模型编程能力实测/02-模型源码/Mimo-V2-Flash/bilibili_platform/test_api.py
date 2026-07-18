#!/usr/bin/env python3
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def test_bilibili_api():
    from src.api.bilibili_api import bilibili_api

    print("测试Bilibili API封装层...")
    print("=" * 50)

    print("1. 测试获取视频信息...")
    try:
        video_info = await bilibili_api.get_video_info("BV1uv411q7Mv")
        if video_info:
            print(f"✅ 成功获取视频信息: {video_info.get('title', '未知标题')}")
        else:
            print("❌ 无法获取视频信息")
    except Exception as e:
        print(f"❌ 获取视频信息失败: {e}")

    print("\n2. 测试搜索功能...")
    try:
        results = await bilibili_api.search_videos("动漫", page=1)
        if results:
            print(f"✅ 搜索成功，找到 {len(results)} 个结果")
            if results:
                first_result = results[0]
                print(f"   第一个结果: {first_result.get('title', '未知标题')}")
        else:
            print("❌ 搜索结果为空")
    except Exception as e:
        print(f"❌ 搜索失败: {e}")

    print("=" * 50)
    print("API测试完成")


if __name__ == "__main__":
    asyncio.run(test_bilibili_api())
