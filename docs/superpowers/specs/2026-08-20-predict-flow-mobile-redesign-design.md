# Predict Flow Mobile-First Redesign — Design

Date: 2026-08-20
Scope: `frontend/src/pages/predict.jsx` only (upload step + result step). No
changes to backend APIs, no changes to other pages/nav, no changes to model
behavior.

## Problem

The current predict page front-loads three decisions before a user can even
analyze a photo (source type, field, then upload/camera), and the result view
renders every technical artifact at once: attribution map, top-3 confidence,
three auxiliary-model findings, symptoms, feature importance, and a 5-class
probability bar chart — all in one unbroken scroll. This matches the master
spec's complaint about "technical clutter on the main user screen" (spec §28)
and the goal of a minimal-step workflow: Open App → Take/Upload Photo →
Analyze → Result (spec, workflow diagram).

## Constraint discovered during design

`/api/predict/image` (`backend/api/predict.py`, `backend/services/ai_engine.py`)
does not return an actionable "recommendation" — `explanation_en/th` is a
methodology explanation ("classified as X with Y% confidence using Z
method"), not agronomic advice. Real recommendations only exist via
`reco_engine.build()`, reached through `GET /api/fields/{id}` (backend/api/fields.py),
which combines soil + weather + satellite + the field's latest AI prediction.
Since the field selector is being moved into Advanced Options (and will
usually be empty), the result card must not show a "Recommendation" line
backed by nothing. This project's core principle throughout the spec is "no
fake results" — the design below follows that.

Similarly, Disease Severity and Health Score (spec §24-25) do not exist in
the backend at all yet (tracked as P2 in `docs/superpowers/specs/2026-08-20-week1-repo-audit.md`).
Their UI slots must not render fake/placeholder values.

## Design

### 1. Upload step

Two large primary actions, no decisions required first:

- **Take Photo** (opens existing `CameraModal`, unchanged)
- **Upload Photo** (existing file input, unchanged)

Defaults applied silently: `source = 'leaf'`, `field_id = null`. These match
the current component's existing default state values, so no backend change
is needed.

An **"Advanced options"** disclosure (closed by default, `<details>`-style
toggle consistent with the app's existing `glass`/`hair` styling) reveals,
only when opened:
- the existing `Segmented` source-type control (leaf/plant/canopy/CSV)
- the existing field `<select>`

These two controls and their state/handlers are not deleted, only moved
inside the disclosure and collapsed by default. CSV flow is unaffected —
selecting "CSV" in Advanced still switches `source` to `'csv'` and swaps the
dropzone accept type, exactly as today.

### 2. Result step — primary card (always visible)

Shown without scrolling on a typical phone viewport:

1. **Disease name** (top-1 class, from `r.top3[0]`)
2. **Confidence** (existing `ProgressRing`, reused as-is)
3. **Review warning**, only if `r.requires_review` — reuses the existing
   amber banner copy/logic, just promoted to the primary card
4. **Severity** — UI slot exists in the component but is not rendered at
   all (no conditional branch fires) because `r.severity` does not exist in
   the API response yet. When the backend adds it, the branch is added, not
   redesigned.
5. **Health Score** — same treatment: no slot renders until `r.health_score`
   (or equivalent) exists.
6. **Recommendation**
   - If a field was selected in Advanced Options: fetch
     `GET /api/fields/{field_id}` after the prediction completes and render
     its `recommendations` (existing shape from `reco_engine.build`,
     currently only consumed by `fields.jsx`/dashboard-adjacent views —
     verify exact shape before wiring, see plan) in place of "Recommendation"
   - If no field: a single line — "Attach a field for tailored
     recommendations" (TH/EN) — linking to open Advanced Options and pick a
     field. Not a recommendation; explicitly a call-to-action so the empty
     state can't be mistaken for advice.
7. **Retake** button — clears `file`/`preview`/`result`, scrolls back to the
   upload step (mobile) — reuses existing `pick`/state-reset logic.

### 3. Advanced Details (collapsed by default, tap to expand)

Everything else currently in `ImageResult` moves here unchanged:
- Attribution map + view-mode toggles (original/heatmap/whitefly boxes)
- Auxiliary findings cards (Brown Leaf Spot / White Leaf Spot / Whitefly)
- Symptoms list
- Feature importance bars
- Full probability distribution (`ProbBars`)

No logic in these sections changes — only their position (inside a collapsed
`<details>`/disclosure component instead of always-rendered).

### 4. Out of scope (explicitly not touched this pass)

- `CsvResult` — CSV analysis result view is unchanged (small, already
  focused; not part of the "too cluttered" complaint)
- Any other page (`dashboard`, `map`, `weather`, `soil`, `satellite`,
  `history`, `system`, `guide`, `legal`, `auth`) or the nav/sidebar
- Backend APIs — no new endpoints, no response shape changes
- Severity/Health Score computation — tracked separately as P2 backend work

## Testing

- `tests/test_frontend_i18n.py` and any existing predict-page tests must
  still pass — verify no translation keys are removed, only relocated
- Manual verification in the browser preview: upload → result appears with
  only the 5 primary items visible without scrolling on a mobile viewport
  (375×812), Advanced Details expands/collapses correctly, camera flow
  still works, CSV flow still reachable via Advanced Options
- Confirm the "no field" CTA never renders alongside a real recommendation
  and vice versa
