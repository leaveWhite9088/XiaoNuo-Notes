"""
评论服务
处理评论获取、发送等
"""
from typing import List, Optional, Dict, Any

from bilibili_api import comment, video
from models.schemas import Comment, UserInfo
from services.auth_service import auth_service


class CommentService:
    """评论服务"""

    async def get_comments(self, oid: int, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """获取评论列表"""
        try:
            result = await comment.get_comments(
                oid=oid,
                type_=comment.CommentResourceType.VIDEO,
                page_index=page,
                page_size=page_size
            )

            comments = []
            for c in result.get('replies', []):
                member = c.get('member', {})
                replies = []

                # 处理回复
                for r in c.get('replies', [])[:5]:  # 只显示前5条回复
                    r_member = r.get('member', {})
                    replies.append(Comment(
                        rpid=r.get('rpid', 0),
                        content=r.get('content', {}).get('message', ''),
                        ctime=r.get('ctime', 0),
                        like=r.get('like', 0),
                        member=UserInfo(
                            mid=r_member.get('mid', 0),
                            name=r_member.get('uname', ''),
                            face=r_member.get('avatar', ''),
                            sign='',
                            level=r_member.get('level_info', {}).get('current_level', 0),
                            vip_status=1 if r_member.get('vip', {}).get('vipStatus') else 0,
                            is_login=False
                        ),
                        replies=[]
                    ))

                comments.append(Comment(
                    rpid=c.get('rpid', 0),
                    content=c.get('content', {}).get('message', ''),
                    ctime=c.get('ctime', 0),
                    like=c.get('like', 0),
                    member=UserInfo(
                        mid=member.get('mid', 0),
                        name=member.get('uname', ''),
                        face=member.get('avatar', ''),
                        sign='',
                        level=member.get('level_info', {}).get('current_level', 0),
                        vip_status=1 if member.get('vip', {}).get('vipStatus') else 0,
                        is_login=False
                    ),
                    replies=replies
                ))

            return {
                'comments': comments,
                'total': result.get('page', {}).get('count', 0),
                'page': page,
                'page_size': page_size
            }
        except Exception as e:
            print(f"获取评论失败: {e}")
            return {'comments': [], 'total': 0, 'page': page, 'page_size': page_size}

    async def send_comment(self, oid: int, message: str, root: int = None, parent: int = None) -> Dict[str, Any]:
        """发送评论"""
        if not auth_service.is_logged_in():
            return {'success': False, 'message': '请先登录'}

        try:
            credential = auth_service.get_credential()
            result = await comment.send_comment(
                oid=oid,
                type_=comment.CommentResourceType.VIDEO,
                message=message,
                root=root,
                parent=parent,
                credential=credential
            )
            return {'success': True, 'message': '评论发送成功', 'data': result}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    async def like_comment(self, oid: int, rpid: int, status: bool = True) -> Dict[str, Any]:
        """点赞评论"""
        if not auth_service.is_logged_in():
            return {'success': False, 'message': '请先登录'}

        try:
            credential = auth_service.get_credential()
            await comment.like_comment(
                oid=oid,
                type_=comment.CommentResourceType.VIDEO,
                rpid=rpid,
                status=status,
                credential=credential
            )
            return {'success': True, 'message': '操作成功'}
        except Exception as e:
            return {'success': False, 'message': str(e)}


# 全局评论服务实例
comment_service = CommentService()
