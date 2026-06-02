#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo "==> Cleaning build artifacts..."

rm -rf "$PROJECT_ROOT/bin"
rm -rf "$PROJECT_ROOT/public/dist"
rm -rf "$PROJECT_ROOT/tmp"
rm -rf "$PROJECT_ROOT/data"
rm -rf "$PROJECT_ROOT/build"
rm -rf "$PROJECT_ROOT/log"
rm -rf "$PROJECT_ROOT/daemon"
rm -rf "$PROJECT_ROOT/output"

echo "==> Clean complete."
