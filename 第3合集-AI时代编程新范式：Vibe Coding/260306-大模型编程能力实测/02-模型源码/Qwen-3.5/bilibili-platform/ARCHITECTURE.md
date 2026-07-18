# 技术架构文档

## 系统架构概述

本项目采用经典的前后端分离架构，通过 RESTful API 进行通信。

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   React 前端    │◄───────►│  Express 后端   │◄───────►│  Bilibili API   │
│   (端口 3000)    │  HTTP   │   (端口 3001)    │  HTTP   │   (外部 API)     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                           │
       │                           │
       ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  LocalStorage   │         │  Express Session│
│   (用户状态)     │         │    (Cookie)     │
└─────────────────┘         └─────────────────┘
```

## 技术栈详解

### 前端技术栈

#### React 18
- **用途**: UI 框架
- **特性**: Hooks, Context API, Concurrent Features
- **文件**: `frontend/src/App.js`

#### React Router v6
- **用途**: 客户端路由
- **路由模式**: 
  - `/` - 首页
  - `/video/:bvid` - 视频播放页
  - `/favorites` - 收藏夹

#### Tailwind CSS
- **用途**: 原子化 CSS 框架
- **自定义主题**: B 站粉蓝配色
- **配置**: `frontend/tailwind.config.js`

#### React Player
- **用途**: 视频播放器
- **支持格式**: HLS, DASH, MP4
- **特性**: 进度控制、音量、播放状态

#### 自研弹幕引擎
- **文件**: `frontend/src/hooks/useDanmaku.js`
- **特性**:
  - 基于时间轴渲染
  - 防碰撞算法
  - 可配置透明度、字体、速度

### 后端技术栈

#### Node.js + Express
- **用途**: API 服务器
- **入口**: `backend/src/index.js`
- **中间件**:
  - CORS: 跨域支持
  - Cookie Parser: Cookie 解析
  - Express Session: 会话管理
  - JSON: 请求体解析

#### Bilibili API
- **用途**: 与 B 站官方 API 通信
- **封装**: `backend/src/utils/bilibili.js`
- **功能**:
  - 视频信息获取
  - 用户认证
  - 评论管理
  - 弹幕管理
  - 收藏管理

#### Axios Cookie Jar
- **用途**: 持久化 Cookie
- **场景**: 维持登录状态
- **存储**: Memory

## 数据流

### 视频播放流程

```
用户点击视频
    │
    ▼
前端：VideoPage 组件加载
    │
    ▼
调用 API: GET /api/videos/detail/:bvid
    │
    ▼
后端：Bilibili.getVideoDetail()
    │
    ▼
解析 HTML 获取 __INITIAL_STATE__
    │
    ▼
返回视频信息（标题、封面、URL 等）
    │
    ▼
前端：ReactPlayer 加载视频
    │
    ▼
同时：加载弹幕 GET /api/danmaku/:bvid
    │
    ▼
弹幕引擎解析 XML 并渲染
```

### 用户登录流程

```
用户点击登录
    │
    ▼
前端：打开登录模态框
    │
    ▼
调用 API: GET /api/user/login/qrcode
    │
    ▼
后端：Bilibili.getLoginQRCode()
    │
    ▼
返回二维码 URL 和 oauthKey
    │
    ▼
前端：显示二维码（qrcode.react）
    │
    ▼
用户用手机 B 站 APP 扫码
    │
    ▼
前端轮询：GET /api/user/login/status/:oauthKey
    │
    ▼
后端检查扫码状态
    │
    ▼
扫码成功，获取 Cookie
    │
    ▼
保存到 Session: req.session.cookies
    │
    ▼
前端刷新页面，用户已登录
```

### 发送弹幕流程

```
用户输入弹幕内容
    │
    ▼
点击发送按钮
    │
    ▼
检查登录状态
    │
    ▼
未登录 → 显示登录二维码
    │
    ▼
