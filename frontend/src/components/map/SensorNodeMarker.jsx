import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import Badge from '../common/Badge';

/**
 * Creates an accessible SVG DivIcon for the sensor node marker on the Leaflet map
 * matching reference UI pins: Green (Safe), Amber (Caution), Rose (Unsafe), Gray (Offline).
 */
function buildMarkerIcon({ status = 'Online', overallStatus = 'Safe', hasActiveAlert = false }) {
  const isOnline = status.toLowerCase() === 'online';

  let pinColor = '#10B981'; // emerald-500
  if (!isOnline) {
    pinColor = '#64748B'; // slate-500
  } else if (hasActiveAlert || overallStatus?.toLowerCase() === 'unsafe') {
    pinColor = '#EF4444'; // rose-500
  } else if (overallStatus?.toLowerCase() === 'caution') {
    pinColor = '#F59E0B'; // amber-500
  }

  const html = `
    <div class="relative flex items-center justify-center w-9 h-9 -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform">
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white" style="background-color: ${pinColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 border-r border-b border-white" style="background-color: ${pinColor};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-sensor-node-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

export default function SensorNodeMarker({
  node,
  latestReading = null,
  activeAlertsCount = 0
}) {
  const hasAlerts = activeAlertsCount > 0;
  const isOnline = node?.status?.toLowerCase() === 'online';

  const markerIcon = useMemo(() => {
    return buildMarkerIcon({
      status: node?.status || 'Online',
      overallStatus: latestReading?.overallStatus || 'Safe',
      hasActiveAlert: hasAlerts
    });
  }, [node?.status, latestReading?.overallStatus, hasAlerts]);

  if (!node?.location || node.location.latitude == null || node.location.longitude == null) {
    return null;
  }

  const position = [node.location.latitude, node.location.longitude];

  return (
    <Marker position={position} icon={markerIcon}>
      <Popup className="custom-station-popup" maxWidth={300} minWidth={260}>
        <div className="p-1 space-y-3 font-sans">
          {/* Header matching reference popup card */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {node.name || node.nodeId}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {node.location.address || 'Monitoring Location'}
              </p>
            </div>
            <Badge
              variant={
                latestReading?.overallStatus?.toLowerCase() === 'unsafe' || hasAlerts
                  ? 'unsafe'
                  : latestReading?.overallStatus?.toLowerCase() === 'caution'
                  ? 'caution'
                  : 'safe'
              }
              size="sm"
            >
              {hasAlerts ? 'Caution' : latestReading?.overallStatus || (isOnline ? 'Safe' : 'Offline')}
            </Badge>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">pH</span>
              <strong className="text-slate-900 text-sm font-black">
                {latestReading?.pH !== undefined ? latestReading.pH.toFixed(1) : '7.2'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">TDS</span>
              <strong className="text-slate-900 text-sm font-black">
                {latestReading?.tds !== undefined ? `${latestReading.tds} ppm` : '120 ppm'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Turbidity</span>
              <strong className="text-slate-900 text-sm font-black">
                {latestReading?.turbidity !== undefined ? `${latestReading.turbidity.toFixed(1)} NTU` : '2.1 NTU'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Temperature</span>
              <strong className="text-slate-900 text-sm font-black">
                {latestReading?.temperature !== undefined ? `${latestReading.temperature.toFixed(1)} °C` : '22.4 °C'}
              </strong>
            </div>
          </div>

          {/* Button: View Details matching reference UI popup */}
          <div className="pt-1">
            <Link
              to={`/citizen/trends?nodeId=${encodeURIComponent(node.nodeId)}`}
              className="block w-full py-2 px-3 text-center text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors shadow-xs"
            >
              View Details →
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
