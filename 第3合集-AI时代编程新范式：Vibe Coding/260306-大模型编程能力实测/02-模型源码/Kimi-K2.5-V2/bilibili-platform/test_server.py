#!/usr/bin/env python3
"""
测试服务器配置
"""
import sys
sys.path.insert(0, '/Users/xushaoyang/Desktop/开发能力测评/Kimi-K2.5-V2')

# 检查Python版本
print(f"Python版本: {sys.version}")

# 检查目录结构
from pathlib import Path
base = Path(__file__).parent

files_to_check = [
    "backend/config.py",
    "backend/auth_manager.py",
    "backend/api_server.py",
    "backend/mock_data.py",
    "frontend/index.html",
    "frontend/css/style.css",
    "frontend/js/app.js",
    "start.py",
]

print("\n文件结构检查:")
for f in files_to_check:
    path = base / f
    exists = path.exists()
    size = path.stat().st_size if exists else 0
    status = "✓" if exists else "✗"
    print(f"  {status} {f} ({size} bytes)")

# 测试配置导入
print("\n模块导入测试:")
try:
    from backend.config import BASE_DIR, VIDEO_PARTITIONS
    print(f"  ✓ config: BASE_DIR={BASE_DIR}, 分区数量={len(VIDEO_PARTITIONS)}")
except Exception as e:
    print(f"  ✗ config: {e}")

try:
    from backend.mock_data import MOCK_VIDEOS, MOCK_COMMENTS
    print(f"  ✓ mock_data: {len(MOCK_VIDEOS)}视频, {len(MOCK_COMMENTS['replies'])}评论")
except Exception as e:
    print(f"  ✗ mock_data: {e}")

try:
    from backend.auth_manager import AuthManager
    print(f"  ✓ auth_manager: AuthManager类可用")
except Exception as e:
    print(f"  ✗ auth_manager: {e}")

# 检查依赖
print("\n依赖检查:")
deps = ['fastapi', 'uvicorn', 'bilibili_api']
for dep in deps:
    try:
        __import__(dep)
        print(f"  ✓ {dep}")
    except ImportError:
        print(f"  ✗ {dep} (未安装)")

print("\n" + "="*50)
print("测试完成! 如果有依赖未安装，请运行:")
print("  pip install -r requirements.txt")
print("="*50)