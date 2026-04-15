from __future__ import annotations

from dataclasses import asdict, dataclass, field


@dataclass
class ScoreBreakdown:
    """Per-factor points (each capped by its own max); ``total`` is clamped 1–100 after sum."""

    company_size: float = 0.0
    job_role: float = 0.0
    country: float = 0.0
    website_availability: float = 0.0
    email_availability: float = 0.0
    platform_source: float = 0.0
    industry_match: float = 0.0
    budget_potential: float = 0.0

    messages: dict[str, str] = field(default_factory=dict)

    @property
    def raw_total(self) -> float:
        return (
            self.company_size
            + self.job_role
            + self.country
            + self.website_availability
            + self.email_availability
            + self.platform_source
            + self.industry_match
            + self.budget_potential
        )

    def to_dict(self) -> dict:
        d = asdict(self)
        d["raw_total"] = self.raw_total
        return d
