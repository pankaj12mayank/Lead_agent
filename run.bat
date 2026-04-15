@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo   Lead Intelligence — starting API + Vite (React)
echo   Browser: http://localhost:5173   API: http://127.0.0.1:8000/docs
echo   Stop: Ctrl+C here and close the API window
echo.

echo Installing Python requirements (quiet)...
python -m pip install -r requirements.txt -q
if errorlevel 1 (
  echo Pip failed. Is Python on PATH?
  pause
  goto :eof
)

echo Starting API in a new window...
start "Lead Intelligence API" cmd /k "%~dp0scripts\start-api.bat"
echo Waiting 2 seconds for API...
timeout /t 2 /nobreak >nul

cd /d "%~dp0frontend"
if not exist package.json (
  echo ERROR: frontend folder missing.
  pause
  goto :eof
)
if not exist node_modules (
  echo npm install...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    goto :eof
  )
)
if not exist .env (
  if exist .env.example (
    echo Creating frontend\.env from .env.example
    copy /y .env.example .env
  )
)

call npm run dev
if errorlevel 1 pause
goto :eof
