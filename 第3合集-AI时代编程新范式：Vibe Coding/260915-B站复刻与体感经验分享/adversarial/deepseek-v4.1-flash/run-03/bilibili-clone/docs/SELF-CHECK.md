# 开发者自检原始记录（V0 + Review-1 修复）

环境：macOS / Node v25.8.2 / npm 11.11.1 / ffprobe (homebrew)
服务：后端 `http://localhost:5112`（Express）/ 前端 `http://localhost:3112`（Vite）
工具：curl、node:test、Vitest、ego-browser（CDP 驱动真实 Chromium）

---

## 0. 本轮验收命令与结果

```
$ npm run typecheck      # 后端 tsc --noEmit + 前端 vue-tsc --noEmit
（两端均 0 error）

$ npm test               # 后端 node:test + 前端 vitest
backend  ℹ tests 25 / pass 25 / fail 0        duration_ms ≈ 2.9s
frontend Test Files 5 passed (5) / Tests 24 passed (24)

$ npm run build          # 后端 tsc + copy-assets；前端 vue-tsc + vite build
✔ 复制 src/db/schema.sql -> dist/db/schema.sql
✓ built（含路由级分包）

$ npm run e2e            # 真实浏览器 35 项断言
✔ E2E 通过 35/35
```

---

## 1. Review-1 八项 P2 的复现与验证证据

### P2-1 播放器快捷键劫持输入框

- 修复：`VideoPlayer.isEditableTarget()` 覆盖 `INPUT / TEXTAREA / SELECT / OPTION /
  [contenteditable]` 及可编辑祖先；跳过 `defaultPrevented` 与输入法组字中的事件。
- 前端单测：

```
✓ VideoPlayer 快捷键隔离 > 焦点在 TEXTAREA 时空格/方向键不触发播放器
✓ VideoPlayer 快捷键隔离 > 焦点在 INPUT / SELECT / contenteditable 时同样不触发
✓ VideoPlayer 快捷键隔离 > 焦点在普通元素上时空格可以播放/暂停
✓ VideoPlayer 快捷键隔离 > 已 preventDefault 的事件不会被重复处理
```

- 浏览器 E2E（真实页面、播放进行中）：

```
✔ 评论框内空格/方向键不劫持播放器  (paused false -> false)
```

### P2-2 弹幕 timeMs 恒为 0

- 修复：`VideoPlayer` 的 `send-danmaku` 事件改为 `{ text, timeMs }`（取 `video.currentTime`）；
  `VideoDetailView` 透传后端；后端按 `clip_duration - 350ms` 裁剪后入库。
- 前端单测：

```
✓ VideoPlayer 发弹幕携带播放进度 > emit 的 timeMs 等于当前播放进度
  （断言 payload === { text: '测试弹幕', timeMs: 3250 }）
```

- 后端集成测试：

```
✓ 弹幕按发送时的进度入库，刷新后仍在同一时点（P2-2 回归）   sent.time === 3.2
✓ 超出片长的弹幕时间点会被裁剪
```

- 浏览器 E2E：

```
✔ 弹幕时间点等于发送时的 3.2s  (time=3.2)
✔ 刷新后弹幕在同一时点重新出现  (mark=E2E弹幕861461 onScreen=10)
```

### P2-3 片长与实际不符导致超长弹幕

修复前实测：

```
sample-1.mp4 -> 10.000000   sample-2.mp4 -> 10.000000   sample-3.mp4 -> 10.010010
sample-4.mp4 -> 5.055000    sample-5.mp4 -> 10.000000   sample-6.mp4 -> 10.000000
（seed 里 sample-4 写的是 8s）

sample-4.mp4 真实时长 5.055 弹幕数 1514 最大ms 7695 超长 533
超长弹幕合计 533 涉及视频 1
```

修复后：

```
✔ sample-4.mp4 -> 5.055s (ffprobe)   … 写入 data/clip-durations.json
✔ 数据体检通过: 256 个封面引用全部存在（大小写一致）/ 弹幕 9137 条均未超出片长
  （该数字=演示弹幕 9129 + 用户发送的弹幕，会随使用增长）
✓ 没有弹幕超出演示片长（P2-3 回归）
```

### P2-4 分区页与首页共用 activeCategory

