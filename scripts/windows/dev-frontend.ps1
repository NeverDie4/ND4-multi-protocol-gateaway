#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Starting Next.js dev server..."
$Job = Start-Job -ScriptBlock {
  param($Root)
  Set-Location "$Root\mount-hub"
  & pnpm run dev
} -ArgumentList $ProjectRoot

Write-Host "Frontend running at http://127.0.0.1:3000"
Write-Host "Press Ctrl+C to stop..."

try {
  while ($Job.State -eq "Running") {
    Start-Sleep -Seconds 1
  }
} finally {
  Write-Host ""
  Write-Host "Shutting down frontend..."
  Stop-Job $Job -ErrorAction SilentlyContinue
  Remove-Job $Job -ErrorAction SilentlyContinue
}
