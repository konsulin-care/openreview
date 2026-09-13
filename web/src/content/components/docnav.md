---
name: "DocNav"
description: "Previous/next navigation between doc pages"
category: "docs"
status: "stable"
---

# DocNav Component

The DocNav component renders previous/next navigation links.

## Props

- `prev?: { title: string; href: string }` — Previous page
- `next?: { title: string; href: string }` — Next page

## Usage

```astro
<DocNav
  prev={{ title: "Installation", href: "/docs/install" }}
  next={{ title: "Configuration", href: "/docs/config" }}
/>
```
