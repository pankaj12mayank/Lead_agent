"""Playwright + BeautifulSoup scraping (MVP: stubs; wire browsers in Phase 2)."""

from __future__ import annotations

from typing import Any, Dict


async def scrape_profile_preview(url: str, platform: str) -> Dict[str, Any]:
    """
    Fetch public profile HTML and return structured fields.
    Not implemented yet — use `sessions/` for Playwright storageState when added.
    """
    return {
        "ok": False,
        "url": url,
        "platform": platform,
        "detail": "scraper_not_implemented",
    }
