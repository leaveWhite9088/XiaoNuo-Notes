#!/usr/bin/env python3
import os
import sys

if __name__ == "__main__":
    print("=" * 60)
    print("Bilibili平台启动脚本")
    print("=" * 60)

    try:
        from app import create_app, init_db

        print("1. 创建Flask应用...")
        app = create_app("development")

        print("2. 初始化数据库...")
        with app.app_context():
            init_db()

        print("3. 数据库初始化完成")
        print("=" * 60)
        print("✅ Bilibili平台启动成功！")
        print("访问地址: http://localhost:5000")
        print("按 Ctrl+C 停止服务器")
        print("=" * 60)

        app.run(host="0.0.0.0", port=5002, debug=True)

    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
