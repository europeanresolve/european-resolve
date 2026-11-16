---
phase: 11-about-section-mechanics-feature-branch
verified: 2026-11-16T11:10:00Z
status: passed
score: 12/12 must-haves verified
covered_files:
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-01-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-01-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-02-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-02-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-03-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-03-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-04-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-04-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-05-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-05-SUMMARY.md"
  - "public/_redirects"
  - "src/__tests__/about.test.tsx"
  - "src/__tests__/components.test.tsx"
  - "src/__tests__/legacy-links.test.ts"
  - "src/__tests__/nav-css.test.ts"
  - "src/__tests__/profile.test.tsx"
  - "src/__tests__/redirects.test.ts"
  - "src/app/about/page.module.css"
  - "src/app/about/page.tsx"
  - "src/app/about/team/[slug]/page.module.css"
  - "src/app/about/team/[slug]/page.tsx"
  - "src/app/page.module.css"
  - "src/app/page.tsx"
  - "src/app/sitemap.ts"
  - "src/components/layout/Nav.module.css"
  - "src/components/layout/Nav.tsx"
  - "src/components/ui/BusinessCard.module.css"
  - "src/components/ui/LegacyHashRedirect.tsx"
  - "src/components/ui/MemberCard.tsx"
covered_digest: "v4:sha256:028e9d05efa0ca31c980e97ac7bfdd22a3832d4f3a47f3cc42a9536dbd0a2b58"
behavior_unverified: 0
overrides_applied: 1
overrides:
  - must_have: "On the preview deploy ... main and european-resolve.org are untouched at phase end (ROADMAP goal clauses + SC5 second half; 11-04 truth 'At phase end european-resolve.org still answers /about with 404 ... HEAD is not an ancestor of origin/main'; 11-04 prohibition 'MUST NOT push to or merge into main')"
    reason: "User explicitly decided (confirmed twice) to push phase 11 to origin/main and deploy to production instead of a preview. The substantive goal (About section usable, every legacy team URL lands right) was verified against https://european-resolve.org instead of a preview URL."
    accepted_by: "Serhiy Onyshchenko"
    accepted_at: "2026-11-16T08:30:00Z"
re_verification:
  previous_status: gaps_found
  previous_score: 8/12
  gaps_closed:
    - "Nav row fits without wrapping at 320px (header 97px -> 58.6px, breadcrumbs clear the header); closed by gap plan 11-05 (ac85444, 37263d0, 3ace45f)"
  gaps_remaining: []
  regressions: []
  behavior_unverified_resolved:
    - "Anchor headings below the fixed nav (/about#mission|#history|#team): measured in headless Chromium on production at 1280, 375 and 320px"
    - "/#team and /#about hash hop, Back does not return to the legacy entry: observed in headless Chromium on production"
    - "Hover colour and light/dark parity: computed styles observed in headless Chromium on production; the site has no active dark theme"
deviations_accepted:
  - "Nav wordmark is 1rem at max-width 22.5rem, not UI-SPEC E1's 1.125rem: 1.125rem measured a 90.6px header at 320px, 1rem gives 58.6px. Backed by measurements, recorded as an accepted deviation, not a gap."
advisory_open:
  - finding: "Homepage 'More about us' link sits about 56px left of centre at 1280px (hero text is centred, link is not)"
    category: other
    reason: "Raised in 11-UI-REVIEW.md as a warning; reconfirmed in my own dark/light screenshot. Cosmetic, does not affect any success criterion. Likely a base `p` max-width without auto margins."
    evidence_status: "screenshot + 11-UI-REVIEW.md"
  - finding: "11-REVIEW.md WR-01 (redirect guard checks member -> rule only, not rule -> member) and WR-02 (unknown-slug profile test survives deleting notFound())"
    category: other
    reason: "Test-strength warnings, tracked in 11-REVIEW-DISPOSITION.md; behaviour is correct today"
    evidence_status: "11-REVIEW.md"
---

# Phase 11: About section mechanics (feature branch) Verification Report

**Phase Goal:** On a Cloudflare preview deploy of the feature branch, a visitor can use the complete About Us section (interim copy allowed) and every legacy team URL lands in the right place. Nothing is merged to `main`; production is unchanged at phase end.
**Verified:** 2026-11-16T11:10:00Z
**Status:** passed
**Re-verification:** Yes, after gap closure plan 11-05

## Context: superseded goal clauses (user decision, not an executor error)

