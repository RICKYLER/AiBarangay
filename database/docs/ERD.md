# ERD

Entity-relationship diagram for the AI Barangay Problem Mapper database.

## Core chain

```
users ──< reports >── categories
  │          │  >── priorities
  │          │  >── statuses
  │          ├──< report_media
  │          ├──< report_locations >── zones >── barangays
  │          ├──< ai_analyses
  │          └──< duplicate_matches >── reports (as duplicate)
  │
  └── reports ──< incidents ──< assignments >── offices
                      │              └──< tasks ──< evidence
                      ├──< field_updates
                      └──< resolutions ──< feedback
notifications >── users (recipient)
audit_logs  >── users (actor)
analytics, ai_insights (aggregates, no FK to individuals)
```

## Cardinalities

- one user submits many reports (1:N)
- one report has many media, locations, ai_analyses (1:N)
- one incident consolidates many reports (N:1 — duplicate reports roll up)
- one incident has many assignments; one assignment has many tasks

TODO: replace this ASCII sketch with a rendered diagram (Mermaid `erDiagram` works in GitHub markdown).
