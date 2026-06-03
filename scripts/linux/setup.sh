#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo "==> Installing Go dependencies..."
go mod download
go mod tidy

echo "==> Installing frontend dependencies..."
cd "$PROJECT_ROOT/mount-hub"
pnpm install

echo "==> Checking config.json..."
cd "$PROJECT_ROOT"
mkdir -p data
if [ ! -f data/config.json ]; then
  cat > data/config.json <<'EOF'
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
EOF
  echo "==> Generated data/config.json (SQLite3 as default database)."
  echo "    Edit data/config.json to switch to MySQL/PostgreSQL."
else
  echo "==> data/config.json already exists, skipping."
fi

echo ""
echo "==> Setup complete!"
echo "    Run './scripts/linux/dev-backend.sh' to start backend."
echo "    Run './scripts/linux/dev-frontend.sh' to start frontend."
echo "    Run './scripts/linux/dev.sh' to start both."
