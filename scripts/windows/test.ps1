#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."

Write-Host "==> Running Go tests..."
Push-Location $ProjectRoot
$testArgs = if ($args.Count -gt 0) { $args } else { @() }
go test ./... -count=1 @testArgs
Pop-Location

Write-Host ""
Write-Host "==> Tests complete."
