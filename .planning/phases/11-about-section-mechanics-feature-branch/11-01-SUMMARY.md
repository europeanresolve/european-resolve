---
phase: 11-about-section-mechanics-feature-branch
plan: 01
subsystem: ui
tags: [nextjs, static-export, css-modules, vitest, about-page, redirects]

requires:
  - phase: 11-about-section-mechanics-feature-branch
    provides: CONTEXT.md final Mission/History copy, UI-SPEC layout contract
provides:
  - /about page (h1, #mission, #history, #team) with final copy and canonical metadata
  - Nav "About us" -> /about
  - Team cards link to /about/team/<slug>
  - Homepage hero mission teaser + "More about us" link; homepage #about/#team removed
  - LegacyHashRedirect client hop (/#team -> /about#team, /#about -> /about#mission)
  - Guards: em dash, teaser drift, internal legacy fragment link scan
affects: [11-02 profile route move, 11-03 redirects/sitemap, 11-04 preview verification]

actuals:
  tokens: 5280
  tasks: 3
  commits: 5
plan_head_before: 92dce93aa10bc005f10ad93234a8237c57af8224
plan_head_after: 379b6eee3365031220a5a0b1429447959e07dc86

tech-stack:
  added: []
  patterns:
    - "File-local BASE_URL + alternates.canonical for absolute canonicals"
    - "Source-scan guard test via node:fs readdirSync(recursive) in jsdom"
    - "Pure mapping function + thin useEffect for client-side hops (logic unit-tested, effect checked on preview)"

key-files:
  created:
    - src/app/about/page.tsx
    - src/app/about/page.module.css
    - src/components/ui/LegacyHashRedirect.tsx
    - src/__tests__/about.test.tsx
    - src/__tests__/legacy-links.test.ts
  modified:
    - src/components/layout/Nav.tsx
    - src/components/ui/MemberCard.tsx
    - src/app/page.tsx
    - src/app/page.module.css
    - src/__tests__/components.test.tsx

key-decisions:
  - "Legacy hop uses a Map lookup (not an object literal) so prototype-like hashes such as #constructor and #__proto__ return null"
  - "Task 3 RED commit carried a null-returning LegacyHashRedirect stub so RED failed on assertions, not on a missing import"

patterns-established:
  - "Copy strings with apostrophes go in {\"...\"} JSX expressions to satisfy react/no-unescaped-entities and keep straight U+0027"

requirements-completed: [ABOUT-01, ABOUT-02, ABOUT-05, NAV-01, NAV-02, LINK-03, SEO-01, QA-01]

coverage:
  - id: D1
    description: "/about renders h1 About us, sections mission/history/team in order, final copy verbatim, one h3 per member"
    requirement: ABOUT-01
    verification:
      - kind: unit
        ref: "src/__tests__/about.test.tsx#/about page"
        status: pass
    human_judgment: false
  - id: D2
    description: "/about metadata title, description and canonical https://european-resolve.org/about"
    requirement: SEO-01
    verification:
      - kind: unit
        ref: "src/__tests__/about.test.tsx#exports title, description and canonical metadata"
        status: pass
    human_judgment: false
  - id: D3
    description: "Nav shows About us -> /about and no Team item"
    requirement: NAV-01
    verification:
      - kind: unit
        ref: "src/__tests__/components.test.tsx#renders About us link"
        status: pass
    human_judgment: false
  - id: D4
    description: "Team cards link to /about/team/<slug>, distinct, in members order"
    requirement: ABOUT-05
    verification:
      - kind: unit
        ref: "src/__tests__/about.test.tsx#links every Team card to /about/team/<slug>, distinct, in members order"
        status: pass
      - kind: unit
        ref: "src/__tests__/components.test.tsx#links to /about/team/{slug}"
        status: pass
    human_judgment: false
  - id: D5
    description: "Homepage hero shows Mission lead teaser and More about us link; no #about/#team; teaser equals /about lead"
    requirement: NAV-02
    verification:
      - kind: unit
        ref: "src/__tests__/about.test.tsx#homepage"
        status: pass
    human_judgment: false
  - id: D6
    description: "legacyHashTarget maps exactly #team and #about, preserves query, rejects everything else"
    requirement: LINK-03
    verification:
      - kind: unit
        ref: "src/__tests__/legacy-links.test.ts#legacyHashTarget"
        status: pass
    human_judgment: false
  - id: D7
    description: "LegacyHashRedirect effect actually calls location.replace on / in a browser"
    requirement: LINK-03
    verification: []
    human_judgment: true
    rationale: "jsdom cannot spy on window.location.replace; the effect is checked on the Cloudflare preview in plan 11-04"
  - id: D8
    description: "Guards: em dash on / and /about text and metadata; internal /#team and /#about link scan (>=10 files)"
    requirement: QA-01
    verification:
      - kind: unit
        ref: "src/__tests__/legacy-links.test.ts#internal links"
        status: pass
      - kind: unit
        ref: "src/__tests__/about.test.tsx#contains no em dash in rendered text or metadata"
        status: pass
    human_judgment: false
  - id: D9
    description: "Visual layout of /about (scroll-margin-top under fixed nav, grid breakpoints, lead styling) and homepage hero link"
    requirement: ABOUT-02
    verification: []
    human_judgment: true
    rationale: "Visual and scroll behaviour needs a browser; checked on the Cloudflare preview in plan 11-04"

duration: 4min
completed: 2026-11-16
status: complete
---

# Phase 11 Plan 01: About section mechanics Summary

**New /about page (final Mission and History copy, Team grid, canonical metadata), nav "About us", Team cards at /about/team/<slug>, homepage mission teaser, and a Map-based location.replace hop for legacy /#team and /#about links, all guarded by tests.**

## Performance

- **Duration:** about 4 min (wall clock, measured)
- **Started:** 2026-11-16T06:17:16Z
- **Completed:** 2026-11-16T06:21Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- `/about` renders h1 "About us", then `#mission`, `#history`, `#team` with the CONTEXT.md copy verbatim; styles moved from the homepage with primitive tokens and `scroll-margin-top` (6rem, 6rem, 4rem).
- Nav and Team cards point at the new URLs; the homepage hero now carries the Mission lead and a "More about us" link, and its About and Team blocks are gone.
- `LegacyHashRedirect` sends `/#team` to `/about#team` and `/#about` to `/about#mission` with `location.replace`, keeping the query string.
- `npm test` now fails on em dashes on `/` and `/about`, teaser drift from the Mission lead, or any quoted `/#team` / `/#about` link in `src/` outside the hop component.

## Task Commits

1. **Task 1: /about page, styles, metadata, nav link (tracer)** - `81cf12a` (feat)
2. **Task 2: Team cards to /about/team/<slug> + legacy link scan** - `205d3b3` (test, RED), `5cdb2b9` (feat, GREEN)
3. **Task 3: Homepage teaser + legacy hash hop** - `cbe6a93` (test, RED), `379b6ee` (feat, GREEN)

No REFACTOR commits: nothing to clean up after GREEN.

## Files Created/Modified
- `src/app/about/page.tsx` - /about server component, metadata with canonical
- `src/app/about/page.module.css` - moved about/team/grid rules plus .pageTitle, .lead, .mission, .history
- `src/components/ui/LegacyHashRedirect.tsx` - `legacyHashTarget()` + client hop component
- `src/components/layout/Nav.tsx` - "About us" -> /about
- `src/components/ui/MemberCard.tsx` - href /about/team/<slug> (photo path unchanged)
- `src/app/page.tsx` - teaser, More about us link, hop mounted, sections removed
- `src/app/page.module.css` - moved rules deleted, `.moreLink` added
- `src/__tests__/about.test.tsx` - /about, homepage, metadata, em dash, drift guard
- `src/__tests__/legacy-links.test.ts` - src scan + legacyHashTarget cases
- `src/__tests__/components.test.tsx` - Nav and MemberCard assertions updated

## Decisions Made
- Map lookup for the hop so `#constructor` / `#__proto__` cannot hit inherited object keys (T-11-01).
- Homepage metadata kept unchanged, as UI-SPEC specifies.

## TDD Gate Compliance

- **Task 2 RED (`205d3b3`):** MemberCard and /about card-href tests failed on `toHaveAttribute` / `toEqual` (received `/team/<slug>`). Verified from console output only; the `tdd-red-evidence` classifier was not run for this task (see deviation 2).
- **Task 3 RED (`cbe6a93`):** classifier verdict `RED_EVIDENCE_OK` (`target_test_failed`) on `legacy-links.test.ts > legacyHashTarget > maps #team with search "" to /about#team`. Record: `.planning/phases/11-about-section-mechanics-feature-branch/.red/11-01-task3-red.json`. Semantic assessment: the target ran and failed on `toBe` (stub returned null); homepage tests also failed on `getByText` / `toBe` assertions; no import, syntax or fixture faults.
- **Mutation run (Task 2 Step 5):** with `<Link href="/#team">` put back in Nav.tsx, the scan failed with `AssertionError: expected [ 'components/layout/Nav.tsx' ] to deeply equal []`. After `git checkout -- src/components/layout/Nav.tsx` the diff was clean and the scan passed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Literal em dash in test source**
- **Found during:** Task 1
- **Issue:** the Write tool turned the `"—"` escape into a literal em dash in `about.test.tsx`, which the plan forbids.
- **Fix:** rewrote the line to the `"—"` escape sequence; perl scan confirms no U+2014 in either source file.
- **Files modified:** src/__tests__/about.test.tsx
- **Committed in:** 81cf12a

**2. [Rule 3 - Blocking] RED evidence tooling**
- **Found during:** Task 3 RED
- **Issue:** Vitest's TAP reporter writes Testing Library's multi-line DOM dump unindented, so the classifier rejected the combined run as malformed TAP. The classifier also wants the target name unescaped (`#`, not `\#`).
- **Fix:** classified a single-file run of `legacy-links.test.ts`, whose failure is a plain assertion. Task 2 RED was checked by console output only, before I applied the classifier step.
- **Files modified:** none (evidence record only)

**3. [Rule 3 - Blocking] Stub in Task 3 RED commit**
- **Found during:** Task 3 RED
- **Issue:** importing a module that does not exist yet fails on import, which counts as INVALID_RED.
- **Fix:** RED commit includes a null-returning `LegacyHashRedirect.tsx` stub, replaced in GREEN.
- **Committed in:** cbe6a93

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking). **Impact:** no scope change; all plan behaviours and acceptance criteria met.

## Issues Encountered
None beyond the deviations above.

## Verification
- `npm run lint && npm run typecheck && npm test`: exit 0, 10 files, 205 tests passed.
- Acceptance greps: scroll-margin-top = 3, hex colours in about CSS = 0, no `src/data/about.ts`, MemberCard `about/team/` = 1, `readdirSync` present, moved selectors in homepage CSS = 0, `moreLink` = 1, `window.location.replace` = 1, push-style navigation = 0.
- `npm run build` was not run in this plan; the static export is checked on the preview (11-04).

## Next Phase Readiness
Ready for 11-02 (profile route move to /about/team/[slug]). Until 11-02 lands, Team cards point at /about/team/<slug>, which has no route on this branch yet.

## Self-Check: PASSED
- All 5 created files found on disk.
- Commits 81cf12a, 205d3b3, 5cdb2b9, cbe6a93, 379b6ee are ancestors of HEAD; evaluation-scope resolves the plan commits.
