# Project Research Summary

**Project:** european-resolve.org, milestone v1.1 About Us
**Domain:** Static org-site restructure: new `/about` page (Mission, History, Team), team profile route move with permanent redirects, on Next.js static export + Cloudflare Pages
**Researched:** 2026-11-15
**Confidence:** HIGH for mechanics (official docs + live production probes + repo inspection); MEDIUM for NGO page conventions and Belgian disclosure rules

## Executive Summary

v1.1 is a small information-architecture change on a fully static site: Mission, History and Team consolidate onto one `/about` page with section anchors; team profiles move from `/team/[slug]` to `/about/team/[slug]`; the homepage keeps only a one-to-two-line mission teaser with a "More about us" link. Small NGOs (about 7 people, 3 short sections) use one page with anchors, not a sub-page tree, ordered mission, then history as proof, then people.

No new dependencies and no `next.config.ts` changes. Static export cannot do redirects (`redirects()`, middleware/proxy, and `permanentRedirect()` are unsupported or emit a 200), so every server-side redirect goes in `public/_redirects`, which already serves `/r4u/:slug`. The fragment case `/#team` never reaches the server and needs a tiny client-side hop on the homepage using `location.replace`. Printed QR business cards are the reason this matters: legacy URLs must keep resolving permanently.

The main risks are all in the redirect cut-over: (1) Cloudflare Pages follows a redirect even when a static asset exists at that path, so a `/team/*` splat would also redirect the member photos at `public/team/*.png` (**open decision**, see below); (2) the route move and the redirects must ship in the same deploy; (3) `_redirects` defaults to 302, so 301 must be explicit; (4) `next dev` ignores `_redirects`, so verification must be a curl matrix against a Cloudflare preview deploy. Content risk: Mission and History copy is org-supplied; History must not ship as an empty or "coming soon" placeholder.

## OPEN DECISION: member photos vs `/team/*` redirect (user decides during requirements)

Fact (HIGH, Cloudflare docs): "Redirects are always followed, regardless of whether or not an asset matches." Photos live at `public/team/<slug>.png`, referenced as `/team/<slug>.png` in `src/data/members.ts`. A `/team/*` splat (or `/team/:slug` placeholder, which also matches dots) would send them to `/about/team/<slug>.png`.

| | Option A: move photos + splat (STACK, PITFALLS) | Option B: keep photos + per-member rules (ARCHITECTURE) |
|---|---|---|
| Change | `git mv public/team/*.png public/about/team/`, update `photo` paths in `members.ts`, `package.json` `resize-marco` path; rule `/team/* /about/team/:splat 301` placed after exact rules | Photos untouched; 7 explicit `/team/<slug> /about/team/<slug> 301` lines plus exact `/team`, `/team/`, `/about/team` rules; no splat |
| Old photo URLs (e.g. hotlinked from staff email signatures, `*-sig.png` assets, commit `7bd4953`) | Keep working via 301 then 200 (one extra hop; some email clients may not follow redirects on images) | Keep working, direct 200, no hop |
| Future members | Nothing to do | Never had a `/team` URL, so no line needed; list effectively frozen at 7 |
| Unknown `/team/<anything-else>` | 301 to `/about/team/...`, then 404 | 404 directly |
| Guard test | Every `member.photo` exists under `public/`; `_redirects` lines all carry explicit 301 | One `/team/<slug>` line per member, and **no** `/team/*` splat line |
| Main risk | Email-client image redirect not followed breaks signature images | A missed slug silently breaks that person's printed QR card (guarded by test) |

**Recommendation: Option B.** The legacy URL namespace is closed (7 pre-v1.1 members), so "every new member needs a line" does not really apply. Option B is the smaller diff (no file moves, no `members.ts` change) and puts zero redirect hops in front of images used in external email signatures we cannot see or update. Option A is cleaner only if the `/team/` namespace were still growing. Confirm before requirements whether any signature or external page actually hotlinks `/team/<slug>.png`; if none does, both options are equally safe and A is acceptable.

## Key Findings

### Recommended Stack

Zero new dependencies. Everything is already in the repo.

**Core technologies:**
- **Next.js App Router file move** (`src/app/team/[slug]` to `src/app/about/team/[slug]`): existing `generateStaticParams()` works unchanged under a static parent segment.
- **Cloudflare Pages `public/_redirects`**: the only redirect mechanism under `output: "export"`. Top-most match wins (exact rules before splat/placeholder), default code is **302** (always write `301`, matching the `/r4u` rule), fragments allowed in destination (`/team /about#team 301` valid), limit 2,000 static + 100 dynamic rules.
- **One small `'use client'` component on `/`** for `/#team` to `/about#team` (and optionally `/#about` to `/about`), using `location.replace` and preserving `location.search`. PITFALLS prefers an inline script for no flash; ARCHITECTURE/STACK prefer `useEffect` to avoid `dangerouslySetInnerHTML`. Either is fine; `useEffect` matches house patterns.
- **Keep `trailingSlash` default (false).** Pages already 308s `/x/` to `/x` (live probe).
- **QR codes need no change:** `generateVCard()` has no `URL:` field. Printed cards are covered by the 301s only.

