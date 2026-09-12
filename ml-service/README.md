# EcoForge AI — Machine Learning Circular Recommendation Service

## 1. Overview & Objective
The **EcoForge AI ML Service** is a dedicated Python FastAPI service that predicts and ranks the most suitable **Circular Economy Intervention Categories** for industrial manufacturing facilities based on their operational and greenhouse gas emission profiles.

In the EcoForge AI hybrid decision-support architecture:
1. **Deterministic Emission Engine (Node.js)**: Calculates Scope 1, 2, and 3 emissions and identifies hotspot leak points.
2. **ML Recommendation Service (FastAPI)**: Analyzes factory operational features and ranks circular intervention categories with true probability scores.
3. **Recommendation Knowledge Base (Catalog)**: Provides actionable, vetted circular interventions matching the prioritized categories.
4. **Deterministic Financial & Impact Engine**: Calculates exact CO₂ abatement, cost savings, CapEx, and payback period.
5. **Ollama Cloud AI Copilot**: Grounded in authoritative metrics, explains recommendations in natural language.

---

## 2. Dataset Declaration & Generation
- **Source**: `ml-service/data/factory_interventions_dataset.csv`
- **Samples**: 2,000 industrial manufacturing facility records across 5 sectors:
  - Textile
  - Food Processing
  - Metal & Engineering
  - Chemical
  - General Manufacturing
- **PROTOTYPE DATASET DECLARATION**:
  > [!IMPORTANT]
  > Because no public historical industrial circular intervention outcome dataset exists in the repository, a realistic, rule-grounded synthetic dataset of 2,000 samples was generated using `data/generate_dataset.py`. The generation logic reflects verified industrial engineering benchmarks, energy balances, and material flow guidelines.

---

## 3. Features
The model consumes 16 input features (2 categorical, 14 numerical):

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `industry_type` | Categorical | Manufacturing sector (`textile`, `food_processing`, `metal_engineering`, `chemical`, `general`) |
| `primary_hotspot_key` | Categorical | Dominant emission leak point (`electricity`, `coal`, `diesel`, `natural_gas`, `raw_materials`, `waste`, `transport`) |
| `production_volume_units` | Numerical | Annual production throughput |
| `grid_electricity_kwh` | Numerical | Purchased grid electricity (kWh) |
| `renewable_electricity_kwh` | Numerical | On-site clean solar/wind electricity (kWh) |
| `renewable_energy_ratio` | Numerical | Ratio of clean electricity to total consumption |
| `fossil_fuel_burn_mj` | Numerical | Thermal energy from direct coal/fuel/gas combustion (MJ) |
| `raw_material_kg` | Numerical | Annual raw material input mass (kg) |
| `virgin_material_percentage`| Numerical | Virgin (non-recycled) material fraction (0–100%) |
| `waste_generated_kg` | Numerical | Annual solid and liquid industrial waste (kg) |
| `waste_landfill_percentage`| Numerical | Waste sent to landfill (0–100%) |
| `transport_tkm` | Numerical | Logistics freight activity (tonne-kilometers) |
| `primary_hotspot_share_pct`| Numerical | Percentage share of the primary emission leak point |
| `scope1_share_pct` | Numerical | Scope 1 direct emissions fraction of total |
| `scope2_share_pct` | Numerical | Scope 2 electricity emissions fraction of total |
| `scope3_share_pct` | Numerical | Scope 3 value chain emissions fraction of total |

---

## 4. Target Classes (9 Circular Categories)
1. `Alternative Materials`
2. `Recycled Materials`
3. `Material Reuse`
4. `Recycling Loops`
5. `Waste-to-Value`
6. `Process Changes`
7. `Energy Optimization`
8. `Renewable Energy Substitution`
9. `Transportation Optimization`

---

## 5. Model Architecture & Evaluation
- **Algorithm**: `RandomForestClassifier` (120 estimators, `max_depth=14`, `class_weight='balanced'`, `random_state=42`)
- **Preprocessing Pipeline**: Scikit-learn `ColumnTransformer`:
  - `OneHotEncoder(handle_unknown='ignore')` on categorical columns
  - `StandardScaler()` on numerical columns
- **Data Splitting**: Stratified 70% Train (1,400), 15% Validation (300), 15% Unseen Test (300).

