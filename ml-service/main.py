"""
Smart FinTech ML Service
========================
A production-grade FastAPI microservice for automatic transaction categorization
using TF-IDF vectorization and Multinomial Naive Bayes classification.

Features:
    - Automatic transaction categorization across 7 spending categories
    - Model persistence with joblib (train once, load on restart)
    - Batch prediction support for bulk categorization
    - On-demand retraining with custom data
    - CORS-enabled for frontend integration
"""

from contextlib import asynccontextmanager
from typing import Optional

import joblib
import logging
import os
from pathlib import Path

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("ml-service")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "classifier.joblib"

# ---------------------------------------------------------------------------
# Training Data — 60+ labelled samples across 7 categories
# ---------------------------------------------------------------------------
TRAINING_DATA: list[tuple[str, str]] = [
    # ── Food & Dining ────────────────────────────────────────────────────
    ("starbucks coffee", "Food & Dining"),
    ("mcdonalds burger", "Food & Dining"),
    ("whole foods market", "Food & Dining"),
    ("subway sandwich", "Food & Dining"),
    ("dominos pizza", "Food & Dining"),
    ("local diner breakfast", "Food & Dining"),
    ("ubereats delivery", "Food & Dining"),
    ("chipotle mexican grill", "Food & Dining"),
    ("dunkin donuts coffee latte", "Food & Dining"),
    ("grubhub food delivery order", "Food & Dining"),
    ("trader joes grocery", "Food & Dining"),
    ("kroger supermarket groceries", "Food & Dining"),
    ("panera bread lunch", "Food & Dining"),
    ("doordash restaurant delivery", "Food & Dining"),
    ("chick fil a chicken sandwich", "Food & Dining"),

    # ── Utilities ────────────────────────────────────────────────────────
    ("electric bill payment", "Utilities"),
    ("water department utilities", "Utilities"),
    ("comcast internet services", "Utilities"),
    ("gas and power corp", "Utilities"),
    ("mobile phone bill verizon", "Utilities"),
    ("att wireless phone plan", "Utilities"),
    ("pacific gas electric pge", "Utilities"),
    ("spectrum internet cable bill", "Utilities"),
    ("tmobile monthly wireless", "Utilities"),
    ("city sewer water utility", "Utilities"),

    # ── Transport ────────────────────────────────────────────────────────
    ("uber trip ride", "Transport"),
    ("lyft ride sharing", "Transport"),
    ("chevron gas station petrol", "Transport"),
    ("shell oil gasoline", "Transport"),
    ("metro transit ticket", "Transport"),
    ("subway fare card recharge", "Transport"),
    ("bp fuel station diesel", "Transport"),
    ("parking garage downtown", "Transport"),
    ("exxon mobil gas fill up", "Transport"),
    ("toll road highway charge", "Transport"),
    ("amtrak train ticket booking", "Transport"),
    ("yellow cab taxi fare", "Transport"),

    # ── Entertainment ────────────────────────────────────────────────────
    ("netflix monthly subscription", "Entertainment"),
    ("spotify music premium", "Entertainment"),
    ("amc movie theater tickets", "Entertainment"),
    ("steam games purchase", "Entertainment"),
    ("playstation network game", "Entertainment"),
    ("hulu streaming service", "Entertainment"),
    ("disney plus annual plan", "Entertainment"),
    ("xbox game pass ultimate", "Entertainment"),
    ("apple music subscription", "Entertainment"),
    ("concert tickets live nation", "Entertainment"),
    ("kindle ebook purchase amazon", "Entertainment"),
    ("youtube premium membership", "Entertainment"),

    # ── Shopping ─────────────────────────────────────────────────────────
    ("amazon online purchase", "Shopping"),
    ("walmart store shopping", "Shopping"),
    ("target home supplies", "Shopping"),
    ("best buy electronics gadget", "Shopping"),
    ("nike shoes clothing apparel", "Shopping"),
    ("ikea furniture home goods", "Shopping"),
    ("costco wholesale bulk", "Shopping"),
    ("etsy handmade crafts order", "Shopping"),
    ("macys department store", "Shopping"),
    ("home depot hardware tools", "Shopping"),

    # ── Healthcare ───────────────────────────────────────────────────────
    ("cvs pharmacy prescription", "Healthcare"),
    ("walgreens drugstore medicine", "Healthcare"),
    ("doctor office visit copay", "Healthcare"),
    ("dental cleaning checkup", "Healthcare"),
    ("health insurance premium blue cross", "Healthcare"),
    ("urgent care clinic visit", "Healthcare"),
    ("vision eye exam optometrist", "Healthcare"),
    ("hospital emergency room", "Healthcare"),

    # ── Income ───────────────────────────────────────────────────────────
    ("direct deposit paycheck salary", "Income"),
    ("freelance client invoice payment", "Income"),
    ("investment dividend payout", "Income"),
    ("venmo transfer from friend", "Income"),
    ("tax refund irs deposit", "Income"),
    ("cashback reward credit card", "Income"),
    ("zelle payment received", "Income"),
    ("interest savings account earned", "Income"),
    ("paypal incoming payment received", "Income"),
    ("birthday gift money deposit", "Income"),
]

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class TransactionInput(BaseModel):
    """Single transaction description for prediction."""
    description: str = Field(..., min_length=1, description="Transaction description text")


class PredictionOutput(BaseModel):
    """Prediction result for a single transaction."""
    description: str
    category: str
    confidence: float


class BatchInput(BaseModel):
    """Multiple transaction descriptions for bulk prediction."""
    descriptions: list[str] = Field(..., min_length=1, description="List of transaction descriptions")


class BatchOutput(BaseModel):
    """Bulk prediction results."""
    predictions: list[PredictionOutput]


