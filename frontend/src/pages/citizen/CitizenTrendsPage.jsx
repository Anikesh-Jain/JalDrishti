import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DemoBadge from '../../components/common/DemoBadge';
import ChartEmptyState from '../../components/charts/ChartEmptyState';
import api from '../../services/api';
import { DownloadIcon } from '../../components/common/Icons';
import {
  DEMO_STATIONS,
  DEMO_LATEST_READINGS_BY_NODE,
  DEMO_LATEST_READING,
  getDemoHistoricalReadings,
  THRESHOLD_BENCHMARKS
} from '../../utils/demoData';

/**
 * Custom readable tooltip component for individual parameter trend graphs
 */
function ParameterTooltip({ active, payload, label, unit, name }) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const value = payload[0].value;
    const status = point.overallStatus || 'Safe';

    const getStatusStyle = (s) => {
      switch (s?.toLowerCase()) {
        case 'unsafe':
        case 'breach':
          return 'text-rose-700 bg-rose-50 border-rose-200';
        case 'caution':
        case 'warning':
          return 'text-amber-700 bg-amber-50 border-amber-200';
        default:
          return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      }
    };

    return (
      <div className="bg-white/95 backdrop-blur-md border border-[#BAE6FD] p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[160px]">
        <div className="text-slate-500 font-mono text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
          <span>{label}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getStatusStyle(status)}`}>
            {status}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <span className="font-semibold text-slate-600">{name}:</span>
          <span className="font-mono font-black text-slate-900 text-sm">
            {value !== null && value !== undefined ? `${value} ${unit}`.trim() : '—'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function CitizenTrendsPage() {
  const [stations, setStations] = useState(DEMO_STATIONS);
  const [selectedStation, setSelectedStation] = useState('NODE-01-INDORE-WARD12');
  const [timeRange, setTimeRange] = useState('24H');
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(DEMO_LATEST_READINGS_BY_NODE['NODE-01-INDORE-WARD12']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(true);

  // Load available sensor stations
  useEffect(() => {
    let mounted = true;
    async function loadStations() {
      try {
        const res = await api.sensor.getNodes();
        if (mounted && res?.data?.length) {
          setStations(res.data);
          setSelectedStation(res.data[0].nodeId);
          setIsDemo(false);
        } else if (mounted) {
          setStations(DEMO_STATIONS);
          setSelectedStation(DEMO_STATIONS[0].nodeId);
          setIsDemo(true);
        }
      } catch {
        if (mounted) {
          setStations(DEMO_STATIONS);
          setSelectedStation(DEMO_STATIONS[0].nodeId);
          setIsDemo(true);
        }
      }
    }
    loadStations();
    return () => { mounted = false; };
  }, []);

  // Fetch telemetry for the selected station and time range with calibrated demo fallback
  useEffect(() => {
    let mounted = true;

    async function loadTelemetry() {
      setLoading(true);
      setError(null);

      const now = Date.now();
      let fromDate;
      if (timeRange === '24H') {
        fromDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      } else if (timeRange === '7D') {
        fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      try {
        const [historyRes, latestRes] = await Promise.all([
          api.sensor.getHistoricalReadings({
            nodeId: selectedStation,
            from: fromDate,
            limit: 500
          }).catch(() => null),
          api.sensor.getLatestReading(selectedStation).catch(() => null)
        ]);

        if (mounted) {
          if (historyRes?.data && Array.isArray(historyRes.data) && historyRes.data.length > 0) {
            const formatted = historyRes.data.map((r) => {
              const d = new Date(r.timestamp);
              const timeLabel = timeRange === '24H'
                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return {
                time: timeLabel,
                timestamp: r.timestamp,
                pH: typeof r.pH === 'number' && Number.isFinite(r.pH) ? Number(r.pH.toFixed(2)) : null,
                TDS: typeof r.tds === 'number' && Number.isFinite(r.tds) ? Math.round(r.tds) : null,
                Turbidity: typeof r.turbidity === 'number' && Number.isFinite(r.turbidity) ? Number(r.turbidity.toFixed(2)) : null,
                Temperature: typeof r.temperature === 'number' && Number.isFinite(r.temperature) ? Number(r.temperature.toFixed(1)) : null,
                overallStatus: r.overallStatus || 'Safe',
                isDemo: false
              };
            });
            setReadings(formatted);
            setIsDemo(false);
          } else {
            // Calibrated realistic demo historical telemetry
            const demoData = getDemoHistoricalReadings({ nodeId: selectedStation, timeRange });
            setReadings(demoData);
            setIsDemo(true);
          }

          if (latestRes?.data) {
            setLatestReading(latestRes.data);
          } else {
            setLatestReading(DEMO_LATEST_READINGS_BY_NODE[selectedStation] || DEMO_LATEST_READING);
          }
        }
      } catch {
        if (mounted) {
          const demoData = getDemoHistoricalReadings({ nodeId: selectedStation, timeRange });
          setReadings(demoData);
          setLatestReading(DEMO_LATEST_READINGS_BY_NODE[selectedStation] || DEMO_LATEST_READING);
          setIsDemo(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTelemetry();
    return () => { mounted = false; };
  }, [selectedStation, timeRange]);

  // Compute parameter statistics for current time range
  const calcStats = (key) => {
    const vals = readings.map((r) => r[key]).filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (!vals.length) return { min: '—', max: '—', avg: '—' };
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      min: key === 'TDS' ? Math.round(min) : min.toFixed(2),
      max: key === 'TDS' ? Math.round(max) : max.toFixed(2),
      avg: key === 'TDS' ? Math.round(avg) : avg.toFixed(2)
    };
  };

  const phStats = useMemo(() => calcStats('pH'), [readings]);
  const turbidityStats = useMemo(() => calcStats('Turbidity'), [readings]);
  const tdsStats = useMemo(() => calcStats('TDS'), [readings]);
  const tempStats = useMemo(() => calcStats('Temperature'), [readings]);

  // Export telemetry to RFC 4180 compliant CSV
  const handleDownloadCSV = () => {
    if (!readings.length) return;
    const header = 'Timestamp,Time,Station_ID,pH,TDS_ppm,Turbidity_NTU,Temperature_C,Overall_Status,Data_Source\n';
    const rows = readings
      .map((r) => `"${r.timestamp || ''}","${r.time}","${selectedStation}","${r.pH ?? ''}","${r.TDS ?? ''}","${r.Turbidity ?? ''}","${r.Temperature ?? ''}","${r.overallStatus}","${isDemo ? 'Simulated' : 'Actual'}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `water-quality-${selectedStation}-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasParamData = (key) => readings.some((r) => typeof r[key] === 'number' && Number.isFinite(r[key]));

  const currentStationObj = stations.find((s) => s.nodeId === selectedStation) || stations[0];

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {isDemo && (
          <DemoBadge variant="banner" />
        )}

        {/* Header matching pale-blue / aqua branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#BAE6FD]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Telemetry Analytics &amp; Trends</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Water Quality Telemetry</h1>
              {isDemo && <DemoBadge text="Simulated Dataset" />}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Four independent time-series charts with dedicated axes and Bureau of Indian Standards (BIS IS 10500:2012) thresholds
            </p>
          </div>

          {/* Controls Bar: Station Selector, Common Date Range, Download */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Station dropdown */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-[#BAE6FD] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7] shadow-2xs"
              aria-label="Select Monitoring Station"
            >
              {stations.map((s) => (
                <option key={s.nodeId} value={s.nodeId}>
                  {s.name || s.nodeId}
                </option>
              ))}
            </select>

            {/* Common Date Range Filter */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-[#BAE6FD] shadow-2xs">
              {['24H', '7D', '30D'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0FAFF]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Download CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              disabled={readings.length === 0}
              className="text-xs font-bold border-[#BAE6FD] flex items-center gap-1.5 disabled:opacity-50"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Download CSV</span>
            </Button>
          </div>
        </div>

        {/* API Error Banner if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span><strong>Backend Telemetry Notice:</strong> {error}</span>
            <button
              onClick={() => setSelectedStation((s) => s)}
              className="font-bold underline hover:text-rose-950 ml-3"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Metric Cards: 4 Parameters with latest readings for the selected station */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: pH */}
          <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Acidity (pH)</span>
              <Badge
                variant={
                  latestReading?.pH !== undefined
                    ? (latestReading.pH < 6.5 || latestReading.pH > 8.5 ? 'unsafe' : 'safe')
                    : (readings.length > 0 ? 'safe' : 'neutral')
                }
                size="sm"
              >
                {latestReading?.pH !== undefined
                  ? (latestReading.pH < 6.5 || latestReading.pH > 8.5 ? 'Breach' : 'Normal')
                  : 'Normal'}
              </Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">
                {latestReading?.pH !== undefined ? latestReading.pH.toFixed(2) : (readings[readings.length - 1]?.pH ?? '—')}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Permissible: 6.5 — 8.5 pH (BIS IS 10500)
              </p>
            </div>
          </div>

          {/* Card 2: Turbidity */}
          <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Turbidity</span>
              <Badge
                variant={
                  latestReading?.turbidity !== undefined
                    ? (latestReading.turbidity > 5.0 ? 'unsafe' : 'safe')
                    : (readings.length > 0 ? 'safe' : 'neutral')
                }
                size="sm"
              >
                {latestReading?.turbidity !== undefined
                  ? (latestReading.turbidity > 5.0 ? 'Breach' : 'Clear')
                  : 'Clear'}
              </Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">
                {latestReading?.turbidity !== undefined
                  ? `${latestReading.turbidity.toFixed(2)} NTU`
                  : readings[readings.length - 1]?.Turbidity !== null && readings[readings.length - 1]?.Turbidity !== undefined
                  ? `${readings[readings.length - 1].Turbidity} NTU`
                  : '—'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Permissible: ≤ 5.0 NTU (Desirable: ≤ 1.0)
              </p>
            </div>
          </div>

          {/* Card 3: TDS */}
          <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Dissolved Solids</span>
              <Badge
                variant={
                  latestReading?.tds !== undefined
                    ? (latestReading.tds > 500 ? 'caution' : 'safe')
                    : (readings.length > 0 ? 'safe' : 'neutral')
                }
                size="sm"
              >
                {latestReading?.tds !== undefined
                  ? (latestReading.tds > 500 ? 'Elevated' : 'Good')
                  : 'Good'}
              </Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">
                {latestReading?.tds !== undefined
                  ? `${latestReading.tds} ppm`
                  : readings[readings.length - 1]?.TDS !== null && readings[readings.length - 1]?.TDS !== undefined
                  ? `${readings[readings.length - 1].TDS} ppm`
                  : '—'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Acceptable ceiling: ≤ 500 ppm / mg/L
              </p>
            </div>
          </div>

          {/* Card 4: Temperature */}
          <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Water Temperature</span>
              <Badge
                variant={
                  latestReading?.temperature !== undefined
                    ? (latestReading.temperature > 35.0 ? 'caution' : 'safe')
                    : (readings.length > 0 ? 'safe' : 'neutral')
                }
                size="sm"
              >
                {latestReading?.temperature !== undefined
                  ? (latestReading.temperature > 35.0 ? 'Caution' : 'Normal')
                  : 'Normal'}
              </Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black font-mono text-slate-900">
                {latestReading?.temperature !== undefined
                  ? `${latestReading.temperature.toFixed(1)} °C`
                  : readings[readings.length - 1]?.Temperature !== null && readings[readings.length - 1]?.Temperature !== undefined
                  ? `${readings[readings.length - 1].Temperature} °C`
                  : '—'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Ambient delivery: 10 — 40 °C (≤ 35.0 °C threshold)
              </p>
            </div>
          </div>
        </div>

        {/* Four Separate Independent Parameter Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* GRAPH 1: pH Trend */}
          <div className="p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#0284C7]" />
                    <h3 className="text-base font-bold text-slate-900">Graph 1: pH (Acidity / Alkalinity)</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Acceptable reference range: 6.5 – 8.5 pH (BIS IS 10500:2012 Clause 4, Table 1)
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#E0F7FF] text-[#0284C7] shrink-0 border border-[#BAE6FD]">
                  pH Scale
                </span>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 text-center text-xs">
                <div><span className="text-[10px] text-slate-400 block">Min</span><span className="font-mono font-bold text-slate-700">{phStats.min}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Max</span><span className="font-mono font-bold text-slate-700">{phStats.max}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Mean</span><span className="font-mono font-bold text-slate-700">{phStats.avg}</span></div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <span>Loading pH telemetry...</span>
                </div>
              ) : !hasParamData('pH') ? (
                <ChartEmptyState parameterName="pH" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings} margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                    <defs>
                      <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={[5.5, 9.5]}
                      label={{ value: 'pH', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<ParameterTooltip unit="" name="pH" />} />
                    <ReferenceLine
                      y={6.5}
                      stroke="#0284C7"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Min Limit (6.5)', fill: '#0284C7', fontSize: 10, position: 'insideBottomLeft' }}
                    />
                    <ReferenceLine
                      y={8.5}
                      stroke="#0284C7"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Max Limit (8.5)', fill: '#0284C7', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pH"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      fill="url(#phGrad)"
                      dot={{ r: 2.5, fill: '#0284C7' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* GRAPH 2: Turbidity Trend */}
          <div className="p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                    <h3 className="text-base font-bold text-slate-900">Graph 2: Turbidity Trend</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optical clarity in NTU • Desirable: ≤ 1.0 NTU • Permissible limit: ≤ 5.0 NTU (BIS IS 10500)
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0 border border-amber-200">
                  NTU
                </span>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 text-center text-xs">
                <div><span className="text-[10px] text-slate-400 block">Min</span><span className="font-mono font-bold text-slate-700">{turbidityStats.min}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Max</span><span className="font-mono font-bold text-slate-700">{turbidityStats.max}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Mean</span><span className="font-mono font-bold text-slate-700">{turbidityStats.avg}</span></div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <span>Loading Turbidity telemetry...</span>
                </div>
              ) : !hasParamData('Turbidity') ? (
                <ChartEmptyState parameterName="turbidity" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings} margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                    <defs>
                      <linearGradient id="turbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={[0, 8.0]}
                      label={{ value: 'Turbidity (NTU)', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<ParameterTooltip unit="NTU" name="Turbidity" />} />
                    <ReferenceLine
                      y={1.0}
                      stroke="#10B981"
                      strokeDasharray="3 3"
                      strokeWidth={1.25}
                      label={{ value: 'Desirable (1.0 NTU)', fill: '#059669', fontSize: 10, position: 'insideBottomRight' }}
                    />
                    <ReferenceLine
                      y={5.0}
                      stroke="#D97706"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Permissible Max (5.0 NTU)', fill: '#B45309', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Turbidity"
                      stroke="#D97706"
                      strokeWidth={2.5}
                      fill="url(#turbGrad)"
                      dot={{ r: 2.5, fill: '#D97706' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* GRAPH 3: TDS Trend */}
          <div className="p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#059669]" />
                    <h3 className="text-base font-bold text-slate-900">Graph 3: Total Dissolved Solids (TDS)</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Inorganic salts in ppm (mg/L) • Acceptable: ≤ 500 ppm • Desirable: &lt; 300 ppm (BIS IS 10500)
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-200">
                  ppm (mg/L)
                </span>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 text-center text-xs">
                <div><span className="text-[10px] text-slate-400 block">Min</span><span className="font-mono font-bold text-slate-700">{tdsStats.min}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Max</span><span className="font-mono font-bold text-slate-700">{tdsStats.max}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Mean</span><span className="font-mono font-bold text-slate-700">{tdsStats.avg}</span></div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <span>Loading TDS telemetry...</span>
                </div>
              ) : !hasParamData('TDS') ? (
                <ChartEmptyState parameterName="total dissolved solids (TDS)" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings} margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                    <defs>
                      <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={[100, 600]}
                      label={{ value: 'TDS (ppm)', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<ParameterTooltip unit="ppm" name="TDS" />} />
                    <ReferenceLine
                      y={500}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Acceptable Max (500 ppm)', fill: '#047857', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={300}
                      stroke="#10B981"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{ value: 'Desirable (< 300 ppm)', fill: '#059669', fontSize: 10, position: 'insideBottomRight' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="TDS"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#tdsGrad)"
                      dot={{ r: 2.5, fill: '#059669' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* GRAPH 4: Temperature Trend */}
          <div className="p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <h3 className="text-base font-bold text-slate-900">Graph 4: Water Temperature</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Thermal telemetry in °C • Configured safety threshold: ≤ 35.0 °C • Ambient range: 10 – 40 °C
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 shrink-0 border border-rose-200">
                  °C
                </span>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 text-center text-xs">
                <div><span className="text-[10px] text-slate-400 block">Min</span><span className="font-mono font-bold text-slate-700">{tempStats.min}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Max</span><span className="font-mono font-bold text-slate-700">{tempStats.max}</span></div>
                <div><span className="text-[10px] text-slate-400 block">Mean</span><span className="font-mono font-bold text-slate-700">{tempStats.avg}</span></div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <span>Loading Temperature telemetry...</span>
                </div>
              ) : !hasParamData('Temperature') ? (
                <ChartEmptyState parameterName="water temperature" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings} margin={{ top: 15, right: 15, left: -10, bottom: 15 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      domain={[15, 35]}
                      label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<ParameterTooltip unit="°C" name="Temperature" />} />
                    <ReferenceLine
                      y={35.0}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Threshold Limit (35.0 °C)', fill: '#DC2626', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Temperature"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      fill="url(#tempGrad)"
                      dot={{ r: 2.5, fill: '#EF4444' }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </CitizenLayout>
  );
}
