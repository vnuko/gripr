<div align="center">

# GripR

**AI-Powered Mountain Bike Tire Pressure Recommendations**

*Stop guessing. Start riding.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#features) • [How It Works](#how-it-works) • [Screenshots](#screenshots) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started)

</div>

---

## Overview

GripR is an AI-assisted mountain bike tire pressure recommendation app that analyzes your route and rider setup to suggest optimal PSI settings. Unlike generic online calculators that give you one-size-fits-all recommendations, GripR considers your actual terrain composition.

**Because "one pressure fits all trails" is a lie we've collectively accepted for too long.**

## Features

### Two Input Modes

- **GPX Route Analysis** — Upload your route file, get terrain-aware pressure recommendations based on real route data
- **Manual Terrain Selection** — Quick selection when you don't have a GPX file; pick terrain types and get instant recommendations

### Terrain Intelligence

- **OpenStreetMap Enrichment** — Matches route segments against OSM data for accurate terrain detection
- **Weighted Terrain Composition** — Calculates pressure based on mixed terrain percentages, not binary labels
- **Terrain Scoring** — Computes roughness, flow, and technicality scores for nuanced recommendations

### Smart Recommendations

- **Front & Rear PSI** — Different pressures for different wheel loads and traction needs
- **Three-Stage Results** — Baseline (weight-based), terrain-adjusted, and AI-validated recommendations
- **Confidence Indicators** — Shows how confident the system is in each recommendation

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INPUT                                           │
│  ┌─────────────────┐              ┌─────────────────────┐                   │
│  │   GPX Upload    │              │  Manual Selection   │                   │
│  │   (Route File)  │              │  (Terrain Types)    │                   │
│  └────────┬────────┘              └──────────┬──────────┘                   │
│           │                                  │                              │
│           ▼                                  ▼                              │
│  ┌─────────────────┐              ┌─────────────────────┐                   │
│  │   GPX Parser    │              │  Terrain Mapping    │                   │
│  │   (Elevation,   │              │  (UI → Backend)     │                   │
│  │   Coordinates)  │              │                     │                   │
│  └────────┬────────┘              └──────────┬──────────┘                   │
│           │                                  │                              │
│           ▼                                  │                              │
│  ┌─────────────────┐                        │                              │
│  │  OSM Enrichment │                        │                              │
│  │  (Surface Type, │                        │                              │
│  │   MTB Scale,    │                        │                              │
│  │   Smoothness)   │                        │                              │
│  └────────┬────────┘                        │                              │
│           │                                  │                              │
│           └────────────────┬─────────────────┘                              │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │  Terrain Profile│                                       │
│                   │  (Composition & │                                       │
│                   │   Scores)       │                                       │
│                   └────────┬────────┘                                       │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │  Baseline PSI   │                                       │
│                   │  Calculation    │                                       │
│                   │  (Weight, Bike, │                                       │
│                   │   Tire Width)   │                                       │
│                   └────────┬────────┘                                       │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │ Terrain Adjust  │                                       │
│                   │ (Surface Types) │                                       │
│                   └────────┬────────┘                                       │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │  AI Validation  │                                       │
│                   │  (OpenAI GPT-4) │                                       │
│                   └────────┬────────┘                                       │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │  Final PSI      │                                       │
│                   │  Recommendation │                                       │
│                   │  (Front & Rear) │                                       │
│                   └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Inputs

| Input | Description |
|-------|-------------|
| Rider weight | Determines baseline pressure range |
| Bike type | Trail, Enduro, XC, Downhill, Gravel |
| Tire width | Wider tires = lower pressure capability |
| Tubeless setup | Allows lower pressures safely |
| Riding style | Conservative, Moderate, Aggressive |
| Route file OR terrain selection | GPX upload or manual terrain picker |

### Process

1. **Parse route data** (GPX mode) or map terrain selection (manual mode)
2. **Enrich with OpenStreetMap** — Match segments against OSM tags
3. **Build terrain profile** — Calculate composition percentages and scores
4. **Calculate baseline pressure** — Physics-based formulas using weight, bike, tire width
5. **Apply terrain adjustments** — Modify PSI based on surface type composition
6. **AI validation** — Sanity check with reasoning and confidence assessment
7. **Output recommendations** — Front and rear PSI with explanations

### Philosophy

> **Physics first. Robot opinions second.**

GripR uses deterministic calculations as the primary engine, with AI serving as validation and explanation — not as the decision-maker.

---

## Screenshots

<!-- Add screenshots here -->
<!--
| Home Page - GPX Upload Mode | Home Page - Manual Terrain Mode |
|:---------------------------:|:-------------------------------:|
| ![GPX Upload]([path])      | ![Manual Terrain]([path])       |

| Results Page - PSI Recommendations | AI Explanation Panel |
|:----------------------------------:|:--------------------:|
| ![Results]([path])                | ![AI Panel]([path])  |
-->

---

## Terrain Intelligence

### Terrain Composition

Instead of binary labels like "this is a rocky ride," GripR calculates weighted percentages:

