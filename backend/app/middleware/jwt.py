from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt

import config


def create_access_token(subject_user_id: str, extra_claims: Dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=config.JWT_EXPIRE_MINUTES)
    payload: Dict[str, Any] = {"sub": subject_user_id, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, config.SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
