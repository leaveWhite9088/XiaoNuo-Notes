# Bilibili Player

一个基于bilibili-api的Bilibili视频播放器，提供完整的视频观看、评论、弹幕等功能。

## 功能特性

- 🎥 视频播放和信息展示
- 💬 评论查看和发送
- 🎯 弹幕显示和发送
- 🔐 用户登录认证
- ⭐ 收藏视频管理
- 🎨 Bilibili风格UI设计

## 技术栈

- Python 3.8+
- PyQt6 (UI框架)
- bilibili-api-python (Bilibili API)
- asyncio (异步处理)

## 安装依赖

建议使用虚拟环境安装依赖：

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/macOS
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

或者使用pipx（推荐）：

```bash
pipx install --spec . bilibili-player
```

## 运行

如果使用虚拟环境：

```bash
# 激活虚拟环境
source venv/bin/activate

# 运行应用
python src/main.py
# 或
python run.py
```

如果使用pipx，直接运行：

```bash
bilibili-player
```

## 测试

运行基础功能测试：

```bash
python test_basic.py
```

## 项目结构

```
bilibili_player/
├── src/
│   ├── main.py                 # 程序入口
│   ├── ui/                     # UI层
│   │   ├── main_window.py      # 主窗口
│   │   ├── video_player.py     # 视频播放器
│   │   ├── login_dialog.py     # 登录对话框
│   │   └── styles.py           # 样式定义
│   ├── api/                    # API层
│   │   ├── bilibili_client.py  # Bilibili API客户端
│   │   ├── auth_manager.py     # 认证管理
│   │   └── data_models.py      # 数据模型
│   └── utils/                  # 工具类
│       ├── config.py           # 配置管理
│       └── logger.py           # 日志工具
├── assets/                     # 资源文件
├── config/                     # 配置文件
└── requirements.txt            # 依赖文件
```