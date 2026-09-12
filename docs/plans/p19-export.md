# Phase 19: Export

**Objective:** Export screening decisions.
**Dependencies:** P17
**PRD Reference:** Section 44, Phase P19

## Scope

Includes: Canonical metadata export, abstract/full-text decisions,
exclusion reasons, reviewer info, provenance, conflict status.
Excludes: Data extraction, meta-analysis formats.

## Acceptance Criteria

- Canonical bibliographic metadata is exported
- Abstract decision is exported
- Full-text decision is exported
- Exclusion reason is included when available
- Reviewer/provenance information is included
- Export is reproducible from the project state

## Implementation Tasks

- [ ] Define export format schema
- [ ] Implement export generation from project cache
- [ ] Add POST /api/v1/export endpoint
- [ ] Include all required fields (metadata, decisions, reasons, provenance)
- [ ] Write to exports/ directory in project
- [ ] Write tests for export completeness and reproducibility

## Related ADRs

- [ADR 003](../adr/003-portable-project-directory.md) — exports/ directory
