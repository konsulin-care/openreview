# 006. ULID for Event Identity

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 8, 17

## Context

Events need globally unique identifiers that are sortable by time.
Sequential integers require coordination between independent
reviewers. UUIDs provide uniqueness but no temporal ordering.

## Decision

Use ULIDs (Universally Unique Lexicographically Sortable Identifiers)
for all identifiers: events, actors, projects.

## Consequences

- Globally unique without coordination
- Lexicographic sort equals chronological sort
- No sequential counter to synchronize
- Compact string representation
- Built-in timestamp component for debugging
