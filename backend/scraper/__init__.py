"""
Multi-platform Playwright scraper (manual login, persistent sessions, safe delays).
"""

from backend.scraper.registry import PLATFORMS, get_scraper_class, list_platform_slugs
from backend.scraper.runner import run_scrape_sync

__all__ = ["PLATFORMS", "get_scraper_class", "list_platform_slugs", "run_scrape_sync"]
