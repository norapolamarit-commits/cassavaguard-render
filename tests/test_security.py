from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from backend.config import UPLOAD_DIR
from backend.core import security
from backend.database import SessionLocal
from backend.models import Prediction, User


def test_private_endpoints_require_authentication(client):
    for path in (
        "/api/fields",
        "/api/history/predictions",
        "/api/notifications",
        "/api/logs",
        "/api/models/system",
    ):
        response = client.get(path)
        assert response.status_code == 401, (path, response.text)
    assert client.post("/api/notifications/read-all").status_code == 401


def test_no_login_mode_resolves_shared_application_user(client, monkeypatch):
    monkeypatch.setattr(security, "AUTH_REQUIRED", False)

    profile = client.get("/api/auth/me")
    fields = client.get("/api/fields")

    assert profile.status_code == 200
    assert profile.json()["role"] == "admin"
    assert fields.status_code == 200


def test_registration_cannot_self_assign_privileged_role(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "self-admin@example.com",
            "password": "very-secure-password",
            "full_name": "Self Admin",
            "role": "admin",
            "language": "th",
        },
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"]["role"] == "farmer"


def test_roles_and_field_ownership_are_enforced(
    client, admin_headers, researcher_headers, farmer_headers
):
    assert len(client.get("/api/fields", headers=admin_headers).json()) == 6
    assert len(client.get("/api/fields", headers=researcher_headers).json()) == 6
    farmer_fields = client.get("/api/fields", headers=farmer_headers).json()
    assert {field["id"] for field in farmer_fields} == {2, 4, 6}

    hidden = client.get("/api/fields/1", headers=farmer_headers)
    assert hidden.status_code == 404
    visible = client.get("/api/fields/2", headers=farmer_headers)
    assert visible.status_code == 200

    create = client.post(
        "/api/fields",
        headers=researcher_headers,
        json={"name": "Read-only", "lat": 15.0, "lon": 102.0},
    )
    assert create.status_code == 403


def test_operational_logs_are_admin_only(client, admin_headers, farmer_headers):
    assert client.get("/api/logs", headers=admin_headers).status_code == 200
    assert client.get("/api/logs", headers=farmer_headers).status_code == 403


def test_farmer_can_create_owned_field(client, farmer_headers):
    response = client.post(
        "/api/fields",
        headers=farmer_headers,
        json={
            "name": "Farmer-owned test field",
            "name_th": "แปลงทดสอบของเกษตรกร",
            "province": "Chaiyaphum",
            "variety": "KU50",
            "area_rai": 5.5,
            "lat": 15.12,
            "lon": 102.03,
        },
    )
    assert response.status_code == 201, response.text
    field_id = response.json()["id"]
    assert client.get(f"/api/fields/{field_id}", headers=farmer_headers).status_code == 200


def test_farmer_cannot_mutate_another_fields_alert(client, farmer_headers):
    response = client.post("/api/notifications/1/read", headers=farmer_headers)
    assert response.status_code == 404


def test_notification_read_state_is_per_user(client, farmer_headers, admin_headers):
    assert client.post("/api/notifications/2/read", headers=farmer_headers).status_code == 200
    farmer_items = client.get("/api/notifications", headers=farmer_headers).json()["items"]
    admin_items = client.get("/api/notifications", headers=admin_headers).json()["items"]
    assert next(item for item in farmer_items if item["id"] == 2)["read"] is True
    assert next(item for item in admin_items if item["id"] == 2)["read"] is False


def test_reset_token_is_hashed_and_single_use(client):
    email = "password-reset@example.com"
    old_password = "initial-password-123"
    new_password = "updated-password-456"
    register = client.post(
        "/api/auth/register",
        json={"email": email, "password": old_password, "full_name": "Reset User", "language": "en"},
    )
    assert register.status_code == 200
    old_headers = {"Authorization": f"Bearer {register.json()['access_token']}"}

    forgot = client.post("/api/auth/forgot", json={"email": email})
    assert forgot.status_code == 200
    raw_token = forgot.json()["demo_token"]

    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).one()
        assert user.reset_token.startswith("v1$")
        assert raw_token not in user.reset_token
    finally:
        db.close()

    reset = client.post(
        "/api/auth/reset",
        json={"token": raw_token, "new_password": new_password},
    )
    assert reset.status_code == 200
    assert client.post(
        "/api/auth/reset",
        json={"token": raw_token, "new_password": "third-password-789"},
    ).status_code == 400
    assert client.post(
        "/api/auth/login-json",
        json={"email": email, "password": new_password},
    ).status_code == 200
    assert client.get("/api/auth/me", headers=old_headers).status_code == 401


def test_prediction_history_and_assets_are_owner_scoped(client, farmer_headers):
    db = SessionLocal()
    try:
        farmer = db.query(User).filter_by(email="farmer@cassavaguard.ai").one()
        image_name = "signed-asset-test.jpg"
        (UPLOAD_DIR / image_name).write_bytes(b"private-image-bytes")
        prediction = Prediction(
            source="leaf",
            filename="test.jpg",
            image_path=f"uploads/{image_name}",
            top_class="healthy",
            confidence=0.9,
            auxiliary_json=(
                '[{"key":"brown_leaf_spot","probability":0.71,'
                '"threshold":0.43,"detected":true}]'
            ),
            user_id=farmer.id,
            field_id=2,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        prediction_id = prediction.id
    finally:
        db.close()

    listing = client.get("/api/history/predictions", headers=farmer_headers)
    assert listing.status_code == 200
    row = next(item for item in listing.json()["items"] if item["id"] == prediction_id)
    assert row["user_email"] == ""
    assert row["auxiliary_findings"][0]["key"] == "brown_leaf_spot"
    assert row["auxiliary_findings"][0]["detected"] is True
    assert row["image_url"].startswith(f"/api/files/{prediction_id}/image?token=")

    asset = client.get(row["image_url"])
    assert asset.status_code == 200
    assert asset.content == b"private-image-bytes"

    split = urlsplit(row["image_url"])
    token = parse_qs(split.query)["token"][0]
    tampered = token[:-1] + ("a" if token[-1] != "a" else "b")
    bad_url = urlunsplit((split.scheme, split.netloc, split.path, urlencode({"token": tampered}), ""))
    assert client.get(bad_url).status_code == 401


def test_upload_type_and_security_headers(client, farmer_headers):
    response = client.post(
        "/api/predict/image",
        headers=farmer_headers,
        files={"file": ("payload.txt", b"not-an-image", "text/plain")},
    )
    assert response.status_code == 415

    health = client.get("/api/health")
    assert health.headers["x-content-type-options"] == "nosniff"
    assert health.headers["x-frame-options"] == "DENY"
    assert "default-src 'self'" in health.headers["content-security-policy"]
