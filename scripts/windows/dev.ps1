#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

$RunBackend = $false
$RunFrontend = $false

foreach ($arg in $args) {
  switch ($arg) {
    "--backend"  { $RunBackend = $true }
    "--frontend" { $RunFrontend = $true }
    default {
      Write-Host "Usage: $($MyInvocation.MyCommand.Name) [--backend] [--frontend]"
      exit 1
    }
  }
}

if (-not $RunBackend -and -not $RunFrontend) {
  $RunBackend = $true
  $RunFrontend = $true
}

$Jobs = @()

if ($RunBackend) {
  Write-Host "==> Starting Go backend (go run --debug)..."
  $Job = Start-Job -ScriptBlock {
    param($Root)
    Set-Location $Root
    & go run . server --debug
  } -ArgumentList $ProjectRoot
  $Jobs += $Job
}

if ($RunFrontend) {
  Write-Host "==> Starting Next.js dev server..."
  $Job = Start-Job -ScriptBlock {
    param($Root)
    Set-Location "$Root\mount-hub"
    & pnpm run dev
  } -ArgumentList $ProjectRoot
  $Jobs += $Job
}

Write-Host "Press Ctrl+C to stop..."

try {
  while ($true) {
    Start-Sleep -Seconds 1
    $allDone = $true
    foreach ($job in $Jobs) {
      if ($job.State -eq "Running") {
        $allDone = $false
        break
      }
    }
    if ($allDone) { break }
  }
} finally {
  Write-Host ""
  Write-Host "Shutting down..."
  foreach ($job in $Jobs) {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
  }
}
