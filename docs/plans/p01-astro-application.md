# Phase 1: Astro Application

**Objective:** Establish the static frontend.
**Dependencies:** P0
**PRD Reference:** Section 44, Phase P1

## Scope

Includes: Astro build, static routes for content and application.
Excludes: Component system, engine integration.

## Acceptance Criteria

- Astro builds successfully
- `/` available
- `/docs` available
- `/blog` available
- `/faq` available
- `/components` available

## Implementation Tasks

- [ ] Configure Astro (astro.config.ts)
- [ ] Create base layout
- [ ] Create `/` home page
- [ ] Create `/docs` page
- [ ] Create `/blog` page
- [ ] Create `/faq` page
- [ ] Create `/components` placeholder
- [ ] Set up content collections (blog, docs, faq)
- [ ] Verify static build succeeds

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Astro for frontend
- [ADR 012](../adr/012-query-param-project-selection.md) — Routing model
