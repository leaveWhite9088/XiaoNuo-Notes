# Bilibili视频平台

基于 `bilibili-api-python` 库开发的Bilibili第三方Web视频平台，支持视频播放、弹幕评论、用户登录、收藏管理等功能。

## 功能特性

### 视频功能
- 🎬 视频播放（集成DPlayer播放器）
- 🔥 首页推荐视频
- 📈 热门视频排行榜
- 🔍 视频搜索功能
- 📺 相关视频推荐

### 弹幕评论
- 💬 查看视频评论（热门/最新排序）
- 📝 发送评论（需登录）
- 🎆 查看弹幕
- ✉️ 发送弹幕（需登录）

### 用户功能
- 🔐 扫码登录（支持Bilibili App扫码）
- 👤 查看用户信息
- ⭐ 收藏夹管理
- 📜 观看历史记录

### UI设计
- 🎨 采用Bilibili官方配色方案
- 📱 响应式布局设计
- 🌐 全中文界面
- ⚡ 流畅的交互动画

## 技术架构

```
bilibili-platform/
├── backend/              # 后端服务
│   ├── api_server.py     # FastAPI主服务
│   ├── auth_manager.py   # 认证管理
│   └── config.py         # 配置文件
├── frontend/             # 前端界面
│   ├── index.html        # 主页面
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       └── app.js        # 核心逻辑
├── data/                 # 数据存储
│   └── credential.json   # 登录凭证
├── requirements.txt      # Python依赖
├── start.py             # 启动脚本
└── README.md            # 项目说明
```

## 技术栈

- **后端**: Python + FastAPI + bilibili-api-python
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **播放器**: DPlayer + HLS.js
- **UI**: Font Awesome图标

## 快速开始

### 1. 安装依赖

```bash
cd bilibili-platform
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python start.py
```

或者直接启动：

```bash
uvicorn backend.api_server:app --host 0.0.0.0 --port 8080 --reload
```

### 3. 访问平台

打开浏览器访问: http://localhost:8080

## 使用指南

### 登录
1. 点击右上角"登录"按钮
2. 使用Bilibili App扫描二维码
3. 在手机上确认登录

### 观看视频
1. 首页浏览推荐视频，或搜索感兴趣的内容
2. 点击视频卡片进入播放页面
3. 支持查看视频信息、UP主信息、相关推荐

### 发送弹幕/评论
1. 需要先登录账号
2. 在视频播放页下方输入评论内容
3. 点击投币按钮可打开发送弹幕窗口

### 查看收藏
1. 登录后点击用户头像
2. 选择"我的收藏"查看收藏夹视频

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/status` | GET | 获取登录状态 |
| `/api/auth/qrcode` | GET | 获取登录二维码 |
| `/api/auth/qrcode/check` | GET | 检查二维码状态 |
| `/api/auth/logout` | POST | 退出登录 |
| `/api/video/info` | GET | 获取视频信息 |
| `/api/video/related` | GET | 获取相关视频 |
| `/api/comment/list` | GET | 获取评论列表 |
| `/api/comment/send` | POST | 发送评论 |
| `/api/danmaku/list` | GET | 获取弹幕列表 |
| `/api/danmaku/send` | POST | 发送弹幕 |
| `/api/search` | GET | 搜索视频 |
| `/api/home/videos` | GET | 首页推荐视频 |
| `/api/home/popular` | GET | 热门视频 |
| `/api/user/info` | GET | 用户信息 |
| `/api/favorite/folders` | GET | 收藏夹列表 |
| `/api/favorite/videos` | GET | 收藏夹视频 |
| `/api/history/list` | GET | 观看历史 |

## 配色方案

采用Bilibili官方配色：
- 主题蓝: `#00A1D6`
- 主题粉: `#FB7299`
- 背景灰: `#F1F2F3`
- 文字黑: `#18191C`
- 次要灰: `#61666D`

## 注意事项

1. 本项目仅供学习交流使用
2. 登录凭证保存在本地 `data/credential.json`
3. 请勿频繁调用API，避免账号被限制
4. 视频播放功能依赖于B站官方接口

## 许可证

MIT License