### Expected Features

**Must have (table stakes):**
- `/about` with Mission, History, Team, in that order, exact anchors `id="mission"`, `id="history"`, `id="team"`, plus `scroll-margin-top` (nav is `position: fixed`; site has no `scroll-margin-top` today).
- Team grid moved to `/about#team`, reusing `members` + `MemberCard` (href to `/about/team/${slug}`).
- Nav "Team" `/#team` changed to "About us" `/about` (`Nav.tsx:12`). Mandatory, not cosmetic: Nav uses `next/link`, and App Router client navigation does not reload the page, so the `/#team` hop never runs for internal clicks.
- Homepage: remove `#about` and `#team` sections, add a one-to-two-line mission teaser + "More about us" link; avoid duplicating the hero subline.
- Legacy URLs: `/team/<slug>` 301 to `/about/team/<slug>`, `/team` and `/team/` 301 to `/about#team`, `/#team` client hop. Note `/team` is 404 today, so those lines are a bonus.
- Profile pages breadcrumbs `Home > About us > Name` (existing `Breadcrumbs.tsx`; `BusinessCard` `padding-top: 7rem` may need reducing).
- `/about` metadata (title `About us | European Resolve`, description, no em dashes).
- Sitemap: add `/about`; member pages **decision needed** (see Gaps, ADR-005).

**Should have (differentiators, P2):**
- Footer legal line on every page: KBO/BCE enterprise number, registered office address, "RPR/RPM" + court district (DNS Belgium: mandatory for Belgian non-profit sites; footer lacks them today). Code is one line; **blocked on org data**. Ship in v1.1 if data arrives, else next.
- EU Transparency Register ID (if registered), closing CTA on `/about` (contact or events), History narrated through Run for Ukraine 2026 with a link to `/events`.

**Defer (v2+):** Organization JSON-LD (needs legal data), member bios (copy + schema change), governance/accounts links, Vision/Values sections.

**Anti-features:** separate `/about/mission|history|team` sub-pages; empty "coming soon" History; meta-refresh stub pages at the old route; CMS/MDX/i18n library for a few paragraphs.

### Architecture Approach

Unchanged build-time data flow: `members.ts` feeds the `/about` grid and `about/team/[slug]` (`generateStaticParams`, metadata, QR). Prose (Mission, History, teaser) is inline JSX, like the homepage About block and `privacy/page.tsx`. A `src/data/history.ts` typed array is justified only if History arrives as dated milestones.

**Major components:**
1. `src/app/about/page.tsx` (+ CSS module, styles moved from homepage `.about*` / `.team*`): Mission, History, Team sections with anchors.
2. `src/app/about/team/[slug]/page.tsx`: moved as-is, plus breadcrumbs.
3. `public/_redirects`: legacy `/team*` rules (shape depends on the open decision).
4. Legacy hash hop component mounted on `/` only.
5. Touched: `MemberCard.tsx:7`, `Nav.tsx:12`, `src/app/page.tsx`, `src/app/sitemap.ts`, `Footer.tsx` (optional legal line), CLAUDE.md entry-points table.

### Critical Pitfalls

1. **Photo collision with `/team/*` redirect.** Resolve via the open decision; guard with a test either way.
2. **Non-atomic cut-over.** Route move alone 404s every printed card; redirects alone point at nothing. Route move + `_redirects` ship in the **same deploy** (trunk-based, every push to `main` deploys).
3. **Implicit 302.** Every new rule needs explicit `301`; add a test that every `_redirects` line carries a code.
4. **`/#team` hop that traps Back or never fires.** Use `location.replace`, exact hash match, preserve query; remove every internal `/#team` link (only `Nav.tsx:12` today) and add a grep test banning `"/#team"` in `src/` outside the hop.
5. **Testing only in `next dev`.** `_redirects` is ignored locally. Run a `curl -sI` matrix on the Cloudflare **preview** deploy before merging (301s are cached hard by browsers): `/team/<slug>` 301 to `/about/team/<slug>`; `/team/<slug>.png` 200 (B) or 301 then 200 (A); `/team`, `/team/` 301 to `/about#team`; `/r4u/x` still 301; final hop count at most 2.

Also: tests updated "to green" instead of to intent. Existing assertions hardcode old paths at `src/__tests__/members.test.ts:68` (photo path, changes only under Option A) and `src/__tests__/components.test.tsx:131-134` (MemberCard href; also `:89` Nav label per PITFALLS), plus `qr.test.ts` fixture photo paths. Add a render test that `/about` has `id="team"` and an em-dash test over new copy and metadata (copy `AccountabilityReport.test.tsx`).

