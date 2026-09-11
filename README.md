# EcoForge AI

> **Industrial Emission Leak Point Detector and Optimization Platform**

EcoForge AI is an intelligent platform designed to detect industrial emission leak points, analyze emission footprints, simulate reduction scenarios, and provide AI-assisted recommendations for industrial facilities.

---

## 🏗 Repository Structure (MERN Monorepo)

```text
ecoforge-ai/
│
├── client/                     # Frontend Application (React / Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Routed page views
│   │   ├── layouts/            # Layout wrappers (Navigation, Sidebar, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Client API call services
│   │   ├── context/            # React state context providers
│   │   ├── utils/              # Frontend formatting & helper functions
│   │   ├── constants/          # Frontend-specific constants
│   │   ├── assets/             # Images, icons, static styles
│   │   ├── types/              # Type definitions / prop validations
│   │   ├── App.jsx             # Top-level application shell & router
│   │   └── main.jsx            # Application mount entry point
│   ├── index.html              # HTML entry template
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Client dependencies & scripts
│
├── server/                     # Backend Application (Node.js / Express)
│   ├── src/
│   │   ├── config/             # DB connection, env config, external clients
│   │   ├── models/             # Mongoose database schemas & models
│   │   ├── routes/             # Express API route declarations
│   │   ├── controllers/        # Request handlers & HTTP response logic
│   │   ├── middleware/         # Auth, validation, and error middlewares
│   │   ├── services/           # Core domain logic layers
│   │   │   ├── emissions/      # Emission analysis & leak point calculations
│   │   │   ├── recommendations/# Rule-based & heuristic recommendations
│   │   │   └── ai/             # GenAI / LLM prompt orchestrations
│   │   ├── data/               # Static emission factors & baseline datasets
│   │   ├── utils/              # Backend helper utilities & loggers
│   │   ├── constants/          # Backend-specific status codes & configurations
│   │   ├── app.js              # Express app configuration & middleware pipeline
│   │   └── server.js           # Server bootstrap & HTTP listener
│   └── package.json            # Server dependencies & scripts
│
├── shared/                     # Shared cross-cutting contracts
│   ├── constants/              # Shared constants (API endpoints, statuses)
│   └── schemas/                # Shared validation schemas & interfaces
│
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture designs & diagrams
│   ├── api/                    # API contracts & schema references
│   └── demo/                   # Demo scripts, assets, & guides
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore specifications
├── README.md                   # Project overview & developer ownership rules
└── package.json                # Root monorepo workspace configuration
```

---

## 👥 Strict Developer Ownership Boundaries

To allow 3 developers to work simultaneously without code conflicts or race conditions, strict file and domain ownership boundaries are enforced:

| Developer | Primary Ownership Scope | Strictly Prohibited Scope |
| :--- | :--- | :--- |
| **MEMBER 1**<br>*(Frontend Engineer)* | • `client/`<br>• Frontend documentation (`docs/architecture/`, etc.) | ❌ Must **NOT** modify server files.<br>❌ Must **NOT** create backend or database logic.<br>❌ Must **NOT** store or access API secrets directly. |
| **MEMBER 2**<br>*(Backend & Emissions Engineer)* | • `server/src/config/`<br>• `server/src/models/`<br>• `server/src/routes/`<br>• `server/src/controllers/`<br>• `server/src/middleware/`<br>• `server/src/services/emissions/`<br>• `server/src/data/`<br>• `server/src/utils/`<br>• `server/src/constants/` | ❌ Must **NOT** modify React components or frontend code.<br>❌ Must **NOT** implement recommendation algorithms.<br>❌ Must **NOT** implement AI prompt orchestrations. |
| **MEMBER 3**<br>*(AI & Recommendations Engineer)* | • `server/src/services/recommendations/`<br>• `server/src/services/ai/`<br>• Recommendation/AI documentation in `docs/` | ❌ Must **NOT** modify React components or frontend code.<br>❌ Must **NOT** implement emission calculation formulas or database schemas. |
| **SHARED CONTRACTS**<br>*(All Members)* | • `shared/constants/`<br>• `shared/schemas/` | ⚠️ Contains **ONLY** stable contracts/constants explicitly agreed upon by all team members before changes are made. |

### Golden Rules
1. **Never edit across boundaries**: Do not create situations where two developers need to continuously edit the same file.
2. **Feature-oriented modularity**: Avoid giant monolithic files (e.g., giant `App.jsx`, giant `server.js`, giant controllers, or massive service files).
3. **Decoupled layers**: Never hardcode emission calculation values or recommendation logic inside routes.

---

## 🔄 Data Flow

```text
Frontend (React)
       ↓  (HTTP REST Requests with JSON payloads)
REST API Routing (Express)
       ↓
Controllers (HTTP parsing & response formatting)
       ↓
Services Layer
   ├── Emissions Service (Core formulas & leak point detection)
   ├── Recommendations Service (Domain action rules)
   └── AI Service (LLM orchestrations & prompt pipelines)
       ↓
MongoDB / Database / External Factors
```

- **Security Boundary**: React never directly communicates with MongoDB.
- **Secret Isolation**: API keys and database credentials reside exclusively within `server/` via environment variables and are never exposed to the client bundle.

---

## 📡 Conceptual API Contract

The following conceptual endpoints establish integration boundaries between Frontend and Backend:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check and readiness probe |
| `POST` | `/api/factories` | Register or onboard a new factory profile |
| `GET` | `/api/factories/:id` | Retrieve factory details and equipment metadata |
| `POST` | `/api/emissions/analyze` | Process telemetry data to detect leak points & calculate emissions |
| `GET` | `/api/emissions/:factoryId` | Retrieve historical emission records for a factory |
| `POST` | `/api/recommendations/generate` | Generate actionable mitigation recommendations |
| `GET` | `/api/recommendations/:factoryId` | Fetch active recommendations for a factory |
| `POST` | `/api/simulation` | Run what-if scenario simulations for mitigation strategies |
| `POST` | `/api/ai/chat` | AI-assisted sustainability consultation and queries |

---

## 🚀 Quick Start (Development)

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd Industrial-Emission-Leak-Point-Detector
   ```

2. **Set up Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   ```bash
   # Root monorepo install
   npm install
   ```

4. **Run Development Services**:
   ```bash
   # Run both client and server concurrently
   npm run dev

   # Or run individually
   npm run dev:client
   npm run dev:server
   ```