#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."

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
  $airPath = Get-Command air -ErrorAction SilentlyContinue
  if ($airPath) {
    Write-Host "==> Starting Go backend (air)..."
    $Job = Start-Job -ScriptBlock {
      param($Root)
      Set-Location $Root
      & air
    } -ArgumentList $ProjectRoot
  } else {
    Write-Host "==> Starting Go backend (go run)..."
    $Job = Start-Job -ScriptBlock {
      param($Root)
      Set-Location $Root
      & go run . server
    } -ArgumentList $ProjectRoot
  }
  $Jobs += $Job
}

if ($RunFrontend) {
  Write-Host "==> Starting Vite dev server..."
  $Job = Start-Job -ScriptBlock {
    param($Root)
    Set-Location "$Root\web"
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
