# OpenReview — Product Requirements Document

**Status:** Finalized baseline PRD
**Project:** `openreview`
**License:** Open source
**Architecture:** Local-first, single repository, static web frontend + local Go engine
**Primary workflow:** Literature-result ingestion → deduplication/merge → abstract screening → full-text screening → export

---

# 1. Product overview

`openreview` is an open-source, local-first web application for managing the screening stage of systematic literature reviews.

The application deliberately **does not perform literature searches**. Researchers continue to use external literature databases and search engines such as PubMed, Embase, Cochrane, Google Scholar, and other services. They export their search results and import those files into `openreview`.

The application manages the workflow from imported search results through:

1. ingestion;
2. normalization;
3. duplicate detection and metadata merging;
4. title/abstract screening;
5. full-text screening;
6. disagreement identification;
7. manual conflict resolution;
8. audit history;
9. decision dashboards;
10. export of screening decisions and review data.

The authoritative project state is an **append-only event log** stored in the project directory.

A local SQLite database is used only as a **materialized projection/cache** for performance. It is not the source of truth and is never required to be synchronized between users.

---

# 2. Product principles

## 2.1 Local-first

The application must operate entirely on the researcher's machine.

No hosted backend is required for normal operation.

The default architecture is:

```text
Browser
   │
   ▼
Local Go Review Engine
   │
   ├── Master SQLite database
   ├── Project event logs
   ├── Project files
   └── Local materialized state/cache
```

---

## 2.2 Portable projects

A project must be portable by copying its project directory.

The project directory contains the authoritative review data and must not depend on machine-specific paths.

---

## 2.3 Event log as source of truth

Project state is represented by immutable events.

```text
events/
   ↓
recapitulation
   ↓
project state
```

SQLite is only a local materialization of that state.

Deleting the local SQLite projection must never destroy project data.

---

## 2.4 Cloud-sync friendly

Project directories should be suitable for synchronization using ordinary file synchronization services.

The architecture must not depend on synchronizing a SQLite database between users.

Each reviewer writes only to their own append-only JSONL files, minimizing concurrent-write conflicts.

---

## 2.5 Reproducibility

The system must preserve:

* imported source provenance;
* reviewer identity;
* screening decisions;
* changes to decisions;
* exclusion reasons when provided;
* conflict history;
* project configuration;
* protocol information;
* timestamps;
* event IDs.

---

## 2.6 Reviewers are allowed to work quickly

The UI must not unnecessarily obstruct screening.

For example, an exclusion reason is useful but **optional**.

A reviewer can immediately record:

```text
exclude
```

and add the reason later.

---

# 3. Explicit product boundary

## 3.1 Included

The initial product covers:

```text
External literature search
        ↓
File import
        ↓
Record normalization
        ↓
Deduplication and metadata merge
        ↓
Title/abstract screening
        ↓
Full-text management
        ↓
Full-text screening
        ↓
Conflict identification/resolution
        ↓
Decision dashboard
        ↓
Export
```

---

## 3.2 Excluded

The initial product does **not** perform:

* PubMed searches;
* Embase searches;
* Cochrane searches;
* Google Scholar searches;
* general web searches;
* search strategy execution;
* search-result ranking;
* automatic literature discovery;
* data extraction from included studies;
* risk-of-bias appraisal;
* meta-analysis;
* evidence synthesis.

Data extraction and appraisal are reserved for future versions. The event architecture must nevertheless leave room for them.

---

# 4. Technology stack

At project initialization, development uses the latest stable versions available at that time.

Once development begins, exact versions are pinned for reproducibility.

Initial target versions:

| Component    |  Version |
| ------------ | -------: |
| Go           |   1.27.1 |
| Astro        |      7.3 |
| Node.js      |   24 LTS |
| SQLite       |   3.53.4 |
| ONNX Runtime |   1.28.0 |
| mise         | 2026.9.1 |

The exact versions must be represented in `mise.toml` and package lockfiles.

Optional semantic-ML functionality uses ONNX Runtime and MiniLM but is not required for the core screening workflow.

---

# 5. Repository structure