class RetrainInput(BaseModel):
    """Optional custom training data to extend the base dataset."""
    training_data: Optional[list[dict[str, str]]] = Field(
        default=None,
        description="List of objects with 'description' and 'category' keys",
    )


class RetrainOutput(BaseModel):
    """Response after a successful retrain."""
    status: str
    total_samples: int


# ---------------------------------------------------------------------------
# ML Helpers
# ---------------------------------------------------------------------------

def _build_pipeline() -> Pipeline:
    """Create an untrained sklearn pipeline with TF-IDF + Naive Bayes."""
    return Pipeline([
        ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
        ("classifier", MultinomialNB(alpha=0.1)),
    ])


def train_model(
    data: list[tuple[str, str]] | None = None,
    *,
    save: bool = True,
) -> Pipeline:
    """Train the classification pipeline and optionally persist to disk.

    Args:
        data: Training data as ``(description, category)`` tuples.
              Defaults to the global ``TRAINING_DATA`` list.
        save: Whether to save the trained model to ``MODEL_PATH``.

    Returns:
        The fitted :class:`sklearn.pipeline.Pipeline`.
    """
    data = data or TRAINING_DATA
    texts = [item[0] for item in data]
    labels = [item[1] for item in data]

    pipeline = _build_pipeline()
    pipeline.fit(texts, labels)
    logger.info("ML model trained on %d samples.", len(data))

    if save:
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, MODEL_PATH)
        logger.info("Model persisted to %s", MODEL_PATH)

    return pipeline


def load_or_train_model() -> Pipeline:
    """Load a persisted model or train a fresh one if none exists.

    Returns:
        The fitted :class:`sklearn.pipeline.Pipeline`.
    """
    if MODEL_PATH.exists():
        pipeline = joblib.load(MODEL_PATH)
        logger.info("Model loaded from %s", MODEL_PATH)
        return pipeline

    logger.info("No saved model found — training from scratch.")
    return train_model()


# ---------------------------------------------------------------------------
# FastAPI App & Lifespan
# ---------------------------------------------------------------------------

model_pipeline: Pipeline | None = None  # set during lifespan startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: load/train model on startup, clean up on shutdown."""
    global model_pipeline
    model_pipeline = load_or_train_model()
    logger.info("Startup complete — model ready.")
    yield
    logger.info("Shutdown complete.")


app = FastAPI(
    title="Smart FinTech ML Service",
    version="2.0.0",
    description="Automatic transaction categorization powered by scikit-learn",
    lifespan=lifespan,
)

# CORS — allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict:
    """Health-check endpoint.

    Returns:
        JSON with service status and whether the model is loaded.
    """
    return {"status": "OK", "model_trained": model_pipeline is not None}


@app.post("/predict", response_model=PredictionOutput)
def predict(payload: TransactionInput) -> PredictionOutput:
    """Predict the spending category for a single transaction description.

    Args:
        payload: JSON body with a ``description`` field.

    Returns:
        Predicted category and confidence score.
    """
    if not payload.description or not payload.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    try:
        query = payload.description.lower()
        predicted_category: str = model_pipeline.predict([query])[0]

        probabilities = model_pipeline.predict_proba([query])[0]
        confidence = float(np.max(probabilities))

        if confidence < 0.25:
            predicted_category = "Uncategorized"

        return PredictionOutput(
            description=payload.description,
            category=predicted_category,
            confidence=round(confidence, 4),
        )
    except Exception as e:
        logger.error("Prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Internal prediction model error")


@app.post("/batch-predict", response_model=BatchOutput)
def batch_predict(payload: BatchInput) -> BatchOutput:
    """Predict categories for multiple transaction descriptions at once.

    Args:
        payload: JSON body with a ``descriptions`` list.

    Returns:
        A list of prediction results, one per description.
    """
    if not payload.descriptions:
        raise HTTPException(status_code=400, detail="Descriptions list cannot be empty")

    try:
        queries = [d.lower() for d in payload.descriptions]
        predicted_categories: list[str] = model_pipeline.predict(queries).tolist()
        probabilities = model_pipeline.predict_proba(queries)

        results: list[PredictionOutput] = []
        for desc, cat, probs in zip(payload.descriptions, predicted_categories, probabilities):
            confidence = float(np.max(probs))
            if confidence < 0.25:
                cat = "Uncategorized"
            results.append(PredictionOutput(
                description=desc,
                category=cat,
                confidence=round(confidence, 4),
            ))

        return BatchOutput(predictions=results)
    except Exception as e:
        logger.error("Batch prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Internal prediction model error")


@app.get("/categories")
def categories() -> dict:
    """Return the set of categories the model can predict.

    Returns:
        JSON with a ``categories`` list.
    """
    cats = sorted(set(label for _, label in TRAINING_DATA))
    return {"categories": cats}


@app.post("/retrain", response_model=RetrainOutput)
def retrain(payload: RetrainInput | None = None) -> RetrainOutput:
    """Retrain the model, optionally extending the base dataset.

    If ``training_data`` is provided in the request body, those samples are
    appended to the base ``TRAINING_DATA`` before retraining.

    Args:
        payload: Optional JSON body with additional training samples.

    Returns:
        Status and total number of training samples used.
    """
    global model_pipeline

    combined: list[tuple[str, str]] = list(TRAINING_DATA)

    if payload and payload.training_data:
        for entry in payload.training_data:
            desc = entry.get("description", "")
            cat = entry.get("category", "")
            if desc and cat:
                combined.append((desc, cat))

    model_pipeline = train_model(combined, save=True)

    return RetrainOutput(status="retrained", total_samples=len(combined))
