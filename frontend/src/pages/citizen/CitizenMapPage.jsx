import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CitizenLayout from '../../layouts/CitizenLayout';
import SensorNodeMarker from '../../components/map/SensorNodeMarker';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/feedback/LoadingState';
import api from '../../services/api';

/**
 * JalDrishti Live Map Page (REM-07 / Reference Image Row 2 Center)
 *
 * Implements:
 * - Header: "Live Map / Monitor all water quality stations across locations"
 * - Legend: ● Safe  ● Caution  ● Unsafe  ● Offline
 * - OpenStreetMap container with interactive pins and popup cards
 * - Real-time readings and alerts overlay
 */
export default function CitizenMapPage() {
  const [nodes, setNodes] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMapData = async () => {
    try {
      const [nodesRes, latestRes, alertsRes] = await Promise.all([
        api.sensor.getNodes().catch(() => ({ data: [] })),
        api.nodes.getLatestReading().catch(() => ({ data: null })),
        api.alerts.getActive().catch(() => ({ data: [] }))
      ]);

      setNodes(nodesRes?.data || []);
      setLatestReading(latestRes?.data || null);
      setActiveAlerts(alertsRes?.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMapData();
  };

  // Center coordinate around Indore / first node location
  const defaultCenter = [22.7196, 75.8577];
  const centerCoords = nodes[0]?.location?.latitude != null
    ? [nodes[0].location.latitude, nodes[0].location.longitude]
    : defaultCenter;

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header with Title and Legend matching reference UI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Map</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monitor all water quality stations across locations
            </p>
          </div>

          {/* Top Status Legend matching reference UI */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700">Safe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">Caution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-700">Unsafe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-500">Offline</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              className="text-xs ml-2 border-slate-200"
            >
              ↻ Refresh Map
            </Button>
          </div>
        </div>

        {/* Map Container */}
        {loading ? (
          <div className="h-[520px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
            <LoadingState message="Loading station coordinates and map layer..." />
          </div>
        ) : (
          <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-100 z-0">
            <MapContainer
              center={centerCoords}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {nodes.map((node) => {
                const nodeAlertsCount = activeAlerts.filter((a) => a.nodeId === node.nodeId).length;
                return (
                  <SensorNodeMarker
                    key={node.nodeId || node.id}
                    node={node}
                    latestReading={latestReading}
                    activeAlertsCount={nodeAlertsCount}
                  />
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* Stations Overview List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
          <h3 className="text-base font-bold text-slate-900 mb-4">Active Monitoring Station Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map((n) => (
              <div key={n.nodeId} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{n.name}</span>
                  <Badge variant={n.status === 'Online' ? 'safe' : 'caution'} size="sm">
                    {n.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">{n.location?.address || 'Indore Station'}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Coordinates: {n.location?.latitude?.toFixed(4)}, {n.location?.longitude?.toFixed(4)}
                </div>
                <Link
                  to={`/citizen/trends?nodeId=${encodeURIComponent(n.nodeId)}`}
                  className="text-xs font-bold text-cyan-600 hover:underline block pt-1"
                >
                  View Telemetry Data →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
