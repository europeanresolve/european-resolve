# Stack Research

**Domain:** Static org site restructure (About Us section, route move with permanent redirects)
**Milestone:** v1.1 About Us
**Researched:** 2026-11-15
**Confidence:** HIGH (official docs + live probes of production `european-resolve.org`)

## Verdict

**Zero new dependencies. Zero config changes to `next.config.ts`.** Everything v1.1 needs is already in the stack:

- Route move: Next.js App Router file move (`src/app/team/[slug]` → `src/app/about/team/[slug]`) with the existing `generateStaticParams()`.
- Permanent redirects: Cloudflare Pages `public/_redirects` (already in use for `/r4u/:slug`).
- Legacy `/#team` hop: one tiny `'use client'` component using `window.location.replace` (same opt-in client pattern as `EventTimeline` / `ObfuscatedEmail`).
- Sitemap / metadata / breadcrumbs: existing `src/app/sitemap.ts`, Next `Metadata` API, `src/components/ui/Breadcrumbs.tsx`.

## Recommended Stack

### Core Technologies (unchanged)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | `^16.2.6` (latest on npm: 16.4.6) | App Router static export | Already used. No bump needed for this milestone; nothing here depends on 16.3+ features. |
| Cloudflare Pages `_redirects` | platform feature | 301s from `/team*` to `/about*` | Only redirect mechanism that works with `output: "export"` (see below). Already proven in this repo by the `/r4u/:slug` rule. |
| React 19 client component | `^19.2.6` | `/#team` → `/about#team` hop | Fragments never reach the server, so this cannot be done in `_redirects`. A ~10-line `useEffect` is the whole solution. |

### Supporting Libraries

None to add. `qrcode` stays as is (see QR finding below).

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `curl -sI` against a Cloudflare Pages **preview deployment** | Verify redirect matrix before merging to `main` | Preview URLs honor `_redirects`. 301s get cached hard by browsers, so verify on preview first. |
| Vitest (existing) | Update tests that hardcode `/team/...` | `members.test.ts:68`, `components.test.tsx:131-134` assert the old paths. |

## Key Findings (evidence)

### 1. Next.js static export cannot do redirects: confirmed (HIGH)

Next.js docs "Static Exports > Unsupported Features" list **Redirects**, **Rewrites**, **Headers** and **Proxy** (formerly middleware) as unsupported with `output: "export"`. `redirects()` in `next.config.ts` is therefore not an option. `redirect()` / `permanentRedirect()` from `next/navigation` in a page would only emit a client-side meta/JS redirect with a 200 status, which is bad for SEO and old QR links. Use `_redirects`.

### 2. `trailingSlash` is NOT set in this repo (HIGH, verified in `next.config.ts`)

`next.config.ts` = `output: "export"` + `images.unoptimized` only. Default `trailingSlash: false` means pages emit as `out/about.html` and `out/about/team/<slug>.html`.

- Having both `out/about.html` and an `out/about/` directory is fine on Cloudflare Pages: production already does exactly this with `out/events.html` + `out/events/2026-run-for-ukraine/...` (live probe: `/events` → 200).
- Live probes show Cloudflare Pages normalizes: `/events/` → **308** `/events`, `/events.html` → **308** `/events`, `/team/serhiy-onyshchenko/` → **308** `/team/serhiy-onyshchenko`.
- Do not introduce `trailingSlash: true`; it would change every existing URL's canonical form for no benefit.

### 3. Cloudflare Pages `_redirects` semantics (HIGH, official docs + live probe)

