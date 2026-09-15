# bilibili 首页复刻 (React + Vite + Express)

个人学习用的 **B 站首页 / 播放页高仿复刻**：完整的信息流浏览链路（首页 → 视频详情/播放 → 返回首页），
前后端分离、数据分层，图片与视频全部为**真实素材**（picsum.photos 摄影图 + Big Buck Bunny / Jellyfish / Sintel 公开示例片源，已下载到本地）。

* 前端：`http://localhost:3601`（固定端口）
* 后端：`http://localhost:5601`（固定端口，前端通过 Vite 代理访问 `/api` 与 `/media`）

---

## 1. 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端 | React 18 + TypeScript + Vite 5 + React Router 6 | 组件化 + 路由；样式用原生 CSS 变量设计令牌，按组件拆分 css 文件 |
| 后端 | Node.js 18+ + Express 4（ESM） | 分层：data → repositories → services → routes；静态素材带 Range 支持，播放器可拖动进度 |
| 数据 | 内存数据集（固定 seed 的伪随机生成） | 180 个稿件 / 20 个分区 / 每稿件独立评论与弹幕，每次启动数据一致 |
| 工具 | concurrently（并行起服务）、Playwright（端到端自检） | |

## 2. 目录结构

```
.
├── package.json              # npm workspaces + 一键脚本
├── scripts/
│   ├── fetch-media.sh        # 下载真实图片/视频素材到 server/public/media
│   └── verify.py             # Playwright 端到端自检（33 项）
├── server/                   # 后端 :5601
│   ├── public/media/         # covers(120) / avatars(48) / banners(5) / videos(6 个 mp4)
│   └── src/
│       ├── server.js         # 启动入口
│       ├── app.js            # express 应用装配（cors / compression / 静态资源 / 路由 / 错误处理）
│       ├── config.js         # 端口等配置（5601）
│       ├── data/             # 数据层：channels 分区配置、content 语料、dataset 数据集构建
│       ├── repositories/     # 仓储层：只做内存查询（视频、分区）
│       ├── services/         # 业务层：feed / video / search
│       ├── routes/           # 路由层：feedRoutes / videoRoutes / searchRoutes
│       ├── middleware/       # 404 与统一错误处理
│       └── utils/            # 可复现随机数、BV 号生成
└── web/                      # 前端 :3601
    ├── vite.config.ts        # 端口 3601 + /api、/media 代理到 5601
    └── src/
        ├── api/              # client.ts(fetch 封装) + bili.ts(接口定义)
        ├── components/
        │   ├── common/       # Icon（内联 SVG 图标集）、BiliLogo、HoverPanel
        │   ├── layout/       # AppHeader / SearchBox / UserZone / ChannelNav / Footer / SideToolbar
        │   ├── home/         # VideoCard / VideoGrid / BannerCarousel / FeedToolbar
        │   └── video/        # VideoPlayer / ActionBar / UpCard / RelatedList / CommentSection
        ├── context/          # 全站导航配置 Context
        ├── hooks/            # useAsync / useFeed / useDanmakuEngine / useDebouncedValue / useClickOutside
        ├── pages/            # HomePage / VideoPage / SearchPage / NotFoundPage
        ├── types/            # 前后端共享数据结构
        └── utils/            # 数字与时间格式化、搜索历史、观看历史
```

## 3. 启动方法

```bash
# 1) 安装依赖（npm workspaces，会同时装 server 与 web）
npm install

# 2) 素材已随仓库下载好；如需重新拉取真实图片/视频：
npm run media          # == bash scripts/fetch-media.sh

# 3) 同时启动后端(5601) 与 前端(3601)
npm run dev            # 或 npm start

# 打开 http://localhost:3601
```

单独启动：

```bash
npm run dev:server     # 仅后端 :5601（node --watch）
npm run dev:web        # 仅前端 :3601（vite，strictPort）
```

生产构建预览：

```bash
npm run build          # 构建前端
npm run dev:server     # 另开一个终端跑后端
npm run preview        # vite preview，同样监听 3601 并代理到 5601
```

