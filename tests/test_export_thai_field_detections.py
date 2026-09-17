import csv
from pathlib import Path

from PIL import Image

from backend.config import UPLOAD_DIR
from backend.database import SessionLocal
from backend.models import Prediction, User
from backend.training.export_thai_field_detections import export


def _make_prediction_with_image(tmp_name: str, top_class: str = "cbsd",
                                 color: tuple[int, int, int] = (10, 20, 30)) -> int:
    rel_dir = Path("uploads") / "users" / "export-test"
    (UPLOAD_DIR.parent / rel_dir).mkdir(parents=True, exist_ok=True)
    image_path = rel_dir / tmp_name
    # Distinct pixel content per call -- the exporter dedupes by decoded-pixel
    # fingerprint, so reusing the same color across unrelated fixtures would
    # make them look like the same real-world photo.
    Image.new("RGB", (32, 32), color=color).save(UPLOAD_DIR.parent / image_path, "JPEG")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "farmer@cassavaguard.ai").one()
        prediction = Prediction(
            source="leaf", filename=tmp_name, image_path=str(image_path),
            top_class=top_class, confidence=0.77, user_id=user.id, model_id="test-model",
        )
        db.add(prediction); db.commit(); db.refresh(prediction)
        return prediction.id
    finally:
        db.close()


def test_export_writes_metadata_and_label_rows_pending_review(client, tmp_path):
    prediction_id = _make_prediction_with_image("leaf-a.jpg", top_class="cbsd", color=(10, 20, 30))
    output_dir = tmp_path / "thai_field"

    report = export(output_dir)

    image_id = f"pred_{prediction_id}"
    assert report["exported"] >= 1
    assert report["exported_per_class"].get("cbsd", 0) >= 1

    with (output_dir / "metadata.csv").open(newline="", encoding="utf-8") as handle:
        metadata_rows = {row["image_id"]: row for row in csv.DictReader(handle)}
    assert image_id in metadata_rows
    assert metadata_rows[image_id]["disease"] == "cbsd"
    assert metadata_rows[image_id]["label_source"] == "app_prediction"
    assert metadata_rows[image_id]["expert_verified"] == ""

    with (output_dir / "labels.csv").open(newline="", encoding="utf-8") as handle:
        label_rows = {row["image_id"]: row for row in csv.DictReader(handle)}
    assert image_id in label_rows
    assert label_rows[image_id]["raw_label"] == "cbsd"
    # Never pre-fill canonical_class from the AI's own guess -- must stay
    # blank until an agronomist confirms it (see docs/THAI_FIELD_COLLECTION_TH.md).
    assert label_rows[image_id]["canonical_class"] == ""
    assert label_rows[image_id]["review_status"] == "pending"

    assert (output_dir / "images").glob(f"{image_id}__*")


def test_export_is_idempotent_across_reruns(client, tmp_path):
    _make_prediction_with_image("leaf-b.jpg", top_class="cmd", color=(200, 90, 40))
    output_dir = tmp_path / "thai_field"

    first = export(output_dir)
    second = export(output_dir)

    assert second["exported"] == 0
    assert second["skipped"].get("already_exported", 0) >= first["exported"]


def test_export_skips_non_disease_classes_and_missing_files(client, tmp_path):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "farmer@cassavaguard.ai").one()
        # Not a leaf-disease class -- must never enter the retrain candidate pool.
        db.add(Prediction(source="canopy", filename="x.jpg", image_path="uploads/does-not-exist.jpg",
                           top_class="not_cassava", confidence=0.5, user_id=user.id, model_id="test-model"))
        # Disease class but the file was never actually saved to disk.
        db.add(Prediction(source="leaf", filename="y.jpg", image_path="uploads/also-missing.jpg",
                           top_class="cbb", confidence=0.9, user_id=user.id, model_id="test-model"))
        db.commit()
    finally:
        db.close()

    output_dir = tmp_path / "thai_field"
    report = export(output_dir)

    assert report["skipped"].get("file_missing", 0) >= 1
