"""Build a reproducible non-image yield prior from the CC BY 4.0 dataset.

Source DOI: 10.17632/gh2nfyyknj.1. The resulting JSON contains only aggregate
statistics and provenance, not the third-party workbook itself.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from openpyxl import load_workbook

DOI = "10.17632/gh2nfyyknj.1"
SOURCE_URL = "https://data.mendeley.com/datasets/gh2nfyyknj/1"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build(workbook_path: Path) -> dict:
    workbook = load_workbook(workbook_path, read_only=True, data_only=True)
    pre_rows = list(workbook["Pre-Harvest"].values)
    harvest_rows = list(workbook["Harvest"].values)
    pre_headers = [str(value or "").strip() for value in pre_rows[0]]
    harvest_headers = [str(value or "").strip() for value in harvest_rows[0]]
    pre_id = pre_headers.index("Cultivar Number")
    height_index = pre_headers.index("12M_Plant Height")
    harvest_id = next(index for index, name in enumerate(harvest_headers) if name.startswith("Cultivar Number"))
    weight_index = next(index for index, name in enumerate(harvest_headers) if name.startswith("12M_weight of roots"))
    pre = {str(row[pre_id]).strip(): row for row in pre_rows[1:] if row[pre_id] is not None}
    values = []
    for row in harvest_rows[1:]:
        key = str(row[harvest_id]).strip() if row[harvest_id] is not None else ""
        if key not in pre or row[weight_index] is None or pre[key][height_index] is None:
            continue
        weight = float(row[weight_index]); height = float(pre[key][height_index])
        if 0.02 <= weight <= 40 and 40 <= height <= 450:
            values.append((height, weight))
    if len(values) < 150:
        raise RuntimeError(f"expected at least 150 valid paired records; found {len(values)}")
    heights = np.asarray([value[0] for value in values], dtype=np.float64)
    weights = np.asarray([value[1] for value in values], dtype=np.float64)
    q = np.quantile(weights, [0.10, 0.25, 0.50, 0.75, 0.90])
    return {
        "artifact_id": "cassava_yield_reference_prior_gh2nfyyknj_v1",
        "purpose": "external agronomic prior; not paired with CassavaGuard images",
        "source": {
            "doi": DOI, "url": SOURCE_URL, "license": "CC BY 4.0",
            "workbook_sha256": sha256(workbook_path),
            "authors": "Abegunde et al.", "published_year": 2024,
            "geography": "Nigeria; demonstration-plot accessions collected from 290 source fields",
        },
        "records": {"valid_height_weight_pairs": len(values), "reported_accessions": 470},
        "fresh_root_weight_kg": {
            "p10": round(float(q[0]), 4), "p25": round(float(q[1]), 4),
            "median": round(float(q[2]), 4), "p75": round(float(q[3]), 4),
            "p90": round(float(q[4]), 4), "min": round(float(weights.min()), 4),
            "max": round(float(weights.max()), 4),
        },
        "height_weight_pearson_r": round(float(np.corrcoef(heights, weights)[0, 1]), 5),
        "limitations": [
            "No plant or leaf images are paired with these harvest records.",
            "The source geography and cultivars are not a Thai-field validation set.",
            "Height alone has weak correlation with harvested root weight.",
        ],
        "production_eligible": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workbook", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    artifact = build(args.workbook)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    print(json.dumps(artifact, indent=2))


if __name__ == "__main__":
    main()
