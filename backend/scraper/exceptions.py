from __future__ import annotations


class ScraperError(Exception):
    """Recoverable or fatal scraper failure."""

    def __init__(self, message: str, *, platform: str | None = None) -> None:
        super().__init__(message)
        self.platform = platform


class SessionMissingError(ScraperError):
    """No saved Playwright user-data dir for this platform — run manual login first."""

    pass


class UnsupportedPlatformError(ScraperError):
    pass


class ScraperConfigError(ScraperError):
    pass
