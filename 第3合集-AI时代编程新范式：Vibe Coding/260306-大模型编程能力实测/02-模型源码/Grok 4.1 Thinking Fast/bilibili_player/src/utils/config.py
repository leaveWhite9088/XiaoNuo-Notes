"""
配置管理模块
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

class Config:
    """配置管理类"""

    def __init__(self):
        self.config_dir = Path.home() / ".bilibili_player"
        self.config_file = self.config_dir / "config.json"
        self._config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        if not self.config_file.exists():
            return self._get_default_config()

        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载配置文件失败: {e}")
            return self._get_default_config()

    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            "window": {
                "width": 1200,
                "height": 800,
                "x": 100,
                "y": 100
            },
            "player": {
                "volume": 80,
                "autoplay": False,
                "quality": "高清 1080P"
            },
            "auth": {
                "auto_login": False,
                "remember_password": True
            },
            "ui": {
                "theme": "bilibili",
                "font_size": 12
            }
        }

    def save(self):
        """保存配置"""
        try:
            self.config_dir.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self._config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"保存配置文件失败: {e}")

    def get(self, key: str, default=None):
        """获取配置值"""
        keys = key.split('.')
        value = self._config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def set(self, key: str, value: Any):
        """设置配置值"""
        keys = key.split('.')
        config = self._config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value
        self.save()

# 全局配置实例
config = Config()