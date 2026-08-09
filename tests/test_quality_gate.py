from backend.training.quality_gate import evaluate


def test_release_quality_gate_uses_task_appropriate_held_out_metrics():
    report = evaluate()
    assert report["status"] == "pass"
    assert report["release_scope"] == "review_only"
    assert report["metric_contract"]["test_used_for_selection"] is False
    assert report["primary_cnn"]["accuracy"] > 0.75
    assert report["primary_cnn"]["accuracy_wilson_95"][0] > 0.75
    assert report["primary_cnn"]["macro_f1"] > 0.70
    assert report["whitefly_detector"]["map50"] >= 0.30
    assert report["whitefly_detector"]["recall"] >= 0.40
    assert report["whitefly_detector"]["f1"] >= 0.70
    assert report["whitefly_detector"]["evaluation_set"] == "validation"
    assert report["whitefly_detector"]["test_evaluated"] is False
    assert report["whitefly_detector"]["release_scope"] == "review_only"
    assert {warning["code"] for warning in report["warnings"]} == {
        "perceptual_duplicate_retrain_required",
        "validation_only_below_target",
    }
