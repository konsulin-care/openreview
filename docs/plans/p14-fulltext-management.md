# Phase 14: Full-Text Management

**Objective:** Manage full-text retrieval and availability.
**Dependencies:** P13
**PRD Reference:** Section 44, Phase P14

## Scope

Includes: Full-text file association, acquisition state tracking,
unavailable identification, relevant events.
Excludes: Full-text screening, file content analysis.

## Acceptance Criteria

- Full-text files can be associated with records
- Acquisition state can be represented
- Unavailable full texts can be identified
- Relevant events are recorded

## Implementation Tasks

- [ ] Define fulltext.requested/acquired/unavailable event types
- [ ] Implement full-text file storage (papers/ directory)
- [ ] Implement file association with records
- [ ] Track acquisition state per record
- [ ] Record relevant events
- [ ] Implement GET /api/v1/paper and /api/v1/paper/:id
- [ ] Write tests for file association and state tracking

## Related ADRs

- [ADR 003](../adr/003-portable-project-directory.md) — papers/ directory
