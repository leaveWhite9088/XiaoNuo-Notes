# 哔哩哔哩首页复刻

React + Vite 前端、Express 后端与独立 JSON 数据层构成的本地可运行演示。包含真实首页横幅、轮播图片和视频封面，全部素材已经保存到项目内。

## 启动

```bash
npm install
npm run dev
```

- 前端：http://127.0.0.1:3301（也可使用 http://localhost:3301）
- 后端：http://127.0.0.1:5301
- 前端 `/api` 和 `/media` 统一代理到 `http://127.0.0.1:5301`。
- 监听地址固定为 IPv4 `127.0.0.1`。启动脚本检查两个端口，任一占用就以非零状态退出，不改端口、不改为 IPv6。Vite 同时启用 `strictPort`。
- `npm start` 与 `npm run dev` 相同；Ctrl+C 一并停止两个服务。
- 可分别执行 `npm run dev:backend`、`npm run dev:frontend`，地址和端口保持一致。

## 已实现

- 响应式首页、真实横幅、自动与手动轮播、视频流、换一换、加载更多。
- 卡片 hover 放大、播放提示、稍后再看按钮。
- 搜索建议、点击建议搜索、回车搜索、关键词结果、空状态。
- 分类筛选、热门排序、最新排序；没有演示数据的频道显示空状态，可返回推荐。
- 详情跳转、详情直接打开与刷新、返回首页、关联视频跳转。
- HTML5 实际视频播放、原生进度拖动、音量、暂停与全屏；后端支持 HTTP Range。
- 弹幕开关与发送、点赞、演示投币、收藏、观看历史、分享链接、本地评论。
- 顶部菜单、登录说明、投稿说明、意见反馈、返回顶部。

收藏、观看历史、点赞、投币和评论保存在当前浏览器的 localStorage。关注只用于当前页面交互演示。登录、投稿和客户端下载会给出明确的本地演示说明，不连接真实账户或上传服务。

## 分层

```text
src/
  main.jsx             React 页面、路由与组件
  api.js               HTTP 请求封装
  styles.css           桌面与移动端样式
server/
  index.js             API 路由、静态媒体与固定监听端口
  services/catalog.js  搜索、筛选、排序、分页与推荐查询
  data/videos.json     视频目录
  data/banners.json    轮播目录
public/media/          本地真实图片与 MP4
scripts/
  start.mjs            双端口检查与服务生命周期管理
  check.mjs            接口及媒体主链路自检
  assets.py            素材下载脚本（正常运行无需执行）
artifacts/             自检记录与页面截图
```

业务数据与查询规则放在后端。前端只保留频道展示顺序、路由状态和本地交互状态。页面通过 API 获取视频，不直接读取服务端 JSON。

## 验证

保持 `npm run dev` 运行，在另一终端执行：

```bash
npm run check
npm run build
```

`check` 验证健康检查、首页、视频列表、分类、搜索、建议、空结果、分页、详情、404、全部封面、MP4 Range 和详情直达，共 13 项。浏览器人工自动化验证记录见 `artifacts/verification.md`。

`npm run build` 生成 `dist/`。默认启动命令运行 Vite 开发服务和 Express；不使用没有后端代理的静态文件直开方式。

## 素材与范围

B 站横幅、Logo、轮播和前十条封面来自本次访问的 [B 站公开首页](https://www.bilibili.com/)，来源地址记录于 `reference-data.json` 和 `scripts/assets.py`。补充摄影图片来自 [Unsplash](https://unsplash.com/)，下载地址记录于 `scripts/assets.py`。

所有详情播放本地 [MDN CC0 花卉示例视频](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)，用于验证真实播放，并非封面对应的 B 站原片。详情页同样展示此说明。目录中的播放量、时长属于首页展示数据，不代表五秒示例片的元数据。

本项目为本地页面与交互复刻，不是哔哩哔哩官方网站，不接入其账户、付费、推荐或投稿系统。
