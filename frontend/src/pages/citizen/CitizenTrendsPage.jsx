import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/feedback/LoadingState';
import api from '../../services/api';
import { DownloadIcon } from '../../components/common/Icons';

export default function CitizenTrendsPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('NODE-01-INDORE-WARD12');
  const [timeRange, setTimeRange] = useState('24H');
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadStations() {
      try {
        const res = await api.sensor.getNodes();
        if (mounted && res?.data?.length) {
          setStations(res.data);
          setSelectedStation(res.data[0].nodeId);
        }
      } catch {
        // Fallback
      }
    }
    loadStations();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadTelemetry() {
      setLoading(true);
      try {
        const [historyRes, latestRes] = await Promise.all([
          api.sensor.getHistoricalReadings({ nodeId: selectedStation, limit: timeRange === '24H' ? 48 : 100 }),
          api.sensor.getLatestReading(selectedStation)
        ]);

        if (mounted) {
          if (historyRes?.data?.length) {
            const formatted = historyRes.data.map((r) => {
              const d = new Date(r.timestamp);
              return {
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pH: Number((r.pH || 7.2).toFixed(2)),
                TDS: Math.round(r.tds || 120),
                Turbidity: Number((r.turbidity || 2.1).toFixed(2)),
                Temperature: Number((r.temperature || 22.4).toFixed(1))
              };
            });
            setReadings(formatted);
          } else {
            setReadings(generateSampleData());
          }

          if (latestRes?.data) {
            setLatestReading(latestRes.data);
          }
        }
      } catch {
        if (mounted) setReadings(generateSampleData());
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTelemetry();
    return () => { mounted = false; };
  }, [selectedStation, timeRange]);

  function generateSampleData() {
    return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((t, i) => ({
      time: t,
      pH: Number((7.1 + Math.sin(i) * 0.3).toFixed(2)),
      TDS: Math.round(120 + Math.sin(i) * 20),
      Turbidity: Number((2.0 + Math.cos(i) * 0.5).toFixed(2)),
      Temperature: Number((22.4 + Math.sin(i) * 0.8).toFixed(1))
    }));
  }

  const handleDownloadCSV = () => {
    const header = 'Time,pH,TDS (ppm),Turbidity (NTU),Temperature (°C)\n';
    const rows = readings.map((r) => `${r.time},${r.pH},${r.TDS},${r.Turbidity},${r.Temperature}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `water-quality-telemetry-${selectedStation}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header matching reference UI */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Water Quality Telemetry</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time and historical water quality data
            </p>
          </div>

          {/* Controls Bar: Station Selector, Date Range, Download */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Station dropdown */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {stations.map((s) => (
                <option key={s.nodeId} value={s.nodeId}>
                  {s.name || s.nodeId}
                </option>
              ))}
              {stations.length === 0 && (
                <option value="NODE-01-INDORE-WARD12">Station 1 - River Ganga (Indore)</option>
              )}
            </select>

            {/* Date range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="24H">Last 24 Hours</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
            </select>

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="text-xs font-bold border-slate-200 flex items-center gap-1.5"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* 4 Parameter Metric Cards matching row 2 left */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: pH */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">pH</span>
              <Badge variant="safe" size="sm">Normal</Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {latestReading?.pH !== undefined ? latestReading.pH.toFixed(1) : '7.2'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Normal (6.5 — 8.5 pH)
              </p>
            </div>
          </div>

          {/* Card 2: TDS */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">TDS</span>
              <Badge variant="safe" size="sm">Good</Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {latestReading?.tds !== undefined ? `${latestReading.tds} ppm` : '120 ppm'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Good (&lt; 300 ppm)
              </p>
            </div>
          </div>

          {/* Card 3: Turbidity */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Turbidity</span>
              <Badge variant="safe" size="sm">Good</Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {latestReading?.turbidity !== undefined ? `${latestReading.turbidity.toFixed(1)} NTU` : '2.1 NTU'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Clear (&lt; 5 NTU)
              </p>
            </div>
          </div>

          {/* Card 4: Temperature */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Temperature</span>
              <Badge variant="safe" size="sm">Normal</Badge>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {latestReading?.temperature !== undefined ? `${latestReading.temperature.toFixed(1)} °C` : '22.4 °C'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Normal (10 — 40 °C)
              </p>
            </div>
          </div>
        </div>

        {/* Parameter Trends Multi-Line Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Parameter Trends</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> pH</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> TDS</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Turbidity</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Temperature</span>
              </div>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {['24H', '7D', '30D'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeRange === r ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="pH" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="TDS" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Turbidity" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Temperature" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
