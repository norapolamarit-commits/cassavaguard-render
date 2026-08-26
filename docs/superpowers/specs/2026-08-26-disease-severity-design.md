# Disease Severity — Design

Date: 2026-08-26
Scope: `backend/services/ai_engine.py` (severity computation), `backend/api/predict.py`
response shape (add `severity` field), `frontend/src/pages/predict.jsx` (render the
already-reserved slot). No new dataset, no new model, no training.

## Problem

Master spec §24 asks for a Disease Severity field but explicitly forbids computing
it from classifier confidence, and prefers "Segmentation / Lesion-area estimation /
Validated ordinal classes." The predict-flow redesign (2026-08-20) already reserved
a UI slot for `r.severity` that intentionally renders nothing today because the field
doesn't exist yet.

## Constraint discovered during design

No dataset used by this project (TFDS Cassava, CCMT, Mendeley India) carries a
severity label. Any formula built today is necessarily an **unvalidated heuristic**,
not a trained/calibrated estimate — it must be labeled as such everywhere it appears,
the same way White Leaf Spot is already labeled "heuristic (no dataset yet)" in this
codebase's existing `model_basis` convention.

## What already exists to build on

`backend/services/feature_extraction.py::extract_features()` computes real,
deterministic per-pixel fractions on every prediction already — `necrosis_frac`,
`brown_frac`, `bright_spot_frac`, `mottle`, `streak`, `yellow_frac`, `edge_density`.
`backend/services/ai_engine.py::_symptoms()` already turns these into a 0–1 `score`
per symptom via `SYMPTOM_RULES` (threshold, then `score = min(1.0, v / (thr * 2.5))`).
This is the "lesion-area-like" real-pixel signal the spec asks for — computing
severity from it (not from softmax confidence) satisfies §24 directly.

## Design

### Class → relevant symptom keys

```python
SEVERITY_FEATURE_KEYS = {
    "cbb":  ["bright_spot_frac", "necrosis_frac"],
    "cbsd": ["brown_frac", "streak"],
    "cmd":  ["mottle", "yellow_frac"],
    "cgm":  ["mottle"],
}
```

**Known limitation, stated explicitly in code comments and API response**: CGM
(Cassava Green Mottle) and CMD (Cassava Mosaic Disease) both present as mottling
to these classical-CV features, so both currently key off `mottle`. The severity
*level* for a CGM prediction is not independently validated against CGM ground
truth — it reuses the same signal as CMD. This is a known, disclosed approximation,
not a silent bug.

### Computation

```python
def _severity(top_key: str, feats: dict) -> dict | None:
    if top_key == "healthy":
        return None
    keys = SEVERITY_FEATURE_KEYS.get(top_key, [])
    if not keys:
        return None
    # reuse the same normalization _symptoms() already uses per key
    scores = [min(1.0, feats[k] / (thr(k) * 2.5)) for k in keys]  # thr() from SYMPTOM_RULES
    score = max(scores) if scores else 0.0
    level = "severe" if score >= 0.67 else "moderate" if score >= 0.34 else "mild"
    return {
        "level": level,
        "score": round(score, 2),
        "based_on": keys,
        "heuristic": True,
        "note_en": "Estimated from image color/texture signal, not a validated measurement.",
        "note_th": "ประเมินจากลักษณะสี/พื้นผิวในภาพ ไม่ใช่การวัดที่ผ่านการตรวจสอบยืนยัน",
    }
```

Called once in the same place `_symptoms(feats)` already is (`ai_engine.py` around
line 852), using the same `feats` dict — zero extra image processing, zero extra
inference. Added to the response dict as `"severity": severity` (may be `None`).

### API response contract

`POST /api/predict/image` response gains one optional key:

```json
"severity": {
  "level": "moderate",
  "score": 0.52,
  "based_on": ["brown_frac", "streak"],
  "heuristic": true,
  "note_en": "...", "note_th": "..."
}
```

`null` when `top_key == "healthy"` or the predicted class has no mapped keys. The
CSV/sensor prediction path (`predictCsv`) does not get this field — it has no image
pixels to compute it from; `CsvResult` stays unchanged.

### Frontend (predict.jsx)

Fills the slot already commented as `{/* Severity: no r.severity field exists yet
-- no fake value rendered */}` in the primary result card. Renders only when
`r.severity` is present:

```jsx
{r.severity && (
  <div className="mt-3 flex items-center gap-2">
    <Badge tone={r.severity.level === 'severe' ? 'high' : r.severity.level === 'moderate' ? 'medium' : 'low'}>
      {lang === 'th' ? {mild:'อาการเล็กน้อย', moderate:'อาการปานกลาง', severe:'อาการรุนแรง'}[r.severity.level]
                     : {mild:'Mild', moderate:'Moderate', severe:'Severe'}[r.severity.level]}
    </Badge>
    <span className="txt-dim text-[11px]">{lang === 'th' ? r.severity.note_th : r.severity.note_en}</span>
  </div>
)}
```

Placed directly under the disease-name badge, above the confidence ring, so it
reads as "CBB · Moderate severity" at a glance — matching how a user would actually
scan the result. The `heuristic: true` disclosure note is always shown inline (not
hidden in Advanced Details) since this is exactly the kind of "don't overstate AI
confidence" information the spec prioritizes on the primary screen.

### Out of scope

- No change to `requires_review` logic — severity does not affect the review gate.
- No change to Health Score (separate design, not started).
- No backfilling severity onto historical predictions in `history.jsx` — only new
  predictions after this change carry the field. Existing history rows simply have
  no `severity` key, which the same `{r.severity && ...}` guard already handles
  safely.

## Testing

- Unit-level: call `_severity()` directly with synthetic `feats` dicts covering
  each class and each level boundary (mild/moderate/severe) plus `top_key="healthy"`
  returning `None`.
- `tests/test_frontend_i18n.py` must still pass — verify Thai/English severity
  labels are present in both language branches (no missing-translation build break).
- Manual: run a real prediction through the browser preview, confirm the severity
  badge renders with the heuristic note visible, confirm it's absent for a healthy
  prediction.
