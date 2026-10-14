# JalDrishti — Master Software Implementation Plan

**Project:** JalDrishti — IoT-Based Multi-Parameter Water Quality Monitoring and Early Warning System  
**Document Type:** Master Architectural Specification & Phase-by-Phase Implementation Roadmap  
**Document Version:** 1.1.0 (Master Implementation & Redesign Mission Baseline)  
**Author:** Lead Software Architect & Implementation Planner  
**Date:** October 6, 2026 (Updated: October 9, 2026)  
**Workspace:** `d:\College Projects\Minor Projects\Minor Project -1\JalDrishti`  

---

## Executive Summary & Authoritative Document Analysis

This implementation plan establishes the architectural blueprint, execution roadmap, and verification strategy for **JalDrishti**, starting from an **empty workspace** to a **working academic prototype**.

All planning decisions directly originate from and harmonize the three authoritative project documents present in the workspace:
1. **`2a_G2_SRS_JalDrishti_FINAL.docx`** — Software Requirements Specification (SRS), defining users, functional/non-functional requirements, logical entity structures, and testing baselines.
2. **`3b_G2_Synopsis Presentation_CS508_Minor Project I-Jul-Dec 2026.pdf`** — Official project synopsis and presentation, establishing the problem context (2025 Bhagirathpura, Indore municipal contamination outbreak), hardware choices, wireframes, Gantt schedule, and expanded test suite (TC01–TC12).
3. **`4a_G2_Design_Diagram_9_Diagrams_FINAL.docx`** — System Design document specifying the 9 formal architectural representations: System Architecture, Flowchart, Use Case Diagram, ERD, DFD Level 0/1, Sequence Diagram, Component Diagram, Activity Diagram, and Deployment Diagram.

### Explicit Documented Requirements vs. Implementation Decisions

To maintain strict architectural discipline, requirements are categorized into:
- **Explicit Requirements (Authoritative & Non-Negotiable):**
  - Physical sensing of four parameters: pH, Turbidity, TDS, and Temperature.
  - Microcontroller: ESP32-S3 with integrated Wi-Fi, powered via regulated mains adapter.
  - Transmission protocol: HTTP/JSON over standard Wi-Fi.
  - Core Stack: MongoDB (with Mongoose), Express.js, React (Vite), Node.js (MERN), Tailwind CSS, Recharts, Leaflet with OpenStreetMap.
  - Authentication: JWT, bcrypt password hashing, and Role-Based Access Control (Admin vs. Citizen).
  - Scope: Single prototype sensor node (`Node 1, Ward 12, Indore`).
  - Alerting: Dynamic threshold evaluation triggering dashboard alerts and automated SMS notifications to municipal authorities and registered residents.
  - Reporting: Historical readings, alert logs, and CSV/report export as specified by SRS FR-16 (PDF generation is not a mandatory requirement).
  - AI Screening: Water photograph upload returning safe/unsafe classification, confidence value, and non-water rejection with an advisory note.
  - Explicit Out-of-Scope: Multi-node network, LoRaWAN, solar/battery operation, edge/TinyML inference, mobile apps, WhatsApp integration, and microbial/heavy-metal chemical sensing.

- **Implementation Decisions (Formalized in this Plan & `IMPLEMENTATION_DECISIONS.md`):**
  - Specific framework runtime and package patch versions (Node.js 20 LTS, React 18, Vite 5, Tailwind CSS 3.4) are recommended stable choices, not rigid document mandates.
  - Threshold baseline bounds (proposed initial seed defaults: pH 6.5–8.5, turbidity 0–5 NTU, TDS 0–500 ppm, temperature 10–40°C) are provisional seed defaults subject to confirmation; **thresholds remain fully configurable by the Administrator** as required by FR-06 and FR-15.
  - Alert de-duplication / debounce suppression window (proposed default: 15 minutes) is a configurable implementation choice rather than an authoritative requirement.
  - Implementation of **Google OAuth 2.0** integrated alongside local JWT.
  - Live data delivery via **Smart HTTP Polling (15s interval, configurable)** instead of persistent WebSockets.
  - AI Image Screening implemented via **Hosted Vision API (Gemini Vision)** with pluggable abstraction.
  - SMS notification implemented via a **Pluggable SMS Gateway Adapter** (Twilio / Fast2SMS / Dev Logger).
  - Strict **Software-First sequencing**: full software verification using simulated sensor payloads before physical hardware wiring.

---

## 1. Project Requirements Breakdown

### 1.1 Objective & Context
Conventional water testing relies on periodic manual sampling and delayed laboratory analysis, allowing municipal contamination leaks to reach taps unnoticed. JalDrishti closes this detection-to-response gap through:
- Continuous, unattended multi-parameter telemetry.
- Instant cloud-based threshold violation detection.
- Multi-channel notification (administrative dashboard + resident SMS).
- Transparent citizen public safety views and accessible AI-based photo screening.

### 1.2 User Roles & Permissions
1. **Administrator (Municipal / Technical Authority):**
   - Full system visibility: live telemetry, historical charts, audit logs.
   - Threshold management: configure min/max safe operational bounds for all parameters.
   - Alert management: review, acknowledge, and resolve alerts.
   - Notification dispatch: manage SMS recipient phone directories.
   - Geospatial management: review and maintain sensor node location metadata.
   - Data export: generate and download comprehensive CSV/report analytical exports as specified in FR-16.
2. **Citizen (Resident / Consumer):**
   - Public water safety visibility: plain-language safety status banner (Green/Amber/Red).
   - Current telemetry & trends: review live readings, parameter ranges, and node location on map.
   - AI water screening: upload tap water images for instant visual clarity assessment and advisory guidance.
   - Alert feed: view recent community alerts.

### 1.3 Functional Requirements Matrix (FR-01 to FR-16)
- **FR-01 (Authentication):** Secure registration, login, and JWT-based session management for Admin and Citizen roles, supplemented by Google OAuth 2.0.
- **FR-02 (Sensor Acquisition):** Continuous sampling of pH, turbidity, TDS, and temperature from ESP32-S3.
- **FR-03 (Data Transmission):** Encrypted/authenticated HTTP/JSON transmission over Wi-Fi.
- **FR-04 (Payload Validation):** Strict server-side schema verification rejecting malformed, non-numeric, or missing metrics.
- **FR-05 (Storage):** Persistent, indexed time-series data storage in MongoDB.
- **FR-06 (Thresholds):** Dynamic comparison against administrative safe-range limits.
- **FR-07 (Alerts):** Instant generation of alert records upon parameter breach.
- **FR-08 (SMS Notifications):** Automated SMS dispatch to registered residents and municipal personnel.
- **FR-09 (Dashboard):** Responsive web interface displaying all 4 parameters with status tags.
- **FR-10 (Trends):** Historical time-series visualizations with marked safe limit threshold overlays.
- **FR-11 (Alert History):** Paginated, filterable alert log with severity tags and acknowledgment buttons.
- **FR-12 (Map):** Interactive Leaflet/OpenStreetMap display of the active prototype node.
- **FR-13 (Image Upload):** Secure citizen photo upload with mime-type and payload size validation.
- **FR-14 (AI Screening):** Automated visual clarity classification (Safe/Unsafe), confidence score, and disclaimer.
- **FR-15 (Admin Configuration):** Administrative UI for editing threshold ranges and recipient phone numbers.
- **FR-16 (Reporting):** Server-side CSV report export for historical telemetry and incident logs.

### 1.4 Non-Functional Requirements (NFR-01 to NFR-08)
- **NFR-01 (Performance):** Low end-to-end latency (< 5 seconds from ingestion to dashboard/SMS dispatch). Fast query execution via indexed fields.
- **NFR-02 (Security):** Bcrypt password hashing (cost factor 10), signed JWTs, sanitized inputs, rate limiting, and device API keys.
- **NFR-03 (Usability):** Intuitive three-color semantic status hierarchy (Safe = Green, Caution = Amber, Unsafe = Red) and plain-language citizen descriptions.
- **NFR-04 (Reliability):** Resilience against network dropped packets, validation rejection of bad data, and sensor calibration standards.
- **NFR-05 (Maintainability):** Modular MERN architecture, strict separation of concerns, component-driven UI, and version-controlled codebase.
- **NFR-06 (Responsiveness):** Fluid responsive layout across mobile, tablet, and desktop viewports.
- **NFR-07 (Scalability):** Single-node prototype implementation architected with clean entity abstractions ready for multi-node expansion.
- **NFR-08 (Data Integrity):** Consistent relational links between readings, alerts, notifications, and users.

---

## 2. Technology Stack & Runtime Plan

> [!IMPORTANT]
> **Authoritative Stack vs. Version Selection:**  
> The approved core technologies (React, Vite, Tailwind CSS, Recharts, Leaflet, OpenStreetMap, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, ESP32-S3) are mandatory as specified by the SRS and Synopsis. All specific package/library patch versions listed in the table below (e.g., React `^18.3.1`, Vite `^5.3.0`, Tailwind `^3.4.4`, Node.js `v20 LTS`, Mongoose `^8.4.1`) represent **recommended stable, mutually compatible implementation choices**, NOT authoritative document requirements.

| Layer | Approved Technology | Recommended Version (Implementation Choice) | Specification Rationale |
|:---|:---|:---:|:---|
| **Frontend Framework** | React | `^18.3.1` (Recommended) | Declarative UI, component-driven, large ecosystem |
| **Frontend Build Tool** | Vite | `^5.3.0` (Recommended) | Ultra-fast HMR and optimized bundling |
| **CSS / Styling** | Tailwind CSS | `^3.4.4` (Recommended) | Utility-first, zero stylesheet bloat, design token consistency |
| **Data Visualization** | Recharts | `^2.12.7` (Recommended) | Native React SVG chart library supporting reference lines |
| **Geospatial Mapping** | Leaflet + React-Leaflet | `^1.9.4` / `^4.2.1` (Recommended) | Lightweight, open-source OpenStreetMap integration |
| **Frontend Auth Client** | `@react-oauth/google` | `^0.12.1` (Recommended) | Official Google OAuth 2.0 component library |
| **Icons & UI Utilities** | Lucide React | `^0.395.0` (Recommended) | Clean, modern feather-style SVG iconography |
| **Backend Runtime** | Node.js | `v20 LTS` (Recommended) | Stable long-term enterprise runtime |
| **Backend Framework** | Express.js | `^4.19.2` (Recommended) | Robust, minimalist REST API routing and middleware pipeline |
| **Database Engine** | MongoDB Community / Atlas | `v7.0+` (Recommended) | Scalable document store optimized for JSON telemetry |
| **ODM Layer** | Mongoose | `^8.4.1` (Recommended) | Strict schema validation, middleware hooks, and typed querying |
| **Authentication & Tokens** | `jsonwebtoken` + `bcryptjs` | `^9.0.2` / `^2.4.3` (Recommended) | Standard stateless bearer tokens and strong salt hashing |
| **Google Auth Verification** | `google-auth-library` | `^9.10.0` (Recommended) | Secure backend verification of Google OAuth tokens |
| **Security Middleware** | `helmet`, `cors`, `express-rate-limit` | Latest stable (Recommended) | HTTP header hardening, CORS whitelist, DDoS/brute-force defense |
| **Input Validation** | `zod` or `joi` | `^3.23.8` (Recommended) | Rigid schema validation for API payloads |
| **File Upload Handling** | `multer` | `^1.4.5-lts.1` (Recommended) | Memory-buffered secure image upload processing |
| **AI Vision Client** | `@google/genai` (Gemini API) | Latest stable (Recommended) | Advanced multimodal image screening |
| **SMS Notification** | Pluggable (Twilio SDK / Axios Fast2SMS) | Stable (Recommended) | Multi-provider SMS dispatch adapter |
| **CSV Export Engine** | `json2csv` | `^6.0.0` (Recommended) | Streaming memory-safe tabular export |
| **Microcontroller Hardware** | ESP32-S3 | Dual-core 240MHz (Hardware) | High-performance MCU with native 2.4GHz Wi-Fi |
| **Firmware Platform** | Arduino Framework for ESP32 | `^2.0.14` (Recommended) | Reliable C++ hardware drivers and JSON serialization |

