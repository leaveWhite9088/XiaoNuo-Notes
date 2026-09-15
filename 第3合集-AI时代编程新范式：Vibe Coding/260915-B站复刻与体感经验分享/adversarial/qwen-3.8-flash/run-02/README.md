# B 站首页复刻 V0

可运行的 Bilibili 首页复刻项目。**前端 3142 / 后端 5142**（与 vite 代理、脚本、本文档全部一致）。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite 5 + react-router-dom v6（端口 **3142**，`/api` 反向代理到 5142） |
| 后端 | Node.js + Express 4（端口 **5142**），路由层 / 服务层 / 仓储层 三层结构 |
| 数据 | `server/data/*.json` 真实种子快照：封面、头像、标题、UP 主、播放/弹幕/点赞数据，由 `scripts/build-seed.mjs` 抓取 **B 站公开接口**（popular / ranking/v2）生成（272 条，13 个分区）；搜索建议运行时优先代理 B 站 `s.search.bilibili.com` 真实接口，失败自动回退本地快照 |

## 快速启动

```bash
# 环境要求：Node.js >= 18.11
npm install          # 根目录一次装齐（npm workspaces）
npm run dev          # 同时启动 后端5142 + 前端3142
```

打开 **http://localhost:3142** 。

分启：`npm run dev:server` / `npm run dev:client`。重新抓取种子数据：`npm run seed`（需可访问 bilibili 公开 API）。

## 目录结构

```
├── package.json             # 根 workspaces + 一键 dev 脚本
├── client/                  # 前端 React+TS（固定 3142）
│   ├── vite.config.ts       # port 3142 + /api -> http://localhost:5142 代理
│   └── src/
│       ├── api/             # API 客户端
│       ├── components/      # TopNav / SearchBox / CategoryBar / VideoCard / Toast / icons
│       ├── pages/           # Home 首页信息流 / Detail 详情播放 / Search 搜索结果
│       └── styles/          # B 站视觉样式
└── server/                  # 后端 Express（固定 5142）
    ├── data/                # 数据层：真实种子 JSON（videos/categories/hotwords/meta）
    ├── scripts/build-seed.mjs  # 从 B 站公开接口抓取种子数据
    └── src/
        ├── routes/api.js    # 路由层
        ├── services/        # 服务层（DTO、suggest 代理+回退）
        ├── repositories/    # 仓储层（分页/筛选/搜索/推荐）
        └── db.js            # 数据加载与索引
```

## API

- `GET /api/health` 数据集状态
- `GET /api/categories` 分区列表（含条数）
- `GET /api/feed?cat=anime&page=1&size=24` 分区信息流分页
- `GET /api/video/:id` 详情（数字 id 或 BV 号）：视频 + 相关推荐 + 评论
- `GET /api/search?q=kw` 本地搜索
- `GET /api/search/suggest?kw=kw` 搜索建议（真实 B 站接口，失败回退本地）

## 已实现交互

- **首页视频流**：真实封面/标题/UP 主/播放数网格流，滚动到底自动加载下一页
- **hover**：悬停卡片 350ms 后封面静音循环预览真实视频流 + 浮出播放/弹幕数据条 + 悬停出现「不感兴趣」按钮（点击隐藏该卡片，可一键恢复）
- **菜单**：顶栏「分区」双列下拉（点击切换分类）、消息/动态/收藏/历史图标下拉、用户头像下拉；全部支持键盘操作（Tab 聚焦即展开，菜单项 Enter/空格触发）
- **远程资源兜底**：封面/头像加载失败显示占位图与首字母圆形占位；详情页示例流不可达时显示提示层与「重试播放」按钮
- **请求竞态防护**：信息流加载使用 AbortController，切换分区时旧请求结果被取消丢弃，不会混排
- **搜索建议**：输入防抖 250ms，运行时代理 B 站真实 suggest 接口（高亮命中词、↑↓/Enter/Esc 键盘导航）；聚焦空输入展示热榜；失败回退本地标题联想
- **分类筛选**：分区 chip 条（13 个分区均有数据），URL 携带 `?cat=`，可分享/前进后退
- **详情页与实际播放**：点击进入 `/video/:id`，`<video>` 加载真实可播放流（支持拖动进度），点赞/投币/收藏/分享(复制链接)/关注/弹幕输入/发表评论等交互均本地生效
- **相关推荐**：同分区确定性打散 + 高热补充，点击可继续跳转
- **返回首页**：Logo、面包屑「首页」、侧栏「← 返回首页」按钮均可回到信息流

## 简化项（V0 明示）

1. **正片视频流**：B 站真实播放流需 WBI 签名+Cookie 且有版权限制，详情页实际播放采用公开开放示例 MP4（media.w3.org / test-videos.co.uk，已验证支持 Range 拖动）；封面、标题、UP、统计数据为 B 站真实快照
2. 数据为一次性抓取快照（2026-09-12），不做定时刷新；搜索走本地匹配
3. 无登录态/用户系统：关注、三连、弹幕、评论均为本地演示，不持久化
4. 无左侧边栏、轮播 Banner、视频进度条上的真实弹幕轨道、WBI 风控等未复刻；「番剧/直播/游戏中心」等顶栏入口为展示项（Toast 提示）
5. 评论不拉取真实数据（B 站 reply 接口需 Cookie 签名，实测返回空），用本地模板按 aid 确定性生成
