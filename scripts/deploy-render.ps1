# Requires: $env:RENDER_API_KEY from https://dashboard.render.com/u/settings#api-keys
# Usage: .\scripts\deploy-render.ps1
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..").Path
$envFile = Join-Path $root "deploy\local.env"

if (-not $env:RENDER_API_KEY) {
  Write-Host "Set RENDER_API_KEY first:"
  Write-Host '  $env:RENDER_API_KEY = "rnd_..."'
  exit 1
}
if (-not (Test-Path $envFile)) {
  & "$PSScriptRoot\generate-deploy-env.ps1"
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_ -split '=', 2
  $vars[$k.Trim()] = $v.Trim()
}

$body = @{
  type = "web_service"
  name = "rbac-pro-api"
  ownerId = $null
  repo = "https://github.com/benito-stephen/rbac-pro"
  branch = "main"
  rootDir = "backend"
  serviceDetails = @{
    runtime = "node"
    plan = "free"
    region = "oregon"
    buildCommand = "npm install"
    startCommand = "npm start"
    healthCheckPath = "/api/health"
    envVars = @(
      foreach ($key in $vars.Keys) {
        @{ key = $key; value = $vars[$key] }
      }
    )
  }
} | ConvertTo-Json -Depth 6

$headers = @{
  Authorization = "Bearer $env:RENDER_API_KEY"
  Accept = "application/json"
  "Content-Type" = "application/json"
}

Write-Host "Creating Render web service..."
try {
  $resp = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $body
  $url = $resp.serviceDetails.url
  if (-not $url) { $url = "https://$($resp.name).onrender.com" }
  Write-Host "Service created: $url"
  Write-Host "Health: $url/api/health"
  Write-Host "After deploy, run in Render Shell: npm run seed"
} catch {
  Write-Host $_.Exception.Message
  if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
  exit 1
}
