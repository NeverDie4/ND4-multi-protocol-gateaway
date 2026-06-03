#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT/mount-hub"

cleanup() {
  echo ""
  echo "Shutting down frontend..."
  kill $FRONTEND_PID 2>/dev/null || true
  wait $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "==> Starting Next.js dev server..."
pnpm run dev &
FRONTEND_PID=$!

echo "Frontend running at http://127.0.0.1:3000"
wait
