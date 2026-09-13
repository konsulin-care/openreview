---
name: "ProjectCard"
description: "Project summary card with status and paper count"
category: "review"
status: "planned"
---

# ProjectCard Component

The ProjectCard component displays project summary information.

## Props

- `name: string` — Project name
- `description?: string`
- `paperCount?: number`
- `status?: 'active' | 'completed' | 'archived'`
- `lastModified?: string`

## Usage

```astro
<ProjectCard
  name="My Review"
  description="Systematic review of X"
  paperCount={150}
  status="active"
/>
```
