---
name: "Button"
description: "Primary action trigger with multiple variants"
category: "ui"
status: "planned"
---

# Button Component

The Button component triggers user actions. It is the most common interactive element in the interface.

## Variants

- **Primary** — main call-to-action (e.g., "Submit Screening Decision")
- **Secondary** — supplementary actions (e.g., "Cancel", "Back")
- **Ghost** — minimal emphasis, used in toolbars and inline actions

## States

- Default
- Hover
- Active/Pressed
- Disabled
- Loading (for async actions)

## Usage Guidelines

- Use primary for the most important action on the screen
- Limit to one primary button per view to maintain visual hierarchy
- Use descriptive labels: "Export Results" not "Click Here"
- Disable instead of hiding when an action is temporarily unavailable
- Show loading state for operations taking more than 300ms
