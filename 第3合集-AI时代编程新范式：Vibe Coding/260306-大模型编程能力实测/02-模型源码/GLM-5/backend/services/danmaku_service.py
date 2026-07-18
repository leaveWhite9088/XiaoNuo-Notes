"""
弹幕服务
处理弹幕获取、发送等
"""
from typing import List, Dict, Any
import xml.etree.ElementTree as ET
import aiohttp

from bilibili_api import video
from models.schemas import Danmaku
from services.auth_service import auth_service


class DanmakuService:
    """弹幕服务"""

    async def get_danmaku(self, cid: int, bvid: str = None, aid: int = None) -> List[Danmaku]:
        """获取弹幕"""
        try:
            v = video.Video(bvid=bvid) if bvid else video.Video(aid=aid)

            # 获取弹幕XML
            danmaku_xml = await v.get_danmaku_xml(cid)

            # 解析XML
            root = ET.fromstring(danmaku_xml)
            danmaku_list = []

            for d in root.findall('.//d'):
                try:
                    attrs = d.attrib.get('p', '').split(',')
                    if len(attrs) >= 8:
                        danmaku_list.append(Danmaku(
                            id=int(attrs[7]) if attrs[7].isdigit() else 0,
                            time=float(attrs[0]),
                            content=d.text or '',
                            color=int(attrs[3]),
                            type=int(attrs[1])
                        ))
                except (ValueError, IndexError):
                    continue

            return danmaku_list
        except Exception as e:
            print(f"获取弹幕失败: {e}")
            return []

    async def send_danmaku(self, oid: int, message: str, time: float, color: int = 16777215,
                          fontsize: int = 25, mode: int = 1) -> Dict[str, Any]:
        """发送弹幕"""
        if not auth_service.is_logged_in():
            return {'success': False, 'message': '请先登录'}

        try:
            credential = auth_service.get_credential()
            v = video.Video(aid=oid, credential=credential)

            await v.send_danmaku(
                message=message,
                time=time,
                color=color,
                fontsize=fontsize,
                mode=mode
            )
            return {'success': True, 'message': '弹幕发送成功'}
        except Exception as e:
            return {'success': False, 'message': str(e)}


# 全局弹幕服务实例
danmaku_service = DanmakuService()
