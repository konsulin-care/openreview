#!/bin/sh
# Tests for web/ build configuration
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$SCRIPT_DIR/web"
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

echo "=== Web Build Tests ==="
echo ""

# Test astro.config.ts has Tailwind plugin
if grep -q '@tailwindcss/vite' "$WEB_DIR/astro.config.ts" 2>/dev/null; then
  pass "astro.config.ts imports @tailwindcss/vite"
else
  fail "astro.config.ts missing @tailwindcss/vite import"
fi

if grep -q 'tailwindcss()' "$WEB_DIR/astro.config.ts" 2>/dev/null; then
  pass "astro.config.ts uses tailwindcss() plugin"
else
  fail "astro.config.ts missing tailwindcss() plugin"
fi

if grep -q 'output.*static' "$WEB_DIR/astro.config.ts" 2>/dev/null; then
  pass "astro.config.ts has output: static"
else
  fail "astro.config.ts missing output: static"
fi

echo ""

# Test global.css exists and imports tailwindcss
if [ -f "$WEB_DIR/src/styles/global.css" ]; then
  pass "global.css exists"
  if grep -q '@import "tailwindcss"' "$WEB_DIR/src/styles/global.css" 2>/dev/null; then
    pass "global.css imports tailwindcss"
  else
    fail "global.css missing tailwindcss import"
  fi
else
  fail "global.css does not exist"
fi

echo ""

# Test content.config.ts exists
if [ -f "$WEB_DIR/src/content.config.ts" ]; then
  pass "content.config.ts exists"
else
  fail "content.config.ts does not exist"
fi

echo ""

# Test BaseLayout.astro exists
if [ -f "$WEB_DIR/src/layouts/BaseLayout.astro" ]; then
  pass "BaseLayout.astro exists"
  if grep -q 'global.css' "$WEB_DIR/src/layouts/BaseLayout.astro" 2>/dev/null; then
    pass "BaseLayout.astro imports global.css"
  else
    fail "BaseLayout.astro missing global.css import"
  fi
else
  fail "BaseLayout.astro does not exist"
fi

echo ""

# Test page routes exist
for page in index docs/index blog/index faq/index components/index; do
  if [ -f "$WEB_DIR/src/pages/$page.astro" ]; then
    pass "page $page.astro exists"
  else
    fail "page $page.astro does not exist"
  fi
done

echo ""

# Test placeholder content exists
for content in docs/getting-started blog/introducing-openreview faq/general faq/data-safety components/button; do
  if [ -f "$WEB_DIR/src/content/$content.md" ]; then
    pass "content $content.md exists"
  else
    fail "content $content.md does not exist"
  fi
done

echo ""

# Summary
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
