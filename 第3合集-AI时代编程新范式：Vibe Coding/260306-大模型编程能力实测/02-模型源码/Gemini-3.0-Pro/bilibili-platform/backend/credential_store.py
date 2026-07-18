import json
import os
from bilibili_api import Credential

CREDENTIAL_FILE = "credentials.json"

def save_credential(credential: Credential):
    data = {
        "sessdata": credential.sessdata,
        "bili_jct": credential.bili_jct,
        "buvid3": credential.buvid3,
        "dedeuserid": credential.dedeuserid,
        "ac_time_value": credential.ac_time_value
    }
    with open(CREDENTIAL_FILE, "w") as f:
        json.dump(data, f)

def load_credential() -> Credential:
    if not os.path.exists(CREDENTIAL_FILE):
        return None
    try:
        with open(CREDENTIAL_FILE, "r") as f:
            data = json.load(f)
        return Credential(
            sessdata=data.get("sessdata"),
            bili_jct=data.get("bili_jct"),
            buvid3=data.get("buvid3"),
            dedeuserid=data.get("dedeuserid"),
            ac_time_value=data.get("ac_time_value")
        )
    except:
        return None
