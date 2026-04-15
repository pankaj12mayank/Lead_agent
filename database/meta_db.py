"""SQLite sidecar for API metadata (users, lead history, custom platforms). Independent of lead STORAGE_MODE."""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from typing import Iterator

import config


def meta_db_path() -> str:
    return getattr(config, "API_META_DB_PATH", "database/api_meta.db")


@contextmanager
def meta_connection() -> Iterator[sqlite3.Connection]:
    path = meta_db_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cx = sqlite3.connect(path)
    cx.row_factory = sqlite3.Row
    try:
        yield cx
        cx.commit()
    finally:
        cx.close()


def init_meta_schema() -> None:
    with meta_connection() as cx:
        cx.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lead_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id TEXT,
                action TEXT NOT NULL,
                detail TEXT,
                user_id TEXT,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_lead_history_lead ON lead_history(lead_id);

            CREATE TABLE IF NOT EXISTS platforms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                label TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS status_history (
                history_id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id TEXT NOT NULL,
                old_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_status_history_lead ON status_history(lead_id);

            CREATE TABLE IF NOT EXISTS email_history (
                email_id TEXT PRIMARY KEY,
                lead_id TEXT NOT NULL,
                recipient_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                status TEXT NOT NULL,
                sent_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_email_history_lead ON email_history(lead_id);
            """
        )
