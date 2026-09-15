# B 站首页复刻

一个可运行的 B 站首页交互复刻。前端使用 React、Vite 与 React Router，后端使用 Express，视频数据独立存放在 `server/data`。所有封面、横幅和播放视频均为本地静态素材。

## 启动

```bash
npm install
npm run dev
```

- 前端：http://localhost:3402
- 后端：http://localhost:5402
- 健康检查：http://localhost:5402/api/health

`npm run dev` 会同时启动前后端，Vite 将 `/api` 请求代理到 5402 端口。

## 可用功能

- 首页推荐视频流与换一换
- 卡片悬停反馈和稍后再看入口
- 顶部菜单、登录悬浮菜单
- 搜索热词、实时搜索建议与结果页
- 分类筛选
- 视频详情跳转、相关视频切换、返回首页
- HTML5 视频实际播放。当前所有条目明确使用同一个 5.055 秒演示片段，数据接口、卡片时长和详情提示统一显示 `00:05`
- 点赞、关注和弹幕开关等局部交互

## 自检

```bash
npm run check
```

该命令会先运行 Vitest 回归测试，再构建前端。测试覆盖“分类后发起全站搜索”以及详情 A→B→C 请求乱序与状态重置。

## 验证生产构建

先构建前端：

```bash
npm run build
```

然后分别启动后端和本地构建预览：

```bash
npm start
npm run preview
```

本地预览保持前端 3402、后端 5402，并将 `/api` 代理到后端。需要依次验证：

- 打开 `http://localhost:3402/`；
- 从首页进入任意 `/video/:id` 详情；
- 在详情地址直接刷新，页面仍由 `index.html` 接管并恢复详情内容。

## 正式部署要求

`dist` 是静态前端产物，`npm start` 只启动 5402 端口的 API。正式静态服务器必须同时配置两项规则：

1. 将 `/api` 反向代理到 `http://127.0.0.1:5402`；
2. 未命中真实静态文件的路径回退到 `/index.html`，否则 BrowserRouter 的 `/video/:id` 刷新会返回 404。

以下是前端固定监听 3402 的 Nginx 示例，其中 `/绝对路径/dist` 需要替换为实际目录：

```nginx
server {
    listen 3402;
    root /绝对路径/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5402;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> 本项目仅用于界面复刻练习，与哔哩哔哩官方无关。素材来自 Unsplash 与 MDN CC0 示例视频。
