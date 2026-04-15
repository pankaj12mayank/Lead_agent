"""remove_duplicates — fingerprint-based deduplication."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple

from backend.lead_cleaning.cleaners import clean_email, clean_url
from backend.lead_cleaning.normalizers import normalize_company_name, normalize_name


def _row_fingerprint(row: Dict[str, Any]) -> str:
    """Stable key: prefer email, else LinkedIn URL path, else company+name."""
    email = clean_email(row.get("email") or row.get("Email"))
    if email:
        return f"e:{email}"
    li = clean_url(
        row.get("linkedin_url") or row.get("profile_url") or row.get("linkedin"),
        "linkedin",
    )
    if li:
        return f"l:{li.lower()}"
    fn = normalize_name(row.get("full_name") or row.get("name") or "")
    co = normalize_company_name(row.get("company_name") or row.get("company") or "")
    if fn or co:
        return f"n:{fn.lower()}|{co.lower()}"
    # last resort — entire row hash (keeps unique empty-ish rows separate)
    return "h:" + json.dumps(row, sort_keys=True, default=str)[:200]


def remove_duplicates(rows: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    """
    Remove duplicate leads using email → LinkedIn → (name+company) fingerprint.
    Returns (deduplicated_rows, number_of_duplicates_removed).
    """
    seen: set[str] = set()
    out: List[Dict[str, Any]] = []
    dups = 0
    for r in rows:
        fp = _row_fingerprint(r)
        if fp in seen:
            dups += 1
            continue
        seen.add(fp)
        out.append(r)
    return out, dups
