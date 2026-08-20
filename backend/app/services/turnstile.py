import json
import os
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify_turnstile(token: str, remote_ip: str) -> None:
    secret_key = os.getenv("TURNSTILE_SECRET_KEY", "")
    environment = os.getenv("APP_ENV", "development")

    if not secret_key:
        if environment == "production":
            raise HTTPException(
                status_code=503,
                detail="La protección antiabuso no está configurada.",
            )
        return

    if not token:
        raise HTTPException(status_code=403, detail="Completa la verificación de seguridad.")

    payload = urlencode(
        {"secret": secret_key, "response": token, "remoteip": remote_ip}
    ).encode()
    request = Request(VERIFY_URL, data=payload, method="POST")

    try:
        with urlopen(request, timeout=5) as response:
            verification = json.load(response)
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=503,
            detail="No fue posible validar la verificación de seguridad.",
        ) from error

    if not verification.get("success"):
        raise HTTPException(status_code=403, detail="Verificación de seguridad inválida.")