---

## 3. Complete Modular Project Architecture

The repository enforces strict separation between client applications, server micro-layers, firmware code, and test automation. Monolithic files and mixed responsibilities are strictly prohibited.

```
JalDrishti/
├── .github/
│   └── workflows/
│       └── ci.yml                   # Automated testing and linting workflow
├── docs/
│   ├── IMPLEMENTATION_PLAN.md       # Master roadmap & architectural blueprint
│   ├── IMPLEMENTATION_DECISIONS.md  # Architectural decision log (ADR)
│   ├── IMPLEMENTATION_PROGRESS.md   # Tracking progress & test verification
│   └── api/
│       └── openapi.yaml             # REST API OpenAPI / Swagger specification
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection handler & listeners
│   │   │   ├── env.js               # Centralized, validated environment variables
│   │   │   ├── passport.js          # Google OAuth strategies (if applicable)
│   │   │   └── constants.js         # Default thresholds, roles, and status codes
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, Google OAuth callbacks
│   │   │   ├── sensorController.js  # Telemetry ingestion & latest reading query
│   │   │   ├── alertController.js   # Alert history query & acknowledgment
│   │   │   ├── thresholdController.js # Threshold configuration CRUD
│   │   │   ├── recipientController.js # SMS recipient management CRUD
│   │   │   ├── imageController.js   # Water image upload & AI screening
│   │   │   └── reportController.js  # CSV & summary data export
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification & user attachment
│   │   │   ├── roleMiddleware.js    # RBAC permission check (Admin vs. Citizen)
│   │   │   ├── deviceAuthMiddleware.js # IoT API key verification (x-device-key)
│   │   │   ├── errorMiddleware.js   # Centralized error handler & status mapper
│   │   │   ├── rateLimiter.js       # Route-specific rate limiters
│   │   │   └── uploadMiddleware.js  # Multer configuration (image mime & size filter)
│   │   ├── models/
│   │   │   ├── User.js              # User account schema (Admin/Citizen)
│   │   │   ├── SensorNode.js        # Prototype node identity & coordinates
│   │   │   ├── Reading.js           # Time-series telemetry record
│   │   │   ├── Threshold.js         # Safe min/max boundaries per parameter
│   │   │   ├── Alert.js             # Active and historical breach incidents
│   │   │   ├── Notification.js      # Dispatched SMS/dashboard notification log
│   │   │   └── ImageCheck.js        # AI photo screening record with advisory
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth endpoints
│   │   │   ├── sensorRoutes.js      # /api/sensors endpoints
│   │   │   ├── alertRoutes.js       # /api/alerts endpoints
│   │   │   ├── thresholdRoutes.js   # /api/thresholds endpoints
│   │   │   ├── recipientRoutes.js   # /api/recipients endpoints
│   │   │   ├── imageRoutes.js       # /api/image-check endpoints
│   │   │   └── reportRoutes.js      # /api/reports endpoints
│   │   ├── services/
│   │   │   ├── thresholdEngine.js   # Reading evaluation & classification logic
│   │   │   ├── alertService.js      # Incident creation & debounce suppression
│   │   │   ├── smsService.js        # Pluggable SMS gateway provider abstraction
│   │   │   └── aiScreeningService.js # Multimodal AI vision screening engine
│   │   ├── utils/
│   │   │   ├── logger.js            # Structured logger (Console / Winston)
│   │   │   └── validators.js        # Request payload schema validators
│   │   └── app.js                   # Express application setup & middleware assembly
│   ├── server.js                    # Server bootstrap & port listener
│   ├── package.json                 # Backend dependencies & npm scripts
│   └── tests/
│       ├── unit/                    # Threshold engine & validation tests
│       └── integration/             # REST endpoint & auth flow tests
├── frontend/
│   ├── public/
│   │   └── favicon.ico              # App favicon
│   ├── src/
│   │   ├── assets/
│   │   │   ├── icons/               # SVG icon assets
│   │   │   └── images/              # Logos and illustration assets
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx       # Standard reusable button with loading state
│   │   │   │   ├── Card.jsx         # Surface container with elevation/border
│   │   │   │   ├── Badge.jsx        # Semantic status badge (Safe/Caution/Unsafe)
│   │   │   │   ├── Modal.jsx        # Accessible dialog wrapper
│   │   │   │   ├── Input.jsx        # Form input field with validation message
│   │   │   │   ├── AlertBanner.jsx  # Notification banner for critical events
│   │   │   │   └── Spinner.jsx      # Animated SVG loading spinner
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx    # Email/password form
│   │   │   │   ├── SignupForm.jsx   # Registration form
│   │   │   │   └── GoogleLoginBtn.jsx # Google OAuth 2.0 trigger
│   │   │   ├── dashboard/
│   │   │   │   ├── ParameterCard.jsx # Live telemetry metric card (pH/TDS/etc.)
│   │   │   │   ├── StatusBanner.jsx # Top plain-language safety banner
│   │   │   │   ├── LatestReadingsTable.jsx # Recent tabular telemetry view
│   │   │   │   └── NodeStatusBadge.jsx # Hardware connectivity & last updated indicator
│   │   │   ├── charts/
│   │   │   │   ├── TrendLineChart.jsx # Multi-parameter time-series chart
│   │   │   │   ├── ParameterChart.jsx # Single parameter chart with safe zone line
│   │   │   │   └── ChartTimeFilter.jsx # 24 Hours / 7 Days / 30 Days toggle
│   │   │   ├── alerts/
│   │   │   │   ├── AlertList.jsx    # Paginated feed of active/past alerts
│   │   │   │   ├── AlertItem.jsx    # Individual alert row with severity badge
│   │   │   │   └── AcknowledgeModal.jsx # Administrative acknowledgment dialog
│   │   │   ├── map/
│   │   │   │   ├── NodeMap.jsx      # Leaflet map container with OSM tiles
│   │   │   │   └── NodeMarker.jsx   # Custom status pin with popup summary
│   │   │   ├── image-check/
│   │   │   │   ├── ImageUploader.jsx # Drag-and-drop file upload zone
│   │   │   │   ├── ImagePreview.jsx # Uploaded image thumbnail preview
│   │   │   │   ├── ScreeningResult.jsx # Safe/Unsafe badge with confidence gauge
│   │   │   │   └── AdvisoryDisclaimer.jsx # Mandatory health advisory note
│   │   │   ├── admin/
│   │   │   │   ├── ThresholdForm.jsx # Threshold edit form (min/max bounds)
│   │   │   │   ├── RecipientManager.jsx # SMS subscriber CRUD table
│   │   │   │   └── ReportDownloader.jsx # CSV export date filter & button
│   │   │   └── citizen/
│   │   │       ├── CitizenSummary.jsx # Citizen plain-language status card
│   │   │       └── CitizenAlertFeed.jsx # Simplified community alert notices
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # User profile, role, token, login/logout
│   │   │   ├── SensorContext.jsx    # Live readings, historical cache, polling
│   │   │   └── AlertContext.jsx     # Active alerts, unread counts, ack handler
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # AuthContext consumer hook
│   │   │   ├── useLiveReadings.js   # Smart polling manager for live telemetry
│   │   │   ├── useTrends.js         # Historical data fetcher with range filters
│   │   │   └── useAlerts.js         # Alert feed and acknowledgment hooks
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx       # App shell with Sidebar, Header, Content
│   │   │   ├── Sidebar.jsx          # Role-aware navigation drawer
│   │   │   ├── Header.jsx           # Top navigation bar with user profile
│   │   │   └── ProtectedRoute.jsx   # Route guard checking JWT and required role
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login & Google OAuth page
│   │   │   ├── SignupPage.jsx       # Citizen registration page
│   │   │   ├── AdminDashboard.jsx   # Administrator control center
│   │   │   ├── CitizenDashboard.jsx # Citizen community portal
│   │   │   ├── TrendsPage.jsx       # Dedicated historical trends & analytics
│   │   │   ├── AlertsPage.jsx       # Comprehensive alert management page
│   │   │   ├── MapPage.jsx          # Full-screen geospatial node map
│   │   │   ├── ImageCheckPage.jsx   # AI photo screening tool
│   │   │   ├── SettingsPage.jsx     # Admin threshold & recipient settings
│   │   │   └── NotFoundPage.jsx     # 404 error page
│   │   ├── services/
│   │   │   ├── api.js               # Central Axios instance with interceptors
│   │   │   ├── authService.js       # Auth API client
│   │   │   ├── sensorService.js     # Telemetry API client
│   │   │   ├── alertService.js      # Alert API client
│   │   │   ├── configService.js     # Threshold & recipient API client
│   │   │   └── imageService.js      # Multipart image upload API client
│   │   ├── styles/
│   │   │   └── index.css            # Base Tailwind imports & custom variables
│   │   ├── utils/
│   │   │   ├── formatters.js        # Date, time, and numeric formatters
│   │   │   └── statusHelpers.js     # Color and label resolver for status levels
│   │   ├── App.jsx                  # React Router configuration & provider wrapping
│   │   └── main.jsx                 # Client entry point
│   ├── tailwind.config.js           # Tailwind theme tokens & color definitions
│   ├── vite.config.js               # Vite bundler configuration & proxy setup
│   └── package.json                 # Frontend dependencies & npm scripts
├── firmware/
│   └── esp32_sensor_node/
│       ├── include/
│       │   ├── config.h             # Wi-Fi credentials, backend URL, device key
│       │   ├── sensor_pins.h        # GPIO pin assignments
│       │   └── calibration.h       # Sensor calibration coefficients
│       ├── src/
│       │   ├── main.cpp             # Arduino setup() and loop() orchestration
│       │   ├── sensors.cpp          # ADC reading, filtering & conversion logic
│       │   ├── network.cpp          # Wi-Fi connection & auto-reconnect handling
│       │   └── http_client.cpp      # JSON payload serialization & HTTP POST
│       └── platformio.ini           # PlatformIO / Arduino build configuration
├── scripts/
│   ├── simulate_sensors.js          # Realistic telemetry payload simulator
│   ├── seed_database.js             # Initial threshold, user, and node seeder
│   └── run_system_audit.js          # Security and lint validation runner
└── .gitignore                       # Repository ignore rules
```

---

## 4. Frontend Component & CSS Architecture

