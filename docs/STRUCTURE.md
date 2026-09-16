# OpenReview — Directory Structure

## Finalized Structure (based on PROPOSAL.md)

The repository follows the structure proposed in PROPOSAL.md, with the following layout:

```
openreview/
├── cmd/
│   └── openreview/
│       └── main.go           ← Entry point; imports internal packages
│
├── internal/                 ← ALL Go implementation packages
│   ├── api/                  ← HTTP handlers and routing
│   │   ├── actor.go
│   │   ├── status.go
│   │   ├── health.go
│   │   ├── initialize.go
│   │   ├── server.go
│   │   ├── project.go
│   │   ├── status.go
│   │   ├── preflight.go
│   │   ├── cors.go
│   │   ├── guard.go
│   │   └── *.go + *_test.go
│   ├── app/                  ← Application lifecycle and engine state
│   │   ├── app.go
│   │   └── app_test.go
│   ├── config/               ← Configuration loading and defaults
│   │   ├── config.go
│   │   └── config_test.go
│   ├── database/             ← SQLite master database
│   │   ├── master.go
│   │   └── project_cache.go
│   ├── events/               ← Event log handling
│   ├── filesystem/           ← File system operations
│   ├── ingestion/            ← Import external search results
│   ├── jobs/                 ← Job queue management
│   ├── projects/             ← Project registry operations
│   ├── screening/            ← Screening logic
│   ├── export/               ← Export screening results
│   ├── testutil/             ← Test utilities and helpers
│   └── ulid/                 ← ULID generation
│
├── web/                      ← Astro frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── review/
│   │   │   └── docs/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── astro.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── bruno/                    ← Bruno API documentation and test collection
│   ├── opencollection.yml
│   ├── environments/
│   │   └── local.yml
│   ├── status/
│   ├── initialization/
│   ├── project/
│   ├── paper/
│   ├── screening/
│   ├── ingestion/
│   ├── job/
│   └── setting/
│
├── docs/                     ← Project documentation (PRD, ADRs, etc.)
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md        ← This file
│   ├── api/                ← Bruno YAML API contracts
│   │   ├── actor/
│   │   │   ├── GET.actor.yml
│   │   │   └── PUT.actor.yml
│   │   ├── health/
│   │   │   └── GET.health.yml
│   │   ├── status/
│   │   │   └── GET.status.yml
│   │   ├── preflight/
│   │   │   └── GET.preflight.yml
│   │   ├── initialization/
│   │   │   └── POST.initialize.yml
│   │   ├── actor/          ← (duplicate; see bruno/ vs docs/api/)
│   │   ├── project/
│   │   │   ├── POST.project.yml
│   │   │   └── folder.yml
│   │   └── ...
│   ├── plans/                ← Phase plans (P0-P24)
│   ├── adr/                  ← Architecture Decision Records
│   └── ...
│
├── migrations/               ← Database migrations (if needed)
│   └── master/
│
├── tests/                    ← Integration and other tests
│   ├── integration/
│   └── fixtures/
│
├── scripts/                  ← Build and test scripts
│   ├── bruno.sh
│   ├── build.sh
│   └── test.sh
│
├── mise.toml                 ← Tool version pinning
├── go.mod                    ← Go module definition
├── README.md
└── LICENSE
```

## Key Conventions

1. **`internal/` holds all Go implementation packages**
   - `api/` — HTTP handlers and routing (the public Go API surface, but internal to the module)
   - `app/` — Application lifecycle and engine state management
   - `config/` — Configuration parsing and CLI flags
   - Other packages: `database`, `ulid`, `manifest`, `testutil`, etc.

2. **Go import paths**
   - Root-level packages: `github.com/openreview/openreview/api` — NO LONGER USED
   - Internal packages: `github.com/openreview/openreview/internal/api`
   - Same pattern for `app`, `config`, `database`, etc.

3. **Frontend**: Astro + TypeScript in `web/`
   - Components, pages, layouts, types, styles
   - Static resources in `public/`

4. **API contracts**: Bruno YAML files in `docs/api/` and `bruno/`
   - Every implemented endpoint has a corresponding Bruno request/test
   - Collection executable in CI

5. **Project directory**: Portable by copying
   - Contains `openreview.yml`, `events/`, `papers/`, `exports/`
   - No project SQLite database

6. **Event log**: Authoritative project state
   - Append-only JSONL files in `events/`
   - ULID-identified events
   - One JSONL stream per actor per domain

7. **Bruno API collection**: `bruno/` at root level
   - `opencollection.yml` — collection metadata
   - `environments/` — environment configurations
   - Per-domain folders: `status/`, `initialization/`, `project/`, etc.

## Package Import Guidelines

| Package | Import Path | Usage |
|---------|------------|-------|
| `api` | `github.com/openreview/openreview/internal/api` | HTTP handlers, routing, NewServer() |
| `app` | `github.com/openreview/openreview/internal/app` | App lifecycle, NewApp(), State |
| `config` | `github.com/openreview/openreview/internal/config` | ParseFlags(), Config, CORS |
| `database` | `github.com/openreview/openreview/internal/database` | MasterDB, RegisterProject, ListProjects |
| `ulid` | `github.com/openreview/openreview/internal/ulid` | ULID generation |
| `manifest` | `github.com/openreview/openreview/internal/manifest` | Parse, Validate, Write openreview.yml |

## Deviations from PROPOSAL.md

The following deviations from the original PROPOSAL.md have been made during implementation:

1. **Bruno files**: Originally proposed at `bruno/` at root level, implemented in `docs/api/` (this location was agreed upon for better integration with the Astro docs structure and Bruno CLI workflow)

2. **`migrations/` directory**: Not created — the project uses a simplified database approach without dedicated migration files. Master DB schema changes are managed separately.

3. **Project cache**: The `cache/<project-id>/` structure from the PRD is conceptual; actual machine-specific caching is handled outside the repository root.

4. **`bruno.json`**: Root-level workspace config file (kept at root per existing convention).