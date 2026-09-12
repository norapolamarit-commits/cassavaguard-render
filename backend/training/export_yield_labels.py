"""Export verified image-to-harvest labels from the application database."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

from backend.database import SessionLocal
from backend.models import HarvestMeasurement, Prediction


FIELDS = [
    "measurement_id", "prediction_id", "field_id", "model_id", "disease_class",
    "disease_confidence", "age_months", "height_cm", "stem_count",
    "total_fresh_root_weight_kg", "harvested_plant_count", "weight_kg_per_plant",
    "variety", "field_code", "latitude", "longitude", "root_volume_cm3_per_plant", "season",
    "root_images_json",
]


def export(path: Path) -> int:
    db = SessionLocal()
    try:
        rows = (db.query(HarvestMeasurement, Prediction)
                .join(Prediction, HarvestMeasurement.prediction_id == Prediction.id)
                .order_by(HarvestMeasurement.id).all())
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            for measurement, prediction in rows:
                writer.writerow({
                    "measurement_id": measurement.id,
                    "prediction_id": prediction.id,
                    "field_id": prediction.field_id or "",
                    "model_id": prediction.model_id,
                    "disease_class": prediction.top_class,
                    "disease_confidence": prediction.confidence,
                    "age_months": measurement.age_months,
                    "height_cm": measurement.height_cm,
                    "stem_count": measurement.stem_count,
                    "total_fresh_root_weight_kg": measurement.total_fresh_root_weight_kg,
                    "harvested_plant_count": measurement.harvested_plant_count,
                    "weight_kg_per_plant": measurement.weight_kg_per_plant,
                    "variety": measurement.variety,
                    "field_code": measurement.field_code,
                    "latitude": measurement.latitude if measurement.latitude is not None else "",
                    "longitude": measurement.longitude if measurement.longitude is not None else "",
                    "root_volume_cm3_per_plant": measurement.root_volume_cm3_per_plant or "",
                    "season": measurement.season,
                    "root_images_json": measurement.root_images_json,
                })
        return len(rows)
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("data/yield/verified_harvest_labels.csv"))
    args = parser.parse_args()
    count = export(args.output)
    print(f"exported {count} verified labels to {args.output}")


if __name__ == "__main__":
    main()
