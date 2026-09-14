import datetime as dt
import io
from types import SimpleNamespace

from PIL import Image

from backend.services.capture_time import analyze


def _jpeg_with_exif(value=None, offset=None):
    image = Image.new("RGB", (20, 20), "green")
    exif = Image.Exif()
    if value:
        exif[36867] = value
    if offset:
        exif[36881] = offset
    output = io.BytesIO()
    image.save(output, "JPEG", exif=exif)
    return output.getvalue()


def test_extracts_original_capture_time_and_crop_age():
    field = SimpleNamespace(planted_at=dt.datetime(2026, 4, 1))
    result = analyze(_jpeg_with_exif("2026:06:15 08:30:00", "+07:00"), field=field)
    assert result["source"] == "exif_datetime_original"
    assert result["is_actual_capture_time"] is True
    assert result["period_of_day"]["key"] == "morning"
    assert result["season"]["key"] == "rainy"
    assert result["crop_timing"]["days_after_planting_at_capture"] == 75
    assert result["changes_image_probabilities"] is False


def test_missing_exif_is_explicit_fallback_not_capture_claim():
    result = analyze(_jpeg_with_exif(), "2026-09-13T12:00:00+07:00")
    assert result["source"] == "client_observed_at"
    assert result["is_actual_capture_time"] is False
    assert result["warnings"][0]["key"] == "capture_time_missing"


def test_in_app_camera_timestamp_is_capture_evidence():
    result = analyze(
        _jpeg_with_exif(), "2026-09-13T08:15:00+07:00",
        client_timestamp_kind="camera_capture",
    )
    assert result["source"] == "client_camera_capture"
    assert result["is_actual_capture_time"] is True
    assert result["warnings"] == []
