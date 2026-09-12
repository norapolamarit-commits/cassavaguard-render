import io

from PIL import Image

from backend.api.predict import _validate_image


def test_camera_mpo_with_jpeg_mime_is_accepted():
    """Phone/camera MPO photos commonly arrive with a .jpg filename."""
    payload = io.BytesIO()
    first = Image.new("RGB", (16, 16), "green")
    second = Image.new("RGB", (16, 16), "red")
    first.save(payload, format="MPO", save_all=True, append_images=[second])

    _validate_image(payload.getvalue(), "image/jpeg")
