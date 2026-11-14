# Milestones

## v1.0 Run for Ukraine (Shipped: 2026-11-14)

**Phases completed:** 11 phases, 38 plans, 14 tasks

**Key accomplishments:**

- Backend computes effective tier and cumulative rewards from observed payment amount; confirm-payment and email locales aligned with ADR-009.
- Registration payment widgets block step-1 advance below tier minimum, pre-fill tier price, and stash amount immediately.
- Post-payment confirmation panels display effective tier, paid amount, and cumulative rewards from confirm-payment API.
- Vitest include extended with `src/
- Generic EventCard enhancements via TDD: same-tab internal announcement links, external new-tab links with noopener, and auto-derived Upcoming badge beside type badge
- Run for Ukraine 2026 live in Events DB with Drive thumbnail pipeline; static export renders card with same-tab hub link and Upcoming badge
- EVENT_STATUS-driven write guards blocking registrations, fundraiser edits, and donor wall entries while confirm-payment and read APIs stay open
- Register page completed-mode gate with `?token=` deep-link exception so pending registrants can complete payment after closure
- Ops CLI that reads reconciled Sheets totals via getProgress() and outputs reviewable JSON for event.ts finalStats before closure deploy

### Known Gaps

Closed with acknowledged gaps (no SUMMARY.md was written for any v1.0 plan; work was largely done outside the GSD execute flow):

- Phase 8, plan 08-04: deploy wiring verify, D-19 hide zero charging-stations stat, closure ops checkpoint (not marked done)
- Plans in phases 1-5, 04.1, 06.1 are unchecked in the old roadmap although the work shipped

---
