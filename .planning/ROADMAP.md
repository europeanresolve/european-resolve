# Roadmap: European Resolve Website

## Milestones

- ✅ **v1.0 Run for Ukraine** — Phases 1-10 (shipped 2026-11-14)
- 🚧 **v1.1 About Us** — Phases 11-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 Run for Ukraine (Phases 1-10) — SHIPPED 2026-11-14</summary>

- [x] Phase 1: Static Event Pages (4 plans)
- [x] Phase 2: Backend API & Registration (3 plans)
- [x] Phase 02.1: Replace Monobank jar with WhyDonate (4 plans)
- [x] Phase 3: Fundraising Pages & Live Progress (4 plans)
- [x] Phase 4: Polish, Communications & Post-Event Readiness (4 plans)
- [x] Phase 04.1: Registration Confirmation Emails (2 plans)
- [x] Phase 5: i18n Translations (4 plans)
- [x] Phase 6: WhyDonate Widget Auto-Detection (3 plans)
- [x] Phase 06.1: Tier amount enforcement & effective-tier policy (3 plans)
- [x] Phase 7: Run for Ukraine Events Listing (3 plans)
- [x] Phase 8: Post-event registration closure (3/4 plans; 08-04 deploy wiring verify deferred as a known gap)
- [x] Phase 9: Post-event thank-you email (shipped outside GSD, `e50fde3`)
- [x] Phase 10: Hurkit deployment update blast (shipped outside GSD, `69c5a2f`)

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 About Us (In Progress)

**Milestone Goal:** Give European Resolve a proper About Us section (Mission, History, Team) in the main navigation, without breaking any existing team links.

**Release rule:** Every push to `main` deploys to production (Cloudflare Pages). Nothing from this milestone is user-visible until Mission copy, History copy, and footer legal data are all in hand. Phase 11 lives on a feature branch and is verified on a Cloudflare preview deploy only. Phase 12 is the single merge to `main`, so the route move and `_redirects` go live in the same deploy.

- [ ] **Phase 11: About section mechanics (feature branch)** - `/about`, profile route move, redirects, nav, homepage teaser, SEO and guard tests, verified on a preview deploy; not merged
- [ ] **Phase 12: Final copy, legal footer and release** - Org-supplied Mission, History and legal data dropped in, preview re-verified, one merge to `main`

## Phase Details

### Phase 11: About section mechanics (feature branch)
**Goal**: On a Cloudflare preview deploy of the feature branch, a visitor can use the complete About Us section (interim copy allowed) and every legacy team URL lands in the right place. Nothing is merged to `main`; production is unchanged at phase end.
**Depends on**: Phase 10 (v1.0 shipped)
**Requirements**: ABOUT-01, ABOUT-02, ABOUT-05, ABOUT-06, NAV-01, NAV-02, LINK-01, LINK-02, LINK-03, LINK-04, SEO-01, SEO-02, QA-01
**Success Criteria** (what must be TRUE):
  1. On the preview deploy, `/about` shows Mission, History and Team in that order (interim copy, branch only), and jumping to `#mission`, `#history` or `#team` leaves that section's heading visible below the fixed nav.
  2. On the preview deploy, the main nav shows "About us" linking to `/about` (no "Team" item), the homepage shows a short mission teaser linking to `/about` with no About or Team blocks, and each team card opens `/about/team/<slug>` with the business card and QR unchanged and breadcrumbs Home > About us > Name.
  3. `curl -sI` against the preview deploy shows `/team/<slug>` returning 301 to `/about/team/<slug>` for all 7 members, `/team` and `/team/` returning 301 to `/about#team`, and `/team/<slug>.png` returning 200 with no redirect; opening `/#team` lands on `/about#team` and Back skips the `/#team` entry.
  4. `/about` and each profile page carry a title, description and canonical URL at the new address, and the sitemap lists `/about` with no member pages.
  5. `npm test` fails if a member has no `/team/<slug>` redirect line, a `/team/*` splat exists, any rule lacks an explicit 301, an internal `/#team` link exists, or About copy or metadata contains an em dash; `main` and european-resolve.org are untouched at phase end.
**Plans:** 4/5 plans executed

Plans:
**Wave 1**
- [x] 11-01-PLAN.md — /about page with final copy, nav "About us", team card links, homepage teaser, legacy /#team and /#about hop
- [x] 11-02-PLAN.md — Profile route move to /about/team/<slug> with breadcrumbs and canonicals; sitemap lists /about
- [x] 11-03-PLAN.md — public/_redirects legacy team rules, redirect guard tests, Entry Points docs

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 11-04-PLAN.md — Local release gate, human push to a feature branch, Cloudflare preview curl matrix, production-untouched check

**Gap closure** *(from 11-VERIFICATION.md: nav wraps to 96px at 320px and covers profile breadcrumbs)*
- [ ] 11-05-PLAN.md — Single-line nav at 320px (nowrap links, 22.5rem media query), Nav CSS source guard, Playwright layout measurement, human push and production re-measure

**UI hint**: yes

### Phase 12: Final copy, legal footer and release
**Goal**: Visitors to european-resolve.org get the finished About Us section with the org's own Mission and History copy and a legally complete footer, released in one merge to `main` with every legacy team link still working.
**Depends on**: Phase 11, plus org-supplied Mission copy, History copy and footer legal data (enterprise number, registered office, RPR/RPM court). Hard gate: do not start the merge without all three.
**Requirements**: ABOUT-03, ABOUT-04, LEGAL-01, QA-02
**Success Criteria** (what must be TRUE):
  1. `/about` Mission shows the final org-supplied mission copy, the homepage teaser agrees with it, History shows the org-supplied history copy, and no interim or draft copy remains anywhere.
  2. The footer on every page shows the enterprise number, registered office, and RPR/RPM with court district.
  3. Before merging, the full curl matrix passes on the release-candidate preview deploy: all 7 `/team/<slug>` 301s (including the exact URL form printed on business cards), `/team` and `/team/` 301s, photos 200 with no hop, and `/r4u/:slug` still redirecting.
  4. The branch reaches `main` in one merge, so the route move, `_redirects`, nav change and final copy go live in the same production deploy, and the same curl matrix passes against european-resolve.org afterwards.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 | v1.0 | see archive | Complete | 2026-11-14 |
| 11. About section mechanics | v1.1 | 4/5 | In Progress | - |
| 12. Final copy, legal footer and release | v1.1 | 0/TBD | Not started | - |

---
*Created: 2026-07-28 | v1.0 archived: 2026-11-14 | v1.1 roadmap: 2026-11-15*
