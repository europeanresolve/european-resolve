# Architecture Research

**Domain:** v1.1 About Us. Adding an `/about` page and moving team profiles in an existing Next.js 16 static-export site on Cloudflare Pages
**Researched:** 2026-11-15
**Confidence:** HIGH (all integration points read directly from the repo; Cloudflare `_redirects` behaviour checked against the official docs)

## Standard Architecture

### System Overview

Nothing new at the system level. This milestone adds two static routes, deletes one, adds redirect rules at the CDN edge, and adds one tiny client component. There is no new runtime, no data source, and no backend change.

```
┌──────────────────────────── Cloudflare Pages edge ─────────────────────────────┐
│ public/_redirects (runs BEFORE static assets; first match wins)                │
│   /team, /team/        -> /about#team             301                          │
│   /team/<slug> (x7)    -> /about/team/<slug>      301   (static, per member)   │
│   /about/team          -> /about#team             301                          │
│   /team/<slug>.png     -> NOT matched, served from public/team/ as before      │
├──────────────────────────── Static HTML (out/) ────────────────────────────────┤
│  /            (page.tsx)      hero + mission teaser + <LegacyHashRedirect/>    │
│  /about       (about/page.tsx)  #mission  #history  #team (MemberCard grid)    │
│  /about/team/[slug]           Breadcrumbs + BusinessCard (moved route)         │
├──────────────────────────── Build-time data ───────────────────────────────────┤
│  src/data/members.ts (unchanged)    src/lib/qr.ts (unchanged, vCard has no URL)│
└────────────────────────────────────────────────────────────────────────────────┘
Client only: LegacyHashRedirect reads location.hash (#team / #about) on "/" and
location.replace()s to /about#team or /about. Fragments never reach the server,
so this cannot be done in _redirects.
```

### Component Responsibilities

| Component | Status | Responsibility | Implementation |
|-----------|--------|----------------|----------------|
| `src/app/about/page.tsx` | NEW | Mission (full), History, Team sections; page metadata | Server component, inline JSX copy, `members.map(MemberCard)` moved from homepage |
| `src/app/about/page.module.css` | NEW | Section styles | Move `.about*`, `.team*`, `.grid` rules out of `src/app/page.module.css` |
| `src/app/about/team/[slug]/page.tsx` | MOVED (`git mv` from `src/app/team/[slug]/page.tsx`) | Member business card | Same `generateStaticParams` / `generateMetadata`; add `<Breadcrumbs>` |
| `src/components/ui/LegacyHashRedirect.tsx` | NEW | `/#team` -> `/about#team`, `/#about` -> `/about` | `'use client'`, one `useEffect`, returns `null` |
| `src/app/page.tsx` | MODIFIED | Hero + mission teaser linking `/about` | Delete `#about` and `#team` sections and the `members`/`MemberCard` imports; render `<LegacyHashRedirect />` |
| `src/app/page.module.css` | MODIFIED | Hero + teaser | Drop `.team`, `.teamInner`, `.teamHeading`, `.grid`; reuse/rename `.about*` for the teaser |
| `src/components/layout/Nav.tsx` | MODIFIED | `Team` (`/#team`) -> `About us` (`/about`) | One line |
| `src/components/ui/MemberCard.tsx` | MODIFIED | Card link | `` `/team/${slug}` `` -> `` `/about/team/${slug}` `` |
| `src/app/sitemap.ts` | MODIFIED | Add `/about` | One entry (see decision below on member pages) |
| `public/_redirects` | MODIFIED | Legacy URL 301s | Static lines, see Pattern 1 |
| `src/components/ui/Breadcrumbs.tsx` | UNCHANGED | Reused as is on member page | Already generic `{label, href?}[]` |
| `src/components/ui/BusinessCard.tsx`, `src/lib/qr.ts`, `src/data/members.ts` | UNCHANGED | | vCard contains no site URL, so printed QR codes are unaffected. Photos stay at `/team/<slug>.png` |

## Full Change Inventory (grep of `/team`, `#team`, `#about`, `team/`)

Grep scope: `src`, `public`, `backend`, `docs`, tests, config. **The backend has zero references** to team or about URLs (emails only reference `info@` and `olena.kuzhym@` addresses). No email template, signature, or QR payload in the repo embeds a team URL.

