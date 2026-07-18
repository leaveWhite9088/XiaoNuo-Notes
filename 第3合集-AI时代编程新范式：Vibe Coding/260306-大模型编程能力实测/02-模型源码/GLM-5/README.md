# Bilibili 视频平台

一个基于 Vue 3 + FastAPI + bilibili-api 构建的 Bilibili 视频平台客户端。

## 功能特性

### 视频功能
- 🎬 热门视频推荐
- 🔍 视频搜索
- 📺 视频播放（支持多P切换）
- 🔗 跳转到 Bilibili 官网观看
- 📋 显示视频详细信息（播放量、弹幕数、点赞数等）
- 🏷️ 视频标签展示

### 弹幕功能
- 💬 查看视频弹幕
- ✍️ 发送弹幕（需登录）
- 🎚️ 弹幕开关控制

### 评论功能
- 📝 查看视频评论
- 💭 发表评论（需登录）
- 👍 评论点赞（需登录）

### 用户功能
- 📱 二维码扫码登录
- 🍪 Cookie 登录
- ❤️ 收藏视频（需登录）
- 📁 查看收藏夹（需登录）
- 📜 观看历史（需登录）
- 🚪 退出登录

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **CSS Variables** - 主题系统

### 后端
- **Python 3.10+** - 编程语言
- **FastAPI** - 高性能 Web 框架
- **bilibili-api** - Bilibili API 封装库
- **Pydantic** - 数据验证

## 项目结构

```
.
├── backend/                  # 后端代码
│   ├── api/                 # API 路由
│   │   ├── auth.py         # 认证接口
│   │   ├── video.py        # 视频接口
│   │   ├── comment.py      # 评论接口
│   │   ├── danmaku.py      # 弹幕接口
│   │   └── user.py         # 用户接口
│   ├── core/               # 核心配置
│   ├── models/             # 数据模型
│   ├── services/           # 业务逻辑
│   ├── main.py             # 应用入口
│   └── requirements.txt    # Python 依赖
│
├── frontend/                # 前端代码
│   ├── src/
│   │   ├── api/           # API 调用
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   ├── types/         # TypeScript 类型
│   │   └── views/         # 页面视图
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── start_backend.sh        # 启动后端
├── start_frontend.sh       # 启动前端
└── start_all.sh           # 启动所有服务
```

## 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+
- npm 或 yarn

### 安装与运行

1. **克隆项目**
```bash
git clone <repository-url>
cd GLM5
```

2. **方式一：使用启动脚本（推荐）**
```bash
chmod +x start_all.sh
./start_all.sh
```

3. **方式二：分别启动**

启动后端：
```bash
cd backend
pip install -r requirements.txt
python main.py
```

启动前端：
```bash
cd frontend
npm install
npm run dev
```

4. **访问应用**
- 前端页面: http://localhost:5173
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 登录方式

### 方式一：扫码登录
1. 点击页面右上角的「登录」按钮
2. 使用 Bilibili APP 扫描二维码
3. 在手机上确认登录

### 方式二：Cookie 登录
1. 在浏览器中打开 bilibili.com 并登录
2. 按 F12 打开开发者工具
3. 切换到 Application（应用程序）标签
4. 在 Cookies 中找到 bilibili.com
5. 复制 SESSDATA 和 bili_jct 的值
6. 在登录页面填入并提交

## UI 设计

采用 Bilibili 官方设计风格：
- **主题色**: #FB7299（Bilibili 粉）
- **辅助色**: #00A1D6（链接蓝）
- **圆角设计**: 8px/12px
- **阴影效果**: 多层次阴影系统
- **全中文界面**

## 注意事项

1. 本项目仅供学习和研究使用
2. 请遵守 Bilibili 的用户协议和 API 使用规范
3. 不要频繁请求 API，以免被限制访问
4. Cookie 登录方式需要定期更新凭证

## 许可证

MIT License
