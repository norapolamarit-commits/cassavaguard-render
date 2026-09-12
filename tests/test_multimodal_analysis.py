import datetime as dt
from types import SimpleNamespace

from backend.services import multimodal_analysis, weather_engine


def _field():
    return SimpleNamespace(
        id=7, name="Field 7", name_th="แปลง 7", province="Chaiyaphum",
        variety="KU50", area_rai=10.0, plant_count=12000,
        lat=15.5, lon=101.5, health_score=82.0, risk_level="medium",
        planted_at=dt.datetime.combine(dt.date.today() - dt.timedelta(days=90), dt.time()),
    )


def test_synthetic_terrain_is_provenance_labelled():
    result = weather_engine.terrain(15.5, 101.5)

    assert result["elevation_m"] > 0
    assert result["terrain_class"] in {"lowland", "upland", "highland"}
    assert result["slope_available"] is False
    assert result["data_source"]["mode"] == "synthetic"


def test_multimodal_evidence_does_not_change_image_probabilities(monkeypatch):
    monkeypatch.setattr(multimodal_analysis.weather_engine, "summary", lambda *_: {
        "today": {"temp_c": 29, "humidity_pct": 75}, "rain_7d_mm": 42,
        "warnings": [], "data_source": {"provider": "weather-test"},
    })
    monkeypatch.setattr(multimodal_analysis.weather_engine, "terrain", lambda *_: {
        "elevation_m": 180, "terrain_class": "lowland", "slope_available": False,
        "data_source": {"provider": "terrain-test"},
    })
    monkeypatch.setattr(multimodal_analysis.satellite_engine, "indices_on", lambda *_: {
        "ndvi": 0.61, "ndwi": 0.22, "savi": 0.52, "evi": 0.48,
        "data_source": {"provider": "satellite-test"},
    })
    monkeypatch.setattr(multimodal_analysis.reco_engine, "build", lambda *args: [{
        "title_en": "Monitor", "title_th": "ติดตาม", "severity": "info",
        "confidence": 0.7, "actions_en": [], "actions_th": [],
    }])

    result = multimodal_analysis.build(
        _field(), {"model": {"id": "cnn"}, "top_class": "healthy"}
    )

    assert result["changes_image_probabilities"] is False
    assert {row["source"] for row in result["evidence"]} == {
        "weather", "terrain", "satellite"
    }
    assert result["recommendations"]
    assert result["partial"] is False
