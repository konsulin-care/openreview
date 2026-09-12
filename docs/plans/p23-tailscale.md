# Phase 23: Tailscale

**Objective:** Enable private remote access to the local engine.
**Dependencies:** P22
**PRD Reference:** Section 44, Phase P23

## Scope

Includes: Tailscale Serve configuration, cross-device access.
Data stays on engine machine. No public relay.
Excludes: Tailscale Funnel, public exposure.

## Acceptance Criteria

- Second authorized device can reach the engine
- Project data remains on the engine machine
- No public relay is required

## Implementation Tasks

- [ ] Document Tailscale Serve setup for engine
- [ ] Test cross-device access via Tailscale
- [ ] Verify engine binding supports Tailscale interface
- [ ] Test project data stays local
- [ ] Document setup for users

## Related ADRs

- [ADR 015](../adr/015-remote-access-via-tailscale.md) — Tailscale model
