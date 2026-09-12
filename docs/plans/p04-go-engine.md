# Phase 4: Go Engine

**Objective:** Establish the Review Engine.
**Dependencies:** P0
**PRD Reference:** Section 44, Phase P4

## Scope

Includes: Go HTTP server, status endpoint, basic routing.
Excludes: Database, business logic, frontend integration.

## Acceptance Criteria

- `GET /api/v1/status` returns a valid status response

## Implementation Tasks

- [ ] Create cmd/openreview/main.go entry point
- [ ] Set up HTTP server with default bind (127.0.0.1)
- [ ] Implement /api/v1/status endpoint
- [ ] Return engine state (NEW/READY)
- [ ] Add configuration for port and bind address
- [ ] Write test for status endpoint

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Go engine
- [ADR 002](../adr/002-local-first-architecture.md) — Local binding
