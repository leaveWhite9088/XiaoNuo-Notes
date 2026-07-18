"""
服务初始化
"""
from services.auth_service import auth_service
from services.video_service import video_service
from services.comment_service import comment_service
from services.danmaku_service import danmaku_service
from services.user_service import user_service

__all__ = [
    'auth_service',
    'video_service',
    'comment_service',
    'danmaku_service',
    'user_service'
]
