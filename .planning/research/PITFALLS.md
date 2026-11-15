# Domain Pitfalls

**Domain:** URL migration and page restructure on a static Next.js 16 export served by Cloudflare Pages (v1.1 About Us: `/team/[slug]` moves to `/about/team/[slug]`, `/#team` moves to `/about#team`)
**Researched:** 2026-11-15
**Overall confidence:** MEDIUM. Codebase facts come from reading the repo directly (HIGH). Cloudflare behavior comes from the official Cloudflare docs, but the GSD confidence seam rates `webfetch`/`websearch` LOW. Treat every Cloudflare claim below as "verify with curl", and the verification phase does exactly that.

## Phase labels used below

The roadmap does not exist yet, so the pitfalls are mapped to three logical phases. The roadmapper can rename them.

- **P-About**: `/about` page shell (Mission, History, Team grid), homepage mission teaser, Nav "Team" changed to "About us".
- **P-Move**: Team profiles move to `/about/team/[slug]`, photo relocation, `public/_redirects`, legacy `/#team` hop. **The move and the redirects must ship in the same deploy.** If the move ships alone, every printed QR card 404s. If the redirects ship alone, they point at pages that do not exist yet.
- **P-SEO+Verify**: Canonicals, sitemap, breadcrumbs, metadata, the deploy verification script, and a post-deploy curl check against preview and production.

## Codebase facts that shape these pitfalls (HIGH, read directly)

| Fact | Where | Why it matters |
|------|-------|----------------|
| Member photos are served from `/team/<slug>.png` | `public/team/*.png` (7 files), `src/data/members.ts` `photo:` fields | A `/team/*` redirect rule also catches these files (Pitfall 1) |
| `next.config.ts` has no `trailingSlash` | `output: "export"` only | Export writes flat files (`out/team/x.html`). Pages treats the slash-less `/team/x` as canonical |
| Existing `_redirects` has one dynamic rule | `/r4u/:slug ... 301` | It must keep working, and it counts toward the 100-dynamic-rule limit |
| Nav links to `/#team` with `next/link` | `src/components/layout/Nav.tsx:12` | Soft navigation never runs an inline hop script (Pitfall 6) |
| Homepage has `<section id="team">` | `src/app/page.tsx:47` | Removing it means a no-JS visit to `/#team` lands at the top of the homepage |
| The team page has no canonical tag, and the root layout has no `metadataBase` | `src/app/team/[slug]/page.tsx`, `src/app/layout.tsx` | New pages need absolute canonical URLs written out, like the event layouts do |
| The sitemap does not list team pages at all today | `src/app/sitemap.ts` | Add `/about` and `/about/team/*`. Do not add `/team/*` |
| The on-page QR encodes a **vCard** (name, org, title, email, phone), **not a URL** | `src/lib/qr.ts` `generateVCard` | The URL on the *printed* card is separate from the on-page QR. Confirm what the printed card encodes (see Gaps) |
| Nav is `position: fixed` | `src/components/layout/Nav.module.css:2` | Without `scroll-margin-top`, the fixed nav covers the `#team` heading on `/about#team` |
| Tests hardcode the old paths | `components.test.tsx:131-134` (`/team/test-person` href), `:89` ("Team" nav text), `members.test.ts:68` (`/team/${slug}.png`), `qr.test.ts` fixtures | These tests must be updated on purpose, not just made green |
| CI runs only on push to `main`, and its build has no redirect check | `.github/workflows/ci.yml` | Nothing verifies `_redirects` automatically today |
| `CLAUDE.md` documents the route as `/team/[slug]` | `CLAUDE.md:190` | Doc drift. Update it in P-Move |

## Critical Pitfalls

### Pitfall 1: `/team/*` redirect swallows the member photos
**What goes wrong:** You add `/team/* /about/team/:splat 301`. Every `<img src="/team/michael-desloover.png">` now 301s to `/about/team/michael-desloover.png`, which does not exist. Photos disappear site-wide on `/about`, on the profile pages, and anywhere else they are used.
**Why it happens:** Cloudflare docs: "Redirects are always followed, even if a static asset exists at the requested path." Unlike Netlify, Pages does not let an existing file shadow a rule. A `:slug` placeholder rule has the same problem, because placeholders match any character except `/`, dots included.
**Consequences:** Broken images on the very pages this milestone builds. Easy to miss in `next dev`, which ignores `_redirects`.
**Prevention (recommended):** Move the photos to `public/about/team/<slug>.png` and update `members.ts`. The splat then maps old photo URLs onto real files, so any external hotlink or cached share of `/team/x.png` keeps working too. No per-file exceptions are needed.
- Alternative (worse): keep `public/team/` and write one static rule per slug (7 lines). Every new member then needs a new rule, and forgetting one silently breaks their QR card.
- Update `members.test.ts:68` to the new path, and add one cheap test that every `member.photo` exists on disk under `public/`.
**Detection:** In the post-deploy curl, `/about/team/<slug>.png` must return 200 and `/team/<slug>.png` must return 301 then 200. A broken-image icon on `/about` in the preview deploy is the visual warning sign.
**Phase:** P-Move.

