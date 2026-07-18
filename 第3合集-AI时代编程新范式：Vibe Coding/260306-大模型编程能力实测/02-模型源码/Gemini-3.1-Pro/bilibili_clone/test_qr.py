import asyncio
from bilibili_api.login_v2 import QrCodeLogin

async def main():
    q = QrCodeLogin()
    await q.generate_qrcode()
    print(q.__dict__)

asyncio.run(main())
