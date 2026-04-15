#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo ""
echo "  LeadPilot — API + Vite"
echo "  Web: http://localhost:5173   API docs: http://127.0.0.1:8000/docs"
echo ""

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  echo "Tip: copy .env.example to .env to customize backend env."
fi

python -m pip install -r requirements.txt -q
bash "$ROOT/scripts/start-api.sh" &
API_PID=$!
trap 'kill $API_PID 2>/dev/null || true' EXIT
sleep 2

cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  npm install
fi
if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
fi
npm run dev