已登录 → 调用 API: POST /api/danmaku/send
    │
    │
    ├──→ 后端：Bilibili.sendDanmaku()
    │        │
    │        ▼
    │    发送到 B 站 API
    │        │
    │        ▼
    │    返回发送结果
    │
    └──→ 前端：立即渲染弹幕
             │
             ▼
         添加到 danmakuList
             │
             ▼
         弹幕引擎显示
```

## API 设计规范

### RESTful 风格

```
GET    /api/videos/:bvid      - 获取资源
POST   /api/comments/send     - 创建资源
PUT    /api/comments/like     - 更新资源
DELETE /api/favorites/remove  - 删除资源
```

### 响应格式

**成功响应:**
```json
{
  "success": true,
  "data": { ... }
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 状态码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未登录
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 安全设计

### CORS
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```
- 仅允许前端域名访问
- 支持 Cookie 跨域

### Session 管理
```javascript
app.use(session({
  secret: 'bilibili-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 86400000 }
}));
```
- 24 小时有效期
- HttpOnly Cookie

### Cookie 处理
- 不存储敏感信息
- 仅用于 API 会话维持
- 通过 Session 间接访问

## 性能优化

### 前端优化

1. **懒加载**: React.lazy + Suspense（未实现，可扩展）
2. **Memoization**: React.memo 防止重复渲染
3. **Debounce**: 搜索框防抖（未实现，可扩展）
4. **图片优化**: 懒加载 + 响应式图片

### 后端优化

1. **连接复用**: Axios 实例复用
2. **Cookie Jar**: 避免重复认证
3. **错误处理**: 统一错误中间件

### 弹幕优化

1. **时间轴渲染**: 按需创建弹幕元素
2. **自动清理**: 超 out of viewport 自动删除
3. **行分配算法**: 避免弹幕重叠

## 扩展性设计

### 模块化结构

```
routes/      - API 路由层
utils/       - 工具函数层
components/  - UI 组件层
pages/       - 页面层
hooks/       - 逻辑复用层
```

### 可扩展点

1. **新增分区**: 在 REGIONS 数组添加
2. **新增功能**: 添加对应 route + hook + component
3. **主题切换**: 扩展 tailwind.config.js
4. **国际化**: 添加 i18n 支持

## 监控与日志

### 前端日志
```javascript
console.error('加载视频失败:', error);
```

### 后端日志
```javascript
console.log(`🎬 Bilibili Backend Server running on http://localhost:${PORT}`);
```

### 错误处理
```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});
```

## 部署方案

### 开发环境
- 前后端分离启动
- Hot Reload 支持

### 生产环境（建议）

1. **前端构建**:
```bash
cd frontend
npm run build
```

2. **后端部署**:
```bash
NODE_ENV=production node src/index.js
```

3. **静态文件服务**:
```javascript
app.use(express.static('frontend/build'));
```

4. **进程管理**: PM2
```bash
pm2 start src/index.js --name bilibili-api
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 后端端口 | 3001 |
| NODE_ENV | 运行环境 | development |
| BILIBILI_SESSDATA | B 站登录凭证 | - |
| BILIBILI_BUVID3 | B 站设备 ID | - |

## 测试策略（未实现）

### 单元测试
- Jest + React Testing Library
- API 路由测试

### 集成测试
- 登录流程测试
- 视频播放测试
- 弹幕发送测试

### E2E 测试
- Cypress
- 完整用户流程

## 未来规划

### Phase 1 (已实现)
- ✅ 视频播放
- ✅ 弹幕系统
- ✅ 评论功能
- ✅ 用户登录
- ✅ 收藏功能

### Phase 2 (计划)
- ⏳ 视频上传
- ⏳ 个人中心
- ⏳ 消息通知
- ⏳ 关注系统
- ⏳ 历史记录

### Phase 3 (愿景)
- ⏳ 直播功能
- ⏳ 专栏文章
- ⏳ 活动页面
- ⏳ 会员购

---

**架构版本**: v1.0.0
**最后更新**: 2024-01-01
