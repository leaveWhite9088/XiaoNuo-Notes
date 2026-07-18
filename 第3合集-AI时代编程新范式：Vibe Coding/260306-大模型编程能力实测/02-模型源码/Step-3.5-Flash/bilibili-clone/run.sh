#!/bin/bash

# Bilibili Clone Startup Script

echo "=========================================="
echo "  Bilibili Clone - 启动中..."
echo "=========================================="

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
  echo "安装后端依赖..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "安装前端依赖..."
  cd frontend && npm install && cd ..
fi

# Copy .env.example if .env not exists
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
  echo "创建后端环境配置文件..."
  cp backend/.env.example backend/.env
  echo "请编辑 backend/.env 文件配置必要的环境变量"
fi

# Start backend
echo "启动后端服务 (端口 3001)..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "启动前端服务 (端口 5173)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait and keep script running
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait $BACKEND_PID