```text
openreview/
├── cmd/
│   └── openreview/
│       └── main.go
│
├── internal/
│   ├── api/
│   ├── app/
│   ├── config/
│   ├── database/
│   │   └── master/
│   ├── events/
│   ├── filesystem/
│   ├── ingestion/
│   ├── jobs/
│   ├── projects/
│   ├── screening/
│   └── export/
│
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── astro.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── bruno/
│   ├── opencollection.yml
│   ├── environments/
│   │   └── local.yml
│   ├── status/
│   ├── initialization/
│   ├── project/
│   ├── paper/
│   ├── screening/
│   ├── ingestion/
│   ├── job/
│   └── setting/
│
├── migrations/
│   └── master/
│
├── tests/
├── docs/
├── scripts/
├── mise.toml
├── go.mod
├── README.md
└── LICENSE
```

---

# 6. Frontend architecture

The frontend uses **Astro + TypeScript**.

Astro provides:

* static site generation;
* application pages;
* reusable components;
* documentation;
* component showcase;
* TypeScript;
* Vite development tooling.

React is optional and may be introduced later for complex interactive components. It is not the foundational frontend framework.

---

# 7. Frontend routes

The canonical routes are:

```text
/
 /docs
 /blog
 /faq
 /components

/initialize
/dashboard
/project?id=<project-id>
/settings
```

Project selection uses query parameters rather than dynamic path segments.

The application standard is:

```text
/project?id=<id>
```

not:

```text
/project/<id>
```

The frontend extracts the project ID from the query string and requests:

```http
GET /api/v1/project/<id>
```

---

# 8. Reusable component system

Components must be reusable between the application and documentation.

Proposed structure:

```text
web/src/components/
├── ui/
│   ├── Button.astro
│   ├── Input.astro
│   ├── Select.astro
│   ├── Checkbox.astro
│   ├── Toggle.astro
│   ├── Badge.astro
│   ├── Alert.astro
│   ├── Toast.astro
│   ├── Modal.astro
│   ├── Dropdown.astro
│   ├── Tabs.astro
│   ├── Card.astro
│   ├── Table.astro
│   ├── Pagination.astro
│   ├── EmptyState.astro
│   ├── Loading.astro
│   └── Progress.astro
│
├── layout/
│   ├── AppShell.astro
│   ├── Header.astro
│   ├── Sidebar.astro
│   └── Breadcrumbs.astro
│
├── review/
│   ├── ProjectCard.astro
│   ├── ProjectList.astro
│   ├── PaperCard.astro
│   ├── PaperTable.astro
│   ├── PaperPreview.astro
│   ├── ScreeningControls.astro
│   ├── ScreeningBadge.astro
│   └── ConflictIndicator.astro
│
└── docs/
    ├── Callout.astro
    ├── CodeBlock.astro
    ├── DocNav.astro
    └── TableOfContents.astro
```

`/components` must render the components and their meaningful states as a lightweight component showcase.

---

# 9. Engine architecture

The Review Engine is implemented in Go.

```text
Go Review Engine
├── HTTP API
├── initialization
├── master DB
├── project registry
├── event reader/writer
├── event recapitulation
├── local projections
├── file management
├── ingestion
├── deduplication
├── screening
├── export
└── job manager
```

The Go engine is the authoritative security and data boundary.

---

# 10. Master database

The master database is machine-local.

Default location:

```text
~/.local/share/openreview/openreview.sqlite
```

The exact OS-specific application-data directory must be resolved by Go.

The master database contains machine-specific information such as:

```text
actor
project
setting
```

It acts as a **local router/registry**, not as the project's source of truth.

Example:

```text
project
---------------------------------
id
name
path
created_at
last_opened_at
```

The project path tells the engine where to find:

```text
openreview.yml
events/
papers/
exports/
```

---

# 11. Project directory

The canonical project structure is:

```text
my-review/
├── openreview.yml
├── events/
│   ├── ingestion/
│   │   ├── <actor-id>.jsonl
│   │   └── <actor-id>.jsonl
│   │
│   └── screening/
│       ├── <actor-id>.jsonl
│       └── <actor-id>.jsonl
│
├── papers/
└── exports/
```

Future domains may add:

```text
events/
├── ingestion/
├── screening/
├── extraction/
├── appraisal/
└── review/
```

There is deliberately **no project SQLite database** in the project directory.

---

# 12. Local project cache

Machine-specific state resides outside the project directory:

```text
~/.local/share/openreview/
├── openreview.sqlite
└── cache/
    └── <project-id>/
        ├── state.sqlite
        ├── search/
        ├── embeddings/
        └── temp/
```

The cache can be deleted and rebuilt from the project directory.

