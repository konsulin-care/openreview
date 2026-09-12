# 010. Optional Screening Reasons

**Status:** Accepted
**Date:** 2026-09-12
**PRD Reference:** Section 27

## Context

Screening reasons are valuable for audit and analysis, but requiring
them slows down the primary workflow. Reviewers should be able to
make fast decisions and add reasons later.

## Decision

Exclusion reasons are structured but optional. A reviewer may record
`exclude` without a reason. Reasons can be added or revised later.

## Consequences

- Screening speed is not obstructed by mandatory fields
- Reasons can be batch-added in a second pass
- Structured categories are configurable per project
- Free-text notes may accompany structured reasons
- Incomplete reason data is expected, not an error
