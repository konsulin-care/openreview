---
title: "Getting Started"
description: "Set up OpenReview for your first systematic review"
order: 1
---

# Getting Started with OpenReview

OpenReview is a local-first systematic literature review screening tool. All data stays on your machine — no cloud accounts, no telemetry, no vendor lock-in.

## Installation

Download the latest release for your platform and place the binary somewhere on your PATH.

```sh
# Verify installation
openreview --version
```

## First Run

Start the application:

```sh
openreview --web-ui
```

This launches the review engine and opens the web interface in your browser. On first run, OpenReview guides you through creating your first project.

## Creating a Project

1. Click **New Project** on the dashboard
2. Give your project a name and description
3. Choose a directory to store project data

Your project directory contains everything: the event log, imported papers, and screening results. Copy it to another machine and nothing is lost.

## Importing Records

OpenReview accepts common citation formats:

- **BibTeX** — exported from PubMed, Scopus, Web of Science
- **NBIB** — PubMed's native format
- **CSV** — spreadsheet exports with DOI or title columns
- **TXT** — plain text reference lists

Drag and drop files onto the import area, or use the command line:

```sh
openreview import --project my-review --file references.bib
```

## Screening Workflow

1. **Abstract screening** — read titles and abstracts, mark include/exclude/uncertain
2. **Full-text retrieval** — OpenReview fetches PDFs for included records
3. **Full-text screening** — evaluate complete papers against inclusion criteria
4. **Conflict resolution** — when multiple reviewers disagree, resolve manually
5. **Export** — download screening results as CSV or JSON
