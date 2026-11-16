---
phase: 11-about-section-mechanics-feature-branch
verified: 2026-11-16T08:59:08Z
status: gaps_found
score: 8/12 must-haves verified
covered_files:
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-01-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-01-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-02-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-02-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-03-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-03-SUMMARY.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-04-PLAN.md"
  - ".planning/phases/11-about-section-mechanics-feature-branch/11-04-SUMMARY.md"
  - "public/_redirects"
  - "src/__tests__/about.test.tsx"
  - "src/__tests__/components.test.tsx"
  - "src/__tests__/legacy-links.test.ts"
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
covered_digest: "v4:sha256:f5fb237e42649924f45e326945986c2d625e41e2feb5abd947ccefce159f08e7"
behavior_unverified: 3
overrides_applied: 1
overrides:
  - must_have: "On the preview deploy ... main and european-resolve.org are untouched at phase end (ROADMAP goal clauses + SC5 second half; 11-04 truth 'At phase end european-resolve.org still answers /about with 404 ... HEAD is not an ancestor of origin/main'; 11-04 prohibition 'MUST NOT push to or merge into main')"
    reason: "User explicitly decided (confirmed twice) to push phase 11 to origin/main and deploy to production instead of a preview. The substantive goal (About section usable, every legacy team URL lands right) was verified against https://european-resolve.org instead of a preview URL."
    accepted_by: "Serhiy Onyshchenko"
    accepted_at: "2026-11-16T08:30:00Z"
gaps:
  - truth: "Nav row fits without wrapping \"About us\" at 320px width; if it wraps or overflows, apply `.links a { white-space: nowrap; }` plus `@media (max-width: 22.5rem) { .links { gap: 1rem; } .wordmark { font-size: 1.125rem; } }` in Nav.module.css (11-04 backstop; affects ABOUT-06 breadcrumbs)"
    status: failed
    reason: "Measured live on production (11-UI-REVIEW.md backstop 1): at 320x700 the fixed nav is 96px tall on /, /about and /about/team/<slug>; wordmark and 'About us' each wrap to 2 lines. Profile pages clear only 4.0625rem (65px), so the nav covers the breadcrumb row Home > About us > Name. The fix written into the plan was never applied: Nav.module.css has no white-space: nowrap and no 22.5rem media query."
    artifacts:
      - path: "src/components/layout/Nav.module.css"
        issue: "No `.links a { white-space: nowrap }`, no `@media (max-width: 22.5rem)` gap/wordmark rule"
      - path: "src/app/about/team/[slug]/page.module.css"
        issue: "Hard-coded padding-top: 4.0625rem assumes a 65px nav; breaks whenever the nav grows (UI-REVIEW warning 2, REVIEW IN-04)"
    missing:
      - "Apply the planned backstop CSS in src/components/layout/Nav.module.css"
      - "Re-measure at 320px: nav height <= 65px and profile breadcrumbs fully visible"
      - "Optional hardening: a --nav-height token used by .profile and .eventRoot"
behavior_unverified_items:
  - truth: "Jumping to /about#mission, /about#history, /about#team leaves the section heading fully visible below the fixed nav (ROADMAP SC1, ABOUT-02; 11-04 backstop)"
    test: "On https://european-resolve.org open /about#mission, /about#history and /about#team at desktop and 375px widths (and 320px after the nav fix)"
    expected: "Each h2 sits fully below the fixed nav, not under it"
    why_human: "scroll-margin-top values (6rem, 6rem, 4rem) are present in CSS; actual scroll position is a browser layout outcome no test exercises"
  - truth: "Opening /#team lands on /about#team and Back skips the /#team entry; /#about lands on /about#mission (ROADMAP SC3 second half, LINK-03; 11-04 backstop)"
    test: "In a fresh tab, open https://european-resolve.org/#team, then press Back; repeat with /#about"
    expected: "Lands on /about#team with the Team heading visible; Back returns to the previous page, not /#team. /#about lands on /about#mission"
    why_human: "Unit tests prove location.replace is called with /about#team and /about#mission; that replace drops the history entry is browser history behaviour curl and jsdom cannot observe"
  - truth: "Homepage hero shows the Mission lead and an underlined paper-coloured 'More about us' link that turns amber on hover; /about paper and black bands look like the old homepage About/Team sections in light and dark mode (NAV-02, D-11; 11-04 backstop)"
    test: "View / and /about on production in light and dark mode; hover 'More about us'"
    expected: "Underlined paper link turning amber on hover; band colours match the previous homepage sections in both themes"
    why_human: "Visual appearance and theme rendering; UI-REVIEW captured light screenshots only, dark mode not checked"
