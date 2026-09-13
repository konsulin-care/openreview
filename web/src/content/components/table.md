---
name: "Table"
description: "Data table with compound sub-components"
category: "ui"
status: "stable"
---

# Table Component

The Table component provides a compound component pattern for data tables.

## Sub-components

- `Table` — Root `<table>` wrapper
- `TableHead` — `<thead>` wrapper
- `TableBody` — `<tbody>` wrapper
- `TableRow` — `<tr>` with border styling
- `TableHeader` — `<th>` with header styling
- `TableCell` — `<td>` with padding

## Usage

```astro
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Status</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Project A</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```
