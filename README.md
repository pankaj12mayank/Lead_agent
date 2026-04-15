# Lead Intelligence (LeadPilot)

Monorepo: **FastAPI** backend + **React (Vite)** SPA. CRM leads live in **SQLite** via SQLAlchemy (`API_META_DB_PATH`). Optional **Playwright** scrapers persist sessions under `sessions/` and write `exports/` + raw tables.

---

## Final commands (cheat sheet)

| Action | Command |
|--------|---------|
| **Backend (dev, reload)** | `python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000` |
| **Frontend (dev)** | `cd frontend && npm run dev` → [http://localhost:5173](http://localhost:5173) |
| **One-command local (API + Vite)** | From repo root: `npm install` then `npm run dev` **or** Windows `run.bat` **or** `./run.sh` |
| **Production build (SPA only)** | `cd frontend && npm run build` (output: `frontend/dist/`) |
| **Docker Compose (API + nginx UI)** | `docker compose up --build` → API [http://127.0.0.1:8000](http://127.0.0.1:8000), UI [http://127.0.0.1:8080](http://127.0.0.1:8080) |
| **Initialize SQLite / dirs** | `python scripts/init_database.py` |
| **Seed demo user + leads** | `python scripts/seed_demo_data.py` |
| **API tests** | `pip install -r requirements-dev.txt` then `pytest` |
| **Frontend tests** | `cd frontend && npm run test` |
| **All tests** | From root: `npm run test` (after dev deps installed) |

API docs (when backend is up): **http://127.0.0.1:8000/docs**

---

## Repository layout (deployment-oriented)

```text
LeadPilot/
├── backend/app/main.py       # FastAPI app + lifespan (DB init, logging)
├── config.py                 # Central env (python-dotenv)
├── database/                 # SQLite helpers, ORM models, migrations
├── services/                 # Auth, leads (ORM), analytics, etc.
├── exports/                  # CSV outputs (volume in Docker)
├── sessions/                 # Playwright user data dirs (volume)
├── logs/                     # Rotating api.log (volume)
├── scripts/
│   ├── init_database.py      # Schema + storage init (CLI)
│   ├── seed_demo_data.py     # Demo user + sample leads
│   ├── start-api.bat         # Windows API launcher (used by run.bat)
│   ├── start-api.sh          # Unix API launcher
│   └── dev-local.ps1         # PowerShell: API + Vite
├── tests/                    # Pytest + FastAPI TestClient
├── frontend/
│   ├── src/lib/api/client.ts # Axios instance + auth header
│   ├── Dockerfile            # Multi-stage → nginx static
│   └── nginx.conf            # SPA routing
├── Dockerfile                # API image (Playwright base)
├── docker-compose.yml        # api:8000 + web:8080
├── requirements.txt          # Production Python deps
├── requirements-dev.txt      # + pytest / httpx
├── pytest.ini
├── package.json              # concurrently: `npm run dev`
├── run.bat / run.sh          # One-command starters
└── .env.example              # Copy to `.env` at repo root
```

---

## Environment variables

1. **Backend:** copy **`.env.example`** → **`.env`** in the **repository root** (same folder as `config.py`). `python-dotenv` loads this on import.
2. **Frontend:** optional **`frontend/.env`**.  
   - **Development:** leave `VITE_API_URL` empty to use the Vite proxy **`/api` → `http://127.0.0.1:8000`** (see `frontend/vite.config.ts`).  
   - **Production build:** set `VITE_API_URL` to the **browser-reachable** API URL (e.g. `https://api.example.com`).

Important keys:

| Variable | Purpose |
|----------|---------|
| `API_META_DB_PATH` | SQLite file for users, leads (ORM), settings, raw scrape rows |
| `SECRET_KEY` | JWT signing — **change in production** |
| `CORS_ORIGINS` | Comma-separated allowed origins (use real UI origin in prod) |
| `EXPORTS_DIR`, `SESSIONS_DIR`, `LOGS_DIR` | Writable runtime directories |
| `VITE_API_URL` | Axios base URL for the SPA (build-time for static hosting) |

---

## Frontend ↔ backend (Axios)

- **`frontend/src/lib/api/client.ts`** creates a shared Axios instance with `Authorization: Bearer <token>` from Zustand.
- **Dev:** default base URL is **`/api`**; Vite rewrites to FastAPI on port **8000** without CORS friction.
- **Prod:** set **`VITE_API_URL`** at `npm run build` time so the static files call the correct host.

---

## SQLite initialization

On every API startup (`lifespan` in `backend/app/main.py`):

1. `setup_logging()` — console + `logs/api.log` (rotating).
2. `config.ensure_data_dirs()` — exports, sessions, logs, and parent dirs for DB files.
3. `init_meta_schema()` — legacy/meta tables in `API_META_DB_PATH`.
4. `init_sa_tables()` — SQLAlchemy `Base.metadata.create_all` + light migrations.
5. `lead_service.init_storage()` — CSV/SQLite/Postgres storage per `STORAGE_MODE`.

You can run the same steps without starting the server:

```bash
python scripts/init_database.py
```

---

## Local deployment (without Docker)

**Prerequisites:** Python 3.11+, Node 20+, `pip`, `npm`.

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt   # optional, for tests
cd frontend && npm install && cd ..
copy .env.example .env                 # Windows: copy; Unix: cp
python scripts/init_database.py
python scripts/seed_demo_data.py       # optional demo login (see script env vars)
```

**Option A — one command (Node + Python):**

```bash
npm install          # installs concurrently at repo root
npm run dev
```

**Option B — Windows:** double-click or run **`run.bat`** (starts API in a second window, then Vite).

**Option C — Unix:** `chmod +x run.sh scripts/start-api.sh` then `./run.sh`.

Sign in with seeded **`demo@leadpilot.local`** / **`demo-password-change-me`** (unless overridden by `SEED_DEMO_EMAIL` / `SEED_DEMO_PASSWORD`).

---

## Docker

```bash
docker compose up --build
```

- **API** listens on **8000**; volumes persist `database/`, `exports/`, `logs/`, `sessions/`.
- **Web** is nginx on host **8080**; the SPA is built with `VITE_API_URL` defaulting to **`http://127.0.0.1:8000`** so the browser talks to the API on the host loopback.  
  Adjust in compose: `VITE_API_URL`, `CORS_ORIGINS`, `SECRET_KEY`.

Playwright scrapers need a **saved session** on the host volume (`sessions/`); use **`POST /scraper/sessions/{platform}/manual-login`** from a machine that can open a browser, or document X11 for headed login in Linux containers.

---

## Error logging

- **Application:** `backend/app/logging_config.py` — root logger to stdout and **`logs/api.log`** (2 MB × 3 files). Level from **`LOG_LEVEL`**.
- **HTTP:** `backend/app/middleware/error_handlers.py` — validation errors **422**; unhandled exceptions **500** with `logger.exception`; **4xx/5xx** Starlette HTTP exceptions logged at **warning/error** with method and path.

---

## Testing

**API (pytest):** from repo root with `PYTHONPATH` implicit via `pytest.ini`:

```bash
pip install -r requirements-dev.txt
pytest
```

**Frontend (Vitest):**

```bash
cd frontend && npm install && npm run test
```

If `npm ci` fails in Docker, refresh `frontend/package-lock.json` locally (`npm install` in `frontend/`) after dependency changes.

---

## Production build scripts

```bash
cd frontend
npm ci
npm run build
```

Serve `frontend/dist/` with any static host; align **`VITE_API_URL`** and reverse-proxy **`/api`** if you terminate TLS on a gateway.

---

## API quick reference

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Leads:** `GET/POST /leads/`, exports under `/exports/`
- **Scraper:** `GET /scraper/status`, `POST /scraper/run`, `GET /scraper/jobs/{id}`
- **Health:** `GET /health`

Architecture notes: **`docs/SAAS_ARCHITECTURE.md`**.
