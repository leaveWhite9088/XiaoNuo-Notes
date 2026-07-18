"""
用户服务
处理收藏、历史等用户相关功能
"""
from typing import List, Dict, Any, Optional

from bilibili_api import user, favorite_list
from models.schemas import FavoriteFolder, VideoInfo, UserInfo
from services.auth_service import auth_service


class UserService:
    """用户服务"""

    async def get_favorites(self) -> List[FavoriteFolder]:
        """获取收藏夹列表"""
        if not auth_service.is_logged_in():
            return []

        try:
            credential = auth_service.get_credential()
            u = user.User(credential=credential)
            my_info = await u.get_user_info()
            uid = my_info['mid']

            result = await favorite_list.get_video_favorite_list(uid, credential=credential)

            folders = []
            for f in result.get('list', []):
                folders.append(FavoriteFolder(
                    id=f.get('id', 0),
                    title=f.get('title', ''),
                    intro=f.get('intro', ''),
                    media_count=f.get('media_count', 0),
                    cover=f.get('cover', '')
                ))
            return folders
        except Exception as e:
            print(f"获取收藏夹失败: {e}")
            return []

    async def get_favorite_videos(self, folder_id: int, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """获取收藏夹内的视频"""
        if not auth_service.is_logged_in():
            return {'videos': [], 'total': 0}

        try:
            credential = auth_service.get_credential()
            result = await favorite_list.get_video_favorite_list_content(
                folder_id,
                page=page,
                page_size=page_size,
                credential=credential
            )

            videos = []
            for item in result.get('medias', []):
                videos.append({
                    'bvid': item.get('bvid', ''),
                    'aid': item.get('id', 0),
                    'title': item.get('title', ''),
                    'cover': item.get('cover', ''),
                    'duration': item.get('duration', 0) // 1000,  # 毫秒转秒
                    'play': item.get('cnt_info', {}).get('play', 0),
                    'danmaku': item.get('cnt_info', {}).get('danmaku', 0),
                    'intro': item.get('intro', ''),
                    'author': item.get('upper', {}).get('name', '')
                })

            return {
                'videos': videos,
                'total': result.get('media_count', 0),
                'page': page,
                'page_size': page_size
            }
        except Exception as e:
            print(f"获取收藏视频失败: {e}")
            return {'videos': [], 'total': 0}

    async def favorite_video(self, aid: int, folder_ids: List[int] = None) -> Dict[str, Any]:
        """收藏视频"""
        if not auth_service.is_logged_in():
            return {'success': False, 'message': '请先登录'}

        try:
            credential = auth_service.get_credential()

            if folder_ids is None:
                # 获取默认收藏夹
                folders = await self.get_favorites()
                if folders:
                    folder_ids = [folders[0].id]
                else:
                    return {'success': False, 'message': '没有可用的收藏夹'}

            await favorite_list.add_video_to_favorite_list(
                folder_ids,
                aid,
                credential=credential
            )
            return {'success': True, 'message': '收藏成功'}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    async def unfavorite_video(self, aid: int, folder_id: int) -> Dict[str, Any]:
        """取消收藏"""
        if not auth_service.is_logged_in():
            return {'success': False, 'message': '请先登录'}

        try:
            credential = auth_service.get_credential()
            await favorite_list.remove_video_from_favorite_list(
                folder_id,
                [aid],
                credential=credential
            )
            return {'success': True, 'message': '取消收藏成功'}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    async def get_history(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """获取观看历史"""
        if not auth_service.is_logged_in():
            return {'videos': [], 'total': 0}

        try:
            credential = auth_service.get_credential()
            u = user.User(credential=credential)
            result = await u.get_view_history(page_num=page, page_size=page_size)

            videos = []
            for item in result.get('list', {}).get('vlist', []):
                videos.append({
                    'bvid': item.get('bvid', ''),
                    'aid': item.get('aid', 0),
                    'title': item.get('title', ''),
                    'cover': item.get('pic', ''),
                    'duration': item.get('duration', ''),
                    'author': item.get('author', ''),
                    'view_at': item.get('view_at', 0)
                })

            return {
                'videos': videos,
                'total': result.get('list', {}).get('cnt', 0),
                'page': page,
                'page_size': page_size
            }
        except Exception as e:
            print(f"获取历史失败: {e}")
            return {'videos': [], 'total': 0}

    async def get_followings(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """获取关注列表"""
        if not auth_service.is_logged_in():
            return {'users': [], 'total': 0}

        try:
            credential = auth_service.get_credential()
            u = user.User(credential=credential)
            my_info = await u.get_user_info()
            uid = my_info['mid']

            result = await user.get_user_followers(
                uid,
                follow_type=user.FollowType.FOLLOWING,
                page_num=page,
                page_size=page_size
            )

            users = []
            for item in result.get('list', {}).get('follow', []):
                users.append({
                    'mid': item.get('mid', 0),
                    'name': item.get('uname', ''),
                    'face': item.get('face', ''),
                    'sign': item.get('sign', ''),
                    'is_follow': True
                })

            return {
                'users': users,
                'total': result.get('total', 0),
                'page': page,
                'page_size': page_size
            }
        except Exception as e:
            print(f"获取关注失败: {e}")
            return {'users': [], 'total': 0}


# 全局用户服务实例
user_service = UserService()
