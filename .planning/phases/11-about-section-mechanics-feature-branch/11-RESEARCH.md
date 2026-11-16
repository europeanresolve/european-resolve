# Phase 11: About section mechanics (feature branch) - Research

**Researched:** 2026-11-16
**Domain:** Next.js 16 static-export route move + Cloudflare Pages `_redirects` + vitest guard tests
**Confidence:** HIGH (repo read directly this session; test techniques probed in vitest this session; Cloudflare redirect rules re-read from official docs)

## Summary

Milestone research (`.planning/research/*`) already settled the mechanics: Option B redirects, `useEffect` hash hop, absolute canonicals, `/about`-only sitemap. This document does not redo that. It gives the planner the exact files and lines to touch, the test inventory to update, a guard-test design that has been probed against the real vitest setup, and the validation split between `npm test` and the Cloudflare preview.

The phase is small: 3 new source files (`src/app/about/page.tsx`, `src/app/about/page.module.css`, the hop component), 1 moved route (`src/app/team/[slug]` to `src/app/about/team/[slug]`, plus a one-rule CSS module), 7 edited files (`page.tsx`, `page.module.css`, `Nav.tsx`, `MemberCard.tsx`, `BusinessCard.module.css`, `sitemap.ts`, `public/_redirects`), 2 edited test files and 2 new test files, and a CLAUDE.md table row. Zero new dependencies.

Three things the milestone research and CONTEXT got slightly wrong, which the planner must account for:
1. **There is no em-dash test in `src/__tests__/AccountabilityReport.test.tsx`.** The only em dash there is in a `describe` title (line 36). The real pattern is `backend/src/email/render.deployment-update.test.ts:63-64` (`expect(rendered.text).not.toContain("—");`). The new guard writes its own assertion on rendered `textContent` and metadata strings.
2. **CI does not run on feature branches.** `.github/workflows/ci.yml:3-5` triggers on `push: branches: [main]` only. Lint, typecheck, test and build must be run locally before each push to the preview branch.
3. **ADR-002 says "AI agents write code but never commit, push, or create branches"** (`docs/adrs/002-trunk-based-development.md:18`). GSD commits are the accepted local workflow, but pushing the feature branch to origin (which triggers the Cloudflare preview) should be a human checkpoint.

**Primary recommendation:** 4 plans in 3 waves. Wave 1: (A) `/about` page + homepage + nav + hop + MemberCard, and (B) profile route move + breadcrumbs + canonicals + sitemap, in parallel with disjoint files. Wave 2: (C) `_redirects` + guard tests + CLAUDE.md. Wave 3: (D) human push to the feature branch + preview curl matrix + visual checks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Carried forward (decided at milestone level, do not revisit)
- **D-01:** Photo strategy Option B: photos stay at `public/team/<slug>.png`; 7 explicit `/team/<slug> /about/team/<slug> 301` lines plus exact `/team` and `/team/` → `/about#team` 301; no `/team/*` splat. — **Reversibility:** one-way — 301s are cached hard by browsers and printed business cards depend on them; only reversible before the Phase 12 merge.
- **D-02:** Route move and `_redirects` go live in the same deploy (single Phase 12 merge). Nothing from this phase reaches `main`.
- **D-03:** Nav links straight to `/about`; only external legacy fragment links use the client-side hop.
- **D-04:** Sitemap lists `/about` only; member pages stay unlisted (ADR-005).

#### About copy (final, not interim)
- **D-05:** All About copy is FINAL. No interim marker and no "interim copy" guard test are needed (the marker idea was agreed, then made moot when both sections were confirmed final).
- **D-06:** Mission/History split is "story vs purpose": History tells the founding story and ends at "...European Resolve."; the original History closing paragraph moved into Mission, replacing the core-definitions second sentence ("Through research, advocacy and public engagement...", dropped).
- **D-07:** British spelling to match the rest of the site (organisation, mobilisation, realised, defence). The supplied copy used American spelling; it is already converted below. Use the text below verbatim.
- **D-08:** Prose lives inline in JSX in `src/app/about/page.tsx` (same pattern as the current homepage About block and `privacy/page.tsx`). No `src/data/about.ts`.

