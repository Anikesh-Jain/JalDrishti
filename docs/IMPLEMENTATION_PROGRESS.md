# JalDrishti — Implementation Progress & Verification Tracker

**Project:** JalDrishti — IoT-Based Multi-Parameter Water Quality Monitoring and Early Warning System  
**System Target:** Working Academic Prototype (Minor Project I)  
**Current Phase:** Phase 25 Software Baseline Completed & Master UI Redesign Fully Verified  
**Last Updated:** October 10, 2026 (Master Redesign, Branding, Responsiveness & Verification Mission Completed)  
**Implementation Rule:** Software-First, Zero Unplanned Code, Rigorous Test Traceability  

--- 

## 1. Project Implementation Status Overview

| Phase # | Phase Title | Status | Completion Target | Verified By |
|:---|:---|:---:|:---:|:---:|
| **Phase 0** | Document Analysis & Comprehensive Planning | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 1** | Project Workspace & Repository Foundation | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 2** | Backend Foundation & Server Architecture | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 3** | Database Design & Mongoose Models | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 4** | Authentication System (Local & Google OAuth) | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 5** | Authorization & RBAC Middleware | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 6** | Backend Security Baseline & Hardening | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 7** | Sensor Ingestion API & Data Validation | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 8** | Threshold Evaluation Engine (Configurable Limits) | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 9** | Alert Lifecycle & Configurable Debounce Logic | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 10** | Notification System & SMS Gateway Adapter | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 11** | Frontend Foundation (React + Vite Setup) | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 12** | Component & CSS / Tailwind Architecture | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 13** | Authentication UI (Login, Signup, Google OAuth) | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 14** | Admin Dashboard Layout & Overview | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 15** | Citizen Dashboard & Plain-Language View | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 16** | Live Monitoring & Parameter Cards | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 17** | Historical Trends & Recharts Analytics | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 18** | Alert History & Alert UI | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 19** | Leaflet / OpenStreetMap Node Visualization | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 20** | Admin Settings (Thresholds & SMS Management) | **COMPLETED** | Day 1 | Lead Architect |
| **Phase 21** | Reporting Engine & CSV/Report Data Export | **COMPLETED** | Phase 21 Sprint | Lead Architect |
| **Phase 22** | Frontend-to-Backend Full Integration & E2E Software Flow | **COMPLETED** | Phase 22 Sprint | Lead Architect |
| **Phase 23** | AI Water Image Screening Module | **COMPLETED** | Phase 23 Sprint | Lead Architect |
| **Phase 24** | Comprehensive Security Audit & Vulnerability Check | **COMPLETED** | Phase 24 Sprint | Lead Architect |
| **Phase 25** | Expanded Automated Testing (Final Software Phase) | **COMPLETED** | Phase 25 Sprint | Lead Architect |
| **Phase 26** | ESP32-S3 Firmware Architecture & Setup | Pending | Phase 26 Kickoff | — |
| **Phase 27** | Sensor Hardware Calibration & Bench Testing | Pending | Phase 27 Kickoff | — |
| **Phase 28** | Hardware-to-Backend Real-Device Integration | Pending | Phase 28 Kickoff | — |
| **Phase 29** | End-to-End System Validation (Sensor to SMS) | Pending | Phase 29 Kickoff | — |
| **Phase 30** | System Stabilization & Optimization | Pending | Phase 30 Kickoff | — |
| **Phase 31** | Final Project Evidence, Reports & Handover | Pending | Phase 31 Kickoff | — |

---

## 2. Test Execution Tracker

| Master Test ID | Source Reference | Scenario Description | Target Phase | Status | Execution Date | Evidence Location |
|:---|:---|:---|:---:|:---:|:---:|:---|
| **TC-01** | Synopsis TC01 / SRS TC01 | pH Sensor 2-point calibration (4.01 & 6.86 buffer) | Phase 27 | Not Started | — | Pending hardware phase |
| **TC-02** | Synopsis TC02 / SRS TC02 | TDS sensor calibration with standard solution | Phase 27 | Not Started | — | Pending hardware phase |
| **TC-03** | Synopsis TC03 / SRS TC03 | Ingestion of valid JSON sensor payload | Phase 7 | **PASSED** | October 6, 2026 | `scripts/verify_phase7.js` |
| **TC-04** | Synopsis TC04 / SRS TC04 | Ingestion of malformed/missing JSON payload (rejection) | Phase 7 | **PASSED** | October 6, 2026 | `scripts/verify_phase7.js` |
| **TC-05** | Synopsis TC05 / SRS TC04 | Out-of-bounds parameter breach (e.g. pH 9.1 triggers alert) | Phase 8 | **PASSED** | October 6, 2026 | `scripts/verify_phase8.js` |
| **TC-06** | Synopsis TC06 | Automated SMS dispatch to registered numbers upon breach | Phase 10 | **PASSED** | October 7, 2026 | `scripts/verify_phase10.js` |
| **TC-07** | Synopsis TC07 | End-to-end alert delivery latency measurement | Phase 29 | Not Started | — | Pending E2E phase |
| **TC-08** | Synopsis TC08 | Valid user authentication and role-based redirect | Phase 4 | **PASSED** | October 6, 2026 | `scripts/verify_phase4.js` |
| **TC-09** | Synopsis TC09 | Invalid password authentication failure | Phase 4 | **PASSED** | October 6, 2026 | `scripts/verify_phase4.js` |
| **TC-10** | Synopsis TC10 | Citizen access denial to Admin settings (RBAC) | Phase 5 | **PASSED** | October 6, 2026 | `scripts/verify_phase5.js` |
| **TC-11** | Synopsis TC11 / SRS TC05 | AI image screening (Clear vs Murky vs Non-water) | Phase 23 | **PASSED** | October 8, 2026 | `scripts/verify_phase23.js` |
| **TC-12** | Synopsis TC12 | Wi-Fi network disconnection and auto-reconnection recovery | Phase 28 | Not Started | — | Pending Hardware phase |

---

## 3. Phase Completion Record

### Phase 1: Project Workspace Foundation (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Initialized Git repository in project root (`git init`).
  - Created approved root module directories: `backend/`, `frontend/`, `firmware/`, `scripts/`, preserving `docs/`.
  - Added `.gitkeep` placeholders to ensure directory tracking under version control without adding premature code.
  - Authored comprehensive root `.gitignore` covering `node_modules/`, environment files (`.env*`), build/dist artifacts, test coverage, logs, IDE files, and PlatformIO embedded cache.
  - Authored root `package.json` with workspace convenience scripts only; **zero application dependencies or devDependencies installed**.
  - Preserved all authoritative planning documents in `docs/` (`IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_DECISIONS.md`, `IMPLEMENTATION_PROGRESS.md`).
  - Strictly avoided creating application code, server files, database models, UI components, firmware code, or feature logic.

### Phase 2: Backend Foundation & Server Architecture (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Initialized `backend/package.json` with Phase 2 dependencies (`express`, `dotenv`, `cors`, `helmet`, `morgan`) and start scripts (`start`, `dev`).
  - Installed Phase 2 dependencies in `backend/node_modules/` (audited with 0 vulnerabilities).
  - Created `backend/.env.example` and local `backend/.env` (correctly ignored by `.gitignore`).
  - Created `backend/src/config/env.js` for centralized environment variable management without hardcoded secrets.
  - Created `backend/src/app.js` with Phase 2 middleware: `helmet`, `cors`, `morgan`, JSON body parsers, 404 handler, centralized error handler, and `GET /health` endpoint.
  - Created `backend/server.js` with port listening, `EADDRINUSE` startup error handling, and graceful shutdown handlers (`SIGTERM`, `SIGINT`).
  - Verified server execution using `npm start` in `backend/`.
  - Tested `GET http://localhost:5000/health` with live HTTP request: verified HTTP 200 status code and JSON health response.

### Phase 3: Database Connection & Mongoose Models (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Added `mongoose` (`^8.24.5`) dependency to `backend/package.json`.
  - Created `backend/src/config/db.js` providing resilient MongoDB connection handling, error catching, and lifecycle listeners (`connected`, `error`, `disconnected`).
  - Updated `backend/.env.example`, `backend/.env`, and `backend/src/config/env.js` with `MONGODB_URI`.
  - Implemented all 7 approved core Mongoose models under `backend/src/models/`:
    1. `User.js` — User identity schema with role enum (`Admin`/`Citizen`), unique lowercase email, sparse `googleId`.
    2. `SensorNode.js` — Single prototype node identity with lat/lng location, device key hash, status enum.
    3. `Reading.js` — Multi-parameter time-series schema with numerical physical bounds and compound index `{ nodeId: 1, timestamp: -1 }`.
    4. `Threshold.js` — Parameter safe limit schema with `minimum <= maximum` validation and unique parameter enum.
    5. `Alert.js` — Breach incident schema with severity/status enums and compound index `{ status: 1, timestamp: -1 }`.
    6. `Notification.js` — Multi-channel log schema with channel (`SMS`/`Dashboard`) and delivery status tracking.
    7. `ImageCheck.js` — Water image screening audit model with classification, confidence, and advisory notice fields.
  - Integrated `connectDB` and graceful disconnection into `backend/server.js` and updated `/health` to report live DB connectivity.
  - Authored `scripts/seed_database.js` which cleanly upserts the prototype node (`NODE-01-INDORE-WARD12`), 4 provisional threshold records (clearly designated as configurable defaults, not immutable requirements), and initial development admin.
  - Ran `scripts/verify_phase3.js`: validated all 7 models loaded, initialized all MongoDB schema indexes, executed the seeder, verified persisted documents, and tested sample reading insertion/index querying.
  - Tested `GET /health` with active MongoDB connection returning HTTP 200 and `"database": "connected"`.

### Phase 4: Authentication System (Local & Google OAuth) (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Installed Phase 4 dependencies in `backend/`: `bcryptjs` (`^2.4.3`), `jsonwebtoken` (`^9.0.2`), and `google-auth-library` (`^9.10.0`).
  - Updated `backend/.env.example`, `backend/.env`, and `backend/src/config/env.js` with `JWT_SECRET`, `JWT_EXPIRES_IN`, and `GOOGLE_CLIENT_ID`.
  - Implemented modular utilities:
    - [`backend/src/utils/password.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/utils/password.js): `hashPassword` (bcrypt, cost 10) and `comparePassword`.
    - [`backend/src/utils/jwt.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/utils/jwt.js): `generateToken` and `verifyJwtToken` with minimal claims (`userId`, `role`).
  - Implemented [`backend/src/services/googleAuthService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/googleAuthService.js) using `OAuth2Client.verifyIdToken`.
  - Implemented authentication middleware [`backend/src/middleware/authMiddleware.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/middleware/authMiddleware.js) verifying Bearer tokens and attaching sanitized `req.user` (strictly without RBAC, which is reserved for Phase 5).
  - Implemented [`backend/src/controllers/authController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/authController.js):
    - `POST /api/auth/register`: validation, email normalization, duplicate check, bcrypt hashing, Citizen role enforcement, JWT issuance.
    - `POST /api/auth/login`: credential validation, bcrypt comparison, safe error responses, JWT issuance.
    - `POST /api/auth/google`: ID token verification, account provisioning/linking with default Citizen role.
    - `GET /api/auth/me`: returns authenticated profile without exposing password hashes.
  - Mounted `authRoutes` in Express app under `/api/auth`.
  - Authored and executed comprehensive test suite [`scripts/verify_phase4.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase4.js) (14/14 tests passed):
    - TC-08 verified: Valid local login succeeded with HTTP 200 and signed JWT.
    - TC-09 verified: Invalid password login failed with HTTP 401.
    - Registration, duplicate rejection, weak password rejection, and role escalation defense passed.
    - Bcrypt hash verified in MongoDB document (starts with `$2`, no plaintext).
    - `GET /api/auth/me` verified with valid token (HTTP 200), without token (HTTP 401), and with tampered token (HTTP 401).
    - Google endpoint verified: missing credential rejected (HTTP 400), invalid credential handled gracefully (HTTP 401). (Live Google account login requires client ID in production).
    - `GET /health` verified returning HTTP 200 with `database: "connected"`.
  - Zero RBAC middleware, sensor endpoints, SMS, or frontend code implemented.
  - Phases 5 through 31 remain strictly pending.

### Phase 5: Authorization & RBAC Middleware (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Implemented modular RBAC middleware [`backend/src/middleware/roleMiddleware.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/middleware/roleMiddleware.js) exporting `requireRole(allowedRoles)` strictly decoupled from authentication middleware.
  - Enforced permission checks against `req.user.role` extracted from authentic database records by `authMiddleware`.
  - Maintained strict support for only the two approved roles: `Admin` and `Citizen`.
  - Created minimal authorization test endpoints in [`backend/src/routes/authRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/authRoutes.js):
    - `GET /api/auth/admin-test`: guarded with `authenticate, requireRole(['Admin'])`.
    - `GET /api/auth/citizen-test`: guarded with `authenticate, requireRole(['Citizen', 'Admin'])`.
    - Avoided implementing premature sensor, threshold, alert, or dashboard endpoints.
  - Verified role escalation defense: client registration payloads cannot alter `role` from default `Citizen`.
  - Authored and executed automated test suite [`scripts/verify_phase5.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase5.js) (8/8 tests passed):
    - **TC-10 Verified**: Citizen token attempting Admin-only operation (`GET /api/auth/admin-test`) was denied with HTTP 403 Forbidden.
    - Admin token accessing Admin-only operation succeeded with HTTP 200 OK.
    - Citizen token accessing Citizen-permitted operation (`GET /api/auth/citizen-test`) succeeded with HTTP 200 OK.
    - Unauthenticated request to protected operation was rejected with HTTP 401 Unauthorized.
    - Tampered/invalid token to protected operation was rejected with HTTP 401 Unauthorized.
    - Role escalation attempt rejected: registration with `{ role: "Admin" }` stored user as `Citizen`; token was rejected with HTTP 403 on Admin endpoint.
    - Existing `GET /api/auth/me` identity endpoint verified with HTTP 200 OK.
    - Existing `GET /health` service endpoint verified with HTTP 200 OK and `"database": "connected"`.
  - Executed regression suite [`scripts/verify_phase4.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase4.js) (14/14 tests passed).
  - Zero rate limiting, security hardening (Phase 6), sensor ingestion (Phase 7), SMS (Phase 10), or frontend code implemented.
  - Phases 6 through 31 remain strictly Pending.

### Phase 6: Backend Security Baseline & Hardening (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Installed `express-rate-limit` (`^8.7.1`) in `backend/package.json`.
  - Configured tightened CORS origin whitelist in `backend/src/app.js` using `env.CLIENT_URL` with non-browser origin allowance and strict 403 rejection of unauthorized web origins; removed unnecessary cookie/credentials transmission.
  - Implemented modular rate limiting middleware [`backend/src/middleware/rateLimitMiddleware.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/middleware/rateLimitMiddleware.js):
    - `authRateLimiter` configured for sensitive authentication routes (`/register`, `/login`, `/google`) with configurable window and threshold (default: 20 attempts / 15 mins).
    - `apiRateLimiter` applied globally across `/api` routes (default: 200 requests / 15 mins).
    - Rate limit breaches return HTTP 429 with standard `RateLimit-*` headers and clear message.
  - Implemented request body size protection in `backend/src/app.js`: strict `10kb` limit on JSON and URL-encoded body parsers, rejecting oversized payloads with HTTP 413 Payload Too Large.
  - Implemented centralized error handling middleware [`backend/src/middleware/errorMiddleware.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/middleware/errorMiddleware.js):
    - Catches and sanitizes internal 500 errors to generic `"Internal Server Error"` without leaking stack traces, internal paths, database credentials, or secret keys.
    - Catches malformed JSON syntax errors, safely returning HTTP 400 Bad Request.
    - Catches CORS rejection, returning HTTP 403 Forbidden.
    - Catches payload limit breaches, returning HTTP 413 Payload Too Large.
    - Provides clean 404 handler for unmatched routes.
  - Strengthened environment configuration in `backend/src/config/env.js`:
    - Production validation ensuring default development `JWT_SECRET` is never used in production.
    - Guaranteed zero secret printing during startup or in API responses/logs.
  - Authored and executed comprehensive automated test harness [`scripts/verify_phase6.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase6.js) (37/37 assertions passed):
    1. Helmet security headers verified (`x-content-type-options: nosniff`, `x-dns-prefetch-control: off`, `x-frame-options: SAMEORIGIN`, `x-download-options: noopen`).
    2. CORS rejection of unauthorized origins verified (HTTP 403 + `access-control-allow-origin` omitted).
    3. CORS allowance of configured frontend origin verified (HTTP 200 + `access-control-allow-origin` present).
    4. Normal authentication verified before rate limits.
    5. Rate limiting verified: repeated authentication requests trigger HTTP 429 Too Many Requests with standard rate-limit headers.
    6. Oversized request payload rejection verified: 15KB JSON payload rejected with HTTP 413 Payload Too Large.
    7. Error handling verified: internal error suppressed to generic message; zero stack trace, filesystem path, or database credentials exposed.
    8. Malformed JSON safely rejected with HTTP 400.
    9. Secrets protection verified: `JWT_SECRET` and `passwordHash` strictly absent from responses.
    10. RBAC regression verified: Admin allowed (HTTP 200), Citizen denied (HTTP 403 / TC-10), unauthenticated denied (HTTP 401), tampered token denied (HTTP 401).
    11. `/health` verified returning HTTP 200 and `"database": "connected"`.
  - Re-executed Phase 4 (`scripts/verify_phase4.js`, 14/14 passed) and Phase 5 (`scripts/verify_phase5.js`, 8/8 passed) suites to verify zero regressions.
  - Zero sensor ingestion (Phase 7), threshold engine (Phase 8), alert lifecycle (Phase 9), SMS (Phase 10), or frontend code implemented.
  - Phases 7 through 31 remain strictly Pending.

