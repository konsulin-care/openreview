#!/bin/sh
set -eu

# Start a temporary test server with a fresh database
TMP_DIR=$(mktemp -d)
DB_PATH="$TMP_DIR/test.sqlite"
export OPENREVIEW_DB_PATH="$DB_PATH"

echo "Starting test server on port 1236 with database at $DB_PATH"
go run ./cmd/openreview -port 1236 -bind 127.0.0.1 &
SERVER_PID=$!

# Cleanup function
cleanup() {
  kill $SERVER_PID 2>/dev/null || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Wait for server to be ready
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:1236/api/v1/health >/dev/null 2>&1; then
    echo "Test server ready"
    break
  fi
  sleep 0.1
done

# Override base URL for Bruno to use test server
cd docs/api
bru run --env local --env-var baseUrl=http://127.0.0.1:1236 health status preflight initialization actor
