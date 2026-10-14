# JalDrishti Automated Testing & Verification Documentation

## 1. Overview & Objective
This document outlines the testing architecture, suites, execution workflows, and verification results for **Phase 25: Expanded Automated Testing**, the final software phase of the **JalDrishti** water quality monitoring system.

The automated verification layer establishes software correctness, integration fidelity, security hardening, and regression coverage for Phases 0 through 24 before any physical hardware/firmware (Phases 26–31) deployment occurs.

> **Academic Prototype Notice**: JalDrishti is developed and evaluated as an academic working prototype. These automated verification suites validate functional compliance with the Software Requirements Specification (SRS) and System Synopsis under controlled prototype conditions, rather than commercial regulatory certification.

---

## 2. Test Architecture

### 2.1 Lightweight Node.js Harness
Rather than introducing heavy external dependencies (such as Jest or Cypress) that could conflict with native ESM/CJS packaging or require background daemons, JalDrishti uses an extensible, deterministic test harness built natively on Node.js and Mongoose:

- **Harness Module**: `scripts/phase25/testContext.js`
- **Dynamic Port Allocation**: Ephemeral HTTP server binding (`port: 0`), preventing TCP port collisions with local development servers.
- **MongoDB Connection Sharing**: Leverages the project's native `db.js` Mongoose connection pool.
- **Isolated State Lifecycle**: Suites setup and teardown their own ephemeral test data (readings, alerts, users, notifications, image checks).
- **Multipart Payload Builder**: Native buffer-based multipart form generator for image screening tests without requiring browser execution.

### 2.2 Consolidated Test Directory Structure
```
tests/
├── runner.js                     # Master test orchestrator with summary reporting
├── testContext.js                # Core test harness, HTTP client, assertions
├── auth.test.js                  # Authentication, profile updates, forgot/reset password
├── rbac.test.js                  # Role-based access control (Citizen vs Admin)
├── sensor.test.js                # Sensor telemetry ingestion & schema boundaries
├── thresholds.test.js            # Dynamic threshold evaluation engine
├── alerts.test.js                # Alert lifecycle (breach, deduplication, resolution)
├── notifications.test.js         # Notification audit & SMS gateway adapter
├── history.test.js               # Historical readings querying & filtering
├── alertHistory.test.js          # Alert history, filters & detail querying
├── mapNodes.test.js              # Sensor nodes, geographical map API & admin CRUD
├── reports.test.js               # Report generation & RFC4180 CSV export
├── adminSettings.test.js         # Admin thresholds & SMS configuration
├── aiScreening.test.js           # AI water image screening & model validation
├── securityRegression.test.js     # Security audit hardening regression (Helmet, CORS, NoSQL)
├── apiContract.test.js           # API contract & naming consistency
├── frontend.test.js              # Frontend routing & production build verification
├── fullIntegration.test.js       # 34-step end-to-end software integration workflow
├── userManagement.test.js        # User deletion safeguards & account administration
└── contactInquiries.test.js      # Contact inquiry management, reviews & responses
```

---

## 3. Test Suites Overview

| Suite # | Suite Name | Tests / Assertions | Scope & Responsibilities |
|---|---|---|---|
| **1** | Authentication | 22 | User registration, login, bcrypt password hashing, JWT signing/expiry/tamper resistance, `/me` endpoint, profile update, role tampering prevention, demo login initials, forgot/reset password token cycle. |
| **2** | Authorization & RBAC | 13 | 401 unauthenticated enforcement, 403 Citizen exclusion from Admin routes, authorized Citizen and Admin routes across 10 functional endpoints. |
| **3** | Sensor Ingestion | 19 | Device key authentication, node state validation, missing fields, type coercion rejection, physical domain bounds (pH 0-14, non-negative turbidity/TDS), NoSQL injection defense, `lastSeen` update. |
| **4** | Threshold Engine | 17 | Evaluation across all 4 parameters (pH, turbidity, TDS, temperature), below/exact/above boundaries, disabled parameter passthrough, missing threshold fallback. |
| **5** | Alert Lifecycle | 10 | Safe state (no alert), initial breach (Active alert), duplicate breach deduplication (`breachCount` increment), safe recovery (Resolved transition), re-breach (new alert), parameter/node independence. |
| **6** | Notification & SMS | 7 | Audit record persistence, plain-language SMS message formatting, duplicate notification prevention, re-breach notification, disabled SMS toggle, Admin phone masking. |
| **7** | Historical Data | 6 | Authentication requirement, chronological ordering, limit parameter enforcement, date range (`from`/`to`) filtering, data integrity with database. |
| **8** | Alert History & Query | 7 | Active vs historical alert querying, parameter filtering, direction filtering, status filtering, limit enforcement, detail endpoint retrieval. |
| **9** | Sensor Nodes & Map | 11 | Node listing, coordinate boundaries (lat: [-90, 90], lng: [-180, 180]), location metadata, node status, `deviceKeyHash` strictly omitted, Admin station CRUD (create, update, decommission). |
| **10** | Reports & CSV Export | 6 | Reading and alert report querying, RFC4180 CSV format compliance, header validity, data row inclusion, CSV formula injection defense (`'` sanitization). |
| **11** | Admin Settings | 9 | Threshold retrieval and update, numeric range validation (`min <= max`), database persistence, SMS configuration update, phone number masking. |
| **12** | AI Water Image Screening | 16 | Multipart upload validation, 0-byte rejection, spoofed MIME magic-byte detection, >5MB file rejection, Clear/Murky/Non-water classifications, confidence normalization (0-100%), student safety advisory, citizen isolation, admin aggregate view, mock provider fallback, Gemini model prefix normalization. |
| **13** | Security Regression | 7 | Security audit regressions: NoSQL operator injection, malformed credentials, invalid ObjectId handling, `X-Powered-By` suppression, Helmet headers, CORS rejection, zero secrets in error responses. |
| **14** | API Contract & Consistency | 6 | Standardized parameter names (`pH`, `turbidity`, `tds`, `temperature`), units (`NTU`, `ppm`, `°C`), status codes, frontend API client endpoint alignment. |
| **15** | Frontend Verification | 5 | Verification of 10 application routes in `App.jsx`, role guards (`RoleRoute`), physical existence of page components, production bundle existence, zero backend secrets in bundle. |
| **16** | Full Software Integration | 34 | Complete end-to-end multi-user workflow traversing all 34 lifecycle steps from authentication through telemetry, breach, deduplication, SMS dispatch, resolution, re-breach, reporting, map, image screening, and isolation. |
| **17** | User Management & Deletion | 8 | User deletion endpoint security, unauthenticated/citizen rejection, self-deletion prevention, invalid/non-existent user handling, admin deletion execution, last remaining admin safeguard. |
| **18** | Contact Inquiry Management | 13 | Citizen contact inquiry submission, validation, unique reference ID (`INQ-*`), citizen access denial to admin review, admin listing/status updates, admin inquiry reply logging with timestamps, resolution lifecycle. |

