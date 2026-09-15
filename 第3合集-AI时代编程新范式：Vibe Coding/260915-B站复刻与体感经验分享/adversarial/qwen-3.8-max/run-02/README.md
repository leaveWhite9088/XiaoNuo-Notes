# 哔哩哔哩首页复刻（Bilibili Clone · V0）

基于 **Vue 3 + Vite（前端 :3132）** 与 **Express（后端 :5132）** 的前后端分离项目，数据层独立（Repository + JSON 数据文件）。视频数据、封面图、UP 主头像全部来自 bilibili 公开接口抓取的真实数据（80 条），已下载到本地。

## 环境要求

- **Node.js >= 20.11**（使用 `node --watch`、`node --test`、`import.meta.dirname`；三个 package.json 均已声明 `engines`）
- npm >= 10

## 端口约定（脚本 / 代理 / 文档三处一致）

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| 前端 (Vite) | **3132** | `web/vite.config.js` 中 `strictPort: true` |
| 后端 (Express) | **5132** | `server/src/index.js`，可用 `PORT` 环境变量覆盖 |

前端通过 Vite 代理访问后端（同源，无跨域问题）：

- `/api/*`  → `http://127.0.0.1:5132/api/*`（JSON 接口）
- `/media/*` → `http://127.0.0.1:5132/media/*`（封面 / 头像 / 样例视频等静态资源）

## 快速启动

```bash
# 1. 安装全部依赖（根目录 + server + web）
npm run install:all

# 2. 一键启动前后端（concurrently）
npm run dev
```

然后浏览器访问：**http://localhost:3132**

也可以分开启动：

```bash
npm run dev:server   # 仅后端 → http://localhost:5132
npm run dev:web      # 仅前端 → http://localhost:3132
```

> 数据已随仓库提供（`server/data/videos.json` + `server/public/`），无需重新抓取。
> 如需刷新真实数据：`npm run fetch-data`（访问 bilibili 公开 API 并下载图片）。

## 自动化测试

```bash
npm test                 # 根目录：跑 server + web 全部测试（node --test，无额外依赖）
npm --prefix server test # 仅后端：data-store 单测（10 例）+ API 冒烟测试（12 例）
npm --prefix web test    # 仅前端：utils（formatCount/timeAgo）单测（2 例）
```

- `server/test/data-store.test.js`：数据层单测——加载、频道计数守恒、筛选/搜索/分页边界、相关推荐、搜索建议、热搜去重
- `server/test/api.test.js`：API 冒烟——在**临时端口**启动 Express 应用（不占用 5132），逐一验证 `/health`、`/api/*` 全部接口、JSON 404、静态媒体
- `web/test/utils.test.js`：前端纯函数单测

## 目录结构

```
run-02/
├── package.json            # 根：一键启动 + npm test（concurrently）
├── scripts/
│   └── fetch-data.mjs      # 数据抓取脚本（bilibili 公开 API → JSON + 图片下载）
├── server/                 # 后端 Express，端口 5132
│   ├── data/videos.json    # 数据层存储：80 条真实视频数据
│   ├── public/             # 静态媒体：covers/(封面) faces/(头像) videos/(样例mp4)
│   ├── src/
│   │   ├── index.js        # 入口：监听 5132
│   │   ├── app.js          # 应用工厂（供测试用临时端口启动）+ /api JSON 404 兜底
│   │   ├── data-store.js   # 数据层（Repository）：加载 JSON、频道映射、筛选/搜索/分页/推荐
│   │   └── routes/api.js   # 路由层：参数解析、响应封装
│   └── test/               # data-store 单测 + API 冒烟测试
└── web/                    # 前端 Vue3 + Vite，端口 3132
    ├── vite.config.js      # 端口 3132 + /api、/media 代理到 5132
    ├── test/               # utils 单测
    └── src/
        ├── api.js          # API 客户端（错误对象携带 HTTP status）
        ├── home-context.js # 首页列表上下文保存/恢复（返回时还原频道/页码/滚动）
        ├── toast.js        # 全局 Toast（"V0 未开放"类操作的明确反馈）
        ├── router.js       # 路由：/ 首页、/video/:id 详情
        ├── utils.js        # 播放量格式化（万/亿）、相对时间
        ├── components/     # TheHeader(菜单+搜索建议) ChannelTabs VideoCard ToastHost
        └── views/          # HomeView(视频流) VideoView(播放页)
```

## 后端 API

