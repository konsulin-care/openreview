---
name: "CodeBlock"
description: "Syntax-highlighted code with copy button"
category: "docs"
status: "stable"
---

# CodeBlock Component

The CodeBlock component displays syntax-highlighted code with optional filename and copy button.

## Props

- `code: string` — Source code to display
- `lang?: string` — Language for syntax highlighting
- `filename?: string` — Optional filename caption

## Usage

```astro
<CodeBlock
  code={`const x = 42;`}
  lang="typescript"
  filename="example.ts"
/>
```