| Question | Answer | Source |
|----------|--------|--------|
| Syntax | `[source] [destination] [code?]`, `#` comments | CF docs |
| Default code | **302**. Always write `301` explicitly. | CF docs |
| Supported codes | 301, 302, 303, 307, 308 (200 = proxy) | CF docs |
| 301 vs 308 | Use **301**, matching the existing `/r4u` rule. All traffic is GET; 308's method preservation is irrelevant, and 301 is the most universally understood "moved permanently" by crawlers and old QR scanner apps. | judgement |
| Precedence | **Top-most matching rule wins.** Put static (exact) rules before dynamic (splat/placeholder) rules. | CF docs |
| Redirect vs existing file | **"Redirects are always followed, regardless of whether or not an asset matches the incoming request."** A source path that exists as a built file is still redirected. | CF docs |
| Splat | `*` greedily matches all characters, one per rule, referenced as `:splat` | CF docs |
| Placeholder | `:name` matches up to the next `/`. Live probe: `/r4u/abc/` → **404**, `/r4u` → 404 (placeholder does not absorb a trailing slash or match empty). | live probe |
| Splat matching empty / bare `/team` | **Not documented.** Unknown whether `/team/*` matches `/team` or `/team/`. Mitigate with explicit exact rules above the splat. | gap |
| Fragments | Ignored in source; **allowed in destination** (so `/team /about#team 301` is valid). | CF docs |
| Query strings | Not matchable in source | CF docs |
| Limits | 2,000 static + 100 dynamic rules | CF docs |

### 4. CRITICAL: `/team/*` splat would also redirect the member photos (HIGH)

Member photos live at `public/team/<slug>.png` (`src/data/members.ts`, e.g. `photo: "/team/michael-desloover.png"`; live probe `/team/serhiy-onyshchenko.png` → 200). Because Cloudflare follows redirects even when an asset exists, `/team/* /about/team/:splat 301` sends `/team/x.png` → `/about/team/x.png`, which 404s unless photos move too.

**Recommendation: move photos to `public/about/team/<slug>.png`** and update `photo` paths in `members.ts`. Then the same splat rule keeps any old externally-embedded photo URL working for free (`/team/x.png` → `/about/team/x.png` → 200), and nothing else needs special-casing. Update `members.test.ts:68` (asserts `` `/team/${m.slug}.png` ``) and the stale `resize-marco` script path in `package.json`.

Alternative (worse): keep photos in `/team/` and replace the splat with one exact rule per member slug (7 lines). Works, but every future member needs a manual line and old photo URLs still collide with nothing. Only pick this if moving files is undesirable.

### 5. QR codes do NOT encode the profile URL: no change needed (HIGH, verified in `src/lib/qr.ts`)

`generateVCard()` emits only `BEGIN/VERSION/N/FN/ORG/TITLE/EMAIL/TEL/END`. There is **no `URL:` field**, so the on-page QR codes are URL-independent and need no update when the route moves. The *printed* business cards (whose QR presumably encodes `https://european-resolve.org/team/<slug>`) are not generated by this code; they are covered purely by the `_redirects` 301. Adding a `URL:` line pointing at the new canonical page is optional scope, not required by this milestone.

### 6. Legacy `/#team` (HIGH)

`#team` never reaches Cloudflare, so `_redirects` cannot handle it. Current nav links to `/#team` (`src/components/layout/Nav.tsx:12`). After the homepage team section is removed, add a small client component on the homepage:

```tsx
"use client";
import { useEffect } from "react";
// Fragments never hit the server; hop legacy /#team links to the new section.
export function LegacyTeamHashRedirect() {
  useEffect(() => {
    if (window.location.hash === "#team") window.location.replace("/about#team");
  }, []);
  return null;
}
```

`location.replace` avoids leaving a back-button trap. No router library, no `next/navigation` needed.

## Recommended `_redirects`

```
# Short URL for participant fundraising pages
/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301

# v1.1: team moved under /about (printed QR business cards point at /team/<slug>)
/team         /about#team 301
/team/        /about#team 301
/about/team   /about#team 301
/about/team/  /about#team 301
/team/*       /about/team/:splat 301
```

Exact rules first (top-most wins), splat last. `/team/<slug>/` (trailing slash) yields `/about/team/<slug>/`, which Pages then 308s to `/about/team/<slug>`: two hops, acceptable. The `/about/team` lines are a nicety for people trimming the URL (there is no index page there). Note `/team` and `/team/` are **404 today** (live probe), so those two lines are an improvement, not a regression fix.

## Integration Points (files that must change)

