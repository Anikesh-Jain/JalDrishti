/**
 * JalDrishti — Authoritative Demo Data & Telemetry Engine
 *
 * Provides realistic, synchronized, and technically credible simulated datasets
 * benchmarked to Bureau of Indian Standards (BIS IS 10500:2012 Drinking Water Specification)
 * for the Indore regional water monitoring network.
 *
 * Characteristics:
 * - 4 Indore Monitoring Stations:
 *   1. Bilawali Lake Intake (Indore) [NODE-01-INDORE-WARD12] — Safe
 *   2. Pipliyapala Regional Lake [NODE-02-PIPLIYAPALA] — Safe
 *   3. Khan River Diversion Canal [NODE-03-KHAN-RIVER-DIV] — Caution (Turbidity Breach & TDS Advisory)
 *   4. Sirpur Ramsar Wetland [NODE-04-SIRPUR-WETLAND] — Safe
 *
 * - Parameters tracked:
 *   - pH (Acidity / Basicity): Acceptable range 6.5 – 8.5 (unitless)
 *   - Turbidity: Permissible limit ≤ 5.0 NTU (Desirable ≤ 1.0 NTU)
 *   - TDS (Total Dissolved Solids): Permissible limit ≤ 500 ppm / mg/L (Max ≤ 2000 ppm)
 *   - Temperature: Ambient delivery 10.0 – 40.0 °C
 *   - Dissolved Oxygen (DO): Healthy freshwater standard ≥ 5.0 mg/L
 *
 * - Unified status evaluation:
 *   Fleet statistics, donut distributions, active alert counts, and station cards
 *   are computed dynamically from the single effective dataset.
 */

// ---------------------------------------------------------------------------
// 1. Reference Threshold Constants (BIS IS 10500:2012 & WHO Guidelines)
// ---------------------------------------------------------------------------
export const THRESHOLD_BENCHMARKS = {
  pH: {
    name: 'Acidity (pH)',
    unit: '',
    min: 6.5,
    max: 8.5,
    standard: 'BIS IS 10500:2012 (Clause 4, Table 1)',
    description: 'Hydrogen-ion balance governing pipe corrosion and chlorine disinfection efficacy.'
  },
  turbidity: {
    name: 'Turbidity',
    unit: 'NTU',
    min: 0.0,
    max: 5.0,
    desirable: 1.0,
    standard: 'BIS IS 10500:2012 (Clause 4, Table 1)',
    description: 'Suspended colloidal silt and micro-particulates impacting disinfection efficacy.'
  },
  tds: {
    name: 'Total Dissolved Solids',
    unit: 'ppm',
    min: 0.0,
    max: 500.0,
    permissibleMax: 2000.0,
    standard: 'BIS IS 10500:2012 (Clause 4, Table 1)',
    description: 'Inorganic mineral salts (calcium, magnesium, chlorides, sulfates) and dissolved matter.'
  },
  temperature: {
    name: 'Water Temperature',
    unit: '°C',
    min: 10.0,
    max: 40.0,
    thresholdCaution: 35.0,
    standard: 'Ambient Surface Water Delivery Standard',
    description: 'Governs biological proliferation kinetics and dissolved gas solubility.'
  },
  dissolvedOxygen: {
    name: 'Dissolved Oxygen',
    unit: 'mg/L',
    min: 5.0,
    max: 14.0,
    standard: 'CPCB Fresh Water Class C Standard',
    description: 'Dissolved oxygen concentration essential for aquatic ecosystem and water freshness.'
  }
};

