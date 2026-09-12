# 008. Deduplication Matching Priority

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 20

## Context

Duplicate detection must be deterministic and prioritize reliable
identifiers over fuzzy matching. Different identifier types have
different reliability and availability.

## Decision

Matching priority is deterministic and sequential:
1. DOI match → duplicate
2. If no DOI: PMID match → duplicate
3. If neither: normalized title match → duplicate

## Consequences

- DOI is the most reliable identifier (checked first)
- PMID covers biomedical literature not always indexed by DOI
- Title normalization is deterministic (case, unicode, whitespace)
- A match at any level establishes duplicate, no further checks needed
