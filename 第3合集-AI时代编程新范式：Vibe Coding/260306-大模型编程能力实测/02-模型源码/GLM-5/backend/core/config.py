from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置"""
    APP_NAME: str = "Bilibili Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 前端配置
    FRONTEND_URL: str = "http://localhost:5173"

    # Cookie存储路径
    COOKIE_PATH: str = "data/cookies"

    # Bilibili API配置
    BILIBILI_API_TIMEOUT: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# 确保数据目录存在
os.makedirs(settings.COOKIE_PATH, exist_ok=True)
