# JalDrishti — Technical Implementation Decisions Record (ADR)

**Project:** JalDrishti — IoT-Based Multi-Parameter Water Quality Monitoring and Early Warning System  
**Document Status:** Approved Baseline Architecture  
**Author:** Lead Software Architect & Implementation Planner  
**Date:** October 6, 2026 (Updated: October 9, 2026 with Master UI/UX Direction)  
**Reference Documents:**
1. `2a_G2_SRS_JalDrishti_FINAL.docx` (Software Requirements Specification)
2. `3b_G2_Synopsis Presentation_CS508_Minor Project I-Jul-Dec 2026.pdf` (Project Synopsis & Presentation)
3. `4a_G2_Design_Diagram_9_Diagrams_FINAL.docx` (System Design & Architecture Diagrams)

---

## 1. Introduction & Context

This document records the architectural, design, and technical decisions made during the planning of the JalDrishti platform for a **working academic prototype**.

### Mandatory Requirements vs. Implementation Decisions
- **Authoritative Mandatory Requirements:** Core technologies explicitly mandated by the SRS and Synopsis (React, Vite, Tailwind CSS, Recharts, Leaflet, OpenStreetMap, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, ESP32-S3, Wi-Fi, HTTP/JSON).
- **Implementation Decisions:** Specific runtime and package versions, debounce time windows, initial seed threshold values, specific third-party provider adapters (SMS/AI), and polling frequencies. These are recommended engineering choices and remain fully configurable.

---

## 2. Decision Log Summary

| Decision ID | Area | Decision Topic | Selected Approach | Status |
|:---|:---|:---|:---|:---|
| **DEC-01** | Frontend | Framework & Build Tool | React + Vite (Recommended versions: React 18, Vite 5 as implementation choices) | Approved |
| **DEC-02** | Frontend | Styling Architecture | Tailwind CSS (Recommended: v3.4) + Semantic Status Tokens | Approved |
| **DEC-03** | Frontend | State Management | React Context API + Custom Service Hooks | Approved |
| **DEC-04** | Communication | Live Data Strategy | Smart HTTP Polling (Recommended initial: 15s interval, configurable) | Approved |
| **DEC-05** | Authentication | Auth Strategy & Google OAuth | Dual Auth: Local JWT (bcrypt) + Google OAuth 2.0 (`google-auth-library`) | Approved |
| **DEC-06** | Authorization | Access Control | Role-Based Access Control (RBAC) enforced via backend middleware | Approved |
| **DEC-07** | Database | Data Layer & ODM | MongoDB + Mongoose ODM (Recommended: MongoDB 7+, Mongoose 8.x) | Approved |
| **DEC-08** | IoT Ingestion | Sensor API & Device Identity | HTTP/JSON with pre-shared API Secret Header (`x-device-key`) | Approved |
| **DEC-09** | Alerting | Threshold Engine & Debounce | Range check (Safe/Caution/Unsafe) + Configurable debounce window (proposed default: 15 mins) | Approved |
| **DEC-10** | Notifications | SMS Gateway Abstraction | Pluggable Provider Interface (Twilio / Fast2SMS / Dev Logger) | Approved |
| **DEC-11** | AI Screening | Vision Model Architecture | Hosted Vision API (Gemini Vision) via Pluggable Provider Interface | Approved |
| **DEC-12** | Mapping | Geospatial Visualization | Leaflet + React-Leaflet + OpenStreetMap Tiles | Approved |
| **DEC-13** | Analytics | Time-Series Charting | Recharts with responsive SVG containers | Approved |
| **DEC-14** | Reporting | Data Export Format | Historical readings, alert logs, and CSV/report export (as per SRS FR-16) | Approved |
| **DEC-15** | Hardware | Hardware Sequence | Strict Software-First: Simulated payloads (Phases 7–25), Firmware (Phases 26–28) | Approved |
| **DEC-16** | Testing | Test Scenario Reconciliation | Unified Master Test Matrix synthesizing SRS (TC01–05) & Synopsis (TC01–12) | Approved |
| **DEC-17** | UI/UX | Visual Identity & Branding | Original JalDrishti emblem, water droplet + vision motif, custom SVG logo | Approved (Oct 9, 2026) |
| **DEC-18** | UI/UX | Polished Design System | Curated oceanic/cyan palette, Inter typography, 4/8px spacing, elevation & glassmorphism | Approved (Oct 9, 2026) |
| **DEC-19** | UI/UX | Navigation Architecture | Left sidebar for authenticated routes + compact top header with breadcrumbs & user avatar menu | Approved (Oct 9, 2026) |
| **DEC-20** | UI/UX | Profile & Settings System | Dedicated `/profile` view + comprehensive administrative `/settings` page | Approved (Oct 9, 2026) |
| **DEC-21** | UI/UX | Application Shell Footer | Structured footer with academic attribution, status indicator, and safety disclaimer | Approved (Oct 9, 2026) |
| **DEC-22** | UI/UX | Full Page Redesign Scope | Comprehensive redesign across ALL citizen, admin, auth, and error pages | Approved (Oct 9, 2026) |
| **DEC-23** | Architecture | Functional Controls & RBAC | Strict backend permission enforcement, real API integrations, zero fake telemetry | Approved (Oct 9, 2026) |
| **DEC-24** | Architecture | Technology Stack Preservation | Preserve approved stack (React 18, Vite 5, Tailwind 3.4, Express, Mongo, ESP32-S3) | Approved (Oct 9, 2026) |

