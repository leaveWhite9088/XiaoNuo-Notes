"""
Bilibili 视频平台 - 后端服务
基于 FastAPI + bilibili-api-python
"""

import asyncio
import base64
import io
import json
import os
import ssl
import time
from typing import Optional

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

import qrcode
import uvicorn
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from bilibili_api import (
    Credential,
    comment,
    favorite_list,
    hot,
    search,
    user,
    video,
)
from bilibili_api.login_v2 import QrCodeLogin, QrCodeLoginEvents

app = FastAPI(title="Bilibili 视频平台")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ── 全局状态 ──────────────────────────────────────────────────────────
credential: Optional[Credential] = None
qr_login_instance: Optional[QrCodeLogin] = None


def _cred() -> Optional[Credential]:
    return credential


# ── 页面路由 ──────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# ── 热门视频 ──────────────────────────────────────────────────────────
@app.get("/api/hot")
async def get_hot_videos(pn: int = 1):
    try:
        result = await hot.get_hot_videos(pn=pn)
        vlist = []
        for item in result.get("list", []):
            vlist.append({
                "bvid": item.get("bvid", ""),
                "title": item.get("title", ""),
                "pic": item.get("pic", ""),
                "desc": item.get("desc", ""),
                "duration": item.get("duration", 0),
                "view": item.get("stat", {}).get("view", 0),
                "danmaku": item.get("stat", {}).get("danmaku", 0),
                "like": item.get("stat", {}).get("like", 0),
                "coin": item.get("stat", {}).get("coin", 0),
                "favorite": item.get("stat", {}).get("favorite", 0),
                "share": item.get("stat", {}).get("share", 0),
                "reply": item.get("stat", {}).get("reply", 0),
                "owner_name": item.get("owner", {}).get("name", ""),
                "owner_face": item.get("owner", {}).get("face", ""),
                "owner_mid": item.get("owner", {}).get("mid", 0),
                "pubdate": item.get("pubdate", 0),
                "rcmd_reason": item.get("rcmd_reason", {}).get("content", ""),
            })
        return {"code": 0, "data": vlist}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 搜索视频 ──────────────────────────────────────────────────────────
@app.get("/api/search")
async def search_videos(keyword: str = Query(...), page: int = 1):
    try:
        result = await search.search_by_type(
            keyword=keyword,
            search_type=search.SearchObjectType.VIDEO,
            page=page,
        )
        vlist = []
        for item in result.get("result", []):
            title = item.get("title", "")
            title = title.replace('<em class="keyword">', "").replace("</em>", "")
            vlist.append({
                "bvid": item.get("bvid", ""),
                "title": title,
                "pic": "https:" + item.get("pic", "") if item.get("pic", "").startswith("//") else item.get("pic", ""),
                "desc": item.get("description", ""),
                "duration": item.get("duration", ""),
                "view": item.get("play", 0),
                "danmaku": item.get("danmaku", 0),
                "like": item.get("like", 0),
                "owner_name": item.get("author", ""),
                "owner_face": "",
                "owner_mid": item.get("mid", 0),
                "pubdate": item.get("pubdate", 0),
            })
        return {"code": 0, "data": vlist, "total": result.get("numResults", 0)}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 视频详情 ──────────────────────────────────────────────────────────
@app.get("/api/video/info/{bvid}")
async def get_video_info(bvid: str):
    try:
        v = video.Video(bvid=bvid, credential=_cred())
        info = await v.get_info()
        return {
            "code": 0,
            "data": {
                "bvid": info.get("bvid", ""),
                "aid": info.get("aid", 0),
                "cid": info.get("cid", 0),
                "title": info.get("title", ""),
                "pic": info.get("pic", ""),
                "desc": info.get("desc", ""),
                "duration": info.get("duration", 0),
                "pubdate": info.get("pubdate", 0),
                "view": info.get("stat", {}).get("view", 0),
                "danmaku": info.get("stat", {}).get("danmaku", 0),
                "like": info.get("stat", {}).get("like", 0),
                "coin": info.get("stat", {}).get("coin", 0),
                "favorite": info.get("stat", {}).get("favorite", 0),
                "share": info.get("stat", {}).get("share", 0),
                "reply": info.get("stat", {}).get("reply", 0),
                "owner_name": info.get("owner", {}).get("name", ""),
                "owner_face": info.get("owner", {}).get("face", ""),
                "owner_mid": info.get("owner", {}).get("mid", 0),
                "pages": [
                    {"cid": p["cid"], "part": p["part"], "page": p["page"]}
                    for p in info.get("pages", [])
                ],
                "tname": info.get("tname", ""),
            },
        }
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 相关视频 ──────────────────────────────────────────────────────────
@app.get("/api/video/related/{bvid}")
async def get_related_videos(bvid: str):
    try:
        v = video.Video(bvid=bvid, credential=_cred())
        result = await v.get_related()
        vlist = []
        for item in result[:20]:
            vlist.append({
                "bvid": item.get("bvid", ""),
                "title": item.get("title", ""),
                "pic": item.get("pic", ""),
                "duration": item.get("duration", 0),
                "view": item.get("stat", {}).get("view", 0),
                "danmaku": item.get("stat", {}).get("danmaku", 0),
                "owner_name": item.get("owner", {}).get("name", ""),
                "owner_face": item.get("owner", {}).get("face", ""),
            })
        return {"code": 0, "data": vlist}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 评论 ──────────────────────────────────────────────────────────────
