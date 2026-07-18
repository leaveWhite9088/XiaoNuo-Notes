from fastapi import FastAPI, HTTPException, Request, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from bilibili_api import video, comment, user, login, sync, Danmaku, Credential
import qrcode
import io
import base64
import uuid
import json
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for credentials (in a real app, use a database or secure session)
sessions = {}

def get_credential(sessdata: str = None):
    if sessdata:
        # Check if we have a full credential stored
        for uid, cred in sessions.items():
            if cred.sessdata == sessdata:
                return cred
        return Credential(sessdata=sessdata)
    return Credential()

@app.get("/api/login/qr_generate")
async def generate_qr():
    login_info = await login.login_get_qrcode()
    url = login_info["url"]
    qrcode_key = login_info["qrcode_key"]
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {"qr_img": f"data:image/png;base64,{img_str}", "qrcode_key": qrcode_key}

@app.get("/api/login/qr_poll")
async def poll_qr(qrcode_key: str):
    res = await login.login_check_qrcode(qrcode_key)
    if res["code"] == 0:
        # Login success
        cred = res["credential"]
        sessions[cred.dedeuserid] = cred
        return {
            "status": "success",
            "sessdata": cred.sessdata,
            "bili_jct": cred.bili_jct,
            "buvid3": cred.buvid3,
            "dedeuserid": cred.dedeuserid
        }
    return {"status": "pending", "message": res["message"]}

@app.get("/api/user/info")
async def get_user_info(sessdata: str = Cookie(None)):
    if not sessdata:
        return {"logged_in": False}
    cred = get_credential(sessdata)
    u = user.User(uid=int(cred.dedeuserid), credential=cred)
    info = await u.get_user_info()
    return {"logged_in": True, "info": info}

@app.get("/api/video/info")
async def get_video_info(bvid: str):
    v = video.Video(bvid=bvid)
    info = await v.get_info()
    return info

@app.get("/api/video/comments")
async def get_comments(bvid: str, page: int = 1):
    v = video.Video(bvid=bvid)
    # Get aid first
    info = await v.get_info()
    aid = info['aid']
    c = comment.Comment(oid=aid, type=comment.ResourceType.VIDEO)
    comments = await c.get_comments(page_index=page)
    return comments

@app.get("/api/video/danmaku")
async def get_danmaku(bvid: str):
    v = video.Video(bvid=bvid)
    dists = await v.get_danmakus()
    # Convert to a format frontend can use
    res = []
    for dm in dists:
        res.append({
            "text": dm.text,
            "time": dm.dm_time,
            "color": dm.color,
            "mode": dm.mode,
            "size": dm.font_size
        })
    return res

@app.post("/api/video/send_comment")
async def send_comment(bvid: str, text: str, sessdata: str = Cookie(None)):
    if not sessdata:
        raise HTTPException(status_code=401, detail="Not logged in")
    cred = get_credential(sessdata)
    v = video.Video(bvid=bvid, credential=cred)
    info = await v.get_info()
    aid = info['aid']
    c = comment.Comment(oid=aid, type=comment.ResourceType.VIDEO, credential=cred)
    await c.send_comment(text)
    return {"status": "success"}

@app.post("/api/video/send_danmaku")
async def send_danmaku(bvid: str, text: str, time: float, sessdata: str = Cookie(None)):
    if not sessdata:
        raise HTTPException(status_code=401, detail="Not logged in")
    cred = get_credential(sessdata)
    v = video.Video(bvid=bvid, credential=cred)
    dm = Danmaku(text=text, dm_time=time)
    await v.send_danmaku(dm)
    return {"status": "success"}

@app.get("/api/user/favorites")
async def get_favorites(sessdata: str = Cookie(None)):
    if not sessdata:
        raise HTTPException(status_code=401, detail="Not logged in")
    cred = get_credential(sessdata)
    u = user.User(uid=int(cred.dedeuserid), credential=cred)
    fav_folders = await u.get_favorite_folders()
    # Get the first folder's content as a demo
    if fav_folders and len(fav_folders['list']) > 0:
        fid = fav_folders['list'][0]['id']
        fav_content = await u.get_favorite_video_items(fid)
        return {"folders": fav_folders, "content": fav_content}
    return {"folders": fav_folders, "content": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
