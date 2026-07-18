# Bili Portal

基于 `bilibili-api-python` 搭建的 Bilibili 风格视频平台，包含前后端完整实现。

## 已实现功能

- 视频播放：内嵌 Bilibili 官方播放器，支持跳转官网视频页。
- 信息展示：热门视频、搜索结果、视频详情、统计数据、评论区、弹幕流。
- 登录能力：二维码登录，持久化保存登录凭据。
- 登录后能力：发送评论、发送弹幕、查看自己的收藏夹内容。
- 中文界面：整体采用 Bilibili 粉白蓝视觉风格，全部中文布局。

## 技术栈

- 前端：`React 19` + `TypeScript` + `Vite`
- 后端：`FastAPI` + `bilibili-api-python`

## 目录结构

```text
backend/
  app/
    config.py
    main.py
    service.py
  requirements.txt
frontend/
  src/
    App.tsx
    App.css
    lib/api.ts
    types/api.ts
```

## 启动方式

### 1. 启动后端

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://127.0.0.1:5173`，并通过 Vite 代理访问后端 `/api`。

## 说明

- 登录凭据默认保存在 `backend/data/credential.json`。
- 后端已自动处理 `bilibili-api-python` 在部分 macOS 环境下的 SSL 证书路径问题。
- 部分视频可能关闭弹幕或不可见，接口会返回友好状态，不会导致前端整体崩溃。
