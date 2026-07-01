"""Shared pytest fixtures for the ML service test suite."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Create a FastAPI TestClient that is reused across all tests in a module.

    The ``TestClient`` context manager triggers the lifespan events so the
    model is loaded/trained before any tests run.
    """
    with TestClient(app) as c:
        yield c
