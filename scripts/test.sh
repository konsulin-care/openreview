#!/bin/sh
set -eu

backend=false
frontend=false
api=false
race=false
any_flag=false

for arg in "$@"; do
  case "$arg" in
    --backend)  backend=true; any_flag=true ;;
    --frontend) frontend=true; any_flag=true ;;
    --api)      api=true; any_flag=true ;;
    --race)     race=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if [ "$any_flag" = false ]; then
  backend=true
  frontend=true
  api=true
fi

failures=0

if [ "$frontend" = true ]; then
  echo "==> Running vitest..."
  pnpm --dir web test || failures=$((failures + 1))
fi

if [ "$backend" = true ]; then
  echo "==> Running go test..."
  go_flags="-count=1"
  if [ "$race" = true ]; then
    go_flags="$go_flags -race"
  fi
  # shellcheck disable=SC2086
  go test $go_flags ./... || failures=$((failures + 1))
fi

if [ "$api" = true ]; then
  echo "==> Running bruno..."
  scripts/bruno.sh || failures=$((failures + 1))
fi

if [ "$failures" -gt 0 ]; then
  echo "==> $failures test suite(s) failed"
  exit 1
fi

echo "==> All tests passed"
