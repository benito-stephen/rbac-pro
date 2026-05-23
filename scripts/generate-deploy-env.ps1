# Generates deploy/local.env from backend/.env with production JWT secrets (not committed)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..").Path
$backendEnv = Join-Path $root "backend\.env"
$outDir = Join-Path $root "deploy"
$outFile = Join-Path $outDir "local.env"

if (-not (Test-Path $backendEnv)) {
  Write-Error "Missing backend\.env"
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-RandomSecret { -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ }) }

$mongoLine = Get-Content $backendEnv | Where-Object { $_ -match '^MONGODB_URI=' } | Select-Object -First 1
$mongo = $mongoLine -replace '^MONGODB_URI=',''
$access = New-RandomSecret
$refresh = New-RandomSecret

@"
# Copy these into Render Environment (Phase 2). Do NOT commit this file.
NODE_ENV=production
PORT=5000
MONGODB_URI=$mongo
JWT_ACCESS_SECRET=$access
JWT_REFRESH_SECRET=$refresh
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
"@ | Set-Content $outFile -Encoding utf8

Write-Host "Created $outFile"
Write-Host "Update CLIENT_URL after Vercel deploy."