### Pitfall 2: Moving the route without the redirect, or the redirect without the route
**What goes wrong:** You split this into two PRs or phases that deploy separately. The window between them either 404s every printed QR card or 301s it to a page that does not exist yet. Browsers cache a 301 for a long time, so a 301 to a 404 can stick in visitors' browsers even after the fix ships.
**Prevention:** Make one atomic change in P-Move: delete `src/app/team/`, add `src/app/about/team/[slug]/page.tsx` (same `generateStaticParams` over `members`), and add the `_redirects` rules. Delete the old route rather than keeping it. If you keep it, `out/team/x.html` still builds but the redirect hides it, which leaves dead output and duplicate content if a rule is ever removed.
**Detection:** After `next build`, `out/team/` must contain no `.html` files, and `out/about/team/<slug>.html` must exist for every member.
**Phase:** P-Move.

### Pitfall 3: Forgetting the status code, which ships a 302
**What goes wrong:** You write `/team /about#team` with no code. The Cloudflare `_redirects` default is **302**, so search engines keep indexing the old URL and the move never consolidates.
**Prevention:** Write `301` explicitly on every line. Add a unit test that parses `public/_redirects` and fails on any non-comment line without an explicit 301 or 308. Do not ship 302 "temporarily, to be safe". Test on the preview host instead, because 301 caching is per host, so preview tests cannot poison production clients.
**Phase:** P-Move (rule), P-SEO+Verify (test).

### Pitfall 4: Trailing-slash and index variants left unhandled
**What goes wrong:** Real traffic arrives as `/team`, `/team/`, `/team/x`, `/team/x/` and sometimes `/team/x.html`. Cloudflare docs do not say whether `*` matches an empty string, or whether `/team` also matches `/team/`. Without explicit rules, `/team/` may fall into the splat and become `/about/team/` with nothing to serve, which returns a 404.
**Prevention:** Use this rule set. Static rules first, then dynamic, and the most specific rule first within a group:
```
# Short URL for participant fundraising pages
/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301

# v1.1 About Us: team moved under /about (printed QR cards point at /team/*; never delete)
/team /about#team 301
/team/ /about#team 301
/about/team /about#team 301
/about/team/ /about#team 301
/team/* /about/team/:splat 301
```
- `/team/x/` goes to `/about/team/x/`, and Pages' own HTML handling then sends it on to `/about/team/x`. That is two hops but correct. Do not try to strip slashes in `_redirects`.
- `/team/x.html` goes to `/about/team/x.html`, which Pages strips to `/about/team/x`. Also correct.
- Do **not** flip `trailingSlash: true` in `next.config.ts` as part of this milestone. That changes the canonical form of every URL on the site, including the event pages and the `/r4u` destination.
**Detection:** The curl matrix (see Verification) covers all five variants and must end at 200 within 3 hops.
**Phase:** P-Move (rules), P-SEO+Verify (matrix).

### Pitfall 5: Using `next.config.ts` `redirects()` instead of `_redirects`
**What goes wrong:** Next's `redirects()` is not supported with `output: "export"`. Depending on version it warns or is ignored, so nothing redirects in production.
**Prevention:** Redirects live only in `public/_redirects`, which is copied to `out/_redirects`. Check that `out/_redirects` contains the new rules after the build.
**Phase:** P-Move.

### Pitfall 6: The `/#team` hop is implemented in a way that traps Back or never runs
**What goes wrong (several variants):**
- `location.href = "/about#team"` (or `assign`) adds a history entry. Pressing Back returns to `/#team`, which hops forward again, so the user is stuck.
- The hop lives in a `'use client'` `useEffect`. It runs only after hydration, so the user sees the homepage flash and the scroll position jumps.
- The hop is an inline script on the homepage, but internal links to `/#team` use `next/link`. App Router soft navigation does not run inline scripts again, so the hop never fires and the user lands at the top of the homepage.
- The hop matches loosely (`includes("team")`) or drops the query string, which loses `utm_*` tags from shared links.
**Prevention:**
- Render one tiny inline script **only on the homepage**, as early in the page as possible, as a server component with `dangerouslySetInnerHTML`:
  `if (location.hash === "#team") location.replace("/about" + location.search + "#team");`
  `replace` keeps Back working. An exact hash match avoids false hits. Keeping `location.search` preserves campaign tags.
