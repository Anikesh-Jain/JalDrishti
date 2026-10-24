# JalDrishti — IoT-Based Water Quality Monitoring & Early Warning System

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Academic-blue)]()

> **Clean Water, Safer Tomorrow**

JalDrishti is an IoT-based multi-parameter water quality monitoring and early warning system built as an academic prototype for **CS506 Minor Project — Acropolis Institute of Technology and Research, Indore**.

The system monitors four critical water quality parameters — **pH**, **Turbidity**, **TDS**, and **Temperature** — using an ESP32-S3 microcontroller with industrial inline sensors, transmitting readings over Wi-Fi to a cloud dashboard with real-time alerts and SMS notifications.

---

## Architecture

```
┌─────────────┐     HTTP/JSON      ┌──────────────────┐     MongoDB      ┌────────────────┐
│  ESP32-S3   │ ──────────────────► │  Node.js/Express │ ──────────────► │  React (Vite)  │
│  Sensor Hub │   x-device-key     │  Backend API     │   Mongoose ODM  │  Frontend SPA  │
└─────────────┘                    └──────────────────┘                  └────────────────┘
      │                                     │
      │  Blynk IoT Webhooks                │  Threshold Engine ─► Alert Lifecycle ─► SMS
      └─────────────────────────────────────┘
```

**Tech Stack:** Node.js · Express · MongoDB · Mongoose · React 18 · Vite 5 · Tailwind CSS · Recharts · Leaflet · JWT · bcrypt · Google OAuth 2.0

---

## Features

| Module | Description |
|--------|-------------|
| **Sensor Ingestion** | Validated HTTP/JSON telemetry from ESP32 with device key authentication |
| **Threshold Engine** | Configurable safe/caution/unsafe range evaluation with debounce logic |
| **Alert System** | Auto-generated alerts with deduplication, resolution, and re-breach detection |
| **SMS Notifications** | Pluggable SMS gateway (Twilio / Fast2SMS / mock) for breach alerts |
| **AI Image Screening** | Gemini Vision-powered water photo classification (Safe/Unsafe/Non-water) |
| **RBAC** | Role-based access control (Admin / Citizen) with Google OAuth integration |
| **Dashboard** | Real-time citizen portal with trends, alerts, map, and reports |
| **Hardware Onboarding** | Guided device claiming, Wi-Fi provisioning, and 5-state diagnostics |
| **Reports & Export** | Historical readings and alert logs with CSV export |
| **Map Visualization** | Leaflet/OpenStreetMap sensor node geospatial visualization |

---

## Quick Start

### Prerequisites

- **Node.js** 20 LTS or later
- **MongoDB** 7+ (local or Atlas) — or use `npm run db:local` for in-memory testing
- **Git**

### Setup

```bash
# Clone the repository
git clone https://github.com/Anikesh-Jain/JalDrishti.git
cd JalDrishti

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI, JWT secret, etc.

# Seed the database (creates prototype node + default thresholds)
npm run seed

# Provision an admin account (interactive)
node scripts/provision_admin.js
```

### Run

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

### Test

```bash
npm test
# Runs 19 test suites with 234 automated tests
```

### Production Build

```bash
npm run build:frontend
```

---

## Project Structure

```
JalDrishti/
├── backend/
│   ├── server.js               # Express server entry point
│   └── src/
│       ├── config/             # Database & environment configuration
│       ├── controllers/        # Route handlers (auth, sensor, alerts, etc.)
│       ├── middleware/         # Auth, RBAC, rate limiting, error handling
│       ├── models/            # Mongoose schemas (User, Reading, Alert, etc.)
│       ├── routes/            # Express route definitions
│       ├── services/          # Business logic (thresholds, SMS, AI screening)
│       ├── utils/             # JWT, password hashing, device key utilities
│       └── validators/        # Request payload validation
├── frontend/
│   ├── public/                # Static assets (images, favicon)
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── context/           # React Context (Auth)
│       ├── hooks/             # Custom hooks
│       ├── layouts/           # App shell (Sidebar, Header, Footer, Auth)
│       ├── pages/             # Route pages (Home, Dashboard, Admin, etc.)
│       ├── services/          # API client
│       └── styles/            # Global CSS & Tailwind config
├── firmware/
│   ├── JalDrishti_ESP32_ReadyMade.ino  # ESP32-S3 production firmware
│   └── README.md              # Hardware setup guide
├── scripts/                   # Database seeding & utilities
├── tests/                     # 19 automated test suites
├── docs/                      # Implementation docs & security audit
└── package.json               # Root workspace scripts
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | Public | Service health check |
| `POST` | `/api/auth/register` | Public | User registration |
| `POST` | `/api/auth/login` | Public | User login |
| `POST` | `/api/auth/google` | Public | Google OAuth login |
| `GET` | `/api/auth/me` | JWT | Current user profile |
| `POST` | `/api/sensor/readings` | Device Key | Ingest sensor telemetry |
| `GET` | `/api/sensors/readings` | JWT | Historical readings |
| `GET` | `/api/thresholds` | Admin | Threshold configuration |
| `PUT` | `/api/thresholds/:param` | Admin | Update thresholds |
| `GET` | `/api/alerts` | JWT | Alert history |
| `POST` | `/api/image-checks/screen` | JWT | AI image screening |
| `GET` | `/api/reports/readings` | JWT | Reading reports & CSV |
| `GET` | `/api/sensor/nodes` | JWT | Sensor node locations |
| `POST` | `/api/hardware/claim` | JWT | Claim a device |
| `POST` | `/api/contact` | Public | Contact inquiry |

---

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for the complete list. Key variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `SMS_PROVIDER` | SMS gateway (`mock` / `twilio` / `fast2sms`) |
| `GEMINI_API_KEY` | Google Gemini Vision API key |

---

## Testing

The project includes 19 comprehensive test suites covering:

- Authentication & JWT lifecycle
- RBAC authorization enforcement
- Sensor data ingestion & validation
- Threshold evaluation engine
- Alert lifecycle & deduplication
- SMS notification dispatch
- Historical data queries
- Map node visualization
- Report & CSV export
- Admin settings management
- AI image screening pipeline
- Security regression checks
- API contract verification
- Frontend route & build verification
- Full end-to-end integration
- Hardware onboarding & diagnostics
- Contact inquiry management
- User management

---

## Hardware

JalDrishti uses a factory-sealed ESP32-S3 inline pipeline monitor with:

- **pH Sensor** — Analog glass electrode with ADS1115 ADC
- **Turbidity Sensor** — Infrared nephelometric module
- **TDS Sensor** — Dual-probe conductivity sensor
- **Temperature Sensor** — DS18B20 waterproof digital probe

See [`firmware/README.md`](firmware/README.md) for hardware specifications and setup.

---

## Academic Context

| Detail | Value |
|--------|-------|
| **Course** | CS506 — Minor Project I |
| **Session** | July – December 2026 |
| **Institution** | Acropolis Institute of Technology and Research, Indore, MP |
| **Team** | Group 2 |

---

## License

This project is developed for academic purposes as part of a university minor project. All rights reserved.

---

> ⚠️ **Disclaimer:** JalDrishti is an academic research prototype. Sensor readings and AI screening results are advisory only and cannot confirm water is safe for drinking. For confirmation, laboratory testing by certified authorities is required.
