#!/bin/bash

echo "🔍 检查 Bilibili 平台安装..."
echo ""

# 检查 Node.js
echo "1️⃣ 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js 已安装：$NODE_VERSION"
else
    echo "   ❌ Node.js 未安装"
    echo "   请前往 https://nodejs.org 下载安装"
    exit 1
fi

# 检查 npm
echo "2️⃣ 检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm 已安装：$NPM_VERSION"
else
    echo "   ❌ npm 未安装"
    exit 1
fi

# 检查项目结构
echo "3️⃣ 检查项目结构..."
check_file() {
    if [ -f "$1" ]; then
        echo "   ✅ $2"
        return 0
    else
        echo "   ❌ $2 缺失"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "   ✅ $2"
        return 0
    else
        echo "   ❌ $2 缺失"
        return 1
    fi
}

check_dir "backend" "后端目录"
check_dir "frontend" "前端目录"
check_dir "backend/src" "后端源码"
check_dir "frontend/src" "前端源码"

check_file "backend/package.json" "后端配置文件"
check_file "frontend/package.json" "前端配置文件"
check_file "backend/src/index.js" "后端入口"
check_file "frontend/src/App.js" "前端入口"

# 检查依赖
echo "4️⃣ 检查依赖安装..."

if [ -d "backend/node_modules" ]; then
    echo "   ✅ 后端依赖已安装"
else
    echo "   ⚠️  后端依赖未安装"
    echo "   运行：cd backend && npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo "   ✅ 前端依赖已安装"
else
    echo "   ⚠️  前端依赖未安装"
    echo "   运行：cd frontend && npm install"
fi

# 检查端口
echo "5️⃣ 检查端口占用..."
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "   ⚠️  端口 $1 被占用"
        return 1
    else
        echo "   ✅ 端口 $1 可用"
        return 0
    fi
}

check_port 3000
check_port 3001

echo ""
echo "================================"
echo "✨ 检查完成！"
echo ""

# 判断是否可以启动
can_start=true

if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  需要先安装依赖"
    echo ""
    echo "安装命令:"
    echo "  cd backend && npm install"
    echo "  cd frontend && npm install"
    echo ""
    echo "或者使用一键启动:"
    echo "  ./start.sh"
    echo ""
    can_start=false
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 被占用，请先停止占用进程或修改配置"
    can_start=false
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3001 被占用，请先停止占用进程或修改配置"
    can_start=false
fi

if [ "$can_start" = true ]; then
    echo "🎉 一切就绪！可以启动项目了"
    echo ""
    echo "启动命令:"
    echo "  ./start.sh"
    echo ""
    echo "或手动启动:"
    echo "  后端：cd backend && npm run dev"
    echo "  前端：cd frontend && npm start"
    echo ""
    echo "访问地址:"
    echo "  http://localhost:3000"
fi

echo "================================"
