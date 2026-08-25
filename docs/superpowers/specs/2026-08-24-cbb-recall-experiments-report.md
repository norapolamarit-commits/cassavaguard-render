# CBB Recall Investigation — 8 Experiments, Final Report

Date: 2026-08-24/25
Scope: investigate why the primary 5-way classifier's CBB recall (67.53%
production, TTA) is its weakest class, and whether it can be improved
without Thai field data. All experiments use real data only (TFDS Cassava,
plus one CCMT trial) — no synthetic/pseudo-labeled images anywhere in this
investigation.

## Method

Controlled ablation, one variable changed at a time, always compared
against the same production baseline (EfficientNet-B2, TFDS-only,
88.20% test accuracy / 83.63% macro-F1 with TTA). Checkpoint/threshold
selection always used validation only; test was evaluated once per
candidate, never used to pick a candidate to retry.

## Results — ranked by test macro-F1 (no TTA, except where noted)

| # | Candidate | Variable changed | Test Acc | Test Macro-F1 | CBB Recall | Verdict |
|---|---|---|---|---|---|---|
| 0 | **Production baseline** | — | 86.60% (88.20% TTA) | 80.82% (83.63% TTA) | 67.53% | reference |
| 1 | `--pipeline saliency_crop` **+ TTA** | preprocessing | 86.28% | 82.37% | **69.48%** | **best candidate**, still below production overall |
| 2 | `--pipeline saliency_crop` (no TTA) | preprocessing | 85.53% | 81.24% | 68.18% | best of the 4 pipelines, ~ties baseline (CI overlap) |
| 3 | `--pipeline leaf_crop` | preprocessing | 82.97% | 76.66% | 67.53% | confirmed near-no-op (TFDS images already tightly framed) |
| 4 | `--pipeline color_constancy` | preprocessing | 81.58% | 75.28% | 68.18% | worse overall |
| 5 | `--architecture efficientnet_b3` | architecture (bigger) | 84.36% | 78.76% | 64.29% | worse — more capacity did not help at this dataset size |
| 6 | `--architecture mobilenet_v3_large` | architecture (different family, smaller) | 80.94% | 73.85% | 66.88% | worse overall, CBB unchanged |
| 7 | CCMT bacterial_blight → cbb supplement | data source | 84.52% | 77.37% | **54.55%** | worst — cross-domain data actively hurt, including CBB itself |
| 8 | `--pipeline tiled_crop` | preprocessing | 76.35% | 68.25% | 44.16% | worst overall — random quadrant crop frequently excludes the lesion |

## What worked, what didn't, and why

**Cross-domain data (CCMT) hurt every metric, including CBB itself.**
Ghana/Ivory Coast photos are a different enough domain from TFDS's Uganda
photos that adding 693 real, correctly-labeled CBB images made CBB recall
*worse* (67.53% → 54.55%), not better. Same failure mode as the earlier
Mendeley India ablation. Real-but-wrong-domain data is not free.

**Bigger/different architecture did not help.** EfficientNet-B3 (more
capacity) and MobileNetV3-Large (different family) both underperformed the
production EfficientNet-B2 on every metric. The bottleneck is not model
capacity or architecture family — B2 remains the best of three
architectures tried.

**Naive spatial pipelines can actively destroy the signal.**
`tiled_crop`'s random-quadrant training produced the single worst CBB
result of all 8 experiments (44.16% recall, worse than doing nothing) —
consistent with CBB being a localized lesion that a naive quadrant crop
frequently excludes entirely, teaching the model to associate "blank
healthy-looking leaf" with the CBB label.

**A cheap, real-data-only saliency proxy is the one technique that helped
CBB recall, but not enough to promote.** `saliency_crop` (see
`backend/training/train_cnn_torch.py`'s `SaliencyGuidedCrop` class) finds
the sub-window with the most local color anomaly using a classical
integral-image technique — no trained segmentation/attribution model
involved, deterministic, real pixels only. With TTA it reached CBB recall
69.48% (above production's 67.53%) but at a real precision cost (CBB F1
65.44% vs production's 72.73%), and overall accuracy/macro-F1 stayed below
production. Per this project's promotion rule (must beat baseline on both
the overall metric and the specific metric being targeted), **this is not
promoted**.

## Conclusion

None of the 8 real-data-only experiments beat the production model. This
is a genuine, reproducible finding, not a failure to search hard enough:
data-source change, architecture change (both directions), and 4 different
preprocessing pipelines were all tried and controlled against the same
baseline. `saliency_crop` is the most promising lead (the only technique
that improved CBB recall with real evidence) and is worth revisiting
*together with* real Thai-domain CBB images once
`data/thai_field/` (see `docs/THAI_FIELD_COLLECTION_TH.md`) has real
photos, rather than as a standalone fix. CBB's weak recall appears to be a
genuine data-scarcity problem (455 real TFDS train images vs CMD's 2,655)
that architecture/preprocessing changes cannot substitute for.

**Recommended next steps, in priority order:**
1. Thai field data collection — still the top blocker (see the Week 1-2
   audit and `docs/THAI_FIELD_COLLECTION_TH.md`); a source that plausibly
   shares TFDS's domain characteristics (or is close enough) would test
   whether more *same-domain* CBB data helps where CCMT's cross-domain
   data did not.
2. If/when more TFDS-domain-compatible CBB images are found, retry with
   `--pipeline saliency_crop` combined with the new data, since it's the
   only technique with a measured, real (if partial) improvement so far.
3. Do not pursue further architecture search (3 tried, EfficientNet-B2
   wins clearly) or `tiled_crop`-style naive spatial cropping (measured
   actively harmful) — deprioritize both per the master spec's "remove P3
   before reducing P2, never sacrifice P0" rule, since neither is a P0/P1
   path forward.

## Reproducing

```bash
backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py \
  --architecture efficientnet_b2 --image-size 260 --device mps \
  --pipeline saliency_crop \
  --output-dir tmp/candidates/efficientnet_b2_pipeline_saliency_crop

backend/training/.venv-torch/bin/python -m backend.training.evaluate_cnn_tta_pipeline \
  --data-dir ~/tensorflow_datasets/downloads/extracted/*/cassavaleafdata \
  --model tmp/candidates/efficientnet_b2_pipeline_saliency_crop/cnn_efficientnet_b2.onnx \
  --metrics tmp/candidates/efficientnet_b2_pipeline_saliency_crop/cnn_efficientnet_b2_metrics.json \
  --pipeline saliency_crop
```

All 8 candidates' full metrics JSON files remain locally under
`tmp/candidates/` (gitignored, not committed — regenerate with the commands
above and in `backend/training/prepare_ccmt_cbb_supplement.py`'s docstring).
