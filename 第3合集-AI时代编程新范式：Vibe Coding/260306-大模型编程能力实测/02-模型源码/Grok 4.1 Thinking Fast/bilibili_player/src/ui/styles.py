"""
UI样式定义 - Bilibili风格
"""

from PyQt6.QtGui import QColor

class BilibiliColors:
    """Bilibili配色方案"""

    # 主色调
    PRIMARY = "#00A1D6"      # 哔哩哔哩蓝
    PRIMARY_LIGHT = "#4FC3F7" # 浅蓝
    PRIMARY_DARK = "#0277BD"  # 深蓝

    # 辅助色
    ACCENT = "#FF6D00"       # 橙色
    ACCENT_LIGHT = "#FF8A00" # 浅橙
    ACCENT_DARK = "#E65100"  # 深橙

    # 背景色
    BACKGROUND = "#F8F9FA"   # 浅灰背景
    SURFACE = "#FFFFFF"      # 白色表面
    SURFACE_VARIANT = "#F5F5F5" # 浅灰表面

    # 文字颜色
    TEXT_PRIMARY = "#212121"     # 主文字
    TEXT_SECONDARY = "#757575"   # 次要文字
    TEXT_HINT = "#BDBDBD"        # 提示文字

    # 状态色
    SUCCESS = "#4CAF50"      # 成功绿
    WARNING = "#FF9800"      # 警告橙
    ERROR = "#F44336"        # 错误红
    INFO = "#2196F3"         # 信息蓝

    # 边框和分割线
    BORDER = "#E0E0E0"       # 边框色
    DIVIDER = "#EEEEEE"      # 分割线

class BilibiliStyles:
    """Bilibili样式定义"""

    @staticmethod
    def get_main_window_style():
        """主窗口样式"""
        return f"""
        QMainWindow {{
            background-color: {BilibiliColors.BACKGROUND};
            color: {BilibiliColors.TEXT_PRIMARY};
        }}

        QMenuBar {{
            background-color: {BilibiliColors.SURFACE};
            border-bottom: 1px solid {BilibiliColors.BORDER};
            padding: 4px;
        }}

        QMenuBar::item {{
            background-color: transparent;
            padding: 4px 8px;
            margin: 0px 2px;
            border-radius: 4px;
        }}

        QMenuBar::item:selected {{
            background-color: {BilibiliColors.PRIMARY_LIGHT};
            color: white;
        }}
        """

    @staticmethod
    def get_button_style():
        """按钮样式"""
        return f"""
        QPushButton {{
            background-color: {BilibiliColors.PRIMARY};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
        }}

        QPushButton:hover {{
            background-color: {BilibiliColors.PRIMARY_LIGHT};
        }}

        QPushButton:pressed {{
            background-color: {BilibiliColors.PRIMARY_DARK};
        }}

        QPushButton:disabled {{
            background-color: {BilibiliColors.TEXT_HINT};
            color: {BilibiliColors.TEXT_SECONDARY};
        }}
        """

    @staticmethod
    def get_secondary_button_style():
        """次要按钮样式"""
        return f"""
        QPushButton {{
            background-color: transparent;
            color: {BilibiliColors.PRIMARY};
            border: 2px solid {BilibiliColors.PRIMARY};
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
        }}

        QPushButton:hover {{
            background-color: {BilibiliColors.PRIMARY};
            color: white;
        }}

        QPushButton:pressed {{
            background-color: {BilibiliColors.PRIMARY_DARK};
            border-color: {BilibiliColors.PRIMARY_DARK};
        }}
        """

    @staticmethod
    def get_input_style():
        """输入框样式"""
        return f"""
        QLineEdit, QTextEdit, QComboBox {{
            border: 2px solid {BilibiliColors.BORDER};
            border-radius: 6px;
            padding: 8px 12px;
            background-color: {BilibiliColors.SURFACE};
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 14px;
        }}

        QLineEdit:focus, QTextEdit:focus, QComboBox:focus {{
            border-color: {BilibiliColors.PRIMARY};
        }}

        QLineEdit::placeholder, QTextEdit::placeholder {{
            color: {BilibiliColors.TEXT_HINT};
        }}
        """

    @staticmethod
    def get_card_style():
        """卡片样式"""
        return f"""
        QWidget {{
            background-color: {BilibiliColors.SURFACE};
            border-radius: 8px;
            border: 1px solid {BilibiliColors.BORDER};
        }}
        """

    @staticmethod
    def get_video_player_style():
        """视频播放器样式"""
        return f"""
        QVideoWidget {{
            background-color: black;
            border-radius: 8px;
        }}

        #controlBar {{
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 0 0 8px 8px;
        }}

        #progressBar {{
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }}

        #progressBar::chunk {{
            background-color: {BilibiliColors.PRIMARY};
            border-radius: 2px;
        }}
        """

    @staticmethod
    def get_comment_style():
        """评论样式"""
        return f"""
        #commentItem {{
            background-color: {BilibiliColors.SURFACE};
            border-radius: 8px;
            border: 1px solid {BilibiliColors.BORDER};
            margin: 4px 0px;
            padding: 12px;
        }}

        #commentAvatar {{
            border-radius: 20px;
            border: 2px solid {BilibiliColors.BORDER};
        }}

        #commentUsername {{
            color: {BilibiliColors.PRIMARY};
            font-weight: bold;
            font-size: 14px;
        }}

        #commentContent {{
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 13px;
            line-height: 1.4;
        }}

        #commentTime {{
            color: {BilibiliColors.TEXT_SECONDARY};
            font-size: 12px;
        }}

        #commentLike {{
            color: {BilibiliColors.TEXT_SECONDARY};
            font-size: 12px;
        }}

        #commentReply {{
            color: {BilibiliColors.PRIMARY};
            font-size: 12px;
            text-decoration: none;
        }}

        #commentReply:hover {{
            color: {BilibiliColors.PRIMARY_LIGHT};
        }}
        """

    @staticmethod
    def get_danmaku_style():
        """弹幕样式"""
        return """
        #danmaku {{
            color: white;
            font-weight: bold;
            font-size: 18px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            background: none;
            border: none;
        }}
        """

    @staticmethod
    def get_login_dialog_style():
        """登录对话框样式"""
        return f"""
        QDialog {{
            background-color: {BilibiliColors.SURFACE};
            border-radius: 12px;
            border: 1px solid {BilibiliColors.BORDER};
        }}

        QLabel#title {{
            color: {BilibiliColors.TEXT_PRIMARY};
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }}

        QLabel#subtitle {{
            color: {BilibiliColors.TEXT_SECONDARY};
            font-size: 14px;
            margin-bottom: 16px;
        }}
        """

    @staticmethod
    def get_scroll_area_style():
        """滚动区域样式"""
        return f"""
        QScrollArea {{
            border: none;
            background-color: transparent;
        }}

        QScrollBar:vertical {{
            background-color: {BilibiliColors.SURFACE_VARIANT};
            width: 8px;
            border-radius: 4px;
        }}

        QScrollBar::handle:vertical {{
            background-color: {BilibiliColors.BORDER};
            border-radius: 4px;
            min-height: 30px;
        }}

        QScrollBar::handle:vertical:hover {{
            background-color: {BilibiliColors.TEXT_HINT};
        }}

        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            border: none;
            background: none;
        }}

        QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
            background: none;
        }}
        """