## Implications for Roadmap

Two phases suffice; split by the only hard external dependency (org-supplied copy and legal data).

### Phase 1: About page, route move and redirects (one deploy)
**Rationale:** No copy dependency; the pieces are interlocked (redirects need `/about#team` and `/about/team/<slug>` to exist; Nav and homepage changes need `/about`). Small enough to be one phase and one PR.
**Delivers:** `/about` (Mission using current homepage About copy + draft line as interim, Team grid, anchors, `scroll-margin-top`, metadata); `/about/team/[slug]` with breadcrumbs; `MemberCard` href; `_redirects` with explicit 301s (Option A or B); hash hop on `/`; Nav "About us"; homepage teaser; sitemap `/about`; updated + new guard tests; CLAUDE.md entry points; preview curl matrix.
**Addresses:** all P1 table stakes except History copy.
**Avoids:** pitfalls 1-5, anchor/nav overlap, stale tests.
**History handling:** omit the section (and its anchor) until real copy exists; do not ship a placeholder.

### Phase 2: Content and legal drop-in (blocked on org)
**Rationale:** Only JSX text and one footer line; independent of Phase 1 mechanics but gated on external input.
**Delivers:** Final Mission copy, History section, final teaser, footer legal line (enterprise number, registered office, RPR + court), optional Transparency Register ID and closing CTA.
**Avoids:** em dashes in copy; defenders wording uses both forms (`захисниць і захисників`) if it appears.

### Phase Ordering Rationale

- Redirect targets must exist before or with redirects, so page, move and redirects are co-deployed.
- Content waits on the org and must not block the URL work, which has no external dependency.
- Phase 1 verification on a preview deploy before `main`.

### Research Flags

Phases needing deeper research during planning:
- **None need `--research-phase`.** Mechanics are documented and probed against production. Phase 1 needs a **preview-deploy curl verification**, not more research (it settles the one doc gap: whether a `/team/*` splat matches `/team` or `/team/`; exact rules sidestep it).

Phases with standard patterns (skip research): Phase 1 (route move, `_redirects`, client hop), Phase 2 (copy drop-in).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js and Cloudflare official docs, live curl probes of production, repo inspection |
| Features | MEDIUM | NGO page conventions from practitioner blogs; Belgian disclosure from DNS Belgium guidance (statute text not checked) |
| Architecture | HIGH | Direct repo inspection; follows existing patterns |
| Pitfalls | HIGH | Docs + live probes; seam behaviours (splat matching empty, zone rules) unverified |

**Overall confidence:** HIGH

### Gaps to Address

- **Photo/redirect option (A vs B):** user decides during requirements. Check whether any external email signature hotlinks `/team/<slug>.png`.
- **URL printed on physical business cards:** repo QR is a URL-less vCard, so what is printed is unknown. Confirm the exact form (`www.` or not, trailing slash or not) and add that exact string to the curl matrix.
- **Member pages in sitemap:** not listed today; ADR-005 treats public staff exposure as a threat surface. ARCHITECTURE recommends `/about` only; PITFALLS/STACK suggest listing members generated from `members`. Decide in requirements; default to `/about` only.
- **Canonicals:** STACK and PITFALLS want absolute `alternates.canonical` via `BASE_URL` (event layouts already do this); ARCHITECTURE says skip since there is no `metadataBase`. Recommendation: add absolute canonicals, cheap and avoids mixed signals.
- **Mission/History copy and footer legal data** (enterprise number, registered office, RPR court): org-supplied; Phase 2 is blocked on them.
- **Breadcrumb vs `BusinessCard` top padding:** visual check in Phase 1.
- **Cloudflare zone-level rules** on the custom domain could override `_redirects`; needs someone with dashboard access.
- **Splat matching an empty remainder** (`/team/*` vs `/team`): undocumented; neutralized by exact rules, confirmed by curl.

## Sources

### Primary (HIGH confidence)
- Cloudflare Pages Redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare Pages Serving Pages: https://developers.cloudflare.com/pages/configuration/serving-pages/
- Next.js Static Exports guide (Unsupported Features): https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/static-exports.mdx
- Live `curl` probes of https://european-resolve.org on 2026-11-15
- Repo inspection: `next.config.ts`, `public/_redirects`, `src/data/members.ts`, `src/lib/qr.ts`, `Nav.tsx`, `Nav.module.css`, `MemberCard.tsx`, `Breadcrumbs.tsx`, `sitemap.ts`, `src/__tests__/*`

### Secondary (MEDIUM confidence)
- DNS Belgium guidance on mandatory website information
- NGO About-page practitioner guides (structure, ordering, homepage teaser)

### Tertiary (LOW confidence)
- Third-party write-ups on Cloudflare Pages routing and trailing-slash behaviour
- Workers static-assets redirect changelog (2025-08-15)

---
*Research completed: 2026-11-15*
*Ready for roadmap: yes*
