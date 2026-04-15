# Lead Intelligence

Monorepo: **FastAPI** backend + **React (Vite)** frontend. Leads are managed in the **browser** or via the **REST API**; scraping is being added under `backend/modules/scraper/` (see `docs/SAAS_ARCHITECTURE.md`).

## Start the app

1. Copy **`frontend/.env.example`** → **`frontend/.env`** (optional; defaults to `http://127.0.0.1:8000`).
2. Run **`run.bat`** — starts the API in a separate window and **Vite** on **http://localhost:5173**.
3. Register / sign in, then use Dashboard, Leads, Platforms, Analytics, Settings.

API docs: **http://127.0.0.1:8000/docs**

Notable routes: **`GET /exports/leads.csv`** (auth required). **Scraper:** `GET /scraper/status`, `GET /scraper/platforms`, `POST /scraper/sessions/{platform}/manual-login`, `GET /scraper/sessions/{platform}`, `POST /scraper/run` (see `backend/scraper/`). CLI manual login: `python -m backend.scraper linkedin --wait-seconds 180`. Leads CRM table: **SQLAlchemy** (`database/orm/models.py`); raw scrape rows: **`raw_scrape_records`** + CSV under `exports/`.

## Layout

- **`frontend/`** — Vite + Tailwind + React Router + Axios + Zustand + TanStack Table + Recharts.
- **`frontend_nextjs_legacy/`** — old Next.js UI (kept for reference; not used by `run.bat`).
- **`backend/app/`** — FastAPI routers and schemas.
- **`backend/modules/`** — domain modules (scraper, lead_cleaner, lead_scorer, ai_generator, csv_exporter, analytics, auth, settings, lead_status).
- **`backend/lead_cleaning/`** — dedupe, validation, normalization; writes **`exports/raw_leads.csv`**, **`cleaned_leads.csv`**, **`enriched_leads.csv`**. API: **`POST /tools/clean-leads-csv`** (`input_csv_path`).
- **`backend/lead_scoring/`** — 1–100 score, **hot (80+) / warm (50–79) / cold (1–49)**, per-factor breakdown + logs. Env: **`SCORING_BENCHMARK_INDUSTRY`**.
- **`backend/subscriptions/`** — placeholder for future billing.
- **`exports/`**, **`sessions/`**, **`logs/`** — runtime directories (see `.env.example`).

## Python / Node setup

```bash
pip install -r requirements.txt
cd frontend && npm install
```

Optional: `playwright install` after installing Python deps.

## Architecture & roadmap

See **`docs/SAAS_ARCHITECTURE.md`** for folder conventions, API route map, DB tables, env vars, backend-first workflow, and subscription-ready phases.

## CSV → SQLite import (optional)

```bash
python -m pip install -r requirements.txt -q
python -c "from database.migrate_from_csv import migrate; n=migrate(); print('Migrated', n, 'lead(s).')"
```
