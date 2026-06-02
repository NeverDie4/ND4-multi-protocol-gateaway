#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

run_backend=false
run_frontend=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend) run_backend=true ;;
    --frontend) run_frontend=true ;;
    *) echo "Usage: $0 [--backend] [--frontend]"; exit 1 ;;
  esac
  shift
done

if ! $run_backend && ! $run_frontend; then
  run_backend=true
  run_frontend=true
fi

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  wait $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

if $run_backend; then
  if command -v air &>/dev/null; then
    echo "==> Starting Go backend (air)..."
    air &
    BACKEND_PID=$!
  else
    echo "==> Starting Go backend (go run)..."
    go run . server &
    BACKEND_PID=$!
  fi
fi

if $run_frontend; then
  echo "==> Starting Vite dev server..."
  cd "$PROJECT_ROOT/web"
  pnpm run dev &
  FRONTEND_PID=$!
fi

wait
