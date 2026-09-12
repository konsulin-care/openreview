# Phase 7: Master Database

**Objective:** Implement machine-local project/user registry.
**Dependencies:** P0
**PRD Reference:** Section 44, Phase P7

## Scope

Includes: Master DB schema, actor table, project table, setting
table, CRUD operations.
Excludes: Project cache, event storage.

## Acceptance Criteria

- Master DB persists across restart
- Actor identity persists
- Project registry persists
- Project paths can be stored and retrieved

## Implementation Tasks

- [ ] Design master DB schema (actor, project, setting)
- [ ] Implement database/migrations/master/001_init.sql
- [ ] Create database connection manager
- [ ] Implement actor CRUD (create, get, list)
- [ ] Implement project registry (register, get, list, update)
- [ ] Implement setting storage (get, set)
- [ ] Add database path resolution (OS-specific app data dir)
- [ ] Write unit tests for all CRUD operations

## Related ADRs

- [ADR 013](../adr/013-disposable-project-cache.md) — Master DB scope
- [ADR 003](../adr/003-portable-project-directory.md) — Path handling
