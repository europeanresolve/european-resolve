# Requirements: European Resolve site, v1.1 About Us

**Defined:** 2026-11-15
**Core Value:** european-resolve.org is a credible, transparent public face for the organisation: mission, people and work in one place. Links to team pages and assets keep working.

## v1.1 Requirements

Release is gated on org-supplied content: Mission copy, History copy, and footer legal data (decision: wait for copy, one release).

### About page

- [x] **ABOUT-01**: Visitor can open `/about` and read Mission, History, and Team sections, in that order
- [x] **ABOUT-02**: Each section has a stable anchor (`#mission`, `#history`, `#team`); jumping to one keeps its heading visible below the fixed nav
- [ ] **ABOUT-03**: Mission section shows the final org-supplied mission copy
- [ ] **ABOUT-04**: History section shows the org-supplied history copy
- [x] **ABOUT-05**: Team section shows every member as a card linking to `/about/team/<slug>`
- [x] **ABOUT-06**: Visitor can open a member profile at `/about/team/<slug>` (business card and QR unchanged) with breadcrumbs Home > About us > Name

### Navigation & homepage

- [x] **NAV-01**: Main nav shows "About us" linking to `/about`, replacing "Team"
- [x] **NAV-02**: Homepage shows a short mission teaser linking to `/about`; the About and Team blocks are no longer on the homepage

### Legacy links

- [x] **LINK-01**: `/team/<slug>` for each of the 7 existing members 301s to `/about/team/<slug>` (printed business cards keep working)
- [x] **LINK-02**: `/team` and `/team/` 301 to `/about#team`
- [x] **LINK-03**: Visitors arriving at `/#team` land on `/about#team` without trapping the Back button
- [x] **LINK-04**: Member photos at `/team/<slug>.png` keep loading directly with no redirect (email signatures keep working)

### SEO

- [x] **SEO-01**: `/about` and profile pages have title, description, and canonical URL at the new address
- [x] **SEO-02**: Sitemap lists `/about`; member pages stay unlisted

### Legal

- [ ] **LEGAL-01**: Footer on every page shows enterprise number, registered office, and RPR/RPM with court district

### Verification

- [x] **QA-01**: Guard tests assert one redirect line per member, no `/team/*` splat, explicit 301 on every rule, no internal `/#team` links, and no em dashes in new copy
- [ ] **QA-02**: Redirects verified with curl on a Cloudflare preview deploy before merging to `main`, including that `/r4u/:slug` still works

## Future Requirements

- **FUT-01**: EU Transparency Register ID shown (if registered)
- **FUT-02**: Organization JSON-LD structured data
- **FUT-03**: Member bios on profile pages
- **FUT-04**: Closing call-to-action on `/about` (contact or events)
- **FUT-05**: Vision and Values sections

## Out of Scope

| Feature | Reason |
|---------|--------|
| Separate `/about/mission`, `/about/history`, `/about/team` pages | Three short sections for a ~7-person org read better as one page with anchors |
| Localizing org pages | Org pages are English-only today; event locales not involved |
| Placeholder or "coming soon" History | Empty sections hurt trust; release waits for copy instead |
| Moving member photos / `/team/*` splat redirect | Cloudflare redirects apply even when an asset exists; per-member rules keep photo URLs hop-free (Option B) |
| Member pages in sitemap | Not listed today; ADR-005 caution on staff exposure |
| Client-side hop for internal nav links | Nav link changes to `/about` directly; hop only covers external legacy `/#team` links |

## Open Items

- Exact URL printed on physical business cards (host with/without `www.`, trailing slash) for the curl matrix
- Mission copy, History copy, footer legal data (enterprise number, registered office, RPR court) from the org
- Cloudflare zone-level redirect rules on the custom domain (could pre-empt `_redirects`)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ABOUT-01 | Phase 11 | Complete |
| ABOUT-02 | Phase 11 | Complete |
| ABOUT-03 | Phase 12 | Pending |
| ABOUT-04 | Phase 12 | Pending |
| ABOUT-05 | Phase 11 | Complete |
| ABOUT-06 | Phase 11 | Complete |
| NAV-01 | Phase 11 | Complete |
| NAV-02 | Phase 11 | Complete |
| LINK-01 | Phase 11 | Complete |
| LINK-02 | Phase 11 | Complete |
| LINK-03 | Phase 11 | Complete |
| LINK-04 | Phase 11 | Complete |
| SEO-01 | Phase 11 | Complete |
| SEO-02 | Phase 11 | Complete |
| LEGAL-01 | Phase 12 | Pending |
| QA-01 | Phase 11 | Complete |
| QA-02 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-11-15*
*Last updated: 2026-11-15 after roadmap creation*
