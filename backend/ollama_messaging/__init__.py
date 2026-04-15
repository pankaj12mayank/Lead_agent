"""Ollama-backed outreach copy: summaries, pain points, LinkedIn, email, follow-up."""

from __future__ import annotations

from backend.ollama_messaging.generator import generate_lead_messages
from backend.ollama_messaging.types import LeadMessageInput, LeadMessageOutput

__all__ = ["generate_lead_messages", "LeadMessageInput", "LeadMessageOutput"]
