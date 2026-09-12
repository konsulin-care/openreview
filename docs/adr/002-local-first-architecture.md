# 002. Local-First Architecture

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 2.1

## Context

Researchers handle sensitive academic work. Hosted backends introduce
dependency on external services, latency, privacy concerns, and
availability risks. Literature screening is a focused task that
does not require cloud infrastructure.

## Decision

The application operates entirely on the researcher's machine. No
hosted backend is required for normal operation. The Go engine and
Astro frontend run locally.

## Consequences

- No internet connectivity required after installation
- No data leaves the machine unless explicitly configured
- No hosting costs or service dependencies
- Collaboration requires file synchronization (e.g., Tailscale, shared drive)
- User manages their own backups
