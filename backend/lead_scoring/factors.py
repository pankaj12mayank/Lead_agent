"""
Point contributions per scoring factor (sums are clamped to 1–100 in the engine).
Maxima per factor add up to 100.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Tuple

# --- Max points per factor (must sum to 100) ---
MAX_COMPANY_SIZE = 12
MAX_JOB_ROLE = 15
MAX_COUNTRY = 10
MAX_WEBSITE = 10
MAX_EMAIL = 12
MAX_PLATFORM = 15
MAX_INDUSTRY = 16
MAX_BUDGET = 10

_TIER1_COUNTRIES = frozenset(
    {
        "us",
        "usa",
        "united states",
        "uk",
        "gb",
        "united kingdom",
        "ca",
        "canada",
        "de",
        "germany",
        "au",
        "australia",
        "nl",
        "netherlands",
        "sg",
        "singapore",
        "ch",
        "switzerland",
    }
)

_EXEC_TITLES = (
    "ceo",
    "cto",
    "cfo",
    "coo",
    "cmo",
    "cpo",
    "chief",
    "founder",
    "co-founder",
    "cofounder",
    "president",
    "owner",
)
_VP_TITLES = ("vp", "vice president", "svp", "evp", "head of", "director", "dir ")
_MANAGER = ("manager", "lead", "principal", "staff")


def _txt(lead: Dict[str, Any], *keys: str) -> str:
    parts: list[str] = []
    for k in keys:
        v = lead.get(k)
        if v is not None and str(v).strip():
            parts.append(str(v).lower())
    return " ".join(parts)


def score_company_size(lead: Dict[str, Any]) -> Tuple[float, str]:
    raw = str(lead.get("company_size") or lead.get("employees") or "").strip().lower()
    if not raw:
        return 0.0, "No company size -> 0"
    # Heuristic buckets (free text or ranges)
    if any(x in raw for x in ("10000", "10001", "enterprise", "5000+", "1000+")):
        return float(MAX_COMPANY_SIZE), f"Large / enterprise size -> +{MAX_COMPANY_SIZE}"
    if any(x in raw for x in ("500", "501-1000", "1001", "200-500", "mid")):
        return 9.0, "Mid-market company size -> +9"
    if any(x in raw for x in ("50", "51-200", "200", "smb", "11-50")):
        return 6.0, "SMB size -> +6"
    if any(x in raw for x in ("1-10", "startup", "1-50", "micro")):
        return 3.0, "Small team / startup -> +3"
    return 2.0, "Company size present (generic) -> +2"


def score_job_role(lead: Dict[str, Any]) -> Tuple[float, str]:
    title = _txt(lead, "title", "job_title")
    if not title:
        return 0.0, "No job title -> 0"
    if any(x in title for x in _EXEC_TITLES):
        return float(MAX_JOB_ROLE), f"Executive / founder role -> +{MAX_JOB_ROLE}"
    if "vice president" in title or re.search(r"\bvp\b", title) or any(x in title for x in _VP_TITLES):
        return 12.0, "VP / Director-level title -> +12"
    if any(x in title for x in _MANAGER):
        return 7.0, "Manager / lead IC -> +7"
    return 4.0, "Title present (IC) -> +4"


def score_country(lead: Dict[str, Any]) -> Tuple[float, str]:
    country = str(lead.get("country") or "").strip().lower()
    loc = str(lead.get("location") or "").strip().lower()
    blob = f"{country} {loc}"
    if not blob.strip():
        return 0.0, "No country / location -> 0"
    tokens = re.split(r"[\s,;/|]+", blob)
    for t in tokens:
        t2 = t.strip().rstrip(".")
        if t2 in _TIER1_COUNTRIES or (len(t2) == 2 and t2.isalpha() and t2 in ("us", "uk", "de", "in")):
            return float(MAX_COUNTRY), f"Tier-1 geography signal ({t2}) -> +{MAX_COUNTRY}"
    if "india" in blob or " bharat" in blob:
        return 7.0, "India / high-volume market -> +7"
    return 4.0, "Location / country present -> +4"


def score_website_availability(lead: Dict[str, Any]) -> Tuple[float, str]:
    w = str(lead.get("company_website") or lead.get("website") or "").strip()
    if not w:
        return 0.0, "No company website -> 0"
    if w.startswith("http") and "." in w:
        return float(MAX_WEBSITE), f"Website URL present -> +{MAX_WEBSITE}"
    return 5.0, "Website hint present -> +5"


def score_email_availability(lead: Dict[str, Any]) -> Tuple[float, str]:
    e = str(lead.get("email") or "").strip().lower()
    if not e or "@" not in e:
        return 0.0, "No email -> 0"
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", e):
        return 3.0, "Email-like string (weak format) -> +3"
    corp = ("gmail.com", "yahoo.", "hotmail.", "outlook.", "icloud.")
    if any(e.endswith(d) or d in e for d in corp):
        return 6.0, "Consumer email (lower trust) -> +6"
    return float(MAX_EMAIL), f"Corporate-looking email -> +{MAX_EMAIL}"


def score_platform_source(lead: Dict[str, Any]) -> Tuple[float, str]:
    p = str(lead.get("source_platform") or lead.get("platform") or "").strip().lower()
    table = {
        "apollo": 15,
        "linkedin": 14,
        "upwork": 13,
        "crunchbase": 12,
        "wellfound": 11,
        "clutch": 10,
        "google_maps": 9,
        "justdial": 8,
        "fiverr": 7,
    }
    pts = float(table.get(p, 5 if p else 0))
    if not p:
        return 0.0, "No platform source -> 0"
    return min(float(MAX_PLATFORM), pts), f"Platform '{p}' -> +{int(pts)}"


def score_industry_match(lead: Dict[str, Any], benchmark: str | None) -> Tuple[float, str]:
    if not benchmark or not str(benchmark).strip():
        return 0.0, "No benchmark industry configured -> 0"
    ind = str(lead.get("industry") or "").strip().lower()
    notes = str(lead.get("notes") or "").strip().lower()
    company = str(lead.get("company_name") or lead.get("company") or "").strip().lower()
    bench = str(benchmark).strip().lower()
    hay = f"{ind} {notes} {company}"
    if bench and bench in hay:
        return float(MAX_INDUSTRY), f"Industry aligned with '{benchmark}' -> +{MAX_INDUSTRY}"
    # partial token overlap
    btoks = set(re.split(r"[\s,;/]+", bench)) - {""}
    htoks = set(re.split(r"[\s,;/]+", hay)) - {""}
    overlap = btoks & htoks
    if overlap:
        return 8.0, f"Industry token overlap {overlap} -> +8"
    if ind:
        return 2.0, "Industry field populated (weak match) -> +2"
    return 0.0, "No industry signal -> 0"


def score_budget_potential(lead: Dict[str, Any]) -> Tuple[float, str]:
    blob = _txt(lead, "title", "job_title", "notes", "full_name", "name")
    if not blob:
        return 0.0, "No text for budget signals -> 0"
    strong = ("rfp", "request for proposal", "procurement", "vendor selection", "tender", "budget approved", "capex")
    weak = ("budget", "purchasing", "buying committee", "evaluation", "pilot", "poc", "proof of concept")
    for kw in strong:
        if kw in blob:
            return float(MAX_BUDGET), f"Strong budget / procurement signal ('{kw}') -> +{MAX_BUDGET}"
    for kw in weak:
        if kw in blob:
            return 6.0, f"Weak budget signal ('{kw}') -> +6"
    return 0.0, "No budget keywords -> 0"
