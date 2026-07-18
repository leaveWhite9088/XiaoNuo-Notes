"""
Bilibili认证管理器
处理登录、登出、凭证管理
"""
import json
import asyncio
from typing import Optional, Dict, Any
from pathlib import Path

try:
    from bilibili_api import Credential, login_v2, login, user
    BILIBILI_API_AVAILABLE = True
except ImportError:
    BILIBILI_API_AVAILABLE = False
    # 定义占位类
    class Credential:
        def __init__(self, sessdata='', bili_jct='', buvid3='', dedeuserid=''):
            self.sessdata = sessdata
            self.bili_jct = bili_jct
            self.buvid3 = buvid3
            self.dedeuserid = dedeuserid

from backend.config import CREDENTIAL_FILE


class AuthManager:
    """认证管理器单例类"""
    _instance = None
    _credential: Optional[Credential] = None
    _lock = asyncio.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self.qr_code_data: Optional[Dict[str, Any]] = None
            self.login_status: Dict[str, Any] = {"logged_in": False, "user_info": None}
    
    async def load_credential(self) -> Optional[Credential]:
        """从文件加载凭证"""
        try:
            if CREDENTIAL_FILE.exists():
                with open(CREDENTIAL_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._credential = Credential(
                        sessdata=data.get('sessdata', ''),
                        bili_jct=data.get('bili_jct', ''),
                        buvid3=data.get('buvid3', ''),
                        dedeuserid=data.get('dedeuserid', ''),
                    )
                    # 验证凭证有效性
                    if await self.check_credential():
                        self.login_status["logged_in"] = True
                        await self.refresh_user_info()
                        return self._credential
                    else:
                        self._credential = None
            return None
        except Exception as e:
            print(f"加载凭证失败: {e}")
            return None
    
    async def save_credential(self, credential: Credential):
        """保存凭证到文件"""
        try:
            data = {
                'sessdata': credential.sessdata,
                'bili_jct': credential.bili_jct,
                'buvid3': credential.buvid3,
                'dedeuserid': credential.dedeuserid,
            }
            with open(CREDENTIAL_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self._credential = credential
            self.login_status["logged_in"] = True
        except Exception as e:
            print(f"保存凭证失败: {e}")
    
    async def check_credential(self) -> bool:
        """检查凭证是否有效"""
        if not self._credential:
            return False
        try:
            # 尝试获取用户信息来验证凭证
            u = user.User(credential=self._credential)
            info = await u.get_user_info()
            return info is not None
        except Exception:
            return False
    
    async def refresh_user_info(self):
        """刷新用户信息"""
        if not self._credential:
            return
        try:
            u = user.User(credential=self._credential)
            info = await u.get_user_info()
            self.login_status["user_info"] = info
        except Exception as e:
            print(f"刷新用户信息失败: {e}")
    
    async def get_credential(self) -> Optional[Credential]:
        """获取当前凭证"""
        if self._credential is None:
            await self.load_credential()
        return self._credential
    
    async def generate_qr_code(self) -> Dict[str, Any]:
        """生成登录二维码"""
        try:
            # 使用新的登录方式
            self.qr_code_data = await login_v2.QrCodeLogin().get_qrcode()
            return {
                "success": True,
                "url": self.qr_code_data["url"],
                "qrcode_key": self.qr_code_data["qrcode_key"],
                "base64": self.qr_code_data.get("base64", "")
            }
        except Exception as e:
            # 降级到旧版登录
            try:
                self.qr_code_data = await login.get_qrcode()
                return {
                    "success": True,
                    "url": self.qr_code_data["url"],
                    "oauthKey": self.qr_code_data.get("oauthKey", ""),
                    "base64": self.qr_code_data.get("base64", "")
                }
            except Exception as e2:
                return {"success": False, "message": f"生成二维码失败: {str(e)}, {str(e2)}"}
    
    async def check_qr_status(self) -> Dict[str, Any]:
        """检查二维码登录状态"""
        try:
            if not self.qr_code_data:
                return {"success": False, "message": "未生成二维码"}
            
            # 尝试新版登录
            try:
                if "qrcode_key" in self.qr_code_data:
                    result = await login_v2.QrCodeLogin().check_qrcode(self.qr_code_data)
                    if result.get("success"):
                        credential = result.get("credential")
                        if credential:
                            await self.save_credential(credential)
                            await self.refresh_user_info()
                            return {"success": True, "status": "success", "message": "登录成功"}
                    return {"success": True, "status": result.get("status", "pending"), "message": result.get("message", "等待扫描")}
            except Exception:
                pass
            
            # 降级到旧版
            if "oauthKey" in self.qr_code_data:
                result = await login.check_qrcode(self.qr_code_data)
                if result.get("status"):
                    # 获取凭证
                    try:
                        # 从cookies中提取凭证
                        cookies = result.get("cookies", {})
                        credential = Credential(
                            sessdata=cookies.get('SESSDATA', ''),
                            bili_jct=cookies.get('bili_jct', ''),
                            buvid3=cookies.get('buvid3', ''),
                        )
                        await self.save_credential(credential)
                        await self.refresh_user_info()
                        return {"success": True, "status": "success", "message": "登录成功"}
                    except Exception as e:
                        return {"success": False, "message": f"获取凭证失败: {str(e)}"}
                else:
                    return {"success": True, "status": "pending", "message": result.get("message", "等待扫描")}
            
            return {"success": False, "message": "未知的登录方式"}
            
        except Exception as e:
            return {"success": False, "message": f"检查登录状态失败: {str(e)}"}
    
    async def logout(self) -> bool:
        """登出"""
        try:
            if CREDENTIAL_FILE.exists():
                CREDENTIAL_FILE.unlink()
            self._credential = None
            self.login_status = {"logged_in": False, "user_info": None}
            self.qr_code_data = None
            return True
        except Exception as e:
            print(f"登出失败: {e}")
            return False
    
    def get_login_status(self) -> Dict[str, Any]:
        """获取登录状态"""
        return self.login_status


# 全局认证管理器实例
auth_manager = AuthManager()