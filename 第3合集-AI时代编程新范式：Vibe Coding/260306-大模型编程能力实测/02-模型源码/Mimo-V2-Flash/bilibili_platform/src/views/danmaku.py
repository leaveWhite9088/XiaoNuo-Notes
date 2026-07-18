from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from src.api.bilibili_api import bilibili_api
import asyncio

danmaku_bp = Blueprint("danmaku", __name__)


@danmaku_bp.route("/api/<bvid>/<cid>/danmaku", methods=["GET"])
def get_danmaku(bvid, cid):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        danmakus = loop.run_until_complete(bilibili_api.get_video_danmaku(bvid, cid))
        return jsonify({"danmakus": danmakus})
    finally:
        loop.close()


@danmaku_bp.route("/api/<bvid>/<cid>/send", methods=["POST"])
@login_required
def send_danmaku(bvid, cid):
    message = request.json.get("message")
    if not message:
        return jsonify({"success": False, "message": "弹幕内容不能为空"}), 400

    credentials = current_user.get_bilibili_credentials()
    if not credentials:
        return jsonify({"success": False, "message": "请先登录B站账号"}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        from bilibili_api import credential

        cred = credential.Credential(
            sessdata=credentials.get("sessdata"),
            bili_jct=credentials.get("bili_jct"),
            buvid3=credentials.get("buvid3"),
        )

        result = loop.run_until_complete(
            bilibili_api.send_danmaku(bvid, cid, message, cred)
        )
        if result:
            return jsonify({"success": True, "message": "弹幕发送成功"})
        else:
            return jsonify({"success": False, "message": "弹幕发送失败"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"发送失败: {str(e)}"}), 400
    finally:
        loop.close()
