# 001. Event Log as Source of Truth

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 2.3, 15, 17

## Context

Systematic reviews require complete audit trails. Decisions must be
traceable, reversible, and attributable. Traditional CRUD databases
make it difficult to preserve historical state when records are
overwritten.

## Decision

The project event log (append-only JSONL) is the authoritative source
of project state. SQLite databases are disposable materialized
projections that can be rebuilt from events at any time.

## Consequences

- Complete audit history is preserved by default
- State can be reconstructed from any point in time
- Deleting the SQLite cache never destroys project data
- Event replay cost grows with project history (mitigated by checkpoints)
- Concurrent writes are safe (actor-scoped streams)
