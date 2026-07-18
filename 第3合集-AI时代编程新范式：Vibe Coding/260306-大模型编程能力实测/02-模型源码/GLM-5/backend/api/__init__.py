"""
API路由初始化
"""
from fastapi import APIRouter

from api.auth import router as auth_router
from api.video import router as video_router
from api.comment import router as comment_router
from api.danmaku import router as danmaku_router
from api.user import router as user_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(video_router)
api_router.include_router(comment_router)
api_router.include_router(danmaku_router)
api_router.include_router(user_router)
