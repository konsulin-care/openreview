# Phase 8: Project Manifest

**Objective:** Implement standardized openreview.yml.
**Dependencies:** P0
**PRD Reference:** Section 44, Phase P8

## Scope

Includes: Manifest schema, YAML parsing, validation, project
creation, schema versioning.
Excludes: Event storage, screening.

## Acceptance Criteria

- Project can be created with valid manifest
- Schema is validated
- Project ID is stable
- Manifest survives moving the project directory

## Implementation Tasks

- [ ] Define openreview.yml schema (YAML structure)
- [ ] Implement manifest parser and validator
- [ ] Create project creation endpoint (POST /api/v1/project)
- [ ] Generate stable project ID (ULID)
- [ ] Write manifest to project directory on creation
- [ ] Validate schema version on project open
- [ ] Add schema migration support for future versions
- [ ] Write tests for manifest validation and portability

## Related ADRs

- [ADR 006](../adr/006-ulid-for-event-identity.md) — Project ID
- [ADR 003](../adr/003-portable-project-directory.md) — Portability