| File | Line(s) | Current | Change |
|------|---------|---------|--------|
| `src/components/layout/Nav.tsx` | 12 | `<Link href="/#team">Team</Link>` | `<Link href="/about">About us</Link>` |
| `src/components/ui/MemberCard.tsx` | 7 | `` href={`/team/${member.slug}`} `` | `` href={`/about/team/${member.slug}`} `` |
| `src/app/page.tsx` | 28-57 | `<section id="about">`, `<section id="team">` | Remove both; add teaser section + `<LegacyHashRedirect />` |
| `src/app/team/[slug]/page.tsx` | whole file | route `/team/[slug]` | `git mv` to `src/app/about/team/[slug]/page.tsx`; delete empty `src/app/team/` |
| `src/app/sitemap.ts` | list | no `/about`, no member pages | add `${BASE_URL}/about` |
| `public/_redirects` | append | only `/r4u/:slug` rule | add rules from Pattern 1 |
| `src/__tests__/components.test.tsx` | 87-90 | `renders Team link` / `getByText("Team")` | `renders About us link` / `getByText("About us")` |
| `src/__tests__/components.test.tsx` | 131-135 | `links to /team/{slug}` expects `/team/test-person` | expect `/about/team/test-person` |
| `src/__tests__/components.test.tsx`, `qr.test.ts` | 34, 128; 15, 142 | fixture `photo: "/team/..."` | **No change** (photos do not move) |
| `src/__tests__/members.test.ts` | 66-70 | photo path `/team/${slug}.png` | **No change**; add a sibling test asserting every member has a `_redirects` line (Pattern 1) |
| `src/data/members.ts` | photo fields | `/team/<slug>.png` | **No change** |
| `CLAUDE.md` | 190 (Entry Points table) | `Team Member | /team/[slug]` | `/about/team/[slug]`; add `About | /about` row. Regenerated section, so fix via the GSD docs flow, not by hand |
| `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md` | entry point tables | `/team/[slug]` | same update (doc hygiene, not blocking) |
| `package.json` | 14 | `resize-marco` script with an absolute path into `public/team/` | No change needed; it is already a stale one-off script pointing outside this worktree |

Not affected: `public/_headers` (only `/icons/*-sig.png`), `robots.ts`, `layout.tsx`, all `events/` routes, all locales (site chrome is English-only; `src/locales/` serves only the run-for-ukraine subtree).

## Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                      # MODIFIED: hero + mission teaser + LegacyHashRedirect
│   ├── page.module.css               # MODIFIED: team/grid rules removed
│   ├── about/
│   │   ├── page.tsx                  # NEW: #mission, #history, #team
│   │   ├── page.module.css           # NEW: rules moved from app/page.module.css
│   │   └── team/
│   │       └── [slug]/page.tsx       # MOVED from app/team/[slug]/page.tsx
│   └── sitemap.ts                    # MODIFIED
├── components/
│   ├── layout/Nav.tsx                # MODIFIED
│   └── ui/
│       ├── MemberCard.tsx            # MODIFIED (href)
│       └── LegacyHashRedirect.tsx    # NEW ('use client')
public/
├── _redirects                        # MODIFIED
└── team/*.png                        # UNCHANGED (stays put, see Pattern 1)
```

### Structure Rationale

- **`about/team/[slug]` nested under `about/`:** static export emits `out/about.html` plus `out/about/team/<slug>.html`. The repo already ships this file-plus-directory shape (`out/events.html` + `out/events/2026-run-for-ukraine/...`), so Cloudflare Pages resolution is proven for it.
- **No new `TeamGrid` component:** the grid is a `div` + `members.map(MemberCard)` used in exactly one place after the move. Move the JSX and CSS; do not extract.
- **`LegacyHashRedirect` in `components/ui/`:** matches the existing `'use client'` leaf pattern (`ObfuscatedEmail`, `EventTimeline`). Keeps `app/page.tsx` a server component.

## Architectural Patterns

### Pattern 1: Per-member static redirects; photos stay in `public/team/`

**What:** Cloudflare Pages docs: *"Redirects are always followed, regardless of whether or not an asset matches the incoming request."* A splat `/team/* /about/team/:splat 301` would therefore redirect `/team/marco-melega.png` to `/about/team/marco-melega.png`, which is a 404. A `:slug` placeholder does not help either: it matches every character except `/`, so it would also match `marco-melega.png`. The docs do not define suffix patterns like `:name.png`; do not rely on them.

**Decision: keep photos where they are and write one static redirect per member.**

```
# About us move (v1.1). Static rules, one per member. Do NOT use /team/* : _redirects
# runs before assets and would swallow /team/<slug>.png photos.
/team                         /about#team                     301
/team/                        /about#team                     301
/about/team                   /about#team                     301
/team/michael-desloover       /about/team/michael-desloover   301
/team/liza-bezvershenko       /about/team/liza-bezvershenko   301
/team/olena-kuzhym            /about/team/olena-kuzhym        301
/team/benjamin-lemerle        /about/team/benjamin-lemerle    301
/team/ivan-zinchenko          /about/team/ivan-zinchenko      301
/team/serhiy-onyshchenko      /about/team/serhiy-onyshchenko  301
/team/marco-melega            /about/team/marco-melega        301
```

Fragments in the destination (`/about#team`) are explicitly supported by Cloudflare (`/page/ /page2/#fragment 301` is their own example). Static rules count toward a 2,000-line limit, so this has plenty of headroom.

**Why not move photos instead (for example to `public/images/team/`) and keep the splat?** The repo hosts `*-sig.png` icons for **staff HTML email signatures** (commit `7bd4953`), and those signatures live outside the repo. If any signature or external profile hotlinks `european-resolve.org/team/<slug>.png`, moving the photos plus a splat breaks it silently, with no build error. Keeping photos in place has zero hotlink risk and the smallest diff: `members.ts`, `members.test.ts`, and two test fixtures stay untouched.

**Trade-off:** a new member needs a new `_redirects` line, but only if they ever had a `/team/` URL. Members added after v1.1 never did, so in practice the list is frozen at these 7. Guard it with one test in `src/__tests__/members.test.ts`:

```ts
import { readFileSync } from "node:fs";
it("every member has a legacy /team redirect and no splat swallows photos", () => {
  const r = readFileSync("public/_redirects", "utf8");
  expect(r).not.toMatch(/^\/team\/\*/m);
  // shortcut: checks members existing at v1.1; members added later never had /team URLs
  for (const m of members) {
    expect(r).toMatch(new RegExp(`^/team/${m.slug}\\s+/about/team/${m.slug}\\s+301`, "m"));
  }
});
```

(If a later member's test fails, the fix is to add their line too. It costs nothing and keeps the test simple.)

### Pattern 2: Client-side hash redirect for `/#team` and `/#about`

**What:** URL fragments are never sent to the server, so `_redirects` cannot see `/#team`. A leaf client component on the homepage handles it.

```tsx
"use client";

import { useEffect } from "react";

const LEGACY: Record<string, string> = { "#team": "/about#team", "#about": "/about" };

export function LegacyHashRedirect() {
  useEffect(() => {
    const to = LEGACY[window.location.hash];
    if (to) window.location.replace(to); // replace: keep the dead URL out of history
  }, []);
  return null;
}
```

**When:** only on `/`. Once Nav changes, no internal link produces `/#team`, so this only serves bookmarks, old shares, and search snippets.
**Trade-offs:** the homepage paints briefly before the redirect. That is acceptable for a legacy path. An inline `<script>` in `<head>` would be faster, but it means `dangerouslySetInnerHTML` for no real gain.
**Test:** one small Vitest case that sets `window.location.hash = "#team"`, stubs `window.location.replace`, renders, and asserts it was called with `/about#team`.

### Pattern 3: Prose copy as inline JSX in the page (not a TS data file)

