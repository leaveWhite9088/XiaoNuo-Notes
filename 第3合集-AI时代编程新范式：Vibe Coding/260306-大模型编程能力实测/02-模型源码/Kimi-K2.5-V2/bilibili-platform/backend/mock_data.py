"""
模拟数据 - 用于API不可用时提供示例数据
"""

MOCK_VIDEOS = [
    {
        "bvid": "BV1xx411c7mD",
        "title": "【官方MV】周杰伦 - 稻香",
        "pic": "https://i0.hdslb.com/bfs/archive/6bc33d2d089e54653b02c41db72ec74c5008a11a.jpg",
        "duration": 223,
        "owner": {"mid": 123456, "name": "周杰伦音乐台", "face": ""},
        "stat": {"view": 15230000, "danmaku": 125000, "like": 890000, "favorite": 456000},
        "desc": "还记得你说家是唯一的城堡，随着稻香河流继续奔跑",
        "pubdate": 1609459200,
        "cid": 123456789
    },
    {
        "bvid": "BV1vx411X7dW",
        "title": "【4K60FPS】邓紫棋《光年之外》GEM现场版！",
        "pic": "https://i0.hdslb.com/bfs/archive/e70f6b7d8ed7e6b8a8c8f4e6a3b7c8d9e0f1a2b3c.jpg",
        "duration": 268,
        "owner": {"mid": 234567, "name": "GEM邓紫棋", "face": ""},
        "stat": {"view": 8900000, "danmaku": 78000, "like": 560000, "favorite": 234000},
        "desc": "感受她超强现场唱功！",
        "pubdate": 1612137600,
        "cid": 234567890
    },
    {
        "bvid": "BV1yx411d7xL",
        "title": "【全程高能】2023年最火100首歌曲大盘点",
        "pic": "https://i0.hdslb.com/bfs/archive/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.jpg",
        "duration": 1800,
        "owner": {"mid": 345678, "name": "音乐盘点君", "face": ""},
        "stat": {"view": 5200000, "danmaku": 45000, "like": 320000, "favorite": 189000},
        "desc": "每一首都是经典！",
        "pubdate": 1625097600,
        "cid": 345678901
    },
    {
        "bvid": "BV1zx411H7sM",
        "title": "Python爬虫教程：从入门到精通（2024最新版）",
        "pic": "https://i0.hdslb.com/bfs/archive/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d.jpg",
        "duration": 3600,
        "owner": {"mid": 456789, "name": "程序员小灰", "face": ""},
        "stat": {"view": 3200000, "danmaku": 28000, "like": 210000, "favorite": 145000},
        "desc": "零基础入门Python爬虫",
        "pubdate": 1638288000,
        "cid": 456789012
    },
    {
        "bvid": "BV1Ax411N7dK",
        "title": "【4K】星际穿越 Interstellar 配乐全集 - Hans Zimmer",
        "pic": "https://i0.hdslb.com/bfs/archive/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.jpg",
        "duration": 4523,
        "owner": {"mid": 567890, "name": "电影音乐馆", "face": ""},
        "stat": {"view": 4100000, "danmaku": 32000, "like": 280000, "favorite": 198000},
        "desc": "极致视听体验",
        "pubdate": 1598976000,
        "cid": 567890123
    },
    {
        "bvid": "BV1Bx411W7xV",
        "title": "原神3.0版本全角色强度排行榜",
        "pic": "https://i0.hdslb.com/bfs/archive/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.jpg",
        "duration": 890,
        "owner": {"mid": 678901, "name": "原神攻略组", "face": ""},
        "stat": {"view": 6800000, "danmaku": 56000, "like": 420000, "favorite": 156000},
        "desc": "新手必看！",
        "pubdate": 1646092800,
        "cid": 678901234
    },
    {
        "bvid": "BV1Cx411X8sL",
        "title": "【老番茄】史上最骚杀手（第一集）",
        "pic": "https://i0.hdslb.com/bfs/archive/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a.jpg",
        "duration": 1567,
        "owner": {"mid": 789012, "name": "老番茄", "face": ""},
        "stat": {"view": 12500000, "danmaku": 180000, "like": 980000, "favorite": 567000},
        "desc": "搞笑游戏解说",
        "pubdate": 1577808000,
        "cid": 789012345
    },
    {
        "bvid": "BV1Dx411N9sK",
        "title": "美食制作：正宗四川火锅底料做法",
        "pic": "https://i0.hdslb.com/bfs/archive/f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b.jpg",
        "duration": 2345,
        "owner": {"mid": 890123, "name": "美食作家王刚", "face": ""},
        "stat": {"view": 2800000, "danmaku": 22000, "like": 180000, "favorite": 98000},
        "desc": "详细步骤教你做正宗火锅",
        "pubdate": 1659312000,
        "cid": 890123456
    }
]

