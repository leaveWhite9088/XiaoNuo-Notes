from __future__ import annotations

import base64
import json
import re
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from bilibili_api import Credential, Danmaku, DanmakuClosedException, ResponseCodeException, comment, favorite_list, hot, login_v2, search, user, video
from fastapi import HTTPException

from .config import settings


TAG_RE = re.compile(r"<[^>]+>")


def clean_html(text: str) -> str:
    return TAG_RE.sub("", text or "")


def format_count(value: int | None) -> str:
    if value is None:
        return "0"
    if value >= 100_000_000:
        return f"{value / 100_000_000:.1f}亿"
    if value >= 10_000:
        return f"{value / 10_000:.1f}万"
    return str(value)


@dataclass
class LoginSession:
    qr: login_v2.QrCodeLogin
    created_at: float
    status: str = "pending"


class CredentialStore:
    def __init__(self, path: Path):
        self.path = path

    def load(self) -> Credential | None:
        if not self.path.exists():
            return None
        payload = json.loads(self.path.read_text(encoding="utf-8"))
        if not payload:
            return None
        return Credential.from_cookies(payload)

    def save(self, credential: Credential) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps(credential.get_cookies(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def clear(self) -> None:
        if self.path.exists():
            self.path.unlink()


class BiliService:
    def __init__(self) -> None:
        self.credential_store = CredentialStore(settings.credential_file)
        self.login_sessions: dict[str, LoginSession] = {}

    def get_credential(self, required: bool = False) -> Credential | None:
        credential = self.credential_store.load()
        if required and credential is None:
            raise HTTPException(status_code=401, detail="当前未登录")
        return credential

    async def get_hot_videos(self, page: int = 1, page_size: int = 12) -> dict[str, Any]:
        result = await self._run_bili(hot.get_hot_videos(pn=page, ps=page_size))
        return {
            "items": [self._map_hot_video(item) for item in result.get("list", [])],
            "page": page,
            "page_size": page_size,
        }

    async def search_videos(self, keyword: str, page: int = 1) -> dict[str, Any]:
        result = await self._run_bili(
            search.search_by_type(
                keyword,
                search_type=search.SearchObjectType.VIDEO,
                page=page,
                page_size=12,
            )
        )
        return {
            "items": [self._map_search_item(item) for item in result.get("result", [])],
            "page": result.get("page", page),
            "num_pages": result.get("numPages", 1),
            "num_results": result.get("numResults", 0),
        }

    async def get_video_detail(self, bvid: str) -> dict[str, Any]:
        target = video.Video(bvid=bvid, credential=self.get_credential())
        info = await self._run_bili(target.get_info(), default_message="视频详情获取失败")
        return self._map_video_detail(info)

    async def get_comments(self, bvid: str, page: int = 1) -> dict[str, Any]:
        target = video.Video(bvid=bvid, credential=self.get_credential())
        info = await self._run_bili(target.get_info(), default_message="评论获取失败")
        result = await self._run_bili(
            comment.get_comments(
                oid=info["aid"],
                type_=comment.CommentResourceType.VIDEO,
                page_index=page,
                credential=self.get_credential(),
            ),
            default_message="评论获取失败",
        )
        replies = result.get("replies") or []
        return {
            "page": page,
            "total": result.get("page", {}).get("count", 0),
            "items": [self._map_comment_item(item) for item in replies],
        }

    async def get_danmaku(self, bvid: str, page_index: int = 0) -> dict[str, Any]:
        target = video.Video(bvid=bvid, credential=self.get_credential())
        info = await self._run_bili(target.get_info(), default_message="弹幕获取失败")
        try:
            danmakus = await target.get_danmakus(page_index=page_index)
        except DanmakuClosedException:
            return {
                "cid": info["pages"][page_index]["cid"],
                "page_index": page_index,
                "total_loaded": 0,
                "closed": True,
                "items": [],
            }
        except Exception as exc:
            self._raise_bili_error(exc, default_message="弹幕获取失败")
        items = []
        for item in danmakus[: settings.danmaku_limit]:
            items.append(
                {
                    "text": item.text,
                    "time": round(float(item.dm_time), 2),
                    "mode": int(item.mode),
                    "font_size": int(item.font_size),
                    "color": f"#{item.color}",
                }
            )
        return {
            "cid": info["pages"][page_index]["cid"],
            "page_index": page_index,
            "total_loaded": len(items),
            "items": items,
        }

    async def send_comment(self, bvid: str, message: str) -> dict[str, Any]:
        credential = self.get_credential(required=True)
        target = video.Video(bvid=bvid, credential=credential)
        info = await self._run_bili(target.get_info(), default_message="评论发送失败")
        result = await self._run_bili(
            comment.send_comment(
                text=message,
                oid=info["aid"],
                type_=comment.CommentResourceType.VIDEO,
                credential=credential,
            ),
            default_message="评论发送失败",
        )
        return {"result": result}

    async def send_danmaku(
        self,
        bvid: str,
        message: str,
        progress_seconds: float,
        page_index: int,
    ) -> dict[str, Any]:
        credential = self.get_credential(required=True)
        target = video.Video(bvid=bvid, credential=credential)
        result = await self._run_bili(
            target.send_danmaku(
                page_index=page_index,
                danmaku=Danmaku(text=message, dm_time=progress_seconds),
            ),
            default_message="弹幕发送失败",
        )
        return {"result": result}

    async def get_auth_status(self) -> dict[str, Any]:
        credential = self.get_credential()
        if credential is None:
            return {"logged_in": False}
        try:
            profile = await user.get_self_info(credential=credential)
        except Exception:
            return {"logged_in": False}
        return {"logged_in": True, "profile": self._map_self_profile(profile)}

    async def create_qrcode_login(self) -> dict[str, Any]:
        qr = login_v2.QrCodeLogin()
        await qr.generate_qrcode()
        image = qr.get_qrcode_picture()
        session_id = uuid.uuid4().hex
        self.login_sessions[session_id] = LoginSession(qr=qr, created_at=time.time())
        return {
            "session_id": session_id,
            "status": "pending",
            "image_base64": base64.b64encode(image.content).decode("utf-8"),
        }

    async def poll_qrcode_login(self, session_id: str) -> dict[str, Any]:
        self._cleanup_sessions()
        session = self.login_sessions.get(session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="二维码会话不存在或已过期")
        state = await session.qr.check_state()
        session.status = state.value
        payload: dict[str, Any] = {"session_id": session_id, "status": state.value}
        if state == login_v2.QrCodeLoginEvents.DONE:
            credential = session.qr.get_credential()
            self.credential_store.save(credential)
            payload["logged_in"] = True
            payload["profile"] = await self.get_auth_status()
            self.login_sessions.pop(session_id, None)
        elif state == login_v2.QrCodeLoginEvents.TIMEOUT:
            self.login_sessions.pop(session_id, None)
        return payload

    async def logout(self) -> dict[str, Any]:
        self.credential_store.clear()
        return {"logged_in": False}

    async def get_my_profile(self) -> dict[str, Any]:
        credential = self.get_credential(required=True)
        profile = await self._run_bili(user.get_self_info(credential=credential), default_message="个人信息获取失败")
        return self._map_self_profile(profile)

    async def get_my_favorites(self, page: int = 1) -> dict[str, Any]:
        credential = self.get_credential(required=True)
        profile = await self._run_bili(user.get_self_info(credential=credential), default_message="收藏夹获取失败")
        lists = await self._run_bili(
            favorite_list.get_video_favorite_list(
                uid=profile["mid"],
                credential=credential,
            ),
            default_message="收藏夹获取失败",
        )
        favorites = []
        for item in lists.get("list", []):
            content = await self._run_bili(
                favorite_list.get_video_favorite_list_content(
                    media_id=item["id"],
                    page=page,
                    credential=credential,
                ),
                default_message="收藏夹内容获取失败",
            )
            medias = content.get("medias") or []
            favorites.append(
                {
                    "id": item["id"],
                    "title": item["title"],
                    "count": item.get("media_count", 0),
                    "cover": item.get("cover") or (medias[0].get("cover") if medias else ""),
                    "items": [self._map_favorite_media(media) for media in medias[:6]],
                }
            )
        return {"items": favorites}

    def _cleanup_sessions(self) -> None:
        now = time.time()
        expired = [
            key
            for key, session in self.login_sessions.items()
            if now - session.created_at > settings.qrcode_ttl_seconds
        ]
        for key in expired:
            self.login_sessions.pop(key, None)

    async def _run_bili(self, coroutine: Any, default_message: str = "请求哔哩哔哩接口失败") -> Any:
        try:
            return await coroutine
        except Exception as exc:
            self._raise_bili_error(exc, default_message=default_message)

    def _raise_bili_error(self, exc: Exception, default_message: str) -> None:
        if isinstance(exc, ResponseCodeException):
            detail = str(exc)
            if "稿件不可见" in detail:
                raise HTTPException(status_code=404, detail="当前视频不可见或已下架") from exc
            raise HTTPException(status_code=502, detail=detail) from exc
        raise HTTPException(status_code=502, detail=default_message) from exc

    def _map_hot_video(self, item: dict[str, Any]) -> dict[str, Any]:
        return {
            "bvid": item["bvid"],
            "title": clean_html(item.get("title", "")),
            "cover": item.get("pic", ""),
            "desc": item.get("desc", ""),
            "author": item.get("owner", {}).get("name", ""),
            "mid": item.get("owner", {}).get("mid"),
            "duration": item.get("duration", 0),
            "play": format_count(item.get("stat", {}).get("view")),
            "danmaku": format_count(item.get("stat", {}).get("danmaku")),
            "like": format_count(item.get("stat", {}).get("like")),
        }

    def _map_search_item(self, item: dict[str, Any]) -> dict[str, Any]:
        return {
            "bvid": item.get("bvid", ""),
            "title": clean_html(item.get("title", "")),
            "cover": f"https:{item.get('pic', '')}" if item.get("pic", "").startswith("//") else item.get("pic", ""),
            "desc": clean_html(item.get("description") or item.get("desc") or ""),
            "author": item.get("author") or item.get("uname") or "",
            "play": format_count(int(item.get("play", 0) or 0)),
            "danmaku": format_count(int(item.get("danmaku", 0) or 0)),
            "duration": item.get("duration", ""),
        }

    def _map_video_detail(self, info: dict[str, Any]) -> dict[str, Any]:
        pages = info.get("pages") or []
        return {
            "aid": info["aid"],
            "bvid": info["bvid"],
            "cid": pages[0]["cid"] if pages else None,
            "title": info["title"],
            "desc": info.get("desc", ""),
            "cover": info.get("pic", ""),
            "published_at": info.get("pubdate"),
            "author": info.get("owner", {}).get("name", ""),
            "author_mid": info.get("owner", {}).get("mid"),
            "author_avatar": info.get("owner", {}).get("face", ""),
            "player_url": f"https://player.bilibili.com/player.html?bvid={info['bvid']}&page=1",
            "official_url": f"https://www.bilibili.com/video/{info['bvid']}",
            "stats": {
                "播放": format_count(info.get("stat", {}).get("view")),
                "弹幕": format_count(info.get("stat", {}).get("danmaku")),
                "评论": format_count(info.get("stat", {}).get("reply")),
                "点赞": format_count(info.get("stat", {}).get("like")),
                "收藏": format_count(info.get("stat", {}).get("favorite")),
                "投币": format_count(info.get("stat", {}).get("coin")),
                "分享": format_count(info.get("stat", {}).get("share")),
            },
            "pages": [
                {
                    "page": item["page"],
                    "cid": item["cid"],
                    "part": item["part"],
                    "duration": item["duration"],
                }
                for item in pages
            ],
        }

    def _map_comment_item(self, item: dict[str, Any]) -> dict[str, Any]:
        member = item.get("member", {})
        return {
            "id": item.get("rpid"),
            "message": item.get("content", {}).get("message", ""),
            "like": item.get("like", 0),
            "replies": item.get("rcount", 0),
            "ctime": item.get("ctime"),
            "user": {
                "name": member.get("uname", ""),
                "avatar": member.get("avatar", ""),
                "level": member.get("level_info", {}).get("current_level", 0),
                "mid": member.get("mid"),
            },
        }

    def _map_self_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        return {
            "mid": profile.get("mid"),
            "name": profile.get("name", ""),
            "avatar": profile.get("face", ""),
            "sign": profile.get("sign", ""),
            "level": profile.get("level"),
            "coins": profile.get("coins"),
        }

    def _map_favorite_media(self, media: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": media.get("id"),
            "title": clean_html(media.get("title", "")),
            "cover": media.get("cover", ""),
            "upper": media.get("upper", {}).get("name", ""),
            "duration": media.get("duration", 0),
            "bvid": media.get("bvid", ""),
            "play": format_count(media.get("cnt_info", {}).get("play")),
        }


bili_service = BiliService()
