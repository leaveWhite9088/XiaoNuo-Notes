"""
认证相关API路由
"""
from fastapi import APIRouter, HTTPException, Cookie
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from services.auth_service import auth_service
from models.schemas import APIResponse

router = APIRouter(prefix="/auth", tags=["认证"])


class CookieLoginRequest(BaseModel):
    """Cookie登录请求"""
    sessdata: str
    bili_jct: str
    buvid3: Optional[str] = ""


@router.get("/qrcode")
async def get_qrcode():
    """获取登录二维码"""
    result = await auth_service.get_qrcode()
    if result.get('success'):
        return JSONResponse(content=result)
    raise HTTPException(status_code=400, detail=result.get('message', '获取二维码失败'))


@router.get("/qrcode/check")
async def check_qrcode(oauth_key: str):
    """检查二维码扫描状态"""
    result = await auth_service.check_qrcode(oauth_key)
    return JSONResponse(content=result)


@router.post("/login/cookie")
async def login_by_cookie(request: CookieLoginRequest):
    """通过Cookie登录"""
    result = await auth_service.login_by_cookie(
        sessdata=request.sessdata,
        bili_jct=request.bili_jct,
        buvid3=request.buvid3
    )
    return result


@router.post("/logout")
async def logout():
    """退出登录"""
    result = await auth_service.logout()
    return result


@router.get("/me")
async def get_my_info():
    """获取当前用户信息"""
    info = await auth_service.get_my_info()
    if info:
        return APIResponse(success=True, data=info)
    return APIResponse(success=False, message="未登录", code=401)


@router.get("/status")
async def get_login_status():
    """获取登录状态"""
    return APIResponse(
        success=True,
        data={
            "is_logged_in": auth_service.is_logged_in()
        }
    )
