# Phase 11: About section mechanics (feature branch) - Pattern Map

**Mapped:** 2026-11-16
**Files analyzed:** 17 (3 new source, 1 moved route, 8 modified, 3 new tests, 1 edited test, CLAUDE.md)
**Analogs found:** 15 / 17

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/about/page.tsx` (NEW) | page (server) | static render | `src/app/page.tsx` | exact |
| `src/app/about/page.module.css` (NEW) | styles | n/a | `src/app/page.module.css` (rules move from here) | exact |
| `src/components/ui/LegacyHashRedirect.tsx` (NEW) | client component + pure fn | event-driven (on mount) | `src/components/ui/ObfuscatedEmail.tsx` (client shape); hop body in RESEARCH.md lines ~225-240 | role-match |
| `src/app/about/team/[slug]/page.tsx` (git mv) | page (dynamic, SSG) | static render | `src/app/team/[slug]/page.tsx` (itself) | exact |
| `src/app/about/team/[slug]/page.module.css` (NEW, optional wrapper) | styles | n/a | `src/app/page.module.css` `.heroInner` | partial |
| `src/app/page.tsx` | page | static render | itself | exact |
| `src/app/page.module.css` | styles | n/a | itself (delete `.about*`/`.team*`/`.grid`) | exact |
| `src/components/layout/Nav.tsx` | component | n/a | itself | exact |
| `src/components/ui/MemberCard.tsx` | component | n/a | itself (line 7) | exact |
| `src/components/ui/BusinessCard.module.css` | styles | n/a | itself (line 9) | exact |
| `src/app/sitemap.ts` | config | static | itself | exact |
| `public/_redirects` | config | n/a | itself (`/r4u` line) | exact |
| `src/__tests__/components.test.tsx` (edit) | test | n/a | itself lines 87-90, 131-134 | exact |
| `src/__tests__/about.test.tsx` (NEW) | test | render | `src/__tests__/components.test.tsx` | role-match |
| `src/__tests__/profile.test.tsx` (NEW) | test | render (async page) | `src/__tests__/components.test.tsx` | role-match |
| `src/__tests__/legacy-links.test.ts` (NEW) | test | file-I/O parse | none | no analog |
| `CLAUDE.md` | docs | n/a | Entry Points table | exact |

## Pattern Assignments

### `src/app/about/page.tsx` (page, static)
**Analog:** `src/app/page.tsx` (whole file, 59 lines). Copy imports (lines 1-4), `metadata` export (6-10), and the `#about` / `#team` sections (28-56) verbatim as structure; replace prose with D-07 copy from CONTEXT.md; add `h1` "About us"; ids `mission`, `history`, `team`.
```tsx
import type { Metadata } from "next";
import { members } from "@/data/members";
import { MemberCard } from "@/components/ui/MemberCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "European Resolve",
  description: "...",
};
...
      <section id="team" className={styles.team}>
        <div className={styles.teamInner}>
          <h2 className={styles.teamHeading}>Team</h2>
          <div className={styles.grid}>
            {members.map((member) => (
              <MemberCard key={member.slug} member={member} />
            ))}
          </div>
        </div>
      </section>
```
Canonical (D-16): add `alternates: { canonical: \`${BASE_URL}/about\` }` with a local `const BASE_URL = "https://european-resolve.org";` as in `src/app/events/2026-run-for-ukraine/layout.tsx:7` and `:39-40`:
```ts
const BASE_URL = "https://european-resolve.org";
  alternates: {
    canonical: `${BASE_URL}${EVENT_PATH}`,
```

### `src/app/about/page.module.css`
**Analog:** `src/app/page.module.css`. Move blocks `.about` (line 62) through the end (`.grid` + media queries, lines 62-146) out of the homepage file. Mission lead sentence echoes `.statement` (line 18) type; copy its font declarations, not the class. Add `scroll-margin-top` on the section selectors (not present anywhere yet).

### `src/components/ui/LegacyHashRedirect.tsx` (client, on-mount)
**Analog for file shape:** `src/components/ui/ObfuscatedEmail.tsx:1-11`:
```tsx
"use client";

import { useCallback } from "react";
import styles from "./ObfuscatedEmail.module.css";

type Props = { ... };

export function ObfuscatedEmail({ email, className }: Props) {
```
Use `useEffect` instead of `useCallback`, no CSS module, return `null`. Body: use RESEARCH.md §hop code (`legacyHashTarget(hash, search)` exported pure fn + `window.location.replace`). Named export, mount in `src/app/page.tsx`.