The user explicitly decided (confirmed twice, then again for the trailing-slash hotfix and the nav fix) to push phase 11 to `origin/main` and deploy to production instead of a preview. The clauses "on a Cloudflare preview deploy" and "nothing merged to main / production unchanged" are SUPERSEDED BY USER DECISION and carried as the override above. State checked now: `origin/main` = `37263d0`, local HEAD = `3ace45f`; `git diff origin/main HEAD -- src public` is empty, so production serves exactly the source in this worktree (HEAD differs only by `.planning/` docs). The substantive goal was verified against https://european-resolve.org.

Knock-on effect (unchanged from the previous report): Phase 12 SC4 ("route move, `_redirects`, nav change and final copy go live in the same production deploy") can no longer hold as written, because the route move is already live.

## Re-verification summary

| Item | Previous | Now | Evidence |
|------|----------|-----|----------|
| Gap: nav 96-97px at 320px, covers profile breadcrumbs | FAILED | VERIFIED | `Nav.module.css` now has `white-space: nowrap` and the 22.5rem media block; my own run of `11-05-measure-nav.mjs` against production: 38 PASS, 0 FAIL, exit 0 |
| Anchor headings below nav | behavior-unverified | VERIFIED | Playwright on production |
| `/#team`, `/#about` hop and Back | behavior-unverified | VERIFIED | Playwright on production |
| Hover and light/dark parity | behavior-unverified | VERIFIED | Playwright computed styles on production |
| All other previously VERIFIED truths | VERIFIED | VERIFIED (regression check) | curl matrix, `npm test`, git diff stat |

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | `/about` shows Mission, History and Team in that order (SC1, ABOUT-01) | VERIFIED | `src/app/about/page.tsx` renders h1, `#mission`, `#history`, `#team` in order; unchanged since the previous verification (git diff 54d2d13..HEAD touches only `Nav.module.css` and `nav-css.test.ts` in `src/`). Live `/about` 200. Playwright found `#mission`, `#history`, `#team` each with an h2 at all three widths. No placeholder/interim/lorem strings in the file. |
| 2 | Jumping to `#mission`/`#history`/`#team` keeps the heading visible below the fixed nav (SC1, ABOUT-02) | VERIFIED | Playwright on production, h2 top vs header bottom: 1280px header 65, h2 tops 95.6 / 96.0 / 160.1; 375px header 65, h2 tops 96.2 / 96.3 / 159.8; 320px header 58.6, h2 tops 96.2 / 95.5 / 160.1. Every h2 is at least 30px below the header. |
| 3 | Nav "About us" to `/about`, no "Team"; homepage teaser to `/about`, no About/Team blocks; cards open `/about/team/<slug>`; card and QR unchanged; breadcrumbs Home > About us > Name (SC2, NAV-01, NAV-02, ABOUT-05, ABOUT-06) | VERIFIED | `Nav.tsx` untouched by 11-05 (git diff). Live screenshot shows nav "About us", "Events" and the hero teaser with "More about us". All 7 `/about/team/<slug>` return 200 on production. At 320px the breadcrumb top is 6.4px below the header bottom, photo top 110.0px (Playwright, production). |
| 4 | `/team/<slug>` 301 to `/about/team/<slug>` for all 7, `/team` and `/team/` 301 to `/about#team`, `/team/<slug>.png` 200 with no redirect (SC3 first half, LINK-01, LINK-02, LINK-04) | VERIFIED | My curl against production, re-run now: 7 slugs x 2 forms (with and without trailing slash) all 301 to the matching `/about/team/<slug>`; `/team` and `/team/` 301 `https://european-resolve.org/about#team`; 7 photos 200, empty redirect_url; 7 profiles 200; `/r4u/test` still 301 to `/events/2026-run-for-ukraine/fundraise/test`. |
| 5 | Opening `/#team` lands on `/about#team` and Back skips `/#team`; `/#about` to `/about#mission` (SC3 second half, LINK-03) | VERIFIED | Playwright on production in a fresh context starting at `about:blank`: `/#team` ended at `https://european-resolve.org/about#team`, `/#about` ended at `https://european-resolve.org/about#mission`; `history.length` went 1 -> 2 (the legacy entry was replaced, not stacked); `goBack()` returned to `about:blank`, not to `/#team` or `/#about`. Target heading visible (h2 top 160.1 and 95.6 vs header 65). Chromium only; Safari/Firefox not exercised. |
| 6 | `/about` and each profile have title, description, canonical at the new address; sitemap lists `/about`, no member pages (SC4, SEO-01, SEO-02) | VERIFIED | Production `/about` canonical `https://european-resolve.org/about`. Production sitemap.xml: 6 locs (`/`, `/about`, three event URLs, `/privacy`), none containing `/team`. Profile metadata verified in the previous run and the source is unchanged. |
| 7 | `npm test` fails on missing member rule, `/team` splat, missing 301, internal `/#team` link, em dash in About copy (SC5 first half, QA-01) | VERIFIED | I ran lint (exit 0), typecheck (exit 0) and `npm test` once: 13 files, 240/240 pass (adds `nav-css.test.ts`). Guards `redirects.test.ts`, `legacy-links.test.ts`, `about.test.tsx`, `profile.test.tsx` unchanged. No em dash in `about/page.tsx` or `page.tsx` (grep 0). |
| 8 | Preview deploy only; `main` and european-resolve.org untouched at phase end | PASSED (override) | Override: user decision to deploy to production, accepted by Serhiy Onyshchenko on 2026-11-16 (carried forward unchanged). `origin/main` = `37263d0` is live. |
| 9 | Nav fits without wrapping at 320px; header at most 65px; profile breadcrumbs not covered (11-04 backstop, 11-05 truths, ABOUT-06) | VERIFIED | `src/components/layout/Nav.module.css`: `.links a { white-space: nowrap }` (L49) and `@media (max-width: 22.5rem) { .links { gap: 1rem } .wordmark { font-size: 1rem } }` (L57-66); base rules (gap 2rem, wordmark 1.25rem) unchanged; diff is 12 additions, 0 deletions. My run of `11-05-measure-nav.mjs` against production (headless Chromium, Playwright from the npx cache, nothing installed): 38 PASS, 0 FAIL. At 320px header 58.6px on `/`, `/about`, `/about/team/michael-desloover`; scroll-width 320.0 (no horizontal overflow); breadcrumb 6.4px below header bottom; photo top 110.0. At 375px and 1280px the header stays 65px (the media query does not leak). `.profile` clearance still `4.0625rem` (page.module.css L3). `nav-css.test.ts` guard passes in `npm test`. |
| 10 | BusinessCard photo top at or above 112px at desktop, 375px and 320px (11-04 backstop E6) | VERIFIED | Same script, production: photo-top 110.0 at 320px and 1280px (375px reported 110 in the previous run and the profile CSS is unchanged). |
| 11 | Homepage "More about us" is an underlined paper link turning amber on hover; /about bands match the old homepage sections in light and dark mode (11-04 backstop, NAV-02, D-11) | VERIFIED | Playwright on production, 1280px: link colour `rgb(245, 242, 235)` (paper), `text-decoration-line: underline`, hover colour `rgb(212, 160, 18)` (amber), identical under `colorScheme: light` and `dark`. `/about` computed styles: body paper `rgb(245,242,235)`, mission/history h2 `rgb(10,22,40)` on paper, team band background `rgb(10,22,40)` with paper h2; identical in light and dark emulation. Source comparison: the old homepage `.about`/`.team` (commit `379b6ee^`) used `#f5f2eb` / `#0a1628`; the new `about/page.module.css` uses `--color-paper` / `--color-black` (same values). Why dark is identical: `src/app/layout.tsx:32` hard-codes `data-theme="light"`, and `tokens.css` only applies the dark media block to `:root:not([data-theme="light"])`, so the site has no active dark theme. Visual check by me on the dark-emulated homepage screenshot. |
| 12 | Local gate: lint, typecheck, full tests, static build with correct artifacts (11-04 truth 1) | VERIFIED | Lint, typecheck, `npm test` re-run at HEAD: all pass, 240/240. Build not re-run locally (rewrites `next-env.d.ts`); Cloudflare built `37263d0` from identical source and serves every expected artifact (truths 4, 6, 9). |