---

## 3. Detailed Decision Records

### DEC-01: Frontend Framework and Tooling
* **Context:** The project requires a responsive single-page application (SPA) with dynamic charts, live updates, map views, and interactive modals.
* **Document Requirement:** React (Vite) as specified in Synopsis Table 4 and SRS Section 10.
* **Decision:** Use React with Vite as the build bundler. Recommended versions: React `^18.3.1` and Vite `^5.3.0` (treated as stable implementation choices, not authoritative document requirements).
* **Rationale:**
  - Vite offers near-instant hot module replacement (HMR) and optimized Rollup-based builds.
  - Native ESM support accelerates development and keeps the bundle lightweight for an academic prototype.
  - Avoids heavyweight server-side framework complexities since the backend is a dedicated Node.js/Express service.

### DEC-02: Styling Architecture & Theme System
* **Context:** The UI requires a clean look with a blue primary theme, clean sans-serif typography, and clear three-state status indicators (Green = Safe, Amber = Caution, Red = Unsafe). Monolithic CSS files and inline styles are prohibited.
* **Document Requirement:** Tailwind CSS (Synopsis Table 4).
* **Decision:** Tailwind CSS configured with custom design tokens in `tailwind.config.js` (Recommended version: `^3.4.4` as an implementation choice).
* **Rationale:**
  - Standardizes color palettes across parameter cards, badges, and alerts (`status-safe`, `status-caution`, `status-unsafe`).
  - Guarantees modular, utility-first styling without stylesheet bloat.
  - Eliminates conflicting global CSS rules while maintaining responsive layouts through utility classes (`sm:`, `md:`, `lg:`).

### DEC-03: Frontend State Management
* **Context:** The frontend needs to share authentication session state, live sensor readings, active alerts, and configuration across multiple components.
* **Options Considered:**
  1. Redux Toolkit / Zustand
  2. React Context API + Custom Hooks
* **Decision:** React Context API split into domain contexts: `AuthContext`, `SensorContext`, and `AlertContext`.
* **Rationale:**
  - Redux introduces excessive boilerplate for a single-node academic prototype.
  - Domain-separated React Contexts prevent unnecessary re-renders while keeping state modular and easy to test.

### DEC-04: Live Data Delivery Strategy
* **Context:** Sensor readings from the ESP32-S3 arrive periodically (e.g., every 30 to 60 seconds). The frontend must reflect these readings reliably.
* **Options Considered:**
  1. WebSockets (`Socket.io`)
  2. Server-Sent Events (SSE)
  3. Smart HTTP Polling (configurable interval, default proposed: 15 seconds)
* **Decision:** Smart HTTP Polling with a configurable interval (proposed default: 15 seconds), backed by MongoDB indexed queries.
* **Rationale:**
  - WebSockets introduce bidirectional persistent connections, connection keep-alives, reconnection state management, and memory overhead on the server, which is unnecessary for a prototype receiving data once or twice a minute.
  - Smart polling uses standard stateless HTTP GET requests, simplifies caching (`ETag` / `304 Not Modified`), and eliminates firewall/proxy traversal issues common with WebSockets.
  - The architecture encapsulates polling logic in a custom hook `useLiveReadings`, allowing seamless migration to SSE/WebSockets in future versions without rewriting UI components.

### DEC-05: Authentication Strategy & Google OAuth 2.0
* **Context:** The system requires local signup/login with JWT and bcrypt, along with Google OAuth integration requested by the project stakeholders.
* **Decision:**
  - Local Auth: Passwords hashed with `bcryptjs` (salt rounds = 10). JWT issued upon authentication containing `{ userId, email, role }` with a configurable 24-hour expiration.
  - Token Transport: JWT delivered in response body and stored in secure client state / `localStorage` (with planned migration path to `httpOnly` cookie). Sent via `Authorization: Bearer <token>` header.
  - Google OAuth: Frontend utilizes `@react-oauth/google` to obtain Google ID tokens; backend verifies tokens using official `google-auth-library`. If the user does not exist in MongoDB, an account with role `Citizen` is automatically provisioned. If the email matches an existing local user, the Google identity is safely linked.