### 4.1 Strict Component Rules
- **No Monoliths:** No single component file shall exceed 250 lines of code.
- **Single Responsibility:** UI presentation is decoupled from API networking; data fetching is encapsulated in custom hooks (`hooks/`) and service modules (`services/`).
- **Clean Props Contracts:** Components use standardized props interfaces and avoid prop-drilling by leveraging domain contexts.

### 4.2 Styling & Theme Architecture (Tailwind CSS)
The design system reflects the specifications outlined in the project synopsis wireframe (Synopsis Fig 4 & SRS GUI Section 9):
- **Base Font:** Inter / sans-serif with crisp legibility.
- **Primary Color:** Oceanic Blue (`#0284c7` / `#0369a1`), conveying municipal water safety.
- **Three-Tier Semantic Status Hierarchy:**
  - **Safe (Normal):** Emerald Green (`bg-emerald-50`, `text-emerald-700`, `border-emerald-300`, badge `bg-emerald-500`).
  - **Caution (Warning / Boundary):** Amber (`bg-amber-50`, `text-amber-700`, `border-amber-300`, badge `bg-amber-500`).
  - **Unsafe (Breach / Danger):** Rose Red (`bg-rose-50`, `text-rose-700`, `border-rose-300`, badge `bg-rose-500`).
- **Surface Elevation:** Clean white cards (`bg-white dark:bg-slate-900`) with subtle borders (`border-slate-200 dark:border-slate-800`) and soft shadows (`shadow-sm`).
- **Responsive Layout:** Mobile-first design adapting fluidly from single-column mobile viewports (`< 640px`) to multi-pane dashboard grids (`>= 1024px`).

### 4.3 Feature-by-Feature Frontend Specifications

| Feature ID | Feature Name | Primary Page | Sub-Components | Data Flow & API Call | Validation & States |
|:---|:---|:---|:---|:---|:---|
| **FE-01** | User Login | `LoginPage.jsx` | `LoginForm.jsx`, `GoogleLoginBtn.jsx` | `POST /api/auth/login` or `POST /api/auth/google` | Email format check; password length >= 6; loading spinner; error banner on invalid credentials |
| **FE-02** | User Registration | `SignupPage.jsx` | `SignupForm.jsx` | `POST /api/auth/register` | Password confirmation match; role defaults to `Citizen`; loading state |
| **FE-03** | Google OAuth | `LoginPage.jsx` | `GoogleLoginBtn.jsx` | `@react-oauth/google` -> ID Token -> `POST /api/auth/google` | OAuth popup handling; fallback error toast if popup is blocked |
| **FE-04** | Live Dashboard | `AdminDashboard.jsx`, `CitizenDashboard.jsx` | `ParameterCard.jsx`, `StatusBanner.jsx`, `NodeStatusBadge.jsx` | `useLiveReadings()` polling `GET /api/sensors/latest` every 15s | Displays "Connecting...", "Online", or "Offline"; renders shimmer skeleton cards while loading |
| **FE-05** | Parameter Cards | Embedded in Dashboard | `ParameterCard.jsx` (pH, Turbidity, TDS, Temp) | Receives metric object from `SensorContext` | Visual indicators: Icon, value, units, status badge, safe boundary range (`6.5 - 8.5`) |
| **FE-06** | Overall Status Banner | Embedded in Dashboard | `StatusBanner.jsx` | Derived from parameter states (worst-case evaluation) | Plain-language citizen text: "Water is safe for standard municipal usage" or "Caution advised" |
| **FE-07** | Water Quality Trends | `TrendsPage.jsx` | `TrendLineChart.jsx`, `ChartTimeFilter.jsx` | `GET /api/sensors/history?range=24h` | Time toggle (24h/7d/30d); Recharts responsive container; safe limit reference line overlay |
| **FE-08** | Alerts Feed | `AlertsPage.jsx` | `AlertList.jsx`, `AlertItem.jsx` | `GET /api/alerts?status=active` | Color-coded severity badge (High/Medium/Info); relative timestamp ("5 mins ago") |
| **FE-09** | Alert Acknowledgment | `AlertsPage.jsx` | `AcknowledgeModal.jsx` | `PATCH /api/alerts/:id/ack` | Restricted to Admin; confirmation prompt; updates status from `Active` to `Acknowledged` |
| **FE-10** | Geospatial Node Map | `MapPage.jsx` | `NodeMap.jsx`, `NodeMarker.jsx` | `GET /api/sensors/node` | Interactive Leaflet map centered at `[22.7196, 75.8577]` (Indore); popup with node telemetry |
| **FE-11** | AI Image Screening | `ImageCheckPage.jsx` | `ImageUploader.jsx`, `ScreeningResult.jsx`, `AdvisoryDisclaimer.jsx` | `POST /api/image-check` (multipart) | Client-side size (< 5MB) and mime check (`image/jpeg, image/png`); confidence meter; red disclaimer banner |
| **FE-12** | Threshold Settings | `SettingsPage.jsx` | `ThresholdForm.jsx` | `GET /api/thresholds`, `PUT /api/thresholds/:id` | Restricted to Admin; validates `minimum < maximum`; numeric bounds validation; toast on success |
| **FE-13** | SMS Recipient Mgmt | `SettingsPage.jsx` | `RecipientManager.jsx` | `GET /api/recipients`, `POST /api/recipients`, `DELETE /api/recipients/:id` | Restricted to Admin; 10-digit Indian phone regex (`^[6-9]\d{9}$`); prevents duplicate entries |
| **FE-14** | Reporting & Export | `SettingsPage.jsx` | `ReportDownloader.jsx` | `GET /api/reports/readings/csv?startDate=...` | Restricted to Admin; triggers direct browser download of `.csv` file; progress spinner |

---

## 5. Backend Architecture & REST API Specification

### 5.1 Architecture & Layer Responsibilities
- **Config Layer (`src/config/`):** Validates required environment variables upon startup (fails fast if `JWT_SECRET` or `MONGO_URI` is missing).
- **Routing Layer (`src/routes/`):** Defines clean resource URIs and binds route-specific middleware.
- **Middleware Layer (`src/middleware/`):** Executes authentication (`verifyToken`), RBAC verification (`requireRole`), IoT device authentication (`verifyDeviceKey`), and input validation.
- **Controller Layer (`src/controllers/`):** Orchestrates HTTP requests, extracts parameters, delegates to domain services, and formats JSON responses.
- **Service Layer (`src/services/`):** Encapsulates core business logic: threshold evaluation, alert de-duplication, SMS dispatch, and AI inference.
- **Model Layer (`src/models/`):** Defines Mongoose schemas, types, validation rules, and indexes.

### 5.2 Complete REST API Endpoints Specification

| Method | Endpoint | Access Role | Description | Request Body / Parameters | Success Response | Error Codes |
|:---|:---|:---:|:---|:---|:---|:---:|
| **POST** | `/api/auth/register` | Public | Register new Citizen account | `{ name, email, password }` | `201 Created` `{ user, token }` | 400, 409 |
| **POST** | `/api/auth/login` | Public | Authenticate email & password | `{ email, password }` | `200 OK` `{ user, token }` | 400, 401 |
| **POST** | `/api/auth/google` | Public | Authenticate Google ID token | `{ credential }` (Google JWT) | `200 OK` `{ user, token }` | 400, 401 |
| **GET** | `/api/auth/me` | Authenticated | Retrieve current session profile | *None* | `200 OK` `{ user }` | 401 |
| **POST** | `/api/sensors/reading` | Device (`x-device-key`) | Ingest ESP32-S3 sensor data | `{ nodeId, pH, turbidity, tds, temperature }` | `201 Created` `{ readingId, status }` | 400, 401 |
| **GET** | `/api/sensors/latest` | Authenticated | Fetch latest reading & node status | *None* | `200 OK` `{ reading, status, timestamp }` | 401, 404 |
| **GET** | `/api/sensors/history` | Authenticated | Fetch historical time-series data | Query: `range=24h\|7d\|30d` | `200 OK` `[ { timestamp, pH, ... } ]` | 400, 401 |
| **GET** | `/api/sensors/node` | Authenticated | Fetch prototype node metadata | *None* | `200 OK` `{ nodeId, location, status }` | 401 |
| **GET** | `/api/thresholds` | Authenticated | Retrieve safe range thresholds | *None* | `200 OK` `[ { parameter, min, max } ]` | 401 |
| **PUT** | `/api/thresholds/:parameter` | Admin Only | Update parameter safe limits | `{ minimum, maximum }` | `200 OK` `{ updatedThreshold }` | 400, 401, 403 |
| **GET** | `/api/alerts` | Authenticated | List alerts (active/historical) | Query: `status=active\|all` | `200 OK` `[ { alertId, severity, ... } ]` | 401 |
| **PATCH**| `/api/alerts/:id/ack` | Admin Only | Acknowledge active incident | `{ note }` (optional) | `200 OK` `{ alertId, status: 'Acknowledged' }` | 401, 403, 404 |
| **GET** | `/api/recipients` | Admin Only | List SMS alert recipients | *None* | `200 OK` `[ { name, phone, active } ]` | 401, 403 |
| **POST** | `/api/recipients` | Admin Only | Register new SMS recipient | `{ name, phone }` | `201 Created` `{ recipient }` | 400, 401, 403, 409 |
| **DELETE**| `/api/recipients/:id` | Admin Only | Remove SMS recipient | *None* | `200 OK` `{ message: 'Deleted' }` | 401, 403, 404 |
| **POST** | `/api/image-check` | Authenticated | Upload water photo for AI check | Multipart: `file` | `200 OK` `{ result, confidence, advisory }`| 400, 401, 413, 422 |
| **GET** | `/api/reports/readings/csv`| Admin Only | Stream sensor history as CSV | Query: `startDate, endDate` | `200 OK` (File: `readings_report.csv`) | 400, 401, 403 |
| **GET** | `/api/reports/alerts/csv` | Admin Only | Stream alert incident log as CSV | Query: `startDate, endDate` | `200 OK` (File: `alerts_report.csv`) | 400, 401, 403 |

---

## 6. Database Design & Logical Data Models

The database design implements the 7 core entities established in the SRS Section 8 and Synopsis Section 5.4.

### 6.1 Entity Schemas & Indexing Plan

#### 1. `User` Collection
- `_id`: `ObjectId` (Primary Key)
- `name`: `String` (Required, trim, max 60 chars)
- `email`: `String` (Required, unique, lowercase, indexed)
- `passwordHash`: `String` (Required for local users; null for pure Google users)
- `googleId`: `String` (Optional, indexed, sparse)
- `role`: `String` (Required, Enum: `['Admin', 'Citizen']`, default: `'Citizen'`)
- `phone`: `String` (Optional, for citizen SMS alerts)
- `createdAt` / `updatedAt`: `Date` (Timestamps)
*Indexes:* `{ email: 1 }` (unique), `{ googleId: 1 }` (sparse).

#### 2. `SensorNode` Collection
- `_id`: `ObjectId` (Primary Key)
- `nodeId`: `String` (Required, unique, e.g., `'NODE-01-INDORE-WARD12'`)
- `name`: `String` (Required, e.g., `'Bhagirathpura Supply Point 1'`)
- `location`:
  - `latitude`: `Number` (Required, e.g., `22.7196`)
  - `longitude`: `Number` (Required, e.g., `75.8577`)
  - `address`: `String` (e.g., `'Ward 12, Indore, MP'`)
