---
question: "Does my data leave my machine?"
category: "data-safety"
order: 1
---

No. OpenReview is a local-first application. All data — your project files, screening decisions, imported papers, and event history — stays on your local filesystem.

The Go engine binds to `127.0.0.1` by default and is not accessible from other machines unless you explicitly configure remote access (for example, via Tailscale).

There is no telemetry, no analytics, and no cloud sync. Your review data is yours.
