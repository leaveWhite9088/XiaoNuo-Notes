from pydantic import BaseModel, Field


class VideoQueryRequest(BaseModel):
    query: str = Field(..., description="支持 BV 号、av 号、B站视频链接")


class CookieLoginRequest(BaseModel):
    sessdata: str = Field(..., description="SESSDATA")
    bili_jct: str | None = Field(default=None, description="bili_jct")
    buvid3: str | None = Field(default=None, description="buvid3")
    buvid4: str | None = Field(default=None, description="buvid4")
    dedeuserid: str | None = Field(default=None, description="DedeUserID")
    ac_time_value: str | None = Field(default=None, description="ac_time_value")


class SendCommentRequest(BaseModel):
    query: str
    text: str
    root: int | None = None
    parent: int | None = None


class SendDanmakuRequest(BaseModel):
    query: str
    text: str
    page_index: int = 0
    dm_time: float = Field(default=0.0, description="弹幕时间，单位秒")
    mode: int = Field(default=1, description="弹幕模式，1为滚动")
    font_size: int = Field(default=25, description="字体大小")
    color: str = Field(default="ffffff", description="RGB 十六进制颜色，不带#")

