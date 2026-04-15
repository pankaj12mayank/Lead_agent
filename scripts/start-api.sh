#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python -m pip install -r requirements.txt -q
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
