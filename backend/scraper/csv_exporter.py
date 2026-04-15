from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

import config as app_config


def export_raw_rows_to_csv(rows: List[Dict[str, Any]], dest_path: str) -> str:
    """Write raw dict rows to CSV (creates parent directories)."""
    path = Path(dest_path).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows or []).to_csv(str(path), index=False)
    return str(path)


def default_raw_export_path(platform: str, run_id: str) -> str:
    app_config.ensure_data_dirs()
    return os.path.join(app_config.EXPORTS_DIR, f"raw_scrape_{platform}_{run_id}.csv")
