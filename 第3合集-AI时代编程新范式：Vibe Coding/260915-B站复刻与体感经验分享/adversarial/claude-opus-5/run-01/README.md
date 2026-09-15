# bilibili 首页复刻 Demo

B 站首页 + 视频详情/播放主链路的复刻实现。数据取自 **B 站公开 Web API 的真实内容**（热门视频、入站必刷、热搜榜），
封面与 UP 主头像是真实图片（抓取后落盘到本地 `backend/media`），播放器使用真实可播放的 CC/开源片源。

- 前端固定端口：**3602**（Vite dev server）
- 后端固定端口：**5602**（Express API + 媒体静态资源）
- 前端通过 Vite 代理访问后端：`/api` 与 `/media` → `http://127.0.0.1:5602`

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite 5 + React Router 6 + TanStack Query 5，手写 CSS（按组件拆分，无 UI 框架） |
| 后端 | Node.js (ESM) + Express 4 + TypeScript（tsx 运行），compression / cors / morgan |
| 数据 | SQLite（Node 内置 `node:sqlite`，无原生依赖），启动时由 `backend/data/seed.json` 重建内容表；用户行为表持久化 |
| 采集 | `backend/scripts/fetch-seed.mjs`：抓取 B 站公开接口 + 下载真实封面/头像/演示片源 |

分层：**路由 (routes) → 服务 (services) → 仓储 (repositories) → SQLite**，DTO 由 `backend/src/types.ts` 定义，
前端 `frontend/src/types/index.ts` 与之一一对应。

---

## 目录结构

```
.
├── package.json                # npm workspaces + 一键启动脚本
├── backend/
│   ├── scripts/fetch-seed.mjs  # 采集 B 站真实数据 + 下载真实图片/片源，生成 seed.json
│   ├── data/seed.json          # 种子数据（140 视频 / 125 UP 主 / 851 评论 / 2572 弹幕 / 10 热搜）
│   ├── media/                  # 真实图片与演示片源：covers/ avatars/ videos/
│   └── src/
│       ├── server.ts           # 启动入口（监听 5602）
│       ├── app.ts              # Express 应用装配与静态资源
│       ├── config.ts           # 端口、路径、分页等配置
│       ├── db/                 # schema.ts / index.ts / seedLoader.ts（数据层）
│       ├── repositories/       # videoRepo / catalogRepo / searchRepo / userRepo / mappers
│       ├── services/           # feedService / searchService / interactionService
│       ├── routes/             # home.ts / videos.ts / search.ts
│       ├── middleware/         # 统一响应包装与错误处理
│       └── types.ts            # 对外数据契约
├── frontend/
│   ├── vite.config.ts          # 端口 3602 + /api、/media 代理到 5602
│   └── src/
│       ├── main.tsx App.tsx    # 路由与全局布局
│       ├── api/                # client.ts（请求封装）/ endpoints.ts（接口定义）
│       ├── pages/              # HomePage / VideoPage / SearchPage / NotFoundPage
│       ├── components/
│       │   ├── layout/         # HeaderBar、ChannelMenu、UserPanel、MiniVideoList、SideTools、AppFooter
│       │   ├── home/           # HeroCarousel、ChannelNav、FeedToolbar、VideoGrid、VideoCardItem
│       │   ├── video/          # VideoPlayer、DanmakuLayer、ActionBar、UpCard、RelatedList、CommentSection、VideoInfo
│       │   ├── search/         # SearchBox、SuggestPanel
│       │   └── common/         # Icon、Logo、HoverPanel
│       ├── hooks/ utils/ styles/ types/
└── selfcheck/
    ├── selfcheck.mjs           # 无头浏览器端到端自检脚本
    └── shots/                  # 自检截图
```

---

## 启动方法

```bash
# 1. 安装依赖（npm workspaces，一次装齐前后端）
npm install

# 2. 同时启动后端 5602 与前端 3602
npm run dev

# 3. 打开首页
open http://127.0.0.1:3602
```

单独启动：

```bash
npm run dev:backend    # 只起后端 http://127.0.0.1:5602
npm run dev:frontend   # 只起前端 http://127.0.0.1:3602
```

其它脚本：

```bash
npm run check          # 前后端 TypeScript 类型检查
npm run build          # 前端生产构建
npm run preview        # 后端 + 前端构建产物预览（同样是 3602 / 5602）
npm run seed           # 重新联网抓取 B 站真实数据与图片，覆盖 backend/data/seed.json
node selfcheck/selfcheck.mjs   # 端到端自检（需要先启动 3602/5602）
```

> `backend/data/seed.json` 与 `backend/media/` 已随仓库提供，**默认无需联网**即可启动。
> `npm run seed` 仅在想刷新内容时使用。

---

