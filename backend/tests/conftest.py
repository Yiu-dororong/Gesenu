import os
import sys

import pytest
from fastapi.testclient import TestClient

from main import app, get_current_user

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


@pytest.fixture
def test_user():
    return {
        "user_id": "be3ddb43-2288-486d-886d-bad8504d7e87",
        "email": "tester@gesenu.app",
    }


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_client(test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    test_c = TestClient(app)
    yield test_c
    app.dependency_overrides.pop(get_current_user, None)
