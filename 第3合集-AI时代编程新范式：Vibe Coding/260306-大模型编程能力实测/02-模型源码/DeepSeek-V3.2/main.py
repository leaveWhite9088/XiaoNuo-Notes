#!/usr/bin/env python3
"""
Bilibili视频平台 - 主入口文件
基于bilibili-api库开发的B站风格视频平台
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.routes import auth, video, user, comment

app = FastAPI(
    title="Bilibili视频平台",
    description="基于bilibili-api开发的B站风格视频平台",
    version="1.0.0",
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 配置模板
app.templates = Jinja2Templates(directory="templates")

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(video.router, prefix="/api/video", tags=["视频"])
app.include_router(user.router, prefix="/api/user", tags=["用户"])
app.include_router(comment.router, prefix="/api/comment", tags=["评论"])


@app.get("/")
async def root():
    """首页"""
    return {"message": "欢迎使用Bilibili视频平台"}


# 启动命令: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
