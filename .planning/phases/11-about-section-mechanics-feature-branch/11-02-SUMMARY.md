---
phase: 11-about-section-mechanics-feature-branch
plan: 02
subsystem: ui
tags: [nextjs, app-router, seo, sitemap, breadcrumbs, vitest]

requires:
  - phase: 11-01
    provides: MemberCard hrefs already point at /about/team/<slug>; /about page exists
provides:
  - Member profiles at /about/team/<slug> with Breadcrumbs Home > About us > name
  - Absolute canonical https://european-resolve.org/about/team/<slug> per member
  - src/app/team/ removed, so no /team/<slug> page is built (photos stay in public/team/)
  - Sitemap lists /about (6 entries), member pages stay unlisted
  - src/__tests__/profile.test.tsx (per-member render, metadata, em-dash, unknown slug, sitemap)
affects: [11-03 redirects for /team/<slug>, 11-04 preview visual check of card position]

actuals:
  tokens: 1564
  tasks: 2
  commits: 3
plan_head_before: b892fc2ea4bf61d3c58ba424cf2b49d522799d48
plan_head_after: d1ec9ba1bc3dbdb738f9d4daa75fd075f13d46d8

tech-stack:
  added: []
  patterns:
    - "File-local BASE_URL constant for absolute canonicals (same as events layout)"
    - "Async server page tested via render(await Page({ params: Promise.resolve({ slug }) }))"

key-files:
  created:
    - src/app/about/team/[slug]/page.module.css
    - src/__tests__/profile.test.tsx
  modified:
    - src/app/about/team/[slug]/page.tsx (moved from src/app/team/[slug]/page.tsx via git mv)
    - src/components/ui/BusinessCard.module.css
    - src/app/sitemap.ts

key-decisions:
  - "Profile route moved with git mv so history follows the file; src/app/team/ deleted entirely (D-01 Option B)"
  - "BusinessCard top padding 7rem -> 0.5rem since breadcrumbs now sit above the card (D-15); visual confirmation deferred to 11-04"
  - "page.module.css wraps its single .profile rule in @layer components, matching every other CSS module that uses layers"

patterns-established:
  - "Profile breadcrumbs: Home (/) > About us (/about) > member.name (aria-current)"

requirements-completed: [ABOUT-06, SEO-01, SEO-02, QA-01]

coverage:
  - id: D1
    description: "All 7 profiles render at /about/team/<slug> with 3-item breadcrumbs, h1 name and QR svg"
    requirement: ABOUT-06
    verification:
      - kind: unit
        ref: "src/__tests__/profile.test.tsx#profile page > %s renders breadcrumbs, heading and QR"
        status: pass
    human_judgment: false
  - id: D2
    description: "Profile metadata keeps title/description and adds absolute canonical"
    requirement: SEO-01
    verification:
      - kind: unit
        ref: "src/__tests__/profile.test.tsx#profile page > %s metadata has title, description and absolute canonical"
        status: pass
    human_judgment: false
  - id: D3
    description: "Sitemap lists /about once, 6 unique URLs, none containing /team"
    requirement: SEO-02
    verification:
      - kind: unit
        ref: "src/__tests__/profile.test.tsx#sitemap"
        status: pass
    human_judgment: false
  - id: D4
    description: "No em dash in profile text, title or description"
    requirement: QA-01
    verification:
      - kind: unit
        ref: "src/__tests__/profile.test.tsx#profile page (EM_DASH assertions)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Unknown slug: empty metadata and notFound; generateStaticParams returns the 7 slugs"
    requirement: ABOUT-06
    verification:
      - kind: unit
        ref: "src/__tests__/profile.test.tsx#unknown slug yields empty metadata and notFound"
        status: pass
    human_judgment: false
  - id: D6
    description: "Card photo top sits at or above 112px with breadcrumbs above it"
    verification: []
    human_judgment: true
    rationale: "Pixel position needs a real browser on the Cloudflare preview; scheduled in plan 11-04"

duration: 4min
completed: 2026-11-16
status: complete
---

# Phase 11 Plan 02: Profiles under /about/team Summary

**Member profiles moved to /about/team/<slug> with Home > About us > name breadcrumbs and an absolute canonical; sitemap gains /about while member pages stay unlisted.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-11-16T06:23:41Z
- **Completed:** 2026-11-16T06:27:24Z
- **Tasks:** 2
- **Files modified:** 5 (plus 1 removed by the move)

## Accomplishments
- `src/app/team/[slug]/page.tsx` moved with `git mv` to `src/app/about/team/[slug]/page.tsx`; `src/app/team/` is gone
- Breadcrumbs wrapper (`.profile`, padding-top 4.0625rem) above the unchanged BusinessCard and QR
- `alternates.canonical` = `https://european-resolve.org/about/team/<slug>`
- Sitemap: `/about` added after root with priority 0.8; still no profile URLs
- New `profile.test.tsx`: 19 tests; full suite 224/224 green, lint and typecheck clean

## Task Commits

1. **Task 1: End-to-end profile at /about/team/<slug>** - `c7ce131` (feat)
2. **Task 2: Sitemap lists /about** - `19fc6ff` (test, RED), `d1ec9ba` (feat, GREEN)

## TDD Gate Compliance

- RED: `19fc6ff` test(11-02). Evidence `.planning/phases/11-about-section-mechanics-feature-branch/.red/11-02-task2-red.json`, classifier verdict `RED_EVIDENCE_OK` (target `sitemap > lists /about exactly once`, 2 failing of 19). Semantic assessment: target ran and failed on the planned assertion (no /about entry, 5 URLs); the `/team` guard passes by design since it protects an existing invariant.
- GREEN: `d1ec9ba` feat(11-02), 19/19 pass.
- REFACTOR: none needed.

## Files Created/Modified
- `src/app/about/team/[slug]/page.tsx` - moved profile route, Breadcrumbs, canonical
- `src/app/about/team/[slug]/page.module.css` - `.profile` nav clearance
- `src/components/ui/BusinessCard.module.css` - `.card` padding-top 7rem -> 0.5rem
- `src/app/sitemap.ts` - `/about` entry
- `src/__tests__/profile.test.tsx` - profile and sitemap tests

## Decisions Made
See key-decisions. Otherwise followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written. (Minor: `.profile` is wrapped in `@layer components` per the project CSS layer convention; still one rule.)

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Old `/team/<slug>` URLs now 404 until 11-03 adds the 301s in `public/_redirects` (printed cards and email signatures link there). Nothing is pushed or merged, so production is unaffected (D-02).
- Card position visual check pending in 11-04.

---
*Phase: 11-about-section-mechanics-feature-branch*
*Completed: 2026-11-16*

## Self-Check: PASSED
