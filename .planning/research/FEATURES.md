# Feature Research

**Domain:** About Us section for a small Brussels civil-society NGO (European Resolve VZW), added to an existing static Next.js site
**Milestone:** v1.1 About Us
**Researched:** 2026-11-15
**Confidence:** MEDIUM (NGO page conventions come from practitioner blogs, MEDIUM/LOW. Belgian website disclosure rules come from DNS Belgium guidance, MEDIUM; the statute text was not checked. Cloudflare redirect behaviour comes from official docs, HIGH. Codebase facts were checked directly, HIGH.)

## How NGO About pages usually work (short answer)

- **One page, not a section tree.** Small NGOs (under about 15 people) put Mission, History and Team on one `/about` page with headed sections. Larger organisations split these into sub-pages such as history, team, governance and financials. At 7 team members and 3 sections, European Resolve is clearly in the single-page group. Only individual profiles get their own URLs, which `/about/team/[slug]` already covers.
- **Usual order: mission first, then history, then people, then trust details and contact.** Practitioner guides agree on putting the mission first and the people after it. One source warns against founder-centred pages: donors fund a mission, not a person. History works as proof that the mission is real. For this org, the real proof so far is Run for Ukraine 2026.
- **Vision and values sections are common at mid-size NGOs.** A small organisation with no supplied copy should leave them out (see Anti-Features).
- **The homepage teaser is one or two sentences plus a "More about us" link.** It is not a copy of the About page. Guides recommend a short mission line on the homepage that points to the full page.
- **Trust elements donors and partners look for:** the legal entity name and form, a registration number, an address, a contact email, named people with photos and roles, and, for mature organisations, governance and annual accounts. Belgium adds a legal duty here (next section).

### Belgian legal disclosure: a real gap in the current site

According to DNS Belgium's guidance on mandatory website information, a Belgian company or non-profit website must show:
- the name and legal form (the site already shows "European Resolve VZW")
- the **registered office address** (missing)
- the **enterprise number** from the Crossroads Bank for Enterprises, KBO/BCE (missing)
- **"RPR/RPM" followed by the court of the registered office's district** (missing)
- contact details (the site already shows `info@european-resolve.org`)
- a VAT number only if the activity is subject to VAT

