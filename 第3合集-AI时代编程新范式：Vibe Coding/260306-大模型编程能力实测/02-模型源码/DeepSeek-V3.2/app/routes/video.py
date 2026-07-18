from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import asyncio

from bilibili_api import video

router = APIRouter()


@router.get("/info/{bvid}")
async def get_video_info(bvid: str):
    try:
        v = video.Video(bvid=bvid)
        info = await v.get_info()

        # 获取分P信息
        pages = await v.get_pages()

        # 获取统计数据
        stat = info.get("stat", {})

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "bvid": bvid,
                    "title": info.get("title", ""),
                    "desc": info.get("desc", ""),
                    "owner": {
                        "mid": info.get("owner", {}).get("mid"),
                        "name": info.get("owner", {}).get("name"),
                        "face": info.get("owner", {}).get("face"),
                    },
                    "stat": {
                        "view": stat.get("view", 0),
                        "danmaku": stat.get("danmaku", 0),
                        "reply": stat.get("reply", 0),
                        "favorite": stat.get("favorite", 0),
                        "coin": stat.get("coin", 0),
                        "share": stat.get("share", 0),
                        "like": stat.get("like", 0),
                    },
                    "pages": pages,
                    "pubdate": info.get("pubdate", 0),
                    "duration": info.get("duration", 0),
                    "pic": info.get("pic", ""),
                },
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/danmaku/{bvid}")
async def get_video_danmaku(bvid: str, page_index: int = 0):
    try:
        v = video.Video(bvid=bvid)
        danmakus = await v.get_danmakus(page_index=page_index)

        # 格式化弹幕数据
        formatted_danmakus = []
        for dm in danmakus:
            formatted_danmakus.append(
                {
                    "text": dm.text,
                    "time": dm.send_time,
                    "mode": dm.mode,
                    "color": dm.color,
                    "font_size": dm.font_size,
                }
            )

        return JSONResponse(
            {
                "success": True,
                "data": {"total": len(danmakus), "danmakus": formatted_danmakus},
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.post("/send-danmaku/{bvid}")
async def send_danmaku(
    bvid: str, text: str, page_index: int = 0, credential_data: dict = None
):
    try:
        if not credential_data:
            return JSONResponse({"success": False, "error": "需要登录凭据"})

        from bilibili_api import Credential
        from bilibili_api.utils.danmaku import Danmaku, DmMode

        credential = Credential(
            sessdata=credential_data.get("sessdata"),
            bili_jct=credential_data.get("bili_jct"),
            buvid3=credential_data.get("buvid3"),
        )

        v = video.Video(bvid=bvid, credential=credential)

        # 创建弹幕对象
        dm = Danmaku(text=text, mode=DmMode.FLY, font_size=25, color="0xffffff")

        await v.send_danmaku(page_index=page_index, danmaku=dm)

        return JSONResponse({"success": True, "message": "弹幕发送成功"})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/play-url/{bvid}")
async def get_play_url(bvid: str, page_index: int = 0):
    try:
        v = video.Video(bvid=bvid)
        play_url = await v.get_download_url(page_index=page_index)

        # 提取播放链接
        video_urls = []
        if play_url and "dash" in play_url:
            for video_info in play_url["dash"].get("video", []):
                if "baseUrl" in video_info:
                    video_urls.append(
                        {
                            "quality": video_info.get("id"),
                            "url": video_info.get("baseUrl"),
                            "codecs": video_info.get("codecs", ""),
                        }
                    )

        return JSONResponse({"success": True, "data": {"video_urls": video_urls}})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})
