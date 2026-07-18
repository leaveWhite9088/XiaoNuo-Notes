from fastapi import APIRouter
from fastapi.responses import JSONResponse

from bilibili_api import comment, video
from bilibili_api.comment import CommentResourceType, OrderType

router = APIRouter()


@router.get("/list/{bvid}")
async def get_comments(bvid: str, page: int = 1, size: int = 20):
    try:
        v = video.Video(bvid=bvid)
        oid = await v.get_aid()

        comments_data = await comment.get_comments(
            oid=oid,
            type_=CommentResourceType.VIDEO,
            page_index=page,
            page_size=size,
            order=OrderType.TIME,
        )

        comment_list = []
        if "replies" in comments_data:
            for c in comments_data["replies"]:
                comment_list.append(
                    {
                        "rpid": c.get("rpid"),
                        "mid": c.get("member", {}).get("mid"),
                        "uname": c.get("member", {}).get("uname"),
                        "face": c.get("member", {}).get("face"),
                        "message": c.get("content", {}).get("message", ""),
                        "like": c.get("like", 0),
                        "rcount": c.get("rcount", 0),
                        "ctime": c.get("ctime", 0),
                    }
                )

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "total": comments_data.get("page", {}).get("count", 0),
                    "page": page,
                    "size": size,
                    "comments": comment_list,
                },
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.post("/send/{bvid}")
async def send_comment(bvid: str, text: str, credential_data: dict = None):
    try:
        if not credential_data:
            return JSONResponse({"success": False, "error": "需要登录凭据"})

        from bilibili_api import Credential

        credential = Credential(
            sessdata=credential_data.get("sessdata"),
            bili_jct=credential_data.get("bili_jct"),
            buvid3=credential_data.get("buvid3"),
        )

        v = video.Video(bvid=bvid)
        oid = await v.get_aid()

        result = await comment.send_comment(
            text=text, oid=oid, type_=CommentResourceType.VIDEO, credential=credential
        )

        return JSONResponse(
            {
                "success": True,
                "data": {"rpid": result.get("rpid"), "message": "评论发送成功"},
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@router.post("/reply/{bvid}")
async def reply_comment(
    bvid: str, text: str, root_rpid: int, parent_rpid: int, credential_data: dict = None
):
    try:
        if not credential_data:
            return JSONResponse({"success": False, "error": "需要登录凭据"})

        from bilibili_api import Credential

        credential = Credential(
            sessdata=credential_data.get("sessdata"),
            bili_jct=credential_data.get("bili_jct"),
            buvid3=credential_data.get("buvid3"),
        )

        v = video.Video(bvid=bvid)
        oid = await v.get_aid()

        result = await comment.send_comment(
            text=text,
            oid=oid,
            type_=CommentResourceType.VIDEO,
            root=root_rpid,
            parent=parent_rpid,
            credential=credential,
        )

        return JSONResponse(
            {
                "success": True,
                "data": {"rpid": result.get("rpid"), "message": "回复发送成功"},
            }
        )
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})