- `deviceKeyHash`: `String` (Required, bcrypt hash of the secret IoT API key)
- `status`: `String` (Enum: `['Online', 'Offline', 'Maintenance']`, default: `'Online'`)
- `lastSeen`: `Date` (Updated upon valid telemetry receipt)
*Indexes:* `{ nodeId: 1 }` (unique).

#### 3. `Reading` Collection
- `_id`: `ObjectId` (Primary Key)
- `nodeId`: `String` (Required, Ref: `SensorNode.nodeId`)
- `pH`: `Number` (Required, min: `0.0`, max: `14.0`)
- `turbidity`: `Number` (Required, min: `0.0`, NTU)
- `tds`: `Number` (Required, min: `0.0`, ppm)
- `temperature`: `Number` (Required, min: `-10.0`, max: `80.0`, °C)
- `overallStatus`: `String` (Enum: `['Safe', 'Caution', 'Unsafe']`)
- `timestamp`: `Date` (Required, default: `Date.now`, indexed)
*Indexes:* Compound Index `{ nodeId: 1, timestamp: -1 }` (ensures sub-millisecond retrieval of the latest reading and time-window queries).

#### 4. `Threshold` Collection
- `_id`: `ObjectId` (Primary Key)
- `parameter`: `String` (Required, unique, Enum: `['pH', 'turbidity', 'tds', 'temperature']`)
- `minimum`: `Number` (Required, lower safe limit)
- `maximum`: `Number` (Required, upper safe limit)
- `unit`: `String` (e.g., `'pH'`, `'NTU'`, `'ppm'`, `'°C'`)
- `updatedBy`: `ObjectId` (Ref: `User`, Administrator who modified the limit)
- `updatedAt`: `Date` (Timestamp)
*Proposed Initial Seed Values (Implementation Decision / Subject to Confirmation):*
> [!NOTE]
> Specific numerical threshold bounds (e.g., pH 6.5–8.5, turbidity 0–5 NTU, TDS 0–500 ppm, temperature 10–40°C) are proposed initial seed defaults (derived from wireframe labels and standard drinking water references). In strict accordance with SRS requirements FR-06 and FR-15, **all thresholds remain dynamically configurable by the Administrator** through the UI and are not treated as hardcoded requirements.
  - `pH`: `min: 6.5`, `max: 8.5`, unit: `pH` (Proposed seed default)
  - `turbidity`: `min: 0.0`, `max: 5.0`, unit: `NTU` (Proposed seed default)
  - `tds`: `min: 0.0`, `max: 500.0`, unit: `ppm` (Proposed seed default)
  - `temperature`: `min: 10.0`, `max: 40.0`, unit: `°C` (Proposed seed default)
*Indexes:* `{ parameter: 1 }` (unique).

#### 5. `Alert` Collection
- `_id`: `ObjectId` (Primary Key)
- `nodeId`: `String` (Required, Ref: `SensorNode.nodeId`)
- `readingId`: `ObjectId` (Required, Ref: `Reading`)
- `parameter`: `String` (Required, the parameter in breach, e.g., `'pH'`)
- `value`: `Number` (The measured breach value, e.g., `9.1`)
- `thresholdLimit`: `Number` (The breached threshold limit, e.g., `8.5`)
- `severity`: `String` (Required, Enum: `['High', 'Medium', 'Info']`)
- `status`: `String` (Enum: `['Active', 'Acknowledged', 'Resolved']`, default: `'Active'`)
- `acknowledgedBy`: `ObjectId` (Optional, Ref: `User`)
- `acknowledgedAt`: `Date` (Optional)
- `timestamp`: `Date` (Required, default: `Date.now`, indexed)
*Indexes:* `{ status: 1, timestamp: -1 }`.

#### 6. `Notification` Collection
- `_id`: `ObjectId` (Primary Key)
- `alertId`: `ObjectId` (Required, Ref: `Alert`)
- `recipient`: `String` (Phone number or email address)
- `channel`: `String` (Enum: `['SMS', 'Dashboard']`, default: `'SMS'`)
- `message`: `String` (The dispatched alert text)
- `deliveryStatus`: `String` (Enum: `['Delivered', 'Failed', 'Pending', 'Simulated']`)
- `gatewayResponseId`: `String` (SMS provider transaction reference)
- `timestamp`: `Date` (Default: `Date.now`)
*Indexes:* `{ alertId: 1 }`, `{ timestamp: -1 }`.

#### 7. `ImageCheck` Collection
- `_id`: `ObjectId` (Primary Key)
- `userId`: `ObjectId` (Required, Ref: `User`)
- `imagePath`: `String` (Stored relative path or cloud storage reference)
- `result`: `String` (Required, Enum: `['Safe', 'Unsafe', 'Rejected']`)
- `confidence`: `Number` (Percentage value `0.0` to `100.0`)
- `advisory`: `String` (Required, plain-language advisory note)
- `isWaterImage`: `Boolean` (True if the model detected a valid water container/sample)
- `timestamp`: `Date` (Default: `Date.now`)
*Indexes:* `{ userId: 1, timestamp: -1 }`.

---

## 7. Authentication & Authorization Plan

### 7.1 Local Authentication Pipeline
1. **Registration:** Citizen submits `{ name, email, password }`. Backend validates format, hashes password via `bcryptjs.hash(password, 10)`, creates user with role `Citizen`, and issues a signed JWT.
2. **Login:** User submits `{ email, password }`. Backend retrieves user, verifies with `bcryptjs.compare()`, generates JWT containing `{ userId, email, role }` valid for 24 hours, and returns profile payload.
3. **Session Verification:** Protected endpoints pass `Authorization: Bearer <token>`. Middleware `verifyToken` decodes the token, verifies cryptographic signature, checks user existence in MongoDB, and attaches `req.user`.

### 7.2 Google OAuth 2.0 Integration
1. **Frontend Initiation:** User clicks "Sign in with Google" rendered via `@react-oauth/google`.
2. **Credential Response:** Google returns a signed ID token (`credential`) to the browser client.
3. **Backend Verification:** Frontend sends `{ credential }` via `POST /api/auth/google`.
4. **Validation via `google-auth-library`:**
   ```javascript
   const ticket = await client.verifyIdToken({
     idToken: credential,
     audience: process.env.GOOGLE_CLIENT_ID
   });
   const { sub: googleId, email, name } = ticket.getPayload();
   ```
5. **Account Linking & Provisioning:**
   - If user exists with matching `googleId` -> authenticate and issue JalDrishti JWT.
   - If user exists with matching `email` -> link `googleId` to existing record and issue JWT.
   - If user is new -> create user `{ name, email, googleId, role: 'Citizen' }` and issue JWT.
6. **Role Guarding:** Google accounts default to `Citizen`. Administrative roles must be designated explicitly in the database by an existing administrator.

### 7.3 Authorization & Role-Based Access Control (RBAC) Matrix

| Operational Capability | Public / Guest | Citizen Role | Administrator Role | Backend Enforcement Middleware |
|:---|:---:|:---:|:---:|:---|
| View Public Welcome & About | Allowed | Allowed | Allowed | None (Static routes) |
| Sign Up / Local Login / Google Login | Allowed | Allowed | Allowed | None (Public API) |
| View Live Telemetry Dashboard | Denied | **Allowed** | **Allowed** | `verifyToken` |
| View Historical Trends & Safe Limits | Denied | **Allowed** | **Allowed** | `verifyToken` |
| View Prototype Node Map Location | Denied | **Allowed** | **Allowed** | `verifyToken` |
| Upload Water Photo for AI Check | Denied | **Allowed** | **Allowed** | `verifyToken` |
| View Public Safety Status Banner | Denied | **Allowed** | **Allowed** | `verifyToken` |
| View Alert Incident History | Denied | **Allowed** | **Allowed** | `verifyToken` |
| **Acknowledge / Clear Alerts** | Denied | **Denied** | **Allowed** | `verifyToken, requireRole(['Admin'])` |
| **Modify Safe Parameter Thresholds** | Denied | **Denied** | **Allowed** | `verifyToken, requireRole(['Admin'])` |
| **Add / Delete SMS Alert Recipients** | Denied | **Denied** | **Allowed** | `verifyToken, requireRole(['Admin'])` |
| **Download Sensor CSV Audit Reports** | Denied | **Denied** | **Allowed** | `verifyToken, requireRole(['Admin'])` |
| **Ingest Raw IoT Sensor Telemetry** | Denied | **Denied** | **Denied** | `verifyDeviceKey` (IoT Device Only) |

---

## 8. Practical Security Architecture

Security is implemented defensively across all layers rather than as superficial middleware:

1. **Password Security:** Salted hashes using `bcryptjs` with cost factor 10. Raw passwords are never logged, returned in JSON, or stored in plaintext.
2. **Stateless JWT Tokens:** Signed using HMAC-SHA256 with strong 256-bit secret (`JWT_SECRET`). Expiration enforced strictly at 24 hours.
3. **IoT Device Authentication:** Sensor ingestion endpoint (`/api/sensors/reading`) requires a custom header `x-device-key`. The server compares this against a securely stored hash in the `SensorNode` collection, preventing rogue payload spoofing.
4. **Input Sanitization & Injection Defense:**
   - Parameter values sanitized against NoSQL operator injection (`$gt`, `$ne`, etc.).
   - Explicit numerical range checks on telemetry: `0 <= pH <= 14`, `turbidity >= 0`, `tds >= 0`, `-10 <= temp <= 80`. Payloads containing strings, `NaN`, or missing fields are immediately rejected with HTTP `400 Bad Request`.
5. **Rate Limiting & Abuse Prevention:**
   - Global API rate limiter: 100 requests per 15-minute window per IP.
   - Authentication brute-force limiter (`/api/auth/login`): 5 failed attempts per 15-minute window per IP.
   - IoT ingestion rate limiter (`/api/sensors/reading`): Max 2 requests per 10 seconds per device.
   - Image upload rate limiter: Max 5 uploads per 10 minutes per user.
6. **Secure HTTP Headers & CORS:**
   - `helmet` enabled to set CSP, HSTS, frameguard (anti-clickjacking), and X-Content-Type-Options.
   - `cors` configured with an explicit whitelist restricting origins to the trusted frontend URL.
7. **Image Upload Security:**
   - File size strictly capped at 5 MB via `multer`.
   - File signature/mime verification restricting uploads exclusively to `image/jpeg` and `image/png`.
   - Temporary buffers sanitized and processed in memory or securely stored with randomized filenames, never executed as scripts.
8. **Information Disclosure Prevention:**
   - Centralized error handler catches unhandled exceptions, logs internal stack traces to server logs, and returns sanitized messages (`{ error: 'Internal Server Error' }`) to clients.

---

## 9. IoT Sensor API & Simulation Engine

### 9.1 Ingestion Protocol & Schema
- **Endpoint:** `POST /api/sensors/reading`
- **Headers:**
  - `Content-Type: application/json`
  - `x-device-key: <SECRET_IOT_DEVICE_KEY>`
