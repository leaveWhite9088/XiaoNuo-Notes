# 快速开始指南

## 📋 前提条件

请确保你的系统已安装:
- Node.js 16+ 
- npm 8+

检查版本:
```bash
node --version
npm --version
```

## 🚀 一键启动

### macOS / Linux
```bash
./start.sh
```

### Windows
```bat
start.bat
```

首次运行会自动安装所有依赖（可能需要几分钟）。

## 🎯 访问应用

启动成功后:
- 打开浏览器访问：http://localhost:3000
- 后端 API 地址：http://localhost:3001/api

## 📱 功能使用

### 1. 浏览视频
- 首页展示推荐视频
- 点击分区切换不同类型视频
- 点击视频卡片进入播放页面

### 2. 视频播放
- 支持播放/暂停
- 进度条拖动
- 音量调节
- 弹幕开关

### 3. 登录
- 点击"登录发弹幕"按钮
- 使用哔哩哔哩 APP 扫码
- 扫码成功自动登录

### 4. 发送弹幕
- 登录后点击"发弹幕"
- 输入内容并回车
- 弹幕实时显示

### 5. 评论互动
- 滚动到页面底部
- 输入评论内容
- 可回复他人评论
- 可点赞评论

### 6. 收藏视频
- 点击"收藏"按钮
- 选择收藏夹
- 在"我的收藏"页面查看

## 🔧 手动安装

如果启动脚本无法运行:

### 安装后端
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 安装前端
```bash
cd frontend
npm install
npm start
```

## 🐛 常见问题

### 端口被占用
如果 3000 或 3001 端口被占用:
- 前端：修改 `frontend/package.json` 的 start 脚本添加 `PORT=3002`
- 后端：修改 `backend/.env` 的 PORT 值

### 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重装
rm -rf node_modules package-lock.json
npm install
```

### 视频无法播放
- 部分视频因版权限制无法播放
- 尝试其他视频
- 检查网络连接

### 扫码登录失败
- 确保使用最新版哔哩哔哩 APP
- 检查手机网络
- 刷新二维码重试

## 📝 环境变量

在 `backend/.env` 中可以配置:

```env
PORT=3001                    # 后端端口
NODE_ENV=development         # 运行环境
BILIBILI_SESSDATA=xxx        # B 站登录凭证（可选）
BILIBILI_BUVID3=xxx          # B 站设备 ID（可选）
```

## 🎨 自定义样式

前端使用 Tailwind CSS:
- 配置文件：`frontend/tailwind.config.js`
- 样式文件：`frontend/src/styles/index.css`
- B 站主题色：粉色 #FB7299，蓝色 #00AEEC

## 📖 API 文档

查看完整的 API 端点请阅读 [README.md](./README.md#-api-端点)

## 💡 开发提示

### 热重载
- 前端：修改代码自动刷新
- 后端：使用 nodemon 自动重启

### 调试
打开浏览器开发者工具查看:
- Console 日志
- Network 请求
- React DevTools

## 🎉 开始使用

现在你已经准备好使用 Bilibili 视频平台了！

访问 http://localhost:3000 开始体验吧！

---

哔哩哔哩 (゜-゜) つロ 干杯~
