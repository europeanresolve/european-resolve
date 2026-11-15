---
gsd_state_version: "1.0"
milestone: v1.1
milestone_name: About Us
status: planning
last_updated: "2026-11-15T12:00:00.000Z"
last_activity: 2026-11-15
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-15)

**Core value:** european-resolve.org is a credible, transparent public face for the organisation: mission, people and work in one place. Links to team pages and assets keep working.
**Current focus:** Phase 11: About section mechanics (feature branch)

## Current Position

Phase: 11 of 12 (About section mechanics, feature branch)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-11-15 — v1.1 roadmap created (2 phases, 17/17 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.1)
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1]: Wait for copy, one release. Nothing user-visible ships until Mission copy, History copy and footer legal data are in hand. Phase 11 stays on a feature branch (Cloudflare preview only); Phase 12 is the single merge to `main`.
- [v1.1]: Route move and `_redirects` go live in the same deploy (guaranteed by the single merge).
- [v1.1]: Photo strategy Option B. Photos stay at `public/team/`; 7 explicit `/team/<slug>` 301 lines plus exact `/team` and `/team/` rules; no splat.
- [v1.1]: `/#team` handled by a client-side `location.replace` hop on `/`; nav links straight to `/about`.
- [v1.1]: Sitemap lists `/about` only; member pages stay unlisted (ADR-005).

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 12]: Blocked on org-supplied Mission copy, History copy and footer legal data (enterprise number, registered office, RPR/RPM court).
- [Phase 12]: Exact URL printed on physical business cards (with/without `www.`, trailing slash) needed for the curl matrix.
- [Phase 11/12]: Cloudflare zone-level redirect rules on the custom domain could pre-empt `_redirects`; needs someone with dashboard access.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| plan | 08-04 deploy wiring verify, D-19 zero-stat hide, closure ops checkpoint | known gap | 2026-11-14 | v1.0 |

## Session Continuity

Last session: 2026-11-15
Stopped at: v1.1 roadmap created; next is `/gsd-plan-phase 11`
Resume file: None
