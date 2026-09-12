# Phase 11: Ingestion

**Objective:** Import external search results.
**Dependencies:** P10
**PRD Reference:** Section 44, Phase P11

## Scope

Includes: BibTeX, NBIB, CSV, TXT parsing. Normalization into
common record model. Provenance preservation.
Excludes: Deduplication, screening.

## Acceptance Criteria

- `.bib` works
- `.nbib` works
- `.txt` works where supported
- `.csv` works
- Records are normalized into a common model
- Import provenance is preserved

## Implementation Tasks

- [ ] Define common bibliographic record model
- [ ] Implement BibTeX parser
- [ ] Implement NBIB parser
- [ ] Implement CSV parser
- [ ] Implement TXT parser (where supported)
- [ ] Normalize records into common model
- [ ] Preserve import provenance (source DB, filename, timestamp)
- [ ] Record record.imported events
- [ ] Implement POST /api/v1/ingestion endpoint
- [ ] Write parser tests for each format

## Related ADRs

- [ADR 014](../adr/014-external-search-boundary.md) — Search boundary