```json
{
  "terrainProfile": {
    "composition": {
      "asphalt": 0.10,
      "gravel": 0.35,
      "dirt": 0.25,
      "rocky": 0.20,
      "technical": 0.10
    },
    "scores": {
      "roughness": 0.56,
      "flow": 0.17,
      "technicality": 0.33
    }
  }
}
```

### Terrain Scores

| Score | Formula | Interpretation |
|-------|---------|----------------|
| **Roughness** | Weighted surface roughness | Low (smooth) → High (very rough) |
| **Flow** | Smooth surface ratio + gradient consistency | Low (interrupted) → High (excellent flow) |
| **Technicality** | Rocky + technical surface ratio | Low (easy) → High (challenging) |

### OpenStreetMap Tags Used

| OSM Tag | Purpose |
|---------|---------|
| `surface` | Primary terrain classification |
| `highway` | Road/trail type fallback |
| `mtb:scale` | MTB difficulty rating |
| `smoothness` | Surface smoothness level |

### Pressure Adjustment Logic

Each surface type applies a PSI modifier:

| Surface | Modifier | Rationale |
|---------|----------|-----------|
| Asphalt | +1.0 PSI | Smooth, higher pressure for efficiency |
| Gravel | +0.5 PSI | Mixed surface, moderate pressure |
| Dirt | -0.5 PSI | Traction needs, slightly lower |
| Rocky | -2.0 PSI | Impact absorption, much lower |
| Technical | -2.0 PSI | Roots/drops, maximum grip needed |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool, dev server |
| Custom CSS | Styling with CSS variables, dark mode support |
| Lucide React | Icon library |
| OpenAPI Fetch | Type-safe API client |
| Vitest + MSW | Testing |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| Express.js | API framework |
| TypeScript | Type safety |
| fast-xml-parser | GPX parsing |
| OpenAI API | AI validation layer |
| Zod | Schema validation |
| Swagger UI | API documentation |
| Multer | File upload handling |
| Vitest + Supertest | Testing |

### Infrastructure

| Platform | Purpose |
|----------|---------|
| Railway | Deployment platform |
| Stateless architecture | No database, session-free API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

Start development server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start development server:

```bash
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | TypeScript check |

---

## API

The backend exposes a RESTful API. View interactive docs at `/api-docs` when running locally.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze route and get PSI recommendations |
| `/health` | GET | Health check |
| `/api-docs` | GET | Swagger UI documentation |
| `/openapi.json` | GET | OpenAPI specification |

---

## Project Structure

### Backend

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── middleware/      # Express middleware
│   ├── validators/      # Request validation
│   ├── schemas/         # OpenAPI schemas
│   ├── services/        # Business logic
│   │   ├── ai/          # OpenAI integration
│   │   ├── gpx/         # GPX parsing & analysis
│   │   ├── osm/         # OpenStreetMap enrichment
│   │   ├── pressure/    # PSI calculations
│   │   └── terrain/     # Terrain normalization
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities & constants
│   ├── errors/          # Error definitions
│   └── config/          # App configuration
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── mocks/           # Test mocks
│   └ fixtures/          # Test fixtures (GPX files)
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── AIExplanation/
│   │   ├── BikeSetupForm/
│   │   ├── ErrorAlert/
│   │   ├── FileUpload/
│   │   ├── GPXUpload/
│   │   ├── Layout/
│   │   ├── LoadingSpinner/
│   │   ├── ResultsSection/
│   │   ├── RiderForm/
│   │   ├── TerrainSection/
│   │   └── ui/
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── api/             # API client & types
│   ├── styles/          # CSS styles
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
└── tests/
│   ├── integration/     # Integration tests
│   └ mocks/             # Test mocks
└── package.json
```

---

## Design Principles

GripR is intentionally designed to be:

- **Lightweight** — No unnecessary complexity
- **Modular** — Clear service boundaries, easy to extend
- **Transparent** — Logic is explainable, not a black box
- **Testable** — 192+ tests, comprehensive coverage

No Kubernetes. No microservice fever. No seventeen layers of abstraction to calculate bicycle tire pressure.

Just enough engineering to make the ride better.

---

## Why GripR?

Most tire pressure calculators ignore your actual route. Riders care about:

> *"What pressure should I run for THIS ride tomorrow?"*

GripR answers exactly that — whether you have a GPX file or just know the terrain type.

---

## Contributing

GripR is open source and welcomes contributions.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Development Guidelines

- Run `npm run typecheck` before committing
- Add tests for new features
- Follow existing code style and patterns

---

## Deployment

GripR is designed for Railway deployment:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
3. Deploy backend service
4. Deploy frontend service with `VITE_API_BASE_URL` pointing to backend

---

## Disclaimer

GripR provides **recommendations, not absolute truth**.

Tire pressure is:
- Terrain dependent
- Rider dependent
- Preference dependent
- Occasionally emotional

Always adjust based on real-world riding feel and common sense.

**And maybe carry a pump.**

---

<div align="center">

**Made for mountain bikers who hate pinch flats**

</div>