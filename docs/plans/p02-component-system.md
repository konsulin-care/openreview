# Phase 2: Component System

**Objective:** Build reusable application/documentation components.
**Dependencies:** P1
**PRD Reference:** Section 44, Phase P2

## Scope

Includes: UI primitives, layout components, review components, docs
components. Showcase at `/components`.
Excludes: Application logic, engine integration.

## Acceptance Criteria

- Common UI primitives exist
- `/components` demonstrates meaningful states
- Components are reused by application pages

## Implementation Tasks

- [ ] Create ui/ components (Button, Input, Select, Card, Table, etc.)
- [ ] Create layout/ components (AppShell, Header, Sidebar, Breadcrumbs)
- [ ] Create review/ components (ProjectCard, PaperCard, ScreeningControls)
- [ ] Create docs/ components (Callout, CodeBlock, DocNav, TableOfContents)
- [ ] Build component showcase page at `/components`
- [ ] Verify components render in both app and docs contexts

## Related ADRs

- [ADR 004](../adr/004-go-engine-astro-frontend.md) — Component reuse model
