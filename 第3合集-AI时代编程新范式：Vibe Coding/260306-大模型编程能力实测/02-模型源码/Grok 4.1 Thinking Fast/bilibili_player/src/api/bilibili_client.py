"""
Bilibili API客户端
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime

from bilibili_api import video, Credential
from bilibili_api.comment import Comment, ResourceType
from bilibili_api import user
from bilibili_api.video import Video
from bilibili_api.exceptions import ApiException

from .data_models import VideoInfo, Comment, Danmaku, Collection, PlayUrl
from .auth_manager import auth_manager

class BilibiliClient:
    """Bilibili API客户端"""

    def __init__(self):
        self.credential = auth_manager.get_credential()

    async def get_video_info(self, bvid: str) -> Optional[VideoInfo]:
        """获取视频信息"""
        try:
            v = video.Video(bvid=bvid, credential=self.credential)
            info = await v.get_info()

            return VideoInfo(
                aid=info['aid'],
                bvid=info['bvid'],
                cid=info['cid'],
                title=info['title'],
                description=info['desc'],
                duration=info['duration'],
                view_count=info['stat']['view'],
                like_count=info['stat']['like'],
                coin_count=info['stat']['coin'],
                favorite_count=info['stat']['favorite'],
                share_count=info['stat']['share'],
                reply_count=info['stat']['reply'],
                danmaku_count=info['stat']['danmaku'],
                uploader_name=info['owner']['name'],
                uploader_mid=info['owner']['mid'],
                upload_time=datetime.fromtimestamp(info['pubdate']),
                cover_url=info['pic'],
                tags=[tag['tag_name'] for tag in info.get('tags', [])]
            )
        except Exception as e:
            print(f"获取视频信息失败: {e}")
            return None

    async def get_video_comments(self, oid: int, page: int = 1) -> List[Comment]:
        """获取视频评论"""
        try:
            c = comment.Comment(ResourceType.VIDEO, oid, credential=self.credential)
            comments_data = await c.get_comments(page=page)

            comments = []
            for item in comments_data:
                replies = []
                if item.get('replies'):
                    for reply in item['replies'][:3]:  # 只获取前3个回复
                        replies.append(Comment(
                            rpid=reply['rpid'],
                            oid=reply['oid'],
                            mid=reply['mid'],
                            username=reply['member']['uname'],
                            avatar=reply['member']['avatar'],
                            content=reply['content']['message'],
                            time=datetime.fromtimestamp(reply['ctime']),
                            like_count=reply['like'],
                            count=reply['count'],
                            replies=[]
                        ))

                comment_obj = Comment(
                    rpid=item['rpid'],
                    oid=item['oid'],
                    mid=item['mid'],
                    username=item['member']['uname'],
                    avatar=item['member']['avatar'],
                    content=item['content']['message'],
                    time=datetime.fromtimestamp(item['ctime']),
                    like_count=item['like'],
                    count=item['count'],
                    replies=replies
                )
                comments.append(comment_obj)

            return comments
        except Exception as e:
            print(f"获取评论失败: {e}")
            return []

    async def get_video_danmaku(self, cid: int) -> List[Danmaku]:
        """获取视频弹幕"""
        try:
            v = video.Video(cid=cid, credential=self.credential)
            danmaku_data = await v.get_danmaku()

            danmakus = []
            for item in danmaku_data:
                danmaku_obj = Danmaku(
                    content=item['content'],
                    time=float(item['progress']) / 1000,  # 转换为秒
                    mode=item['mode'],
                    fontsize=item['fontsize'],
                    color=item['color'],
                    mid=item.get('mid', 0),
                    username=item.get('uname', '')
                )
                danmakus.append(danmaku_obj)

            return danmakus
        except Exception as e:
            print(f"获取弹幕失败: {e}")
            return []

    async def get_play_url(self, bvid: str, cid: int) -> Optional[PlayUrl]:
        """获取播放地址"""
        try:
            v = video.Video(bvid=bvid, credential=self.credential)
            play_info = await v.get_download_url(cid=cid)

            # 获取最佳质量的视频流
            video_stream = play_info['dash']['video'][0]  # 选择第一个（通常是最高质量）
            audio_stream = play_info['dash']['audio'][0]  # 选择第一个音频流

            return PlayUrl(
                url=video_stream['base_url'],
                quality=f"{video_stream['height']}P",
                format=video_stream['codecs'],
                size=video_stream['size']
            )
        except Exception as e:
            print(f"获取播放地址失败: {e}")
            return None

    async def send_comment(self, oid: int, content: str) -> bool:
        """发送评论"""
        if not self.credential:
            return False

        try:
            c = comment.Comment(comment.ResourceType.VIDEO, oid, credential=self.credential)
            result = await c.send_comment(content)
            return result['success']
        except Exception as e:
            print(f"发送评论失败: {e}")
            return False

    async def send_danmaku(self, cid: int, content: str, progress: float) -> bool:
        """发送弹幕"""
        if not self.credential:
            return False

        try:
            v = Video(cid=cid, credential=self.credential)
            result = await v.send_danmaku(
                text=content,
                dm_time=int(progress * 1000),  # 转换为毫秒
                color=0xffffff,  # 白色
                fontsize=25
            )
            return True  # 假设发送成功
        except Exception as e:
            print(f"发送弹幕失败: {e}")
            return False

    async def get_user_collections(self) -> List[Collection]:
        """获取用户收藏夹"""
        if not self.credential:
            return []

        try:
            u = user.User(auth_manager.user_info.mid, credential=self.credential)
            collections_data = await u.get_favorite_list()

            collections = []
            for item in collections_data['list']:
                collection = Collection(
                    id=item['id'],
                    title=item['title'],
                    cover=item['cover'],
                    count=item['count'],
                    videos=[]  # 暂时不加载视频列表
                )
                collections.append(collection)

            return collections
        except Exception as e:
            print(f"获取收藏夹失败: {e}")
            return []

    async def get_collection_videos(self, collection_id: int) -> List[VideoInfo]:
        """获取收藏夹中的视频"""
        if not self.credential:
            return []

        try:
            u = user.User(auth_manager.user_info.mid, credential=self.credential)
            videos_data = await u.get_favorite_list_content(collection_id)

            videos = []
            for item in videos_data['medias']:
                video_info = VideoInfo(
                    aid=item['id'],
                    bvid=item['bvid'],
                    cid=0,  # 收藏夹中可能没有cid
                    title=item['title'],
                    description=item.get('desc', ''),
                    duration=item['duration'],
                    view_count=item['cnt_info']['play'],
                    like_count=item['cnt_info']['thumb_up'],
                    coin_count=item['cnt_info']['coin'],
                    favorite_count=item['cnt_info']['collect'],
                    share_count=item['cnt_info']['share'],
                    reply_count=0,
                    danmaku_count=item['cnt_info']['danmaku'],
                    uploader_name=item['upper']['name'],
                    uploader_mid=item['upper']['mid'],
                    upload_time=datetime.fromtimestamp(item['pubtime']),
                    cover_url=item['cover'],
                    tags=[]
                )
                videos.append(video_info)

            return videos
        except Exception as e:
            print(f"获取收藏夹视频失败: {e}")
            return []

# 全局API客户端实例
bilibili_client = BilibiliClient()