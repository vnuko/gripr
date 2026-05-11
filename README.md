<div align="center">

# GripR

**AI-Powered Mountain Bike Tire Pressure Recommendations**

*Stop guessing. Start riding.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#features) • [How It Works](#how-it-works) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API](#api)

</div>

---

## Overview

GripR is an AI-assisted mountain bike tire pressure recommendation app that analyzes your GPX route and suggests optimal tire pressure settings for your ride. Unlike generic online PSI calculators that give you one-size-fits-all recommendations, GripR considers your actual route's terrain composition.

**Because "one pressure fits all trails" is a lie we've collectively accepted for too long.**

## Features

- **GPX Route Analysis** — Upload your route, get terrain-aware pressure recommendations
- **Terrain Intelligence** — Enriches GPX tracks with OpenStreetMap metadata (surface type, MTB scale, smoothness)
- **Weighted Terrain Profiles** — Calculates pressure based on mixed terrain composition, not binary labels
- **Front & Rear Recommendations** — Different pressures for different wheel loads
- **AI-Assisted Validation** — Deterministic calculations first, AI refinement second
- **MTB-Focused** — Built specifically for mountain biking (gravel and road support planned)

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  GPX File   │────▶│   Terrain    │────▶│   Baseline PSI  │────▶│   AI Check   │
│  + Inputs   │     │   Analysis   │     │   Calculation   │     │              │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
                                                                │
                                                                ▼
                                                       ┌──────────────┐
                                                       │  Final PSI   │
                                                       │ Recommendation│
                                                       └──────────────┘
```

### Inputs
- GPX route file
- Rider weight
- Bike type
- Tire setup
- Riding style

### Process
1. **Parse GPX route** — Extract elevation and route metrics
2. **Terrain enrichment** — Match segments against OpenStreetMap data
3. **Detect terrain composition** — Calculate weighted terrain percentages
4. **Calculate baseline pressure** — Apply physics-based PSI formulas
5. **Apply terrain adjustments** — Fine-tune for route characteristics
6. **AI validation** — Optional sanity check and reasoning
7. **Output recommendations** — Front and rear tire pressure suggestions

### Philosophy

> **Physics first. Robot opinions second.**

GripR uses deterministic calculations as the primary decision engine, with AI serving as a refinement and reasoning layer—not the other way around.

## Terrain Intelligence

Instead of binary labels like "this is a rocky ride," GripR calculates weighted terrain percentages:

```json
{
  "terrainProfile": {
    "asphalt": 0.10,
    "gravel": 0.35,
    "dirt": 0.25,
    "rocky": 0.20,
    "technical": 0.10
  }
}
```

This produces realistic pressure recommendations for mixed terrain rides.

**OpenStreetMap Enrichment Sources:**
- Surface type
- MTB scale
- Smoothness
- Track type
- Trail classification

## Tech Stack

### Frontend
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Bootstrap 5** — Styling
- **Vite** — Build tool

### Backend
- **Node.js 20+** — Runtime
- **Express.js** — API framework
- **TypeScript** — Type safety
- **OpenAPI/Swagger** — API documentation
- **OpenAI API** — AI validation layer
- **GPXParser** — GPX file processing
- **Zod** — Schema validation

### Testing
- **Vitest** — Test framework
- **Supertest** — API testing
- **MSW** — API mocking

### Infrastructure
- **Railway** — Deployment platform
- **Stateless API architecture** — No database for MVP

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- OpenAI API key

### Installation

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

Start the development server:

```bash
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

Start the development server:

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
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint code |
| `npm run typecheck` | Type check |

## API

The backend exposes a RESTful API with OpenAPI documentation available at `/api-docs` when running locally.

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze GPX and get tire pressure recommendations |
| `/api/health` | GET | Health check |

## Project Structure

```
gripr/
├── frontend/           # React + TypeScript frontend
│   ├── src/
│   ├── tests/
│   └── package.json
├── backend/            # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── validators/ # Request validation
│   │   └── utils/      # Utility functions
│   ├── tests/
│   └── package.json
└── README.md
```

## Roadmap

- [ ] Weather integration
- [ ] Suspension recommendations
- [ ] Telemetry support
- [ ] Rider profiles
- [ ] Gravel bike mode
- [ ] Road bike mode
- [ ] Caching and performance optimization

## Design Principles

GripR is intentionally designed to be:

- **Lightweight** — No unnecessary complexity
- **Modular** — Easy to extend and maintain
- **Understandable** — Clear logic, not a black box
- **Fast to iterate** — Quick development cycles
- **Easy to deploy** — Simple Railway deployment

No Kubernetes. No microservice fever. No seventeen layers of abstraction to calculate bicycle tire pressure.

Just enough engineering to make the ride better.

## Why GripR?

Most tire pressure calculators ignore the actual route. Riders care about:

> *"What pressure should I run for THIS ride tomorrow?"*

GripR answers exactly that.

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

**Made with ❤️ for mountain bikers who hate pinch flats**

</div>