"""
弹幕相关API路由
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from services.danmaku_service import danmaku_service
from models.schemas import APIResponse

router = APIRouter(prefix="/danmaku", tags=["弹幕"])


class SendDanmakuRequest(BaseModel):
    """发送弹幕请求"""
    oid: int
    message: str
    time: float
    color: int = 16777215  # 默认白色
    fontsize: int = 25
    mode: int = 1  # 1为滚动弹幕


@router.get("/list")
async def get_danmaku(
    cid: int = Query(..., description="视频CID"),
    bvid: Optional[str] = Query(None, description="视频BV号"),
    aid: Optional[int] = Query(None, description="视频AV号")
):
    """获取弹幕列表"""
    if not bvid and not aid:
        raise HTTPException(status_code=400, detail="请提供bvid或aid")

    danmaku_list = await danmaku_service.get_danmaku(cid=cid, bvid=bvid, aid=aid)
    return APIResponse(success=True, data=[d.model_dump() for d in danmaku_list])


@router.post("/send")
async def send_danmaku(request: SendDanmakuRequest):
    """发送弹幕"""
    result = await danmaku_service.send_danmaku(
        oid=request.oid,
        message=request.message,
        time=request.time,
        color=request.color,
        fontsize=request.fontsize,
        mode=request.mode
    )
    if result.get('success'):
        return APIResponse(success=True, message=result.get('message', '发送成功'))
    return APIResponse(success=False, message=result.get('message', '发送失败'))
