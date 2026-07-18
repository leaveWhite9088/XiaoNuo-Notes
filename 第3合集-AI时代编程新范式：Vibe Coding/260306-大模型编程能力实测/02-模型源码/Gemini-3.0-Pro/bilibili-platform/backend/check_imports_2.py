import bilibili_api
print(dir(bilibili_api))
try:
    import bilibili_api.login
    print("import bilibili_api.login ok")
except Exception as e:
    print(f"import bilibili_api.login failed: {e}")

try:
    from bilibili_api import login
    print("from bilibili_api import login ok")
except Exception as e:
    print(f"from bilibili_api import login failed: {e}")
