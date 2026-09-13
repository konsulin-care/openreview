---
name: "Modal"
description: "Dialog overlay with trigger and close button"
category: "ui"
status: "stable"
---

# Modal Component

The Modal component uses the native `<dialog>` element for accessible overlays.

## Props

- `id: string` — Dialog element id
- `title?: string` — Heading text

## Usage

```astro
<Modal id="confirm" title="Confirm Action">
  <p>Are you sure?</p>
</Modal>
```
