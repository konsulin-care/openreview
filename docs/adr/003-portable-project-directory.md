# 003. Portable Project Directory

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 2.2

## Context

Researchers collaborate across institutions and devices. A review
project should be movable between machines without data loss or
manual migration steps. Cloud sync services (Dropbox, OneDrive)
should work without special configuration.

## Decision

A project is portable by copying its project directory. The directory
contains all authoritative review data. No machine-specific paths
appear inside project files.

## Consequences

- Moving a project to another machine preserves all data
- Cloud sync works out of the box (no SQLite sync issues)
- Machine-specific cache lives outside the project directory
- Project IDs and paths in manifests use relative or abstract references
