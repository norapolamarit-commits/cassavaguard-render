"""Conservative cassava fresh-root yield scenario estimator.

This is deliberately not presented as a trained image-to-yield model: the project
does not yet contain paired plant photographs and destructive harvest weights.
The estimator provides a broad planning interval and machine-readable provenance
until enough verified field measurements exist to train and test a regressor.
"""
from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path


_PRIOR_PATH = Path(__file__).resolve().parents[1] / "ml_models" / "yield_reference_prior.json"


def _load_prior() -> dict:
    try:
        value = json.loads(_PRIOR_PATH.read_text(encoding="utf-8"))
        weights = value["fresh_root_weight_kg"]
        if not (0 < weights["p10"] < weights["median"] < weights["p90"]):
            raise ValueError("invalid prior quantiles")
        return value
    except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        # Fail safely to a deliberately broad documented prior, never to the old
        # high-yield point formula.
        return {
            "artifact_id": "embedded_conservative_fallback",
            "fresh_root_weight_kg": {"p10": 0.2, "median": 0.75, "p90": 3.0},
            "records": {"valid_height_weight_pairs": 0},
            "source": {"doi": None, "geography": "unavailable"},
        }


@dataclass(frozen=True)
class YieldInputs:
    age_months: float
    height_cm: float
    stem_count: int
    disease_class: str
    disease_confidence: float


def estimate(inputs: YieldInputs) -> dict:
    if not 3 <= inputs.age_months <= 18:
        raise ValueError("age_months must be between 3 and 18")
    if not 40 <= inputs.height_cm <= 450:
        raise ValueError("height_cm must be between 40 and 450")
    if not 1 <= inputs.stem_count <= 6:
        raise ValueError("stem_count must be between 1 and 6")
    if not 0 <= inputs.disease_confidence <= 1:
        raise ValueError("disease_confidence must be between 0 and 1")

    prior = _load_prior()
    empirical = prior["fresh_root_weight_kg"]
    # The prior is measured at 12 MAP. Height receives only a small adjustment:
    # its observed Pearson r is about 0.06 in the reference artifact.
    maturity = max(0.08, min(1.25, (inputs.age_months / 12.0) ** 1.5))
    stature = max(0.85, min(1.15, 0.85 + 0.30 * inputs.height_cm / 220.0))
    stems = 1.0 + min(5, inputs.stem_count - 1) * 0.05
    disease_factor = (
        1.0 if inputs.disease_class == "healthy"
        else max(0.48, 1.0 - 0.42 * inputs.disease_confidence)
    )
    modifier = maturity * stature * stems * disease_factor
    midpoint = float(empirical["median"]) * modifier
    midpoint = max(0.08, min(14.0, midpoint))

    # Start from measured P10/P90, then widen for Nigeria→Thailand domain shift,
    # missing variety/management variables and lack of paired input images.
    low = max(0.05, float(empirical["p10"]) * modifier * 0.65)
    high = min(20.0, float(empirical["p90"]) * modifier * 1.60)
    # Translate the same conservative scenario into dimensions that can drive the
    # visual model. These are agronomic planning ranges, not measurements recovered
    # from a single leaf photograph. Keep them explicitly tied to the broad weight
    # interval so the UI never implies image-based 3-D reconstruction.
    root_count = max(3, min(12, round(4 + maturity * 3 + (inputs.stem_count - 1) * 0.45)))
    mean_root_weight = midpoint / root_count
    length_mid = max(12.0, min(48.0, 19.0 + 12.0 * maturity + 3.4 * (mean_root_weight ** 0.5)))
    diameter_mid = max(2.0, min(10.0, 2.7 + 3.2 * (mean_root_weight ** 0.5)))
    size_class = "small" if midpoint < 0.7 else "medium" if midpoint < 1.6 else "large"
    return {
        "estimated_fresh_root_weight_kg_per_plant": {
            "low": round(low, 2),
            "midpoint": round(midpoint, 2),
            "high": round(high, 2),
        },
        "estimated_root_size": {
            "size_class": size_class,
            "root_count": root_count,
            "length_cm": {
                "low": round(length_mid * 0.72, 1),
                "midpoint": round(length_mid, 1),
                "high": round(length_mid * 1.28, 1),
            },
            "diameter_cm": {
                "low": round(diameter_mid * 0.68, 1),
                "midpoint": round(diameter_mid, 1),
                "high": round(diameter_mid * 1.32, 1),
            },
            "basis": "scenario_derived_from_age_stature_stems_disease_and_reference_weight_prior",
            "measured_from_image": False,
        },
        "method": {
            "id": "cassava_yield_scenario_v1",
            "type": "external_empirical_prior_with_scenario_modifiers",
            "trained_model": False,
            "independently_validated": False,
            "reference_artifact": prior.get("artifact_id"),
            "reference_records": prior.get("records", {}).get("valid_height_weight_pairs", 0),
            "reference_doi": prior.get("source", {}).get("doi"),
        },
        "inputs": {
            "age_months": inputs.age_months,
            "height_cm": inputs.height_cm,
            "stem_count": inputs.stem_count,
            "disease_class": inputs.disease_class,
            "disease_confidence": inputs.disease_confidence,
        },
        "quality_gate": {
            "production_eligible": False,
            "requires_measured_harvest_weight": True,
            "reason": "No paired image and destructive-harvest weight dataset is available in this project.",
        },
        "disclaimer_th": "เป็นช่วงจำลองเพื่อวางแผน ไม่ใช่น้ำหนักที่วัดจากภาพ ต้องสุ่มขุดและชั่งจริงก่อนตัดสินใจ",
        "disclaimer_en": "Planning scenario only, not weight measured from an image. Verify by destructive sampling and weighing.",
    }
