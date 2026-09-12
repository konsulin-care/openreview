# Phase 3: Application Shell

**Objective:** Establish application routes.
**Dependencies:** P2
**PRD Reference:** Section 44, Phase P3

## Scope

Includes: Application page shells (initialize, dashboard, project,
settings). Query parameter parsing for project selection.
Excludes: Engine integration, real data.

## Acceptance Criteria

- `/initialize` exists
- `/dashboard` exists
- `/project?id=<id>` exists
- `/settings` exists
- Query parameter is correctly parsed

## Implementation Tasks

- [ ] Create `/initialize` page shell
- [ ] Create `/dashboard` page shell
- [ ] Create `/project` page with query param parsing
- [ ] Create `/settings` page shell
- [ ] Implement route guards (redirect NEW → /initialize)
- [ ] Verify query parameter extraction works correctly

## Related ADRs

- [ADR 012](../adr/012-query-param-project-selection.md) — ?id= routing
