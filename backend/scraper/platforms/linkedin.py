from __future__ import annotations

from typing import Any, ClassVar, Dict, List
from urllib.parse import quote_plus

from playwright.sync_api import Page

from backend.scraper.base import BaseScraper


class LinkedInScraper(BaseScraper):
    slug: ClassVar[str] = "linkedin"

    def build_search_url(self) -> str:
        kw = quote_plus(self.cfg.keyword)
        base = f"https://www.linkedin.com/search/results/people/?keywords={kw}"
        return base + self.filter_query_string()

    def extract_from_page(self, page: Page) -> List[Dict[str, Any]]:
        # TODO: site-specific selectors; respect LinkedIn ToS & rate limits.
        return []
