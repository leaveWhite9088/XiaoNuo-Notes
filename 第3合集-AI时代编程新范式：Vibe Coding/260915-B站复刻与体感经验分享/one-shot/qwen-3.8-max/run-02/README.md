# B站首页复刻（Bilibili Home Clone）

前后端分离的 B 站首页复刻 Demo：首页视频流、分类筛选、搜索建议、视频详情与实际播放、hover 交互、下拉菜单。

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | React 18 + Vite 5 + React Router 6 | 端口 **3131**（固定），原生 CSS（B站风格主题变量） |
| 后端 | Node.js + Express 4 | 端口 **5131**（固定），REST API，启用 CORS |
| 数据层 | 独立分层的种子数据 + 服务层 | `server/src/data`（数据）→ `server/src/services`（业务）→ `server/src/routes`（路由） |
| 代理 | Vite dev server proxy | 前端 `/api/*` → `http://localhost:5131` |
| 图片/视频 | 真实网络资源 | 封面 picsum.photos、头像 i.pravatar.cc、播放源 Google 公开样例 MP4 |

## 目录结构

```
run-02/
├── package.json            # 根脚本（concurrently 一键起前后端）
├── README.md
├── server/                 # 后端 Express，端口 5131
│   └── src/
│       ├── index.js        # 入口
│       ├── routes/api.js   # 路由层
│       ├── services/videoService.js  # 服务层（筛选/分页/推荐/建议）
│       └── data/videos.js  # 数据层（30 条种子数据）
└── web/                    # 前端 React + Vite，端口 3131
    ├── vite.config.js      # 端口与 /api 代理配置
    └── src/
        ├── main.jsx / App.jsx
        ├── api.js          # API 封装
        ├── utils.js        # 播放量/时长/时间格式化
        ├── components/     # Navbar(菜单+搜索建议) / ChannelTabs / VideoCard
        ├── pages/          # Home(视频流) / Detail(播放页)
        └── styles.css
```

## 启动方式

```bash
# 1. 安装全部依赖（根 + server + web）
npm run install:all

# 2. 一键启动前后端（前端 http://localhost:3131，后端 http://localhost:5131）
npm run dev

# 或分别启动：
npm run dev:server   # 后端 5131
npm run dev:web      # 前端 3131
```

打开浏览器访问 **http://localhost:3131** 即可。

## API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 频道（分类）列表 |
| GET | `/api/videos?category=&keyword=&page=&pageSize=&sort=` | 视频流（分类筛选/搜索/分页/排序） |
| GET | `/api/videos/:id` | 视频详情 |
| GET | `/api/videos/:id/related` | 相关推荐 |
| GET | `/api/search/suggestions?keyword=` | 搜索建议 |
| POST | `/api/videos/:id/like` | 点赞（内存态自增） |

## 已实现交互

- **首页视频流**：响应式网格卡片（封面、时长角标、标题、UP主头像/昵称、播放量、弹幕数、发布时间），支持"加载更多"分页与"换一换"刷新推荐。
- **分类筛选**：顶部频道 Tab（首页/动画/游戏/科技/音乐/舞蹈/美食/生活/知识/时尚），切换即重新拉流；URL 携带 `?category=` 可直接分享。
- **hover 交互**：卡片悬浮抬升+阴影、封面缓慢放大、播放按钮浮层淡入、标题变粉；导航/Tab/按钮均有 hover 态。
- **菜单**：导航栏"分区"下拉菜单（hover 展开，点击直达对应分类）；头像 hover 展开个人中心菜单。
- **搜索建议**：输入防抖 200ms 请求 `/api/search/suggestions`，下拉面板支持鼠标点击、↑↓ 键选择、Enter 搜索、Esc 关闭、点击外部收起；搜索结果页显示命中数量并可一键清空。
- **详情跳转 + 实际播放**：点击卡片进入 `/video/:id`，HTML5 播放器加载真实 MP4（可播放/暂停/进度/全屏）；点赞（真实调 API）、关注、投币/收藏/分享按钮、简介展开收起、标签点击跳转搜索。
- **相关推荐**：详情页右侧栏按"同分类+同标签"打分推荐，紧凑卡片点击可跳转下一个视频。
- **返回首页**：详情页"← 返回首页"按钮、面包屑、以及点击左上角 logo 均可回到首页。

## 简化项说明

- 数据为 30 条内置种子数据（内存态），无真实数据库；点赞数存内存，重启后复位。
- 未实现登录/注册、真实弹幕、评论、无限滚动加载（以"加载更多"按钮代替）。
- 视频播放源为公开样例 MP4，与封面内容不对应（真实 B 站内容受版权保护无法使用）。
- 搜索建议基于标题/标签/UP主/分类的包含匹配，无拼音与热度排序模型。
