"""
Bilibili平台后端API服务
FastAPI实现
"""
import asyncio
import base64
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    from bilibili_api import video, search, homepage, comment, danmaku, user, favorite_list
    from bilibili_api.exceptions import ResponseCodeException
    BILIBILI_API_AVAILABLE = True
except ImportError:
    BILIBILI_API_AVAILABLE = False
    # 定义占位异常类
    class ResponseCodeException(Exception):
        def __init__(self, code=-1, msg='API不可用'):
            self.code = code
            self.msg = msg
            super().__init__(msg)

from backend.mock_data import (
    MOCK_VIDEOS, MOCK_COMMENTS, MOCK_DANMAKU, MOCK_USER,
    MOCK_FAVORITE_FOLDERS, MOCK_HISTORY, get_mock_video, search_mock_videos
)

from backend.config import BASE_DIR, VIDEO_PARTITIONS
from backend.auth_manager import auth_manager


# ============ 数据模型 ============

class CommentRequest(BaseModel):
    oid: int  # 视频aid
    message: str
    type_: int = 1  # 1=视频评论
    root: Optional[int] = None  # 回复评论的根id
    parent: Optional[int] = None  # 回复评论的父id


class DanmakuRequest(BaseModel):
    cid: int  # 视频cid
    msg: str
    page: int = 0
    mode: int = 1  # 1=滚动, 5=顶部, 4=底部
    fontsize: int = 25
    color: int = 16777215  # 白色


class SearchRequest(BaseModel):
    keyword: str
    page: int = 1
    order: str = "totalrank"  # totalrank, click, pubdate, dm


class FavoriteActionRequest(BaseModel):
    rid: int  # 视频aid
    add_media_ids: Optional[str] = None  # 要添加到的收藏夹id,逗号分隔
    del_media_ids: Optional[str] = None  # 要移除的收藏夹id


# ============ 生命周期管理 ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时加载凭证
    await auth_manager.load_credential()
    print("Bilibili平台已启动")
    yield
    # 关闭时清理
    print("Bilibili平台已关闭")


# ============ 创建FastAPI应用 ============

