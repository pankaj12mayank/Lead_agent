from __future__ import annotations

from typing import Literal, TypedDict


class LeadMessageInput(TypedDict, total=False):
    """Fields used to personalize generated outreach."""

    name: str
    company: str
    industry: str
    job_title: str
    company_website: str
    pain_points: str
    opportunity_summary: str


class LeadMessageOutput(TypedDict):
    linkedin_message: str
    email_message: str
    followup_message: str
    short_summary: str
    pain_points: str


ModelFamily = Literal["llama3", "mistral", "deepseek"]
