#!/bin/sh
# Tests for mise.toml configuration
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MISE_TOML="$SCRIPT_DIR/mise.toml"
PASS=0
FAIL=0

pass() {
  PASS=$((PASS + 1))
  echo "  PASS: $1"
}

fail() {
  FAIL=$((FAIL + 1))
  echo "  FAIL: $1"
}

echo "=== mise.toml Tests ==="
echo ""

# Test file exists
if [ -f "$MISE_TOML" ]; then
  pass "mise.toml exists"
else
  fail "mise.toml does not exist"
  echo ""
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi

# Test required tools are defined
for tool in go node pnpm golangci-lint lefthook; do
  if grep -q "^$tool\s*=" "$MISE_TOML" 2>/dev/null || grep -q "\"$tool\"" "$MISE_TOML" 2>/dev/null; then
    pass "tool '$tool' is defined"
  else
    fail "tool '$tool' is not defined"
  fi
done

echo ""

# Test required tasks exist
for task in build dev test lint fmt hooks; do
  if grep -qE "^\[$task\]|^$task\s*=" "$MISE_TOML" 2>/dev/null; then
    pass "task '$task' is defined"
  else
    fail "task '$task' is not defined"
  fi
done

echo ""

# Test removed tasks do NOT exist
for task in app dev-backend dev-frontend; do
  if grep -qE "^\[$task\]|^$task\s*=" "$MISE_TOML" 2>/dev/null; then
    fail "removed task '$task' still exists"
  else
    pass "removed task '$task' is gone"
  fi
done

echo ""

# Test build task points to scripts/build.sh
if grep -q "scripts/build.sh" "$MISE_TOML"; then
  pass "build task references scripts/build.sh"
else
  fail "build task does not reference scripts/build.sh"
fi

# Test dev task points to scripts/dev.sh
if grep -q "scripts/dev.sh" "$MISE_TOML"; then
  pass "dev task references scripts/dev.sh"
else
  fail "dev task does not reference scripts/dev.sh"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
