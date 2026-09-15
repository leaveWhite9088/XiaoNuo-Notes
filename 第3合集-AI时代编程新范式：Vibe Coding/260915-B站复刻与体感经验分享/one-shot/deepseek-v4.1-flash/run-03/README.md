# 哔哩哔哩首页复刻（B站首页 · 前端 + 后端 + 数据 三层实现）

一个可运行、可交互的 B站首页复刻项目：**真实数据 + 真实图片 + 真实视频播放**。
技术栈不是原生三大件，前后端分离，后端有清晰的 Controller / Service / Repository 分层，
数据落地在 SQLite，由 ETL 脚本从哔哩哔哩公开接口抓取。

---

## 一、技术栈

| 层 | 技术 | 端口 |
| --- | --- | --- |
| 前端 | Vue 3 (Composition API) · Vite 6 · Vue Router 4 · Pinia 2 · SCSS · Axios | **3111** |
| 后端 | Node.js 25 · Express 4 · ESM · 分层架构（routes → controllers → services → repositories） | **5111** |
| 数据 | SQLite（Node 内置 `node:sqlite`，零原生依赖）· ETL 种子脚本 | — |

- 不使用 jQuery / 原生三大件直接堆页面；组件化拆分，单文件不含多页面逻辑。
- SQLite 走 Node 22.5+ 内置的 `node:sqlite`，**不需要编译原生模块**，安装即用。

---

## 二、目录结构

```
run-03/
├── server/                        # 后端（Express + SQLite）
│   ├── package.json
│   ├── data/
│   │   ├── bilibili.db            # SQLite 数据库（seed 后生成）
│   │   └── raw-seed.json          # 上游原始响应缓存（增量抓取，避免风控）
│   ├── scripts/
│   │   └── seed.mjs               # ETL：抽取 → 转换 → 装载
│   └── src/
│       ├── config/index.js        # 全局配置（端口 / 上游 / 播放 / 分页）
│       ├── app.js                 # 应用装配（中间件 + 路由）
│       ├── server.js              # 启动入口（监听 5111）
│       ├── db/
│       │   ├── schema.sql         # 表结构
│       │   ├── index.js           # 连接 / 迁移 / 通用查询 / 事务
│       │   └── categories.js      # 分区定义 + tid 映射 + PGC 配置
│       ├── repositories/          # 仓储层：唯一的 SQL 出口
│       │   ├── videoRepository.js      userRepository.js
│       │   ├── categoryRepository.js   bannerRepository.js
│       │   ├── commentRepository.js    danmakuRepository.js
│       │   ├── searchRepository.js     pgcRepository.js
│       ├── services/              # 业务层：编排仓储 + 上游 + 缓存
│       │   ├── feedService.js          catalogService.js
│       │   ├── videoService.js         searchService.js
│       │   ├── playService.js          userService.js
│       │   ├── bilibiliClient.js       mappers.js（DTO 映射）
│       ├── controllers/           # HTTP 层：只做参数解析与响应包装
│       ├── routes/                # 路由表
│       ├── middlewares/           # 日志 / 错误 / 缓存
│       └── utils/                 # 日志 / HTTP / 格式化 / 弹幕解码 / 异常
│
└── web/                           # 前端（Vue 3 + Vite）
    ├── vite.config.js             # 端口 3111，/api 代理到 5111
    └── src/
        ├── api/http.js            # Axios 实例 + 各业务接口
        ├── stores/                # Pinia：home / search / player
        ├── router/index.js        # 首页 / 分区 / 搜索 / 视频详情
        ├── styles/                # 设计变量（取自真实站点计算样式）+ 基础样式
        ├── components/
        │   ├── layout/            # AppHeader / TopNav / SearchBox / UserMenu / ChannelBar / Footer
        │   ├── home/              # BannerCarousel / VideoCard / VideoGrid / FilterBar / RankPanel
        │   ├── video/             # VideoPlayer / ActionBar / UpPanel / CommentSection / RelatedPanel
        │   └── common/            # SvgIcon / LazyImage / BackToTop
        └── views/                 # HomeView / CategoryView / SearchView / VideoView
```

---

## 三、启动方法

