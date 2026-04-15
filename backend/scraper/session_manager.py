from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

import config as app_config

from backend.scraper.exceptions import ScraperError, UnsupportedPlatformError
from backend.scraper.urls import LOGIN_START_URLS, login_url
from settings.lead_schema import utc_now_iso


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

    def _verification_path(self, platform_slug: str) -> Path:
        return self.path_for(platform_slug) / ".leadpilot_session.json"

    def clear_verification(self, platform_slug: str) -> None:
        p = self._verification_path(platform_slug)
        if p.is_file():
            try:
                p.unlink()
            except OSError:
                pass

    def read_verification(self, platform_slug: str) -> Optional[dict[str, Any]]:
        p = self._verification_path(platform_slug)
        if not p.is_file():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return None

    def write_verification(self, platform_slug: str, ok: bool) -> None:
        p = self._verification_path(platform_slug)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(
            json.dumps({"verified": bool(ok), "checked_at": utc_now_iso()}),
            encoding="utf-8",
        )

    def session_connected(self, platform_slug: str) -> bool:
        """True only after a successful verify (manual login end or refresh)."""
        data = self.read_verification(platform_slug)
        return bool(data and data.get("verified") is True)

    def has_session(self, platform_slug: str) -> bool:
        """Profile directory on disk (may exist before login completes)."""
        p = self.path_for(platform_slug)
        if not p.is_dir():
            return False
        try:
            names = {x.name.lower() for x in p.iterdir()}
        except OSError:
            return False
        # Chromium / Chrome persistent profile markers
        return bool(names & {"default", "local storage", "cookies", "preferences"} or len(names) >= 2)

    def open_login_window(self, platform_slug: str, wait_ms: int, start_url: str | None = None) -> None:
        """
        Headed browser: user logs in manually; window stays open for ``wait_ms`` then closes.
        Profile is persisted under ``sessions/playwright_user_data/<platform>/``.
        """
        from playwright.sync_api import sync_playwright

        from backend.scraper.session_verify import verify_playwright_session
        from services import platform_registry_service

        slug = platform_slug.strip().lower().replace(" ", "_")
        self.clear_verification(slug)
        if start_url and str(start_url).strip():
            start = str(start_url).strip()
        elif slug in LOGIN_START_URLS:
            start = login_url(slug)
        else:
            raise UnsupportedPlatformError(f"Unknown platform: {platform_slug}", platform=slug)
        user_dir = str(self.user_data_dir(slug))
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
        custom_url = platform_registry_service.get_custom_login_url(slug)
        ok = verify_playwright_session(slug, custom_login_url=custom_url)
        self.write_verification(slug, ok)
