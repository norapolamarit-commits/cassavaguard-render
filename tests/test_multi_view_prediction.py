from backend.api.predict import _aggregate_image_results
from backend.services.ai_engine import SEVERITY_FEATURE_KEYS, _SYMPTOM_THRESHOLDS


def _result(top_class, probs, health=80, requires_review=False):
    ranked = sorted(probs.items(), key=lambda item: -item[1])
    return {
        "source": "leaf",
        "top_class": top_class,
        "confidence": probs[top_class],
        "probs": probs,
        "top3": [
            {"key": key, "en": key.upper(), "th": key, "confidence": value}
            for key, value in ranked[:3]
        ],
        "health_score": {"score": health, "note_en": "", "note_th": ""},
        "requires_review": requires_review,
        "review_reasons": ["low_confidence"] if requires_review else [],
        "inference_ms": 10,
        "model": {"id": "test"},
    }


def test_multi_view_fusion_weights_leaf_more_than_plant():
    leaf = _result("cmd", {"healthy": 0.1, "cmd": 0.8, "cbb": 0.1})
    plant = _result("healthy", {"healthy": 0.6, "cmd": 0.3, "cbb": 0.1})

    fused = _aggregate_image_results([leaf, plant], ["leaf", "plant"])

    assert fused["top_class"] == "cmd"
    assert fused["multi_view"]["image_count"] == 2
    assert fused["multi_view"]["agreement"] == 0.5
    assert fused["requires_review"] is True
    assert "multi_view_disagreement" in fused["review_reasons"]


def test_multi_view_agreement_does_not_create_review_reason():
    leaf = _result("cbb", {"healthy": 0.1, "cmd": 0.1, "cbb": 0.8}, health=60)
    plant = _result("cbb", {"healthy": 0.2, "cmd": 0.2, "cbb": 0.6}, health=70)

    fused = _aggregate_image_results([leaf, plant], ["leaf", "plant"])

    assert fused["top_class"] == "cbb"
    assert fused["multi_view"]["agreement"] == 1.0
    assert fused["requires_review"] is False
    assert fused["health_score"]["score"] == 65
    assert abs(sum(fused["probs"].values()) - 1.0) < 0.001


def test_every_severity_feature_has_a_calibrated_threshold():
    mapped = {feature for features in SEVERITY_FEATURE_KEYS.values() for feature in features}
    assert mapped <= set(_SYMPTOM_THRESHOLDS)


def test_multi_view_accepts_unavailable_health_scores():
    leaf = _result("cmd", {"healthy": 0.1, "cmd": 0.8, "cbb": 0.1})
    plant = _result("cmd", {"healthy": 0.2, "cmd": 0.7, "cbb": 0.1})
    leaf["health_score"] = None
    plant["health_score"] = None

    fused = _aggregate_image_results([leaf, plant], ["leaf", "plant"])

    assert fused["top_class"] == "cmd"
    assert fused["health_score"] is None
