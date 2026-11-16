# Phase 11 — UI Review

**Audited:** 2026-11-16
**Baseline:** 11-UI-SPEC.md (approved)
**Screenshots:** captured from production https://european-resolve.org with Playwright 1.58 (chromium). Saved outside the repo: 1440 and 375 for `/` and `/about`, 320 nav on 3 pages, profile at 1280 and 375. No local dev server was used.
**Interaction captures:** off (workflow.ui_interaction_capture is false). Interaction findings below come from the code.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Every contract string matches the live site word for word. No em dashes. Teaser equals the Mission lead. |
| 2. Visuals | 2/4 | At 320px the fixed nav wraps to 96px tall and hides the profile breadcrumbs (BLOCKER) |
| 3. Color | 3/4 | Moved rules use primitive tokens. The hero still has 3 hex literals in `page.module.css`. |
| 4. Typography | 4/4 | h1 clamp 32-56, lead 24px/700 serif, h2 clamp, body 16/1.6, only weights 400 and 700, all as specified |
| 5. Spacing | 3/4 | Contract values are met (7rem/3rem/4rem, photo at 110px). The 65px nav clearance is a fixed value that breaks when the nav grows taller. |
| 6. Experience Design | 3/4 | Static pages, so states do not apply. Breadcrumb navigation is unusable at 320px, the same root cause as pillar 2. |

**Overall: 19/24**

---

## UI-SPEC Backstops

1. **Nav does not wrap at 320px: FAIL.** Measured at 320x700 on `/`, `/about` and `/about/team/michael-desloover` (same result on all three). Nav height is **96px**; the 65px clearance assumes 65px. The wordmark "European Resolve" is 64px tall (2 lines). "About us" is 45px tall (2 lines) against 22px for "Events". scrollWidth is 320, so there is no horizontal overflow. The fix written into the spec was never applied: `.links a { white-space: nowrap }` plus the `@media (max-width: 22.5rem)` gap and wordmark rule in `Nav.module.css`.
2. **Profile photo top at or below 112px: PASS.** I measured `getBoundingClientRect().top` of the card photo at scroll 0 for all 7 members. It is **110px** at 1280x800 and **110px** at 375x812, matching the spec's arithmetic. Caveat: at 320px the photo is also at about 110px, but the 96px nav covers the breadcrumb row (see finding 1).

---

## Top 3 Priority Fixes

1. **BLOCKER: the nav wraps at 320px and hides the profile breadcrumbs.** Visitors on small phones (320px, e.g. iPhone SE 1st gen or a zoomed view) cannot see or tap "Home > About us > name". The nav labels also wrap onto two lines. Apply the spec's backstop CSS in `src/components/layout/Nav.module.css`: `.links a { white-space: nowrap; }` and `@media (max-width: 22.5rem) { .links { gap: 1rem; } .wordmark { font-size: 1.125rem; } }`. Then re-measure: nav height should be 65px or less.
2. **WARNING: the 65px clearance is hard-coded** in `src/app/about/team/[slug]/page.module.css` (`.profile`) and `.eventRoot`. Any change in nav height brings the overlap back. Add a `--nav-height` token, as the checker sign-off suggested, and use it in both places.
3. **WARNING: the hero still uses hex literals.** `src/app/page.module.css` lines 23, 33 and 56 have `#f5f2eb` / `#d4a012`. The token rule only applied to moved CSS, but the file now has a token-based `.moreLink` sitting next to literal hero colours. Swap them for `var(--color-paper)` / `var(--color-amber)`. This does not change the rendered output.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)
- Live DOM: the homepage `.because` text and the `/about` `.lead` text are both "We exist to turn Europe's concern into resolve, and resolve into action." `More about us` links to `/about`. The nav label is "About us".
- `document.body.innerText` has no U+2014 on `/` or `/about`. Grepping `src/app/about`, `src/app/page.tsx` and `Nav.tsx` also finds none.
- The `/about` screenshot shows h1/h2 text, the Mission body and History paragraphs 1 to 4 exactly as the contract states.

### Pillar 2: Visuals (2/4)
- BLOCKER (above): the nav takes 2 lines at 320px and covers the breadcrumbs. The `nav320_about_team_*` screenshot shows no breadcrumb row.
- WARNING: on the 1440 homepage the "More about us" link is centred at about x=705 while the hero is centred at x=720. It looks slightly off-centre under the teaser. Check the `p` wrapper for inherited alignment or trailing whitespace.
- WARNING (pre-existing, inherited): the Team grid's 7th card (Marco Melega) sits alone, left-aligned, in the last row at 3 columns. The Team h2 left edge (x≈190 at 1314 display) does not line up with the 42rem About column (x≈350). Both are by design ("moved verbatim") but look uneven.
- Hierarchy h1 > h2 > lead > body reads clearly on `/about`.

### Pillar 3: Color (3/4)
- `src/app/about/page.module.css` uses `--color-paper` / `--color-black` primitives. Body text keeps `rgb(10 22 40 / 0.85)` as the spec requires. Amber appears only on member titles and photo rings on `/about`, and on the teaser, divider and nav hover on `/`. That matches the reserved list.
- WARNING: hex literals remain in hero rules (`src/app/page.module.css:23,33,56`).

### Pillar 4: Typography (4/4)
- Computed lead font-size is 24px. `.pageTitle` uses `clamp(2rem, 5vw, 3.5rem)`, serif, 700, `--leading-tight`, margin 0. `.aboutHeading` uses `clamp(1.75rem, 4vw, 2.25rem)`. There is exactly one h1 on `/about`. No undeclared sizes or weights were added.

### Pillar 5: Spacing (3/4)
- `.about` padding 7rem/1.5rem/6rem, `.mission` 3rem + scroll-margin 6rem, `.history` 4rem + 6rem, `.team` scroll-margin 4rem, BusinessCard padding-top 0.5rem, `.profile` 4.0625rem: all match the contract.
- WARNING: the clearance is a fixed 65px while the real nav height depends on the viewport (96px at 320). See fix 2.

### Pillar 6: Experience Design (3/4)
- Loading, empty and error states do not apply (static export, fixed 7-member array, `notFound()` for bad slugs).
- Profile breadcrumbs are covered at 320px (finding 1). This is an interaction defect on the narrowest supported width.
- The legacy hash hop and deep links were not exercised in a browser in this audit (interaction capture off). The code and Phase 11 verification cover them.

Registry audit: no shadcn, no third-party registries; skipped.

---

## Files Audited
- src/app/about/page.tsx, src/app/about/page.module.css
- src/app/about/team/[slug]/page.module.css
- src/app/page.tsx, src/app/page.module.css
- src/components/layout/Nav.tsx (Nav.module.css not modified in this phase)
- src/components/ui/BusinessCard.module.css
- src/data/members.ts (slugs)
- Live: /, /about, /about/team/{michael-desloover, liza-bezvershenko, olena-kuzhym, benjamin-lemerle, ivan-zinchenko, serhiy-onyshchenko, marco-melega}
