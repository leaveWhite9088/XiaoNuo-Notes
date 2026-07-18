from flask import Blueprint, render_template, jsonify
from flask_login import login_required, current_user
from src.models.user import FavoriteVideo, db
import asyncio

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile")
@login_required
def profile():
    return render_template("user/profile.html", user=current_user)


@user_bp.route("/favorites")
@login_required
def favorites():
    favorites = (
        FavoriteVideo.query.filter_by(user_id=current_user.id)
        .order_by(FavoriteVideo.created_at.desc())
        .all()
    )
    return render_template("user/favorites.html", favorites=favorites)


@user_bp.route("/api/favorites")
@login_required
def api_favorites():
    favorites = (
        FavoriteVideo.query.filter_by(user_id=current_user.id)
        .order_by(FavoriteVideo.created_at.desc())
        .all()
    )
    return jsonify({"favorites": [f.to_dict() for f in favorites]})


@user_bp.route("/api/bilibili/info")
@login_required
def api_bilibili_info():
    credentials = current_user.get_bilibili_credentials()
    if not credentials:
        return jsonify({"error": "未登录B站账号"}), 400

    from src.api.bilibili_api import bilibili_api

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        user_info = loop.run_until_complete(
            bilibili_api.get_user_info(credentials.get("mid", 0))
        )
        if user_info:
            current_user.set_bilibili_user_info(user_info)
            db.session.commit()
            return jsonify(user_info)
        else:
            return jsonify({"error": "无法获取用户信息"}), 400
    finally:
        loop.close()


@user_bp.route("/api/bilibili/favorites")
@login_required
def api_bilibili_favorites():
    credentials = current_user.get_bilibili_credentials()
    if not credentials:
        return jsonify({"error": "未登录B站账号"}), 400

    from src.api.bilibili_api import bilibili_api

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        mid = credentials.get("mid", 0)
        if mid:
            favorites = loop.run_until_complete(bilibili_api.get_user_favorites(mid))
            return jsonify({"favorites": favorites})
        else:
            return jsonify({"error": "无法获取用户ID"}), 400
    finally:
        loop.close()
