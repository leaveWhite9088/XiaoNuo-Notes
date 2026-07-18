from .auth import router as auth_router
from .video import router as video_router
from .user import router as user_router
from .comment import router as comment_router

__all__ = ["auth_router", "video_router", "user_router", "comment_router"]
