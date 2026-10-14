import React from 'react';
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
import ChartEmptyState from './ChartEmptyState';

/**
 * Custom readable tooltip component for Recharts.
 */
function CustomTooltip({ active, payload, label, unit, name }) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const value = payload[0].value;
    const status = point.overallStatus || 'Safe';

    const getStatusColor = (s) => {
      switch (s?.toLowerCase()) {
        case 'unsafe':
          return 'text-rose-700 bg-rose-50 border-rose-200';
        case 'caution':
        case 'warning':
          return 'text-amber-700 bg-amber-50 border-amber-200';
        default:
          return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      }
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[150px]">
        <div className="text-slate-400 font-mono text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
          <span>{point.timeLabel || label}</span>
          {point.nodeId && <span className="font-semibold text-slate-500">{point.nodeId}</span>}
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <span className="font-medium text-slate-600">{name}:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {value !== null && value !== undefined ? `${value} ${unit}`.trim() : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400">Condition:</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * JalDrishti Phase 17: TrendChart Component
 *
 * Renders an accessible, responsive time-series chart for an individual
 * water quality parameter using Recharts.
 */
export default function TrendChart({
  data = [],
  dataKey,
  name,
  unit = '',
  strokeColor = '#0284c7',
  fillColor = '#38bdf8',
  minThreshold = null,
  maxThreshold = null,
  yDomain = ['auto', 'auto'],
  height = 240
}) {
  // Check if any valid data points exist
  const hasValidData =
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((d) => typeof d[dataKey] === 'number' && Number.isFinite(d[dataKey]));

  if (!hasValidData) {
    return <ChartEmptyState parameterName={name} />;
  }

  const gradientId = `gradient-${dataKey}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis
            dataKey="timeLabel"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            minTickGap={24}
          />

          <YAxis
            domain={yDomain}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />

          <Tooltip
            content={<CustomTooltip unit={unit} name={name} />}
          />

          {/* Configured Reference Boundaries */}
          {typeof minThreshold === 'number' && (
            <ReferenceLine
              y={minThreshold}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.25}
              label={{
                value: `Min (${minThreshold})`,
                fill: '#be123c',
                fontSize: 10,
                position: 'insideBottomLeft'
              }}
            />
          )}

          {typeof maxThreshold === 'number' && (
            <ReferenceLine
              y={maxThreshold}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.25}
              label={{
                value: `Max (${maxThreshold})`,
                fill: '#be123c',
                fontSize: 10,
                position: 'insideTopLeft'
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: strokeColor }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
