"""
EcoForge AI — ML Service Test Suite

Tests:
1. FastAPI endpoints: /health, /model/info, /model/metrics, /predict/recommendations
2. Prediction accuracy and ranking on distinct industrial profiles
3. Input validation, handling of unknown categoricals, and error guardrails
4. Confidence scoring and explainability extraction
"""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.main import app
from app.model_loader import get_model_manager

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def ensure_model_loaded():
    manager = get_model_manager()
    if not manager.is_loaded:
        assert manager.load_artifacts(), "Failed to load model artifacts for tests"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["modelLoaded"] is True
    assert "version" in data
    assert data["uptimeSeconds"] >= 0


def test_model_info_endpoint():
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "RandomForest" in data["algorithm"]
    assert len(data["targetClasses"]) == 9
    assert len(data["features"]) == 16
    assert data["trainingSamples"] > 0


def test_model_metrics_endpoint():
    response = client.get("/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["overallAccuracy"] >= 0.85
    assert data["top3Accuracy"] >= 0.95
    assert data["testSamples"] > 0
    assert len(data["perClassMetrics"]) == 9


def test_predict_renewable_energy_profile():
    # Profile: Textile mill with heavy coal boiler and high Scope 1/2 emissions
    payload = {
        "industry_type": "textile",
        "primary_hotspot_key": "coal",
        "production_volume_units": 850000.0,
        "grid_electricity_kwh": 1250000.0,
        "renewable_electricity_kwh": 50000.0,
        "fossil_fuel_burn_mj": 1800000.0,
        "raw_material_kg": 350000.0,
        "virgin_material_percentage": 85.0,
        "waste_generated_kg": 48000.0,
        "waste_landfill_percentage": 80.0,
        "transport_tkm": 65000.0,
        "primary_hotspot_share_pct": 48.0,
        "scope1_share_pct": 52.0,
        "scope2_share_pct": 36.0,
        "scope3_share_pct": 12.0,
    }
    response = client.post("/predict/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "ACTIVE"
    assert len(data["topInterventions"]) == 3
    assert data["confidenceScore"] > 0.0

    # Top prediction should target renewable energy substitution
    top_cat = data["topInterventions"][0]["category"]
    assert top_cat in ["Renewable Energy Substitution", "Process Changes", "Energy Optimization"]
    assert len(data["keyDrivingFeatures"]) > 0


def test_predict_waste_to_value_profile():
    # Profile: Food processor with high organic pomace waste going to landfill
    payload = {
        "industry_type": "food_processing",
        "primary_hotspot_key": "waste",
        "production_volume_units": 450000.0,
        "grid_electricity_kwh": 880000.0,
        "renewable_electricity_kwh": 120000.0,
        "fossil_fuel_burn_mj": 200000.0,
        "raw_material_kg": 520000.0,
        "virgin_material_percentage": 95.0,
        "waste_generated_kg": 180000.0,  # Extremely heavy organic waste
        "waste_landfill_percentage": 92.0,
        "transport_tkm": 30000.0,
        "primary_hotspot_share_pct": 45.0,
        "scope1_share_pct": 20.0,
        "scope2_share_pct": 30.0,
        "scope3_share_pct": 50.0,
    }
    response = client.post("/predict/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    top_cat = data["topInterventions"][0]["category"]
    assert top_cat in ["Waste-to-Value", "Alternative Materials", "Material Reuse"]


def test_predict_transport_profile():
    # Profile: Heavy fleet diesel freight
    payload = {
        "industry_type": "general",
        "primary_hotspot_key": "diesel",
        "production_volume_units": 150000.0,
        "grid_electricity_kwh": 200000.0,
        "renewable_electricity_kwh": 20000.0,
        "fossil_fuel_burn_mj": 1400000.0,
        "raw_material_kg": 150000.0,
        "virgin_material_percentage": 60.0,
        "waste_generated_kg": 15000.0,
        "waste_landfill_percentage": 50.0,
        "transport_tkm": 250000.0,  # Massive transport volume
        "primary_hotspot_share_pct": 50.0,
        "scope1_share_pct": 55.0,
        "scope2_share_pct": 15.0,
        "scope3_share_pct": 30.0,
    }
    response = client.post("/predict/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    top_cat = data["topInterventions"][0]["category"]
    assert top_cat == "Transportation Optimization"


def test_unknown_categorical_handling():
    # Unknown industry and hotspot strings should be safely handled by OneHotEncoder (handle_unknown='ignore')
    payload = {
        "industry_type": "aerospace_and_marine_novel_sector",
        "primary_hotspot_key": "unmapped_exotic_leak_point",
        "production_volume_units": 50000.0,
    }
    response = client.post("/predict/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["topInterventions"]) == 3


def test_validation_error_on_negative_values():
    # Negative production volume should fail with 422 Unprocessable Entity
    payload = {
        "industry_type": "textile",
        "production_volume_units": -500.0,
    }
    response = client.post("/predict/recommendations", json=payload)
    assert response.status_code == 422
