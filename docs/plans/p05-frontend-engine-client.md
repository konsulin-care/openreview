# Phase 5: Frontend/Engine Client

**Objective:** Connect TypeScript frontend to Go engine.
**Dependencies:** P1, P4
**PRD Reference:** Section 44, Phase P5

## Scope

Includes: Typed client abstraction, engine status retrieval,
configurable engine URL.
Excludes: Full API coverage, authentication.

## Acceptance Criteria

- Typed ReviewEngineClient exists
- Frontend can retrieve engine status
- Engine URL is configurable

## Implementation Tasks

- [ ] Create ReviewEngineClient in web/src/lib/
- [ ] Define TypeScript types for API responses
- [ ] Implement status retrieval
- [ ] Make engine URL configurable (env/config)
- [ ] Add client initialization to app entry point
- [ ] Write client unit tests

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Engine/frontend boundary
