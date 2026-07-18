@echo off
echo 🎬 启动 Bilibili 平台...

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：需要安装 Node.js
    pause
    exit /b 1
)

echo 📦 启动后端服务器...
cd backend
if not exist node_modules (
    echo ⏳ 安装后端依赖...
    call npm install
)

if not exist .env (
    copy .env.example .env
    echo ✅ 创建了.env 文件
)

start "Bilibili Backend" cmd /k "npm run dev"
set BACKEND_PID=%!

echo 🎨 启动前端应用...
cd ..\frontend
if not exist node_modules (
    echo ⏳ 安装前端依赖...
    call npm install
)

start "Bilibili Frontend" cmd /k "npm start"
set FRONTEND_PID=%!

echo.
echo 🎉 平台启动成功!
echo 📺 后端 API: http://localhost:3001
echo 🌐 前端界面：http://localhost:3000
echo.
echo 已打开两个窗口，请保持运行
echo 关闭窗口可停止对应服务
pause
