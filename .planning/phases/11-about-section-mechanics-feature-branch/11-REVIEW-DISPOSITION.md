---
phase: 11
review: 11-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Redirect integrity is checked one way only. Removing a member silently breaks printed-card URLs"
  - id: WR-02
    severity: warning
    disposition: open
    title: "The unknown-slug test passes even if the `notFound()` guard is deleted"
  - id: IN-01
    severity: info
    disposition: open
    title: "The legacy hash hop runs only after hydration and only on mount"
  - id: IN-02
    severity: info
    disposition: open
    title: "Home meta description keeps copy that the page no longer shows"
  - id: IN-03
    severity: info
    disposition: open
    title: "Dead `.subtitle` class left in the rewritten home stylesheet"
  - id: IN-04
    severity: info
    disposition: open
    title: "The profile's nav offset is a hard-coded nav height, and BusinessCard now depends on it"
  - id: IN-05
    severity: info
    disposition: open
    title: "CLAUDE.md client component table omits `LegacyHashRedirect`"
  - id: IN-06
    severity: info
    disposition: open
    title: "Non-parallel sentence in the History copy"
open: 8
total: 8
recorded: 2026-11-16T08:55:43.247Z
---

# Phase 11: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |
| IN-05 | info | open | - |
| IN-06 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
