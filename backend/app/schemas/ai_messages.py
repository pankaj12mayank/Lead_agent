from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class LeadAIMessageRequest(BaseModel):
    name: str = Field(default="", max_length=500)
    company: str = Field(default="", max_length=500)
    industry: str = Field(default="", max_length=300)
    job_title: str = Field(default="", max_length=300)
    company_website: str = Field(default="", max_length=2000)
    pain_points: str = Field(default="", max_length=8000)
    opportunity_summary: str = Field(default="", max_length=8000)
    model_family: Optional[Literal["llama3", "mistral", "deepseek"]] = Field(
        default=None,
        description="Which model preset to call in Ollama; defaults to app MODEL_NAME mapping (llama3).",
    )


class LeadAIMessageResponse(BaseModel):
    linkedin_message: str = ""
    email_message: str = ""
    followup_message: str = ""
    short_summary: str = ""
    pain_points: str = ""
