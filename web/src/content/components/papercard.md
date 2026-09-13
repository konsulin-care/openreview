---
name: "PaperCard"
description: "Paper entry with abstract and screening state"
category: "review"
status: "planned"
---

# PaperCard Component

The PaperCard component displays a paper entry with title, abstract, and screening state.

## Props

- `title: string`
- `authors?: string`
- `abstract?: string` — Truncated to 3 lines
- `screeningState?: 'unscreened' | 'included' | 'excluded' | 'uncertain'`
- `doi?: string`

## Usage

```astro
<PaperCard
  title="Effects of X on Y"
  authors="Smith et al."
  abstract="This paper examines..."
  screeningState="included"
  doi="10.1234/example"
/>
```