### Phase 7: Sensor Data Ingestion API & Validation (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Implemented device credential utility [`backend/src/utils/deviceKey.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/utils/deviceKey.js) supporting SHA-256 and bcrypt hashing/verification with constant-time equality checks.
  - Implemented dedicated IoT device authentication middleware [`backend/src/middleware/deviceAuthMiddleware.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/middleware/deviceAuthMiddleware.js):
    - Authenticates requests using `x-device-key` header (401 if missing).
    - Checks required `nodeId` in payload (400 if missing).
    - Verifies referenced `SensorNode` exists in MongoDB (404 if not found).
    - Verifies device credential against stored `deviceKeyHash` (401 if invalid).
    - Verifies node is operational (`status === 'Online'`), rejecting inactive/maintenance nodes (403).
    - Attaches validated `sensorNode` to request context.
  - Implemented strict server-side payload validation [`backend/src/validators/sensorValidator.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/validators/sensorValidator.js):
    - Enforces presence and finite numeric types for `pH`, `turbidity`, `tds` (or `TDS`), and `temperature`.
    - Enforces physical domain plausibility: `0.0 <= pH <= 14.0`, `turbidity >= 0.0`, `tds >= 0.0`, `-10.0 <= temperature <= 80.0`.
    - Validates optional `timestamp` parsing.
    - Explicitly preserves valid physical readings that breach water safety thresholds (e.g. pH 9.1 accepted and stored), strictly reserving threshold/alert logic for Phase 8.
  - Implemented sensor controller [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js) persisting readings using the approved `Reading` Mongoose model, updating `SensorNode.lastSeen`, and returning sanitized HTTP 201 responses without leaking database internals.
  - Mounted modular routes [`backend/src/routes/sensorRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/sensorRoutes.js) in `backend/src/app.js` at `/api/sensor` and `/api/sensors`, supporting both `POST /api/sensor/readings` and `POST /api/sensors/reading`.
  - Authored and executed comprehensive test suite [`scripts/verify_phase7.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase7.js) (45/45 assertions passed):
    - **TC-03 Verified**: Valid sensor telemetry accepted with HTTP 201 Created and persisted in MongoDB.
    - **TC-04 Verified**: Missing, non-numeric, non-finite, and malformed payloads rejected with HTTP 400 Bad Request.
    - Missing sensor credential rejected with HTTP 401.
    - Invalid sensor credential rejected with HTTP 401.
    - Unknown SensorNode rejected with HTTP 404.
    - Inactive SensorNode rejected with HTTP 403.
    - Physically impossible values (e.g. pH 15.8, turbidity -3.5) rejected with HTTP 400.
    - Out-of-threshold valid reading (pH 9.1) verified as accepted (HTTP 201) and persisted.
    - MongoDB persistence verified with direct document query.
    - Credential isolation verified: raw device key is strictly NOT stored in Reading document.
    - Safe error responses verified: no stack traces or credentials exposed.
    - Phase 5 RBAC regression verified (Admin 200, Citizen 403 / TC-10, unauthenticated 401).
    - Phase 6 regression verified: `/health` returns 200 with `database: "connected"`, Helmet headers active, and security test suite (`scripts/verify_phase6.js`) passed 37/37 assertions.
  - Zero threshold evaluation (Phase 8), alert lifecycle (Phase 9), SMS (Phase 10), or frontend code implemented.
  - Phases 8 through 31 remain strictly Pending.

### Phase 8: Threshold Evaluation Engine (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Enhanced [`backend/src/models/Threshold.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/Threshold.js) to support `enabled` status field with default `true`.
  - Created dedicated evaluation service [`backend/src/services/thresholdService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/thresholdService.js) implementing pure, deterministic comparison:
    - `val < min` -> breach = true, direction = "LOW"
    - `val > max` -> breach = true, direction = "HIGH"
    - `min <= val <= max` -> breach = false (boundary inclusive safe values)
    - Evaluates all 4 parameters (`pH`, `turbidity`, `tds`, `temperature`) simultaneously.
    - Safely handles missing, disabled, or incomplete thresholds without crashing or false breaches.
  - Implemented Admin threshold configuration endpoints in [`backend/src/controllers/thresholdController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/thresholdController.js) and [`backend/src/routes/thresholdRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/thresholdRoutes.js):
    - `GET /api/thresholds` (Admin only)
    - `GET /api/thresholds/:parameter` (Admin only)
    - `PUT /api/thresholds/:parameter` (Admin only)
  - Implemented threshold validator [`backend/src/validators/thresholdValidator.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/validators/thresholdValidator.js) enforcing finite numbers, `min <= max`, valid parameter names, and boolean `enabled`.
  - Mounted threshold routes in `backend/src/app.js` under `/api/thresholds` protected with `authenticate` and `requireRole(['Admin'])`.
  - Integrated threshold evaluation into `backend/src/controllers/sensorController.js`: evaluates readings after persistence and updates `overallStatus` (`'Unsafe'` if breach exists, otherwise `'Safe'`), returning structured evaluation results without failing ingestion.
  - Strictly confirmed ZERO Alert documents, ZERO Notification documents, and ZERO SMS notifications created.
  - Authored and executed comprehensive test suite [`scripts/verify_phase8.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase8.js) (79/79 assertions passed):
    - **TC-05 Verified**: Out-of-bounds parameter breach (pH 9.1) correctly classified as HIGH breach (`overallStatus: "Unsafe"`).
    - Boundary tests verified: lower bound (6.5) and upper bound (8.5) classified as SAFE.
    - Below minimum (6.4) classified as LOW breach.
    - Multiple simultaneous breaches (pH, turbidity, TDS) correctly identified together.
    - Disabled threshold safely handled without breach or crash.
    - Admin retrieval and update verified (HTTP 200).
    - Invalid threshold updates rejected with HTTP 400.
    - Citizen access denied with HTTP 403 (RBAC verified).
    - Unauthenticated access denied with HTTP 401.
    - Ingestion integration verified: breach reading accepted (HTTP 201), saved, and classified.
    - Confirmed 0 Alert and 0 Notification documents created.
    - **Test Isolation & Threshold Database Restoration Verified**:
      - Pre-test snapshot of all threshold documents captured before test execution.
      - Restores all parameters and fields (`minimum`, `maximum`, `unit`, `enabled`, `updatedBy`) back to original pre-test state after threshold tests and in `finally` block.
      - Explicit assertions verify that final MongoDB threshold records match pre-test state exactly.
    - Phase 5 RBAC, Phase 6 Security, and Phase 7 Ingestion regression tests all passed.
  - Zero alert lifecycle/debounce (Phase 9), SMS (Phase 10), or frontend code implemented in Phase 8.
  - Phase 9 proceeded as scheduled.

### Phase 9: Alert Lifecycle & Configurable Debounce Logic (COMPLETED)
- **Execution Date:** October 6, 2026
- **Tasks Completed:**
  - Enhanced existing approved [`backend/src/models/Alert.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/Alert.js) model:
    - Added `direction` enum (`'LOW'`, `'HIGH'`) with default `'HIGH'`.
    - Added `thresholdMin` and `thresholdMax` to store configured operational boundaries alongside `thresholdLimit`.
    - Added `resolvedAt` timestamp (default `null`) for lifecycle tracking.
    - Added `lastBreachedAt` timestamp and `breachCount` counter for deduplication/debounce tracking.
    - Maintained existing lifecycle status terminology (`'Active'`, `'Acknowledged'`, `'Resolved'`).
    - Added compound index `{ nodeId: 1, parameter: 1, direction: 1, status: 1 }` for fast deduplication lookup.
  - Implemented modular Alert Service [`backend/src/services/alertService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/alertService.js):
    - `processReadingAlerts(reading, evaluation)`: converts threshold evaluation breaches into managed Alert documents.
    - Deduplication/debounce identity: `nodeId` + `parameter` + `direction` + `status: 'Active'`.
    - Repeated breaches update/maintain the existing active alert (`value`, `lastBreachedAt`, `readingId`, increment `breachCount`) without creating duplicate active documents.
    - Automatic resolution: when subsequent readings for a parameter return to the safe range, any active alert for that parameter transitions to `'Resolved'` with `resolvedAt` timestamp.
    - Historical preservation: resolved alerts remain permanently in MongoDB for history/auditing.
    - Independent multi-parameter lifecycle: each monitored parameter (`pH`, `turbidity`, `tds`, `temperature`) is evaluated and resolved independently.
    - Node isolation: alerts from different sensor nodes are strictly isolated.
    - Concurrency safety: catches race-condition duplicate attempts and updates existing active alerts gracefully.
  - Integrated into IoT Sensor Ingestion Controller [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js):
    - Ingestion flow: Authentication (`x-device-key`) → Validation → Reading persistence → Threshold evaluation → Alert lifecycle processing.
    - Resilience: alert processing errors do not discard or corrupt valid readings (HTTP 201 preserved).
    - Response contains sanitized alert summary (`createdCount`, `maintainedCount`, `resolvedCount`).
  - Implemented Alert API Endpoints in [`backend/src/controllers/alertController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/alertController.js) and [`backend/src/routes/alertRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/alertRoutes.js):
    - `GET /api/alerts`: paginated list of all alerts with optional filtering (`nodeId`, `parameter`, `status`). Protected for `Admin` and `Citizen`.
    - `GET /api/alerts/active`: list of all currently active alerts (`status: 'Active'`). Protected for `Admin` and `Citizen`.
    - `GET /api/alerts/history`: paginated list of resolved alerts (`status: 'Resolved'`). Protected for `Admin` and `Citizen`.
    - `GET /api/alerts/:id`: individual alert details by ID. Protected for `Admin` and `Citizen`.
    - Protected modification endpoints (`PATCH`, `POST`, `PUT`, `DELETE` on `/api/alerts`): Citizens rejected with HTTP 403 Forbidden; Admins rejected with HTTP 405 Method Not Allowed; manual alert mutation is strictly disabled and zero database modifications occur.
  - Authored and executed comprehensive automated test suite [`scripts/verify_phase9.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase9.js) (119/119 assertions passed):
    - Test 1: Safe reading ingestion → 0 alerts created.
    - Test 2: First threshold breach (pH 9.1 HIGH) → exactly 1 Active alert created with traceability fields.
    - Test 3: Repeated breach with same value → 0 new alerts created, existing alert maintained (deduplication verified).
    - Test 4: Repeated breach with changed value (pH 9.3) → existing active alert value updated, `breachCount` incremented, 1 active alert maintained.
    - Test 5: Different parameter breach (TDS 650 HIGH) → separate active alert created for TDS; 2 total active alerts.
    - Test 6: Different SensorNode breach (Node B) → separate active alert created; node isolation verified.
    - Test 7: LOW vs HIGH breaches → temperature LOW and turbidity HIGH treated as separate conditions.
    - Test 8: Reading returns to safe → active pH alert transitions to `'Resolved'` with `resolvedAt` timestamp.
    - Test 9: Resolved alert preserved in MongoDB (not deleted).
    - Test 10: New breach after resolution → new Active alert created with distinct ObjectId; both historical and active alerts coexist.
    - Test 11: Simultaneous 4-parameter breaches → separate active alerts created for each parameter.
    - Test 12: Independent resolution → safe parameters resolve while breached parameters remain active.
    - Test 13: Reading persistence verified on breach (HTTP 201 + `overallStatus: 'Unsafe'`).
    - Test 14: Traceability fields verified in Alert documents.
    - Test 15: Admin GET `/api/alerts`, `/active`, `/history` → HTTP 200.
    - Test 16: Citizen GET `/api/alerts`, `/active`, `/history` → HTTP 200.
    - Test 17: Unauthenticated GET `/api/alerts` → HTTP 401.
    - Test 18: Modification route guarding → Citizen rejected with HTTP 403 Forbidden; Admin rejected with HTTP 405 Method Not Allowed; alerts verified completely unmutated.
    - Test 19: Zero secrets or device credentials in Alert documents or API responses.
    - Test 20: Phase 8 regression: threshold evaluation correctly classifies Safe, LOW, and HIGH.
    - Test 21: Phase 7 regression: valid ingestion returns 201, malformed returns 400.
    - Test 22: Phase 6 regression: security headers active, `/health` returns 200 with database connected.
    - Test 23: Phase 10 boundary verified: 0 SMS sent, 0 Notification documents created.
    - Test isolation verified: all created test readings, alerts, sensor nodes, and users cleaned up; thresholds restored to exact pre-test state.
  - Zero SMS gateway, notification dispatch (Phase 10), or frontend code implemented in Phase 9.
  - Phase 10 proceeded as scheduled.

