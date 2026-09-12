# Phase 20: Local Packaged Application

**Objective:** Run the complete application locally.
**Dependencies:** P3, P5, P19
**PRD Reference:** Section 44, Phase P20

## Scope

Includes: Single command to start Go engine + serve Astro frontend.
Full screening workflow without internet.
Excludes: Packaging for distribution, installers.

## Acceptance Criteria

- `mise run app --web-ui` starts the Go engine and serves the built Astro application
- The complete screening workflow works without Internet connectivity

## Implementation Tasks

- [ ] Implement Go engine to serve static Astro build
- [ ] Create mise run task for app --web-ui
- [ ] Build Astro and copy to Go-servable location
- [ ] Verify full workflow: init → import → screen → export
- [ ] Test offline operation (no external dependencies)
- [ ] Write integration test for complete workflow

## Related ADRs

- [ADR 002](../adr/002-local-first-architecture.md) — Local-first
