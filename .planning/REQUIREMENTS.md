# Requirements: European Resolve site, v1.1 About Us

**Defined:** 2026-11-15
**Core Value:** Give European Resolve a proper About Us section (Mission, History, Team) in the main navigation, without breaking any existing team links.

## v1.1 Requirements

Release is gated on org-supplied content: Mission copy, History copy, and footer legal data (decision: wait for copy, one release).

### About page

- [ ] **ABOUT-01**: Visitor can open `/about` and read Mission, History, and Team sections, in that order
- [ ] **ABOUT-02**: Each section has a stable anchor (`#mission`, `#history`, `#team`); jumping to one keeps its heading visible below the fixed nav
- [ ] **ABOUT-03**: Mission section shows the final org-supplied mission copy
- [ ] **ABOUT-04**: History section shows the org-supplied history copy
- [ ] **ABOUT-05**: Team section shows every member as a card linking to `/about/team/<slug>`
- [ ] **ABOUT-06**: Visitor can open a member profile at `/about/team/<slug>` (business card and QR unchanged) with breadcrumbs Home > About us > Name

### Navigation & homepage

- [ ] **NAV-01**: Main nav shows "About us" linking to `/about`, replacing "Team"
- [ ] **NAV-02**: Homepage shows a short mission teaser linking to `/about`; the About and Team blocks are no longer on the homepage

### Legacy links

- [ ] **LINK-01**: `/team/<slug>` for each of the 7 existing members 301s to `/about/team/<slug>` (printed business cards keep working)
- [ ] **LINK-02**: `/team` and `/team/` 301 to `/about#team`
- [ ] **LINK-03**: Visitors arriving at `/#team` land on `/about#team` without trapping the Back button
- [ ] **LINK-04**: Member photos at `/team/<slug>.png` keep loading directly with no redirect (email signatures keep working)

### SEO

- [ ] **SEO-01**: `/about` and profile pages have title, description, and canonical URL at the new address
- [ ] **SEO-02**: Sitemap lists `/about`; member pages stay unlisted

### Legal

- [ ] **LEGAL-01**: Footer on every page shows enterprise number, registered office, and RPR/RPM with court district

### Verification

- [ ] **QA-01**: Guard tests assert one redirect line per member, no `/team/*` splat, explicit 301 on every rule, no internal `/#team` links, and no em dashes in new copy
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

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 0 (pending roadmap)

---
*Requirements defined: 2026-11-15*
*Last updated: 2026-11-15 after initial definition*
