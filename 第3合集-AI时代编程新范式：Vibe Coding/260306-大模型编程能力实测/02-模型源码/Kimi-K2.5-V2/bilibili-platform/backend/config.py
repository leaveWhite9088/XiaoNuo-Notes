"""
Bilibili平台配置文件
"""
import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# 登录凭证存储文件
CREDENTIAL_FILE = DATA_DIR / "credential.json"

# API配置
API_HOST = "0.0.0.0"
API_PORT = 8080

# Bilibili配色方案
BILIBILI_COLORS = {
    "primary": "#00A1D6",      # B站蓝
    "primary_hover": "#00B5E5",
    "pink": "#FB7299",          # B站粉
    "pink_hover": "#FF85A7",
    "bg": "#F1F2F3",            # 背景灰
    "card_bg": "#FFFFFF",       # 卡片白
    "text": "#18191C",          # 主文字
    "text_secondary": "#61666D", # 次要文字
    "border": "#E3E5E7",        # 边框色
    "hover": "#F1F2F3",         # 悬浮色
}

# 视频分区
VIDEO_PARTITIONS = [
    {"id": 1, "name": "动画", "sub": [{"id": 24, "name": "MAD·AMV"}, {"id": 25, "name": "MMD·3D"}, {"id": 47, "name": "短片·手书·配音"}]},
    {"id": 13, "name": "番剧", "sub": [{"id": 33, "name": "连载动画"}, {"id": 32, "name": "完结动画"}, {"id": 51, "name": "资讯"}]},
    {"id": 167, "name": "国创", "sub": [{"id": 153, "name": "国产动画"}, {"id": 168, "name": "国产原创相关"}]},
    {"id": 3, "name": "音乐", "sub": [{"id": 28, "name": "原创音乐"}, {"id": 31, "name": "翻唱"}, {"id": 30, "name": "VOCALOID·UTAU"}]},
    {"id": 129, "name": "舞蹈", "sub": [{"id": 20, "name": "宅舞"}, {"id": 198, "name": "街舞"}, {"id": 199, "name": "明星舞蹈"}]},
    {"id": 4, "name": "游戏", "sub": [{"id": 17, "name": "单机游戏"}, {"id": 171, "name": "电子竞技"}, {"id": 172, "name": "手机游戏"}]},
    {"id": 36, "name": "知识", "sub": [{"id": 201, "name": "科学科普"}, {"id": 124, "name": "社科·法律·心理"}, {"id": 207, "name": "人文历史"}]},
    {"id": 188, "name": "科技", "sub": [{"id": 95, "name": "数码"}, {"id": 189, "name": "软件应用"}, {"id": 190, "name": "计算机技术"}]},
    {"id": 234, "name": "运动", "sub": [{"id": 235, "name": "篮球·足球"}, {"id": 164, "name": "健身"}, {"id": 236, "name": "竞技体育"}]},
    {"id": 223, "name": "汽车", "sub": [{"id": 245, "name": "汽车生活"}, {"id": 246, "name": "汽车文化"}, {"id": 247, "name": "汽车极客"}]},
    {"id": 160, "name": "生活", "sub": [{"id": 21, "name": "日常"}, {"id": 250, "name": "美食"}, {"id": 251, "name": "动物圈"}]},
    {"id": 211, "name": "美食", "sub": [{"id": 76, "name": "美食制作"}, {"id": 212, "name": "美食侦探"}, {"id": 213, "name": "美食测评"}]},
    {"id": 217, "name": "动物圈", "sub": [{"id": 218, "name": "喵星人"}, {"id": 219, "name": "汪星人"}, {"id": 220, "name": "大熊猫"}]},
    {"id": 155, "name": "时尚", "sub": [{"id": 157, "name": "美妆护肤"}, {"id": 158, "name": "穿搭"}, {"id": 159, "name": "时尚潮流"}]},
    {"id": 5, "name": "娱乐", "sub": [{"id": 71, "name": "综艺"}, {"id": 241, "name": "娱乐杂谈"}, {"id": 242, "name": "粉丝创作"}]},
    {"id": 181, "name": "影视", "sub": [{"id": 182, "name": "影视杂谈"}, {"id": 183, "name": "影视剪辑"}, {"id": 85, "name": "小剧场"}]},
    {"id": 177, "name": "纪录片", "sub": [{"id": 37, "name": "人文·历史"}, {"id": 178, "name": "科学·探索·自然"}, {"id": 179, "name": "军事"}]},
    {"id": 23, "name": "电影", "sub": [{"id": 147, "name": "华语电影"}, {"id": 145, "name": "欧美电影"}, {"id": 146, "name": "日本电影"}]},
    {"id": 11, "name": "电视剧", "sub": [{"id": 185, "name": "国产剧"}, {"id": 187, "name": "欧美剧"}, {"id": 186, "name": "日剧"}]},
]