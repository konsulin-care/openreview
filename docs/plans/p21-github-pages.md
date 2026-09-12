# Phase 21: GitHub Pages

**Objective:** Publish the static frontend.
**Dependencies:** P1
**PRD Reference:** Section 44, Phase P21

## Scope

Includes: Astro static build, GitHub Actions CI, GitHub Pages hosting.
Application connects to separately running engine.
Excludes: Engine hosting, backend deployment.

## Acceptance Criteria

- Astro builds static assets
- GitHub Actions builds the frontend
- GitHub Pages hosts the frontend
- Application can connect to a separately running Review Engine

## Implementation Tasks

- [ ] Create GitHub Actions workflow for Astro build
- [ ] Configure GitHub Pages deployment
- [ ] Add engine URL configuration for hosted frontend
- [ ] Verify frontend connects to remote engine
- [ ] Test deployment pipeline end-to-end

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Static frontend
- [ADR 015](../adr/015-remote-access-via-tailscale.md) — Remote engine access
