from __future__ import annotations

import os
from pathlib import Path

import certifi
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    app_name: str = "Bili Portal API"
    api_prefix: str = "/api"
    frontend_origin: str = "http://localhost:5173"
    credential_file: Path = DATA_DIR / "credential.json"
    qrcode_ttl_seconds: int = 180
    danmaku_limit: int = 120

    model_config = SettingsConfigDict(env_prefix="BILI_PORTAL_", extra="ignore")


settings = Settings()

# bilibili-api-python 在部分 macOS Python 环境下需要显式指向证书链。
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
