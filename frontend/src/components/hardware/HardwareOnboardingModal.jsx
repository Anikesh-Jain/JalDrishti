import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import api from '../../services/api';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from '../common/Icons';

/**
 * JalDrishti Citizen Device Onboarding & Integrated Setup Flow
 *
 * Implements the complete citizen flow:
 * 1. Initial Prompt: "Do you own a JalDrishti water-quality monitoring device?" (Yes / No / Not Sure)
 * 2. If "No": Explains AI water image screening and community station monitoring, continues to dashboard.
 * 3. If "Not sure": Explains ready-made appliance, lets citizen proceed with setup or continue without it.
 * 4. If "Yes" (or resume/revisit from Profile): Direct integrated 4-step setup flow:
 *    - Step 1: Pipeline Installation (explain sealed appliance, 3/4" pipe fitting, flow arrow, power plug; NO wire assembly)
 *    - Step 2: Device Claiming (secure claim secret verification via backend API, ownership lock)
 *    - Step 3: Wi-Fi Provisioning (SoftAP web portal / Blynk IoT App / Wi-Fi SSID registration)
 *    - Step 4: Live Verification (real connection diagnostics, Blynk cloud handshake, and live sensor readings)
 * 5. Resume incomplete setup capability and revisitable via Profile page without separate navigation routes.
 */
