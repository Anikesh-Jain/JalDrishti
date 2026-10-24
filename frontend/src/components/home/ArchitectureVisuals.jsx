import React from 'react';

/**
 * JalDrishti Architecture Stage 1: Ready-Made Sensor Device in Pipeline
 * Clean vector illustration showing standard pipeline plumbing with factory-sealed
 * inline probe collar and immersion sensors (pH, turbidity, TDS, temperature).
 */
export function Stage1SensorVisual({ className = 'w-full h-full' }) {
  return (
    <svg className={className} viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Ready-Made Sensor Device installed in pipeline">
      <defs>
        <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FAFF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>
        <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#0284C7" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="sensorHousingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      {/* Card Background */}
      <rect width="320" height="180" rx="12" fill="url(#bgGrad1)" />
      <rect x="0.5" y="0.5" width="319" height="179" rx="11.5" stroke="#BAE6FD" strokeWidth="1" />

      {/* Pipeline Pipe Cross-Section */}
      <rect x="20" y="105" width="280" height="46" rx="4" fill="url(#pipeGrad)" />
      {/* Pipe Inner Water Channel */}
      <rect x="20" y="112" width="280" height="32" fill="url(#waterFlowGrad)" />
      {/* Water flow wave traces */}
      <path d="M 25 124 Q 45 120 65 124 T 105 124 T 145 124 T 185 124 T 225 124 T 265 124 T 295 124" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" fill="none" strokeDasharray="6 3" />
      <path d="M 30 134 Q 50 130 70 134 T 110 134 T 150 134 T 190 134 T 230 134 T 270 134" stroke="#E0F7FF" strokeWidth="1" strokeOpacity="0.5" fill="none" />
      {/* Flow Direction Arrow */}
      <path d="M 270 128 L 285 128 M 281 124 L 286 128 L 281 132" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

      {/* Inline Tee-Joint Collar Fitting */}
      <rect x="132" y="85" width="56" height="24" rx="2" fill="#64748B" />
      <rect x="126" y="81" width="68" height="6" rx="2" fill="#475569" />

      {/* Factory-Sealed Sensor Probe Enclosure */}
      <rect x="136" y="22" width="48" height="62" rx="8" fill="url(#sensorHousingGrad)" stroke="#BAE6FD" strokeWidth="1.5" />
      {/* IP67 Seal Ring & Gasket */}
      <rect x="140" y="76" width="40" height="5" rx="1.5" fill="#15803D" />
      {/* Status LED & JalDrishti Device Label */}
      <circle cx="160" cy="35" r="3.5" fill="#4ADE80" />
      <circle cx="160" cy="35" r="5.5" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.6" />
      <rect x="144" y="46" width="32" height="14" rx="3" fill="#0C4A6E" />
      <text x="160" y="56" fill="#BAE6FD" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">JAL-PROBE</text>

      {/* 4 Immersion Sensor Probes Submerged in Water Stream */}
      {/* Probe 1: pH glass electrode */}
      <rect x="140" y="90" width="6" height="34" rx="2" fill="#0284C7" />
      <circle cx="143" cy="126" r="4.5" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="1" />

      {/* Probe 2: Turbidity optical cell */}
      <rect x="151" y="90" width="5" height="32" rx="1.5" fill="#D97706" />
      <rect x="150" y="121" width="7" height="6" rx="1" fill="#F59E0B" />

      {/* Probe 3: TDS dual-pin conductivity */}
      <rect x="163" y="90" width="2" height="33" fill="#10B981" />
      <rect x="167" y="90" width="2" height="33" fill="#10B981" />

      {/* Probe 4: Stainless temperature probe */}
      <rect x="173" y="90" width="5" height="35" rx="1.5" fill="#E11D48" />

      {/* Floating 4-Parameter Badges with Connecting Leaders */}
      {/* pH Badge */}
      <g transform="translate(32, 28)">
        <rect width="48" height="18" rx="5" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
        <circle cx="10" cy="9" r="3" fill="#0284C7" />
        <text x="28" y="12.5" fill="#0369A1" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">pH 7.2</text>
      </g>
      <line x1="80" y1="37" x2="135" y2="120" stroke="#0284C7" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.6" />

      {/* Turbidity Badge */}
      <g transform="translate(32, 60)">
        <rect width="56" height="18" rx="5" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
        <circle cx="10" cy="9" r="3" fill="#D97706" />
        <text x="32" y="12.5" fill="#92400E" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1.8 NTU</text>
      </g>

      {/* TDS Badge */}
      <g transform="translate(232, 28)">
        <rect width="58" height="18" rx="5" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1" />
        <circle cx="10" cy="9" r="3" fill="#10B981" />
        <text x="33" y="12.5" fill="#065F46" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">128 ppm</text>
      </g>
      <line x1="232" y1="37" x2="175" y2="115" stroke="#10B981" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.6" />

      {/* Temp Badge */}
      <g transform="translate(234, 60)">
        <rect width="56" height="18" rx="5" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="1" />
        <circle cx="10" cy="9" r="3" fill="#E11D48" />
        <text x="32" y="12.5" fill="#9F1239" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">22.4 °C</text>
      </g>

      {/* Bottom Subtitle / Spec Pill */}
      <rect x="76" y="156" width="168" height="16" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="160" y="167" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">3/4" Inline Pipe NPT / Factory-Sealed</text>
    </svg>
  );
}

