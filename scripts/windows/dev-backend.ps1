#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Starting Go backend (go run --debug)..."
$Job = Start-Job -ScriptBlock {
  param($Root)
  Set-Location $Root
  & go run . server --debug
} -ArgumentList $ProjectRoot

Write-Host "Backend running at http://127.0.0.1:5244"
Write-Host "Press Ctrl+C to stop..."

try {
  while ($Job.State -eq "Running") {
    Start-Sleep -Seconds 1
  }
} finally {
  Write-Host ""
  Write-Host "Shutting down backend..."
  Stop-Job $Job -ErrorAction SilentlyContinue
  Remove-Job $Job -ErrorAction SilentlyContinue
}