#### /about page shape
- **D-09:** Page starts with an `h1` "About us", then Mission, History, Team (each an `h2` section with `id="mission"`, `id="history"`, `id="team"` and `scroll-margin-top` clearing the fixed nav). No jump-link row, no extra intro copy.
- **D-10:** Mission lead sentence set large in the serif face (Source Serif, styled like the homepage hero statement); the second paragraph is body text.
- **D-11:** Reuse existing styling: move the homepage `.about*` / `.team*` rules from `src/app/page.module.css` into `src/app/about/page.module.css` and apply them to all three sections. No `/gsd-ui-phase` design pass. *(Superseded in part: a UI-SPEC was produced and approved; it keeps D-11's substance. See `11-UI-SPEC.md`.)*

#### Homepage
- **D-12:** Teaser text is exactly the Mission lead sentence: "We exist to turn Europe's concern into resolve, and resolve into action."
- **D-13:** The teaser REPLACES the hero subline ("Research, dialogue, and civic action to reinforce European security and democracy."). Hero becomes: h1 + teaser line + "More about us" link to `/about`. Homepage `#about` and `#team` sections are removed.
- **D-14:** Link label: "More about us".

#### Profile page & legacy hops
- **D-15:** Breadcrumbs `Home > About us > Name` sit above the BusinessCard, using the existing `Breadcrumbs` component as on event pages; reduce `BusinessCard.module.css` `padding-top: 7rem` so the card does not sit lower than today. Visual check on the preview.
- **D-16:** Absolute canonicals `https://european-resolve.org/about` and `https://european-resolve.org/about/team/<slug>` via `alternates.canonical`, following the `BASE_URL` pattern in `src/app/events/2026-run-for-ukraine/layout.tsx`.
- **D-17:** The hash hop on `/` handles BOTH `/#team` → `/about#team` and `/#about` → `/about#mission`, with `location.replace` (Back is not trapped), exact hash match, query string preserved. The guard test bans internal `"/#team"` (and `"/#about"`) links in `src/` outside the hop component.

#### Final copy (verbatim, use as-is)

**Mission**

> We exist to turn Europe's concern into resolve, and resolve into action.

Our work brings together research, policy advocacy, public engagement and civic mobilisation, with the aim of producing evidence that decision-makers can use and helping citizens take part in the choices ahead. We are independent, non-partisan and pro-European.

**History**

In 2025, the discussion on using Russia's frozen assets to support Ukraine picked up again. Following it closely, a few of us felt we could no longer simply observe. We wanted to contribute.

There were seven of us, from different countries and professional backgrounds, with experience in policy, research, civic work and technology. We started meeting informally and called ourselves Frozen Assets Action. Our goal was to add new perspectives to the debate: to show that using the assets is legally sound, carefully designed, that the risks can be managed, and that it is a responsible way to support Ukraine's defence.

Over the following months, we realised this was more than a single campaign for us. The frozen assets debate reflected something broader that we kept coming back to in our conversations: Europe usually understands its challenges well, from the war on our continent to pressure on our democracies and our preparedness for crises. What is often harder is moving from analysis to action.

We decided we wanted to work on exactly that, together and for the long term. So we founded an organisation and named it after what we hope to strengthen: European Resolve.

### Claude's Discretion
- Homepage `metadata.description` currently repeats the removed hero subline; planner may keep it or align it with the mission. No em dashes either way.
- `/about` metadata description wording (title is `About us | European Resolve`).
- Whether to add a test that the homepage teaser matches the `/about` Mission lead sentence (cheap drift guard; recommended).
- Hop implementation (`useEffect` client component vs inline script); research leans `useEffect` to match house patterns.

*(UI-SPEC resolved all four: keep homepage description unchanged; `/about` description = "The mission, history and team of European Resolve, an independent, non-partisan and pro-European civil society organisation based in Brussels."; drift-guard test adopted; `useEffect` hop.)*

### Deferred Ideas (OUT OF SCOPE)
None. Discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ABOUT-01 | `/about` shows Mission, History, Team in order | New `src/app/about/page.tsx`; test asserts `section[id]` order `["mission","history","team"]` |
| ABOUT-02 | Stable anchors, heading visible below fixed nav | `id`s tested in jsdom; `scroll-margin-top` 6rem/6rem/4rem per UI-SPEC; visibility is preview-only |
| ABOUT-05 | Team cards link to `/about/team/<slug>` | `MemberCard.tsx:7` href change; components test + about page test over all 7 |
| ABOUT-06 | Profile at `/about/team/<slug>`, card + QR unchanged, breadcrumbs | `git mv` route; wrap in `div.profile` + `Breadcrumbs`; async page renders in vitest (probed) |
| NAV-01 | Nav "About us" → `/about` | `Nav.tsx:12` |
| NAV-02 | Homepage teaser → `/about`, no About/Team blocks | `src/app/page.tsx` lines 20-23 and 28-56 |
| LINK-01 | `/team/<slug>` 301 for all 7 | 7 lines in `public/_redirects`; guard iterates `members` |
| LINK-02 | `/team`, `/team/` 301 → `/about#team` | 2 exact lines; guard asserts both |
| LINK-03 | `/#team` lands on `/about#team`, Back not trapped | Hop component, pure `legacyHashTarget()` unit-tested; Back behaviour preview-only |
| LINK-04 | `/team/<slug>.png` 200, no redirect | Guard bans `/team/*` and `/team/:x` sources; `members.test.ts:66-70` keeps photo paths pinned; curl on preview |
| SEO-01 | Title, description, canonical at new address | `metadata` / `generateMetadata` with `alternates.canonical`; tests import them directly (probed) |
| SEO-02 | Sitemap lists `/about`, no member pages | `sitemap.ts`; test calls `sitemap()` (probed) |
| QA-01 | Guard tests | New `src/__tests__/legacy-links.test.ts` + em-dash checks in `src/__tests__/about.test.tsx` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Static export only (`output: "export"`); no `redirects()`, middleware, or `permanentRedirect()`. Redirects via `public/_redirects` only.
- Every push to `main` deploys production. This phase never touches `main` (D-02).
- Stable public URLs: moved paths need 301s.
- CSS Modules + tokens only; no Tailwind, no CSS-in-JS. Class names camelCase, one module per component, co-located.
- Named exports for components; default export only for pages. No barrel files. `@/` alias; `import type` for types; relative imports only for co-located CSS.
- Double quotes, semicolons, Prettier defaults. Client components start with `"use client";` (verified: `ObfuscatedEmail.tsx:1`, `EventTimeline.tsx:1`).
- `alt` on all images; amber focus ring from base styles; respect `prefers-reduced-motion`.
- **No em dash (U+2014) in user-facing copy** (locale strings, UI text, metadata). Code comments are exempt.
- GDPR / ADR-005: member pages stay out of the sitemap.
- Docs: CLAUDE.md Entry Points table must reflect `/about` and `/about/team/[slug]`.
- ADR-002 line 18: "AI agents write code but never commit, push, or create branches." The push that creates the preview deploy is a human step.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `/about` content, Team grid | CDN / Static (pre-rendered HTML) | — | Server component, built at `next build` |
| Profile pages | CDN / Static | — | `generateStaticParams()` over `members` |
| `/team*` legacy redirects | CDN (Cloudflare Pages `_redirects`) | — | Only redirect mechanism under static export |
| `/#team`, `/#about` hop | Browser / Client | — | Fragments never reach the server |
| Canonicals, sitemap | CDN / Static (build-time metadata) | — | Next metadata API emits into HTML / `sitemap.xml` |
| Guard tests | Build / CI (local, pre-push) | — | CI does not run on feature branches |

## Standard Stack

No new dependencies. Everything used is already in `package.json` (verified this session).

| Tool | Version (installed) | Use |
|------|---------|-----|
| next | ^16.2.6 | App Router, `Metadata`, `MetadataRoute.Sitemap` |
| vitest | 4.1.5 (ran this session) | Test runner, jsdom env |
| @testing-library/react | ^16.3.2 | Render pages and components |
| node:fs / node:path | Node built-in | Read `public/_redirects`, scan `src/` in guard tests (works in the jsdom env, probed) |

**Installation:** none.

## Package Legitimacy Audit

Not applicable: this phase installs no external packages. Do not run `npx wrangler` as part of the plan (it would fetch a package outside `package.json`); the Cloudflare preview is the verification target.

## Architecture Patterns

### System Architecture Diagram

```
Visitor request
  |
  +-- /team/<slug>, /team, /team/ --> Cloudflare _redirects (301) --> /about/team/<slug> | /about#team
  |
  +-- /team/<slug>.png -----------> no rule matches --> static asset public/team/<slug>.png (200)
  |
  +-- /r4u/<slug> ----------------> existing 301 --> /events/2026-run-for-ukraine/fundraise/<slug>
  |
  +-- /about ---------------------> about.html (h1, #mission, #history, #team grid)
  |                                    \-- MemberCard --> /about/team/<slug>
  +-- /about/team/<slug> ---------> about/team/<slug>.html (Breadcrumbs + BusinessCard + QR)
  |
  +-- / (with #team or #about) ---> index.html --> hydrate --> LegacyHashRedirect useEffect
                                         exact hash match? --yes--> location.replace(/about?<q>#team|#mission)
                                                           --no---> nothing (homepage stays)
```

### Files to touch (exact)

| File | Change | Current text (verbatim, Read this session) |
|------|--------|---------------|
| `src/app/about/page.tsx` | NEW. Server component, `metadata` export, h1 + 3 sections, Team grid moved from homepage | — |
| `src/app/about/page.module.css` | NEW. `.about*`, `.team*`, `.grid` + media queries moved from `src/app/page.module.css:62-146`; hex to primitive tokens; new `.pageTitle`, `.lead`, section margins, `scroll-margin-top` | — |
| `src/app/page.tsx` | Replace subline (lines 20-23) with Mission lead; add `<p><Link href="/about" className={styles.moreLink}>More about us</Link></p>`; delete lines 28-56 (`#about`, `#team`); drop `members` / `MemberCard` imports (lines 2-3); mount hop component; keep `metadata` (lines 6-10) unchanged | `description: "Research, dialogue, and civic action to reinforce European security and democracy.",` |
| `src/app/page.module.css` | Delete `.about` through the second `@media` block (lines 62-146) incl. `.emphasis`; add `.moreLink`. `.subtitle` (42-51) and `.emphasis` are already unused (grep: no `styles.subtitle` / `styles.emphasis` in `src`) | — |
| `src/components/layout/Nav.tsx` | Line 12 | `<Link href="/#team">Team</Link>` → `<Link href="/about">About us</Link>` |
| `src/components/ui/MemberCard.tsx` | Line 7 | ``<Link href={`/team/${member.slug}`} className={styles.card}>`` → `/about/team/${member.slug}` |
| `src/app/team/[slug]/page.tsx` | `git mv` to `src/app/about/team/[slug]/page.tsx`; delete empty `src/app/team/` | — |
| `src/app/about/team/[slug]/page.tsx` | Add `BASE_URL`, `alternates.canonical` in `generateMetadata`; wrap return in `<div className={styles.profile}>` with `Breadcrumbs` above `BusinessCard` | lines 18-21: ``title: `${member.name} \| European Resolve`,`` / ``description: `${member.name}, ${member.title} at European Resolve`,`` |
| `src/app/about/team/[slug]/page.module.css` | NEW, one rule: `.profile { padding-top: 4.0625rem; }` (value from `src/app/events/2026-run-for-ukraine/layout.module.css:5` `padding-top: 4.0625rem;`) | — |
| `src/components/ui/BusinessCard.module.css` | Line 9 `padding-top: 7rem;` → `0.5rem` (only consumer is the profile page: grep shows `BusinessCard` imported only in `src/app/team/[slug]/page.tsx:4`) | `padding-top: 7rem;` |
| `src/app/sitemap.ts` | Add `{ url: \`${BASE_URL}/about\`, priority: 0.8 }` | line 5 `const BASE_URL = "https://european-resolve.org";` |
| `public/_redirects` | Append 9 rules (below); keep lines 1-2 | `# Short URL for participant fundraising pages` / `/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301` |
| `src/components/ui/LegacyHashRedirect.tsx` | NEW client component + exported pure `legacyHashTarget()` | — |
| `CLAUDE.md` | Entry Points table line 192 `\| Team Member \| \`/team/[slug]\` \| Static via \`generateStaticParams()\` \|` → `/about/team/[slug]`; add row `\| About \| \`/about\` \| Static (server component) \|` | — |

Not touched (verified): `src/data/members.ts` photo paths stay `/team/<slug>.png` (Option B); `src/lib/qr.ts`; `next.config.ts`; `package.json` `resize-marco` path; Footer (no `/#team` link; grep found `/#team` only at `Nav.tsx:12`); `backend/`, `docs/`, `public/` have no `/#team`, `/#about` or `org/team` references (grep this session).

### Member slugs (source of truth for `_redirects`)

`[VERIFIED: src/data/members.ts:38,52,67,75,87,98,119]` verbatim:
`slug: "michael-desloover"`, `slug: "liza-bezvershenko"`, `slug: "olena-kuzhym"`, `slug: "benjamin-lemerle"`, `slug: "ivan-zinchenko"`, `slug: "serhiy-onyshchenko"`, `slug: "marco-melega"`. Matching files exist in `public/team/` (ls this session).

### `public/_redirects` target content

```
# Short URL for participant fundraising pages
/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301

# v1.1: team moved under /about. Printed QR business cards point at /team/<slug>: never delete these.
# Photos stay at /team/<slug>.png, so no /team/* splat (Cloudflare follows redirects even when an asset exists).
# A departed member keeps their line; point it at /about#team if their profile is removed.
/team /about#team 301
/team/ /about#team 301
/team/michael-desloover /about/team/michael-desloover 301
/team/liza-bezvershenko /about/team/liza-bezvershenko 301
/team/olena-kuzhym /about/team/olena-kuzhym 301
/team/benjamin-lemerle /about/team/benjamin-lemerle 301
/team/ivan-zinchenko /about/team/ivan-zinchenko 301
/team/serhiy-onyshchenko /about/team/serhiy-onyshchenko 301
/team/marco-melega /about/team/marco-melega 301
```

Cloudflare facts `[CITED: developers.cloudflare.com/pages/configuration/redirects/]`, re-read this session: "302 is used as the default status code"; "Redirects are always followed, regardless of whether or not an asset matches the incoming request"; "If there are multiple redirects for the same `source` path, the top-most redirect is applied"; destinations "Can include fragments"; "Lines starting with a `#` will be treated as comments". The docs do NOT say whether `/team/x` also matches `/team/x/`, or whether incoming query strings pass through (no observation; probe on preview).

### Pattern: legacy hash hop

```tsx
// src/components/ui/LegacyHashRedirect.tsx
"use client";

import { useEffect } from "react";

// Exact-match map: only these two legacy fragments hop; the hash is never interpolated (no open redirect).
const ANCHORS: Record<string, string> = { "#team": "team", "#about": "mission" };

export function legacyHashTarget(hash: string, search: string): string | null {
  const anchor = ANCHORS[hash];
  return anchor ? `/about${search}#${anchor}` : null;
}

