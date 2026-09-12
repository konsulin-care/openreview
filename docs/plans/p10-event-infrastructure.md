# Phase 10: Event Infrastructure

**Objective:** Implement append-only JSONL event streams.
**Dependencies:** P8
**PRD Reference:** Section 44, Phase P10

## Scope

Includes: Event format, JSONL read/write, ULID generation,
actor-scoped streams, deterministic ordering.
Excludes: Specific event types (screening, ingestion).

## Acceptance Criteria

- Events use ULIDs
- Events contain actor ID and timestamp
- Each actor writes to their own domain JSONL
- Events can be read deterministically
- Events remain immutable

## Implementation Tasks

- [ ] Define event base schema (event_id, schema, type, actor_id, timestamp)
- [ ] Implement ULID generator
- [ ] Create JSONL writer (append-only, per-actor, per-domain)
- [ ] Create JSONL reader (deterministic ordering by ULID)
- [ ] Implement event immutability enforcement
- [ ] Add domain directory structure (events/<domain>/)
- [ ] Write tests for write/read ordering and immutability

## Related ADRs

- [ADR 001](../adr/001-event-log-source-of-truth.md) — Event log as truth
- [ADR 005](../adr/005-actor-scoped-jsonl-streams.md) — Actor-scoped files
- [ADR 006](../adr/006-ulid-for-event-identity.md) — ULID identity
