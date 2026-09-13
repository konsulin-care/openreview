---
name: "ScreeningControls"
description: "Include/exclude/uncertain decision buttons"
category: "review"
status: "planned"
---

# ScreeningControls Component

The ScreeningControls component renders three decision buttons with keyboard hints.

## Props

- `currentDecision?: 'include' | 'exclude' | 'uncertain'`
- `disabled?: boolean`

## Usage

```astro
<ScreeningControls currentDecision="include" />
<ScreeningControls disabled={true} />
```
