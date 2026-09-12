# 015. Remote Access via Tailscale

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 40

## Context

Researchers may want to access their local review engine from another
device (laptop to desktop, home to office). Public exposure is not
the goal — private, authenticated remote access is.

## Decision

Tailscale Serve is the preferred mechanism for private remote access.
The architecture supports localhost, LAN, Tailscale, and future HTTPS
without frontend changes. Public exposure via Tailscale Funnel is
not enabled by default.

## Consequences

- No public attack surface by default
- Encrypted tunnel between authorized devices
- Project data stays on the engine machine
- No relay server required (peer-to-peer via Tailscale)
- Frontend uses ReviewEngineClient abstraction for endpoint flexibility
