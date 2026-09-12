# 013. Disposable Project Cache

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 12, 33

## Context

Event replay for large projects can be slow. A materialized SQLite
projection improves read performance. But this cache introduces
a second database that could conflict with the portable project
directory model.

## Decision

Project-level SQLite is a disposable cache stored in machine-local
storage. It is never part of the project directory. It can be
deleted and rebuilt from events at any time.

## Consequences

- Read performance is fast (SQLite indexed queries)
- Cache is never synchronized between machines
- Deleting cache loses no project data
- Rebuild time grows with event count (acceptable for V1)
- Machine-local storage avoids sync conflicts (Dropbox, etc.)