* **Rationale:** Ensures zero friction for residents while keeping credentials secure and centralized.

### DEC-06: Authorization Enforcement
* **Context:** Administrators must manage thresholds and SMS recipients, while Citizens must only view safety data and submit image checks.
* **Decision:** Strict backend Role-Based Access Control (RBAC).
* **Rationale:**
  - Frontend route guarding (via `ProtectedRoute.jsx`) protects UX navigation only.
  - Backend middleware (`authorize(['Admin'])`) validates the decoded JWT role on every privileged endpoint (`/api/thresholds`, `/api/recipients`, `/api/alerts/:id/ack`). Direct API calls without valid Admin tokens fail with HTTP `403 Forbidden`.

### DEC-07: Database Layer & Indexing Strategy
* **Context:** The system stores time-series sensor readings, alerts, notifications, users, thresholds, and image checks.
* **Document Requirement:** MongoDB with Mongoose (Synopsis Table 4).
* **Decision:** MongoDB with Mongoose ODM (Recommended versions: MongoDB `v7.0+`, Mongoose `^8.4.1` as implementation choices).
* **Indexing Strategy:**
  - `Reading`: Compound index on `{ nodeId: 1, timestamp: -1 }` for rapid historical queries and latest reading retrieval.
  - `Alert`: Compound index on `{ status: 1, timestamp: -1 }`.
  - `User`: Unique index on `email`.
  - `Threshold`: Unique index on `parameter`.
* **Rationale:** MongoDB handles JSON sensor payloads cleanly and provides indexed time-series queries.

### DEC-08: Sensor Ingestion API & Device Identity
* **Context:** The ESP32-S3 communicates over Wi-Fi using HTTP/JSON. The endpoint must reject spoofed or malformed payloads.
* **Decision:**
  - Endpoint: `POST /api/sensors/reading`
  - Authentication: Device presents an API key in the custom header `x-device-key` matching the hashed key stored in the `SensorNode` collection.
  - Validation: Rigid schema validation verifying `nodeId`, `pH` (0–14), `turbidity` (>= 0), `tds` (>= 0), and `temperature` (-10 to 80°C). Missing or non-numeric values are rejected immediately with HTTP `400 Bad Request`.

### DEC-09: Threshold Engine, Configurable Limits & Debounce Logic
* **Context:** The SRS mandates configurable safe-range thresholds (`FR-06`, `FR-15`). Breaching thresholds triggers alerts and SMS.
* **Explicit Requirement vs. Implementation Decision:**
  - **Authoritative Requirement:** Thresholds must be dynamically configurable by the Administrator (`FR-06`, `FR-15`).
  - **Implementation Decision (Provisional Seeds):** The baseline seed values (pH `6.5–8.5`, Turbidity `0–5 NTU`, TDS `0–500 ppm`, Temperature `10–40°C`, derived from wireframe labels and BIS IS 10500:2012 references) are **proposed initial seed defaults** requiring final confirmation by project evaluators, NOT hardcoded requirements.
  - **Implementation Decision (Debounce Window):** The 15-minute alert suppression/debounce window is an **implementation decision / configurable setting**, NOT an authoritative SRS requirement. It prevents notification flooding when a sensor reports consecutive breach readings.
* **Classification Logic:**
  - **Safe:** Value within configured `[minimum, maximum]`.
  - **Caution:** Value within 10% boundary tolerance of configured limits.
  - **Unsafe:** Value strictly outside configured safe bounds (e.g., pH < 6.5 or pH > 8.5).
  - **De-duplication / Debounce:** When an alert is active for a parameter on a node, subsequent breach readings within the configurable suppression window link to the existing alert rather than generating repeat SMS notifications. Once readings return to Safe for 2 consecutive cycles, the alert auto-resolves or is marked cleared.

### DEC-10: SMS Gateway Abstraction
* **Context:** Automated SMS alerts must be sent to authorities and registered residents upon threshold breaches (`FR-08`).
* **Decision:** Implement a modular `SmsService` adapter pattern:
  - `TwilioSmsProvider` (Standard SMS provider)
  - `Fast2SmsProvider` (Indian domestic SMS gateway)
  - `MockSmsProvider` (Default for local development and CI testing; logs formatted SMS to file/console)
* **Rationale:** Allows offline testing and academic demonstrations without incurring live SMS billing, while supporting instant activation with live credentials via environment variables.

