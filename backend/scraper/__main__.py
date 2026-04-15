"""CLI: ``python -m backend.scraper <platform>`` — headed manual login (same as API)."""

from __future__ import annotations

import argparse
import sys

from backend.scraper.session_manager import SessionManager
from backend.scraper.urls import supported_platforms


def main() -> None:
    p = argparse.ArgumentParser(description="Open Playwright headed login for a platform.")
    p.add_argument("platform", choices=supported_platforms())
    p.add_argument("--wait-seconds", type=int, default=180, help="Keep browser open (30–1200)")
    args = p.parse_args()
    wait_ms = max(30, min(1200, args.wait_seconds)) * 1000
    SessionManager().open_login_window(args.platform, wait_ms)
    print("Session saved under sessions/playwright_user_data/", args.platform, file=sys.stderr)


if __name__ == "__main__":
    main()
