#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."

Write-Host "==> Linting Go code..."
Push-Location $ProjectRoot
go vet ./...
Pop-Location

Write-Host ""
Write-Host "==> Linting frontend code..."
Push-Location "$ProjectRoot\web"
pnpm run lint
Pop-Location

Write-Host ""
Write-Host "==> Lint complete."
