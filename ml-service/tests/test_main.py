"""Test suite for the Smart FinTech ML Service endpoints.

Covers health checks, single & batch prediction, categories listing,
input validation, and on-demand retraining.
"""


class TestHealthEndpoint:
    """Tests for GET /health."""

    def test_health_returns_200(self, client):
        """Health endpoint returns 200 with model_trained=True."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "OK"
        assert data["model_trained"] is True


class TestPredictEndpoint:
    """Tests for POST /predict."""

    def test_predict_food_category(self, client):
        """A food-related description should be categorized as Food & Dining."""
        response = client.post("/predict", json={"description": "starbucks coffee latte"})
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Food & Dining"
        assert 0.0 <= data["confidence"] <= 1.0
        assert data["description"] == "starbucks coffee latte"

    def test_predict_transport_category(self, client):
        """A transport-related description should be categorized as Transport."""
        response = client.post("/predict", json={"description": "uber ride to airport"})
        assert response.status_code == 200
        assert response.json()["category"] == "Transport"

    def test_predict_returns_confidence(self, client):
        """The confidence score should be a float between 0 and 1."""
        response = client.post("/predict", json={"description": "netflix subscription"})
        data = response.json()
        assert isinstance(data["confidence"], float)
        assert 0.0 <= data["confidence"] <= 1.0

    def test_predict_empty_description_returns_400(self, client):
        """An empty description should trigger a 400 error."""
        response = client.post("/predict", json={"description": ""})
        assert response.status_code == 422 or response.status_code == 400

    def test_predict_whitespace_only_returns_error(self, client):
        """A whitespace-only description should be rejected."""
        response = client.post("/predict", json={"description": "   "})
        assert response.status_code in (400, 422)


class TestBatchPredictEndpoint:
    """Tests for POST /batch-predict."""

    def test_batch_predict_returns_correct_count(self, client):
        """Batch predictions should return one result per input description."""
        descriptions = [
            "starbucks coffee",
            "uber ride downtown",
            "netflix monthly subscription",
        ]
        response = client.post("/batch-predict", json={"descriptions": descriptions})
        assert response.status_code == 200
        data = response.json()
        assert len(data["predictions"]) == len(descriptions)

    def test_batch_predict_structure(self, client):
        """Each prediction should have description, category, and confidence."""
        response = client.post(
            "/batch-predict",
            json={"descriptions": ["amazon purchase"]},
        )
        assert response.status_code == 200
        pred = response.json()["predictions"][0]
        assert "description" in pred
        assert "category" in pred
        assert "confidence" in pred

    def test_batch_predict_empty_list_returns_error(self, client):
        """An empty descriptions list should be rejected."""
        response = client.post("/batch-predict", json={"descriptions": []})
        assert response.status_code == 422


class TestCategoriesEndpoint:
    """Tests for GET /categories."""

    def test_categories_returns_list(self, client):
        """Categories endpoint should return a non-empty list."""
        response = client.get("/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["categories"], list)
        assert len(data["categories"]) > 0

    def test_categories_contains_expected(self, client):
        """The categories list should include well-known categories."""
        response = client.get("/categories")
        cats = response.json()["categories"]
        for expected in ("Food & Dining", "Transport", "Income", "Utilities"):
            assert expected in cats


class TestRetrainEndpoint:
    """Tests for POST /retrain."""

    def test_retrain_without_data(self, client):
        """Retraining with no extra data should succeed with base sample count."""
        response = client.post("/retrain")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "retrained"
        assert data["total_samples"] > 0

    def test_retrain_with_custom_data(self, client):
        """Retraining with additional samples should increase the total count."""
        custom = {
            "training_data": [
                {"description": "rent payment apartment", "category": "Housing"},
                {"description": "mortgage monthly", "category": "Housing"},
            ]
        }
        response = client.post("/retrain", json=custom)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "retrained"
        # Total should be at least base + 2
        assert data["total_samples"] >= 2
