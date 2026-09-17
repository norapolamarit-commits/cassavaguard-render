"""Static contracts for the public bilingual frontend."""

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"


def test_thai_is_the_default_language():
    index = (FRONTEND / "index.html").read_text(encoding="utf-8")
    store = (FRONTEND / "src" / "store.js").read_text(encoding="utf-8")

    assert '<html lang="th"' in index
    assert "localStorage.getItem('cg_lang') || 'th'" in store


def test_every_dictionary_entry_has_thai_and_english_text():
    source = (FRONTEND / "src" / "i18n.js").read_text(encoding="utf-8")
    entries = re.findall(
        r"^\s*[a-zA-Z0-9_]+\s*:\s*\{\s*th\s*:\s*.+?,\s*en\s*:\s*.+?\s*\},?\s*$",
        source,
        flags=re.MULTILINE,
    )

    declared = [
        line for line in source.splitlines()
        if re.match(r"^\s*[a-zA-Z0-9_]+\s*:\s*\{", line)
    ]
    assert entries
    assert len(entries) == len(declared)


def test_auth_entry_message_is_bilingual():
    app = (FRONTEND / "src" / "App.jsx").read_text(encoding="utf-8")
    auth = (FRONTEND / "src" / "pages" / "auth.jsx").read_text(encoding="utf-8")

    assert "<P.Auth" in app
    assert "Sign in to your dashboard" in auth
    assert "เข้าสู่แดชบอร์ดของคุณ" in auth