## 4. 接口一览（后端 :5601）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 + 数据集信息 |
| GET | `/api/config` | 顶栏导航、分区列表、"更多"面板、排序方式、热搜词 |
| GET | `/api/channels` | 分区列表 |
| GET | `/api/banners` | 首页轮播 |
| GET | `/api/feed?channel=&sort=&page=&pageSize=&refresh=` | 信息流（分区筛选 / 排序 / 分页 / 换一换） |
| GET | `/api/videos/:bvid` | 稿件详情（含相关推荐） |
| GET | `/api/videos/:bvid/comments?page=` | 评论分页 |
| GET | `/api/videos/:bvid/danmaku` | 弹幕列表（`p` 为 0~1 进度百分比） |
| POST | `/api/videos/:bvid/danmaku` | 发送弹幕 |
| POST | `/api/videos/:bvid/interact` | 点赞 / 投币 / 收藏 / 分享（真实回写计数） |
| GET | `/api/search/suggest?keyword=` | 搜索联想 |
| GET | `/api/search/hot` | 大家都在搜（热搜榜） |
| GET | `/api/search?keyword=&order=&page=` | 搜索结果 |
| — | `/media/**` | 封面 / 头像 / 轮播图 / mp4 片源（支持 Range） |

## 5. 可演示的交互

* **hover**：卡片悬停放大 + 延时静音自动播放预览、出现"稍后再看"与"更多"菜单；顶栏入口、分区按钮、播放器控件均有 hover 态。
* **菜单展开**：头像个人卡片、大会员、消息、动态、收藏、历史（读真实本地观看记录）、投稿；分区栏"更多"全量面板；卡片右下角"…"菜单。
* **搜索建议**：聚焦展示搜索历史 + 大家都在搜；输入实时联想（防抖 180ms、命中片段高亮、↑↓ 选择、回车搜索）。
* **分类筛选**：分区导航切换信息流（URL 同步 `?channel=`）、综合/最新/最多播放/最多弹幕排序、"换一换"、搜索结果页排序与分区二次筛选。
* **视频详情跳转与返回**：卡片/轮播/相关推荐/历史面板均可进入播放页；播放页面包屑"返回首页"、顶栏 Logo 均可返回首页，滚动位置自动复位。
* **播放页**：真实 mp4 播放、弹幕随进度滚动、发弹幕即时上屏、弹幕开关、进度拖拽、音量、倍速、宽屏、全屏、空格/方向键快捷键、点赞投币收藏分享（回写后端）、评论区（发表/点赞/楼中楼/加载更多）。
* **其他**：首页顶部背景图 + 顶栏滚动由透明变白、轮播自动切换、滚动无限加载、回顶部悬浮按钮。

## 6. 自检

```bash
# 需先启动前后端；依赖本机 Chrome 与 playwright(python)
python3 scripts/verify.py
```

脚本覆盖 33 项断言（渲染、hover 预览真实播放、菜单展开、搜索建议、分区筛选、换一换、滚动加载、
详情页跳转、`<video>` 时间推进与画面尺寸、弹幕滚动与发送、点赞回写后端、评论、相关推荐跳转、返回首页、无控制台报错），
截图输出在 `/tmp/bili-shots/`。

## 7. 已知简化

1. **无真实登录体系**：顶栏默认已登录状态，用户信息为固定演示数据。
2. **稿件时长与片源时长不一致**：卡片上的时长是"稿件元数据"，实际片源是 10 秒示例视频并循环播放；弹幕按进度百分比铺满整条进度条。
3. **数据为内存态**：点赞/弹幕等写操作只在进程内存活，重启服务后回到初始数据集（固定 seed 保证可复现）。
4. **部分入口为静态展示**：番剧/直播/游戏中心/会员购/漫画/赛事、大会员、消息、收藏夹等面板为 UI 演示，点击主导航会跳到对应分区的信息流。
5. **未做移动端专门适配**：栅格在 2~6 列之间自适应（≥1000px 体验最佳），未实现移动端独立布局。
6. **素材来源**：图片为 picsum.photos 真实摄影图，视频为公开测试片源；与哔哩哔哩官方无任何关系，仅用于学习演示。
