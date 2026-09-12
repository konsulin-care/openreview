# Phase 22: Self-Configuration

**Objective:** Allow users to configure the engine endpoint.
**Dependencies:** P5, P20
**PRD Reference:** Section 44, Phase P22

## Scope

Includes: localhost, LAN, Tailscale endpoint configuration.
Frontend does not know project file locations.
Excludes: Public relay, authentication.

## Acceptance Criteria

- Localhost works
- LAN endpoint works
- Tailscale endpoint works
- Frontend does not need to know where project files reside

## Implementation Tasks

- [ ] Implement engine URL configuration UI
- [ ] Support localhost, LAN IP, Tailscale hostname
- [ ] Persist endpoint preference (localStorage or setting)
- [ ] Test each endpoint type
- [ ] Verify frontend is decoupled from file paths

## Related ADRs

- [ADR 015](../adr/015-remote-access-via-tailscale.md) — Tailscale access
