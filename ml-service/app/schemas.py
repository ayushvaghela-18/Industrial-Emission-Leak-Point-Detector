from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator


class FactoryFeatureInput(BaseModel):
    """
    Factory operational parameters and emission profile used for ML inference.
    Supports raw factory process data or pre-calculated emission metrics.
    """
    industry_type: str = Field(default="general", description="Industry sector (e.g. textile, food_processing, metal_engineering)")
    primary_hotspot_key: str = Field(default="electricity", description="Key of the dominant emission leak point")
    production_volume_units: float = Field(default=100000.0, ge=0.0, description="Annual production units")
    grid_electricity_kwh: float = Field(default=500000.0, ge=0.0, description="Purchased grid electricity in kWh")
    renewable_electricity_kwh: float = Field(default=0.0, ge=0.0, description="Captive clean solar/wind electricity in kWh")
    renewable_energy_ratio: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Renewable fraction of electricity")
    fossil_fuel_burn_mj: float = Field(default=0.0, ge=0.0, description="Thermal energy from direct fuel combustion (MJ)")
    raw_material_kg: float = Field(default=100000.0, ge=0.0, description="Annual raw material input in kg")
    virgin_material_percentage: float = Field(default=80.0, ge=0.0, le=100.0, description="Virgin material proportion (%)")
    waste_generated_kg: float = Field(default=20000.0, ge=0.0, description="Annual solid/liquid waste generated in kg")
    waste_landfill_percentage: float = Field(default=70.0, ge=0.0, le=100.0, description="Waste sent to landfill (%)")
    transport_tkm: float = Field(default=25000.0, ge=0.0, description="Logistics freight volume in tonne-kilometers")
    primary_hotspot_share_pct: float = Field(default=35.0, ge=0.0, le=100.0, description="Primary hotspot percentage of total emissions")
    scope1_share_pct: float = Field(default=30.0, ge=0.0, le=100.0, description="Scope 1 direct emission share (%)")
    scope2_share_pct: float = Field(default=40.0, ge=0.0, le=100.0, description="Scope 2 grid electricity share (%)")
    scope3_share_pct: float = Field(default=30.0, ge=0.0, le=100.0, description="Scope 3 value chain share (%)")

    @field_validator("industry_type", mode="before")
    def clean_industry(cls, v):
        if not v or not isinstance(v, str):
            return "general"
        norm = v.strip().lower().replace(" ", "_").replace("-", "_")
        return norm if norm else "general"

    @field_validator("primary_hotspot_key", mode="before")
    def clean_hotspot_key(cls, v):
        if not v or not isinstance(v, str):
            return "electricity"
        norm = v.strip().lower().replace(" ", "_").replace("-", "_")
        return norm if norm else "electricity"


class PredictionItem(BaseModel):
    category: str
    score: float = Field(description="Calibrated probability score (0.0 - 1.0)")
    rank: int


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    contribution: str


class PredictionResponse(BaseModel):
    success: bool
    status: str = Field(description="'ACTIVE' or 'LOW_CONFIDENCE'")
    confidence: str = Field(description="'high', 'medium', or 'low'")
    confidenceScore: float
    topInterventions: List[PredictionItem]
    allProbabilities: Dict[str, float]
    keyDrivingFeatures: List[FeatureImportanceItem]
    message: Optional[str] = None
    model: str
    version: str


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    version: str
    uptimeSeconds: float


class ModelInfoResponse(BaseModel):
    name: str
    version: str
    algorithm: str
    targetClasses: List[str]
    features: List[str]
    trainingSamples: int
    confidenceThreshold: float


class ModelMetricsResponse(BaseModel):
    model: str
    version: str
    evaluationDate: str
    testSamples: int
    overallAccuracy: float
    top3Accuracy: float
    macroPrecision: float
    macroRecall: float
    macroF1: float
    weightedF1: float
    perClassMetrics: Dict[str, Dict[str, float]]