app = FastAPI(
    title="Bilibili视频平台API",
    description="基于bilibili-api-python的B站视频平台",
    version="1.0.0",
    lifespan=lifespan
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ 工具函数 ============

def handle_exception(e: Exception) -> Dict[str, Any]:
    """统一异常处理"""
    if isinstance(e, ResponseCodeException):
        return {"success": False, "code": e.code, "message": e.msg}
    return {"success": False, "message": str(e)}


# ============ API路由 ============

# ------------ 认证相关 ------------

@app.get("/api/auth/status")
async def get_auth_status():
    """获取登录状态"""
    return {"success": True, "data": auth_manager.get_login_status()}


@app.get("/api/auth/qrcode")
async def get_qr_code():
    """获取登录二维码"""
    result = await auth_manager.generate_qr_code()
    return result


@app.get("/api/auth/qrcode/check")
async def check_qr_code():
    """检查二维码登录状态"""
    result = await auth_manager.check_qr_status()
    return result


@app.post("/api/auth/logout")
async def logout():
    """登出"""
    success = await auth_manager.logout()
    return {"success": success}


# ------------ 视频相关 ------------

@app.get("/api/video/info")
async def get_video_info(bvid: Optional[str] = None, aid: Optional[int] = None):
    """获取视频信息"""
    if not BILIBILI_API_AVAILABLE:
        if not bvid:
            bvid = "BV1xx411c7mD"
        return {"success": True, "data": get_mock_video(bvid)}
    
    try:
        if not bvid and not aid:
            raise HTTPException(status_code=400, detail="需要提供bvid或aid")
        
        credential = await auth_manager.get_credential()
        v = video.Video(bvid=bvid, aid=aid, credential=credential)
        info = await v.get_info()
        
        # 获取下载链接
        try:
            download_url_data = await v.get_download_url(page_index=0)
            info["download_url"] = download_url_data
        except Exception as e:
            info["download_url"] = None
        
        return {"success": True, "data": info}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/video/online")
async def get_video_online(bvid: Optional[str] = None, aid: Optional[int] = None, cid: Optional[int] = None):
    """获取视频在线人数"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": {"total": 12856, "count": "1.2万"}}
    try:
        credential = await auth_manager.get_credential()
        v = video.Video(bvid=bvid, aid=aid, credential=credential)
        if cid is None:
            info = await v.get_info()
            cid = info.get("cid", 0)
        online = await v.get_online(cid=cid)
        return {"success": True, "data": online}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/video/related")
async def get_related_videos(bvid: Optional[str] = None, aid: Optional[int] = None):
    """获取相关视频"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_VIDEOS[1:5]}
    try:
        credential = await auth_manager.get_credential()
        v = video.Video(bvid=bvid, aid=aid, credential=credential)
        related = await v.get_related()
        return {"success": True, "data": related}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/video/url")
async def get_video_url(cid: int, bvid: Optional[str] = None):
    """获取视频播放URL"""
    try:
        credential = await auth_manager.get_credential()
        v = video.Video(bvid=bvid, cid=cid, credential=credential)
        url_data = await v.get_download_url()
        return {"success": True, "data": url_data}
    except Exception as e:
        return handle_exception(e)


# ------------ 评论相关 ------------

@app.get("/api/comment/list")
async def get_comments(
    oid: int,
    type_: int = 1,
    page: int = 1,
    mode: int = 3  # 3=热门, 2=最新
):
    """获取评论列表"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_COMMENTS}
    try:
        credential = await auth_manager.get_credential()
        comments = await comment.get_comments(
            oid=oid,
            type_=type_,
            page=page,
            mode=mode,
            credential=credential
        )
        return {"success": True, "data": comments}
    except Exception as e:
        return handle_exception(e)


@app.post("/api/comment/send")
async def send_comment(req: CommentRequest):
    """发送评论"""
    try:
        credential = await auth_manager.get_credential()
        if not credential:
            return {"success": False, "message": "请先登录"}
        
        result = await comment.send_comment(
            oid=req.oid,
            type_=req.type_,
            message=req.message,
            root=req.root,
            parent=req.parent,
            credential=credential
        )
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


# ------------ 弹幕相关 ------------

@app.get("/api/danmaku/list")
async def get_danmaku(cid: int, page: Optional[int] = None, date: Optional[str] = None):
    """获取弹幕列表"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_DANMAKU}
    try:
        credential = await auth_manager.get_credential()
        d = danmaku.Danmaku(cid=cid, page=page, date=date, credential=credential)
        danmaku_list = await d.get_danmakus()
        # 转换为可序列化的格式
        data = []
        for dm in danmaku_list:
            data.append({
                "text": dm.text,
                "dm_time": dm.dm_time,
                "send_time": dm.send_time,
                "crc32_id": dm.crc32_id,
                "mid_hash": dm.mid_hash,
                "color": dm.color,
                "mode": dm.mode,
                "fontsize": dm.fontsize,
                "is_sub": dm.is_sub,
            })
        return {"success": True, "data": data}
    except Exception as e:
        return handle_exception(e)


@app.post("/api/danmaku/send")
async def send_danmaku(req: DanmakuRequest):
    """发送弹幕"""
    try:
        credential = await auth_manager.get_credential()
        if not credential:
            return {"success": False, "message": "请先登录"}
        
        d = danmaku.Danmaku(cid=req.cid, credential=credential)
        result = await d.send_danmaku(
            page=req.page,
            msg=req.msg,
            mode=req.mode,
            fontsize=req.fontsize,
            color=req.color
        )
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


# ------------ 搜索相关 ------------

@app.get("/api/search")
async def search_videos(
    keyword: str,
    page: int = 1,
    order: str = "totalrank",
    search_type: str = "video"
):
    """搜索视频"""
    if not BILIBILI_API_AVAILABLE:
        results = search_mock_videos(keyword)
        return {"success": True, "data": {"result": results}}
    try:
        credential = await auth_manager.get_credential()
        result = await search.search(
            keyword=keyword,
            page=page,
            order=order,
            search_type=search_type,
            credential=credential
        )
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/search/hot")
async def get_hot_search():
    """获取热搜"""
    try:
        result = await search.get_hot_search()
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/search/suggest")
async def get_search_suggest(keyword: str):
    """获取搜索建议"""
    try:
        result = await search.get_suggest_keywords(keyword)
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


# ------------ 首页/推荐 ------------

@app.get("/api/home/videos")
async def get_home_videos(page: int = 1):
    """获取首页推荐视频"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_VIDEOS}
    try:
        credential = await auth_manager.get_credential()
        videos = await homepage.get_videos(credential=credential)
        return {"success": True, "data": videos}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/home/popular")
async def get_popular_videos(page: int = 1):
    """获取热门视频"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": {"list": MOCK_VIDEOS}}
    try:
        credential = await auth_manager.get_credential()
        result = await homepage.get_popular(page=page, credential=credential)
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/partitions")
async def get_partitions():
    """获取视频分区"""
    return {"success": True, "data": VIDEO_PARTITIONS}


