---
name: "Callout"
description: "Admonition box for notes, warnings, tips, and dangers"
category: "docs"
status: "stable"
---

# Callout Component

The Callout component displays admonition boxes with left border and background tint.

## Props

- `type: 'info' | 'warning' | 'tip' | 'danger'`

## Usage

```astro
<Callout type="info">
  This is an informational note.
</Callout>

<Callout type="warning">
  Be careful with this operation.
</Callout>
```