This avoids accidentally synchronizing machine-specific cache data through Dropbox, OneDrive, Google Drive, Syncthing, etc.

---

# 13. Project manifest: `openreview.yml`

Every project must contain:

```text
openreview.yml
```

The file uses YAML because it is intended to be human-readable and potentially human-editable.

JSON is reserved for machine-oriented API data and JSONL events.

---

## 13.1 Standard schema

```yaml
schema: "1.0.0"

id: "01K..."
name: "Cancer Treatment Review"
description: "Systematic review of..."

created: "2026-09-12T10:00:00Z"

creator:
  id: "01K..."
  name: "Alice Smith"
  email: "alice@example.com"

reviewers:
  - id: "01K..."
    name: "Alice Smith"
    email: "alice@example.com"

eligibility:
  inclusion:
    - "Adults aged 18 years or older"
    - "Randomized controlled trials"

  exclusion:
    - "Animal studies"
    - "Pediatric populations"

question:
  text: "What is the effect of X on Y?"

protocol:
  version: "1.0.0"
  registered: false
```

---

## 13.2 Required fields

The standardized manifest must contain:

* `schema`
* `id`
* `name`
* `description`
* `created`
* `creator`
* `reviewers`
* `eligibility`
* `question`
* `protocol`

The manifest schema itself uses Semantic Versioning.

The `schema` field identifies the schema of `openreview.yml`, not the version of the review protocol.

---

# 14. Reviewer identity

Each installation has a local actor identity.

During initialization, the user provides:

```text
name
email
```

The system generates a stable actor ID, preferably a ULID.

For example:

```text
actor_id = 01KABC...
name     = Alice Smith
email    = alice@example.com
```

The actor ID, rather than the email or IP address, is the immutable identity.

IP addresses must **not** be used as reviewer identity.

When a reviewer contributes to a project, the system adds that reviewer to the project's reviewer metadata if not already present.

Every event records the `actor_id`.

---

# 15. Event architecture

The event log is the authoritative project state.

Each event is:

* immutable;
* append-only;
* uniquely identified by ULID;
* attributed to an actor;
* timestamped;
* associated with an event schema;
* stored as one JSON object per JSONL line.

Example:

```json
{
  "event_id": "01K...",
  "schema": "1.0.0",
  "type": "screening.abstract.decision",
  "actor_id": "01KALICE...",
  "timestamp": "2026-09-12T10:30:00Z",
  "record_id": "record-123",
  "decision": "include"
}
```

---

# 16. One JSONL stream per actor per domain

The project uses:

```text
events/
├── ingestion/
│   ├── <actor-a>.jsonl
│   └── <actor-b>.jsonl
│
└── screening/
    ├── <actor-a>.jsonl
    └── <actor-b>.jsonl
```

Each actor writes only to their own files.

This avoids simultaneous append operations to the same file and is substantially more synchronization-friendly than millions of individual event files.

The engine combines the event streams during recapitulation.

---

# 17. Event ordering

Every event has a ULID:

```text
event_id: 01K...
```

ULIDs provide globally unique event identifiers and provide sortable temporal information.

The system must **not depend on a global sequential event number**, because independent reviewers must be able to create events without coordination.

Event processing must tolerate concurrent streams and use deterministic ordering rules.

---

# 18. Event domains

## 18.1 Ingestion

The ingestion domain represents importing externally generated literature-search results.

Initial event types:

```text
record.imported
record.duplicate.detected
record.merged
```

Supported input formats:

```text
BibTeX (.bib)
NBIB (.nbib)
TXT (.txt)
CSV (.csv)
```

The importer must normalize different formats into a common bibliographic record representation.

---

# 19. Search provenance

The application does not perform literature searches, but imported search results must retain their provenance where available.

Relevant metadata includes:

```text
source database
source filename
import timestamp
search/export metadata
```

For example:

```text
source = PubMed
filename = pubmed-results.nbib
```

The actual search query remains external to the application unless it is included in the imported file.

---

# 20. Deduplication

Deduplication is based on the following deterministic priority:

```text
1. DOI
2. PMID
3. normalized title
```

A match at the first available identifier establishes a duplicate.

Example:

```text
A.DOI == B.DOI
→ duplicate
```

If DOI does not establish a duplicate:

```text
A.PMID == B.PMID
→ duplicate
```

If neither identifier establishes a duplicate:

```text
normalize(A.title) == normalize(B.title)
→ duplicate
```

---

