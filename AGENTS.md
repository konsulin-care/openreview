# OpenReview — Agent Guide

## Project Summary
Local-first systematic literature review screening tool.
Go engine + Astro frontend, event-log as source of truth.

## Quick Reference
- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/api/)
- [Phase Plans](docs/plans/)
- [ADRs](docs/adr/)
- [Internal (Go)](internal/AGENTS.md)
- [Frontend (Astro)](web/AGENTS.md)

## Build & Run
mise install          # install pinned tools
mise run test         # run tests
mise run app --web-ui # start full app

## Coding Conventions
- Conventional commits: feat:, fix:, refactor:, docs:, chore:
- Subject line < 75 chars
- Files ≤ 300 lines; split into modules when exceeding
- kebab-case files, camelCase functions, PascalCase types

## Key Invariants
1. Project directory is portable
2. Event log is source of truth; SQLite is disposable cache
3. Each reviewer writes to own JSONL stream
4. Events are append-only, immutable, ULID-identified
5. Dedup merges records (DOI → PMID → title priority)
6. Screening reasons are optional
7. Scientific conflicts resolved manually
8. Core workflow works without ML or hosted backend
