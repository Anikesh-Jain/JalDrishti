import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from '../common/Icons';

/**
 * JalDrishti Phase 23: ScreeningResult Component
 *
 * Renders the AI screening classification, confidence score, advisory,
 * and academic safety disclaimer.
 */
export default function ScreeningResult({ result, onReset }) {
  if (!result) return null;

  const {
    result: classification,
    confidence,
    advisory,
    isWaterImage,
    timestamp
  } = result;

  const isSafe = classification === 'Safe';
  const isUnsafe = classification === 'Unsafe';
  const isRejected = classification === 'Rejected';

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Header Banner */}
      <div
        className={`p-6 border-b ${
          isSafe
            ? 'bg-emerald-50/60 border-emerald-100'
            : isUnsafe
            ? 'bg-red-50/60 border-red-100'
            : 'bg-amber-50/60 border-amber-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                isSafe
                  ? 'bg-emerald-100 text-emerald-700'
                  : isUnsafe
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isSafe ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-700" />
              ) : isUnsafe ? (
                <AlertTriangleIcon className="w-6 h-6 text-red-700" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-amber-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Screening Outcome
                </span>
                <Badge
                  variant={isSafe ? 'safe' : isUnsafe ? 'danger' : 'warning'}
                  size="sm"
                >
                  {classification}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {isSafe && 'Visually Clear Sample'}
                {isUnsafe && 'Visual Contamination / Turbidity Detected'}
                {isRejected && 'Non-Water Subject / Inspection Rejected'}
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Screening Timestamp</span>
            <span className="text-xs font-semibold text-slate-700">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-5">
        {/* Confidence Metric */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Model Visual Confidence</span>
            <span className="font-bold text-slate-900">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isSafe
                  ? 'bg-emerald-500'
                  : isUnsafe
                  ? 'bg-red-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(Math.max(confidence, 0), 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Normalized probability distribution derived from visual indicators.
          </p>
        </div>

        {/* Advisory Guidance */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Plain-Language Advisory
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed">
            {advisory}
          </p>
        </div>

        {/* Water Sample Verification Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/60 px-3 py-2 rounded-lg">
          <span className="font-semibold text-slate-700">Water Subject Detected:</span>
          <span className={`font-medium ${isWaterImage ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isWaterImage ? 'Yes (Water sample identified)' : 'No (Non-water image)'}
          </span>
        </div>

        {/* Mandatory Academic Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <svg
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="space-y-1">
              <p className="font-bold text-amber-900">
                Important Academic Disclaimer
              </p>
              <p className="text-amber-800 leading-relaxed">
                Visual image screening is an AI-assisted visual assessment for this academic prototype.
                It <strong>cannot detect dissolved chemical contaminants or microbiological pathogens</strong> and
                does not certify potability. For definitive safety confirmation, laboratory or multi-parameter sensor
                testing is required.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={onReset}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium"
          >
            Screen Another Image
          </Button>
        </div>
      </div>
    </div>
  );
}
