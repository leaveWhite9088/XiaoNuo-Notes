#!/usr/bin/env python3
"""
Bilibili视频平台启动脚本
"""
import sys
import subprocess
import os

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import fastapi
        import bilibili_api
        print("✓ 依赖检查通过")
        return True
    except ImportError:
        print("✗ 依赖未安装，正在安装...")
        return False

def install_dependencies():
    """安装依赖"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "-q"])
        print("✓ 依赖安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ 依赖安装失败: {e}")
        return False

def main():
    """主函数"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 50)
    print("Bilibili视频平台启动器")
    print("=" * 50)
    
    # 检查/安装依赖
    if not check_dependencies():
        if not install_dependencies():
            print("请手动运行: pip install -r requirements.txt")
            sys.exit(1)
    
    print("\n正在启动服务...")
    print("服务地址: http://localhost:8080")
    print("按 Ctrl+C 停止服务\n")
    
    # 启动服务
    try:
        from backend.api_server import app
        import uvicorn
        uvicorn.run(
            "backend.api_server:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n服务已停止")
    except Exception as e:
        print(f"\n启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()