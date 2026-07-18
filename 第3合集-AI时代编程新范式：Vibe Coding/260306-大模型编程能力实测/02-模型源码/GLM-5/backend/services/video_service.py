"""
视频服务
处理视频信息获取、播放等
"""
from typing import Optional, List, Dict, Any
from bilibili_api import video, sync
import json

from models.schemas import VideoInfo, UserInfo, PlayUrl, VideoPage
from services.auth_service import auth_service


class VideoService:
    """视频服务"""

    async def get_video_info(self, bvid: str = None, aid: int = None) -> Optional[VideoInfo]:
        """获取视频详情"""
        try:
            v = video.Video(bvid=bvid) if bvid else video.Video(aid=aid)
            info = await v.get_info()

            owner = info.get('owner', {})
            stat = info.get('stat', {})

            # 获取标签
            tags = []
            try:
                tag_info = await v.get_tags()
                tags = [t.get('tag_name', '') for t in tag_info]
            except:
                pass

            return VideoInfo(
                bvid=info.get('bvid', ''),
                aid=info.get('aid', 0),
                title=info.get('title', ''),
                description=info.get('desc', ''),
                cover=info.get('pic', ''),
                duration=info.get('duration', 0),
                view_count=stat.get('view', 0),
                danmaku_count=stat.get('danmaku', 0),
                reply_count=stat.get('reply', 0),
                like_count=stat.get('like', 0),
                coin_count=stat.get('coin', 0),
                share_count=stat.get('share', 0),
                favorite_count=stat.get('favorite', 0),
                pubdate=info.get('pubdate', 0),
                owner=UserInfo(
                    mid=owner.get('mid', 0),
                    name=owner.get('name', ''),
                    face=owner.get('face', ''),
                    sign=owner.get('sign', ''),
                    level=0,
                    vip_status=0,
                    is_login=False
                ),
                tags=tags,
                page_url=f"https://www.bilibili.com/video/{info.get('bvid', '')}"
            )
        except Exception as e:
            print(f"获取视频信息失败: {e}")
            return None

    async def get_video_pages(self, bvid: str = None, aid: int = None) -> List[VideoPage]:
        """获取视频分P"""
        try:
            v = video.Video(bvid=bvid) if bvid else video.Video(aid=aid)
            info = await v.get_info()

            pages = []
            for p in info.get('pages', []):
                pages.append(VideoPage(
                    cid=p.get('cid', 0),
                    page=p.get('page', 1),
                    part=p.get('part', ''),
                    duration=p.get('duration', 0)
                ))
            return pages
        except Exception as e:
            print(f"获取分P失败: {e}")
            return []

    async def get_play_url(self, bvid: str = None, aid: int = None, cid: int = None,
                          quality: int = 64) -> Optional[Dict[str, Any]]:
        """获取播放地址"""
        try:
            credential = auth_service.get_credential()
            v = video.Video(bvid=bvid, credential=credential) if bvid else video.Video(aid=aid, credential=credential)

            if cid is None:
                info = await v.get_info()
                cid = info.get('cid', info.get('pages', [{}])[0].get('cid', 0))

            # 获取播放地址
            url_info = await v.get_download_url(cid=cid, html5=True)

            result = {
                'quality': quality,
                'timelength': url_info.get('timelength', 0),
                'formats': []
            }

            # 处理视频格式
            dash = url_info.get('dash', {})
            if dash:
                # 视频流
                video_info = dash.get('video', [])
                audio_info = dash.get('audio', [])

                result['dash'] = {
                    'video': video_info,
                    'audio': audio_info
                }

            # 备用FLV/HLS地址
            if url_info.get('durl'):
                result['durl'] = url_info['durl']

            return result
        except Exception as e:
            print(f"获取播放地址失败: {e}")
            return None

    async def get_related_videos(self, bvid: str = None, aid: int = None) -> List[Dict[str, Any]]:
        """获取相关视频"""
        try:
            v = video.Video(bvid=bvid) if bvid else video.Video(aid=aid)
            related = await v.get_related()

            videos = []
            for item in related[:20]:  # 限制20个
                videos.append({
                    'bvid': item.get('bvid', ''),
                    'aid': item.get('aid', 0),
                    'title': item.get('title', ''),
                    'cover': item.get('pic', ''),
                    'duration': item.get('duration', 0),
                    'play': item.get('stat', {}).get('view', 0),
                    'danmaku': item.get('stat', {}).get('danmaku', 0),
                    'author': item.get('owner', {}).get('name', '')
                })
            return videos
        except Exception as e:
            print(f"获取相关视频失败: {e}")
            return []

    async def search_videos(self, keyword: str, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """搜索视频"""
        try:
            from bilibili_api import search

            result = await search.search_by_type(
                keyword=keyword,
                search_type=search.SearchObjectType.VIDEO,
                page=page,
                page_size=page_size
            )

            videos = []
            for item in result.get('result', []):
                videos.append({
                    'bvid': item.get('bvid', ''),
                    'aid': item.get('aid', 0),
                    'title': item.get('title', '').replace('<em class="keyword">', '').replace('</em>', ''),
                    'cover': item.get('pic', '').replace('http://', 'https://'),
                    'duration': self._parse_duration(item.get('duration', '')),
                    'play': item.get('play', 0),
                    'danmaku': item.get('danmaku', 0),
                    'author': item.get('author', ''),
                    'description': item.get('description', '')
                })

            return {
                'videos': videos,
                'total': result.get('numResults', 0),
                'page': page,
                'page_size': page_size
            }
        except Exception as e:
            print(f"搜索视频失败: {e}")
            return {'videos': [], 'total': 0, 'page': page, 'page_size': page_size}

    def _parse_duration(self, duration_str: str) -> int:
        """解析时长字符串为秒数"""
        try:
            parts = duration_str.split(':')
            if len(parts) == 2:
                return int(parts[0]) * 60 + int(parts[1])
            elif len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            return 0
        except:
            return 0

    async def get_popular_videos(self, page: int = 1, page_size: int = 20) -> List[Dict[str, Any]]:
        """获取热门视频"""
        try:
            from bilibili_api import homepage

            popular = await homepage.get_popular_videos(page=page)

            videos = []
            for item in popular.get('list', {}).get('list', [])[:page_size]:
                videos.append({
                    'bvid': item.get('bvid', ''),
                    'aid': item.get('aid', 0),
                    'title': item.get('title', ''),
                    'cover': item.get('pic', ''),
                    'duration': item.get('duration', 0),
                    'play': item.get('stat', {}).get('view', 0),
                    'danmaku': item.get('stat', {}).get('danmaku', 0),
                    'author': item.get('owner', {}).get('name', ''),
                    'description': item.get('desc', '')[:100]
                })
            return videos
        except Exception as e:
            print(f"获取热门视频失败: {e}")
            return []


# 全局视频服务实例
video_service = VideoService()