---

## 4. How to Run Tests

### 4.1 Prerequisites
- **Node.js**: v18+ (verified on Node.js v24.13.0)
- **MongoDB**: Active MongoDB database accessible via `backend/.env` `MONGODB_URI` (or via `npm run db:local`)

### 4.2 Consolidated Master Suite Execution
To run all 18 test suites:
```bash
npm test
```
*or directly using Node.js:*
```bash
node tests/runner.js
```

### 4.3 Running Individual Test Suites
Individual suites can be run standalone:
```bash
node tests/auth.test.js
node tests/mapNodes.test.js
node tests/fullIntegration.test.js
```

### 4.4 Frontend Production Build
```bash
npm run build:frontend
```

---

## 5. Test Data Isolation & Cleanup Protocol

All test suites follow strict data isolation standards:
1. **Identifiable Namespaces**: All entities use dynamic epoch-based IDs (e.g., `test_auth_1791477087712@example.com`, `NODE_E2E_1791477087712`).
2. **Deterministic Teardown**: Each suite implements a `finally` block that cleans up:
   - Created test `User` documents
   - Created test `Reading` documents
   - Created test `Alert` documents
   - Created test `Notification` documents
   - Created test `ImageCheck` records
   - Created test `SensorNode` entities
   - Created test `ContactInquiry` entries
3. **Configuration Restoration**: Any modified global settings (e.g., pH threshold limits, SMS gateway config) are cached prior to test execution and restored in the `finally` block.
4. **Safe Database Disconnect**: Database connections opened specifically for test runs are closed cleanly upon completion.

---

## 6. AI Vision Provider & Mocking Strategy

- **Test Determinism**: AI water image screening tests utilize `MockVisionProvider` (`backend/src/services/imageScreening/providers/mockVisionProvider.js`) configured for deterministic responses based on explicit test filenames (`clear_water_test.jpg`, `murky_turbid_sample.jpg`, `non-water-sample.jpg`).
- **Academic Limitation**: Automated mock vision tests verify the **software pipeline** (upload handling, file validation, security, record persistence, data isolation, and UI advisory generation). They do not claim or certify real-world visual ML accuracy.

---

## 7. Final Verification Results

```
================================================================================
JALDRISHTI CONSOLIDATED SOFTWARE TEST SUITE SUMMARY
================================================================================
TEST SUITE                         STATUS      PASSED    FAILED    TOTAL
--------------------------------------------------------------------------------
Authentication                     PASS        22        0         22
Authorization & RBAC               PASS        13        0         13
Sensor Ingestion                   PASS        19        0         19
Threshold Engine                   PASS        17        0         17
Alert Lifecycle                    PASS        10        0         10
Notification & SMS                 PASS        7         0         7
Historical Data                    PASS        6         0         6
Alert History & Query              PASS        7         0         7
Sensor Nodes & Map                 PASS        11        0         11
Reports & CSV Export               PASS        6         0         6
Admin Settings                     PASS        9         0         9
AI Water Image Screening           PASS        16        0         16
Security Regression                PASS        7         0         7
API Contract & Consistency         PASS        6         0         6
Frontend Verification              PASS        5         0         5
Full Software Integration          PASS        34        0         34
User Management & Deletion         PASS        8         0         8
Contact Inquiry Management         PASS        13        0         13
--------------------------------------------------------------------------------
TOTAL                              PASS        216       0         216
================================================================================
```

### Cumulative Verification Matrix
- **Consolidated Software Test Suite**: 216 / 216 Passed (0 Failed)
- **Frontend Production Build**: Vite build successful (0 errors)
- **Backend Operational Health**: `/health` HTTP 200 OK
- **Cumulative Automated Checks**: 216 fully automated checks across 18 specialized suites.

---

## 8. Known Limitations (Academic Prototype Scope)
1. **SMS Gateway**: Tested via `mockSmsGateway.js` adapter. Real Twilio/cellular SMS dispatch requires active carrier credentials and a funded provider balance.
2. **AI Vision Model**: Live Google Gemini 1.5 Flash screening requires a valid `GEMINI_API_KEY`. In its absence, the pipeline safely falls back to returning HTTP 503 or running under the test-only mock provider.
3. **Hardware & Firmware**: Zero physical ESP32 or sensor calibration tests were conducted in this phase; these are strictly reserved for Phase 26+.
