# bilibili 首页复刻 · 全栈 Demo（V2 对抗开发 V0 · Review-1 修复版）

尽可能还原 **哔哩哔哩网页版首页** 的整体观感、布局与信息组织，并把
**首页视频流 → 视频详情 → 实际播放 → 返回首页** 这条主链路做成真正可用的闭环。

- 数据是真的：视频标题 / 封面 / UP 主头像 / 播放量 / 弹幕数 / 分区 / 时长来自 B 站公开接口
  （`api.bilibili.com` 的 `popular` 与 `newlist`）快照，媒体文件已下载到本地，
  运行时不依赖外网、不受防盗链影响。**256 视频 / 236 UP主 / 256 张封面 / 60 张头像 / 6 个 mp4**。
- 播放是真的：每个视频绑定一个本地真实 mp4，`<video>` 可播放、可拖动（后端支持 Range 请求），
  弹幕按真实时间轴滚动，发弹幕 / 评论 / 点赞 / 投币 / 收藏 / 关注 全部落库 SQLite。
- 有自动化验收：后端 25 个集成测试 + 前端 24 个单元/组件测试 + 35 项真实浏览器 E2E。

---

## 一、技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端 | **Vue 3.5 + TypeScript + Vite 6 + Pinia 2 + Vue Router 4** | SFC 组件化；`views / components / stores / api` 分层；路由级懒加载 |
| 后端 | **Node.js + TypeScript + Express 4 + tsx** | 严格单向依赖：`routes → controllers → services → repositories → db`，SQL 只出现在 repository |
| 数据 | **SQLite（Node 内置 `node:sqlite`）** | 零原生依赖；**10 张表**：categories / owners / videos / tags / banners / hot_searches / comments / danmaku / interactions / watch_history |
| 测试 | node:test（后端集成）、Vitest + @vue/test-utils（前端）、ego-browser E2E | 见第六节 |

端口：**前端 3112**、**后端 5112**（固定）。开发与 `vite preview` 都会把 `/api`、`/media` 代理到 5112。

---

## 二、目录结构

```
bilibili-clone/
├── package.json                     # 根脚本：install:all / db:ensure / dev / build / typecheck / test / e2e
├── README.md  .gitignore
├── docs/SELF-CHECK.md               # 自检与验收的原始记录
├── scripts/
│   ├── e2e.mjs                      # 浏览器 E2E 驱动器（调 ego-browser）
│   └── e2e-browser.mjs              # 浏览器侧 35 项断言脚本
├── backend/                         # ——— 后端 ———
│   ├── package.json  tsconfig.json
│   ├── scripts/
│   │   ├── fetch-data.mjs           # 采集真实视频/UP主/封面/头像/样片
│   │   ├── fetch-banners.mjs        # 采集首页轮播大图
│   │   ├── probe-durations.mjs      # ffprobe（缺失时回退内置 mp4 mvhd 解析）实测片长
│   │   ├── normalize-media.mjs      # 封面文件名归一化 + 严格校验（修大小写碰撞）
│   │   └── copy-assets.mjs          # build 时把 schema.sql 复制进 dist
│   ├── data/
│   │   ├── seed.json                # 256 条真实视频快照
│   │   ├── banners.json  clip-durations.json
│   │   └── bilibili.db              # SQLite（seed / db:ensure 生成）
│   ├── public/media/{covers,avatars,banners,videos}
│   ├── test/api.test.ts             # 25 个后端集成测试
│   └── src/
│       ├── index.ts  app.ts  config/index.ts  types.ts
│       ├── routes/index.ts
│       ├── controllers/  homeController / videoController / searchController / historyController
│       ├── services/     homeService / videoService / searchService / historyService / mappers
│       ├── repositories/ videoRepository / metaRepository / commentRepository / interactionRepository
│       ├── db/           sqlite.ts / schema.sql / seed.ts / ensure.ts
│       ├── middleware/   asyncHandler / ok() / errorHandler
│       └── utils/        format.ts / HttpError.ts
└── frontend/                        # ——— 前端 ———
    ├── package.json  vite.config.ts  vitest.config.ts  tsconfig.json  index.html
    ├── test/                        # utils / home-store / video-card / video-player / search-box
    └── src/
        ├── main.ts  App.vue
        ├── router/index.ts
        ├── api/    http.ts（统一解包与错误）+ index.ts
        ├── stores/ home.ts / search.ts / history.ts / ui.ts
        ├── types/  utils/  styles/
        ├── components/
        │   ├── layout/  AppHeader / HeaderPanel / SearchBox / ChannelNav / CategoryTabs
        │   │            BannerCarousel / PromoPanel / RankSidebar / AppFooter
        │   ├── video/   VideoCard / VideoGrid / VideoCardSkeleton / CommentSection
        │   ├── player/  VideoPlayer / DanmakuLayer
        │   └── common/  Icon / SvgSprite / AppToast / BackTop
        └── views/  HomeView / VideoDetailView / SearchView
                    CategoryView / HistoryView / NotFoundView
```

