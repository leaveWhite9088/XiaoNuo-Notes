#!/usr/bin/env python3
"""
基础功能测试脚本
"""

import sys
import os
import asyncio

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_api():
    """测试API功能"""
    print("测试API功能...")

    from api.bilibili_client import bilibili_client

    # 测试获取视频信息
    try:
        # 使用一个已知的Bilibili视频进行测试
        video_info = await bilibili_client.get_video_info("BV1xx411c7mD")
        if video_info:
            print(f"✅ 视频信息获取成功: {video_info.title}")
        else:
            print("❌ 视频信息获取失败")
    except Exception as e:
        print(f"❌ 视频信息获取异常: {e}")

    # 测试获取评论
    try:
        comments = await bilibili_client.get_video_comments(123456789, 1)
        print(f"✅ 评论获取成功: {len(comments)} 条评论")
    except Exception as e:
        print(f"❌ 评论获取异常: {e}")

def test_ui_imports():
    """测试UI组件导入"""
    print("测试UI组件导入...")

    try:
        from ui.main_window import MainWindow
        print("✅ 主窗口导入成功")

        from ui.video_player import VideoPlayer
        print("✅ 视频播放器导入成功")

        from ui.comments_widget import CommentsWidget
        print("✅ 评论组件导入成功")

        from ui.login_dialog import LoginDialog
        print("✅ 登录对话框导入成功")

        from ui.styles import BilibiliStyles, BilibiliColors
        print("✅ 样式定义导入成功")

    except ImportError as e:
        print(f"❌ UI组件导入失败: {e}")
        return False

    return True

def test_utils():
    """测试工具类"""
    print("测试工具类...")

    try:
        from utils.config import config
        print("✅ 配置管理器导入成功")

        from utils.logger import setup_logger
        print("✅ 日志工具导入成功")

    except ImportError as e:
        print(f"❌ 工具类导入失败: {e}")
        return False

    return True

async def main():
    """主测试函数"""
    print("=== Bilibili Player 基础功能测试 ===\n")

    # 测试工具类
    if not test_utils():
        return

    # 测试UI组件导入
    if not test_ui_imports():
        return

    # 测试API功能
    await test_api()

    print("\n=== 测试完成 ===")
    print("注意：完整的UI测试需要在图形界面环境中运行")
    print("运行 'python src/main.py' 启动完整应用")

if __name__ == "__main__":
    asyncio.run(main())