export function LegacyHashRedirect() {
  useEffect(() => {
    const target = legacyHashTarget(window.location.hash, window.location.search);
    if (target) window.location.replace(target);
  }, []);
  return null;
}
```

Why a pure helper: jsdom's `window.location.replace` is not spyable (unforgeable property), so the logic is tested as a pure function and the 3-line effect is verified on the preview. Keys all start with `#`, so prototype keys (`constructor`, `__proto__`) cannot match. `[ASSUMED]` that jsdom 29 still refuses `vi.spyOn(window.location, "replace")`; the pure-function design sidesteps the question either way.

Mount in `src/app/page.tsx` only (anywhere in the fragment; it renders `null`).

### Pattern: profile page with breadcrumbs and canonical

```tsx
// src/app/about/team/[slug]/page.tsx (additions only)
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import styles from "./page.module.css";

const BASE_URL = "https://european-resolve.org";

// in generateMetadata return:
  alternates: { canonical: `${BASE_URL}/about/team/${member.slug}` },

// render:
  return (
    <div className={styles.profile}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about" },
          { label: member.name },
        ]}
      />
      <BusinessCard member={member} qrSvg={qrSvg} />
    </div>
  );
```

`Breadcrumbs` props `[VERIFIED: src/components/ui/Breadcrumbs.tsx:3-8]`: `type BreadcrumbItem = { label: string; href?: string; };` and `export function Breadcrumbs({ items }: { items: BreadcrumbItem[] })`. Items without `href` render `<span aria-current="page">` (lines 18-21). It uses `key={item.label}`, fine for 3 distinct labels. Canonical pattern `[VERIFIED: src/app/events/2026-run-for-ukraine/layout.tsx:7,40-41]`: `const BASE_URL = "https://european-resolve.org";` and `alternates: { canonical: \`${BASE_URL}${EVENT_PATH}\`,`. Root layout has no `metadataBase` (`src/app/layout.tsx:19-24`), so canonicals must be absolute.

