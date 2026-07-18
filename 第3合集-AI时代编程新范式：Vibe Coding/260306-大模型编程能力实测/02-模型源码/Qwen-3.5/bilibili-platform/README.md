# Bilibili 视频平台

一个完整的哔哩哔哩弹幕视频平台 Clone，支持视频播放、弹幕、评论、登录、收藏等功能。

## ✨ 功能特性

### 用户功能
- ✅ 扫码登录（支持 B 站 APP 扫码）
- ✅ 用户信息管理
- ✅ 查看收藏夹
- ✅ 收藏/取消收藏视频

### 视频功能
- ✅ 视频播放（支持多种格式）
- ✅ 弹幕显示与发送
- ✅ 视频详情展示
- ✅ 相关推荐视频
- ✅ 跳转官网

### 互动功能
- ✅ 发送评论
- ✅ 回复评论
- ✅ 点赞评论
- ✅ 实时弹幕系统

### 界面特性
- ✅ 响应式设计
- ✅ B 站经典粉蓝配色
- ✅ 现代化 UI 布局
- ✅ 全中文界面

## 🏗️ 技术架构

### 前端
- **框架**: React 18 + React Router v6
- **样式**: Tailwind CSS
- **播放器**: React Player
- **弹幕**: 自研弹幕引擎
- **二维码**: qrcode.react

### 后端
- **运行时**: Node.js
- **框架**: Express
- **API**: Bilibili API (非官方)
- **会话**: express-session
- **HTTP 客户端**: Axios

## 📦 安装与运行

### 快速启动

```bash
cd bilibili-platform
chmod +x start.sh
./start.sh
```

### 手动启动

#### 后端
```bash
cd backend
npm install
cp .env.example .env
# 编辑.env 文件配置你的 B 站登录信息（可选）
npm run dev
```

#### 前端
```bash
cd frontend
npm install
npm start
```

## 🌐 访问地址

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:3001/api

## 📁 项目结构

```
bilibili-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   ├── video.js    # 视频相关 API
│   │   │   ├── user.js     # 用户相关 API
│   │   │   ├── comment.js  # 评论相关 API
│   │   │   ├── danmaku.js  # 弹幕相关 API
│   │   │   └── favorite.js # 收藏相关 API
│   │   ├── utils/
│   │   │   └── bilibili.js # B 站 API 封装
│   │   └── index.js        # 入口文件
│   └── package.json
├── frontend/               # 前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/    # React 组件
│   │   │   ├── VideoCard.js       # 视频卡片
│   │   │   ├── VideoPlayer.js     # 视频播放器
│   │   │   ├── CommentSection.js  # 评论区
│   │   │   └── Header.js          # 导航栏
│   │   ├── pages/         # 页面组件
│   │   │   ├── HomePage.js        # 首页
│   │   │   ├── VideoPage.js       # 视频页
│   │   │   └── FavoritePage.js    # 收藏页
│   │   ├── hooks/         # 自定义 Hooks
│   │   │   ├── useAuth.js         # 认证 Hook
│   │   │   └── useDanmaku.js      # 弹幕 Hook
│   │   ├── utils/         # 工具函数
│   │   │   └── api.js             # API 封装
│   │   ├── styles/        # 样式文件
│   │   └── App.js         # 应用入口
│   └── package.json
└── start.sh               # 启动脚本
```

## 🎯 API 端点

### 视频相关
- `GET /api/videos/detail/:bvid` - 获取视频详情
- `GET /api/videos/recommend` - 推荐视频
- `GET /api/videos/popular` - 热门视频
- `GET /api/videos/region/:rid` - 分区视频

### 用户相关
- `GET /api/user/login/qrcode` - 获取登录二维码
- `GET /api/user/login/status/:oauthKey` - 检查登录状态
- `GET /api/user/info` - 获取用户信息
- `POST /api/user/logout` - 登出

### 评论相关
- `GET /api/comments/:bvid` - 获取评论
- `POST /api/comments/send` - 发送评论
- `POST /api/comments/like` - 点赞评论

### 弹幕相关
- `GET /api/danmaku/:bvid` - 获取弹幕
- `POST /api/danmaku/send` - 发送弹幕

### 收藏相关
- `GET /api/favorites` - 获取收藏夹
- `GET /api/favorites/detail/:media_id` - 获取收藏视频
- `POST /api/favorites/add` - 添加收藏

## 🔑 登录说明

1. 点击播放器上的"登录发弹幕"按钮
2. 使用哔哩哔哩 APP 扫描二维码
3. 扫码成功后自动登录
4. 登录后可发送评论、弹幕、收藏视频

## ⚠️ 注意事项

- 本项目仅供学习参考
- 请勿用于商业用途
- 部分视频可能因版权限制无法播放
- 需要 Node.js 16+ 和 npm 8+

## 🛠️ 开发相关

### 环境变量
在 `backend/.env` 中可以配置:
```
PORT=3001
BILIBILI_SESSDATA=your_sessdata
BILIBILI_BUVID3=your_buvid3
```

### 贡献
欢迎提交 Issue 和 Pull Request!

## 📄 许可证
MIT License

## 🙏 致谢

感谢 bilibili-api 项目提供的 API 支持

---

**哔哩哔哩 (゜-゜) つロ 干杯~**
