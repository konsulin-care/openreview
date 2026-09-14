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
- [ ] Build dashboard UI with summary cards inside `VIEWS["healthy"]`
- [ ] Connect frontend / to engine (dashboard renders on `/` when state is healthy)
- [ ] Display counts from event-derived state in sidebar main area
- [ ] Write tests for statistics accuracy

## Notes

- Dashboard renders on `/` via `VIEWS["healthy"]` in `engine-state.ts` (no separate page)
- Sidebar layout is established: 240px left sidebar with Settings link at bottom
- Project list (P9) goes in the sidebar `<nav>` section

## Related ADRs

- [ADR 001](../adr/001-event-log-source-of-truth.md) — Derived state
