#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

$AppName = "alist.exe"
$BinDir = Join-Path $ProjectRoot "bin"

$Version = if ($args.Count -gt 0) { $args[0] } else { "dev" }
$BuiltAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$GitCommit = try { git log --pretty=format:"%h" -1 2>$null } catch { "unknown" }

Write-Host "==> Building backend (Go)..."
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

Push-Location $ProjectRoot
go build `
  -o "$BinDir\$AppName" `
  -ldflags " -w -s -X 'github.com/alist-org/alist/v3/internal/conf.BuiltAt=$BuiltAt' -X 'github.com/alist-org/alist/v3/internal/conf.GitCommit=$GitCommit' -X 'github.com/alist-org/alist/v3/internal/conf.Version=$Version' " `
  -tags=jsoniter `
  .
Pop-Location

Write-Host "==> Backend build done: $BinDir\$AppName"
