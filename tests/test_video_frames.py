from pathlib import Path

import pytest

from backend.services.video_frames import _probe, runtime_status


def test_video_runtime_is_available_when_binaries_exist():
    status = runtime_status()
    assert status["available"] == bool(status["ffmpeg"] and status["ffprobe"])


def test_probe_rejects_invalid_video(tmp_path: Path):
    source = tmp_path / "bad.mp4"
    source.write_bytes(b"not a video")
    with pytest.raises(ValueError, match="decoded"):
        _probe(source)
