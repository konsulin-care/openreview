# 016. Semantic ML Is Optional

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 42

## Context

Semantic search and embedding-based features could improve screening
efficiency, but they introduce model dependencies, download
requirements, and computational overhead that conflict with the
local-first, lightweight core workflow.

## Decision

The core application does not require machine learning. Semantic
search and embeddings are optional future functionality. If
introduced, models are downloaded lazily and cached machine-locally.

## Consequences

- Core workflow works without ML dependencies
- No model downloads required for basic use
- ML features can be added incrementally
- Models use shared machine-local cache (not per-project)
- ONNX Runtime integration is optional, not foundational