**Score:** 12/12 truths verified (0 behavior-unverified, 0 failed; 1 of the 12 is PASSED by override)

### Plan 11-05 must-haves

| Must-have | Status | Evidence |
|-----------|--------|----------|
| Nav.module.css nowrap + 22.5rem block (gap 1rem, wordmark 1rem), base rules unchanged | VERIFIED | file read, L25-66 |
| Header <= 65px at 320px on `/`, `/about`, profile (local export and production) | VERIFIED | 58.6px; production re-run by me; local export numbers from 11-05-SUMMARY (not re-run locally) |
| Breadcrumb top at or below header bottom at 320px | VERIFIED | +6.4px |
| No horizontal scroll at 320/360/375/1280; header 65px at 375/1280 | VERIFIED | script output, scroll-width PASS |
| `Nav.tsx` and `.profile` clearance untouched | VERIFIED | `git diff 54d2d13 HEAD -- src` lists only `Nav.module.css` and `nav-css.test.ts` |
| vitest guard for the backstop CSS | VERIFIED | `src/__tests__/nav-css.test.ts` (77 lines), passes; RED run against the pre-fix stylesheet recorded in 11-05-SUMMARY |
| Production re-measure exits 0 | VERIFIED | my run, exit 0 |

### Accepted deviation

The wordmark is 1rem at max-width 22.5rem instead of UI-SPEC E1's 1.125rem. 11-05 measured 1.125rem at a 90.6px header (content 276.1px vs 272px box) and 1rem at 58.6px with 13px of slack. I reproduced the 58.6px result on production. Accepted as a measured deviation, not a gap.

