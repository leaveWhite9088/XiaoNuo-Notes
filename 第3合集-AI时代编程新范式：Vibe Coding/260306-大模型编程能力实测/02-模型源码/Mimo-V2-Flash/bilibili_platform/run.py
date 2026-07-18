#!/usr/bin/env python3
import os
import sys

if __name__ == "__main__":
    from app import create_app, init_db

    app = create_app("development")

    with app.app_context():
        init_db()

    print("Bilibili平台启动中...")
    print("访问地址: http://localhost:5000")
    print("按 Ctrl+C 停止服务器")

    app.run(host="0.0.0.0", port=5000, debug=True)
