# B 站首页复刻 · V0 / Review 1 修复

本项目由本轮唯一 Dev 独立实现，未调用子代理或其他模型。参考已有了解中的 B 站桌面首页形态：风景横幅、白色顶栏文字、频道矩阵、左侧双行轮播、视频卡片流、粉色投稿按钮与蓝色交互强调。并非当前官网的逐像素快照。

## 启动

要求 Node.js 22.12+，推荐本次验证环境 Node.js 22.22.2。

```bash
npm ci --legacy-peer-deps
npm run dev
```

- 前端：http://localhost:3302
- 后端：http://localhost:5302
- 健康检查：http://localhost:5302/api/health
- Vite 将 `/api` 代理到 `http://127.0.0.1:5302`。
- 端口固定；3302 已占用时直接报错，不自动递增。5302 被占用时后端也会报错。
- `npm run dev` 同时启动前后端；Ctrl+C 结束二者。
- 首次安装使用 `--legacy-peer-deps`，规避本次 npm 10 的依赖解析异常；项目显式声明了测试所需依赖。

单独运行：

```bash
npm run dev:server
npm run dev:web
```

构建与预览（预览时仍需后端 5302 在运行）：

```bash
npm run build
npm run preview
```

预览固定 3302，使用与开发一致的 API 代理。不要同时启动开发前端和预览前端。

## 技术栈与目录

React 18 + React Router 7 + Vite 7；Node.js + Express 5；Lucide 图标；Vitest 4 + Testing Library + jsdom。

```text
src/
  main.jsx                 React 入口与 BrowserRouter
  App.jsx                  首页、导航、搜索、卡片、详情与弹窗组件
  style.css                桌面/平板/移动端布局与 hover 状态
server/
  index.js                 后端启动，固定 5302
  app.js                   HTTP 路由层
  services/video-service.js 搜索、分类、分页、详情与关联视频逻辑
  data/videos.js           独立演示数据层，24 条视频和 3 张轮播
public/
  images/                  24 张真实摄影封面和 1 张横幅
  media/                   两段可实际播放的 H.264/AAC MP4 样片
  fallback.svg             图片失败占位
scripts/download-images.mjs 图片重新下载工具
tests/
  flow.test.jsx            通过真实 API 的 React 交互测试
  review1.test.jsx         竞态、草稿隔离、历史恢复、焦点与入口回归
  setup.js                 jsdom 测试环境
  api.mjs                  HTTP、数据、图片、媒体 Range 验证
artifacts/review1/           浏览器断言 JSON、截图与本轮自检记录
scripts/browser-review1.mjs 可重放的真实浏览器回归
vite.config.js             3302 前端端口与 5302 代理
```

数据查询流：React → `/api` → Express 路由 → service → data。前端不直接导入后端视频数据。演示用户状态使用 localStorage，与公共视频查询分开。

## 已实现交互

- 首页 24 条视频，首次 20 条，点击加载剩余；换一换调整展示顺序。
- 三张轮播，自动切换、左右按钮、圆点切换、悬停暂停，点击按主题筛选。
- 卡片悬停放大、播放图标、标题变色；点击跳转 `/video/:id`。
- 顶部菜单支持悬停与点击展开，菜单内容可以跳转到对应分类。窄屏通过功能菜单访问收藏、历史等入口，“更多”包含全部 23 个分区（含全部）。
- 搜索建议由后端生成，支持上下键选择、回车提交、Escape 关闭、清空输入；关键词保存在 URL。
- 分类筛选、空结果提示、失败重试；分类状态保存在 URL。当前应用会话中，浏览器后退恢复该历史条目的列表范围、换一换顺序和滚动位置。硬刷新重新请求列表。
- 详情页原生视频控件支持实际播放、暂停、音量、进度拖动、全屏；卡片封面和头像失败时替换为占位图，不提供图片重试按钮；媒体加载失败时单独提供“重新加载”。播放器海报由浏览器显示，海报失败不触发媒体错误弹层。
- 点赞、收藏与取消收藏、观看历史、本地评论、昵称、本地反馈；支持弹幕发送与开关（重复文本也会重新展示）、链接分享、当前详情内关注切换。切换视频会清空未发送的评论和弹幕草稿。
- 关联视频跳转、返回首页、回到顶部、弹窗 Escape 关闭与焦点约束。