---

## 三、启动方式

### 0）首次准备（仓库已包含采集结果，需要刷新数据时才执行）

```bash
cd bilibili-clone/backend
npm install
npm run fetch-data        # 抓取真实视频/封面/头像/播放源
npm run fetch-banners     # 抓取轮播大图
npm run probe-durations   # ffprobe 实测播放源片长（无 ffprobe 时用内置解析器）
npm run normalize-media   # 封面文件名归一化并校验（大小写严格一致）
```

### 1）安装依赖

```bash
cd bilibili-clone
npm run install:all       # backend + frontend
npm install               # 根目录 concurrently
```

### 2）启动

```bash
npm run db:ensure         # 数据库为空才装载演示数据；非空则原样保留（不会清用户数据）
npm run dev               # 同时启动 API(5112) 与 WEB(3112)（内部已包含 db:ensure）
```

打开 **http://localhost:3112**。

> 想重建演示内容（例如改了 seed 逻辑）：`npm run seed`。
> 它**只重建演示数据**，用户产生的评论 / 弹幕 / 观看历史 / 点赞收藏关注都会保留；
> 需要连用户数据一起清空时用 `npm --prefix backend run seed -- --reset-user`。

### 3）生产构建 / 预览

```bash
npm run build                              # 后端 tsc + 复制 schema.sql；前端 vue-tsc + vite build
npm --prefix backend run start:prod        # node dist/index.js
npm --prefix frontend run preview          # 3112，已配置 /api、/media 代理
```

### 4）测试

```bash
npm run typecheck         # 后端 tsc --noEmit + 前端 vue-tsc --noEmit
npm test                  # 后端 25 个集成测试 + 前端 24 个单元/组件测试
npm run e2e               # 真实浏览器 35 项端到端断言（需先 npm run dev）
```

---

## 四、接口一览（后端 5112，全部挂在 `/api`）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/health` | 健康检查 |
| GET | `/home` | 首页聚合：轮播 + 分区 + 热搜 + 总量 |
| GET | `/feed?category=&sort=&page=&pageSize=` | 视频流（分区筛选 / 排序 / 分页） |
| GET | `/categories` | 分区列表（含每个分区的真实视频数） |
| GET | `/sidebar?category=` | 排行榜 + 在线人数（在线人数为演示值） |
| GET | `/me/favorites` · `/me/dynamics` · `/me/notifications` · `/me/creator-stats` | 顶栏收藏 / 动态 / 消息 / 创作中心面板 |
| GET | `/search/suggest?keyword=` | 搜索建议（热搜榜 / 视频 / UP主） |
| GET | `/search?keyword=&page=&sort=` · `/search/hot` | 搜索结果 / 热搜榜 |
| GET | `/videos/:bvid` | 详情（视频 + UP主 + 标签 + 互动态 + 关联推荐 + 真实片长） |
| GET | `/videos/:bvid/play` | 播放地址（并累加播放量） |
| GET/POST | `/videos/:bvid/danmaku` | 弹幕列表 / 发弹幕（带 `timeMs`，越界会被裁剪） |
| GET/POST | `/videos/:bvid/comments` | 评论分页 / 发评论 |
| POST | `/videos/:bvid/toggle/:field` | 点赞 / 投币 / 收藏 / 关注（`liked｜coined｜faved｜followed`） |
| GET/POST/DELETE | `/history` | 观看历史列表 / 上报进度 / 清空 |
| GET | `/media/**` | 真实封面、头像、播放源（支持 Range） |

