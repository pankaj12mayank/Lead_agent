"""normalize_name, normalize_job_title, normalize_company_name."""

from __future__ import annotations

import re
import unicodedata

_TITLE_ABBREV = (
    (r"\bvp\b", "VP"),
    (r"\bceo\b", "CEO"),
    (r"\bcto\b", "CTO"),
    (r"\bcfo\b", "CFO"),
    (r"\bcoo\b", "COO"),
    (r"\bpm\b", "PM"),
    (r"\bsde\b", "SDE"),
    (r"\bswe\b", "SWE"),
)

# Strip noisy legal suffixes for dedupe / display (keep original in raw if needed elsewhere)
_COMPANY_SUFFIX = re.compile(
    r",?\s*(inc\.?|llc\.?|ltd\.?|limited|corp\.?|corporation|plc|gmbh|pvt\.?\s*ltd\.?)\s*$",
    re.IGNORECASE,
)


def normalize_name(name: str | None) -> str:
    """Unicode NFKC, collapse whitespace, title-case light for person names."""
    if not name:
        return ""
    s = unicodedata.normalize("NFKC", str(name)).strip()
    s = " ".join(s.split())
    if not s:
        return ""
    # Preserve McDonald-style minimally: title case words
    parts = []
    for w in s.split():
        if len(w) <= 2 and w.isalpha():
            parts.append(w.upper() if w.upper() in ("II", "III", "IV", "JR", "SR") else w.title())
        else:
            parts.append(w[:1].upper() + w[1:].lower() if w.isalpha() else w)
    return " ".join(parts)


def normalize_job_title(title: str | None) -> str:
    """Collapse whitespace; normalize common abbreviations to canonical caps."""
    if not title:
        return ""
    s = unicodedata.normalize("NFKC", str(title)).strip()
    s = " ".join(s.split())
    if not s:
        return ""
    for pat, repl in _TITLE_ABBREV:
        s = re.sub(pat, repl, s, flags=re.IGNORECASE)
    return s


def normalize_company_name(company: str | None) -> str:
    """NFKC, whitespace, strip trailing legal entity suffixes for matching."""
    if not company:
        return ""
    s = unicodedata.normalize("NFKC", str(company)).strip()
    s = " ".join(s.split())
    if not s:
        return ""
    s = _COMPANY_SUFFIX.sub("", s).strip().rstrip(",").strip()
    return s