- Remove every internal `/#team` link in the same phase. The only one today is `Nav.tsx:12`. Add a test that greps `src/` and fails on `"/#team"` anywhere except the hop component. The hop covers external links (old emails, social posts, bookmarks), not internal ones.
- No-JS fallback: keep a visible "Meet the team" or "About us" link in the homepage mission teaser. Optionally give the teaser `id="team"` so a no-JS visit to `/#team` scrolls straight to the link. This is cheap and preserves meaning.
- Optionally (one more line), add a `hashchange` listener for someone already on `/` who edits the hash by hand. This is low value. Skip it unless it costs nothing.
- If a CSP is ever added in `_headers`, this inline script needs a hash. There is no CSP today.
**Detection:** Manual check in the preview: open `/#team`, confirm you land on `/about#team` with the Team heading visible, press Back, and confirm you return to the referring page, not a loop. Repeat with JS disabled: you should land on the homepage with the teaser link visible.
**Phase:** P-Move.

### Pitfall 7: The anchor target is missing, renamed, or hidden under the fixed nav
**What goes wrong:** `/team` and `/#team` both point at `/about#team`. If the About page's Team section has a different id (`team-section`, `Team`), or none, both redirects land at the top of the page. If the id is right but the section has no `scroll-margin-top`, the `position: fixed` Nav covers the heading.
**Prevention:** Put `id="team"` (lowercase, exact) on the Team `<section>` of `/about`. Add `scroll-margin-top` equal to the nav height using an existing spacing token. Add a render test asserting `#team` exists on the About page. Keep `id="mission"` and `id="history"` stable too, because the homepage teaser and future links will target them.
**Phase:** P-About.

## Moderate Pitfalls

### Pitfall 8: SEO signals still point at old URLs or at redirecting URLs
**What goes wrong:**
- Canonicals or sitemap entries use a URL that itself redirects (`/team/x`, `/about/team/x/` with a trailing slash). Google sees inconsistent signals.
- A relative canonical with no `metadataBase` in the root layout makes Next emit a relative or missing canonical.
- `openGraph.url` is inherited from a parent layout, so shares of `/about` show the homepage URL.
**Prevention:**
- Write absolute canonicals by hand, following the pattern the event layouts already use (`alternates.canonical: \`${BASE_URL}/about/team/${slug}\``), with no trailing slash. That matches Pages' canonical form for flat `.html` exports.
- Generate the sitemap's member entries from the `members` array so they cannot drift. List `/about` and `/about/team/<slug>`. Never list `/team/*`.
- After the deploy, resubmit `sitemap.xml` in Search Console and use URL Inspection on one old `/team/x` URL to confirm Google sees the 301.
- Keep the 301s forever. The printed cards have no expiry date.
**Phase:** P-SEO+Verify.

### Pitfall 9: Tests updated to green instead of updated to intent
**What goes wrong:** You change `"/team/test-person"` to `"/about/team/test-person"` and `"Team"` to `"About us"`, and the suite passes. But nothing tests the things that actually break in production: redirect rules, photo existence, the hop, or leftover `/#team` links.
**Prevention:** Update the existing assertions (`components.test.tsx:89,131-134`, `members.test.ts:68`, the `qr.test.ts` fixture photo paths) **and** add these cheap guards:
1. Parse `public/_redirects` and assert: every line has an explicit 301; for each member slug, `/team/<slug>` resolves to `/about/team/<slug>` by simple splat substitution; the `/r4u/:slug` rule is still present.
2. Every `member.photo` exists in `public/`.
3. No `"/#team"` string remains in `src/` outside the hop component.
4. `/about` renders an element with `id="team"`.
These are fast Vitest tests with no browser.
**Phase:** P-Move (1-3), P-About (4).