---

## 五、可演示的交互

| 交互 | 位置 | 表现 |
| --- | --- | --- |
| **hover** | 首页视频卡片 | 封面 `scale(1.08)`、标题转 `#FB7299`、卡片浮起、**左下角**弹幕数滑入、**右上角**「稍后再看」按钮出现、中央播放遮罩淡入 |
| **菜单展开** | 顶部分区导航 | 悬停展开二级分区浮层（6 个二级分区标签 + 进入分区） |
| 菜单展开 | 头像 | 悬停展开用户菜单（个人中心 / 投稿管理 / B币钱包 / 历史记录 / 退出登录） |
| 菜单展开 | 投稿 | 点击展开创作中心菜单（视频投稿 / 发布动态 / 专栏投稿） |
| 菜单展开 | 分区 tab | 「更多 ˅」展开全部 17 个 tab |
| 菜单展开 | 播放器 | 倍速菜单 2x / 1.5x / 1.25x / 1x / 0.75x / 0.5x |
| **顶栏面板** | 消息 / 动态 / 收藏 / 创作中心 | 点击展开真实数据面板：消息（演示条目）、动态（已关注 UP 主最新投稿，未关注回退全站最新）、收藏（真实收藏记录）、创作中心（本站真实行为统计） |
| **搜索建议** | 顶部搜索框 | 聚焦弹出热搜 Top10；输入防抖 200ms 请求建议（视频封面 + UP主 + 关键词）；`↑/↓` 选择、`Enter` 进入、`Esc` 关闭、一键清空 |
| **分类筛选** | 首页 | 17 个分区 tab + 综合 / 最多播放 / 最新发布 / 最多弹幕 排序，服务端过滤分页 |
| **分类筛选** | 分区页 `/category/:slug` | 切换 tab 会跳转到对应 slug，URL / 标题 / 列表三者始终一致 |
| **详情跳转** | 全局 | 卡片、轮播图、推广位、排行榜、相关推荐、标签、UP主、页脚分区入口 都可点 |
| 播放 | 详情页播放器 | 播放/暂停、进度条拖动 + 悬浮时间预览、缓冲条、音量、倍速、弹幕开关、全屏；快捷键 空格 / ← / → / F（**在输入框、文本域、下拉框、contenteditable 内不生效**） |
| 弹幕 | 播放器 | 按时间轴滚动（多轨道 + 随机颜色 + 暂停冻结 + 跳转清屏重排）；发弹幕会带上发送时的播放进度并入库，刷新后仍在同一时点出现 |
| 互动 | 详情页 | 点赞 / 投币 / 收藏 / 分享 / 关注 UP主，状态落库并在刷新后保持 |
| 评论 | 详情页 | 发表、点赞、加载更多、表情面板 |
| 历史 | 历史页 | 播放进度上报（进度条）、清空历史 |
| 无限滚动 | 首页 / 分区页 | 触底自动加载下一页（骨架屏） |
| 未接入能力 | 大会员 / 个人中心 / 投稿等 | 统一给出「Demo 未接入该能力」轻提示，**没有静默无响应的死按钮** |

---

## 六、自动化验收

### 后端集成测试（`npm --prefix backend test`，25 项）

真实启动 Express + 真实 SQLite（临时库），覆盖：健康检查、首页聚合、分区计数一致性、
404 信封、分区过滤、排序降序、分页不重复、详情字段、点赞持久化、评论发布、**弹幕携带进度**、
**越界弹幕裁剪**、空内容拒绝、搜索建议 / 搜索 / 热搜、历史增删查、顶栏四个面板接口、
媒体 Range（206）、**封面引用大小写精确匹配且无碰撞**、**无弹幕超出片长**、
**重复 seed 保留用户数据**。

### 前端单元/组件测试（`npm --prefix frontend test`，24 项）

