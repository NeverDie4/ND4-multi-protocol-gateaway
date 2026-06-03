#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Running Go tests..."
Push-Location $ProjectRoot
$testArgs = if ($args.Count -gt 0) { $args } else { @() }
go test ./... -count=1 @testArgs
Pop-Location

Write-Host ""
Write-Host "==> Tests complete."
