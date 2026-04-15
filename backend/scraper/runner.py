from __future__ import annotations

from typing import Optional

from backend.scraper.config import ScraperRunConfig, ScraperRunResult
from backend.scraper.exceptions import UnsupportedPlatformError
from backend.scraper.progress import JobProgressSink
from backend.scraper.registry import get_scraper_class


def run_scrape_sync(cfg: ScraperRunConfig, job_id: Optional[str] = None) -> ScraperRunResult:
    """
    Dispatch to the correct platform scraper (blocking; call via ``asyncio.to_thread`` from FastAPI).

    When ``job_id`` is set, progress updates are written for ``GET /scraper/jobs/{job_id}``.
    """
    cls = get_scraper_class(cfg.platform)
    if cls is None:
        raise UnsupportedPlatformError(f"Unsupported platform: {cfg.platform}", platform=cfg.platform)
    progress = JobProgressSink(job_id) if job_id else None
    scraper = cls(cfg, progress=progress)
    return scraper.run()
