from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from backend.app.logging_config import setup_logging
from backend.app.middleware.error_handlers import register_exception_handlers
from backend.app.routes import (
    ai_messages,
    analytics,
    auth,
    exports,
    health,
    leads,
    messages,
    platforms,
    scraper,
    settings_routes,
    tools,
)
from database.meta_db import init_meta_schema
from database.orm.bootstrap import init_sa_tables
from services import lead_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    config.ensure_data_dirs()
    init_meta_schema()
    init_sa_tables()
    lead_service.init_storage()
    yield


app = FastAPI(
    title="LeadPilot API",
    version="1.0.0",
    lifespan=lifespan,
    debug=bool(getattr(config, "DEBUG", False)),
)

register_exception_handlers(app)

_cors = [o.strip() for o in config.CORS_ORIGINS.split(",") if o.strip()]
if not _cors:
    _cors = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(messages.router)
app.include_router(ai_messages.router)
app.include_router(platforms.router)
app.include_router(settings_routes.router)
app.include_router(analytics.router)
app.include_router(exports.router)
app.include_router(scraper.router)
app.include_router(tools.router)
