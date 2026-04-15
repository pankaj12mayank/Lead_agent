from __future__ import annotations

from pathlib import Path

import config as app_config

from backend.scraper.exceptions import ScraperError, UnsupportedPlatformError
from backend.scraper.urls import LOGIN_START_URLS, login_url


class SessionManager:
    """
    Playwright persistent user-data directories (one per platform).

    Manual login uses ``launch_persistent_context`` so cookies survive across runs.
    """

    def __init__(self, base_dir: str | None = None) -> None:
        app_config.ensure_data_dirs()
        root = base_dir or app_config.SESSIONS_DIR
        self._root = Path(root) / "playwright_user_data"

    def path_for(self, platform_slug: str) -> Path:
        slug = platform_slug.strip().lower().replace(" ", "_")
        return self._root / slug

    def user_data_dir(self, platform_slug: str) -> Path:
        p = self.path_for(platform_slug)
        p.mkdir(parents=True, exist_ok=True)
        return p

    def has_session(self, platform_slug: str) -> bool:
        """Heuristic: directory exists and contains browser profile data."""
        p = self.path_for(platform_slug)
        if not p.is_dir():
            return False
        try:
            names = {x.name.lower() for x in p.iterdir()}
        except OSError:
            return False
        # Chromium / Chrome persistent profile markers
        return bool(names & {"default", "local storage", "cookies", "preferences"} or len(names) >= 2)

    def open_login_window(self, platform_slug: str, wait_ms: int) -> None:
        """
        Headed browser: user logs in manually; window stays open for ``wait_ms`` then closes.
        Profile is persisted under ``sessions/playwright_user_data/<platform>/``.
        """
        from playwright.sync_api import sync_playwright

        slug = platform_slug.strip().lower().replace(" ", "_")
        if slug not in LOGIN_START_URLS:
            raise UnsupportedPlatformError(f"Unknown platform: {platform_slug}", platform=slug)
        user_dir = str(self.user_data_dir(slug))
        start = login_url(slug)
        try:
            with sync_playwright() as p:
                ctx = p.chromium.launch_persistent_context(
                    user_dir,
                    headless=False,
                    args=["--disable-blink-features=AutomationControlled"],
                    viewport={"width": 1280, "height": 900},
                )
                page = ctx.pages[0] if ctx.pages else ctx.new_page()
                page.goto(start, wait_until="domcontentloaded", timeout=120_000)
                page.wait_for_timeout(wait_ms)
                ctx.close()
        except Exception as e:
            raise ScraperError(f"Manual login flow failed: {e}", platform=slug) from e