| File | Change |
|------|--------|
| `src/app/team/[slug]/page.tsx` | `git mv` to `src/app/about/team/[slug]/page.tsx`; add `alternates.canonical` (absolute URL, root layout has no `metadataBase`) |
| `src/app/about/page.tsx` (+ `page.module.css`) | New: Mission, History, Team (`id="team"`) |
| `src/components/ui/MemberCard.tsx:7` | `/team/${slug}` → `/about/team/${slug}` |
| `src/components/layout/Nav.tsx:12` | `/#team` "Team" → `/about` "About us" |
| `src/app/page.tsx` | Replace `#about` / `#team` with teaser + mount hash-hop component |
| `src/app/sitemap.ts` | Add `/about` and `/about/team/<slug>` (map over `members`); team pages are not listed today |
| `public/_redirects` | Rules above |
| `public/team/*.png` → `public/about/team/*.png`, `src/data/members.ts` | Photo move (finding 4) |
| `src/__tests__/members.test.ts`, `components.test.tsx` | Path assertions |
| `CLAUDE.md` entry-points table, `package.json` `resize-marco` | Stale `/team` references |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `public/_redirects` | Cloudflare Bulk Redirects (account-level) | Only past 2,100 rules or for cross-domain redirects. Overkill here. |
| `public/_redirects` | Keep a stub page at `/team/[slug]` with `<meta http-equiv="refresh">` | Never: returns 200, duplicates content, and Cloudflare would redirect the path anyway before serving it. |
| 301 | 308 | Equivalent for GET; stick with 301 for consistency with the existing rule. |
| Client `location.replace` for `/#team` | Keeping a hidden `#team` anchor on the homepage | Only if you want zero JS; but then legacy links land on a page without the team. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `redirects()` in `next.config.ts` | Unsupported with `output: "export"` (Next docs) | `public/_redirects` |
| `proxy.ts` / middleware | Unsupported with static export | `_redirects` |
| `redirect()` / `permanentRedirect()` in a page | Static export renders a 200 HTML page with a client redirect, not a real 301 | `_redirects` |
| `trailingSlash: true` | Changes every existing canonical URL, adds redirect hops | Leave default |
| Pages Functions for redirects | Adds a runtime to a fully static site; `_redirects` is not even applied to Function routes | `_redirects` |
| Any i18n / CMS / MDX library for Mission/History copy | Copy is short and arrives later; the project convention is typed TS data, no JSON/CMS | Inline JSX or a `src/data/about.ts` const |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next@^16.2.6` | `output: "export"` + `generateStaticParams` nested under a static segment (`/about/team/[slug]`) | Standard; same as current `/team/[slug]` |
| `qrcode@^1.5.4` | unchanged | vCard has no URL field; nothing to update |

## Sources

- Cloudflare Pages Redirects docs (HIGH): https://developers.cloudflare.com/pages/configuration/redirects/ (default 302, supported codes, top-most wins, "Redirects are always followed, regardless of whether or not an asset matches", fragments, limits)
- Cloudflare Pages Serving Pages docs (HIGH): https://developers.cloudflare.com/pages/configuration/serving-pages/ (`.html` → extensionless, 404.html lookup)
- Next.js Static Exports guide, canary docs source (HIGH): https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/static-exports.mdx (Unsupported Features: Redirects, Rewrites, Headers, Proxy; `trailingSlash` emits `/me/index.html` vs `/me.html`)
- `npm view next version` → 16.4.6 (HIGH)
- Live `curl` probes of https://european-resolve.org on 2026-11-15 (HIGH, empirical): `/events/` 308, `/events.html` 308, `/r4u/abc` 301, `/r4u/abc/` 404, `/team/<slug>` 200, `/team/<slug>.png` 200, `/team` 404
- Repo inspection: `next.config.ts`, `public/_redirects`, `src/lib/qr.ts`, `src/data/members.ts`, `src/components/layout/Nav.tsx`, `src/components/ui/MemberCard.tsx`, `src/app/sitemap.ts`, tests
- Gap (LOW, unverified): whether a Cloudflare splat matches an empty remainder (`/team/*` vs `/team`, `/team/`). Neutralized by explicit exact rules; confirm with the preview-deploy curl matrix.
