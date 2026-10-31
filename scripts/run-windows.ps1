# ==============================================================================
# IBS AI WORKFORCE — One-Click Windows Launcher
# Product: IBS AI Workforce | IBS Digital
# Tagline: One Company. Thirty AI Specialists. Unlimited Possibilities.
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   IBS AI WORKFORCE — Enterprise Agency Operating System         " -ForegroundColor White
Write-Host "   One Company. Thirty AI Specialists. Unlimited Possibilities.  " -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$RootPath = (Get-Item -Path ".").FullName

# 1. Verify Prerequisites
Write-Host "[1/5] Checking System Prerequisites..." -ForegroundColor Yellow
try {
    $pythonVer = python --version
    Write-Host "  ✓ Python: $pythonVer" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python is required but not found in PATH." -ForegroundColor Red
    exit 1
}

try {
    $nodeVer = node --version
    Write-Host "  ✓ Node.js: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js is required but not found in PATH." -ForegroundColor Red
    exit 1
}

# 2. Virtual Environment Setup
Write-Host "`n[2/5] Checking Python Virtual Environment..." -ForegroundColor Yellow
if (-not (Test-Path "$RootPath\venv")) {
    Write-Host "  Creating virtual environment 'venv'..." -ForegroundColor Gray
    python -m venv venv
}
$VenvPython = "$RootPath\venv\Scripts\python.exe"

# 3. Database Initialization & Seeding (30 Agents + 5 Departments)
Write-Host "`n[3/5] Initializing Database & Seeding 30 AI Specialists..." -ForegroundColor Yellow
$env:PYTHONPATH = "$RootPath\services\api"
& $VenvPython -m app.database.init_db

# 4. Frontend Preparation
Write-Host "`n[4/5] Checking Frontend Dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$RootPath\apps\web\node_modules")) {
    Write-Host "  Installing frontend packages..." -ForegroundColor Gray
    Push-Location "$RootPath\apps\web"
    npm install
    Pop-Location
}

# 5. Launch Backend & Frontend Services
Write-Host "`n[5/5] Launching IBS AI Workforce Core Services..." -ForegroundColor Yellow
Write-Host "  → API Service:      http://localhost:8000" -ForegroundColor Cyan
Write-Host "  → API Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  → Frontend Portal:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to terminate both services when done." -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan

# Start Backend in Background Process
$apiJob = Start-Process -FilePath $VenvPython -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "$RootPath\services\api" -PassThru -NoNewWindow

# Start Frontend in current console
Push-Location "$RootPath\apps\web"
try {
    npm run dev
} finally {
    Pop-Location
    if ($apiJob -and -not $apiJob.HasExited) {
        Write-Host "Stopping API background process..." -ForegroundColor Yellow
        Stop-Process -Id $apiJob.Id -Force
    }
}