- **Payload Structure:**
  ```json
  {
    "nodeId": "NODE-01-INDORE-WARD12",
    "pH": 7.24,
    "turbidity": 1.85,
    "tds": 210.0,
    "temperature": 24.6
  }
  ```
- **Validation Rules:**
  - `nodeId`: String, matching active node in database.
  - `pH`: Float between `0.0` and `14.0`.
  - `turbidity`: Float `>= 0.0` (NTU).
  - `tds`: Float `>= 0.0` (ppm).
  - `temperature`: Float between `-10.0` and `80.0` (°C).
- **Responses:**
  - `201 Created`: `{ "success": true, "readingId": "...", "status": "Safe" }`
  - `400 Bad Request`: `{ "error": "Invalid payload: pH value out of physical bounds" }`
  - `401 Unauthorized`: `{ "error": "Invalid or missing device credentials" }`

### 9.2 Software-First Telemetry Simulator (`scripts/simulate_sensors.js`)
To enable end-to-end development without waiting for physical hardware, a simulator script will provide:
1. **Normal Operating Mode:** Generates realistic readings fluctuating naturally around safe baselines (pH ~7.2, Turbidity ~2.1 NTU, TDS ~220 ppm, Temp ~25°C) transmitted every 30 seconds.
2. **Breach Simulation Modes (Triggered via flags):**
   - `--breach-ph`: Transmits pH 9.1 breach to test TC-05 and alert dispatch.
   - `--breach-turbidity`: Transmits 8.5 NTU breach.
   - `--breach-tds`: Transmits 750 ppm breach.
   - `--invalid-payload`: Sends malformed JSON to test TC-04 rejection.
   - `--network-loss`: Simulates 5-minute transmission dropout to test TC-12 reconnection recovery.

---

## 10. Threshold Engine & Automated Alert/SMS Pipeline

### 10.1 Evaluation Flow
```
ESP32 / Simulator -> POST /api/sensors/reading
  │
  ▼
[Validation Middleware] -> (If invalid -> HTTP 400 & reject)
  │
  ▼
[Store Reading in MongoDB]
  │
  ▼
[Threshold Engine Evaluation]
  ├── Query active thresholds from MongoDB
  ├── Check each parameter:
  │     If value < min OR value > max -> State = UNSAFE (Breach)
  │     Else if value within 10% of min/max -> State = CAUTION
  │     Else -> State = SAFE
  │
  ▼
[Breach Detected?]
  ├── NO: Update node status to Normal -> Complete cycle
  └── YES: Trigger Alert Workflow
        │
        ▼
     [Alert Debounce & De-Duplication Check]
        ├── Check if an Active Alert already exists for this parameter on this node
        │   within the configurable alert suppression window (proposed default: 15 minutes).
        ├── YES -> Append reading reference; suppress repeat SMS (prevents message storms).
        └── NO -> Create new Alert record (Severity: High/Medium)
              │
              ▼
           [Notification Service]
              ├── Query registered SMS recipients from MongoDB
              ├── Construct SMS text:
              │   "ALERT: JalDrishti Node 1 (Ward 12, Indore) recorded pH 9.1 (Safe limit: 6.5-8.5). Water is unsafe. Avoid consumption."
              ├── Dispatch via SmsService adapter (Fast2SMS / Twilio / Dev Mock)
              ├── Log dispatch record in Notification collection
              └── Flag dashboard for real-time alert banner display
```

---

## 11. AI / Water Image Screening Architecture

### 11.1 Comparative Analysis & Architectural Recommendation

| Evaluation Dimension | Option A: Hosted Multimodal Vision API (Gemini Vision) | Option B: Custom Trained Classifier (MobileNet/PyTorch) |
|:---|:---|:---|
| **Implementation Effort** | **Low:** Single service module using `@google/genai` | **High:** Dataset collection, labeling, training, Docker container |
| **Project Timeline** | Fits within allocated 12-week college schedule | High risk of delays due to dataset curation and training iterations |
| **Detection Quality** | Excellent contextual reasoning on turbidity, color, and containers | Prone to overfitting on specific lighting and cup reflections |
| **Non-Water Image Rejection** | Native zero-shot recognition: rejects faces, tables, cars, text | Requires a separate binary classifier or extensive negative dataset |
| **Deployment Footprint** | Zero extra infrastructure; runs directly within Node.js backend | Requires running a Python Flask/FastAPI microservice with PyTorch |
| **Demonstration Reliability** | 99.9% availability during final viva and evaluation | Dependent on local GPU/CPU inference speed and memory limits |

**Architectural Recommendation:**  
Implement **Option A (Hosted Vision API)** as the primary screening engine, wrapped in a generic `ImageAnalysisProvider` interface. A fallback `MockVisionProvider` is included for offline testing.

### 11.2 Screening Flow & Validation
1. Citizen uploads image (`POST /api/image-check`).
2. Multer validates file type (`JPEG`/`PNG`) and size (`<= 5 MB`).
3. The image buffer is passed to `aiScreeningService`.
4. Prompt structure instructs the model:
   - Determine if the image displays a sample of water in a container (glass, bucket, bottle, tap).
   - If not water: Return `{ isWaterImage: false, result: "Rejected", advisory: "Please upload a clear photograph of water in a container." }`.
   - If water: Evaluate visible clarity, turbidity, discoloration, and foreign particulates.
   - Return structured JSON: `{ isWaterImage: true, result: "Safe" | "Unsafe", confidence: 0-100, advisory: "..." }`.
5. The result is saved to `ImageCheck` and returned to the UI.
6. **Mandatory UI Disclaimer:** Every screening result is accompanied by the statutory notice:
   > *"Notice: This screening is advisory only based on visible characteristics. Visual analysis cannot confirm that water is free of chemical or microbial pathogens. Use sensor or laboratory testing for drinking water certification."*

---

## 12. Master Testing Matrix

Synthesizes all test scenarios from both the SRS (TC01–TC05) and the Synopsis (TC01–TC12) into a unified master test suite:

| Master ID | Document Sources | Scenario / Feature | Input Data | Expected Output | Target Phase | Verification Evidence |
|:---:|:---|:---|:---|:---|:---:|:---|
| **TC-01** | Synopsis TC01<br>SRS TC01 | pH Sensor 2-point Calibration | Buffer solutions: pH 4.01 and pH 6.86 | Sensor voltage matches standard curve; reading within ±0.1 pH | Phase 27 | Calibration log sheet & serial monitor capture |
| **TC-02** | Synopsis TC02<br>SRS TC02 | TDS Sensor Accuracy Test | Known NaCl / KCl reference solution (e.g. 300 ppm) | Reading within ±5% tolerance of known standard | Phase 27 | Lab measurement comparison log |
| **TC-03** | Synopsis TC03<br>SRS TC03 | Ingestion of Valid IoT Payload | Valid JSON from ESP32 / Simulator (`pH: 7.2, tds: 210, ...`) | HTTP 201 Created; record persisted in MongoDB; visible on dashboard | Phase 7 | MongoDB query output & API response log |
| **TC-04** | Synopsis TC04<br>SRS TC04 | Ingestion of Malformed Payload | Missing `nodeId` or string passed for `pH` (`"pH": "acidic"`) | HTTP 400 Bad Request; record rejected; database remains unchanged | Phase 7 | Jest API integration test report |
| **TC-05** | Synopsis TC05<br>SRS TC04 | Threshold Breach Detection | Ingest reading with out-of-range value (e.g., `pH: 9.1`) | Alert record created with `severity: High`; status set to `Unsafe` | Phase 8 | Alert collection record & dashboard banner screenshot |
| **TC-06** | Synopsis TC06 | Automated SMS Dispatch | Parameter breach triggers notification flow | SMS delivered to registered numbers; Notification record saved | Phase 10 | SMS gateway delivery receipt & SMS log |
| **TC-07** | Synopsis TC07 | End-to-End Latency Measurement | Telemetry transmission timestamp vs. SMS receipt timestamp | End-to-end latency measured and documented (< 5 seconds) | Phase 29 | Latency timing benchmarks table |
| **TC-08** | Synopsis TC08 | Valid User Authentication | Correct registered credentials (`citizen@jaldrishti.org`) | HTTP 200; valid JWT returned; client redirected to Citizen dashboard | Phase 4 | Postman / UI redirect test recording |
| **TC-09** | Synopsis TC09 | Invalid Password Authentication | Registered email with incorrect password | HTTP 401 Unauthorized; clear validation error message displayed | Phase 4 | UI error message screenshot |
| **TC-10** | Synopsis TC10 | Role-Based Access Denial | Citizen user accesses `PUT /api/thresholds` or Settings page | HTTP 403 Forbidden; frontend redirects to `/unauthorized` | Phase 5 | Backend 403 response log & UI guard capture |
| **TC-11** | Synopsis TC11<br>SRS TC05 | AI Water Image Screening | Clear water, murky muddy water, and non-water object image | Clear -> Safe; Murky -> Unsafe with confidence; Non-water -> Rejected | Phase 23 | Screening results comparison card captures |
| **TC-12** | Synopsis TC12 | Wi-Fi Interruption & Auto-Recovery | Disconnect Wi-Fi access point for 3 mins, then restore | Node enters reconnect loop; resumes transmission upon reconnect; gap visible | Phase 28 | Continuous trend chart displaying network gap |

---

## 13. Sequential Development Roadmap (Phases 0 to 31)

### Phase 0: Document Analysis & Planning (CURRENT PHASE)
- **Objective:** Complete analysis of authoritative documents and produce comprehensive implementation plans.
- **Tasks:** Review SRS, Synopsis, and 9 Design Diagrams. Author `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_DECISIONS.md`, and `docs/IMPLEMENTATION_PROGRESS.md`.
- **Completion Criteria:** All three planning documents committed; zero application code written.

### Phase 1: Project Workspace Foundation
- **Objective:** Initialize repository, version control structure, and module workspaces.
- **Prerequisites:** Phase 0 approved.
- **Tasks:** Initialize Git repository. Create `.gitignore` ignoring `node_modules/`, `.env`, build artifacts, and coverage. Scaffold root structure with `backend/`, `frontend/`, `firmware/`, `scripts/`, `docs/`. Create root `package.json` with convenience scripts.
- **Validation:** Git status clean; folder structure matches Section 3.

### Phase 2: Backend Foundation & Server Architecture
- **Objective:** Stand up Express application shell with logging and health-check routes.
- **Prerequisites:** Phase 1 complete.
- **Tasks:** Initialize `backend/package.json`. Install Express, dotenv, cors, helmet, morgan. Create `backend/src/config/env.js`, `backend/src/app.js`, `backend/server.js`. Implement `GET /health` endpoint.
- **Validation:** Running `npm start` in `backend/` returns HTTP 200 on `/health`.

### Phase 3: Database Connection & Mongoose Models
- **Objective:** Establish MongoDB connection and configure the 7 core Mongoose schemas.
- **Prerequisites:** Phase 2 complete.
- **Tasks:** Create `backend/src/config/db.js` with auto-reconnect listeners. Implement models: `User.js`, `SensorNode.js`, `Reading.js`, `Threshold.js`, `Alert.js`, `Notification.js`, `ImageCheck.js`. Configure indexes and validations. Create `scripts/seed_database.js` to seed default thresholds and prototype node metadata.
- **Validation:** Seed script executes cleanly; collections and indexes verified in MongoDB.

