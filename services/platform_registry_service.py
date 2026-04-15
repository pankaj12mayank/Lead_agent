"""Custom platforms in meta DB; canonical list stays in connectors.platforms."""

from __future__ import annotations

import sqlite3
from typing import Any, Dict, List, Optional

from connectors.platforms import PLATFORM_CANONICAL
from database.meta_db import init_meta_schema, meta_connection
from settings.lead_schema import utc_now_iso


def create_platform(slug: str, label: str) -> Dict[str, Any]:
    init_meta_schema()
    s = slug.strip().lower().replace(" ", "_")
    if s in PLATFORM_CANONICAL or s == "other":
        raise ValueError("reserved_slug")
    with meta_connection() as cx:
        try:
            cx.execute(
                "INSERT INTO platforms (slug, label, active, created_at) VALUES (?, ?, 1, ?)",
                (s, label.strip(), utc_now_iso()),
            )
        except sqlite3.IntegrityError:
            raise ValueError("slug_taken") from None
        cur = cx.execute("SELECT last_insert_rowid()")
        pid = int(cur.fetchone()[0])
    return get_platform(pid)


def get_platform(platform_id: int) -> Optional[Dict[str, Any]]:
    init_meta_schema()
    with meta_connection() as cx:
        cur = cx.execute(
            "SELECT id, slug, label, active, created_at FROM platforms WHERE id = ?",
            (platform_id,),
        )
        r = cur.fetchone()
        if not r:
            return None
        return _row_to_dict(r)


def list_custom() -> List[Dict[str, Any]]:
    init_meta_schema()
    with meta_connection() as cx:
        cur = cx.execute(
            "SELECT id, slug, label, active, created_at FROM platforms ORDER BY id ASC"
        )
        return [_row_to_dict(r) for r in cur.fetchall()]


def _row_to_dict(r: Any) -> Dict[str, Any]:
    return {
        "platform_id": r["id"],
        "slug": r["slug"],
        "label": r["label"],
        "active": bool(r["active"]),
        "created_at": r["created_at"],
        "builtin": False,
    }


def update_platform(platform_id: int, label: Optional[str], active: Optional[bool]) -> Optional[Dict[str, Any]]:
    current = get_platform(platform_id)
    if not current:
        return None
    if label is not None:
        current["label"] = label
    if active is not None:
        current["active"] = active
    with meta_connection() as cx:
        cx.execute(
            "UPDATE platforms SET label = ?, active = ? WHERE id = ?",
            (current["label"], 1 if current["active"] else 0, platform_id),
        )
    return get_platform(platform_id)


def delete_platform(platform_id: int) -> bool:
    init_meta_schema()
    with meta_connection() as cx:
        cur = cx.execute("DELETE FROM platforms WHERE id = ?", (platform_id,))
        return cur.rowcount > 0
