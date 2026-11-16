---
phase: 11-about-section-mechanics-feature-branch
plan: 05
subsystem: ui
tags: [css, nav, responsive, playwright, gap-closure]

requires:
  - phase: 11-02
    provides: profile pages whose .profile padding-top (4.0625rem) clears the fixed header
provides:
  - "Single-row fixed nav at 320px (58.6px, was 97px), breadcrumbs on profiles clear of it"
  - "Reusable Playwright layout measurement script (local export or BASE_URL)"
  - "Vitest source guard for the Nav.module.css 320px backstop"
affects: [phase 11 UAT (320px anchor check), any future change to nav height or .profile clearance]

requirements-completed: [ABOUT-06, NAV-01]
gap_closure: true
status: complete

actuals:
  tokens: 1900
  tasks: 3
  commits: 2
plan_head_before: 54d2d1339019b71158a3a7de2aeebb2520249e3e
plan_head_after: 37263d0e6dee879f7466f917cc8cb254db71acf6

tech-stack:
  added: []
  patterns: ["Real-browser layout measurement script run against out/ and production, backed by a cheap source guard in vitest"]

key-files:
  created:
    - src/__tests__/nav-css.test.ts
    - .planning/phases/11-about-section-mechanics-feature-branch/11-05-measure-nav.mjs
  modified:
    - src/components/layout/Nav.module.css

key-decisions:
  - "Wordmark is 1rem at max-width 22.5rem, not the 1.125rem prescribed by UI-SPEC E1: 1.125rem measured 90.6px tall (155.1 + 121 = 276.1px vs 272px content box); 1rem gives 258.8px, 13px slack, header 58.6px"
  - "No --nav-height token: after the fix the header is 58.6px or 65px at every width, never above the 4.0625rem clearance"

patterns-established: []

duration: ~20min
completed: 2026-11-16
---

# Phase 11 Plan 05: Nav single row at 320px Summary

**`white-space: nowrap` on nav links plus a `@media (max-width: 22.5rem)` block (gap 1rem, wordmark 1rem) keeps the fixed header on one row at 320px, proven in headless Chromium on the local export and on production.**

## Accomplishments

- Closed the one Phase 11 verification gap: at 320px the header was 97px (wordmark and "About us" each wrapped) and covered the profile breadcrumb row, which only clears 65px.
- Header is now 58.6px at 320 to 360px and 65.0px at 375px and 1280px (media query does not leak). No horizontal scroll at any measured width. Profile photo top stays at 110.0px at 320px.
- `Nav.tsx` and `.profile` clearance untouched (D-03, D-15). Base `.wordmark` (1.25rem) and `.links` (gap 2rem) unchanged; the CSS diff is 12 additions, 0 deletions.

## Task Commits

1. Task 1 (tracer): `ac85444` fix(11-05): keep nav on one row at 320px (CSS + measurement script)
2. Task 2: `37263d0` test(11-05): guard Nav.module.css 320px backstop
3. Task 3 (human-action): landed on origin/main by the user's approved push, `origin/main` 8c5259c..37263d0; landing SHA `37263d0` (carries ac85444 and 37263d0)

## Evidence

**Red run on production before the fix** (exit 1, 34 PASS, 4 FAIL):

```
FAIL / @320px header-height 97.0
FAIL /about @320px header-height 97.0
FAIL /about/team/michael-desloover @320px header-height 97.0
FAIL /about/team/michael-desloover @320px breadcrumb-top-vs-header-bottom -32.0
```

**Green run on the local export** (exit 0, 38 PASS, 0 FAIL), 320px lines:

```
PASS / @320px header-height 58.6
PASS /about @320px header-height 58.6
PASS /about/team/michael-desloover @320px header-height 58.6
PASS /about/team/michael-desloover @320px breadcrumb-top-vs-header-bottom 6.4
PASS /about/team/michael-desloover @320px photo-top 110.0
```

375px and 1280px header-height-no-leak: 65.0 on all three pages.

**Production after deploy** (https://european-resolve.org, exit 0, 38 PASS, 0 FAIL). The first attempt, run right after the push, still exited 1 because the Cloudflare deploy was in progress; the second attempt, about 40s later, passed:

```
PASS / @320px header-height 58.6
PASS / @320px scroll-width 320.0
PASS /about @320px header-height 58.6
PASS /about @320px scroll-width 320.0
PASS /about/team/michael-desloover @320px header-height 58.6
PASS /about/team/michael-desloover @320px scroll-width 320.0
PASS /about/team/michael-desloover @320px breadcrumb-top-vs-header-bottom 6.4
PASS /about/team/michael-desloover @320px photo-top 110.0
```

**Guard RED:** `nav-css.test.ts` run against the pre-fix stylesheet failed "the real stylesheet has no problems"; with the fix all 3 tests pass. Full gate: lint, typecheck and `npm test` exit 0, 13 test files, 240 tests; prettier clean.

## Deviations from Plan

**1. [Documented plan deviation] Wordmark 1rem instead of UI-SPEC 1.125rem.** Planned and measured before execution: 1.125rem wraps (header 90.6px). Numbers above. Not a surprise deviation; recorded as the plan required.

**2. [Environment] Script env vars in a fresh shell.** First green-run attempt exited 2 because `PLAYWRIGHT_ENTRY` was not exported in that shell call; re-run with the variables set passed. No code change.

Otherwise: plan executed as written.

## Known Stubs

None.

## Threat Flags

None. The measurement script binds 127.0.0.1 on an ephemeral port, rejects paths outside `out/` with 403 (T-11-10), and makes read-only GETs to production.

## Hand-off

The three `behavior_unverified_items` of 11-VERIFICATION.md remain human UAT; its item 1 also asks for a 320px check of the /about anchors now that this fix is live.

## Self-Check: PASSED

- `src/__tests__/nav-css.test.ts`, `11-05-measure-nav.mjs`, `Nav.module.css` fix: present
- Commits ac85444 and 37263d0: ancestors of HEAD and of origin/main