# 21. Title normalization

Title normalization must be deterministic.

At minimum:

1. convert to uppercase;
2. normalize Unicode;
3. normalize punctuation;
4. collapse repeated whitespace;
5. trim leading/trailing whitespace.

The exact implementation must be specified and covered by tests.

---

# 22. Deduplication means merge, not deletion

When duplicates are identified, the system must create a merged canonical record.

It must not simply discard one record.

For each field, calculate:

```text
completeness = character length of field value
```

Missing values have length:

```text
0
```

The value with the greatest length becomes the canonical value.

Example:

```text
Entry A
title     = 20 chars
author    = 30 chars
DOI       = 10 chars
abstract  = 500 chars

Entry B
title     = 20 chars
author    = 35 chars
DOI       = 10 chars
abstract  = 600 chars
publisher = 20 chars
```

The merged record becomes:

```text
title      → A or B
author     → B
DOI        → A or B
abstract   → B
publisher  → B
```

Missing values never displace non-empty values.

---

# 23. Equal-length merge conflicts

If two non-empty values have equal length but different content, the engine must not silently claim that one is more complete.

The canonical selection must be deterministic, while the alternative value must remain available as provenance.

The exact tie-breaking/provenance representation must be defined in the implementation specification.

---

# 24. Screening

Screening is the process of determining whether a bibliographic record/report satisfies the review's eligibility criteria.

V1 has two screening stages:

```text
abstract screening
full-text screening
```

---

# 25. Abstract screening events

Abstract screening is represented by:

```text
screening.abstract.decision
```

Supported decisions:

```text
include
exclude
uncertain
```

Example:

```json
{
  "event_id": "01K...",
  "schema": "1.0.0",
  "type": "screening.abstract.decision",
  "actor_id": "01K...",
  "record_id": "record-123",
  "decision": "exclude",
  "timestamp": "2026-09-12T10:30:00Z"
}
```

---

# 26. Full-text screening events

Full-text screening is represented by:

```text
screening.fulltext.decision
```

Supported decisions:

```text
include
exclude
uncertain
```

Full-text retrieval status should also be represented where needed:

```text
fulltext.requested
fulltext.acquired
fulltext.unavailable
```

This permits the system to distinguish:

```text
potentially eligible
→ full text sought
→ full text obtained
→ full text assessed
→ included/excluded
```

---

# 27. Exclusion reasons

Exclusion reasons are structured but optional.

A reviewer may record:

```text
exclude
```

without a reason.

Reasons may be added later.

The project eligibility configuration should support structured categories such as:

```yaml
eligibility:
  exclusion:
    - wrong_population
    - wrong_intervention
    - wrong_comparator
    - wrong_outcome
    - wrong_study_design
    - wrong_publication_type
    - wrong_language
    - wrong_date
    - duplicate
    - other
```

The exact categories are review-specific and must remain configurable.

Free-text notes may accompany structured reasons.

---

# 28. Revising decisions

A reviewer may revisit a previous decision.

Events are never edited or deleted.

Example:

```text
Alice → include
Alice → exclude
```

Both events remain in the log.

The project projection determines the current state.

This preserves a complete audit trail.

---

# 29. Multiple reviewers and disagreement

Independent reviewer decisions must remain distinguishable.

Example:

```text
Alice → include
Bob   → exclude
```

The system must recognize this as a disagreement/conflict rather than silently applying last-write-wins semantics.

The dashboard should surface unresolved conflicts.

---

# 30. Manual conflict resolution

Conflict resolution is deliberately human.

The system does not automatically decide whether a disputed article should be included.

Reviewers discuss the article and then one or both reviewers record a new decision.

Example:

```text
Alice → include
Bob   → exclude
Bob   → include
```

The conflict is now resolved.

An optional explicit resolution event may record:

```text
review.conflict.resolved
```

with an optional note.

The historical disagreement remains permanently available in the event log.

---

# 31. Dashboard

The application reconstructs the current project state from the event log and presents a decision dashboard.

At minimum:

```text
Total articles       1,284

Accepted               317
Rejected               821
Unknown                146
Conflicts               14
```

The exact terminology in the UI may be:

```text
Included
Excluded
Uncertain
Conflict
```

The dashboard must be derived from events rather than manually maintained counters.

---

# 32. Event log growth

Event logs are expected to grow, but individual screening events are small.

The authoritative event log must not be deleted merely to reduce storage.

