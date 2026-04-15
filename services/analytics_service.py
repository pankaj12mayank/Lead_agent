from __future__ import annotations

from collections import Counter
from typing import Any, Dict, List

from sqlalchemy import select

from database.orm.bootstrap import get_session_factory
from database.orm.models import Lead


def _rows_for_metrics() -> List[Dict[str, Any]]:
    Session = get_session_factory()
    db = Session()
    try:
        leads = list(db.scalars(select(Lead)))
        return [
            {
                "status": x.status or "unknown",
                "platform": x.source_platform or "unknown",
                "tier": x.tier or "",
            }
            for x in leads
        ]
    finally:
        db.close()


def summary() -> Dict[str, Any]:
    leads = _rows_for_metrics()
    by_status = Counter((x.get("status") or "unknown") for x in leads)
    by_platform = Counter((x.get("platform") or "unknown") for x in leads)
    return {
        "total": len(leads),
        "by_status": dict(by_status),
        "by_platform": dict(by_platform),
    }


def crm_metrics() -> Dict[str, Any]:
    leads = _rows_for_metrics()
    total = len(leads)
    tier_c = Counter(str(x.get("tier") or "").lower() for x in leads)
    hot = int(tier_c.get("hot", 0))
    warm = int(tier_c.get("warm", 0))
    cold = int(tier_c.get("cold", 0))
    contacted = sum(1 for x in leads if str(x.get("status") or "").lower() == "contacted")
    converted = sum(
        1 for x in leads if str(x.get("status") or "").lower() in ("converted", "closed")
    )
    conv = (converted / total * 100.0) if total else 0.0
    by_status = Counter((x.get("status") or "unknown") for x in leads)
    by_platform = Counter((x.get("platform") or "unknown") for x in leads)
    return {
        "total_leads": total,
        "hot_leads": hot,
        "warm_leads": warm,
        "cold_leads": cold,
        "tier_distribution": {"hot": hot, "warm": warm, "cold": cold},
        "contacted_leads": contacted,
        "converted_leads": converted,
        "conversion_rate_percent": round(conv, 2),
        "platform_distribution": dict(by_platform),
        "status_distribution": dict(by_status),
    }


def dashboard() -> Dict[str, Any]:
    """API dashboard: lead summary plus lightweight meta signals."""
    out = dict(summary())
    out.update(crm_metrics())
    try:
        from services import history_service

        out["recent_history_events"] = history_service.count_recent(7)
    except Exception:
        out["recent_history_events"] = 0
    return out
