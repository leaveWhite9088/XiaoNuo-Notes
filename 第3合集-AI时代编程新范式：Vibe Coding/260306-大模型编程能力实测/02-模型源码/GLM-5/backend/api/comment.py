"""
评论相关API路由
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from services.comment_service import comment_service
from models.schemas import APIResponse

router = APIRouter(prefix="/comment", tags=["评论"])


class SendCommentRequest(BaseModel):
    """发送评论请求"""
    oid: int
    message: str
    root: Optional[int] = None
    parent: Optional[int] = None


@router.get("/list")
async def get_comments(
    oid: int = Query(..., description="视频AID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取评论列表"""
    result = await comment_service.get_comments(oid=oid, page=page, page_size=page_size)
    return APIResponse(success=True, data=result)


@router.post("/send")
async def send_comment(request: SendCommentRequest):
    """发送评论"""
    result = await comment_service.send_comment(
        oid=request.oid,
        message=request.message,
        root=request.root,
        parent=request.parent
    )
    if result.get('success'):
        return APIResponse(success=True, message=result.get('message', '发送成功'))
    return APIResponse(success=False, message=result.get('message', '发送失败'))


@router.post("/like")
async def like_comment(
    oid: int = Query(..., description="视频AID"),
    rpid: int = Query(..., description="评论ID"),
    status: bool = Query(True, description="True为点赞，False为取消")
):
    """点赞评论"""
    result = await comment_service.like_comment(oid=oid, rpid=rpid, status=status)
    if result.get('success'):
        return APIResponse(success=True, message=result.get('message', '操作成功'))
    return APIResponse(success=False, message=result.get('message', '操作失败'))
