from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    avatar = db.Column(db.String(256), default="/static/images/default_avatar.png")
    bio = db.Column(db.Text, nullable=True)

    bilibili_credentials = db.Column(db.Text, nullable=True)
    bilibili_user_info = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_bilibili_credentials(self, credentials):
        if credentials:
            self.bilibili_credentials = json.dumps(credentials)

    def get_bilibili_credentials(self):
        if self.bilibili_credentials:
            return json.loads(self.bilibili_credentials)
        return None

    def set_bilibili_user_info(self, user_info):
        if user_info:
            self.bilibili_user_info = json.dumps(user_info)

    def get_bilibili_user_info(self):
        if self.bilibili_user_info:
            return json.loads(self.bilibili_user_info)
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "avatar": self.avatar,
            "bio": self.bio,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class FavoriteVideo(db.Model):
    __tablename__ = "favorite_videos"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    bvid = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(256))
    cover = db.Column(db.String(256))
    duration = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("favorites", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "bvid": self.bvid,
            "title": self.title,
            "cover": self.cover,
            "duration": self.duration,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