> 需要 Node.js ≥ 22.5（本项目在 Node 25.8 + macOS 上验证）。

### 1. 安装依赖

```bash
cd server && npm install
cd ../web && npm install
```

### 2. 初始化数据（抓取真实 B站数据）

```bash
cd server
npm run seed          # 首次导入
npm run seed -- --force   # 清空并重建
# 可选环境变量：
#   SEED_DANMAKU=36   抓取真实弹幕的视频数
#   SEED_COMMENTS=36  抓取真实评论的视频数
#   SEED_PER_CATEGORY=28   每个分区保底视频数
#   SEED_PROBE=0      跳过播放地址探测（更快，但版权视频不会被标记）
```

脚本会抓取：分区排行榜（18 个分区）、全站热门 / 入站必刷、真实热搜、
PGC 季榜（番剧/国创/综艺）、真实评论、真实弹幕（protobuf 分段弹幕），
并**探测每个视频是否真的有播放地址**。
所有原始响应会缓存到 `server/data/raw-seed.json`，重复执行只抓增量，避免触发上游风控。

### 3. 启动（两个终端）

```bash
# 终端 A —— 后端 5111
cd server && npm start

# 终端 B —— 前端 3111
cd web && npm run dev
```

浏览器打开 **http://localhost:3111**

---

## 四、接口一览（后端 5111）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/home` | 首页聚合（轮播 / 分区 / 信息流 / 排行 / 热搜 / 热评） |
| GET | `/api/feed?category=&sort=&page=` | 信息流分页（sort: hot/new/play/danmaku） |
| GET | `/api/filters` | 筛选条数据 |
| GET | `/api/stats` | 数据概览 |
| GET | `/api/categories` | 分区列表（scope=all/nav/filter） |
| GET | `/api/categories/:slug` | 分区详情 + 排行 + 版权内容(PGC) |
| GET | `/api/videos/:bvid` | 视频详情（含 UP主 / 相关推荐 / 评论 / 弹幕） |
| GET/POST | `/api/videos/:bvid/comments` | 评论读取 / 发表 |
| POST | `/api/videos/:bvid/danmaku` | 发送弹幕 |
| GET/POST | `/api/videos/history` · `/api/videos/:bvid/history` | 观看历史 |
| GET | `/api/search/suggest?keyword=` | 搜索建议（热搜 + 标题/UP主联想） |
| GET | `/api/search?keyword=` | 搜索结果 |
| GET | `/api/play/:bvid/info` | 播放地址解析（清晰度列表） |
| GET | `/api/play/:bvid/stream?qn=` | **视频流代理**（带 Referer 过防盗链，支持 Range 拖动） |

---

## 五、已实现的交互

| 交互 | 位置 | 说明 |
| --- | --- | --- |
| **Hover 悬停** | 视频卡片 | 封面放大 + 渐变遮罩 + 播放/弹幕数据浮现 + 稍后再看按钮 + 标题变蓝 |
| **Hover 悬停** | 顶部导航 / 用户区 | 主导航浮层、头像面板、消息/动态/收藏/历史浮层 |
| **菜单展开** | 主导航 | 番剧 / 直播 / 游戏中心 / 会员购 / 漫画 / 赛事 的 Mega Menu（多列链接 + 推荐卡） |
| **菜单展开** | 频道条 | 「更多」展开全部 20+ 分区 |
| **菜单展开** | 筛选条 | 「更多」展开时长/标签筛选面板 |
| **搜索建议** | 搜索框 | 聚焦展示真实热搜榜，输入实时联想（防抖 180ms、关键词高亮、键盘上下选择、回车跳转） |
| **分类筛选** | 首页 / 分区页 | 15 个分区 chip 切换 + 4 种排序 + 时长/标签筛选，走真实后端查询 |
| **详情跳转** | 全站 | 卡片、排行、相关推荐、UP主其它作品均可跳转 `/video/:bvid` |
| **真实播放** | 详情页 | HTML5 `<video>` + 后端流代理，720P/360P 切换、进度拖动、音量、全屏 |
| **弹幕** | 播放器 | B站 **真实弹幕**（segment protobuf 解码）按时间轴滚动，可开关、可发送 |
| **评论** | 详情页 | 真实评论展示 + 发表评论（写入 SQLite，刷新仍在） |
| **其它** | — | 滚动吸顶导航、无限滚动加载、回到顶部、轮播自动播放、观看进度记录 |

