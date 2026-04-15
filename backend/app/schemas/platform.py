from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PlatformCreate(BaseModel):
    slug: str = Field(..., min_length=1, max_length=64)
    label: str = Field(..., min_length=1, max_length=128)
    login_url: str = Field(..., min_length=8, max_length=2048, description="Where users sign in for this source")


class PlatformUpdate(BaseModel):
    label: Optional[str] = Field(default=None, min_length=1, max_length=128)
    active: Optional[bool] = None


class PlatformBuiltinPatch(BaseModel):
    active: bool = Field(...)


class PlatformResponse(BaseModel):
    platform_id: Optional[int] = None
    slug: str
    label: str
    active: bool = True
    builtin: bool = False
    created_at: Optional[str] = None
    login_url: Optional[str] = None
    session_profile: bool = False
    session_connected: bool = False
