from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any, ClassVar, Dict, List
from urllib.parse import quote_plus

from playwright.sync_api import Page, sync_playwright

from backend.scraper.config import ScraperRunConfig, ScraperRunResult
from backend.scraper.delay_manager import DelayManager
from backend.scraper.exceptions import SessionMissingError
from backend.scraper.raw_lead_saver import RawLeadSaver
from backend.scraper.session_manager import SessionManager
from utils.logger import get_logger

logger = get_logger(__name__)


class BaseScraper(ABC):
    """
    Playwright sync scraper template: persistent session, random delays, scroll + extract loop.

    Subclasses implement ``build_search_url`` and ``extract_from_page`` (selectors per site).
    """

    slug: ClassVar[str]

    def __init__(
        self,
        cfg: ScraperRunConfig,
        *,
        delay: DelayManager | None = None,
        sessions: SessionManager | None = None,
        saver: RawLeadSaver | None = None,
    ) -> None:
        self.cfg = cfg
        self.delay = delay or DelayManager.from_config(cfg)
        self.sessions = sessions or SessionManager()
        self.saver = saver or RawLeadSaver()

    @abstractmethod
    def build_search_url(self) -> str:
        """Landing URL for keyword + filters (logged-in session required)."""

    def filter_query_string(self) -> str:
        """Append-only filter hints for URLs (platform-specific parsers may ignore)."""
        parts: list[str] = []
        if self.cfg.country:
            parts.append(f"country={quote_plus(self.cfg.country)}")
        if self.cfg.industry:
            parts.append(f"industry={quote_plus(self.cfg.industry)}")
        if self.cfg.company_size:
            parts.append(f"company_size={quote_plus(self.cfg.company_size)}")
        return ("&" + "&".join(parts)) if parts else ""

    def extract_from_page(self, page: Page) -> List[Dict[str, Any]]:
        """Parse visible results into raw dicts. Override per platform."""
        return []

    def run(self) -> ScraperRunResult:
        run_id = RawLeadSaver.new_run_id()
        errors: List[str] = []
        collected: List[Dict[str, Any]] = []

        if not self.sessions.has_session(self.slug):
            raise SessionMissingError(
                f"No persisted browser profile for '{self.slug}'. "
                f"Call POST /scraper/sessions/{self.slug}/manual-login first.",
                platform=self.slug,
            )

        user_dir = str(self.sessions.user_data_dir(self.slug))
        try:
            with sync_playwright() as p:
                ctx = p.chromium.launch_persistent_context(
                    user_dir,
                    headless=self.cfg.headless,
                    args=["--disable-blink-features=AutomationControlled"],
                    viewport={"width": 1366, "height": 900},
                )
                page = ctx.pages[0] if ctx.pages else ctx.new_page()
                self.delay.between_actions()
                page.goto(self.build_search_url(), wait_until="domcontentloaded", timeout=120_000)
                self.delay.between_actions()

                seen: set[str] = set()
                for _ in range(self.cfg.max_scroll_rounds):
                    self.delay.between_actions()
                    batch = self.extract_from_page(page)
                    for row in batch:
                        key = str(
                            row.get("dedupe_key")
                            or row.get("url")
                            or row.get("linkedin_url")
                            or row.get("name")
                            or json.dumps(row, sort_keys=True, default=str)[:240]
                        )
                        if key in seen:
                            continue
                        seen.add(key)
                        row.setdefault("source_platform", self.slug)
                        row.setdefault("search_keyword", self.cfg.keyword)
                        row.setdefault("filter_country", self.cfg.country)
                        row.setdefault("filter_industry", self.cfg.industry)
                        row.setdefault("filter_company_size", self.cfg.company_size)
                        collected.append(row)
                        if len(collected) >= int(self.cfg.max_leads or 20):
                            break
                    if len(collected) >= int(self.cfg.max_leads or 20):
                        break
                    page.evaluate(
                        "window.scrollBy(0, Math.min(1200, Math.max(200, document.body.scrollHeight / 5)))"
                    )
                    self.delay.short_jitter()
                ctx.close()
        except SessionMissingError:
            raise
        except Exception as e:
            logger.exception("Scraper failure [%s]: %s", self.slug, e)
            errors.append(str(e))

        final_rows = collected[: int(self.cfg.max_leads or 20)]
        csv_path: str | None = None
        try:
            csv_path = self.saver.save_run(
                run_id=run_id,
                platform=self.slug,
                keyword=self.cfg.keyword,
                country=self.cfg.country,
                industry=self.cfg.industry,
                company_size=self.cfg.company_size,
                rows=final_rows,
            )
        except Exception as e:
            logger.exception("Raw save failed: %s", e)
            errors.append(f"save_failed: {e}")

        return ScraperRunResult(
            run_id=run_id,
            platform=self.slug,
            collected=len(final_rows),
            csv_path=csv_path,
            errors=errors,
        )
