import asyncio
from bilibili_api import login_v2
import ssl

async def main():
    print("Starting...")
    qr = login_v2.QrCodeLogin()
    await qr.generate_qrcode()
    print("Generated QR Code")
    print(f"Dir: {dir(qr)}")
    # Check private attributes if needed, but usually there's a getter
    # get_qrcode_picture()
    pic = qr.get_qrcode_picture()
    print(f"Picture: {pic}")
    if hasattr(pic, 'url'):
        print(f"Picture URL: {pic.url}")
    
    # Check key?
    # Maybe check_state uses internal key?
    
if __name__ == '__main__':
    # SSL fix already verified via env var
    asyncio.run(main())
