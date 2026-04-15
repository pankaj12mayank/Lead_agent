from __future__ import annotations

import os
from datetime import datetime, timezone

import pandas as pd
from sqlalchemy import select

import config
from database.orm.bootstrap import get_session_factory
from database.orm.models import Lead


def export_leads_csv(filename: str | None = None) -> str:
    """Write all ORM leads to ``exports/`` as CSV; returns absolute path."""
    config.ensure_data_dirs()
    Session = get_session_factory()
    db = Session()
    try:
        leads = list(db.scalars(select(Lead)))
        rows = [
            {
                "id": x.id,
                "full_name": x.full_name,
                "title": x.title,
                "company_name": x.company_name,
                "company_website": x.company_website,
                "linkedin_url": x.linkedin_url,
                "email": x.email,
                "phone": x.phone,
                "company_size": x.company_size,
                "industry": x.industry,
                "location": x.location,
                "source_platform": x.source_platform,
                "notes": x.notes,
                "score": x.score,
                "tier": x.tier,
                "status": x.status,
                "personalized_message": x.personalized_message,
                "followup_message": x.followup_message,
                "last_contacted_at": getattr(x, "last_contacted_at", "") or "",
                "follow_up_reminder_at": getattr(x, "follow_up_reminder_at", "") or "",
                "created_at": x.created_at,
                "updated_at": x.updated_at,
            }
            for x in leads
        ]
    finally:
        db.close()
    fn = filename or f"leads_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    path = os.path.join(config.EXPORTS_DIR, fn)
    pd.DataFrame(rows or []).to_csv(path, index=False)
    return os.path.abspath(path)