- 修复：分区页以 `/category/:slug` 路由为唯一事实来源（切 tab → `router.push`）；
  首页 `onMounted` 重置 `activeCategory='all'`；视频流按「分区 + 排序」分桶缓存。
- 前端单测：

```
✓ 按「分区 + 排序」缓存并互不串台
✓ 响应返回时分区已切换：结果只写回自己的缓存桶，不污染当前视图
```

- 浏览器 E2E：

```
✔ 分区页初始状态一致  ({"url":"/category/game","head":"游戏","active":"游戏"})
✔ 分区页切换后 URL/标题/筛选一致
   ({"url":"/category/music","head":"音乐","active":"音乐","title":"音乐 - 哔哩哔哩"})
✔ 返回首页且分区重置为全部  ({"url":"/","cards":24,"active":"全部"})
```

### P2-5 npm run dev 每次 seed 清空用户数据

- 修复：根 `dev` 改为 `db:ensure`（库非空即跳过装载）；`seed` 只删除 `source='seed'` 的演示内容，
  用户评论 / 弹幕 / 互动 / 历史全部保留；只有 `--reset-user` 才全清。
- 后端集成测试：

```
✓ 用户评论 / 弹幕 / 历史 / 互动在重新 seed 后依然存在（P2-5 回归）
```

- 生产库实测（先由 E2E 产生用户数据，再执行 `npm run seed`）：

```
=== seed 之前 ===        用户弹幕=7 用户评论=0 历史=5 互动=0
=== 执行 npm run seed === ✔ 数据体检通过 / ✔ 数据装载完成
=== seed 之后 ===        用户弹幕=7 用户评论=0 历史=5 互动=0
用户弹幕抽查：BV1bxYV6BEwS @3200ms E2E弹幕180592 …
```

- `db:ensure` 复跑输出：

```
✔ 数据库已就绪（保留现有数据）: 256 视频 / 1054 评论 / 9129 演示弹幕 / 5 条历史
  如需重建演示内容: npm run seed（默认保留用户数据）
```

### P2-6 README 里的 fetch-banners 不存在

- 修复：backend 补齐 `fetch-banners`，并新增 `probe-durations`、`normalize-media`、
  `db:ensure`、`test`、`start:prod`；根目录补齐 `typecheck` / `test` / `e2e` / `build` 全量脚本。

### P2-7 大小写碰撞导致 256 引用只有 255 个封面

修复前：

```
引用总数 256 / 唯一引用 256 / 实际文件 255
引用但文件名大小写不匹配的文件数: 1   ['BV1gGYX6DEHm.webp']
bvid 忽略大小写后的碰撞: [["BV1gGYX6DEHm","BV1gGYX6DEHm"]]
```

修复后（`normalize-media.mjs`：重命名 255 个 + 从原 CDN 重新下载 1 个）：

```
↓ 重新下载 BV1gGYX6DEHm -> bv1ggyx6dehm-117257774564859.webp
重命名 255 个，重新下载 1 个，目录内文件 256 个
引用 256 条 / 唯一 256 条 / 缺失 0 条
文件名大小写碰撞: 0 组
✔ 媒体文件名归一化完成，引用与文件大小写完全一致
```

回归测试：

```
✓ 每个封面引用都能在磁盘上按大小写精确找到（P2-7 回归）
```

### P2-8 分层不实

| 位置 | 修复前 | 修复后 |
| --- | --- | --- |
| `searchService.suggest` | 直接 `getDb().prepare(...)` 写 SQL | `videoRepository.suggestByTitle()` |
| `homeController.categories` | 直接调用 `metaRepository` / `videoRepository` | `homeService.categoriesWithCount()` |
| `homeService.interactionSummary` | 一度内联 SQL | `interactionRepository.summary()` |

---

## 2. P3 项处理与证据

