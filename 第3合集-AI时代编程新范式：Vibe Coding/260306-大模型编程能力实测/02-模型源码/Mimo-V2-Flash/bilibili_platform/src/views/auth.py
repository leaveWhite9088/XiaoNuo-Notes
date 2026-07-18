from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for,
)
from flask_login import login_user, logout_user, login_required, current_user
from src.models.user import User, db
from src.api.bilibili_api import bilibili_api
import asyncio
import json

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("main.index"))

        return render_template("auth/login.html", error="用户名或密码错误")

    return render_template("auth/login.html")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        if User.query.filter_by(username=username).first():
            return render_template("auth/register.html", error="用户名已存在")

        if User.query.filter_by(email=email).first():
            return render_template("auth/register.html", error="邮箱已存在")

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        return redirect(url_for("main.index"))

    return render_template("auth/register.html")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("main.index"))


@auth_bp.route("/bilibili/login/qrcode")
@login_required
def bilibili_qrcode_login():
    return render_template("auth/bilibili_qrcode.html")


@auth_bp.route("/api/bilibili/login/qrcode", methods=["POST"])
@login_required
def api_bilibili_qrcode_login():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        credentials = loop.run_until_complete(bilibili_api.login_by_qrcode())
        if credentials:
            current_user.set_bilibili_credentials(credentials)
            db.session.commit()
            return jsonify({"success": True, "message": "B站登录成功"})
        else:
            return jsonify({"success": False, "message": "登录失败"}), 400
    finally:
        loop.close()


@auth_bp.route("/bilibili/login/password")
@login_required
def bilibili_password_login():
    return render_template("auth/bilibili_password.html")


@auth_bp.route("/api/bilibili/login/password", methods=["POST"])
@login_required
def api_bilibili_password_login():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "用户名和密码不能为空"}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        credentials = loop.run_until_complete(
            bilibili_api.login_by_password(username, password)
        )
        if credentials:
            current_user.set_bilibili_credentials(credentials)
            db.session.commit()
            return jsonify({"success": True, "message": "B站登录成功"})
        else:
            return jsonify({"success": False, "message": "登录失败"}), 400
    finally:
        loop.close()