@app.get("/api/video/comments/{bvid}")
async def get_video_comments(bvid: str, page: int = 1):
    try:
        v = video.Video(bvid=bvid, credential=_cred())
        info = await v.get_info()
        aid = info["aid"]
        result = await comment.get_comments(
            oid=aid,
            type_=comment.CommentResourceType.VIDEO,
            page_index=page,
            order=comment.OrderType.LIKE,
            credential=_cred(),
        )
        clist = []
        for c in result.get("replies", []) or []:
            replies = []
            for r in (c.get("replies") or []):
                replies.append({
                    "uname": r.get("member", {}).get("uname", ""),
                    "avatar": r.get("member", {}).get("avatar", ""),
                    "content": r.get("content", {}).get("message", ""),
                    "like": r.get("like", 0),
                    "ctime": r.get("ctime", 0),
                    "mid": r.get("member", {}).get("mid", 0),
                })
            clist.append({
                "rpid": c.get("rpid", 0),
                "uname": c.get("member", {}).get("uname", ""),
                "avatar": c.get("member", {}).get("avatar", ""),
                "content": c.get("content", {}).get("message", ""),
                "like": c.get("like", 0),
                "rcount": c.get("rcount", 0),
                "ctime": c.get("ctime", 0),
                "mid": c.get("member", {}).get("mid", 0),
                "replies": replies,
            })
        return {
            "code": 0,
            "data": clist,
            "total": result.get("page", {}).get("count", 0),
        }
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 弹幕 ──────────────────────────────────────────────────────────────
@app.get("/api/video/danmaku/{bvid}")
async def get_video_danmaku(bvid: str, page_index: int = 0):
    try:
        v = video.Video(bvid=bvid, credential=_cred())
        dms = await v.get_danmakus(page_index=page_index)
        dlist = []
        for dm in dms[:500]:
            dlist.append({
                "text": dm.text,
                "dm_time": dm.dm_time,
                "send_time": dm.send_time,
                "color": f"#{dm.color:06x}" if isinstance(dm.color, int) else str(dm.color),
                "mode": dm.mode.value if hasattr(dm.mode, "value") else dm.mode,
                "font_size": dm.font_size.value if hasattr(dm.font_size, "value") else dm.font_size,
            })
        dlist.sort(key=lambda x: x["dm_time"])
        return {"code": 0, "data": dlist}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 发送评论 ──────────────────────────────────────────────────────────
@app.post("/api/comment/send")
async def send_comment_api(request: Request):
    if not _cred():
        return {"code": -1, "msg": "请先登录"}
    try:
        body = await request.json()
        bvid = body.get("bvid")
        text = body.get("text", "")
        root = body.get("root", 0)  # 0 = 新评论, >0 = 回复

        v = video.Video(bvid=bvid, credential=_cred())
        info = await v.get_info()
        aid = info["aid"]

        if root:
            result = await comment.send_comment(
                text=text,
                oid=aid,
                type_=comment.CommentResourceType.VIDEO,
                root=root,
                credential=_cred(),
            )
        else:
            result = await comment.send_comment(
                text=text,
                oid=aid,
                type_=comment.CommentResourceType.VIDEO,
                credential=_cred(),
            )
        return {"code": 0, "data": result}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 发送弹幕 ──────────────────────────────────────────────────────────
@app.post("/api/danmaku/send")
async def send_danmaku_api(request: Request):
    if not _cred():
        return {"code": -1, "msg": "请先登录"}
    try:
        from bilibili_api import danmaku as dm_module

        body = await request.json()
        bvid = body.get("bvid")
        text = body.get("text", "")
        dm_time = body.get("dm_time", 0.0)

        v = video.Video(bvid=bvid, credential=_cred())
        info = await v.get_info()

        d = dm_module.Danmaku(text=text, dm_time=dm_time)
        result = await v.send_danmaku(danmaku=d)
        return {"code": 0, "data": result}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 二维码登录 ────────────────────────────────────────────────────────
