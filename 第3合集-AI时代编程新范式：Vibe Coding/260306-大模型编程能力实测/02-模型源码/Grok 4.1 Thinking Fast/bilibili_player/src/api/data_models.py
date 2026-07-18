"""
数据模型定义
"""

from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class VideoInfo:
    """视频信息"""
    aid: int
    bvid: str
    cid: int
    title: str
    description: str
    duration: int
    view_count: int
    like_count: int
    coin_count: int
    favorite_count: int
    share_count: int
    reply_count: int
    danmaku_count: int
    uploader_name: str
    uploader_mid: int
    upload_time: datetime
    cover_url: str
    tags: List[str]

@dataclass
class Comment:
    """评论信息"""
    rpid: int
    oid: int
    mid: int
    username: str
    avatar: str
    content: str
    time: datetime
    like_count: int
    count: int
    replies: List['Comment']

@dataclass
class Danmaku:
    """弹幕信息"""
    content: str
    time: float
    mode: int
    fontsize: int
    color: int
    mid: int
    username: str

@dataclass
class UserInfo:
    """用户信息"""
    mid: int
    name: str
    avatar: str
    level: int
    vip_type: int
    vip_status: int
    coins: float
    following: int
    follower: int

@dataclass
class Collection:
    """收藏夹信息"""
    id: int
    title: str
    cover: str
    count: int
    videos: List[VideoInfo]

@dataclass
class PlayUrl:
    """播放地址"""
    url: str
    quality: str
    format: str
    size: int