# Bilibili视频平台

一个基于Bilibili API开发的视频平台，支持视频播放、评论、弹幕等功能。

## 功能特性

### 核心功能
1. **视频播放** - 支持B站视频播放，可跳转到官网
2. **视频搜索** - 支持关键词搜索视频
3. **评论系统** - 查看和发送评论
4. **弹幕系统** - 查看和发送弹幕
5. **用户认证** - 平台用户注册和登录
6. **B站登录** - 支持二维码和账号密码登录B站
7. **收藏功能** - 收藏视频，查看个人收藏

### UI设计
- 采用Bilibili官方UI风格和颜色设计
- 全中文界面
- 响应式布局，支持移动端
- 现代化卡片式设计

## 技术栈

### 后端
- **Flask** - Web框架
- **Flask-SQLAlchemy** - ORM
- **Flask-Login** - 用户认证
- **Flask-SocketIO** - 实时通信
- **bilibili-api-python** - Bilibili API库
- **aiohttp/httpx** - 异步HTTP客户端

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript** - 交互逻辑
- **Bilibili风格CSS** - 官方配色方案

### 数据库
- **SQLite** - 轻量级数据库

## 安装和运行

### 环境要求
- Python 3.9+
- pip
- 虚拟环境（推荐）

### 安装步骤

1. **创建虚拟环境**
```bash
cd bilibili_platform
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **初始化数据库**
```bash
python run.py
```

4. **访问平台**
打开浏览器访问 http://localhost:5000

## 项目结构

```
bilibili_platform/
├── app.py                 # 主应用文件
├── run.py                 # 启动脚本
├── requirements.txt       # 依赖列表
├── config/
│   ├── __init__.py
│   └── settings.py        # 配置文件
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   └── bilibili_api.py # Bilibili API封装
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py        # 用户模型
│   ├── views/
│   │   ├── __init__.py
│   │   ├── main.py        # 主视图
│   │   ├── auth.py        # 认证视图
│   │   ├── video.py       # 视频视图
│   │   ├── comment.py     # 评论视图
│   │   ├── danmaku.py     # 弹幕视图
│   │   └── user.py        # 用户视图
│   └── utils/
│       ├── __init__.py
│       └── filters.py     # 模板过滤器
├── static/
│   ├── css/
│   │   ├── style.css      # 基础样式
│   │   └── bilibili.css   # Bilibili风格样式
│   ├── js/
│   │   └── main.js        # 主JavaScript文件
│   └── images/            # 图片资源
└── templates/
    ├── base.html          # 基础模板
    ├── index.html         # 首页
    ├── search.html        # 搜索页面
    ├── 404.html           # 404页面
    ├── 500.html           # 500页面
    ├── auth/
    │   ├── login.html     # 登录页面
    │   ├── register.html  # 注册页面
    │   ├── bilibili_qrcode.html    # B站二维码登录
    │   └── bilibili_password.html  # B站账号登录
    ├── video/
    │   └── detail.html    # 视频详情
    └── user/
        ├── profile.html   # 个人中心
        └── favorites.html # 收藏列表
```

## 使用说明

### 1. 用户注册和登录
- 访问首页，点击"注册"创建账号
- 登录后可以使用平台的所有功能

### 2. B站账号登录
- 在个人中心点击"B站登录"
- 选择二维码登录或账号密码登录
- 登录后可以发送评论和弹幕

### 3. 视频搜索
- 在搜索框输入关键词搜索视频
- 支持分页浏览搜索结果

### 4. 视频播放
- 点击视频卡片进入详情页
- 播放视频，查看弹幕和评论
- 可以发送弹幕和评论（需要B站登录）

### 5. 收藏功能
- 在视频详情页点击"收藏"按钮
- 在个人中心查看收藏列表

## API说明

### Bilibili API封装
项目使用`bilibili-api-python`库封装了B站API：

- **视频信息** - 获取视频详情、播放地址
- **弹幕系统** - 获取和发送弹幕
- **评论系统** - 获取和发送评论
- **用户信息** - 获取用户信息、收藏列表
- **搜索功能** - 搜索视频

### 平台API
平台提供了以下API接口：

- `/api/search` - 搜索视频
- `/api/video/<bvid>/info` - 视频信息
- `/api/video/<bvid>/playurl` - 播放地址
- `/api/video/<bvid>/danmaku` - 弹幕列表
- `/api/video/<bvid>/comments` - 评论列表
- `/api/comment/<bvid>/send` - 发送评论
- `/api/danmaku/<bvid>/<cid>/send` - 发送弹幕
- `/api/user/favorites` - 用户收藏
- `/api/bilibili/login/qrcode` - B站二维码登录
- `/api/bilibili/login/password` - B站账号登录

## 配置说明

### 环境变量
在`.env`文件中配置：

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///bilibili_platform.db
```

### 配置文件
`config/settings.py`中包含：

- 数据库配置
- 会话配置
- 文件上传配置
- Bilibili API配置

## 安全说明

### 用户认证
- 使用Flask-Login进行会话管理
- 密码使用Werkzeug加密存储
- CSRF保护

### B站账号安全
- B站登录凭据加密存储
- 支持二维码登录（更安全）
- 支持账号密码登录

### 数据安全
- SQL注入防护
- XSS防护
- 文件上传限制

## 开发说明

### 代码规范
- 使用Python 3.9+语法
- 遵循PEP 8规范
- 使用类型注解
- 添加必要的文档字符串

### 测试
- 单元测试
- 集成测试
- API测试

### 部署
- 使用Gunicorn生产部署
- 配置Nginx反向代理
- 使用SQLite数据库

## 常见问题

### 1. 无法连接B站API
- 检查网络连接
- 确认B站API服务正常
- 检查API调用频率限制

### 2. 视频无法播放
- 检查视频是否可用
- 确认播放地址有效
- 尝试刷新页面

### 3. 弹幕发送失败
- 确认已登录B站账号
- 检查B站账号状态
- 确认视频支持弹幕

## 更新日志

### v1.0.0
- 初始版本
- 基础视频播放功能
- 评论和弹幕系统
- 用户认证系统
- B站登录集成
- 收藏功能
- Bilibili风格UI

## 许可证

本项目仅供学习交流使用，遵循Bilibili API使用条款。

## 联系方式

如有问题，请通过GitHub Issues反馈。