| 项 | 处理 | 证据 |
| --- | --- | --- |
| README 写「11 张表」实际 10 | 改为 10 并列出表名 | `SELECT name FROM sqlite_master` → 10 |
| 分区分布、自检数字不实 | 全部按重建后实测重写 | 生活33 游戏28 娱乐22 科技19 影视17 音乐16 知识15 纪录片14 时尚13 美食13 舞蹈12 动画12 鬼畜12 动物10 汽车10 运动10 |
| hover 方位文案不实 | 改为「左下角弹幕数 / 右上角稍后再看」（与 CSS 一致） | `.card__danmaku{left:6px}`、`.card__later{right:6px;top:6px}` |
| 导航占位不实 | README 明确：直播/会员购/漫画/赛事/下载客户端 跳到分区页或关键词搜索页，不是真实业务页 | 顶栏 navLinks 映射 |
| Header 多个空交互 | 消息/动态/收藏/创作中心 → 真实数据面板；大会员/个人中心/投稿管理等 → 「Demo 未接入该能力」提示 | E2E 5 项：四个面板 + 未接入提示 |
| Footer 假链接 | 无对应页面的条目渲染为纯文本并标注占位；分区入口用 RouterLink | E2E「页脚没有假链接 (fake=0 portal=6 text=16)」+「页脚入口真的会跳转」 |
| CommentSection / SearchView / search store / CategoryView 后端失败会 unhandled rejection | 全部 try/catch：store 写 `error`，页面显示错误条 + 重试；弹幕发送 / 点赞失败弹 toast | 前端单测「接口失败时降级为热搜且不抛未处理异常」「home store 接口失败时写入 error 而不是抛出未处理异常」 |
| preview 无 /api、/media 代理 | `vite.config.ts` 抽出 `proxy` 常量，`server` 与 `preview` 共用 | 配置文件 |
| 后端 build 未复制 schema.sql | `build` 追加 `scripts/copy-assets.mjs`；`sqlite.ts` 的 `resolveSchemaPath()` 同时兼容 src 与 dist | build 输出 `✔ 复制 src/db/schema.sql -> dist/db/schema.sql` |
| 首页 overview 并发重复请求 | `loadOverview` 增加 `_overviewPromise` 去重 | 前端单测「并发调用 loadOverview 只会真正请求一次」 |
| 路由标题不完整 | 所有路由补 meta.title；视频 / 搜索 / 分区页在数据到达后设置更精确标题 | E2E 中 `title="音乐 - 哔哩哔哩"` |

---

## 3. 浏览器 E2E 全量输出（35/35）

```
✔ 首页渲染卡片 >= 12  (cards=24)
✔ 首页分区导航 16 个  (channels=16)
✔ 轮播与推广位存在  (6轮播/4推广)
✔ 图片零加载失败  (58/58)
✔ 首页默认分区为「全部」  (active=全部)
✔ hover 标题变色  (card__title is-hover)
✔ hover 出现「稍后再看」  (card__later is-show)
✔ hover 出现播放遮罩  (card__play-mask is-show)
✔ hover 封面放大
✔ 分区二级菜单展开  (tags=6)
✔ 用户菜单展开  (cells=4)
✔ 投稿菜单展开  (items=3)
✔ 消息面板有真实内容  (系统 | 欢迎来到 bilibili 首页复刻 Demo | 本站为分层架构演示)
✔ 动态面板有真实投稿  (items=6)
✔ 收藏面板有反馈内容  (还没有收藏任何视频，点开一个视频试试「收藏」)
✔ 创作中心面板有统计  (cells=4)
✔ 未接入入口有明确提示  (大会员：Demo 未接入该能力)
✔ 页脚没有假链接  (fake=0 portal=6 text=16)
✔ 页脚入口真的会跳转  ({"url":"/category/douga"})
✔ 聚焦弹出热搜榜  (rows=10)
✔ 输入后出现搜索建议  (rows=1 first=疯狂的美食搬运工)
✔ 方向键可高亮建议
✔ 分类筛选生效  (active=舞蹈 cats=宅舞/舞蹈综合/舞蹈综合)
✔ 排序切换生效  (sort=最多播放)
✔ 点击卡片进入详情且标题一致  (/video/BV1bxYV6BEwS | 《对三骗王炸》)
✔ 详情页有播放源与关联推荐  (/media/videos/sample-1.mp4 related=12)
✔ 视频真的在播放  (t=3.53/10 00:03 / 00:10)
✔ 弹幕在滚动  (onScreen=13)
✔ 评论框内空格/方向键不劫持播放器  (paused false -> false)
✔ 弹幕时间点等于发送时的 3.2s  (time=3.2)
✔ 刷新后弹幕在同一时点重新出现  (mark=E2E弹幕861461 onScreen=10)
✔ 返回首页且分区重置为全部  ({"url":"/","cards":24,"active":"全部"})
✔ 分区页初始状态一致  ({"url":"/category/game","head":"游戏","active":"游戏"})
✔ 分区页切换后 URL/标题/筛选一致  ({"url":"/category/music","head":"音乐","active":"音乐","title":"音乐 - 哔哩哔哩"})
✔ 历史页展示观看进度  ({"cards":5,"bars":5})
```

