# 007. Deduplication by Merge, Not Deletion

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 22

## Context

Literature searches across multiple databases produce overlapping
results. Simple deletion of duplicates loses metadata that may be
more complete in one source than another.

## Decision

When duplicates are detected, the system creates a merged canonical
record. It does not discard either original record. The merged
record retains the most complete metadata from all sources.

## Consequences

- No metadata loss during deduplication
- Provenance is preserved (source databases retained)
- Merge logic is deterministic (longest non-empty value wins)
- Duplicate detection events are recorded for audit trail
