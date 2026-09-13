#!/bin/sh
set -eu

GO_PORT="${GO_PORT:-1234}"
WEB_PORT="${WEB_PORT:-4321}"
GO_PID=""
WEB_PID=""

# Check if a port is available
port_available() {
  _port="$1"
  if command -v nc >/dev/null 2>&1; then
    ! nc -z localhost "$_port" 2>/dev/null
  elif command -v ss >/dev/null 2>&1; then
    ! ss -tln | grep -q ":${_port} "
  else
    # Fallback: assume available
    return 0
  fi
}

# Find an unused port starting from the given port
find_port() {
  _port="$1"
  while ! port_available "$_port"; do
    _port=$((_port + 1))
  done
  echo "$_port"
}

cleanup() {
  echo ""
  echo "==> Shutting down..."
  [ -n "$GO_PID" ] && kill "$GO_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

GO_PORT=$(find_port "$GO_PORT")
WEB_PORT=$(find_port "$WEB_PORT")

echo "==> Starting Go engine on :${GO_PORT}..."
go run ./cmd/openreview --port "$GO_PORT" &
GO_PID=$!

echo "==> Starting Astro dev on :${WEB_PORT}..."
cd web && pnpm dev --port "$WEB_PORT" &
WEB_PID=$!

echo ""
echo "  Go engine : http://localhost:${GO_PORT}"
echo "  Astro dev : http://localhost:${WEB_PORT}"
echo ""
echo "  Press Ctrl+C to stop both."

wait
