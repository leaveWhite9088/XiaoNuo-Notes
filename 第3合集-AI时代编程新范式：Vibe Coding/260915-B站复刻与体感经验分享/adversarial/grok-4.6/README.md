# 哔哩哔哩首页 MVP

仿当前 B 站网页版首页（顶栏 + banner + 分区频道 + 推荐视频流）和视频播放页。

## 技术栈

- 前端：React 18 + Vite + React Router
- 后端：Node.js + Express
- 数据：本地 JSON 风格数据层（`server/src/data`）

## 启动

在项目根目录执行：

```bash
npm run install:all
npm run dev
```

然后打开 http://127.0.0.1:5173

- 前端开发服务：`http://127.0.0.1:5173`
- 后端 API：`http://127.0.0.1:3001`

分开启动也可以：

```bash
npm run start:server
npm run start:client
```
