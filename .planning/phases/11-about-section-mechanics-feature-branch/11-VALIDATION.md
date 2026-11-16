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
| 11-A | A | 1 | ABOUT-01, ABOUT-02, ABOUT-05, NAV-01, NAV-02, SEO-01 | — | N/A | unit (render) | `npx vitest run src/__tests__/about.test.tsx src/__tests__/components.test.tsx` | ❌ W0 | ⬜ pending |
| 11-B | B | 1 | ABOUT-06, SEO-01, SEO-02 | — | N/A | unit (render) | `npx vitest run src/__tests__/profile.test.tsx` | ❌ W0 | ⬜ pending |
| 11-C | C | 2 | LINK-01, LINK-02, LINK-03, LINK-04, QA-01 | open-redirect (hash hop) | hop matches only two exact hashes; never copies the hash into the target | unit (file parse + pure fn) | `npx vitest run src/__tests__/legacy-links.test.ts src/__tests__/members.test.ts` | ❌ W0 | ⬜ pending |
| 11-D | D | 3 | LINK-01..04, ABOUT-02 | — | N/A | manual (preview curl + browser) | see Manual-Only Verifications | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are provisional (from RESEARCH.md plan split); the planner assigns final IDs.*

---

## Wave 0 Requirements

- [ ] `npm ci` in this worktree (no `node_modules`)
- [ ] `src/__tests__/about.test.tsx`: ABOUT-01/02/05, NAV-02, SEO-01, em dash, teaser/Mission drift guard
- [ ] `src/__tests__/profile.test.tsx`: ABOUT-06, SEO-01/02, em dash
- [ ] `src/__tests__/legacy-links.test.ts`: LINK-01..04, QA-01

No framework install needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `_redirects` 301s live | LINK-01, LINK-02 | `next dev` ignores `_redirects`; only Cloudflare applies them | Preview curl matrix in `11-RESEARCH.md` §Validation Architecture: `/team/<slug>` 301 → `/about/team/<slug>` (7 members), `/team` + `/team/` 301 → `/about#team`, `/r4u/test` still 301, hops=1 |
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