响应统一为 `{ code: 0, data: ... }`；业务错误返回非 0 `code` + 对应 HTTP 状态码；**`/api` 下未匹配的路由返回 JSON 404**（`{code:404, message:"接口不存在: ..."}`，不返回 HTML）。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/channels` | 分类频道列表（含数量），用于首页筛选 |
| GET | `/api/videos?channel=&keyword=&page=&pageSize=` | 视频流（分类筛选 / 关键词搜索 / 分页） |
| GET | `/api/videos/:id` | 视频详情（含播放地址 `src`）+ 相关推荐；不存在返回 404 JSON |
| GET | `/api/search/suggest?keyword=` | 搜索建议（标题 / UP主 / 分区联想） |
| GET | `/api/hot-searches` | 热搜词（无输入时的默认下拉） |
| GET | `/health` | 健康检查 |
| GET | `/media/*` | 静态资源（封面 / 头像 / 视频文件） |

### 分区映射维护

B 站细分子分区（如"单机游戏"）到首页一级频道（如"游戏"）的映射表在 `server/src/data-store.js` 的 `CHANNEL_MAP` 中**手工维护**。重新抓取数据（`npm run fetch-data`）后若出现未映射的新分区，视频会归入 **"其他"** 频道，且服务启动时打印告警列出缺失分区，提示补充映射。

## 功能与交互

- **首页视频流**：真实封面 / 标题 / UP主 / 播放量网格，`加载更多` 分页；首屏显示加载态；**列表请求带序号防护，快速切换分类/搜索时过期响应不会覆盖新结果**；加载更多失败页码不推进，可原地重试
- **分类筛选**：吸顶频道 Tab（全部 / 游戏 / 鬼畜 / 生活…），点击即时过滤
- **搜索 + 搜索建议**：输入防抖 200ms 下拉联想（支持 ↑↓ / Enter / Esc），聚焦无输入时显示"大家都在搜"热搜词；搜索后首页显示结果条并可一键清空；**搜索框与 URL `?keyword=` 双向同步**（深链 / 刷新 `/?keyword=X` 会回填输入框，清空搜索也会同步清空输入框）
- **导航菜单**：顶部 B 站风格菜单（首页/番剧/直播/游戏中心…），hover 弹出下拉子菜单，子项点击直达对应关键词搜索
- **视频卡片 hover**：上浮 + 阴影 + 封面缩放 + 渐变遮罩（播放量 / 稍后再看），标题变粉色
- **详情页 / 实际播放**：`/video/:id` 真实 `<video>` 播放（本地样例 mp4，**muted 静音自动播放**，符合浏览器自动播放策略，可手动取消静音；poster 为真实封面），点赞 / 投币 / 收藏 / 关注为本地状态可交互，右侧相关推荐可连续跳转
- **返回首页与上下文恢复**：详情页左上角返回按钮 + 面包屑（首页 › 分区 › 详情）+ Logo 均可返回；**返回首页时恢复离开前的频道、关键词、页码、已加载列表和滚动位置**；离开详情页 `document.title` 恢复默认
- **错误处理**：后端不可用时首页/详情页显示区别于"空结果/404"的错误态并提供重试；全部异步调用均有捕获，无未处理 rejection
- **V0 未开放功能的明确提示**：投稿、登录（头像）、稍后再看、转发点击后弹出 Toast「V0 暂未开放」，不做虚假成功反馈；UP 主名点击为真实行为（按 UP 主搜索）

## V0 简化项（如实说明）

1. **播放内容**：B 站真实视频流需要鉴权（wbi 签名 + referer 校验），V0 使用 3 个本地样例 MP4（Big Buck Bunny / Sintel / Jellyfish，各约 10s）按视频 ID 哈希轮流播放；封面 / 标题 / 统计数据均为真实。
2. **数据为一次性快照**：80 条视频来自抓取时的热门接口，不实时刷新（可重跑 `npm run fetch-data`）。
3. **无登录 / 数据库**：数据层为 JSON 文件内存加载；点赞 / 投币 / 收藏 / 关注仅前端本地状态，不落库。
4. **弹幕 / 评论未实现**：页面无相关入口（不做占位假入口）；投稿 / 登录 / 稍后再看 / 转发以 Toast 明确提示"V0 暂未开放"；导航子菜单点击行为为"按该词搜索"。
5. **响应式为简版**：窄屏下折叠部分导航项、详情页单列布局，未做完整移动端适配。
