# Phase 18: Dashboard

**Objective:** Display current review status.
**Dependencies:** P17
**PRD Reference:** Section 44, Phase P18

## Scope

Includes: Total records, included/excluded/uncertain counts,
conflict counts. Values derived from event state.
Excludes: Filtering, detailed views, export.

## Acceptance Criteria

- Total records/articles shown
- Included count shown
- Excluded count shown
- Uncertain/unknown count shown
- Conflicts shown
- Values are derived from event state

## Implementation Tasks

- [ ] Implement dashboard statistics query (from project cache)
- [ ] Add GET /api/v1/project/:id endpoint with stats
- [ ] Build dashboard UI with summary cards
- [ ] Connect frontend /dashboard to engine
- [ ] Display counts from event-derived state
- [ ] Write tests for statistics accuracy

## Related ADRs

- [ADR 001](../adr/001-event-log-source-of-truth.md) — Derived state