---

# Phase 11: About section mechanics (feature branch) Verification Report

**Phase Goal:** On a Cloudflare preview deploy of the feature branch, a visitor can use the complete About Us section (interim copy allowed) and every legacy team URL lands in the right place. Nothing is merged to `main`; production is unchanged at phase end.
**Verified:** 2026-11-16T08:59:08Z
**Status:** gaps_found
**Re-verification:** No, initial verification

## Context: superseded goal clauses (user decision, not an executor error)

The user explicitly decided (confirmed twice, 2026-11-16) to push phase 11 to `origin/main` and deploy to production. The clauses "on a Cloudflare preview deploy" and "nothing merged to main / production unchanged" are superseded and recorded as an override above. Evidence: `origin/main` = `8c5259c` (contains a5a36ee plus the trailing-slash hotfix); local HEAD differs from `origin/main` only by `.planning/` docs and one test file (`src/__tests__/about.test.tsx`, Nyquist tests from 482eabf). The substantive goal was verified against https://european-resolve.org with my own curl runs.

Knock-on effects to record: Phase 12 SC4 ("route move, `_redirects`, nav change and final copy go live in the same production deploy") can no longer hold as written; the route move is already live. STATE.md lines 80 and 91 still call the trailing-slash 404 an open gap, but 8c5259c fixed it (verified below).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/about` shows Mission, History and Team in that order (SC1, ABOUT-01) | VERIFIED | `src/app/about/page.tsx` renders h1, `#mission`, `#history`, `#team` in order. Production HTML: ids appear in order mission, history, team; title "About us \| European Resolve". Final CONTEXT copy, not interim. |
| 2 | Jumping to `#mission`/`#history`/`#team` keeps the heading visible below the fixed nav (SC1, ABOUT-02) | PRESENT_BEHAVIOR_UNVERIFIED | `page.module.css`: scroll-margin-top 6rem (L26, L31), 4rem on #team (L74, inside a 6rem padded band). Browser scroll position never observed. See human items. |
| 3 | Nav "About us" to `/about`, no "Team"; homepage teaser to `/about` with no About/Team blocks; cards open `/about/team/<slug>` with card and QR unchanged and breadcrumbs Home > About us > Name (SC2, NAV-01, NAV-02, ABOUT-05, ABOUT-06) | VERIFIED | `Nav.tsx` L12-13 (About us, Events only). Production `/`: `href="/about">About us`, `href="/about">More about us`, no `id="about"`/`id="team"`. `/about` has 7 distinct `/about/team/<slug>` hrefs. Profile HTML: `nav aria-label="Breadcrumb"`, Home `/`, About us `/about`, `aria-current="page"` name, QR svg, `/team/<slug>.png` photo. BusinessCard markup untouched; only its top padding moved into `.profile` (photo top 110px, measured). |
| 4 | `curl` shows `/team/<slug>` 301 to `/about/team/<slug>` for all 7, `/team` and `/team/` 301 to `/about#team`, `/team/<slug>.png` 200 with no redirect (SC3 first half, LINK-01, LINK-02, LINK-04) | VERIFIED | My curl against production: all 7 `/team/<slug>` 301 to the right `/about/team/<slug>`; all 7 `/team/<slug>/` 301 (hotfix 8c5259c live); `/team`, `/team/` 301 `/about#team`; 7 photos 200 with empty redirect_url; all 7 `/about/team/<slug>` 200; `/team/michael-desloover/` reaches 200 in 1 hop; `/r4u/test` still 301 to fundraise/test. |
| 5 | Opening `/#team` lands on `/about#team` and Back skips `/#team`; `/#about` to `/about#mission` (SC3 second half, LINK-03) | PRESENT_BEHAVIOR_UNVERIFIED | `LegacyHashRedirect.tsx` uses `window.location.replace`; mounted only in `src/app/page.tsx`. `about.test.tsx` L134-165 asserts replace is called once with the right target and not for other hashes. Real-browser history behaviour not observed. |
| 6 | `/about` and each profile have title, description, canonical at the new address; sitemap lists `/about`, no member pages (SC4, SEO-01, SEO-02) | VERIFIED | Production `/about` canonical `https://european-resolve.org/about`; profile canonical `.../about/team/olena-kuzhym`, title "Olena Kuzhym \| European Resolve". Production sitemap.xml: 6 locs, `/about` once, nothing containing `/team`. |
| 7 | `npm test` fails on missing member rule, `/team` splat, missing 301, internal `/#team` link, em dash in About copy/metadata (SC5 first half, QA-01) | VERIFIED | I ran `npm test`: 12 files, 237/237 pass. Guards: `redirects.test.ts` (per-member slash and no-slash rules, 301 on every rule, no splat/placeholder/.png source, no self-redirect, same-origin, unique sources, >=10 rules), `legacy-links.test.ts` (quoted `/#team`/`/#about` scan), em-dash checks in `about.test.tsx` L89/L122 and `profile.test.tsx`. Lint and typecheck exit 0. |
| 8 | Preview deploy only; `main` and european-resolve.org untouched at phase end (goal clauses, SC5 second half, 11-04 truth 3) | PASSED (override) | Override: user decision to deploy to production, accepted by Serhiy Onyshchenko on 2026-11-16. Factually false as written: `origin/main` = 8c5259c is live. |
| 9 | Nav fits without wrapping at 320px (11-04 backstop) | FAILED | Live measurement in 11-UI-REVIEW.md: nav 96px at 320px on 3 pages, covers profile breadcrumbs. `Nav.module.css` lacks the planned fix. |
| 10 | BusinessCard photo top at or above 112px at desktop and 375px (11-04 backstop) | VERIFIED | 11-UI-REVIEW.md backstop 2: `getBoundingClientRect().top` = 110px at 1280 and 375 for all 7 members, measured on production. |
| 11 | Homepage hero teaser link styling and /about band parity in light and dark mode (11-04 backstop, NAV-02, D-11) | PRESENT_BEHAVIOR_UNVERIFIED | Copy matches (UI-REVIEW copywriting 4/4, teaser drift test passes). Hover colour and dark mode not observed by anyone. |
| 12 | Local gate: lint, typecheck, full tests, static build with correct artifacts (11-04 truth 1) | VERIFIED | Lint, typecheck, tests re-run by me (all pass). Build not re-run locally (it rewrites `next-env.d.ts`); Cloudflare built 8c5259c from the same source and serves every expected artifact (truth 4, 6). `src/app/team/` no longer exists. |

