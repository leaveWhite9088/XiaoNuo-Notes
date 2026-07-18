import os
from typing import Optional


class Settings:
    APP_TITLE = "Bilibili视频平台"
    APP_DESCRIPTION = "基于bilibili-api开发的B站风格视频平台"
    APP_VERSION = "1.0.0"

    # 服务器配置
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    # 静态文件配置
    STATIC_DIR = "static"
    TEMPLATE_DIR = "templates"

    # 会话配置
    SESSION_SECRET = os.getenv("SESSION_SECRET", "bilibili_platform_secret_key")
    SESSION_MAX_AGE = 3600 * 24 * 7  # 7天


settings = Settings()
