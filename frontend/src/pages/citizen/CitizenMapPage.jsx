import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CitizenLayout from '../../layouts/CitizenLayout';
import SensorNodeMarker from '../../components/map/SensorNodeMarker';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DemoBadge from '../../components/common/DemoBadge';
import LoadingState from '../../components/feedback/LoadingState';
import api from '../../services/api';
import {
  DEMO_STATIONS,
  DEMO_LATEST_READING,
  DEMO_LATEST_READINGS_BY_NODE,
  DEMO_ALERTS
} from '../../utils/demoData';

/**
 * JalDrishti Live GIS Map Page
 *
 * Implements:
 * - Header: "Live Map / Monitor all water quality stations across locations"
 * - Legend: ● Safe  ● Caution  ● Unsafe  ● Offline
 * - OpenStreetMap container with interactive pins and popup cards
 * - Real-time readings and alerts overlay
 * - Synchronized fallback to the 4 calibrated Indore monitoring stations
 */
export default function CitizenMapPage() {
  const [nodes, setNodes] = useState(DEMO_STATIONS);
  const [latestReading, setLatestReading] = useState(DEMO_LATEST_READING);
  const [activeAlerts, setActiveAlerts] = useState(() => DEMO_ALERTS.filter((a) => a.status === 'Active'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  const loadMapData = async () => {
    try {
      const [nodesRes, latestRes, alertsRes] = await Promise.all([
        api.sensor.getNodes().catch(() => ({ data: [] })),
        api.nodes.getLatestReading().catch(() => ({ data: null })),
        api.alerts.getActive().catch(() => ({ data: [] }))
      ]);

      const realNodes = nodesRes?.data && Array.isArray(nodesRes.data) && nodesRes.data.length > 0
        ? nodesRes.data
        : DEMO_STATIONS;

      const usingDemo = !nodesRes?.data || nodesRes.data.length === 0;
      setIsDemo(usingDemo);
      setNodes(realNodes);
      setLatestReading(latestRes?.data || DEMO_LATEST_READING);
      setActiveAlerts(
        alertsRes?.data && Array.isArray(alertsRes.data) && alertsRes.data.length > 0
          ? alertsRes.data
          : DEMO_ALERTS.filter((a) => a.status === 'Active')
      );
    } catch {
      setNodes(DEMO_STATIONS);
      setLatestReading(DEMO_LATEST_READING);
      setActiveAlerts(DEMO_ALERTS.filter((a) => a.status === 'Active'));
      setIsDemo(true);
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

  // Indore central reference coordinate [22.7196, 75.8577]
  const indoreCenter = [22.7196, 75.8577];

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {isDemo && (
          <DemoBadge variant="banner" />
        )}

        {/* Header with Title and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live GIS Station Map</h1>
              {isDemo && <DemoBadge text="Simulated Fleet" />}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Geospatial distribution and real-time status of water quality monitoring stations in Indore
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
              center={indoreCenter}
              zoom={12}
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
                const nodeReading = (isDemo && DEMO_LATEST_READINGS_BY_NODE[node.nodeId])
                  ? DEMO_LATEST_READINGS_BY_NODE[node.nodeId]
                  : (node.nodeId === latestReading?.nodeId ? latestReading : DEMO_LATEST_READINGS_BY_NODE[node.nodeId] || latestReading);

                return (
                  <SensorNodeMarker
                    key={node.nodeId || node.id}
                    node={node}
                    latestReading={nodeReading}
                    activeAlertsCount={nodeAlertsCount}
                  />
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* Stations Overview List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Monitoring Station Directory</h3>
              <p className="text-xs text-slate-500">Regional sensor nodes broadcasting telemetry</p>
            </div>
            {isDemo && <DemoBadge text="4 Stations Active" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map((n) => {
              const nodeReading = (isDemo && DEMO_LATEST_READINGS_BY_NODE[n.nodeId])
                ? DEMO_LATEST_READINGS_BY_NODE[n.nodeId]
                : latestReading;
              const isCaution = n.overallStatus === 'Caution' || nodeReading?.overallStatus === 'Caution';

              return (
                <div key={n.nodeId} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate" title={n.name}>{n.name}</span>
                      <Badge variant={isCaution ? 'caution' : (n.status === 'Online' ? 'safe' : 'neutral')} size="sm">
                        {isCaution ? 'Caution' : n.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{n.location?.address || 'Indore Station'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Coords: {n.location?.latitude?.toFixed(4)}, {n.location?.longitude?.toFixed(4)}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-600 font-medium">Turbidity:</span>
                      <span className={`font-mono font-bold ${nodeReading?.turbidity > 5.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {typeof nodeReading?.turbidity === 'number' ? `${nodeReading.turbidity.toFixed(2)} NTU` : '—'}
                      </span>
                    </div>
                    <Link
                      to={`/citizen/trends?nodeId=${encodeURIComponent(n.nodeId)}`}
                      className="text-xs font-bold text-[#0284C7] hover:underline block pt-2"
                    >
                      View Telemetry Trends →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
