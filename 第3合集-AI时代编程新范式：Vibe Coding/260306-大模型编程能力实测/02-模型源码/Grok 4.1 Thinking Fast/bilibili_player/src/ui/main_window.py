"""
主窗口
"""

import asyncio
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QSplitter, QFrame, QLabel, QPushButton, QLineEdit,
    QTabWidget, QListWidget, QListWidgetItem, QMessageBox,
    QStatusBar, QMenuBar, QMenu, QAction
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QCloseEvent

from .video_player import VideoPlayer
from .comments_widget import CommentsWidget
from .login_dialog import LoginDialog
from ..api.auth_manager import auth_manager
from ..api.bilibili_client import bilibili_client
from ..api.data_models import VideoInfo, Collection
from ..utils.config import config
from .styles import BilibiliStyles, BilibiliColors

class MainWindow(QMainWindow):
    """主窗口"""

    login_status_changed = pyqtSignal(bool)  # 登录状态改变信号

    def __init__(self):
        super().__init__()
        self.current_video_info = None
        self.collections = []

        self._init_window()
        self._init_ui()
        self._init_menu()
        self._connect_signals()

        # 检查登录状态
        self._check_login_status()

    def _init_window(self):
        """初始化窗口"""
        self.setWindowTitle("Bilibili Player")
        self.setMinimumSize(1000, 700)

        # 从配置恢复窗口大小和位置
        width = config.get("window.width", 1200)
        height = config.get("window.height", 800)
        x = config.get("window.x", 100)
        y = config.get("window.y", 100)
        self.setGeometry(x, y, width, height)

        # 设置样式
        self.setStyleSheet(BilibiliStyles.get_main_window_style())

    def _init_ui(self):
        """初始化UI"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 创建分割器
        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)

        # 左侧边栏
        self.sidebar = self._create_sidebar()
        splitter.addWidget(self.sidebar)
        splitter.setCollapsible(0, False)

        # 主内容区域
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)

        # 顶部工具栏
        self.toolbar = self._create_toolbar()
        content_layout.addWidget(self.toolbar)

        # 主要内容分割器 (视频和评论)
        content_splitter = QSplitter(Qt.Orientation.Vertical)
        content_layout.addWidget(content_splitter)

        # 视频播放器
        self.video_player = VideoPlayer()
        content_splitter.addWidget(self.video_player)

        # 评论区域
        self.comments_widget = CommentsWidget()
        content_splitter.addWidget(self.comments_widget)

        # 设置分割器比例
        content_splitter.setSizes([400, 300])

        splitter.addWidget(content_widget)

        # 设置主分割器比例
        splitter.setSizes([250, 950])

        # 状态栏
        self.status_bar = self.statusBar()
        self.status_bar.showMessage("就绪")

    def _create_sidebar(self):
        """创建侧边栏"""
        sidebar = QFrame()
        sidebar.setStyleSheet(f"""
            QFrame {{
                background-color: {BilibiliColors.SURFACE};
                border-right: 1px solid {BilibiliColors.BORDER};
            }}
        """)
        sidebar.setFixedWidth(250)

        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 搜索区域
        search_frame = QFrame()
        search_frame.setStyleSheet(f"""
            QFrame {{
                background-color: {BilibiliColors.SURFACE_VARIANT};
                border-bottom: 1px solid {BilibiliColors.BORDER};
                padding: 16px;
            }}
        """)

        search_layout = QVBoxLayout(search_frame)
        search_layout.setContentsMargins(0, 0, 0, 0)

        search_label = QLabel("搜索视频")
        search_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 14px;
            font-weight: bold;
        """)
        search_layout.addWidget(search_label)

        # 搜索输入框
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("输入BV号或AV号")
        self.search_edit.setStyleSheet(BilibiliStyles.get_input_style())
        search_layout.addWidget(self.search_edit)

        # 搜索按钮
        self.search_button = QPushButton("搜索")
        self.search_button.setStyleSheet(BilibiliStyles.get_button_style())
        self.search_button.setFixedHeight(32)
        search_layout.addWidget(self.search_button)

        layout.addWidget(search_frame)

        # 标签页
        self.tab_widget = QTabWidget()
        self.tab_widget.setStyleSheet(f"""
            QTabWidget::pane {{
                border: none;
                background-color: transparent;
            }}

            QTabBar::tab {{
                background-color: transparent;
                border: none;
                padding: 8px 16px;
                margin-right: 2px;
                color: {BilibiliColors.TEXT_SECONDARY};
            }}

            QTabBar::tab:selected {{
                background-color: {BilibiliColors.PRIMARY};
                color: white;
                border-radius: 4px;
            }}

            QTabBar::tab:hover {{
                color: {BilibiliColors.PRIMARY};
            }}
        """)

        # 收藏标签页
        self.collections_list = QListWidget()
        self.collections_list.setStyleSheet(f"""
            QListWidget {{
                border: none;
                background-color: transparent;
                outline: none;
            }}

            QListWidget::item {{
                padding: 8px 12px;
                border-bottom: 1px solid {BilibiliColors.BORDER};
                color: {BilibiliColors.TEXT_PRIMARY};
            }}

            QListWidget::item:selected {{
                background-color: {BilibiliColors.PRIMARY_LIGHT};
                color: white;
            }}

            QListWidget::item:hover {{
                background-color: {BilibiliColors.SURFACE_VARIANT};
            }}
        """)

        self.tab_widget.addTab(self.collections_list, "收藏")

        # 历史标签页
        self.history_list = QListWidget()
        self.history_list.setStyleSheet(self.collections_list.styleSheet())
        self.tab_widget.addTab(self.history_list, "历史")

        layout.addWidget(self.tab_widget)

        return sidebar

    def _create_toolbar(self):
        """创建工具栏"""
        toolbar = QFrame()
        toolbar.setStyleSheet(f"""
            QFrame {{
                background-color: {BilibiliColors.SURFACE};
                border-bottom: 1px solid {BilibiliColors.BORDER};
                padding: 8px 16px;
            }}
        """)
        toolbar.setFixedHeight(60)

        layout = QHBoxLayout(toolbar)
        layout.setContentsMargins(0, 0, 0, 0)

        # 视频信息区域
        info_layout = QVBoxLayout()
        info_layout.setSpacing(2)

        self.video_title_label = QLabel("未加载视频")
        self.video_title_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 16px;
            font-weight: bold;
        """)
        info_layout.addWidget(self.video_title_label)

        self.video_stats_label = QLabel("")
        self.video_stats_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_SECONDARY};
            font-size: 12px;
        """)
        info_layout.addWidget(self.video_stats_label)

        layout.addLayout(info_layout)
        layout.addStretch()

        # 操作按钮区域
        buttons_layout = QHBoxLayout()
        buttons_layout.setSpacing(8)

        # 登录按钮
        self.login_button = QPushButton("登录")
        self.login_button.setStyleSheet(BilibiliStyles.get_button_style())
        self.login_button.setFixedHeight(32)
        buttons_layout.addWidget(self.login_button)

        # 跳转官网按钮
        self.website_button = QPushButton("官网")
        self.website_button.setStyleSheet(BilibiliStyles.get_secondary_button_style())
        self.website_button.setFixedHeight(32)
        buttons_layout.addWidget(self.website_button)

        layout.addLayout(buttons_layout)

        return toolbar

    def _init_menu(self):
        """初始化菜单"""
        menubar = self.menuBar()

        # 文件菜单
        file_menu = menubar.addMenu("文件")

        open_action = QAction("打开视频", self)
        open_action.triggered.connect(self._open_video)
        file_menu.addAction(open_action)

        exit_action = QAction("退出", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # 播放菜单
        play_menu = menubar.addMenu("播放")

        play_pause_action = QAction("播放/暂停", self)
        play_pause_action.triggered.connect(self.video_player._toggle_play_pause)
        play_menu.addAction(play_pause_action)

        # 帮助菜单
        help_menu = menubar.addMenu("帮助")

        about_action = QAction("关于", self)
        about_action.triggered.connect(self._show_about)
        help_menu.addAction(about_action)

    def _connect_signals(self):
        """连接信号"""
        # 搜索相关
        self.search_button.clicked.connect(self._search_video)
        self.search_edit.returnPressed.connect(self._search_video)

        # 视频播放器信号
        self.video_player.video_loaded.connect(self._on_video_loaded)

        # 登录相关
        self.login_button.clicked.connect(self._show_login_dialog)
        self.login_status_changed.connect(self.comments_widget.update_login_status)

        # 收藏列表
        self.collections_list.itemDoubleClicked.connect(self._on_collection_item_double_clicked)

    def _check_login_status(self):
        """检查登录状态"""
        asyncio.create_task(self._update_login_status())

    async def _update_login_status(self):
        """更新登录状态"""
        # 这里可以添加自动验证逻辑
        is_logged_in = auth_manager.is_logged_in()

        if is_logged_in:
            self.login_button.setText(f"{auth_manager.user_info.name}")
            self.login_button.setStyleSheet(BilibiliStyles.get_secondary_button_style())
        else:
            self.login_button.setText("登录")
            self.login_button.setStyleSheet(BilibiliStyles.get_button_style())

        # 发送登录状态改变信号
        self.login_status_changed.emit(is_logged_in)

        # 加载收藏夹 (如果已登录)
        if is_logged_in:
            await self._load_collections()

    def _search_video(self):
        """搜索视频"""
        bvid = self.search_edit.text().strip()
        if not bvid:
            QMessageBox.warning(self, "输入错误", "请输入BV号或AV号")
            return

        # 标准化BV号
        if not bvid.upper().startswith('BV') and not bvid.upper().startswith('AV'):
            bvid = f"BV{bvid}"

        self.status_bar.showMessage(f"正在加载视频: {bvid}")
        asyncio.create_task(self._load_video(bvid))

    async def _load_video(self, bvid: str):
        """加载视频"""
        try:
            success = await self.video_player.load_video(bvid)
            if success:
                self.status_bar.showMessage("视频加载成功")
            else:
                self.status_bar.showMessage("视频加载失败")
                QMessageBox.warning(self, "加载失败", f"无法加载视频: {bvid}")

        except Exception as e:
            self.status_bar.showMessage("视频加载失败")
            QMessageBox.critical(self, "错误", f"加载视频时发生错误：{str(e)}")

    def _on_video_loaded(self, video_info: VideoInfo):
        """视频加载完成"""
        self.current_video_info = video_info

        # 更新UI
        self.video_title_label.setText(video_info.title)
        stats_text = f"播放 {video_info.view_count:,} · 弹幕 {video_info.danmaku_count:,} · 点赞 {video_info.like_count:,}"
        self.video_stats_label.setText(stats_text)

        # 设置评论
        self.comments_widget.set_video_oid(video_info.aid)

        # 连接官网按钮
        try:
            self.website_button.clicked.disconnect()  # 断开之前的连接
        except:
            pass
        self.website_button.clicked.connect(
            lambda: self._open_website(f"https://www.bilibili.com/video/{video_info.bvid}")
        )

    def _open_video(self):
        """打开视频文件 (暂时不支持)"""
        QMessageBox.information(self, "提示", "目前只支持在线Bilibili视频播放")

    def _show_login_dialog(self):
        """显示登录对话框"""
        if auth_manager.is_logged_in():
            # 已登录，显示登出确认
            reply = QMessageBox.question(
                self, "确认登出",
                "确定要登出吗？",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )

            if reply == QMessageBox.StandardButton.Yes:
                asyncio.create_task(self._logout())
        else:
            # 未登录，显示登录对话框
            login_dialog = LoginDialog(self)
            if login_dialog.exec():
                # 登录成功
                asyncio.create_task(self._update_login_status())

    async def _logout(self):
        """登出"""
        try:
            await auth_manager.logout()
            await self._update_login_status()
            QMessageBox.information(self, "成功", "已成功登出")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"登出失败：{str(e)}")


    async def _load_collections(self):
        """加载收藏夹"""
        try:
            self.collections = await bilibili_client.get_user_collections()
            self._update_collections_ui()
        except Exception as e:
            print(f"加载收藏夹失败: {e}")

    def _update_collections_ui(self):
        """更新收藏夹UI"""
        self.collections_list.clear()

        for collection in self.collections:
            item = QListWidgetItem(f"{collection.title} ({collection.count})")
            item.setData(Qt.ItemDataRole.UserRole, collection.id)
            self.collections_list.addItem(item)

    def _on_collection_item_double_clicked(self, item):
        """收藏夹项双击"""
        collection_id = item.data(Qt.ItemDataRole.UserRole)
        asyncio.create_task(self._load_collection_videos(collection_id))

    async def _load_collection_videos(self, collection_id: int):
        """加载收藏夹视频"""
        try:
            videos = await bilibili_client.get_collection_videos(collection_id)

            # 这里可以显示视频列表或者直接播放第一个
            if videos:
                await self._load_video(videos[0].bvid)

        except Exception as e:
            QMessageBox.critical(self, "错误", f"加载收藏夹视频失败：{str(e)}")

    def _open_website(self, url: str):
        """打开官网"""
        import webbrowser
        webbrowser.open(url)

    def _show_about(self):
        """显示关于对话框"""
        QMessageBox.about(
            self, "关于 Bilibili Player",
            "Bilibili Player v1.0.0\n\n"
            "一个基于bilibili-api的Bilibili视频播放器\n\n"
            "功能：\n"
            "• 视频播放\n"
            "• 评论查看和发送\n"
            "• 弹幕显示和发送\n"
            "• 用户登录认证\n"
            "• 收藏视频管理\n\n"
            "技术栈：PyQt6 + bilibili-api"
        )

    def closeEvent(self, event: QCloseEvent):
        """窗口关闭事件"""
        # 保存窗口配置
        geometry = self.geometry()
        config.set("window.width", geometry.width())
        config.set("window.height", geometry.height())
        config.set("window.x", geometry.x())
        config.set("window.y", geometry.y())

        config.save()
        event.accept()

    def keyPressEvent(self, event):
        """键盘事件"""
        if event.key() == Qt.Key.Key_Space:
            # 空格键播放/暂停
            self.video_player._toggle_play_pause()
            event.accept()
        elif event.key() == Qt.Key.Key_F:
            # F键全屏 (暂时不支持)
            event.accept()
        else:
            super().keyPressEvent(event)