# B 站首页复刻（bili-home-replica）

可运行的 bilibili.com 首页复刻：**前端 3141 / 后端 5141** 固定端口，非纯原生技术栈，前后端与数据三层分离，内容为 B 站公开接口抓取的**真实数据 + 真实图片 + 真实视频源**。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 18 + TypeScript + React Router 6 + Vite 5（dev server 固定 **3141**，`/api`、`/media` 代理到 5141） |
| 后端 | Node + Express 4 + TypeScript，经 tsx 运行（固定 **5141**） |
| 数据层 | `server/data/*.json` 种子文件 + `server/src/data/store.ts` 纯查询函数（与 HTTP 路由分离） |
| 真实素材 | 封面/头像/热搜/标题/播放量来自 B 站公开 API（需 UA+Referer），图片已下载到本地 `server/public`；播放源为 3 个公共 CC mp4 |

## 目录

```
run-02/
├── package.json            # workspace 根：dev / seed / selfcheck 脚本（concurrently 并行起两端）
├── scripts/
│   ├── seed.mjs            # 抓取真实数据、下载真实图片与视频 → server/data + server/public
│   └── selfcheck.mjs       # 自动起两端并做 19 项主链路自检
├── web/                    # 前端（3141）
│   ├── vite.config.ts      # port 3141 + strictPort + 代理 → http://localhost:5141
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── api/client.ts   # API 层（fetch /api/*）+ 数字/时长格式化
│       ├── components/     # Header(菜单+搜索建议) VideoCard(hover) CategoryTabs
│       ├── pages/          # Home(视频流) VideoDetail(实际播放+相关推荐)
│       └── styles/global.css
└── server/                 # 后端（5141）
    └── src/
        ├── index.ts        # Express：/api + /media 静态（Range 支持视频拖动）
        ├── routes/api.ts   # HTTP 路由层（薄）
        └── data/store.ts   # 数据层（列表/筛选/搜索/详情/相关/建议）
    ├── data/               # videos.json(64 条真实视频) hotword.json(真实热搜)
    └── public/             # covers/ faces/ videos/ logo.png（真实素材本地化）
```

## 启动

```bash
npm install        # 根目录一次装齐（workspaces）
npm run seed       # 可选：重新抓取真实种子（已内置一份，直接启动即可）
npm run dev        # 并行启动后端 5141 + 前端 3141
# 打开 http://localhost:3141
```

自检（自动拉起两端、跑完自动关闭）：

```bash
npm run selfcheck  # 期望输出：19 通过 / 0 失败
```

## 已实现交互

- **首页视频流**：12 张/页真实视频卡片（16:9 真实封面、UP 主头像、播放/弹幕数、时长角标），「加载更多」追加，「换一换」随机重排
- **hover**：卡片封面放大 + 渐变浮层显示播放/弹幕数据、标题变粉、UP 主头像悬停变蓝圈、导航/标签/按钮均有过渡态
- **菜单**：顶栏频道导航（首页高亮）+「分区 ▾」hover 弹出**真实分区**下拉网格，点击即筛选
- **搜索建议**：输入框聚焦显示**B 站真实热搜榜**；输入时 250ms 防抖 → 后端先探 B 站线上 suggest（`source=live`），失败自动降级本地数据层建议；点击/回车进入搜索结果
- **分类筛选**：分类标签行（真实 tname，含条数）→ `GET /api/videos?tid=`，URL 携带 `?tid=` 可分享
- **详情跳转**：点卡片 → `/video/:bvid`，真实 `<video>` **实际播放**（本地 mp4、真实封面做 poster、进度条可拖——Range 已支持），真实播放量/点赞/投币/收藏/简介/标签，标签点击回首页搜索，12 条同区优先的相关推荐
- **返回首页**：详情页「← 返回」「首页」面包屑、顶栏 logo 均可回 `/`；刷新深链接可用（history fallback）
- **真实图片**：64 张 B 站真实封面、62 张真实 UP 主头像、真实 bilibili logo，全部本地化由 5141 `/media` 提供（离线可演示）

## 简化项（明确未做）

- 登录/会员/关注为静态按钮演示；投币、评论、弹幕池、播放进度记录均未实现（评论区显示真实评论条数）
- 播放器是 HTML5 `<video>` + 3 个循环的公共 CC 视频源，封面与真实视频内容不逐帧对应（真实 B 站播放需 wbi 签名与流媒体服务）
- 无限滚动改为「加载更多」按钮；搜索建议的 live 探询失败时用本地标题/标签/热搜索引兜底
- 数据为一次性快照（64 条，覆盖 53 个真实分区），不随 B 站实时更新；重新执行 `npm run seed` 可刷新

## 端口约定（三处一致）

前端 **3141**：`web/vite.config.ts`（strictPort）；后端 **5141**：`server/src/index.ts`（PORT 环境变量可覆盖但默认 5141）；代理与 README、自检脚本、concurrently 脚本全部指向同一对端口。
