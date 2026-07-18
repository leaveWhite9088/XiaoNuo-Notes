from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    current_user,
    login_user,
    logout_user,
    login_required,
)
from flask_socketio import SocketIO, emit, join_room, leave_room
from config.settings import config
import os

db = SQLAlchemy()
login_manager = LoginManager()
socketio = SocketIO()


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    login_manager.init_app(app)
    socketio.init_app(app)

    login_manager.login_view = "auth.login"
    login_manager.login_message = "请先登录"

    from src.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from src.views.main import main_bp
    from src.views.auth import auth_bp
    from src.views.video import video_bp
    from src.views.comment import comment_bp
    from src.views.danmaku import danmaku_bp
    from src.views.user import user_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(video_bp, url_prefix="/video")
    app.register_blueprint(comment_bp, url_prefix="/comment")
    app.register_blueprint(danmaku_bp, url_prefix="/danmaku")
    app.register_blueprint(user_bp, url_prefix="/user")

    from src.utils import register_filters

    register_filters(app)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("500.html"), 500

    return app


def init_db():
    from app import create_app

    app = create_app("development")
    with app.app_context():
        db.create_all()


if __name__ == "__main__":
    app = create_app("development")
    init_db()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
