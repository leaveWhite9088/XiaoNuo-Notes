# 哔哩哔哩（B站）首页复刻 MVP

Vue 3 + Vite + Vue Router + Pinia 前端，Express 后端（内存种子数据，47 条视频）。

## 启动

```bash
npm install     # 根目录一条命令装好前后端全部依赖（npm workspaces）
npm run dev     # concurrently 同时启动 server(3317) 与 client(5317)
```

打开 http://localhost:5317 即可。前端通过 Vite proxy 将 `/api` 转发到 `http://localhost:3317`。

> 说明：默认规划端口 5173/3001 在本机被其他进程占用，故调整为 5317/3317，proxy 已保持一致。

## 端口

- client: http://localhost:5317
- server: http://localhost:3317

## API

| 接口 | 说明 |
| --- | --- |
| `GET /api/videos?category=推荐&page=1&pageSize=10` | 视频列表（分类/分页，热门=按播放量排序） |
| `GET /api/videos/:id` | 视频详情 + 相关推荐 |
| `GET /api/banners` | 首页轮播 Banner |
| `GET /api/search?keyword=xx` | 关键词搜索（标题/UP主/标签/简介） |
| `GET /api/search/suggest?q=xx` | 搜索建议（最多 8 条） |

## 页面

- `/` 首页：频道入口、Banner 轮播 + 右侧 6 推荐位、分类 Tab、5 列视频流（加载更多分页）
- `/video/:id` 视频详情：播放器、互动按钮、UP 主卡、简介、评论区、右侧相关推荐
- `/search?keyword=xx` 搜索结果页

## 目录结构

```
kimi-k3/
  package.json            # 根：workspaces + concurrently
  server/
    index.js              # Express 入口
    data/videos.js        # 种子数据（47 条视频 / 评论 / banner）
    routes/videos.js      # 视频与 banner 路由
    routes/search.js      # 搜索与建议路由
    services/videoService.js
  client/
    vite.config.js        # /api proxy -> 3317
    src/
      api/index.js        # fetch 封装
      router/index.js
      stores/interact.js  # 点赞/关注状态（Pinia）
      components/         # AppHeader / ChannelNav / BannerCarousel / VideoCard / VideoGrid / CategoryTabs / CommentItem
      views/              # HomeView / VideoDetailView / SearchView
      styles/global.css   # B 站色值变量
```
