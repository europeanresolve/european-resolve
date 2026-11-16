---
gsd_state_version: "1.0"
milestone: v1.1
milestone_name: About Us
current_phase: 12
current_phase_name: Final copy, legal footer and release
status: planning
stopped_at: Phase 11 complete, ready to plan Phase 12
last_updated: "2026-11-16T09:29:17.423Z"
last_activity: 2026-11-16
last_activity_desc: Phase 11 complete, transitioned to Phase 12
state_head: 3ace45f8558c77949de8f29b95a860a61e1ac335
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 5
  completed_plans: 5
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-15)

**Core value:** european-resolve.org is a credible, transparent public face for the organisation: mission, people and work in one place. Links to team pages and assets keep working.
**Current focus:** Phase 12 — Final copy, legal footer and release (Phase 11 shipped to production 2026-11-16)

## Current Position

Phase: 12 — Final copy, legal footer and release
Plan: Not started
Status: Ready to plan
Last activity: 2026-11-16 — Phase 11 complete, transitioned to Phase 12

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 5 (v1.1)
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 11 | 5 | - | - |

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 11 P01 | 4 min | 3 tasks | 10 files |
| Phase 11 P02 | 4 min | 2 tasks | 5 files |
| Phase 11 P03 | 3min | 2 tasks | 4 files |
| Phase 11 P04 | 59 min | 3 tasks | 0 files |
| Phase 11 P05 | 20min | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1]: SUPERSEDED 2026-11-16. The plan was one release at Phase 12, but the user deployed Phase 11 to production (About page with final Mission and History copy, route move, `_redirects`). Phase 12 now owes only the footer legal data (LEGAL-01); its roadmap entry needs re-scoping.
- [v1.1]: Route move and `_redirects` went live in the same deploy (Phase 11 push to `main`).
- [v1.1]: Photo strategy Option B. Photos stay at `public/team/`; 7 explicit `/team/<slug>` 301 lines plus exact `/team` and `/team/` rules; no splat.
- [v1.1]: `/#team` handled by a client-side `location.replace` hop on `/`; nav links straight to `/about`.
- [v1.1]: Sitemap lists `/about` only; member pages stay unlisted (ADR-005).
- [Phase 11]: Legacy hash hop uses a Map lookup so prototype-like hashes (#constructor, #__proto__) return null
- [Phase 11]: TDD RED commits may carry a minimal stub so RED fails on assertions, not missing imports
- [Phase 11]: Profile route moved with git mv to /about/team/[slug]; src/app/team/ deleted (D-01 Option B)
- [Phase 11]: BusinessCard top padding 7rem -> 0.5rem with breadcrumbs above the card (D-15); visual check in 11-04
- [Phase 11]: 11-03: _redirects guard compares one-line 'from to code' strings and rejects protocol-relative //host destinations; Task 2 RED was mutation-proven (splat, missing member, missing 301)
- [Phase 11]: User deployed phase 11 to production (main a5a36ee) instead of a non-main preview, superseding D-02; 11-04 curl matrix 26/26 pass on european-resolve.org
- [Phase 11]: Trailing-slash /team/<slug>/ 404s on production; fixed by 7 /team/<slug>/ 301 rules (8c5259c), live and curl-verified
- [Phase 11]: 11-05: nav wordmark 1rem at max-width 22.5rem (not UI-SPEC 1.125rem, which measured 90.6px tall at 320px); header 58.6px at 320px, 65px above

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 12]: Blocked on org-supplied footer legal data (enterprise number, registered office, RPR/RPM court). Mission and History copy are final and already live.
- [Phase 12]: Exact URL printed on physical business cards still unknown. `www.european-resolve.org` has no DNS record (pre-existing); if cards print `www.`, that needs a DNS record and redirect rule.
- [Phase 11/12]: Cloudflare zone-level redirect rules on the custom domain could pre-empt `_redirects`; needs someone with dashboard access.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| plan | 08-04 deploy wiring verify, D-19 zero-stat hide, closure ops checkpoint | known gap | 2026-11-14 | v1.0 |

## Session Continuity

Last session: 2026-11-16T09:24:15.836Z
Stopped at: Phase 11 complete, ready to plan Phase 12
Resume file: None