### DEC-11: AI Water Image Screening Architecture
* **Context:** Synopsis Section 10 leaves ML/AI implementation open: "[hosted vision API or trained image classifier: to be decided]".
* **Comparative Evaluation:**
  1. *Option A: Hosted Vision API (Google Gemini Flash Vision)*
     - Implementation Effort: Low (Structured multimodal prompt).
     - Timeline: Fits project schedule (Weeks 6–10).
     - Accuracy: High zero-shot reasoning on visual water clarity, turbidity, discoloration, and presence of foreign matter.
     - Operational Reliability: High (reliable uptime, no separate Python server required).
     - Non-water Rejection: Built-in visual prompt instruction accurately detects and rejects non-water images.
  2. *Option B: Custom Trained Classifier (MobileNet/ResNet on PyTorch/TensorFlow)*
     - Implementation Effort: High (Dataset curation of 1,000+ water samples, training, evaluation, Dockerized Python Flask microservice).
     - Accuracy: Prone to false positives without large diverse datasets; struggles with varied lighting and container types.
     - Deployment Complexity: Requires running a separate Python container alongside Node.js.
* **Decision:** Recommend **Hosted Vision API (Gemini Vision)** as the primary engine, encapsulated behind a generic `ImageAnalysisProvider` interface. A fallback `MockVisionProvider` will be provided for fully offline evaluation.
* **Disclaimers:** Every AI response strictly persists and displays the mandatory advisory: *"Advisory only. Visual analysis cannot confirm water is safe for drinking. For confirmation, laboratory or sensor testing is required."*

### DEC-12: Mapping Technology
* **Context:** The single prototype node location must be displayed interactively (`FR-12`).
* **Document Requirement:** Leaflet with OpenStreetMap tiles.
* **Decision:** `react-leaflet` + `leaflet` (Recommended versions: `react-leaflet ^4.2.1`, `leaflet ^1.9.4` as implementation choices).
* **Rationale:** Free, open-source, requires no proprietary API billing, and renders fast interactive markers with popups displaying live node metrics.

### DEC-13: Time-Series Charting Library
* **Context:** Trends view requires multi-parameter line charts with marked safe limit threshold lines (`FR-10`).
* **Document Requirement:** Recharts.
* **Decision:** Recharts (Recommended version: `^2.12.7` as an implementation choice).
* **Rationale:** Native React SVG charting, supports dynamic `ReferenceLine` components for configurable safe limits, responsive layouts via `ResponsiveContainer`, and smooth tooltips.

### DEC-14: Reporting & CSV Export Format
* **Context:** SRS `FR-16` mandates: "Support historical readings, alert logs and CSV/report export."
* **Decision:** Implement CSV/report export streaming via backend (`json2csv`).
* **Scope Clarification:** PDF reporting is NOT a mandatory project requirement. The approved baseline is strictly historical readings, alert logs, and CSV/report export as defined in SRS FR-16.
* **Rationale:** Ensures minimal memory footprint on the server even when exporting large volumes of telemetry records, perfectly satisfying SRS FR-16 without unnecessary PDF generation bloat.

### DEC-15: Hardware Implementation Sequencing
* **Context:** Hardware assembly can lead to project delays if software integration is attempted prematurely.
* **Decision:** Strict software-first workflow. The entire backend, database, alerting engine, and frontend dashboard will be constructed and verified using simulated ESP32-S3 HTTP payloads (Phases 7–25) before any physical breadboarding or probe calibration takes place in Phase 26+.

### DEC-16: Testing Matrix Harmonization
* **Context:** The SRS defines test cases TC01–TC05, while the Synopsis presentation defines expanded test cases TC01–TC12 with differing numbering.
* **Decision:** Formulate a master synthesized test suite retaining explicit bidirectional mappings to both documents so that neither specification is lost or contradicted.

---

## 4. Master UI/UX Direction & Frontend Redesign Decisions (October 9, 2026)

> [!IMPORTANT]
> **Distinction Between Architectural Baseline and UI/UX Direction:**  
> The decisions below (DEC-17 through DEC-24) formalize the agreed user interface, aesthetic, and interaction design direction for JalDrishti. They build directly upon the existing architectural baseline (DEC-01 through DEC-16) without modifying or compromising any core requirements of the SRS (`2a_G2_SRS_JalDrishti_FINAL.docx`), Project Synopsis (`3b_G2_Synopsis Presentation`), or System Design document (`4a_G2_Design_Diagram_9_Diagrams_FINAL.docx`). All functional specifications (FR-01 through FR-16) and non-functional guarantees remain binding and authoritative.

