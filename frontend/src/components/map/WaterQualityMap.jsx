import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SensorNodeMarker from './SensorNodeMarker';
import MapLegend from './MapLegend';
import EmptyState from '../feedback/EmptyState';

/**
 * JalDrishti Phase 19: WaterQualityMap Component
 *
 * Renders an interactive Leaflet map using OpenStreetMap tiles.
 * - Visualizes the configured IoT sensor node(s).
 * - Honors the academic single-node prototype scope (no fabricated nodes).
 * - Fully responsive with explicit container heights to prevent layout collapse.
 * - Centers appropriately on configured node coordinates.
 */
export default function WaterQualityMap({
  nodes = [],
  latestReading = null,
  activeAlerts = []
}) {
  // Find node with verified valid coordinates
  const validNode = useMemo(() => {
    return nodes.find((n) => n.hasValidLocation && n.location?.latitude != null && n.location?.longitude != null);
  }, [nodes]);

  // If no valid node coordinates exist, render an honest EmptyState
  if (!validNode) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <EmptyState
          title="No Sensor Node Location Available"
          message="No valid geographic coordinates are currently configured for the monitoring station. Once node coordinates are established in MongoDB, the interactive map will render here."
        />
      </div>
    );
  }

  const centerCoords = [
    validNode.location.latitude,
    validNode.location.longitude
  ];

  // Count active alerts associated with this specific node
  const activeAlertsForNode = activeAlerts.filter(
    (a) => a.nodeId === validNode.nodeId
  ).length;

  return (
    <div className="relative w-full h-[540px] min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 z-0">
      <MapContainer
        center={centerCoords}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
      >
        {/* OpenStreetMap TileLayer with standard attribution */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Sensor Node Marker */}
        <SensorNodeMarker
          node={validNode}
          latestReading={latestReading}
          activeAlertsCount={activeAlertsForNode}
        />
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] max-w-xs pointer-events-auto">
        <MapLegend />
      </div>
    </div>
  );
}
