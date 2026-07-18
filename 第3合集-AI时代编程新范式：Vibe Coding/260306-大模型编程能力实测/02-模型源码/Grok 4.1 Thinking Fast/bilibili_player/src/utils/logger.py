"""
日志工具模块
"""

import logging
import sys
from pathlib import Path

def setup_logger():
    """设置日志配置"""
    # 创建日志目录
    log_dir = Path.home() / ".bilibili_player" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    # 配置根日志器
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # 清除现有的处理器
    logger.handlers.clear()

    # 创建控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # 创建文件处理器
    file_handler = logging.FileHandler(
        log_dir / "bilibili_player.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)

    # 创建格式器
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # 添加处理器
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    # 设置第三方库日志级别
    logging.getLogger('bilibili_api').setLevel(logging.WARNING)
    logging.getLogger('aiohttp').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)