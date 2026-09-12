"""
EcoForge AI — Industrial Circular Intervention Dataset Generator

Generates a realistic, domain-grounded synthetic dataset of 2,000 industrial factory profiles
labeled with the most suitable circular economy intervention category.

PROTOTYPE DATASET DECLARATION:
This dataset is synthetic and modeled after industrial manufacturing benchmarks
across 5 sectors (Textile, Food Processing, Metal & Engineering, Chemical, General Manufacturing).
Generation logic implements verified industrial energy efficiency and circular economy heuristics.
"""

import random
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add app directory to sys.path for centralized config imports
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import (
    INTERVENTION_CATEGORIES,
    ALLOWED_INDUSTRIES,
    ALLOWED_HOTSPOT_KEYS,
    ALL_FEATURES,
    DATASET_FILE,
)

# Seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


def generate_synthetic_dataset(num_samples: int = 2000) -> pd.DataFrame:
    rows = []
    samples_per_class = num_samples // len(INTERVENTION_CATEGORIES)
    remainder = num_samples % len(INTERVENTION_CATEGORIES)

    for cat_idx, target_category in enumerate(INTERVENTION_CATEGORIES):
        count = samples_per_class + (1 if cat_idx < remainder else 0)

        for _ in range(count):
            # Base industry selection
            if target_category in ["Alternative Materials", "Recycling Loops"]:
                industry = random.choice(["textile", "chemical", "metal_engineering", "general"])
            elif target_category == "Waste-to-Value":
                industry = random.choice(["food_processing", "textile", "chemical"])
            elif target_category == "Recycled Materials":
                industry = random.choice(["metal_engineering", "general", "chemical"])
            elif target_category == "Renewable Energy Substitution":
                industry = random.choice(["textile", "food_processing", "metal_engineering", "chemical", "general"])
            elif target_category == "Transportation Optimization":
                industry = random.choice(["general", "food_processing", "chemical", "metal_engineering"])
            else:
                industry = random.choice(ALLOWED_INDUSTRIES)

            # Profile archetypes tailored to circular intervention suitability
            if target_category == "Renewable Energy Substitution":
                primary_hotspot = random.choice(["electricity", "coal"])
                grid_kwh = np.random.uniform(700000, 2500000)
                renewable_kwh = np.random.uniform(0, grid_kwh * 0.12)  # Low clean energy
                fossil_mj = np.random.uniform(500000, 2000000) if primary_hotspot == "coal" else np.random.uniform(50000, 300000)
                raw_mat_kg = np.random.uniform(50000, 250000)
                virgin_pct = np.random.uniform(50.0, 85.0)
                waste_kg = np.random.uniform(10000, 40000)
                waste_landfill_pct = np.random.uniform(40.0, 75.0)
                transport_tkm = np.random.uniform(10000, 45000)
                hotspot_share = np.random.uniform(40.0, 68.0)
                scope1_share = np.random.uniform(10.0, 35.0) if primary_hotspot == "electricity" else np.random.uniform(45.0, 65.0)
                scope2_share = np.random.uniform(45.0, 75.0) if primary_hotspot == "electricity" else np.random.uniform(15.0, 35.0)
                scope3_share = max(5.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Energy Optimization":
                primary_hotspot = random.choice(["electricity", "natural_gas"])
                grid_kwh = np.random.uniform(500000, 1500000)
                renewable_kwh = np.random.uniform(grid_kwh * 0.10, grid_kwh * 0.35)
                fossil_mj = np.random.uniform(300000, 1200000)
                raw_mat_kg = np.random.uniform(80000, 300000)
                virgin_pct = np.random.uniform(60.0, 80.0)
                waste_kg = np.random.uniform(15000, 50000)
                waste_landfill_pct = np.random.uniform(45.0, 70.0)
                transport_tkm = np.random.uniform(15000, 50000)
                hotspot_share = np.random.uniform(28.0, 45.0)
                scope1_share = np.random.uniform(20.0, 40.0)
                scope2_share = np.random.uniform(35.0, 55.0)
                scope3_share = max(10.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Alternative Materials":
                primary_hotspot = "raw_materials"
                grid_kwh = np.random.uniform(200000, 800000)
                renewable_kwh = np.random.uniform(20000, 150000)
                fossil_mj = np.random.uniform(50000, 400000)
                raw_mat_kg = np.random.uniform(300000, 1200000)
                virgin_pct = np.random.uniform(85.0, 99.0)  # Very high virgin usage
                waste_kg = np.random.uniform(20000, 60000)
                waste_landfill_pct = np.random.uniform(50.0, 80.0)
                transport_tkm = np.random.uniform(20000, 60000)
                hotspot_share = np.random.uniform(38.0, 60.0)
                scope1_share = np.random.uniform(10.0, 25.0)
                scope2_share = np.random.uniform(15.0, 30.0)
                scope3_share = max(45.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Recycled Materials":
                primary_hotspot = "raw_materials"
                grid_kwh = np.random.uniform(300000, 900000)
                renewable_kwh = np.random.uniform(30000, 180000)
                fossil_mj = np.random.uniform(100000, 500000)
                raw_mat_kg = np.random.uniform(250000, 900000)
                virgin_pct = np.random.uniform(70.0, 92.0)
                waste_kg = np.random.uniform(25000, 80000)
                waste_landfill_pct = np.random.uniform(60.0, 90.0)
                transport_tkm = np.random.uniform(20000, 55000)
                hotspot_share = np.random.uniform(32.0, 52.0)
                scope1_share = np.random.uniform(15.0, 30.0)
                scope2_share = np.random.uniform(20.0, 35.0)
                scope3_share = max(40.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Waste-to-Value":
                primary_hotspot = "waste"
                grid_kwh = np.random.uniform(250000, 750000)
                renewable_kwh = np.random.uniform(25000, 120000)
                fossil_mj = np.random.uniform(100000, 450000)
                raw_mat_kg = np.random.uniform(200000, 700000)
                virgin_pct = np.random.uniform(60.0, 85.0)
                waste_kg = np.random.uniform(60000, 250000)  # Heavy organic/process waste
                waste_landfill_pct = np.random.uniform(75.0, 98.0)
                transport_tkm = np.random.uniform(15000, 45000)
                hotspot_share = np.random.uniform(30.0, 55.0)
                scope1_share = np.random.uniform(15.0, 30.0)
                scope2_share = np.random.uniform(20.0, 35.0)
                scope3_share = max(35.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Material Reuse":
                primary_hotspot = random.choice(["waste", "raw_materials"])
                grid_kwh = np.random.uniform(200000, 600000)
                renewable_kwh = np.random.uniform(20000, 100000)
                fossil_mj = np.random.uniform(50000, 350000)
                raw_mat_kg = np.random.uniform(150000, 500000)
                virgin_pct = np.random.uniform(65.0, 88.0)
                waste_kg = np.random.uniform(35000, 110000)
                waste_landfill_pct = np.random.uniform(70.0, 95.0)  # High disposable packaging waste
                transport_tkm = np.random.uniform(35000, 95000)
                hotspot_share = np.random.uniform(25.0, 45.0)
                scope1_share = np.random.uniform(15.0, 30.0)
                scope2_share = np.random.uniform(15.0, 35.0)
                scope3_share = max(40.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Recycling Loops":
                primary_hotspot = random.choice(["waste", "raw_materials"])
                grid_kwh = np.random.uniform(300000, 850000)
                renewable_kwh = np.random.uniform(30000, 140000)
                fossil_mj = np.random.uniform(80000, 400000)
                raw_mat_kg = np.random.uniform(200000, 650000)
                virgin_pct = np.random.uniform(60.0, 85.0)
                waste_kg = np.random.uniform(40000, 130000)  # High process trim
                waste_landfill_pct = np.random.uniform(40.0, 75.0)
                transport_tkm = np.random.uniform(15000, 40000)
                hotspot_share = np.random.uniform(26.0, 48.0)
                scope1_share = np.random.uniform(15.0, 30.0)
                scope2_share = np.random.uniform(25.0, 40.0)
                scope3_share = max(35.0, 100.0 - scope1_share - scope2_share)

            elif target_category == "Transportation Optimization":
                primary_hotspot = random.choice(["diesel", "transport"])
                grid_kwh = np.random.uniform(150000, 500000)
                renewable_kwh = np.random.uniform(15000, 80000)
                fossil_mj = np.random.uniform(600000, 1800000)  # Heavy fleet diesel
                raw_mat_kg = np.random.uniform(100000, 400000)
                virgin_pct = np.random.uniform(50.0, 80.0)
                waste_kg = np.random.uniform(10000, 35000)
                waste_landfill_pct = np.random.uniform(40.0, 70.0)
                transport_tkm = np.random.uniform(90000, 320000)  # Very high freight activity
                hotspot_share = np.random.uniform(32.0, 58.0)
                scope1_share = np.random.uniform(35.0, 60.0)
                scope2_share = np.random.uniform(10.0, 25.0)
                scope3_share = max(25.0, 100.0 - scope1_share - scope2_share)

            else:  # Process Changes
                primary_hotspot = random.choice(["natural_gas", "coal", "electricity"])
                grid_kwh = np.random.uniform(400000, 1200000)
                renewable_kwh = np.random.uniform(30000, 180000)
                fossil_mj = np.random.uniform(500000, 1600000)  # Inefficient process furnace/boiler
                raw_mat_kg = np.random.uniform(150000, 550000)
                virgin_pct = np.random.uniform(60.0, 85.0)
                waste_kg = np.random.uniform(20000, 65000)
                waste_landfill_pct = np.random.uniform(45.0, 75.0)
                transport_tkm = np.random.uniform(20000, 60000)
                hotspot_share = np.random.uniform(30.0, 52.0)
                scope1_share = np.random.uniform(35.0, 55.0)
                scope2_share = np.random.uniform(25.0, 45.0)
                scope3_share = max(10.0, 100.0 - scope1_share - scope2_share)

            # Production throughput correlated with material and energy
            production_volume = (raw_mat_kg * np.random.uniform(1.5, 3.5)) + (grid_kwh * 0.1)
            total_elec = max(1.0, grid_kwh + renewable_kwh)
            renewable_ratio = round(renewable_kwh / total_elec, 4)

            # Normalize scope shares to exactly 100.0%
            total_shares = scope1_share + scope2_share + scope3_share
            s1 = round((scope1_share / total_shares) * 100.0, 2)
            s2 = round((scope2_share / total_shares) * 100.0, 2)
            s3 = round(100.0 - s1 - s2, 2)

            row = {
                "industry_type": industry,
                "primary_hotspot_key": primary_hotspot,
                "production_volume_units": round(production_volume, 1),
                "grid_electricity_kwh": round(grid_kwh, 1),
                "renewable_electricity_kwh": round(renewable_kwh, 1),
                "renewable_energy_ratio": renewable_ratio,
                "fossil_fuel_burn_mj": round(fossil_mj, 1),
                "raw_material_kg": round(raw_mat_kg, 1),
                "virgin_material_percentage": round(virgin_pct, 2),
                "waste_generated_kg": round(waste_kg, 1),
                "waste_landfill_percentage": round(waste_landfill_pct, 2),
                "transport_tkm": round(transport_tkm, 1),
                "primary_hotspot_share_pct": round(hotspot_share, 2),
                "scope1_share_pct": s1,
                "scope2_share_pct": s2,
                "scope3_share_pct": s3,
                "target_intervention_category": target_category,
            }
            rows.append(row)

    df = pd.DataFrame(rows)
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)
    return df


def main():
    print("🏭 Generating 2,000 synthetic industrial factory intervention records...")
    df = generate_synthetic_dataset(num_samples=2000)

    DATASET_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATASET_FILE, index=False)

    print(f"✅ Synthetic dataset saved to: {DATASET_FILE}")
    print(f"   Total rows: {len(df)}")
    print(f"   Features: {len(ALL_FEATURES)}")
    print(f"   Target classes: {df['target_intervention_category'].nunique()}")
    print("\nClass distribution:")
    print(df["target_intervention_category"].value_counts().to_string())


if __name__ == "__main__":
    main()
