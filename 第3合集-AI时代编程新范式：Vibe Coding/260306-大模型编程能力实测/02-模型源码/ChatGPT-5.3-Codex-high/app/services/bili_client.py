from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from bilibili_api import Credential, comment, favorite_list, hot, user, video
from bilibili_api.utils import network

BV_PATTERN = re.compile(r"BV[0-9A-Za-z]{10}")
AV_PATTERN = re.compile(r"(?i)\bav(\d+)\b")


def configure_network(verify_ssl: bool, timeout_seconds: float) -> None:
    network.request_settings.set_verify_ssl(verify_ssl)
    network.request_settings.set_timeout(timeout_seconds)


def parse_video_identity(query: str) -> dict[str, Any]:
    text = query.strip()
    bv_match = BV_PATTERN.search(text)
    if bv_match:
        bvid = bv_match.group(0)
        return {"bvid": bvid, "aid": None}

    av_match = AV_PATTERN.search(text)
    if av_match:
        aid = int(av_match.group(1))
        return {"bvid": None, "aid": aid}

    if text.isdigit():
        return {"bvid": None, "aid": int(text)}

    raise ValueError("无法识别视频编号，请输入 BV 号、av 号或完整链接。")


def build_video_url(identity: dict[str, Any], info: dict[str, Any]) -> str:
    bvid = info.get("bvid") or identity.get("bvid")
    if bvid:
        return f"https://www.bilibili.com/video/{bvid}"
    aid = info.get("aid") or identity.get("aid")
    return f"https://www.bilibili.com/video/av{aid}"


def build_player_url(identity: dict[str, Any], info: dict[str, Any], page: int = 1) -> str:
    bvid = info.get("bvid") or identity.get("bvid")
    if bvid:
        return (
            "https://player.bilibili.com/player.html"
            f"?bvid={bvid}&page={page}&high_quality=1&as_wide=1&danmaku=1"
        )
    aid = info.get("aid") or identity.get("aid")
    return (
        "https://player.bilibili.com/player.html"
        f"?aid={aid}&page={page}&high_quality=1&as_wide=1&danmaku=1"
    )


def _simplify_video_card(item: dict[str, Any]) -> dict[str, Any]:
    owner = item.get("owner") or {}
    stat = item.get("stat") or {}
    return {
        "aid": item.get("aid"),
        "bvid": item.get("bvid"),
        "title": item.get("title"),
        "cover": item.get("pic"),
        "duration": item.get("duration"),
        "owner": owner.get("name"),
        "mid": owner.get("mid"),
        "view": stat.get("view"),
        "like": stat.get("like"),
        "danmaku": stat.get("danmaku"),
        "reply": stat.get("reply"),
        "pubdate": item.get("pubdate"),
    }


async def get_hot_videos(pn: int = 1, ps: int = 12) -> dict[str, Any]:
    raw = await hot.get_hot_videos(pn=pn, ps=ps)
    items = raw.get("list") or raw.get("data", {}).get("list") or []
    return {
        "list": [_simplify_video_card(item) for item in items],
        "no_more": bool(raw.get("no_more", False)),
    }


async def get_video_info_bundle(query: str, credential: Credential | None = None) -> dict[str, Any]:
    identity = parse_video_identity(query)
    video_obj = video.Video(
        bvid=identity["bvid"], aid=identity["aid"], credential=credential
    )
    info = await video_obj.get_info()
    pages = await video_obj.get_pages()
    related = await video_obj.get_related()
    related_list = related if isinstance(related, list) else []

    simplified_pages = [
        {
            "cid": p.get("cid"),
            "page": p.get("page"),
            "part": p.get("part"),
            "duration": p.get("duration"),
        }
        for p in pages
    ]
    video_url = build_video_url(identity, info)
    player_url = build_player_url(identity, info)
    return {
        "query": query,
        "aid": info.get("aid"),
        "bvid": info.get("bvid"),
        "cid": simplified_pages[0]["cid"] if simplified_pages else None,
        "title": info.get("title"),
        "desc": info.get("desc"),
        "pic": info.get("pic"),
        "owner": info.get("owner", {}),
        "stat": info.get("stat", {}),
        "duration": info.get("duration"),
        "pubdate": info.get("pubdate"),
        "tname": info.get("tname"),
        "pages": simplified_pages,
        "official_url": video_url,
        "player_url": player_url,
        "related": [_simplify_video_card(item) for item in related_list[:10]],
    }


def _format_comment_item(item: dict[str, Any]) -> dict[str, Any]:
    member = item.get("member") or {}
    content = item.get("content") or {}
    return {
        "rpid": item.get("rpid"),
        "uname": member.get("uname"),
        "avatar": member.get("avatar"),
        "mid": member.get("mid"),
        "message": content.get("message"),
        "ctime": item.get("ctime"),
        "like": item.get("like"),
        "reply_count": item.get("rcount", 0),
        "is_up": bool(member.get("is_followed", 0)),
    }


async def get_video_comments(
    query: str,
    page: int = 1,
    order: str = "time",
    credential: Credential | None = None,
) -> dict[str, Any]:
    bundle = await get_video_info_bundle(query, credential=credential)
    aid = bundle["aid"]
    order_type = comment.OrderType.TIME if order != "like" else comment.OrderType.LIKE
    raw = await comment.get_comments(
        oid=aid,
        type_=comment.CommentResourceType.VIDEO,
        page_index=page,
        order=order_type,
        credential=credential,
    )
    replies = raw.get("replies") or []
    return {
        "video": {"aid": bundle["aid"], "bvid": bundle["bvid"], "title": bundle["title"]},
        "page": raw.get("page", {}),
        "list": [_format_comment_item(item) for item in replies],
    }


