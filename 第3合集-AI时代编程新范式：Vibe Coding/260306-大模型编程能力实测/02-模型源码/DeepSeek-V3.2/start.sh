#!/bin/bash

# Bilibili视频平台启动脚本

echo "=== Bilibili视频平台启动 ==="
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查依赖
if [ ! -f "requirements.txt" ]; then
    echo "❌ 未找到requirements.txt文件"
    exit 1
fi

echo "📦 检查依赖..."
if pip install -r requirements.txt; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "🚀 启动Bilibili视频平台..."
echo "访问地址: http://localhost:8000"
echo ""

# 启动应用
uvicorn main:app --host 0.0.0.0 --port 8000 --reload