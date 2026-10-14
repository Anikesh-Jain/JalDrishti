import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti Phase 19: MapLegend Component
 *
 * Provides a clean, accessible legend explaining map marker semantics:
 * - Online (Nominal telemetry)
 * - Active Threshold Breach (Alert active)
 * - Offline / Maintenance
 *
 * Complies with accessibility by pairing icons and colored indicators with explicit text labels.
 */
export default function MapLegend({ className = '' }) {
  return (
    <Card className={`p-4 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Node Status Legend
        </h4>
        <Badge variant="neutral" size="sm" className="text-[10px]">
          Prototype v1.0
        </Badge>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Nominal Online */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" aria-hidden="true" />
          <div>
            <span className="font-semibold text-slate-800">Online — Normal Baseline</span>
            <p className="text-[11px] text-slate-500">Node transmitting within safe parameter limits</p>
          </div>
        </div>

        {/* Active Breach Warning */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 ring-4 ring-rose-100"></span>
          </span>
          <div>
            <span className="font-semibold text-rose-700">Active Alert Breach</span>
            <p className="text-[11px] text-slate-500">One or more parameters outside configured threshold</p>
          </div>
        </div>

        {/* Offline / Maintenance */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-100 shrink-0" aria-hidden="true" />
          <div>
            <span className="font-semibold text-slate-800">Offline / Standby</span>
            <p className="text-[11px] text-slate-500">Node telemetry paused or scheduled maintenance</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
