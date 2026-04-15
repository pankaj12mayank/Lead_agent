from __future__ import annotations

from typing import Dict, Type

from backend.scraper.base import BaseScraper
from backend.scraper.platforms.apollo import ApolloScraper
from backend.scraper.platforms.clutch import ClutchScraper
from backend.scraper.platforms.crunchbase import CrunchbaseScraper
from backend.scraper.platforms.fiverr import FiverrScraper
from backend.scraper.platforms.google_maps import GoogleMapsScraper
from backend.scraper.platforms.justdial import JustdialScraper
from backend.scraper.platforms.linkedin import LinkedInScraper
from backend.scraper.platforms.upwork import UpworkScraper
from backend.scraper.platforms.wellfound import WellfoundScraper

PLATFORMS: Dict[str, Type[BaseScraper]] = {
    "linkedin": LinkedInScraper,
    "apollo": ApolloScraper,
    "upwork": UpworkScraper,
    "fiverr": FiverrScraper,
    "clutch": ClutchScraper,
    "crunchbase": CrunchbaseScraper,
    "wellfound": WellfoundScraper,
    "google_maps": GoogleMapsScraper,
    "justdial": JustdialScraper,
}


def get_scraper_class(platform_slug: str) -> Type[BaseScraper] | None:
    key = platform_slug.strip().lower().replace(" ", "_")
    return PLATFORMS.get(key)


def list_platform_slugs() -> list[str]:
    return sorted(PLATFORMS.keys())
