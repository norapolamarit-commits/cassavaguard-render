"""Fresh cassava-root weight inference from measured/reconstructed 3-D volume."""
from __future__ import annotations

from pathlib import Path

import joblib

ARTIFACT = Path(__file__).resolve().parents[1] / "ml_models" / "root_weight_regressor.joblib"


def predict_from_volume(volume_cm3: float, plant_count: int = 1) -> dict:
    if not 200 <= volume_cm3 <= 20000:
        raise ValueError("volume_cm3 must be between 200 and 20000")
    if not 1 <= plant_count <= 1000:
        raise ValueError("plant_count must be between 1 and 1000")
    if not ARTIFACT.is_file():
        raise RuntimeError("root weight ML artifact is not installed")
    artifact = joblib.load(ARTIFACT)
    metrics = artifact["metrics"]
    midpoint = max(0.0, float(artifact["model"].predict([[volume_cm3]])[0]))
    error = float(metrics["prediction_interval_abs_error_p95_kg"])
    in_domain = metrics["volume_range_cm3"][0] <= volume_cm3 <= metrics["volume_range_cm3"][1]
    # Extrapolation is allowed for field usability but gets a deliberately wider interval.
    if not in_domain:
        error *= 1.75
    low = max(0.0, midpoint - error)
    high = midpoint + error
    return {
        "estimated_fresh_root_weight_kg_per_plant": {
            "low": round(low, 2), "midpoint": round(midpoint, 2), "high": round(high, 2)
        },
        "estimated_total_weight_kg": {
            "low": round(low * plant_count, 2),
            "midpoint": round(midpoint * plant_count, 2),
            "high": round(high * plant_count, 2),
        },
        "input": {"volume_cm3_per_plant": volume_cm3, "plant_count": plant_count},
        "model": metrics,
        "in_training_domain": in_domain,
        "production_eligible": False,
        "measurement_requirement_th": "ต้องวัดปริมาตรรากหลังขุดด้วยการแทนที่น้ำ หรือสร้าง 3D จากภาพหลายมุม; ภาพใบอย่างเดียวใช้คำนวณน้ำหนักไม่ได้",
        "measurement_requirement_en": "Measure excavated-root volume by water displacement or multi-view 3-D reconstruction; a leaf photo alone cannot determine root weight.",
    }