**What:** Mission and History copy go directly in `src/app/about/page.tsx` as JSX, and the teaser goes directly in `src/app/page.tsx`.
**Why this follows repo conventions:** every prose page in the site does this: the homepage About block (`page.tsx` lines 28-45) and the Privacy Policy (`privacy/page.tsx`). `src/data/*.ts` with `satisfies` is used for **structured, repeated records** (`members`, `event`), not paragraphs. There is no i18n for site chrome, so a locale file is not justified either.
**Exception:** if the History copy arrives as dated milestones (year + text, rendered as a list or timeline), put it in `src/data/history.ts` as a typed array with `satisfies`, following `members.ts`. Decide when the copy arrives. Do not pre-build it.
**Copy rules from CLAUDE.md:** no em dashes in user-facing copy, and use both forms when referring to defenders (`захисниць і захисників`) if any Ukrainian or defender wording appears.

### Pattern 4: Section anchors under a fixed Nav

`Nav.module.css` `.header` is `position: fixed`, and the site has no `scroll-margin-top` anywhere. Today `/#team` only lands correctly because `.team` has `padding-top: 6rem`. On `/about`, give `#mission`, `#history`, and `#team` `scroll-margin-top` equal to the nav height, or keep the 6rem top padding when moving the CSS. Otherwise `/about#team`, which is the target of three redirects, lands with the heading hidden under the nav.

## Data Flow

### Request flows after v1.1

```
GET /team/marco-melega      -> _redirects 301 -> /about/team/marco-melega -> out/about/team/marco-melega.html
GET /team/marco-melega.png  -> no rule matches -> public/team/marco-melega.png (unchanged)
GET /team                   -> _redirects 301 -> /about#team -> out/about.html, browser scrolls to #team
GET /#team                  -> out/index.html -> hydrate -> LegacyHashRedirect -> replace(/about#team)
Click Nav "About us"        -> next/link -> /about
Click MemberCard on /about  -> next/link -> /about/team/<slug>
Breadcrumb on member page   -> "About us" (/about) > "Team" (/about#team) > <Name>
```

### Build-time data flow

Unchanged. `members.ts` feeds `about/page.tsx` (grid) and `about/team/[slug]/page.tsx` (`generateStaticParams`, `generateMetadata`, `generateQRSvg`). `sitemap.ts` keeps a hardcoded list.

### Decisions the roadmap must capture

1. **Member pages in the sitemap?** They are not listed today. ADR-005 says the org treats public exposure of staff as a threat surface ("well-indexed, SEO-optimized website" has a different threat profile). Recommendation: add `/about` only and keep member pages out, unless the team explicitly wants them indexed. If they do, it is `...members.map(m => ({ url: \`${BASE_URL}/about/team/${m.slug}\`, priority: 0.3 }))`.
2. **Breadcrumbs on the business card:** `BusinessCard` has `padding-top: 7rem` to clear the fixed nav. Adding `<Breadcrumbs>` above it requires reducing that padding, or the card drops visibly. This is a design check, not an architecture risk.
3. **Metadata:** `/about` gets `title: "About us | European Resolve"` plus a description. Member page metadata is unchanged. No `metadataBase` is set, so skip `alternates.canonical`. The 301s already consolidate ranking signals.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 7 members (now) | Static per-member redirect lines, hardcoded array |
| 20-50 members | Same. Only legacy members need lines; new ones never had `/team/` URLs |
| Hundreds | Out of scope for a small NGO. Would justify generating `_redirects` at build or using Cloudflare Bulk Redirects |

## Anti-Patterns

### Anti-Pattern 1: `/team/* /about/team/:splat 301`
**What people do:** write the obvious splat rule.
**Why it's wrong:** Cloudflare Pages applies redirects before assets, so every member photo at `/team/<slug>.png` redirects to a 404. `next build` and Vitest both pass, so this breaks silently in production. It also breaks any external hotlink (for example email signatures).
**Do this instead:** per-member static lines (Pattern 1) plus the guard test.

### Anti-Pattern 2: Putting redirects in `next.config.ts`
**What people do:** add `redirects()` to the Next config.
**Why it's wrong:** `redirects()` is not supported with `output: "export"`. Next ignores or rejects it at build, and the static `out/` never carries it.
**Do this instead:** `public/_redirects` (already used for `/r4u/:slug`).

### Anti-Pattern 3: Leaving a stub `src/app/team/[slug]/page.tsx` that renders a meta-refresh
**Why it's wrong:** it duplicates the route, and the edge redirect wins over the asset anyway, so the stub is dead code.
**Do this instead:** `git mv` the route and delete `src/app/team/`.

