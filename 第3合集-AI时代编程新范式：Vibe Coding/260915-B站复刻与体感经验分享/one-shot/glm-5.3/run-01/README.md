# bilibili 首页复刻（学习演示项目）

本项目复刻 bilibili 首页的核心体验：首页视频推荐流、分区筛选、搜索建议、hover 交互、菜单展开、视频详情页与真实视频播放。数据来自 B 站公开接口抓取的真实内容（标题、封面、UP 主、播放量、评论、热搜），全部保存在本地，启动后不依赖外网。

访问地址：前端 `http://localhost:3801`，后端 `http://127.0.0.1:5801`。两个端口在启动脚本、Vite 代理、冒烟自检脚本与本文件中保持一致。

本项目仅用于本地学习演示，与 bilibili 官方无关。

## 技术栈

| 层 | 技术 | 端口 |
| --- | --- | --- |
| 前端 | Vue 3（Composition API + script setup）+ Vite 6 + Vue Router 4 + Pinia 2 | 3801 |
| 后端 | Node.js 22 + Express 4（routes / services / repositories 三层） | 5801 |
| 数据 | JSON 文件仓库（`server/data/`）+ 本地静态资源（`server/public/`） | 随后端 |

前端不是纯原生实现：组件化用 Vue 3，路由用 Vue Router，跨组件状态（点赞收藏等用户行为、搜索历史）用 Pinia 并持久化到 localStorage。后端按路由层、服务层、数据仓库层拆分，评论的运行时写入会持久化回 JSON 文件。

## 快速启动

前置条件：Node.js 18 以上（开发验证使用 Node 22.22.2），5801 与 3801 端口空闲。

```bash
# 1. 安装依赖（根目录执行一次，npm workspaces 会同时安装 server 与 client）
npm install

# 2. 启动前后端（一条命令同时拉起两个服务）
npm run dev
```

启动成功的标志：

- 终端出现 `[server] bilibili-clone API 已启动: http://127.0.0.1:5801`
- 终端出现 `[client] VITE ready` 与 `Local: http://localhost:3801/`
- 浏览器打开 `http://localhost:3801` 能看到首页视频流

其他命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev:server` | 只启动后端（5801） |
| `npm run dev:client` | 只启动前端（3801，需要后端已启动） |
| `npm run check` | 接口冒烟自检，15 项检查，输出 PASS/FAIL |
| `npm run fetch:data` | 重新从 B 站公开接口抓取数据与图片（可选，产物已随仓库提供） |
| `npm run build` | 构建前端产物到 `client/dist/` |
| `npm start` | 构建后可用后端单端口托管前端（5801 直接访问完整页面） |

如果启动时报端口被占用（EADDRINUSE），用 `lsof -nP -i :3801 -i :5801` 找到占用进程并处理后再启动。

## 目录结构

```
├── package.json            # 根工作区：workspaces + concurrently 同时启动前后端
├── scripts/smoke.mjs       # 15 项接口冒烟自检
├── client/                 # 前端（Vue 3 + Vite，3801）
│   ├── vite.config.js      # 端口 3801 + /api、/static 代理到 127.0.0.1:5801
│   └── src/
│       ├── api/index.js        # 接口封装（统一 code=0 信封）
│       ├── stores/             # Pinia：用户行为（赞/币/藏/关注/稍再看）、搜索历史
│       ├── router/index.js     # 路由：/ 首页、/video/:id 详情、/search 搜索
│       ├── components/         # AppHeader、SearchBox、CategoryRail、VideoCard、
│       │                       # VideoGrid、BannerCarousel、VideoPlayer、CommentSection 等
│       └── views/              # HomeView、VideoDetailView、SearchView
└── server/                 # 后端（Express，5801）
    ├── src/
    │   ├── app.js             # 应用装配：CORS、静态资源、路由挂载、错误处理
    │   ├── routes/            # 路由层：videos、search、comments、categories、banners、health
    │   ├── services/          # 服务层：feed 分页/筛选/排序、搜索打分、评论读写
    │   ├── repositories/db.js # 数据仓库：加载 data/*.json，评论写入持久化
    │   └── middlewares/       # 日志、404、错误处理
    ├── data/                  # videos.json（120 条）等数据文件
    ├── public/                # covers 封面 / avatars 头像 / videos 示例片源 / banners
    └── scripts/fetch-assets.mjs  # 数据抓取脚本（可重复执行）
