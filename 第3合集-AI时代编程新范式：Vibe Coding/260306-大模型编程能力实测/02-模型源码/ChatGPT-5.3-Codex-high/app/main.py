from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from app.models import (
    CookieLoginRequest,
    SendCommentRequest,
    SendDanmakuRequest,
    VideoQueryRequest,
)
from app.services import bili_client
from app.services.auth_store import AuthStore

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
load_dotenv(BASE_DIR / ".env")

VERIFY_SSL = os.getenv("BILI_VERIFY_SSL", "false").strip().lower() in {
    "1",
    "true",
    "yes",
}
TIMEOUT_SECONDS = float(os.getenv("BILI_TIMEOUT_SECONDS", "20"))

app = FastAPI(title="Bilibili 视频平台", version="1.0.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)
auth_store = AuthStore(DATA_DIR / "credential.json")

bili_client.configure_network(verify_ssl=VERIFY_SSL, timeout_seconds=TIMEOUT_SECONDS)


def get_logged_credential():
    credential = auth_store.get_credential()
    if not credential:
        raise HTTPException(status_code=401, detail="请先登录后再执行该操作。")
    return credential


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "verify_ssl": VERIFY_SSL, "timeout_seconds": TIMEOUT_SECONDS}


@app.get("/api/hot")
async def api_hot(
    pn: int = Query(default=1, ge=1),
    ps: int = Query(default=12, ge=1, le=30),
):
    try:
        return await bili_client.get_hot_videos(pn=pn, ps=ps)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取热门视频失败：{exc}") from exc


@app.post("/api/video/info")
async def api_video_info(payload: VideoQueryRequest):
    try:
        return await bili_client.get_video_info_bundle(query=payload.query)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取视频信息失败：{exc}") from exc


@app.get("/api/video/comments")
async def api_video_comments(
    query: str,
    page: int = Query(default=1, ge=1),
    order: str = Query(default="time", pattern="^(time|like)$"),
):
    try:
        return await bili_client.get_video_comments(query=query, page=page, order=order)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取评论失败：{exc}") from exc


@app.get("/api/video/danmaku")
async def api_video_danmaku(
    query: str,
    page_index: int = Query(default=0, ge=0),
    from_seg: int = Query(default=1, ge=1),
    to_seg: int = Query(default=1, ge=1),
    limit: int = Query(default=200, ge=1, le=1000),
):
    try:
        return await bili_client.get_video_danmaku(
            query=query,
            page_index=page_index,
            from_seg=from_seg,
            to_seg=to_seg,
            limit=limit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取弹幕失败：{exc}") from exc


@app.post("/api/video/comment/send")
async def api_send_comment(payload: SendCommentRequest):
    credential = get_logged_credential()
    try:
        return await bili_client.send_video_comment(
            query=payload.query,
            text=payload.text.strip(),
            root=payload.root,
            parent=payload.parent,
            credential=credential,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"发送评论失败：{exc}") from exc


@app.post("/api/video/danmaku/send")
async def api_send_danmaku(payload: SendDanmakuRequest):
    credential = get_logged_credential()
    try:
        return await bili_client.send_video_danmaku(
            query=payload.query,
            text=payload.text.strip(),
            page_index=payload.page_index,
            dm_time=payload.dm_time,
            mode=payload.mode,
            font_size=payload.font_size,
            color=payload.color,
            credential=credential,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"发送弹幕失败：{exc}") from exc


@app.get("/api/auth/status")
async def api_auth_status():
    return await auth_store.get_status()


@app.post("/api/auth/login/cookie")
async def api_login_cookie(payload: CookieLoginRequest):
    try:
        user_info = await auth_store.set_cookie_credential(payload.model_dump())
        return {"ok": True, "user": user_info}
    except Exception as exc:
        await auth_store.clear()
        raise HTTPException(status_code=400, detail=f"登录失败：{exc}") from exc


@app.post("/api/auth/logout")
async def api_logout():
    await auth_store.clear()
    return {"ok": True}


@app.post("/api/auth/qr/start")
async def api_qr_start():
    try:
        return await auth_store.start_qr_login()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"二维码生成失败：{exc}") from exc


@app.get("/api/auth/qr/poll")
async def api_qr_poll(session_id: str):
    try:
        return await auth_store.poll_qr_login(session_id=session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"二维码轮询失败：{exc}") from exc


@app.get("/api/me/favorites")
async def api_me_favorites(
    media_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
):
    credential = get_logged_credential()
    try:
        return await bili_client.get_self_favorites(
            credential=credential, media_id=media_id, page=page
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"获取收藏失败：{exc}") from exc
