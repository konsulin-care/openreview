# OpenReview — Software Architecture

## System Overview

```
Browser
  │
  ▼
Local Go Review Engine          ← authoritative data/security boundary
  │
  ├── Master SQLite DB          ← machine-local registry (actors, projects, settings)
  ├── Project directories       ← portable, event-log source of truth
  │     ├── openreview.yml      ← project manifest
  │     ├── events/             ← append-only JSONL streams
  │     ├── papers/             ← full-text files
  │     └── exports/            ← screening result exports
  └── Project cache SQLite      ← disposable materialized state
```

## Component Boundaries

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| Go Engine | Go 1.27.1 | HTTP API, business logic, data integrity, security |
| Frontend | Astro 7.3 + TypeScript | UI rendering, routing, user interaction |
| Master DB | SQLite 3.53.4 | Machine-local registry, never leaves device |
| Project Dir | Files + JSONL | Portable review data, source of truth |

The Go engine is the sole authority for data mutations. The frontend
never writes directly to databases or event files.

## Data Flow

```
External search results (BibTeX/NBIB/CSV/TXT)
  │
  ▼ Ingestion
Normalized records
  │
  ▼ Deduplication (DOI → PMID → title)
Merged canonical records
  │
  ▼ Abstract screening (include/exclude/uncertain)
  │
  ▼ Full-text retrieval
  │
  ▼ Full-text screening
  │
  ▼ Conflict detection (multi-reviewer)
  │
  ▼ Manual resolution
  │
  ▼ Export
```

Each step emits events. State is reconstructed by replaying events.

## Event Architecture

Events are the authoritative project state. SQLite projections are
disposable caches rebuilt from events.

```
events/
├── ingestion/<actor-id>.jsonl
└── screening/<actor-id>.jsonl
```

Event format (one JSON object per JSONL line):
```json
{
  "event_id": "01K...",
  "schema": "1.0.0",
  "type": "screening.abstract.decision",
  "actor_id": "01K...",
  "timestamp": "2026-09-12T10:30:00Z",
  "record_id": "record-123",
  "decision": "include"
}
```

Properties:
- Append-only, immutable
- ULID for identity and temporal ordering
- One file per actor per domain (concurrent-write friendly)
- No dependency on global sequential numbering

Recapitulation:
1. Read all event streams for a domain
2. Sort by ULID (deterministic ordering)
3. Reconstruct current state
4. Cache in project SQLite (disposable)

## Database Architecture

### Master DB
Machine-local registry. Not portable. Never synchronized.

Tables: actor, project, setting.

```text
~/.local/share/openreview/openreview.sqlite
```

### Project Cache
Materialized projection from events. Disposable. Rebuildable.

```text
~/.local/share/openreview/cache/<project-id>/state.sqlite
```

Contains: normalized records, screening decisions, conflict state,
indexes. Deleting it loses nothing — rebuild from project directory.

### Why two databases?
Master DB tracks what exists (which projects, which actors).
Project cache tracks what happened (screening state, decisions).
Different lifecycles, different portability requirements.

## API Surface

Base path: `/api/v1/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /status | GET | Engine state (NEW/READY) |
| /capabilities | GET | Feature flags |
| /initialize | POST | First-run setup |
| /project | GET/POST | List/create projects |
| /project/:id | GET/PATCH/DELETE | Project CRUD |
| /ingestion | POST | Import search results |
| /paper | GET | List papers |
| /paper/:id | GET | Paper detail |
| /screening | POST | Record decisions |
| /job/:id | GET | Background job status |
| /setting | GET/PATCH | User settings |
| /export | POST | Export results |

Protected endpoints reject requests when engine state is NEW.

## Security Model

- Engine binds to 127.0.0.1 by default
- No remote access unless explicitly configured
- Pre-initialization: only /status and /initialize are available
- Frontend route guards are UX only — engine enforces authorization
- Remote access via Tailscale (opt-in), not public by default

## Portability Model

Project directory is self-contained:
```text
my-review/
├── openreview.yml    ← manifest (schema versioned)
├── events/           ← authoritative state
├── papers/           ← full-text files
└── exports/          ← screening results
```

Machine-specific data stays outside:
```text
~/.local/share/openreview/
├── openreview.sqlite ← master DB (local registry)
└── cache/            ← disposable projections
```

Copying a project directory to another machine preserves all review
data. The cache rebuilds on first open.
