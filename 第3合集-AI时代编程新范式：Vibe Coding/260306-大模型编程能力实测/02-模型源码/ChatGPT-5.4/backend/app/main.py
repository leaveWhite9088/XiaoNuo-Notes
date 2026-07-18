from __future__ import annotations

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import ApiResponse, SendCommentPayload, SendDanmakuPayload
from .service import bili_service


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=ApiResponse)
async def health() -> ApiResponse:
    return ApiResponse(data={"status": "ok"})


@app.get("/api/home/hot", response_model=ApiResponse)
async def home_hot(page: int = Query(default=1, ge=1)) -> ApiResponse:
    return ApiResponse(data=await bili_service.get_hot_videos(page=page))


@app.get("/api/search", response_model=ApiResponse)
async def video_search(keyword: str = Query(min_length=1), page: int = Query(default=1, ge=1)) -> ApiResponse:
    return ApiResponse(data=await bili_service.search_videos(keyword=keyword, page=page))


@app.get("/api/video/{bvid}", response_model=ApiResponse)
async def video_detail(bvid: str) -> ApiResponse:
    return ApiResponse(data=await bili_service.get_video_detail(bvid=bvid))


@app.get("/api/video/{bvid}/comments", response_model=ApiResponse)
async def video_comments(bvid: str, page: int = Query(default=1, ge=1)) -> ApiResponse:
    return ApiResponse(data=await bili_service.get_comments(bvid=bvid, page=page))


@app.get("/api/video/{bvid}/danmaku", response_model=ApiResponse)
async def video_danmaku(bvid: str, page_index: int = Query(default=0, ge=0)) -> ApiResponse:
    return ApiResponse(data=await bili_service.get_danmaku(bvid=bvid, page_index=page_index))


@app.post("/api/video/{bvid}/comment", response_model=ApiResponse)
async def send_comment(bvid: str, payload: SendCommentPayload) -> ApiResponse:
    return ApiResponse(message="评论发送成功", data=await bili_service.send_comment(bvid=bvid, message=payload.message))


@app.post("/api/video/{bvid}/danmaku", response_model=ApiResponse)
async def send_danmaku(bvid: str, payload: SendDanmakuPayload) -> ApiResponse:
    return ApiResponse(
        message="弹幕发送成功",
        data=await bili_service.send_danmaku(
            bvid=bvid,
            message=payload.message,
            progress_seconds=payload.progress_seconds,
            page_index=payload.page_index,
        ),
    )


@app.get("/api/auth/status", response_model=ApiResponse)
async def auth_status() -> ApiResponse:
    return ApiResponse(data=await bili_service.get_auth_status())


@app.post("/api/auth/login/qrcode", response_model=ApiResponse)
async def create_login_qrcode() -> ApiResponse:
    return ApiResponse(data=await bili_service.create_qrcode_login())


@app.get("/api/auth/login/qrcode/{session_id}", response_model=ApiResponse)
async def poll_login_qrcode(session_id: str) -> ApiResponse:
    return ApiResponse(data=await bili_service.poll_qrcode_login(session_id))


@app.post("/api/auth/logout", response_model=ApiResponse)
async def logout() -> ApiResponse:
    return ApiResponse(message="已退出登录", data=await bili_service.logout())


@app.get("/api/me/profile", response_model=ApiResponse)
async def my_profile() -> ApiResponse:
    return ApiResponse(data=await bili_service.get_my_profile())


@app.get("/api/me/favorites", response_model=ApiResponse)
async def my_favorites(page: int = Query(default=1, ge=1)) -> ApiResponse:
    return ApiResponse(data=await bili_service.get_my_favorites(page=page))
