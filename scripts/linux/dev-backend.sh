#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

cleanup() {
  echo ""
  echo "Shutting down backend..."
  kill $BACKEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "==> Starting Go backend (go run --debug)..."
go run . server --debug &
BACKEND_PID=$!

echo "Backend running at http://127.0.0.1:5244"
wait
