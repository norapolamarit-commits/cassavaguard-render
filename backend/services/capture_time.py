"""Extract provenance-labelled capture time and derive safe temporal context."""
from __future__ import annotations

import datetime as dt
import io
from typing import Optional

from PIL import Image

_EXIF_DATES = (
    (36867, "exif_datetime_original"),
    (36868, "exif_datetime_digitized"),
    (306, "exif_datetime"),
)
_EXIF_OFFSETS = {36867: 36881, 36868: 36882, 306: 36880}


def _parse_offset(value) -> Optional[dt.timezone]:
    text = str(value or "").strip()
    if len(text) != 6 or text[0] not in "+-" or text[3] != ":":
        return None
    try:
        delta = dt.timedelta(hours=int(text[1:3]), minutes=int(text[4:6]))
        return dt.timezone(delta if text[0] == "+" else -delta)
    except ValueError:
        return None


def _parse_exif(value, offset=None) -> Optional[dt.datetime]:
    try:
        parsed = dt.datetime.strptime(str(value).strip(), "%Y:%m:%d %H:%M:%S")
    except (TypeError, ValueError):
        return None
    timezone = _parse_offset(offset)
    return parsed.replace(tzinfo=timezone) if timezone else parsed


def _parse_client(value: Optional[str]) -> Optional[dt.datetime]:
    if not value:
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=dt.timezone.utc)
    except (TypeError, ValueError):
        return None


def _period(hour: int) -> tuple[str, str, str]:
    if 5 <= hour < 11:
        return "morning", "ช่วงเช้า", "Morning"
    if 11 <= hour < 16:
        return "afternoon", "ช่วงบ่าย", "Afternoon"
    if 16 <= hour < 19:
        return "evening", "ช่วงเย็น", "Evening"
    return "night", "ช่วงกลางคืน", "Night"


def _season(month: int) -> tuple[str, str, str]:
    # General Thai seasonal calendar; local onset varies by province and year.
    if 5 <= month <= 10:
        return "rainy", "ฤดูฝนโดยประมาณ", "Approximate rainy season"
    if month in (11, 12, 1, 2):
        return "cool", "ฤดูเย็นโดยประมาณ", "Approximate cool season"
    return "hot", "ฤดูร้อนโดยประมาณ", "Approximate hot season"


def analyze(
    image_bytes: bytes,
    client_observed_at: Optional[str] = None,
    field=None,
    client_timestamp_kind: Optional[str] = None,
) -> dict:
    captured = None
    source = None
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            exif = image.getexif()
            for tag, candidate_source in _EXIF_DATES:
                captured = _parse_exif(exif.get(tag), exif.get(_EXIF_OFFSETS[tag]))
                if captured:
                    source = candidate_source
                    break
    except (OSError, ValueError):
        pass

    observed = _parse_client(client_observed_at)
    if captured is None:
        captured = observed or dt.datetime.now(dt.timezone.utc)
        source = "client_camera_capture" if observed and client_timestamp_kind == "camera_capture" else ("client_observed_at" if observed else "server_received_at")

    now = dt.datetime.now(captured.tzinfo or dt.timezone.utc)
    comparable = captured if captured.tzinfo else captured.replace(tzinfo=now.tzinfo)
    age_days = (now.date() - comparable.date()).days
    period_key, period_th, period_en = _period(captured.hour)
    season_key, season_th, season_en = _season(captured.month)
    is_exif = source.startswith("exif_")
    is_actual = is_exif or source == "client_camera_capture"
    warnings = []
    if not is_actual:
        warnings.append({
            "key": "capture_time_missing",
            "th": "ภาพไม่มีวันเวลาถ่ายใน EXIF จึงใช้เวลาที่เลือกรูป/เวลาที่เซิร์ฟเวอร์รับแทน",
            "en": "No EXIF capture time was found; selection/server time is shown as a fallback.",
        })
    if age_days < -1:
        warnings.append({"key": "future_time", "th": "วันเวลาของภาพอยู่ในอนาคต โปรดตรวจนาฬิกากล้อง", "en": "The image time is in the future; check the camera clock."})

    result = {
        "captured_at": captured.isoformat(),
        "source": source,
        "is_actual_capture_time": is_actual,
        "timezone_known": captured.tzinfo is not None,
        "period_of_day": {"key": period_key, "th": period_th, "en": period_en},
        "season": {"key": season_key, "th": season_th, "en": season_en, "basis": "general_thailand_calendar"},
        "image_age_days": age_days,
        "warnings": warnings,
        "changes_image_probabilities": False,
    }
    if field is not None and is_actual:
        planted = field.planted_at.date()
        capture_date = captured.date()
        result["crop_timing"] = {
            "days_after_planting_at_capture": (capture_date - planted).days,
            "capture_date": capture_date.isoformat(),
            "planted_date": planted.isoformat(),
            "valid": capture_date >= planted,
        }
    return result
