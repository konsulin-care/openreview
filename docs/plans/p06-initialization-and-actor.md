# Phase 6: Initialization and Actor Identity

**Objective:** Implement NEW → READY state transition.
**Dependencies:** P4, P5, P7
**PRD Reference:** Section 44, Phase P6

## Scope

Includes: Initialization flow, actor identity creation, master DB
creation, protected API enforcement, frontend redirects.
Excludes: Project management, screening.

## Acceptance Criteria

- Initialization collects name/email
- Stable actor ID is generated (ULID)
- Master DB is created
- Protected APIs reject pre-initialization access
- Frontend redirects NEW → /initialize, READY → /dashboard

## Implementation Tasks

- [ ] Implement POST /api/v1/initialize endpoint
- [ ] Generate ULID actor ID from name/email
- [ ] Create master database on first initialization
- [ ] Persist actor identity in master DB
- [ ] Add pre-initialization guard to protected endpoints
- [ ] Implement /initialize page in frontend
- [ ] Add redirect logic (NEW → /initialize, READY → /dashboard)
- [ ] Write integration tests for full initialization flow

## Related ADRs

- [ADR 006](../adr/006-ulid-for-event-identity.md) — Actor ID generation
- [ADR 013](../adr/013-disposable-project-cache.md) — Master vs cache DB
