# 004. Go Engine + Astro Frontend

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Sections 6, 9

## Context

The system needs a backend for data integrity, business logic, and
security, plus a frontend for user interaction. The frontend serves
both the application and documentation site.

## Decision

- Go for the Review Engine (backend): performance, single binary,
  strong standard library, local-first simplicity
- Astro for the frontend: static generation, TypeScript, content
  collections for docs/blog/FAQ, component reuse

React may be introduced later for complex interactive components
but is not the foundational framework.

## Consequences

- Single Go binary for the engine, easy distribution
- Astro builds static assets that can be served by the Go engine
- Content (docs, blog, FAQ) uses Markdown/MDX via Astro collections
- Component system shared between application and documentation
- Clear separation: Go owns data, Astro owns presentation