### Evaluation Metrics on Unseen Test Data (300 Samples)
- **Top-1 Accuracy**: **98.00%**
- **Top-3 Accuracy**: **100.00%**
- **Macro Precision**: **98.15%**
- **Macro Recall**: **98.01%**
- **Macro F1-Score**: **0.9804**
- **Weighted F1-Score**: **0.9802**

### Per-Class Performance
| Category | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **Alternative Materials** | 1.0000 | 0.9412 | 0.9697 | 34 |
| **Energy Optimization** | 1.0000 | 1.0000 | 1.0000 | 33 |
| **Material Reuse** | 1.0000 | 0.9394 | 0.9688 | 33 |
| **Process Changes** | 1.0000 | 1.0000 | 1.0000 | 33 |
| **Recycled Materials** | 0.8919 | 0.9706 | 0.9296 | 34 |
| **Recycling Loops** | 0.9412 | 0.9697 | 0.9552 | 33 |
| **Renewable Energy Substitution** | 1.0000 | 1.0000 | 1.0000 | 33 |
| **Transportation Optimization** | 1.0000 | 1.0000 | 1.0000 | 33 |
| **Waste-to-Value** | 1.0000 | 1.0000 | 1.0000 | 34 |

---

## 6. Persisted Artifacts
Stored in `ml-service/model/`:
- `model.joblib`: Fitted Random Forest classifier.
- `preprocessor.joblib`: Fitted Scikit-learn `ColumnTransformer`.
- `metrics.json`: Detailed evaluation metrics, confusion matrix, and feature importances.
- `feature_config.json`: Feature definitions and schema metadata.

---

## 7. Model Explainability & Confidence Guardrails
- **Explainability**: Extracts actual model feature importances multiplied by normalized feature activations for each request. Returns the top-4 driving operational variables behind the prediction.
- **Confidence Threshold**:
  - Probability $\ge 0.50$: `confidence: "high"`, `status: "ACTIVE"`
  - $0.35 \le$ Probability $< 0.50$: `confidence: "medium"`, `status: "ACTIVE"`
  - Probability $< 0.35$: `confidence: "low"`, `status: "LOW_CONFIDENCE"`, triggering a safe deterministic fallback recommendation note.

---

## 8. API Endpoints

### 1. `GET /health`
Returns service health, model loading state, and uptime.
```json
{
  "status": "healthy",
  "modelLoaded": true,
  "version": "1.0.0",
  "uptimeSeconds": 142.5
}
```

### 2. `POST /predict/recommendations`
Accepts factory operational and emission metrics, returning top-3 ranked circular categories with probability scores and driving features.

**Example Request**:
```json
{
  "industry_type": "textile",
  "primary_hotspot_key": "coal",
  "production_volume_units": 850000.0,
  "grid_electricity_kwh": 1250000.0,
  "renewable_electricity_kwh": 50000.0,
  "fossil_fuel_burn_mj": 8400000.0,
  "raw_material_kg": 350000.0,
  "virgin_material_percentage": 85.0,
  "waste_generated_kg": 48000.0,
  "waste_landfill_percentage": 80.0,
  "transport_tkm": 65000.0,
  "primary_hotspot_share_pct": 48.0,
  "scope1_share_pct": 55.0,
  "scope2_share_pct": 35.0,
  "scope3_share_pct": 10.0
}
```

**Example Response**:
```json
{
  "success": true,
  "status": "ACTIVE",
  "confidence": "medium",
  "confidenceScore": 0.4996,
  "topInterventions": [
    { "category": "Process Changes", "score": 0.4996, "rank": 1 },
    { "category": "Renewable Energy Substitution", "score": 0.2997, "rank": 2 },
    { "category": "Material Reuse", "score": 0.081, "rank": 3 }
  ],
  "keyDrivingFeatures": [
    { "feature": "Fossil Fuel Burn Mj", "importance": 0.0649, "contribution": "High operational driver in model decision" },
    { "feature": "Scope1 Share Pct", "importance": 0.0671, "contribution": "High operational driver in model decision" }
  ],
  "model": "EcoForge Circular Random Forest Classifier",
  "version": "1.0.0"
}
```

### 3. `GET /model/info`
Returns architecture metadata, algorithms, target classes, and feature lists.

### 4. `GET /model/metrics`
Returns evaluated test set metrics.

---

## 9. Running and Testing

### Setup Environment & Train
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate Dataset & Train
python data/generate_dataset.py
python training/train.py

# Run Tests
pytest tests/test_ml_service.py -v
```

### Start FastAPI Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