### Phase 4: Authentication System (Local & Google OAuth)
- **Objective:** Implement complete user registration, login, and Google OAuth verification.
- **Prerequisites:** Phase 3 complete.
- **Tasks:** Implement `authController.js` and `authRoutes.js`. Add bcrypt password hashing and JWT signing (`signToken`). Add Google ID token verification via `google-auth-library`. Implement `GET /api/auth/me`.
- **Validation:** Unit tests for TC-08 (valid login) and TC-09 (invalid login) pass.

### Phase 5: Authorization & RBAC Middleware
- **Objective:** Enforce role separation between Administrator and Citizen across all API routes.
- **Prerequisites:** Phase 4 complete.
- **Tasks:** Implement `backend/src/middleware/authMiddleware.js` (JWT verification) and `roleMiddleware.js` (`requireRole(['Admin'])`). Create protected test routes.
- **Validation:** Test TC-10 passes (Citizen request to admin route receives HTTP 403 Forbidden).

### Phase 6: Backend Security Baseline & Hardening
- **Objective:** Apply production-grade security middleware and rate limiters.
- **Prerequisites:** Phase 5 complete.
- **Tasks:** Configure `helmet` headers, CORS whitelist, `express-rate-limit` (auth and general limiters), and input sanitization middleware. Implement centralized error handler in `errorMiddleware.js`.
- **Validation:** Rate-limiting triggers HTTP 429 on rapid requests; malformed JSON rejected gracefully without leaking stack traces.

### Phase 7: Sensor Ingestion API & Validation
- **Objective:** Create the authenticated endpoint for IoT sensor payload ingestion.
- **Prerequisites:** Phase 6 complete.
- **Tasks:** Implement `deviceAuthMiddleware.js` (`x-device-key` validation). Implement `sensorController.js` and `sensorRoutes.js` (`POST /api/sensors/reading`). Add strict numerical range validation.
- **Validation:** Tests TC-03 (valid payload accepted, 201) and TC-04 (malformed payload rejected, 400) pass.

### Phase 8: Threshold Evaluation Engine
- **Objective:** Build the business logic engine evaluating telemetry against dynamically configurable safe limits.
- **Prerequisites:** Phase 7 complete.
- **Tasks:** Create `backend/src/services/thresholdEngine.js`. Fetch thresholds dynamically from MongoDB. Evaluate readings into `Safe`, `Caution`, or `Unsafe` against configured ranges (initial seed values treated as provisional defaults). Update reading status on ingestion.
- **Validation:** Test TC-05 passes (simulated pH 9.1 triggers breach classification).

### Phase 9: Alert Lifecycle & De-Duplication
- **Objective:** Implement alert generation, configurable suppression windows, and acknowledgment endpoints.
- **Prerequisites:** Phase 8 complete.
- **Tasks:** Create `backend/src/services/alertService.js`. Implement configurable de-duplication/debounce window (proposed default: 15 minutes, configurable by admin). Implement `alertController.js` (`GET /api/alerts`, `PATCH /api/alerts/:id/ack`).
- **Validation:** Breach triggers single active alert; subsequent breach within the suppression window links to the existing alert rather than generating repeat notifications; Admin acknowledgment updates status to `Acknowledged`.

### Phase 10: Notification System & SMS Gateway Integration
- **Objective:** Dispatch automated SMS notifications upon threshold breaches.
- **Prerequisites:** Phase 9 complete.
- **Tasks:** Create `backend/src/services/smsService.js` with pluggable adapters (`TwilioProvider`, `Fast2SmsProvider`, `MockSmsProvider`). Wire SMS trigger into `alertService`. Implement `recipientController.js` (`/api/recipients`).
- **Validation:** Test TC-06 passes (mock and sandbox SMS dispatched and logged in `Notification` collection).

### Phase 11: Frontend Foundation (React + Vite)
- **Objective:** Scaffold the modern React single-page application.
- **Prerequisites:** Phase 1 complete.
- **Tasks:** Initialize React with Vite in `frontend/`. Install dependencies: `react-router-dom`, `axios`, `lucide-react`, `@react-oauth/google`. Configure Vite proxy for `/api` routing.
- **Validation:** `npm run dev` serves default application cleanly on `http://localhost:5173`.

### Phase 12: Component & Tailwind CSS Architecture
- **Objective:** Establish the design system tokens, typography, and reusable UI components.
- **Prerequisites:** Phase 11 complete.
- **Tasks:** Configure `tailwind.config.js` with status colors (`status-safe`, `status-caution`, `status-unsafe`, primary blue). Create `components/common/`: `Button.jsx`, `Card.jsx`, `Badge.jsx`, `Input.jsx`, `Modal.jsx`, `Spinner.jsx`, `AlertBanner.jsx`. Create `MainLayout.jsx`, `Sidebar.jsx`, `Header.jsx`.
- **Validation:** UI stylebook / test page displays all common components across responsive viewports.

### Phase 13: Authentication UI (Login, Signup, Google OAuth)
- **Objective:** Build login and signup views with Google OAuth integration.
- **Prerequisites:** Phase 12 and Phase 4 complete.
- **Tasks:** Implement `AuthContext.jsx` and `useAuth.js`. Build `LoginForm.jsx`, `SignupForm.jsx`, `GoogleLoginBtn.jsx`, `LoginPage.jsx`, `SignupPage.jsx`. Add `ProtectedRoute.jsx` for route guarding.
- **Validation:** Users can sign up, log in, sign in with Google, and are redirected according to role.

### Phase 14: Admin Dashboard Layout & Overview
- **Objective:** Assemble the administrator overview dashboard.
- **Prerequisites:** Phase 13 complete.
- **Tasks:** Implement `AdminDashboard.jsx`. Integrate greeting banner, node connectivity badge (`NodeStatusBadge.jsx`), quick stats summary, and navigation cards to sub-modules.
- **Validation:** Admin login lands on Admin Dashboard; unauthorized users redirected.

### Phase 15: Citizen Dashboard & Plain-Language View
- **Objective:** Build the public-facing citizen water safety portal.
- **Prerequisites:** Phase 13 complete.
- **Tasks:** Implement `CitizenDashboard.jsx`. Build `CitizenSummary.jsx` displaying high-visibility color banner (Safe/Caution/Unsafe) with plain-language guidance ("Water safe for consumption"). Integrate `CitizenAlertFeed.jsx`.
- **Validation:** Citizen login lands on Citizen Dashboard; interface matches Synopsis Fig 4 wireframe.

### Phase 16: Live Monitoring & Parameter Cards
- **Objective:** Build live telemetry display with smart polling.
- **Prerequisites:** Phase 14 and Phase 7 complete.
- **Tasks:** Implement `SensorContext.jsx` and `useLiveReadings.js` (15s polling hook). Build `ParameterCard.jsx` displaying value, unit, status badge, and safe range bounds for pH, Turbidity, TDS, and Temperature. Build `LatestReadingsTable.jsx`.
- **Validation:** Live cards update automatically every 15s without full-page reloads.

### Phase 17: Historical Trends & Recharts Analytics
- **Objective:** Implement interactive time-series visualizations.
- **Prerequisites:** Phase 16 complete.
- **Tasks:** Install `recharts`. Implement `TrendLineChart.jsx` and `ChartTimeFilter.jsx` (24h/7d/30d). Overlay `ReferenceLine` marking upper/lower safe bounds. Build `TrendsPage.jsx`.
- **Validation:** Trends render cleanly with real-time tooltips, responsive SVG resizing, and safe limit indicators.

### Phase 18: Alerts UI & Acknowledgment Workflow
- **Objective:** Implement the alert management interface.
- **Prerequisites:** Phase 14 and Phase 9 complete.
- **Tasks:** Implement `AlertContext.jsx`. Build `AlertList.jsx`, `AlertItem.jsx`, `AcknowledgeModal.jsx`, and `AlertsPage.jsx`. Show severity tags (High, Medium, Info). Allow Admins to acknowledge active alerts.
- **Validation:** Admin can click "Acknowledge", enter note, and see alert change state in real-time.

### Phase 19: Leaflet / OpenStreetMap Node Visualization
- **Objective:** Display prototype monitoring node location on an interactive map.
- **Prerequisites:** Phase 14 complete.
- **Tasks:** Install `leaflet` and `react-leaflet`. Build `NodeMap.jsx` and `NodeMarker.jsx` centered on Indore coordinates (`[22.7196, 75.8577]`). Add popup displaying live node status, ward number, and current water metrics. Build `MapPage.jsx`.
- **Validation:** Map tiles render smoothly; clicking marker displays live telemetry popup.

### Phase 20: Admin Settings (Thresholds & SMS Management)
- **Objective:** Provide administrative management of system parameters.
- **Prerequisites:** Phase 14 and Phase 8/10 complete.
- **Tasks:** Build `ThresholdForm.jsx` allowing editing of min/max values for pH, Turbidity, TDS, and Temp. Build `RecipientManager.jsx` allowing adding/removing SMS recipient phone numbers. Assemble `SettingsPage.jsx`.
- **Validation:** Changes to threshold bounds instantly alter subsequent threshold evaluations.

### Phase 21: Reporting Engine & CSV/Report Data Export
- **Objective:** Enable administrative CSV/report export as required by SRS FR-16 (PDF generation is not a mandatory requirement).
- **Prerequisites:** Phase 20 complete.
- **Tasks:** Implement `backend/src/controllers/reportController.js` using `json2csv` to stream historical telemetry and alert logs into CSV tabular format. Build `ReportDownloader.jsx` on frontend with date-range filters.
- **Validation:** Clicking "Export CSV" downloads formatted CSV file containing timestamps, parameter values, and status flags in full conformance with SRS FR-16.

### Phase 22: Frontend-to-Backend Full Integration
- **Objective:** End-to-end integration and smoke testing across all software features.
- **Prerequisites:** Phases 1–21 complete.
- **Tasks:** Connect all frontend pages to live backend routes. Test edge cases: expired JWT handling, network error states, loading skeletons, and form validation error states.
- **Validation:** All software workflows operate smoothly without console errors or broken state.

### Phase 23: AI Water Image Screening Module
- **Objective:** Integrate multimodal image screening for water clarity evaluation.
- **Prerequisites:** Phase 22 complete.
- **Tasks:** Implement `backend/src/services/aiScreeningService.js` utilizing Gemini Vision API. Build `ImageUploader.jsx`, `ScreeningResult.jsx`, `AdvisoryDisclaimer.jsx`, and `ImageCheckPage.jsx`.
- **Validation:** Test TC-11 passes: Clear water -> Safe; Muddy water -> Unsafe; Non-water image -> Rejected with clear user prompt.

### Phase 24: Security Audit & Vulnerability Check
- **Objective:** Verify security posture against OWASP Top 10 vulnerabilities.
- **Prerequisites:** Phase 23 complete.
- **Tasks:** Audit routes for missing auth/role middleware. Verify rate limiters. Run `npm audit`. Verify CORS policies and input sanitization.
- **Validation:** Zero high/critical vulnerabilities; direct API bypass attempts properly blocked.

