# 011. Manual Conflict Resolution

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 30

## Context

When two reviewers disagree on a paper's eligibility, the system
must not silently resolve the conflict. Scientific judgment requires
human discussion and consensus.

## Decision

The system detects disagreements and surfaces them on the dashboard.
It does not automatically resolve scientific conflicts. Reviewers
discuss and manually record resolution decisions.

## Consequences

- No false sense of automated scientific judgment
- Conflicts are visible and trackable
- Resolution is explicit and recorded as an event
- Original conflicting decisions remain in history
- Optional resolution event records the consensus
