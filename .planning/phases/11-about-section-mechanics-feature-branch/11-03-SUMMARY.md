---
phase: 11-about-section-mechanics-feature-branch
plan: 03
subsystem: infra
tags: [cloudflare-pages, redirects, vitest, seo]

requires:
  - phase: 11-02
    provides: profiles moved to /about/team/[slug] (old /team/<slug> 404s until these 301s)
provides:
  - "public/_redirects: /team and /team/ -> /about#team, 7 explicit /team/<slug> -> /about/team/<slug> 301 rules, no /team splat"
  - "src/__tests__/redirects.test.ts: guard that reads the real _redirects file"
  - "Entry Points docs list /about and /about/team/[slug]"
affects: [11-04 preview curl matrix, phase 12 merge to main]

actuals:
  tokens: 1185
  tasks: 2
  commits: 4
plan_head_before: a041968d4c9a125730ac167a0fa2e7077928f603
plan_head_after: a3e32532ca4ca717d2708b25b1c3c93434bcbec8

tech-stack:
  added: []
  patterns:
    - "Config guard test: parse a deployed config file (public/_redirects) in vitest and assert its shape"

key-files:
  created:
    - src/__tests__/redirects.test.ts
  modified:
    - public/_redirects
    - CLAUDE.md
    - .planning/codebase/ARCHITECTURE.md

key-decisions:
  - "Guard compares normalised one-line rule strings (toContain) instead of token arrays (toContainEqual), so vitest's TAP output stays parseable for RED evidence and failures print on one line"
  - "Same-origin check rejects protocol-relative //host destinations, not just non-/ ones"

patterns-established:
  - "Mutation-proven guards: a guard for an already-satisfied invariant gets its RED from a deliberate bad edit to the guarded file, restored via git checkout of that one file"

requirements-completed: [LINK-01, LINK-02, LINK-04, QA-01]

coverage:
  - id: D1
    description: "Every member's /team/<slug> has an explicit 301 to /about/team/<slug>; /team and /team/ 301 to /about#team"
    requirement: LINK-01
    verification:
      - kind: unit
        ref: "src/__tests__/redirects.test.ts#has a /team/<slug> rule for every member"
        status: pass
      - kind: unit
        ref: "src/__tests__/redirects.test.ts#sends /team and /team/ to /about#team"
        status: pass
    human_judgment: false
  - id: D2
    description: "Live 301 behaviour on Cloudflare (trailing slash, query strings, fragment delivery)"
    requirement: LINK-02
    verification: []
    human_judgment: true
    rationale: "next dev and vitest ignore _redirects; only the pages.dev preview shows real edge behaviour (curl matrix in 11-04)"
  - id: D3
    description: "Photos at /team/<slug>.png are never redirected: no /team splat, placeholder or .png source"
    requirement: LINK-04
    verification:
      - kind: unit
        ref: "src/__tests__/redirects.test.ts#has no /team splat, placeholder or .png source (photos must not redirect)"
        status: pass
      - kind: unit
        ref: "src/__tests__/members.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Guard fails on missing 301, splat, self-redirect, external destination, duplicate source, fewer than 10 rules, or a member without a rule"
    requirement: QA-01
    verification:
      - kind: unit
        ref: "npm run lint && npm run typecheck && npm test (233/233)"
        status: pass
      - kind: other
        ref: "mutation runs: splat, missing marco-melega line, missing 301 on olena-kuzhym line (each failed, file restored)"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-11-16
status: complete
---

# Phase 11 Plan 03: Legacy /team Redirects Summary

**Nine explicit Cloudflare 301 rules send /team, /team/ and each of the 7 /team/<slug> URLs to /about, with no splat so /team/<slug>.png photos keep serving, guarded by a vitest that parses the real public/_redirects.**

## Performance

- **Duration:** 3 min (measured from the start marker, after initial reading)
- **Started:** 2026-11-16T06:29:36Z
- **Completed:** 2026-11-16T06:32:43Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `public/_redirects`: 3 comment lines plus `/team /about#team 301`, `/team/ /about#team 301` and one `/team/<slug> /about/team/<slug> 301` per member, after the untouched `/r4u` rule on line 2
- `src/__tests__/redirects.test.ts`: 9 cases (at least 10 rules, every member covered, /team and /team/, exactly `from to 301`, no /team splat/placeholder/.png source, no self-redirect, same-origin destinations, unique sources, /r4u kept)
- Entry Points tables in `CLAUDE.md` and `.planning/codebase/ARCHITECTURE.md` gain an About row and the `/about/team/[slug]` route