Instead, the engine maintains a local materialized projection:

```text
events
  ↓
state.sqlite
```

and a local checkpoint indicating how much of the event stream has already been recapitulated.

On subsequent loads:

```text
checkpoint
    ↓
replay only new events
    ↓
update projection
```

This avoids replaying the entire history on every application launch.

Future versions may introduce portable snapshots if event replay becomes a measurable performance problem.

---

# 33. Local projection

The materialized SQLite state may contain:

* normalized records;
* current screening decisions;
* conflict state;
* exclusion reasons;
* project statistics;
* indexes;
* search/indexing data;
* other derived information.

It is disposable.

If:

```text
cache/<project-id>/state.sqlite
```

is deleted, the engine must be able to reconstruct it from:

```text
openreview.yml
events/
papers/
```

---

# 34. Full-text files

The `papers/` directory contains locally managed paper/full-text files.

The application must not require papers to be copied into a remote service.

The project can therefore remain portable:

```text
my-review/
├── openreview.yml
├── events/
├── papers/
└── exports/
```

The exact naming/content-addressing strategy for paper files should be specified during the ingestion/full-text implementation phase.

---

# 35. Export

The application must export screening results in machine-readable and researcher-friendly formats.

At minimum, export should include:

* canonical record identifier;
* bibliographic metadata;
* current abstract-screening decision;
* current full-text decision;
* exclusion reason where available;
* reviewer information;
* relevant provenance;
* conflict status where applicable.

Export must be generated from the current materialized project state.

---

# 36. API

Initial API:

```http
GET    /api/v1/status
GET    /api/v1/capabilities
POST   /api/v1/initialize

GET    /api/v1/project
POST   /api/v1/project
GET    /api/v1/project/<id>
PATCH  /api/v1/project/<id>
DELETE /api/v1/project/<id>

POST   /api/v1/ingestion
GET    /api/v1/paper/<id>
GET    /api/v1/paper

POST   /api/v1/screening
GET    /api/v1/job/<id>

GET    /api/v1/setting
PATCH  /api/v1/setting

POST   /api/v1/export
```

The precise endpoint payloads are defined in the Bruno OpenCollection.

---

# 37. Bruno API documentation

Bruno is the authoritative API documentation and test collection.

```text
bruno/
├── opencollection.yml
├── environments/
│   └── local.yml
├── status/
├── initialization/
├── project/
├── paper/
├── ingestion/
├── screening/
├── job/
└── setting/
```

Every implemented API endpoint should have a corresponding Bruno request/test.

The Bruno collection should be executable in CI.

A separate OpenAPI specification is not required for the initial architecture.

---

# 38. Initialization

The engine begins in:

```text
NEW
```

and transitions to:

```text
READY
```

Only the following operations are available before initialization:

```http
GET  /api/v1/status
POST /api/v1/initialize
```

Initialization collects the local actor's:

```text
name
email
```

and establishes the master database.

The frontend redirects:

```text
NEW
 → /initialize
```

and after successful initialization:

```text
READY
 → /dashboard
```

Attempting to visit `/initialize` after initialization redirects to `/dashboard`.

---

# 39. API security boundary

Frontend route guards are only UX mechanisms.

The Go engine must enforce initialization state and API authorization itself.

Protected APIs must reject requests when the engine is not initialized.

Default engine binding:

```text
127.0.0.1:<port>
```

Remote access must be explicitly configured.

State-changing requests should validate the request origin where appropriate.

---

# 40. Remote access

The architecture must support:

```text
localhost
LAN
Tailscale
future HTTPS remote engine
```

without requiring frontend changes.

The frontend uses a `ReviewEngineClient` abstraction:

```text
ReviewEngineClient
       │
       ├── localhost
       ├── LAN
       ├── Tailscale
       └── future remote endpoint
```

Tailscale Serve is the preferred initial mechanism for private remote access.

Public exposure through Tailscale Funnel is not enabled by default.

A relay is intentionally deferred.

---

# 41. Future relay architecture

The architecture should remain compatible with a future outbound relay:

```text
Browser
   │
   ▼
encrypted relay
   │
   ▼
local Go engine
```

The relay must not become a dependency of the initial release.

The event-log architecture is particularly suitable for eventual synchronization through such a relay because the portable state is file/event based rather than a synchronized SQLite database.

---

# 42. Search and semantic ML

The core application does not require machine learning.

The initial workflow uses:

