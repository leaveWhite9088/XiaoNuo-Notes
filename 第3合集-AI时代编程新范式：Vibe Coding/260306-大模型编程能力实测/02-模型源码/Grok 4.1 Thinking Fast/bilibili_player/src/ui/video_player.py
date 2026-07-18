"""
视频播放器组件
"""

import asyncio
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QSlider, QLabel, QFrame, QScrollArea, QTextEdit
)
from PyQt6.QtCore import Qt, QTimer, QUrl, pyqtSignal
from PyQt6.QtMultimedia import QMediaPlayer, QAudioOutput
from PyQt6.QtMultimediaWidgets import QVideoWidget

from ..api.bilibili_client import bilibili_client
from ..api.data_models import VideoInfo, Danmaku
from .styles import BilibiliStyles, BilibiliColors

class VideoPlayer(QWidget):
    """视频播放器"""

    # 信号
    video_loaded = pyqtSignal(VideoInfo)  # 视频加载完成
    play_progress = pyqtSignal(int, int)  # 播放进度 (当前时间, 总时间)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.video_info = None
        self.danmakus = []
        self.current_danmaku_index = 0

        # 初始化媒体播放器
        self._init_media_player()

        # 初始化UI
        self._init_ui()

        # 连接信号
        self._connect_signals()

    def _init_media_player(self):
        """初始化媒体播放器"""
        self.media_player = QMediaPlayer()
        self.audio_output = QAudioOutput()
        self.media_player.setAudioOutput(self.audio_output)

        # 设置音量
        from ..utils.config import config
        volume = config.get("player.volume", 80)
        self.audio_output.setVolume(volume / 100.0)

    def _init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 视频显示区域
        self.video_widget = QVideoWidget()
        self.video_widget.setStyleSheet(BilibiliStyles.get_video_player_style())
        self.video_widget.setMinimumHeight(300)
        layout.addWidget(self.video_widget)

        # 弹幕层 (覆盖在视频上)
        self.danmaku_layer = DanmakuLayer(self.video_widget)

        # 控制栏
        self.control_bar = self._create_control_bar()
        layout.addWidget(self.control_bar)

        self.setLayout(layout)

        # 设置视频输出
        self.media_player.setVideoOutput(self.video_widget)

    def _create_control_bar(self):
        """创建控制栏"""
        control_bar = QFrame()
        control_bar.setObjectName("controlBar")
        control_bar.setFixedHeight(50)
        control_bar.setStyleSheet(f"""
            QFrame#controlBar {{
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 0 0 8px 8px;
            }}
        """)

        layout = QHBoxLayout(control_bar)
        layout.setContentsMargins(16, 8, 16, 8)
        layout.setSpacing(12)

        # 播放/暂停按钮
        self.play_button = QPushButton("▶")
        self.play_button.setFixedSize(32, 32)
        self.play_button.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: white;
                border: none;
                border-radius: 16px;
                font-size: 16px;
                font-weight: bold;
            }}

            QPushButton:hover {{
                background-color: rgba(255, 255, 255, 0.1);
            }}
        """)
        layout.addWidget(self.play_button)

        # 进度条
        self.progress_slider = QSlider(Qt.Orientation.Horizontal)
        self.progress_slider.setObjectName("progressBar")
        self.progress_slider.setStyleSheet(f"""
            QSlider::groove:horizontal {{
                background-color: rgba(255, 255, 255, 0.2);
                height: 4px;
                border-radius: 2px;
            }}

            QSlider::handle:horizontal {{
                background-color: {BilibiliColors.PRIMARY};
                width: 16px;
                height: 16px;
                border-radius: 8px;
                margin: -6px 0;
            }}

            QSlider::handle:horizontal:hover {{
                background-color: {BilibiliColors.PRIMARY_LIGHT};
            }}
        """)
        layout.addWidget(self.progress_slider)

        # 时间显示
        self.time_label = QLabel("00:00 / 00:00")
        self.time_label.setStyleSheet("color: white; font-size: 12px;")
        layout.addWidget(self.time_label)

        # 音量控制
        volume_icon = QLabel("🔊")
        volume_icon.setStyleSheet("color: white; font-size: 14px;")
        layout.addWidget(volume_icon)

        self.volume_slider = QSlider(Qt.Orientation.Horizontal)
        self.volume_slider.setRange(0, 100)
        self.volume_slider.setValue(80)
        self.volume_slider.setFixedWidth(80)
        self.volume_slider.setStyleSheet("""
            QSlider::groove:horizontal {
                background-color: rgba(255, 255, 255, 0.2);
                height: 3px;
                border-radius: 1px;
            }

            QSlider::handle:horizontal {
                background-color: white;
                width: 12px;
                height: 12px;
                border-radius: 6px;
                margin: -5px 0;
            }
        """)
        layout.addWidget(self.volume_slider)

        # 弹幕输入框
        self.danmaku_input = QLineEdit()
        self.danmaku_input.setPlaceholderText("发送弹幕...")
        self.danmaku_input.setStyleSheet(f"""
            QLineEdit {{
                border: 1px solid {BilibiliColors.BORDER};
                border-radius: 4px;
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 12px;
            }}

            QLineEdit:focus {{
                border-color: {BilibiliColors.PRIMARY};
            }}

            QLineEdit::placeholder {{
                color: {BilibiliColors.TEXT_HINT};
            }}
        """)
        self.danmaku_input.setFixedWidth(150)
        layout.addWidget(self.danmaku_input)

        # 发送弹幕按钮
        self.send_danmaku_button = QPushButton("发送")
        self.send_danmaku_button.setFixedSize(50, 32)
        self.send_danmaku_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {BilibiliColors.ACCENT};
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }}

            QPushButton:hover {{
                background-color: {BilibiliColors.ACCENT_LIGHT};
            }}

            QPushButton:pressed {{
                background-color: {BilibiliColors.ACCENT_DARK};
            }}
        """)
        layout.addWidget(self.send_danmaku_button)

        # 全屏按钮
        self.fullscreen_button = QPushButton("⛶")
        self.fullscreen_button.setFixedSize(32, 32)
        self.fullscreen_button.setStyleSheet(self.play_button.styleSheet())
        layout.addWidget(self.fullscreen_button)

        return control_bar

    def _connect_signals(self):
        """连接信号"""
        # 播放器信号
        self.media_player.positionChanged.connect(self._on_position_changed)
        self.media_player.durationChanged.connect(self._on_duration_changed)
        self.media_player.playbackStateChanged.connect(self._on_playback_state_changed)

        # 控制信号
        self.play_button.clicked.connect(self._toggle_play_pause)
        self.progress_slider.sliderMoved.connect(self._on_progress_slider_moved)
        self.volume_slider.valueChanged.connect(self._on_volume_changed)
        self.send_danmaku_button.clicked.connect(self._send_danmaku)
        self.danmaku_input.returnPressed.connect(self._send_danmaku)
        self.fullscreen_button.clicked.connect(self._toggle_fullscreen)

        # 弹幕定时器
        self.danmaku_timer = QTimer()
        self.danmaku_timer.timeout.connect(self._update_danmaku)
        self.danmaku_timer.setInterval(100)  # 100ms更新一次

    async def load_video(self, bvid: str):
        """加载视频"""
        try:
            # 获取视频信息
            self.video_info = await bilibili_client.get_video_info(bvid)
            if not self.video_info:
                return False

            # 获取播放地址
            play_url = await bilibili_client.get_play_url(bvid, self.video_info.cid)
            if not play_url:
                return False

            # 设置媒体源
            self.media_player.setSource(QUrl(play_url.url))

            # 获取弹幕
            self.danmakus = await bilibili_client.get_video_danmaku(self.video_info.cid)
            self.current_danmaku_index = 0

            # 发送加载完成信号
            self.video_loaded.emit(self.video_info)

            return True

        except Exception as e:
            print(f"加载视频失败: {e}")
            return False

    def play(self):
        """播放"""
        self.media_player.play()
        self.danmaku_timer.start()

    def pause(self):
        """暂停"""
        self.media_player.pause()
        self.danmaku_timer.stop()

    def stop(self):
        """停止"""
        self.media_player.stop()
        self.danmaku_timer.stop()
        self.danmaku_layer.clear_danmaku()

    def _toggle_play_pause(self):
        """切换播放/暂停"""
        if self.media_player.playbackState() == QMediaPlayer.PlaybackState.PlayingState:
            self.pause()
        else:
            self.play()

    def _on_position_changed(self, position):
        """位置改变"""
        if not self.progress_slider.isSliderDown():
            duration = self.media_player.duration()
            if duration > 0:
                self.progress_slider.setValue(int(position / duration * 1000))

        # 更新时间显示
        self._update_time_display()

        # 更新弹幕
        current_time = position / 1000.0  # 转换为秒
        self._update_danmaku_at_time(current_time)

    def _on_duration_changed(self, duration):
        """时长改变"""
        self._update_time_display()

    def _on_playback_state_changed(self, state):
        """播放状态改变"""
        if state == QMediaPlayer.PlaybackState.PlayingState:
            self.play_button.setText("⏸")
            self.danmaku_timer.start()
        else:
            self.play_button.setText("▶")
            self.danmaku_timer.stop()

    def _on_progress_slider_moved(self, value):
        """进度条移动"""
        if self.media_player.duration() > 0:
            position = int(value / 1000 * self.media_player.duration())
            self.media_player.setPosition(position)

    def _on_volume_changed(self, value):
        """音量改变"""
        self.audio_output.setVolume(value / 100.0)

        # 保存配置
        from ..utils.config import config
        config.set("player.volume", value)

    def _send_danmaku(self):
        """发送弹幕"""
        if not self.video_info or not self.danmaku_input.text().strip():
            return

        content = self.danmaku_input.text().strip()
        current_time = self.media_player.position() / 1000.0

        # 在界面上显示弹幕
        self.danmaku_layer.add_danmaku(content)
        self.danmaku_input.clear()

        # 发送到服务器 (需要登录)
        asyncio.create_task(self._send_danmaku_to_server(content, current_time))

    async def _send_danmaku_to_server(self, content: str, time: float):
        """发送弹幕到服务器"""
        from ..api.bilibili_client import bilibili_client
        from PyQt6.QtWidgets import QMessageBox

        try:
            success = await bilibili_client.send_danmaku(self.video_info.cid, content, time)
            if not success:
                QMessageBox.warning(self, "发送失败", "弹幕发送失败，请检查登录状态")
        except Exception as e:
            print(f"发送弹幕失败: {e}")

    def _toggle_fullscreen(self):
        """切换全屏"""
        # 这里需要父窗口支持全屏切换
        pass

    def _update_time_display(self):
        """更新时间显示"""
        position = self.media_player.position() // 1000
        duration = self.media_player.duration() // 1000

        position_str = f"{position//60:02d}:{position%60:02d}"
        duration_str = f"{duration//60:02d}:{duration%60:02d}"

        self.time_label.setText(f"{position_str} / {duration_str}")

        # 发送进度信号
        self.play_progress.emit(position, duration)

    def _update_danmaku(self):
        """更新弹幕"""
        if not self.danmakus or self.media_player.playbackState() != QMediaPlayer.PlaybackState.PlayingState:
            return

        current_time = self.media_player.position() / 1000.0

        # 显示当前时间的弹幕
        while (self.current_danmaku_index < len(self.danmakus) and
               self.danmakus[self.current_danmaku_index].time <= current_time + 0.1):
            danmaku = self.danmakus[self.current_danmaku_index]
            self.danmaku_layer.add_danmaku(danmaku.content)
            self.current_danmaku_index += 1

    def _update_danmaku_at_time(self, current_time: float):
        """在指定时间显示弹幕"""
        # 重置弹幕索引
        self.current_danmaku_index = 0
        self.danmaku_layer.clear_danmaku()

        # 找到当前时间应该显示的弹幕
        for i, danmaku in enumerate(self.danmakus):
            if danmaku.time <= current_time:
                if danmaku.time >= current_time - 5:  # 显示最近5秒的弹幕
                    self.danmaku_layer.add_danmaku(danmaku.content)
                self.current_danmaku_index = i + 1
            else:
                break

