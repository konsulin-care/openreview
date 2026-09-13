#!/bin/sh
set -eu

GO_PORT="${GO_PORT:-3000}"
WEB_PORT="${WEB_PORT:-4321}"
GO_PID=""
WEB_PID=""

cleanup() {
  echo ""
  echo "==> Shutting down..."
  [ -n "$GO_PID" ] && kill "$GO_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting Go engine on :${GO_PORT}..."
go run ./cmd/openreview --port "$GO_PORT" &
GO_PID=$!

echo "==> Starting Astro dev on :${WEB_PORT}..."
cd web && pnpm dev -- --port "$WEB_PORT" &
WEB_PID=$!

echo ""
echo "  Go engine : http://localhost:${GO_PORT}"
echo "  Astro dev : http://localhost:${WEB_PORT}"
echo ""
echo "  Press Ctrl+C to stop both."

wait