### Prohibitions (judgment tier, non-authoritative LLM verdicts)

| Source | Prohibition | Verdict | Flag |
|--------|-------------|---------|------|
| 11-01 | MUST NOT ship placeholder, interim, paraphrased or American-spelled About copy | Holds: grep for lorem/placeholder/interim/TBD in `about/page.tsx` finds nothing; copy matches CONTEXT final strings per UI-REVIEW copywriting 4/4 | unverified-prohibition, human review recommended |
| 11-03 | MUST NOT delete or repoint away a legacy `/team/<slug>` rule when a member leaves | Holds today (7 slugs x 2 forms live, curl above). Forward-looking and only half-guarded (WR-01: guard iterates `members`, so deleting a member and its rule passes `npm test`) | unverified-prohibition, human review recommended |
| 11-04 | MUST NOT push to or merge into main in Phase 11 | Violated by explicit user decision | Covered by override |

The status is `passed` on the reading that judgment-tier flags are non-blocking ("complete with 2 flagged prohibitions"); they are listed here so they are not silently absorbed. If the orchestrator treats flagged prohibitions as blocking, this phase becomes `human_needed` for those two items only.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/app/about/page.tsx` | /about page, metadata, canonical | VERIFIED | live 200, unchanged |
| `src/app/about/page.module.css` | moved rules + scroll-margin-top | VERIFIED | h2 positions measured in browser |
| `src/components/ui/LegacyHashRedirect.tsx` | client hop | VERIFIED | behaviour observed in browser; mounted in `src/app/page.tsx` L15 |
| `src/app/about/team/[slug]/page.tsx` | profile + breadcrumbs + canonical | VERIFIED | 7 live 200 |
| `src/app/about/team/[slug]/page.module.css` | `.profile` nav clearance | VERIFIED | 4.0625rem; nav now never exceeds 65px, so it holds (no token needed) |
| `src/app/sitemap.ts` | /about, no /team | VERIFIED | live sitemap |
| `public/_redirects` | legacy team 301s + /r4u | VERIFIED | curl matrix |
| `src/components/layout/Nav.module.css` | 320px backstop fix | VERIFIED | applied, measured |
| `src/__tests__/nav-css.test.ts` | source guard | VERIFIED | passes |
| `src/__tests__/{about,profile,redirects,legacy-links}.test.*` | guards | VERIFIED | pass |
| `11-05-measure-nav.mjs` | Playwright measurement | VERIFIED | runs, exit 0 on production |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| Nav.tsx | /about | `href="/about"` (live HTML shows nav "About us") | WIRED |
| MemberCard.tsx | /about grid | `/about/team/${slug}`, 7 profiles 200 | WIRED |
| page.tsx (home) | LegacyHashRedirect | mounted, behaviour observed | WIRED |
| about/team/[slug]/page.tsx | Breadcrumbs | breadcrumb row observed below header at 320px | WIRED |
| Nav.module.css | Nav.tsx | `.wordmark`, `.links` class names; media block overrides observed in browser | WIRED |
| Nav.module.css | `.profile` 4.0625rem | header 58.6/65px stays under 65px clearance | WIRED |
| nav-css.test.ts | Nav.module.css | readFileSync | WIRED |
| redirects.test.ts | public/_redirects, members.ts | readFileSync + members loop | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Real data | Status |
|----------|------|--------|-----------|--------|
| /about Team grid | `members` | static typed array `src/data/members.ts` | 7 profiles live | FLOWING |
| Profile page | `member`, `qrSvg` | members + `generateQRSvg` at build | live 200 with photo; unchanged | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Nav single row at 320px, breadcrumb clearance, no overflow | `11-05-measure-nav.mjs` with `BASE_URL=https://european-resolve.org` | 38 PASS, 0 FAIL, exit 0 | PASS |
| Anchor h2 below header, 3 anchors x 3 widths | Playwright (scratch script) on production | 9/9 PASS | PASS |
| `/#team`, `/#about` hop and Back | Playwright on production | final URLs correct, Back returns to `about:blank` | PASS |
| Link hover colour, light/dark computed styles | Playwright on production | amber on hover, identical in both schemes | PASS |
| Legacy 301 matrix, photos, sitemap, canonical, /r4u | `curl` on production | all as expected | PASS |
| Guard suite | `npm test` (once) | 13 files, 240/240 | PASS |

