import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
import LoadingState from '../../components/feedback/LoadingState';
import ErrorState from '../../components/feedback/ErrorState';
import api from '../../services/api';
import {
  MapPinIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  BarChartIcon,
  CheckCircleIcon
} from '../../components/common/Icons';

/**
 * Custom Recharts Tooltip for Overview Line Chart (Restored)
 * Displays distinct parameter values and corresponding measurement units.
 */
function OverviewTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const units = {
      pH: '',
      Turbidity: ' NTU',
      TDS: ' ppm',
      Temperature: ' °C'
    };
    return (
      <div className="bg-white/95 backdrop-blur-md border border-[#BAE6FD] p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-semibold text-slate-500 border-b border-slate-100 pb-1">{label}</p>
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
    reading,
    activeAlerts,
    loading,
    refreshing,
    error,
    refresh
  } = useLiveMonitoring();

  const [timeRange, setTimeRange] = useState('24H');
  const [trendData, setTrendData] = useState([]);
  const [stationsCount, setStationsCount] = useState(0);
  const [totalReadingsCount, setTotalReadingsCount] = useState(0);
  const [alertsList, setAlertsList] = useState([]);

  // Fetch trend data and stats using real sensor history
  useEffect(() => {
    let mounted = true;
    async function fetchDashboardAnalytics() {
      try {
        const now = Date.now();
        let fromDate;
        if (timeRange === '24H') fromDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        else if (timeRange === '7D') fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
        else fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

        const historyRes = await api.sensor.getHistoricalReadings({ from: fromDate, limit: 100 });
        if (mounted && historyRes && historyRes.data) {
          const formatted = historyRes.data.map((r) => {
            const d = new Date(r.timestamp);
            const timeLabel = timeRange === '24H'
              ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
            return {
              time: timeLabel,
              pH: typeof r.pH === 'number' && Number.isFinite(r.pH) ? Number(r.pH.toFixed(2)) : null,
              TDS: typeof r.tds === 'number' && Number.isFinite(r.tds) ? Math.round(r.tds) : null,
              Turbidity: typeof r.turbidity === 'number' && Number.isFinite(r.turbidity) ? Number(r.turbidity.toFixed(2)) : null,
              Temperature: typeof r.temperature === 'number' && Number.isFinite(r.temperature) ? Number(r.temperature.toFixed(1)) : null,
              overallStatus: r.overallStatus || 'Safe'
            };
          });
          setTrendData(formatted);
          setTotalReadingsCount(historyRes.data.length);
        } else if (mounted) {
          setTrendData([]);
          setTotalReadingsCount(0);
        }
      } catch {
        if (mounted) {
          setTrendData([]);
          setTotalReadingsCount(0);
        }
      }

      try {
        const nodesRes = await api.sensor.getNodes();
        if (mounted && nodesRes && nodesRes.data) {
          setStationsCount(nodesRes.data.length || 0);
        }
      } catch {
        if (mounted) setStationsCount(0);
      }

      try {
        const alertsRes = await api.alerts.getAll({ limit: 5 });
        if (mounted && alertsRes && alertsRes.data) {
          setAlertsList(alertsRes.data);
        }
      } catch {
        if (mounted) setAlertsList([]);
      }
    }

    fetchDashboardAnalytics();
    return () => {
      mounted = false;
    };
  }, [timeRange]);

  const activeAlertNodeIds = new Set((alertsList || []).filter(a => a.status === 'Active').map(a => a.nodeId));
  const alertStationsCount = Math.min(activeAlertNodeIds.size, stationsCount);
  const safeStationsCount = Math.max(0, stationsCount - alertStationsCount);
  const safePercentage = stationsCount > 0 ? Math.round((safeStationsCount / stationsCount) * 100) : 100;

  // Water Quality Status Distribution (Donut Chart)
  const statusDistribution = stationsCount > 0 ? [
    { name: 'Safe', value: safeStationsCount, color: '#10B981' },
    { name: 'Caution', value: 0, color: '#F59E0B' },
    { name: 'Unsafe', value: alertStationsCount, color: '#EF4444' }
  ].filter(item => item.value > 0) : [{ name: 'Awaiting Stations', value: 1, color: '#E2E8F0' }];

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* 1. Header with Page Title, Subtitle, Date and Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Overview of water quality monitoring across all stations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              loading={refreshing}
              className="text-xs border-slate-300"
            >
              ↻ Refresh Live Data
            </Button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Data</span>
            </div>
          </div>
        </div>

        {error && (
          <ErrorState message={error} onRetry={refresh} />
        )}

        {/* 2. Four Stat Cards matching reference UI exactly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Stations</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{stationsCount}</span>
              <p className="text-[11px] font-semibold text-cyan-700 mt-1 flex items-center gap-1">
                <span>{stationsCount === 1 ? '1 active hardware station' : `${stationsCount} active stations`}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Safe Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Safe Stations</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{safeStationsCount}</span>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                {stationsCount > 0 ? `${safePercentage}% of total` : 'Awaiting station telemetry'}
              </p>
            </div>
          </div>

          {/* Card 3: Alert Stations */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Alert Stations</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{alertStationsCount}</span>
              <p className="text-[11px] font-semibold text-amber-600 mt-1">
                {alertStationsCount > 0 ? 'Require attention' : 'All stations normal'}
              </p>
            </div>
          </div>

          {/* Card 4: Total Readings */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Readings</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChartIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {totalReadingsCount.toLocaleString()}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                <span>{totalReadingsCount > 0 ? 'Logged telemetry points' : 'No telemetry logged yet'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Charts Section matching reference UI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Chart: Water Quality Overview - One Combined Multi-Parameter Chart (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-card flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Water Quality Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combined multi-parameter historical telemetry trend
                </p>
                <div className="flex flex-wrap items-center gap-3.5 mt-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                    pH
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    Turbidity (NTU)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                    TDS (ppm)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    Temperature (°C)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Time Range Toggles [24H] [7D] [30D] */}
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
                  to="/citizen/trends"
                  className="text-xs font-bold text-[#0284C7] hover:underline whitespace-nowrap"
                >
                  View All Trends →
                </Link>
              </div>
            </div>

            {/* Combined Line Chart Container */}
            <div className="h-72 sm:h-80 w-full pt-4">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No telemetry recorded for the selected time range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 12, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    {/* Left Y-Axis for pH, Turbidity, and Temperature */}
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
                      domain={[0, 'auto']}
                      label={{ value: 'TDS (ppm)', angle: 90, position: 'insideRight', offset: 12, fill: '#059669', fontSize: 10 }}
                    />
                    <Tooltip content={<OverviewTooltip />} />
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
              )}
            </div>
          </div>

          {/* Right Chart: Water Quality Status (Donut Chart - 4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Water Quality Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Station health distribution</p>
            </div>

            {/* Donut Chart with Centered Metric */}
            <div className="relative h-56 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {stationsCount > 0 ? `${safePercentage}%` : '—'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {stationsCount > 0 ? 'Stations Safe' : 'No Stations'}
                </span>
              </div>
            </div>

            {/* Legend matching real node status */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">{safeStationsCount} Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-700">{alertStationsCount} Alert</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Parameter Quick Inspection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Acidity (pH)</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {typeof reading?.pH === 'number' ? reading.pH.toFixed(1) : '—'}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">
                {typeof reading?.pH === 'number' ? 'Normal (6.5 - 8.5)' : 'Sensor bound: 6.5 - 8.5'}
              </span>
            </div>
            {typeof reading?.pH === 'number' ? (
              <Badge variant="safe" size="sm">Safe</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Awaiting Telemetry</Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">TDS</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {typeof reading?.tds === 'number' ? `${reading.tds} ppm` : '—'}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">
                {typeof reading?.tds === 'number' ? 'Good (< 500 ppm)' : 'Sensor bound: < 500 ppm'}
              </span>
            </div>
            {typeof reading?.tds === 'number' ? (
              <Badge variant="safe" size="sm">Good</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Awaiting Telemetry</Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Turbidity</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {typeof reading?.turbidity === 'number' ? `${reading.turbidity.toFixed(1)} NTU` : '—'}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">
                {typeof reading?.turbidity === 'number' ? 'Clear (< 5 NTU)' : 'Sensor bound: < 5 NTU'}
              </span>
            </div>
            {typeof reading?.turbidity === 'number' ? (
              <Badge variant="safe" size="sm">Clear</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Awaiting Telemetry</Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Temperature</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {typeof reading?.temperature === 'number' ? `${reading.temperature.toFixed(1)} °C` : '—'}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">
                {typeof reading?.temperature === 'number' ? 'Ambient (10 - 40 °C)' : 'Sensor bound: 10 - 40 °C'}
              </span>
            </div>
            {typeof reading?.temperature === 'number' ? (
              <Badge variant="safe" size="sm">Normal</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Awaiting Telemetry</Badge>
            )}
          </div>
        </div>

        {/* 5. Recent Alerts & Activity Preview */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Early Warnings</h3>
              <p className="text-xs text-slate-500">Live breaches detected by autonomous threshold monitoring</p>
            </div>
            <Link to="/citizen/alerts" className="text-xs font-bold text-cyan-600 hover:underline">
              View All Alerts →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {alertsList.length > 0 ? (
              alertsList.map((alert) => (
                <div key={alert._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangleIcon className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {alert.parameter.toUpperCase()} Threshold Breach
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Station: <strong>{alert.nodeId}</strong> • Value: <strong>{alert.value}</strong> (Safe bound: {alert.thresholdLimit})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant={alert.status === 'Active' ? 'unsafe' : 'safe'} size="sm">
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span>All station parameters are operating within established safe threshold limits.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
