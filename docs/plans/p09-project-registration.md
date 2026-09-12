# Phase 9: Project Registration/Opening

**Objective:** Connect project directories to the master DB.
**Dependencies:** P7, P8
**PRD Reference:** Section 44, Phase P9

## Scope

Includes: Project registration, opening, path resolution, frontend
project selection.
Excludes: Event processing, screening.

## Acceptance Criteria

- Project can be registered
- Project can be opened
- `/project?id=<id>` resolves the correct project
- Master DB provides the project path

## Implementation Tasks

- [ ] Implement project registration (store path in master DB)
- [ ] Implement project open (resolve path, validate manifest)
- [ ] Add GET /api/v1/project/:id endpoint
- [ ] Add GET /api/v1/project list endpoint
- [ ] Connect frontend /project?id= to engine
- [ ] Add project selection UI to /dashboard
- [ ] Write tests for registration and path resolution

## Related ADRs

- [ADR 012](../adr/012-query-param-project-selection.md) — ?id= routing