### Phase 25: Automated Software Test Suite Execution
- **Objective:** Execute full automated test suite for software components.
- **Prerequisites:** Phase 24 complete.
- **Tasks:** Implement Jest/Supertest integration test suite covering auth, sensor ingestion, threshold evaluation, alert de-duplication, and RBAC.
- **Validation:** 100% of software test cases pass with verified test logs.

### Phase 26: ESP32-S3 Firmware Architecture & Setup
- **Objective:** Scaffold and configure the embedded C++ firmware project.
- **Prerequisites:** Phase 25 complete (Software pipeline verified).
- **Tasks:** Set up PlatformIO project in `firmware/esp32_sensor_node/`. Configure `config.h`, `sensor_pins.h`, and `calibration.h`. Implement Wi-Fi connection manager and HTTP client.
- **Validation:** Firmware compiles cleanly for ESP32-S3 target without compiler errors.

### Phase 27: Sensor Hardware Calibration & Bench Testing
- **Objective:** Calibrate analog probes and verify measurement accuracy.
- **Prerequisites:** Phase 26 complete and physical hardware assembled.
- **Tasks:** Connect pH, Turbidity, TDS, and DS18B20 temperature probes. Execute 2-point pH calibration (TC-01) with 4.01 and 6.86 buffers. Execute TDS calibration (TC-02) with reference standard solution. Document calibration coefficients in `calibration.h`.
- **Validation:** Tests TC-01 and TC-02 pass; readings within accepted tolerances.

### Phase 28: Hardware-to-Backend Real-Device Integration
- **Objective:** Transmit live physical sensor data from ESP32-S3 to backend over Wi-Fi.
- **Prerequisites:** Phase 27 complete.
- **Tasks:** Flash calibrated firmware to ESP32-S3. Verify HTTP POST transmissions over local Wi-Fi to `/api/sensors/reading`. Test Wi-Fi disconnect and auto-reconnect handling (TC-12).
- **Validation:** Live physical sensor data streams onto React dashboard; test TC-12 passes.

### Phase 29: End-to-End System Validation (Sensor to SMS)
- **Objective:** Complete physical validation of the entire pipeline under simulated breach conditions.
- **Prerequisites:** Phase 28 complete.
- **Tasks:** Submerge pH probe in alkaline solution (> 8.5) to simulate municipal contamination. Measure time from probe immersion to dashboard alert banner and SMS delivery.
- **Validation:** Test TC-07 passes: Latency measured and recorded (< 5 seconds end-to-end).

### Phase 30: System Stabilization & Optimization
- **Objective:** Polish UI/UX, optimize query performance, and ensure operational robustness.
- **Prerequisites:** Phase 29 complete.
- **Tasks:** Optimize MongoDB indexes, adjust sensor sampling intervals, verify mobile responsive breakpoints, and refine error recovery states.
- **Validation:** System runs continuously for 24 hours with zero crashes or memory leaks.

### Phase 31: Implementation Documentation, Evidence & Handover
- **Objective:** Assemble final project evidence, test execution logs, and user guides.
- **Prerequisites:** Phase 30 complete.
- **Tasks:** Update `docs/IMPLEMENTATION_PROGRESS.md` with final verification records. Capture screenshots of live dashboards, alert banners, and SMS messages. Produce project README and operational runbook.
- **Validation:** Full project documentation suite finalized and ready for academic submission.

---

## 14. Git, Version Control & Environment Management

### 14.1 Branching & Commit Discipline
- **Main Branch (`main`):** Stable production code only.
- **Development Branch (`dev`):** Integration branch for active phase merges.
- **Feature Branches (`feat/phase-<N>-<topic>`):** Individual branches per phase (e.g., `feat/phase-4-auth`).
- **Commit Format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
  *Example:* `feat(auth): implement Google OAuth 2.0 token verification with google-auth-library`

### 14.2 Environment Variables Plan

#### Backend (`backend/.env` template):
```ini
# Application Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb://localhost:27017/jaldrishti

# Authentication & JWT
JWT_SECRET=YOUR_SECURE_256_BIT_RANDOM_SECRET_KEY
JWT_EXPIRES_IN=24h

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# IoT Ingestion Security
DEVICE_API_KEY=YOUR_PRE_SHARED_ESP32_INGESTION_SECRET

# SMS Gateway Configuration
SMS_PROVIDER=mock # Options: mock | fast2sms | twilio
FAST2SMS_API_KEY=YOUR_FAST2SMS_API_KEY
TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+1234567890

# AI Vision Screening Configuration
AI_PROVIDER=gemini # Options: gemini | mock
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

#### Frontend (`frontend/.env` template):
```ini
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

---

## 15. Requirements Traceability Matrix

| SRS Requirement | Synopsis Ref | Planned Architecture Module | Target Phase | Verification Test ID | Evidence Deliverable |
|:---|:---|:---|:---:|:---:|:---|
| **FR-01** (Authentication) | Section 10 / TC08 | `backend/src/controllers/authController.js`<br>`frontend/src/context/AuthContext.jsx` | Phase 4, 13 | TC-08, TC-09 | Auth token log, redirect screen capture |
| **FR-02** (Sensor Acquisition) | Section 8 / TC01-02 | `firmware/esp32_sensor_node/src/sensors.cpp` | Phase 26, 27 | TC-01, TC-02 | Serial ADC log & calibration sheet |
| **FR-03** (Data Transmission) | Section 8 / TC12 | `firmware/src/http_client.cpp`<br>`backend/src/routes/sensorRoutes.js` | Phase 7, 28 | TC-03, TC-12 | Wi-Fi packet capture & reconnect log |
| **FR-04** (Payload Validation) | Section 7 / TC04 | `backend/src/middleware/validators.js` | Phase 7 | TC-04 | 400 Bad Request error response log |
| **FR-05** (Storage) | Section 5.4 / D1 | `backend/src/models/Reading.js` | Phase 3 | TC-03 | MongoDB Compass collection view |
| **FR-06** (Thresholds) | Section 7 / TC05 | `backend/src/services/thresholdEngine.js` | Phase 8 | TC-05 | Threshold evaluation unit test report |
| **FR-07** (Alerts) | Section 7 / TC05 | `backend/src/services/alertService.js`<br>`frontend/src/components/alerts/` | Phase 9, 18 | TC-05 | Alert document in DB & UI alert banner |
| **FR-08** (SMS Notifications) | Section 7 / TC06 | `backend/src/services/smsService.js` | Phase 10 | TC-06 | SMS delivery receipt & notification record |
| **FR-09** (Live Dashboard) | Section 9 / Fig 4 | `frontend/src/components/dashboard/` | Phase 14, 15, 16 | TC-03 | Dashboard UI screenshot with 4 cards |
| **FR-10** (Trends) | Section 9 / Fig 4 | `frontend/src/components/charts/` | Phase 17 | TC-03 | Recharts SVG with threshold reference lines |
| **FR-11** (Alert History) | Section 9 / Fig 4 | `frontend/src/pages/AlertsPage.jsx` | Phase 18 | TC-05 | Paginated alert table with status badges |
| **FR-12** (Leaflet Map) | Section 9 / Fig 4 | `frontend/src/components/map/NodeMap.jsx` | Phase 19 | TC-03 | Map view screenshot showing Indore node |
| **FR-13** (Image Upload) | Section 9 / TC11 | `frontend/src/components/image-check/` | Phase 23 | TC-11 | Upload widget screenshot with preview |
| **FR-14** (AI Screening) | Section 10 / TC11 | `backend/src/services/aiScreeningService.js` | Phase 23 | TC-11 | AI screening card with advisory disclaimer |
| **FR-15** (Admin Settings) | Section 9 / TC10 | `frontend/src/pages/SettingsPage.jsx` | Phase 20 | TC-10 | Threshold edit screen & RBAC denial log |
| **FR-16** (Reporting / Export) | Section 7 | `backend/src/controllers/reportController.js` | Phase 21 | TC-03 | Exported CSV file with timestamped metrics |

---

## 16. Project Risk Assessment & Mitigation Matrix

| # | Risk Description | Probability | Impact | Proactive Mitigation Strategy | Fallback / Recovery Plan |
|:---:|:---|:---:|:---:|:---|:---|
| **R-1** | Google OAuth Configuration or domain mismatch during local dev | Medium | Medium | Configure `http://localhost:5173` and `http://localhost:5000` in Google Cloud Console; isolate credentials in `.env` | Local email/password login functions independently without Google OAuth |
| **R-2** | SMS Gateway quota depletion or regulatory template blocks | Medium | High | Decouple SMS via `SmsService` adapter pattern; test locally with `MockSmsProvider` | Mock provider logs SMS to disk/console with 100% operational fidelity |
| **R-3** | Hosted AI API latency or internet downtime during evaluation | Low | Medium | Cache recent screening responses; enforce client-side image compression | Fallback to `MockVisionProvider` offering deterministic clear/murky evaluations |
| **R-4** | Analog pH/TDS sensor drift or non-linear ADC response on ESP32 | High | High | Use multi-sample analog averaging (Oversampling 64x) and calibrate against standard buffer solutions (4.01/6.86) | Documented calibration curve in `calibration.h` and software temperature compensation |
| **R-5** | Wi-Fi disconnection or router packet drops in municipal/lab area | Medium | Medium | ESP32 firmware implements non-blocking Wi-Fi auto-reconnect loop with exponential backoff | Sensor continues monitoring; reconnects automatically when network restores (TC-12) |
| **R-6** | Unauthorized access to administrative settings | Low | Critical | Backend RBAC middleware rejects non-Admin requests with HTTP 403 Forbidden | Security audit in Phase 24 verifies zero privilege escalation paths |
| **R-7** | Premature hardware assembly blocking software progress | Medium | High | **Strict Software-First rule:** Complete all backend, frontend, alerts, and AI modules with simulated payloads (Phases 1–25) | Hardware deferred strictly to Phase 26+ |

---

## 17. Open Decisions & Prerequisites for Implementation

All major architectural decisions have been evaluated and formalized in `docs/IMPLEMENTATION_DECISIONS.md`:
1. **Frontend:** React 18 + Vite 5 + Tailwind CSS 3.4 (Component-driven).
2. **State:** React Context API + Custom Hooks.
3. **Live Telemetry:** Smart HTTP Polling (15s interval) backed by MongoDB indexes.
4. **Auth:** Local JWT + Google OAuth 2.0 (`google-auth-library`).
5. **AI Vision:** Hosted Vision API (Gemini Vision) with pluggable provider interface.
6. **SMS Gateway:** Pluggable adapter (Fast2SMS / Twilio / Dev Mock).
7. **Sequence:** Software-First (Simulated payloads in Phases 7–25; physical hardware in Phases 26–28).

**Implementation Evolution Note (October 9, 2026):**  
While software phases 1 through 25 were sequentially developed and verified in isolation, subsequent end-to-end user review revealed significant frontend usability gaps, incomplete branding, missing admin access/navigation, profile/settings absences, and operational constraints (e.g. Gemini quota depletion). Rather than fragmented patches, all remediation and redesign activities are formalized into Section 18 below as a single, comprehensive Master Implementation Mission.

---

## 18. Master Implementation Mission: Software Audit, Feature Remediation & Complete UI/UX Redesign (October 9, 2026)

