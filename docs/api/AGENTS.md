# API Contract Tests — Agent Guide

## Overview
Bruno-based API contract tests in OpenCollection YAML format.
Single linear chain, one entry point, sequential execution.

## Chain Mechanism
Chain order is determined by `after-response` scripts calling `bru.runner.setNextRequest()`.
Do NOT use `seq` for ordering — it determines folder discovery order but does not control chain flow.

## Chain Order
1. `GET.health` → 2. `GET.status` → 3. `GET.preflight` → 4. `POST.initialize` → 5. `GET.config` → 6. `GET.actor` → 7. `PUT.actor` → 8. `POST.project` → 9. `GET.projects` → 10. `GET.project.id` → 11. `DELETE.project` (terminal)

## folder.yml Structure
All folder.yml files MUST use the `info:` wrapper to match the OpenCollection spec. Bru skips folders without it.

```yaml
info:
  name: folder-name
  type: folder
  seq: 1  # determines discovery order; lowest seq = first folder
```

Do NOT use flat structure (`name:` at root) or `requests:` lists — these are not valid OpenCollection fields and cause bru to skip the folder.

## Script Types
| Type | Purpose |
|------|---------|
| `before-request` | Runs before the request is sent |
| `after-response` | Runs after the response is received; use for `bru.runner.setNextRequest()` |
| `tests` | Chai assertion library |

Do NOT use `postrequest` — it is obsolete.

## Adding a New Request
1. Create the YAML file in the appropriate subdirectory
2. Add `type: after-response` script with `bru.runner.setNextRequest("next-request-name")`
3. Update the previous request's `after-response` to chain to your new request
4. If terminal (last in chain), use `bru.runner.setNextRequest(null)` to explicitly stop the chain. Do NOT omit it — omitting causes bru to fall back to seq-based ordering and loop.

## Running
`mise run test --api` — starts test server, runs full chain sequentially.