/**
 * JalDrishti Architecture Stage 2: Wi-Fi and Blynk Cloud Telemetry Gateway
 * Illustrates ESP32-S3 microcontroller transmitting telemetry over 2.4 GHz Wi-Fi
 * to the local router and Blynk IoT Cloud webhook bridge.
 */
export function Stage2WifiBlynkVisual({ className = 'w-full h-full' }) {
  return (
    <svg className={className} viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wi-Fi and Blynk Cloud Telemetry Gateway">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FAFF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>
        <linearGradient id="espGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="blynkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#24A148" />
          <stop offset="100%" stopColor="#0E6027" />
        </linearGradient>
      </defs>

      {/* Card Background */}
      <rect width="320" height="180" rx="12" fill="url(#bgGrad2)" />
      <rect x="0.5" y="0.5" width="319" height="179" rx="11.5" stroke="#BAE6FD" strokeWidth="1" />

      {/* Left Node: ESP32-S3 Microcontroller Unit */}
      <g transform="translate(24, 46)">
        <rect width="66" height="88" rx="8" fill="url(#espGrad)" stroke="#38BDF8" strokeWidth="1.5" />
        {/* Antenna PCB Trace */}
        <path d="M 12 12 H 54 V 22 H 24 V 30 H 48" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" fill="none" />
        {/* ESP32 IC Shield */}
        <rect x="12" y="38" width="42" height="34" rx="4" fill="#334155" stroke="#64748B" strokeWidth="1" />
        <text x="33" y="52" fill="#E2E8F0" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ESP32-S3</text>
        <text x="33" y="62" fill="#38BDF8" fontSize="6" textAnchor="middle" fontFamily="monospace">2.4 GHz</text>
        {/* Status LED */}
        <circle cx="50" cy="78" r="2.5" fill="#10B981" />
      </g>

      {/* 2.4 GHz Radiating Waves from ESP32 */}
      <path d="M 96 74 A 20 20 0 0 1 96 106" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M 103 67 A 30 30 0 0 1 103 113" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.75" />
      <path d="M 110 60 A 40 40 0 0 1 110 120" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.45" />

      {/* Center: Local Wi-Fi AP / Router */}
      <g transform="translate(132, 58)">
        {/* Dual Antennae */}
        <line x1="14" y1="18" x2="6" y2="2" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="18" x2="50" y2="2" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        {/* Router Base */}
        <rect y="18" width="56" height="32" rx="6" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
        {/* Router LEDs */}
        <circle cx="16" cy="34" r="2" fill="#10B981" />
        <circle cx="28" cy="34" r="2" fill="#38BDF8" />
        <circle cx="40" cy="34" r="2" fill="#10B981" />
        <text x="28" y="44" fill="#64748B" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Wi-Fi AP</text>
      </g>

      {/* Secure Telemetry Data Stream (JSON packets) */}
      <g transform="translate(196, 76)">
        <line x1="0" y1="14" x2="28" y2="14" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 24 10 L 30 14 L 24 18" fill="#0284C7" />
        {/* Lock Pill */}
        <rect x="4" y="-8" width="22" height="14" rx="4" fill="#DDF8E8" stroke="#86EFAC" strokeWidth="0.75" />
        <text x="15" y="2" fill="#15803D" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">WPA2</text>
      </g>

      {/* Right Node: Blynk IoT Cloud & Webhook Gateway */}
      <g transform="translate(230, 44)">
        {/* Cloud Body */}
        <path d="M 22 40 A 18 18 0 0 1 54 28 A 24 24 0 0 1 82 44 A 16 16 0 0 1 76 68 H 18 A 16 16 0 0 1 22 40 Z" fill="#FFFFFF" stroke="#24A148" strokeWidth="1.75" />
        <rect x="22" y="32" width="46" height="20" rx="4" fill="url(#blynkGrad)" />
        <text x="45" y="45" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Blynk IoT</text>
        {/* Webhook badge */}
        <rect x="18" y="66" width="54" height="15" rx="4" fill="#E0F7FF" stroke="#BAE6FD" strokeWidth="1" />
        <text x="45" y="77" fill="#0284C7" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">REST Webhook</text>
      </g>

      {/* Bottom Summary Pill */}
      <rect x="55" y="156" width="210" height="16" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="160" y="167" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SoftAP Provisioning • HTTPS Webhook Ingestion</text>
    </svg>
  );
}

