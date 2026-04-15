"""
Lead cleaning & validation: dedupe, empty/invalid removal, email/URL/phone rules, normalization.
"""

from backend.lead_cleaning.cleaners import (
    clean_email,
    clean_phone,
    clean_url,
    is_valid_company_website_url,
    is_valid_email_format,
    is_valid_linkedin_url,
)
from backend.lead_cleaning.dedupe import remove_duplicates
from backend.lead_cleaning.engine import run_cleaning_from_records, run_cleaning_pipeline
from backend.lead_cleaning.normalizers import normalize_company_name, normalize_job_title, normalize_name
from backend.lead_cleaning.summary import CleaningSummary
from backend.lead_cleaning.validators import validate_record

__all__ = [
    "clean_email",
    "clean_phone",
    "clean_url",
    "normalize_name",
    "normalize_job_title",
    "normalize_company_name",
    "remove_duplicates",
    "validate_record",
    "is_valid_email_format",
    "is_valid_linkedin_url",
    "is_valid_company_website_url",
    "run_cleaning_pipeline",
    "run_cleaning_from_records",
    "CleaningSummary",
]
