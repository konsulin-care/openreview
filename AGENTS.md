# OpenReview — Agent Guide

## Project Summary
Local-first systematic literature review screening tool.
Go engine + Astro frontend, event-log as source of truth.

## Quick Reference
- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/api/)
- [API Contract Tests](docs/api/AGENTS.md)
- [Phase Plans](docs/plans/)
- [ADRs](docs/adr/)
- [Internal (Go)](internal/AGENTS.md)
- [Frontend (Astro)](web/AGENTS.md)
- [Directory Structure](docs/STRUCTURE.md)

## Build & Run
mise install          # install pinned tools
mise run build        # build Go binary + Astro frontend
mise run dev          # run Go + Astro dev servers concurrently
mise run test         # run tests

## Testing

### Test Categories
| Category | Location | When to write |
|----------|----------|---------------|
| Unit (pure logic) | Co-located: `*_test.go` / `*.test.ts` next to source | Every new exported function or utility |
| Build verification | Co-located `*.test.ts` reading `dist/` | UI components where compiled HTML is the contract |
| Integration | `tests/integration/` | Cross-package or engine + frontend |
| Contract | `docs/api/` (Bruno collection) | Every API endpoint |
| Build scripts | `tests/*.sh` | CI verification only, not logic tests |

### Shared Test Assets
- Go: `internal/testutil/`, per-package `testdata/`
- TS: `web/src/test/` (helpers, fixtures, mocks)
- Cross-system: `tests/fixtures/`

### Agent Rules
- Write unit tests for every new exported function or utility.
- Write build verification tests for UI components only when the compiled HTML output is the contract.
- Mock external I/O in unit tests; use real I/O in integration tests.
- Do NOT write tests for: scripts, build config, content files, pages.
- Do NOT duplicate boilerplate — use shared helpers from `web/src/test/`.

### Commands
`mise run test` (runs Go + Astro tests)
Go only: `go test -race -count=1 ./...`
Astro only: `pnpm --dir web test`

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
