import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { MapPinIcon } from '../common/Icons';

/**
 * JalDrishti LatestReadingCard Component
 * Displays monitoring context and active community warning notices.
 * Read-only only: zero alert management or resolution controls.
 */
export default function LatestReadingCard({
  nodeId,
  nodeName,
  location,
  timestamp,
  nodeLastSeen,
  nodeStatus = 'Online',
  activeAlerts = []
}) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium'
      })
    : 'Not available';

  const formattedLastSeen = nodeLastSeen
    ? new Date(nodeLastSeen).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : null;

  // Resolve human-readable station name
  const stationName = nodeName && !nodeName.startsWith('NODE_') && !nodeName.startsWith('NODE-')
    ? nodeName
    : 'Bhagirathpura Supply Point 1';

  // Resolve human-readable location address
  const stationAddress = typeof location === 'object' && location?.address
    ? location.address
    : typeof location === 'string' && location
    ? location
    : 'Ward 12, Indore, MP';

  const coordinatesStr = typeof location === 'object' && location?.latitude != null && location?.longitude != null
    ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E`
    : null;

  const technicalId = nodeId || 'NODE-01-INDORE-WARD12';

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-0.5">
            Monitoring Station Details
          </h3>
          <p className="text-xs text-slate-500">
            Origin and context of current telemetry data
          </p>
        </div>
        <Link
          to="/citizen/map"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Map</span>
          <MapPinIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Station Name */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Station Name
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900 text-sm truncate">
              {stationName}
            </span>
            <Badge variant={nodeStatus?.toLowerCase() === 'online' ? 'safe' : 'caution'} size="sm" dot>
              {nodeStatus || 'Online'}
            </Badge>
          </div>
        </div>

        {/* Station Location */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Station Location
          </span>
          <div>
            <span className="font-semibold text-slate-800 text-sm block">
              {stationAddress}
            </span>
            {coordinatesStr && (
              <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 mt-0.5 font-mono">
                <MapPinIcon className="w-3 h-3 text-slate-400" />
                <span>{coordinatesStr}</span>
              </span>
            )}
          </div>
        </div>

        {/* Technical Station Identifier */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Station Identifier (Technical)
          </span>
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {technicalId}
            </code>
            <span className="text-[11px] text-slate-400">IoT Sensor Node</span>
          </div>
        </div>

        {/* Telemetry Timestamp */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Telemetry Recorded
          </span>
          <span className="font-medium text-slate-800">
            {formattedTime}
          </span>
        </div>

        {formattedLastSeen && (
          <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Station Node Last Seen
            </span>
            <span className="font-medium text-slate-800">
              {formattedLastSeen}
            </span>
          </div>
        )}
      </div>

      {activeAlerts.length > 0 && (
        <div className="mt-5 p-3.5 bg-red-50/80 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Active System Warning
            </span>
            <Badge variant="unsafe" size="sm">
              {activeAlerts.length} Active
            </Badge>
          </div>
          <p className="text-xs text-red-700 leading-relaxed mb-2">
            Automated alerts were triggered for:
          </p>
          <div className="flex flex-wrap gap-2">
            {activeAlerts.map((a, idx) => (
              <span
                key={a._id || a.id || idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-red-700 border border-red-200"
              >
                {a.parameter?.toUpperCase()} ({a.severity || 'Warning'})
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
