---
name: "Button"
description: "Primary action trigger with multiple variants"
category: "ui"
status: "stable"
---

# Button Component

The Button component triggers user actions. It supports primary, secondary, and ghost variants with sm, md, and lg sizes.

## Props

- `variant: 'primary' | 'secondary' | 'ghost'` — Visual style
- `size?: 'sm' | 'md' | 'lg'` — Default: md
- `disabled?: boolean` — Disables interaction
- `loading?: boolean` — Shows spinner, disables interaction
- `href?: string` — Renders as `<a>` instead of `<button>`

## Usage

```astro
<Button variant="primary" size="md">Submit</Button>
<Button variant="secondary" href="/docs">Go to Docs</Button>
<Button variant="ghost" loading={true}>Loading...</Button>
```
