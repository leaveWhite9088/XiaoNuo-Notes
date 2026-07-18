"""
视频相关API路由
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional

from services.video_service import video_service
from models.schemas import APIResponse

router = APIRouter(prefix="/video", tags=["视频"])


@router.get("/info")
async def get_video_info(
    bvid: Optional[str] = Query(None, description="视频BV号"),
    aid: Optional[int] = Query(None, description="视频AV号")
):
    """获取视频详情"""
    if not bvid and not aid:
        raise HTTPException(status_code=400, detail="请提供bvid或aid")

    info = await video_service.get_video_info(bvid=bvid, aid=aid)
    if info:
        return APIResponse(success=True, data=info)
    raise HTTPException(status_code=404, detail="视频不存在")


@router.get("/pages")
async def get_video_pages(
    bvid: Optional[str] = Query(None, description="视频BV号"),
    aid: Optional[int] = Query(None, description="视频AV号")
):
    """获取视频分P"""
    if not bvid and not aid:
        raise HTTPException(status_code=400, detail="请提供bvid或aid")

    pages = await video_service.get_video_pages(bvid=bvid, aid=aid)
    return APIResponse(success=True, data=pages)


@router.get("/playurl")
async def get_play_url(
    bvid: Optional[str] = Query(None, description="视频BV号"),
    aid: Optional[int] = Query(None, description="视频AV号"),
    cid: Optional[int] = Query(None, description="视频CID"),
    quality: int = Query(64, description="清晰度")
):
    """获取播放地址"""
    if not bvid and not aid:
        raise HTTPException(status_code=400, detail="请提供bvid或aid")

    url = await video_service.get_play_url(bvid=bvid, aid=aid, cid=cid, quality=quality)
    if url:
        return APIResponse(success=True, data=url)
    raise HTTPException(status_code=404, detail="无法获取播放地址")


@router.get("/related")
async def get_related_videos(
    bvid: Optional[str] = Query(None, description="视频BV号"),
    aid: Optional[int] = Query(None, description="视频AV号")
):
    """获取相关视频"""
    if not bvid and not aid:
        raise HTTPException(status_code=400, detail="请提供bvid或aid")

    videos = await video_service.get_related_videos(bvid=bvid, aid=aid)
    return APIResponse(success=True, data=videos)


@router.get("/search")
async def search_videos(
    keyword: str = Query(..., description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """搜索视频"""
    result = await video_service.search_videos(keyword=keyword, page=page, page_size=page_size)
    return APIResponse(success=True, data=result)


@router.get("/popular")
async def get_popular_videos(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取热门视频"""
    videos = await video_service.get_popular_videos(page=page, page_size=page_size)
    return APIResponse(success=True, data=videos)
