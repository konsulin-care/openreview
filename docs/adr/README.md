# Architectural Decision Records (ADRs)

ADRs capture significant architectural decisions with context and
consequences. They are derived from the PRD and evolve with the project.

## Naming

`NNN-title-slug.md` — sequential number, kebab-case title.

## Status

Each ADR has a status: Proposed, Accepted, Superseded, Deprecated.

## Template

```markdown
# NNN. Title

**Status:** Accepted
**Date:** YYYY-MM-DD
**PRD Reference:** Section N.N

## Context

Why this decision exists. What problem does it solve?

## Decision

What was decided. Be specific and actionable.

## Consequences

What follows from this decision. Include trade-offs.
```

## Index

| ADR | Decision |
|-----|----------|
| [001](001-event-log-source-of-truth.md) | Event log as source of truth |
| [002](002-local-first-architecture.md) | No hosted backend required |
| [003](003-portable-project-directory.md) | Project portable by directory copy |
| [004](004-go-engine-astro-frontend.md) | Go engine + Astro frontend |
| [005](005-actor-scoped-jsonl-streams.md) | One JSONL per actor per domain |
| [006](006-ulid-for-event-identity.md) | ULID for all identifiers |
| [007](007-dedup-by-merge-not-deletion.md) | Merge duplicates, never discard |
| [008](008-dedup-matching-priority.md) | DOI → PMID → normalized title |
| [009](009-metadata-merge-by-completeness.md) | Longest non-empty value wins |
| [010](010-optional-screening-reasons.md) | Exclusion reasons optional |
| [011](011-manual-conflict-resolution.md) | No automatic conflict resolution |
| [012](012-query-param-project-selection.md) | ?id= for project selection |
| [013](013-disposable-project-cache.md) | Project SQLite is disposable cache |
| [014](014-external-search-boundary.md) | Search external, ingestion only |
| [015](015-remote-access-via-tailscale.md) | Tailscale for remote access |
| [016](016-ml-is-optional.md) | Semantic ML never required |
