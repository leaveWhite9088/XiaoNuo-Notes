#!/usr/bin/env python3
"""
测试脚本 - 验证Bilibili视频平台功能
"""

import asyncio
import sys
import os

# 添加项目路径到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


async def test_video_info():
    """测试视频信息获取"""
    try:
        from bilibili_api import video

        print("测试视频信息获取...")
        v = video.Video(bvid="BV1uv411q7Mv")
        info = await v.get_info()

        print(f"✅ 成功获取视频信息")
        print(f"   标题: {info.get('title')}")
        print(f"   UP主: {info.get('owner', {}).get('name')}")
        print(f"   播放量: {info.get('stat', {}).get('view')}")

        return True
    except Exception as e:
        print(f"❌ 视频信息获取失败: {e}")
        return False


async def test_danmaku():
    """测试弹幕获取"""
    try:
        from bilibili_api import video

        print("测试弹幕获取...")
        v = video.Video(bvid="BV1uv411q7Mv")
        danmakus = await v.get_danmakus(page_index=0)

        print(f"✅ 成功获取弹幕，数量: {len(danmakus)}")
        if len(danmakus) > 0:
            print(f"   第一条弹幕: {danmakus[0].text}")

        return True
    except Exception as e:
        print(f"❌ 弹幕获取失败: {e}")
        return False


async def test_comments():
    """测试评论获取"""
    try:
        from bilibili_api import comment, video
        from bilibili_api.comment import CommentResourceType, OrderType

        print("测试评论获取...")
        v = video.Video(bvid="BV1uv411q7Mv")
        oid = await v.get_aid()

        comments = await comment.get_comments(
            oid=oid, type_=CommentResourceType.VIDEO, page_index=1, order=OrderType.TIME
        )

        print(f"✅ 成功获取评论")
        print(f"   评论总数: {comments.get('page', {}).get('count', 0)}")

        return True
    except Exception as e:
        print(f"❌ 评论获取失败: {e}")
        return False


async def main():
    """主测试函数"""
    print("=== Bilibili视频平台功能测试 ===\n")

    # 测试视频信息
    video_success = await test_video_info()
    print()

    # 测试弹幕
    danmaku_success = await test_danmaku()
    print()

    # 测试评论
    comment_success = await test_comments()
    print()

    # 总结
    print("=== 测试结果 ===")
    if all([video_success, danmaku_success, comment_success]):
        print("✅ 所有核心功能测试通过！")
        print("🎉 项目可以正常运行")
    else:
        print("⚠️  部分功能测试失败")
        print("请检查网络连接和依赖安装")


if __name__ == "__main__":
    asyncio.run(main())