MOCK_COMMENTS = {
    "replies": [
        {
            "rpid": 1,
            "oid": 123456,
            "type": 1,
            "mid": 10001,
            "root": 0,
            "parent": 0,
            "content": {"message": "这个视频真的太棒了！支持UP主！", "plat": 2},
            "ctime": 1672531200,
            "like": 3420,
            "member": {
                "mid": "10001",
                "uname": "哔哩哔哩用户",
                "sex": "保密",
                "sign": "",
                "avatar": "https://i0.hdslb.com/bfs/face/member/noface.jpg",
                "level_info": {"current_level": 5}
            },
            "replies": [
                {
                    "rpid": 2,
                    "content": {"message": "同感！"},
                    "ctime": 1672534800,
                    "like": 156,
                    "member": {
                        "mid": "10002",
                        "uname": "小明同学",
                        "avatar": "https://i0.hdslb.com/bfs/face/member/noface.jpg"
                    }
                }
            ]
        },
        {
            "rpid": 3,
            "oid": 123456,
            "type": 1,
            "mid": 10003,
            "root": 0,
            "parent": 0,
            "content": {"message": "第一次看就爱上了，果断三连！", "plat": 2},
            "ctime": 1672617600,
            "like": 2156,
            "member": {
                "mid": "10003",
                "uname": "二次元爱好者",
                "sex": "男",
                "sign": "",
                "avatar": "https://i0.hdslb.com/bfs/face/member/noface.jpg",
                "level_info": {"current_level": 6}
            },
            "replies": []
        },
        {
            "rpid": 4,
            "oid": 123456,
            "type": 1,
            "mid": 10004,
            "root": 0,
            "parent": 0,
            "content": {"message": "画质好评！内容也很精彩", "plat": 2},
            "ctime": 1672704000,
            "like": 1890,
            "member": {
                "mid": "10004",
                "uname": "视频鉴赏家",
                "sex": "女",
                "sign": "",
                "avatar": "https://i0.hdslb.com/bfs/face/member/noface.jpg",
                "level_info": {"current_level": 4}
            },
            "replies": []
        }
    ],
    "page": {
        "num": 1,
        "size": 20,
        "count": 3,
        "acount": 3
    }
}

MOCK_DANMAKU = [
    {"text": "前排围观", "dm_time": 5.2, "color": 16777215, "mode": 1},
    {"text": "来了来了", "dm_time": 8.5, "color": 14893055, "mode": 1},
    {"text": "这就很厉害", "dm_time": 12.0, "color": 16777215, "mode": 1},
    {"text": "666666", "dm_time": 15.3, "color": 6744191, "mode": 1},
    {"text": "前方高能", "dm_time": 20.1, "color": 15138834, "mode": 1},
    {"text": "太精彩了", "dm_time": 25.8, "color": 16777215, "mode": 1},
    {"text": "这就很舒服", "dm_time": 32.5, "color": 14893055, "mode": 1},
    {"text": "哈哈哈哈", "dm_time": 38.0, "color": 16777215, "mode": 1},
    {"text": "素质三连", "dm_time": 45.2, "color": 6744191, "mode": 1},
    {"text": "火钳刘明", "dm_time": 52.6, "color": 15138834, "mode": 1},
]

MOCK_USER = {
    "mid": 999999,
    "name": "测试用户",
    "sex": "保密",
    "face": "https://i0.hdslb.com/bfs/face/member/noface.jpg",
    "sign": "这是测试用户的签名",
    "level": 5,
    "following": 128,
    "follower": 2560,
    "likes": 89000
}

MOCK_FAVORITE_FOLDERS = {
    "list": [
        {"id": 123, "title": "默认收藏夹", "media_count": 45},
        {"id": 124, "title": "音乐", "media_count": 128},
        {"id": 125, "title": "学习", "media_count": 56},
        {"id": 126, "title": "美食", "media_count": 32}
    ]
}

MOCK_HISTORY = {
    "list": [
        {
            "title": "【官方MV】周杰伦 - 稻香",
            "cover": "https://i0.hdslb.com/bfs/archive/6bc33d2d089e54653b02c41db72ec74c5008a11a.jpg",
            "author_name": "周杰伦音乐台",
            "history": {"bvid": "BV1xx411c7mD", "oid": 123456},
            "stat": {"view": 15230000, "danmaku": 125000},
            "desc": "还记得你说家是唯一的城堡"
        },
        {
            "title": "【4K60FPS】邓紫棋《光年之外》GEM现场版！",
            "cover": "https://i0.hdslb.com/bfs/archive/e70f6b7d8ed7e6b8a8c8f4e6a3b7c8d9e0f1a2b3c.jpg",
            "author_name": "GEM邓紫棋",
            "history": {"bvid": "BV1vx411X7dW", "oid": 234567},
            "stat": {"view": 8900000, "danmaku": 78000},
            "desc": "感受她超强现场唱功！"
        }
    ]
}


def get_mock_video(bvid):
    """获取单个视频信息"""
    for v in MOCK_VIDEOS:
        if v["bvid"] == bvid:
            return v.copy()
    return MOCK_VIDEOS[0].copy()


def search_mock_videos(keyword):
    """搜索模拟视频"""
    results = []
    keyword_lower = keyword.lower()
    for v in MOCK_VIDEOS:
        if keyword_lower in v["title"].lower() or keyword_lower in v["owner"]["name"].lower():
            results.append(v)
    return results if results else MOCK_VIDEOS[:4]