### Pattern: `/about` metadata

```tsx
export const metadata: Metadata = {
  title: "About us | European Resolve",
  description:
    "The mission, history and team of European Resolve, an independent, non-partisan and pro-European civil society organisation based in Brussels.",
  alternates: { canonical: "https://european-resolve.org/about" },
};
```

JSX copy: write apostrophes as `&apos;` or inside `{"..."}` so `react/no-unescaped-entities` passes. The source copy uses straight apostrophes (0 occurrences of U+2019 in `11-CONTEXT.md`, grep this session), so rendered text must match the straight-apostrophe strings in tests.

### Moved CSS: token mapping

`[VERIFIED: src/styles/tokens.css:7,8,14]`: `--color-black: #0a1628;`, `--color-amber: #d4a012;`, `--color-paper: #f5f2eb;`. In moved rules replace `#f5f2eb` → `var(--color-paper)`, `#0a1628` → `var(--color-black)`. Keep `rgb(10 22 40 / 0.85)` in `.aboutText` as is (UI-SPEC). Do not use semantic tokens (they flip in dark mode).

### Recommended plan split

| Plan | Wave | Files owned | Tests |
|------|------|-------------|-------|
| A: About page + homepage | 1 | `src/app/about/page.tsx`, `src/app/about/page.module.css`, `src/app/page.tsx`, `src/app/page.module.css`, `Nav.tsx`, `MemberCard.tsx`, `LegacyHashRedirect.tsx` | edit `components.test.tsx` (Nav, MemberCard); new `about.test.tsx` (about + home + drift guard + em dash) |
| B: Profile move + SEO | 1 | `git mv` route, `src/app/about/team/[slug]/page.module.css`, `BusinessCard.module.css`, `sitemap.ts` | new `profile.test.tsx` (breadcrumbs, canonical, em dash per member, sitemap) |
| C: Redirects + guards + docs | 2 | `public/_redirects`, `CLAUDE.md` | new `legacy-links.test.ts` (`_redirects` parse, internal-link scan, `legacyHashTarget`) |
| D: Preview verification | 3 | none (human push + curl + visual) | manual matrix below |

