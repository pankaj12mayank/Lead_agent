from __future__ import annotations

from backend.scraper.config import ScraperRunConfig, ScraperRunResult
from backend.scraper.exceptions import UnsupportedPlatformError
from backend.scraper.registry import get_scraper_class


def run_scrape_sync(cfg: ScraperRunConfig) -> ScraperRunResult:
    """Dispatch to the correct platform scraper (blocking; call via ``asyncio.to_thread`` from FastAPI)."""
    cls = get_scraper_class(cfg.platform)
    if cls is None:
        raise UnsupportedPlatformError(f"Unsupported platform: {cfg.platform}", platform=cfg.platform)
    scraper = cls(cfg)
    return scraper.run()
