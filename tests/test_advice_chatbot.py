from backend.services import advice_chatbot
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


def test_chat_reports_curated_mode_without_api_key(monkeypatch):
    monkeypatch.setattr(advice_chatbot, "CHAT_LLM_API_KEY", "")
    result = answer("ควรทำอะไร", {"id": 1, "top_class": "cbb", "confidence": 0.7}, "th")
    assert result["llm_used"] is False
    assert result["provider"] == "curated"


def test_chat_uses_configured_llm(monkeypatch):
    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "ตรวจใบเพิ่มและยืนยันกับเจ้าหน้าที่ครับ"}}]}

    monkeypatch.setattr(advice_chatbot, "CHAT_LLM_API_KEY", "test-key")
    monkeypatch.setattr(advice_chatbot.httpx, "post", lambda *args, **kwargs: Response())
    result = answer("ควรทำอะไร", {"id": 1, "top_class": "cbb", "confidence": 0.7}, "th")
    assert result["llm_used"] is True
    assert result["provider"] == "groq"
    assert "ตรวจใบเพิ่ม" in result["reply"]


def test_chat_rejects_llm_agronomy_claim_not_in_grounding(monkeypatch):
    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "ให้ควบคุมเพลี้ยอ่อนและใช้สารเคมี"}}]}

    monkeypatch.setattr(advice_chatbot, "CHAT_LLM_API_KEY", "test-key")
    monkeypatch.setattr(advice_chatbot.httpx, "post", lambda *args, **kwargs: Response())
    result = answer("ผลล่าสุดคืออะไร", {"id": 1, "top_class": "cmd", "confidence": 0.81}, "th")
    assert "เพลี้ยอ่อน" not in result["reply"]
    assert "81.0%" in result["reply"]
