---
title: "Introducing OpenReview"
description: "Why we built a local-first systematic review tool"
pubDate: 2026-09-12
author: "OpenReview Team"
tags: ["announcement", "open-source"]
---

# Introducing OpenReview

Systematic literature reviews are foundational to evidence-based practice in medicine, policy, and science. The tools researchers use to screen thousands of papers should be reliable, transparent, and accessible.

We built OpenReview because existing tools fall short on three fronts:

## Local-First Architecture

Your review data never leaves your machine. No cloud sync, no accounts, no telemetry. The project directory is self-contained — copy it to a USB drive and your entire review travels with you.

This matters for sensitive research, institutional data policies, and simply for peace of mind.

## Event-Sourced Design

Every action is recorded as an immutable event. Import a record, screen a paper, resolve a conflict — each becomes a line in an append-only log. The current state is reconstructed by replaying events, which means:

- **Full audit trail** — see exactly who decided what and when
- **Crash recovery** — lose power mid-screening? Rebuild state from the log
- **Portable history** — move projects between machines without losing provenance

## Open Source, Local Execution

OpenReview is a single Go binary. Download it, run it, own it. No subscription, no rate limits, no vendor deciding when to sunset a feature.

The web interface is built with Astro and runs in your browser. The engine handles data integrity. Together they provide a complete screening workflow without requiring internet access after installation.

## What's Next

We're building toward multi-reviewer support with conflict detection, advanced deduplication, and export formats compatible with major systematic review software.

Try it out and let us know what you think.