class DanmakuLayer(QWidget):
    """弹幕层"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.danmakus = []
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        self.setStyleSheet("background: transparent;")

    def add_danmaku(self, text: str):
        """添加弹幕"""
        # 创建弹幕标签
        label = QLabel(text)
        label.setObjectName("danmaku")
        label.setStyleSheet(f"""
            QLabel#danmaku {{
                color: white;
                font-weight: bold;
                font-size: 18px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                background: none;
                border: none;
            }}
        """)

        # 随机垂直位置
        y = 50 + (len(self.danmakus) % 5) * 50
        label.move(self.width(), y)
        label.show()

        # 动画移动
        self.danmakus.append((label, self.width()))

        # 启动移动动画
        QTimer.singleShot(50, lambda: self._animate_danmaku(label))

    def _animate_danmaku(self, label):
        """动画弹幕"""
        def move():
            x = label.x() - 5
            label.move(x, label.y())

            if x > -label.width():
                QTimer.singleShot(50, move)
            else:
                # 移除弹幕
                label.hide()
                label.setParent(None)
                # 从列表中移除
                self.danmakus = [(l, x) for l, x in self.danmakus if l != label]

        move()

    def clear_danmaku(self):
        """清除所有弹幕"""
        for label, _ in self.danmakus:
            label.hide()
            label.setParent(None)
        self.danmakus.clear()

    def resizeEvent(self, event):
        """调整大小事件"""
        super().resizeEvent(event)
        # 调整弹幕层大小
        if hasattr(self, 'parent') and self.parent():
            self.setGeometry(0, 0, self.parent().width(), self.parent().height())