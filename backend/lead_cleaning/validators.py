"""validate_record — full-row validation after cleaning."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from backend.lead_cleaning.cleaners import (
    clean_email,
    clean_phone,
    clean_url,
    is_valid_company_website_url,
    is_valid_email_format,
    is_valid_linkedin_url,
)


def _has_any_contact(row: Dict[str, Any]) -> bool:
    e = clean_email(row.get("email"))
    li = clean_url(row.get("linkedin_url") or row.get("profile_url"), "linkedin")
    web = clean_url(row.get("company_website") or row.get("website"), "website")
    ph = clean_phone(row.get("phone"))
    return bool(e or li or web or ph)


def _is_row_empty(row: Dict[str, Any]) -> bool:
    keys = (
        "full_name",
        "name",
        "email",
        "phone",
        "linkedin_url",
        "profile_url",
        "company_website",
        "website",
        "company_name",
        "company",
        "title",
    )
    return not any(str(row.get(k) or "").strip() for k in keys)


def validate_record(row: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Return (is_valid, error_messages).
    Requires: non-empty row, a name field, and at least one valid contact vector
    (valid email OR valid LinkedIn OR valid website OR plausible phone).
    """
    errors: List[str] = []
    if _is_row_empty(row):
        return False, ["empty_row"]

    name = str(row.get("full_name") or row.get("name") or "").strip()
    if not name:
        errors.append("missing_name")

    email_raw = row.get("email")
    if email_raw and str(email_raw).strip() and not is_valid_email_format(str(email_raw)):
        errors.append("invalid_email")

    li_raw = row.get("linkedin_url") or row.get("profile_url")
    if li_raw and str(li_raw).strip() and not is_valid_linkedin_url(str(li_raw)):
        errors.append("invalid_linkedin_url")

    web_raw = row.get("company_website") or row.get("website")
    if web_raw and str(web_raw).strip() and not is_valid_company_website_url(str(web_raw)):
        errors.append("invalid_company_website")

    if not _has_any_contact(row):
        errors.append("no_valid_contact")

    return len(errors) == 0, errors