* deterministic normalization;
* deduplication;
* structured screening;
* SQLite/local projections.

Semantic search and embeddings are optional future functionality and must never be required for normal screening.

If ML functionality is introduced:

```text
ModelManager
├── locate cached model
├── verify model/revision
├── download if missing
└── provide local model
```

Models should use a shared machine-local cache rather than duplicate model files per project.

Model downloads occur lazily when the feature is first used.

---

# 43. Resource requirements

The always-running core engine should target approximately:

```text
CPU: < 0.25 vCPU idle
RAM: < 100 MB idle
```

The PRD does not require ML workloads to meet the same idle resource target.

Benchmarks must document:

* startup time;
* idle memory;
* ingestion performance;
* deduplication performance;
* screening-state reconstruction;
* dashboard generation;
* export performance;
* event replay performance.

---

# 44. Atomic implementation phases

## P0 — Repository and development environment

**Objective:** Establish reproducible development.

Acceptance criteria:

* clean machine with Git and mise can clone repository;
* `mise install` installs pinned tools;
* `mise run test` succeeds.

---

## P1 — Astro application

**Objective:** Establish the static frontend.

Acceptance criteria:

* Astro builds successfully;
* `/`;
* `/docs`;
* `/blog`;
* `/faq`;
* `/components`

are available.

---

## P2 — Component system

**Objective:** Build reusable application/documentation components.

Acceptance criteria:

* common UI primitives exist;
* `/components` demonstrates meaningful states;
* components are reused by application pages.

---

## P3 — Application shell

**Objective:** Establish application routes.

Acceptance criteria:

* `/initialize` exists;
* `/dashboard` exists;
* `/project?id=<id>` exists;
* `/settings` exists;
* query parameter is correctly parsed.

---

## P4 — Go engine

**Objective:** Establish the Review Engine.

Acceptance criteria:

```http
GET /api/v1/status
```

returns a valid status response.

---

## P5 — Frontend/engine client

**Objective:** Connect TypeScript frontend to Go engine.

Acceptance criteria:

* typed `ReviewEngineClient` exists;
* frontend can retrieve engine status;
* engine URL is configurable.

---

## P6 — Initialization and actor identity

**Objective:** Implement `NEW → READY`.

Acceptance criteria:

* initialization collects name/email;
* stable actor ID is generated;
* master DB is created;
* protected APIs reject pre-initialization access;
* frontend redirects appropriately.

---

## P7 — Master database

**Objective:** Implement machine-local project/user registry.

Acceptance criteria:

* master DB persists across restart;
* actor identity persists;
* project registry persists;
* project paths can be stored and retrieved.

---

## P8 — Project manifest

**Objective:** Implement standardized `openreview.yml`.

Acceptance criteria:

* project can be created with valid manifest;
* schema is validated;
* project ID is stable;
* manifest survives moving the project directory.

---

## P9 — Project registration/opening

**Objective:** Connect project directories to the master DB.

Acceptance criteria:

* project can be registered;
* project can be opened;
* `/project?id=<id>` resolves the correct project;
* master DB provides the project path.

---

## P10 — Event infrastructure

**Objective:** Implement append-only JSONL event streams.

Acceptance criteria:

* events use ULIDs;
* events contain actor ID and timestamp;
* each actor writes to their own domain JSONL;
* events can be read deterministically;
* events remain immutable.

---

## P11 — Ingestion

**Objective:** Import external search results.

Acceptance criteria:

* `.bib` works;
* `.nbib` works;
* `.txt` works where supported;
* `.csv` works;
* records are normalized into a common model;
* import provenance is preserved.

---

## P12 — Deduplication and merge

**Objective:** Detect and merge duplicate records.

Acceptance criteria:

* DOI matching works;
* PMID matching works;
* normalized-title matching works;
* matching priority is deterministic;
* field completeness uses string length;
* missing fields have score 0;
* merged records preserve provenance;
* duplicate events are recorded.

---

## P13 — Abstract screening

**Objective:** Implement title/abstract screening.

Acceptance criteria:

* include/exclude/uncertain decisions can be recorded;
* reviewer identity is preserved;
* decisions are append-only events;
* exclusion reason is optional;
* decisions can be revisited;
* current state is correctly reconstructed.

---

## P14 — Full-text management

**Objective:** Manage full-text retrieval and availability.

Acceptance criteria:

* full-text files can be associated with records;
* acquisition state can be represented;
* unavailable full texts can be identified;
* relevant events are recorded.