### DEC-17: Original JalDrishti Visual Identity & Logo
* **Context:** The previous frontend implementation relied on generic icon placeholders and standard sans-serif text labels, lacking a memorable institutional identity suitable for a municipal water monitoring system.
* **Decision:** Design and embed an original, bespoke JalDrishti visual brand identity:
  - **Emblem Concept:** Geometric fusion of a pure water droplet (*Jal*) enclosing an alert, observant eye / ripple wave (*Drishti*), signifying continuous vigilance over community water safety.
  - **Brand Assets:** Dedicated vector SVG logo components (`Logo.jsx`, `LogoIcon.jsx`) rendered cleanly at 16px, 24px, 32px, 48px, and 64px; custom SVG favicon; unified wordmark pairing the emblem with clean modern typography.
  - **No Generic Placeholders:** Eliminate stock placeholder images or unthemed SVG defaults in brand positions.
* **Rationale:** Establishes academic credibility, professional visual polish, and instant municipal recognition.

### DEC-18: Polished Design System, Theme Tokens & Typography
* **Context:** The initial UI exhibited excessive empty space, inconsistent card padding, weak typographic hierarchy, and generic colors that did not convey the vital public health mission of the system.
* **Decision:** Implement a comprehensive, polished design system within Tailwind CSS:
  - **Curated Palette:**
    - Primary Brand: Municipal Deep Ocean (`#0369a1` / `#0284c7`).
    - Secondary Accent: Clean Cyan & Mineral Aqua (`#06b6d4` / `#0891b2`).
    - Neutral Surfaces: Crisp Light mode (`#f8fafc`, `#f1f5f9`, `#ffffff`) and high-contrast Slate Dark mode (`#0f172a`, `#1e293b`).
    - Semantic Status Hierarchy: Emerald Safe (`#059669`), Amber Caution (`#d97706`), Rose Unsafe (`#e11d48`).
  - **Typography:** Inter / sans-serif with strict scale (`text-xs` to `text-3xl`), consistent font weights (`font-medium`, `font-semibold`, `font-bold`), and optimized line heights (`leading-snug`, `leading-relaxed`).
  - **Spacing & Elevation:** Enforce a strict 4px/8px modular grid across all margins, paddings, and component gaps; cards feature subtle border rings (`border-slate-200/80`), soft ambient shadows (`shadow-sm` / `shadow-md`), and optional glassmorphism backdrops (`backdrop-blur-md bg-white/90`).
  - **Iconography & Graphics:** Use Lucide React icons with consistent stroke widths (1.75px–2px) and contextual color tints.
* **Rationale:** Eliminates layout emptiness, creates harmonious visual pacing, and delivers a modern software experience.

### DEC-19: Authenticated Navigation Architecture (Left Sidebar & Top Header)
* **Context:** Previous navigation was dispersed across disjointed top bars, making discovery of administrative views difficult and contributing to confusion when citizen accounts attempted to view administrative sections.
* **Decision:** Introduce a standardized, role-aware application shell:
  - **Persistent Left Sidebar (`Sidebar.jsx`):**
    - Desktop: Persistent fixed-width (`w-64`) sidebar with brand logo, grouped navigation items, active link highlight styling, and role badge.
    - Tablet / Mobile: Collapsible off-canvas drawer with smooth transition overlay triggered by a hamburger menu.
    - Role Filtering: Citizens see citizen views (Dashboard, Trends, Alerts, Map, AI Screening, Profile). Administrators see citizen views PLUS administrative controls (Admin Dashboard, Threshold Settings, Recipient Directory, Report Exports, Audit Log, System Settings).
  - **Compact Top Header (`Header.jsx`):**
    - Compact height (`h-16`) containing active breadcrumb trail, current page title, real-time node connectivity indicator (`NodeStatusBadge`), active alerts counter badge with quick navigation, and authenticated user profile avatar menu.
    - User Avatar Dropdown: Shows user name, email, verified role badge (`Admin` or `Citizen`), link to Profile, and clean logout trigger.
* **Rationale:** Maximizes screen real estate for telemetry and data charts while ensuring all permissible features are one click away.

### DEC-20: User Profile & Dedicated Settings System
* **Context:** Users lacked a dedicated screen to review their authenticated account details, session status, or role. Administrators needed a unified settings center rather than scattered configuration panels.
* **Decision:**
  - **Dedicated Profile Page (`/profile`):** Available to all authenticated users; displays account name, email, role badge, registration date, session token expiry status, and account activity summary.
  - **Comprehensive Settings Page (`/settings`):** Available to Administrators; organizes system management into intuitive tabs:
    1. *Threshold Configuration:* Live min/max bound inputs for pH, Turbidity, TDS, and Temperature with client-side boundary validation.
    2. *SMS Recipient Management:* Add, inspect, and remove phone numbers for automated alert dispatch.
    3. *Alert & Debounce Configuration:* Inspect and configure debounce suppression windows and notification toggles.
* **Rationale:** Satisfies usability requirements, clarifies user roles, and centralizes administrative governance.

