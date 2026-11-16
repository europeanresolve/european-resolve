---
phase: 11-about-section-mechanics-feature-branch
reviewed: 2026-11-16T09:55:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - CLAUDE.md
  - public/_redirects
  - src/__tests__/about.test.tsx
  - src/__tests__/components.test.tsx
  - src/__tests__/legacy-links.test.ts
  - src/__tests__/profile.test.tsx
  - src/__tests__/redirects.test.ts
  - src/app/about/page.module.css
  - src/app/about/page.tsx
  - src/app/about/team/[slug]/page.module.css
  - src/app/about/team/[slug]/page.tsx
  - src/app/page.module.css
  - src/app/page.tsx
  - src/app/sitemap.ts
  - src/components/layout/Nav.tsx
  - src/components/ui/BusinessCard.module.css
  - src/components/ui/LegacyHashRedirect.tsx
  - src/components/ui/MemberCard.tsx
findings:
  critical: 0
  warning: 2
  info: 6
  total: 8
  necessity: 0
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-11-16T09:55:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

I reviewed the /about move: the new `/about` and `/about/team/[slug]` routes, the trimmed home page, the client-side `#team`/`#about` hop, the `_redirects` legacy rules (including the 8c5259c trailing-slash hotfix), and the new and changed tests. All 5 phase test files pass (78 tests).

The core mechanics are correct:
- Every member in `src/data/members.ts` has both `/team/<slug>` and `/team/<slug>/` 301 rules.
- Photos at `/team/<slug>.png` are not shadowed by a splat.
- `legacyHashTarget` only uses the hash as a lookup key, so the target is always a same-origin `/about...` path.
- No source file still links to `/team/...` or `/#team`.
- The profile canonical matches the extensionless URL that Cloudflare serves.

No blockers. The two warnings are about guards that cannot fail when they should:
1. The redirect tests check only one direction. A member removal leaves dead `/team/<slug>` and `/about/team/<slug>` links that no test catches, and these are the URLs printed on cards.
2. The `notFound` test passes even if the guard is deleted.

Necessity rubric read. No necessity findings: the trailing-slash rules are proven needed by the production 404 recorded in 8c5259c, and the exported `legacyHashTarget` is a test seam.

Already recorded elsewhere, not repeated here: (1) the nav wraps at 320px (11-UI-REVIEW.md), and (2) the redirects test accepts `/\` destinations (11-SECURITY.md). Related to (1): `.profile` uses a fixed `4.0625rem` offset, so when the nav wraps it also hides the profile breadcrumbs (see IN-04).

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Redirect integrity is checked one way only. Removing a member silently breaks printed-card URLs

**File:** `src/__tests__/redirects.test.ts:22-28`, `public/_redirects:6`
**Issue:** The test checks that every member in `members` has a rule (members ⊆ rules). It never checks the reverse: that every `/about/team/<slug>` destination is still a generated profile. The `_redirects` comment (line 6) says a departed member's line must be repointed to `/about#team`, but that step is manual and nothing enforces it. If someone removes a member from `members.ts` and forgets that edit:
- `/team/<slug>` 301s to a 404.
- The suite stays green.
- That URL is on printed business cards, which the project constraints say must keep working.

The same removal also 404s `/about/team/<slug>`. Email signatures created after v1.1 point there, and no process covers that URL at all.
**Fix:** Add the reverse assertion. Then extend the `_redirects` comment so a removed profile also gets a `/about/team/<slug> /about#team 301` line.
```ts
it("every /about/team/<slug> destination is a generated profile", () => {
  const slugs = new Set(members.map((m) => m.slug));
  for (const [from, to] of rules) {
    const m = /^\/about\/team\/([^/#]+)$/.exec(to);
    if (m) expect(slugs.has(m[1]), `${from} -> ${to}`).toBe(true);
  }
});
```

### WR-02: The unknown-slug test passes even if the `notFound()` guard is deleted