### Pitfall 10: Breadcrumbs and titles describe the old hierarchy
**What goes wrong:** Profile breadcrumbs read "Home > Team > Name", or link "Team" to `/#team`, which forces a hop on every click. Page titles and descriptions drift from the new structure.
**Prevention:** Profile breadcrumbs should read `Home > About us > {name}`, with "About us" linking to `/about#team` (or `/about`). `/about` itself reads `Home > About us`. Reuse `Breadcrumbs.tsx` as is. Note that it renders a plain `<a>`, which is fine for a static site. If you add BreadcrumbList JSON-LD, follow the existing `application/ld+json` pattern in the event layout, with absolute URLs.
**Phase:** P-SEO+Verify (P-About may scaffold it).

### Pitfall 11: Em dashes and copy-rule violations slip in through metadata and placeholders
**What goes wrong:** Placeholder Mission or History copy, `description` metadata, OG text and breadcrumb labels are written quickly and contain em dashes. Page titles follow the existing `Name | European Resolve` pattern for a reason.
**Prevention:** Run a test over the About page's copy source, and over the new metadata strings, that fails on `—`. `AccountabilityReport.test.tsx` already does a similar check you can copy.
**Phase:** P-About.

### Pitfall 12: Verifying redirects only in `next dev`
**What goes wrong:** `next dev` ignores `_redirects` and Pages HTML handling, so everything "works" locally and breaks in production.
**Prevention:** Before merging, run `npx wrangler pages dev out` after `next build`. It applies `_redirects` and Pages-style HTML handling locally. Then run the curl matrix against the branch preview `*.pages.dev` URL. Pages adds `X-Robots-Tag: noindex` to preview URLs, so testing there has no SEO side effects.
**Phase:** P-SEO+Verify.

## Minor Pitfalls

### Pitfall 13: Redirect loops from "helpful" extra rules
**What goes wrong:** Someone adds `/about/ /about 301` or `/about /about#team 301`. Pages already normalizes `/about/` to `/about` when a flat `about.html` exists, and a rule whose destination path equals its source loops. Fragments in the source are never evaluated, so `/about#x` matches `/about`.
**Prevention:** No rule's source may equal its destination path (ignoring the fragment). Put that in the `_redirects` parse test. The `out/x.html` plus `out/x/` directory layout already works in production for `/events/2026-run-for-ukraine` and its subpages, so `/about` plus `/about/team/` needs no special handling.
**Phase:** P-Move.

### Pitfall 14: Fragment semantics misunderstood
**What goes wrong:** You assume `/team#foo` can be matched on the server (it cannot, fragments never reach Cloudflare), or that a fragment in the destination will be dropped.
**Facts:** Cloudflare docs say destinations may include fragments, so `/team /about#team 301` is valid. Under RFC 9110, if the `Location` has no fragment, the browser keeps the original one. So `/team/x#contact` arrives at `/about/team/x#contact`. If the `Location` has a fragment, it replaces the original.
**Phase:** P-Move (awareness), P-SEO+Verify (curl confirms the `Location: /about#team` header).

### Pitfall 15: Rule limits and ordering
**Facts (Cloudflare docs):** 2,000 static plus 100 dynamic rules per file, 1,000 characters per line, one splat per rule, and the top-most rule wins for the same source. Static rules should come before dynamic ones. Bulk Redirects and zone-level Page Rules or Cache Rules on the custom domain run **before** `_redirects` and can override them.
**Risk here:** Negligible on count (2 dynamic plus 4 static). The real risk is a zone-level rule on `european-resolve.org` you do not know about. Check the Cloudflare dashboard (Bulk Redirects, Redirect Rules, Page Rules) for anything touching `/team`.
**Phase:** P-SEO+Verify.

### Pitfall 16: Stale QR codes and future member departures
**What goes wrong:** The splat keeps every printed card working today. If a member leaves and is removed from `members.ts`, their card 301s to a 404.
**Prevention:** Document in `_redirects` that a departed member gets a static `/about/team/<old-slug> /about#team 301` line. Do not change `generateVCard` in this milestone. If a URL field is ever added to the vCard, it must use `/about/team/<slug>`.
**Phase:** P-Move (comment only).

### Pitfall 17: `404.html` disappearing turns 404s into soft 200s
**What goes wrong:** Pages treats a deploy without a top-level `404.html` as an SPA and serves `/` with 200 for unknown paths. Then `/about/team/typo` "works" and shows the homepage.
**Prevention:** Next export emits `out/404.html` by default. Add `test -f out/404.html` to the verify script so a future change cannot remove it silently.
**Phase:** P-SEO+Verify.

## Verification recipe (P-SEO+Verify)

A shell script in `scripts/`, run against `npx wrangler pages dev out`, then the branch preview, then production:

