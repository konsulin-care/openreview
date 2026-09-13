---
name: "Card"
description: "Container for grouping content with border and shadow"
category: "ui"
status: "stable"
---

# Card Component

The Card component provides a consistent container for grouping related content.

## Props

- `variant?: 'default' | 'interactive'` — Interactive adds hover effects
- `padding?: 'sm' | 'md' | 'lg'` — Default: md

## Usage

```astro
<Card variant="interactive" padding="lg">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```
