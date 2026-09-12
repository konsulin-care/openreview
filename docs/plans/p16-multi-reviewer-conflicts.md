# Phase 16: Multi-Reviewer Conflicts

**Objective:** Detect disagreements between reviewers.
**Dependencies:** P13, P15
**PRD Reference:** Section 44, Phase P16

## Scope

Includes: Conflict detection, conflict surfacing, manual resolution
recording, history preservation.
Excludes: Automatic resolution, mediation workflows.

## Acceptance Criteria

- Independent reviewer decisions remain distinguishable
- Conflicting decisions are detected
- Conflicts appear in the dashboard
- No automatic scientific resolution occurs
- Manual resolution is recorded
- Original conflicting decisions remain in history

## Implementation Tasks

- [ ] Implement conflict detection logic (compare actor decisions)
- [ ] Record review.conflict.resolved events
- [ ] Surface conflicts in project state
- [ ] Add conflict resolution endpoint
- [ ] Preserve original decision history through resolution
- [ ] Write tests for conflict detection and resolution

## Related ADRs

- [ADR 011](../adr/011-manual-conflict-resolution.md) — Manual resolution
