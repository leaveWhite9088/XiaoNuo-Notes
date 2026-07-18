"""
评论组件
"""

import asyncio
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QTextEdit, QScrollArea, QFrame,
    QProgressBar, QMessageBox
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QPixmap, QPainter, QImage

from ..api.bilibili_client import bilibili_client
from ..api.auth_manager import auth_manager
from ..api.data_models import Comment
from .styles import BilibiliStyles, BilibiliColors

class CommentsWidget(QWidget):
    """评论组件"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_oid = None
        self.comments = []
        self.current_page = 1

        self._init_ui()
        self._connect_signals()

    def _init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 标题栏
        title_bar = QFrame()
        title_bar.setStyleSheet(f"""
            QFrame {{
                background-color: {BilibiliColors.SURFACE};
                border-bottom: 1px solid {BilibiliColors.BORDER};
                padding: 12px 16px;
            }}
        """)

        title_layout = QHBoxLayout(title_bar)
        title_layout.setContentsMargins(0, 0, 0, 0)

        title_label = QLabel("评论")
        title_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 16px;
            font-weight: bold;
        """)
        title_layout.addWidget(title_label)

        self.comment_count_label = QLabel("0 条评论")
        self.comment_count_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_SECONDARY};
            font-size: 14px;
        """)
        title_layout.addWidget(self.comment_count_label)

        title_layout.addStretch()

        # 刷新按钮
        self.refresh_button = QPushButton("刷新")
        self.refresh_button.setStyleSheet(BilibiliStyles.get_secondary_button_style())
        title_layout.addWidget(self.refresh_button)

        layout.addWidget(title_bar)

        # 评论输入区域 (仅在登录后显示)
        self.comment_input_frame = QFrame()
        self.comment_input_frame.setStyleSheet(BilibiliStyles.get_card_style())
        self.comment_input_frame.setVisible(False)

        input_layout = QVBoxLayout(self.comment_input_frame)
        input_layout.setContentsMargins(16, 16, 16, 16)

        # 输入框
        self.comment_text = QTextEdit()
        self.comment_text.setPlaceholderText("写下你的评论...")
        self.comment_text.setMaximumHeight(100)
        self.comment_text.setStyleSheet(f"""
            QTextEdit {{
                border: 1px solid {BilibiliColors.BORDER};
                border-radius: 6px;
                padding: 8px;
                background-color: {BilibiliColors.SURFACE};
                color: {BilibiliColors.TEXT_PRIMARY};
                font-size: 14px;
            }}

            QTextEdit:focus {{
                border-color: {BilibiliColors.PRIMARY};
            }}
        """)
        input_layout.addWidget(self.comment_text)

        # 按钮区域
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        self.send_button = QPushButton("发送评论")
        self.send_button.setStyleSheet(BilibiliStyles.get_button_style())
        self.send_button.setFixedHeight(32)
        button_layout.addWidget(self.send_button)

        input_layout.addLayout(button_layout)

        layout.addWidget(self.comment_input_frame)

        # 评论列表
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet(BilibiliStyles.get_scroll_area_style())
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        self.comments_container = QWidget()
        self.comments_layout = QVBoxLayout(self.comments_container)
        self.comments_layout.setContentsMargins(16, 16, 16, 16)
        self.comments_layout.setSpacing(8)

        self.scroll_area.setWidget(self.comments_container)
        layout.addWidget(self.scroll_area)

        # 加载更多按钮
        self.load_more_button = QPushButton("加载更多评论")
        self.load_more_button.setStyleSheet(BilibiliStyles.get_secondary_button_style())
        self.load_more_button.setFixedHeight(36)
        self.load_more_button.hide()
        layout.addWidget(self.load_more_button)

        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                border: 2px solid {BilibiliColors.BORDER};
                border-radius: 4px;
                text-align: center;
            }}

            QProgressBar::chunk {{
                background-color: {BilibiliColors.PRIMARY};
            }}
        """)
        layout.addWidget(self.progress_bar)

        self.setLayout(layout)

    def _connect_signals(self):
        """连接信号"""
        self.refresh_button.clicked.connect(self._refresh_comments)
        self.send_button.clicked.connect(self._send_comment)
        self.load_more_button.clicked.connect(self._load_more_comments)

        # 监听登录状态变化
        # 这里需要连接到主窗口的登录状态信号

    def set_video_oid(self, oid: int):
        """设置视频OID"""
        if self.current_oid != oid:
            self.current_oid = oid
            self.current_page = 1
            self.comments.clear()
            self._clear_comments_ui()
            asyncio.create_task(self._load_comments())

    async def _load_comments(self):
        """加载评论"""
        if not self.current_oid:
            return

        try:
            self.progress_bar.setVisible(True)
            self.progress_bar.setRange(0, 0)

            comments = await bilibili_client.get_video_comments(self.current_oid, self.current_page)

            self.progress_bar.setVisible(False)

            if self.current_page == 1:
                self.comments = comments
                self._clear_comments_ui()
            else:
                self.comments.extend(comments)

            self._update_comments_ui()
            self._update_comment_count()

            # 显示/隐藏加载更多按钮
            self.load_more_button.setVisible(len(comments) >= 20)

        except Exception as e:
            self.progress_bar.setVisible(False)
            QMessageBox.critical(self, "错误", f"加载评论失败：{str(e)}")

    def _clear_comments_ui(self):
        """清除评论UI"""
        while self.comments_layout.count():
            item = self.comments_layout.takeAt(0)
            if item.widget():
                item.widget().hide()
                item.widget().setParent(None)

    def _update_comments_ui(self):
        """更新评论UI"""
        for comment in self.comments[self.comments_layout.count():]:
            comment_item = CommentItem(comment)
            self.comments_layout.addWidget(comment_item)

    def _update_comment_count(self):
        """更新评论数量"""
        if self.comments:
            self.comment_count_label.setText(f"{len(self.comments)} 条评论")
        else:
            self.comment_count_label.setText("0 条评论")

    def _refresh_comments(self):
        """刷新评论"""
        if self.current_oid:
            self.current_page = 1
            self.comments.clear()
            self._clear_comments_ui()
            asyncio.create_task(self._load_comments())

    async def _send_comment(self):
        """发送评论"""
        if not auth_manager.is_logged_in():
            QMessageBox.warning(self, "未登录", "请先登录后再发送评论")
            return

        content = self.comment_text.toPlainText().strip()
        if not content:
            QMessageBox.warning(self, "输入错误", "请输入评论内容")
            return

        try:
            self.send_button.setEnabled(False)
            self.send_button.setText("发送中...")

            success = await bilibili_client.send_comment(self.current_oid, content)

            self.send_button.setEnabled(True)
            self.send_button.setText("发送评论")

            if success:
                QMessageBox.information(self, "成功", "评论发送成功！")
                self.comment_text.clear()
                # 刷新评论列表
                self._refresh_comments()
            else:
                QMessageBox.warning(self, "失败", "评论发送失败，请重试")

        except Exception as e:
            self.send_button.setEnabled(True)
            self.send_button.setText("发送评论")
            QMessageBox.critical(self, "错误", f"发送评论失败：{str(e)}")

    def _load_more_comments(self):
        """加载更多评论"""
        self.current_page += 1
        asyncio.create_task(self._load_comments())

    def update_login_status(self, is_logged_in: bool):
        """更新登录状态"""
        self.comment_input_frame.setVisible(is_logged_in)

