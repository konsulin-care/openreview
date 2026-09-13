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

### Patterns
- **Unit tests** (`*-utils.test.ts`): Import pure functions directly. No build step needed. Fast. This is the default.
- **Build verification** (`*.test.ts` reading `dist/`): Assert on compiled HTML output. Requires `astro build` first. Use only when the component's rendered HTML is the contract.

### Shared Helpers
`web/src/test/` provides dist-reading utilities to avoid boilerplate:
- `readDist(file)` — reads a file from `dist/`
- `readIndexHtml()` — reads `dist/index.html`
- `readComponentsHtml()` — reads `dist/components/index.html`

### Coverage
- Every `*-utils.ts` must have a co-located `*-utils.test.ts`.
- `.astro` components: build verification test if the component is part of the public showcase or its HTML output is an API contract. Pure layout components (BaseLayout) do not need tests.
- Pages: no tests (routing is verified via build verification of the showcase page).

### Command
`pnpm test` (vitest, happy-dom, globals enabled)
