#!/bin/bash

echo "🎬 启动 Bilibili 平台..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要安装 Node.js"
    exit 1
fi

# 启动后端
echo "📦 启动后端服务器..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "⏳ 安装后端依赖..."
    npm install
fi

# 创建.env 文件
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 创建了.env 文件，请编辑.bilibili-platform/backend/.env 配置登录信息（可选）"
fi

# 在后台启动后端
npm run dev &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"

# 启动前端
echo "🎨 启动前端应用..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "⏳ 安装前端依赖..."
    npm install
fi

# 启动前端
npm start &
FRONTEND_PID=$!
echo "✅ 前端应用已启动 (PID: $FRONTEND_PID)"

echo ""
echo "🎉 平台启动成功!"
echo "📺 后端 API: http://localhost:3001"
echo "🌐 前端界面：http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待进程
wait
