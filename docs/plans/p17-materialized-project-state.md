# Phase 17: Materialized Project State

**Objective:** Make event replay performant.
**Dependencies:** P10, P13, P15, P16
**PRD Reference:** Section 44, Phase P17

## Scope

Includes: Event log reconstruction, SQLite projection, incremental
replay, cache rebuild from project files.
Excludes: Dashboard UI, export.

## Acceptance Criteria

- Event log can reconstruct project state
- SQLite projection can be generated
- Subsequent updates replay only new events where possible
- Deleting the projection does not lose project data
- Projection can be rebuilt from project files

## Implementation Tasks

- [ ] Implement recapitulation engine (event → state)
- [ ] Create project cache SQLite schema
- [ ] Implement checkpoint tracking (replay position)
- [ ] Implement incremental replay (new events only)
- [ ] Implement full rebuild from project directory
- [ ] Add cache deletion and rebuild capability
- [ ] Write tests for rebuild and incremental update

## Related ADRs

- [ADR 013](../adr/013-disposable-project-cache.md) — Disposable cache
- [ADR 001](../adr/001-event-log-source-of-truth.md) — Events as truth