## 后端接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/bootstrap` | 首页一次性初始化：分区 + 轮播 + 热搜 + 首屏信息流 |
| GET | `/api/channels` · `/api/banners` | 分区导航（含各区视频数）、轮播位 |
| GET | `/api/videos?channel=&sort=&page=&seed=` | 首页信息流：分区筛选 + 排序 + 分页 + 换一换洗牌 |
| GET | `/api/videos/:bvid` | 视频详情（含标签与当前用户的赞/币/藏状态） |
| GET | `/api/videos/:bvid/related` · `/comments` · `/danmaku` | 相关推荐 / 评论 / 弹幕 |
| POST | `/api/videos/:bvid/play` | 进入播放页上报播放（播放量 +1、写入观看历史） |
| POST | `/api/videos/:bvid/actions/:action` | 点赞 / 投币 / 收藏 / 稍后再看（开关式切换，同步统计） |
| POST | `/api/videos/:bvid/triple` | 一键三连 |
| GET | `/api/search/suggest?q=` | 搜索联想（热搜词 + UP 主 + 标签 + 标题，四路合并） |
| GET | `/api/search?keyword=&order=&page=` | 搜索结果（标题/UP/标签加权打分） |
| GET | `/api/search/square` · DELETE `/api/search/history` | 热搜榜 + 搜索历史 / 清空历史 |
| GET | `/api/me/watchlater` · `/favorites` · `/history` | 顶栏悬浮面板的个人数据 |
| GET | `/media/**` | 真实封面、头像与演示片源（支持 Range，可拖动进度） |

---

## 可演示的交互

1. **hover**：信息流卡片悬浮时封面上浮放大、渐变遮罩浮出播放量/弹幕数、右上角出现「稍后再看」（点击真正写入后端）、标题变粉、右下角出现「更多」菜单；分区图标、播放器控制条、右侧悬浮工具条均有 hover 态。
2. **菜单展开**：顶栏「首页」→ 20 个分区的下拉面板（点击即回首页并筛选）；头像 → 个人信息卡（收藏/稍后再看/历史实时计数）；消息 / 动态 → 下拉菜单；收藏 / 历史 → 悬浮小卡列表（走 `/api/me/*`）；下载客户端 → 二维码面板；卡片「···」→ 反馈菜单；播放器「倍速」菜单。
3. **搜索建议**：聚焦展示「搜索历史 + bilibili 热搜（真实热搜榜）」；输入 200ms 防抖请求 `/api/search/suggest`，返回热搜/UP 主/标签/视频四类联想并高亮关键词，支持 ↑↓ 键选择、Enter 进入搜索结果页。
4. **分类筛选**：首页分区导航条点击即按分区过滤信息流（URL 带 `?channel=`），配合「推荐 / 最多播放 / 最新发布 / 最多弹幕」排序 tab 与「换一换」洗牌。
5. **视频详情跳转与返回**：点击卡片/轮播/相关推荐进入 `/video/:bvid`，播放器自动播放真实 mp4、弹幕跟随进度上屏，可暂停/拖动进度/调音量/倍速/全屏/发弹幕；点赞·投币·收藏·分享与长按点赞一键三连；页面内「返回首页」按钮、面包屑、顶栏 logo 与浏览器后退均可回到首页。
6. **其它**：无限滚动加载、回到顶部、评论区最热/最新切换与发评论、UP 主关注按钮、自动连播开关。

---

## 简化项（与真实 B 站的差异）

1. **片源**：无法获取 B 站真实视频流，播放使用本地 CC/开源片源（Big Buck Bunny / Sintel / Jellyfish 各 10 秒），因此**播放器里的时长是 10 秒，而卡片/详情页展示的是该视频在 B 站的真实时长**。
2. **评论与弹幕**：B 站评论/弹幕接口需鉴权，故按视频 ID 确定性生成（内容为中文模板，头像与昵称用的是真实 UP 主）；弹幕仅前端渲染，自己发的弹幕不写回服务端。
3. **分区归属**：视频的真实分区名（如「射击游戏」）来自 B 站数据并原样展示；首页 20 个分区 tab 的归属按映射表推导，映射不到的会按哈希均衡分配，以保证每个 tab 都有内容可演示。
4. **账号体系**：无登录，「我」是单用户本地态；点赞/投币/收藏/稍后再看/历史/搜索历史写入 SQLite 的用户表并跨重启保留。分享按钮只复制链接并本地 +1，不写回统计。
5. **未实现的入口**：番剧、直播、游戏中心、会员购、漫画、赛事、创作中心、投稿、大会员等为 UI 展示（hover 有反馈，点击不跳转）；只有首页、搜索结果页、视频详情页是完整页面。
6. **统计数字**：播放量在进入播放页时 +1，点赞/投币/收藏会同步增减，其余数字为 B 站真实快照，不做实时更新。
7. **图片**：为控制体积，抓取的真实封面/头像已等比压缩（封面宽 640、头像宽 120）。