@app.get("/api/partition/videos")
async def get_partition_videos(tid: int, page: int = 1, order: str = "pubdate"):
    """获取分区视频"""
    try:
        from bilibili_api import channel_series
        result = await channel_series.get_videos(
            tid=tid,
            page=page,
            order=order
        )
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


# ------------ 用户相关 ------------

@app.get("/api/user/info")
async def get_user_info(mid: Optional[int] = None):
    """获取用户信息"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_USER}
    try:
        credential = await auth_manager.get_credential()
        
        # 如果没有指定mid，获取当前登录用户信息
        if mid is None:
            if not credential:
                return {"success": False, "message": "请先登录或提供用户ID"}
            u = user.User(credential=credential)
        else:
            u = user.User(uid=mid, credential=credential)
        
        info = await u.get_user_info()
        return {"success": True, "data": info}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/user/videos")
async def get_user_videos(mid: int, page: int = 1, keyword: str = ""):
    """获取用户投稿视频"""
    try:
        credential = await auth_manager.get_credential()
        u = user.User(uid=mid, credential=credential)
        videos = await u.get_videos(page=page, keyword=keyword)
        return {"success": True, "data": videos}
    except Exception as e:
        return handle_exception(e)


# ------------ 收藏相关 ------------

@app.get("/api/favorite/folders")
async def get_favorite_folders(up_mid: Optional[int] = None):
    """获取收藏夹列表"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_FAVORITE_FOLDERS}
    try:
        credential = await auth_manager.get_credential()
        if not credential and not up_mid:
            return {"success": False, "message": "请先登录或提供用户ID"}
        
        folders = await favorite_list.get_video_favorite_list(
            uid=up_mid,
            credential=credential
        )
        return {"success": True, "data": folders}
    except Exception as e:
        return handle_exception(e)


@app.get("/api/favorite/videos")
async def get_favorite_videos(media_id: int, page: int = 1):
    """获取收藏夹视频"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": {"medias": MOCK_VIDEOS}}
    try:
        credential = await auth_manager.get_credential()
        fav = favorite_list.FavoriteList(media_id=media_id, credential=credential)
        videos = await fav.get_videos(page=page)
        return {"success": True, "data": videos}
    except Exception as e:
        return handle_exception(e)


@app.post("/api/favorite/video")
async def favorite_video_action(req: FavoriteActionRequest):
    """收藏/取消收藏视频"""
    try:
        credential = await auth_manager.get_credential()
        if not credential:
            return {"success": False, "message": "请先登录"}
        
        result = await favorite_list.FavoriteList(
            media_id=0,  # 占位
            credential=credential
        ).modify_video_resource(
            rid=req.rid,
            add_media_ids=req.add_media_ids,
            del_media_ids=req.del_media_ids
        )
        return {"success": True, "data": result}
    except Exception as e:
        return handle_exception(e)


# ------------ 历史记录 ------------

@app.get("/api/history/list")
async def get_history_list(page: int = 1):
    """获取观看历史"""
    if not BILIBILI_API_AVAILABLE:
        return {"success": True, "data": MOCK_HISTORY}
    try:
        credential = await auth_manager.get_credential()
        if not credential:
            return {"success": False, "message": "请先登录"}
        
        from bilibili_api import history
        hist = await history.get_history(page=page, credential=credential)
        return {"success": True, "data": hist}
    except Exception as e:
        return handle_exception(e)


# ============ 静态文件服务 ============

app.mount("/", StaticFiles(directory=str(BASE_DIR / "frontend"), html=True), name="static")


# ============ 启动入口 ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )