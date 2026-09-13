#!/bin/sh
# Tests for scripts in scripts/ directory
# These are integration tests - they verify scripts exist and are well-formed.
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
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

echo "=== Script Tests ==="
echo ""

# Test build.sh
echo "--- scripts/build.sh ---"

if [ -f "$SCRIPT_DIR/scripts/build.sh" ]; then
  pass "file exists"
else
  fail "file does not exist"
fi

if [ -x "$SCRIPT_DIR/scripts/build.sh" ]; then
  pass "file is executable"
else
  fail "file is not executable"
fi

if head -1 "$SCRIPT_DIR/scripts/build.sh" | grep -q "^#!/bin/sh"; then
  pass "has POSIX shebang (#!/bin/sh)"
else
  fail "missing or non-POSIX shebang"
fi

if sh -n "$SCRIPT_DIR/scripts/build.sh" 2>/dev/null; then
  pass "valid POSIX sh syntax"
else
  fail "syntax error"
fi

echo ""

# Test dev.sh
echo "--- scripts/dev.sh ---"

if [ -f "$SCRIPT_DIR/scripts/dev.sh" ]; then
  pass "file exists"
else
  fail "file does not exist"
fi

if [ -x "$SCRIPT_DIR/scripts/dev.sh" ]; then
  pass "file is executable"
else
  fail "file is not executable"
fi

if head -1 "$SCRIPT_DIR/scripts/dev.sh" | grep -q "^#!/bin/sh"; then
  pass "has POSIX shebang (#!/bin/sh)"
else
  fail "missing or non-POSIX shebang"
fi

if sh -n "$SCRIPT_DIR/scripts/dev.sh" 2>/dev/null; then
  pass "valid POSIX sh syntax"
else
  fail "syntax error"
fi

echo ""

# Summary
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
