import asyncio
import json
from typing import Dict, List, Optional, Any
import requests


class BilibiliAPI:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": "https://www.bilibili.com/",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
            }
        )

    async def get(self, url: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"请求失败: {e}")
        return None

    async def get_video_info(self, bvid: str) -> Optional[Dict[str, Any]]:
        try:
            url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
            data = await self.get(url)
            if data and data.get("code") == 0:
                return data.get("data")
        except Exception as e:
            print(f"获取视频信息失败: {e}")
        return None

    async def get_video_playurl(
        self, bvid: str, cid: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        try:
            if cid is None:
                info = await self.get_video_info(bvid)
                if info:
                    cid = info.get("cid")
            if cid:
                url = f"https://api.bilibili.com/x/player/playurl?bvid={bvid}&cid={cid}"
                data = await self.get(url)
                if data and data.get("code") == 0:
                    return data.get("data")
        except Exception as e:
            print(f"获取播放地址失败: {e}")
        return None

    async def get_video_danmaku(
        self, bvid: str, cid: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        try:
            if cid is None:
                info = await self.get_video_info(bvid)
                if info:
                    cid = info.get("cid")
            if cid:
                url = f"https://api.bilibili.com/x/v1/dm/list?oid={cid}"
                data = await self.get(url)
                if data and data.get("code") == 0:
                    return data.get("data", [])
        except Exception as e:
            print(f"获取弹幕失败: {e}")
        return []

    async def get_video_comments(
        self, bvid: str, page: int = 1, size: int = 20
    ) -> List[Dict[str, Any]]:
        try:
            url = f"https://api.bilibili.com/x/v2/reply?pn={page}&ps={size}&type=1&oid={bvid}"
            data = await self.get(url)
            if data and data.get("code") == 0:
                return data.get("data", {}).get("replies", [])
        except Exception as e:
            print(f"获取评论失败: {e}")
        return []

    async def search_videos(self, keyword: str, page: int = 1) -> List[Dict[str, Any]]:
        try:
            url = f"https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={keyword}&page={page}"
            data = await self.get(url)
            if data and data.get("code") == 0:
                return data.get("data", {}).get("result", [])
        except Exception as e:
            print(f"搜索视频失败: {e}")
        return []

    async def get_user_info(self, mid: int) -> Optional[Dict[str, Any]]:
        try:
            url = f"https://api.bilibili.com/x/space/wbi/acc/info?mid={mid}"
            data = await self.get(url)
            if data and data.get("code") == 0:
                return data.get("data")
        except Exception as e:
            print(f"获取用户信息失败: {e}")
        return None


bilibili_api = BilibiliAPI()
