# Bilibili Web - 非官方B站网页版

一个使用 Flask 后端 + 原生 JavaScript 前端构建的 Bilibili 视频平台模拟网站。

## 功能特性

- 热门视频浏览
- 视频搜索
- 视频播放
- 评论查看和发送
- 弹幕显示
- 用户登录（SESSDATA/二维码）
- 收藏功能
- 排行榜

## 技术栈

- **后端**: Flask + Python
- **前端**: 原生 HTML/CSS/JavaScript + Vue.js 3
- **API**: 直接调用 B 站官方 API

## 快速开始

### 1. 安装依赖

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
pip install flask flask-cors requests
```

### 2. 启动后端

```bash
python3 backend/app.py
```

后端将在 http://localhost:5001 启动

### 3. 打开前端

直接在浏览器中打开 `frontend/index.html`

或者使用简单 HTTP 服务器：

```bash
cd frontend
python3 -m http.server 8000
```

然后访问 http://localhost:8000

## 登录说明

### 方式一：SESSDATA 登录

1. 登录 Bilibili 网页版 (www.bilibili.com)
2. 按 F12 打开开发者工具
3. Application/存储 → Cookies → bilibili.com
4. 复制 SESSDATA 的值
5. 在网页中点击"登录"，选择"SESSDATA登录"，粘贴并提交

### 方式二：二维码登录

1. 点击"登录"
2. 选择"二维码登录"
3. 使用 B 站手机客户端扫码

## 项目结构

```
bilibili-web/
├── backend/
│   ├── app.py          # Flask 后端服务
│   └── requirements.txt # Python 依赖
├── frontend/
│   ├── index.html      # 主页面
│   ├── css/
│   │   └── style.css  # 样式文件
│   └── js/
│       └── app.js     # 前端逻辑
└── README.md
```

## 注意事项

- 本项目仅供学习交流使用
- 请勿用于商业用途
- 使用二维码登录时需要在手机端确认
- 视频播放需要跨域支持（B站API需要）
- 某些功能需要登录后才能使用

## 许可证

MIT License
