#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

APP_NAME="alist"
BIN_DIR="$PROJECT_ROOT/bin"

VERSION="${1:-dev}"
BUILT_AT="$(date +'%F %T %z')"
GIT_COMMIT="$(git log --pretty=format:"%h" -1 2>/dev/null || echo "unknown")"

echo "==> Building frontend..."
cd "$PROJECT_ROOT/web"
pnpm run build

echo "==> Building backend..."
cd "$PROJECT_ROOT"
mkdir -p "$BIN_DIR"

go build \
  -o "$BIN_DIR/$APP_NAME" \
  -ldflags "\
    -w -s \
    -X 'github.com/alist-org/alist/v3/internal/conf.BuiltAt=$BUILT_AT' \
    -X 'github.com/alist-org/alist/v3/internal/conf.GitCommit=$GIT_COMMIT' \
    -X 'github.com/alist-org/alist/v3/internal/conf.Version=$VERSION' \
  " \
  -tags=jsoniter \
  .

echo "==> Done: $BIN_DIR/$APP_NAME"
