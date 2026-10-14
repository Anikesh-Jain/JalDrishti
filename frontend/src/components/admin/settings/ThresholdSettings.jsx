import React from 'react';
import Card from '../../common/Card';
import ThresholdRow from './ThresholdRow';

/**
 * JalDrishti Phase 20: ThresholdSettings Component
 *
 * Section A: Water Quality Threshold Configuration
 * Renders configurable parameter ranges (pH, Turbidity, TDS, Temperature).
 * Strictly emphasizes monitoring and early-warning baseline semantics without
 * misleading potability guarantees.
 */
export default function ThresholdSettings({
  thresholds = [],
  onSaveThreshold,
  savingThreshold = {},
  actionFeedback = null
}) {
  return (
    <div className="space-y-6">
      {/* Safety & Monitoring Context Banner */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs sm:text-sm leading-relaxed flex items-start space-x-3">
        <svg
          className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <strong className="font-semibold block text-sky-950 mb-0.5">
            Configured Monitoring Ranges & Alert Thresholds
          </strong>
          <span>
            These parameters define the operational boundaries for automated anomaly detection
            and early-warning alert dispatches. As an academic prototype system, these values
            represent operational monitoring thresholds and do <strong>not</strong> constitute certified
            potable water certification or medical safety guarantees.
          </span>
        </div>
      </div>

      {/* Threshold Parameter Cards */}
      <div className="space-y-4">
        {thresholds.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500">
              No threshold configurations currently loaded from the database.
            </p>
          </div>
        ) : (
          thresholds.map((threshold) => (
            <ThresholdRow
              key={threshold.parameter}
              threshold={threshold}
              onSave={onSaveThreshold}
              isSaving={Boolean(savingThreshold[threshold.parameter])}
              feedback={
                actionFeedback && actionFeedback.target === threshold.parameter
                  ? actionFeedback
                  : null
              }
            />
          ))
        )}
      </div>

      {/* Operational Integration Context */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start space-x-3">
        <svg
          className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p>
          <strong>Threshold Engine Integration:</strong> Saving modified threshold values immediately
          updates the active in-memory threshold engine and persists the limits to MongoDB.
          Subsequent IoT sensor readings will evaluate against these updated bounds in real time.
        </p>
      </div>
    </div>
  );
}