### 18.1 Mission Purpose & Strategic Objectives
The objective of this Master Implementation Mission is to bridge the gap between underlying backend capability and top-tier user-facing execution. It consolidates all necessary software enhancements, defect fixes, and design modernization into a single coordinated roadmap prior to physical hardware wiring or deployment decisions.

The mission focuses on six core objectives:
1. **Codebase-to-Requirements Audit:** Conduct an exhaustive line-by-line audit of all 25 completed software phases against the actual repository source code and the three authoritative project documents (`2a_G2_SRS_JalDrishti_FINAL.docx`, `3b_G2_Synopsis Presentation`, and `4a_G2_Design_Diagram_9_Diagrams_FINAL.docx`).
2. **Defect & Incompleteness Identification:** Systematically identify all nonfunctional, incomplete, missing, or broken features across the full stack.
3. **Feature Remediation & Administrator Enablement:** Implement missing approved functionality, with emphasis on secure administrator provisioning and discoverability, robust role management, profile settings, dynamic threshold configurations, recipient directories, alert acknowledgment workflows, and quota-protected AI image screening.
4. **Complete Frontend Redesign:** Transform the visual and interactive experience across every citizen and administrator page, establishing an original brand identity, cohesive design system, left sidebar navigation, contextual header with profile menu, and informative footer.
5. **Multi-Faceted Quality Verification:** Rigorously verify system functionality, security posture, accessibility (WCAG AA), responsive behavior, regression test suites, and clean production builds.
6. **Local Release Preparation:** Prepare a robust, fully verified local codebase ready for an independent academic release evaluation, while strictly excluding remote production release operations.

---

### 18.2 Comprehensive Mission Scope & Workstreams

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          MASTER IMPLEMENTATION MISSION SCOPE                           │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 1. Exhaustive Audit      │ 2. Feature Remediation      │ 3. Complete Frontend Redesign │
│ • Review Phases 0–25     │ • Secure Admin Access       │ • Original Visual Identity    │
│ • Reconcile SRS & Code   │ • Role Promotion/Provision  │ • Design Tokens & Spacing     │
│ • Identify Dead Code     │ • Dynamic Thresholds & SMS  │ • Collapsible Left Sidebar    │
│ • Flag Nonfunctional UI  │ • Alert Lifecycle & Ack     │ • Top Header & Avatar Menu    │
│ • Verify Model Schemas   │ • Quota-Safe AI Adapter     │ • Redesign ALL Pages & Footer │
├──────────────────────────┴─────────────────────────────┴───────────────────────────────┤
│ 4. Multi-Faceted Verification (Security, A11y, Responsive, Regressions, Production Build)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. Local Release Baseline (Explicitly Excludes Remote Deployment / Push)               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Workstream 1: Full Software Audit of Completed Phases 0–25
- Audit all existing routes in `backend/src/routes/` and controllers in `backend/src/controllers/` to ensure full compliance with SRS FR-01 through FR-16.
- Cross-check Mongoose schemas against authoritative data structures (SRS Section 8 and Synopsis Section 5.4).
- Inspect `frontend/src/` components to distinguish genuinely operational features from hardcoded mocks, empty callbacks, or cosmetic shells.
- Check authentication token flows, expiration handling, and error response contracts between backend and client.

#### Workstream 2: Identification of Gaps & Incomplete Features
- **Administrator Access Barrier:** Identify and resolve the issue where administrator access displayed "Access Denied" for users authenticated with the Citizen role, caused by lack of in-app admin discovery, dedicated admin login path, or administrative self-provisioning.
- **Missing Administrative Capabilities:** Address missing UI controls for node/device status inspection, active threshold manipulation, phone recipient directories, and manual alert acknowledgment.
- **Profile & Settings Voids:** Fill the void of dedicated user profile views (`/profile`) and comprehensive system settings (`/settings`).
- **AI Quota Exhaustion:** Address the constraint where live calls to Google Gemini Flash Vision rapidly exhaust limited quotas during routine test executions, necessitating an automated mock provider for all continuous test harnesses while preserving live vision for production use.
- **Inadequate Footer:** Replace missing or uninformative footers with a structured, academic project footer with disclaimers and status indicators.

#### Workstream 3: Backend & Feature Remediation
- **Secure Administrator Provisioning & RBAC Management:**
  - Create a deterministic, secure administrator provisioning workflow (e.g. CLI seed command `npm run seed:admin` or secure environment-based initial setup) ensuring a verified administrator account (`admin@jaldrishti.org`) is readily available with documented initial credentials.
  - Implement clear role feedback in the frontend: prevent generic dead-ends by guiding users if they attempt to access privileged routes with a Citizen account.
  - Ensure strict backend enforcement remains active via `requireRole(['Admin'])` on all sensitive endpoints (`/api/thresholds`, `/api/recipients`, `/api/alerts/:id/ack`, `/api/reports/*`).
- **Threshold & Device Management:**
  - Ensure administrative UI allows real-time viewing and editing of safe operating bounds for pH, Turbidity, TDS, and Temperature.
  - Ensure sensor node metadata (location, status, coordinates) can be viewed and verified.
- **Alert Lifecycle & Notification Management:**
  - Verify that parameter breaches trigger active alerts, debounce suppression prevents duplicate alerts within the configurable window, and returning to safe boundaries marks alerts as resolved.
  - Ensure administrators can review, acknowledge, and resolve alerts with optional operational notes.
  - Maintain the pluggable SMS gateway adapter (`mockSmsGateway` for automated tests, `fast2sms`/`twilio` for live alerts).
- **AI Vision Screening Quota Defense:**
  - Enforce provider selection architecture in `backend/src/services/imageScreening/`: routine test suites MUST explicitly invoke `mockVisionProvider` to prevent draining real Gemini API quotas.
  - Live Gemini API calls must only execute when configured with a valid `GEMINI_API_KEY` during explicit user verification.
  - Maintain statutory water safety advisory disclaimers across all result payloads.

#### Workstream 4: Complete Frontend Redesign (Entire UI)
The redesign encompasses every page and component across the frontend:
1. **Original Visual Identity & Logo:**
   - Develop an original JalDrishti emblem combining water droplet and monitoring vision geometry (clean, professional SVG icon and typography wordmark).
   - Integrate the brand mark across the favicon, login screens, sidebar header, and document footers.
2. **Modern Design System & Aesthetics:**
   - Formulate a cohesive palette: deep municipal oceanic blue (`#0369a1`), vibrant cyan accents (`#06b6d4`), slate surfaces (`#0f172a`, `#1e293b`), and distinct status tokens (Emerald Safe, Amber Caution, Rose Unsafe).
   - Eliminate awkward empty space by implementing balanced grid layouts, card elevations, glassmorphic headers, and clear typographic hierarchy (Inter font family).
3. **App Shell Architecture (Sidebar + Header + Footer):**
   - **Left Sidebar:** Persistent on desktop (`lg:w-64`), collapsible/drawer on mobile/tablet. Role-aware navigation displaying citizen routes (Dashboard, Trends, Alerts, Map, AI Screening, Profile) and admin routes (Admin Dashboard, Thresholds, Alert Log, Recipients, CSV Export, Settings).
   - **Top Header:** Compact bar (`h-16`) containing active breadcrumbs/page title, live node connectivity status badge, active alert notifications counter, and user profile avatar dropdown (name, role badge, profile link, logout button).
   - **Application Footer:** Sticky or bounded footer presenting JalDrishti project attribution (Minor Project I, RGPV/SGSITS 2026), institutional disclaimer, dynamic API health status indicator, and quick resource links.
4. **Comprehensive Page-by-Page Redesign:**
   - **Citizen Dashboard:** Prominent safety status banner with plain-language drinking advice, 4 live parameter cards with visual gauges/bars, recent telemetry table, quick-action links.
   - **Admin Dashboard:** System health metrics (node uptime, active breaches, SMS sent count), threshold status widget, quick acknowledgment drawer, CSV download shortcut.
   - **Trends & Analytics Page:** Multi-parameter Recharts graphs with safe limit reference bands, 24h/7d/30d filter pills, parameter selector, summary statistics (min/avg/max).
   - **Alerts Page:** Tabbed active vs historical alerts table, severity badges, time-elapsed formatting, administrative acknowledgment modal.
   - **Geospatial Map Page:** Full-height Leaflet/OpenStreetMap view with custom marker pins for Node 1 (Ward 12, Indore), interactive telemetry popup, and node status sidebar.
   - **AI Water Screening Page:** Drag-and-drop photo upload dropzone with client preview, classification badge (Safe/Unsafe/Rejected), confidence meter, previous screenings list, and prominent safety disclaimer.
   - **Dedicated Profile Page (`/profile`):** User identity overview, role indicator, account creation timestamp, session details, password change form, and account preferences.
   - **System Settings Page (`/settings`):** Threshold configuration form (min/max validation), SMS alert recipient management table, notification toggle, debounce window selector.
   - **Authentication Pages (Login/Signup):** Split-screen or card-centered modern visual layout, email/password form, Google OAuth 2.0 button, role explanation, input validation errors.
   - **Error & Utility Pages:** Distinct 404 Not Found, 403 Access Denied (with helpful guidance to log in with an administrator account), and network error states.

#### Workstream 5: Multi-Faceted Verification & Quality Assurance
- **Functional Testing:** Verify every end-to-end flow (registration, login, sensor ingestion, threshold breach, alert creation, alert ack, SMS log, CSV export, AI screening).
- **Security Audit:** Re-run Phase 24 security checks verifying JWT signature integrity, RBAC denial, NoSQL operator protection, Helmet headers, and CORS enforcement.
- **Accessibility (a11y) Verification:** Audit UI elements for semantic HTML, proper contrast ratios, ARIA labels on modals/buttons, and full keyboard tab navigation.
- **Responsive Layout Verification:** Verify flawless visual presentation on mobile viewports (`375px`, `414px`), tablet viewports (`768px`, `834px`), and desktop viewports (`1280px`, `1920px`).
- **Regression Test Suites:** Execute consolidated test suites (`npm test` / `node tests/runner.js`) confirming zero regressions across all 216+ automated tests.
- **Production Build:** Execute `npm run build` in `frontend/` confirming clean Vite compilation with 0 lint errors, 0 broken imports, and optimized bundle sizes.

---

### 18.3 Explicit Exclusions from Mission Scope
To maintain tight operational focus and adhere to governance boundaries, the following tasks are **STRICTLY EXCLUDED** from this master implementation mission:
1. **GitHub Push & Remote Repository Operations:** No code pushes to remote Git origins (e.g. `origin main` or remote branches). All changes remain strictly local.
2. **Vercel / Cloud Deployment:** No deployment triggers to Vercel, Render, AWS, MongoDB Atlas, or other cloud hosting providers.
3. **Physical Hardware Wiring & Microcontroller Flashing:** Sensor calibration with physical buffer solutions and ESP32 breadboarding remain strictly deferred to hardware Phase 26+.
4. **Live SMS Gateway Charges:** Routine test dispatches must not trigger live SMS billing; use `mockSmsGateway`.
5. **Live Gemini API Calls in Automated Test Suites:** Automated verification scripts must strictly use mocked AI responses to preserve API quotas.
