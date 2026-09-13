---
name: "Breadcrumbs"
description: "Navigation breadcrumb trail"
category: "layout"
status: "stable"
---

# Breadcrumbs Component

The Breadcrumbs component renders a navigation breadcrumb trail.

## Props

- `items: Array<{ label: string; href?: string }>` — Last item has no href (current page)

## Usage

```astro
<Breadcrumbs items={[
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "Getting Started" },
]} />
```
