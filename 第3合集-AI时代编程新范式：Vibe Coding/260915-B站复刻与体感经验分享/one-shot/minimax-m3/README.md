# B 站首页复刻 MVP

一个尽量贴近 B 站观感的首页 + 视频详情/播放页 MVP。

## 技术栈

- **前端**：Vue 3 + Vite + TypeScript + Vue Router + Pinia + SCSS
- **后端**：Node.js + Express + TypeScript（mock 数据，无数据库，默认端口 3002）
- **图片**：使用 [picsum.photos](https://picsum.photos) 的真实图片 + B 站风格的真实标题/UP主/数字

## 目录结构

```
minimax-m3/
├── backend/                 # Express API 服务
│   ├── src/
│   │   ├── index.ts        # 入口
│   │   ├── routes/         # API 路由
│   │   ├── mock/           # 模拟数据生成器
│   │   └── types.ts        # 类型定义
│   ├── data/               # 静态字典/分区配置
│   └── package.json
├── frontend/                # Vue 3 SPA
│   ├── src/
│   │   ├── api/            # axios 封装
│   │   ├── components/     # 通用组件（VideoCard / CategoryTabs / SearchSuggest …）
│   │   ├── views/          # 页面（Home / VideoDetail / Space / Channel …）
│   │   ├── stores/         # Pinia 状态
│   │   ├── router/         # 路由
│   │   ├── styles/         # 全局样式
│   │   └── main.ts
│   ├── index.html
│   └── package.json
└── scripts/
    └── dev.js              # 同时启动前后端
```

## 启动

```bash
# 1. 安装依赖（首次）
npm run install:all

# 2. 启动后端（默认端口 3002）
npm run dev:backend

# 3. 另开一个终端启动前端（端口 3001，代理 /api -> :3002）
npm run dev:frontend

# 或：同时启动两边
npm run dev
```

浏览器打开 `http://localhost:3001`。
如需改后端端口：`$env:PORT=xxxx` 后跑 `npm run dev:backend`，前端 `vite.config.ts` 的 proxy target 也要同步。

## 已实现

- 顶部导航：Logo / 主菜单 / 搜索框（含搜索建议）/ 头像区
- 分类 Tab（首页 / 动画 / 番剧 / 国创 / 音乐 / 舞蹈 / 游戏 / 知识 / 科技 / 运动 / 生活 / 美食 / 动物圈 / 鬼畜 / 时尚 / 资讯 / 娱乐 / 影视 / 纪录片 / 电影 / 电视剧）
- 首页：多分区瀑布流（推荐 / 热门 / 各垂类）
- 视频卡片：hover 弹出预览（时长 / 播放量 / UP 主）
- 视频详情/播放页：HTML5 视频 + UP 主信息 + 数据栏 + 推荐列表 + 评论区
- 分类切换：点击 Tab 切换内容流
- 搜索建议：输入触发下拉联想
- 分区页：/channel/:tid 分区详情
- 路由：首页 ↔ 视频详情 ↔ 返回首页

## 简化

- 登录：未做真实登录，顶部"登录"按钮只是个按钮
- 视频源：详情页使用公开的 B 站宣传片 mp4 链接（如不可达则降级为占位）
- 弹幕：未实现（信息密度已经够）
- 评论：mock 列表数据，无嵌套回复
- 历史 / 收藏 / 稍后再看：未持久化
