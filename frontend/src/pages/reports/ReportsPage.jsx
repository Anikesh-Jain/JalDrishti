import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useReports from '../../hooks/useReports';
import AdminLayout from '../../layouts/AdminLayout';
import CitizenLayout from '../../layouts/CitizenLayout';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DemoBadge from '../../components/common/DemoBadge';
import { ReportCard } from '../../components/reports';

/**
 * JalDrishti Phase 21: ReportsPage
 *
 * Dedicated reporting interface providing authenticated export of:
 * 1. Historical Sensor Telemetry (Reading Report)
 * 2. Alert History Logs (Alert Report)
 *
 * Accessible to both Administrator and Citizen roles.
 * Adapts layout dynamically based on current user role.
 */
export default function ReportsPage() {
  const { user } = useAuth();
  const {
    // Readings
    readingFilters,
    updateReadingFilter,
    readingsData,
    readingsLoading,
    readingsError,
    isExportingReadings,
    exportReadingsSuccess,
    exportReadingsError,
    exportReadingsCsv,
    refetchReadings,

    // Alerts
    alertFilters,
    updateAlertFilter,
    alertsData,
    alertsLoading,
    alertsError,
    isExportingAlerts,
    exportAlertsSuccess,
    exportAlertsError,
    exportAlertsCsv,
    refetchAlerts,

    // Shared
    refetchAll
  } = useReports();

  const isAdmin = user?.role === 'Admin';
  const Layout = isAdmin ? AdminLayout : CitizenLayout;
  const isDemo = readingsData[0]?.isDemo || alertsData[0]?.isDemo;

  return (
    <Layout>
      {/* 1. Page Header */}
      <PageHeader
        title="Reporting & Data Export"
        description="Generate and export tabular CSV datasets of historical water quality telemetry and threshold breach alerts."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              Tabular Export (FR-16)
            </Badge>
            {isDemo && <DemoBadge text="Simulated Dataset" />}
          </div>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={readingsLoading || alertsLoading}
            isLoading={readingsLoading && alertsLoading}
            className="text-xs"
          >
            Refresh Data
          </Button>
        }
      />

      {isDemo && (
        <div className="mt-4">
          <DemoBadge variant="banner" />
        </div>
      )}

      {/* 2. Educational & Prototype Operational Notice */}
      <div className="my-6 p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start space-x-3 text-xs text-sky-900">
        <div className="p-1.5 bg-sky-100 rounded-lg text-sky-700 flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-sky-950">
            Authoritative Telemetry Export Pipeline
          </p>
          <p className="text-sky-800 leading-relaxed">
            All exported CSV files conform strictly to <strong>RFC 4180</strong> specifications with special-character escaping.
            Queries are bounded to safe limits (up to 1,000 records per export) to maintain responsive server operation.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Historical Readings Report */}
        <section aria-labelledby="readings-report-heading">
          <ReportCard
            type="readings"
            title="Historical Sensor Readings Report"
            subtitle="Raw time-series telemetry covering pH, turbidity, TDS, and temperature parameters."
            badgeText="Continuous Telemetry"
            badgeVariant="safe"
            data={readingsData}
            totalCount={readingsData.length}
            loading={readingsLoading}
            error={readingsError}
            filters={readingFilters}
            onFilterChange={updateReadingFilter}
            onExport={exportReadingsCsv}
            isExporting={isExportingReadings}
            exportSuccess={exportReadingsSuccess}
            exportError={exportReadingsError}
            onRetry={refetchReadings}
          />
        </section>

        {/* Section 2: Alert History Report */}
        <section aria-labelledby="alerts-report-heading">
          <ReportCard
            type="alerts"
            title="Alert & Threshold Breach Report"
            subtitle="Authoritative log of threshold breaches, severity levels, active warnings, and resolution events."
            badgeText="Early Warning Logs"
            badgeVariant="caution"
            data={alertsData}
            totalCount={alertsData.length}
            loading={alertsLoading}
            error={alertsError}
            filters={alertFilters}
            onFilterChange={updateAlertFilter}
            onExport={exportAlertsCsv}
            isExporting={isExportingAlerts}
            exportSuccess={exportAlertsSuccess}
            exportError={exportAlertsError}
            onRetry={refetchAlerts}
          />
        </section>
      </div>
    </Layout>
  );
}
