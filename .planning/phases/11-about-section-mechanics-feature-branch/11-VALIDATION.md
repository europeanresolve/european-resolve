---
phase: "11"
slug: "about-section-mechanics-feature-branch"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-16"
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.5 + @testing-library/react 16 + jest-dom (jsdom) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/__tests__/<file>` |
| **Full suite command** | `npm run lint && npm run typecheck && npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command for the touched test file(s)
- **After every plan wave:** Run `npm run lint && npm run typecheck && npm test`
- **Before `/gsd-verify-work`:** Full suite + `npm run build` must be green, then the preview curl matrix and manual checks
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | ABOUT-01, ABOUT-02, NAV-01, SEO-01, QA-01 | T-11-SC | `npm ci` from lockfile only | unit (render) | `npm test -- src/__tests__/about.test.tsx src/__tests__/components.test.tsx` | ❌ W0 (created by this task) | ⬜ pending |
| 11-01-02 | 01 | 1 | ABOUT-05, QA-01 | — | N/A | unit (render + src scan) | `npm test -- src/__tests__/legacy-links.test.ts src/__tests__/about.test.tsx src/__tests__/components.test.tsx src/__tests__/members.test.ts` | ❌ W0 (legacy-links.test.ts created by this task) | ⬜ pending |
| 11-01-03 | 01 | 1 | NAV-02, LINK-03, QA-01 | T-11-01 | hop matches only two exact hashes; never copies the hash into the target | unit (render + pure fn) | `npm test -- src/__tests__/about.test.tsx src/__tests__/legacy-links.test.ts` | ✅ (from 11-01-01/02) | ⬜ pending |
| 11-02-01 | 02 | 1 | ABOUT-06, SEO-01, QA-01 | T-11-04 | absolute production canonical per profile | unit (async page render) | `npm test -- src/__tests__/profile.test.tsx src/__tests__/components.test.tsx src/__tests__/members.test.ts` | ❌ W0 (created by this task) | ⬜ pending |
| 11-02-02 | 02 | 1 | SEO-02 | T-11-03 | no member page in sitemap | unit | `npm test -- src/__tests__/profile.test.tsx` | ✅ (from 11-02-01) | ⬜ pending |
| 11-03-01 | 03 | 1 | LINK-01, LINK-02 | T-11-06 | explicit 301 on every rule | unit (file parse) | `npm test -- src/__tests__/redirects.test.ts` | ❌ W0 (created by this task) | ⬜ pending |
| 11-03-02 | 03 | 1 | LINK-04, QA-01 | T-11-06, T-11-07 | no splat, no loop, same-origin destinations, unique sources (mutation-proven) | unit (file parse) | `npm test -- src/__tests__/redirects.test.ts src/__tests__/members.test.ts` | ✅ (from 11-03-01) | ⬜ pending |
| 11-04-01 | 04 | 2 | all (local gate) | T-11-SC | CI-equivalent gate before any push | lint + typecheck + test + build + out/ checks | `npm run lint && npm run typecheck && npm test && rm -rf out && npm run build` | n/a | ⬜ pending |
| 11-04-02 | 04 | 2 | — (human push) | T-11-08 | push to a non-main branch only (ADR-002) | manual checkpoint | n/a | n/a | ⬜ pending |
| 11-04-03 | 04 | 2 | LINK-01..04, ABOUT-02, ABOUT-06, NAV-01 | T-11-08 | production and `main` untouched | preview curl matrix + git check + human-checks | see 11-04-PLAN.md Task 3 | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are final (`{phase}-{plan}-{task}`). `npm test -- <files>` is used instead of `npx vitest run` so a missing install fails instead of fetching a package.*

---

## Wave 0 Requirements

- [ ] `npm ci` when `node_modules/.bin/vitest` is missing: Step 0 of the first task in every plan (each worktree starts without `node_modules`)
- [ ] `src/__tests__/about.test.tsx` (11-01-01): ABOUT-01/02/05, NAV-02, SEO-01, em dash, teaser/Mission drift guard
- [ ] `src/__tests__/legacy-links.test.ts` (11-01-02, 11-01-03): internal-link scan (QA-01), `legacyHashTarget` (LINK-03)
- [ ] `src/__tests__/profile.test.tsx` (11-02-01, 11-02-02): ABOUT-06, SEO-01/02, em dash
- [ ] `src/__tests__/redirects.test.ts` (11-03-01, 11-03-02): LINK-01, LINK-02, LINK-04, QA-01

No framework install needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `_redirects` 301s live | LINK-01, LINK-02 | `next dev` ignores `_redirects`; only Cloudflare applies them | Preview curl matrix in `11-04-PLAN.md` Task 3 (supersedes the `11-RESEARCH.md` sketch; handles `103 Early Hints` status lines): `/team/<slug>` 301 → `/about/team/<slug>` (7 members), `/team` + `/team/` 301 → `/about#team`, `/r4u/test` still 301, hops=1 |
| Photos load without redirect | LINK-04 | Cloudflare follows redirects even when an asset exists | `curl -sI $P/team/<slug>.png` returns 200, no `Location` |
| `/#team` hop, Back not trapped | LINK-03 | Browser history behaviour | Private window: open `/#team` → lands `/about#team`; Back does not return to `/#team`. Same for `/#about` → `/about#mission` |
| Headings clear fixed nav | ABOUT-02 | Visual | Open `/about#mission`, `#history`, `#team`; heading fully visible below nav |
| Nav fits at 320px | NAV-01 (UI-SPEC backstop) | Visual | Nav row does not wrap; else apply UI-SPEC backstop CSS |
| Profile card not lower than today | ABOUT-06 (UI-SPEC backstop, D-15) | Visual | Photo top ≤ 112px from viewport top at desktop and 375px |
| Trailing slash / printed card URL | LINK-01 | Undocumented Cloudflare behaviour | Observe `/team/<slug>/` and the exact business-card URL; add rules if 404 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
