---
phase: "11"
slug: "about-section-mechanics-feature-branch"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-16"
---

# Phase 11: Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| URL fragment and query -> homepage hop | `location.hash` and `location.search` are attacker-controllable through a crafted link to `/` | Untrusted URL parts, no PII |
| Repo copy -> static HTML | About copy is static JSX rendered at build time | Public copy |
| Static build -> public crawlers | `sitemap.xml` and canonical tags are read by search engines | Public URLs |
| Repo member data -> profile HTML | Member fields (including existing bio HTML) render into static pages | Staff names, titles, photos, socials (public by choice, ADR-005) |
| Repo config -> Cloudflare edge | `public/_redirects` rules apply to every visitor | Redirect rules |
| Local branch -> origin | A push to `main` deploys production | Release control |
| Preview host -> public | pages.dev preview URLs are reachable by anyone who has them | Same public build, no secrets |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-11-01 | Spoofing (open redirect) | `legacyHashTarget` in `src/components/ui/LegacyHashRedirect.tsx` | medium | mitigate | Exact-match `Map` lookup (`#team`, `#about`); hash never interpolated; target is `/about${search}#anchor`, and `search` is empty or starts with `?`, so the origin cannot change. `src/__tests__/legacy-links.test.ts` asserts null for `""`, `#`, `#teams`, `#Team`, `#mission`, `#team-x`, `#constructor`, `#__proto__` and asserts search preservation. | closed |
| T-11-02 | Tampering | `src/app/about/page.tsx` copy | low | accept | Static JSX escaped by React; no `dangerouslySetInnerHTML` in `src/app/about/` (grep). See accepted risks. | closed |
| T-11-03 | Information disclosure | `src/app/sitemap.ts` | medium | mitigate | Sitemap lists `/`, `/about`, event pages and `/privacy` only; no member URL (ADR-005, D-04). `src/__tests__/profile.test.tsx:100` asserts no sitemap URL contains `/team`. | closed |
| T-11-04 | Spoofing | `generateMetadata` canonical in `src/app/about/team/[slug]/page.tsx` | low | mitigate | `alternates.canonical` is `${BASE_URL}/about/team/${slug}` (line 25); `profile.test.tsx:63-71` asserts the absolute `https://european-resolve.org` canonical per member; `about.test.tsx:79-84` covers `/about`. | closed |
| T-11-05 | Tampering | `BusinessCard` bio via `dangerouslySetInnerHTML` (existing, `src/components/ui/BusinessCard.tsx:40`) | low | accept | Unchanged by this phase; bio is static repo data reviewed in pull requests. See accepted risks. | closed |
| T-11-06 | Tampering / Denial of service | `public/_redirects` | high | mitigate | `src/__tests__/redirects.test.ts`: every rule ends in `301` (l.35-38), no `/team/` splat or placeholder source so photos are never hijacked (l.42-44), no self-redirect (l.49-51), unique sources (l.62), at least 10 rules (l.18-19), `/team/<slug>` and `/team/<slug>/` present for every member (l.22-26, covers hotfix 8c5259c). | closed |
| T-11-07 | Spoofing (open redirect) | `public/_redirects` destinations | low | mitigate | `redirects.test.ts:55-58` asserts every destination matches `^/(?!/)` (same-origin path, rejects protocol-relative `//`). All 17 current destinations are `/about...` or `/events/...`. | closed |
| T-11-08 | Elevation of privilege / Tampering | git push of phase commits | high | mitigate | Human checkpoint held: `main` was pushed (`ed57153 -> a5a36ee`) only with the user's explicit, twice-confirmed authorisation after being told it deploys production (`11-04-SUMMARY.md` lines 36, 114, 184-189). The plan's secondary checks ("branch is not main", "production /about 404") were superseded by that user decision, not bypassed by an agent. | closed |
| T-11-09 | Information disclosure | pages.dev preview deploy | low | accept | Preview shows the same public data as production; static build holds no secrets. See accepted risks. | closed |
| T-11-SC | Tampering (supply chain) | npm installs (`npm ci` in each plan's Task 1) | high | mitigate | `git diff` of `package.json` and `package-lock.json` across the phase range (first commit 81cf12a~1 to HEAD) is empty: no package added, `npm ci` installs lockfile-pinned packages with integrity hashes. | closed |

*Status: open · closed · open, below high threshold (non-blocking)*
*Severity: critical > high > medium > low; only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-11-01 | T-11-02 | Static About copy rendered as React-escaped JSX; no raw HTML sink added. | Phase 11 plan 11-01 threat model (plan-time disposition) | 2026-11-16 |
| AR-11-02 | T-11-05 | Pre-existing bio `dangerouslySetInnerHTML`, untouched by this phase; source is repo-controlled and PR-reviewed. | Phase 11 plan 11-02 threat model (plan-time disposition) | 2026-11-16 |
| AR-11-03 | T-11-09 | Preview exposes nothing beyond the public production build. | Phase 11 plan 11-04 threat model (plan-time disposition) | 2026-11-16 |

*Accepted risks do not resurface in future audit runs.*

---

## Advisory Notes (non-blocking, not in register)

- **Redirect guard hardening (info):** the T-11-07 guard regex `^/(?!/)` rejects `//host` but not `/\host`, which browsers normalise to `//host`. No current rule uses a backslash; tightening the regex to `^/(?![/\\])` would close the gap for future edits.
- **Member pages are unlisted, not private (info, ADR-005):** `/about/team/<slug>` pages are excluded from the sitemap but stay reachable via the About team grid and the `/team/<slug>` 301s, by design. Staff data on them is published with consent; no `noindex` is required by the register.
- **Release-gate deviation (info):** Phase 11 shipped to production before Phase 12's single-merge gate (D-02) by user decision. Future phase threat models that assume "unreleased work stays on a branch" should be re-checked against the now-live state.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-16 | 10 | 10 | 0 | gsd-secure-phase (orchestrator, ASVS L1 short-circuit; guard tests 54/54 passing) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-16
