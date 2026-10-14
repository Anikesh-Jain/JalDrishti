import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import LoadingState from '../../components/feedback/LoadingState';
import useAdminSettings from '../../hooks/useAdminSettings';
import { ThresholdSettings, NotificationSettings } from '../../components/admin/settings';
import ContactInquiryManagement from '../../components/admin/ContactInquiryManagement';

/**
 * JalDrishti Settings & Thresholds Page
 * 
 * Distinct destination from My Profile.
 * Focuses strictly on:
 * - Water Quality Parameter Thresholds & Safety Limits (pH, Turbidity, TDS, Temperature)
 * - Automated Alert Dispatch & Emergency Notification Gateway Configuration
 * - Application Preferences & Telemetry Refresh Rates
 * 
 * Enforces role-based permissions:
 * - Admin: Full editing and persistence to backend via PUT /api/thresholds/:parameter
 * - Citizen: Informative view of standard limits and citizen notification preferences
 */
export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'thresholds';

  const isAdmin = user?.role === 'Admin';
  const Layout = isAdmin ? AdminLayout : CitizenLayout;

  // Citizen preference state
  const [inAppSound, setInAppSound] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [citizenSaveSuccess, setCitizenSaveSuccess] = useState(false);

  // Application telemetry refresh preferences
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);

  // Admin threshold & notification hook (only enabled for Admin role)
  const {
    thresholds,
    notificationConfig,
    loading: adminLoading,
    error: adminError,
    savingThreshold,
    savingNotification,
    actionFeedback,
    saveThreshold,
    saveNotificationConfig,
    refetch: refetchAdminSettings
  } = useAdminSettings({ enabled: isAdmin });

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleSaveCitizenPrefs = () => {
    setCitizenSaveSuccess(true);
    setTimeout(() => setCitizenSaveSuccess(false), 3500);
  };

  const handleSavePreferences = () => {
    setPrefSaveSuccess(true);
    setTimeout(() => setPrefSaveSuccess(false), 3500);
  };

  return (
    <Layout>
      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Thresholds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure telemetry safety thresholds, alert dispatch rules, and system preferences
          </p>
        </div>

        {/* Link shortcut to My Profile */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
          </svg>
          <span>Manage User Profile</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Settings Tabs">
          {[
            { id: 'thresholds', label: 'Water Quality Thresholds' },
            { id: 'notifications', label: 'Alert Notifications' },
            { id: 'preferences', label: 'System Preferences' },
            ...(isAdmin ? [{ id: 'inquiries', label: 'Contact Inquiries' }] : [])
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-${tab.id}-btn`}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-all ${
                  isActive
                    ? 'border-cyan-600 text-cyan-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Water Quality Thresholds */}
      {currentTab === 'thresholds' && (
        <div className="space-y-6">
          {isAdmin ? (
            adminLoading && thresholds.length === 0 ? (
              <LoadingState message="Loading telemetry thresholds from database..." />
            ) : adminError ? (
              <ErrorState message={adminError} onRetry={refetchAdminSettings} />
            ) : (
              <ThresholdSettings
                thresholds={thresholds}
                onSaveThreshold={saveThreshold}
                savingThreshold={savingThreshold}
                actionFeedback={actionFeedback}
              />
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  National Drinking Water Standards (BIS IS 10500:2012)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard baseline permissible ranges used by the early-warning telemetry engine
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Potential of Hydrogen (pH)</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      Safe: 6.5 – 8.5 pH
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Indicates acidic or alkaline water condition. Readings below 6.5 or above 8.5 trigger priority alert dispatch.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Turbidity (Water Clarity)</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      Safe: &le; 5.0 NTU
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Measures suspended particulate scattering. Values exceeding 5.0 NTU indicate sediment contamination.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Total Dissolved Solids (TDS)</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      Safe: &le; 500 ppm
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Concentration of dissolved minerals and salts. High concentrations affect palatability and safety.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Water Temperature</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      Safe: 10°C – 30°C
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Thermal stability envelope for ecological equilibrium and bacterial resistance.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Administrator Role Required:</strong> Calibration and operational limits can only be altered by authorized system administrators with role-based credentials.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Alert Notifications */}
      {currentTab === 'notifications' && (
        <div className="space-y-6">
          {isAdmin ? (
            <NotificationSettings
              config={notificationConfig}
              onSaveConfig={saveNotificationConfig}
              isSaving={savingNotification}
              feedback={actionFeedback}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Citizen Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive water quality breach alerts</p>
              </div>

              {citizenSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Notification preferences saved.</span>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">In-App Audio & Visual Banners</p>
                    <p className="text-xs text-slate-500">Play alert sound when active water quality breaches occur</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppSound}
                    onChange={(e) => setInAppSound(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Emergency SMS Alerts</p>
                    <p className="text-xs text-slate-500">Receive SMS dispatches when municipal sources become hazardous</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  onClick={handleSaveCitizenPrefs}
                  variant="primary"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm"
                >
                  Save Notification Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Preferences */}
      {currentTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Application Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customize interface preferences and live telemetry polling</p>
          </div>

          {prefSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Preferences saved successfully.</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#BAE6FD] bg-[#F0FAFF]">
              <div>
                <p className="text-sm font-semibold text-[#163344]">Navigation Theme</p>
                <p className="text-xs text-[#547181]">Fresh Water-Blue identity with aqua surfaces & soft blue accents</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#E0F7FF] text-[#0369A1] border border-[#BAE6FD]">Water-Blue (Default)</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-800">Telemetry Live Polling Rate</p>
                <p className="text-xs text-slate-500">Poll live sensor readings every {refreshInterval} seconds</p>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds (Default)</option>
                <option value="60">60 seconds</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              onClick={handleSavePreferences}
              variant="primary"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Contact Inquiries (Admin Only) */}
      {isAdmin && currentTab === 'inquiries' && (
        <div className="space-y-6">
          <ContactInquiryManagement />
        </div>
      )}
    </Layout>
  );
}
