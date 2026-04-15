from __future__ import annotations

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    lead_id: str = Field(..., min_length=1)
    message: str = ""
    email: str = ""
    subject: str = ""
    status: str = ""
