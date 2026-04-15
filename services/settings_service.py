from __future__ import annotations

import json
import os
from typing import Any, Dict

_ROOT = os.path.dirname(os.path.dirname(__file__))
SETTINGS_PATH = os.path.join(_ROOT, "data", "runtime_settings.json")


def _defaults() -> Dict[str, Any]:
    return {
        "storage_mode": "csv",
        "notes": "Local runtime overrides; optional.",
        "smtp_host": "",
        "smtp_port": "",
        "smtp_email": "",
        "smtp_password": "",
        "smtp_use_tls": "",
        "sender_name": "",
        "sender_email": "",
        "email_signature": "",
        "platform_integrations": {},
    }


def load_settings() -> Dict[str, Any]:
    if not os.path.isfile(SETTINGS_PATH):
        return _defaults()
    try:
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        base = _defaults()
        base.update(data)
        return base
    except Exception:
        return _defaults()


def save_settings(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(SETTINGS_PATH), exist_ok=True)
    with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def patch_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    cur = load_settings()
    for k, v in updates.items():
        if v is not None:
            cur[k] = v
    save_settings(cur)
    return load_settings()
