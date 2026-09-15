# Bilibili 首页交互复刻

一个可独立运行的 B 站桌面端首页复刻，包含真实图片视频流、后端数据接口、搜索与分类、卡片悬停预览、视频详情和实际播放。

## 技术栈

- 前端：React + TypeScript + Vite + React Router + Lucide Icons
- 后端：Node.js + Express
- 数据层：`server/data/videos.js`，由 Express API 对外提供数据
- 前端端口：`3401`
- 后端端口：`5401`

## 启动

```bash
npm install
npm run dev
```

打开 <http://localhost:3401>。前端通过 Vite 代理访问 `http://localhost:5401/api`。

也可分别启动：

```bash
npm run dev:server  # http://localhost:5401
npm run dev:web     # http://localhost:3401
```

## 检查与构建

```bash
npm run check
npm run build
```

## 主要交互

- 顶部搜索框：聚焦显示热搜，输入后展示实时建议，回车筛选首页视频
- 分类导航：按频道请求后端并筛选内容，可一键清除筛选
- 视频卡片：悬停播放静音预览，显示“稍后再看”，点击进入详情
- 视频详情：真实 HTML5 视频播放、返回、点赞/投币/收藏/关注、弹幕反馈、评论发布
- 用户菜单：悬停登录头像和“更多”展示下拉菜单
- 换一换：反转当前推荐顺序，模拟刷新推荐流

## 目录

```text
.
├── server/
│   ├── data/videos.js   # 视频与分类数据仓库
│   └── index.js         # Express API（5401）
├── src/
│   ├── App.tsx          # 首页、详情页与交互
│   ├── main.tsx         # React 入口
│   └── styles.css       # 响应式视觉样式
├── index.html
├── vite.config.ts       # Vite 与 /api 代理（3401 → 5401）
└── package.json         # 一致的启动、构建和检查脚本
```

## 简化说明

这是本地演示应用，不接入 B 站账户、弹幕服务、推荐算法或投稿系统；点赞、收藏、关注、评论等写操作仅保存在当前浏览器页面状态。图片来自 Unsplash，演示视频来自 MDN、W3Schools 与 W3C 公共样片资源，需要联网加载。
