---
name: "Input"
description: "Text input field with label and error state"
category: "ui"
status: "stable"
---

# Input Component

The Input component provides a styled text input with optional label and error message.

## Props

- `name: string` — Input name and id
- `type?: string` — Default: text
- `placeholder?: string`
- `label?: string` — Label text above input
- `error?: string` — Error message below input
- `disabled?: boolean`
- `value?: string`

## Usage

```astro
<Input name="email" label="Email" placeholder="you@example.com" />
<Input name="search" error="Required field" />
```