### DEC-21: Application Shell Footer & System Transparency
* **Context:** The application previously lacked a structured footer or provided only a minimalist copyright string, missing opportunities to convey academic context and live system status.
* **Decision:** Implement a standardized, informative footer (`Footer.jsx`) across all pages:
  - **Academic Attribution:** Minor Project I — Department of Computer Science & Engineering, CS508 (Indore, MP, 2026).
  - **System Health Pill:** Live backend API connection indicator (`API: Online` / `API: Disconnected`).
  - **Regulatory Safety Notice:** Clear statutory advisory (*"JalDrishti is an automated advisory monitoring prototype. For statutory potability certification, laboratory chemical testing is mandatory."*).
  - **Quick Links:** Navigation shortcuts to About, Map, Alert Feed, and Documentation.
* **Rationale:** Grounds the application in its authentic academic context while providing continuous visibility into service health.

### DEC-22: Full Page Redesign Scope (Entire Frontend)
* **Context:** The initial design effort focused almost exclusively on the administrative and citizen dashboard views, leaving secondary pages (Trends, Alerts, Map, AI Screening, Login, Signup, Error states) visually inconsistent.
* **Decision:** Redesign ALL application pages under the new design system:
  - `CitizenDashboard.jsx`: High-visibility status banner, parameter cards with progress meters, latest readings table.
  - `AdminDashboard.jsx`: Operational KPI cards, breach alerts summary, fast acknowledgment panel, node health.
  - `TrendsPage.jsx`: Filterable Recharts line charts with safe-range shaded bands and interactive tooltips.
  - `AlertsPage.jsx`: Filterable table with severity badges, acknowledge modal dialogs, and resolution history.
  - `MapPage.jsx`: Immersive full-screen Leaflet container with custom status markers and rich popup cards.
  - `ImageCheckPage.jsx`: Responsive dropzone, client thumbnail preview, classification meter, and advisory notice.
  - `LoginPage.jsx` / `SignupPage.jsx`: Modern split layout with JalDrishti branding, form validation, and Google OAuth button.
  - `NotFoundPage.jsx` / `UnauthorizedPage.jsx`: Illustrated, clear error states with actionable redirect buttons.
* **Rationale:** Guarantees a cohesive, end-to-end user experience across every route.

### DEC-23: Functional Controls & Strict Backend Permission Enforcement
* **Context:** An account authenticated as a Citizen attempting to view administrative features received "Access Denied" (as expected by RBAC), but lacked clear feedback, while the application lacked discoverable administrator entry paths.
* **Decision:**
  - **Zero Fake Features:** All buttons, filters, modals, and toggles must be wired to authentic API calls; zero non-functional dummy buttons or fabricated telemetry values.
  - **Strict Backend RBAC:** Backend middleware (`requireRole(['Admin'])`) remains the authoritative security boundary. Frontend route guards (`RoleRoute.jsx`) provide smooth UX routing, but direct API tampering is strictly rejected with HTTP 403.
  - **Clear Role Feedback & Guidance:** When a Citizen encounters an administrative boundary, the UI presents an informative explanation explaining role restrictions and offering a direct link to sign in with an Administrator account rather than a generic dead-end.
  - **Deterministic Admin Provisioning:** Provide a documented, secure admin provisioning workflow (seed admin credentials) so evaluators can readily authenticate with the Admin role.
* **Rationale:** Enforces bulletproof security without compromising user usability or evaluation readiness.

### DEC-24: Technology Stack Preservation
* **Context:** Architectural churn (such as switching CSS frameworks or changing backend libraries) introduces severe regression risks.
* **Decision:** Preserve 100% of the approved core technology stack:
  - Frontend: React 18, Vite 5, Tailwind CSS 3.4, Recharts, Leaflet, React-Leaflet, Lucide React, `@react-oauth/google`.
  - Backend: Node.js 20 LTS, Express 4, MongoDB with Mongoose 8, JWT, bcryptjs, `google-auth-library`, `multer`, `helmet`, `cors`, `express-rate-limit`.
  - Architecture: MERN stack, RESTful APIs, smart HTTP polling, pluggable SMS and AI vision adapters.
  - Hardware: ESP32-S3 with Wi-Fi (preserved for Phases 26+).
* **Rationale:** Ensures stability, eliminates regressions, and respects authoritative project requirements.

### DEC-25: Vector SVG Logo Emblem & Dark Navy Brand Theme Alignment
* **Context:** The reference UI specification calls for a high-contrast dark navy `#0B192C` sidebar, modern ocean-inspired iconography, and an authentic emblem rather than basic letter placeholders.
* **Decision:**
  - Implemented an original SVG vector emblem combining a fluid water droplet with an observant eye curve in cyan `#0284C7` and emerald `#10B981`.
  - Configured custom navy shades (`#0B192C`, `#112240`, `#07111E`) in Tailwind CSS alongside subtle card elevation and glassmorphism.