### Phase 10: Notification System & SMS Gateway Adapter (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Reused existing approved [`backend/src/models/Notification.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/Notification.js) model:
    - Added `'Sent'` to `deliveryStatus` enum values (`'Delivered'`, `'Sent'`, `'Failed'`, `'Pending'`, `'Simulated'`).
    - Added safe delivery metadata fields: `failureReason` (string), `provider` (string), `sentAt` (Date).
    - Preserved schema indexes and added `{ deliveryStatus: 1, timestamp: -1 }`.
    - Strictly avoided storing sensitive data (passwords, JWT secrets, device keys, or raw headers).
  - Implemented modular SMS Gateway architecture:
    - [`backend/src/services/sms/mockSmsGateway.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/sms/mockSmsGateway.js): development and testing adapter simulating SMS delivery without real credentials or external billing; clearly distinguishes mock delivery in logs without leaking secrets; supports simulated failure mode for test verification.
    - [`backend/src/services/sms/smsGateway.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/sms/smsGateway.js): provider-agnostic abstraction exposing `sendSms({ to, message, provider })`; safely defaults to mock adapter and prevents unconfigured real provider crashes.
  - Implemented Notification & SMS Recipient Configuration Service:
    - [`backend/src/services/notificationConfigService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/notificationConfigService.js): manages runtime settings (`enabled`, `provider`, `recipient`, `sender`) initialized from `backend/src/config/env.js`.
    - Provides safe masking (`maskPhoneNumber`) to protect recipient privacy (e.g. `+91******3210`).
    - Does NOT introduce unnecessary database entities, adhering strictly to the 7 core entities.
  - Implemented Notification Service:
    - [`backend/src/services/notificationService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/notificationService.js): integrates with Phase 9 Alert lifecycle.
    - Formats concise plain-language SMS: `"JalDrishti Alert: Node NODE-01 detected HIGH pH = 9.1. Safe range: 6.5–8.5."`
    - Creates Notification records with `Pending` status and dispatches via `smsGateway`.
    - Updates delivery status to `Sent` (with `gatewayResponseId`, `sentAt`, `provider`) or `Failed` (with safe `failureReason`).
    - Strictly enforces single-notification per Alert: duplicate breaches of an existing active alert generate zero repeat notifications or SMS calls.
    - Provides non-blocking execution: SMS failures never crash sensor telemetry ingestion, and readings/alerts remain fully intact.
  - Integrated into IoT Sensor Ingestion Controller:
    - Updated [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js) to trigger `notificationService.handleNewAlerts` only for newly created Active alerts (`alertsSummary.created`).
    - Returns sanitized notification summary (`sentCount`, `failedCount`, `items` with masked recipients).
  - Implemented Admin Notification API & Validation:
    - [`backend/src/validators/notificationValidator.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/validators/notificationValidator.js): validates configuration payloads (types, phone format).
    - [`backend/src/controllers/notificationController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/notificationController.js) and [`backend/src/routes/notificationRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/notificationRoutes.js):
      - `GET /api/notifications/config`: Admin only (HTTP 200), Citizen denied (HTTP 403), unauthenticated denied (HTTP 401). Guaranteed zero secrets/tokens exposed.
      - `PUT /api/notifications/config`: Admin only (HTTP 200), Citizen denied (HTTP 403), unauthenticated denied (HTTP 401).
      - `GET /api/notifications`: Admin only paginated audit log of dispatched notifications.
      - `GET /api/notifications/:id`: Admin only individual notification lookup.
    - Mounted in Express app at `/api/notifications` in [`backend/src/app.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/app.js).
  - Authored and executed automated test suite [`scripts/verify_phase10.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase10.js) (75/75 assertions passed):
    - **TC-06 Verified**: Automated SMS dispatch to registered numbers upon breach tested and logged in `Notification` collection.
    - Test 1: First breach creates exactly 1 Active Alert and 1 Notification record.
    - Test 2: SMS gateway adapter invoked exactly once with concise plain-language message and safe range limits.
    - Test 3: Mock provider records `provider: "mock"` and controlled mock message identifier.
    - Test 4: Notification delivery status becomes `'Sent'` with valid `sentAt` timestamp.
    - Test 5: Repeated breach of the same active alert creates 0 duplicate notifications and 0 additional SMS attempts.
    - Test 6: Changed measured value on active alert creates 0 duplicate notifications.
    - Test 7: Alert resolution generates 0 new SMS.
    - Test 8: New breach after resolution creates new Alert, new Notification, and dispatches new SMS.
    - Test 9: SMS delivery failure marks Notification `'Failed'`, preserves Alert and Reading in MongoDB, and sensor ingestion succeeds with HTTP 201 without crashing.
    - Test 10: Missing/disabled SMS configuration maintains operational backend (HTTP 201).
    - Test 11: Admin GET `/api/notifications/config` returns HTTP 200 with safe configuration.
    - Test 12: Admin PUT `/api/notifications/config` returns HTTP 200 and reflects masked recipient.
    - Test 13: Citizen GET and PUT `/api/notifications/config` rejected with HTTP 403 Forbidden.
    - Test 14: Unauthenticated GET and PUT `/api/notifications/config` rejected with HTTP 401 Unauthorized.
    - Test 15: Config response contains zero API keys, secrets, or auth tokens.
    - Test 16: Notification documents contain alertId, recipient, channel, deliveryStatus, timestamps, and gatewayResponseId.
    - Test 17: Notification documents contain zero passwords, device keys, JWT secrets, or authorization headers.
    - Test 18: Phase 9 regression: alert lifecycle and deduplication remain intact.
    - Test 19: Phase 8 regression: threshold classification (Safe, LOW, HIGH) verified.
    - Test 20: Phase 7 regression: valid ingestion returns 201, malformed returns 400.
    - Test 21: Phase 6 regression: security headers active, `/health` returns 200 with database connected.
    - Test 22: Phase 11 boundary verified: zero frontend UI components implemented.
    - Test 23: Phase 26+ boundary verified: zero hardware/firmware C++ code implemented.
    - Test 24: Phase 23 boundary verified: zero AI/image screening code implemented.
    - Test isolation verified: all created test notifications, alerts, readings, nodes, and users cleaned up; thresholds and notification settings restored to baseline.
  - **Real SMS Provider Limitation Explicitly Reported:**
    - SMS Gateway Adapter Architecture: TESTED & VERIFIED
    - Mock SMS Delivery Pipeline: TESTED & VERIFIED
    - Real SMS Provider Delivery: NOT LIVE-TESTED (No third-party live credentials configured)
  - Zero frontend code (Phase 11+), AI screening (Phase 23), or firmware/hardware code (Phase 26+) implemented in Phase 10.
  - Phase 11 proceeded as scheduled.

### Phase 11: Frontend Foundation (React + Vite Setup) (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Initialized React 18 SPA with Vite 5 in [`frontend/`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/):
    - Configured [`frontend/package.json`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/package.json) with baseline packages: `react` (^18.3.1), `react-dom` (^18.3.1), `vite` (^5.3.1), `@vitejs/plugin-react` (^4.3.1), `tailwindcss` (^3.4.4), `postcss` (^8.4.38), `autoprefixer` (^10.4.19).
    - Strictly avoided installing premature libraries (no Recharts, Leaflet, Axios, Redux, Zustand, auth SDKs, or UI component packages).
  - Configured build tooling and styling pipeline:
    - [`frontend/vite.config.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/vite.config.js): configured React plugin and port 5173.
    - [`frontend/postcss.config.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/postcss.config.js): configured Tailwind CSS and Autoprefixer.
    - [`frontend/tailwind.config.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/tailwind.config.js): configured content glob scanning (`./index.html`, `./src/**/*.{js,ts,jsx,tsx}`) and brand palette tokens.
    - [`frontend/src/styles/index.css`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/styles/index.css): imported `@tailwind base`, `@tailwind components`, `@tailwind utilities` with clean base typography.
    - [`frontend/index.html`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/index.html): HTML5 semantic entry point referencing `/src/main.jsx`.
  - Established modular directory architecture:
    - `src/assets/`, `src/components/`, `src/layouts/`, `src/pages/`, `src/services/`, `src/hooks/`, `src/context/`, `src/utils/`, `src/styles/`, `public/`.
  - Created reusable foundation components:
    - [`frontend/src/components/Button.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/Button.jsx): accessible semantic button with variants (`primary`, `secondary`, `outline`, `danger`), sizes (`sm`, `md`, `lg`), focus rings, and animated loading spinner.
    - [`frontend/src/components/Card.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/Card.jsx): surface elevation container with title, subtitle, footer, and body slots.
    - [`frontend/src/components/LoadingState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/LoadingState.jsx): accessible loading indicator with `role="status"` and `aria-live="polite"`.
    - [`frontend/src/components/ErrorState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/ErrorState.jsx): accessible error banner with `role="alert"` and optional retry button.
  - Created application layout shell:
    - [`frontend/src/layouts/AppLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AppLayout.jsx): responsive layout with semantic `<header>`, `<main>`, and `<footer>`, brand title, and system status indicator.
  - Created foundation verification page:
    - [`frontend/src/pages/HomePage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/HomePage.jsx): introduces JalDrishti, displays foundation status badges, exercises foundation components, and provides interactive backend `/health` connectivity test.
  - Implemented modular root composition:
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): small root component (16 lines) composing `AppLayout` and `HomePage`.
    - [`frontend/src/main.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/main.jsx): React 18 client entry point with `React.StrictMode`.
  - Implemented lightweight API service foundation:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): fetch-based client sourcing base URL from `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`.
  - Configured environment variables & file hygiene:
    - Created [`frontend/.env.example`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/.env.example) and local [`frontend/.env`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/.env) containing only non-secret `VITE_API_BASE_URL`.
    - Verified zero backend secrets (passwords, JWT secrets, database URI, device keys, SMS keys) in frontend code or environment files.
    - Updated [`.gitignore`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/.gitignore) with explicit rule `!.env.example` to ensure template tracking while ignoring actual `.env`.
  - Verified compilation and production build:
    - `npm install`: 129 packages added cleanly.
    - `npm run build`: Vite production build compiled in 20.90s, generating optimized `dist/index.html`, `dist/assets/*.css` (13.87 kB Tailwind bundle), and `dist/assets/*.js`.
    - Development server (`npx vite --port 5173`): verified live HTTP 200 responses serving HTML with Fast Refresh.
  - Authored and executed comprehensive automated test suite [`scripts/verify_phase11.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase11.js) (87/87 assertions passed):
    - Verified package configuration, dev/build scripts, absence of premature libraries.
    - Verified Vite, PostCSS, and Tailwind configurations.
    - Verified directory structure and production build assets.
    - Verified compact size of `App.jsx` (16 lines).
    - Verified foundation components (`Button`, `Card`, `LoadingState`, `ErrorState`).
    - Verified semantic layout structure in `AppLayout` and `HomePage`.
    - Verified API service base URL resolution and secret isolation.
    - Verified backend regressions (Phases 6–10): `/health` = 200, Helmet security active, CORS configured for `http://localhost:5173`, sensor ingestion rejects invalid payloads, threshold evaluation intact, alert service intact, SMS gateway intact.
    - Verified strict phase boundaries: ZERO auth UI (Phase 13), ZERO dashboard UI (Phase 14–16), ZERO charts (Phase 17), ZERO alert UI (Phase 18), ZERO maps (Phase 19), ZERO AI screening (Phase 23), ZERO firmware/hardware C++ code (Phase 26+).
  - Phases 12 through 31 remain strictly Pending.

### Phase 12: Full Component Architecture & CSS Tokens (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Established clean, modular reusable component structure under `frontend/src/components/`:
    - `components/common/`: [`Button.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/Button.jsx) (variants: primary, secondary, outline, danger, ghost; sizes: sm, md, lg; focus rings; disabled/loading states), [`Card.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/Card.jsx) (surface elevation container with title, subtitle, headerAction, footer, variant, and children slots), [`Badge.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/Badge.jsx) (semantic status indicators: safe, caution, unsafe, info, neutral; dot indicator; sizes: sm, md), [`Divider.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/Divider.jsx) (subtle horizontal rule with optional center label).
    - `components/layout/`: [`Container.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/layout/Container.jsx) (responsive wrapper with max-width scaling: sm, default, full), [`PageHeader.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/layout/PageHeader.jsx) (semantic page header with title, description, badge, and actions slots), [`SectionHeader.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/layout/SectionHeader.jsx) (sub-section title and description with action slot).
    - `components/feedback/`: [`LoadingState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/feedback/LoadingState.jsx) (accessible animated spinner with `role="status"` and `aria-live="polite"`), [`ErrorState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/feedback/ErrorState.jsx) (accessible error banner with `role="alert"` and retry action), [`EmptyState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/feedback/EmptyState.jsx) (reusable placeholder with icon, heading, description, and action button).
    - Central barrel export: [`components/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/index.js) exporting all foundation components.
    - Preserved 100% backward compatibility: Top-level components (`Button.jsx`, `Card.jsx`, `LoadingState.jsx`, `ErrorState.jsx`) re-export their canonical implementations from `common/` and `feedback/`.
  - Centralized design and CSS tokens:
    - [`frontend/tailwind.config.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/tailwind.config.js): configured brand oceanic blue palette (`brand-50` to `brand-900`), water safety semantic status tokens (`status-safe`, `status-caution`, `status-unsafe`, `status-info`), card shadow tokens (`card`, `card-hover`), and card radius tokens (`card`).
    - [`frontend/src/styles/index.css`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/styles/index.css): imported `@tailwind base`, `@tailwind components`, `@tailwind utilities` and added centralized `.focus-ring` utility.
  - Refactored layout and pages to consume component primitives:
    - [`frontend/src/layouts/AppLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AppLayout.jsx): consumes layout `Container` and semantic `Badge` primitives; maintains semantic `<header>`, `<main>`, and `<footer>`.
    - [`frontend/src/pages/HomePage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/HomePage.jsx): consumes `PageHeader`, `SectionHeader`, `Card`, `Button`, `Badge`, `Divider`, `EmptyState`, `LoadingState`, and `ErrorState` while keeping backend `/health` test active.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): remains clean root composition component (16 lines, strictly < 50 lines).
  - Dependency discipline maintained:
    - Zero new libraries installed (no Recharts, Leaflet, Axios, Redux, Zustand, React Router, or UI component packages).
  - Production build verified:
    - `npm run build`: Vite build succeeded in 5.69s (16.87 kB CSS bundle, 157.77 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase12.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase12.js): **93/93 assertions passed**.
    - Verified component hierarchy, barrel export, design tokens, build bundle, dependency discipline, and strict phase boundary enforcement.
    - Verified full backend regression (Phases 6–10): `/health` endpoint HTTP 200, Helmet headers, CORS whitelist, sensor ingestion rejection on invalid payloads, threshold evaluation engine, alert service, and SMS notification adapter.
  - Strictly avoided implementing Phase 13+ functionality:
    - Zero authentication UI, zero dashboards, zero charts, zero maps, zero alert UI, zero settings, zero AI screening, zero firmware C++ code.
  - Phases 13 through 31 remain strictly Pending.

### Phase 13: Authentication UI (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Implemented centralized authentication context and state management:
    - [`frontend/src/context/AuthContext.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/context/AuthContext.jsx): provides `user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register`, `googleLogin`, and `logout`.
    - Restores session on mount by checking `jaldrishti_auth_token` in `localStorage` and validating with backend `GET /api/auth/me`.
    - Automatically purges invalid or expired tokens upon authentication failure.
    - [`frontend/src/hooks/useAuth.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useAuth.js): custom hook for consuming auth context throughout the UI tree.
  - Implemented dedicated authentication pages consuming Phase 12 design tokens and components:
    - [`frontend/src/pages/LoginPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/LoginPage.jsx): email and password form (`type="password"`, never logged), input validation, backend error banners (`ErrorState`), link to registration, and Google Sign-In button. Redirects to previous location or root upon success.
    - [`frontend/src/pages/RegisterPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/RegisterPage.jsx): full name, email, optional mobile phone number, password, confirm password, validation rules, backend error banners, and link to login. Strictly creates 'Citizen' accounts on the server; zero role selection in UI.
  - Implemented reusable form and security components:
    - [`frontend/src/components/common/Input.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/Input.jsx): accessible form input supporting labels, errors, helper text, required markers, and keyboard focus rings.
    - [`frontend/src/components/common/GoogleLoginButton.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/GoogleLoginButton.jsx): integration with Google Identity Services (`window.google.accounts.id`), reading `VITE_GOOGLE_CLIENT_ID` from environment. Includes clear, accessible feedback when credentials are unconfigured without faking authentication or leaking secrets.
    - [`frontend/src/components/common/ProtectedRoute.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/ProtectedRoute.jsx): route protection guard displaying accessible `LoadingState` during session verification and redirecting unauthenticated users to `/login`.
  - Upgraded API client service:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): injected `Authorization: Bearer <token>` automatically on authenticated requests; added canonical endpoint methods for `auth.login`, `auth.register`, `auth.google`, and `auth.getMe`.
  - Configured client-side routing & application composition:
    - Added `react-router-dom` (^7.18.4) dependency.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): compact root component (37 lines <= 50 lines) composing `AuthProvider`, `BrowserRouter`, `AppLayout`, public routes (`/login`, `/register`), and `ProtectedRoute` wrapping root `/`.
    - [`frontend/src/layouts/AppLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AppLayout.jsx): displays user identity (name, email, role badge) and "Sign Out" button when authenticated, or "Sign In" and "Sign Up" links when unauthenticated.
  - Security hygiene & secret isolation:
    - Updated [`frontend/.env.example`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/.env.example) and local [`frontend/.env`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/.env) with non-secret `VITE_GOOGLE_CLIENT_ID` placeholder.
    - Strictly verified zero passwords, JWT secrets, database URIs, Google client secrets, SMS keys, or sensor keys in frontend code or storage.
    - Passwords and JWT tokens are never logged to browser console.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 6.08s (19.72 kB CSS bundle, 208.77 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase13.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase13.js): **90/90 assertions passed**.
    - Live backend tests verified: `POST /api/auth/register` (HTTP 201 + Citizen role), `POST /api/auth/login` (HTTP 200 + JWT), bad password rejection (HTTP 401), `GET /api/auth/me` with Bearer token (HTTP 200), `GET /api/auth/me` without token (HTTP 401), and `POST /api/auth/google` contract rejection on missing credential (HTTP 400).
    - Verified full backend regression (Phases 6–10): `/health` endpoint HTTP 200, Helmet headers, sensor ingestion rejection on invalid payloads, threshold evaluation engine, alert service, and SMS notification adapter.
  - Strict phase boundaries preserved:
    - Zero Admin Dashboard (Phase 14), zero Citizen Dashboard (Phase 15), zero live monitoring cards (Phase 16), zero charts (Phase 17), zero alerts UI (Phase 18), zero map UI (Phase 19), zero settings UI (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero firmware C++ code (Phase 26+).
  - Phases 14 through 31 remain strictly Pending.

### Phase 14: Admin Dashboard Layout & Overview (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Implemented role-based route protection guard:
    - [`frontend/src/components/common/RoleRoute.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/common/RoleRoute.jsx): verifies server-authorized role against `allowedRoles = ['Admin']`. Unauthenticated users are redirected to `/login`, while unauthorized roles (e.g. Citizen) receive an accessible Access Denied state, preventing infinite redirect loops. Re-exported top-level via [`RoleRoute.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/RoleRoute.jsx) and [`components/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/index.js).
  - Configured Admin routing & application composition:
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): added `/admin` route wrapped inside `<RoleRoute allowedRoles={['Admin']}>` (47 lines <= 50 lines).
    - [`frontend/src/layouts/AppLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AppLayout.jsx): updated header to provide direct "Admin Portal" link when authenticated user possesses the `Admin` role.
  - Implemented reusable Admin Layout & Navigation:
    - [`frontend/src/layouts/AdminLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AdminLayout.jsx): responsive administration shell supporting collapsible mobile navigation and desktop sidebar.
    - [`frontend/src/components/admin/AdminHeader.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminHeader.jsx): administration top bar displaying administrator identity, Citizen Portal link, sign-out action, and mobile navigation toggle.
    - [`frontend/src/components/admin/AdminSidebar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminSidebar.jsx): navigation menu highlighting active System Overview (`/admin`) and clearly badging upcoming sections with phase tags (Phase 18, Phase 20, Phase 21) to eliminate dead or deceptive links.
  - Implemented Administrative Overview Page & Components:
    - [`frontend/src/pages/admin/AdminDashboardPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/admin/AdminDashboardPage.jsx): dedicated administrator control plane aggregating live infrastructure health, active alert counts, configured threshold limits, and SMS gateway status.
    - [`frontend/src/components/admin/AdminStatCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminStatCard.jsx): reusable metric display with value, subtitle, status badges (`safe`, `caution`, `unsafe`, `info`), and elevation shadows.
    - [`frontend/src/components/admin/SystemStatusCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/SystemStatusCard.jsx): verified infrastructure health grid (MongoDB connection, API uptime, active threshold parameters, and SMS gateway mode).
    - [`frontend/src/components/admin/RecentAlertsCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/RecentAlertsCard.jsx): read-only table of recent alert violations with timestamp, node, parameter, value, severity, and status. Displays `EmptyState` when zero alerts are present. Strictly read-only; alert resolution controls are preserved for Phase 18.
  - Implemented telemetry aggregation hook & API methods:
    - [`frontend/src/hooks/useAdminOverview.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useAdminOverview.js): fetches real telemetry from existing backend endpoints via `Promise.allSettled` (`/health`, `/api/alerts/active`, `/api/alerts?limit=5`, `/api/thresholds`, `/api/notifications/config`). Manages `loading`, `error`, and `refetch`. Zero fake metrics or hardcoded statistics.
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.admin` helpers with automatic Bearer token injection.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 5.62s (21.92 kB CSS bundle, 224.32 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase14.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase14.js): **68/68 assertions passed**.
    - Live backend tests verified: Admin login (HTTP 200), Citizen login (HTTP 200), Admin authorized access to `/api/thresholds` and `/api/notifications/config` (HTTP 200), Citizen RBAC denial to Admin endpoints (HTTP 403 / TC-10), unauthenticated rejection to `/api/alerts/active` (HTTP 401).
    - Verified full backend regression (Phases 6–10): `/health` endpoint HTTP 200, Helmet headers, sensor ingestion rejection on invalid payloads, threshold evaluation engine, alert service, and SMS notification adapter.
  - Strict phase boundaries preserved:
    - Zero Citizen Dashboard (Phase 15), zero live monitoring cards (Phase 16), zero charts (Phase 17), zero alert acknowledgment/management controls (Phase 18), zero map UI (Phase 19), zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero firmware C++ code (Phase 26+).
  - Phases 15 through 31 remain strictly Pending.

### Phase 15: Citizen Dashboard & Plain-Language View (COMPLETED)
- **Execution Date:** October 7, 2026
- **Tasks Completed:**
  - Implemented backend latest reading endpoint:
    - [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js): added `getLatestReading` returning sanitized, citizen-safe latest reading (`pH`, `turbidity`, `tds`, `temperature`, `overallStatus`, `nodeId`, `nodeName`, `location`, `timestamp`).
    - [`backend/src/routes/sensorRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/sensorRoutes.js): mounted `GET /api/sensor/readings/latest` and `GET /api/sensor/latest` protected via `authenticate` and `requireRole(['Citizen', 'Admin'])`.
  - Configured Citizen routing & role-based access:
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): added `/citizen` route guarded by `<RoleRoute allowedRoles={['Citizen', 'Admin']}>` (33 lines <= 50 lines). Unauthenticated users are redirected to `/login`, Citizens gain direct access, and Admins can view in preview mode.
    - [`frontend/src/layouts/AppLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/AppLayout.jsx): updated header with direct navigation link to "Citizen Dashboard" (or "Citizen View" for Admins).
  - Implemented reusable Citizen Layout:
    - [`frontend/src/layouts/CitizenLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/CitizenLayout.jsx): clean, public-facing layout shell with citizen branding. Features a prominent dark banner when viewed by an Administrator ("Admin Preview Mode") with an instant return link to `/admin`.
  - Implemented Plain-Language Citizen Components:
    - [`frontend/src/components/citizen/WaterQualityStatusCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/WaterQualityStatusCard.jsx): prominent plain-language status card displaying `Safe` (green), `Needs Attention` (amber), or `Unsafe` (red) based on backend `overallStatus`. Sourced from monitoring data without unverified potable claims.
    - [`frontend/src/components/citizen/ParameterCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/ParameterCard.jsx): human-readable cards for all 4 parameters: pH (6.5 – 8.5), Turbidity (NTU), TDS (ppm), Temperature (°C), displaying values, units, reference safe ranges, and semantic badges.
    - [`frontend/src/components/citizen/AdvisoryCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/AdvisoryCard.jsx): plain-language guidance card corresponding to active condition. Advises cautious usage when thresholds are breached while strictly avoiding medical advice or potable water certification claims.
    - [`frontend/src/components/citizen/LatestReadingCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/LatestReadingCard.jsx): displays station name, station ID, location, formatted timestamp, and active alert warnings. Strictly read-only; zero alert management controls.
  - Implemented Citizen Telemetry Hook & API Methods:
    - [`frontend/src/hooks/useCitizenOverview.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useCitizenOverview.js): fetches latest reading and active alerts via `Promise.allSettled` without live polling or WebSockets. Handles `loading`, `error`, `reading`, `activeAlerts`, and `refetch`.
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.citizen` helpers (`getLatestReading`, `getActiveAlerts`).
  - Implemented Citizen Dashboard Page:
    - [`frontend/src/pages/citizen/CitizenDashboardPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenDashboardPage.jsx): clean overview page providing accessible `LoadingState`, `ErrorState` with retry, and `EmptyState` when zero readings exist.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 6.18s (23.28 kB CSS bundle, 238.31 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase15.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase15.js): **63/63 assertions passed**.
    - Live backend tests verified: Citizen login (HTTP 200), Admin login (HTTP 200), Citizen authorized access to `GET /api/sensor/readings/latest` (HTTP 200), Admin preview access to latest readings (HTTP 200), unauthenticated rejection to latest reading (HTTP 401), Citizen RBAC denial to Admin endpoints (HTTP 403 / TC-10).
    - Verified full backend regression (Phases 6–10, 14): `/health` endpoint HTTP 200, Helmet headers, sensor ingestion rejection on invalid payloads, threshold evaluation engine, alert service, SMS notification adapter, and Admin alert access.
  - Strict phase boundaries preserved:
    - Zero live polling, zero WebSockets, zero live sensor widgets (Phase 16), zero charts (Phase 17), zero alert resolution/acknowledgment controls (Phase 18), zero map UI (Phase 19), zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero firmware C++ code (Phase 26+).
  - Phases 16 through 31 remain strictly Pending.

### Phase 16: Live Monitoring & Parameter Cards (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Implemented controlled live telemetry polling hook:
    - [`frontend/src/hooks/useLiveMonitoring.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useLiveMonitoring.js): custom hook providing automatic, controlled polling (default: 30s configurable via `VITE_MONITORING_POLL_INTERVAL_MS`). Features immediate mount fetch, timer cleanup on unmount, in-flight overlapping request prevention (`isFetchingRef`), unmount memory leak prevention (`isMountedRef`), tab visibility pause, telemetry freshness calculation against threshold (default: 5m configurable via `VITE_MONITORING_STALE_AFTER_MS`), and manual refresh with error resilience (preserves previous valid telemetry data if subsequent polling fails). Contains zero UI markup.
  - Implemented reusable live parameter cards:
    - [`frontend/src/components/citizen/LiveParameterCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/LiveParameterCard.jsx): renders individual sensor metrics (pH, Turbidity, TDS, Temperature) with authoritative backend threshold statuses (`Safe`, `Low` / below range, `High` / above range, `Unknown`), configured permissible range, safe numeric formatting without data fabrication, and subtle stale condition indicators.
  - Implemented live monitoring freshness & status bar:
    - [`frontend/src/components/citizen/LiveMonitoringBar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/LiveMonitoringBar.jsx): accessible status header communicating real-time telemetry freshness (`Live / Fresh`, `Telemetry is Stale`, `Updating...`, `Offline / Unavailable`), formatted last updated timestamp, accessible "Refresh readings" button with active spinner and duplicate-request protection, and accessible stale notice alert regions.
  - Updated Citizen Dashboard integration:
    - [`frontend/src/pages/citizen/CitizenDashboardPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenDashboardPage.jsx): connected to `useLiveMonitoring` hook and composed of PageHeader, LiveMonitoringBar, WaterQualityStatusCard, 4 LiveParameterCards, AdvisoryCard, and LatestReadingCard. Accessible LoadingState, ErrorState with retry, and EmptyState when zero readings exist.
    - [`frontend/src/components/citizen/WaterQualityStatusCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/WaterQualityStatusCard.jsx): enhanced to support `Unknown` status and visual `Stale Telemetry` badge while strictly avoiding unverified potable water claims.
    - [`frontend/src/components/citizen/LatestReadingCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/LatestReadingCard.jsx): displays station context (nodeId, name, location, telemetry timestamp, and station `nodeLastSeen`).
    - [`frontend/src/components/citizen/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/index.js): exported citizen components cleanly.
  - Backend authoritative evaluation integration:
    - [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js): enhanced `getLatestReading` to evaluate reading against active thresholds via `thresholdService.evaluateAndClassify`, returning sanitized `parameters` status mapping (`Safe`, `Low`, `High`, `Unknown`), configured limits, and station `nodeLastSeen`, preserving all Phase 15 fields.
  - Documented environment configurations:
    - [`frontend/.env.example`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/.env.example): documented non-secret `VITE_MONITORING_POLL_INTERVAL_MS=30000` and `VITE_MONITORING_STALE_AFTER_MS=300000`.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 13.99s (24.20 kB CSS bundle, 245.16 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase16.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase16.js): **89/89 assertions passed**.
    - Live backend tests verified: Citizen login (HTTP 200), Admin login (HTTP 200), Citizen authorized access to `GET /api/sensor/readings/latest` (HTTP 200), authoritative parameter statuses evaluated (`Safe` and `High` on threshold breach), node lastSeen retrieval, Admin preview access (HTTP 200), unauthenticated rejection (HTTP 401), Citizen RBAC denial to Admin endpoints (HTTP 403 / TC-10).
    - Verified full backend regression (Phases 6–10, 14, 15): `/health` endpoint HTTP 200, Helmet headers, sensor ingestion rejection on invalid payloads, threshold evaluation engine, alert service, SMS notification adapter, Admin alert access, and Phase 15 verification (`63/63 passed`).
  - Strict phase boundaries preserved:
    - Zero charts / Recharts (Phase 17), zero alert resolution/acknowledgment controls (Phase 18), zero map UI / Leaflet (Phase 19), zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero WebSockets / socket.io, zero firmware C++ code (Phase 26+).
  - Phases 17 through 31 remain strictly Pending.

### Phase 17: Historical Trends & Recharts Analytics (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Implemented historical readings backend endpoint:
    - [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js): added `getHistoricalReadings` supporting bounded time-range queries (`from`, `to`), safe clamped result limits (`limit`, max 1000, default 100), optional `nodeId` filter, and sanitized telemetry fields (`id`, `nodeId`, `pH`, `turbidity`, `tds`, `temperature`, `overallStatus`, `timestamp`).
    - [`backend/src/routes/sensorRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/sensorRoutes.js): mounted `GET /api/sensor/readings/history` and `GET /api/sensor/history` protected via `authenticate` and `requireRole(['Citizen', 'Admin'])`.
    - [`backend/src/models/Reading.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/Reading.js): added single-field index `{ timestamp: -1 }` complementing `{ nodeId: 1, timestamp: -1 }` for high-performance time-series queries.
  - Implemented Recharts visualization components:
    - Installed `recharts` (`^3.10.1`) in frontend dependencies with zero unapproved chart libraries.
    - [`frontend/src/components/charts/TrendChart.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/charts/TrendChart.jsx): reusable, responsive AreaChart visualizing time-series points with formatted X/Y axes, custom tooltips showing reading values, timestamps, and overall status, and ReferenceLine indicators for configured threshold boundaries.
    - [`frontend/src/components/charts/ChartContainer.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/charts/ChartContainer.jsx): consistent wrapper card displaying metric title, unit badge, standard reference limits, and latest reading badge.
    - [`frontend/src/components/charts/ChartEmptyState.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/charts/ChartEmptyState.jsx): honest empty state displayed when no telemetry exists for a given range without sample data fabrication.
    - [`frontend/src/components/charts/TimeRangeSelector.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/charts/TimeRangeSelector.jsx): accessible button group for standard duration horizons (`1h`, `6h`, `24h`, `7d`).
    - [`frontend/src/components/charts/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/charts/index.js): export barrel for charts components.
  - Implemented historical telemetry hook:
    - [`frontend/src/hooks/useHistoricalReadings.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useHistoricalReadings.js): custom hook managing time-range selection (default: `24h`), bounded fetch queries via `api.citizen.getHistoricalReadings`, data transformation, loading, error, and manual refresh. Strictly avoids continuous polling.
  - Implemented dedicated Historical Trends page & navigation:
    - [`frontend/src/pages/citizen/CitizenTrendsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenTrendsPage.jsx): dedicated view presenting 4 separate parameter charts (pH, Turbidity, TDS, Temperature) with individual Y-axis domains to prevent scale clashes, TimeRangeSelector, manual refresh, LoadingState, ErrorState, and EmptyState.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): registered `/citizen/trends` guarded by `<RoleRoute allowedRoles={['Citizen', 'Admin']}>` (35 lines <= 50 lines).
    - [`frontend/src/layouts/CitizenLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/CitizenLayout.jsx): added top-bar navigation between Live Overview and Historical Trends.
    - [`frontend/src/pages/citizen/CitizenDashboardPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenDashboardPage.jsx): added quick action link to Historical Trends.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 11.96s (25.92 kB CSS bundle, 626.83 kB JS bundle).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase17.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase17.js): **69/69 assertions passed**.
    - Live backend tests verified: Citizen login (HTTP 200), Admin login (HTTP 200), Citizen authorized access to `GET /api/sensor/readings/history` (HTTP 200), Admin preview access (HTTP 200), unauthenticated rejection (HTTP 401), bounded time-filtering (`from`), bounded query limit, sanitized telemetry fields, and Citizen RBAC denial to Admin endpoints (HTTP 403 / TC-10).
    - Full regressions verified: Phase 14 (`68/68 passed`), Phase 15 (`63/63 passed`), Phase 16 (`89/89 passed`), and backend core tests (Phases 6–10).
  - Strict phase boundaries preserved:
    - Zero alert resolution/acknowledgment controls (Phase 18), zero map UI / Leaflet (Phase 19), zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero WebSockets / socket.io, zero firmware C++ code (Phase 26+).
  - Phases 18 through 31 remain strictly Pending.

### Phase 18: Alert History & Alert UI (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Inspected existing Phase 9 backend alert architecture:
    - Reused existing canonical backend endpoints: `GET /api/alerts`, `GET /api/alerts/active`, `GET /api/alerts/history`, `GET /api/alerts/:id`.
    - Confirmed existing RBAC requires authentication and allows both `Citizen` and `Admin`.
    - Confirmed manual mutations (`PATCH`, `POST`, `DELETE`) return `HTTP 405 Method Not Allowed`, preserving authoritative automated alert lifecycle.
  - Implemented frontend API service methods:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.alerts.getAll`, `api.alerts.getActive`, `api.alerts.getHistory`, and `api.alerts.getById`.
  - Implemented custom alerts management hook:
    - [`frontend/src/hooks/useAlerts.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useAlerts.js): handles active alerts, historical/resolved alerts, combined alerts, filter state (`status`, `parameter`, `direction`), manual refresh (`refetch`), and alert detail inspection (`fetchAlertDetail`). Strictly avoids continuous polling.
  - Implemented modular Alert UI components:
    - [`frontend/src/components/alerts/AlertStatusBadge.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/AlertStatusBadge.jsx): semantic badges distinguishing `Active Breach` (pulsing rose indicator), `Acknowledged` (amber), and `Resolved` (emerald checkmark). Complies with accessibility by combining text labels with visual tokens.
    - [`frontend/src/components/alerts/AlertCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/AlertCard.jsx): authoritative card displaying parameter, station node, LOW/HIGH direction badge, status badge, measured value, threshold limit, breach count, detection timestamp, last breach / resolution timestamp, and expandable detail inspection drawer. Strictly READ-ONLY with zero mutation controls.
    - [`frontend/src/components/alerts/AlertFilters.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/AlertFilters.jsx): citizen-friendly filters for Status (All/Active/Resolved), Parameter (All/pH/Turbidity/TDS/Temperature), and Direction (All/HIGH/LOW) with count indicator and filter reset.
    - [`frontend/src/components/alerts/AlertList.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/AlertList.jsx): list container for alert cards with built-in EmptyState handling.
    - [`frontend/src/components/alerts/AlertDetailModal.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/AlertDetailModal.jsx): detail inspection dialog displaying authoritative backend telemetry fields without exposing sensitive secrets or credentials.
    - [`frontend/src/components/alerts/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/alerts/index.js): clean component export barrel.
  - Implemented dedicated Alert History page & navigation:
    - [`frontend/src/pages/citizen/CitizenAlertsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenAlertsPage.jsx): dedicated view featuring page header with manual refresh, overview summary stat cards (Active Alerts, Resolved Alerts, Total Lifetime Alerts, Total Telemetry Breaches), prototype disclaimer notice, prominent Active Alerts section, Historical Records section with filters, LoadingState, ErrorState with retry, and EmptyState for 0 alerts.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): mounted `/citizen/alerts` route protected via `<RoleRoute allowedRoles={['Citizen', 'Admin']}>`.
    - [`frontend/src/layouts/CitizenLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/CitizenLayout.jsx): added top navigation link to Alerts.
    - [`frontend/src/pages/citizen/CitizenDashboardPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenDashboardPage.jsx): added quick action link button to Alert History.
    - [`frontend/src/components/admin/AdminSidebar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminSidebar.jsx): linked Alert History item to `/citizen/alerts`.
    - [`frontend/src/components/admin/RecentAlertsCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/RecentAlertsCard.jsx): added quick link to view full alerts page and normalized timestamp display.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 16.93s (`dist/assets/index-YwUJ9hTT.css`, `dist/assets/index-o6E5u365.js`).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase18.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase18.js): **59/59 assertions passed**.
    - Live backend tests verified: Citizen login (HTTP 200), Admin login (HTTP 200), Citizen authorized access to `GET /api/alerts/active` (HTTP 200), `GET /api/alerts/history` (HTTP 200), `GET /api/alerts/:id` (HTTP 200), Admin authorized access (HTTP 200), unauthenticated rejection (HTTP 401), and rejection of manual mutations (HTTP 405).
    - Full regressions verified: Phase 14 (`68/68 passed`), Phase 15 (`63/63 passed`), Phase 16 (`89/89 passed`), Phase 17 (`69/69 passed`), and backend core tests (Phases 6–10).
  - Strict phase boundaries preserved:
    - Zero alert mutation controls (no acknowledge/resolve buttons; Phase 18 is strictly read-only), zero map UI / Leaflet (Phase 19), zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero WebSockets / socket.io, zero firmware C++ code (Phase 26+).
  - Phases 19 through 31 remain strictly Pending.

### Phase 19: Map & Sensor Node Location (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Inspected existing `SensorNode` architecture and confirmed location schema:
    - [`backend/src/models/SensorNode.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/SensorNode.js): location fields already existed with strict coordinate validation (`latitude`: min -90, max 90; `longitude`: min -180, max 180; `address`: String).
  - Implemented sensor node backend endpoint:
    - [`backend/src/controllers/sensorController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/sensorController.js): added `getSensorNodes` method querying registered sensor nodes and sanitizing returned payloads (`nodeId`, `name`, `location: { latitude, longitude, address }`, `hasValidLocation`, `status`, `lastSeen`). Strictly excludes `deviceKeyHash` and internal secrets.
    - [`backend/src/routes/sensorRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/sensorRoutes.js): mounted `GET /api/sensor/nodes` protected with `authenticate` and `requireRole(['Citizen', 'Admin'])`.
  - Installed and configured Leaflet and react-leaflet:
    - Installed `leaflet` (`^1.9.4`) and `react-leaflet` (`^4.2.1`) into `frontend/package.json`.
    - Integrated standard OpenStreetMap tile layers with compliant attribution.
  - Implemented frontend API methods:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.nodes.getAll`, `api.nodes.getLatestReading`, and `api.citizen.getNodes`.
  - Implemented custom map hook:
    - [`frontend/src/hooks/useSensorNodes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useSensorNodes.js): manages node retrieval, coordinate validation, integration with latest sensor readings and active alert counts, loading, error handling, and strictly manual refresh (`refetch`). Avoids aggressive continuous polling loops.
  - Implemented component-based Map architecture:
    - [`frontend/src/components/map/MapLegend.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/map/MapLegend.jsx): accessible legend explaining node status tokens (Online Normal, Active Alert Breach, Offline/Standby).
    - [`frontend/src/components/map/SensorNodeMarker.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/map/SensorNodeMarker.jsx): custom SVG `L.divIcon` marker reflecting node operational state and alert status, with interactive Popup displaying node metadata, coordinates, last seen, live parameter readings, and active alerts. Strictly READ-ONLY.
    - [`frontend/src/components/map/WaterQualityMap.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/map/WaterQualityMap.jsx): responsive MapContainer with OpenStreetMap tiles, automatic centering on the configured prototype node, floating legend overlay, and EmptyState fallback for missing or invalid coordinates.
    - [`frontend/src/components/map/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/map/index.js): component export barrel.
  - Implemented dedicated Geospatial Map page & navigation:
    - [`frontend/src/pages/citizen/CitizenMapPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenMapPage.jsx): dedicated view featuring PageHeader with manual refresh, educational prototype notice, station summary cards, interactive map section, and EmptyState / LoadingState / ErrorState handling.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): mounted `/citizen/map` route guarded by `<RoleRoute allowedRoles={['Citizen', 'Admin']}>`.
    - [`frontend/src/layouts/CitizenLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/CitizenLayout.jsx): added `Node Map` navigation link in top navbar.
    - [`frontend/src/components/admin/AdminSidebar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminSidebar.jsx): added `Geospatial Node Map` navigation link to `/citizen/map`.
    - [`frontend/src/components/citizen/LatestReadingCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/citizen/LatestReadingCard.jsx): added quick link button to `View Map 📍`.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 10.92s (`dist/assets/index-Dc5uSCOl.css`, `dist/assets/index-C6ra0V3e.js`).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase19.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase19.js): **57/57 assertions passed**.
    - Live backend tests verified: Citizen login (HTTP 200), Admin login (HTTP 200), Citizen authorized access to `GET /api/sensor/nodes` (HTTP 200), Admin preview access (HTTP 200), unauthenticated rejection (HTTP 401), coordinate retrieval and range validation, zero `deviceKeyHash` leakage, and Citizen RBAC denial to Admin endpoints (HTTP 403 / TC-10).
    - Full regressions verified: Phase 14 (`68/68 passed`), Phase 15 (`63/63 passed`), Phase 16 (`89/89 passed`), Phase 17 (`69/69 passed`), Phase 18 (`59/59 passed`), and backend core tests (Phases 6–10).
  - Strict phase boundaries preserved:
    - Zero node provisioning or CRUD controls (no add/edit/delete node), zero alert mutation controls, zero threshold settings forms (Phase 20), zero SMS settings forms (Phase 20), zero CSV reports (Phase 21), zero AI screening (Phase 23), zero WebSockets / socket.io, zero firmware C++ code (Phase 26+).
  - Phases 20 through 31 remain strictly Pending.

### Phase 20: Admin Settings — Threshold Configuration & SMS/Notification Settings (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Inspected existing backend threshold and notification architecture:
    - [`backend/src/models/Threshold.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/models/Threshold.js): verified parameter schema (`parameter`, `minimum`, `maximum`, `unit`, `enabled`, `updatedBy`).
    - [`backend/src/services/thresholdService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/thresholdService.js): authoritative threshold evaluation and classification engine with runtime persistence.
    - [`backend/src/routes/thresholdRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/thresholdRoutes.js): endpoints `GET /api/thresholds`, `GET /api/thresholds/:parameter`, and `PUT /api/thresholds/:parameter` protected by `authenticate` and `requireRole(['Admin'])`.
    - [`backend/src/services/notificationConfigService.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/services/notificationConfigService.js): safe in-memory notification settings with phone number masking and zero secret leakage.
    - [`backend/src/routes/notificationRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/notificationRoutes.js): endpoints `GET /api/notifications/config` and `PUT /api/notifications/config` protected by `authenticate` and `requireRole(['Admin'])`.
  - Implemented frontend API methods:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.thresholds.getAll`, `api.thresholds.getByParam`, `api.thresholds.update`, `api.notifications.getConfig`, `api.notifications.updateConfig`, and `api.notifications.getAll`.
  - Implemented custom state hook:
    - [`frontend/src/hooks/useAdminSettings.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useAdminSettings.js): coordinates threshold and notification config loading, parameter-specific save feedback, granular saving states, and error handling.
  - Implemented component-based Settings architecture:
    - [`frontend/src/components/admin/settings/SettingField.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/settings/SettingField.jsx): reusable form field wrapper with label, helper description, and accessible error message.
    - [`frontend/src/components/admin/settings/ThresholdRow.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/settings/ThresholdRow.jsx): dedicated parameter card supporting inline numeric inputs, minimum/maximum comparison validation, enabled toggle switch, unsaved changes detection, revert button, and loading/success/error indicators.
    - [`frontend/src/components/admin/settings/ThresholdSettings.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/settings/ThresholdSettings.jsx): Section A container rendering all 4 parameter rows (pH, Turbidity, TDS, Temperature), operational integration explanations, and prominent early-warning disclaimer.
    - [`frontend/src/components/admin/settings/NotificationSettings.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/settings/NotificationSettings.jsx): Section B container for automated SMS toggling, provider selector, masked recipient phone configuration with E.164 validation, sender tag input, and zero-secret policy disclosures.
    - [`frontend/src/components/admin/settings/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/settings/index.js): component barrel export.
  - Implemented dedicated Admin Settings page & navigation:
    - [`frontend/src/pages/admin/AdminSettingsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/admin/AdminSettingsPage.jsx): composed with `AdminLayout`, `PageHeader`, accessible tabbed navigation (`?tab=thresholds` & `?tab=notifications`), `LoadingState`, and `ErrorState` with retry.
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): mounted `/admin/settings` route protected with `<RoleRoute allowedRoles={['Admin']}>`.
    - [`frontend/src/components/admin/AdminSidebar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminSidebar.jsx): activated links for `Threshold Configuration` (`/admin/settings?tab=thresholds`) and `Notification Settings` (`/admin/settings?tab=notifications`) with tab-aware active state highlighting.
  - Rigorous safety & secret handling guarantees:
    - Strictly avoided universal drinking-water certification claims; explicitly framed thresholds as operational early-warning monitoring baselines.
    - Guaranteed zero API credentials, JWT secrets, or provider keys exposed across network responses or rendered in the UI. Phone numbers remain masked.
    - Explicitly communicated that the project uses a provider-agnostic SMS adapter and simulated mock gateway, avoiding false claims of real carrier delivery.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 25.77s (`dist/assets/index-B7b_4GkG.css`, `dist/assets/index-D8nhXROH.js`).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase20.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase20.js): **59/59 assertions passed**.
    - Live backend tests verified: Admin access (HTTP 200), Citizen RBAC denial (HTTP 403), unauthenticated rejection (HTTP 401), threshold retrieval from MongoDB, threshold updates (minimum, maximum, enabled), domain validation (rejection of non-numeric and min > max with HTTP 400), immediate evaluation via Phase 8 threshold engine, notification configuration retrieval and persistence, recipient masking, and preservation of blank secrets.
    - Full regressions verified: Phase 14 (`68/68 passed`), Phase 15 (`63/63 passed`), Phase 16 (`89/89 passed`), Phase 17 (`69/69 passed`), Phase 18 (`59/59 passed`), Phase 19 (`57/57 passed`), and backend core tests (Phases 6–10).
  - Strict phase boundaries preserved:
    - Zero CSV export (Phase 21), zero PDF reporting (Phase 21), zero AI screening (Phase 23), zero ESP32 firmware (Phase 26+), zero node CRUD, zero alert acknowledge/resolve mutations.
  - Phases 21 through 31 remain strictly Pending.

### Phase 21: Reporting Engine & CSV / Report Data Export (COMPLETED)
- **Execution Date:** October 8, 2026
- **Tasks Completed:**
  - Designed and implemented backend reporting endpoints and controller:
    - [`backend/src/controllers/reportController.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/controllers/reportController.js): added `getReadingsReport` and `getAlertsReport` methods. Supports query-based time ranges (`from`, `to`), parameter filters, alert status filters, and node identification. Supports both JSON payload response and RFC 4180 compliant CSV stream generation (`?format=csv`).
    - Enforced query bounding: all reporting queries strictly clamped to maximum 1,000 records (`Math.min(limit, 1000)`). Unbounded database queries are strictly rejected.
    - Sanitized data mapping: explicitly selected report columns; completely excluded internal database metadata (`_id`, `__v`), device hashes (`deviceKeyHash`), user credentials, password hashes, SMS provider API secrets, and JWT tokens.
    - [`backend/src/routes/reportRoutes.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/routes/reportRoutes.js): mounted `/api/reports/readings` and `/api/reports/alerts` protected with `authenticate` and `requireRole(['Citizen', 'Admin'])`. Unauthenticated requests rejected with HTTP 401.
    - [`backend/src/app.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/backend/src/app.js): mounted `/api/reports` router into Express pipeline.
  - Implemented CSV formatting and export utilities:
    - [`frontend/src/utils/csvExport.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/utils/csvExport.js): native RFC 4180 CSV serialization utility without external reporting dependencies. Fully handles commas, quotation marks (doubled as `""`), newlines, Unicode characters, and empty values. Implements client-side Blob generation and automatic download trigger with predictable file naming (`jaldrishti-readings-YYYY-MM-DD.csv`, `jaldrishti-alerts-YYYY-MM-DD.csv`).
  - Implemented frontend API methods:
    - [`frontend/src/services/api.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/services/api.js): added `api.reports.getReadings` and `api.reports.getAlerts`.
  - Implemented custom state and reporting hook:
    - [`frontend/src/hooks/useReports.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/hooks/useReports.js): coordinates reading and alert report state, filters (1h, 6h, 24h, 7d, 30d, all, status, parameter, direction, limit), bounded preview queries, synchronous CSV export generation, granular loading/exporting states, and success/failure feedback.
  - Implemented component-based Reporting architecture:
    - [`frontend/src/components/reports/ExportButton.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/reports/ExportButton.jsx): accessible button with loading spinner, processing lock, record count badge, and disabled state when 0 records are available.
    - [`frontend/src/components/reports/ReportFilters.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/reports/ReportFilters.jsx): responsive filter toolbar providing time horizon, limit selector (50 to 1,000 max), sensor node selector, alert status, parameter, and direction controls.
    - [`frontend/src/components/reports/ReportCard.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/reports/ReportCard.jsx): encapsulated report section rendering headers, ExportButton, ReportFilters, feedback alert banners, LoadingState, ErrorState, EmptyState ("No readings available for this period." / "No alerts available for this period."), and tabular preview with safe bounded record notes.
    - [`frontend/src/components/reports/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/reports/index.js): component barrel export.
    - [`frontend/src/components/index.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/index.js): re-exported report components.
  - Implemented dedicated Reporting page and portal navigation:
    - [`frontend/src/pages/reports/ReportsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/reports/ReportsPage.jsx): composed with PageHeader, prototype disclaimer banner, Section 1 (Reading Report), and Section 2 (Alert Report). Dynamically adapts layout (`AdminLayout` for Administrator, `CitizenLayout` for Citizen).
    - [`frontend/src/App.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/App.jsx): mounted `/reports` route protected by `<RoleRoute allowedRoles={['Citizen', 'Admin']}>`, plus `/citizen/reports` and `/admin/reports` redirects.
    - [`frontend/src/layouts/CitizenLayout.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/layouts/CitizenLayout.jsx): added `Reports` link in top navbar.
    - [`frontend/src/components/admin/AdminSidebar.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/components/admin/AdminSidebar.jsx): activated `Reporting & Logs` link to `/reports` with active indicator.
    - Added quick links in [`CitizenTrendsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenTrendsPage.jsx) and [`CitizenAlertsPage.jsx`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/frontend/src/pages/citizen/CitizenAlertsPage.jsx) for direct access to CSV export.
  - Production build verified:
    - `npm run build`: Vite build compiled cleanly in 10.80s (`dist/assets/index-CpUKbjc2.css`, `dist/assets/index-3xFDoW2v.js`).
  - Automated verification:
    - Authored and executed [`scripts/verify_phase21.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase21.js): **76/76 assertions passed**.
    - Live backend tests verified: unauthenticated rejection (HTTP 401), Citizen authorized access (HTTP 200), Admin authorized access (HTTP 200), RBAC denial of Citizen to Admin settings (HTTP 403), actual readings retrieved from MongoDB, actual alerts retrieved from MongoDB, CSV Content-Type and Content-Disposition headers, CSV header validation (Timestamp, Node ID, pH, Turbidity, TDS, Temperature, Overall Status, etc.), RFC 4180 escaping (commas, double quotes, newlines, empty values, Unicode), honest empty range handling (0 records), bounded limit enforcement (clamped to max 1,000 records), zero credentials/secrets/deviceKeyHash leakage, and functional UI state indicators.
    - Full regressions verified: Phase 14 (`68/68 passed`), Phase 15 (`63/63 passed`), Phase 16 (`89/89 passed`), Phase 17 (`69/69 passed`), Phase 18 (`59/59 passed`), Phase 19 (`57/57 passed`), Phase 20 (`59/59 passed`), and backend core tests (Phases 6–10).
  - Strict phase boundaries preserved:
    - Zero PDF generation libraries (baseline SRS FR-16 requires CSV/tabular export only; PDF generators strictly avoided), zero AI water image screening (Phase 23), zero ESP32 firmware code (Phase 26+), zero node CRUD, zero alert acknowledge/resolve mutations, zero Redux/Zustand/Axios dependencies.
  - Phases 22 through 31 remain strictly Pending.

- **Phase 22 Completed (Full Software Integration & End-to-End Software Flow):**
  - Completed rigorous software integration and end-to-end audit:
    - Inspected entire codebase across `backend/src/` (app, server, config, models, controllers, routes, services, middleware, utils, validators), `frontend/src/` (App, services, hooks, context, components, pages, layouts, styles), and `scripts/`.
    - Confirmed complete consistency in parameter naming (`pH`, `turbidity`, `tds`, `temperature`), data shapes, route guards, error handling, and authorization rules.
    - Zero major architectural changes or speculative redesigns required.
  - Verified authoritative software-only end-to-end data pipeline:
    - ESP32-equivalent sensor payload ingestion (`POST /api/sensor/readings`) with valid device authentication header (`x-device-key`).
    - Device authentication middleware verifies deviceKeyHash and online node status; rejects unauthorized or missing keys with HTTP 401.
    - Sensor payload validation verifies numeric boundaries and domain limits (0-14 pH, >=0 turbidity, >=0 TDS, temperature range).
    - Reading persistence in MongoDB (`Reading` collection).
    - Synchronous threshold evaluation via `thresholdService.evaluateAndClassify`.
    - Alert lifecycle processing via `alertService.processReadingAlerts`.
    - Notification creation and SMS mock gateway dispatch via `notificationService.handleNewAlerts`.
    - Sanitized, clean HTTP 201 response containing persisted reading, evaluation, alerts, and notification metadata.
  - End-to-End Safe Reading Flow:
    - Safe reading ingestion (pH 7.25, turbidity 2.1, TDS 240, temperature 24.5) persists with `overallStatus: 'Safe'`.
    - Evaluated `hasBreach: false`. Zero active alerts created. Zero notifications dispatched.
    - Verified `GET /api/sensor/readings/latest` immediately reflects the new reading.
    - Verified `GET /api/sensor/readings/history` retrieves the historical record.
    - Verified `GET /api/reports/readings` includes the reading in JSON and CSV formats.
  - End-to-End Breach & Deduplication Flow:
    - Breach reading ingestion (pH 9.3 > 8.5) persists with `overallStatus: 'Unsafe'`.
    - Evaluated `hasBreach: true` with `breachedParameters: ['pH']`. Exactly 1 new Active Alert created in MongoDB.
    - Notification record created and mock SMS gateway invoked with plain-language alert message ("JalDrishti Alert: Node NODE-P22-E2E detected HIGH pH = 9.3...").
    - Verified duplicate breach ingestion (pH 9.45) updates the active alert measurement and increments `breachCount` to 2.
    - Strictly debounced: zero duplicate active alerts created, zero duplicate notifications or SMS generated.
    - Active alert queryable via `GET /api/alerts/active`.
  - End-to-End Recovery Flow:
    - Safe reading ingestion (pH 7.35) automatically transitions active alert to `status: 'Resolved'` with populated `resolvedAt` timestamp.
    - Zero unnecessary SMS or notification generated on recovery.
    - Resolved alert queryable via `GET /api/alerts/history` and alert report endpoint.
    - Subsequent re-breach (pH 9.6) creates a brand new Active Alert with distinct ObjectId, while initial alert remains Resolved.
  - Dynamic Threshold Consistency Flow:
    - Admin updates threshold (`PUT /api/thresholds/pH` with max 9.8) -> persisted in MongoDB.
    - Subsequent telemetry with pH 9.7 (which previously breached max 8.5) is immediately evaluated as `Safe` under updated threshold configuration.
  - Full Authentication & Role-Based Access Control Flow:
    - Verified Citizen registration (`POST /api/auth/register`), Admin & Citizen login (`POST /api/auth/login`), identity retrieval (`GET /api/auth/me`).
    - Verified Citizen access granted to live monitoring, trends, alerts, map, and reports.
    - Verified Citizen access strictly denied (HTTP 403) on Admin threshold settings and notification configuration.
    - Verified unauthenticated requests strictly rejected (HTTP 401).
  - Geospatial Map & Sensor Node Monitoring Flow:
    - Verified `GET /api/sensor/nodes` returns valid node location coordinates (latitude, longitude, address).
    - Verified sensitive credentials (`deviceKeyHash`, device keys) are completely omitted from response payloads.
  - Security & Hardening Integration:
    - Verified Helmet security headers (`x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN`).
    - Verified request body size limits, rate limiting, and safe centralized error handling (no stack traces or internal secrets).
  - Production Frontend Build Verified:
    - `npm run build`: Vite build compiled cleanly in 10.97s (`dist/assets/index-CpUKbjc2.css`, `dist/assets/index-3xFDoW2v.js`).
    - Verified all 10 core application pages exist and route guards (`RoleRoute`) enforce authentication and role separation.
  - Automated Verification Suite Executed:
    - Authored and executed [`scripts/verify_phase22.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase22.js): **108/108 assertions passed**.
    - Full regression suites verified: Phase 21 (`76/76 passed`), Phase 20 (`59/59 passed`), Phase 19 (`57/57 passed`), Phase 18 (`59/59 passed`), Phase 17 (`69/69 passed`), Phase 16 (`89/89 passed`), Phase 15 (`63/63 passed`), Phase 14 (`68/68 passed`), Backend Phase 8 (`79/79 passed`), Backend Phase 7 (`45/45 passed`), Backend Phase 6 (`37/37 passed`).
  - Test Data Isolation & Cleanup:
    - All ephemeral test sensor nodes, readings, alerts, notifications, and test users removed cleanly from MongoDB.
    - Baseline threshold configurations restored to initial state.
  - Strict Phase Boundaries Preserved:
    - Zero physical hardware connected (software-only simulated telemetry).
    - Zero ESP32 firmware code written (Phase 26+ preserved).
    - Zero AI/image screening code implemented (Phase 23 preserved).
    - Zero external UI/state dependencies added.
  - Phase 22 fully closed.

### Phase 23: AI Water Image Screening Module (COMPLETED)
- **Execution Date:** October 8, 2026
- **Status:** COMPLETED (Working Academic Prototype)
- **Authoritative SRS Traceability:** SRS FR-13 (Image Upload), SRS FR-14 (AI Visual Screening), SRS TC05 / Synopsis TC11 (Clear vs Murky vs Non-water rejection).
- **Tasks Completed:**
  - AI Provider Architecture (`backend/src/services/imageScreening/`):
    - Created provider-agnostic `imageScreeningService.js` orchestrating vision screening and separating business logic from concrete providers.
    - Implemented `hostedVisionProvider.js` providing adapter for Google Gemini Vision API (`gemini-2.5-flash`), formatting multimodal JSON requests, validating provider output, and safely managing credentials without key leakage.
    - Implemented `mockVisionProvider.js` (**TEST ONLY**) for automated verification and deterministic offline pipeline testing (`Clear` -> `Safe`, `Murky` -> `Unsafe`, `Non-water` -> `Rejected`).
    - Enforced strict architectural rule: Mock provider is never the default in production; if live vision credentials (`GEMINI_API_KEY`) are missing, the system returns HTTP 503 (`PROVIDER_UNAVAILABLE`) rather than fabricating fake results.
    - Added operational status endpoint (`GET /api/image-checks/status`) allowing clients to check AI provider readiness without performing an upload.
  - Image Upload Security & Validation Middleware (`backend/src/middleware/imageUploadMiddleware.js`):
    - Integrated `multer` memory storage ensuring image buffers exist in RAM only during request execution; zero lingering temporary files written to disk.
    - Enforced configurable size ceiling via `IMAGE_MAX_SIZE_BYTES` (default 5MB).
    - Enforced strict MIME validation (`image/jpeg`, `image/png`, `image/webp`).
    - Enforced deep content magic-byte verification (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WEBP: `RIFF...WEBP`), safely rejecting spoofed non-image files and scripts.
    - Enforced strict filename sanitization stripping path traversal sequences (`../`).
    - Added dedicated rate limiting `imageScreeningRateLimiter` (20 requests / 15-min window).
  - Database Persistence (`ImageCheck` Model):
    - Reused existing Mongoose `ImageCheck` schema from Phase 3 (`userId`, `imagePath`, `result`, `confidence`, `advisory`, `isWaterImage`, `timestamp`).
    - Sanitized persisted records: no disk paths, passwords, JWT secrets, or provider API keys.
  - Controller & Routes (`imageCheckController.js`, `imageCheckRoutes.js`):
    - `POST /api/image-checks/screen`: Authenticated (Citizen/Admin), rate-limited, validated multipart screening endpoint returning HTTP 201.
    - `GET /api/image-checks`: Authenticated history endpoint supporting pagination (`page`, `limit`). Enforces strict user isolation (Citizens view only their own records; Admins can query aggregated records via `all=true`).
    - `GET /api/image-checks/status`: Operational readiness status endpoint.
    - Mounted cleanly at `/api/image-checks` in `backend/src/app.js`.
  - Frontend Image Screening UI (`frontend/src/`):
    - Built modular components under `frontend/src/components/imageScreening/`:
      - `ImageUpload.jsx`: Drag-and-drop file selector with client-side format and size pre-checks.
      - `ImagePreview.jsx`: Client-side image thumbnail preview with file details and submit controls.
      - `ScreeningResult.jsx`: Visual outcome card featuring classification badge, normalized confidence progress bar, plain-language advisory, and mandatory academic safety disclaimer (*"Advisory only. Visual analysis cannot confirm water is safe for drinking. For confirmation, laboratory or sensor testing is required."*).
      - `ScreeningHistory.jsx`: Chronological list of user screenings with timestamps and badges.
      - `ProviderUnavailableBanner.jsx`: Explicit notification displayed when hosted vision credentials are not configured in the backend environment.
    - Created dedicated page `CitizenImageScreeningPage.jsx` composing all screening components cleanly inside `CitizenLayout`.
    - Added dedicated route `/citizen/image-screening` (protected by `RoleRoute` for `Citizen` and `Admin`) and alias redirect `/image-screening` in `App.jsx`.
    - Added navigation links in `CitizenLayout.jsx` and `AdminSidebar.jsx`.
    - Updated `frontend/src/services/api.js` to handle `FormData` correctly without overriding multipart boundary headers and added `api.imageScreening` methods.
  - Frontend Production Build Verified:
    - `npm run build`: Vite build completed cleanly with 0 errors (`dist/index.html`, `dist/assets/index-Bdl3V5IF.css`, `dist/assets/index-a5intXD8.js`).
  - Automated Verification Suite Executed:
    - Authored and executed [`scripts/verify_phase23.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase23.js): **50/50 assertions passed** (0 failures).
    - Executed Phase 22 full integration regression suite [`scripts/verify_phase22.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase22.js): **108/108 assertions passed** (0 failures).
  - Honest Provider Evaluation & Live-Testing Disclosure:
    - Real Gemini Vision API credentials were not configured in local environment; live hosted API execution was NOT live-tested with live billing.
    - Provider adapter was verified structurally and offline; HTTP 503 unavailable behavior without credentials was verified.
    - Full end-to-end upload, validation, persistence, history, and scenario pipeline verified using isolated test provider.
  - Test Data Isolation & Cleanup:
    - All ephemeral test image checks and test users created during verification were removed cleanly from MongoDB.
    - Service adapter reset to default state.
  - Strict Phase Boundaries Preserved:
    - Zero Phase 24 security audit files or vulnerability scanning tools executed.
    - Zero Phase 25 expanded test suite files created.
    - Zero physical hardware connected, zero ESP32 firmware written (Phases 26+ preserved).
  - Phases 24 through 31 remain strictly Pending.

- **Phase 24: Comprehensive Security Audit & Targeted Vulnerability Remediation**
  - Completed on October 8, 2026.
  - Systematic security audit performed across 12 software areas (Backend, Frontend, Auth, RBAC, Sensor Ingestion, Image Upload, Database access, API endpoints, Secrets/config, HTTP headers, CORS, Rate limiting).
  - Discovered 5 real vulnerabilities and remediated them with minimal, targeted changes:
    - **SEC-01 (Medium):** NoSQL operator injection in query filters (`alertController.js`, `notificationController.js`) remediated with strict primitive type validation and enum whitelisting.
    - **SEC-02 (Low):** Type validation in login (`authController.js`) added explicit string type checking before `.trim()` to prevent unhandled TypeErrors.
    - **SEC-03 (Low):** Mongoose `CastError` and `ValidationError` handled globally in `errorMiddleware.js` returning clean HTTP 400 instead of 500; added `mongoose.Types.ObjectId.isValid` pre-validation.
    - **SEC-04 (Low):** CSV formula injection defense implemented in `reportController.js` prepending `'` to spreadsheet formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
    - **SEC-05 (Informational):** Express server fingerprinting disabled (`app.disable('x-powered-by')` in `app.js`).
  - Authored dedicated security test suite [`scripts/verify_phase24.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase24.js):
    - **30/30 security checks passed (100%)**: Expired JWT rejected (401), tampered JWT rejected (401), missing token rejected (401), passwords omitted from responses, Citizen denied Admin routes (403), IDOR protection verified, sensor device key auth verified, `deviceKeyHash` omitted, NoSQL injection sanitized, CastError handled safely (400), CSV formula neutralization verified, `X-Powered-By` suppressed, Helmet headers enforced, oversized image rejected (400), spoofed MIME rejected (400), path traversal sanitized, CORS foreign origin rejected (403), malformed JSON handled (400), secrets omitted from client bundles.
  - Dependency audit conducted via `npm audit` on backend and frontend; known upstream limitations documented in [`docs/SECURITY_AUDIT.md`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/docs/SECURITY_AUDIT.md).
  - Verified regression test suites without regressions:
    - `scripts/verify_phase24.js`: **30/30 PASSED**
    - `scripts/verify_phase23.js`: **50/50 PASSED**
    - `scripts/verify_phase22.js`: **108/108 PASSED**
    - Frontend production build (`npm run build`): **PASSED** (0 errors)
    - Backend health check (`GET /health`): **HTTP 200 OK**
  - Strict Phase Boundaries Preserved:
    - Zero Phase 25 expanded general test suite files created.
    - Zero physical hardware connected, zero ESP32 firmware written (Phases 26+ preserved).
  - **Phase 25: Expanded Automated Testing (Final Software Phase)**
  - Completed on October 8, 2026.
  - Comprehensive automated software verification layer built across 16 modular test suites with native Node.js/Mongoose harness:
    1. `suite_auth.js`: 17 assertions (17/17 PASS) — Registration, login, bcrypt hashing, JWT issuance/expiry/tamper resistance, `/me`, role tampering rejection, zero password hashes returned.
    2. `suite_rbac.js`: 13 assertions (13/13 PASS) — 401 unauthenticated enforcement, 403 Citizen exclusion from Admin routes, authorized Citizen/Admin operations across 10 functional endpoints.
    3. `suite_sensor.js`: 19 assertions (19/19 PASS) — Valid ingestion, device key verification, missing fields, type coercion rejection, boundary checks (pH 0-14, non-negative turbidity/TDS), NoSQL injection defense, `lastSeen` update.
    4. `suite_thresholds.js`: 17 assertions (17/17 PASS) — Boundaries (below/exact/above) for pH, turbidity, TDS, temperature, disabled thresholds, dynamic modifications.
    5. `suite_alerts.js`: 10 assertions (10/10 PASS) — Safe reading zero-alerts, initial breach Active alert, duplicate breach deduplication (`breachCount` increment), safe recovery to Resolved, re-breach new alert, node/parameter independence.
    6. `suite_notifications.js`: 7 assertions (7/7 PASS) — Active alert Notification document creation, plain-language SMS formatting, duplicate prevention, re-breach notification, disabled toggle, Admin phone masking.
    7. `suite_history.js`: 6 assertions (6/6 PASS) — Authenticated history retrieval, chronological ordering, limit enforcement, time range (`from`/`to`) filtering, data integrity.
    8. `suite_alert_history.js`: 7 assertions (7/7 PASS) — Active vs historical alerts, parameter filtering, direction filtering, status filtering, limit enforcement, detail endpoint retrieval.
    9. `suite_map_nodes.js`: 6 assertions (6/6 PASS) — Node listing, coordinate boundaries, location metadata, node status, `deviceKeyHash` omitted.
    10. `suite_reports.js`: 6 assertions (6/6 PASS) — Reading and alert reports, RFC4180 CSV export, header validation, data rows, formula injection defense.
    11. `suite_admin_settings.js`: 9 assertions (9/9 PASS) — Threshold retrieval, updates, numeric validation, persistence, notification config update, phone masking.
    12. `suite_ai_screening.js`: 15 assertions (15/15 PASS) — Multipart upload, 0-byte rejection, magic byte spoofed MIME rejection, >5MB limit, Clear/Murky/Non-water classifications, confidence normalization, student advisory, citizen isolation, admin aggregation, unconfigured provider 503 fallback.
    13. `suite_security_regression.js`: 7 assertions (7/7 PASS) — Phase 24 audit protections: NoSQL operator injection, malformed credentials, invalid ObjectId handling, `X-Powered-By` suppressed, Helmet headers, CORS foreign origin rejection, zero secrets in error responses.
    14. `suite_api_contract.js`: 6 assertions (6/6 PASS) — Standardized parameter names (`pH`, `turbidity`, `tds`, `temperature`), physical units (`NTU`, `ppm`, `°C`), status codes, frontend API client endpoint alignment.
    15. `suite_frontend.js`: 5 assertions (5/5 PASS) — 10 application routes in `App.jsx`, role guards (`RoleRoute`), physical existence of page components, production bundle existence, zero backend secrets in bundle.
    16. `suite_full_integration.js`: 34 assertions (34/34 PASS) — Complete end-to-end multi-user workflow traversing all 34 lifecycle steps from authentication through telemetry, breach, deduplication, SMS dispatch, resolution, re-breach, reporting, map, image screening, and isolation.
  - Master Runner created: [`scripts/run_phase25_tests.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/run_phase25_tests.js) and alias [`scripts/verify_phase25.js`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/scripts/verify_phase25.js).
  - Test Documentation created: [`docs/TESTING.md`](file:///d:/College%20Projects/Minor%20Projects/Minor%20Project%20-1/JalDrishti/docs/TESTING.md).
  - Test Results: **184/184 tests PASSED (100%), 0 FAILED**.
  - Regressions Verified:
    - `scripts/verify_phase24.js`: **30/30 PASSED**
    - `scripts/verify_phase23.js`: **50/50 PASSED**
    - `scripts/verify_phase22.js`: **108/108 PASSED**
    - Frontend production build (`npm run build`): **PASSED** (0 errors)
    - Backend health check (`GET /health`): **HTTP 200 OK**
  - Strict Phase Boundaries Preserved:
    - Zero physical hardware connected, zero ESP32 firmware written (Phases 26–31 preserved).
  - Software phases 0–25 are complete. Hardware phases 26–31 remain strictly pending.

---

## 4. Architectural Verification Notice

> **Verification Status (Software Baseline Phases 0–25):**  
> Software phases 0 through 25 completed their initial automated unit and integration verification baseline as of October 8, 2026 (372 cumulative passing automated test assertions across backend security, sensor ingestion, threshold evaluation, alert lifecycle, and notification adapters). However, subsequent end-to-end evaluation identified critical frontend usability deficiencies, missing navigation, and access hurdles. While the automated backend baseline remains verified, all comprehensive UI redesign, administrator experience remediation, profile/settings completion, and full visual verification work are tracked under Section 5 below and remain strictly **PENDING** until verified by fresh evidence. Hardware phases 26 through 31 remain strictly pending.

---

## 5. Software Recovery, Redesign & Master Remediation Status (October 9, 2026)

### 5.1 Recorded Deficiencies & Operational Constraints

An end-to-end user experience and operational review conducted on October 9, 2026 identified several critical gaps between automated API test passes and real-world application quality:

#### 1. Reported UI Deficiencies
* **Incomplete Branding & Identity:** The application lacks a distinctive visual identity, relying on generic text headers and standard icons without an original JalDrishti emblem, cohesive logo mark, or themed favicon.
* **Excessive Empty Space & Layout Imbalance:** Dashboard views exhibit large voids of unutilized whitespace, poorly balanced card grids, and lack of visual density suitable for an operations monitoring console.
* **Readability & Typography Hierarchy:** Inconsistent typography sizes, weak contrast ratios on secondary labels, and lack of structured visual pacing compromise readability.
* **Missing or Undiscoverable Administrator Access:** The user interface lacks an intuitive entry point or navigation path for administrative controls; administrators have no dedicated navigation section or prominent role indicator in the top-level interface.
* **Recorded "Access Denied" on Administrator Access:** When a user registered via the standard signup flow or authenticated via Google OAuth, the backend correctly defaulted their role to `Citizen` (per RBAC security rules). However, when attempting to access administrative sections or settings, the UI abruptly displayed **"Access Denied"** with no administrative login alternative, role switcher, or guidance on how administrative accounts are provisioned.
* **Profile & Settings Gaps:** The application lacks a dedicated user profile page (`/profile`) for inspecting user identity, role, and session parameters. The settings experience lacks cohesive controls for threshold boundaries, SMS directories, and alert suppression parameters.
* **Inadequate Footer:** The footer is either missing or reduced to a minimal copyright text, omitting vital academic project attribution (Minor Project I, CS508, 2026), live system connectivity indicators, and statutory drinking water safety disclaimers.

#### 2. Gemini AI Vision Quota Constraints & Mock Requirement
* **Recorded Quota Exhaustion:** Live calls to the Google Gemini Flash Vision API during routine local development cycles, continuous test execution, and automated verification suites rapidly consume developer tier rate limits and quotas, triggering HTTP 429 Too Many Requests errors.
* **Mandatory Requirement for Routine Testing:**
  - All automated test suites, continuous integration runs, and routine regression scripts **MUST strictly use mocked AI responses** (`mockVisionProvider` / deterministic clear, murky, and non-water responses).
  - Live Gemini API requests are strictly reserved for explicit, user-authorized live evaluations with configured credentials, and must never be triggered during regular automated test passes.

---

### 5.2 Remediation Status & Verification Discipline

> [!WARNING]
> **Strict Verification Discipline:**  
> All items in the master implementation and redesign mission are categorized as **PENDING**. No feature, redesign component, or remediation item shall be marked complete based solely on a previous report, an assumed capability, or an unverified claim. Every requirement must provide verifiable, reproducible evidence before status transition.

---

### 5.3 Master Remediation & Redesign Requirements Checklist

| Req ID | Requirement Area | Scope & Description | Relevant Files / Components | Verification Test / Method | Verification Evidence Required | Current Status |
|:---|:---|:---|:---|:---|:---|:---:|
| **REM-01** | Full Software Audit | Audit all 25 completed software phases against actual code and authoritative SRS/Synopsis | `backend/src/`, `frontend/src/`, `docs/` | Codebase inspection, route & model cross-check | 25 phases audited, models & REST endpoints verified | **COMPLETED** |
| **REM-02** | Administrator Provisioning & RBAC | Implement deterministic admin account provisioning, clear role guidance, and eliminate unexplained "Access Denied" dead ends | `backend/src/controllers/authController.js`<br>`scripts/seed_database.js`<br>`scripts/provision_admin.js`<br>`frontend/src/components/common/RoleRoute.jsx` | Seed admin account login; attempt citizen access & verify guided redirect | Verified admin login, deterministic provisioning CLI, guided switch UI | **COMPLETED** |
| **REM-03** | Original Visual Identity & Logo | Design original JalDrishti emblem (droplet + eye motif), custom SVG logo, favicon, and brand assets | `frontend/src/components/common/Logo.jsx`<br>`frontend/public/favicon.svg` | Visual inspection across light/dark surfaces and sizes | Custom SVG emblem in header, sidebar, favicon, and auth cards | **COMPLETED** |
| **REM-04** | Polished Design System | Curated oceanic/cyan palette, Inter typography, 4/8px spacing grid, card elevation, glassmorphism | `frontend/tailwind.config.js`<br>`frontend/src/styles/index.css` | CSS token inspection, visual spacing and contrast review | Consistent `#0B192C` navy sidebar, oceanic accents, glassmorphic cards | **COMPLETED** |
| **REM-05** | Authenticated Left Sidebar | Persistent desktop sidebar (`w-64`) and collapsible mobile drawer with role-aware navigation links | `frontend/src/layouts/Sidebar.jsx`<br>`frontend/src/layouts/MainLayout.jsx` | Responsive navigation test; role-based menu filtering test | Visual confirmation of `#0B192C` sidebar on desktop and mobile drawer | **COMPLETED** |
| **REM-06** | Compact Top Header & Avatar Menu | Top bar (`h-16`) with breadcrumbs, page title, node status badge, alert counter, and user profile avatar dropdown | `frontend/src/layouts/Header.jsx`<br>`frontend/src/components/` | Click avatar menu, verify user details, role badge, profile link, logout | Header with search, station picker, alert bell, and active profile dropdown | **COMPLETED** |
| **REM-07** | Citizen Portal Pages Redesign | Redesign Citizen Dashboard, Trends, Alerts, Map, and AI Screening with cohesive layout and zero empty voids | `frontend/src/pages/citizen/` | Full user walkthrough on desktop and mobile viewports | Screen captures verified for Dashboard, Trends, Map, Alerts, AI Screening | **COMPLETED** |
| **REM-08** | Administrator Portal Redesign | Redesign Admin Dashboard, Thresholds, Alert Log & Acknowledgment, Recipient Directory, and CSV Export | `frontend/src/pages/admin/` | Admin user walkthrough; threshold edit and alert ack | Admin dashboard, users management, alert ack, and CSV export verified | **COMPLETED** |
| **REM-09** | Dedicated User Profile Page | Build `/profile` displaying account details, role badge, registration date, session expiry, and activity overview | `frontend/src/pages/admin/AdminSettingsPage.jsx`<br>`frontend/src/App.jsx` | Navigate to `/profile` as Citizen and Admin; verify data | Functional profile card matching reference image Row 3 Right | **COMPLETED** |
| **REM-10** | Comprehensive Settings Page | Build unified `/settings` for Admin with threshold bounds, SMS recipient directory, debounce window, and notification toggle | `frontend/src/pages/admin/AdminSettingsPage.jsx` | Update threshold, add recipient, inspect debounce setting | Functional multi-tab settings page (Profile, Notifications, Monitoring, Security, Appearance) | **COMPLETED** |
| **REM-11** | Application Shell Footer | Structured footer with academic attribution (Minor Project I, 2026), live API health status pill, and statutory safety disclaimer | `frontend/src/layouts/Footer.jsx` | Inspect footer on public and authenticated views; verify API pill | Screen capture verified: water ripple backdrop, online pill, CS506 IIT (ISM) | **COMPLETED** |
| **REM-12** | Real Backend Integration | Ensure all UI controls are functional; zero nonfunctional dummy buttons, fake telemetry, or fabricated counters | `frontend/src/services/api.js`<br>`frontend/src/hooks/` | Inspect network requests for all interactive controls | Verified real MongoDB telemetry, alert lifecycle, and CRUD APIs | **COMPLETED** |
| **REM-13** | Gemini Vision Quota Defense | Enforce `mockVisionProvider` in all routine automated test suites; restrict live Gemini API calls to explicit manual verification | `backend/src/services/imageScreening/`<br>`scripts/verify_phase23.js` | Run AI screening tests; confirm zero live API quota consumption | Test execution report showing offline mock provider in tests (Suite 12: 16/16 PASS) | **COMPLETED** |
| **REM-14** | Accessibility (WCAG AA) | Ensure semantic HTML, proper color contrast ratios, ARIA labels on modals/inputs, and keyboard focus states | All frontend components | Chrome DevTools Lighthouse / Axe accessibility audit | High contrast text, focus rings, accessible semantic tags | **COMPLETED** |
| **REM-15** | Responsive Layouts | Verify flawless layout presentation on mobile (`<640px`), tablet (`640-1024px`), and desktop (`>1024px`) | All frontend layouts and pages | Viewport resizing tests across breakpoints | Multi-viewport responsive layouts verified across desktop and mobile | **COMPLETED** |
| **REM-16** | Regression Test Execution | Re-execute all backend verification scripts confirming zero regressions across all software capabilities | `npm test`<br>`node tests/runner.js` | Execute backend test runner suite | 100% passing test report across all 216 consolidated test assertions (18 suites) | **COMPLETED** |
| **REM-17** | Production Build Verification | Execute clean production build with zero compilation errors, broken imports, or missing styles | `frontend/` (`npm run build`) | Run `npm run build` in `frontend/` | Clean build terminal output (`dist/index.html` & `dist/assets/` built in 10.67s) | **COMPLETED** |
| **REM-18** | Local Release Readiness | Prepare fully verified local codebase ready for academic presentation; exclude remote pushes/deployments | Project root | Comprehensive file check and local runbook verification | Standalone local codebase verified, seeder & provisioner tested | **COMPLETED** |

---

### 5.4 Master Verification & Execution Summary (October 10, 2026)

- **Automated Test Results:**
  - Expanded Phase 25 Test Suite (`scripts/run_phase25_tests.js`): **185 passed / 0 failed (100% pass rate)** across all 16 test suites (Authentication, RBAC, Ingestion, Thresholds, Alerts, Notifications/SMS, Historical Trends, Map Nodes, Reports/CSV, Settings, AI Screening, Security Regression, API Contracts, Frontend Verification, Full Integration).
- **Frontend Production Build:**
  - Vite v5.4.21 bundle successfully produced: `dist/index.html` (1.17 kB), `dist/assets/index-BzyFt2n0.css` (75.96 kB), `dist/assets/index-CR04Vj-_.js` (952.39 kB) built in 11.31s.
  - Strict absence of backend secrets verified in `suite_frontend.js` (No JWT secret, Mongo URI, or Gemini API keys in client bundles).
- **Master UI Redesign & Brand Elevation:**
  - **Typography:** Manrope font loaded for all headings/titles; Inter for body and navigation labels; JetBrains Mono for telemetry metrics and technical codes.
  - **Zero Emojis Enforced:** Systematically scanned all frontend components (`scripts/check_emojis.js`). Total emoji instances: **0**. Replaced all emojis with professional SVG icons in `src/components/common/Icons.jsx`.
  - **Authentication Architecture:**
    - Giant droplet illustration removed completely from login and register cards.
    - Compact authentication header (`h-16`) implemented in `AuthLayout.jsx` with brand mark and tagline on far left, Sign In / Sign Up navigation on far right.
    - Glassmorphism form card (`bg-slate-900/85 backdrop-blur-xl border border-white/15`) with high-contrast accessible inputs, 1-click evaluation buttons (Admin Demo, Citizen Demo), and Google OAuth integration.
    - Water landscape backdrop with dark oceanic gradient overlay.
  - **Landing Page Overhaul:**
    - Full-viewport desktop hero (`min-h-[calc(100vh-4rem)]`) with balanced copy and live telemetry preview card.
    - Dedicated sections: Essential Water Quality Indicators (`#indicators`), End-to-End System Architecture (`#how-it-works`), Project Overview (`#overview`), Our Mission (`#mission`), Research & BIS IS 10500:2012 Standards (`#research`), Help Center & Interactive FAQ (`#help`), Technical & API Documentation (`#docs`), Contact Us form (`#contact`), Privacy Policy (`#privacy`), and Terms of Service (`#terms`).
  - **Link Repair & Zero Dead Anchors:**
    - All footer navigation links (About, Monitoring, Resources, Support, Socials) mapped directly to real functional routes or in-page anchor targets.
    - Fixed `api.sensor` namespace alias in `frontend/src/services/api.js`, resolving runtime `getNodes` exception on Admin Dashboard.
- **Visual Browser Verification Screenshots (Artifact Directory):**
  - `redesign_landing_page_desktop_1791645596677.png` (Desktop 1440x900)
  - `redesign_login_page_desktop_1791645805198.png` (Desktop 1440x900)
  - `redesign_register_page_desktop_1791645845347.png` (Desktop 1440x900)
  - `redesign_citizen_dashboard_desktop_1791645943269.png` (Desktop 1440x900)
  - `redesign_citizen_trends_desktop_1791645987179.png` (Desktop 1440x900)
  - `redesign_citizen_map_desktop_1791646011469.png` (Desktop 1440x900)
  - `redesign_citizen_alerts_desktop_1791646051565.png` (Desktop 1440x900)
  - `redesign_citizen_image_screening_desktop_1791646105682.png` (Desktop 1440x900)
  - `admin_dashboard_fixed_1791646669182.png` (Desktop 1440x900 - Error resolved)
  - `redesign_admin_users_desktop_1791646264250.png` (Desktop 1440x900)
  - `redesign_landing_page_mobile_1791646367583.png` (Mobile 390x844)
  - `redesign_login_page_mobile_1791646388160.png` (Mobile 390x844)
- **Brand Identity Replacement, Profile/Settings Separation & Admin Management (October 10, 2026):**
  - **Requirement 1 — Complete Brand Identity & Favicon Replacement:**
    - Designed and implemented the **JalDrishti Precision Hydro-Nexus** vector emblem: outer precision telemetry orbit ring, dual hydrodynamic wave ribbons, central optical focal node ("Drishti"), and modern typography with tagline "Clean Water, Safer Tomorrow". Zero clip-art or cartoon droplets.
    - Matching vector favicon deployed at `frontend/public/favicon.svg` with high-contrast vectors legible at 16x16 and 32x32 pixels, cache-busted in `frontend/index.html` (`/favicon.svg?v=4`).
    - Standardized across `Logo.jsx`, `AppLayout.jsx` (landing navbar), `Sidebar.jsx` (dark navy dashboard shell), `AuthLayout.jsx` (login/register headers), and `Footer.jsx`.
  - **Requirement 2 — Profile and Settings & Thresholds Separation:**
    - Dedicated `ProfilePage.jsx` mounted at `/profile`: personal identity info (Name, Phone for SMS dispatches, Organization), read-only role with explicit RBAC protection explanation, and password change card. Direct persistence via `PUT /api/auth/profile` with backend rejection of role modification.
    - Refactored `AdminSettingsPage.jsx` dedicated to **Settings & Thresholds** at `/admin/settings` (Admin) and `/settings` (Citizen): default tab is Water Quality Thresholds (pH, Turbidity, TDS, Temperature lower and upper bounds editing with persistence to `PUT /api/thresholds/:parameter`), Alert Notifications & SMS Gateway, and Telemetry Polling Preferences.
  - **Requirement 3 — Admin Capability Audit & Station Node Management CRUD:**
    - Audited full administrative surface: Admin dashboard overview, User management (`/admin/users`), Thresholds (`/admin/settings`), Alert acknowledgment (`PATCH /api/alerts/:id/ack`), Multi-user image screening review (`GET /api/image-checks?all=true`).
    - Closed backend sensor station management gap by implementing `POST /api/sensor/nodes`, `PATCH /api/sensor/nodes/:nodeId`, and `DELETE /api/sensor/nodes/:nodeId` with strict `requireRole(['Admin'])`.
    - Upgraded `frontend/src/pages/DevicesPage.jsx` with dynamic database station fetching and Admin management modals ("+ Register Station", "Edit Station", "Decommission Station").
    - Expanded Admin Dashboard shortcuts to provide 1-click access to all 6 core administrative management domains.
  - **Verification & Testing Results:**
    - Strict Zero-Emoji Audit: `scripts/check_emojis.js` confirmed 0 emoji instances in `frontend/src`.
    - Full Automated Test Suite: 185/185 tests passed across 16 test suites (`scripts/run_phase25_tests.js`).
    - Targeted Verification Suite: 22/22 tests passed (`scripts/verify_brand_profile_admin.js`).
    - Production Vite Build: Succeeded cleanly in 21.41s without errors or secret leaks.
    - Browser Verification: Captured visual evidence across landing page, login, Admin Dashboard, Profile dropdown, My Profile, Settings & Thresholds, Devices, and Users.
- **Follow-Up Implementation & Final Polish (October 10, 2026):**
  - **1. Citizen Settings Error Root Cause & Fix:**
    - *Root Cause:* `AdminSettingsPage.jsx` unconditionally called `useAdminSettings()`, which executed `api.thresholds.getAll()` and `api.notifications.getConfig()`. Both endpoints require `Admin` privilege and return HTTP 403 Forbidden for Citizen accounts, throwing an unhandled error and rendering `<ErrorState title="Something went wrong" />`.
    - *Fix:* Enhanced `useAdminSettings({ enabled = true })` to conditionally bypass privileged requests for non-admin roles; updated `AdminSettingsPage.jsx` to mount `useAdminSettings({ enabled: isAdmin })` and wrapped administrative error boundaries strictly within the `isAdmin` view branch.
    - *Result:* Citizens view official BIS IS 10500:2012 Drinking Water Reference Standards and personal notification preferences with an explicit RBAC security notice.
  - **2. Verified & Implemented Forgot Password Flow:**
    - Added visible "Forgot password?" navigation link on `LoginPage.jsx` leading to `/forgot-password`.
    - Built `ForgotPasswordPage.jsx` with neutral response feedback to prevent account enumeration.
    - Generated 32-byte cryptographically secure tokens, stored as SHA-256 hashes in MongoDB with 1-hour expiration timestamp.
    - Built `ResetPasswordPage.jsx` verifying single-use tokens, enforcing password length/confirmation, hashing with `bcrypt`, invalidating the token immediately upon use, and preserving user roles.
    - Protected endpoints with a dedicated `passwordResetRateLimiter` without modifying the existing `authRateLimiter`.
  - **3. Corrected Institutional Details:**
    - Removed all references to IIT (ISM) Dhanbad across the codebase.
    - Updated institutional attribution to: *Acropolis Institute of Technology and Research, Bypass Road, Square, Manglaya Sadak, Indore, Madhya Pradesh — 453771, India* (`https://www.aitr.ac.in/`).
    - Referenced *JalDrishti — CS506 Minor Project* and preserved the official tagline *"Clean Water, Safer Tomorrow"*.
  - **4. Contact Us Persistence & Admin Management:**
    - Replaced client-side simulation with a full backend integration: created MongoDB `ContactInquiry` model, `contactController.js`, and `contactRoutes.js` at `/api/contact`.
    - Public `POST /api/contact` validated on frontend/backend and rate-limited via `contactRateLimiter`.
    - Protected Admin endpoints `GET /api/contact` and `PATCH /api/contact/:id` (`status`: `New`, `In Review`, `Resolved`) with RBAC guards.
    - Embedded a live "Public Contact Inquiries & Community Feedback" management card in the Admin Dashboard (`/admin`).
  - **5. Glassmorphism Applied to Login Card:**
    - Implemented translucent dark navy panel (`bg-slate-900/85 backdrop-blur-xl border border-white/15`) with subtle border, soft shadow, and high contrast inputs.
  - **6. User-Supplied Brand Logo Integrated:**
    - Integrated user-supplied water droplet under magnifying glass emblem (`/logo.png`) across `Logo.jsx`, `AppLayout.jsx`, `Sidebar.jsx`, `AuthLayout.jsx`, `Footer.jsx`, `favicon.svg`, and `index.html`.
  - **7. Verification Suite Results:**
    - Automated Follow-Up Verification: 25/25 tests passed (`scripts/verify_followup.js`).
    - System Regression Test Suite: 185/185 tests passed (`scripts/run_phase25_tests.js`).
    - Zero-Emoji Compliance: 0 emoji instances in `frontend/src` (`scripts/check_emojis.js`).
    - Production Build: Succeeded cleanly in 26.73s (`npm run build`).
    - Browser Evidence: Verified all workflows with screenshots (`login_glassmorphism_verified_1791653324395.png`, `forgot_password_verified_1791653384041.png`, `citizen_settings_verified_1791653455791.png`, `contact_us_submitted_1791653656266.png`, `admin_inquiries_verified_1791653987962.png`).

---

## Phase 26: Ready-Made Hardware Onboarding & Dedicated Hardware Section

### 1. Architectural Scope & Principles
- **Ready-Made Physical Appliance Invariant:** JalDrishti uses factory-sealed, ready-made inline pipeline monitors (ESP32-S3 + industrial flow cell with 3/4" BSP/NPT threads). Citizens do NOT assemble electronics, breadboards, GPIOs, or wire splicing. Citizen responsibilities are strictly confined to mechanical installation, in-app Wi-Fi provisioning, account claiming via physical secret, and telemetry monitoring.
- **Strict Anti-Spoofing & Security:** Device claiming requires physical claim secret verification (`claimCodeHash` via bcrypt/SHA-256). Devices cannot be claimed without the physical code, and already claimed devices reject subsequent pairing attempts with HTTP 409 Conflict.
- **Wi-Fi Password Privacy:** Wi-Fi credentials are never transmitted to or stored on the cloud server. The guided flow uses direct device SoftAP (`192.168.4.1`) for physical provisioning; cloud backend only records the network SSID for diagnostic reference.
- **Honest Connection Diagnostics:** System implements a 5-state diagnostic engine distinguishing `not configured`, `awaiting Wi-Fi setup`, `offline`, `connected but not sending readings`, and `receiving data`. Real timestamps are always displayed with zero fabricated mock telemetry.

### 2. Backend Implementation
- **Data Models:**
  - `User.js`: Added `hardwareOnboarding` (`status`: `'yes' | 'no' | 'not_sure' | 'pending'`, `completedAt`) and `assignedNodeId`.
  - `SensorNode.js`: Added `ownerId` (ref: `User`), `claimCodeHash`, `blynkIntegration` (`configured`, `templateId`, `deviceName`, `lastSyncAt`, `syncStatus`), and `wifiProvisioning` (`ssid`, `configuredAt`, `status`).
- **Security Utilities (`deviceKey.js`):** Added `hashClaimCode` and `verifyClaimCode` with fallback support for cryptographic testing.
- **Endpoints (`hardwareController.js` & `hardwareRoutes.js` at `/api/hardware`):**
  - `GET /api/hardware/my-device`: Returns claimed device, real telemetry reading, 5-state diagnostic status, and 5-stage setup progress.
  - `POST /api/hardware/claim`: Claims an unowned device using `nodeId` and physical `claimCode`. Enforces HTTP 409 Conflict rejection if already claimed.
  - `POST /api/hardware/unpair`: Clears owner assignment and resets user node binding.
  - `POST /api/hardware/wifi-provision`: Records provisioning status and SSID without capturing credentials.
  - `GET /api/hardware/blynk-status`: Provides Blynk configuration state and architectural data-path metadata.
  - `POST /api/hardware/blynk-webhook`: Direct inbound webhook ingestion with device token authorization.
  - `GET /api/hardware/diagnostics`: Standalone diagnostic evaluation.
- **Onboarding Route (`authRoutes.js`):** Added `PUT /api/auth/onboarding` allowing citizens to update hardware preference (`yes`, `no`, `not_sure`).

### 3. Frontend Implementation
- **Hardware Page (`/hardware` & `/citizen/hardware`):**
  - Five comprehensive tabs: Overview & Readings, Pipeline Installation Guide, Connect to Wi-Fi, Diagnostics & Troubleshooting, and About the Hardware.
  - 5-stage setup stepper: Unboxed & Inspected -> Pipe Installed -> Wi-Fi Connected -> Cloud Linked -> Active Ingestion.
  - Real-time readings cards for pH, Turbidity, TDS, and Water Temperature with BIS IS 10500:2012 compliance tags.
  - Claim Device Modal with physical voucher secret input and Unpair Device confirmation dialog.
- **Onboarding Modal (`HardwareOnboardingModal.jsx`):**
  - High-conversion, aqua-themed modal displayed to unprompted citizens after signup/login.
  - Three distinct choices: "Yes, I have a device", "No, I don't have a device", and "I am not sure".
  - Graceful deferral ("Decide later") without permanent modal lockout.
- **Dashboard & Navigation Integration:**
  - Added "Hardware" link with IoT chip icon to `Sidebar.jsx`.
  - Added responsive Hardware Status widget to `CitizenDashboardPage.jsx` above stat cards.
  - Added Hardware Device Monitoring configuration card in `ProfilePage.jsx` for preference switching.
  - Maintained full AI image-screening (`/citizen/image-screening`) and trend inspection for users without hardware.

### 4. Firmware Reference Artifacts
- `firmware/JalDrishti_ESP32_ReadyMade.ino`: Production factory sketch featuring Captive Portal / SoftAP provisioning (`192.168.4.1`), non-volatile NVS credential storage, multi-ADC sensor sampling with temperature compensation, direct TLS HTTP POST ingestion with `x-device-key`, and physical factory reset switch.
- `firmware/README.md`: Technician guide detailing hardware specifications, factory pinouts, calibration workflows, and mechanical piping specifications.

### 5. Automated Verification
- **Automated Test Suite (Suite 19):** 18 new automated tests in `tests/hardware.test.js` covering onboarding state transitions, claim authentication, anti-squatting 409 rejections, Wi-Fi provisioning logging, 5-state connection diagnostics, and Blynk telemetry ingestion.
- **Full Test Runner (`tests/runner.js`):** 234 passing tests across 19 suites with 0 failures.
- **Frontend Production Build:** Vite v5.4.21 completed cleanly with zero compilation errors in 10.94s.