**File:** `src/__tests__/profile.test.tsx:84-87`
**Issue:** `await expect(TeamMemberPage(params("no-such-member"))).rejects.toThrow()` accepts any exception. If someone deletes `if (!member) notFound();` (`src/app/about/team/[slug]/page.tsx:32`), `generateQRSvg(undefined)` throws a `TypeError` on `member.name` and the test still passes. So the test does not protect the guard it is named after.
**Fix:** Assert that the rejection is Next's 404 signal:
```ts
await expect(TeamMemberPage(params("no-such-member"))).rejects.toMatchObject({
  digest: expect.stringContaining("404"),
});
```
(or `vi.mock("next/navigation", ...)` with a spy `notFound` and assert it was called).

## Info

### IN-01: The legacy hash hop runs only after hydration and only on mount

**File:** `src/components/ui/LegacyHashRedirect.tsx:16-20`
**Issue:** The redirect sits in `useEffect`, so on slow connections a visitor arriving at `/#team` sees the home hero until the JS bundle has loaded and hydrated, then gets moved away. Same-document hash changes on `/` (for example, editing the address bar to `/#team` while on the home page) never trigger it, because the effect does not re-run.
**Fix:** Optional. Put a tiny inline `<script>` at the top of the home page that does the same lookup before first paint, and keep the component as a fallback. Or add a `hashchange` listener in the effect.

### IN-02: Home meta description keeps copy that the page no longer shows

**File:** `src/app/page.tsx:7-10`, `src/__tests__/about.test.tsx:107-109,125-128`
**Issue:** The hero tagline "Research, dialogue, and civic action..." was replaced by the Mission lead, and a test asserts the old text is gone from the page. Another test pins that same old text as the meta description. Search snippets will show a tagline that appears nowhere on the site.
**Fix:** If this is intentional, document it in the test. Otherwise update `description` to the Mission lead and update the test.

### IN-03: Dead `.subtitle` class left in the rewritten home stylesheet

**File:** `src/app/page.module.css:42-51`
**Issue:** This phase removed the about/team rules from this file but left `.subtitle` behind, and nothing references `styles.subtitle`.
**Fix:** Delete the block.

### IN-04: The profile's nav offset is a hard-coded nav height, and BusinessCard now depends on it

**File:** `src/app/about/team/[slug]/page.module.css:3`, `src/components/ui/BusinessCard.module.css:9`
**Issue:** `4.0625rem` is the fixed nav's height measured at one line (padding plus wordmark line-height plus the 1px border). The same literal is duplicated in `events/2026-run-for-ukraine/layout.module.css:5`. `BusinessCard` dropped from `7rem` to `0.5rem` top padding, so it now only clears the fixed nav when its parent supplies that offset. If the nav wraps (the known 320px issue) or its type changes, the breadcrumbs end up under the header.
**Fix:** Define a single `--nav-height` token in `tokens.css` and use it in both places. Optionally use `scroll-padding-top`/`padding-top: var(--nav-height)`.

### IN-05: CLAUDE.md client component table omits `LegacyHashRedirect`

**File:** `CLAUDE.md` (Server vs Client Components table)
**Issue:** This phase added a new `'use client'` component that runs on every home page load. The table still lists only `EventTimeline` and `ObfuscatedEmail`.
**Fix:** Add the row `| LegacyHashRedirect | Client | Maps legacy /#team, /#about to /about anchors |`.

### IN-06: Non-parallel sentence in the History copy

**File:** `src/app/about/page.tsx:47`
**Issue:** "to show that using the assets is legally sound, carefully designed, that the risks can be managed, and that it is a responsible way..." mixes adjective items with "that" clauses, and "using the assets is ... carefully designed" does not quite parse. This is the organisation's credibility page. The test at `about.test.tsx:35` pins the text verbatim, so the copy and the test change together.
**Fix:** For example: "to show that using the assets is legally sound, that a scheme can be carefully designed and its risks managed, and that it is a responsible way to support Ukraine's defence." (Requires copy owner sign-off.)

---

_Reviewed: 2026-11-16T09:55:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