* **Rationale:** Establishes a polished visual identity matching the reference mockups while preserving accessible contrast (WCAG AA).

### DEC-26: CLI Administrator Account Provisioning Tool (`scripts/provision_admin.js`)
* **Context:** Evaluators and deployment environments require a deterministic, secure mechanism to provision or reset administrative credentials without modifying production source code or weakening RBAC.
* **Decision:**
  - Created `scripts/provision_admin.js` accepting email, password, and name via CLI flags (`--email`, `--password`, `--name`) or defaulting safely to evaluation credentials.
  - Automatically provisions admin credentials using bcrypt hashing with cost 10 and assigns the immutable `Admin` role in MongoDB.
* **Rationale:** Resolves REM-02 cleanly, preventing admin lockouts and avoiding hardcoded plain-text credentials in repository source files.

### DEC-28: Typography Hierarchy & Strict Zero-Emoji UI Policy
* **Context:** The application previously exhibited inconsistent font families and emoji-based UI elements, diminishing the credibility of an environmental tech SaaS product.
* **Decision:**
  - Standardized font typography across the entire application: Manrope for headings/titles, Inter for body/navigation, and JetBrains Mono for telemetry numbers and identifiers.
  - Enforced a strict Zero-Emoji policy across all UI components, dashboards, badges, and cards, replacing all emojis with professional SVG icons in `src/components/common/Icons.jsx`.
  - Audited and verified with automated script `scripts/check_emojis.js`, confirming exactly 0 emojis in frontend source.
* **Rationale:** Establishes a professional, credible scientific SaaS aesthetic suitable for academic evaluation and real-world municipal water monitoring.

### DEC-29: Authentication Shell Overhaul & Full-Viewport Landing Page
* **Context:** The login page suffered from an oversized droplet graphic pushing the form downward on a plain background, while the landing page lacked full viewport presentation and had several dead footer links.
* **Decision:**
  - Redesigned authentication into `AuthLayout.jsx`: removed the giant droplet graphic, created a compact top bar with logo on far left and Sign In/Up links on far right, and styled the form in a restrained glassmorphism panel (`bg-slate-900/85 backdrop-blur-xl`) over a natural water landscape.
  - Rebuilt the public landing page with a full-viewport hero (`min-h-[calc(100vh-4rem)]`), interactive status preview, and comprehensive functional sections: Essential Indicators (BIS IS 10500:2012), System Architecture, Mission, Standards, Help Center FAQ, and Contact Us form.
  - Mapped all footer and navigation links to real active sections, resolving dead anchor jumps.
* **Rationale:** Directly addresses user feedback regarding the login page and landing page presentation without breaking any authentication flows or API contracts.

### DEC-30: Precision Hydro-Nexus Brand Identity & Favicon Replacement
* **Context:** The user found the previous logo and black water-drop favicon unacceptable. An authentic environmental IoT technology platform requires a distinctive, professional geometric brand identity communicating scientific rigor, sensor telemetry, and environmental stewardship.
* **Decision:**
  - Designed and deployed the **JalDrishti Precision Hydro-Nexus** vector identity: an outer precision telemetry orbit ring, dual interlocking hydrodynamic laminar flow ribbons, and a central optical focal node ("Drishti" - insight/vigilance) with telemetry beacon indicators.
  - Implemented matching high-contrast vector favicon (`frontend/public/favicon.svg`) that renders legibly at 16x16, 32x32, and 64x64 pixels.
  - Updated `index.html` with cache-busting `<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=4" />`.
  - Standardized the new emblem and wordmark across all application surfaces (`Logo.jsx`, `AppLayout.jsx`, `Sidebar.jsx`, `AuthLayout.jsx`, `Footer.jsx`).
  - Zero cartoon droplets or clip-art elements.
* **Rationale:** Establishes a memorable, credible brand identity across public and authenticated screens while ensuring consistent rendering across desktop and mobile.

### DEC-31: Profile & Settings Destination Architectural Separation
* **Context:** The top-right account dropdown presented "My Profile" and "Settings and Threshold", but both routed to the same component (`AdminSettingsPage`), creating functional confusion.
* **Decision:**
  - Created a dedicated, standalone `ProfilePage.jsx` mounted at `/profile`:
    - Personal Information: Full Name, Emergency Phone (for water contamination SMS alerts), Organization.
    - Read-only Role display with explicit security notice: *"RBAC Protected: User role is enforced server-side. Privilege escalation is strictly prohibited."*
    - Security & Password change card with current and new password validation.
    - Directly persists updates to MongoDB via `PUT /api/auth/profile`. Backend strictly prevents users from modifying their own `role`.
  - Refactored `AdminSettingsPage.jsx` to be dedicated to **Settings & Thresholds** mounted at `/settings` (Citizen) and `/admin/settings` (Admin):
    - Default tab: **Water Quality Thresholds** (pH, Turbidity, TDS, Temperature lower and upper bounds).
    - Fully editable by Administrators with direct persistence to `PUT /api/thresholds/:parameter`, live validation, and immediate propagation to the in-memory threshold evaluation engine.
    - Informative BIS IS 10500:2012 Drinking Water Standards view for Citizens.
    - Additional tabs for Alert Notifications & SMS Gateway and Application Preferences.
