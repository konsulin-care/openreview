---
name: "TableOfContents"
description: "Auto-generated table of contents from headings"
category: "docs"
status: "stable"
---

# TableOfContents Component

The TableOfContents component renders a navigation list from heading data.

## Props

- `headings: Array<{ depth: number; text: string; slug: string }>`

## Usage

```astro
<TableOfContents headings={[
  { depth: 2, text: "Installation", slug: "installation" },
  { depth: 3, text: "Requirements", slug: "requirements" },
  { depth: 2, text: "Usage", slug: "usage" },
]} />
```
