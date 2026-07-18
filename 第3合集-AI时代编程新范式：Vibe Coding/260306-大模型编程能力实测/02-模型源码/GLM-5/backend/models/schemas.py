from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class APIResponse(BaseModel):
    """统一API响应格式"""
    success: bool = True
    message: str = "操作成功"
    data: Optional[Any] = None
    code: int = 200


class UserInfo(BaseModel):
    """用户信息"""
    mid: int
    name: str
    face: str
    sign: str = ""
    level: int = 0
    vip_status: int = 0
    is_login: bool = False


class VideoInfo(BaseModel):
    """视频信息"""
    bvid: str
    aid: int
    title: str
    description: str
    cover: str
    duration: int
    view_count: int
    danmaku_count: int
    reply_count: int
    like_count: int
    coin_count: int
    share_count: int
    favorite_count: int
    pubdate: int
    owner: UserInfo
    tags: List[str] = []
    page_url: str = ""


class Comment(BaseModel):
    """评论"""
    rpid: int
    content: str
    ctime: int
    like: int
    member: UserInfo
    replies: List["Comment"] = []


class Danmaku(BaseModel):
    """弹幕"""
    id: int
    time: float
    content: str
    color: int
    type: int


class VideoPage(BaseModel):
    """视频分P"""
    cid: int
    page: int
    part: str
    duration: int


class PlayUrl(BaseModel):
    """播放地址"""
    url: str
    quality: int
    quality_desc: str


class FavoriteFolder(BaseModel):
    """收藏夹"""
    id: int
    title: str
    intro: str
    media_count: int
    cover: str


class SearchResult(BaseModel):
    """搜索结果"""
    type: str
    id: str
    title: str
    cover: str
    description: str
    author: str
    play: int
    danmaku: int
    pubdate: int
