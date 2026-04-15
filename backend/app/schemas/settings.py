from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

    storage_mode: Optional[str] = None
    notes: Optional[str] = None
    model_name: Optional[str] = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    data: Dict[str, Any] = Field(default_factory=dict)