A and B touch disjoint files and test files, so they parallelise. C's internal-link scan fails until A has changed `Nav.tsx`, so C goes after A. `legacyHashTarget` tests can live in A instead if C should not import A's file; either works.

### Anti-Patterns to Avoid
- **`/team/*` or `/team/:slug` rule:** catches `/team/<slug>.png` (placeholders also match dots). Banned by guard.
- **Rule without explicit `301`:** ships a 302.
- **Rule whose source equals its destination path** (e.g. `/about/ /about 301`): loops. Guard checks it.
- **`next.config.ts` `redirects()`:** unsupported under static export.
- **`router.push` / `location.href =` in the hop:** adds a history entry, so Back returns to `/#team` and re-hops.
- **Semantic color tokens in moved CSS:** change dark-mode rendering.
- **Updating `members.test.ts:66-70` (photo path test):** leave it. Under Option B it is the guard that photos stay at `/team/<slug>.png`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server redirects | meta-refresh stub pages at `/team/<slug>` | `public/_redirects` | Real 301, no extra HTML, SEO-correct |
| Breadcrumb UI | new component | `src/components/ui/Breadcrumbs.tsx` | Already accessible (`aria-label`, `aria-current`) |
| Sitemap XML | hand-written XML | `src/app/sitemap.ts` (`MetadataRoute.Sitemap`) | Already wired |
| Canonical tags | manual `<link>` in JSX | `metadata.alternates.canonical` | Next emits it into `<head>` |
| Preview curl script in repo | `scripts/verify-redirects.sh` | an inline bash loop in Plan D | One-off check; Phase 12 reruns it from the plan text |

## Runtime State Inventory

This is a route move, so the inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. No database for org pages; members are a TS array. Verified by `src/data/members.ts` read. | none |
| Live service config | Cloudflare Pages project settings (preview deployments on/off, possible zone-level redirect rules on the custom domain) live in the dashboard, not git. Preview deploys use `*.pages.dev`, so zone rules do not affect this phase. | Human confirms preview deployments are enabled for non-production branches (Plan D checkpoint). Zone rules are a Phase 12 concern (STATE blocker). |
| OS-registered state | None. Static site, no schedulers. | none |
| Secrets/env vars | None reference team paths. | none |
| Build artifacts | Stale `out/team/` or `.next/` from earlier local builds would contain old pages; irrelevant because Cloudflare builds clean. Browser 301 caches on the preview host only. | Use `curl` (not a browser) first; use a private window for manual checks |

External state outside our control: printed business cards and email signatures pointing at `/team/<slug>` and `/team/<slug>.png`. Covered by LINK-01 and LINK-04. The exact printed URL form (`www.`, trailing slash) is still unknown (STATE blocker) and is probed, not assumed, in the curl matrix.

## Common Pitfalls

### Pitfall 1: Guard asserts "exactly one line per member"
**What goes wrong:** If the preview shows `/team/<slug>/` (trailing slash) 404s, the fix is 7 more `/team/<slug>/ /about/team/<slug> 301` lines. An "exactly one" assertion would then block a correct fix.
**How to avoid:** Assert "at least one exact `/team/<slug>` → `/about/team/<slug>` rule per member", plus the no-splat and all-301 rules.

### Pitfall 2: Internal-link scan matches its own test file
**What goes wrong:** The guard test file contains the literal `"/#team"`, so scanning all of `src/` flags itself.
**How to avoid:** Skip `src/__tests__/` and the hop component file. Regex `/["'\`]\/#(team|about)\b/` catches double, single and template quotes.

### Pitfall 3: Em-dash guard reads source instead of output
**What goes wrong:** Scanning `.tsx` source flags code comments (allowed by CLAUDE.md) and misses metadata built from data (member titles).
**How to avoid:** Assert on rendered `container.textContent` of `/about`, `/` and each profile page, and on `title` / `description` strings of every exported `metadata` / `generateMetadata` result. `src/data/members.ts` contains 0 em dashes today (grep).

### Pitfall 4: CI is not a safety net on the branch
**What goes wrong:** `.github/workflows/ci.yml:3-5` runs only on `push: branches: [main]`. A broken branch deploys to preview silently.
**How to avoid:** Every plan's verify step runs `npm run lint && npm run typecheck && npm test`; Plan D additionally runs `npm run build && test -f out/404.html && test -f out/about.html && test -f out/about/team/michael-desloover.html && test ! -e out/team/michael-desloover.html`.

