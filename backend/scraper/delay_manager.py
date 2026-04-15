from __future__ import annotations

import random
import time
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.scraper.config import ScraperRunConfig


class DelayManager:
    """Randomized human-like pauses between Playwright actions (default 3–5s)."""

    def __init__(self, lo_seconds: float, hi_seconds: float) -> None:
        self._lo = float(lo_seconds)
        self._hi = float(hi_seconds)

    @classmethod
    def from_config(cls, cfg: "ScraperRunConfig") -> "DelayManager":
        lo, hi = cfg.effective_delays()
        return cls(lo, hi)

    def between_actions(self) -> float:
        """Sleep a random duration; returns seconds slept."""
        seconds = random.uniform(self._lo, self._hi)
        time.sleep(seconds)
        return seconds

    def short_jitter(self, lo: float = 0.4, hi: float = 1.2) -> None:
        time.sleep(random.uniform(lo, hi))