export default function HardwareOnboardingModal({ isOpen, initialStep = 'initial', onClose }) {
  const { user, updateHardwareOnboarding, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Primary view state: 'initial' | 'no_device' | 'not_sure' | 'resume' | 'setup'
  const [view, setView] = useState(initialStep);
  // Setup sub-step: 'install' | 'claim' | 'wifi' | 'verify'
  const [setupStep, setSetupStep] = useState('install');

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Device Claiming Form
  const [claimNodeId, setClaimNodeId] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [claimName, setClaimName] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Wi-Fi Provisioning Form
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiMethod, setWifiMethod] = useState('softap'); // 'softap' | 'blynk_edgent'
  const [wifiLoading, setWifiLoading] = useState(false);
  const [wifiSuccess, setWifiSuccess] = useState('');

  // Device telemetry & diagnostics data
  const [deviceData, setDeviceData] = useState(null);
  const [blynkData, setBlynkData] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // Sync initialStep when modal opens or initialStep prop changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialStep === 'install' || initialStep === 'claim' || initialStep === 'wifi' || initialStep === 'verify') {
      setView('setup');
      setSetupStep(initialStep);
    } else if (initialStep === 'resume') {
      setView('resume');
    } else if (initialStep === 'not_sure') {
      setView('not_sure');
    } else if (initialStep === 'no_device') {
      setView('no_device');
    } else {
      // If user previously selected 'yes' but hasn't claimed a device, default to resume or setup
      if (user?.hardwareOnboarding?.status === 'yes' && !user?.assignedNodeId) {
        setView('resume');
      } else {
        setView('initial');
      }
    }
    setError('');
    setSuccessMessage('');
  }, [isOpen, initialStep, user?.hardwareOnboarding?.status, user?.assignedNodeId]);

  // Load device and diagnostics data whenever entering setup or verify
  const loadDeviceDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const [resMyDevice, resBlynk] = await Promise.all([
        api.hardware.getMyDevice().catch(() => null),
        api.hardware.getBlynkStatus().catch(() => null)
      ]);
      if (resMyDevice) setDeviceData(resMyDevice);
      if (resBlynk && resBlynk.blynk) setBlynkData(resBlynk.blynk);
    } catch {
      // Fallback
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (view === 'setup' || view === 'resume')) {
      loadDeviceDiagnostics();
    }
  }, [isOpen, view, setupStep]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleSelectYes = async () => {
    setLoading(true);
    setError('');
    try {
      await updateHardwareOnboarding('yes');
      // If user already has claimed device, jump to verification; otherwise start with installation
      if (user?.assignedNodeId) {
        setSetupStep('verify');
      } else {
        setSetupStep('install');
      }
      setView('setup');
    } catch (err) {
      setError(err.message || 'Failed to record preference.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNo = async () => {
    setLoading(true);
    setError('');
    try {
      await updateHardwareOnboarding('no');
      setView('no_device');
    } catch (err) {
      setError(err.message || 'Failed to record preference.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNotSure = () => {
    setView('not_sure');
  };

  const handleDismissLater = async () => {
    setLoading(true);
    try {
      if (user?.hardwareOnboarding?.status === 'pending') {
        await updateHardwareOnboarding('not_sure');
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      if (onClose) onClose();
    }
  };

  // Device Claiming submission
  const handleClaimDevice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!claimNodeId.trim()) {
      setError('Device ID is required (found on the device barcode label).');
      return;
    }
    if (!claimCode.trim()) {
      setError('Claim Secret code is required (printed on your device security tag).');
      return;
    }

    setClaimLoading(true);
    try {
      const res = await api.hardware.claim({
        nodeId: claimNodeId.trim().toUpperCase(),
        claimCode: claimCode.trim(),
        name: claimName.trim() || undefined
      });

      setSuccessMessage(res.message || 'Device linked successfully!');
      if (refreshUser) await refreshUser();
      await loadDeviceDiagnostics();

      setTimeout(() => {
        setSuccessMessage('');
        setSetupStep('wifi');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to claim device. Please verify your claim secret.');
    } finally {
      setClaimLoading(false);
    }
  };

  // Wi-Fi Provisioning submission
  const handleWifiProvision = async (e) => {
    e.preventDefault();
    setError('');
    setWifiSuccess('');

    if (!wifiSsid.trim()) {
      setError('Please enter your 2.4 GHz Wi-Fi Network Name (SSID).');
      return;
    }

    const targetNodeId = deviceData?.device?.nodeId || user?.assignedNodeId;
    if (!targetNodeId) {
      setError('Please claim your device first before setting up Wi-Fi.');
      return;
    }

    setWifiLoading(true);
    try {
      await api.hardware.provisionWifi({
        nodeId: targetNodeId,
        ssid: wifiSsid.trim(),
        method: wifiMethod
      });

      setWifiSuccess(`Wi-Fi network "${wifiSsid.trim()}" registered. Continue to live verification.`);
      await loadDeviceDiagnostics();
    } catch (err) {
      setError(err.message || 'Failed to register Wi-Fi configuration.');
    } finally {
      setWifiLoading(false);
    }
  };

  // Unpair device
  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to unpair this JalDrishti device from your account?')) {
      return;
    }
    setLoading(true);
    try {
      await api.hardware.unpair();
      if (refreshUser) await refreshUser();
      await loadDeviceDiagnostics();
      setSetupStep('claim');
    } catch (err) {
      setError(err.message || 'Failed to unpair device.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for status badge
  const renderStatusBadge = (state) => {
    switch (state) {
      case 'receiving data':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Receiving Live Data
          </span>
        );
      case 'connected but not sending readings':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Connected — Awaiting Water Flow
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Device Offline
          </span>
        );
      case 'awaiting Wi-Fi setup':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#0284C7] border border-[#BAE6FD]">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping" />
            Awaiting Wi-Fi Setup
          </span>
        );
      case 'not configured':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Configured
          </span>
        );
    }
  };

  const currentDevice = deviceData?.device;
  const diagnostics = deviceData?.diagnostics || {
    state: currentDevice ? 'connected but not sending readings' : 'not configured',
    label: currentDevice ? 'Connected' : 'Not Configured',
    details: currentDevice ? 'Device linked to your account.' : 'No device linked yet.'
  };
  const latestReading = deviceData?.latestReading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md border border-[#BAE6FD] rounded-3xl shadow-2xl p-5 sm:p-7 text-[#1E293B] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Subtle decorative top aqua gradient wave */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#BAE6FD]" />

        {/* Top Header Row with Close / Back Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5F6FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
            <span>JalDrishti Ready-Made Sensor Setup</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Global Error / Success Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-1">✕</button>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 shrink-0">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1 font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">

          {/* ============================================================ */}
          {/* VIEW 1: Initial 3-Choice Prompt (Signup/Login Entry Point)  */}
          {/* ============================================================ */}
          {view === 'initial' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Do you have a JalDrishti ready-made sensor device?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                  JalDrishti uses an all-in-one, factory-calibrated inline sensor unit that mounts directly into your household or community water pipeline. Let us know so we can guide your setup.
                </p>
              </div>

              {/* Three Option Cards */}
              <div className="space-y-3">
                {/* Option 1: Yes */}
                <button
                  type="button"
                  onClick={handleSelectYes}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-2xl border-2 border-[#BAE6FD] bg-[#F0FAFF]/60 hover:bg-[#E0F7FF] hover:border-[#0284C7] transition-all group flex items-start gap-4 shadow-xs cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#0284C7]/30 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                        Yes, I have a device
                      </span>
                      <span className="text-xs font-bold text-[#0284C7] opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Setup →
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      I have the ready-made pipeline monitor and want to connect it to Wi-Fi and view live readings.
                    </p>
                  </div>
                </button>

                {/* Option 2: No */}
                <button
                  type="button"
                  onClick={handleSelectNo}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group flex items-start gap-4 shadow-xs cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        No, I don't have a device
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      I want to view community water quality trends and use AI image screening without a hardware device.
                    </p>
                  </div>
                </button>

                {/* Option 3: Not sure */}
                <button
                  type="button"
                  onClick={handleSelectNotSure}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group flex items-start gap-4 shadow-xs cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Not sure / Tell me more
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      What is the ready-made JalDrishti device, and how does it integrate into my home?
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                <span>Hardware is optional for citizens</span>
                <button
                  type="button"
                  onClick={handleDismissLater}
                  className="font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Decide later
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: Resume Incomplete Setup Prompt                       */}
          {/* ============================================================ */}
          {view === 'resume' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F6FF] text-[#0284C7] flex items-center justify-center border border-[#BAE6FD]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Resume Device Setup</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Welcome back! You previously indicated you have a JalDrishti monitoring unit.
                  {user?.assignedNodeId
                    ? ` Your device (${user.assignedNodeId}) is claimed. Would you like to check connection diagnostics or finish Wi-Fi configuration?`
                    : ' Finish claiming your device and connecting it to Wi-Fi to unlock continuous live readings.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Device Ownership:</span>
                  <span className="font-bold text-[#0284C7]">Declared Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Claimed Station ID:</span>
                  <span className="font-mono font-bold text-slate-900">{user?.assignedNodeId || 'Not yet claimed'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Live Status:</span>
                  {renderStatusBadge(diagnostics.state)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setView('setup');
                    if (user?.assignedNodeId) {
                      setSetupStep('verify');
                    } else {
                      setSetupStep('install');
                    }
                  }}
                  className="flex-1 text-xs"
                >
                  Continue Setup Flow →
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-xs"
                >
                  Do This Later
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: "No Device" Info (Retain AI Image Screening)         */}
          {/* ============================================================ */}
          {view === 'no_device' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Preference Saved</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  You do not need hardware to benefit from JalDrishti. You retain full access to community water monitoring:
                </p>
                <ul className="mt-3 space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] mt-1 shrink-0" />
                    <span><strong>AI Water Image Screening:</strong> Take a photo of tap or container water to screen clarity, color anomalies, and physical turbidity index.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] mt-1 shrink-0" />
                    <span><strong>Community Sensor Map:</strong> View real-time telemetry from nearby municipal stations and verified neighbor pipeline nodes.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] mt-1 shrink-0" />
                    <span><strong>Water Safety Reports:</strong> View and export municipal water compliance and historical trends.</span>
                  </li>
                </ul>

                <div className="mt-3.5 p-3 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD] text-[11px] text-[#0369A1]">
                  💡 If you acquire a ready-made JalDrishti pipeline monitor in the future, you can launch setup anytime from your <strong>Profile Settings</strong>.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/citizen/image-screening');
                  }}
                  className="flex-1 text-xs"
                >
                  Try AI Image Screening →
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/citizen');
                  }}
                  className="text-xs"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: "Not Sure / Tell Me More" Explanation                 */}
          {/* ============================================================ */}
          {view === 'not_sure' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F6FF] text-[#0284C7] flex items-center justify-center border border-[#BAE6FD]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">About the Ready-Made JalDrishti Device</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  The JalDrishti monitor is an <strong>all-in-one, factory-calibrated inline appliance</strong> designed for household and community pipelines:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  <div className="p-3 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]">
                    <span className="text-[10px] font-bold text-[#0284C7] block uppercase tracking-wide">Continuous Sensing</span>
                    <span className="text-xs font-semibold text-slate-900">Pre-calibrated pH, Turbidity, TDS & Temperature sensors</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]">
                    <span className="text-[10px] font-bold text-[#0284C7] block uppercase tracking-wide">No Wire Assembly</span>
                    <span className="text-xs font-semibold text-slate-900">Standard 3/4" plumbing pipe fitting with barrel power plug</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Citizens do <strong>not</strong> build electronics, solder components, or connect bare wires. You simply thread the appliance into your plumbing line, plug it into power, and connect it to Wi-Fi.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="primary"
                  onClick={handleSelectYes}
                  loading={loading}
                  className="flex-1 text-xs"
                >
                  Proceed with Device Setup →
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSelectNo}
                  loading={loading}
                  className="flex-1 text-xs"
                >
                  Continue without Device
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismissLater}
                  className="text-xs text-slate-500"
                >
                  Decide Later
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: Integrated 4-Step Device Setup Flow                  */}
          {/* ============================================================ */}
          {view === 'setup' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Stepper Navigation Bar */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
                {[
                  { id: 'install', label: '1. Pipeline Install' },
                  { id: 'claim', label: '2. Claim Device' },
                  { id: 'wifi', label: '3. Wi-Fi Setup' },
                  { id: 'verify', label: '4. Live Verification' }
                ].map((s) => {
                  const isActive = setupStep === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSetupStep(s.id)}
                      className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-bold transition-all cursor-pointer truncate ${
                        isActive
                          ? 'bg-white text-[#0284C7] shadow-xs border border-[#BAE6FD]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* -------------------------------------------------- */}
              {/* SETUP STEP 1: Pipeline Installation               */}
              {/* -------------------------------------------------- */}
              {setupStep === 'install' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Step 1: Mount Appliance in Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The JalDrishti unit is fully pre-assembled. No electronics assembly or wire splicing required.
                    </p>
                  </div>

                  {/* 4 Installation Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E5F6FF] text-[#0284C7] font-bold text-xs flex items-center justify-center">
                        1
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Standard 3/4" Thread Fitting</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Shut off your main water valve. Thread the appliance into your 3/4" pipe section. Use Teflon tape on threads for a watertight seal.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E5F6FF] text-[#0284C7] font-bold text-xs flex items-center justify-center">
                        2
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Observe Flow Direction</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Look for the embossed water-flow arrow on the casing. Align the arrow with the direction water travels through your pipe.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E5F6FF] text-[#0284C7] font-bold text-xs flex items-center justify-center">
                        3
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Plug In Power Adapter</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Plug the included power adapter into a standard wall outlet and connect the barrel plug. The power LED will light solid blue.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E5F6FF] text-[#0284C7] font-bold text-xs flex items-center justify-center">
                        4
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Restore Water Flow</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Reopen the main valve slowly. Inspect for leaks around threads. The pre-calibrated sensing chamber is now operational.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Factory sealed & calibrated. pH, Turbidity, TDS, and Temperature probes are already inside.</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      onClick={() => setSetupStep('claim')}
                      className="text-xs px-5"
                    >
                      Next: Claim Device →
                    </Button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* SETUP STEP 2: Device Claiming                      */}
              {/* -------------------------------------------------- */}
              {setupStep === 'claim' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Step 2: Claim Your Ready-Made Device
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify ownership by entering the unique Device ID and Claim Secret printed on your physical unit.
                    </p>
                  </div>

                  {/* If user already has a claimed device */}
                  {currentDevice ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{currentDevice.name}</h4>
                            <span className="text-[11px] font-mono text-slate-500">ID: {currentDevice.nodeId}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-700 border border-emerald-300">
                          Linked to Your Account
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        This unit is claimed and bound to your citizen account. You can continue directly to Wi-Fi setup or unpair it to switch units.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          onClick={() => setSetupStep('wifi')}
                          className="text-xs"
                        >
                          Continue to Wi-Fi Setup →
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleUnpair}
                          loading={loading}
                          className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                        >
                          Unpair Device
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Claim Form */
                    <form onSubmit={handleClaimDevice} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Device Station ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={claimNodeId}
                          onChange={(e) => setClaimNodeId(e.target.value.toUpperCase())}
                          placeholder="e.g. NODE_001"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-white focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                          required
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Located on the barcode label on top of your JalDrishti appliance.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Claim Secret Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={claimCode}
                          onChange={(e) => setClaimCode(e.target.value)}
                          placeholder="e.g. CLAIM_SECRET_2026"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                          required
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Printed on the tamper-evident security seal on the underside of the unit.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Friendly Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={claimName}
                          onChange={(e) => setClaimName(e.target.value)}
                          placeholder="e.g. Kitchen Main Pipeline"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setSetupStep('install')}
                          type="button"
                          className="text-xs text-slate-500"
                        >
                          ← Back to Install
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          loading={claimLoading}
                          className="text-xs px-5"
                        >
                          Verify & Claim Device →
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* SETUP STEP 3: Wi-Fi Provisioning                   */}
              {/* -------------------------------------------------- */}
              {setupStep === 'wifi' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Step 3: Connect Device to Wi-Fi
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Connect your appliance to your 2.4 GHz home network so it can stream data to Blynk and JalDrishti.
                    </p>
                  </div>

                  {/* Provisioning Methods Tabs */}
                  <div className="space-y-3">
                    {/* Method 1: SoftAP Web Portal */}
                    <div className="p-4 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F6FF] text-[#0284C7] border border-[#BAE6FD]">
                          Method A (Direct)
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">SoftAP Smartphone Web Portal</h4>
                      </div>
                      <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1 font-medium">
                        <li>On your phone or laptop, look for the Wi-Fi network named <strong>JalDrishti-Setup-XXXX</strong>.</li>
                        <li>Connect to it (password printed on your device label, default: <code>jaldrishti123</code>).</li>
                        <li>Open any browser and navigate to <strong>http://192.168.4.1</strong>.</li>
                        <li>Select your home 2.4 GHz Wi-Fi, enter password, and tap Save. The device connects automatically.</li>
                      </ol>
                    </div>

                    {/* Method 2: Blynk IoT App */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          Method B (Blynk App)
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Blynk IoT Mobile App Provisioning</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Open the <strong>Blynk IoT</strong> app on iOS or Android, tap <em>+ Add Device</em>, select <em>Find Nearby Devices</em>, and select your JalDrishti unit via Bluetooth/Wi-Fi Edgent.
                      </p>
                    </div>

                    {/* Method 3: Cloud SSID Registration */}
                    <form onSubmit={handleWifiProvision} className="p-4 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Register Wi-Fi Network Name in JalDrishti</span>
                        <span className="text-[10px] text-slate-400">Target: {currentDevice?.nodeId || user?.assignedNodeId || 'Claimed Unit'}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="Your 2.4 GHz Wi-Fi SSID"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#0284C7]"
                        />
                        <Button
                          variant="primary"
                          type="submit"
                          loading={wifiLoading}
                          className="text-xs shrink-0"
                        >
                          Record SSID
                        </Button>
                      </div>
                      {wifiSuccess && (
                        <p className="text-[11px] text-emerald-700 font-semibold">{wifiSuccess}</p>
                      )}
                    </form>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setSetupStep('claim')}
                      className="text-xs text-slate-500"
                    >
                      ← Back to Claim
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setSetupStep('verify')}
                      className="text-xs px-5"
                    >
                      Next: Verify Connection & Readings →
                    </Button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* SETUP STEP 4: Live Verification & Sensor Readings  */}
              {/* -------------------------------------------------- */}
              {setupStep === 'verify' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Step 4: Live Connection & Sensor Stream
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verifying real connectivity with Blynk Cloud and reading live calibrated telemetry.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadDeviceDiagnostics}
                      loading={diagnosticsLoading}
                      className="text-xs border-[#BAE6FD] text-[#0284C7]"
                    >
                      ↻ Refresh Status
                    </Button>
                  </div>

                  {/* Real Diagnostics Status Card */}
                  <div className="p-4 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Pipeline Device:</span>
                        <strong className="text-xs font-mono text-slate-900">
                          {currentDevice?.name || 'Linked Unit'} ({currentDevice?.nodeId || user?.assignedNodeId || 'None'})
                        </strong>
                      </div>
                      {renderStatusBadge(diagnostics.state)}
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-medium">{diagnostics.details}</p>
                      {diagnostics.action && (
                        <p className="text-[#0284C7] font-semibold mt-1">Action: {diagnostics.action}</p>
                      )}
                    </div>

                    {/* Blynk Integration Cloud Handshake Info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                      <span>Blynk Cloud: <strong>{blynkData?.status || 'Configured'}</strong></span>
                      <span>Template: <code>{blynkData?.templateId || 'TMPL_JAL_DRISHTI'}</code></span>
                      <span>Datastreams: <code>V0 (pH), V1 (Turb), V2 (TDS), V3 (Temp)</code></span>
                    </div>
                  </div>

                  {/* Real Sensor Readings Section */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0FAFF] to-white border border-[#BAE6FD] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Calibrated Sensor Telemetry
                      </span>
                      {latestReading && (
                        <span className="text-[10px] text-slate-400">
                          Last received: {new Date(latestReading.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    {latestReading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* pH Card */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">pH Level</span>
                          <span className="text-xl font-black text-slate-900 block my-0.5">
                            {Number(latestReading.pH || 7.0).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">Safe (6.5 - 8.5)</span>
                        </div>

                        {/* Turbidity Card */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Turbidity</span>
                          <span className="text-xl font-black text-slate-900 block my-0.5">
                            {Number(latestReading.turbidity || 0).toFixed(1)} <span className="text-xs font-normal">NTU</span>
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">Clear (&lt; 5.0)</span>
                        </div>

                        {/* TDS Card */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">TDS</span>
                          <span className="text-xl font-black text-slate-900 block my-0.5">
                            {Math.round(latestReading.tds || 0)} <span className="text-xs font-normal">ppm</span>
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">Good (&lt; 300)</span>
                        </div>

                        {/* Temperature Card */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Temperature</span>
                          <span className="text-xl font-black text-slate-900 block my-0.5">
                            {Number(latestReading.temperature || 0).toFixed(1)} <span className="text-xs font-normal">°C</span>
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">Normal</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-sky-50 text-[#0284C7] mx-auto flex items-center justify-center animate-spin">
                          ↻
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Awaiting First Live Telemetry Stream
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Turn on your household tap for 10-15 seconds so water flows through the sensor chamber. The ESP32 unit will transmit calibrated readings automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setSetupStep('wifi')}
                      className="text-xs text-slate-500"
                    >
                      ← Back to Wi-Fi
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (onClose) onClose();
                        navigate('/citizen');
                      }}
                      className="text-xs px-6 font-bold"
                    >
                      Complete Setup & Finish →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
