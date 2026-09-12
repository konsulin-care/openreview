# Implementation Plans

Phase plans derived from the PRD (Section 44). Each plan captures
objective, scope, acceptance criteria, and implementation tasks
for one phase.

## Naming

`pNN-title-slug.md` — two-digit phase number, kebab-case title.

## Template

```markdown
# Phase NN: Title

**Objective:** From PRD
**Dependencies:** Previous phases required
**PRD Reference:** Section 44, Phase NN

## Scope
What is included and excluded.

## Acceptance Criteria
- Criterion from PRD

## Implementation Tasks
- [ ] Task description

## Related ADRs
- [ADR NNN](../adr/NNN-title-slug.md)
```

## Phases

| Phase | Title | File |
|-------|-------|------|
| P0 | Repository and dev environment | [p00](p00-repo-and-dev-env.md) |
| P1 | Astro application | [p01](p01-astro-application.md) |
| P2 | Component system | [p02](p02-component-system.md) |
| P3 | Application shell | [p03](p03-application-shell.md) |
| P4 | Go engine | [p04](p04-go-engine.md) |
| P5 | Frontend/engine client | [p05](p05-frontend-engine-client.md) |
| P6 | Initialization and actor identity | [p06](p06-initialization-and-actor.md) |
| P7 | Master database | [p07](p07-master-database.md) |
| P8 | Project manifest | [p08](p08-project-manifest.md) |
| P9 | Project registration/opening | [p09](p09-project-registration.md) |
| P10 | Event infrastructure | [p10](p10-event-infrastructure.md) |
| P11 | Ingestion | [p11](p11-ingestion.md) |
| P12 | Deduplication and merge | [p12](p12-deduplication-merge.md) |
| P13 | Abstract screening | [p13](p13-abstract-screening.md) |
| P14 | Full-text management | [p14](p14-fulltext-management.md) |
| P15 | Full-text screening | [p15](p15-fulltext-screening.md) |
| P16 | Multi-reviewer conflicts | [p16](p16-multi-reviewer-conflicts.md) |
| P17 | Materialized project state | [p17](p17-materialized-project-state.md) |
| P18 | Dashboard | [p18](p18-dashboard.md) |
| P19 | Export | [p19](p19-export.md) |
| P20 | Local packaged application | [p20](p20-local-packaged-app.md) |
| P21 | GitHub Pages | [p21](p21-github-pages.md) |
| P22 | Self-configuration | [p22](p22-self-configuration.md) |
| P23 | Tailscale | [p23](p23-tailscale.md) |
| P24 | Performance benchmarks | [p24](p24-performance-benchmarks.md) |
