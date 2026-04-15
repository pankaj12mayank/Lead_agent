from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass
class CleaningSummary:
    total_raw_leads: int
    total_cleaned_leads: int
    total_enriched_leads: int
    empty_rows_removed: int
    duplicates_removed: int
    invalid_records_removed: int

    def to_dict(self) -> dict:
        return asdict(self)