### Anti-Pattern 4: Extracting Mission/History prose into `src/data/about.ts` "for reuse"
**Why it's wrong:** the teaser is different, shorter copy, so nothing is actually reused. It breaks the inline-prose convention used by Home and Privacy.
**Do this instead:** inline JSX. Use a data file only if History turns out to be structured records.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Cloudflare Pages `_redirects` | Static file in `public/`, copied to `out/` | Runs before assets; first match wins; destination fragments allowed; 2,000 static / 100 dynamic limit |
| External links to old URLs (printed cards, LinkedIn, email signatures, search results) | Covered by 301s and the hash redirect | Not in the repo, so cannot be grepped. The vCard QR payload contains no URL, so printed QR codes are unaffected |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app/page.tsx` ↔ `LegacyHashRedirect` | Server page renders client leaf | Only client code added this milestone |
| `about/page.tsx` ↔ `MemberCard` ↔ `members.ts` | Direct import | Grid moves from homepage verbatim |
| `MemberCard` href ↔ `about/team/[slug]` route ↔ `_redirects` | String path convention | Three places encode `/about/team/`. The new test asserts the redirect side; the MemberCard test asserts the link side |

## Suggested Build Order

The repo deploys every push to `main` (ADR-002, trunk-based), so each step must be deployable on its own.

1. **Route move + redirects** (no copy dependency)
   - `git mv src/app/team/[slug]` to `src/app/about/team/[slug]`, add Breadcrumbs, and adjust BusinessCard top padding if needed
   - `MemberCard` href, plus its test
   - `public/_redirects` lines, plus the guard test
   - Deployable as is: the homepage `#team` grid now links to `/about/team/*`, and old `/team/*` 301s there. `/about` itself does not exist yet, so leave the `/team` -> `/about#team` lines for step 2 or ship steps 1 and 2 together.
2. **`/about` page skeleton** with `#mission`, `#history`, `#team` (grid + CSS moved from the homepage), metadata, `scroll-margin-top`, and the `/team`, `/team/`, `/about/team` -> `/about#team` redirect lines. Use the current homepage About text as interim Mission copy so nothing ships empty.
3. **Homepage + Nav cut-over**: remove the About/Team sections, add the teaser and `<LegacyHashRedirect />` (plus its test), change Nav to "About us" -> `/about` (plus the Nav test). This requires step 2 to be live.
4. **Sitemap + docs**: add `/about` to `sitemap.ts`, update the CLAUDE.md entry points through the GSD docs flow, and update `.planning/codebase/*`.
5. **Final copy drop-in** for Mission, History, and the teaser when supplied. This only touches JSX text, so it is independent of 1-4. Apply the em-dash rule and the defenders wording rule.

Steps 1-3 are small enough to be one roadmap phase ("Route & navigation restructure"). Step 5 is a separate content phase blocked on external copy.

**Verification for phase 1 (cannot be unit-tested):** after deploy, run `curl -sI https://european-resolve.org/team/marco-melega.png` and expect `200 image/png`; run `curl -sI .../team/marco-melega` and expect `301` with `location: /about/team/marco-melega`; run `curl -sI .../team` and expect `301` to `/about#team`. Cloudflare preview deployments apply `_redirects` too, so check on the preview URL before merging.

## Sources

- Cloudflare Pages redirects docs (precedence over assets, fragments in destination, placeholder/splat rules, limits): https://developers.cloudflare.com/pages/configuration/redirects/ (HIGH, official)
- Repo inspection: `src/app/page.tsx`, `src/app/team/[slug]/page.tsx`, `src/components/layout/Nav.tsx` + `Nav.module.css`, `src/components/ui/{MemberCard,Breadcrumbs,BusinessCard}.tsx`, `src/lib/qr.ts`, `src/app/sitemap.ts`, `public/_redirects`, `public/_headers`, `src/__tests__/{components,members,qr}.test.ts(x)`, `git grep` across `backend/`, `docs/adrs/005`, commit `7bd4953` (HIGH)
- Next.js static export limitation on `redirects()` (HIGH, well-established; the repo already uses `_redirects` for `/r4u/`)

---
*Architecture research for: v1.1 About Us (european-resolve.org)*
*Researched: 2026-11-15*
