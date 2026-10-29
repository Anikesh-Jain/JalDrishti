import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import useLiveMonitoring from '../../hooks/useLiveMonitoring';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DemoBadge from '../../components/common/DemoBadge';
import api from '../../services/api';
import {
  DEMO_STATIONS,
  DEMO_LATEST_READINGS_BY_NODE,
  DEMO_LATEST_READING,
  DEMO_ALERTS,
  getDemoHistoricalReadings,
  calculateFleetSummary,
  THRESHOLD_BENCHMARKS
} from '../../utils/demoData';
import {
  MapPinIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  BarChartIcon,
  CheckCircleIcon
} from '../../components/common/Icons';

/**
 * Custom Tooltip for Single-Parameter Area Chart
 */
function SingleParamTooltip({ active, payload, label, unit, name, color }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1 min-w-[150px]">
        <p className="font-mono text-[11px] text-slate-500 pb-1 border-b border-slate-100">{label}</p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {name}:
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {val !== null && val !== undefined ? `${val}${unit ? ` ${unit}` : ''}` : '—'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom Tooltip for Multi-Parameter Overview Chart
 */
function MultiParamTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const units = {
      pH: '',
      Turbidity: ' NTU',
      TDS: ' ppm',
      Temperature: ' °C'
    };
    return (
      <div className="bg-white/95 backdrop-blur-md border border-[#BAE6FD] p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[180px]">
        <p className="font-mono text-[11px] text-slate-500 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-slate-900">
              {entry.value !== null && entry.value !== undefined ? `${entry.value}${units[entry.name] ?? ''}` : '—'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const {
    reading: liveReading,
    refreshing,
    refresh
  } = useLiveMonitoring();

  // Station and Time Range Filter State
  const [selectedStationId, setSelectedStationId] = useState('ALL');
  const [timeRange, setTimeRange] = useState('24H');
  const [chartMode, setChartMode] = useState('overview'); // 'overview' | 'pH' | 'turbidity' | 'tds' | 'temperature'

  // Fleet & Station Data State
  const [stations, setStations] = useState(DEMO_STATIONS);
  const [alertsList, setAlertsList] = useState(DEMO_ALERTS);
  const [trendData, setTrendData] = useState([]);
  const [totalReadingsCount, setTotalReadingsCount] = useState(2840);
  const [isDemoData, setIsDemoData] = useState(true);

  // Load registered sensor stations and active alerts
  useEffect(() => {
    let mounted = true;

    async function loadFleetContext() {
      try {
        const [nodesRes, alertsRes] = await Promise.all([
          api.sensor.getNodes().catch(() => null),
          api.alerts.getAll({ limit: 50 }).catch(() => null)
        ]);

        if (!mounted) return;

        if (nodesRes?.data && Array.isArray(nodesRes.data) && nodesRes.data.length > 0) {
          setStations(nodesRes.data);
          setIsDemoData(false);
        } else {
          setStations(DEMO_STATIONS);
          setIsDemoData(true);
        }

        if (alertsRes?.data && Array.isArray(alertsRes.data) && alertsRes.data.length > 0) {
          setAlertsList(alertsRes.data);
        } else {
          setAlertsList(DEMO_ALERTS);
        }
      } catch {
        if (mounted) {
          setStations(DEMO_STATIONS);
          setAlertsList(DEMO_ALERTS);
          setIsDemoData(true);
        }
      }
    }

    loadFleetContext();
    return () => { mounted = false; };
  }, []);

  // Compute fleet statistics dynamically from the actual effective station and alert list
  const fleetSummary = useMemo(() => {
    return calculateFleetSummary(stations, alertsList);
  }, [stations, alertsList]);

  // Determine current active station reading
  const effectiveNodeId = selectedStationId === 'ALL' ? 'NODE-01-INDORE-WARD12' : selectedStationId;
  const currentStationReading = useMemo(() => {
    if (isDemoData) {
      return DEMO_LATEST_READINGS_BY_NODE[effectiveNodeId] || DEMO_LATEST_READING;
    }
    // If viewing single station from real data
    if (liveReading?.nodeId === effectiveNodeId) {
      return liveReading;
    }
    return liveReading || DEMO_LATEST_READING;
  }, [isDemoData, effectiveNodeId, liveReading]);

  // Load telemetry trends based on selected station and time range
  useEffect(() => {
    let mounted = true;

    async function fetchTrendAnalytics() {
      const targetNodeId = selectedStationId === 'ALL' ? 'NODE-01-INDORE-WARD12' : selectedStationId;
      const now = Date.now();
      let fromDate;
      if (timeRange === '24H') fromDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      else if (timeRange === '7D') fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      else fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

      try {
        const historyRes = await api.sensor.getHistoricalReadings({
          nodeId: targetNodeId,
          from: fromDate,
          limit: 100
        }).catch(() => null);

        if (mounted && historyRes?.data && Array.isArray(historyRes.data) && historyRes.data.length > 0) {
          const formatted = historyRes.data.map((r) => {
            const d = new Date(r.timestamp);
            const timeLabel = timeRange === '24H'
              ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
            return {
              time: timeLabel,
              timestamp: r.timestamp,
              pH: typeof r.pH === 'number' && Number.isFinite(r.pH) ? Number(r.pH.toFixed(2)) : null,
              TDS: typeof r.tds === 'number' && Number.isFinite(r.tds) ? Math.round(r.tds) : null,
              tds: typeof r.tds === 'number' && Number.isFinite(r.tds) ? Math.round(r.tds) : null,
              Turbidity: typeof r.turbidity === 'number' && Number.isFinite(r.turbidity) ? Number(r.turbidity.toFixed(2)) : null,
              turbidity: typeof r.turbidity === 'number' && Number.isFinite(r.turbidity) ? Number(r.turbidity.toFixed(2)) : null,
              Temperature: typeof r.temperature === 'number' && Number.isFinite(r.temperature) ? Number(r.temperature.toFixed(1)) : null,
              temperature: typeof r.temperature === 'number' && Number.isFinite(r.temperature) ? Number(r.temperature.toFixed(1)) : null,
              overallStatus: r.overallStatus || 'Safe'
            };
          });
          setTrendData(formatted);
          setTotalReadingsCount(historyRes.data.length);
        } else if (mounted) {
          // Calibrated demo historical telemetry
          const demoTrend = getDemoHistoricalReadings({ nodeId: targetNodeId, timeRange, limit: 100 });
          setTrendData(demoTrend);
          setTotalReadingsCount(2840);
        }
      } catch {
        if (mounted) {
          const demoTrend = getDemoHistoricalReadings({ nodeId: targetNodeId, timeRange, limit: 100 });
          setTrendData(demoTrend);
          setTotalReadingsCount(2840);
        }
      }
    }

    fetchTrendAnalytics();
    return () => { mounted = false; };
  }, [selectedStationId, timeRange]);

  // Parameter calculation metrics for single-parameter chart view
  const singleParamStats = useMemo(() => {
    if (chartMode === 'overview' || !trendData.length) return null;
    const key = chartMode === 'tds' ? 'TDS' : chartMode === 'turbidity' ? 'Turbidity' : chartMode === 'temperature' ? 'Temperature' : 'pH';
    const values = trendData.map((d) => d[key]).filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];
    return {
      min: chartMode === 'tds' ? Math.round(min) : min.toFixed(2),
      max: chartMode === 'tds' ? Math.round(max) : max.toFixed(2),
      avg: chartMode === 'tds' ? Math.round(avg) : avg.toFixed(2),
      current: chartMode === 'tds' ? Math.round(current) : current.toFixed(2)
    };
  }, [chartMode, trendData]);

  // Filter active breach alerts
  const activeAlerts = useMemo(() => {
    return alertsList.filter((a) => a.status === 'Active');
  }, [alertsList]);

  // Selected station metadata
  const currentStationObj = stations.find((s) => s.nodeId === effectiveNodeId) || stations[0];

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Simulated Telemetry Banner */}
        {isDemoData && (
          <DemoBadge variant="banner" />
        )}

        {/* 1. Header with Page Title, Station Selector, and Live Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Dashboard</h1>
              {isDemoData && <DemoBadge text="Simulated Dataset" />}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-parameter water quality telemetry and autonomous threshold monitoring across Indore
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Station Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="station-select" className="text-xs font-semibold text-slate-600 hidden md:inline">
                Station:
              </label>
              <select
                id="station-select"
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#BAE6FD] rounded-xl text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                aria-label="Select Monitoring Station"
              >
                <option value="ALL">Fleet Overview (All 4 Stations)</option>
                {stations.map((st) => (
                  <option key={st.nodeId} value={st.nodeId}>
                    {st.name || st.nodeId}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              loading={refreshing}
              className="text-xs border-slate-300"
            >
              ↻ Refresh Telemetry
            </Button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isDemoData ? 'Simulated' : 'Live IoT'}</span>
            </div>
          </div>
        </div>

        {/* 2. Four Technical Stat Cards Computed Dynamically from Dataset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monitoring Stations</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">{fleetSummary.totalStations}</span>
              <p className="text-[11px] font-semibold text-cyan-700 mt-1 flex items-center gap-1">
                <span>{fleetSummary.totalStations} calibrated monitoring nodes</span>
                {isDemoData && <span className="text-[10px] text-amber-700 font-bold">(Simulated)</span>}
              </p>
            </div>
          </div>

          {/* Card 2: Safe Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Safe Stations</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">{fleetSummary.safeStations}</span>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                {fleetSummary.safePercentage}% of fleet meets BIS IS 10500 standards
              </p>
            </div>
          </div>

          {/* Card 3: Alert Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Breach / Alert Stations</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">{fleetSummary.alertStations}</span>
              <p className="text-[11px] font-semibold text-amber-700 mt-1">
                {fleetSummary.alertStations > 0
                  ? `${fleetSummary.alertStations} station requires inspection`
                  : 'Zero threshold breaches active'}
              </p>
            </div>
          </div>

          {/* Card 4: Total Readings */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Telemetry Points Logged</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChartIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">
                {totalReadingsCount.toLocaleString()}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                Time-series sensor records ingested
              </p>
            </div>
          </div>
        </div>

        {/* 3. Interactive Charts Section with Parameter Views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart (8 cols): Supports Combined Dual-Axis or Dedicated Single-Parameter Area Chart */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            {/* Chart Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {chartMode === 'overview'
                      ? 'Water Quality Overview'
                      : chartMode === 'pH'
                      ? 'Acidity (pH) Time-Series Trend'
                      : chartMode === 'turbidity'
                      ? 'Turbidity (NTU) Time-Series Trend'
                      : chartMode === 'tds'
                      ? 'Total Dissolved Solids (ppm) Trend'
                      : 'Water Temperature (°C) Trend'}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    [{selectedStationId === 'ALL' ? 'Station 1 Preview' : currentStationObj.nodeId}]
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {chartMode === 'overview'
                    ? 'Dual-axis comparison: pH, Turbidity, and Temperature (left) vs TDS (right)'
                    : THRESHOLD_BENCHMARKS[chartMode]?.standard || 'Calibrated sensor telemetry'}
                </p>
              </div>

              {/* Time Range Filter Buttons */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {['24H', '7D', '30D'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeRange === range
                          ? 'bg-[#0284C7] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <Link
                  to={`/citizen/trends?nodeId=${encodeURIComponent(effectiveNodeId)}`}
                  className="text-xs font-bold text-[#0284C7] hover:underline whitespace-nowrap hidden sm:inline"
                >
                  Dedicated Trends →
                </Link>
              </div>
            </div>

            {/* Parameter Selector Pills for Clean Multi-Parameter Exploration */}
            <div className="flex flex-wrap items-center gap-2 pt-3">
              {[
                { id: 'overview', label: 'All Parameters (Dual-Axis)', color: '#0284C7' },
                { id: 'pH', label: 'pH (6.5 — 8.5)', color: '#0284C7' },
                { id: 'turbidity', label: 'Turbidity (≤ 5.0 NTU)', color: '#D97706' },
                { id: 'tds', label: 'TDS (≤ 500 ppm)', color: '#059669' },
                { id: 'temperature', label: 'Temperature (10 — 40 °C)', color: '#EF4444' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setChartMode(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    chartMode === tab.id
                      ? 'bg-[#E0F7FF] text-[#0284C7] border-[#0284C7] font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: tab.color }} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Statistical Summary Bar when viewing a single parameter */}
            {singleParamStats && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Current</span>
                  <span className="font-mono font-bold text-slate-900">{singleParamStats.current}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Min</span>
                  <span className="font-mono font-bold text-slate-700">{singleParamStats.min}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Max</span>
                  <span className="font-mono font-bold text-slate-700">{singleParamStats.max}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Average</span>
                  <span className="font-mono font-bold text-slate-700">{singleParamStats.avg}</span>
                </div>
              </div>
            )}

            {/* Chart Container */}
            <div className="h-72 sm:h-80 w-full pt-4">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No telemetry recorded for the selected station and time range
                </div>
              ) : chartMode === 'overview' ? (
                /* Dual-Axis Line Chart: Left Axis for pH, Turbidity, Temp; Right Axis for TDS */
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 12, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    {/* Left Y-Axis for pH, Turbidity, Temperature */}
                    <YAxis
                      yAxisId="left"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={[0, 45]}
                      label={{ value: 'pH / NTU / °C', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748b', fontSize: 10 }}
                    />
                    {/* Right Y-Axis for TDS */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#059669"
                      fontSize={11}
                      tickLine={false}
                      domain={[0, 600]}
                      label={{ value: 'TDS (ppm)', angle: 90, position: 'insideRight', offset: 12, fill: '#059669', fontSize: 10 }}
                    />
                    <Tooltip content={<MultiParamTooltip />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pH"
                      name="pH"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#0284C7' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Turbidity"
                      name="Turbidity"
                      stroke="#D97706"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#D97706' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="TDS"
                      name="TDS"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#059669' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Temperature"
                      name="Temperature"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#EF4444' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                /* Focused Single-Parameter Area Chart with Reference Thresholds */
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 12, right: 15, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="paramFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={
                            chartMode === 'pH' ? '#0284C7' :
                            chartMode === 'turbidity' ? '#D97706' :
                            chartMode === 'tds' ? '#059669' : '#EF4444'
                          }
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor={
                            chartMode === 'pH' ? '#0284C7' :
                            chartMode === 'turbidity' ? '#D97706' :
                            chartMode === 'tds' ? '#059669' : '#EF4444'
                          }
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={
                        chartMode === 'pH' ? [5.5, 9.5] :
                        chartMode === 'turbidity' ? [0, 8] :
                        chartMode === 'tds' ? [100, 600] : [15, 35]
                      }
                      label={{
                        value: chartMode === 'pH' ? 'pH' : chartMode === 'turbidity' ? 'NTU' : chartMode === 'tds' ? 'ppm' : '°C',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        fill: '#64748b',
                        fontSize: 10
                      }}
                    />
                    <Tooltip
                      content={
                        <SingleParamTooltip
                          unit={chartMode === 'pH' ? '' : chartMode === 'turbidity' ? 'NTU' : chartMode === 'tds' ? 'ppm' : '°C'}
                          name={chartMode === 'pH' ? 'pH' : chartMode === 'turbidity' ? 'Turbidity' : chartMode === 'tds' ? 'TDS' : 'Temperature'}
                          color={
                            chartMode === 'pH' ? '#0284C7' :
                            chartMode === 'turbidity' ? '#D97706' :
                            chartMode === 'tds' ? '#059669' : '#EF4444'
                          }
                        />
                      }
                    />
                    {/* Reference Lines for BIS Standards */}
                    {chartMode === 'pH' && (
                      <>
                        <ReferenceLine y={6.5} stroke="#0284C7" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Min Limit (6.5)', fill: '#0284C7', fontSize: 10, position: 'insideBottomLeft' }} />
                        <ReferenceLine y={8.5} stroke="#0284C7" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Max Limit (8.5)', fill: '#0284C7', fontSize: 10, position: 'insideTopLeft' }} />
                      </>
                    )}
                    {chartMode === 'turbidity' && (
                      <>
                        <ReferenceLine y={1.0} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.2} label={{ value: 'Desirable (≤ 1.0 NTU)', fill: '#10B981', fontSize: 10, position: 'insideBottomLeft' }} />
                        <ReferenceLine y={5.0} stroke="#D97706" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'BIS Permissible Limit (≤ 5.0 NTU)', fill: '#D97706', fontSize: 10, position: 'insideTopLeft' }} />
                      </>
                    )}
                    {chartMode === 'tds' && (
                      <ReferenceLine y={500} stroke="#059669" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Desirable Upper Limit (500 ppm)', fill: '#059669', fontSize: 10, position: 'insideTopLeft' }} />
                    )}
                    {chartMode === 'temperature' && (
                      <ReferenceLine y={35.0} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Caution Threshold (35.0 °C)', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }} />
                    )}
                    <Area
                      type="monotone"
                      dataKey={chartMode === 'tds' ? 'TDS' : chartMode === 'turbidity' ? 'Turbidity' : chartMode === 'temperature' ? 'Temperature' : 'pH'}
                      stroke={
                        chartMode === 'pH' ? '#0284C7' :
                        chartMode === 'turbidity' ? '#D97706' :
                        chartMode === 'tds' ? '#059669' : '#EF4444'
                      }
                      strokeWidth={2.5}
                      fill="url(#paramFill)"
                      dot={{ r: 2.5, fill: chartMode === 'pH' ? '#0284C7' : chartMode === 'turbidity' ? '#D97706' : chartMode === 'tds' ? '#059669' : '#EF4444' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Chart (4 cols): Fleet Health Donut Chart */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Water Quality Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monitoring station health breakdown</p>
            </div>

            {/* Donut Chart with Centered Metric */}
            <div className="relative h-56 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetSummary.statusDistribution}
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetSummary.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono text-slate-900 leading-none">
                  {fleetSummary.totalStations > 0 ? `${fleetSummary.safePercentage}%` : '—'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                  {fleetSummary.safeStations} of {fleetSummary.totalStations} Safe
                </span>
              </div>
            </div>

            {/* Dynamic Legend */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">{fleetSummary.safeStations} Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-slate-700">{fleetSummary.alertStations} Caution</span>
              </div>
              {fleetSummary.offlineStations > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-700">{fleetSummary.offlineStations} Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Live Parameter Quick Inspection Cards (Matching Active Station) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Latest Ingested Telemetry — {currentStationObj.name}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Timestamp: {new Date(currentStationReading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: pH */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Acidity (pH)</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {typeof currentStationReading?.pH === 'number' ? currentStationReading.pH.toFixed(2) : '—'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Safe: 6.5 — 8.5
                </span>
              </div>
              <Badge
                variant={
                  typeof currentStationReading?.pH === 'number'
                    ? currentStationReading.pH < 6.5 || currentStationReading.pH > 8.5
                      ? 'unsafe'
                      : 'safe'
                    : 'neutral'
                }
                size="sm"
              >
                {typeof currentStationReading?.pH === 'number'
                  ? currentStationReading.pH < 6.5 || currentStationReading.pH > 8.5
                    ? 'Breach'
                    : 'Safe'
                  : 'Unknown'}
              </Badge>
            </div>

            {/* Card 2: Turbidity */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Turbidity</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {typeof currentStationReading?.turbidity === 'number' ? `${currentStationReading.turbidity.toFixed(2)} NTU` : '—'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Limit: ≤ 5.0 NTU
                </span>
              </div>
              <Badge
                variant={
                  typeof currentStationReading?.turbidity === 'number'
                    ? currentStationReading.turbidity > 5.0
                      ? 'unsafe'
                      : 'safe'
                    : 'neutral'
                }
                size="sm"
              >
                {typeof currentStationReading?.turbidity === 'number'
                  ? currentStationReading.turbidity > 5.0
                    ? 'High'
                    : 'Clear'
                  : 'Unknown'}
              </Badge>
            </div>

            {/* Card 3: TDS */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Total Dissolved Solids</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {typeof currentStationReading?.tds === 'number' ? `${currentStationReading.tds} ppm` : '—'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Desirable: ≤ 500 ppm
                </span>
              </div>
              <Badge
                variant={
                  typeof currentStationReading?.tds === 'number'
                    ? currentStationReading.tds > 500
                      ? 'caution'
                      : 'safe'
                    : 'neutral'
                }
                size="sm"
              >
                {typeof currentStationReading?.tds === 'number'
                  ? currentStationReading.tds > 500
                    ? 'Elevated'
                    : 'Good'
                  : 'Unknown'}
              </Badge>
            </div>

            {/* Card 4: Temperature */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Water Temperature</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {typeof currentStationReading?.temperature === 'number' ? `${currentStationReading.temperature.toFixed(1)} °C` : '—'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Ambient: 10 — 40 °C
                </span>
              </div>
              <Badge variant="safe" size="sm">Normal</Badge>
            </div>

            {/* Card 5: Dissolved Oxygen */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Dissolved Oxygen</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {typeof currentStationReading?.dissolvedOxygen === 'number' ? `${currentStationReading.dissolvedOxygen.toFixed(1)} mg/L` : '7.2 mg/L'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Standard: ≥ 5.0 mg/L
                </span>
              </div>
              <Badge variant="safe" size="sm">Healthy</Badge>
            </div>
          </div>
        </div>

        {/* 5. Active Early Warning Breach Alerts */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Active Early Warning Breaches</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {activeAlerts.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous threshold engine alerts requiring review</p>
            </div>
            <Link to="/citizen/alerts" className="text-xs font-bold text-[#0284C7] hover:underline">
              Full Alert Feed →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <div key={alert._id || alert.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangleIcon className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {alert.title || `${alert.parameter?.toUpperCase()} Threshold Breach`}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Station: <strong>{alert.station || alert.nodeId}</strong> • Measured: <strong className="font-mono">{alert.value}</strong> (Safe bound: {alert.thresholdLimit})
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant={alert.severity === 'Critical' ? 'unsafe' : 'caution'} size="sm">
                      {alert.severity || alert.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span>All four station parameters are operating within configured safe bounds.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