`utils`（万/亿、时长、占位图、debounce）、`home store`（**并发去重**、按分区缓存、
切回已缓存分区不再请求、请求期间切走不污染当前视图、失败写 error 不抛异常）、
`VideoCard`（hover 态、点击跳转、子元素点击不误跳）、
`VideoPlayer`（**TEXTAREA/INPUT/SELECT/contenteditable 内快捷键不劫持**、普通元素上空格可播放暂停、
preventDefault 不重复处理、**发弹幕携带 currentTime**）、`SearchBox`（聚焦热搜、
输入建议、键盘选择跳转、接口失败降级不抛异常）。

### 浏览器 E2E（`npm run e2e`，35 项断言）

真实 Chromium 驱动：首页渲染（24 卡片 / 16 分区 / 6 轮播 / 4 推广 / 58 张图 0 失败 / 默认「全部」）、
hover 四态、分区二级菜单、用户菜单、投稿菜单、四个顶栏面板、未接入提示、页脚无假链接且入口可跳转、
搜索热搜与建议与键盘高亮、分类筛选与排序、详情跳转标题一致、**视频真的在播放（t>0.5s）**、
弹幕滚动、**评论框内空格/方向键不劫持播放器**、**弹幕时间点等于发送时的 3.2s**、
**刷新后弹幕在同一时点重新出现**、返回首页分区重置为「全部」、
**分区页切换后 URL/标题/筛选三者一致**、历史页进度条。

---

## 七、数据完整性与简化项（诚实说明）

**数据完整性（有测试与脚本兜底）**

1. 每个视频记录 `duration`（B 站原始时长）与 `clip_duration`（演示播放源的真实片长，ffprobe 实测）。
   弹幕时间轴以 `clip_duration` 为准：seed 时裁剪，发弹幕时后端也会裁剪，**演示弹幕 9129 条（另含用户发送的 8 条）0 条超出片长**。
   实测片长：`sample-1/2/5/6 = 10s`、`sample-3 = 10.01s`、`sample-4 = 5.055s`。
2. 封面文件名统一为 `{bvid 小写}-{aid}.webp`，规避 B 站存在的「仅大小写不同的 BV 号」在
   macOS/Windows 上互相覆盖、在 Linux 上 404 的问题。当前 256 条引用 ↔ 256 个文件，**0 缺失、0 大小写碰撞**。
3. `npm run seed` 只重建演示内容；用户数据（`source='user'` 的评论与弹幕、互动、历史）保留。

**简化项**

1. **播放源**：B 站的 m4s 流需要签名与 Referer 白名单，无法本地直接播放，因此每个视频绑定
   6 个真实 mp4 演示片之一（5–10 秒）。卡片与详情页展示的时长、播放量、弹幕数是真实数据，
   播放器内的时间码是真实片长 —— 两者数值不同，这是刻意的取舍，接口里用 `clipDuration` 明确区分。
2. **弹幕内容**：真实弹幕接口需要登录态与 WBI 签名，这里用真实弹幕语料按时间轴生成；
   用户发送的弹幕会真实写入 SQLite。
3. **顶栏入口**：消息面板是演示条目（本站没有账号体系）；大会员 / 个人中心 / 投稿管理 / B币钱包 /
   退出登录等没有对应页面的入口统一弹出「Demo 未接入该能力」提示；页脚中不存在的页面（关于我们、
   下载 APP、友情链接）渲染为纯文本并标注「演示占位」，不再伪装成链接。
4. **直播 / 会员购 / 漫画 / 赛事 / 下载客户端**：这些导航项没有独立页面，点击会进入对应的
   分区页或关键词搜索页（导航到真实存在的页面），并非真实业务页面。
5. **互动与账号**：单用户演示态（`interactions` 表），没有注册/登录、没有多用户。
6. **搜索**：本地 SQLite `LIKE` 检索（标题 / 简介 / UP主 / 分区），不是 B 站搜索服务；
   热搜词由真实热门标题派生。
7. **分区结构**：分区导航的二级分区标签为静态配置（贴近真实结构），不是接口下发；
   汽车 / 运动 / 动物等分区真实抓取样本较少，由其他分区的真实视频补齐到 10 条以上以保证筛选可演示。
8. **未做**：注册登录、动态页、消息页、稍后再看列表页、画质切换、弹幕屏蔽词、移动端专项适配（仅基础断点）。

**当前数据分布（重建后实测）**

