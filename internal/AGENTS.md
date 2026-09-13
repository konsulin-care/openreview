# Internal — Go Engine Agent Guide

## Overview
The Go Review Engine is the authoritative data and security boundary.
It owns the HTTP API, event storage, database, and all business logic.

## Package Map
| Package      | Purpose |
|--------------|---------|
| api/         | HTTP handlers, request/response types, routing |
| app/         | Application lifecycle, initialization state machine |
| config/      | Configuration loading, defaults, CLI flags |
| database/    | SQLite connections, master DB, project cache |
| events/      | JSONL read/write, ULID generation, event types |
| filesystem/  | Project directory operations, file I/O |
| ingestion/   | BibTeX/NBIB/CSV/TXT parsing, normalization |
| jobs/        | Background job manager for long-running tasks |
| projects/    | Project registry, manifest validation |
| screening/   | Decision recording, conflict detection |
| export/      | Result export in multiple formats |

## Conventions
- Table-driven tests preferred
- Errors wrap with context (`fmt.Errorf("x: %w", err)`)
- Use ULIDs for all identifiers (events, actors, projects)
- No global state; pass dependencies explicitly
- Database code owns its own migrations

## Event Architecture
- Append-only JSONL, one file per actor per domain
- Format: events/\<domain\>/\<actor-id\>.jsonl
- Events: {event_id, schema, type, actor_id, timestamp, ...data}
- Recapitulation reconstructs state from events
- Project cache is disposable; rebuildable from project dir

## Database
- Master DB: machine-local registry (actors, projects, settings)
  - Location: ~/.local/share/openreview/openreview.sqlite
  - Migrations: database/migrations/master/
- Project cache: materialized from events, disposable
  - Location: ~/.local/share/openreview/cache/\<project-id\>/state.sqlite

## API Patterns
- Base: /api/v1/
- Protected endpoints reject pre-initialization requests
- Engine binds to 127.0.0.1 by default
- Bruno tests in docs/api/ must pass for each endpoint

## Testing
- Unit tests: `*_test.go` alongside source, table-driven preferred.
- Integration tests: `tests/integration/` for cross-package scenarios.
- Helpers: `internal/testutil/`, per-package `testdata/`.
- Contract tests: Bruno collection in `docs/api/`.
- Command: `go test -race -count=1 ./...`
