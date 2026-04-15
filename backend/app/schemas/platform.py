from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PlatformCreate(BaseModel):
    slug: str = Field(..., min_length=1, max_length=64)
    label: str = Field(..., min_length=1, max_length=128)


class PlatformUpdate(BaseModel):
    label: Optional[str] = Field(default=None, min_length=1, max_length=128)
    active: Optional[bool] = None


class PlatformResponse(BaseModel):
    platform_id: Optional[int] = None
    slug: str
    label: str
    active: bool = True
    builtin: bool = False
    created_at: Optional[str] = None