```
视频 256 | UP主 236 | 演示弹幕 9129 | 评论 1054 | 轮播 6 | 热搜 12 | 封面 256 | 头像 60
分区：生活33 游戏28 娱乐22 科技19 影视17 音乐16 知识15 纪录片14 时尚13 美食13
      舞蹈12 动画12 鬼畜12 动物10 汽车10 运动10
播放源：sample-1=43 sample-2=43 sample-3=43 sample-4=43 sample-5=42 sample-6=42
```

---

## 八、Review-1 问题修复对照

| 编号 | 问题 | 修复 | 验证 |
| --- | --- | --- | --- |
| P2-1 | 播放器全局快捷键只排除 INPUT，劫持评论 TEXTAREA | `isEditableTarget()` 覆盖 INPUT/TEXTAREA/SELECT/OPTION/contenteditable 及可编辑祖先，并跳过已 `defaultPrevented` 与输入法组合中的事件 | 前端单测 3 项 + E2E「评论框内空格/方向键不劫持播放器」 |
| P2-2 | 弹幕恒以 `timeMs=0` 入库 | 播放器 `send-danmaku` 事件改为携带 `{text, timeMs}`（取 `video.currentTime`）；后端按 `clip_duration` 裁剪后入库 | 前端单测 + 后端集成测试 + E2E（3.2s → 入库 3.2s → 刷新后同一时点复现） |
| P2-3 | sample-4 片长写死 8s（实际 5.055s），533 条弹幕超长 | 新增 `probe-durations.mjs`（ffprobe，缺省回退内置 mvhd 解析）产出 `clip-durations.json`，seed 按真实片长裁剪并做装载后体检 | seed 体检输出 + 后端集成测试「没有弹幕超出演示片长」 |
| P2-4 | 分区页与首页共用 `activeCategory`，URL/标题/筛选脱节 | 分区页以路由为唯一事实来源，切 tab 走 `router.push`；首页挂载时重置为 `all`；视频流按「分区+排序」分桶缓存 | 前端单测 + E2E 两项（分区页一致性、返回首页重置为全部） |
| P2-5 | `npm run dev` 每次 seed 清空用户数据 | 新增 `db:ensure`（库非空即跳过装载）；`seed` 只删 `source='seed'` 的演示内容，保留用户互动/历史/评论/弹幕；`--reset-user` 才全清 | 后端集成测试 + 实测（连跑 seed 后用户弹幕 7 条、历史 5 条仍在） |
| P2-6 | README 提到的 `npm run fetch-banners` 不存在 | 补齐 backend `fetch-banners` 及 `probe-durations` / `normalize-media` / `db:ensure` / `test` / `e2e` 脚本 | 脚本可执行（本次采集与归一化都用它跑通） |
| P2-7 | 两个 BV 仅大小写不同，256 条引用只有 255 个封面 | 封面改名为 `{bvid 小写}-{aid}.webp`，新增 `normalize-media.mjs` 迁移并严格校验；碰撞的那条从原 CDN 重新下载 | 校验脚本 + 后端集成测试（引用与文件大小写精确一致、无碰撞） |
| P2-8 | searchService 直写 SQL、homeController 直连 repository | SQL 全部下沉到 `videoRepository.suggestByTitle` / `interactionRepository.summary` 等；controller 只调 service；首页聚合新增 `homeService.categoriesWithCount` | 代码结构 + 后端集成测试覆盖相关接口 |
| P3 | 文档不实、空交互、未处理 rejection、preview 无代理、build 缺 schema.sql、overview 重复请求、路由标题不全 | README/自检文档按实测重写；顶栏与页脚改为真实面板/提示；store 与组件全面 try/catch + 错误 UI + 重试；`vite preview` 加代理；`copy-assets.mjs` 复制 schema.sql；`loadOverview` 并发去重；补齐所有路由标题 | 本文档 + `npm run typecheck` + `npm test` + `npm run e2e` |

---

## 九、快速自检

```bash
npm run typecheck && npm test && npm run build     # 静态与自动化验收
npm run dev                                        # 起服务
npm run e2e                                        # 浏览器 35 项断言
```

浏览器手动路径：`http://localhost:3112` → hover 卡片 → 点进视频 → 点播放 → 发一条弹幕 → 返回首页。
