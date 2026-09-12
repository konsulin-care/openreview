# Phase 12: Deduplication and Merge

**Objective:** Detect and merge duplicate records.
**Dependencies:** P11
**PRD Reference:** Section 44, Phase P12

## Scope

Includes: DOI matching, PMID matching, normalized title matching,
field completeness merge, provenance preservation.
Excludes: Screening, semantic dedup.

## Acceptance Criteria

- DOI matching works
- PMID matching works
- Normalized title matching works
- Matching priority is deterministic (DOI → PMID → title)
- Field completeness uses string length
- Missing fields have score 0
- Merged records preserve provenance
- Duplicate events are recorded

## Implementation Tasks

- [ ] Implement title normalization (uppercase, unicode, punctuation, whitespace)
- [ ] Implement DOI matching
- [ ] Implement PMID matching
- [ ] Implement normalized title matching
- [ ] Implement deterministic merge (longest non-empty value)
- [ ] Track merge provenance (alternative values retained)
- [ ] Record record.duplicate.detected and record.merged events
- [ ] Write tests for each matching strategy and merge logic

## Related ADRs

- [ADR 007](../adr/007-dedup-by-merge-not-deletion.md) — Merge, not delete
- [ADR 008](../adr/008-dedup-matching-priority.md) — DOI → PMID → title
- [ADR 009](../adr/009-metadata-merge-by-completeness.md) — Completeness merge
