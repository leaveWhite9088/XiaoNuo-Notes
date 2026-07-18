"""
Bilibili认证服务
处理登录、Cookie管理等
"""
import json
import os
from typing import Optional, Dict, Any
import qrcode
from io import BytesIO
import base64
import asyncio

from bilibili_api import user, Credential, login_v2

from core.config import settings
from models.schemas import UserInfo, APIResponse


class AuthService:
    """认证服务"""

    def __init__(self):
        self.credential: Optional[Credential] = None
        self.cookie_file = os.path.join(settings.COOKIE_PATH, "bilibili_cookie.json")
        self.qr_sessions: Dict[str, login_v2.QrCodeLogin] = {}
        self._load_credential()

    def _load_credential(self):
        """从文件加载凭证"""
        if os.path.exists(self.cookie_file):
            try:
                with open(self.cookie_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.credential = Credential(
                        sessdata=data.get('sessdata', ''),
                        bili_jct=data.get('bili_jct', ''),
                        buvid3=data.get('buvid3', ''),
                        dedeuserid=data.get('dedeuserid', ''),
                        ac_time_value=data.get('ac_time_value', '')
                    )
            except Exception as e:
                print(f"加载凭证失败: {e}")
                self.credential = None

    def _save_credential(self):
        """保存凭证到文件"""
        if self.credential:
            data = {
                'sessdata': self.credential.sessdata,
                'bili_jct': self.credential.bili_jct,
                'buvid3': self.credential.buvid3,
                'dedeuserid': self.credential.dedeuserid,
                'ac_time_value': self.credential.ac_time_value
            }
            with open(self.cookie_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    async def get_qrcode(self) -> Dict[str, Any]:
        """获取登录二维码"""
        try:
            qr_login = login_v2.QrCodeLogin()
            await qr_login.generate_qrcode()

            # 生成二维码URL
            qr_url = getattr(qr_login, "url", None) or qr_login.__dict__.get("_QrCodeLogin__qr_link")
            oauth_key = getattr(qr_login, "qrcode_key", None) or qr_login.__dict__.get("_QrCodeLogin__qrcode_key")
            if not qr_url or not oauth_key:
                return {"success": False, "message": "二维码生成失败"}

            # 生成二维码图片并转为base64
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")

            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_base64 = base64.b64encode(buffer.getvalue()).decode()

            self.qr_sessions[oauth_key] = qr_login

            return {
                'success': True,
                'qrcode_url': qr_url,
                'qrcode_image': f"data:image/png;base64,{img_base64}",
                'oauth_key': oauth_key
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    async def check_qrcode(self, oauth_key: str) -> Dict[str, Any]:
        """检查二维码扫描状态"""
        try:
            qr_login = self.qr_sessions.get(oauth_key)
            if not qr_login:
                return {'success': False, 'message': '二维码会话不存在或已过期', 'status': 'error'}

            if hasattr(qr_login, "check_state"):
                result = await qr_login.check_state()
            else:
                result = await qr_login.events()

            done_event = getattr(login_v2.QrCodeLoginEvents, "DONE", None)
            scan_event = getattr(login_v2.QrCodeLoginEvents, "SCAN", None)
            confirm_event = getattr(login_v2.QrCodeLoginEvents, "CONF", None) or getattr(login_v2.QrCodeLoginEvents, "CONFIRM", None)
            timeout_event = getattr(login_v2.QrCodeLoginEvents, "TIMEOUT", None)
            fail_event = getattr(login_v2.QrCodeLoginEvents, "FAIL", None)

            if done_event is not None and result == done_event:
                # 登录成功，获取凭证
                self.credential = qr_login.get_credential() if hasattr(qr_login, "get_credential") else qr_login.credential
                self._save_credential()
                self.qr_sessions.pop(oauth_key, None)

                return {
                    'success': True,
                    'status': 'done',
                    'message': '登录成功'
                }
            elif scan_event is not None and result == scan_event:
                return {
                    'success': True,
                    'status': 'scanned',
                    'message': '已扫描，请确认登录'
                }
            elif confirm_event is not None and result == confirm_event:
                return {
                    'success': True,
                    'status': 'confirming',
                    'message': '等待确认'
                }
            elif (timeout_event is not None and result == timeout_event) or (fail_event is not None and result == fail_event):
                self.qr_sessions.pop(oauth_key, None)
                return {
                    'success': False,
                    'status': 'timeout',
                    'message': '二维码已过期'
                }
            else:
                return {
                    'success': True,
                    'status': 'waiting',
                    'message': '等待扫描'
                }
        except Exception as e:
            return {'success': False, 'message': str(e), 'status': 'error'}

    async def login_by_cookie(self, sessdata: str, bili_jct: str, buvid3: str = "") -> APIResponse:
        """通过Cookie登录"""
        try:
            self.credential = Credential(
                sessdata=sessdata,
                bili_jct=bili_jct,
                buvid3=buvid3
            )

            # 验证凭证
            my_info = await self.get_my_info()
            if my_info:
                self._save_credential()
                return APIResponse(success=True, message="登录成功", data=my_info)
            else:
                self.credential = None
                return APIResponse(success=False, message="凭证无效")
        except Exception as e:
            return APIResponse(success=False, message=str(e))

    async def logout(self) -> APIResponse:
        """退出登录"""
        self.credential = None
        if os.path.exists(self.cookie_file):
            os.remove(self.cookie_file)
        return APIResponse(success=True, message="已退出登录")

    async def get_my_info(self) -> Optional[UserInfo]:
        """获取当前登录用户信息"""
        if not self.credential:
            return None

        try:
            u = user.User(credential=self.credential)
            info = await u.get_user_info()

            return UserInfo(
                mid=info['mid'],
                name=info['name'],
                face=info['face'],
                sign=info.get('sign', ''),
                level=info.get('level', 0),
                vip_status=info.get('vip', {}).get('status', 0),
                is_login=True
            )
        except Exception as e:
            print(f"获取用户信息失败: {e}")
            return None

    def get_credential(self) -> Optional[Credential]:
        """获取当前凭证"""
        return self.credential

    def is_logged_in(self) -> bool:
        """检查是否已登录"""
        return self.credential is not None


# 全局认证服务实例
auth_service = AuthService()
