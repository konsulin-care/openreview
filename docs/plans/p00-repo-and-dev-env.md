# Phase 0: Repository and Development Environment

**Objective:** Establish reproducible development.
**Dependencies:** None
**PRD Reference:** Section 44, Phase P0

## Scope

Includes: Git repo, mise configuration, tool installation, basic test.
Excludes: Application code, frontend, engine.

## Acceptance Criteria

- Clean machine with Git and mise can clone repository
- `mise install` installs pinned tools
- `mise run test` succeeds

## Implementation Tasks

- [ ] Initialize Git repository
- [ ] Create mise.toml with pinned versions (Go, Node.js)
- [ ] Create go.mod
- [ ] Create package.json with basic scripts
- [ ] Add .gitignore
- [ ] Create minimal test that passes
- [ ] Verify mise install and mise run test on clean environment

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Go + Astro stack
