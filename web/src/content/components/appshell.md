---
name: "AppShell"
description: "Main layout wrapper with header, sidebar, and content slots"
category: "layout"
status: "stable"
---

# AppShell Component

The AppShell component provides the main page layout with named slots.

## Slots

- `header` — Site header/nav
- `sidebar` — Optional sidebar
- `default` — Main content area

## Usage

```astro
<AppShell>
  <Header slot="header" />
  <slot />
</AppShell>
```
