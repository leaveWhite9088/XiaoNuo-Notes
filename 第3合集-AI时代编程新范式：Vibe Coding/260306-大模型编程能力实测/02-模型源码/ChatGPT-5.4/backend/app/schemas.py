from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    success: bool = True
    data: Any | None = None
    message: str = "ok"


class SearchParams(BaseModel):
    keyword: str = Field(min_length=1)
    page: int = Field(default=1, ge=1)


class QrLoginSession(BaseModel):
    session_id: str
    image_base64: str
    status: str


class SendCommentPayload(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class SendDanmakuPayload(BaseModel):
    message: str = Field(min_length=1, max_length=120)
    progress_seconds: float = Field(default=0, ge=0)
    page_index: int = Field(default=0, ge=0)


class FavoriteQuery(BaseModel):
    page: int = Field(default=1, ge=1)
