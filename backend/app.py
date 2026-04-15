"""Backward-compatible entry: `uvicorn backend.app:app` loads the full FastAPI app."""

from backend.app.main import app

__all__ = ["app"]
