import numpy as np
from PIL import Image

from backend.services.feature_extraction import (
    gray_world_white_balance,
    leaf_background_crop,
)
from backend.training.train_cnn_torch import (
    PIPELINE_CHOICES,
    GrayWorldWhiteBalance,
    LeafBackgroundCrop,
)


def _field_image():
    array = np.full((80, 120, 3), (155, 110, 75), dtype=np.uint8)
    array[15:65, 30:95] = (35, 155, 55)
    return Image.fromarray(array)


def test_field_robust_is_an_explicit_candidate_pipeline():
    assert "field_robust" in PIPELINE_CHOICES


def test_training_wrappers_use_shared_serving_transforms():
    image = _field_image()
    assert np.array_equal(
        np.asarray(GrayWorldWhiteBalance()(image)),
        np.asarray(gray_world_white_balance(image)),
    )
    assert np.array_equal(
        np.asarray(LeafBackgroundCrop()(image)),
        np.asarray(leaf_background_crop(image)),
    )