* **Rationale:** Eliminates routing duplication, separates personal credentials from system monitoring configuration, and enforces strict RBAC boundaries.

### DEC-32: Administrative Capability Completion & Station Node Management CRUD
* **Context:** The Administrator role required genuine management capabilities across the system, not merely a read-only monitoring view identical to the Citizen interface.
* **Decision:**
  - Audited all existing Admin capabilities across the stack (Admin Dashboard, Threshold Management, User Management, Alert Acknowledgment, Reporting & CSV Export, Aggregated AI Screening).
  - Identified and closed the backend gap in Sensor Station Node management by implementing:
    - `POST /api/sensor/nodes`: Register new IoT sensor station with coordinates, metadata, and device key.
    - `PATCH /api/sensor/nodes/:nodeId`: Update station name, operational status ('Online', 'Offline', 'Maintenance'), and coordinates.
    - `DELETE /api/sensor/nodes/:nodeId`: Decommission and remove a station with confirmation safeguard.
### DEC-33: Citizen Settings RBAC Isolation & Reference Standards View
* **Context:** Navigating to `/settings` as a Citizen previously triggered a "Something went wrong" crash error because the settings hook unconditionally called `GET /api/thresholds` and `GET /api/notifications/config`, both of which are strictly restricted to Administrators and return HTTP 403 Forbidden.
* **Decision:**
  - Updated `useAdminSettings.js` to accept `{ enabled = true }`, bypassing privileged requests for Citizen users.
  - Rendered national drinking water standards (BIS IS 10500:2012) in read-only format for Citizens alongside an explicit RBAC security notice explaining that system-wide threshold bounds can only be modified by authorized Administrators.
  - Personal notification preferences remain accessible to Citizens without crashing.
* **Rationale:** Resolves the root cause of the error while strictly preserving backend RBAC security boundaries and preventing unauthorized mutations.

### DEC-34: Secure Single-Use Password Reset & Rate Limiting Architecture
* **Context:** The login page required a robust password recovery workflow that prevents account enumeration and unauthorized password modifications.
* **Decision:**
  - Added visible "Forgot password?" link on the login card leading to `/forgot-password`.
  - Implemented `POST /api/auth/forgot-password` returning a neutral confirmation message (*"If an account matches that email address, password reset instructions have been sent."*) regardless of whether the account exists.
  - Generated cryptographically secure 32-byte tokens, stored strictly as SHA-256 hashes in MongoDB with a 1-hour expiration timestamp (`resetPasswordExpires`).
  - Implemented `POST /api/auth/reset-password` allowing users to securely set a new password via `/reset-password?token=...`.
  - Used `bcrypt` for password hashing, immediately invalidated tokens upon successful use, and strictly preserved the user's existing role and privileges.
  - Implemented a dedicated `passwordResetRateLimiter` middleware without modifying the existing `authRateLimiter`.
* **Rationale:** Protects against credential attacks and enumeration while providing a seamless recovery experience.

### DEC-35: Contact Inquiry Persistence, Spam Protection & Admin Review Plane
* **Context:** The public homepage contact form previously used client-side simulation without persisting inquiries or alerting project leads.
* **Decision:**
  - Created MongoDB `ContactInquiry` collection with schema validation (name, email, subject, message, status: `['New', 'In Review', 'Resolved']`, admin notes, timestamps).
  - Implemented public `POST /api/contact` protected by a dedicated `contactRateLimiter` (15m window, length validation).
  - Implemented Admin-only review endpoints: `GET /api/contact` (paginated listing) and `PATCH /api/contact/:id` (status & notes updates), guarded by `authenticate` and `requireRole(['Admin'])`. Citizens receive HTTP 403.
  - Integrated transactional notifications through `emailService.js` (with development simulation logging).
  - Embedded a live "Public Contact Inquiries & Community Feedback" management panel directly into the Admin Dashboard (`/admin`).
* **Rationale:** Ensures genuine inquiry persistence, spam protection, administrative oversight, and zero fabricated success states.

---
*Signed by Lead Software Architect — Baseline Architectural Decisions & Follow-Up Implementation Approved.*

