---
name: "Select"
description: "Dropdown select with options and label"
category: "ui"
status: "stable"
---

# Select Component

The Select component wraps a native `<select>` with consistent styling.

## Props

- `name: string` — Select name and id
- `options: Array<{ value: string; label: string }>` — Dropdown options
- `label?: string` — Label text above select
- `value?: string` — Pre-selected value
- `disabled?: boolean`

## Usage

```astro
<Select
  name="status"
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ]}
/>
```
