#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Building frontend (Next.js)..."
Push-Location "$ProjectRoot\mount-hub"
pnpm run build
Pop-Location

Write-Host "==> Frontend build done: $ProjectRoot\mount-hub\.next"
