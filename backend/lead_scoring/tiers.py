from __future__ import annotations

HOT_MIN = 80
WARM_MIN = 50


def assign_tier(score: float) -> str:
    """
    Hot: 80–100, Warm: 50–79, Cold: 1–49.
    ``score`` is expected already clamped to [1, 100].
    """
    s = int(round(float(score)))
    if s >= HOT_MIN:
        return "hot"
    if s >= WARM_MIN:
        return "warm"
    return "cold"


def tier_label(tier: str) -> str:
    return {"hot": "Hot", "warm": "Warm", "cold": "Cold"}.get(tier.lower(), tier)
