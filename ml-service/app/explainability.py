"""
EcoForge AI — Model Explainability Engine

Extracts feature importance weights and local decision drivers from the trained Random Forest model.
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd

from app.schemas import FeatureImportanceItem


def get_top_driving_features(
    model: Any,
    preprocessor: Any,
    raw_df: pd.DataFrame,
    top_n: int = 4,
) -> List[FeatureImportanceItem]:
    """
    Extracts the most influential features for the prediction using actual model feature importances
    and the factory's specific transformed feature activations.
    """
    if not hasattr(model, "feature_importances_") or preprocessor is None:
        return []

    try:
        # Get feature names from ColumnTransformer
        cat_features = list(preprocessor.named_transformers_["cat"].get_feature_names_out())
        num_features = list(preprocessor.transformers[1][2])
        all_features = cat_features + num_features

        importances = model.feature_importances_
        transformed_row = preprocessor.transform(raw_df)[0]

        # Calculate impact = importance * abs(normalized_feature_value)
        impacts = []
        for idx, fname in enumerate(all_features):
            val = transformed_row[idx]
            imp = importances[idx]
            # Higher impact if feature is important and activated
            activation = abs(val) if abs(val) > 0.01 else 0.1
            score = imp * activation
            impacts.append((fname, imp, score))

        # Sort by impact score descending
        impacts.sort(key=lambda x: x[2], reverse=True)

        results = []
        for fname, imp, _ in impacts[:top_n]:
            clean_name = fname.replace("cat__", "").replace("num__", "").replace("_", " ").title()
            results.append(
                FeatureImportanceItem(
                    feature=clean_name,
                    importance=round(float(imp), 4),
                    contribution="High operational driver in model decision",
                )
            )
        return results
    except Exception as e:
        print(f"⚠️ Explainability extraction error: {e}")
        return []
