from __future__ import annotations
import base64
from typing import Optional, Any
from cryptography.fernet import Fernet
import orjson


def get_fernet(phi_enc_key_b64: Optional[str]) -> Optional[Fernet]:
    if not phi_enc_key_b64:
        return None
    try:
        # Expect a base64 urlsafe 32-byte key
        # If an arbitrary 32 raw bytes string was provided, encode to base64 first
        try:
            base64.urlsafe_b64decode(phi_enc_key_b64)
            key = phi_enc_key_b64.encode("utf-8")
        except Exception:
            key = base64.urlsafe_b64encode(phi_enc_key_b64.encode("utf-8"))
        return Fernet(key)
    except Exception:
        return None


def phi_encrypt_json(data: Any, fernet: Optional[Fernet]) -> Optional[str]:
    if not fernet:
        return None
    payload = orjson.dumps(data)
    token = fernet.encrypt(payload)
    return token.decode("utf-8")


def phi_decrypt_json(token: str, fernet: Optional[Fernet]) -> Optional[Any]:
    if not fernet or not token:
        return None
    payload = fernet.decrypt(token.encode("utf-8"))
    return orjson.loads(payload)
