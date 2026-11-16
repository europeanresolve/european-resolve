---
phase: 11-about-section-mechanics-feature-branch
plan: 04
subsystem: infra
tags: [cloudflare-pages, redirects, curl, release]

requires:
  - phase: 11-01
    provides: /about page with #mission, #history, #team sections and homepage hash hop
  - phase: 11-02
    provides: profiles at /about/team/[slug], photos still at /team/<slug>.png
  - phase: 11-03
    provides: public/_redirects legacy /team rules
provides:
  - "Local release gate evidence at c25008a (lint, typecheck, 233/233 tests, static export artifacts)"
  - "Live curl matrix on production european-resolve.org: 26/26 rows pass"
  - "Gap found: /team/<slug>/ (trailing slash) returns 404 on production"
affects: [phase 11 UAT, phase 12 (D-02 merge gate now moot), /gsd-plan-phase 11 --gaps]

actuals:
  tokens: 0
  tasks: 3
  commits: 1
plan_head_before: c25008a2ea2d5644b14db87ac065a0fc0189adfe
plan_head_after: a5a36ee75d3a9c009b2a64b68da8b65e157421aa

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: []

key-decisions:
  - "User deployed phase 11 to production (pushed main a5a36ee) instead of a non-main preview, overriding D-02 and the 11-04 never-main prohibition; matrix run against https://european-resolve.org"
  - "Trailing-slash /team/<slug>/ 404 recorded as a gap for /gsd-plan-phase 11 --gaps, not fixed in this plan (plan forbids source edits)"

patterns-established: []

requirements-completed: [ABOUT-02, ABOUT-06, NAV-01, LINK-01, LINK-02, LINK-03, LINK-04]

coverage:
  - id: D1
    description: "Local gate: lint, typecheck, full test suite and static export with correct out/ artifacts"
    verification:
      - kind: other
        ref: "npm run lint && npm run typecheck && npm test && rm -rf out && npm run build (+ out/ artifact checks) at c25008a"
        status: pass
    human_judgment: false
  - id: D2
    description: "Legacy /team/<slug> 301 to /about/team/<slug> for all 7 members, 1 hop to 200, on production"
    requirement: LINK-01
    verification:
      - kind: e2e
        ref: "curl matrix against https://european-resolve.org (scratchpad matrix.sh)"
        status: pass
    human_judgment: false
  - id: D3
    description: "/team and /team/ 301 to /about#team on production"
    requirement: LINK-02
    verification:
      - kind: e2e
        ref: "curl matrix against https://european-resolve.org"
        status: pass
    human_judgment: false
  - id: D4
    description: "/team/<slug>.png photos 200 with no redirect on production"
    requirement: LINK-04
    verification:
      - kind: e2e
        ref: "curl matrix against https://european-resolve.org"
        status: pass
    human_judgment: false
  - id: D5
    description: "Homepage /#team and /#about hash hop with Back skipping /#team"
    requirement: LINK-03
    verification: []
    human_judgment: true
    rationale: "Browser history behaviour of location.replace cannot be observed with curl; end-of-phase UAT"
  - id: D6
    description: "Section headings visible below fixed nav, nav fits at 320px, profile card position, visual parity in light/dark"
    requirement: ABOUT-02
    verification: []
    human_judgment: true
    rationale: "Visual layout checks; end-of-phase UAT"

duration: 59min
completed: 2026-11-16
status: complete
---

# Phase 11 Plan 04: Release verification Summary