## Task Commits

1. **Task 1: Legacy /team rules with a guard reading the real file** - `176a918` (test, RED), `7968dc0` (feat, GREEN)
2. **Task 2: Harden guard and update Entry Points docs** - `218c814` (test, mutation-proven RED), `a3e3253` (docs)

## TDD Gate Compliance

- Task 1 RED: `176a918`. Evidence `.planning/phases/11-about-section-mechanics-feature-branch/.red/11-03-task1-red.json`, classifier `RED_EVIDENCE_OK` (target `_redirects > has a /team/<slug> rule for every member`, 3 of 4 failing). Semantic assessment: target ran and failed on the planned `toContain` assertion because only the /r4u rule existed; the /r4u case passes by design.
- Task 1 GREEN: `7968dc0`, 4/4 pass.
- Task 2 RED (mutation): `/team/* /about 301` temporarily appended. Evidence `.red/11-03-task2-red.json`, classifier `RED_EVIDENCE_OK` (target `has no /team splat, placeholder or .png source`, only that case failing: `/team/*: expected true to be false`). File restored with `git checkout -- public/_redirects`.
- Task 2 GREEN: no implementation commit, by design. The guarded invariant already held after Task 1, so the restored, unchanged file is the GREEN state (9/9 pass). There is no `feat` after `218c814`; flagged here as intentional.
- REFACTOR: none.

### Mutation runs (Task 2 Step 2)

| Mutation | Failing cases | Restored |
|----------|---------------|----------|
| (a) append `/team/* /about 301` | no /team splat (`/team/*: expected true to be false`) | yes, then 9/9 pass |
| (b) delete the marco-melega line | at least 10 rules (`expected 9 to be >= 10`), every member (`to include '/team/marco-melega ...'`) | yes |
| (c) drop `301` from the olena-kuzhym line | every member, 3-token (`expected 2 to be 3`) | yes |

`git diff --exit-code public/_redirects` was clean after each run and at commit time.

## Files Created/Modified
- `public/_redirects` - legacy /team 301 rules plus 3 comment lines
- `src/__tests__/redirects.test.ts` - _redirects guard tests
- `CLAUDE.md` - Entry Points: About row, Team Member route
- `.planning/codebase/ARCHITECTURE.md` - same two rows

## Decisions Made
- Containment checks compare `"from to code"` strings, not token arrays. vitest's TAP reporter prints `toContainEqual` diffs as multi-line YAML, which the RED classifier rejects as malformed TAP; strings keep failures on one line and match the file text literally. Token arrays are still used for the 3-token check.
- Plan did Task 1 test-first even though it is a tracer task, so the plan carries a real RED before the rules landed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Same-origin check also rejects protocol-relative destinations**
- **Found during:** Task 2
- **Issue:** The planned check "destination starts with /" passes `//evil.example`, which browsers treat as an external host (open redirect, T-11-07).
- **Fix:** Assert `/^\/(?!\/)/` instead.
- **Files modified:** src/__tests__/redirects.test.ts
- **Verification:** 9/9 pass on the real file
- **Committed in:** `218c814`

**2. [Rule 3 - Blocking] Assertion form changed for parseable RED evidence**
- **Found during:** Task 1 RED
- **Issue:** `toContainEqual` failures produced TAP the classifier rejected (`invalid_record`, "Malformed TAP").
- **Fix:** Compare joined rule strings with `toContain` (same semantics).
- **Files modified:** src/__tests__/redirects.test.ts
- **Verification:** classifier `RED_EVIDENCE_OK`
- **Committed in:** `176a918`

---

**Total deviations:** 2 auto-fixed (1 security, 1 blocking)
**Impact on plan:** Both small and inside the guard file. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Old `/team/<slug>` links are covered again once this branch deploys; nothing is pushed or merged (D-02).
- 11-04 must run the curl matrix on the pages.dev preview: trailing-slash `/team/<slug>/` and query-string pass-through are not documented by Cloudflare (RESEARCH A3). A 404 there means 7 extra `/team/<slug>/` lines; the guard asserts "contains", so it will not break.

---
*Phase: 11-about-section-mechanics-feature-branch*
*Completed: 2026-11-16*

## Self-Check: PASSED
