from flask import Blueprint, render_template, request, jsonify
from src.api.bilibili_api import bilibili_api
import asyncio

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/search")
def search():
    keyword = request.args.get("keyword", "")
    page = int(request.args.get("page", 1))

    if keyword:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(bilibili_api.search_videos(keyword, page))
            return render_template(
                "search.html", results=results, keyword=keyword, page=page
            )
        finally:
            loop.close()

    return render_template("search.html", results=[], keyword=keyword, page=page)


@main_bp.route("/api/search")
def api_search():
    keyword = request.args.get("keyword", "")
    page = int(request.args.get("page", 1))

    if not keyword:
        return jsonify({"error": "关键词不能为空"}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        results = loop.run_until_complete(bilibili_api.search_videos(keyword, page))
        return jsonify({"results": results, "keyword": keyword, "page": page})
    finally:
        loop.close()