---

## 4. 后端集成测试全量输出（25/25）

```
▶ 基础接口
  ✔ 健康检查
  ✔ 首页聚合包含轮播 / 分区 / 热搜
  ✔ 分区列表带每个分区的真实视频数，且与 feed.total 一致
  ✔ 未知视频返回 404 与统一错误信封
▶ 视频流 / 分类筛选 / 排序
  ✔ 按分区过滤，结果全部属于该分区
  ✔ 按播放量排序为降序
  ✔ 分页不重复且 hasMore 正确
▶ 详情 / 互动 / 评论 / 弹幕
  ✔ 详情返回 UP主、标签、关联推荐与真实片长
  ✔ 点赞切换会持久化
  ✔ 评论发布后立即可见
  ✔ 弹幕按发送时的进度入库，刷新后仍在同一时点（P2-2 回归）
  ✔ 超出片长的弹幕时间点会被裁剪
  ✔ 空评论 / 空弹幕被拒绝
▶ 搜索
  ✔ 空关键词返回热搜榜
  ✔ 关键词给出发送可跳转的视频建议
  ✔ 搜索结果为非空且关键词相关
▶ 历史记录
  ✔ 上报进度后可读取并可清空
▶ 顶栏面板接口
  ✔ 收藏面板返回真实收藏记录
  ✔ 动态面板有数据来源标记
  ✔ 消息与创作中心返回统计
▶ 媒体与数据完整性
  ✔ 视频资源支持 Range 请求（可拖动进度）
  ✔ 每个封面引用都能在磁盘上按大小写精确找到（P2-7 回归）
  ✔ 没有弹幕超出演示片长（P2-3 回归）
  ✔ 每个视频都有有效的演示播放源与片长
▶ 重复执行 seed 不会清掉用户数据（P2-5 回归）
  ✔ 用户评论 / 弹幕 / 历史 / 互动在重新 seed 后依然存在
ℹ tests 25 / pass 25 / fail 0
```

---

## 5. 前端单元 / 组件测试全量输出（24/24）

```
✓ test/utils.test.ts (5)
✓ test/home-store.test.ts (5)
✓ test/video-card.test.ts (5)
✓ test/video-player.test.ts (5)
✓ test/search-box.test.ts (4)
Test Files  5 passed (5)   Tests  24 passed (24)
```

---

## 6. 数据体检（seed 内置，每次装载都会跑）

```
✔ 数据体检通过: 256 个封面引用全部存在（大小写一致）/ 弹幕 9137 条均未超出片长
  （该数字=演示弹幕 9129 + 用户发送的弹幕，会随使用增长）
  分区分布: life:33 game:28 ent:22 tech:19 movie:17 music:16 knowledge:15
            documentary:14 fashion:13 food:13 dance:12 douga:12 kichiku:12
            animal:10 car:10 sports:10
  播放源分布: sample-1.mp4=43 sample-2.mp4=43 sample-3.mp4=43
              sample-4.mp4=43 sample-5.mp4=42 sample-6.mp4=42
✔ 数据装载完成: 256 视频 / 236 UP主 / 16 分区 / 6 轮播图
```

数据库表清单（10 张）：`categories, owners, videos, tags, banners, hot_searches,
comments, danmaku, interactions, watch_history`

---

## 7. 本轮仍未解决 / 已知边界

1. 演示播放源是 6 个 5–10 秒的真实 mp4，与卡片的 B 站原始时长不同（接口用 `clipDuration` 显式区分，
   播放器时间码取真实片长）；要完全一致需要接入真实播放地址（需签名与 Referer 白名单）。
2. 消息面板为演示条目（无账号体系），`/api/me/notifications` 返回体与面板文案都已标注。
3. 顶栏「大会员 / 个人中心 / 投稿管理 / B币钱包 / 退出登录」没有对应页面，统一以轻提示告知，
   而不是伪装成可用功能。
4. 移动端仅做了基础断点，没有做专门的触屏交互与手势适配。
