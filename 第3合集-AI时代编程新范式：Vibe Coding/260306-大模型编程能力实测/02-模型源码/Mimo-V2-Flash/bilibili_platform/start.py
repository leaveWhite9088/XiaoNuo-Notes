#!/usr/bin/env python3
import os
import sys

if __name__ == "__main__":
    print("启动Bilibili平台...")
    print("=" * 50)

    try:
        from app import create_app, init_db

        app = create_app("development")

        print("初始化数据库...")
        with app.app_context():
            init_db()

        print("数据库初始化完成")
        print("=" * 50)
        print("Bilibili平台启动成功！")
        print("访问地址: http://localhost:5000")
        print("按 Ctrl+C 停止服务器")
        print("=" * 50)

        app.run(host="0.0.0.0", port=5000, debug=True)

    except Exception as e:
        print(f"启动失败: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