/**
 * JalDrishti Architecture Stage 3: Backend & Database (Node.js & MongoDB)
 * Illustrates Node.js ingestion server, BIS IS 10500 threshold checking engine,
 * alert dispatch trigger, and persistent MongoDB time-series storage.
 */
export function Stage3BackendVisual({ className = 'w-full h-full' }) {
  return (
    <svg className={className} viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Backend Processing and MongoDB Database">
      <defs>
        <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FAFF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>
        <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="dbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Card Background */}
      <rect width="320" height="180" rx="12" fill="url(#bgGrad3)" />
      <rect x="0.5" y="0.5" width="319" height="179" rx="11.5" stroke="#BAE6FD" strokeWidth="1" />

      {/* Left Node: Node.js API Server Rack */}
      <g transform="translate(16, 34)">
        <rect width="94" height="104" rx="8" fill="url(#serverGrad)" stroke="#38BDF8" strokeWidth="1.5" />
        
        {/* Server Header */}
        <rect x="6" y="6" width="82" height="16" rx="3" fill="#0B132B" stroke="#334155" strokeWidth="0.75" />
        <circle cx="14" cy="14" r="2.5" fill="#38BDF8" />
        <text x="49" y="17.5" fill="#93C5FD" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Node.js Server</text>

        {/* Rack Slot 1: API Gateway */}
        <rect x="6" y="26" width="82" height="23" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
        <circle cx="15" cy="37.5" r="3" fill="#38BDF8" />
        <text x="25" y="41" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">API Gateway</text>

        {/* Rack Slot 2: Ingest */}
        <rect x="6" y="52" width="82" height="23" rx="4" fill="#0F172A" stroke="#4ADE80" strokeWidth="1" />
        <circle cx="15" cy="63.5" r="3" fill="#4ADE80" />
        <text x="25" y="67" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Ingest</text>

        {/* Rack Slot 3: JWT / RBAC */}
        <rect x="6" y="78" width="82" height="23" rx="4" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />
        <circle cx="15" cy="89.5" r="3" fill="#F59E0B" />
        <text x="25" y="93" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">JWT / RBAC</text>
      </g>

      {/* Center: BIS IS 10500 Threshold Engine Shield */}
      <g transform="translate(130, 42)">
        <rect width="68" height="86" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
        {/* Shield Icon */}
        <path d="M 34 16 L 52 24 V 42 C 52 54 44 64 34 68 C 24 64 16 54 16 42 V 24 Z" fill="#E0F7FF" stroke="#0284C7" strokeWidth="1.5" />
        <path d="M 28 42 L 32 46 L 40 38" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="34" y="77" fill="#0369A1" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Threshold Engine</text>
      </g>

      {/* Arrows: Server -> Threshold Engine */}
      <path d="M 112 85 L 128 85 M 124 81 L 129 85 L 124 89" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Node: MongoDB Database Cylinder */}
      <g transform="translate(220, 42)">
        {/* Cylinder Tier 1 */}
        <ellipse cx="38" cy="20" rx="36" ry="12" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
        <rect x="2" y="20" width="72" height="24" fill="url(#dbGrad)" />
        <ellipse cx="38" cy="44" rx="36" ry="12" fill="url(#dbGrad)" stroke="#059669" strokeWidth="1.5" />

        {/* Cylinder Tier 2 */}
        <rect x="2" y="44" width="72" height="24" fill="url(#dbGrad)" />
        <ellipse cx="38" cy="68" rx="36" ry="12" fill="url(#dbGrad)" stroke="#059669" strokeWidth="1.5" />

        {/* Cylinder Tier 3 */}
        <rect x="2" y="68" width="72" height="22" fill="url(#dbGrad)" />
        <ellipse cx="38" cy="90" rx="36" ry="12" fill="#047857" stroke="#065F46" strokeWidth="1.5" />

        <text x="38" y="52" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MongoDB</text>
        <text x="38" y="62" fill="#D1FAE5" fontSize="6.5" textAnchor="middle" fontFamily="sans-serif">Time-Series Data</text>
      </g>

      {/* Arrow: Threshold Engine -> DB */}
      <path d="M 200 85 L 216 85 M 212 81 L 217 85 L 212 89" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />

      {/* Alert Dispatcher Tag Above */}
      <g transform="translate(134, 16)">
        <rect width="52" height="18" rx="5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="8" cy="9" r="2.5" fill="#D97706" />
        <text x="30" y="12.5" fill="#92400E" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Alert Engine</text>
      </g>

      {/* Bottom Summary Pill */}
      <rect x="55" y="156" width="210" height="16" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="160" y="167" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">BIS Limits Verification • Secure MongoDB Records</text>
    </svg>
  );
}

