"""
EcoForge AI — Model Loader Singleton

Loads and caches the persisted Random Forest model, ColumnTransformer preprocessor,
and metadata once during application startup.
"""

import json
import joblib
from pathlib import Path
from typing import Optional, Dict, Any

from app.config import (
    MODEL_FILE,
    PREPROCESSOR_FILE,
    METRICS_FILE,
    FEATURE_CONFIG_FILE,
)


class ModelManager:
    _instance: Optional["ModelManager"] = None

    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metrics: Dict[str, Any] = {}
        self.feature_config: Dict[str, Any] = {}
        self.is_loaded = False

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def load_artifacts(self) -> bool:
        """Loads all artifacts from the model directory."""
        if not (MODEL_FILE.exists() and PREPROCESSOR_FILE.exists()):
            print(f"⚠️ Model artifacts missing. Looking in: {MODEL_FILE.parent}")
            self.is_loaded = False
            return False

        try:
            self.model = joblib.load(MODEL_FILE)
            self.preprocessor = joblib.load(PREPROCESSOR_FILE)

            if METRICS_FILE.exists():
                with open(METRICS_FILE, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)

            if FEATURE_CONFIG_FILE.exists():
                with open(FEATURE_CONFIG_FILE, "r", encoding="utf-8") as f:
                    self.feature_config = json.load(f)

            self.is_loaded = True
            print(f"✅ ModelManager successfully loaded {self.model.__class__.__name__} and preprocessor.")
            return True
        except Exception as e:
            print(f"❌ Error loading model artifacts: {e}")
            self.is_loaded = False
            return False


# Global singleton instance accessor
def get_model_manager() -> ModelManager:
    return ModelManager.get_instance()