### Pitfall 5: Homepage hero loses spacing or the link is unstyled
**What goes wrong:** `.because` keeps `margin-bottom: 1.5rem`; the new `<p>` containing the link inherits base `p` margins.
**How to avoid:** Follow UI-SPEC `.moreLink` exactly; visual check on preview.

### Pitfall 6: `/about` heading margins leak from base layer
**What goes wrong:** Base `* + h2 { margin-block-start: 1.5em }` adds space above section headings.
**How to avoid:** UI-SPEC: sections and `h1` set their own margins; module CSS is unlayered and wins.

### Pitfall 7: Pushing or merging to `main`
**What goes wrong:** Any push to `main` deploys production with redirects and route move, which is Phase 12's job. Note: the local `main` ref currently equals this branch's HEAD (`436c4b9`, planning-doc commits not on `origin/main`), so a careless `git push origin main` would publish (harmless) docs, and any later phase commits made on `main` would deploy.
**How to avoid:** Execute on a feature branch; push only that branch; human checkpoint before push.

## Code Examples

### Guard: `src/__tests__/legacy-links.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { members } from "@/data/members";
import { legacyHashTarget } from "@/components/ui/LegacyHashRedirect";

const ROOT = process.cwd();
const rules = readFileSync(path.join(ROOT, "public/_redirects"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split(/\s+/));

describe("_redirects", () => {
  it("every rule is `from to 301`", () => {
    for (const r of rules) {
      expect(r).toHaveLength(3);
      expect(r[2]).toBe("301");
    }
  });

  it("has a /team/<slug> rule for every member", () => {
    for (const m of members) {
      expect(rules).toContainEqual([`/team/${m.slug}`, `/about/team/${m.slug}`, "301"]);
    }
  });

  it("sends /team and /team/ to /about#team", () => {
    expect(rules).toContainEqual(["/team", "/about#team", "301"]);
    expect(rules).toContainEqual(["/team/", "/about#team", "301"]);
  });

  it("has no /team splat or placeholder (photos must not redirect)", () => {
    expect(rules.filter(([from]) => /^\/team\/.*[*:]/.test(from))).toEqual([]);
  });

  it("no rule redirects to itself", () => {
    for (const [from, to] of rules) expect(to.split("#")[0]).not.toBe(from);
  });

  it("keeps the /r4u short link", () => {
    expect(rules).toContainEqual(["/r4u/:slug", "/events/2026-run-for-ukraine/fundraise/:slug", "301"]);
  });
});

describe("internal links", () => {
  it("no /#team or /#about links in src outside the hop", () => {
    const src = path.join(ROOT, "src");
    const hits = (readdirSync(src, { recursive: true }) as string[])
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .filter((f) => !f.startsWith("__tests__") && !f.endsWith("LegacyHashRedirect.tsx"))
      .filter((f) => /["'`]\/#(team|about)\b/.test(readFileSync(path.join(src, f), "utf8")));
    expect(hits).toEqual([]);
  });
});

describe("legacyHashTarget", () => {
  it.each([
    ["#team", "", "/about#team"],
    ["#about", "", "/about#mission"],
    ["#team", "?utm_source=card", "/about?utm_source=card#team"],
  ])("%s %s -> %s", (hash, search, out) => expect(legacyHashTarget(hash, search)).toBe(out));

  it.each(["", "#", "#teams", "#Team", "#mission", "#team-x"])("ignores %j", (hash) =>
    expect(legacyHashTarget(hash, "")).toBeNull(),
  );
});
```

Probed this session in the real vitest config: `readFileSync(path.join(process.cwd(), "public/_redirects"))` works in the jsdom environment; `readdirSync(src, { recursive: true })` on Node 26 returns relative paths, and the scan returns `["components/layout/Nav.tsx"]` today (so it fails until Nav is fixed, as intended).

### About / homepage / profile tests (sketch)

```tsx
// next/link mock: copy src/__tests__/components.test.tsx:9-23
import AboutPage, { metadata as aboutMeta } from "@/app/about/page";
import Home from "@/app/page";
import TeamMemberPage, { generateMetadata } from "@/app/about/team/[slug]/page";
import sitemap from "@/app/sitemap";

const LEAD = "We exist to turn Europe's concern into resolve, and resolve into action.";
const EM = "—";

it("about sections in order", () => {
  const { container } = render(<AboutPage />);
  expect([...container.querySelectorAll("section[id]")].map((s) => s.id))
    .toEqual(["mission", "history", "team"]);
  expect(screen.getByRole("heading", { level: 1, name: "About us" })).toBeInTheDocument();
  expect(container.textContent).not.toContain(EM);
});

it("teaser equals mission lead", () => {
  render(<AboutPage />); expect(screen.getByText(LEAD)).toBeInTheDocument(); cleanup();
  const { container } = render(<Home />);
  expect(screen.getByText(LEAD)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "More about us" })).toHaveAttribute("href", "/about");
  expect(container.querySelector("#team, #about")).toBeNull();
});

it.each(members.map((m) => m.slug))("profile %s", async (slug) => {
  const params = Promise.resolve({ slug });
  render(await TeamMemberPage({ params }));
  const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
  // Home -> /, About us -> /about, name aria-current
  const md = await generateMetadata({ params });
  expect(md.alternates?.canonical).toBe(`https://european-resolve.org/about/team/${slug}`);
  expect(`${md.title} ${md.description}`).not.toContain(EM);
});

it("sitemap", () => {
  const urls = sitemap().map((e) => e.url);
  expect(urls).toContain("https://european-resolve.org/about");
  expect(urls.some((u) => u.includes("/team"))).toBe(false);
});
```

Probed this session: `render(await TeamMemberPage({ params: Promise.resolve({ slug }) }))` renders the async server component (including `generateQRSvg`) in jsdom; `generateMetadata` and the homepage `metadata` export import cleanly; `sitemap()` is callable. Tests select by role, text and `id`, never by CSS Module class, so how vitest handles CSS Modules does not matter (not checked).

### Existing tests to update (to intent, not to green)

| File:lines | Today (verbatim) | Change to |
|------------|------------------|-----------|
| `src/__tests__/components.test.tsx:87-90` | `it("renders Team link", ...)` / `expect(screen.getByText("Team")).toBeInTheDocument();` | `"renders About us link"`: `getByRole("link", { name: "About us" })` has `href="/about"`; `queryByText("Team")` is null |
| `src/__tests__/components.test.tsx:131-134` | `it("links to /team/{slug}", ...)` / `expect(link).toHaveAttribute("href", "/team/test-person");` | `"links to /about/team/{slug}"`, href `/about/team/test-person` |
| `src/__tests__/components.test.tsx:128` | `expect(img).toHaveAttribute("src", "/team/test-person.png");` | unchanged (photo path stays) |
| `src/__tests__/members.test.ts:66-70` | `expect(m.photo).toBe(\`/team/${m.slug}.png\`);` | unchanged (Option B guard) |
| `src/__tests__/qr.test.ts:15,142` | `photo: "/team/john-doe.png",` fixtures | unchanged |

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Homepage `#about` / `#team` sections, nav `/#team` | `/about` page, nav `/about`, client hop for external legacy fragments | Internal nav no longer relies on fragments |
| `/team/[slug]` | `/about/team/[slug]` + 301s | Printed cards keep working via `_redirects` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Cloudflare Pages preview deployments are enabled for non-production branches on this project | Runtime State, Plan D | No preview URL; human enables it in the dashboard or the phase gate cannot run |
| A2 | `_redirects` behaves the same on a `*.pages.dev` preview as on production (minus zone-level rules) | Validation | Preview passes but production differs; Phase 12 reruns the matrix on production |
| A3 | Exact rule `/team/<slug>` may not match `/team/<slug>/` (undocumented) | Pitfall 1, curl matrix | Trailing-slash variant 404s; fix with 7 extra lines if the preview shows it |
| A4 | jsdom `window.location.replace` cannot be spied | Hop pattern | None; pure-function design works regardless |
| A5 | Which branch to execute on: the existing `ZioHimself/feat-about-us-section` (worktree `gourami`, at `origin/main` `ed57153`, behind this branch's 5 planning commits) or the current `ZioHimself/chore-copy-planning-intel` | Pitfall 7 | Work lands on the wrong branch or planning commits are missing on the preview branch; harmless but confusing |

## Open Questions

1. **Which branch carries Phase 11 code?**
   - Known: current branch `ZioHimself/chore-copy-planning-intel` has no upstream and is 5 planning commits ahead of `origin/main`; a `ZioHimself/feat-about-us-section` branch exists at `origin/main`.
   - Recommendation: planner adds a first-task checkpoint asking the user; default to executing on the current branch and having the human push it under the feature name.
2. **Preview URL.** Taken from the Cloudflare dashboard or the GitHub commit status after the push; set as `P` in the curl loop.
3. **Trailing-slash and printed-card URL form.** Probe `/team/<slug>/` on the preview; add lines only if it 404s.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests | ✓ | v26.0.0 local (CI uses 24) | — |
| node_modules in this worktree | `npm test` | ✗ | — | Run `npm ci` in the worktree before Plan A (baseline was run from the main checkout: 8 files, 183 tests, 1.7s) |
| curl | preview matrix | ✓ (macOS built-in) | — | — |
| Cloudflare preview deploy | LINK-01..04 verification | unknown (A1) | — | none; blocking for Plan D |
| Browser at 320px / 375px | nav wrap, profile card position | human | — | none; manual |

**Missing with no fallback:** Cloudflare preview access (human).
**Missing with fallback:** `node_modules` (run `npm ci`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.5 + @testing-library/react 16 + jest-dom, jsdom env |
| Config file | `vitest.config.ts` (include `src/**/*.test.{ts,tsx}`, `src/**/*.spec.{ts,tsx}`; `@/` alias) |
| Quick run command | `npx vitest run src/__tests__/<file>` |
| Full suite command | `npm run lint && npm run typecheck && npm test` |
| Phase gate | full suite + `npm run build` + output file checks (Pitfall 4) + preview matrix |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ABOUT-01 | sections in order, h1 | unit (render) | `npx vitest run src/__tests__/about.test.tsx` | ❌ Wave 0 (Plan A) |
| ABOUT-02 | ids exist | unit; heading below nav is manual | same + `grep -c scroll-margin-top src/app/about/page.module.css` (expect non-zero; values per UI-SPEC) | ❌ Plan A |
| ABOUT-05 | 7 cards → `/about/team/<slug>` | unit | `npx vitest run src/__tests__/about.test.tsx src/__tests__/components.test.tsx` | partial (update) |
| ABOUT-06 | profile renders card + breadcrumbs | unit | `npx vitest run src/__tests__/profile.test.tsx` | ❌ Plan B |
| NAV-01 | nav "About us" → `/about` | unit | `npx vitest run src/__tests__/components.test.tsx` | ✅ update |
| NAV-02 | teaser + link, no `#about`/`#team` | unit | `npx vitest run src/__tests__/about.test.tsx` | ❌ Plan A |
| LINK-01 | rule per member | unit (file parse) + preview curl | `npx vitest run src/__tests__/legacy-links.test.ts` | ❌ Plan C |
| LINK-02 | `/team`, `/team/` rules | unit + preview curl | same | ❌ Plan C |
| LINK-03 | hop target logic | unit; Back behaviour manual | same | ❌ Plan C |
| LINK-04 | no splat; photo paths pinned | unit + preview curl | same + `npx vitest run src/__tests__/members.test.ts` | partial |
| SEO-01 | title/description/canonical | unit | `npx vitest run src/__tests__/about.test.tsx src/__tests__/profile.test.tsx` | ❌ |
| SEO-02 | sitemap | unit | `npx vitest run src/__tests__/profile.test.tsx` | ❌ |
| QA-01 | all guards | unit | `npm test` | ❌ Plan C |

### Preview-only checks (Plan D, human-verify)

```bash
P=https://<preview-host>.pages.dev
for s in michael-desloover liza-bezvershenko olena-kuzhym benjamin-lemerle ivan-zinchenko serhiy-onyshchenko marco-melega; do
  printf '%-40s ' "/team/$s";      curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "$P/team/$s"       # expect 301 -> .../about/team/$s
  printf '%-40s ' "/team/$s.png";  curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "$P/team/$s.png"   # expect 200, no redirect
  printf '%-40s ' "/about/team/$s"; curl -s -o /dev/null -w '%{http_code}\n' "$P/about/team/$s"                  # expect 200
done
for p in /team /team/; do printf '%-40s ' "$p"; curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "$P$p"; done  # 301 -> /about#team
curl -s -o /dev/null -w '/r4u/test %{http_code} -> %{redirect_url}\n' "$P/r4u/test"                            # 301 -> fundraise/test
curl -sL -o /dev/null -w 'hops=%{num_redirects} final=%{http_code}\n' "$P/team/michael-desloover"               # hops=1 final=200
# observe only (undocumented): trailing slash and query pass-through
curl -s -o /dev/null -w '/team/<s>/ %{http_code} -> %{redirect_url}\n' "$P/team/michael-desloover/"
curl -s -o /dev/null -w '/team?x=1 %{http_code} -> %{redirect_url}\n' "$P/team?x=1"
```

Manual (browser, private window): `/#team` lands on `/about#team` with the Team heading visible, then Back leaves the site/previous page (not `/#team`); `/#about` lands on `/about#mission`; `/about#mission`, `#history`, `#team` headings clear the nav; nav row does not wrap at 320px (else apply the UI-SPEC backstop CSS); profile photo top at or above 112px at desktop and 375px; breadcrumbs read Home › About us › Name.

### Sampling Rate
- **Per task commit:** quick run of the touched test file(s)
- **Per wave merge:** `npm run lint && npm run typecheck && npm test`
- **Phase gate:** full suite + `npm run build` + `out/` checks green locally, then preview matrix + manual checks recorded in VERIFICATION

### Wave 0 Gaps
- [ ] `npm ci` in this worktree (no `node_modules`)
- [ ] `src/__tests__/about.test.tsx` (ABOUT-01/02/05, NAV-02, SEO-01, em dash, drift guard)
- [ ] `src/__tests__/profile.test.tsx` (ABOUT-06, SEO-01/02, em dash)
- [ ] `src/__tests__/legacy-links.test.ts` (LINK-01..04, QA-01)
No framework install needed.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | static site |
| V3 Session Management | no | no sessions |
| V4 Access Control | no | public pages |
| V5 Input Validation | yes (hop reads `location.hash`/`search`) | exact-match lookup; hash never interpolated; target always a same-origin path starting `/about` |
| V6 Cryptography | no | — |
| V14 Configuration | yes | explicit 301s, no splat, guard tests |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via hash hop | Spoofing | Fixed map of two keys; `search` appended to a relative `/about` path cannot change origin |
| Staff exposure via sitemap | Information disclosure | Member pages unlisted (D-04, ADR-005); `/about` shows the same team already on the homepage today |
| Redirect hijack / loop via bad rule | Tampering / DoS | Guard: all 301, no splat, no self-redirect |

## Sources

### Primary (HIGH)
- Repo files read this session: `src/app/page.tsx`, `src/app/page.module.css`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/team/[slug]/page.tsx`, `src/app/events/2026-run-for-ukraine/layout.tsx`, `src/components/layout/Nav.tsx`, `src/components/ui/{MemberCard,Breadcrumbs}.tsx`, `BusinessCard.module.css`, `src/__tests__/{components,members,AccountabilityReport}.test.*`, `public/_redirects`, `.github/workflows/ci.yml`, `docs/adrs/002,004`, `vitest.config.ts`, `vitest.setup.ts`
- vitest probe (temporary test, deleted): fs read, recursive scan, async page render, metadata and sitemap imports, all passing
- Baseline suite: 8 files / 183 tests passing at `436c4b9`
- https://developers.cloudflare.com/pages/configuration/redirects/ (fetched this session)

### Secondary
- `.planning/research/SUMMARY.md`, `PITFALLS.md` (milestone research, 2026-11-15)

## Metadata

**Confidence breakdown:**
- File/line inventory: HIGH (read this session)
- Test techniques: HIGH (probed in the real vitest config)
- Cloudflare edge behaviour: HIGH for documented rules, LOW for trailing slash / query pass-through (preview probe)
- Preview availability and branch choice: LOW (human)

**Research date:** 2026-11-16
**Valid until:** 2026-12-16
