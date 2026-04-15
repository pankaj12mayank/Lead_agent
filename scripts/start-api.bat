@echo off
cd /d "%~dp0.."
title Lead Intelligence API
python -m pip install -r requirements.txt -q
if errorlevel 1 (
  echo Pip failed.
  pause
  exit /b 1
)
echo API: http://127.0.0.1:8000  ^|  Docs: http://127.0.0.1:8000/docs
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
