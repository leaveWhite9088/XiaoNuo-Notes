"""
登录对话框
"""

import asyncio
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton, QFrame, QRadioButton,
    QButtonGroup, QMessageBox, QProgressBar
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QPixmap, QPainter, QImage

from ..api.auth_manager import auth_manager
from .styles import BilibiliStyles, BilibiliColors

class LoginDialog(QDialog):
    """登录对话框"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("登录 - Bilibili Player")
        self.setFixedSize(400, 500)
        self.setStyleSheet(BilibiliStyles.get_login_dialog_style())

        # 初始化UI
        self._init_ui()

        # 连接信号
        self._connect_signals()

    def _init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(16)

        # 标题
        title = QLabel("登录到哔哩哔哩")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # 登录方式选择
        self._init_login_method_selection(layout)

        # 二维码登录区域
        self.qr_frame = QFrame()
        self.qr_frame.setStyleSheet(BilibiliStyles.get_card_style())
        self.qr_frame.setFixedSize(200, 200)
        qr_layout = QVBoxLayout(self.qr_frame)

        self.qr_label = QLabel("正在生成二维码...")
        self.qr_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        qr_layout.addWidget(self.qr_label)

        layout.addWidget(self.qr_frame, alignment=Qt.AlignmentFlag.AlignCenter)

        # 密码登录区域
        self.password_frame = QFrame()
        self.password_frame.setStyleSheet(BilibiliStyles.get_card_style())
        password_layout = QVBoxLayout(self.password_frame)

        # 用户名输入
        username_label = QLabel("用户名/邮箱/手机号")
        username_label.setStyleSheet(f"color: {BilibiliColors.TEXT_SECONDARY}; font-size: 12px;")
        password_layout.addWidget(username_label)

        self.username_edit = QLineEdit()
        self.username_edit.setPlaceholderText("请输入用户名")
        self.username_edit.setStyleSheet(BilibiliStyles.get_input_style())
        password_layout.addWidget(self.username_edit)

        # 密码输入
        password_label = QLabel("密码")
        password_label.setStyleSheet(f"color: {BilibiliColors.TEXT_SECONDARY}; font-size: 12px;")
        password_layout.addWidget(password_label)

        self.password_edit = QLineEdit()
        self.password_edit.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_edit.setPlaceholderText("请输入密码")
        self.password_edit.setStyleSheet(BilibiliStyles.get_input_style())
        password_layout.addWidget(self.password_edit)

        layout.addWidget(self.password_frame)

        # 登录按钮
        self.login_button = QPushButton("登录")
        self.login_button.setStyleSheet(BilibiliStyles.get_button_style())
        self.login_button.setFixedHeight(40)
        layout.addWidget(self.login_button)

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

        # 底部提示
        tip_label = QLabel("登录后即可发送评论、弹幕并查看收藏")
        tip_label.setStyleSheet(f"""
            color: {BilibiliColors.TEXT_HINT};
            font-size: 12px;
            text-align: center;
        """)
        tip_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(tip_label)

        self.setLayout(layout)

        # 默认显示二维码登录
        self._show_qr_login()

    def _init_login_method_selection(self, layout):
        """初始化登录方式选择"""
        method_layout = QHBoxLayout()
        method_layout.setSpacing(16)

        # 二维码登录
        self.qr_radio = QRadioButton("二维码登录")
        self.qr_radio.setChecked(True)
        self.qr_radio.setStyleSheet(f"""
            QRadioButton {{
                color: {BilibiliColors.TEXT_PRIMARY};
                font-size: 14px;
            }}

            QRadioButton::indicator {{
                width: 16px;
                height: 16px;
                border-radius: 8px;
                border: 2px solid {BilibiliColors.BORDER};
                background-color: {BilibiliColors.SURFACE};
            }}

            QRadioButton::indicator:checked {{
                background-color: {BilibiliColors.PRIMARY};
                border-color: {BilibiliColors.PRIMARY};
            }}
        """)

        # 密码登录
        self.password_radio = QRadioButton("密码登录")
        self.password_radio.setStyleSheet(self.qr_radio.styleSheet())

        # 按钮组
        self.login_method_group = QButtonGroup()
        self.login_method_group.addButton(self.qr_radio, 0)
        self.login_method_group.addButton(self.password_radio, 1)

        method_layout.addWidget(self.qr_radio)
        method_layout.addWidget(self.password_radio)
        method_layout.addStretch()

        layout.addLayout(method_layout)

    def _connect_signals(self):
        """连接信号"""
        self.login_method_group.buttonClicked.connect(self._on_login_method_changed)
        self.login_button.clicked.connect(self._on_login_clicked)

    def _on_login_method_changed(self, button):
        """登录方式改变"""
        if button == self.qr_radio:
            self._show_qr_login()
        else:
            self._show_password_login()

    def _show_qr_login(self):
        """显示二维码登录"""
        self.qr_frame.show()
        self.password_frame.hide()
        self.login_button.setText("刷新二维码")
        self._generate_qr_code()

    def _show_password_login(self):
        """显示密码登录"""
        self.qr_frame.hide()
        self.password_frame.show()
        self.login_button.setText("登录")

    def _generate_qr_code(self):
        """生成二维码"""
        # 这里应该生成真实的二维码
        # 暂时显示占位符
        self.qr_label.setText("请使用哔哩哔哩客户端\n扫描上方二维码登录")

        # 启动登录任务
        asyncio.create_task(self._start_qr_login())

    async def _start_qr_login(self):
        """开始二维码登录"""
        try:
            self.progress_bar.setVisible(True)
            self.progress_bar.setRange(0, 0)  # 不确定进度

            success = await auth_manager.login_by_qr()

            self.progress_bar.setVisible(False)

            if success:
                QMessageBox.information(self, "成功", "登录成功！")
                self.accept()
            else:
                QMessageBox.warning(self, "失败", "登录失败，请重试")

        except Exception as e:
            self.progress_bar.setVisible(False)
            QMessageBox.critical(self, "错误", f"登录过程中发生错误：{str(e)}")

    async def _start_password_login(self):
        """开始密码登录"""
        username = self.username_edit.text().strip()
        password = self.password_edit.text()

        if not username or not password:
            QMessageBox.warning(self, "输入错误", "请输入用户名和密码")
            return

        try:
            self.progress_bar.setVisible(True)
            self.progress_bar.setRange(0, 0)

            success = await auth_manager.login_by_password(username, password)

            self.progress_bar.setVisible(False)

            if success:
                QMessageBox.information(self, "成功", "登录成功！")
                self.accept()
            else:
                QMessageBox.warning(self, "失败", "用户名或密码错误")

        except Exception as e:
            self.progress_bar.setVisible(False)
            QMessageBox.critical(self, "错误", f"登录过程中发生错误：{str(e)}")

    def _on_login_clicked(self):
        """登录按钮点击"""
        if self.qr_radio.isChecked():
            self._generate_qr_code()
        else:
            asyncio.create_task(self._start_password_login())