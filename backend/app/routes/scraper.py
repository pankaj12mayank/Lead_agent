"""Scraper API: manual Playwright login, multi-platform runs, raw export."""

from __future__ import annotations

import asyncio
from dataclasses import asdict
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.app.api.deps import get_current_user
from backend.modules.scraper.service import scrape_profile_preview
from backend.scraper.config import ScraperRunConfig
from backend.scraper.exceptions import SessionMissingError, UnsupportedPlatformError
from backend.scraper.registry import list_platform_slugs
from backend.scraper.runner import run_scrape_sync
from backend.scraper.session_manager import SessionManager
from backend.scraper.urls import supported_platforms
import config as app_config

router = APIRouter(prefix="/scraper", tags=["scraper"])


class ScrapePreviewBody(BaseModel):
    url: str = Field(..., min_length=4)
    platform: str = Field(default="linkedin", max_length=64)


class ManualLoginBody(BaseModel):
    """How long to keep the headed browser open for the user to complete login."""

    wait_seconds: int = Field(default=180, ge=30, le=1200)


class ScraperRunBody(BaseModel):
    platform: str = Field(..., min_length=2, max_length=64)
    keyword: str = Field(..., min_length=1, max_length=500)
    country: str = ""
    industry: str = ""
    company_size: str = ""
    max_leads: int = Field(default=20, ge=1, le=50)
    headless: bool = True
    delay_min_seconds: float = Field(default=3.0, ge=1.0, le=10.0)
    delay_max_seconds: float = Field(default=5.0, ge=1.0, le=10.0)
    max_scroll_rounds: int = Field(default=12, ge=1, le=40)


@router.get("/status")
def scraper_status(_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "ok": True,
        "engine": "playwright",
        "platforms": list_platform_slugs(),
        "delay_seconds_range": [
            app_config.SCRAPER_DELAY_MIN_SECONDS,
            app_config.SCRAPER_DELAY_MAX_SECONDS,
        ],
        "max_leads_default": app_config.SCRAPER_MAX_LEADS_DEFAULT,
        "max_leads_cap": app_config.SCRAPER_MAX_LEADS_HARD_CAP,
    }


@router.get("/platforms")
def scraper_platforms(_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    return {"platforms": supported_platforms()}


@router.post("/preview")
async def scrape_preview(
    body: ScrapePreviewBody,
    _user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    return await scrape_profile_preview(body.url, body.platform)


@router.post("/sessions/{platform}/manual-login")
async def manual_login_window(
    platform: str,
    body: ManualLoginBody,
    _user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    """Open a real browser window; user logs in manually; session is saved under ``sessions/``."""
    slug = platform.strip().lower().replace(" ", "_")
    try:
        await asyncio.to_thread(
            SessionManager().open_login_window,
            slug,
            int(body.wait_seconds * 1000),
        )
    except UnsupportedPlatformError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return {"ok": True, "platform": slug, "wait_seconds": body.wait_seconds}


@router.get("/sessions/{platform}")
def session_exists(platform: str, _user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    slug = platform.strip().lower().replace(" ", "_")
    sm = SessionManager()
    return {"platform": slug, "has_session": sm.has_session(slug), "path": str(sm.path_for(slug))}


@router.post("/run")
async def run_scraper(
    body: ScraperRunBody,
    _user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    """Keyword search scrape (requires saved session). Raw rows → SQLite + CSV."""
    cfg = ScraperRunConfig(
        platform=body.platform,
        keyword=body.keyword,
        country=body.country,
        industry=body.industry,
        company_size=body.company_size,
        max_leads=body.max_leads,
        delay_min_seconds=body.delay_min_seconds,
        delay_max_seconds=body.delay_max_seconds,
        headless=body.headless,
        max_scroll_rounds=body.max_scroll_rounds,
    )
    try:
        result = await asyncio.to_thread(run_scrape_sync, cfg)
    except SessionMissingError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except UnsupportedPlatformError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return asdict(result)
