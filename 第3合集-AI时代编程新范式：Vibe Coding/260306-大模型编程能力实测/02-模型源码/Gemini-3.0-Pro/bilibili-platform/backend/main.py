from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bilibili_api import video, comment, user, login_v2, sync, Credential
import asyncio
import qrcode
import io
import base64
import os
import uuid
from credential_store import save_credential, load_credential
import aiohttp
import ssl
import certifi

# Set SSL Cert
os.environ['SSL_CERT_FILE'] = certifi.where()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Credential
credential = load_credential()

# Login Sessions
login_sessions = {}

class LoginResponse(BaseModel):
    url: str
    qrcode_key: str

@app.get("/api/login/qrcode")
async def get_login_qrcode():
    """Get QR code for login"""
    qr = login_v2.QrCodeLogin()
    # Need to generate
    # We run this in async
    try:
        await qr.generate_qrcode()
    except Exception as e:
        # Fallback if async fails or sync needed (library version dependent)
        # But based on tests it is async
        print(f"Generate QR Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    # Extract info
    # Accessing private members as workaround for library limitations
    try:
        url = qr._QrCodeLogin__qr_link
    except AttributeError:
        # Try to find it in dict
        url = qr.__dict__.get('_QrCodeLogin__qr_link', '')
    
    if not url:
         raise HTTPException(status_code=500, detail="Failed to generate QR URL")

    key = str(uuid.uuid4())
    login_sessions[key] = qr
    
    return {"url": url, "qrcode_key": key}

@app.get("/api/login/poll")
async def poll_login(qrcode_key: str):
    """Poll login status"""
    global credential
    qr = login_sessions.get(qrcode_key)
    if not qr:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        status = await qr.check_state()
        # status is enum QrCodeLoginEvents
        # SCAN, CONFIRM, DONE, FAIL
        
        # Convert enum to string for frontend
        status_str = str(status).split('.')[-1].lower() # e.g. 'scan', 'confirm', 'done'
        
        if status == login_v2.QrCodeLoginEvents.DONE:
            # Get credential
            cred = qr.get_credential()
            credential = cred
            save_credential(cred)
            # Cleanup
            del login_sessions[qrcode_key]
            return {"status": "success"}
        elif status == login_v2.QrCodeLoginEvents.FAIL:
             return {"status": "expired"} # or fail
        else:
             return {"status": status_str}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/user/me")
async def get_my_info():
    if not credential:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        u = user.User(uid=credential.dedeuserid, credential=credential)
        info = await u.get_user_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video/search")
async def search_video(keyword: str):
    from bilibili_api import search
    try:
        # search_by_type(keyword, search_type, page)
        res = await search.search_by_type(keyword, search_type=search.SearchObjectType.VIDEO, page=1)
        return res
    except Exception as e:
        print(f"Search error: {e}")
        return {"result": []}

@app.get("/api/video/{bvid}")
async def get_video_info(bvid: str):
    try:
        v = video.Video(bvid=bvid, credential=credential)
        info = await v.get_info()
        # Get play url
        try:
            # Try to get MP4 (fnval=1)
            play_url = await v.get_download_url(page_index=0, fnval=1)
        except Exception as e:
            print(f"Play URL error: {e}")
            play_url = None
            
        return {"info": info, "play_url": play_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video/{bvid}/comments")
async def get_video_comments(bvid: str):
    try:
        v = video.Video(bvid=bvid, credential=credential)
        # Check if we need aid
        # Usually get_comments needs aid. 
        # But library might handle it if using video object?
        # comment.get_comments(oid, type, page)
        # We need aid.
        info = await v.get_info()
        aid = info['aid']
        comments = await comment.get_comments(aid, comment.ResourceType.VIDEO, 1)
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video/{bvid}/danmaku")
async def get_video_danmaku(bvid: str):
    try:
        v = video.Video(bvid=bvid, credential=credential)
        info = await v.get_info()
        # dms = await v.get_danmaku(0)
        # We need to ensure we pass page_index
        dms = await v.get_danmaku(0)
        return [
            {"text": d.text, "time": d.dm_time, "color": d.color, "mode": d.mode} 
            for d in dms
        ]
    except Exception as e:
        print(f"Danmaku error: {e}")
        return []

class CommentRequest(BaseModel):
    message: str

@app.post("/api/video/{bvid}/comment")
async def send_comment(bvid: str, req: CommentRequest):
    if not credential:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        v = video.Video(bvid=bvid, credential=credential)
        info = await v.get_info()
        aid = info['aid']
        await comment.send_comment(req.message, aid, comment.ResourceType.VIDEO, credential=credential)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DanmakuRequest(BaseModel):
    text: str
    time: float

@app.post("/api/video/{bvid}/danmaku")
async def send_danmaku(bvid: str, req: DanmakuRequest):
    if not credential:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        v = video.Video(bvid=bvid, credential=credential)
        # send_danmaku usually works on Video object
        await v.send_danmaku(req.text, page_index=0, dm_time=req.time) 
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/proxy/video")
async def proxy_video(url: str, request: Request):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Referer": "https://www.bilibili.com/"
    }
    range_header = request.headers.get("Range")
    if range_header:
        headers["Range"] = range_header
    
    # Create a new session for streaming
    # Note: aiohttp session context manager closes connection on exit.
    # We need to stream the content.
    
    # We can't use 'async with' if we yield from it outside.
    # So we manually create session and close it later?
    # Or use a generator that handles closing.
    
    async def stream_generator():
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                # We need to yield headers/status first?
                # FastAPI Response takes status/headers in constructor.
                # But we don't know them until we get response.
                # StreamingResponse allows passing headers, but we need to fetch them first.
                
                # So we must do a HEAD request or just GET and start streaming.
                # But 'async with' block scope issues.
                pass 
                
    # Better approach:
    # Use a custom async iterator that handles the session lifecycle
    # Or just fetch headers with HEAD (if supported) then GET.
    # But video URLs might not support HEAD or might expire.
    
    # Let's use a simple approach: Open session, get response, yield chunks, close session in finally block.
    # But how to pass headers to Response?
    # We have to await the request headers first.
    
    session = aiohttp.ClientSession()
    try:
        resp = await session.get(url, headers=headers)
    except Exception:
        await session.close()
        raise HTTPException(status_code=500, detail="Failed to fetch video")

    async def iter_file():
        try:
            async for chunk in resp.content.iter_chunked(1024*1024):
                yield chunk
        except Exception:
            pass
        finally:
            resp.close()
            await session.close()
            
    response_headers = {
        "Content-Type": resp.headers.get("Content-Type", "video/mp4"),
        "Accept-Ranges": "bytes",
        "Content-Length": resp.headers.get("Content-Length"),
        "Content-Range": resp.headers.get("Content-Range")
    }
    # Filter None values
    response_headers = {k: v for k, v in response_headers.items() if v is not None}

    return Response(
        content=iter_file(),
        status_code=resp.status,
        headers=response_headers,
        media_type=resp.headers.get("Content-Type", "video/mp4")
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
