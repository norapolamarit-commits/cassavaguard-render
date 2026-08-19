# CassavaGuard — Week 1-2 Repository Audit

Date: 2026-08-20
Scope: initial audit against the 12-week CassavaGuard master development
prompt, plus a first pass at `data/dataset_registry.csv` and
`config/class_mapping.yaml`.

## 1. Working-copy correction (before the audit)

Two local copies existed and neither matched the real GitHub state:

- `~/Documents/cassavaguard` had no `.git` at all and was missing months of
  work (quality gate, whitefly benchmarks, promote scripts, docs, frontend,
  CI). Preserved untouched at
  `~/Documents/cassavaguard.local-snapshot-2026-08-20/`.
- `~/Downloads/cassavaguard-github-render` was a single squashed commit
  (`8e1d8f4`), behind `origin/main` (`f2fb3bba`, 10 merged PRs).

`~/Documents/cassavaguard` is now a clean clone of
`norapolamarit-commits/cassavaguard-render` at `origin/main`. All further
work (this audit, the registry, future sessions) should happen here.

## 2. What already exists (do not rebuild)

The repo is **materially ahead** of what the master prompt assumes a
"continuing" project would have:

- **Primary classifier**: EfficientNet-B2 + TTA, 5 classes (healthy, cbb,
  cbsd, cmd, cgm) — exactly the spec's target taxonomy. Production metrics:
  Test accuracy **88.20%**, macro-F1 **83.63%** (Wilson 95% CI 86.66–89.58%).
  Per-class F1: healthy 82.51, cbb 72.73, cbsd 87.69, cmd 93.56, cgm 81.68.
  Weakest class is CBB (recall 67.53%).
- **Ablation already run**: baseline (TFDS only) vs. baseline + Mendeley
  India real data. The +data candidate scored *lower* (85.80%/79.78%) and
  was correctly **not promoted** — this is precisely the pseudo-label/extra-
  data acceptance rule the spec asks for (§23), already implemented as
  practice for real-data augmentation.
- **Leakage controls**: SHA-256 exact-duplicate detection + dHash/pHash
  near-duplicate detection, conflicting-label quarantine, official TFDS
  train/val/test splits preserved, test never touched for selection
  (`quality_gate.py` asserts this programmatically).
- **Model contracts**: every artifact in `backend/ml_models/` ships a
  `*_metrics.json` with source, license, split policy, duplicate audit, SHA-
  256, and quality-target booleans. `verify_artifacts.py` and
  `quality_gate.py` enforce this in CI on every push.
- **Auxiliary heads**: Brown Leaf Spot (trained, CCMT-sourced, 92.78%
  acc/88.70% macro-F1), White Leaf Spot (experimental, Embrapa CC BY-NC,
  license-gated), Whitefly detector (validation-only, mAP50 75.57%, just
  under the 75% P/R/F1 gate, sealed test not yet opened).
- **Uncertainty / review-only serving**: `AI_SERVING_MODE=review_only` is
  already the production mode; low-confidence results are flagged for
  review rather than forced into a diagnosis — this is spec §30 already in
  production.
- **Model readiness API**: `/api/models/readiness` reports per-class status
  honestly (13 nominal classes, only some production-eligible) rather than
  faking scores for unready classes — this is spec §12/§13's "report
  insufficiency, don't fake it" principle, already implemented.
- **74 automated tests** covering API/SPA, security headers, rate limiting,
  ONNX loading, artifact hash/contract self-test, leakage controls, whitefly
  runtime, and the Render deploy bundle, run in CI on every push/PR.
- **Deployment**: live on Render (`cassavaguard-render.onrender.com`),
  health-checked, `render.yaml` blueprint, `deploy/render/` scripts.

## 3. Real gaps against the master prompt (P0/P1 first)

| Gap | Spec ref | Priority |
|---|---|---|
| No `data/dataset_registry.csv` in the repo | §5 | P0 — now added, see §4 below |
| No `config/class_mapping.yaml` | §8 | P0 — now added, see §4 below |
| No Thai field dataset/test at all (`data/thai_field/` doesn't exist) | §26-27 | **P0** — biggest real gap. README explicitly states this is the reason 95% cannot yet be claimed. |
| Primary model's CBB recall (67.53%) is a known weak point | §22 | P1 — worth its own ablation experiment before more Thai data collection |
| No `data/pseudo_labels/{pending,approved,corrected,rejected}.csv` review workflow — CCMT/Mendeley additions were manual, one-shot ablations, not a running pseudo-label pipeline | §14-18 | P1 — only build if a class is later found insufficient after further dataset search |
| Only 2 additional public datasets searched/integrated (Mendeley India, CCMT) beyond TFDS; no CGM-specific or CBSD-specific dataset search has been logged | §4 | P1 |
| No disease severity module (ordinal/segmentation) | §24 | P2 |
| No Health Score | §25 | P2 |
| No explicit "Advanced Details" collapse on the mobile result screen (unverified — needs a UX pass) | §28 | P1/P2 |
| Legacy large `.joblib` classical/fusion models (up to 58 MB) committed directly to git, flagged in the repo's own `ARTIFACT_POLICY.md` as needing a future size migration | n/a (repo hygiene) | P2 |

## 4. What was added this session

- `data/dataset_registry.csv` — 6 rows, populated only from data already
  documented in `README.md`, `THIRD_PARTY_NOTICES.md`, and the
  `backend/ml_models/*_metrics.json` contracts (TFDS Cassava, Mendeley
  India, CCMT, Embrapa PDDB White Leaf Spot, Cassava Whitefly Dataset v3,
  CIAT Mealybug photos). No image counts, licenses, or DOIs were invented —
  every field traces to an existing file in the repo. `quality_status`
  values follow the spec's four-state vocabulary (`approved` /
  `review_required` / `experimental` / `rejected`); only TFDS Cassava,
  Mendeley India, and CCMT are `approved` for the main pipeline.
- `config/class_mapping.yaml` — canonical primary taxonomy
  (healthy/cbb/cbsd/cmd/cgm) plus the auxiliary taxonomy
  (brown_leaf_spot/white_leaf_spot/whitefly), and an explicit
  `excluded_or_unmapped` section. This matters because CCMT's `green_mite`
  label (a *pest*, Mononychellus tanajoa) is easy to confuse with `cgm`
  (Cassava Green Mottle, a *virus*) by naive string matching — the mapping
  documents why these must never be merged, and why CCMT's
  `bacterial_blight`/`mosaic` labels aren't folded into the TFDS-based
  `cbb`/`cmd` training set without a dedicated cross-source validation
  experiment first.

## 5. Recommended next session

Given the priority order in the spec (P0 > P1 > P2 > P3) and that the model
pipeline is already solid, the highest-leverage next step is **not** more
model experiments — it's starting Thai field data collection
(`data/thai_field/`) since that's the one true blocker to claiming the
95% target and the thing no amount of internet-dataset work can substitute
for. Second priority: a focused CBB-recall investigation (targeted dataset
search + possibly a CBB-specific pseudo-label pass) since it's the weakest
class in an otherwise strong model.
