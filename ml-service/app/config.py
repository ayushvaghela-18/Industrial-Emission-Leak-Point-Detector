import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "model"
DATA_DIR = BASE_DIR / "data"

MODEL_FILE = MODEL_DIR / "model.joblib"
PREPROCESSOR_FILE = MODEL_DIR / "preprocessor.joblib"
METRICS_FILE = MODEL_DIR / "metrics.json"
FEATURE_CONFIG_FILE = MODEL_DIR / "feature_config.json"
DATASET_FILE = DATA_DIR / "factory_interventions_dataset.csv"

# Service Configuration
HOST = os.getenv("ML_HOST", "0.0.0.0")
PORT = int(os.getenv("ML_PORT", "8000"))
CONFIDENCE_THRESHOLD = float(os.getenv("ML_CONFIDENCE_THRESHOLD", "0.35"))
MODEL_VERSION = "1.0.0"
MODEL_NAME = "EcoForge Circular Random Forest Classifier"

# Controlled 9 Circular Intervention Categories (Target Classes)
INTERVENTION_CATEGORIES = [
    "Alternative Materials",
    "Recycled Materials",
    "Material Reuse",
    "Recycling Loops",
    "Waste-to-Value",
    "Process Changes",
    "Energy Optimization",
    "Renewable Energy Substitution",
    "Transportation Optimization",
]

# Centralized Feature Definitions (Guarantees Training-Serving Consistency)
CATEGORICAL_FEATURES = [
    "industry_type",
    "primary_hotspot_key",
]

NUMERICAL_FEATURES = [
    "production_volume_units",
    "grid_electricity_kwh",
    "renewable_electricity_kwh",
    "renewable_energy_ratio",
    "fossil_fuel_burn_mj",
    "raw_material_kg",
    "virgin_material_percentage",
    "waste_generated_kg",
    "waste_landfill_percentage",
    "transport_tkm",
    "primary_hotspot_share_pct",
    "scope1_share_pct",
    "scope2_share_pct",
    "scope3_share_pct",
]

ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

# Allowed industry types & primary hotspot keys
ALLOWED_INDUSTRIES = [
    "textile",
    "food_processing",
    "metal_engineering",
    "chemical",
    "general",
]

ALLOWED_HOTSPOT_KEYS = [
    "electricity",
    "coal",
    "diesel",
    "natural_gas",
    "raw_materials",
    "waste",
    "transport",
]