### `src/app/about/team/[slug]/page.tsx` (git mv of `src/app/team/[slug]/page.tsx`)
Keep lines 1-31 unchanged; add to `generateMetadata` return (lines 18-21) `alternates.canonical: \`${BASE_URL}/about/team/${slug}\``, and wrap return (line 31) with Breadcrumbs:
```tsx
  return <BusinessCard member={member} qrSvg={qrSvg} />;
```
Breadcrumbs usage from `src/app/events/2026-run-for-ukraine/register/page.tsx:3,13-22`:
```tsx
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          { label: t("hero.title"), href: "/events/2026-run-for-ukraine" },
          { label: t("nav.register") },
        ]}
      />
```
Use plain strings: `Home` `/`, `About us` `/about`, `member.name` (no href = current page). Component API: `src/components/ui/Breadcrumbs.tsx:3-8` (`{ label, href? }[]`).

### `src/app/page.tsx` (modify)
Replace `<p className={styles.because}>` (lines 20-23) with the teaser + `"More about us"` link to `/about`; delete sections lines 28-56 and `members`/`MemberCard` imports (lines 2-3); mount `<LegacyHashRedirect />`. Optionally update `metadata.description` (lines 8-9).

### `src/components/layout/Nav.tsx` line 12
```tsx
          <Link href="/#team">Team</Link>
```
becomes `<Link href="/about">About us</Link>`.

### `src/components/ui/MemberCard.tsx` line 7
```tsx
    <Link href={`/team/${member.slug}`} className={styles.card}>
```
becomes `/about/team/${member.slug}`. `src={member.photo}` (line 9) unchanged.

### `src/components/ui/BusinessCard.module.css` line 9
`padding-top: 7rem;` reduce (breadcrumbs now sit above).

### `src/app/sitemap.ts`
Add entry following the existing shape (line 24):
```ts
    { url: `${BASE_URL}/privacy`, priority: 0.2 },
```

### `public/_redirects`
Current (2 lines):
```
# Short URL for participant fundraising pages
/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301
```
Append comment + 7 explicit `/team/<slug> /about/team/<slug> 301` lines and `/team` + `/team/` -> `/about#team 301`. No `/team/*` splat (D-01). Keep `/r4u` line.

### `src/__tests__/components.test.tsx` (edit)
Lines 87-90 `getByText("Team")` -> `"About us"`; lines 131-134 href `/team/test-person` -> `/about/team/test-person`. Line 128 photo src unchanged.

### `src/__tests__/about.test.tsx`, `profile.test.tsx` (NEW)
**Analog:** `src/__tests__/components.test.tsx:1-27`. Copy imports, the `next/link` mock (lines 9-23) and `afterEach(cleanup)`:
```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => { cleanup(); });
```
Async server page (profile): `render(await Page({ params: Promise.resolve({ slug }) }))`; `generateMetadata` called directly. Em-dash checks: assert `container.textContent` not containing `"—"` (note: CONTEXT.md's claimed AccountabilityReport em-dash test does not exist; RESEARCH.md line 14 confirms).

## Shared Patterns
- **Absolute URLs:** local `const BASE_URL = "https://european-resolve.org";` per file (`sitemap.ts:5`, event `layout.tsx:7`). No shared module exists; do not create one.
- **Imports:** `import type` for types, `@/` alias, relative only for co-located CSS module.
- **Named exports** for components; default export only for pages.
- **Copy:** British spelling, no em dashes in user-facing text.

## No Analog Found
| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/__tests__/legacy-links.test.ts` | test | file-I/O | No test reads repo files via `fs` today; use RESEARCH.md §"Guard: legacy-links.test.ts" (~line 365) verbatim |
| `scroll-margin-top` rule | styles | n/a | Not used anywhere yet; value must clear fixed nav (`Nav.module.css` header height) |

## Metadata
**Analog search scope:** `src/app`, `src/components`, `src/__tests__`, `public/`
**Files scanned:** ~14
**Pattern extraction date:** 2026-11-16