```

## 已实现功能

首页：

- 视频推荐流：120 个真实视频，各分区轮询交错排序模拟推荐混排，每页 20 条，滚动到底自动加载下一页，也有"加载更多"按钮；加载过程显示骨架屏。
- 分区筛选：左侧栏 20 个分区（首页、热门、动画、游戏、生活等），点击后 URL 同步为 `/?region=xxx`，可刷新与分享；热门按播放量排序。
- 轮播 banner：4 张真实照片，5 秒自动轮播，支持箭头与圆点切换，点击跳转对应视频详情。
- 视频卡片：封面、时长角标、UP 主头像与昵称、播放量与弹幕数；悬停 500 毫秒后封面切换为静音视频预览，同时封面放大、出现"稍后再看"按钮（状态持久化）。

顶部导航：

- 悬停展开二级菜单：番剧、直播、游戏中心、会员购、漫画、赛事悬停出现分组菜单面板。
- 右侧快捷入口（大会员、消息、动态、收藏、历史）悬停展开信息面板，消息带红点角标。
- 头像悬停展开个人菜单（个人主页、投稿管理、退出登录等 7 项）。
- 投稿按钮、菜单项点击给出明确的演示提示（toast）。

搜索：

- 搜索建议：输入即时联想（防抖 160 毫秒），匹配标题、UP 主、标签、分区并标注类型，支持键盘上下键与回车。
- 空输入聚焦时显示搜索历史（localStorage 持久化，可单条删除或清空）与 bilibili 真实热搜榜（前十名带名次高亮）。
- 搜索结果页：结果计数、分页、空结果占位图。

视频详情：

- 真实播放：本地托管的真实 mp4 片源（Big Buck Bunny、Sintel、Jellyfish、Oceans 等），自定义播放器带播放/暂停、进度条拖拽与缓冲显示、音量、倍速菜单（0.5x 到 2x）、全屏。
- 弹幕层：开启时以该视频真实评论为弹幕池滚动展示，可一键开关。
- 信息区：标题、播放/弹幕/评论数、发布时间；点赞、投币、收藏、稍再看、分享（复制链接）均为可切换交互并持久化。
- UP 主卡片：头像、昵称、粉丝数、关注按钮（可切换）。
- 评论区：加载真实评论，支持发表与回复（写入后端并持久化）、点赞、分页查看更多。
- 相关推荐：右侧 12 条（同分区优先），点击跳转对应详情；面包屑与"返回首页"、logo 均可回首页，浏览器后退可用。

## API 一览

统一响应格式 `{ code: 0, message: 'ok', data: ... }`，错误时 code 非 0 并携带 HTTP 状态码。

| 方法与路径 | 说明 |
| --- | --- |
| GET /api/health | 健康检查 |
| GET /api/categories | 分区列表（20 项） |
| GET /api/feed?region=&page=&page_size= | 视频流分页；region=home 推荐混排、hot 按播放排序、其他为分区筛选 |
| GET /api/video/:id | 视频详情（含统计、UP 主、标签、片源地址） |
| GET /api/video/:id/related?limit= | 相关推荐（同分区优先） |
| GET /api/search?q=&page= | 搜索（标题权重高于 UP 主与标签） |
| GET /api/search/suggest?q= | 搜索建议 |
| GET /api/search/hot | 热搜榜（B 站真实热搜） |
| GET /api/comments/:videoId | 评论列表 |
| POST /api/comments/:videoId | 发表评论，body 为 `{ "content": "..." }`，上限 500 字 |
| GET /api/banners | 轮播 banner |
| /static/** | 封面、头像、片源、banner 等静态资源 |

## 数据来源与重建

`server/scripts/fetch-assets.mjs` 从以下公开只读接口抓取数据并下载图片到本地：

- 热门榜 `api.bilibili.com/x/web-interface/popular` 前 6 页共 120 条（真实标题、封面、UP 主、播放/点赞/投币数据、二级分区 tid，按 tid 映射到 18 个一级分区）；
- 每个视频的真实评论（`/x/v2/reply`，120 个视频全覆盖）与真实标签（`/x/tag/archive/tags`）；
- 全站热搜（`/x/web-interface/search/square`）；
- 轮播图用 picsum.photos 真实照片。

仓库已包含抓取产物，`npm run dev` 不需要外网。重新抓取执行 `npm run fetch:data`，需要外网可达 bilibili.com 与 picsum.photos；B 站接口有风控，脚本内置限速与重试，如遇大面积失败可稍后再试。

分区榜接口（`ranking/v2`）在无登录 Cookie 的服务器环境会返回 -352 风控，因此数据源改用热门榜多页加 tid 映射，这是抓取时的已知取舍。

片源说明：120 个视频映射到 7 个本地 mp4 片源（test-videos.co.uk 的 Big Buck Bunny / Sintel / Jellyfish 各清晰度版本与 vjs.zencdn.net 的 Oceans），卡片上显示的时长是 B 站真实时长，播放器内是片源实际时长，两者不一致是演示项目的刻意简化。

## 自检与证据

接口层：`npm run check` 运行 15 项冒烟检查（健康、分类、feed 分页与分区纯度、热门排序、详情、404、相关推荐、搜索、建议、热搜、评论读写、静态资源、前端与代理），2026-09-12 全部通过。

浏览器层：开发中使用浏览器自动化验证了首页渲染、hover 预览触发、卡片点击进详情、点赞切换与持久化、评论发表（计数 4 变 5）、相关推荐跳转、logo 返回首页、浏览器后退、搜索建议面板（空输入显示热搜与历史、输入"游戏"返回 8 条联想）、点击联想进搜索结果页、分区切换（URL 与卡片同步）、三类悬停菜单展开、滚动连续加载（20 到 120 条）。截图证据在 `docs/screenshots/`：

| 文件 | 内容 |
| --- | --- |
| 01-home.png | 首页：导航、分区栏、轮播、视频流 |
| 02-video-detail.png | 视频详情页：播放器、操作栏、评论区、相关推荐 |
| 03-search-suggest.png | 搜索建议下拉面板 |
| 04-region-game.png | 游戏分区筛选结果 |

## 简化项与已知限制

- 账号体系未实现：头像、登录态、消息、动态、收藏夹、历史均为静态演示，点击给 toast 提示；用户行为（赞、币、藏、关注、稍再看）只存 localStorage。
- 片源与 B 站内容不对应（见上文片源说明）；弹幕取自该视频真实评论，按时间随机滚动，不是真实弹幕数据。
- 播放器不含清晰度切换与记忆播放位置；直播、番剧时间表等频道页为静态菜单。
- 部分区在数据源中没有内容（热门榜以游戏、生活、影视为主，舞蹈、美食、动物圈等分区为空），点击显示空状态提示；重新抓取热门榜可改变分布。
- 自动化验证环境（无头浏览器标签页对页面隐藏）会触发 WebKit 的省电策略，拒绝 video.play()，因此自动验证覆盖到资源加载、元数据、seek 与帧解码，播放状态需在前台浏览器人工确认；正常使用（前台标签页）不受影响，代码中已加入起播失败重试与页面重新可见时恢复播放。
