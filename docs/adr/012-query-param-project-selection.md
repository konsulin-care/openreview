# 012. Query Param Project Selection

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 7

## Context

Project selection needs a URL scheme that works with static hosting
and avoids server-side routing requirements. Dynamic path segments
like /project/:id require server-side route handling.

## Decision

Project selection uses query parameters: `/project?id=<id>`
Not path segments: `/project/<id>`

## Consequences

- Works with static site hosting (GitHub Pages compatible)
- Frontend extracts project ID from URLSearchParams
- No server-side routing needed for project selection
- URL is explicit and shareable
- Consistent with Astro's static generation model
