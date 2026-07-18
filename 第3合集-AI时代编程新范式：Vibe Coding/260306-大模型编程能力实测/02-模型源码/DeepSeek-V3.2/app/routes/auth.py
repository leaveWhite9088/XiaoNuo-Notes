from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import qrcode
import base64
from io import BytesIO

from bilibili_api.login_v2 import QrCodeLogin, QrCodeLoginEvents
from bilibili_api import Credential

router = APIRouter()

# 存储登录状态
login_sessions = {}


@router.get("/qr-code")
async def get_qr_code():
    try:
        login = QrCodeLogin()
        qr_url, qr_key = await login.get_qrcode()

        # 生成二维码图片
        qr = qrcode.QRCode()
        qr.add_data(qr_url)
        qr.make()

        img_buffer = BytesIO()
        qr_img = qr.make_image()
        qr_img.save(img_buffer, format="PNG")
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()

        # 存储登录会话
        login_sessions[qr_key] = {"login": login, "status": "waiting"}

        return JSONResponse(
            {
                "success": True,
                "qr_key": qr_key,
                "qr_url": qr_url,
                "qr_image": f"data:image/png;base64,{img_base64}",
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/check-login/{qr_key}")
async def check_login(qr_key: str):
    if qr_key not in login_sessions:
        return JSONResponse({"success": False, "error": "无效的二维码密钥"})

    try:
        login = login_sessions[qr_key]["login"]
        event = await login.events()

        if event == QrCodeLoginEvents.SCAN:
            login_sessions[qr_key]["status"] = "scanned"
            return JSONResponse(
                {
                    "success": True,
                    "status": "scanned",
                    "message": "二维码已扫描，等待确认",
                }
            )
        elif event == QrCodeLoginEvents.CONF:
            login_sessions[qr_key]["status"] = "confirmed"
            return JSONResponse(
                {"success": True, "status": "confirmed", "message": "已确认，正在登录"}
            )
        elif event == QrCodeLoginEvents.TIMEOUT:
            del login_sessions[qr_key]
            return JSONResponse(
                {"success": False, "status": "timeout", "message": "二维码已过期"}
            )
        elif event == QrCodeLoginEvents.DONE:
            credential = await login.get_credential()

            # 保存凭据信息
            user_credential = {
                "sessdata": credential.sessdata,
                "bili_jct": credential.bili_jct,
                "buvid3": credential.buvid3,
                "dedeuserid": credential.dedeuserid,
            }

            # 存储用户凭据
            login_sessions[qr_key]["credential"] = user_credential
            login_sessions[qr_key]["status"] = "success"

            return JSONResponse(
                {
                    "success": True,
                    "status": "success",
                    "credential": user_credential,
                    "message": "登录成功",
                }
            )
        else:
            return JSONResponse(
                {"success": True, "status": "waiting", "message": "等待扫描"}
            )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/logout")
async def logout(qr_key: str):
    if qr_key in login_sessions:
        del login_sessions[qr_key]
    return JSONResponse({"success": True, "message": "已退出登录"})
