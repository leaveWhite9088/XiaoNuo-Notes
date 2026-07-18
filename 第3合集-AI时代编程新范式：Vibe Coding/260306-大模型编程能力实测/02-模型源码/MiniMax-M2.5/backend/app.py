import requests
import json
from flask import Flask, request, jsonify, session
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "bilibili-web-secret-key-2024"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:18119",
        "http://127.0.0.1:18119",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "file://",
    ],
)

BILIBILI_API = "https://api.bilibili.com"


def get_credential():
    sessdata = session.get("sessdata")
    return sessdata


def build_headers():
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.bilibili.com",
    }
    sessdata = get_credential()
    if sessdata:
        headers["Cookie"] = f"SESSDATA={sessdata}"
    return headers


@app.route("/")
def index():
    return jsonify({"message": "Bilibili API Server", "version": "1.0.0"})


@app.route("/api/login/qrcode", methods=["GET"])
def get_qrcode():
    try:
        url = f"{BILIBILI_API}/x/web/interface/login/qrcode/get"
        resp = requests.get(url, headers=build_headers())
        data = resp.json()

        if data["code"] == 0:
            return jsonify(
                {
                    "success": True,
                    "data": {
                        "url": data["data"]["url"],
                        "authcode": data["data"]["qrcode_key"],
                    },
                }
            )
        return jsonify(
            {"success": False, "error": data.get("message", "获取二维码失败")}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/login/check", methods=["GET"])
def check_qrcode():
    authcode = request.args.get("authcode")
    if not authcode:
        return jsonify({"success": False, "error": "缺少authcode"}), 400

    try:
        url = f"{BILIBILI_API}/x/web/interface/login/qrcode/poll"
        params = {"qrcode_key": authcode}
        resp = requests.get(url, params=params, headers=build_headers())
        data = resp.json()

        if data["code"] == 0:
            if data["data"]["code"] == 0:
                sessdata = data["data"]["sessdata"]
                session["sessdata"] = sessdata
                session.modified = True
                return jsonify(
                    {
                        "success": True,
                        "data": {
                            "logged_in": True,
                            "sessdata": sessdata,
                            "message": "登录成功",
                        },
                    }
                )
            elif data["data"]["code"] in [86101, 86090]:
                return jsonify(
                    {
                        "success": True,
                        "data": {
                            "logged_in": False,
                            "status": "waiting",
                            "message": "等待扫码",
                        },
                    }
                )
            elif data["data"]["code"] == 86038:
                return jsonify(
                    {
                        "success": True,
                        "data": {
                            "logged_in": False,
                            "status": "expired",
                            "message": "二维码已过期",
                        },
                    }
                )

        return jsonify(
            {
                "success": True,
                "data": {
                    "logged_in": False,
                    "status": "unknown",
                    "message": data.get("message", "未知状态"),
                },
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/login/sessdata", methods=["POST"])
def login_with_sessdata():
    data = request.get_json()
    sessdata = data.get("sessdata")

    if not sessdata:
        return jsonify({"success": False, "error": "缺少SESSDATA"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": f"SESSDATA={sessdata}",
        }
        url = f"{BILIBILI_API}/x/web-interface/nav"
        resp = requests.get(url, headers=headers)
        result = resp.json()

        if result["code"] == 0:
            session["sessdata"] = sessdata
            session["user_id"] = result["data"]["mid"]
            session.modified = True

            return jsonify(
                {
                    "success": True,
                    "data": {
                        "user_id": result["data"]["mid"],
                        "uname": result["data"]["uname"],
                        "face": result["data"].get("face", ""),
                        "level": result["data"].get("level", 0),
                        "message": "登录成功",
                    },
                }
            )
        return jsonify({"success": False, "error": result.get("message", "登录失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "已退出登录"})


@app.route("/api/user/info", methods=["GET"])
def get_user_info():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    try:
        headers = build_headers()
        url = f"{BILIBILI_API}/x/web-interface/nav"
        resp = requests.get(url, headers=headers)
        result = resp.json()

        if result["code"] == 0:
            return jsonify({"success": True, "data": result["data"]})
        return jsonify({"success": False, "error": result.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/user/stats", methods=["GET"])
def get_user_stats():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    try:
        headers = build_headers()
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "用户ID不存在"}), 400

        url = f"{BILIBILI_API}/x/space/navnum"
        params = {"mid": user_id}
        resp = requests.get(url, params=params, headers=headers)
        result = resp.json()

        if result["code"] == 0:
            return jsonify({"success": True, "data": result["data"]})
        return jsonify({"success": False, "error": result.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/video/info", methods=["GET"])
def get_video_info():
    bvid = request.args.get("bvid")
    aid = request.args.get("aid")

    if not bvid and not aid:
        return jsonify({"success": False, "error": "缺少bvid或aid"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        url = f"{BILIBILI_API}/x/web-interface/view"
        params = {"bvid": bvid} if bvid else {"aid": aid}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        if data["code"] == 0:
            video_data = data["data"]

            play_url_url = f"{BILIBILI_API}/x/player/playurl"
            play_params = {
                "avid": video_data["aid"],
                "cid": video_data["cid"],
                "qn": 80,
                "fnval": 16,
            }
            play_resp = requests.get(play_url_url, params=play_params, headers=headers)
            play_data = play_resp.json()

            return jsonify(
                {
                    "success": True,
                    "data": {"info": video_data, "play_url": play_data.get("data", {})},
                }
            )
        return jsonify({"success": False, "error": data.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/video/playurl", methods=["GET"])
def get_play_url():
    bvid = request.args.get("bvid")
    cid = request.args.get("cid")
    aid = request.args.get("aid")

    if not bvid:
        return jsonify({"success": False, "error": "缺少bvid"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        if not cid:
            view_url = f"{BILIBILI_API}/x/web-interface/view"
            view_resp = requests.get(view_url, params={"bvid": bvid}, headers=headers)
            view_data = view_resp.json()
            if view_data["code"] != 0:
                return jsonify(
                    {"success": False, "error": view_data.get("message")}
                ), 400
            cid = view_data["data"]["cid"]
            aid = view_data["data"]["aid"]

        url = f"{BILIBILI_API}/x/player/playurl"
        params = {"avid": aid, "cid": cid, "qn": 80, "fnval": 16}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        return jsonify({"success": True, "data": data.get("data", {})})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/video/comments", methods=["GET"])
def get_comments():
    bvid = request.args.get("bvid")
    oid = request.args.get("oid")
    pn = int(request.args.get("pn", 1))
    ps = int(request.args.get("ps", 20))

    if not bvid and not oid:
        return jsonify({"success": False, "error": "缺少bvid或oid"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        if not oid:
            view_url = f"{BILIBILI_API}/x/web-interface/view"
            view_resp = requests.get(view_url, params={"bvid": bvid}, headers=headers)
            view_data = view_resp.json()
            if view_data["code"] != 0:
                return jsonify(
                    {"success": False, "error": view_data.get("message")}
                ), 400
            oid = view_data["data"]["aid"]

        url = f"{BILIBILI_API}/x/v2/reply"
        params = {"type": 1, "oid": oid, "pn": pn, "ps": ps, "mode": 3}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        return jsonify({"success": True, "data": data.get("data", {})})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/video/danmu", methods=["GET"])
def get_danmu():
    cid = request.args.get("cid")

    if not cid:
        return jsonify({"success": False, "error": "缺少cid"}), 400

    try:
        url = f"{BILIBILI_API}/x/v2/dm/web/seg.so"
        params = {"type": 1, "oid": cid, "segment_index": 1}
        resp = requests.get(url, params=params)

        try:
            import struct

            dm_list = []

            content = resp.content
            pos = 0
            while pos < len(content):
                try:
                    if content[pos : pos + 4] == b"\x00\x00\x00\x1e":
                        msg_len = 30
                        header = content[pos : pos + msg_len]
                        if len(content) >= pos + msg_len + 4:
                            data_len = struct.unpack(
                                ">I", content[pos + msg_len - 4 : pos + msg_len]
                            )[0]
                            if len(content) >= pos + msg_len + data_len - 4:
                                payload = content[
                                    pos + msg_len : pos + msg_len + data_len - 4
                                ]
                                try:
                                    import json as json_mod

                                    msg = json_mod.loads(payload.decode("utf-8"))
                                    if msg.get("cmd") == "DANMU_MSG":
                                        info = msg.get("info", [{}, []])
                                        if len(info) > 1:
                                            dm_list.append(
                                                {
                                                    "text": info[1].get("content", ""),
                                                    "color": info[1].get(
                                                        "color", 16777215
                                                    ),
                                                    "mode": info[1].get("mode", 1),
                                                    "size": info[1].get("fontsize", 25),
                                                    "time": info[0].get("time", 0),
                                                }
                                            )
                                except:
                                    pass
                    pos += 1
                except:
                    pos += 1

            return jsonify({"success": True, "data": dm_list[:100]})
        except Exception as parse_err:
            return jsonify({"success": True, "data": [], "warning": str(parse_err)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/comment/send", methods=["POST"])
def send_comment():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    data = request.get_json()
    oid = data.get("oid")
    message = data.get("message")

    if not oid or not message:
        return jsonify({"success": False, "error": "缺少必要参数"}), 400

    try:
        csrf = ""
        for part in sessdata.split(";"):
            if "bili_jct" in part:
                csrf = part.split("=")[1]
                break

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": f"SESSDATA={sessdata}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        url = f"{BILIBILI_API}/x/v2/reply/add"
        post_data = {"type": 1, "oid": oid, "message": message, "csrf": csrf}
        resp = requests.post(url, data=post_data, headers=headers)
        result = resp.json()

        if result["code"] == 0:
            return jsonify({"success": True, "data": result.get("data", {})})
        return jsonify({"success": False, "error": result.get("message", "发送失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/danmu/send", methods=["POST"])
def send_danmu():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    data = request.get_json()
    cid = data.get("cid")
    message = data.get("message")

    if not cid or not message:
        return jsonify({"success": False, "error": "缺少必要参数"}), 400

    try:
        csrf = ""
        for part in sessdata.split(";"):
            if "bili_jct" in part:
                csrf = part.split("=")[1]
                break

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": f"SESSDATA={sessdata}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        url = f"{BILIBILI_API}/x/v2/dm/post"
        post_data = {
            "type": 1,
            "oid": cid,
            "msg": message,
            "aid": 0,
            "bvid": "",
            "cid": cid,
            "message": message,
            "rnd": 0,
            "from": 0,
            "mode": 1,
            "msg_type": 1,
            "color": 16777215,
            "fontsize": 25,
            "pool": 0,
            "attr": 0,
            "csrf": csrf,
        }
        resp = requests.post(url, data=post_data, headers=headers)
        result = resp.json()

        return jsonify({"success": result.get("code") == 0, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/favorite/list", methods=["GET"])
def get_favorite_list():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    pn = int(request.args.get("pn", 1))
    ps = int(request.args.get("ps", 20))

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": f"SESSDATA={sessdata}",
        }

        url = f"{BILIBILI_API}/x/v3/fav/list"
        params = {"pn": pn, "ps": ps}
        resp = requests.get(url, params=params, headers=headers)
        result = resp.json()

        if result["code"] == 0:
            return jsonify({"success": True, "data": result.get("data", {})})
        return jsonify({"success": False, "error": result.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/favorite/add", methods=["POST"])
def add_favorite():
    sessdata = get_credential()
    if not sessdata:
        return jsonify({"success": False, "error": "未登录"}), 401

    data = request.get_json()
    bvid = data.get("bvid")

    if not bvid:
        return jsonify({"success": False, "error": "缺少bvid"}), 400

    try:
        csrf = ""
        for part in sessdata.split(";"):
            if "bili_jct" in part:
                csrf = part.split("=")[1]
                break

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": f"SESSDATA={sessdata}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        url = f"{BILIBILI_API}/x/v3/fav/video/deal"
        post_data = {"rid": bvid, "type": 2, "add_media_ids": 1, "csrf": csrf}
        resp = requests.post(url, data=post_data, headers=headers)
        result = resp.json()

        return jsonify({"success": result.get("code") == 0, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/hot/videos", methods=["GET"])
def get_hot_videos():
    pn = int(request.args.get("pn", 1))
    ps = int(request.args.get("ps", 20))

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        url = f"{BILIBILI_API}/x/web-interface/ranking/v2"
        params = {"rid": 0, "pn": pn, "ps": ps}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        if data["code"] == 0:
            return jsonify({"success": True, "data": data.get("data", {})})
        return jsonify({"success": False, "error": data.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/search", methods=["GET"])
def search_videos():
    keyword = request.args.get("keyword")
    pn = int(request.args.get("pn", 1))

    if not keyword:
        return jsonify({"success": False, "error": "缺少关键词"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        url = f"{BILIBILI_API}/x/web-interface/search/type"
        params = {
            "search_type": "video",
            "keyword": keyword,
            "page": pn,
            "page_size": 20,
        }
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        if data["code"] == 0:
            return jsonify({"success": True, "data": data.get("data", {})})
        return jsonify({"success": False, "error": data.get("message", "搜索失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/rank", methods=["GET"])
def get_rank():
    rid = int(request.args.get("rid", 0))
    pn = int(request.args.get("pn", 1))

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        url = f"{BILIBILI_API}/x/web-interface/ranking/v2"
        params = {"rid": rid, "pn": pn}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        if data["code"] == 0:
            return jsonify({"success": True, "data": data.get("data", {})})
        return jsonify({"success": False, "error": data.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/related", methods=["GET"])
def get_related_videos():
    bvid = request.args.get("bvid")

    if not bvid:
        return jsonify({"success": False, "error": "缺少bvid"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.bilibili.com",
        }

        url = f"{BILIBILI_API}/x/web-interface/archive/related"
        params = {"bvid": bvid}
        resp = requests.get(url, params=params, headers=headers)
        data = resp.json()

        if data["code"] == 0:
            return jsonify({"success": True, "data": data.get("data", [])})
        return jsonify({"success": False, "error": data.get("message", "获取失败")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
