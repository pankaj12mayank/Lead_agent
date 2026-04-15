"""SQLite schema management and migration bookkeeping."""

from __future__ import annotations

import os
import sqlite3
from typing import List


def _migration_files() -> List[str]:
    base = os.path.join(os.path.dirname(__file__), "migrations")
    if not os.path.isdir(base):
        return []
    files = sorted(f for f in os.listdir(base) if f.endswith(".sql"))
    return [os.path.join(base, f) for f in files]


def ensure_sqlite_schema(db_path: str) -> None:
    """Apply pending SQL migrations tracked in schema_migrations."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    with sqlite3.connect(db_path) as cx:
        cx.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT UNIQUE NOT NULL,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        applied = {
            row[0]
            for row in cx.execute("SELECT version FROM schema_migrations").fetchall()
        }
        for path in _migration_files():
            version = os.path.basename(path)
            if version in applied:
                continue
            with open(path, "r", encoding="utf-8") as f:
                sql = f.read()
            cx.executescript(sql)
            cx.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)", (version,)
            )
        cx.commit()