DNS Belgium recommends putting these details in the **footer on every page**. Right now `Footer.tsx` shows only `© {year} European Resolve VZW` and the email. Adding them takes about one line of markup, but it **depends on the org supplying the enterprise number, the registered office, and the court district**, the same way Mission and History copy depend on them. (DNS Belgium cites no article numbers. Have someone check the wording against the Code of Companies and Associations before relying on it.)

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes / Dependencies on existing code |
|---------|--------------|------------|----------------------------------------|
| `/about` page with **Mission**, **History** and **Team** sections, in that order | This is the standard NGO About structure. Partners and journalists open "About" to answer "who are these people and why should I trust them" | LOW | New `src/app/about/page.tsx` plus a CSS module. Reuse the homepage `.about*` and `.team*` styles from `src/app/page.module.css` (move them, don't duplicate). |
| Section anchors `id="mission"`, `id="history"`, `id="team"` | `/about#team` is the redirect target for `/team` and `/#team`. Anchors also let people share links to a section | LOW | Plain `id`s on `<section>`. `#team` is required: the redirects and the client-side hop depend on it. Add `scroll-margin-top` if the nav is sticky. |
| Mission section with real copy | It is the point of the page | LOW | **Copy dependency.** Start from the draft line ("We exist to turn Europe's concern into resolve, and resolve into action...") plus the **three paragraphs already on the homepage** (Brussels-based, mission, purpose). Move that copy, don't discard it. Follow CLAUDE.md copy rules: no em dashes. |
| History section | The milestone asks for it. It shows the org has a track record | LOW (code) | **Copy dependency, which blocks the release.** Don't ship an empty or "coming soon" heading. Either wait for the copy or ship without the section and add it later. Run for Ukraine 2026 is the obvious anchor event. Linking to `/events` from History costs nothing. |
| Team grid moved to `/about#team` | Named people with photos and roles are the strongest trust signal for a small NGO | LOW | Reuse `members` and `MemberCard` as they are. Change the `MemberCard` href from `/team/${slug}` to `/about/team/${slug}`. |
| Main nav "Team" becomes "About us" → `/about` | Every NGO site has "About" in its main nav | LOW | One line in `Nav.tsx`. Mark the active page (`aria-current`) only if the nav already does that elsewhere. It doesn't today, so skip it. |
| Homepage mission teaser plus link | Visitors arriving on `/` need a one-line "what we do" and a way to read more | LOW | Replace the `#about` and `#team` sections in `src/app/page.tsx` with one short block: the mission sentence and a "More about us" link. **Watch for duplication:** the hero subline ("Research, dialogue, and civic action...") already says what the org does, so the teaser must add something (the mission), not repeat the tagline. |
| Old URLs keep working: `/team/[slug]` → `/about/team/[slug]` (301), `/team` → `/about#team`, `/#team` → `/about#team` | Printed QR business cards and shared links must not break. The milestone states this as a goal | MEDIUM | `public/_redirects` for the server-side cases. A small client-side script on `/` for the fragment case, because fragments never reach Cloudflare. **Collision:** member photos live at `public/team/*.png`, and Cloudflare docs say "Redirects are always followed, regardless of whether or not an asset matches the incoming request". A `/team/*` or `/team/:slug` rule would redirect the photos too. Move the photos to `/about/team/` or `/images/team/`, or write a rule that can't match them. |
| Profile pages at `/about/team/[slug]` with breadcrumb Home › About us › Name | The hierarchy should be visible, and the existing `Breadcrumbs` component makes this cheap | LOW | Move `src/app/team/[slug]/page.tsx` as is. Add `Breadcrumbs` (`src/components/ui/Breadcrumbs.tsx`). Check that `BusinessCard` layout still works with a breadcrumb above it. |
| Metadata and sitemap updated | `/about` needs a title and description for search and link previews. The sitemap lists neither `/about` nor any team profile today | LOW | Add `/about` and the profile URLs to `src/app/sitemap.ts`. Set `canonical` on profile pages to the new URL. |
| Legal entity disclosure (enterprise number, registered office, RPR plus court) | Belgian law requires it (see above), and partners and funders check it | LOW (code) | **Data dependency on the org.** Put it in `Footer.tsx`, site-wide, as recommended. Optionally repeat it in a short "Organisation details" line at the end of `/about`. This sits slightly outside the stated milestone scope, but it is the cheapest trust fix available and fits the "who are we" theme. Recommendation: include it if the org supplies the data, and don't block the milestone on it. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| EU Transparency Register ID shown on `/about` (and/or in the footer) | For a Brussels advocacy NGO, this is the credibility marker. The Commission only meets registered interest representatives on policy matters. Showing the ID tells EU partners "we play by the rules" | LOW | **Only if the org is registered.** It's one line with a link to the register entry. Ask the org; don't build anything for it. |
| History told through what was actually done (Run for Ukraine 2026, funds raised for Hurkit, co-organisers), linking to the event hub | Concrete proof beats aspirational copy, and the evidence already lives on the site | LOW | This is a copy decision, not a feature. Links to `/events/2026-run-for-ukraine/`. CLAUDE.md copy rule applies: write "defenders" inclusively. |
| Closing call to action on `/about` ("Get in touch" mailto, or "See our events") | It turns a reader into a contact or participant | LOW | Reuse `info@european-resolve.org` (already in the footer) or `ObfuscatedEmail`. One line. |
| `Organization`/`NGO` JSON-LD on `/about` (legalName, address, email, logo, sameAs) | Richer search results and a machine-readable legal identity | LOW | One `<script type="application/ld+json">` in a server component. Depends on the same legal data as the footer. P3. |
| Short one-line bios on member cards | Partners want to know what each person does, not just their title | MEDIUM | Needs new copy for 7 people plus a schema change in `members.ts`. Defer unless the org offers the copy. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Separate sub-pages `/about/mission`, `/about/history`, `/about/team` | It "looks organised" and copies big NGOs | Three thin pages, more routes and redirects, worse reading flow for about 1 screen of copy each | One `/about` page with anchors. Only profiles get sub-URLs. |
| Sticky in-page table of contents or scroll-spy sub-nav | Common on long About pages | Three sections don't need it. Scroll-spy needs a client component and has a11y edge cases | Plain anchors. A static "Mission · History · Team" jump-link row is acceptable only if the page turns out long once copy arrives. |
| Vision and Values sections | NGO template habit | No copy exists, and filler values ("integrity, impact") lower credibility. The mission line already covers vision | Leave them out. Add them later if the org writes them. |
| "Coming soon" or placeholder History in production | Shipping on time while waiting for copy | Looks unfinished on the page meant to build trust | Hold the section until real copy exists (render it only when copy is present, or hold the release). |
| Board, statutes, governance pages, or annual-accounts archive | "Full transparency" | No content or process exists yet. A VZW's accounts are already public at the National Bank (NBB). A half-filled governance page is worse than none | Later: one link to the org's NBB filing or KBO entry once there's something to show. |
| Financial or impact dashboard ("€X raised, Y stations") | Donor-trust best practice | Needs ongoing data upkeep on a static site with no backend. Run for Ukraine figures are already on the event hub | Mention the outcome in History copy with a link to the event hub. |
| Partner or funder logo wall | Social proof | Needs logo permissions and upkeep, and it's out of milestone scope | Name the co-organisers in History copy. |
| Localising `/about` (fr/nl/de/uk) | The event hub is localised | Org pages aren't localised by decision. It would pull in the event i18n machinery | English only, as decided. |
| "Join us" or volunteer signup form | It's a natural About-page CTA | The backend has been removed, and a form brings GDPR consent obligations | mailto CTA. |
| Keeping `/team` as a live duplicate page alongside `/about#team` | "Don't break anything" | Two canonical locations for one thing, and a split in SEO signals | 301 `/team` → `/about#team`. |

## Feature Dependencies

```
Copy from org (Mission final, History) ──blocks──> /about ship (History section)
Legal data from org (KBO no., registered office, court) ──blocks──> Footer legal line, JSON-LD

/about page with id="team"
    └──required by──> _redirects `/team` → `/about#team`
    └──required by──> homepage client hop `/#team` → `/about#team`
    └──required by──> Nav "About us"
    └──required by──> Homepage teaser link

/about/team/[slug] route (move of /team/[slug])
    └──required by──> _redirects `/team/:slug` → `/about/team/:slug`
    └──required by──> MemberCard href change
    └──required by──> sitemap + canonical
    └──enhanced by──> Breadcrumbs (existing component)

Photo relocation out of public/team/  ──required before──> any /team/* redirect rule
Homepage teaser ──conflicts with──> keeping the #team section on homepage
    (the client hop on / for #team only works if / no longer has id="team")
```

### Dependency Notes

- **`/about#team` must exist before any redirect points at it.** Ship the page and the route move together with the redirects in one release. A half-migrated state gives 404s or loops.
- **The `public/team/*.png` photos clash with the `/team/:slug` 301.** Cloudflare applies `_redirects` before static assets, so the photo paths have to move (and `members.ts` `photo` values must be updated) in the same change as the redirect.
- **Homepage `id="team"` must go before the client-side `/#team` hop works.** If the section stays on `/`, the browser scrolls to it and the hop never looks necessary. Since the milestone removes the section anyway, the hop should run whenever `location.hash === "#team"`.
- **The existing homepage About copy feeds the Mission section.** Move it, then replace it with the org's final copy when that arrives.
- **Every profile URL change also touches** `MemberCard.tsx`, `sitemap.ts`, profile metadata, any tests that assert `/team/` hrefs (`src/__tests__/`), and possibly vCard or QR content. Grep `/team/` across `src` and `public`.

## MVP Definition

### Launch With (v1.1)

- [ ] `/about` with Mission (moved homepage copy plus the draft line, swapped for final copy when supplied), Team grid, and anchors. This is the core deliverable.
- [ ] History section, **only with real copy**. If the copy hasn't arrived, ship without it.
- [ ] Nav "Team" → "About us"
- [ ] Homepage: remove the About and Team sections and add a one-to-two-line mission teaser with a "More about us" link
- [ ] `/about/team/[slug]` with breadcrumbs, the photo move, `_redirects` 301s (`/team/:slug`, `/team`), and the client hop for `/#team`. Old QR cards and links must keep working.
- [ ] Sitemap, metadata, canonical
- [ ] Footer legal line (enterprise number, registered office, RPR plus court), **if the org supplies the data in time**. It's a legal requirement, and adding it is trivial.

### Add After Validation (v1.x)

- [ ] EU Transparency Register ID, once confirmed the org is registered
- [ ] Closing CTA on `/about` (contact or events)
- [ ] Organization JSON-LD, once the legal data exists

### Future Consideration (v2+)

- [ ] Member bios (needs copy and a schema change)
- [ ] Governance and annual-accounts links (once there are filings worth linking)
- [ ] Vision and Values, only if the org writes them

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `/about` Mission + Team + anchors | HIGH | LOW | P1 |
| Redirects + route move + photo move + `/#team` hop | HIGH (links must not break) | MEDIUM | P1 |
| Nav "About us" | HIGH | LOW | P1 |
| Homepage teaser | MEDIUM | LOW | P1 |
| History section | MEDIUM | LOW (blocked on copy) | P1 if copy arrives, otherwise P2 |
| Breadcrumbs / sitemap / metadata | MEDIUM | LOW | P1 |
| Footer legal disclosure | MEDIUM (legal) | LOW (blocked on data) | P1 if data arrives, otherwise P2 |
| Transparency Register ID | MEDIUM | LOW | P2 |
| Closing CTA | LOW | LOW | P2 |
| JSON-LD | LOW | LOW | P3 |
| Member bios | MEDIUM | MEDIUM | P3 |

## Scope-Creep Flags

- **Clearly out of scope:** vision/values, governance or financials pages, impact dashboard, logo wall, localisation, signup forms, a TOC or scroll-spy, and splitting `/about` into sub-pages.
- **Borderline, but recommended because it's cheap:** the footer legal line. It's a legal gap, not a feature. It touches only `Footer.tsx`, but it waits on org data, so treat it as a separate requirement that doesn't block the release.
- **Not a feature, but must be in scope:** moving the photos out of `public/team/`. Without it, the required redirect breaks every team photo.
- **Leave alone:** the hero ("European Resolve is being built.") is not part of this milestone, even though the teaser sits next to it.

## Sources

- DNS Belgium, "Obligatory information" for websites: https://www.dnsbelgium.be/en/your-domain-name/your-own-website/obligatory-information (MEDIUM; official registry guidance, no statute text)
- DNS Belgium, "Obligatory company website": https://www.dnsbelgium.be/en/news/obligatory-company-website (MEDIUM)
- Cloudflare Pages redirects docs: https://developers.cloudflare.com/pages/configuration/redirects/ (HIGH; redirects apply before assets, source fragments are ignored, destination fragments are allowed)
- EU Transparency Register: https://transparency-register.europa.eu/index_en and https://commission.europa.eu/about/service-standards-and-principles/transparency/transparency-register_en (HIGH; registration is required for policy meetings with Commissioners and senior staff)
- NGO About-page practice: https://www.elevationweb.org/blog/the-anatomy-of-a-nonprofit-about-us-page/ , https://www.wildapricot.com/blog/nonprofit-about-us-page , https://www.donordock.com/articles/how-to-write-nonprofit-about-page-donor-hero , https://www.salsalabs.com/blog/how-to-create-a-nonprofit-website-about-page-or-mission-page , https://www.canadahelps.org/en/charity-life/digital-marketing/how-to-make-your-homepage-shine/ (LOW-MEDIUM; practitioner blogs that agree with each other)
- Codebase inspection: `src/app/page.tsx`, `src/components/layout/Nav.tsx`, `Footer.tsx`, `src/app/team/[slug]/page.tsx`, `src/components/ui/MemberCard.tsx`, `src/data/members.ts`, `src/app/sitemap.ts`, `public/_redirects`, `.planning/intel/about_us.md` (HIGH)

---
*Feature research for: NGO About Us section (v1.1)*
*Researched: 2026-11-15*
