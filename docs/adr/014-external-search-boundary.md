# 014. External Search Boundary

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 3.2, 19

## Context

Systematic reviews begin with literature searches in external
databases (PubMed, Embase, Cochrane, etc.). Building search
functionality into the tool would duplicate existing specialized
services.

## Decision

OpenReview does not perform literature searches. It accepts
exported search results from external databases via file import.
Search provenance (source database, filename) is preserved.

## Consequences

- Clear product boundary: screening tool, not search tool
- Researchers continue using their preferred search databases
- Import supports BibTeX, NBIB, CSV, TXT formats
- Search metadata (query, date, database) preserved where available
- Future versions may add search integration without breaking changes
