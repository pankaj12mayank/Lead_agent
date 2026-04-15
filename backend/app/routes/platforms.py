from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException

from backend.app.api.deps import get_current_user
from backend.app.schemas.platform import PlatformCreate, PlatformResponse, PlatformUpdate
from connectors.platforms import PLATFORM_CANONICAL
from services import platform_registry_service

router = APIRouter(prefix="/platforms", tags=["platforms"])


def _builtin_items() -> List[PlatformResponse]:
    out: List[PlatformResponse] = []
    for slug in sorted(PLATFORM_CANONICAL | {"other"}):
        label = slug.replace("_", " ").title()
        out.append(
            PlatformResponse(
                platform_id=None,
                slug=slug,
                label=label,
                active=True,
                builtin=True,
                created_at=None,
            )
        )
    return out


@router.get("/", response_model=List[PlatformResponse])
def list_platforms(_user: dict = Depends(get_current_user)) -> List[PlatformResponse]:
    items = _builtin_items()
    for row in platform_registry_service.list_custom():
        items.append(
            PlatformResponse(
                platform_id=row["platform_id"],
                slug=row["slug"],
                label=row["label"],
                active=row["active"],
                builtin=False,
                created_at=row["created_at"],
            )
        )
    return items


@router.post("/", response_model=PlatformResponse)
def create_platform(
    body: PlatformCreate, _user: dict = Depends(get_current_user)
) -> PlatformResponse:
    try:
        row = platform_registry_service.create_platform(body.slug, body.label)
    except ValueError as e:
        if str(e) == "reserved_slug":
            raise HTTPException(status_code=400, detail="Slug is reserved for built-in platforms")
        if str(e) == "slug_taken":
            raise HTTPException(status_code=400, detail="Slug already exists")
        raise HTTPException(status_code=400, detail="Could not create platform")
    return PlatformResponse(
        platform_id=row["platform_id"],
        slug=row["slug"],
        label=row["label"],
        active=row["active"],
        builtin=False,
        created_at=row["created_at"],
    )


@router.patch("/{platform_id}", response_model=PlatformResponse)
def update_platform(
    platform_id: int,
    body: PlatformUpdate,
    _user: dict = Depends(get_current_user),
) -> PlatformResponse:
    row = platform_registry_service.update_platform(
        platform_id, label=body.label, active=body.active
    )
    if not row:
        raise HTTPException(status_code=404, detail="Platform not found")
    return PlatformResponse(
        platform_id=row["platform_id"],
        slug=row["slug"],
        label=row["label"],
        active=row["active"],
        builtin=False,
        created_at=row["created_at"],
    )


@router.delete("/{platform_id}")
def delete_platform(platform_id: int, _user: dict = Depends(get_current_user)) -> dict:
    ok = platform_registry_service.delete_platform(platform_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Platform not found")
    return {"deleted": True}
