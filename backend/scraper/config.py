from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import config as app_config


@dataclass
class ScraperRunConfig:
    """Single scrape job parameters (keyword + filters + safety caps)."""

    platform: str
    keyword: str
    country: str = ""
    industry: str = ""
    company_size: str = ""
    max_leads: Optional[int] = None
    delay_min_seconds: Optional[float] = None
    delay_max_seconds: Optional[float] = None
    headless: bool = True
    max_scroll_rounds: int = 12

    def __post_init__(self) -> None:
        self.platform = self.platform.strip().lower().replace(" ", "_")
        if self.max_leads is None:
            self.max_leads = int(app_config.SCRAPER_MAX_LEADS_DEFAULT)
        if self.delay_min_seconds is None:
            self.delay_min_seconds = float(app_config.SCRAPER_DELAY_MIN_SECONDS)
        if self.delay_max_seconds is None:
            self.delay_max_seconds = float(app_config.SCRAPER_DELAY_MAX_SECONDS)
        cap = int(getattr(app_config, "SCRAPER_MAX_LEADS_HARD_CAP", 50))
        if self.max_leads < 1:
            raise ValueError("max_leads must be >= 1")
        if self.max_leads > cap:
            raise ValueError(f"max_leads cannot exceed {cap}")
        if self.delay_min_seconds < 1 or self.delay_max_seconds < self.delay_min_seconds:
            raise ValueError("Invalid delay range")

    def effective_delays(self) -> tuple[float, float]:
        """Clamp to safe human-like pacing (target 3–5s between actions)."""
        lo = max(3.0, min(float(self.delay_min_seconds), 5.0))
        hi = max(lo, min(float(self.delay_max_seconds), 5.0))
        return lo, hi


@dataclass
class ScraperRunResult:
    run_id: str
    platform: str
    collected: int
    csv_path: Optional[str]
    errors: list[str] = field(default_factory=list)
