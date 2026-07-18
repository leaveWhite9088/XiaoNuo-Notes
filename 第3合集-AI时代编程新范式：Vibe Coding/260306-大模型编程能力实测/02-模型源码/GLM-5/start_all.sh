#!/bin/bash

# 启动所有服务
echo "正在启动 Bilibili 平台..."

# 启动后端
echo "启动后端服务..."
cd backend
source venv/bin/activate 2>/dev/null || true
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "启动前端服务..."
cd ../frontend
npm install -q
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================="
echo "  Bilibili 平台启动成功！"
echo "====================================="
echo ""
echo "  前端地址: http://localhost:5173"
echo "  后端地址: http://localhost:8000"
echo "  API文档:  http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待任意子进程结束
wait $BACKEND_PID $FRONTEND_PID
