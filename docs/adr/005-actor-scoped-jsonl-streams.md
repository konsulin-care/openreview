# 005. Actor-Scoped JSONL Streams

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 16

## Context

Multiple reviewers work independently on the same project. Each
reviewer makes screening decisions without waiting for others.
Concurrent writes to a single file risk corruption or ordering
ambiguity.

## Decision

Each reviewer writes only to their own JSONL file per event domain.
Structure: `events/<domain>/<actor-id>.jsonl`

## Consequences

- No concurrent append conflicts (each actor has its own file)
- Cloud sync friendly (minimal write contention)
- Streams are combined during recapitulation
- Ordering uses ULID, not file position
- New reviewers automatically get their own stream files
