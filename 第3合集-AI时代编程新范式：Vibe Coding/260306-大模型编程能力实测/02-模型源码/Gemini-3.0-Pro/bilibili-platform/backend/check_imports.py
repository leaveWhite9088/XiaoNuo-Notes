try:
    from bilibili_api import video
    print("video ok")
    from bilibili_api import comment
    print("comment ok")
    from bilibili_api import user
    print("user ok")
    from bilibili_api import login
    print("login ok")
    from bilibili_api import sync
    print("sync ok")
    from bilibili_api import Credential
    print("Credential ok")
except Exception as e:
    print(f"Error: {e}")