/**
 * JalDrishti Architecture Stage 4: Citizen Web Application
 * Illustrates the modern responsive citizen portal with live gauges,
 * multi-parameter trend curves, interactive GIS map, and exportable reports.
 */
export function Stage4WebAppVisual({ className = 'w-full h-full' }) {
  return (
    <svg className={className} viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="JalDrishti Citizen Web Application">
      <defs>
        <linearGradient id="bgGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FAFF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>
        <linearGradient id="appScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* Card Background */}
      <rect width="320" height="180" rx="12" fill="url(#bgGrad4)" />
      <rect x="0.5" y="0.5" width="319" height="179" rx="11.5" stroke="#BAE6FD" strokeWidth="1" />

      {/* Browser Window Frame */}
      <g transform="translate(24, 20)">
        <rect width="272" height="128" rx="8" fill="url(#appScreenGrad)" stroke="#BAE6FD" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />

        {/* Window Chrome Header */}
        <rect width="272" height="22" rx="8" fill="#E0F7FF" />
        <rect y="14" width="272" height="8" fill="#E0F7FF" />
        <line x1="0" y1="22" x2="272" y2="22" stroke="#BAE6FD" strokeWidth="1" />

        {/* Chrome Dots */}
        <circle cx="12" cy="11" r="3" fill="#EF4444" />
        <circle cx="22" cy="11" r="3" fill="#F59E0B" />
        <circle cx="32" cy="11" r="3" fill="#10B981" />

        {/* URL Address Bar */}
        <rect x="52" y="4" width="168" height="14" rx="4" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="0.75" />
        <text x="136" y="14" fill="#0284C7" fontSize="7" fontWeight="semibold" textAnchor="middle" fontFamily="sans-serif">jaldrishti.org/citizen</text>

        {/* App Content Area */}
        {/* Top Metric Bar */}
        <g transform="translate(10, 30)">
          <rect width="56" height="24" rx="4" fill="#F0FAFF" stroke="#BAE6FD" strokeWidth="0.75" />
          <text x="28" y="40" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">pH 7.4</text>
          <text x="28" y="49" fill="#15803D" fontSize="6" textAnchor="middle" fontFamily="sans-serif">Safe</text>

          <rect x="62" width="56" height="24" rx="4" fill="#F0FAFF" stroke="#BAE6FD" strokeWidth="0.75" />
          <text x="90" y="40" fill="#D97706" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1.8 NTU</text>
          <text x="90" y="49" fill="#15803D" fontSize="6" textAnchor="middle" fontFamily="sans-serif">Clear</text>

          <rect x="124" width="60" height="24" rx="4" fill="#F0FAFF" stroke="#BAE6FD" strokeWidth="0.75" />
          <text x="154" y="40" fill="#10B981" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">142 ppm</text>
          <text x="154" y="49" fill="#15803D" fontSize="6" textAnchor="middle" fontFamily="sans-serif">Normal</text>

          {/* Live Status Pill */}
          <rect x="190" width="62" height="24" rx="4" fill="#DDF8E8" stroke="#86EFAC" strokeWidth="0.75" />
          <circle cx="199" cy="42" r="2.5" fill="#15803D" />
          <text x="226" y="45" fill="#15803D" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">LIVE DATA</text>
        </g>

        {/* Mini Parameter Trend Chart */}
        <g transform="translate(10, 60)">
          <rect width="180" height="60" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.75" />
          {/* Grid lines */}
          <line x1="8" y1="20" x2="172" y2="20" stroke="#F1F5F9" strokeWidth="1" />
          <line x1="8" y1="40" x2="172" y2="40" stroke="#F1F5F9" strokeWidth="1" />
          {/* Trend curves */}
          <path d="M 12 44 Q 45 25 80 34 T 130 22 T 168 28" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          <path d="M 12 50 Q 50 42 90 48 T 140 38 T 168 44" fill="none" stroke="#10B981" strokeWidth="1.75" strokeLinecap="round" />
          <text x="16" y="14" fill="#64748B" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">Multi-Parameter Trends</text>
        </g>

        {/* Mini GIS Map Card */}
        <g transform="translate(196, 60)">
          <rect width="66" height="60" rx="4" fill="#E0F7FF" stroke="#BAE6FD" strokeWidth="0.75" />
          {/* Map routes */}
          <path d="M 6 30 Q 30 18 60 36" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M 20 10 L 46 52" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
          {/* Map Pin Marker */}
          <circle cx="33" cy="26" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="33" cy="26" r="2.5" fill="#FFFFFF" />
          <text x="33" y="48" fill="#0284C7" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Station 1</text>
        </g>
      </g>

      {/* Bottom Summary Pill */}
      <rect x="55" y="156" width="210" height="16" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="160" y="167" fill="#0284C7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Live Dashboards • Parameter Trends • GIS Maps</text>
    </svg>
  );
}
