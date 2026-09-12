"""
EcoForge AI — Preprocessing Pipeline

Ensures training-serving feature consistency.
Converts raw factory input into the exact feature format and order expected by the model.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Union

from app.config import ALL_FEATURES
from app.schemas import FactoryFeatureInput


def extract_feature_dataframe(data: Union[FactoryFeatureInput, Dict[str, Any]]) -> pd.DataFrame:
    """
    Extracts features from either a Pydantic FactoryFeatureInput or dictionary,
    computes derived features, and structures into a 1-row DataFrame with exact feature order.
    """
    if isinstance(data, FactoryFeatureInput):
        d = data.model_dump()
    else:
        d = dict(data)

    # Derive renewable_energy_ratio if not explicitly supplied
    renewable_kwh = float(d.get("renewable_electricity_kwh", 0.0))
    grid_kwh = float(d.get("grid_electricity_kwh", 0.0))
    total_elec = max(1.0, grid_kwh + renewable_kwh)

    renewable_ratio = d.get("renewable_energy_ratio")
    if renewable_ratio is None:
        renewable_ratio = round(renewable_kwh / total_elec, 4)

    # Derive scope shares if missing or defaulting
    s1 = float(d.get("scope1_share_pct", 30.0))
    s2 = float(d.get("scope2_share_pct", 40.0))
    s3 = float(d.get("scope3_share_pct", 30.0))
    tot_s = s1 + s2 + s3
    if tot_s > 0:
        s1 = round((s1 / tot_s) * 100.0, 2)
        s2 = round((s2 / tot_s) * 100.0, 2)
        s3 = round(100.0 - s1 - s2, 2)

    # Clean categorical text
    raw_ind = str(d.get("industry_type", "general")).lower().strip().replace(" ", "_").replace("-", "_")
    raw_hot = str(d.get("primary_hotspot_key", "electricity")).lower().strip().replace(" ", "_").replace("-", "_")

    row = {
        "industry_type": raw_ind or "general",
        "primary_hotspot_key": raw_hot or "electricity",
        "production_volume_units": float(d.get("production_volume_units", 100000.0)),
        "grid_electricity_kwh": grid_kwh,
        "renewable_electricity_kwh": renewable_kwh,
        "renewable_energy_ratio": float(renewable_ratio),
        "fossil_fuel_burn_mj": float(d.get("fossil_fuel_burn_mj", 0.0)),
        "raw_material_kg": float(d.get("raw_material_kg", 100000.0)),
        "virgin_material_percentage": float(np.clip(d.get("virgin_material_percentage", 80.0), 0.0, 100.0)),
        "waste_generated_kg": float(d.get("waste_generated_kg", 20000.0)),
        "waste_landfill_percentage": float(np.clip(d.get("waste_landfill_percentage", 70.0), 0.0, 100.0)),
        "transport_tkm": float(d.get("transport_tkm", 25000.0)),
        "primary_hotspot_share_pct": float(np.clip(d.get("primary_hotspot_share_pct", 35.0), 0.0, 100.0)),
        "scope1_share_pct": s1,
        "scope2_share_pct": s2,
        "scope3_share_pct": s3,
    }

    # Guarantees exact column sequence
    df = pd.DataFrame([row])[ALL_FEATURES]
    return df