**Score:** 8/12 truths verified (3 present, behavior-unverified; 1 failed)

### Prohibitions (judgment tier, non-authoritative LLM verdicts)

| Source | Prohibition | Verdict | Flag |
|--------|-------------|---------|------|
| 11-01 | MUST NOT ship placeholder, interim, paraphrased or American-spelled About copy | Holds: production copy matches CONTEXT final strings (UI-REVIEW copywriting 4/4) | unverified-prohibition, human review recommended |
| 11-03 | MUST NOT delete or repoint away a legacy `/team/<slug>` rule when a member leaves | Holds today (all 7 slugs, both forms, present). Not enforced: the guard iterates `members` only, so removing a member and its rule passes `npm test` (REVIEW WR-01, open) | unverified-prohibition, human review recommended |
| 11-04 | MUST NOT push to or merge into main in Phase 11 | Violated by explicit user decision | Covered by override |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/about/page.tsx` | /about page, metadata, canonical | VERIFIED | gsd verify.artifacts 5/5 (plan 01); live 200 |
| `src/app/about/page.module.css` | moved rules + scroll-margin-top | VERIFIED | contains scroll-margin-top |
| `src/components/ui/LegacyHashRedirect.tsx` | client hop | VERIFIED | exports both; mounted on homepage |
| `src/app/about/team/[slug]/page.tsx` | moved profile + breadcrumbs + canonical | VERIFIED | verify.artifacts 4/4 (plan 02); 7 live 200 |
| `src/app/about/team/[slug]/page.module.css` | `.profile` nav clearance | VERIFIED (fragile) | 4.0625rem hard-coded, fails when nav wraps (gap) |
| `src/app/sitemap.ts` | /about, no /team | VERIFIED | live sitemap matches |
| `public/_redirects` | legacy team 301s + /r4u | VERIFIED | 16 team rules (2 index + 7 + 7 trailing slash), /r4u on line 2 |
| `src/__tests__/{about,profile,redirects,legacy-links}.test.*` | guard tests | VERIFIED | all pass |
| `src/components/layout/Nav.module.css` | 320px backstop fix | MISSING CHANGE | planned fix not applied |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| Nav.tsx | /about | `href="/about"` | WIRED |
| MemberCard.tsx | /about grid | `/about/team/${member.slug}` | WIRED |
| page.tsx (home) | LegacyHashRedirect | mounted | WIRED |
| about/team/[slug]/page.tsx | Breadcrumbs | items Home, About us, name | WIRED |
| about/team/[slug]/page.tsx | BusinessCard | member + qrSvg | WIRED |
| redirects.test.ts | public/_redirects, members.ts | readFileSync + members loop | WIRED |

gsd `verify.key-links`: 3/3, 2/2, 2/2.

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Real data | Status |
|----------|------|--------|-----------|--------|
| /about Team grid | `members` | static typed array `src/data/members.ts` | 7 cards in production HTML | FLOWING |
| Profile page | `member`, `qrSvg` | members + `generateQRSvg` at build | live HTML has svg + photo | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Legacy team 301 matrix | `curl -w "%{http_code} %{redirect_url}"` on 7 slugs x 2 forms, /team, /team/ | all 301 to correct target | PASS |
| Photos not redirected | `curl` on 7 `/team/<slug>.png` | 200, no Location | PASS |
| One hop | `curl -sL -w hops` /team/michael-desloover/ | hops=1 final=200 | PASS |
| /r4u unchanged | `curl` /r4u/test | 301 to fundraise/test | PASS |
| Metadata + sitemap | saved production HTML/XML, grep | titles, canonicals, 6 sitemap locs | PASS |
| Guard suite | `npm test` (once) | 237/237 | PASS |

### Probe Execution

Not applicable: no `scripts/*/tests/probe-*.sh` declared or present for this phase.

### Requirements Coverage

All 13 phase IDs are claimed by at least one plan (01: ABOUT-01/02/05, NAV-01/02, LINK-03, SEO-01, QA-01; 02: ABOUT-06, SEO-01/02, QA-01; 03: LINK-01/02/04, QA-01). No orphans.

| Requirement | Plan | Status | Evidence |
|-------------|------|--------|----------|
| ABOUT-01 | 01 | SATISFIED | truth 1 |
| ABOUT-02 | 01, 04 | NEEDS HUMAN | anchors exist once each; heading visibility not observed (truth 2) |
| ABOUT-05 | 01 | SATISFIED | 7 distinct card hrefs live |
| ABOUT-06 | 02, 04 | PARTIAL | works at 375px and up; at 320px the nav hides the breadcrumbs (gap). REQUIREMENTS.md marks it Complete |
| NAV-01 | 01 | SATISFIED | Nav.tsx + live HTML |
| NAV-02 | 01 | SATISFIED (visual parity needs human) | teaser + link live, no #about/#team |
| LINK-01 | 03 | SATISFIED | curl, all 7 (plus trailing slash) |
| LINK-02 | 03 | SATISFIED | curl |
| LINK-03 | 01 | NEEDS HUMAN | replace call tested; Back behaviour not observed |
| LINK-04 | 03 | SATISFIED | curl, 7 photos 200 |
| SEO-01 | 01, 02 | SATISFIED | live canonicals |
| SEO-02 | 02 | SATISFIED | live sitemap |
| QA-01 | 01, 02, 03 | SATISFIED | guard tests pass (strength caveats WR-01/WR-02) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (phase files) | - | TBD/FIXME/XXX/TODO/HACK | none found | - |
| `src/components/layout/Nav.module.css` | - | planned backstop CSS missing | Blocker (via gap) | nav covers profile breadcrumbs at 320px |
| `src/app/about/team/[slug]/page.module.css` | 3 | hard-coded 65px nav clearance | Warning | same root cause as the gap |
| `src/__tests__/redirects.test.ts` | 22 | one-way member to rule check (WR-01) | Warning | departed-member rule deletion passes tests |
| `src/__tests__/profile.test.tsx` | - | unknown-slug test survives deleting `notFound()` (WR-02) | Warning | weak guard; route still correct today |
| `src/app/page.module.css` | 23, 33, 56 | hex literals beside tokens | Info | no visual impact |
| home metadata | - | description keeps copy no longer on the page (IN-02) | Info | SEO text drift |

Advisory reviews factored in: 11-VALIDATION.md (nyquist_compliant), 11-SECURITY.md (SECURED, 0 open), 11-UI-REVIEW.md (19/24, backstop 1 FAIL, backstop 2 PASS), 11-REVIEW.md (0 critical, WR-01/WR-02 open, 6 info).

### Human Verification Required

Status is gaps_found, so these are carried in `behavior_unverified_items` and must also be done:

1. **Anchor headings below the nav.** Open `/about#mission`, `/about#history`, `/about#team` on production at desktop and 375px. Expected: each h2 fully below the fixed nav. Why human: browser layout.
2. **Legacy hash hop and Back.** Open `/#team` in a fresh tab, then Back; repeat with `/#about`. Expected: `/about#team` with heading visible, Back does not return to `/#team`; `/#about` lands on `/about#mission`. Why human: browser history.
3. **Visual parity and dark mode.** View `/` and `/about` in light and dark mode, hover "More about us". Expected: underlined paper link turning amber; bands match the old homepage sections. Why human: visual.

### Gaps Summary

One gap, one root cause. The substantive goal holds on production: the About section is complete and live, all 7 legacy `/team/<slug>` URLs (with and without trailing slash), `/team` and `/team/` 301 to the right place in one hop, photos load with no redirect, metadata and sitemap are correct, and the guard suite passes. The preview-only and production-untouched clauses are superseded by the user's decision (override).

What fails: the 11-04 backstop "nav fits at 320px". It was measured live at 96px, it hides the profile breadcrumbs on 320px screens, and the fix the plan prescribed for exactly this case was not applied. Because the phase is now in production, this is a live defect on small phones. Phase 12 does not cover nav layout, so it is not deferred. Fix: add the planned rules to `src/components/layout/Nav.module.css` and re-measure. Optionally replace the hard-coded 4.0625rem clearance with a `--nav-height` token.

---

_Verified: 2026-11-16T08:59:08Z_
_Verifier: Claude (gsd-verifier)_
