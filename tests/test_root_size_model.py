from io import BytesIO

from PIL import Image, ImageDraw

from backend.services.root_size_model import extract_features, predict


def test_real_root_image_model_predicts_supported_geometry():
    image = Image.new("RGB", (640, 420), "black")
    draw = ImageDraw.Draw(image)
    draw.ellipse((70, 60, 110, 100), fill="white")
    draw.ellipse((240, 150, 420, 360), fill=(185, 145, 100))
    output = BytesIO(); image.save(output, format="JPEG")
    data = output.getvalue()
    assert extract_features(data).shape == (10,)
    result = predict(data, "side")
    assert result["model_id"] == "root_size_saengwilai_v1"
    assert result["training_samples"] > 0
    assert result["measurements"]["AREA(S)"] > 0
    assert result["weight_supported"] is False
