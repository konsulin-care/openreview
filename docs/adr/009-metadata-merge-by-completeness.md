# 009. Metadata Merge by Completeness

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 22, 23

## Context

When merging duplicate records, the system must select which value
to use for each field. The selection must be deterministic and
favor more complete information.

## Decision

For each field, the value with the greatest character length wins.
Missing values have length 0 and never displace non-empty values.
Equal-length conflicts use deterministic tie-breaking with
provenance tracking.

## Consequences

- More complete metadata always wins
- Missing fields never overwrite present fields
- Merge is deterministic (same inputs → same output)
- Tie-breaking rules must be documented per field type
- Alternative values retained in provenance for transparency
