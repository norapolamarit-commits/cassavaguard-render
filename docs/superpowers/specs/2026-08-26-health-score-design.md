# Health Score — Design

Date: 2026-08-26
Scope: `backend/services/ai_engine.py` (score computation), `backend/api/predict.py`
response shape (add `health_score` field), `frontend/src/pages/predict.jsx` (render
the already-reserved slot). No new dataset, no new model, no training.

## Problem

Master spec §25 asks for a Health Score using "interpretable components such as:
disease presence, disease severity, visible damage, image quality / uncertainty,"
and explicitly warns: "Do NOT present Health Score as a biological laboratory
measurement." The predict-flow redesign already reserved a UI slot for
`r.health_score` that intentionally renders nothing today.

## What already exists to build on

Every component the spec asks for is already computed on every prediction:

- **Disease presence + uncertainty**: `top_conf` (the predicted class's softmax
  confidence) — already in the response as `confidence`.
- **Disease severity**: `r.severity.score` (0–1), just implemented (see
  `2026-08-26-disease-severity-design.md`), itself built from real pixel
  fractions, not confidence.
- **Image quality**: `quality.passed` (bool) from `_quality_review()`, already
  computed and returned as `r.quality`.

No new signal needs to be invented — Health Score is a documented combination of
values already shown elsewhere in the response, which is exactly what keeps it
honest rather than a fabricated new measurement.

## Design

### Formula

```python
def _health_score(top_key: str, top_conf: float, severity: dict | None, quality: dict) -> dict | None:
    if not quality["passed"]:
        return None  # image quality itself is unreliable -- don't compute a score from it
    disease_penalty = 0.0 if top_key == "healthy" else top_conf * 60.0
    severity_penalty = severity["score"] * 40.0 if severity else 0.0
    score = round(max(0.0, 100.0 - disease_penalty - severity_penalty))
    return {
        "score": score,
        "components": {
            "disease_penalty": round(disease_penalty, 1),
            "severity_penalty": round(severity_penalty, 1),
        },
        "heuristic": True,
        "note_en": "A combined indicator from this image only, not a laboratory measurement.",
        "note_th": "ตัวชี้วัดรวมจากภาพนี้เท่านั้น ไม่ใช่ผลการตรวจทางห้องปฏิบัติการ",
    }
```

Bounds check: worst case is a confident disease call (`top_conf=1.0` →
60-point penalty) combined with `severity.score=1.0` (severe, 40-point
penalty) = 100 − 60 − 40 = 0. Best case is a confident healthy call = 100.
An uncertain disease call (low `top_conf`) is penalized less than a confident
one, which is how "uncertainty" folds into the same number without a separate
term — a result the model itself isn't sure about shouldn't tank the score as
hard as one it's confident about.

**`null` whenever the image quality gate fails** (per the confirmed decision):
a health score computed from a blurry/too-dark/too-small image would just be
noise dressed up as a number, so it's hidden entirely rather than shown with
a caveat — consistent with how severity is `null` for a healthy prediction
rather than shown as zero.

Called once, in the same place `_severity()` now is, using values already in
scope (`top_key`, `top_conf`, `severity`, `quality`) — zero extra image
processing, zero extra inference.

### API response contract

`POST /api/predict/image` response gains one optional key:

```json
"health_score": {
  "score": 62,
  "components": {"disease_penalty": 33.6, "severity_penalty": 20.8},
  "heuristic": true,
  "note_en": "...", "note_th": "..."
}
```

`null` when the image quality gate failed. The CSV/sensor prediction path
(`predictCsv`) does not get this field — same reasoning as severity, no image
pixels or per-image quality gate to compute it from.

### Frontend (predict.jsx)

Fills the slot currently commented `{/* Health score: no r.health_score field
exists yet -- no fake value rendered */}`, placed directly below the severity
badge (so the primary card reads: disease name → severity badge → health
score → confidence ring → recommendation, top to bottom):

```jsx
{r.health_score && (
  <div className="mt-2 flex items-center gap-2">
    <div className="text-2xl font-bold txt tabular-nums">{r.health_score.score}<span className="text-xs txt-dim font-normal">/100</span></div>
    <span className="txt-dim text-[11px]">{lang === 'th' ? r.health_score.note_th : r.health_score.note_en}</span>
  </div>
)}
```

No color-coded badge (a "sick/healthy" traffic-light color on a number that's
explicitly a heuristic risks reading as more authoritative than intended) —
just the number, `/100`, and the same inline disclosure note pattern already
used for severity.

### Out of scope

- No historical backfill, no DB persistence (same reasoning as severity — this
  is a live-response-only field for now).
- No change to `requires_review` or the quality gate itself.
- No separate "visible damage" term distinct from severity — per the existing
  `_symptoms()`/`_severity()` machinery, "visible damage" and "disease
  severity" are the same real-pixel signal in this codebase; introducing a
  second, different-but-similar term would be redundant rather than more
  interpretable.

## Testing

- Unit-level: call `_health_score()` directly for the boundary cases: healthy
  (confident) → 100; confident severe disease → 0; low-confidence disease with
  no severity data → small penalty; `quality.passed=False` → `None`.
- Manual: run a real prediction through the browser preview, confirm the score
  renders under severity, confirm `null` (no card) when quality fails.
