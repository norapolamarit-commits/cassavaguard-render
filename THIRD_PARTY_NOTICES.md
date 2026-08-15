# Third-party notices

CassavaGuard depends on software, datasets and model tooling with independent
licence terms. This file is an inventory for review, not legal advice and not a
substitute for the complete upstream licence text.

## Datasets and image sources

| Source | Use in this project | Terms recorded by the project |
|---|---|---|
| [TensorFlow Datasets — Cassava](https://www.tensorflow.org/datasets/catalog/cassava) | Primary five-class classifier | Upstream image licence is not declared in the TFDS catalog; verify before redistribution/commercial use |
| [Mendeley India Cassava Dataset](https://doi.org/10.17632/3832tx2cb2.1) | Train-only candidate experiment | CC BY 4.0 |
| [CCMT](https://doi.org/10.17632/bwh3zbpkpv.1) | Brown Leaf Spot auxiliary model | CC BY 4.0 |
| [Cassava Whitefly Dataset v3](https://doi.org/10.17632/5g38399z9p.3) | Whitefly detector | CC BY 4.0 |
| [Embrapa PDDB](https://doi.org/10.48432/XA1OVL) | White Leaf Spot experiment and CAD seed | CC BY-NC 4.0; commercial use is not allowed by that licence |
| CIAT photographs via Wikimedia Commons | Mealybug research seed | CC BY-SA 2.0 according to the recorded source metadata |

Raw datasets are intentionally not redistributed in this repository. Attribution,
licence compatibility, consent and source-specific restrictions must be checked
again before a new dataset or derived model is published.

## Model and training tooling

- The Whitefly training pipeline records Ultralytics `8.4.113` and AGPL-3.0
  training-code terms. Proprietary distribution may require a commercial
  Ultralytics licence or full AGPL compliance.
- PyTorch, Torchvision, ONNX Runtime, scikit-learn, FastAPI, React and other
  dependencies retain their own upstream licences. Exact versions are recorded
  in the requirements and package lock files.
- ImageNet-initialized weights and exported artifacts may carry obligations in
  addition to this repository's source notice.

## Release rule

Before commercial use or redistribution, produce a dependency and dataset bill
of materials for the exact release, retain required attribution, and obtain legal
review for unresolved or non-commercial terms. The repository-level `LICENSE`
does not grant rights to third-party materials.