### Probe Execution

Not applicable: no `scripts/*/tests/probe-*.sh` declared or present for this phase.

### Requirements Coverage

All 13 phase IDs are claimed by plans (01: ABOUT-01/02/05, NAV-01/02, LINK-03, SEO-01, QA-01; 02: ABOUT-06, SEO-01/02, QA-01; 03: LINK-01/02/04, QA-01; 05: ABOUT-06, NAV-01) and all 13 are mapped to Phase 11 in REQUIREMENTS.md. No orphans.

| Requirement | Plan | Status | Evidence |
| ----------- | ---- | ------ | -------- |
| ABOUT-01 | 01 | SATISFIED | truth 1 |
| ABOUT-02 | 01, 04 | SATISFIED | truth 2, browser-measured |
| ABOUT-05 | 01 | SATISFIED | 7 profile links live |
| ABOUT-06 | 02, 04, 05 | SATISFIED | truths 3, 9: breadcrumbs clear of header at 320px (+6.4px) and wider |
| NAV-01 | 01, 05 | SATISFIED | nav "About us" live; single row at 320px |
| NAV-02 | 01 | SATISFIED | teaser live, colours and hover observed |
| LINK-01 | 03 | SATISFIED | curl, 7 slugs both forms |
| LINK-02 | 03 | SATISFIED | curl |
| LINK-03 | 01 | SATISFIED | truth 5, browser-observed |
| LINK-04 | 03 | SATISFIED | curl, 7 photos 200 |
| SEO-01 | 01, 02 | SATISFIED | canonicals |
| SEO-02 | 02 | SATISFIED | live sitemap |
| QA-01 | 01, 02, 03 | SATISFIED | guards pass (strength caveats WR-01/WR-02, advisory) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `Nav.module.css`, `nav-css.test.ts` (and earlier phase files) | - | TBD/FIXME/XXX/TODO/HACK | none found | - |
| `src/app/page.tsx` / `page.module.css` | 24-28 | "More about us" `<p>` not centred (about 56px left of centre at 1280px) | Warning (cosmetic) | UI-REVIEW warning, still open; no success criterion affected |
| `src/__tests__/redirects.test.ts` | 22 | one-way member to rule check (WR-01) | Warning | departed-member rule deletion passes tests; tracked in 11-REVIEW-DISPOSITION.md |
| `src/__tests__/profile.test.tsx` | - | unknown-slug test survives deleting `notFound()` (WR-02) | Warning | weak guard; route correct today |
| `src/app/page.module.css` | 23, 33, 56 | hex literals beside tokens | Info | no visual impact |
| home metadata | - | description keeps copy no longer on the page (IN-02) | Info | SEO text drift |

Advisory reviews factored in: 11-VALIDATION.md (nyquist_compliant true), 11-SECURITY.md (SECURED, 0 open), 11-UI-REVIEW.md (19/24; its nav-wrap blocker is now fixed), 11-REVIEW.md (0 critical, WR-01/WR-02, 6 info; advisory).

### Human Verification Required

None. The three browser-only items of the previous report were exercised in headless Chromium against production and are resolved above. Limits to know: Chromium only (no Safari/Firefox), 1280/375/320px viewports only, and "visual parity" was established from computed styles, source-value comparison and one screenshot, not a pixel diff against the retired homepage.

### Gaps Summary

No gaps. The one prior gap (nav wrapping to about 97px at 320px and covering profile breadcrumbs) is closed: the planned CSS is applied (with the 1rem wordmark deviation, accepted on measurements), and I reproduced the production measurement myself (38/38 PASS, header 58.6px, breadcrumb 6.4px clear, no overflow, 65px at wider widths). All prior VERIFIED truths were regression-checked (curl matrix, sitemap, canonical, `npm test` 240/240, source diff limited to `Nav.module.css` plus its guard test). Open advisories only: the off-centre "More about us" link, WR-01/WR-02 test strength, and the two flagged judgment-tier prohibitions.

---

_Verified: 2026-11-16T11:10:00Z_
_Verifier: Claude (gsd-verifier)_
