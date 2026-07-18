# Bilibili 视频平台

基于 bilibili-api 开发的仿 Bilibili 视频平台，包含前后端完整实现。

## 功能特性

### 核心功能
- ✅ 视频播放，支持弹幕展示和发送
- ✅ 二维码登录，保存用户登录状态
- ✅ 首页推荐视频列表展示
- ✅ 视频详情页：视频信息、UP主信息、点赞/投币/收藏功能
- ✅ 评论区展示，支持分页和发表评论
- ✅ 用户中心：个人信息、收藏视频列表
- ✅ 跳转官方 Bilibili 网站功能
- ✅ 响应式布局，适配各种屏幕尺寸

### UI 特性
- 采用 Bilibili 经典粉色主题色 #FB7299
- 全中文界面，符合 Bilibili 设计风格
- 卡片式布局，交互流畅

## 技术栈

### 后端
- Node.js + Express
- bilibili-api：Bilibili API 封装库
- qrcode：二维码生成
- CORS 跨域处理

### 前端
- React 18 + React Router 6
- Ant Design 5 UI 组件库
- DPlayer：视频播放器（支持弹幕）
- Axios：网络请求

## 运行方法

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动服务

```bash
# 启动后端服务（端口 3333）
cd backend
npm start

# 新开终端，启动前端服务（端口 3000）
cd frontend
npm start
```

### 3. 访问应用
打开浏览器访问 http://localhost:3000 即可使用。

## 项目结构

```
bilibili-platform/
├── backend/              # 后端服务
│   ├── server.js         # 主服务文件，API 接口
│   └── package.json
├── frontend/             # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   │   ├── Home.js          # 首页
│   │   │   ├── VideoDetail.js   # 视频详情页
│   │   │   ├── Login.js         # 登录页
│   │   │   └── UserCenter.js    # 用户中心
│   │   ├── utils/        # 工具函数
│   │   │   └── request.js       # Axios 封装
│   │   ├── App.js        # 主应用组件
│   │   ├── index.js      # 入口文件
│   │   └── index.css     # 全局样式
│   └── package.json
└── README.md
```

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/login/qrcode` | GET | 获取登录二维码 |
| `/api/login/check` | POST | 检查二维码登录状态 |
| `/api/user/info` | GET | 获取用户信息 |
| `/api/videos/recommend` | GET | 获取推荐视频列表 |
| `/api/video/:bvid` | GET | 获取视频详情 |
| `/api/video/:bvid/danmaku` | GET | 获取视频弹幕 |
| `/api/video/:bvid/danmaku` | POST | 发送弹幕 |
| `/api/video/:bvid/comments` | GET | 获取视频评论 |
| `/api/video/:bvid/comments` | POST | 发表评论 |
| `/api/user/favorites` | GET | 获取用户收藏视频 |
| `/api/logout` | POST | 登出 |

## 说明

- 项目内置模拟数据，在 bilibili-api 调用失败时自动 fallback，确保功能正常展示
- 实际使用时，请确保网络可以正常访问 Bilibili 相关接口
- 登录功能需要使用 Bilibili 手机客户端扫码
