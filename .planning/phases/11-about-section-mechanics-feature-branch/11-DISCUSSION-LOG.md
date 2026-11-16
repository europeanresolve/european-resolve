# Phase 11: About section mechanics (feature branch) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-16
**Phase:** 11-about-section-mechanics-feature-branch
**Areas discussed:** Interim copy on /about, Homepage teaser, /about page shape, Profile page & legacy hops

---

## Interim copy on /about

| Option | Description | Selected |
|--------|-------------|----------|
| History: obvious placeholder | Marked placeholder text on the branch | |
| History: realistic draft | Claude drafts from intel | |
| History: omit until Phase 12 | No section/anchor on branch | |

**User's choice:** Free text: supplied the full History copy (Frozen Assets Action origin story).

| Option | Description | Selected |
|--------|-------------|----------|
| Marker + failing guard in Phase 12 | Interim copy behind a marker, guard flips in Phase 12 | ✓ |
| Manual review | Phase 12 checklist only | |

**Notes:** Later made moot: all copy confirmed final.

| Option | Description | Selected |
|--------|-------------|----------|
| Inline JSX in about/page.tsx | Like homepage About block and privacy page | ✓ |
| src/data/about.ts | Typed strings shared with teaser | |
| You decide | Planner picks | |

| Option | Description | Selected |
|--------|-------------|----------|
| Core-definitions statement | Mission statement only | |
| Today's homepage paragraphs | Move 3 paragraphs as-is | |
| Statement + paragraphs | Both | |

**User's choice:** Free text: asked which copy was meant, then asked for a recommendation on resolving the Mission/History overlap.

| Option | Description | Selected |
|--------|-------------|----------|
| Story vs purpose | History ends at "...European Resolve."; its last paragraph moves into Mission after the lead sentence | ✓ |
| One-line mission | Mission = lead sentence only; History unchanged | |
| Keep both, trim History | Mission keeps both core-definitions sentences; History drops the "how" sentence | |

| Option | Description | Selected |
|--------|-------------|----------|
| Mission final | No interim marker | ✓ |
| Mission interim | Behind marker | |

**Notes:** User: "once resolved, mark as final" for History; Mission also confirmed final.

| Option | Description | Selected |
|--------|-------------|----------|
| British spelling | Match site (organisation, mobilisation) | ✓ |
| Keep as written | American spelling as supplied | |

---

## Homepage teaser

| Option | Description | Selected |
|--------|-------------|----------|
| Mission first sentence | Same as /about lead | ✓ |
| Tagline | "Turning Europe's concern into action." | |
| One-liner | "Europe doesn't have an awareness problem..." | |

| Option | Description | Selected |
|--------|-------------|----------|
| Teaser replaces hero subline | One mission line on the page | ✓ |
| Keep subline, teaser below hero | Two mission-like lines | |

| Option | Description | Selected |
|--------|-------------|----------|
| More about us | Matches nav label | ✓ |
| Read our story | Points to History | |
| You decide | Planner picks | |

---

## /about page shape

| Option | Description | Selected |
|--------|-------------|----------|
| h1 "About us", then Mission | Minimal | ✓ |
| h1 + jump links | Mission · History · Team row | |
| No h1 | Sections only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Large serif lead line | Mission lead styled like hero statement | ✓ |
| Plain paragraphs | Uniform with History | |

| Option | Description | Selected |
|--------|-------------|----------|
| Move homepage .about/.team styles | Consistent with live site | ✓ |
| Fresh design via /gsd-ui-phase | UI contract first | |

---

## Profile page & legacy hops

| Option | Description | Selected |
|--------|-------------|----------|
| Above card, trim card padding | Breadcrumbs under nav, reduce 7rem padding | ✓ |
| Above card, padding unchanged | Card sits lower | |

| Option | Description | Selected |
|--------|-------------|----------|
| Absolute canonicals | BASE_URL pattern from event layouts | ✓ |
| Relative paths | No metadataBase | |

| Option | Description | Selected |
|--------|-------------|----------|
| #team and #about | /#about → /about#mission too | ✓ |
| #team only | As scoped in LINK-03 | |

---

## Claude's Discretion

- Homepage metadata description wording
- /about metadata description wording
- Teaser/Mission drift test
- Hop implementation detail (useEffect vs inline script)

## Deferred Ideas

None.
