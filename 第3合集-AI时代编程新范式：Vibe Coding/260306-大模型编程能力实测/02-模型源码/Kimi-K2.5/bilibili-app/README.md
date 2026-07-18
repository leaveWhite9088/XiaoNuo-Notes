# Bilibili 视频平台

基于 React + TypeScript + Ant Design 构建的 Bilibili 视频平台前端应用。

## 功能特性

### 视频播放
- 支持视频播放、暂停、进度控制
- 音量调节
- 弹幕显示/隐藏控制
- 视频信息展示（播放量、点赞、收藏等）

### 弹幕系统
- 实时弹幕显示
- 弹幕列表查看
- 发送弹幕功能（需登录）

### 评论系统
- 评论列表展示
- 发表评论（需登录）
- 评论点赞

### 用户系统
- 登录/登出
- 密码登录、扫码登录、短信登录
- 个人资料查看与编辑
- 收藏夹管理
- 观看历史

### 搜索功能
- 视频搜索
- 搜索结果分页

### 导航功能
- 首页推荐视频
- 分类浏览
- 跳转官网

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **视频播放**: 原生 HTML5 Video

## 项目结构

```
bilibili-app/
├── src/
│   ├── api/
│   │   └── bilibili.ts      # Bilibili API 封装
│   ├── components/
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── VideoCard.tsx    # 视频卡片组件
│   │   ├── VideoPlayer.tsx  # 视频播放器
│   │   ├── CommentItem.tsx  # 评论项组件
│   │   └── DanmakuLayer.tsx # 弹幕层组件
│   ├── pages/
│   │   ├── Home.tsx         # 首页
│   │   ├── VideoDetail.tsx  # 视频详情页
│   │   ├── Search.tsx       # 搜索页
│   │   ├── Login.tsx        # 登录页
│   │   ├── Favorites.tsx    # 收藏页
│   │   └── Profile.tsx      # 个人中心
│   ├── stores/
│   │   ├── user.ts          # 用户状态管理
│   │   └── player.ts        # 播放器状态管理
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── utils/
│   │   └── format.ts        # 格式化工具函数
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # 渲染入口
│   └── index.css            # 全局样式
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 安装与运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## Bilibili 主题色

- **主色**: #00AEEC (哔哩哔哩蓝)
- **强调色**: #FB7299 (哔哩哔哩粉)
- **背景色**: #F1F2F3
- **文字主色**: #18191C
- **文字次色**: #61666D
- **边框色**: #E3E5E7

## API 说明

本项目使用 Bilibili 公开 API 获取数据，包括：
- 推荐视频列表
- 视频详情
- 视频播放地址
- 评论列表
- 弹幕数据
- 用户信息
- 收藏列表
- 搜索功能

## 注意事项

1. 由于浏览器 CORS 限制，部分 API 可能需要代理才能正常访问
2. 登录功能需要有效的 SESSDATA 和 CSRF Token
3. 视频播放地址有有效期限制，过期后需要重新获取

## 许可证

MIT
