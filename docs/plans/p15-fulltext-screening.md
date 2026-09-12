# Phase 15: Full-Text Screening

**Objective:** Implement eligibility screening of retrieved full texts.
**Dependencies:** P13, P14
**PRD Reference:** Section 44, Phase P15

## Scope

Includes: Include/exclude/uncertain decisions for full text, optional
structured exclusion reasons, auditable decisions, revision.
Excludes: Multi-reviewer conflicts.

## Acceptance Criteria

- Include/exclude/uncertain decisions can be recorded
- Optional structured exclusion reason is supported
- Decisions are auditable
- Decisions can be revised

## Implementation Tasks

- [ ] Define screening.fulltext.decision event schema
- [ ] Implement full-text decision recording
- [ ] Support structured exclusion categories (configurable per project)
- [ ] Allow decision revision
- [ ] Integrate with abstract screening state
- [ ] Write tests for full-text decision recording

## Related ADRs

- [ADR 010](../adr/010-optional-screening-reasons.md) — Optional reasons
