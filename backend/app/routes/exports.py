from __future__ import annotations

import os

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from backend.app.api.deps import get_current_user
from backend.modules.csv_exporter.service import export_leads_csv

router = APIRouter(prefix="/exports", tags=["exports"])


@router.get("/leads.csv")
def export_leads_csv_file(_user: dict = Depends(get_current_user)) -> FileResponse:
    """Download all leads as CSV (written under ``exports/``)."""
    path = export_leads_csv()
    return FileResponse(
        path,
        filename=os.path.basename(path),
        media_type="text/csv",
    )
