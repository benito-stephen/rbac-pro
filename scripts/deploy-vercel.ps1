# Requires: $env:VERCEL_TOKEN from https://vercel.com/account/settings/tokens
# Usage: .\scripts\deploy-vercel.ps1 -ApiUrl "https://rbac-pro-api.onrender.com/api"
param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..").Path
$frontend = Join-Path $root "frontend"

if (-not $env:VERCEL_TOKEN) {
  Write-Host "Set VERCEL_TOKEN first:"
  Write-Host '  $env:VERCEL_TOKEN = "..."'
  exit 1
}

$env:VITE_API_URL = $ApiUrl
Push-Location $frontend
try {
  npm install
  npm run build
  npx --yes vercel@39 deploy --prod --yes --token $env:VERCEL_TOKEN `
    --env "VITE_API_URL=$ApiUrl"
  Write-Host "Set Render CLIENT_URL to your Vercel URL, then redeploy API."
} finally {
  Pop-Location
}