**Phase 11 went live on production (user's call, main a5a36ee). All 26 curl matrix rows pass on european-resolve.org. One gap: `/team/<slug>/` with a trailing slash now returns 404.**

## PRODUCTION ISSUE (gap)

`https://european-resolve.org/team/michael-desloover/` (trailing slash) returns `HTTP/2 404` with no Location. Before this deploy, `out/team/<slug>.html` existed, so Cloudflare Pages served or normalised that URL. Now the file is gone and `_redirects` only matches the form without the slash. If any printed card or email signature uses the trailing-slash form, it is broken right now.

Known fix (for `/gsd-plan-phase 11 --gaps`): add 7 lines `/team/<slug>/ /about/team/<slug> 301` to `public/_redirects`. The redirect guard test already allows this shape.

## Performance

- **Duration:** about 59 min (Task 1 at c25008a 06:33Z to Task 3 end 08:33Z, including the user's wait at the Task 2 checkpoint)
- **Started:** 2026-11-16T06:33:42Z
- **Completed:** 2026-11-16T08:33:00Z
- **Tasks:** 3 of 3
- **Files modified:** 0 source files

## Accomplishments

- Task 1 (tracer): full local gate and static export passed at c25008a. 12 test files, 233/233 tests, 19 static pages. `out/` checks showed zero MISSING: 7 × `out/about/team/<slug>.html` and `out/team/<slug>.png`, no `out/team/<slug>.html`, `out/about.html`, `out/404.html`, 9 `/team` rules in `out/_redirects`, sitemap lists `/about` once and no `/team`, canonicals correct.
- Task 2 (human-action): the user chose `branch=main`, `url=https://european-resolve.org`. The orchestrator fast-forwarded local `main` to a5a36ee and pushed it with the user's explicit authorisation (`origin/main` ed57153 -> a5a36ee).
- Task 3: production served `/about` 200 on the first poll (08:31:55Z). The full matrix passed against production.

## Task 3 evidence

Deploy check: `git ls-remote origin refs/heads/main` = `a5a36ee75d3a9c009b2a64b68da8b65e157421aa` = local HEAD. HEAD is an ancestor of `origin/main`. `curl https://european-resolve.org/about` -> 200.

Matrix (P=https://european-resolve.org, last status line read, so `103 Early Hints` is skipped):

```
ok   https://european-resolve.org/team/michael-desloover 301 /about/team/michael-desloover
ok   https://european-resolve.org/team/michael-desloover.png 200
ok   https://european-resolve.org/about/team/michael-desloover 200
ok   https://european-resolve.org/team/liza-bezvershenko 301 /about/team/liza-bezvershenko
ok   https://european-resolve.org/team/liza-bezvershenko.png 200
ok   https://european-resolve.org/about/team/liza-bezvershenko 200
ok   https://european-resolve.org/team/olena-kuzhym 301 /about/team/olena-kuzhym
ok   https://european-resolve.org/team/olena-kuzhym.png 200
ok   https://european-resolve.org/about/team/olena-kuzhym 200
ok   https://european-resolve.org/team/benjamin-lemerle 301 /about/team/benjamin-lemerle
ok   https://european-resolve.org/team/benjamin-lemerle.png 200
ok   https://european-resolve.org/about/team/benjamin-lemerle 200
ok   https://european-resolve.org/team/ivan-zinchenko 301 /about/team/ivan-zinchenko
ok   https://european-resolve.org/team/ivan-zinchenko.png 200
ok   https://european-resolve.org/about/team/ivan-zinchenko 200
ok   https://european-resolve.org/team/serhiy-onyshchenko 301 /about/team/serhiy-onyshchenko
ok   https://european-resolve.org/team/serhiy-onyshchenko.png 200
ok   https://european-resolve.org/about/team/serhiy-onyshchenko 200
ok   https://european-resolve.org/team/marco-melega 301 /about/team/marco-melega
ok   https://european-resolve.org/team/marco-melega.png 200
ok   https://european-resolve.org/about/team/marco-melega 200
ok   https://european-resolve.org/team 301 /about#team
ok   https://european-resolve.org/team/ 301 /about#team
ok   https://european-resolve.org/about 200
ok   https://european-resolve.org/r4u/test 301 /events/2026-run-for-ukraine/fundraise/test
ok   hops https://european-resolve.org/team/michael-desloover [1 200]
MATRIX_FAIL=0
```

Observe-only probes:

```
https://european-resolve.org/team/michael-desloover/ -> HTTP/2 404  | location:
https://european-resolve.org/team?x=1 -> HTTP/2 301  | location: /about?x=1#team
https://www.european-resolve.org/team/michael-desloover ->  | location:
www follow: 0 000 https://www.european-resolve.org/team/michael-desloover
trailing-slash follow: 0 404 https://european-resolve.org/team/michael-desloover/
```

- Trailing slash: 404. This is the gap above.
- Query string: passes through to `/about?x=1#team`, fine.
- `www.european-resolve.org`: `Could not resolve host`, so there is no DNS record. This was true before the deploy and is outside `_redirects`. If cards print `www.`, they need a DNS record plus a Cloudflare redirect rule (a separate decision).

## Task Commits

No task produced source changes (the plan has `files_modified: []`). Task 1 wrote only the gitignored `out/`.

- `a5a36ee` chore: update next-env.d.ts generated by Next.js build (user-requested, made between Task 1 and Task 2; this is the one commit in `plan_head_before..plan_head_after`)

## Files Created/Modified

None (only this SUMMARY).

## Decisions Made

- The user deployed to production instead of a preview (see the deviation below).
- The trailing-slash 404 goes to `--gaps` rather than being fixed here, as the plan's Step 4 requires.

## Deviations from Plan

**1. [User decision] Deployed to production instead of a non-main preview**
- **Found during:** Task 2
- **What happened:** The user said "commit to the branch locally, merge to local main, push to remote main, proceed from there". They confirmed again after being told this deploys production and skips the Phase 12 single-merge gate (D-02) and the preview step. `origin/main` moved ed57153 -> a5a36ee.
- **Superseded by user decision to deploy to production (2026-11-16):** the prohibition "MUST NOT push to or merge into main", the truth "production still answers /about 404 and /team/michael-desloover 200", and the Task 3 git checks "branch is not main" and "HEAD not an ancestor of origin/main". The inverse was verified instead: remote main = local HEAD, and production serves `/about` 200.
- **Matrix target:** the matrix ran against `https://european-resolve.org`, not a pages.dev preview.
- **Executor action:** none. Nothing was pushed, reverted or re-pushed.

**Total deviations:** 1 (user decision, no auto-fixes).
**Impact on plan:** The live evidence is now production evidence. The Phase 12 merge gate (D-02) is moot for this code.

## Issues Encountered

- The trailing-slash 404 on production (see the PRODUCTION ISSUE section).
- `www.` does not resolve (this predates the plan).

## Browser checks handed to end-of-phase UAT

Run these against https://european-resolve.org (production, not a preview):
1. Open `/#team` in a private window and press Back. It should land on `/about#team` with the Team heading visible, and Back should skip `/#team`. Opening `/#about` should land on `/about#mission` (LINK-03).
2. Open `/about#mission`, `/about#history` and `/about#team` at desktop width. Each heading should be fully visible below the fixed nav (ABOUT-02).
3. At 320px width, the nav row should fit on one line without wrapping (NAV-01). If it wraps, the backstop is the UI-SPEC CSS in Nav.module.css.
4. Open `/about/team/michael-desloover` at desktop width and at 375px. The breadcrumbs should read Home, About us, Michaël Desloover, and the photo top should sit at or above 112px from the top of the viewport (ABOUT-06).
5. Check the homepage hero ("More about us" link: paper colour, underlined, amber on hover) and the /about bands in light and dark mode (NAV-02, D-11).

## User Setup Required

None.

## Next Phase Readiness

- Phase 11 is live. Next steps: end-of-phase UAT (browser checks above), then `/gsd-plan-phase 11 --gaps` for the trailing-slash rules.
- Phase 12's merge-to-main premise (D-02) no longer holds and needs re-scoping.
- Still open: the STATE blocker on the exact printed card URL form. The `www.` and trailing-slash forms are both broken today.

---
*Phase: 11-about-section-mechanics-feature-branch*
*Completed: 2026-11-16*

## Self-Check: PASSED
- 11-04-SUMMARY.md exists; commit a5a36ee is an ancestor of HEAD; the matrix log has 26 ok lines and MATRIX_FAIL=0.