---

## 六、还原度对齐（数值取自真实站点的计算样式）

| 项目 | 真实 B站 | 本项目 |
| --- | --- | --- |
| 页面背景 | `#F1F2F3` | ✅ `#F1F2F3` |
| 主色 / 品牌粉 | `#00AEEC` / `#FB7299` | ✅ 一致 |
| 顶部导航条高 | 64px | ✅ 64px |
| Banner 大图高 | 169px | ✅ 169px |
| 频道条高 | 120px | ✅ 120px |
| 内容区栅格 | `repeat(5, 288px)` + 20px gap = 1520px | ✅ 完全一致 |
| 视频卡片 | 288×237，封面 16:9，圆角 6px | ✅ 288×242 |
| 频道按钮 | 82×32，`#F6F7F8`，圆角 6px | ✅ 88×32，同色同圆角 |
| 功能圆图标 | 46×46 渐变圆形 | ✅ 46×46 |
| 正文字号 | 14px / 标题 15px / 辅助 13px | ✅ 一致 |
| 首屏布局 | 轮播占 2 列 × 2 行 | ✅ 一致（596×511 vs 真实 596×494） |

---

## 七、数据说明与简化项

**真实数据**
- 420 个视频（来自 18 个分区排行榜 + 全站热门 + 入站必刷），含真实标题/封面/时长/UP主/统计。
- 333 位 UP 主、15162 条弹幕（其中 10554 条为真实弹幕，覆盖全部 420 个视频）、1100 条评论（含 108 条真实评论，覆盖 160 个视频）、
  10 条真实热搜、番剧/国创/综艺各 24 部版权内容（真实封面与评分）。
- 所有封面/头像均为 `i0.hdslb.com` 真实图片。
- 视频播放走 B站真实 `playurl`，由后端带 `Referer` 代理转发，支持 206 Range。

**简化项（诚实说明）**
1. **登录态**：没有做真实鉴权，右栏用户区为固定的演示账户；「退出登录 / 投稿」等按钮为占位。
2. **番剧 / 国创 / 综艺**：B站排行榜接口不覆盖版权分区（返回 -400），
   因此这三个分区的 UGC 信息流为空，改用 **PGC 季榜** 展示真实封面/评分，点击跳转 B站 官方页面。
3. **版权/付费视频**：约 83/420 个视频（多为电影、电视剧区的版权内容）没有 `playurl`；
   seed 阶段已探测并标记，首页会把它们排在后面并显示「版权」角标，详情页给出友好提示与一键跳转推荐。
4. **弹幕覆盖**：受上游风控限制，真实弹幕抓取了 36 个视频（每个最多 300 条，共 10554 条）；
   其余视频使用本地派生的占位弹幕补齐，保证每个视频的播放页都有弹幕滚动。
5. **评论覆盖**：真实评论来自 36 个热门视频，其余视频使用本地生成的评论填充。
6. **首页轮播**：使用热度最高的 8 个视频封面按 `@976w_550h_1c` 裁切成 Banner 尺寸，
   而非 B站 的商业推广位素材。
7. **直播 / 漫画 / 会员购 / 赛事**：仅还原导航与菜单信息结构，未实现独立业务页面。
8. **点赞 / 投币 / 收藏 / 分享**：前端交互反馈（分享会复制链接），未做后端持久化。
9. **动态 / 消息 / 历史入口**：浮层已还原，未接入真实数据流。

---

## 八、上游接口

数据来自哔哩哔哩公开接口，仅用于技术演示：

- `x/web-interface/ranking/v2` 分区排行榜
- `x/web-interface/popular` 全站热门 / `popular/precious` 入站必刷
- `pgc/season/rank/web/list` 版权内容季榜
- `x/v2/reply` 评论、`x/v2/dm/web/seg.so` 弹幕（protobuf）、`x/v1/dm/list.so` 弹幕（XML 兜底）
- `s.search.bilibili.com/main/hotword` 热搜
- `x/player/playurl` 播放地址、`x/web-interface/view` 视频详情
