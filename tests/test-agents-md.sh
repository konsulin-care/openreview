#!/bin/sh
# Tests for AGENTS.md files
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

echo "=== AGENTS.md Tests ==="
echo ""

# Root AGENTS.md
ROOT_AGENTS="$SCRIPT_DIR/AGENTS.md"

if [ -f "$ROOT_AGENTS" ]; then
  pass "root AGENTS.md exists"

  if grep -q "mise run build" "$ROOT_AGENTS"; then
    pass "root AGENTS.md mentions 'mise run build'"
  else
    fail "root AGENTS.md missing 'mise run build'"
  fi

  if grep -q "mise run dev" "$ROOT_AGENTS"; then
    pass "root AGENTS.md mentions 'mise run dev'"
  else
    fail "root AGENTS.md missing 'mise run dev'"
  fi

  if grep -q "mise run test" "$ROOT_AGENTS"; then
    pass "root AGENTS.md mentions 'mise run test'"
  else
    fail "root AGENTS.md missing 'mise run test'"
  fi

  # Should NOT reference old tasks
  if grep -q "mise run app" "$ROOT_AGENTS"; then
    fail "root AGENTS.md still references old 'mise run app'"
  else
    pass "root AGENTS.md has no old 'mise run app'"
  fi

  if grep -q "mise run dev-backend" "$ROOT_AGENTS"; then
    fail "root AGENTS.md still references old 'mise run dev-backend'"
  else
    pass "root AGENTS.md has no old 'mise run dev-backend'"
  fi

  if grep -q "mise run dev-frontend" "$ROOT_AGENTS"; then
    fail "root AGENTS.md still references old 'mise run dev-frontend'"
  else
    pass "root AGENTS.md has no old 'mise run dev-frontend'"
  fi

  # Testing scope note
  if grep -qi "test.*scope\|test.*go\|test.*astro\|scripts.*not tested\|unit test" "$ROOT_AGENTS"; then
    pass "root AGENTS.md has testing scope note"
  else
    fail "root AGENTS.md missing testing scope note"
  fi

else
  fail "root AGENTS.md does not exist"
fi

echo ""

# Web AGENTS.md
WEB_AGENTS="$SCRIPT_DIR/web/AGENTS.md"

if [ -f "$WEB_AGENTS" ]; then
  pass "web AGENTS.md exists"

  if grep -qi "vitest\|testing" "$WEB_AGENTS"; then
    pass "web AGENTS.md mentions testing"
  else
    fail "web AGENTS.md missing testing mention"
  fi

else
  fail "web AGENTS.md does not exist"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
