# dev.ps1 — Start Gesenu backend (FastAPI) + frontend (Vite) in one pass
#           Waits for backend to be ready, then auto-generates TS types before starting Vite.
# Usage: .\dev.ps1

$Root = $PSScriptRoot

function Write-Tag {
    param ([string]$tag, [ConsoleColor]$color, [string]$msg)
    Write-Host "[$tag] " -ForegroundColor $color -NoNewline
    Write-Host $msg
}

Write-Tag "dev" Cyan "Starting Gesenu dev servers..."
Write-Host ""

# --- Resolve Python executable ---
$backendDir   = Join-Path $Root "backend"
$frontendDir  = Join-Path $Root "frontend"
$venvPython   = Join-Path $backendDir "venv\Scripts\python.exe"

if (Test-Path $venvPython) {
    $pythonExe = $venvPython
} else {
    $pythonExe = "python"
    Write-Tag "backend" Yellow "venv not found — using system python. Run 'python -m venv backend\venv' to isolate deps."
}

# --- 1. Start Backend ---
Write-Tag "backend" Magenta "Starting uvicorn on http://127.0.0.1:8000 ..."
$backendJob = Start-Job -Name "backend" -ScriptBlock {
    param($dir, $py)
    Set-Location $dir
    & $py -m uvicorn main:app --reload --port 8000 2>&1
} -ArgumentList $backendDir, $pythonExe

# --- 2. Wait for backend to be ready ---
Write-Tag "backend" Magenta "Waiting for backend to be ready..."
$maxAttempts = 30
$attempt     = 0
$backendReady = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Milliseconds 500
    $attempt++

    # Drain backend output while waiting
    $out = Receive-Job -Job $backendJob
    foreach ($line in $out) {
        if ($line) { Write-Tag "backend" Magenta $line }
    }

    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # still starting up
    }
}

if (-not $backendReady) {
    Write-Tag "dev" Red "Backend did not start in time. Aborting."
    Stop-Job  -Job $backendJob
    Remove-Job -Job $backendJob -Force
    exit 1
}

Write-Tag "backend" Green "Backend is ready."
Write-Host ""

# --- 3. Generate TypeScript types from OpenAPI ---
Write-Tag "types" Yellow "Running generate-types (openapi-typescript -> src/types/api.ts)..."
Push-Location $frontendDir
$genResult = npm run generate-types 2>&1
foreach ($line in $genResult) {
    if ($line) { Write-Tag "types" Yellow $line }
}
if ($LASTEXITCODE -ne 0) {
    Write-Tag "types" Red "generate-types failed (exit $LASTEXITCODE) — continuing anyway with stale types."
} else {
    Write-Tag "types" Green "Types generated successfully."
}
Pop-Location
Write-Host ""

# --- 4. Start Frontend ---
Write-Tag "frontend" Blue "Starting Vite on http://localhost:5173 ..."
$frontendJob = Start-Job -Name "frontend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev 2>&1
} -ArgumentList $frontendDir

Write-Tag "dev" Green "All servers running. Press Ctrl+C to stop."
Write-Host ""

# --- 5. Stream output from both jobs ---
try {
    while ($true) {
        $backendOutput  = Receive-Job -Job $backendJob
        $frontendOutput = Receive-Job -Job $frontendJob

        foreach ($line in $backendOutput)  { if ($line) { Write-Tag "backend"  Magenta $line } }
        foreach ($line in $frontendOutput) { if ($line) { Write-Tag "frontend" Blue    $line } }

        if ($backendJob.State  -eq "Failed") { Write-Tag "backend"  Red "Backend process crashed!" }
        if ($frontendJob.State -eq "Failed") { Write-Tag "frontend" Red "Frontend process crashed!" }

        Start-Sleep -Milliseconds 200
    }
}
finally {
    Write-Host ""
    Write-Tag "dev" Yellow "Shutting down..."
    Stop-Job  -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob -Force
    Write-Tag "dev" Cyan "All servers stopped."
}
