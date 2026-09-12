from pathlib import Path

import pytest

from backend.services import photogrammetry


def test_runtime_status_has_fail_closed_availability():
    status = photogrammetry.runtime_status()
    assert status["available"] == bool(status["colmap"] and status["trimesh"])


def test_reconstruction_rejects_invalid_set_id():
    with pytest.raises(ValueError, match="invalid image set id"):
        photogrammetry.start("../unsafe", 50)


def test_reconstruction_requires_existing_image_set():
    with pytest.raises(ValueError, match="at least 12"):
        photogrammetry.start("0" * 32, 50)