// ---------------------------------------------------------------------------
// 2. Realistic Sensor Stations (Indore Region)
// ---------------------------------------------------------------------------
export const DEMO_STATIONS = [
  {
    id: 'demo-node-01',
    nodeId: 'NODE-01-INDORE-WARD12',
    name: 'Station 1 — Bilawali Lake Intake (Indore)',
    status: 'Online',
    overallStatus: 'Safe',
    location: {
      latitude: 22.6841,
      longitude: 75.8672,
      address: 'Bilawali Lake Water Supply Line, Ward 12, Indore, MP'
    },
    hardwareModel: 'ESP32-S3 Multi-Probe Inline Unit',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-node-02',
    nodeId: 'NODE-02-PIPLIYAPALA',
    name: 'Station 2 — Pipliyapala Regional Lake',
    status: 'Online',
    overallStatus: 'Safe',
    location: {
      latitude: 22.6896,
      longitude: 75.8458,
      address: 'Pipliyapala Regional Lake Intake, Indore, MP'
    },
    hardwareModel: 'ESP32-S3 Multi-Probe Inline Unit',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-node-03',
    nodeId: 'NODE-03-KHAN-RIVER-DIV',
    name: 'Station 3 — Khan River Diversion Canal',
    status: 'Online',
    overallStatus: 'Caution',
    location: {
      latitude: 22.7625,
      longitude: 75.8412,
      address: 'Sanwer Road Industrial Area Diversion, Indore, MP'
    },
    hardwareModel: 'ESP32-S3 Multi-Probe Inline Unit',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-node-04',
    nodeId: 'NODE-04-SIRPUR-WETLAND',
    name: 'Station 4 — Sirpur Ramsar Wetland',
    status: 'Online',
    overallStatus: 'Safe',
    location: {
      latitude: 22.6989,
      longitude: 75.8184,
      address: 'Sirpur Bird Sanctuary Reservoir, Dhar Road, Indore, MP'
    },
    hardwareModel: 'ESP32-S3 Multi-Probe Inline Unit',
    lastSeen: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    isDemo: true
  }
];

// ---------------------------------------------------------------------------
// 3. Latest Telemetry Readings by Station
// ---------------------------------------------------------------------------
export const DEMO_LATEST_READINGS_BY_NODE = {
  'NODE-01-INDORE-WARD12': {
    id: 'demo-read-01',
    nodeId: 'NODE-01-INDORE-WARD12',
    nodeName: 'Station 1 — Bilawali Lake Intake (Indore)',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    pH: 7.35,
    turbidity: 1.42,
    tds: 245,
    temperature: 23.8,
    dissolvedOxygen: 7.2,
    overallStatus: 'Safe',
    nodeStatus: 'Online',
    isDemo: true,
    location: DEMO_STATIONS[0].location,
    parameters: {
      pH: { value: 7.35, unit: '', status: 'Safe', minimum: 6.5, maximum: 8.5 },
      turbidity: { value: 1.42, unit: 'NTU', status: 'Safe', minimum: 0.0, maximum: 5.0 },
      tds: { value: 245, unit: 'ppm', status: 'Safe', minimum: 0.0, maximum: 500.0 },
      temperature: { value: 23.8, unit: '°C', status: 'Safe', minimum: 10.0, maximum: 40.0 },
      dissolvedOxygen: { value: 7.2, unit: 'mg/L', status: 'Safe', minimum: 5.0, maximum: 14.0 }
    }
  },
  'NODE-02-PIPLIYAPALA': {
    id: 'demo-read-02',
    nodeId: 'NODE-02-PIPLIYAPALA',
    nodeName: 'Station 2 — Pipliyapala Regional Lake',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    pH: 7.18,
    turbidity: 2.15,
    tds: 310,
    temperature: 24.5,
    dissolvedOxygen: 6.8,
    overallStatus: 'Safe',
    nodeStatus: 'Online',
    isDemo: true,
    location: DEMO_STATIONS[1].location,
    parameters: {
      pH: { value: 7.18, unit: '', status: 'Safe', minimum: 6.5, maximum: 8.5 },
      turbidity: { value: 2.15, unit: 'NTU', status: 'Safe', minimum: 0.0, maximum: 5.0 },
      tds: { value: 310, unit: 'ppm', status: 'Safe', minimum: 0.0, maximum: 500.0 },
      temperature: { value: 24.5, unit: '°C', status: 'Safe', minimum: 10.0, maximum: 40.0 },
      dissolvedOxygen: { value: 6.8, unit: 'mg/L', status: 'Safe', minimum: 5.0, maximum: 14.0 }
    }
  },
  'NODE-03-KHAN-RIVER-DIV': {
    id: 'demo-read-03',
    nodeId: 'NODE-03-KHAN-RIVER-DIV',
    nodeName: 'Station 3 — Khan River Diversion Canal',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    pH: 8.20,
    turbidity: 5.65, // Exceeds 5.0 NTU limit (Active Critical Warning)
    tds: 485,        // Elevated, approaching 500 ppm desirable ceiling
    temperature: 26.2,
    dissolvedOxygen: 5.1,
    overallStatus: 'Caution',
    nodeStatus: 'Online',
    isDemo: true,
    location: DEMO_STATIONS[2].location,
    parameters: {
      pH: { value: 8.20, unit: '', status: 'Safe', minimum: 6.5, maximum: 8.5 },
      turbidity: { value: 5.65, unit: 'NTU', status: 'High', minimum: 0.0, maximum: 5.0 },
      tds: { value: 485, unit: 'ppm', status: 'Caution', minimum: 0.0, maximum: 500.0 },
      temperature: { value: 26.2, unit: '°C', status: 'Safe', minimum: 10.0, maximum: 40.0 },
      dissolvedOxygen: { value: 5.1, unit: 'mg/L', status: 'Safe', minimum: 5.0, maximum: 14.0 }
    }
  },
  'NODE-04-SIRPUR-WETLAND': {
    id: 'demo-read-04',
    nodeId: 'NODE-04-SIRPUR-WETLAND',
    nodeName: 'Station 4 — Sirpur Ramsar Wetland',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    pH: 7.45,
    turbidity: 1.80,
    tds: 220,
    temperature: 22.9,
    dissolvedOxygen: 7.8,
    overallStatus: 'Safe',
    nodeStatus: 'Online',
    isDemo: true,
    location: DEMO_STATIONS[3].location,
    parameters: {
      pH: { value: 7.45, unit: '', status: 'Safe', minimum: 6.5, maximum: 8.5 },
      turbidity: { value: 1.80, unit: 'NTU', status: 'Safe', minimum: 0.0, maximum: 5.0 },
      tds: { value: 220, unit: 'ppm', status: 'Safe', minimum: 0.0, maximum: 500.0 },
      temperature: { value: 22.9, unit: '°C', status: 'Safe', minimum: 10.0, maximum: 40.0 },
      dissolvedOxygen: { value: 7.8, unit: 'mg/L', status: 'Safe', minimum: 5.0, maximum: 14.0 }
    }
  }
};