---

## P15 — Full-text screening

**Objective:** Implement eligibility screening of retrieved full texts.

Acceptance criteria:

* include/exclude/uncertain decisions can be recorded;
* optional structured exclusion reason is supported;
* decisions are auditable;
* decisions can be revised.

---

## P16 — Multi-reviewer conflicts

**Objective:** Detect disagreements.

Acceptance criteria:

* independent reviewer decisions remain distinguishable;
* conflicting decisions are detected;
* conflicts appear in the dashboard;
* no automatic scientific resolution occurs;
* manual resolution is recorded;
* original conflicting decisions remain in history.

---

## P17 — Materialized project state

**Objective:** Make event replay performant.

Acceptance criteria:

* event log can reconstruct project state;
* SQLite projection can be generated;
* subsequent updates replay only new events where possible;
* deleting the projection does not lose project data;
* projection can be rebuilt from project files.

---

## P18 — Dashboard

**Objective:** Display current review status.

Acceptance criteria:

* total records/articles shown;
* included count shown;
* excluded count shown;
* uncertain/unknown count shown;
* conflicts shown;
* values are derived from event state.

---

## P19 — Export

**Objective:** Export screening decisions.

Acceptance criteria:

* canonical bibliographic metadata is exported;
* abstract decision is exported;
* full-text decision is exported;
* exclusion reason is included when available;
* reviewer/provenance information is included;
* export is reproducible from the project state.

---

## P20 — Local packaged application

**Objective:** Run the complete application locally.

Acceptance criteria:

```text
mise run app --web-ui
```

starts the Go engine and serves the built Astro application.

The complete screening workflow works without Internet connectivity.

---

## P21 — GitHub Pages

**Objective:** Publish the static frontend.

Acceptance criteria:

* Astro builds static assets;
* GitHub Actions builds the frontend;
* GitHub Pages hosts the frontend;
* application can connect to a separately running Review Engine.

---

## P22 — Self-configuration

**Objective:** Allow users to configure the engine endpoint.

Acceptance criteria:

* localhost works;
* LAN endpoint works;
* Tailscale endpoint works;
* frontend does not need to know where project files reside.

---

## P23 — Tailscale

**Objective:** Enable private remote access to the local engine.

Acceptance criteria:

* second authorized device can reach the engine;
* project data remains on the engine machine;
* no public relay is required.

---

## P24 — Performance/resource benchmarks

**Objective:** Validate resource targets.

Acceptance criteria:

* idle RAM documented;
* startup time documented;
* ingestion performance documented;
* deduplication performance documented;
* event replay performance documented;
* dashboard performance documented;
* export performance documented.

---

# 45. Future event domains

The event architecture must allow future domains without changing the existing screening model.

Potential future structure:

```text
events/
├── ingestion/
├── screening/
├── extraction/
├── appraisal/
└── review/
```

### Extraction

Potential events:

```text
extraction.form.created
extraction.form.updated
extraction.value.set
extraction.value.unset
```

### Appraisal

Potential events:

```text
appraisal.assessment.set
appraisal.assessment.unset
```

### Review

Potential events:

```text
review.note.created
review.note.updated
review.note.deleted
review.conflict.resolved
```

These are intentionally outside the v1 product boundary.

---

# 46. Architectural invariants

The following rules should be treated as non-negotiable implementation constraints:

1. **The project directory is portable.**
2. **`openreview.yml` is the standardized project manifest.**
3. **The event log is the authoritative project state.**
4. **Project SQLite is not authoritative.**
5. **Machine-specific caches never belong in the project directory.**
6. **Each reviewer writes to their own JSONL stream.**
7. **Events are append-only and immutable.**
8. **ULID is used for event identity.**
9. **Reviewer identity is a generated actor ID, not an IP address or email.**
10. **Search is external to openreview.**
11. **Ingestion accepts external search-result files.**
12. **Deduplication merges records rather than simply deleting duplicates.**
13. **Duplicate matching priority is DOI → PMID → normalized title.**
14. **Metadata merge priority is highest non-empty character length.**
15. **Screening reasons are optional.**
16. **Reviewer decisions are never silently overwritten.**
17. **Scientific conflicts are resolved manually.**
18. **Historical events remain available after conflict resolution.**
19. **Dashboard statistics are derived from project state.**
20. **The core workflow must function without ML or a hosted backend.**
