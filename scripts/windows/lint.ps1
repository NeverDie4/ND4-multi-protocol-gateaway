#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Linting Go code..."
Push-Location $ProjectRoot
go vet ./...
Pop-Location

Write-Host ""
Write-Host "==> Linting frontend code..."
Push-Location "$ProjectRoot\mount-hub"
pnpm run lint
Pop-Location

Write-Host ""
Write-Host "==> Lint complete."
