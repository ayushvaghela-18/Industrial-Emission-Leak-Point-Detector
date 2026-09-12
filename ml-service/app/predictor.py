"""
EcoForge AI — Prediction & Ranking Engine

Executes model inference, top-3 category ranking, confidence scoring,
and explainability extraction.
"""

from typing import Union, Dict, Any
import numpy as np

from app.config import CONFIDENCE_THRESHOLD, MODEL_NAME, MODEL_VERSION
from app.schemas import (
    FactoryFeatureInput,
    PredictionResponse,
    PredictionItem,
)
from app.model_loader import get_model_manager
from app.preprocessing import extract_feature_dataframe
from app.explainability import get_top_driving_features


def predict_circular_interventions(
    input_data: Union[FactoryFeatureInput, Dict[str, Any]],
    top_k: int = 3,
) -> PredictionResponse:
    manager = get_model_manager()
    if not manager.is_loaded or manager.model is None or manager.preprocessor is None:
        return PredictionResponse(
            success=False,
            status="MODEL_UNAVAILABLE",
            confidence="low",
            confidenceScore=0.0,
            topInterventions=[],
            allProbabilities={},
            keyDrivingFeatures=[],
            message="Model artifacts are not loaded in the ML service.",
            model=MODEL_NAME,
            version=MODEL_VERSION,
        )

    # 1. Structure and normalize features
    raw_df = extract_feature_dataframe(input_data)

    # 2. Transform with ColumnTransformer
    transformed_features = manager.preprocessor.transform(raw_df)

    # 3. Predict class probabilities
    probabilities = manager.model.predict_proba(transformed_features)[0]
    classes = manager.model.classes_

    # 4. Map and rank all probabilities
    prob_dict = {
        cls_name: round(float(prob), 4)
        for cls_name, prob in zip(classes, probabilities)
    }

    # Sort descending by probability
    ranked_indices = np.argsort(probabilities)[::-1]
    top_items = []
    for rank, idx in enumerate(ranked_indices[:top_k], start=1):
        top_items.append(
            PredictionItem(
                category=classes[idx],
                score=round(float(probabilities[idx]), 4),
                rank=rank,
            )
        )

    # 5. Confidence Evaluation
    top_score = top_items[0].score if top_items else 0.0
    if top_score >= 0.50:
        confidence = "high"
        status = "ACTIVE"
        msg = None
    elif top_score >= CONFIDENCE_THRESHOLD:
        confidence = "medium"
        status = "ACTIVE"
        msg = None
    else:
        confidence = "low"
        status = "LOW_CONFIDENCE"
        msg = "ML confidence is low; deterministic recommendations should be reviewed."

    # 6. Extract key driving features
    driving_features = get_top_driving_features(manager.model, manager.preprocessor, raw_df, top_n=4)

    return PredictionResponse(
        success=True,
        status=status,
        confidence=confidence,
        confidenceScore=top_score,
        topInterventions=top_items,
        allProbabilities=prob_dict,
        keyDrivingFeatures=driving_features,
        message=msg,
        model=MODEL_NAME,
        version=MODEL_VERSION,
    )
