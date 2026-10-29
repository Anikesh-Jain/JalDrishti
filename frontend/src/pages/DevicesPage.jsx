import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import CitizenLayout from '../layouts/CitizenLayout';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DemoBadge from '../components/common/DemoBadge';
import { DEMO_STATIONS } from '../utils/demoData';
import api from '../services/api';

/**
 * JalDrishti IoT Device & Sensor Station Management Page
 *
 * Implements real station management with MongoDB persistence:
 * - Admin: Register new stations, update status/metadata, decommission stations
 * - Citizen: View verified station hardware topology and sensor telemetry health
 */
export default function DevicesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const Layout = isAdmin ? AdminLayout : CitizenLayout;

  const [stations, setStations] = useState(DEMO_STATIONS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Modal State for Add Station
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addNodeId, setAddNodeId] = useState('');
  const [addName, setAddName] = useState('');
  const [addLat, setAddLat] = useState('22.7196');
  const [addLng, setAddLng] = useState('75.8577');
  const [addAddress, setAddAddress] = useState('');
  const [addStatus, setAddStatus] = useState('Online');
  const [addDeviceKey, setAddDeviceKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Modal State for Edit Station
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('Online');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load registered sensor stations from backend
  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.sensor.getNodes();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStations(res.data);
        setIsDemo(false);
      } else {
        setStations(DEMO_STATIONS);
        setIsDemo(true);
      }
    } catch (err) {
      setStations(DEMO_STATIONS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Handle Register New Station (Admin-only)
  const handleCreateStation = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!addNodeId.trim()) {
      setAddError('Node ID is required.');
      return;
    }
    if (!addName.trim()) {
      setAddError('Station name is required.');
      return;
    }

    const lat = parseFloat(addLat);
    const lng = parseFloat(addLng);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      setAddError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    setIsAdding(true);
    try {
      await api.sensor.createNode({
        nodeId: addNodeId.trim().toUpperCase(),
        name: addName.trim(),
        location: {
          latitude: lat,
          longitude: lng,
          address: addAddress.trim()
        },
        status: addStatus,
        deviceKey: addDeviceKey.trim() || undefined
      });

      setIsAddOpen(false);
      setAddNodeId('');
      setAddName('');
      setAddAddress('');
      setAddDeviceKey('');
      setActionSuccess('Station registered successfully.');
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchStations();
    } catch (err) {
      setAddError(err.message || 'Failed to register station.');
    } finally {
      setIsAdding(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (node) => {
    setEditNode(node);
    setEditName(node.name || '');
    setEditLat(node.location?.latitude !== null && node.location?.latitude !== undefined ? String(node.location.latitude) : '');
    setEditLng(node.location?.longitude !== null && node.location?.longitude !== undefined ? String(node.location.longitude) : '');
    setEditAddress(node.location?.address || '');
    setEditStatus(node.status || 'Online');
    setEditError('');
    setIsEditOpen(true);
  };

  // Handle Update Station (Admin-only)
  const handleUpdateStation = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Station name is required.');
      return;
    }

    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      setEditError('Please enter valid coordinates.');
      return;
    }

    setIsEditing(true);
    try {
      await api.sensor.updateNode(editNode.nodeId, {
        name: editName.trim(),
        status: editStatus,
        location: {
          latitude: lat,
          longitude: lng,
          address: editAddress.trim()
        }
      });

      setIsEditOpen(false);
      setActionSuccess(`Station ${editNode.nodeId} updated successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchStations();
    } catch (err) {
      setEditError(err.message || 'Failed to update station.');
    } finally {
      setIsEditing(false);
    }
  };

  // Handle Decommission Station (Admin-only)
  const handleDeleteStation = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await api.sensor.deleteNode(deleteTarget.nodeId);
      setDeleteTarget(null);
      setActionSuccess(`Station ${deleteTarget.nodeId} decommissioned successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchStations();
    } catch (err) {
      alert(`Failed to delete station: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="IoT Device & Sensor Stations"
        description="Monitor ESP32-S3 sensor hardware topology, operational connectivity, and station deployment"
        badge={<Badge variant="info" size="sm">Multi-Node Telemetry</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
            {isDemo && <DemoBadge size="sm" label="Simulated Fleet" />}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStations}
              isLoading={loading}
              className="text-xs"
            >
              Refresh Stations
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs"
              >
                + Register Station
              </Button>
            )}
          </div>
        }
      />

      {/* Demo Data Fallback Notice */}
      {isDemo && (
        <div className="my-4">
          <DemoBadge
            variant="banner"
            message="Simulated Station Fleet: Displaying 4 calibrated Indore monitoring nodes. Registered live ESP32-S3 devices will automatically replace simulated stations."
          />
        </div>
      )}

      {/* Action Success Banner */}
      {actionSuccess && (
        <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Hardware Status Notice */}
      <div className="my-6 p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start space-x-3 text-xs text-sky-900">
        <div className="p-1.5 bg-sky-100 rounded-lg text-sky-700 shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-sky-950">
            Hardware Verification & Deployment Architecture
          </p>
          <p className="text-sky-800 leading-relaxed">
            The telemetry ingestion engine (REST <code className="bg-sky-200/60 px-1 py-0.5 rounded font-mono">POST /api/sensor/readings</code>)
            ingests multi-parameter sensor vectors in real time. Station configurations and operational statuses are persisted directly to MongoDB and monitored across all live dashboard surfaces.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Registered Stations</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stations.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">ESP32-S3 Microcontroller Nodes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Online Stations</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {stations.filter((s) => s.status === 'Online').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active Telemetry Ingestion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Sensor Probes per Node</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">4 Sensors</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">pH, Turbidity, TDS, Temp</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Ingestion Protocol</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">HTTPS / JSON</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Device-Key Authenticated</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium mb-6">
          {error}
        </div>
      )}

      {/* Stations List */}
      <div className="space-y-4">
        {loading && stations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading sensor station inventory...</p>
          </div>
        ) : stations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No sensor stations registered yet.</p>
            {isAdmin && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-3 text-xs font-semibold text-cyan-600 hover:underline"
              >
                Click here to register the first station
              </button>
            )}
          </div>
        ) : (
          stations.map((st) => (
            <div
              key={st.nodeId || st.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 font-bold shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{st.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {st.nodeId}
                      </span>
                      <span className="text-xs text-slate-400">
                        {st.location?.address || `${st.location?.latitude?.toFixed(4)}° N, ${st.location?.longitude?.toFixed(4)}° E`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {isDemo && <DemoBadge size="xs" label="Simulated Node" />}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      st.status === 'Online'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : st.status === 'Maintenance'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    &bull; {st.status}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(st)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(st)}
                        className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        Decommission
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Microcontroller</span>
                  <span className="font-semibold text-slate-800">ESP32-S3 Dual-Core</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Coordinates</span>
                  <span className="font-mono font-medium text-slate-700">
                    {st.location?.latitude ? `${st.location.latitude.toFixed(4)}°, ${st.location.longitude?.toFixed(4)}°` : 'Pending GPS'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Attached Probes</span>
                  <span className="font-semibold text-slate-800">pH, Turbidity, TDS, Temp</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Heartbeat Ingestion</span>
                  <span className="font-medium text-slate-600">
                    {st.lastSeen ? new Date(st.lastSeen).toLocaleTimeString() : 'Awaiting telemetry'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Station Modal (Admin Only) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-[#163344]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#BAE6FD] shadow-xl max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Sensor Station</h3>
            <p className="text-xs text-slate-500 mb-5">
              Add a physical IoT node to the water monitoring telemetry network
            </p>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateStation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Node ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addNodeId}
                    onChange={(e) => setAddNodeId(e.target.value.toUpperCase())}
                    placeholder="e.g. NODE_04"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Station Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Station 4 - Yashwant Sagar Reservoir"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={addLat}
                    onChange={(e) => setAddLat(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={addLng}
                    onChange={(e) => setAddLng(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Address / Description
                </label>
                <input
                  type="text"
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="e.g. Yashwant Sagar Dam Water Treatment Facility"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Device Authentication Secret Key (Optional)
                </label>
                <input
                  type="password"
                  value={addDeviceKey}
                  onChange={(e) => setAddDeviceKey(e.target.value)}
                  placeholder="Leave empty for auto-generated SHA-256 token"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAdding}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Register Station
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Station Modal (Admin Only) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-[#163344]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#BAE6FD] shadow-xl max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Edit Station: {editNode?.nodeId}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Update operational station metadata and telemetry status
            </p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateStation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Station Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  <option value="Online">Online</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isEditing}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin Only) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#163344]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#BAE6FD] shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Decommission Station?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to decommission <strong className="text-slate-800">{deleteTarget.name} ({deleteTarget.nodeId})</strong>?
              Live telemetry ingestion for this station will be terminated.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDeleteStation}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Decommission
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
