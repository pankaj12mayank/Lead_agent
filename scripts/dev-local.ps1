# One-command dev: API (background) + Vite — requires Python + Node on PATH.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "`n LeadPilot — starting API + Vite`n" -ForegroundColor Cyan

if (-not (Test-Path "$Root\.env") -and (Test-Path "$Root\.env.example")) {
    Write-Host "Tip: copy .env.example to .env for backend settings.`n"
}

python -m pip install -r requirements.txt -q
$api = Start-Process -FilePath "python" -ArgumentList @(
    "-m", "uvicorn", "backend.app.main:app",
    "--reload", "--host", "127.0.0.1", "--port", "8000"
) -PassThru -WindowStyle Minimized

try {
    Start-Sleep -Seconds 2
    Set-Location "$Root\frontend"
    if (-not (Test-Path "node_modules")) { npm install }
    if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
    }
    npm run dev
}
finally {
    if ($api -and -not $api.HasExited) {
        Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
    }
}
