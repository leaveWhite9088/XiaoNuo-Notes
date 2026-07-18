from __future__ import annotations

import asyncio
import base64
import json
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from bilibili_api import Credential, login_v2

from app.services import bili_client


@dataclass
class QrSession:
    qr_login: login_v2.QrCodeLogin
    created_at: float


class AuthStore:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()
        self._credential_data: dict[str, Any] | None = None
        self._qr_sessions: dict[str, QrSession] = {}
        self._load()

    def _load(self) -> None:
        if self.path.exists():
            try:
                self._credential_data = json.loads(self.path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                self._credential_data = None

    def _save(self) -> None:
        if self._credential_data is None:
            if self.path.exists():
                self.path.unlink()
            return
        self.path.write_text(
            json.dumps(self._credential_data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def get_credential(self) -> Credential | None:
        if not self._credential_data:
            return None
        return Credential(
            sessdata=self._credential_data.get("sessdata"),
            bili_jct=self._credential_data.get("bili_jct"),
            buvid3=self._credential_data.get("buvid3"),
            buvid4=self._credential_data.get("buvid4"),
            dedeuserid=self._credential_data.get("dedeuserid"),
            ac_time_value=self._credential_data.get("ac_time_value"),
        )

    async def set_cookie_credential(self, payload: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            self._credential_data = {
                "sessdata": payload.get("sessdata", "").strip(),
                "bili_jct": (payload.get("bili_jct") or "").strip() or None,
                "buvid3": (payload.get("buvid3") or "").strip() or None,
                "buvid4": (payload.get("buvid4") or "").strip() or None,
                "dedeuserid": (payload.get("dedeuserid") or "").strip() or None,
                "ac_time_value": (payload.get("ac_time_value") or "").strip() or None,
            }
            if not self._credential_data["sessdata"]:
                raise ValueError("SESSDATA 不能为空。")
            self._save()
            credential = self.get_credential()
        return await bili_client.get_self_info(credential=credential)  # type: ignore[arg-type]

    async def set_credential_obj(self, credential: Credential) -> None:
        async with self._lock:
            self._credential_data = {
                "sessdata": credential.sessdata,
                "bili_jct": credential.bili_jct,
                "buvid3": credential.buvid3,
                "buvid4": credential.buvid4,
                "dedeuserid": credential.dedeuserid,
                "ac_time_value": credential.ac_time_value,
            }
            self._save()

    async def clear(self) -> None:
        async with self._lock:
            self._credential_data = None
            self._save()
            self._qr_sessions.clear()

    async def get_status(self) -> dict[str, Any]:
        credential = self.get_credential()
        if not credential:
            return {"logged_in": False, "user": None}
        try:
            user_info = await bili_client.get_self_info(credential)
            return {"logged_in": True, "user": user_info}
        except Exception as exc:
            return {"logged_in": False, "user": None, "error": str(exc)}

    async def start_qr_login(self) -> dict[str, Any]:
        qr_login = login_v2.QrCodeLogin()
        await qr_login.generate_qrcode()
        pic = qr_login.get_qrcode_picture()
        session_id = str(uuid.uuid4())
        content = pic.content or b""
        img_b64 = base64.b64encode(content).decode("utf-8")
        async with self._lock:
            now = time.time()
            stale = [
                sid
                for sid, sess in self._qr_sessions.items()
                if now - sess.created_at > 180
            ]
            for sid in stale:
                self._qr_sessions.pop(sid, None)
            self._qr_sessions[session_id] = QrSession(
                qr_login=qr_login, created_at=time.time()
            )
        return {"session_id": session_id, "image_base64": img_b64}

    async def poll_qr_login(self, session_id: str) -> dict[str, Any]:
        async with self._lock:
            session = self._qr_sessions.get(session_id)
        if not session:
            raise KeyError("二维码会话不存在或已过期。")

        event = await session.qr_login.check_state()
        event_name = event.value

        if event_name == "done":
            credential = session.qr_login.get_credential()
            await self.set_credential_obj(credential)
            user_info = await bili_client.get_self_info(credential)
            async with self._lock:
                self._qr_sessions.pop(session_id, None)
            return {
                "event": event_name,
                "logged_in": True,
                "user": user_info,
            }

        if event_name == "timeout":
            async with self._lock:
                self._qr_sessions.pop(session_id, None)
            return {"event": event_name, "logged_in": False, "user": None}

        return {"event": event_name, "logged_in": False, "user": None}
