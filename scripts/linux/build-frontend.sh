#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "==> Building frontend (Next.js)..."
cd "$PROJECT_ROOT/mount-hub"
pnpm run build

echo "==> Frontend build done: $PROJECT_ROOT/mount-hub/.next"
