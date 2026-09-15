# B 站首页复刻 — MVP

完整复刻 B 站首页 + 视频详情浏览链路，前后端分离，**所有数据均为本地 mock，无任何外网账号/B 站接口依赖**。

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 前端 | **Vue 3** + **Vite 5** + **Vue Router 4** + **SCSS** | 组件化 + 路由 + 样式分层 |
| 后端 | **Node.js (>=18)** + **Express 4** | JSON mock API，5 个路由模块 |
| 视频源 | 公开 Google `gtv-videos-bucket` 测试集 | 真实可播放 MP4 |
| 视频封面 / UP 头像 / 热搜背景 | `picsum.photos` + `seed` | 真实照片，按内容稳定生成 |
| 站点 favicon | `https://www.bilibili.com/favicon.ico` | 真实图标 |

## 目录结构

```
minimax-m3/
├── package.json                # 根脚本：dev/install:all/build
├── README.md
├── scripts/
│   └── dev.js                  # 一键拉起后端 + Vite
├── server/                     # Express 后端
│   ├── index.js                # 入口，挂在 4000 端口
│   ├── data/
│   │   ├── store.js            # 装载 JSON
│   │   └── videos.json         # 全部 mock 数据：36 视频 / 12 UP / 16 分区
│   └── routes/
│       ├── videos.js           # /api/videos, /api/videos/:id
│       ├── categories.js       # /api/categories
│       ├── search.js           # /api/search
│       ├── ranking.js          # /api/ranking
│       └── up.js               # /api/up/:id
└── web/                        # Vue 3 前端
    ├── index.html
    ├── package.json
    ├── vite.config.js          # /api 代理到 4000
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/index.js     # 路由：/, /c/:tid, /video/:id
        ├── api/index.js        # fetch 封装
        ├── utils/format.js     # 数字/时长格式化
        ├── styles/             # variables.scss / reset.scss / main.scss
        ├── components/
        │   ├── AppHeader.vue       # 顶部 logo + 搜索 + 登录 + 主导航
        │   ├── SearchBar.vue       # 实时建议 + 热搜
        │   ├── CategoryTabs.vue    # 分区 tab + 排序
        │   ├── Banner.vue          # 首页轮播（4 张，自动 5s）
        │   ├── VideoCard.vue       # 单卡：封面/标题/UP/播放/弹幕
        │   ├── VideoGrid.vue       # 5 列瀑布式 grid
        │   ├── SideRanking.vue     # 全站热播榜 + 大会员推广
        │   └── AppFooter.vue       # 底部
        └── views/
            ├── Home.vue
            ├── VideoDetail.vue     # 播放器 + UP + 描述 + 评论 + 相关推荐
            └── Category.vue
```

## 启动

```powershell
# 1. 安装依赖（根 + web）
npm run install:all

# 2. 一键启动（同时拉起后端 4040 + 前端 3002）
npm run dev
```

启动后访问：

- 首页：<http://127.0.0.1:3002/>
- 视频详情：<http://127.0.0.1:3002/#/video/v1>
- 分区：<http://127.0.0.1:3002/#/c/tech>
- 后端 health：<http://127.0.0.1:4040/api/health>

> **端口冲突怎么办？**
>
> - 前端默认 `3002`，后端默认 `4040`。
> - 如果 `3002` 被占，改 `web/package.json` 里 `scripts.dev` 的 `--port` 和 `web/vite.config.js` 的 `server.port`。
> - 后端端口通过 `PORT` 环境变量控制；改端口后也要把 `web/vite.config.js` 的 `proxy['/api'].target` 同步改。

## 已实现的交互

| 交互 | 位置 | 说明 |
|---|---|---|
| Logo / 搜索框 / 登录 / 投稿按钮 | 顶栏 | B 站风格 SVG logo + 圆角登录按钮 |
| 主导航（首页 / 番剧 / 国创 / …） | 顶栏第二行 | hover 粉色高亮，当前页高亮 |
| 搜索实时建议 + 热搜榜 | 搜索框 | 输入即模糊匹配，方向键/Enter 可选 |
| 首页轮播 | Home 顶部 | 4 张，5s 自动切换，hover 暂停，左右按钮 + dots |
| 分区 tab 筛选 | 分类条 | 16 个分区，点击切换，全 grid 重新拉取 |
| 排序切换 | 分类条右 | 综合/播放多/弹幕多/最新 |
| 视频卡 hover 抬起 + 标题变粉 | 视频卡 | B 站经典 hover |
| 视频卡点击 → 详情页 | 整张卡 | Vue Router 跳转 |
| 详情页播放器 | 详情页 | 真实 HTML5 视频 + 自定义控制条（播放/时间/静音/全屏） |
| 详情页点赞/投币/收藏/分享/三连 | 详情页操作栏 | 本地状态切换，数字实时 +1 |
| 详情页关注 UP | 详情页 UP 区 | toggle 关注状态 |
| 详情页评论 | 详情页底部 | 5 条预置评论 + 模拟发布 + 点赞 |
| 详情页相关推荐 | 详情页右栏 | 同分类下 12 条 |
| 全站热播榜 | 首页右栏 | 8 条，前 3 名彩色排名号 + 趋势箭头 |
| 大会员推广卡片 | 首页右栏 | 静态营销区 |
| 面包屑 | 详情页顶部 | 首页 / 分类 / 视频 |
| Footer | 全站底部 | 3 列 + 二维码占位 + 版权 |
| 路由切换 fade 过渡 | 全局 | 切页 fade |
| 图片加载失败降级 | 视频卡 | 失败自动渲染 B 站粉蓝渐变占位图 |

## 数据 / 资源简化说明

- **视频文件**：使用 Google 公开测试集 `commondatastorage.googleapis.com/gtv-videos-bucket/sample/*.mp4`，是真实可播放的 MP4。若国内网络访问慢，视频可能起播慢；不影响其它逻辑。
- **封面 / 头像**：用 `picsum.photos/seed/<seed>/<w>/<h>`，seed 稳定所以同一 ID 拿到同一张真实照片；不需要鉴权，CDN 速度可。
- **真实 B 站图片**：仅 favicon 使用 `https://www.bilibili.com/favicon.ico`，其它 B 站原图因 CDN 鉴权变动不稳定，未做依赖。
- **弹幕 / 倍速 / 清晰度切换**：未实现（属于播放器增强，超出 MVP 范围）。
- **登录 / 关注 / 收藏的持久化**：前端本地状态，刷新即重置（后端只暴露只读接口）。
- **动态页 / 直播页 / 会员购**：导航里只放了入口，未做二级页面。

## API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 所有分区 |
| GET | `/api/videos?category=&sort=&page=&pageSize=` | 视频列表（分页/分类/排序） |
| GET | `/api/videos/:id` | 视频详情 + UP + 相关推荐 |
| GET | `/api/search?q=` | 搜索建议（视频/UP/热搜） |
| GET | `/api/ranking` | 全站热播榜 |
| GET | `/api/up/:id` | UP 主信息 + 投稿列表 |