## 简化项

- 这是演示复刻，无 B 站账号、真实推荐服务或数据库；标题、播放量、作者、卡片时长均为演示数据。
- 播放器明确标注播放的是公开样片，与演示标题不一一对应；真实时长由播放器显示。Sintel 约 52.21 秒，Flower 约 5.06 秒。
- 投稿、创作中心、会员购买、客户端、消息与动态提供说明弹窗，不连接真实服务，也不执行支付或上传。
- 昵称、点赞、收藏、历史、评论和反馈仅保存在当前浏览器；弹幕只在当前页面显示；关注状态仅在当前详情期间有效。
- 部分分类暂无演示视频，显示可返回推荐的空状态。专栏、直播等辅助入口归入相关演示分类。
- 作者头像使用外部头像服务，失败时有占位；首页全部摄影封面、横幅及视频样片均随项目本地提供。
- Review 1 修复已通过真实 Chromium 浏览器检查：1440px / 375px 布局、hover/菜单、详情直达与返回、原生视频控件播放/暂停/进度条拖动，以及全部指定回归。未验证其他浏览器或真实移动设备；未人工听辨音轨内容。

## 自检

先保持 `npm run dev` 运行，在另一个终端执行：

```bash
npm run build
npm test
npm run check:api
npm audit
```

`npm test` 覆盖首页、轮播、加载更多、分类、搜索建议、详情路由、播放器配置、收藏/取消收藏、评论、弹幕、历史、返回首页、菜单、空结果、404、昵称和播放失败反馈。常规链路使用 3302 前端代理连接真实 5302 后端。竞态回归对真实响应施加受控延迟，并刻意忽略取消信号，以验证晚到响应仍会被丢弃。共 14 项测试通过；jsdom 的滚动模拟和播放器属性断言不作为浏览器播放证据。

`npm run check:api` 验证端口代理、24 条数据、两页不重复、分类与关键词结果、搜索建议、详情与 8 条关联视频、404、详情直接访问、首屏 6 张图片及两段 MP4 的 `206 Partial Content` 和实际 1024 字节响应。

本轮还使用本机 FFprobe 确认两段视频为 H.264 + AAC，并用 FFmpeg 对两段文件完整解码，均退出 0。这些工具不是运行项目的依赖。

## Review 1 真实浏览器自检

保持前后端运行，安装了 ego-browser 的环境可执行：

```bash
npm run check:browser
```

脚本创建一个浏览器任务空间，用真实鼠标、键盘、原生视频控件及 DOM 断言验证 13 组检查，成功后关闭该空间。原生进度条坐标按本轮 Chromium 控件布局计算，其他浏览器可能需要调整。开发阶段使用同一空间分段执行时可设置 `BILI_TASK_SPACE` 和 `BILI_CHECK_FROM`，随后由调用者关闭空间。

证据位于 [Review 1 修复记录](REVIEW1_FIXES.md)、[浏览器断言结果](artifacts/review1/browser-results.json) 和 `artifacts/review1/*.png`。Sintel 实测拖动到 31.57 秒，Flower 实测拖动到 3.06 秒；均保持暂停、时间稳定且播放器无媒体错误。

本轮还分别制造不存在的图片与视频 URL：图片变为占位图且不弹媒体错误；视频出现错误层，恢复有效媒体地址后点击重新加载能恢复就绪。

## 素材来源

摄影图片来自 [Unsplash 图片服务](https://images.unsplash.com/)，原始照片 ID 保存在文件名中，可通过 `node scripts/download-images.mjs` 重新获取。

- [Sintel 预告片，W3C 媒体示例](https://media.w3.org/2010/05/sintel/trailer.mp4)，原作品由 Blender Foundation 制作。
- [Flower，MDN CC0 视频示例](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)。

Review 1 修复完成后停止开发，等待同一外部唯一 Reviewer 重审。
