from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends

from backend.app.api.deps import get_current_user
from backend.app.schemas.settings import SettingsResponse, SettingsUpdate
from services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SettingsResponse)
def get_settings(_user: dict = Depends(get_current_user)) -> SettingsResponse:
    return SettingsResponse(data=settings_service.load_settings())


@router.patch("/", response_model=SettingsResponse)
def patch_settings(
    body: SettingsUpdate, _user: dict = Depends(get_current_user)
) -> SettingsResponse:
    patch: Dict[str, Any] = body.model_dump(exclude_unset=True)
    merged = settings_service.patch_settings(patch)
    return SettingsResponse(data=merged)
