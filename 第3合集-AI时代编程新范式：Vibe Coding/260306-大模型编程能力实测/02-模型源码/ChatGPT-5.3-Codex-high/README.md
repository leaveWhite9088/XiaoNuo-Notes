# Bilibili 视频平台（基于 bilibili-api）

一个可直接运行的中文 B 站风格平台，支持：

- 播放视频、跳转官网、展示视频信息与热门推荐
- 查看评论与弹幕
- 账号登录（Cookie 或二维码）
- 登录后发送评论、发送弹幕、查看自己的收藏视频

## 1. 环境要求

- Python 3.11+（推荐 3.12）

## 2. 安装依赖

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. 启动

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

打开：`http://127.0.0.1:8000`

## 4. 配置

复制 `.env.example` 为 `.env`（可选），关键参数：

- `BILI_VERIFY_SSL`：是否校验 SSL 证书。某些本地环境证书链异常时可设为 `false`。
- `BILI_TIMEOUT_SECONDS`：请求超时秒数。

## 5. 目录结构

```text
app/
  main.py                # FastAPI 入口与路由
  models.py              # 请求模型
  services/
    bili_client.py       # bilibili-api 封装
    auth_store.py        # 登录凭据与二维码会话管理
templates/
  index.html             # 中文 UI 页面
static/
  style.css              # B 站风格样式
  app.js                 # 前端交互逻辑
data/
  credential.json        # 登录凭据持久化（自动生成）
```

## 6. 说明

- 为了让应用一次启动即能运行，后端默认 `BILI_VERIFY_SSL=false`，以兼容证书链缺失的开发机。
- `data/credential.json` 保存的是你的登录凭据，请勿提交到公共仓库。