async def get_video_danmaku(
    query: str,
    page_index: int = 0,
    from_seg: int = 1,
    to_seg: int = 1,
    limit: int = 200,
    credential: Credential | None = None,
) -> dict[str, Any]:
    bundle = await get_video_info_bundle(query, credential=credential)
    video_obj = video.Video(
        bvid=bundle["bvid"], aid=bundle["aid"], credential=credential
    )
    if from_seg <= 0:
        from_seg = 1
    if to_seg < from_seg:
        to_seg = from_seg
    danmakus = await video_obj.get_danmakus(
        page_index=page_index, from_seg=from_seg, to_seg=to_seg
    )
    records = []
    for dm in danmakus[: max(1, limit)]:
        records.append(
            {
                "text": dm.text,
                "dm_time": round(float(dm.dm_time), 3),
                "send_time": int(dm.send_time) if dm.send_time else None,
                "color": dm.color,
                "mode": int(dm.mode),
                "font_size": int(dm.font_size),
                "uid": dm.uid,
                "id": dm.id_,
            }
        )
    return {
        "video": {"aid": bundle["aid"], "bvid": bundle["bvid"], "title": bundle["title"]},
        "list": records,
        "segment": {"from": from_seg, "to": to_seg},
    }


async def send_video_comment(
    query: str,
    text: str,
    credential: Credential,
    root: int | None = None,
    parent: int | None = None,
) -> dict[str, Any]:
    if not text.strip():
        raise ValueError("评论内容不能为空。")
    bundle = await get_video_info_bundle(query, credential=credential)
    result = await comment.send_comment(
        text=text,
        oid=bundle["aid"],
        type_=comment.CommentResourceType.VIDEO,
        root=root,
        parent=parent,
        credential=credential,
    )
    return {"video": {"aid": bundle["aid"], "bvid": bundle["bvid"]}, "result": result}


async def send_video_danmaku(
    query: str,
    text: str,
    page_index: int,
    dm_time: float,
    mode: int,
    font_size: int,
    color: str,
    credential: Credential,
) -> dict[str, Any]:
    if not text.strip():
        raise ValueError("弹幕内容不能为空。")
    bundle = await get_video_info_bundle(query, credential=credential)
    video_obj = video.Video(
        bvid=bundle["bvid"], aid=bundle["aid"], credential=credential
    )
    dm = video.Danmaku(
        text=text,
        dm_time=max(0.0, dm_time),
        mode=mode,
        font_size=font_size,
        color=color.lower().replace("#", ""),
    )
    result = await video_obj.send_danmaku(page_index=page_index, danmaku=dm)
    return {"video": {"aid": bundle["aid"], "bvid": bundle["bvid"]}, "result": result}


async def get_self_info(credential: Credential) -> dict[str, Any]:
    info = await user.get_self_info(credential=credential)
    return {
        "uid": info.get("mid"),
        "name": info.get("name"),
        "face": info.get("face"),
        "level": (info.get("level_info") or {}).get("current_level"),
        "sign": info.get("sign"),
        "vip": bool((info.get("vip") or {}).get("status")),
    }


def _pick_list(raw: dict[str, Any], primary: str, nested: str | None = None) -> list[Any]:
    direct = raw.get(primary)
    if isinstance(direct, list):
        return direct
    if nested:
        sub = raw.get("data", {}).get(nested)
        if isinstance(sub, list):
            return sub
    return []


async def get_self_favorites(
    credential: Credential, media_id: int | None = None, page: int = 1
) -> dict[str, Any]:
    self_info = await user.get_self_info(credential=credential)
    uid = int(self_info.get("mid"))
    folders_raw = await favorite_list.get_video_favorite_list(
        uid=uid, credential=credential
    )
    folders = _pick_list(folders_raw, "list", "list")
    simplified_folders = [
        {
            "id": item.get("id"),
            "title": item.get("title"),
            "media_count": item.get("media_count"),
            "cover": item.get("cover"),
            "fav_state": item.get("fav_state"),
        }
        for item in folders
    ]
    if not simplified_folders:
        return {"folders": [], "selected_media_id": None, "videos": []}

    selected = media_id or simplified_folders[0]["id"]
    content_raw = await favorite_list.get_video_favorite_list_content(
        media_id=selected, page=page, credential=credential
    )
    medias = _pick_list(content_raw, "medias", "medias")
    videos = []
    for item in medias:
        upper = item.get("upper") or {}
        stat = item.get("cnt_info") or item.get("stat") or {}
        videos.append(
            {
                "id": item.get("id"),
                "bvid": item.get("bvid"),
                "title": item.get("title"),
                "cover": item.get("cover"),
                "intro": item.get("intro"),
                "duration": item.get("duration"),
                "upper_name": upper.get("name"),
                "play": stat.get("play"),
                "danmaku": stat.get("danmaku"),
            }
        )

    return {
        "folders": simplified_folders,
        "selected_media_id": selected,
        "videos": videos,
        "page": content_raw.get("page"),
        "mtime": datetime.now().isoformat(),
    }
