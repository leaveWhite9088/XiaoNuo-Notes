from fastapi import APIRouter
from fastapi.responses import JSONResponse

from bilibili_api import user

router = APIRouter()


@router.get("/info/{uid}")
async def get_user_info(uid: int):
    try:
        u = user.User(uid=uid)
        info = await u.get_user_info()
        relation = await u.get_relation_info()

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "uid": uid,
                    "name": info.get("name", ""),
                    "sign": info.get("sign", ""),
                    "face": info.get("face", ""),
                    "level": info.get("level", 0),
                    "vip": info.get("vip", {}),
                    "following": relation.get("following", 0),
                    "follower": relation.get("follower", 0),
                },
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/videos/{uid}")
async def get_user_videos(uid: int, page: int = 1, size: int = 20):
    try:
        u = user.User(uid=uid)
        videos = await u.get_videos(
            tid=0, pn=page, ps=size, order=user.VideoOrder.PUBDATE
        )

        video_list = []
        if "list" in videos and "vlist" in videos["list"]:
            for vid in videos["list"]["vlist"]:
                video_list.append(
                    {
                        "bvid": vid.get("bvid", ""),
                        "title": vid.get("title", ""),
                        "pic": vid.get("pic", ""),
                        "play": vid.get("play", 0),
                        "video_review": vid.get("video_review", 0),
                        "created": vid.get("created", 0),
                        "length": vid.get("length", ""),
                    }
                )

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "total": videos.get("page", {}).get("count", 0),
                    "page": page,
                    "size": size,
                    "videos": video_list,
                },
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.get("/favorites/{uid}")
async def get_user_favorites(uid: int, credential_data: dict = None):
    try:
        if not credential_data:
            return JSONResponse({"success": False, "error": "需要登录凭据"})

        from bilibili_api import Credential

        credential = Credential(
            sessdata=credential_data.get("sessdata"),
            bili_jct=credential_data.get("bili_jct"),
            buvid3=credential_data.get("buvid3"),
        )

        u = user.User(uid=uid, credential=credential)

        # 获取收藏夹列表
        favorites = await u.get_favorite_list()

        return JSONResponse({"success": True, "data": {"favorites": favorites}})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})
