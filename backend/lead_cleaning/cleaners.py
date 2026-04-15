"""clean_email, clean_phone, clean_url — normalization + rejection rules."""

from __future__ import annotations

import re
from typing import Literal
from urllib.parse import urlparse

from backend.lead_cleaning.disposable import is_disposable_domain

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Obvious test / placeholder phones
_FAKE_PHONE_PATTERNS = (
    re.compile(r"^1?5555551212$"),  # directory assistance
    re.compile(r"^0{7,15}$"),
    re.compile(r"^1{7,15}$"),
    re.compile(r"^1234567890$"),
)


def clean_email(value: str | None) -> str:
    """Lowercase, strip, validate format, reject disposable domains. Returns '' if invalid."""
    raw = (value or "").strip().lower()
    if not raw:
        return ""
    if "@" not in raw:
        return ""
    local, _, domain = raw.partition("@")
    if not local or not domain:
        return ""
    if is_disposable_domain(domain):
        return ""
    if not _EMAIL_RE.match(raw):
        return ""
    return raw


def _digits_only(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def clean_phone(value: str | None) -> str:
    """
    Strip formatting; reject too-short, all-same-digit, obvious fake patterns.
    Returns E.164-ish string (digits only, US-centric min 10 digits) or ''.
    """
    raw = (value or "").strip()
    if not raw:
        return ""
    d = _digits_only(raw)
    if len(d) < 10:
        return ""
    if len(d) > 15:
        return ""
    if len(set(d)) <= 1:
        return ""
    # North American numbering: reject 555-01XX block (often fictional)
    if len(d) >= 10:
        core = d[-10:]
        if core[3:6] == "555" and core[6:8] in ("01", "00"):
            return ""
    for pat in _FAKE_PHONE_PATTERNS:
        if pat.match(d):
            return ""
    return d


def clean_url(
    value: str | None,
    kind: Literal["linkedin", "website", "auto"] = "auto",
) -> str:
    """
    Normalize scheme, strip fragments where useful, validate host shape.
    ``linkedin`` requires linkedin.com; ``website`` rejects linkedin-only hosts.
    """
    u = (value or "").strip()
    if not u:
        return ""
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", u):
        u = "https://" + u.lstrip("/")
    try:
        p = urlparse(u)
    except Exception:
        return ""
    if not p.netloc:
        return ""
    host = p.netloc.lower()
    path = (p.path or "").lower()

    resolved_kind = kind
    if kind == "auto":
        resolved_kind = "linkedin" if "linkedin.com" in host else "website"

    if resolved_kind == "linkedin":
        if "linkedin.com" not in host:
            return ""
        if "/in/" not in path and "/company/" not in path and "/school/" not in path and "/sales/" not in path:
            # Allow bare profile URLs that still point to linkedin
            if path in ("", "/") and "/in/" not in u.lower():
                return ""
        return u.split("#", 1)[0].rstrip("/")

    # website
    if host.endswith("linkedin.com"):
        return ""
    if host in ("localhost", "127.0.0.1", "0.0.0.0"):
        return ""
    if len(host) < 3 or "." not in host:
        return ""
    return u.split("#", 1)[0].rstrip("/")


def is_valid_email_format(value: str | None) -> bool:
    return bool(clean_email(value))


def is_valid_linkedin_url(value: str | None) -> bool:
    return bool(clean_url(value, "linkedin"))


def is_valid_company_website_url(value: str | None) -> bool:
    return bool(clean_url(value, "website"))
