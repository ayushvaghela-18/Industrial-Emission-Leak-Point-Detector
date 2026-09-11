# EcoForge AI System Architecture

## Overview

EcoForge AI is a MERN-based industrial emission leak point detector and optimization platform designed with decoupled layers to facilitate parallel, multi-developer contribution.

---

## Architectural Layers

```text
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React / Vite)              │
│  - App Shell / Router                                       │
│  - Reusable Components & Layouts                            │
│  - Custom Hooks & State Context                             │
│  - HTTP API Client Services                                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express API & Middleware Layer              │
│  - Route Handlers                                           │
│  - Request Validation & Auth Middlewares                    │
│  - Controllers (Request/Response Translation)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ Emissions Service │ │  Recommendations  │ │    AI Service     │
│ - Leak Detection  │ │  - Rule Engine    │ │ - GenAI Prompts   │
│ - Calculations    │ │  - Optimization   │ │ - Context Pipeline│
└───────────┬───────┘ └─────────┬─────────┘ └─────────┬─────────┘
            │                   │                     │
            └───────────────────┼─────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Persistence & Baselines              │
│  - MongoDB (Mongoose Schemas)                               │
│  - Emission Factors Baseline Datasets                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Developer Ownership & Boundaries

### Member 1: Frontend
- **Scope**: All files under `client/`.
- **Guidelines**:
  - Interacts with backend purely through `client/src/services/`.
  - Consumes `/api/*` endpoints defined in API Contract.
  - Never accesses database or environment secrets directly.

### Member 2: Backend & Emissions Core
- **Scope**:
  - `server/src/config/`
  - `server/src/models/`
  - `server/src/routes/`
  - `server/src/controllers/`
  - `server/src/middleware/`
  - `server/src/services/emissions/`
  - `server/src/data/`
  - `server/src/utils/`
  - `server/src/constants/`
- **Guidelines**:
  - Exposes REST endpoints cleanly via controllers.
  - Implements emission calculation and leak detection formulas inside `services/emissions/`.
  - Must not implement recommendation logic or AI prompts.

### Member 3: Recommendations & AI
- **Scope**:
  - `server/src/services/recommendations/`
  - `server/src/services/ai/`
  - AI and recommendation documentation.
- **Guidelines**:
  - Pure domain services receiving structured factory/emission data and returning mitigation recommendations or AI responses.
  - Avoid coupling directly to controller HTTP representations.
