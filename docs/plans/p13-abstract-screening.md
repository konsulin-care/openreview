# Phase 13: Abstract Screening

**Objective:** Implement title/abstract screening.
**Dependencies:** P10, P12
**PRD Reference:** Section 44, Phase P13

## Scope

Includes: Include/exclude/uncertain decisions, reviewer identity,
optional exclusion reasons, decision revision, state reconstruction.
Excludes: Full-text screening, conflict detection.

## Acceptance Criteria

- Include/exclude/uncertain decisions can be recorded
- Reviewer identity is preserved
- Decisions are append-only events
- Exclusion reason is optional
- Decisions can be revisited
- Current state is correctly reconstructed

## Implementation Tasks

- [ ] Define screening.abstract.decision event schema
- [ ] Implement decision recording endpoint (POST /api/v1/screening)
- [ ] Record actor_id with each decision
- [ ] Support optional exclusion reason
- [ ] Allow decision revision (old event preserved, new event added)
- [ ] Implement recapitulation for abstract screening state
- [ ] Write tests for decision recording and revision

## Related ADRs

- [ADR 010](../adr/010-optional-screening-reasons.md) — Optional reasons
- [ADR 001](../adr/001-event-log-source-of-truth.md) — Audit trail