```bash
BASE=${1:-https://european-resolve.org}
S=michael-desloover
for p in /team /team/ /team/$S /team/$S/ /team/$S.html /team/$S.png \
         /about /about/team /about/team/$S /about/team/$S.png /r4u/test; do
  printf '%-34s ' "$p"
  curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "$BASE$p"
done
# Final status and hop count per legacy URL (expect 200, at most 2 redirects)
curl -sIL --max-redirs 3 -o /dev/null -w '%{http_code} hops=%{num_redirects}\n' "$BASE/team/$S/"
```

Expected results:
- `/team` and `/team/` return `301 -> /about#team`.
- `/team/$S` returns `301 -> /about/team/$S`.
- `/team/$S.png` returns `301 -> /about/team/$S.png`, which then returns 200.
- `/about/team/$S` returns 200.
- `/r4u/test` still returns 301.
- Pages' own trailing-slash hops may be 307 or 308 (reports differ). Either is fine. Only your own rules must be 301.

Then check the hash hop by hand (Pitfall 6 detection), because curl cannot see fragments or JavaScript.

## Phase-Specific Warnings

| Phase | Likely pitfall | Mitigation |
|-------|----------------|------------|
| P-About | Missing or wrong `id="team"`, heading hidden under the fixed nav (7). Em dashes in placeholder copy and metadata (11). | Exact id plus `scroll-margin-top`, a render test, an em-dash test |
| P-About | Nav label changed but `/#team` href kept (6) | Nav goes to `/about`. The grep test bans `"/#team"` |
| P-Move | Splat swallows photos (1). Non-atomic move (2). Implicit 302 (3). Slash variants (4). `next.config` redirects (5). Back-button trap or soft-nav miss (6). Loops (13). | Photos to `public/about/team/`. One PR. Explicit 301 rule block. `location.replace` inline script. `_redirects` parse test |
| P-SEO+Verify | Canonical or sitemap point at redirecting URLs (8). `next dev`-only testing (12). Zone rules overriding (15). Lost `404.html` (17). | Absolute slash-less canonicals, sitemap generated from `members`, wrangler then preview then prod curl matrix, dashboard check |

## Gaps

- **What the printed business cards actually encode.** The repo's QR is a vCard with no URL. If the printed cards carry a URL, confirm its exact form (`https://european-resolve.org/team/<slug>`, with or without `www.`, with or without a trailing slash) and add that exact string to the curl matrix. If they encode a `www.` host, confirm the apex/www redirect exists at the zone level.
- **Whether `/team` also matches `/team/`, and whether `*` matches empty, in Pages `_redirects`.** The docs are silent. The rule block above sidesteps this by listing both forms. The curl matrix confirms it.
- **The status code of Pages' built-in trailing-slash redirect** (307 per docs, 308 observed by third parties). Cosmetic for this milestone.
- **Zone-level rules on the custom domain.** These cannot be seen from the repo. Someone with dashboard access must check.

## Sources

- Codebase inspection (HIGH): `public/_redirects`, `public/team/`, `next.config.ts`, `src/app/team/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/qr.ts`, `src/components/layout/Nav.tsx`, `Nav.module.css`, `src/components/ui/Breadcrumbs.tsx`, `src/__tests__/*`, `.github/workflows/ci.yml`
- [Cloudflare Pages: Redirects](https://developers.cloudflare.com/pages/configuration/redirects/): limits, ordering, "redirects always followed even if asset exists", 302 default, fragments allowed in destination, splat and placeholder semantics (official docs; seam tier LOW for webfetch, verify with curl)
- [Cloudflare Pages: Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/): `.html` stripping, 404.html lookup and SPA fallback, `X-Robots-Tag: noindex` on previews (official docs; seam tier LOW)
- [Workers static assets: redirects](https://developers.cloudflare.com/workers/static-assets/redirects/) and [2025-08-15 changelog on redirect fixes](https://developers.cloudflare.com/changelog/2025-08-15-static-assets-redirect-url/): HTML handling may answer before `_redirects` for slash variants (LOW)
- [Path routing in Cloudflare Pages](https://danallan-net.pages.dev/blog/2024-12-cloudflare-pages-routing) and [Fixing Astro SEO on Cloudflare Pages (trailing slash)](https://engineered.at/articles/fixing-astro-seo-on-cloudflare-pages-why-trailingslash-doesn-t-work-and-what-does): 307 vs 308 trailing-slash observations (LOW, community)
