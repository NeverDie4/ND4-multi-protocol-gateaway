#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."

Write-Host "==> Cleaning build artifacts..."

$Dirs = @("bin", "public\dist", "tmp", "data", "build", "log", "daemon", "output")
foreach ($dir in $Dirs) {
  $path = Join-Path $ProjectRoot $dir
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
  }
}

Write-Host "==> Clean complete."
