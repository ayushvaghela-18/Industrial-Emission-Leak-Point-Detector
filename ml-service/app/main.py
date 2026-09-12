"""
EcoForge AI — Machine Learning Circular Recommendation FastAPI Service

Serves the trained Random Forest model for circular economy intervention ranking.
Endpoints:
- GET /health
- POST /predict/recommendations
- GET /model/info
- GET /model/metrics
"""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import (
    MODEL_NAME,
    MODEL_VERSION,
    INTERVENTION_CATEGORIES,
    ALL_FEATURES,
    CONFIDENCE_THRESHOLD,
)
from app.schemas import (
    FactoryFeatureInput,
    PredictionResponse,
    HealthResponse,
    ModelInfoResponse,
    ModelMetricsResponse,
)
from app.model_loader import get_model_manager
from app.predictor import predict_circular_interventions

START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load persisted model artifacts once
    manager = get_model_manager()
    success = manager.load_artifacts()
    if not success:
        print("⚠️ Warning: Model manager could not load artifacts during startup.")
    yield
    # Shutdown
    print("🛑 ML Service shutting down.")


app = FastAPI(
    title="EcoForge AI — ML Circular Recommendation Service",
    description="Real machine-learning ranking service predicting top circular interventions from factory and emission profiles.",
    version=MODEL_VERSION,
    lifespan=lifespan,
)

# Enable CORS for local Node backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Service health and model readiness check."""
    manager = get_model_manager()
    return HealthResponse(
        status="healthy" if manager.is_loaded else "degraded",
        modelLoaded=manager.is_loaded,
        version=MODEL_VERSION,
        uptimeSeconds=round(time.time() - START_TIME, 2),
    )


@app.post("/predict/recommendations", response_model=PredictionResponse, tags=["Inference"])
def predict_recommendations(input_data: FactoryFeatureInput):
    """
    Predicts and ranks the top circular intervention categories for the given factory profile.
    Returns calibrated probability scores, confidence rating, and driving features.
    """
    try:
        response = predict_circular_interventions(input_data, top_k=3)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@app.get("/model/info", response_model=ModelInfoResponse, tags=["Model"])
def get_model_info():
    """Returns model architecture, features, and metadata."""
    manager = get_model_manager()
    return ModelInfoResponse(
        name=MODEL_NAME,
        version=MODEL_VERSION,
        algorithm="RandomForestClassifier (120 trees, max_depth=14)",
        targetClasses=INTERVENTION_CATEGORIES,
        features=ALL_FEATURES,
        trainingSamples=manager.metrics.get("trainSamples", 1400),
        confidenceThreshold=CONFIDENCE_THRESHOLD,
    )


@app.get("/model/metrics", response_model=ModelMetricsResponse, tags=["Model"])
def get_model_metrics():
    """Returns actual test set evaluation metrics."""
    manager = get_model_manager()
    if not manager.metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics are not available. Ensure train.py has run.",
        )
    return ModelMetricsResponse(
        model=manager.metrics.get("model", MODEL_NAME),
        version=manager.metrics.get("version", MODEL_VERSION),
        evaluationDate=manager.metrics.get("evaluationDate", ""),
        testSamples=manager.metrics.get("testSamples", 0),
        overallAccuracy=manager.metrics.get("overallAccuracy", 0.0),
        top3Accuracy=manager.metrics.get("top3Accuracy", 0.0),
        macroPrecision=manager.metrics.get("macroPrecision", 0.0),
        macroRecall=manager.metrics.get("macroRecall", 0.0),
        macroF1=manager.metrics.get("macroF1", 0.0),
        weightedF1=manager.metrics.get("weightedF1", 0.0),
        perClassMetrics=manager.metrics.get("perClassMetrics", {}),
    )


if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False)
