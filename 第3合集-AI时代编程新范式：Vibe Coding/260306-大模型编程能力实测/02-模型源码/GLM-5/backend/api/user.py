"""
用户相关API路由
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from services.user_service import user_service
from models.schemas import APIResponse

router = APIRouter(prefix="/user", tags=["用户"])


class FavoriteVideoRequest(BaseModel):
    """收藏视频请求"""
    aid: int
    folder_ids: Optional[List[int]] = None


@router.get("/favorites")
async def get_favorites():
    """获取收藏夹列表"""
    folders = await user_service.get_favorites()
    return APIResponse(success=True, data=[f.model_dump() for f in folders])


@router.get("/favorites/videos")
async def get_favorite_videos(
    folder_id: int = Query(..., description="收藏夹ID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取收藏夹内的视频"""
    result = await user_service.get_favorite_videos(
        folder_id=folder_id,
        page=page,
        page_size=page_size
    )
    return APIResponse(success=True, data=result)


@router.post("/favorite")
async def favorite_video(request: FavoriteVideoRequest):
    """收藏视频"""
    result = await user_service.favorite_video(aid=request.aid, folder_ids=request.folder_ids)
    if result.get('success'):
        return APIResponse(success=True, message=result.get('message', '收藏成功'))
    return APIResponse(success=False, message=result.get('message', '收藏失败'))


@router.post("/unfavorite")
async def unfavorite_video(
    aid: int = Query(..., description="视频AID"),
    folder_id: int = Query(..., description="收藏夹ID")
):
    """取消收藏"""
    result = await user_service.unfavorite_video(aid=aid, folder_id=folder_id)
    if result.get('success'):
        return APIResponse(success=True, message=result.get('message', '取消收藏成功'))
    return APIResponse(success=False, message=result.get('message', '操作失败'))


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取观看历史"""
    result = await user_service.get_history(page=page, page_size=page_size)
    return APIResponse(success=True, data=result)


@router.get("/followings")
async def get_followings(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取关注列表"""
    result = await user_service.get_followings(page=page, page_size=page_size)
    return APIResponse(success=True, data=result)
