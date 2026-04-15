from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

    storage_mode: Optional[str] = None
    notes: Optional[str] = None
    model_name: Optional[str] = None
    use_ollama: Optional[str] = None
    free_api_mode: Optional[str] = None
    scraper_delay_min_seconds: Optional[float] = None
    scraper_delay_max_seconds: Optional[float] = None
    scraper_max_leads_default: Optional[int] = None
    exports_dir: Optional[str] = None
    ai_provider: Optional[str] = None
    external_api_base_url: Optional[str] = None
    external_api_key: Optional[str] = None
    external_api_model: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    data: Dict[str, Any] = Field(default_factory=dict)
