import asyncio
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from bilibili_api import login_v2, video, Credential, comment
from bilibili_api.login_v2 import QrCodeLogin, QrCodeLoginEvents
import json
import os

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

qr_login = None
credential = None

@app.get("/")
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/video.html")
async def read_video():
    with open("static/video.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/login/qr")
async def get_login_qr():
    global qr_login
    qr_login = QrCodeLogin()
    await qr_login.generate_qrcode()
    qr_link = getattr(qr_login, '_QrCodeLogin__qr_link', None)
    return {"status": "ok", "url": qr_link}

@app.get("/api/login/check")
async def check_login():
    global qr_login, credential
    if not qr_login:
        return {"status": "error", "message": "No QR generated"}
    
    state = await qr_login.check_state()
    if state == QrCodeLoginEvents.DONE:
        credential = qr_login.get_credential()
        cred_dict = {
            "sessdata": credential.sessdata,
            "bili_jct": credential.bili_jct,
            "buvid3": credential.buvid3,
            "dedeuserid": credential.dedeuserid,
            "ac_time_value": credential.ac_time_value
        }
        with open("cred.json", "w") as f:
            json.dump(cred_dict, f)
        return {"status": "done"}
    elif state == QrCodeLoginEvents.SCAN:
        return {"status": "scan"}
    elif state == QrCodeLoginEvents.CONFIRM:
        return {"status": "confirm"}
    else:
        return {"status": "wait"}

@app.get("/api/user/status")
async def user_status():
    global credential
    if credential:
        try:
            valid = await credential.check_valid()
            if valid:
                return {"status": "ok", "logged_in": True}
        except:
            pass
    return {"status": "ok", "logged_in": False}

@app.on_event("startup")
async def startup_event():
    global credential
    if os.path.exists("cred.json"):
        with open("cred.json", "r") as f:
            cred_dict = json.load(f)
            credential = Credential(
                sessdata=cred_dict.get("sessdata"),
                bili_jct=cred_dict.get("bili_jct"),
                buvid3=cred_dict.get("buvid3"),
                dedeuserid=cred_dict.get("dedeuserid"),
                ac_time_value=cred_dict.get("ac_time_value")
            )
            try:
                valid = await credential.check_valid()
                if not valid:
                    credential = None
            except:
                credential = None

@app.get("/api/video/info")
async def get_video_info(bvid: str):
    v = video.Video(bvid=bvid, credential=credential)
    try:
        info = await v.get_info()
        return {"status": "ok", "data": info}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/video/playurl")
async def get_video_playurl(bvid: str, cid: int):
    v = video.Video(bvid=bvid, credential=credential)
    try:
        url_data = await v.get_download_url(cid=cid, page_index=0)
        return {"status": "ok", "data": url_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/video/comments")
async def get_video_comments(bvid: str):
    v = video.Video(bvid=bvid, credential=credential)
    try:
        info = await v.get_info()
        aid = info['aid']
        # Get page 1 comments
        comments = await comment.get_comments(aid, comment.ResourceType.VIDEO, 1, credential=credential)
        return {"status": "ok", "data": comments}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/video/comment")
async def post_video_comment(request: Request):
    data = await request.json()
    bvid = data.get("bvid")
    text = data.get("text")
    if not credential:
        return {"status": "error", "message": "未登录"}
    v = video.Video(bvid=bvid, credential=credential)
    try:
        info = await v.get_info()
        aid = info['aid']
        res = await comment.send_comment(text, aid, comment.ResourceType.VIDEO, credential=credential)
        return {"status": "ok", "data": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}
