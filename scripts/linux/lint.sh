#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo "==> Linting Go code..."
go vet ./...

echo ""
echo "==> Linting frontend code..."
cd "$PROJECT_ROOT/mount-hub"
pnpm run lint

echo ""
echo "==> Lint complete."
