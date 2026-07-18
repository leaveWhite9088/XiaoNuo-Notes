"""
认证管理模块
"""

import asyncio
import json
from pathlib import Path
from typing import Optional, Dict, Any

from bilibili_api import login, Credential
from bilibili_api.exceptions import LoginError

from .data_models import UserInfo
from ..utils.config import config

class AuthManager:
    """认证管理器"""

    def __init__(self):
        self.credential: Optional[Credential] = None
        self.user_info: Optional[UserInfo] = None
        self._load_saved_credential()

    def _load_saved_credential(self):
        """加载保存的凭据"""
        cred_file = Path.home() / ".bilibili_player" / "credential.json"
        if cred_file.exists() and config.get("auth.auto_login", False):
            try:
                with open(cred_file, 'r', encoding='utf-8') as f:
                    cred_data = json.load(f)
                    self.credential = Credential(**cred_data)
                    asyncio.create_task(self._validate_credential())
            except Exception as e:
                print(f"加载凭据失败: {e}")

    async def _validate_credential(self):
        """验证凭据是否有效"""
        if not self.credential:
            return False

        try:
            # 尝试获取用户信息来验证凭据
            user_api = login.Login(self.credential)
            user_data = await user_api.get_current_user_info()
            if user_data:
                self.user_info = UserInfo(
                    mid=user_data['mid'],
                    name=user_data['name'],
                    avatar=user_data['face'],
                    level=user_data['level'],
                    vip_type=user_data['vip']['type'],
                    vip_status=user_data['vip']['status'],
                    coins=user_data['coins'],
                    following=user_data['following'],
                    follower=user_data['follower']
                )
                return True
        except Exception as e:
            print(f"凭据验证失败: {e}")
            self.credential = None
            self.user_info = None

        return False

    async def login_by_qr(self) -> bool:
        """通过二维码登录"""
        try:
            # 创建登录实例
            login_instance = login.QRLogin()

            # 获取二维码
            qr_code = await login_instance.get_qr_code()
            qr_url = qr_code['url']

            print("请使用哔哩哔哩客户端扫描二维码登录")
            print(f"二维码URL: {qr_url}")

            # 等待扫码
            while True:
                events = await login_instance.fetch_events()
                if events['code'] == 0:  # 登录成功
                    self.credential = events['credential']
                    await self._validate_credential()
                    self._save_credential()
                    return True
                elif events['code'] == 86038:  # 二维码过期
                    print("二维码已过期，请重新获取")
                    return False
                elif events['code'] == 86090:  # 未扫码
                    await asyncio.sleep(2)
                    continue
                else:
                    print(f"登录失败: {events}")
                    return False

        except Exception as e:
            print(f"二维码登录失败: {e}")
            return False

    async def login_by_password(self, username: str, password: str) -> bool:
        """通过账号密码登录"""
        try:
            # 创建登录实例
            login_instance = login.Login()

            # 执行登录
            result = await login_instance.login(username, password)

            if result['code'] == 0:
                self.credential = result['credential']
                await self._validate_credential()
                self._save_credential()
                return True
            else:
                print(f"登录失败: {result['message']}")
                return False

        except Exception as e:
            print(f"密码登录失败: {e}")
            return False

    def _save_credential(self):
        """保存凭据"""
        if not self.credential or not config.get("auth.remember_password", True):
            return

        try:
            cred_file = Path.home() / ".bilibili_player" / "credential.json"
            cred_file.parent.mkdir(parents=True, exist_ok=True)

            cred_data = {
                'sessdata': self.credential.sessdata,
                'bili_jct': self.credential.bili_jct,
                'buvid3': self.credential.buvid3,
                'dedeuserid': self.credential.dedeuserid,
                'ac_time_value': self.credential.ac_time_value
            }

            with open(cred_file, 'w', encoding='utf-8') as f:
                json.dump(cred_data, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"保存凭据失败: {e}")

    async def logout(self):
        """登出"""
        self.credential = None
        self.user_info = None

        # 删除保存的凭据
        cred_file = Path.home() / ".bilibili_player" / "credential.json"
        if cred_file.exists():
            cred_file.unlink()

    def is_logged_in(self) -> bool:
        """检查是否已登录"""
        return self.credential is not None and self.user_info is not None

    def get_credential(self) -> Optional[Credential]:
        """获取凭据"""
        return self.credential

    def get_user_info(self) -> Optional[UserInfo]:
        """获取用户信息"""
        return self.user_info

# 全局认证管理器实例
auth_manager = AuthManager()