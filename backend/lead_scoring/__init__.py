"""Lead scoring (1–100), tiers (hot/warm/cold), breakdown + logging."""

from backend.lead_scoring.breakdown import ScoreBreakdown
from backend.lead_scoring.engine import normalize_lead_for_scoring, score_lead
from backend.lead_scoring.tiers import assign_tier, tier_label

__all__ = [
    "score_lead",
    "normalize_lead_for_scoring",
    "assign_tier",
    "tier_label",
    "ScoreBreakdown",
]
