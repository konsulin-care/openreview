# Web — Frontend Agent Guide

## Overview
Astro + TypeScript static frontend.
Reusable component system shared between application and documentation.

## Content Structure
Content lives in src/content/ as Markdown/MDX with frontmatter.
Astro content collections provide type-safe rendering.

```
src/content/
├── blog/        # Blog posts
├── docs/        # Documentation pages
├── faq/         # FAQ entries
└── components/  # Component showcase documentation
```

Pages in src/pages/ handle routing. Dynamic routes use [...slug].astro
to map content files to URLs.

## Component System
```
components/
├── ui/       — Button, Input, Select, Card, Table, Modal, etc.
├── layout/   — AppShell, Header, Sidebar, Breadcrumbs
├── review/   — ProjectCard, PaperCard, ScreeningControls, etc.
└── docs/     — Callout, CodeBlock, DocNav, TableOfContents
```

Reuse components between application pages and documentation.
/components route renders component showcase with meaningful states.

## Routing
Content routes (from content collections):
- /docs, /blog, /faq, /components

Application routes (hardcoded pages):
- /initialize (first-run setup)
- /dashboard (review overview)
- /project?id=query-param (NOT /project/:id)
- /settings

## Conventions
- import type for type-only imports
- Prefer interface over type for object shapes
- No any; use unknown and narrow
- const over let
- Files ≤ 300 lines

## Engine Communication
ReviewEngineClient abstraction wraps API calls.
Configurable endpoint: localhost, LAN, Tailscale.
Client lives in web/src/lib/.

## Testing
- Component tests alongside source
- Page tests for route rendering
