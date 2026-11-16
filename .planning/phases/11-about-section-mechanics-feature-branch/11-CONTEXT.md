# Phase 11: About section mechanics (feature branch) - Context

**Gathered:** 2026-11-16
**Status:** Ready for planning

<domain>
## Phase Boundary

On a feature branch, verified on a Cloudflare preview deploy only (never merged to `main` in this phase): `/about` with Mission, History and Team; team profiles moved to `/about/team/<slug>` with breadcrumbs; `public/_redirects` legacy rules; client-side legacy hash hop on `/`; nav "About us"; homepage mission teaser; metadata, canonicals and sitemap; guard tests. Requirements: ABOUT-01, ABOUT-02, ABOUT-05, ABOUT-06, NAV-01, NAV-02, LINK-01..04, SEO-01, SEO-02, QA-01.

**Scope change from discussion:** the user supplied final Mission and History copy during this discussion, so the copy on `/about` is FINAL, not interim. ABOUT-03 and ABOUT-04 are effectively satisfied by this phase's content. Phase 12 is then gated only on footer legal data (LEGAL-01) plus the preview curl matrix and merge (QA-02). ROADMAP.md / REQUIREMENTS.md traceability should be updated to reflect this at phase transition (not part of this phase's code work).

</domain>

<decisions>
## Implementation Decisions

### Carried forward (decided at milestone level, do not revisit)
- **D-01:** Photo strategy Option B: photos stay at `public/team/<slug>.png`; 7 explicit `/team/<slug> /about/team/<slug> 301` lines plus exact `/team` and `/team/` → `/about#team` 301; no `/team/*` splat. — **Reversibility:** one-way — 301s are cached hard by browsers and printed business cards depend on them; only reversible before the Phase 12 merge.
- **D-02:** Route move and `_redirects` go live in the same deploy (single Phase 12 merge). Nothing from this phase reaches `main`.
- **D-03:** Nav links straight to `/about`; only external legacy fragment links use the client-side hop.
- **D-04:** Sitemap lists `/about` only; member pages stay unlisted (ADR-005).

### About copy (final, not interim)
- **D-05:** All About copy is FINAL. No interim marker and no "interim copy" guard test are needed (the marker idea was agreed, then made moot when both sections were confirmed final).
- **D-06:** Mission/History split is "story vs purpose": History tells the founding story and ends at "...European Resolve."; the original History closing paragraph moved into Mission, replacing the core-definitions second sentence ("Through research, advocacy and public engagement...", dropped).
- **D-07:** British spelling to match the rest of the site (organisation, mobilisation, realised, defence). The supplied copy used American spelling; it is already converted below. Use the text below verbatim.
- **D-08:** Prose lives inline in JSX in `src/app/about/page.tsx` (same pattern as the current homepage About block and `privacy/page.tsx`). No `src/data/about.ts`.

### /about page shape
- **D-09:** Page starts with an `h1` "About us", then Mission, History, Team (each an `h2` section with `id="mission"`, `id="history"`, `id="team"` and `scroll-margin-top` clearing the fixed nav). No jump-link row, no extra intro copy.
- **D-10:** Mission lead sentence set large in the serif face (Source Serif, styled like the homepage hero statement); the second paragraph is body text.
- **D-11:** Reuse existing styling: move the homepage `.about*` / `.team*` rules from `src/app/page.module.css` into `src/app/about/page.module.css` and apply them to all three sections. No `/gsd-ui-phase` design pass.

### Homepage
- **D-12:** Teaser text is exactly the Mission lead sentence: "We exist to turn Europe's concern into resolve, and resolve into action."
- **D-13:** The teaser REPLACES the hero subline ("Research, dialogue, and civic action to reinforce European security and democracy."). Hero becomes: h1 + teaser line + "More about us" link to `/about`. Homepage `#about` and `#team` sections are removed.
- **D-14:** Link label: "More about us".

### Profile page & legacy hops
- **D-15:** Breadcrumbs `Home > About us > Name` sit above the BusinessCard, using the existing `Breadcrumbs` component as on event pages; reduce `BusinessCard.module.css` `padding-top: 7rem` so the card does not sit lower than today. Visual check on the preview.
- **D-16:** Absolute canonicals `https://european-resolve.org/about` and `https://european-resolve.org/about/team/<slug>` via `alternates.canonical`, following the `BASE_URL` pattern in `src/app/events/2026-run-for-ukraine/layout.tsx`.
- **D-17:** The hash hop on `/` handles BOTH `/#team` → `/about#team` and `/#about` → `/about#mission`, with `location.replace` (Back is not trapped), exact hash match, query string preserved. The guard test bans internal `"/#team"` (and `"/#about"`) links in `src/` outside the hop component.

### Final copy (verbatim, use as-is)

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and decisions
- `.planning/ROADMAP.md` §Phase 11 — goal and 5 success criteria (note D-05 scope change)
- `.planning/REQUIREMENTS.md` — requirement IDs, Out of Scope table, open items
- `.planning/research/SUMMARY.md` — redirect mechanics, Option A/B analysis, pitfalls, curl matrix
- `.planning/research/PITFALLS.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md` — detail behind the summary

### Copy source
- `.planning/intel/01_core_definitions.md` §Mission — origin of the Mission lead sentence (gitignored local intel; may be absent in other checkouts, the copy above is authoritative)

### Platform docs
- https://developers.cloudflare.com/pages/configuration/redirects/ — `_redirects` rules (redirects followed even when an asset exists; default 302)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/Breadcrumbs.tsx`: already used on event pages (`register/page.tsx`, `fundraise/page.tsx`)
- `src/components/ui/MemberCard.tsx:7`: href `/team/${member.slug}` → `/about/team/${member.slug}`
- `src/app/team/[slug]/page.tsx`: moves as-is to `src/app/about/team/[slug]/page.tsx` (`generateStaticParams`, metadata, QR)
- `src/app/page.module.css`: `.about*`, `.team*`, `.grid` styles to move; `.statement` is the serif hero style to echo for the Mission lead
- `src/__tests__/AccountabilityReport.test.tsx`: existing em-dash test pattern to copy

### Established Patterns
- Absolute canonical via local `BASE_URL` constant (`src/app/events/2026-run-for-ukraine/layout.tsx:7,41`)
- `public/_redirects` already carries `/r4u/:slug ... 301` with an explicit code; new rules follow it and must keep `/r4u` working

### Integration Points
- `src/components/layout/Nav.tsx:12`: `<Link href="/#team">Team</Link>` → "About us" `/about`
- `src/app/page.tsx`: hero subline replaced, `#about`/`#team` removed, hop component mounted
- `src/app/sitemap.ts`: add `/about`
- `src/components/ui/BusinessCard.module.css:9`: `padding-top: 7rem` to reduce
- Tests hardcoding old paths: `src/__tests__/components.test.tsx` (MemberCard href, Nav label), `src/__tests__/members.test.ts`, `qr.test.ts` fixtures (photo paths unchanged under Option B)
- CLAUDE.md Entry Points table (`/team/[slug]` → `/about/team/[slug]`, add `/about`)

</code_context>

<specifics>
## Specific Ideas

- The History is the Frozen Assets Action origin story (seven founders, 2025); the user wants it and the Mission to read as one coherent pair without repetition.
- Teaser and Mission lead must be the same sentence.

</specifics>

<deferred>
## Deferred Ideas

None. Discussion stayed within phase scope.

</deferred>

---

*Phase: 11-about-section-mechanics-feature-branch*
*Context gathered: 2026-11-16*