@app.get("/api/login/qrcode/generate")
async def generate_qrcode():
    global qr_login_instance
    try:
        qr_login_instance = QrCodeLogin()
        await qr_login_instance.generate_qrcode()
        url = qr_login_instance.get_qrcode_url()

        img = qrcode.make(url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode()

        return {"code": 0, "data": {"qrcode": f"data:image/png;base64,{b64}"}}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


@app.get("/api/login/qrcode/check")
async def check_qrcode():
    global credential, qr_login_instance
    if not qr_login_instance:
        return {"code": -1, "msg": "请先生成二维码"}
    try:
        state = await qr_login_instance.check_state()
        if state == QrCodeLoginEvents.DONE:
            credential = qr_login_instance.get_credential()
            qr_login_instance = None
            return {"code": 0, "data": {"status": "done"}}
        elif state == QrCodeLoginEvents.SCAN:
            return {"code": 0, "data": {"status": "scanned"}}
        elif state == QrCodeLoginEvents.TIMEOUT:
            return {"code": 0, "data": {"status": "timeout"}}
        else:
            return {"code": 0, "data": {"status": "waiting"}}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 手动凭据登录 ──────────────────────────────────────────────────────
@app.post("/api/login/credential")
async def login_with_credential(request: Request):
    global credential
    try:
        body = await request.json()
        sessdata = body.get("sessdata", "")
        bili_jct = body.get("bili_jct", "")
        buvid3 = body.get("buvid3", "")

        if not sessdata or not bili_jct:
            return {"code": -1, "msg": "SESSDATA 和 bili_jct 不能为空"}

        credential = Credential(
            sessdata=sessdata,
            bili_jct=bili_jct,
            buvid3=buvid3,
        )
        return {"code": 0, "msg": "登录成功"}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 登录状态 ──────────────────────────────────────────────────────────
@app.get("/api/login/status")
async def login_status():
    if not _cred():
        return {"code": 0, "data": {"logged_in": False}}
    try:
        u = user.User(credential=_cred(), uid=0)
        info = await user.get_self_info(credential=_cred())
        return {
            "code": 0,
            "data": {
                "logged_in": True,
                "uid": info.get("mid", 0),
                "uname": info.get("name", ""),
                "face": info.get("face", ""),
                "level": info.get("level", 0),
                "sign": info.get("sign", ""),
                "vip_type": info.get("vip", {}).get("type", 0),
                "coins": info.get("coins", 0),
            },
        }
    except Exception:
        return {"code": 0, "data": {"logged_in": False}}


# ── 退出登录 ──────────────────────────────────────────────────────────
@app.post("/api/logout")
async def logout():
    global credential
    credential = None
    return {"code": 0, "msg": "已退出登录"}


# ── 收藏夹列表 ────────────────────────────────────────────────────────
@app.get("/api/user/favorites")
async def get_user_favorites():
    if not _cred():
        return {"code": -1, "msg": "请先登录"}
    try:
        info = await user.get_self_info(credential=_cred())
        uid = info["mid"]
        result = await favorite_list.get_video_favorite_list(
            uid=uid, credential=_cred()
        )
        fav_list = []
        for item in result.get("list", []) or []:
            fav_list.append({
                "id": item.get("id", 0),
                "title": item.get("title", ""),
                "media_count": item.get("media_count", 0),
                "cover": item.get("cover", ""),
            })
        return {"code": 0, "data": fav_list}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 收藏夹内视频 ──────────────────────────────────────────────────────
@app.get("/api/user/favorites/{media_id}")
async def get_favorite_videos(media_id: int, pn: int = 1):
    if not _cred():
        return {"code": -1, "msg": "请先登录"}
    try:
        fl = favorite_list.FavoriteList(media_id=media_id, credential=_cred())
        result = await fl.get_content_list(page=pn)
        vlist = []
        for item in result.get("medias", []) or []:
            vlist.append({
                "bvid": item.get("bvid", ""),
                "title": item.get("title", ""),
                "pic": item.get("cover", ""),
                "duration": item.get("duration", 0),
                "view": item.get("cnt_info", {}).get("play", 0),
                "danmaku": item.get("cnt_info", {}).get("danmaku", 0),
                "owner_name": item.get("upper", {}).get("name", ""),
                "owner_face": item.get("upper", {}).get("face", ""),
            })
        return {"code": 0, "data": vlist, "total": result.get("info", {}).get("media_count", 0)}
    except Exception as e:
        return {"code": -1, "msg": str(e)}


# ── 启动 ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
