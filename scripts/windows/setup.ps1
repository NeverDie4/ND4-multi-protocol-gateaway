#Requires -Version 5.1
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "==> Installing Go dependencies..."
Push-Location $ProjectRoot
go mod download
go mod tidy
Pop-Location

Write-Host "==> Installing frontend dependencies..."
Push-Location "$ProjectRoot\mount-hub"
pnpm install
Pop-Location

Write-Host "==> Checking config.json..."
Push-Location $ProjectRoot
New-Item -ItemType Directory -Force -Path "data" | Out-Null
if (-not (Test-Path "data\config.json")) {
  @"
{
  "force": false,
  "site_url": "",
  "cdn": "",
  "jwt_secret": "",
  "token_expires_in": 48,
  "database": {
    "type": "sqlite3",
    "host": "",
    "port": 0,
    "user": "",
    "password": "",
    "name": "data/data.db",
    "db_file": "data/data.db",
    "table_prefix": "x_",
    "ssl_mode": "",
    "dsn": ""
  },
  "scheme": {
    "address": "0.0.0.0",
    "http_port": 5244,
    "https_port": -1,
    "force_https": false,
    "cert_file": "",
    "key_file": "",
    "unix_file": "",
    "unix_file_perm": ""
  },
  "temp_dir": "data/temp",
  "bleve_dir": "data/bleve",
  "dist_dir": "",
  "log": {
    "enable": true,
    "name": "data/log/log.log",
    "max_size": 50,
    "max_backups": 30,
    "max_age": 28,
    "compress": false
  },
  "delayed_start": 0,
  "max_connections": 0,
  "max_concurrency": 64,
  "tls_insecure_skip_verify": false
}
"@ | Set-Content -Path "data\config.json"
  Write-Host "==> Generated data\config.json (SQLite3 as default database)."
  Write-Host "    Edit data\config.json to switch to MySQL/PostgreSQL."
} else {
  Write-Host "==> data\config.json already exists, skipping."
}
Pop-Location

Write-Host ""
Write-Host "==> Setup complete!"
Write-Host "    Run '.\scripts\windows\dev-backend.ps1' to start backend."
Write-Host "    Run '.\scripts\windows\dev-frontend.ps1' to start frontend."
Write-Host "    Run '.\scripts\windows\dev.ps1' to start both."
