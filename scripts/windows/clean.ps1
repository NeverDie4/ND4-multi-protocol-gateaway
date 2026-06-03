#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Cleaning build artifacts and runtime data..."

$Dirs = @(
  "bin",
  "mount-hub\.next",
  "mount-hub\node_modules",
  "tmp",
  "build",
  "log",
  "daemon",
  "output",
  "public\dist",
  "data"
)
foreach ($dir in $Dirs) {
  $path = Join-Path $ProjectRoot $dir
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
  }
}

Write-Host "==> Clean complete."
