#!/usr/bin/env python3
"""
Bilibili Player - 哔哩哔哩视频播放器
"""

import sys
import asyncio
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from qasync import QEventLoop, QApplication

from ui.main_window import MainWindow
from utils.logger import setup_logger
from utils.config import Config

def main():
    """主函数"""
    # 设置日志
    setup_logger()

    # 创建Qt应用
    app = QApplication(sys.argv)
    app.setApplicationName("Bilibili Player")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("Bilibili")

    # 设置高DPI支持
    app.setAttribute(Qt.ApplicationAttribute.AA_EnableHighDpiScaling, True)
    app.setAttribute(Qt.ApplicationAttribute.AA_UseHighDpiPixmaps, True)

    # 创建事件循环
    loop = QEventLoop(app)
    asyncio.set_event_loop(loop)

    # 创建主窗口
    window = MainWindow()

    # 显示窗口
    window.show()

    # 运行应用
    with loop:
        sys.exit(loop.run_forever())

if __name__ == "__main__":
    main()