export const DEMO_LATEST_READING = DEMO_LATEST_READINGS_BY_NODE['NODE-01-INDORE-WARD12'];

// Attach latest readings to each station object for seamless access
DEMO_STATIONS.forEach((st) => {
  st.latestReading = DEMO_LATEST_READINGS_BY_NODE[st.nodeId] || DEMO_LATEST_READING;
});

// ---------------------------------------------------------------------------
// 4. Early Warning Breach Alerts (Synchronized across Alerts, Dashboard, Admin)
// ---------------------------------------------------------------------------
export const DEMO_ALERTS = [
  {
    _id: 'demo-alert-01',
    id: 'demo-alert-01',
    nodeId: 'NODE-03-KHAN-RIVER-DIV',
    station: 'Station 3 — Khan River Diversion Canal',
    parameter: 'turbidity',
    value: 5.65,
    measuredValue: 5.65,
    thresholdLimit: 5.0,
    thresholdMax: 5.0,
    thresholdMin: 0.0,
    direction: 'HIGH',
    severity: 'Critical',
    status: 'Active',
    title: 'TURBIDITY Threshold Breach',
    message: 'Turbidity measured 5.65 NTU, exceeding the BIS IS 10500 permissible limit of ≤ 5.0 NTU. Micro-particle cloudiness detected.',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    lastBreachedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    breachCount: 3,
    isDemo: true
  },
  {
    _id: 'demo-alert-02',
    id: 'demo-alert-02',
    nodeId: 'NODE-03-KHAN-RIVER-DIV',
    station: 'Station 3 — Khan River Diversion Canal',
    parameter: 'tds',
    value: 485,
    measuredValue: 485,
    thresholdLimit: 500,
    thresholdMax: 500,
    thresholdMin: 0,
    direction: 'HIGH',
    severity: 'Warning',
    status: 'Active',
    title: 'TDS Elevated Advisory',
    message: 'Total Dissolved Solids elevated to 485 ppm, approaching the 500 ppm desirable ceiling. Municipal filtration monitored.',
    timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    lastBreachedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    breachCount: 2,
    isDemo: true
  },
  {
    _id: 'demo-alert-03',
    id: 'demo-alert-03',
    nodeId: 'NODE-01-INDORE-WARD12',
    station: 'Station 1 — Bilawali Lake Intake (Indore)',
    parameter: 'pH',
    value: 7.35,
    measuredValue: 6.42,
    thresholdLimit: 6.5,
    thresholdMax: 8.5,
    thresholdMin: 6.5,
    direction: 'LOW',
    severity: 'Info',
    status: 'Resolved',
    title: 'pH Level Restored to Safe Band',
    message: 'Acidity stabilized back to 7.35 pH within the BIS 6.5 - 8.5 permissible band after buffer dosing.',
    timestamp: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    lastBreachedAt: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
    breachCount: 1,
    isDemo: true
  },
  {
    _id: 'demo-alert-04',
    id: 'demo-alert-04',
    nodeId: 'NODE-02-PIPLIYAPALA',
    station: 'Station 2 — Pipliyapala Regional Lake',
    parameter: 'turbidity',
    value: 2.15,
    measuredValue: 4.82,
    thresholdLimit: 5.0,
    thresholdMax: 5.0,
    thresholdMin: 0.0,
    direction: 'HIGH',
    severity: 'Info',
    status: 'Resolved',
    title: 'Turbidity Normalized Post-Filtration',
    message: 'Turbidity cleared to 2.15 NTU following scheduled backwash and settling.',
    timestamp: new Date(Date.now() - 840 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    lastBreachedAt: new Date(Date.now() - 840 * 60 * 1000).toISOString(),
    breachCount: 1,
    isDemo: true
  },
  {
    _id: 'demo-alert-05',
    id: 'demo-alert-05',
    nodeId: 'NODE-04-SIRPUR-WETLAND',
    station: 'Station 4 — Sirpur Ramsar Wetland',
    parameter: 'temperature',
    value: 22.9,
    measuredValue: 31.4,
    thresholdLimit: 40.0,
    thresholdMax: 40.0,
    thresholdMin: 10.0,
    direction: 'HIGH',
    severity: 'Info',
    status: 'Resolved',
    title: 'Thermal Fluctuation Returned to Ambient',
    message: 'Water temperature peaked at 31.4 °C under direct midday solar exposure and cooled to 22.9 °C evening ambient.',
    timestamp: new Date(Date.now() - 1440 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1200 * 60 * 1000).toISOString(),
    lastBreachedAt: new Date(Date.now() - 1440 * 60 * 1000).toISOString(),
    breachCount: 1,
    isDemo: true
  }
];

// ---------------------------------------------------------------------------
// 5. Dynamic Status Evaluation & Fleet Aggregation Functions
// ---------------------------------------------------------------------------

/**
 * Authoritatively evaluate a reading's status based on valid numerical parameters.
 * Missing or null required parameters yield 'Unknown', NEVER automatically 'Safe'.
 */
export function evaluateReadingStatus(reading, thresholds = THRESHOLD_BENCHMARKS) {
  if (!reading || typeof reading !== 'object') {
    return 'Unknown';
  }

  const { pH, turbidity, tds, temperature } = reading;

  // Check for missing telemetry
  if (
    typeof pH !== 'number' ||
    typeof turbidity !== 'number' ||
    typeof tds !== 'number' ||
    typeof temperature !== 'number'
  ) {
    return 'Unknown';
  }

  // Check critical or caution thresholds
  const isTurbidityCritical = turbidity > thresholds.turbidity.max;
  const isPhBreach = pH < thresholds.pH.min || pH > thresholds.pH.max;
  const isTdsCaution = tds > thresholds.tds.max;
  const isTempHigh = temperature > (thresholds.temperature.thresholdCaution || 35.0);

  if (isTurbidityCritical || isPhBreach) {
    return 'Unsafe';
  }

  if (isTdsCaution || isTempHigh) {
    return 'Caution';
  }

  return 'Safe';
}

/**
 * Dynamically calculate fleet statistics across stations and active alerts.
 * Calculates station totals, safe/warning/critical breakdowns, safe percentages,
 * and active alerts from the actual effective dataset.
 */
export function calculateFleetSummary(stations = DEMO_STATIONS, alerts = DEMO_ALERTS) {
  const stationList = Array.isArray(stations) && stations.length > 0 ? stations : DEMO_STATIONS;
  const totalStations = stationList.length;

  const activeAlertList = (Array.isArray(alerts) ? alerts : DEMO_ALERTS).filter(
    (a) => a.status === 'Active'
  );

  // Set of station IDs with active breaches
  const alertStationIds = new Set(activeAlertList.map((a) => a.nodeId));

  let safeCount = 0;
  let cautionCount = 0;
  let unsafeCount = 0;
  let offlineCount = 0;
  let unknownCount = 0;

  stationList.forEach((st) => {
    if (st.status === 'Offline') {
      offlineCount++;
      return;
    }

    const stStatus = st.overallStatus || 'Safe';
    const hasActiveAlert = alertStationIds.has(st.nodeId);

    if (stStatus === 'Unsafe' || (hasActiveAlert && activeAlertList.some((a) => a.nodeId === st.nodeId && a.severity === 'Critical'))) {
      unsafeCount++;
    } else if (stStatus === 'Caution' || hasActiveAlert) {
      cautionCount++;
    } else if (stStatus === 'Safe') {
      safeCount++;
    } else {
      unknownCount++;
    }
  });

  const alertStationsCount = cautionCount + unsafeCount;
  const safePercentage = totalStations > 0 ? Math.round((safeCount / totalStations) * 100) : 0;
  const alertPercentage = totalStations > 0 ? Math.round((alertStationsCount / totalStations) * 100) : 0;

  const statusDistribution = [
    { name: 'Safe', value: safeCount, color: '#10B981' },
    { name: 'Caution', value: cautionCount, color: '#F59E0B' },
    { name: 'Unsafe', value: unsafeCount, color: '#EF4444' },
    { name: 'Offline', value: offlineCount, color: '#94A3B8' }
  ].filter((item) => item.value > 0);

  if (statusDistribution.length === 0) {
    statusDistribution.push({ name: 'Awaiting Stations', value: 1, color: '#E2E8F0' });
  }

  return {
    totalStations,
    safeStations: safeCount,
    alertStations: alertStationsCount,
    cautionStations: cautionCount,
    unsafeStations: unsafeCount,
    offlineStations: offlineCount,
    unknownStations: unknownCount,
    safePercentage,
    alertPercentage,
    activeAlertsCount: activeAlertList.length,
    statusDistribution,
    isDemo: Boolean(stationList[0]?.isDemo)
  };
}

// ---------------------------------------------------------------------------
// 6. Dynamic Historical Readings Generator (24H, 7D, 30D)
// ---------------------------------------------------------------------------
export function getDemoHistoricalReadings({ nodeId = 'NODE-01-INDORE-WARD12', timeRange = '24H', limit = 100 } = {}) {
  const isNode3 = nodeId === 'NODE-03-KHAN-RIVER-DIV';
  const isNode2 = nodeId === 'NODE-02-PIPLIYAPALA';
  const isNode4 = nodeId === 'NODE-04-SIRPUR-WETLAND';

  // Base parameters per station
  const basePh = isNode3 ? 8.18 : isNode2 ? 7.18 : isNode4 ? 7.45 : 7.35;
  const baseTds = isNode3 ? 480 : isNode2 ? 310 : isNode4 ? 220 : 245;
  const baseTurbidity = isNode3 ? 5.4 : isNode2 ? 2.15 : isNode4 ? 1.80 : 1.42;
  const baseTemp = isNode3 ? 25.8 : isNode2 ? 24.5 : isNode4 ? 22.9 : 23.8;
  const baseDO = isNode3 ? 5.1 : isNode2 ? 6.8 : isNode4 ? 7.8 : 7.2;

  let pointsCount = 24;
  let intervalMs = 60 * 60 * 1000; // 1 hour for 24H

  const normalizedRange = (timeRange || '24H').toUpperCase();
  if (normalizedRange === '7D' || normalizedRange === '7DAYS') {
    pointsCount = 28; // every 6 hours
    intervalMs = 6 * 60 * 60 * 1000;
  } else if (normalizedRange === '30D' || normalizedRange === '30DAYS') {
    pointsCount = 30; // daily
    intervalMs = 24 * 60 * 60 * 1000;
  }

  const now = Date.now();
  const readings = [];

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs);
    const hour = timestamp.getHours();

    // Diurnal variation: temperature peaks early afternoon (~14:00), cooler at night (~04:00)
    const diurnal = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    const tempOffset = diurnal * 2.2;
    const phOffset = Math.sin((hour / 12) * Math.PI) * 0.12;
    const tdsOffset = Math.cos((hour / 12) * Math.PI) * 12;

    // Node 3 (Khan River) exhibits elevated turbidity spike in recent readings
    let turbidityNoise = ((i % 5) - 2) * 0.12;
    if (isNode3 && i <= 4) {
      turbidityNoise += 0.45; // exceeds 5.0 NTU limit
    }

    const pH = Number(Math.max(6.2, Math.min(8.8, basePh + phOffset + ((i % 3) - 1) * 0.04)).toFixed(2));
    const tds = Math.round(Math.max(100, baseTds + tdsOffset + ((i % 4) - 2) * 4));
    const turbidity = Number(Math.max(0.4, baseTurbidity + turbidityNoise).toFixed(2));
    const temperature = Number(Math.max(16, baseTemp + tempOffset + ((i % 2) - 0.5) * 0.3).toFixed(1));
    const dissolvedOxygen = Number(Math.max(4.0, baseDO - diurnal * 0.6 + ((i % 3) - 1) * 0.12).toFixed(1));

    const isBreach = turbidity > 5.0 || pH < 6.5 || pH > 8.5;
    const isCaution = tds > 500 || temperature > 35.0 || isBreach;
    const overallStatus = isBreach ? 'Caution' : isCaution ? 'Caution' : 'Safe';

    const timeLabel = normalizedRange === '24H'
      ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `${timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    readings.push({
      id: `demo-rec-${nodeId}-${i}`,
      nodeId,
      timestamp: timestamp.toISOString(),
      time: timeLabel,
      timeLabel,
      pH,
      tds,
      TDS: tds,
      turbidity,
      Turbidity: turbidity,
      temperature,
      Temperature: temperature,
      dissolvedOxygen,
      DissolvedOxygen: dissolvedOxygen,
      overallStatus,
      isDemo: true
    });
  }

  return readings.slice(-limit);
}

// ---------------------------------------------------------------------------
// 7. Historical AI Image Screenings (for CitizenImageScreeningPage)
// ---------------------------------------------------------------------------
export const DEMO_IMAGE_SCREENINGS = [
  {
    id: 'demo-img-01',
    createdAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    originalFilename: 'Bilawali_Water_Supply_Point.jpg',
    result: 'Safe',
    confidence: 96.2,
    provider: 'Gemini Vision',
    assessment: 'Water sample exhibits high optical clarity with no observable suspended colloidal matter or chemical discoloration.',
    isWaterImage: true,
    isDemo: true
  },
  {
    id: 'demo-img-02',
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    originalFilename: 'Pipliyapala_Shore_Sample.jpg',
    result: 'Safe',
    confidence: 91.5,
    provider: 'Gemini Vision',
    assessment: 'Clear surface visual profile with minor natural ripple reflections; within standard clarity benchmarks.',
    isWaterImage: true,
    isDemo: true
  },
  {
    id: 'demo-img-03',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    originalFilename: 'Khan_River_Diversion_Turbid.jpg',
    result: 'Caution',
    confidence: 89.0,
    provider: 'Gemini Vision',
    assessment: 'Moderate brownish tint detected with visible particulate suspension. In-situ probe testing recommended.',
    isWaterImage: true,
    isDemo: true
  },
  {
    id: 'demo-img-04',
    createdAt: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
    originalFilename: 'Sirpur_Wetland_Inlet.jpg',
    result: 'Safe',
    confidence: 94.8,
    provider: 'Gemini Vision',
    assessment: 'Sample appears transparent and free from organic sludge or surface hydrocarbon film.',
    isWaterImage: true,
    isDemo: true
  }
];

// ---------------------------------------------------------------------------
// 8. Admin KPI & System Health Demo Baseline
// ---------------------------------------------------------------------------
export const DEMO_ADMIN_HEALTH = {
  status: 'ok',
  database: 'connected',
  environment: 'production',
  uptime: '99.98%',
  timestamp: new Date().toISOString(),
  isDemo: true
};

export const DEMO_MONITORING_STATS = calculateFleetSummary(DEMO_STATIONS, DEMO_ALERTS);
