from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from src.api.bilibili_api import bilibili_api
from src.models.user import FavoriteVideo, db
import asyncio

video_bp = Blueprint("video", __name__)


@video_bp.route("/<bvid>")
def video_detail(bvid):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        video_info = loop.run_until_complete(bilibili_api.get_video_info(bvid))
        if not video_info:
            return render_template("404.html"), 404

        playurl = loop.run_until_complete(bilibili_api.get_video_playurl(bvid))
        danmakus = loop.run_until_complete(bilibili_api.get_video_danmaku(bvid))
        comments = loop.run_until_complete(bilibili_api.get_video_comments(bvid))

        is_favorited = False
        if current_user.is_authenticated:
            favorite = FavoriteVideo.query.filter_by(
                user_id=current_user.id, bvid=bvid
            ).first()
            is_favorited = favorite is not None

        return render_template(
            "video/detail.html",
            video_info=video_info,
            playurl=playurl,
            danmakus=danmakus,
            comments=comments,
            is_favorited=is_favorited,
        )
    finally:
        loop.close()


@video_bp.route("/api/<bvid>/info")
def api_video_info(bvid):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        video_info = loop.run_until_complete(bilibili_api.get_video_info(bvid))
        if video_info:
            return jsonify(video_info)
        else:
            return jsonify({"error": "视频不存在"}), 404
    finally:
        loop.close()


@video_bp.route("/api/<bvid>/playurl")
def api_video_playurl(bvid):
    cid = request.args.get("cid", type=int)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        playurl = loop.run_until_complete(bilibili_api.get_video_playurl(bvid, cid))
        if playurl:
            return jsonify(playurl)
        else:
            return jsonify({"error": "无法获取播放地址"}), 400
    finally:
        loop.close()


@video_bp.route("/api/<bvid>/danmaku")
def api_video_danmaku(bvid):
    cid = request.args.get("cid", type=int)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        danmakus = loop.run_until_complete(bilibili_api.get_video_danmaku(bvid, cid))
        return jsonify({"danmakus": danmakus})
    finally:
        loop.close()


@video_bp.route("/api/<bvid>/comments")
def api_video_comments(bvid):
    page = request.args.get("page", 1, type=int)
    size = request.args.get("size", 20, type=int)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        comments = loop.run_until_complete(
            bilibili_api.get_video_comments(bvid, page, size)
        )
        return jsonify({"comments": comments, "page": page, "size": size})
    finally:
        loop.close()


@video_bp.route("/<bvid>/favorite", methods=["POST"])
@login_required
def favorite_video(bvid):
    video_info = None
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        video_info = loop.run_until_complete(bilibili_api.get_video_info(bvid))
    finally:
        loop.close()

    if not video_info:
        return jsonify({"success": False, "message": "视频不存在"}), 404

    favorite = FavoriteVideo.query.filter_by(user_id=current_user.id, bvid=bvid).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify(
            {"success": True, "message": "取消收藏成功", "action": "unfavorite"}
        )
    else:
        favorite = FavoriteVideo(
            user_id=current_user.id,
            bvid=bvid,
            title=video_info.get("title", ""),
            cover=video_info.get("pic", ""),
            duration=video_info.get("duration", 0),
        )
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"success": True, "message": "收藏成功", "action": "favorite"})
