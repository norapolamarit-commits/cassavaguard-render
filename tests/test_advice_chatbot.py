from backend.services.advice_chatbot import answer


def test_chat_requires_analysis_when_no_prediction():
    result = answer("ควรทำอะไร", None, "th")
    assert result["prediction_id"] is None
    assert "ถ่ายภาพ" in result["reply"]


def test_chat_is_grounded_in_latest_prediction():
    result = answer("ผลล่าสุดคือโรคอะไร", {"id": 42, "top_class": "cmd", "confidence": 0.81}, "th")
    assert result["prediction_id"] == 42
    assert "81.0%" in result["reply"]
    assert result["model_context"]["top_class"] == "cmd"


def test_chat_does_not_claim_image_measures_weight():
    result = answer("น้ำหนักเท่าไหร่", {"id": 1, "top_class": "healthy", "confidence": 0.9}, "th")
    assert "วัดจากภาพต้นโดยตรงไม่ได้" in result["reply"]
