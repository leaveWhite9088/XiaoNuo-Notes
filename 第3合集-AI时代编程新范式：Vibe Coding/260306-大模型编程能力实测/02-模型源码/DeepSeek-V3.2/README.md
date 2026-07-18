# Bilibili视频平台

基于bilibili-api库开发的B站风格视频平台，提供视频播放、弹幕、评论、用户认证等功能。

## 功能特性

### 核心功能
- 🎥 视频播放和展示
- 💬 弹幕发送和查看
- 📝 评论发送和查看
- 🔐 用户登录认证
- ⭐ 用户收藏管理

### 技术特性
- 基于FastAPI的现代化后端API
- 响应式前端设计，适配移动端
- Bilibili风格的UI界面
- 异步处理，高性能

## 项目结构

```
Bilibili视频平台/
├── app/
│   ├── routes/
│   │   ├── auth.py      # 认证路由
│   │   ├── video.py     # 视频路由
│   │   ├── user.py      # 用户路由
│   │   └── comment.py   # 评论路由
│   └── config.py        # 配置模块
├── static/
│   ├── css/
│   │   └── style.css    # 样式文件
│   ├── js/
│   │   └── app.js       # 前端逻辑
│   └── images/          # 图片资源
├── templates/
│   └── index.html       # 主页面模板
├── main.py              # 应用入口
├── requirements.txt     # 依赖列表
└── README.md           # 项目说明
```

## 安装和运行

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 运行应用
```bash
python main.py
```

### 3. 访问应用
打开浏览器访问: `http://localhost:8000`

## API接口

### 认证相关
- `GET /api/auth/qr-code` - 获取登录二维码
- `GET /api/auth/check-login/{qr_key}` - 检查登录状态
- `GET /api/auth/logout` - 退出登录

### 视频相关
- `GET /api/video/info/{bvid}` - 获取视频信息
- `GET /api/video/danmaku/{bvid}` - 获取弹幕列表
- `POST /api/video/send-danmaku/{bvid}` - 发送弹幕
- `GET /api/video/play-url/{bvid}` - 获取播放链接

### 用户相关
- `GET /api/user/info/{uid}` - 获取用户信息
- `GET /api/user/videos/{uid}` - 获取用户视频
- `GET /api/user/favorites/{uid}` - 获取用户收藏

### 评论相关
- `GET /api/comment/list/{bvid}` - 获取评论列表
- `POST /api/comment/send/{bvid}` - 发送评论
- `POST /api/comment/reply/{bvid}` - 回复评论

## 使用说明

1. **播放视频**: 在首页输入视频BV号，点击"播放视频"
2. **登录认证**: 点击右上角"登录"按钮，使用Bilibili APP扫描二维码
3. **发送弹幕**: 登录后在弹幕标签页输入内容并发送
4. **发表评论**: 登录后在评论标签页输入内容并发送
5. **查看信息**: 查看视频播放量、点赞数、投币数等统计信息

## 技术栈

- **后端**: FastAPI, bilibili-api, uvicorn
- **前端**: HTML5, CSS3, JavaScript
- **认证**: Bilibili二维码登录
- **存储**: 浏览器本地存储

## 注意事项

- 本项目仅用于学习和演示目的
- 请遵守Bilibili的使用条款
- 登录凭据保存在浏览器本地存储中
- 部分功能需要登录后才能使用

## 许可证

MIT License