# EcoForge AI — Backend API Reference & Contract
> **Primary Ownership:** Member 2 (Backend Architecture & Emission Engine)  
> **Base URL:** `http://localhost:5000/api`  
> **Communication Protocol:** REST / JSON  
> **Standard Response Envelope:** `{ success: boolean, message: string, data: any }`  
> **Standard Error Envelope:** `{ success: false, message: string, errorCode: string, details?: any }`

---

## Table of Contents
1. [System Health](#1-get-apihealth)
2. [Factory Management](#2-factory-management)
   - [GET /api/factories](#get-apifactories)
   - [POST /api/factories](#post-apifactories)
   - [GET /api/factories/:id](#get-apifactoriesid)
   - [POST /api/factories/seed](#post-apifactoriesseed)
3. [Emission Calculation & Hotspots](#3-emission-engine--hotspot-detection)
   - [POST /api/emissions/analyze](#post-apiemissionsanalyze)
   - [GET /api/emissions/:factoryId](#get-apiemissionsfactoryid)
4. [What-If Scenario Simulation](#4-what-if-scenario-simulation)
   - [POST /api/simulation](#post-apisimulation)
5. [Member 3 Handoff Contract](#5-member-3-handoff-contract)

---

## 1. GET /api/health
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Purpose:** System readiness probe and database connection status check.
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-12T01:00:00.000Z",
    "service": "EcoForge AI Backend Engine",
    "database": {
      "isConnected": false,
      "readyState": 0,
      "mode": "in-memory-fallback"
    }
  }
  ```

---

## 2. Factory Management

### GET /api/factories
- **Method:** `GET`
- **Endpoint:** `/api/factories`
- **Purpose:** List all registered industrial facilities.
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Factories retrieved successfully",
    "data": [
      {
        "_id": "6aa45a2976945d9d635e711c",
        "id": "6aa45a2976945d9d635e711c",
        "name": "Apex Textile Mills",
        "industryType": "Textile",
        "location": {
          "city": "Surat",
          "country": "India",
          "region": "Gujarat Industrial Belt"
        },
        "operationalProfile": {
          "operatingHoursPerYear": 5500,
          "facilityAreaSqMeters": 18000,
          "employeeCount": 320
        },
        "isSyntheticDemo": true,
        "createdAt": "2026-09-12T01:00:00.000Z",
        "updatedAt": "2026-09-12T01:00:00.000Z"
      }
    ]
  }
  ```

---

### POST /api/factories
- **Method:** `POST`
- **Endpoint:** `/api/factories`
- **Purpose:** Register a new factory profile and optionally calculate initial baseline emissions.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  - **Required Fields:**
    - `name` *(string, non-empty)*: Name of the industrial facility.
  - **Optional Fields:**
    - `industryType` *(string, enum: Textile, Food Processing, Manufacturing, Chemical, Metal & Engineering, Plastics & Packaging, Other)* — default: `'Manufacturing'`
    - `location` *(object: { city, country, region })*
    - `contactPerson` *(object: { name, email })*
    - `operationalProfile` *(object: { operatingHoursPerYear, facilityAreaSqMeters, employeeCount })*
    - `processData` *(object)*: Initial operational consumption metrics.
- **Example Request:**
  ```json
  {
    "name": "Apex Textile Mills",
    "industryType": "Textile",
    "location": {
      "city": "Surat",
      "country": "India"
    },
    "processData": {
      "energy": {
        "gridElectricityKwh": 1250000,
        "coalKg": 420000
      },
      "materials": {
        "materialType": "cotton",
        "rawMaterialKg": 350000,
        "virginMaterialPercentage": 85,
        "recycledMaterialPercentage": 15
      }
    }
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Factory created successfully",
    "data": {
      "factory": {
        "_id": "6aa45a2976945d9d635e711c",
        "name": "Apex Textile Mills",
        "industryType": "Textile"
      },
      "initialAnalysis": {
        "totalEmissionsTonsCO2e": 2697.65,
        "categories": [ ... ],
        "hotspots": [ ... ]
      }
    }
  }
  ```
- **Common Error Responses:**
  - `400 Bad Request`: `INVALID_FACTORY_NAME` if `name` is missing or empty.
  - `400 Bad Request`: `INVALID_INDUSTRY_TYPE` if `industryType` is not in allowed list.

---

### GET /api/factories/:id
- **Method:** `GET`
- **Endpoint:** `/api/factories/:id`
- **Purpose:** Retrieve details of a factory along with its latest process data and emission analysis.
- **URL Parameters:** `id` *(string)* — Factory identifier.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Factory details retrieved successfully",
    "data": {
      "factory": {
        "_id": "6aa45a2976945d9d635e711c",
        "name": "Apex Textile Mills",
        "industryType": "Textile"
      },
      "latestProcessData": { ... },
      "latestAnalysis": { ... }
    }
  }
  ```
- **Common Error Responses:**
  - `404 Not Found`: `FACTORY_NOT_FOUND` if factory ID does not exist.

---

### POST /api/factories/seed
- **Method:** `POST`
- **Endpoint:** `/api/factories/seed`
- **Purpose:** Seeds 3 realistic synthetic demonstration factories (*Apex Textile Mills*, *GreenHarvest Food Processors*, *Vulcan Precision Engineering*) with baseline process data and emission analyses for instant hackathon demonstrations.
- **Request Body:** None.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Synthetic demo factories seeded successfully",
    "data": [
      {
        "factoryId": "6aa45a2976945d9d635e711c",
        "name": "Apex Textile Mills",
        "industryType": "Textile",
        "totalEmissionsTonsCO2e": 3819.505,
        "topHotspot": "Virgin Raw Materials (cotton) (42.84%)",
        "analysisId": "6aa45a2976945d9d635e711e"
      }
    ]
  }
  ```

---

## 3. Emission Engine & Hotspot Detection

### POST /api/emissions/analyze
- **Method:** `POST`
- **Endpoint:** `/api/emissions/analyze`
- **Purpose:** Deterministically calculate Scope 1, Scope 2, and Scope 3 greenhouse gas emissions and rank emission leak points (hotspots).
- **Request Headers:** `Content-Type: application/json`
- **Request Body Options:**
  1. **Option A (Factory Linked):** `{ "factoryId": "<id>", "processData": { ... } }` or just `{ "factoryId": "<id>" }` (uses factory's latest recorded process data).
  2. **Option B (Ad-hoc / Standalone):** Direct operational fields:
     - `energy` *(object)*:
       - `gridElectricityKwh` *(number >= 0, unit: kWh)*
       - `renewableElectricityKwh` *(number >= 0, unit: kWh)*
       - `dieselLiters` *(number >= 0, unit: Liters)*
       - `coalKg` *(number >= 0, unit: kg)*
       - `naturalGasM3` *(number >= 0, unit: m³)*
     - `materials` *(object)*:
       - `materialType` *(string: cotton, polyester, steel, aluminum, food_grain, paper_cardboard, general)*
       - `rawMaterialKg` *(number >= 0, unit: kg)*
       - `virginMaterialPercentage` *(number 0-100)*
       - `recycledMaterialPercentage` *(number 0-100)*
     - `waste` *(object)*:
       - `wasteGeneratedKg` *(number >= 0, unit: kg)*
       - `wasteLandfillPercentage` *(number 0-100)*
       - `wasteRecycledPercentage` *(number 0-100)*
     - `logistics` *(object)*:
       - `transportTkm` *(number >= 0, unit: ton-km)*
     - `production` *(object)*:
       - `productionVolumeUnits` *(number >= 0)*
       - `productionUnit` *(string)*
- **Example Request:**
  ```json
  {
    "energy": {
      "gridElectricityKwh": 250000,
      "dieselLiters": 5000
    },
    "materials": {
      "materialType": "cotton",
      "rawMaterialKg": 40000,
      "virginMaterialPercentage": 90,
      "recycledMaterialPercentage": 10
    }
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Emission analysis and hotspot detection completed successfully",
    "data": {
      "factoryId": null,
      "factory": null,
      "analysisId": null,
      "totalEmissionsTonsCO2e": 421.4,
      "totalEmissionsKgCO2e": 421400,
      "categories": [
        {
          "category": "Energy & Fuels",
          "emissionsKgCO2e": 218400,
          "emissionsTonsCO2e": 218.4,
          "percentage": 51.83
        },
        {
          "category": "Raw Materials",
          "emissionsKgCO2e": 203000,
          "emissionsTonsCO2e": 203.0,
          "percentage": 48.17
        }
      ],
      "sources": [
        {
          "source": "Grid Electricity",
          "category": "Energy & Fuels",
          "scope": "Scope 2 (Electricity)",
          "inputAmount": 250000,
          "inputUnit": "kWh",
          "factorUsed": 0.82,
          "factorUnit": "kg CO₂e / kWh",
          "emissionsKgCO2e": 205000,
          "emissionsTonsCO2e": 205.0,
          "percentage": 48.65
        }
      ],
      "hotspots": [
        {
          "rank": 1,
          "source": "Grid Electricity",
          "category": "Energy & Fuels",
          "emissionsKgCO2e": 205000,
          "emissionsTonsCO2e": 205.0,
          "percentage": 48.65,
          "severity": "CRITICAL",
          "explanation": "Grid electricity constitutes 48.65% (205 t CO₂e) of the total carbon footprint due to fossil-fuel-intensive regional grid factors. Switching to on-site solar or green power tariffs can directly eliminate this Scope 2 leak point.",
          "reductionPotentialEstimate": {
            "potentialTonsReduction": 184.5,
            "primaryInterventionType": "Renewable Power Transition (Solar PV / Green Tariff)"
          },
          "metadata": {
            "inputAmount": 250000,
            "inputUnit": "kWh",
            "factorUsed": 0.82,
            "scope": "Scope 2 (Electricity)",
            "isPrimaryHotspot": true
          }
        }
      ],
      "baselineMetrics": {
        "emissionIntensityPerUnit": 0,
        "productionUnit": "units",
        "annualOperationalCostEstimate": 133250
      },
      "calculatedAt": "2026-09-12T01:00:00.000Z"
    }
  }
  ```
- **Common Error Responses:**
  - `400 Bad Request`: `MISSING_PROCESS_DATA` if neither operational data nor factoryId is provided.
  - `404 Not Found`: `FACTORY_NOT_FOUND` if factoryId does not exist.
  - `422 Unprocessable Entity`: `VALIDATION_FAILED` if numeric values are negative or percentages exceed 100%.

---

### GET /api/emissions/:factoryId
- **Method:** `GET`
- **Endpoint:** `/api/emissions/:factoryId`
- **Purpose:** Retrieve the active emission analysis and historical analyses for a factory.
- **URL Parameters:** `factoryId` *(string)* — Factory identifier.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Factory emission analysis retrieved successfully",
    "data": {
      "factory": {
        "id": "6aa45a2976945d9d635e711c",
        "name": "Apex Textile Mills",
        "industryType": "Textile",
        "location": { ... }
      },
      "latestAnalysis": {
        "totalEmissionsTonsCO2e": 3819.505,
        "totalEmissionsKgCO2e": 3819505,
        "categories": [ ... ],
        "sources": [ ... ],
        "hotspots": [ ... ],
        "baselineMetrics": { ... },
        "calculatedAt": "2026-09-12T01:00:00.000Z"
      },
      "history": [ ... ],
      "historyCount": 1
    }
  }
  ```
- **Common Error Responses:**
  - `404 Not Found`: `FACTORY_NOT_FOUND` if factoryId is unknown.
  - `404 Not Found`: `NO_ANALYSIS_FOUND` if factory exists but has no computed analysis.

---

## 4. What-If Scenario Simulation

### POST /api/simulation
- **Method:** `POST`
- **Endpoint:** `/api/simulation`
- **Purpose:** Model the environmental ($\text{CO}_2\text{e}$) and financial impact of hypothetical operational shifts deterministically without altering recorded baseline data.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  - **Required Fields:**
    - `scenarioChanges` *(object)*: Operational parameters to adjust (values must be percentages between 0 and 100):
      - `renewableEnergyPercentage` *(number 0-100)*: Shift grid electricity to solar/wind.
      - `recycledMaterialPercentage` *(number 0-100)*: Shift virgin raw materials to recycled content.
      - `fuelReductionPercentage` *(number 0-100)*: Reduce fossil fuel consumption (diesel, coal, gas).
      - `wasteRecyclingPercentage` *(number 0-100)*: Divert landfill waste to recycling.
      - `energyEfficiencyPercentage` *(number 0-100)*: Overall power demand reduction.
      - `processEfficiencyPercentage` *(number 0-100)*: Material yield optimization and waste generation reduction.
  - **Baseline Provision (Choose either):**
    - `factoryId` *(string)*: Uses the factory's active baseline process data.
    - `processData` *(object)*: Ad-hoc process metrics payload.
- **Example Request:**
  ```json
  {
    "processData": {
      "energy": { "gridElectricityKwh": 500000, "dieselLiters": 10000 },
      "materials": { "materialType": "cotton", "rawMaterialKg": 50000, "virginMaterialPercentage": 100 }
    },
    "scenarioChanges": {
      "renewableEnergyPercentage": 70,
      "recycledMaterialPercentage": 40,
      "fuelReductionPercentage": 25,
      "processEfficiencyPercentage": 10
    }
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "What-if scenario simulation executed successfully",
    "data": {
      "simulationId": null,
      "factoryId": null,
      "simulationApplied": {
        "renewableEnergyPercentage": 70,
        "recycledMaterialPercentage": 40,
        "fuelReductionPercentage": 25,
        "processEfficiencyPercentage": 10
      },
      "baseline": {
        "totalEmissionsTonsCO2e": 711.8,
        "totalEmissionsKgCO2e": 711800,
        "annualCostUSD": 192500,
        "categories": [ ... ]
      },
      "projected": {
        "totalEmissionsTonsCO2e": 318.45,
        "totalEmissionsKgCO2e": 318450,
        "annualCostUSD": 143875,
        "categories": [ ... ]
      },
      "impact": {
        "co2ReductionTons": 393.35,
        "percentageReduction": 55.26,
        "estimatedAnnualSavingsUSD": 48625,
        "favorableFinancialOutcome": true,
        "categoryComparison": [
          {
            "category": "Energy & Fuels",
            "baselineTons": 436.8,
            "projectedTons": 148.35,
            "reductionTons": 288.45,
            "percentageReduction": 66.04
          },
          {
            "category": "Raw Materials",
            "baselineTons": 275.0,
            "projectedTons": 170.1,
            "reductionTons": 104.9,
            "percentageReduction": 38.15
          }
        ]
      },
      "disclaimer": "Financial estimates are indicative decision-support figures based on standard benchmark rates and do not represent guaranteed commercial quotes."
    }
  }
  ```
- **Common Error Responses:**
  - `400 Bad Request`: `MISSING_SCENARIO_CHANGES` if `scenarioChanges` object is absent.
  - `400 Bad Request`: `INVALID_SIMULATION_PARAMETERS` if any percentage is negative or greater than 100.
  - `400 Bad Request`: `MISSING_BASELINE_DATA` if neither `processData` nor a factory with existing records is found.

---

## 5. Member 3 Handoff Contract

The recommendation engine (Member 3) consumes the output of `POST /api/emissions/analyze` or `GET /api/emissions/:factoryId`. Each hotspot object provides four key insights:

| Question | Hotspot Property | Description |
| :--- | :--- | :--- |
| **WHAT** is the hotspot? | `source` & `category` | e.g. `"Grid Electricity"`, `"Virgin Raw Materials (cotton)"` |
| **HOW LARGE** is it? | `emissionsTonsCO2e` & `percentage` | Exact metric tons and proportion of total emissions |
| **PRIORITY / SEVERITY** | `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) | Pre-classified based on standardized contribution thresholds |
| **WHY** is it a hotspot? | `explanation` | Human-readable explanation of why this source represents a leak point |
| **WHAT INTERVENTION** applies? | `reductionPotentialEstimate` | `{ potentialTonsReduction, primaryInterventionType }` |
| **OPERATIONAL CONTEXT** | `metadata` | `{ inputAmount, inputUnit, factorUsed, scope, isPrimaryHotspot }` |
