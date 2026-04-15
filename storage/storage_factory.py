from __future__ import annotations

from functools import lru_cache
from typing import Literal

import config
from storage.base_storage import BaseStorage
from storage.csv_storage import CsvStorage
from storage.postgres_storage import PostgresStorage
from storage.sqlite_storage import SqliteStorage

StorageMode = Literal["csv", "sqlite", "postgres"]


@lru_cache(maxsize=1)
def get_storage(mode: str | None = None) -> BaseStorage:
    """
    Return the configured storage backend (singleton per process).
    `mode` overrides config.STORAGE_MODE when provided (mostly for tests).
    """
    m = (mode or getattr(config, "STORAGE_MODE", "csv")).lower().strip()
    if m not in ("csv", "sqlite", "postgres"):
        m = "csv"
    if m == "csv":
        return CsvStorage()
    if m == "sqlite":
        return SqliteStorage()
    return PostgresStorage()


def reset_storage_cache() -> None:
    get_storage.cache_clear()
