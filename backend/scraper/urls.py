"""Login / search entry URLs per platform (manual login starts here)."""

from __future__ import annotations

LOGIN_START_URLS: dict[str, str] = {
    "linkedin": "https://www.linkedin.com/login",
    "apollo": "https://app.apollo.io/#/login",
    "upwork": "https://www.upwork.com/ab/account-security/login",
    "fiverr": "https://www.fiverr.com/login",
    "clutch": "https://clutch.co/",
    "crunchbase": "https://www.crunchbase.com/login",
    "wellfound": "https://wellfound.com/login",
    "google_maps": "https://www.google.com/maps",
    "justdial": "https://www.justdial.com/",
}


def supported_platforms() -> tuple[str, ...]:
    return tuple(sorted(LOGIN_START_URLS))


def login_url(platform_slug: str) -> str:
    key = platform_slug.strip().lower().replace(" ", "_")
    if key not in LOGIN_START_URLS:
        raise KeyError(platform_slug)
    return LOGIN_START_URLS[key]
