"""
EcoForge AI — Circular Recommendation Model Training Pipeline

Trains a Random Forest Classifier on industrial factory operational and emission features
to predict and rank the most suitable circular economy intervention categories.

Pipeline:
1. Loads synthetic dataset from data/factory_interventions_dataset.csv
2. Splits into Train (70%), Validation (15%), and Unseen Test (15%) sets with stratification
3. Fits ColumnTransformer (OneHotEncoder for categoricals + StandardScaler for numerics)
4. Trains RandomForestClassifier
5. Evaluates on unseen test set: Top-1 Accuracy, Top-3 Accuracy, Precision, Recall, F1, Per-Class Metrics
6. Persists model, preprocessor, feature configuration, and evaluation metrics into model/
"""

import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
import sys

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    top_k_accuracy_score,
)

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    ALL_FEATURES,
    DATASET_FILE,
    MODEL_FILE,
    PREPROCESSOR_FILE,
    METRICS_FILE,
    FEATURE_CONFIG_FILE,
    MODEL_DIR,
    MODEL_VERSION,
    MODEL_NAME,
    CONFIDENCE_THRESHOLD,
)

RANDOM_STATE = 42


def train_and_evaluate():
    print("🚀 Starting EcoForge Circular Intervention Model Training...")

    if not DATASET_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_FILE}. Run data/generate_dataset.py first.")

    df = pd.read_csv(DATASET_FILE)
    print(f"📊 Loaded {len(df)} records from {DATASET_FILE}")

    X = df[ALL_FEATURES]
    y = df["target_intervention_category"]

    # 1. 70% Train, 15% Validation, 15% Unseen Test Split (Stratified)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=RANDOM_STATE, stratify=y
    )
    val_ratio_adjusted = 0.15 / 0.85
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=val_ratio_adjusted, random_state=RANDOM_STATE, stratify=y_train_val
    )

    print(f"   Train samples: {len(X_train)} (70%)")
    print(f"   Val samples:   {len(X_val)} (15%)")
    print(f"   Test samples:  {len(X_test)} (15% unseen)")

    # 2. Build Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES,
            ),
        ]
    )

    # Fit preprocessor strictly on training data to prevent data leakage
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_val_transformed = preprocessor.transform(X_val)
    X_test_transformed = preprocessor.transform(X_test)

    # 3. Train Random Forest Classifier
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    clf.fit(X_train_transformed, y_train)

    # Validation check
    val_preds = clf.predict(X_val_transformed)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"📈 Validation Set Accuracy: {val_acc * 100:.2f}%")

    # 4. Rigorous Evaluation on Unseen Test Set
    test_preds = clf.predict(X_test_transformed)
    test_probs = clf.predict_proba(X_test_transformed)

    classes_list = list(clf.classes_)
    test_acc = accuracy_score(y_test, test_preds)
    top3_acc = top_k_accuracy_score(y_test, test_probs, k=3, labels=classes_list)

    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test, test_preds, average="macro", zero_division=0
    )
    precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_test, test_preds, average="weighted", zero_division=0
    )

    # Per-class metrics
    p_class, r_class, f1_class, support_class = precision_recall_fscore_support(
        y_test, test_preds, labels=classes_list, zero_division=0
    )
    per_class_metrics = {}
    for idx, cname in enumerate(classes_list):
        per_class_metrics[cname] = {
            "precision": round(float(p_class[idx]), 4),
            "recall": round(float(r_class[idx]), 4),
            "f1": round(float(f1_class[idx]), 4),
            "support": int(support_class[idx]),
        }

    # Confusion matrix
    conf_mat = confusion_matrix(y_test, test_preds, labels=classes_list).tolist()

    # Feature importances from Random Forest
    cat_feature_names = list(preprocessor.named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES))
    all_transformed_features = cat_feature_names + NUMERICAL_FEATURES
    raw_importances = clf.feature_importances_
    sorted_idx = np.argsort(raw_importances)[::-1]
    ranked_feature_importances = [
        {"feature": all_transformed_features[i], "importance": round(float(raw_importances[i]), 4)}
        for i in sorted_idx
    ]

    print("\n🎯 --- Unseen Test Set Evaluation Metrics ---")
    print(f"   Top-1 Accuracy:   {test_acc * 100:.2f}%")
    print(f"   Top-3 Accuracy:   {top3_acc * 100:.2f}%")
    print(f"   Macro F1-Score:   {f1_macro:.4f}")
    print(f"   Weighted F1-Score:{f1_weighted:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, test_preds, zero_division=0))

    # 5. Persist Artifacts
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, MODEL_FILE)
    joblib.dump(preprocessor, PREPROCESSOR_FILE)

    metrics_payload = {
        "model": MODEL_NAME,
        "version": MODEL_VERSION,
        "evaluationDate": datetime.utcnow().isoformat() + "Z",
        "datasetSamples": len(df),
        "trainSamples": len(X_train),
        "valSamples": len(X_val),
        "testSamples": len(X_test),
        "overallAccuracy": round(float(test_acc), 4),
        "top3Accuracy": round(float(top3_acc), 4),
        "macroPrecision": round(float(precision_macro), 4),
        "macroRecall": round(float(recall_macro), 4),
        "macroF1": round(float(f1_macro), 4),
        "weightedF1": round(float(f1_weighted), 4),
        "perClassMetrics": per_class_metrics,
        "confusionMatrix": conf_mat,
        "classes": classes_list,
        "top10FeatureImportances": ranked_feature_importances[:10],
    }
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    feature_config_payload = {
        "categoricalFeatures": CATEGORICAL_FEATURES,
        "numericalFeatures": NUMERICAL_FEATURES,
        "allFeatures": ALL_FEATURES,
        "transformedFeatureNames": all_transformed_features,
        "targetClasses": classes_list,
        "confidenceThreshold": CONFIDENCE_THRESHOLD,
        "version": MODEL_VERSION,
    }
    with open(FEATURE_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(feature_config_payload, f, indent=2)

    print(f"\n💾 Model saved to: {MODEL_FILE}")
    print(f"💾 Preprocessor saved to: {PREPROCESSOR_FILE}")
    print(f"💾 Metrics saved to: {METRICS_FILE}")
    print(f"💾 Feature config saved to: {FEATURE_CONFIG_FILE}")
    print("\n✅ Training and persistence completed successfully!")


if __name__ == "__main__":
    train_and_evaluate()
