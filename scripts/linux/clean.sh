#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo "==> Cleaning build artifacts and runtime data..."

# Backend build outputs
rm -rf "$PROJECT_ROOT/bin"

# Frontend build outputs
rm -rf "$PROJECT_ROOT/mount-hub/.next"
rm -rf "$PROJECT_ROOT/mount-hub/node_modules"

# Legacy & temporary directories
rm -rf "$PROJECT_ROOT/tmp"
rm -rf "$PROJECT_ROOT/build"
rm -rf "$PROJECT_ROOT/log"
rm -rf "$PROJECT_ROOT/daemon"
rm -rf "$PROJECT_ROOT/output"

# public/dist (placeholder frontend build for embed)
rm -rf "$PROJECT_ROOT/public/dist"

# Runtime data (database, config, temp, logs, search index)
rm -rf "$PROJECT_ROOT/data"

echo "==> Clean complete."
