import os
import tempfile

import pytest

test_data_dir = tempfile.mkdtemp(prefix="cassavaguard-tests-")
os.environ["DATA_DIR"] = test_data_dir
os.environ["DATABASE_URL"] = f"sqlite:///{test_data_dir}/cassavaguard-tests.db"
os.environ["SECRET_KEY"] = "test-secret-key-0123456789abcdef0123456789"
os.environ["APP_ENV"] = "test"
os.environ["SEED_DEMO_DATA"] = "true"
os.environ["AUTH_REQUIRED"] = "true"
os.environ["ENVIRONMENTAL_DATA_MODE"] = "synthetic"
os.environ["USE_CNN"] = "false"
os.environ["EXPOSE_RESET_TOKEN"] = "true"

from fastapi.testclient import TestClient  # noqa: E402
from backend.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


def login(client, email: str, password: str) -> dict[str, str]:
    response = client.post(
        "/api/auth/login-json",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture(scope="session")
def admin_headers(client):
    return login(client, "admin@cassavaguard.ai", "admin123")


@pytest.fixture(scope="session")
def researcher_headers(client):
    return login(client, "researcher@cassavaguard.ai", "research123")


@pytest.fixture(scope="session")
def farmer_headers(client):
    return login(client, "farmer@cassavaguard.ai", "farmer123")
