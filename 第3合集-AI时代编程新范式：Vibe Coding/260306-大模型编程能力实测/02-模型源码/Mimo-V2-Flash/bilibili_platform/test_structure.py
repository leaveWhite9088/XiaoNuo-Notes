#!/usr/bin/env python3
import os
import sys


def check_structure():
    print("检查项目结构...")

    required_files = [
        "app.py",
        "run.py",
        "requirements.txt",
        "README.md",
        "config/settings.py",
        "src/api/bilibili_api.py",
        "src/models/user.py",
        "src/views/main.py",
        "src/views/auth.py",
        "src/views/video.py",
        "src/views/comment.py",
        "src/views/danmaku.py",
        "src/views/user.py",
        "src/utils/filters.py",
        "static/css/style.css",
        "static/css/bilibili.css",
        "static/js/main.js",
        "templates/base.html",
        "templates/index.html",
        "templates/search.html",
        "templates/404.html",
        "templates/500.html",
        "templates/auth/login.html",
        "templates/auth/register.html",
        "templates/auth/bilibili_qrcode.html",
        "templates/auth/bilibili_password.html",
        "templates/video/detail.html",
        "templates/user/profile.html",
        "templates/user/favorites.html",
    ]

    missing_files = []
    for file_path in required_files:
        full_path = os.path.join(os.getcwd(), file_path)
        if not os.path.exists(full_path):
            missing_files.append(file_path)
            print(f"❌ 缺失: {file_path}")
        else:
            print(f"✅ 存在: {file_path}")

    if missing_files:
        print(f"\n缺失文件数量: {len(missing_files)}")
        return False
    else:
        print("\n✅ 所有必需文件都存在")
        return True


def check_dependencies():
    print("\n检查依赖...")
    try:
        import flask

        print(f"✅ Flask: {flask.__version__}")
    except ImportError:
        print("❌ Flask 未安装")
        return False

    try:
        import flask_sqlalchemy

        print("✅ Flask-SQLAlchemy 已安装")
    except ImportError:
        print("❌ Flask-SQLAlchemy 未安装")
        return False

    try:
        import flask_login

        print("✅ Flask-Login 已安装")
    except ImportError:
        print("❌ Flask-Login 未安装")
        return False

    try:
        import bilibili_api

        print("✅ bilibili-api-python 已安装")
    except ImportError:
        print("❌ bilibili-api-python 未安装")
        return False

    print("\n✅ 所有依赖都已安装")
    return True


if __name__ == "__main__":
    print("=" * 50)
    print("Bilibili平台项目结构检查")
    print("=" * 50)

    structure_ok = check_structure()
    dependencies_ok = check_dependencies()

    if structure_ok and dependencies_ok:
        print("\n🎉 项目结构检查通过！")
        print("可以开始运行项目")
    else:
        print("\n❌ 项目检查失败")
        sys.exit(1)