class CommentItem(QFrame):
    """评论项"""

    def __init__(self, comment: Comment, parent=None):
        super().__init__(parent)
        self.comment = comment
        self.setObjectName("commentItem")
        self.setStyleSheet(BilibiliStyles.get_comment_style())

        self._init_ui()

    def _init_ui(self):
        """初始化UI"""
        layout = QHBoxLayout()
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(12)

        # 头像
        avatar_label = QLabel()
        avatar_label.setObjectName("commentAvatar")
        avatar_label.setFixedSize(40, 40)
        avatar_label.setStyleSheet("""
            QLabel#commentAvatar {
                border-radius: 20px;
                border: 2px solid #e0e0e0;
                background-color: #f5f5f5;
            }
        """)

        # 加载头像
        if self.comment.avatar:
            # 这里应该异步加载头像
            avatar_label.setText("👤")  # 临时头像

        layout.addWidget(avatar_label)

        # 评论内容区域
        content_layout = QVBoxLayout()
        content_layout.setSpacing(4)

        # 用户名和时间
        header_layout = QHBoxLayout()
        header_layout.setSpacing(8)

        username_label = QLabel(self.comment.username)
        username_label.setObjectName("commentUsername")
        header_layout.addWidget(username_label)

        time_label = QLabel(self._format_time(self.comment.time))
        time_label.setObjectName("commentTime")
        header_layout.addWidget(time_label)

        header_layout.addStretch()

        # 点赞数
        like_label = QLabel(f"👍 {self.comment.like_count}")
        like_label.setObjectName("commentLike")
        header_layout.addWidget(like_label)

        content_layout.addLayout(header_layout)

        # 评论内容
        content_label = QLabel(self.comment.content)
        content_label.setObjectName("commentContent")
        content_label.setWordWrap(True)
        content_layout.addWidget(content_label)

        # 回复按钮
        if self.comment.replies:
            reply_button = QPushButton(f"查看 {len(self.comment.replies)} 条回复")
            reply_button.setObjectName("commentReply")
            reply_button.setStyleSheet("""
                QPushButton#commentReply {
                    background: none;
                    border: none;
                    color: #00A1D6;
                    font-size: 12px;
                    text-decoration: none;
                    padding: 0;
                }

                QPushButton#commentReply:hover {
                    color: #4FC3F7;
                    text-decoration: underline;
                }
            """)
            # 这里可以添加回复显示逻辑
            content_layout.addWidget(reply_button)

        layout.addLayout(content_layout)
        layout.addStretch()

        self.setLayout(layout)

    def _format_time(self, time) -> str:
        """格式化时间"""
        from datetime import datetime
        now = datetime.now()
        diff = now - time

        if diff.days > 0:
            return f"{diff.days}天前"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600}小时前"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60}分钟前"
        else:
            return "刚刚"